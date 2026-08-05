/**
 * Décoration des notes (arômes, goûts, odeurs, effets) pour les rendus d'export.
 *
 * POURQUOI. Les rendus affichaient la valeur BRUTE enregistrée par le formulaire —
 * `floral-hibiscus`, `anti-depression` — c'est-à-dire un identifiant technique, en minuscules et
 * ponctué de tirets. Constaté sur capture le 2026-08-05 parmi les « trucs illisibles ». Or l'app
 * connaît déjà, pour chacun de ces identifiants, un libellé humain ET un emoji : ce sont les tables
 * qui alimentent les formulaires de saisie.
 *
 * On réutilise donc ces tables plutôt que d'en écrire une nouvelle. C'est aussi ce qui garantit que
 * le rendu parle le même langage visuel que la saisie — et le repo a un historique de bugs nés
 * précisément d'un vocabulaire réinventé à côté de celui qui existait (7 occurrences documentées
 * dans CLAUDE.md).
 */
import { AROMAS } from '../data/aromasWheel';
import { EFFECTS } from '../data/effects';
import { TASTE_FAMILIES } from '../data/tasteNotes';
import { ODOR_FAMILIES } from '../data/odorNotes';

/** Clé de recherche tolérante : casse, accents, tirets et espaces sont neutralisés. */
function normalize(value) {
    return String(value ?? '')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '');
}

/**
 * Index construit UNE fois. Chaque entrée est indexée par son id, par son libellé, et par le
 * dernier segment de son id (`citrus-lemon` → `lemon`) : les formulaires enregistrent tantôt l'id
 * complet, tantôt le seul nom de la note selon la section d'origine.
 */
const INDEX = (() => {
    const map = new Map();
    const add = (key, entry) => {
        const k = normalize(key);
        if (k && !map.has(k)) map.set(k, entry);
    };
    const register = (id, label, emoji) => {
        if (!emoji) return;
        const entry = { label: label || id, emoji };
        add(id, entry);
        add(label, entry);
        const tail = String(id ?? '').split('-').pop();
        if (tail && tail !== id) add(tail, entry);
    };

    AROMAS.forEach((a) => register(a.id, a.label, a.emoji));
    EFFECTS.forEach((e) => register(e.id, e.label, e.emoji));
    [TASTE_FAMILIES, ODOR_FAMILIES].forEach((families) => {
        Object.values(families || {}).forEach((fam) => {
            (fam.notes || []).forEach((n) => register(n.id, n.name, n.icon));
            register(fam.id, fam.label, fam.icon);
        });
    });
    return map;
})();

/**
 * Rend une note affichable : emoji + libellé humain.
 *
 * Retombe toujours sur quelque chose de présentable — une valeur inconnue est simplement remise en
 * forme (tirets en espaces, initiale capitale) plutôt que laissée en identifiant brut. Un futur
 * arôme ajouté au formulaire sans emoji reste donc lisible, il n'a juste pas d'icône.
 */
export function decorateNote(value) {
    const raw = String(value ?? '').trim();
    if (!raw) return { emoji: '', label: '' };
    const hit = INDEX.get(normalize(raw));
    if (hit) return hit;
    const label = raw.replace(/[-_]+/g, ' ').replace(/\s+/g, ' ').trim();
    return { emoji: '', label: label.charAt(0).toUpperCase() + label.slice(1) };
}

/** Forme prête à l'affichage : « 🍋 Citron ». */
export function noteWithEmoji(value) {
    const { emoji, label } = decorateNote(value);
    return emoji ? `${emoji} ${label}` : label;
}
