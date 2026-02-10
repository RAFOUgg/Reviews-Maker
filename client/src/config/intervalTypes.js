// Canonical interval types and pipeline allowed mappings
export const INTERVAL_TYPES_CONFIG = {
    seconde: { key: 'seconde', label: '⏱️ Secondes', unit: 's', max: 900, defaultDuration: 60, aliases: ['seconds'] },
    heure: { key: 'heure', label: '🕐 Heures', unit: 'h', max: 336, defaultDuration: 168, aliases: ['hours'] },
    jour: { key: 'jour', label: '🗓️ Jours', unit: 'j', max: 365, defaultDuration: 90, aliases: ['days'] },
    date: { key: 'date', label: '📅 Dates', unit: 'date', requiresStartEnd: true, aliases: ['dates'] },
    semaine: { key: 'semaine', label: '📆 Semaines', unit: 'S', max: 52, defaultDuration: 12, aliases: ['weeks'] },
    mois: { key: 'mois', label: '🗓️ Mois', unit: 'M', max: 120, defaultDuration: 6, aliases: ['months'] },
    annee: { key: 'annee', label: '📆 Années', unit: 'Y', max: 100, defaultDuration: 1, aliases: ['years'] },
    phases: { key: 'phases', label: '🌱 Phases', unit: 'P', max: 12, defaultDuration: 12, isPredefined: true, aliases: ['phase'] }
};

// Allowed interval keys per pipeline type (use keys from INTERVAL_TYPES_CONFIG)
export const ALLOWED_INTERVALS_BY_PIPELINE = {
    culture: ['phase', 'jour', 'semaine', 'mois', 'annee'],
    curing: ['seconde', 'heure', 'jour', 'semaine', 'phase'],
    separation: ['seconde', 'heure', 'jour', 'semaine', 'phase'],
    extraction: ['seconde', 'heure', 'jour', 'semaine', 'phase'],
    purification: ['seconde', 'heure', 'jour', 'semaine'],
    recipe: ['seconde', 'heure', 'minute'] // minute may be unused but kept for completeness
};

// Utility: map alias to canonical key
export function resolveIntervalKey(keyOrAlias) {
    if (!keyOrAlias) return null;
    const normalized = String(keyOrAlias).toLowerCase();
    for (const key in INTERVAL_TYPES_CONFIG) {
        if (key === normalized) return key;
        const conf = INTERVAL_TYPES_CONFIG[key];
        if (conf.aliases && conf.aliases.includes(normalized)) return key;
    }
    return null;
}

// Return options (value + label) for a pipeline type
export function getOptionsForPipeline(pipelineType) {
    const allowed = ALLOWED_INTERVALS_BY_PIPELINE[pipelineType] || Object.keys(INTERVAL_TYPES_CONFIG);
    return allowed.map(k => INTERVAL_TYPES_CONFIG[k]).filter(Boolean);
}
