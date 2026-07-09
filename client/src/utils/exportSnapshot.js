/**
 * Figement d'export (Chantier 6 traçabilité) — calcule un hash stable des données réellement
 * rendues à l'export, pour pouvoir attester plus tard "cet export correspondait à la review telle
 * qu'elle était à cette date" même si la review a changé depuis. Le hash est recalculable à
 * l'identique côté client à tout moment (pas de dépendance serveur) pour détecter une dérive.
 */

// Tri récursif des clés pour que le hash ne dépende jamais de l'ordre de sérialisation.
function stableStringify(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
    const keys = Object.keys(value).sort();
    return `{${keys.map(k => `${JSON.stringify(k)}:${stableStringify(value[k])}`).join(',')}}`;
}

export async function computeContentHash(reviewData) {
    const serialized = stableStringify(reviewData);
    const bytes = new TextEncoder().encode(serialized);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}
