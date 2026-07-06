/**
 * Migration des groupes/setups historiquement stockés en localStorage (un jeu de clés par
 * type de pipeline : `pipeline-grouped-presets-{type}`, `pipeline-setups-{type}`) vers le
 * nouveau modèle unifié (UserPreset, cf. server-new/routes/presets.js).
 *
 * Deux usages distincts :
 * - `migrateLocalPresetsToServer` : pour un utilisateur authentifié, envoie tout au serveur
 *   une seule fois (flag `presets-migrated-${userId}`) — le serveur dé-duplique par nom.
 * - `consolidateAnonymousCache` : pour un utilisateur non authentifié, regroupe les anciennes
 *   clés en un seul cache unifié (`presets-cache-v2`) au même format que les lignes serveur,
 *   pour que ses groupes existants n'aient pas l'air d'avoir disparu une fois que
 *   GroupedPresetModal arrête de lire les anciennes clés directement.
 */

const LEGACY_PIPELINE_TYPES = ['culture', 'curing', 'separation', 'extraction'];
export const ANONYMOUS_CACHE_KEY = 'presets-cache-v2';

function safeParseArray(raw) {
    try {
        const parsed = JSON.parse(raw || '[]');
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/** Lit les anciennes clés localStorage (4 types de pipeline × groupes/setups). */
export function readLegacyGroupsAndSetups() {
    const groups = [];
    const setups = [];
    LEGACY_PIPELINE_TYPES.forEach(type => {
        safeParseArray(localStorage.getItem(`pipeline-grouped-presets-${type}`)).forEach(group => {
            groups.push({ ...group, pipelineType: type });
        });
        safeParseArray(localStorage.getItem(`pipeline-setups-${type}`)).forEach(setup => {
            setups.push({ ...setup, pipelineType: type });
        });
    });
    return { groups, setups };
}

/** Envoie les groupes/setups locaux au serveur une seule fois par compte. */
export async function migrateLocalPresetsToServer(userId) {
    if (!userId) return null;
    const flagKey = `presets-migrated-${userId}`;
    if (localStorage.getItem(flagKey)) return null;

    const { groups, setups } = readLegacyGroupsAndSetups();
    if (groups.length === 0 && setups.length === 0) {
        localStorage.setItem(flagKey, '1');
        return null;
    }

    try {
        const res = await fetch('/api/presets/import-local', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groups, setups })
        });
        if (res.ok) {
            localStorage.setItem(flagKey, '1');
            return await res.json();
        }
    } catch {
        // Pas de flag posé : on retentera au prochain chargement authentifié.
    }
    return null;
}

let idCounter = 0;
const localId = () => `local_${Date.now()}_${idCounter++}`;

/** Convertit un groupe/setup au format serveur (UserPreset), pour l'usage anonyme local. */
function toUnifiedShape(item, type) {
    const now = new Date().toISOString();
    const data = type === 'grouped'
        ? { fields: item.fields || [] }
        : { config: item.config || {}, groupAssignments: item.groupAssignments || {}, data: item.data || null };
    return {
        id: localId(),
        type,
        pipelineType: item.pipelineType,
        name: item.name,
        description: item.description || '',
        emoji: item.emoji || null,
        tags: [],
        projectId: null,
        isArchived: false,
        data,
        useCount: item.useCount || 0,
        lastUsedAt: null,
        createdAt: now,
        updatedAt: now
    };
}

/** Regroupe les anciennes clés en un seul cache local unifié, une seule fois. */
export function consolidateAnonymousCache() {
    const existing = localStorage.getItem(ANONYMOUS_CACHE_KEY);
    if (existing) {
        try {
            const parsed = JSON.parse(existing);
            if (Array.isArray(parsed)) return parsed;
        } catch {
            // cache corrompu, on reconsolide depuis les anciennes clés ci-dessous
        }
    }

    const { groups, setups } = readLegacyGroupsAndSetups();
    const unified = [
        ...groups.map(g => toUnifiedShape(g, 'grouped')),
        ...setups.map(s => toUnifiedShape(s, 'setup'))
    ];
    localStorage.setItem(ANONYMOUS_CACHE_KEY, JSON.stringify(unified));
    return unified;
}
