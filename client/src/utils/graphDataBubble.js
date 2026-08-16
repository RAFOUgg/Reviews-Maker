/**
 * graphDataBubble.js
 *
 * Construit le CONTENU d'une bulle épinglée (carte AnnotationNode) à partir des données
 * réellement attachées à un élément d'un des deux canevas : Chaîne de production (nœud produit /
 * liaison de transformation) et PhenoHunt (individu / lien de filiation).
 *
 * Jusqu'ici, épingler une donnée demandait de sélectionner l'élément, de trouver la bonne ligne
 * dans le panneau latéral, puis de la GLISSER sur le fond du canevas (cf. `handleCellDragStart`
 * / `processCellDrop` dans ProductionChainCanvas.jsx) — un geste par cellule, impossible au
 * toucher, et rien du tout côté PhenoHunt (aucune donnée du nœud n'était épinglable). Ce module
 * fournit le contenu d'UNE bulle qui rassemble tout ce que porte l'élément, pour que le menu
 * contextuel puisse l'attacher en un clic.
 *
 * Aucun nom de champ n'est deviné ici — c'est le défaut qui s'est reproduit six fois dans Export
 * Maker (cf. CLAUDE.md). Les libellés viennent des mêmes sources que la SAISIE :
 *   - `summarizeCellFields` (chainCellPipelines.js) pour les cellules de pipeline — déjà la
 *     résolution libellé + unité utilisée par le canevas Chaîne, la modale d'étape et les
 *     templates d'export ;
 *   - `PHENO_NODE_SECTIONS` (config/phenoNodeFields.js) pour les champs de breeding — c'est la
 *     config qui GÉNÈRE le formulaire NodeFormModal, pas une transcription de ses champs.
 *
 * Format d'une ligne de `body` (cf. AnnotationNode.jsx) :
 *   { label, value }        → une donnée
 *   { label, group: true }  → un intertitre (nom de la cellule/section d'origine)
 */

import { summarizeCellFields } from './chainCellPipelines'
import { TYPE_META } from './reviewTypeMeta'
import { PHENO_NODE_SECTIONS } from '../config/phenoNodeFields'

// Le serveur refuse un `body` sérialisé au-delà de 20 000 caractères côté chaîne
// (validateProductionChain.js) et 5 000 côté PhenoHunt (validateGenetics.js). Un nœud avec 16
// cellules attachées dépasse facilement le second — on borne donc ici, plutôt que de laisser
// partir une requête qui reviendrait en 400 sans que rien n'apparaisse sur le canevas.
const MAX_VALUE_LENGTH = 140
export const BUBBLE_MAX_LINES = { chain: 140, genetics: 40 }

// Mêmes valeurs/libellés que le select "Sexe" de NodeFormModal.jsx (clé historique `sex`,
// documentée comme non renommable dans phenoNodeFields.js).
const SEX_LABELS = { unknown: 'Inconnu / non sexé', female: '♀ Femelle', male: '♂ Mâle' }

// Champs de base du nœud PhenoHunt, saisis hors sections repliables (NodeFormModal.jsx) — clés
// historiques lues aussi par CultivarNode.jsx.
const GENETICS_BASE_FIELDS = [
    { id: 'type', label: 'Type' },
    { id: 'breeder', label: 'Breeder' },
    { id: 'ratio', label: 'Ratio Indica/Sativa', unit: '%' }
]

