import { CANNABIS_COLORS, DEFAULT_COLOR, PLANT_PARTS } from '../data/cannabisColors';
import { humanizeKey } from './fieldRegistry';

/**
 * Rend lisible un élément de liste du registre, quelle que soit sa forme.
 *
 * POURQUOI. Le rendu retombait sur `JSON.stringify(item)` dès qu'un objet n'avait ni `name`, ni
 * `label`, ni `nom` — et le nuancier de couleur n'a aucun des trois. Résultat, signalé par
 * l'utilisateur sur une review réelle : la fiche affichait
 * `{"colorId":"purple","percentage":47,"parts":[{"partId":"stems","percent":100}]}` dans une
 * pastille, à la place de « Violet 47 % · Tiges ». Du JSON dans un document destiné à un client.
 *
 * RÈGLE : ne jamais rendre de JSON. À défaut de mieux, on compose un résumé à partir des valeurs
 * scalaires de l'objet — moins précis, mais lisible, et surtout jamais du code.
 */

const COLOR_NAME = new Map([DEFAULT_COLOR, ...CANNABIS_COLORS].map((c) => [c.id, c.name]));
const PART_LABEL = new Map(PLANT_PARTS.map((p) => [p.id, p.label]));

/** Le nuancier : `{ colorId | id, percentage, parts: [{ partId, percent }] }`. */
function formatColorEntry(item) {
    const id = item.colorId ?? item.id;
    if (!id) return null;
    const name = COLOR_NAME.get(id) || humanizeKey(String(id));
    const pct = Number(item.percentage);
    const parts = Array.isArray(item.parts)
        ? item.parts.map((p) => PART_LABEL.get(p.partId) || humanizeKey(String(p.partId ?? ''))).filter(Boolean)
        : [];
    const head = Number.isFinite(pct) && pct > 0 ? `${name} ${pct} %` : name;
    return parts.length ? `${head} · ${parts.join(', ')}` : head;
}

/** Résumé générique : les valeurs scalaires de l'objet, dans l'ordre, sans clés techniques. */
function summarizeObject(item) {
    const parts = [];
    for (const [k, v] of Object.entries(item)) {
        if (v === null || v === undefined || v === '') continue;
        if (typeof v === 'object') continue; // on ne déplie pas : ce serait du code déguisé
        if (/^(id|_id|uuid|key)$/i.test(k)) continue;
        parts.push(typeof v === 'boolean' ? (v ? humanizeKey(k) : null) : `${humanizeKey(k)} ${v}`);
    }
    return parts.filter(Boolean).join(' · ');
}

export function formatListItem(item) {
    if (item === null || item === undefined) return '';
    if (typeof item !== 'object') return String(item);
    if (item.name || item.label || item.nom) return String(item.name || item.label || item.nom);
    const color = formatColorEntry(item);
    if (color) return color;
    const generic = summarizeObject(item);
    // Dernier recours : le nombre de propriétés, jamais leur sérialisation.
    return generic || `${Object.keys(item).length} propriété(s)`;
}
