/**
 * Journal d'événements de la Chaîne de production — réutilise le modèle AuditLog existant
 * (jusqu'ici écrit uniquement pour des actions de compte : changement de type, vérification
 * producteur, âge/consentement légal — cf. server-new/services/account.js, services/legal.js)
 * plutôt que de créer une nouvelle table. AuditLog a déjà tout ce qu'il faut : userId (acteur),
 * action, entityType/entityId, metadata (JSON libre), createdAt.
 *
 * `metadata` porte aussi les champs qui n'existent pas en colonnes dédiées (severity, startedAt,
 * endedAt, actorLabel pour un acteur sans compte, equipmentPresetId) — cf.
 * DOCUMENTATION/DATA_REFERENCE/11_TRACABILITE_ET_EXTENSIBILITE.md principe "toujours une
 * échappatoire libre" : on n'impose aucune structure figée, `metadata` reste un objet libre.
 */

export async function logChainEvent(prisma, { userId, action, entityType, entityId, metadata = {} }) {
    try {
        await prisma.auditLog.create({
            data: {
                userId,
                action,
                entityType,
                entityId,
                metadata: JSON.stringify(metadata)
            }
        })
    } catch (error) {
        // Le journal est un accessoire de traçabilité, jamais un chemin bloquant — une écriture
        // ratée ici ne doit jamais faire échouer l'action produit elle-même (création du nœud/
        // liaison/cellule), cohérent avec le principe "jamais de contrainte serveur bloquante".
        console.error('logChainEvent failed:', error)
    }
}