function truncate(value) {
    const text = String(value)
    return text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH - 1)}…` : text
}

function isEmpty(value) {
    return value === null || value === undefined || value === '' ||
        (Array.isArray(value) && value.length === 0)
}

/** Coupe le corps au budget serveur en le disant, plutôt que de tronquer en silence. */
function capBody(lines, maxLines) {
    if (lines.length <= maxLines) return lines
    const kept = lines.slice(0, maxLines - 1)
    kept.push({ label: '…', value: `+${lines.length - kept.length} ligne(s) non affichée(s)` })
    return kept
}

/**
 * Lignes d'un résumé de pipeline de fiche technique (chainPipelineSummary.js).
 *
 * Vivait en local dans ProductionChainCanvas.jsx pour le glisser-déposer du panneau latéral ;
 * déplacée ici pour que le glisser ET l'épinglage en un clic produisent exactement la même
 * bulle — deux fabrications parallèles du même contenu, c'est précisément comme ça que les
 * divergences de vocabulaire se sont installées ailleurs dans ce dépôt.
 */
export function pipelineSummaryBodyLines(pipelineSummary) {
    if (!pipelineSummary) return []
    const lines = []
    if (pipelineSummary.technique) lines.push({ label: 'Méthode', value: pipelineSummary.technique })
    if (pipelineSummary.materialType) lines.push({ label: 'Matière première', value: pipelineSummary.materialType })
    if (pipelineSummary.materialState) lines.push({ label: 'État de la matière', value: pipelineSummary.materialState })
    if (pipelineSummary.mesh) lines.push({ label: 'Maillage', value: pipelineSummary.mesh })
    if (pipelineSummary.dosage || pipelineSummary.dosageUnit) {
        lines.push({ label: 'Dosage', value: `${pipelineSummary.dosage ?? '?'} ${pipelineSummary.dosageUnit || ''}`.trim() })
    }
    if (pipelineSummary.stepCount > 0) lines.push({ label: 'Étapes enregistrées', value: String(pipelineSummary.stepCount) })
    if (pipelineSummary.detail) lines.push({ label: 'Détail', value: pipelineSummary.detail })
    return lines
}

/** Une cellule de pipeline attachée → un intertitre + ses champs résolus. */
function cellLines(cell) {
    const fields = summarizeCellFields(cell.pipelineType, cell.data)
    if (fields.length === 0) return []
    const heading = [cell.pipelineLabel, cell.cellLabel].filter(Boolean).join(' — ') || 'Cellule'
    return [
        { label: heading, group: true },
        ...fields.map(f => ({ label: f.label, value: truncate(f.value) }))
    ]
}

function attachedCellsLines(cellData) {
    const cells = Array.isArray(cellData) ? cellData : []
    return cells.flatMap(cellLines)
}

function mediaLine(media) {
    const items = Array.isArray(media) ? media : []
    if (items.length === 0) return []
    const videos = items.filter(m => m.type === 'video').length
    const photos = items.length - videos
    const parts = []
    if (photos > 0) parts.push(`${photos} photo${photos > 1 ? 's' : ''}`)
    if (videos > 0) parts.push(`${videos} vidéo${videos > 1 ? 's' : ''}`)
    return [{ label: 'Médias attachés', value: parts.join(' · ') }]
}

/**
 * Bulle d'un nœud produit de la Chaîne de production.
 * `pipelineSummary` (store.reviewSummaryCache) est facultatif : la bulle reste utile sans lui.
 */
export function buildChainNodeBubble(node, { pipelineSummary = null } = {}) {
    const body = []

    if (node.reviewType && TYPE_META[node.reviewType]) {
        body.push({ label: 'Type de produit', value: TYPE_META[node.reviewType].label })
    }
    body.push(...pipelineSummaryBodyLines(pipelineSummary))
    body.push(...attachedCellsLines(node.cellData))
    body.push(...mediaLine(node.media))

    const cellCount = Array.isArray(node.cellData) ? node.cellData.length : 0

    return {
        title: node.label || 'Produit',
        sourceLabel: cellCount > 0
            ? `${cellCount} cellule${cellCount > 1 ? 's' : ''} attachée${cellCount > 1 ? 's' : ''}`
            : 'Données de la fiche',
        body: capBody(body, BUBBLE_MAX_LINES.chain)
    }
}

/** Bulle d'une liaison de transformation (mêmes attachements qu'un nœud : cellules + médias). */
export function buildChainEdgeBubble(edge, { sourceLabel = null, targetLabel = null, pipelineSummary = null } = {}) {
    const body = []

    if (edge.technique) body.push({ label: 'Technique', value: truncate(edge.technique) })
    if (edge.date) body.push({ label: 'Date', value: new Date(edge.date).toLocaleDateString('fr-FR') })
    if (edge.notes) body.push({ label: 'Notes', value: truncate(edge.notes) })
    body.push(...pipelineSummaryBodyLines(pipelineSummary))
    body.push(...attachedCellsLines(edge.cellData))
    body.push(...mediaLine(edge.media))

    const route = sourceLabel && targetLabel ? `${sourceLabel} → ${targetLabel}` : null

    return {
        title: edge.technique || 'Transformation',
        sourceLabel: route,
        body: capBody(body, BUBBLE_MAX_LINES.chain)
    }
}

/** `GenNode.genetics` est persisté en JSON string — parsé ici comme dans UnifiedGeneticsCanvas. */
function parseGenetics(node) {
    let genetics = node?.genetics
    if (typeof genetics === 'string') {
        try { genetics = JSON.parse(genetics) } catch { genetics = {} }
    }
    return genetics || {}
}

function formatPhenoValue(field, value) {
    if (isEmpty(value)) return null

    if (field.type === 'number-unit') {
        if (typeof value === 'object') {
            if (isEmpty(value.value)) return null
            return `${value.value} ${value.unit || field.defaultUnit || ''}`.trim()
        }
        return String(value)
    }
    if (field.type === 'checkbox') return value ? 'Oui' : 'Non'
    if (field.type === 'select') {
        const option = (field.options || []).find(o => o.value === value)
        return option ? option.label : String(value)
    }
    return truncate(value)
}

/** Bulle d'un individu PhenoHunt : sexe/type/breeder/ratio + sections de breeding renseignées. */
export function buildGeneticsNodeBubble(node) {
    const genetics = parseGenetics(node)
    const body = []

    if (genetics.sex) body.push({ label: 'Sexe', value: SEX_LABELS[genetics.sex] || genetics.sex })
    for (const field of GENETICS_BASE_FIELDS) {
        const value = genetics[field.id]
        if (isEmpty(value)) continue
        body.push({ label: field.label, value: truncate(field.unit ? `${value} ${field.unit}` : value) })
    }

    for (const section of PHENO_NODE_SECTIONS) {
        const lines = []
        for (const field of section.fields) {
            const value = formatPhenoValue(field, genetics[field.id])
            if (value === null) continue
            lines.push({ label: field.label, value })
        }
        if (lines.length === 0) continue
        body.push({ label: `${section.icon || ''} ${section.label}`.trim(), group: true })
        body.push(...lines)
    }

    if (node.notes) body.push({ label: 'Notes', value: truncate(node.notes) })
    body.push(...mediaLine(node.media))

    return {
        title: node.cultivarName || 'Individu',
        sourceLabel: node.sourceReviewId ? 'Fiche technique liée' : 'Données du phénotype',
        body: capBody(body, BUBBLE_MAX_LINES.genetics)
    }
}

/** Bulle d'un lien de filiation PhenoHunt — `relationshipLabel` vient de l'appelant, qui porte
 *  déjà la table RELATIONSHIP_TYPE_LABELS (mêmes valeurs que le select d'EdgeFormModal). */
export function buildGeneticsEdgeBubble(edge, { parentName = null, childName = null, relationshipLabel = null } = {}) {
    const body = []

    if (relationshipLabel) body.push({ label: 'Relation', value: relationshipLabel })
    if (parentName) body.push({ label: 'Parent', value: truncate(parentName) })
    if (childName) body.push({ label: 'Enfant', value: truncate(childName) })
    if (edge.pollinationMethod) body.push({ label: 'Méthode de pollinisation', value: truncate(edge.pollinationMethod) })
    if (edge.notes) body.push({ label: 'Notes', value: truncate(edge.notes) })
    body.push(...mediaLine(edge.media))

    return {
        title: parentName && childName ? `${parentName} → ${childName}` : (relationshipLabel || 'Liaison'),
        sourceLabel: 'Lien de filiation',
        body: capBody(body, BUBBLE_MAX_LINES.genetics)
    }
}

/**
 * Texte affichable d'une bulle — l'inverse exact de `parsePastedBubble` ci-dessous.
 *
 * Un intertitre (`group: true`) n'a PAS de valeur : le concaténer comme une ligne de données
 * produisait « Culture — J4 : undefined » dans le presse-papiers, qui repartait tel quel dans
 * toute bulle recréée à partir de cette copie.
 */
export function bubbleToText({ title, body } = {}) {
    const lines = Array.isArray(body) ? body : []
    return [
        title,
        ...lines.map(l => (l.group ? l.label : `${l.label} : ${l.value}`))
    ].filter(l => l !== null && l !== undefined && l !== '').join('\n')
}

/**
 * Contenu de bulle reconstruit à partir d'un texte COLLÉ — soit une bulle copiée ailleurs sur le
 * canevas (« Copier les données »), soit n'importe quel texte venu du dehors (bulletin d'analyse,
 * tableur, message).
 *
 * Conventions, choisies pour que l'aller-retour copier → coller redonne exactement la même bulle :
 *   - la 1re ligne devient le TITRE si elle ne porte pas de séparateur ;
 *   - « Libellé : valeur » (ou `=`, ou une tabulation — copie depuis un tableur) → une donnée ;
 *   - une ligne seule, sans séparateur → un intertitre, comme `group: true` l'affiche déjà.
 * Rien n'est deviné du CONTENU : aucun nom de champ n'est réinterprété, les libellés collés sont
 * gardés tels quels.
 */
export function parsePastedBubble(text, { defaultTitle = 'Données collées' } = {}) {
    const rows = String(text || '')
        .replace(/\r\n?/g, '\n')
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean)
    if (rows.length === 0) return null

    // Libellé borné à 60 caractères : sans ça, une phrase entière contenant « : » se transformerait
    // en libellé illisible occupant toute la largeur de la carte.
    const splitLine = (line) => {
        const tab = line.indexOf('\t')
        if (tab > 0) return { label: line.slice(0, tab).trim(), value: line.slice(tab + 1).trim() }
        const match = /^(.{1,60}?)\s*[:=]\s+(.+)$/.exec(line)
        return match ? { label: match[1].trim(), value: match[2].trim() } : null
    }

    const firstSplit = splitLine(rows[0])
    const title = firstSplit ? defaultTitle : truncate(rows[0])
    const dataRows = firstSplit ? rows : rows.slice(1)

    const body = dataRows.map(line => {
        const split = splitLine(line)
        return split
            ? { label: truncate(split.label), value: truncate(split.value) }
            : { label: truncate(line), group: true }
    })

    return { title, body: capBody(body, BUBBLE_MAX_LINES.chain) }
}

/**
 * Emplacement d'une bulle épinglée sur un élément : à sa droite, décalée si plusieurs bulles
 * sont créées d'un coup (sélection multiple) pour ne pas les empiler exactement.
 */
export function bubblePositionNear(position, index = 0) {
    return {
        x: (position?.x || 0) + 210,
        y: (position?.y || 0) + index * 24
    }
}
