/**
 * Export Maker Helpers - Utilitaires centralisés pour le système Export Maker
 * Ces fonctions sont partagées entre tous les templates et renderers
 */
import { getFieldLabel } from './fieldRegistry';
import { isTemplatePaginable } from '../store/exportMakerConstants';

/**
 * Parse une valeur JSON de manière sécurisée
 * @param {*} value - Valeur à parser (string JSON, object, ou autre)
 * @param {*} fallback - Valeur par défaut si le parsing échoue
 * @returns {*} Valeur parsée ou fallback
 */
export function safeParse(value, fallback = null) {
    if (value === undefined || value === null) return fallback;
    if (typeof value === 'string') {
        try {
            return JSON.parse(value);
        } catch {
            return value;
        }
    }
    return value;
}

/**
 * Convertit une valeur en tableau
 * @param {*} value - Valeur à convertir
 * @returns {Array} Tableau résultant
 */
export function asArray(value) {
    const parsed = safeParse(value, []);
    if (Array.isArray(parsed)) return parsed;
    if (parsed === null || parsed === undefined) return [];
    if (typeof parsed === 'string') return parsed.split(',').map(s => s.trim()).filter(Boolean);
    if (typeof parsed === 'object') return Object.values(parsed);
    return [parsed];
}

/**
 * Convertit une valeur en objet
 * @param {*} value - Valeur à convertir
 * @returns {Object} Objet résultant
 */
export function asObject(value) {
    const parsed = safeParse(value, {});
    if (typeof parsed === 'object' && !Array.isArray(parsed) && parsed !== null) return parsed;
    return {};
}

/**
 * Extrait un label lisible depuis un objet ou une chaîne
 * @param {*} item - Élément à traiter
 * @param {string[]} keys - Clés à chercher dans l'ordre de priorité
 * @returns {string} Label extrait
 */
export function extractLabel(item, keys = ['name', 'label', 'cultivar', 'method', 'commercialName']) {
    if (typeof item === 'string') return item;
    if (typeof item !== 'object' || item === null) return String(item);

    for (const key of keys) {
        if (item[key] !== undefined && item[key] !== null) {
            return String(item[key]);
        }
    }

    // Fallback: première valeur string trouvée
    for (const val of Object.values(item)) {
        if (typeof val === 'string') return val;
    }

    return JSON.stringify(item);
}

/**
 * Formate une note sur 10 avec étoiles
 * @param {number} rating - Note sur 10
 * @param {number} maxStars - Nombre d'étoiles maximum
 * @returns {Object} { filled, empty, value }
 */
export function formatRating(rating, maxStars = 5) {
    const value = parseFloat(rating) || 0;
    const normalized = value / 10 * maxStars; // Convertit /10 en /maxStars
    const filled = Math.round(normalized);
    const empty = maxStars - filled;
    return { filled, empty, value, normalized };
}

/**
 * Formate une date en français
 * @param {string|Date} date - Date à formater
 * @param {Object} options - Options Intl.DateTimeFormat
 * @returns {string} Date formatée
 */
export function formatDate(date, options = { year: 'numeric', month: 'long', day: 'numeric' }) {
    if (!date) return '';
    try {
        return new Date(date).toLocaleDateString('fr-FR', options);
    } catch {
        return String(date);
    }
}

/**
 * Retourne une couleur avec opacité en rgba()
 * @param {string} color - Couleur hex (#rrggbb) ou rgba/rgb
 * @param {number} opacity - Opacité (0-100)
 * @returns {string} Couleur rgba()
 */
export function colorWithOpacity(color, opacity) {
    const alpha = Math.max(0, Math.min(100, opacity || 0)) / 100;

    if (!color) return `rgba(128, 128, 128, ${alpha})`;

    // Déjà en rgba/rgb
    if (color.startsWith('rgba') || color.startsWith('rgb')) return color;

    // Couleur hex #rrggbb ou #rgb
    const hex = color.replace('#', '');
    if (hex.length === 3) {
        const r = parseInt(hex[0] + hex[0], 16);
        const g = parseInt(hex[1] + hex[1], 16);
        const b = parseInt(hex[2] + hex[2], 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (hex.length === 6) {
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    return `rgba(128, 128, 128, ${alpha})`;
}

// Bandes sémantiques de score (2026-07-30, Fiche Technique Détaillée v2 — specs-direction-
// artistique.md) : contrairement à `colors.accent` (décoratif, dérivé de la palette active), ces
// 3 couleurs sont FIXES et indépendantes de la palette — un signal de lecture stable (comme un
// badge "vérifié" toujours vert) plutôt qu'une teinte de marque. Réutilisable par les autres
// templates lors d'un futur rollout de cette direction artistique.
// 2026-08-04 — RÉALIGNÉ sur la direction artistique réelle de l'app (LiquidUI). Les 3 teintes
// précédentes (vert plante / ambre résine / terracotta) venaient du territoire "certificat de
// laboratoire" de la Fiche Technique v2, qui n'existait nulle part ailleurs dans le produit.
// Ces valeurs sont désormais celles du système sémantique déjà utilisé par l'UI du site
// (`LiquidBadge`, `LiquidAlert`) : emerald / amber / red aux nuances 500 (surface) et 400 (texte).
//
// SURFACE (barres, points, aplats, dégradés) — seuil WCAG 3:1.
export const SEMANTIC_SCORE_COLORS = {
    hi: '#10B981',  // emerald-500 — conforme / bon score
    mid: '#F59E0B', // amber-500 — score moyen
    lo: '#EF4444',  // red-500 — score bas / attention
};

/** Bande sémantique d'un score /10 selon la règle du spec : ≥7.5 hi, ≥5 mid, sinon lo. */
export function getScoreBand(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) return 'mid';
    if (n >= 7.5) return 'hi';
    if (n >= 5) return 'mid';
    return 'lo';
}

// Variantes TEXTE des bandes sémantiques (audit de contraste B3 §7 / B4 > R5).
//
// Ce n'est pas une invention de ce chantier : c'est la règle que l'UI du site applique déjà.
// `LiquidBadge` (LiquidUI.jsx) écrit `bg-emerald-500/20 text-emerald-400` — surface en nuance 500,
// TEXTE en nuance 400. Les templates d'export, eux, utilisaient la même couleur pour les deux, ce
// qui plaçait les valeurs chiffrées (12-16px) sous le seuil AA de 4.5:1 sur les 5 templates
// (ScoreMetric.jsx est partagé). Ces variantes rétablissent la règle du design system.
//
// Mode papier : nuances 600/700, seules à tenir 4.5:1 sur un fond clair.
export const SEMANTIC_SCORE_TEXT_COLORS = {
    // sur fond sombre de l'app (#07070f → #0F172A) : 10.44 / 12.02 / 7.26
    onDark: { hi: '#34D399', mid: '#FBBF24', lo: '#F87171' },
    // sur papier slate-50 (#F8FAFC) : 5.24 / 4.80 / 4.62
    // `lo` passé de red-600 (#DC2626) à red-700 le 2026-08-06. Ses deux voisins étaient DÉJÀ en
    // nuance 700 (emerald-700, amber-700) — le rouge était le seul resté en 600, et le seul à
    // tomber sous le seuil AA (mesuré à 4,41:1 sur « Non disponible », seuil 4,5). Le commentaire
    // du mode papier annonçait pourtant « accents en nuances 600/700, seules à tenir AA sur fond
    // clair » : c'était une incohérence, pas un choix.
    onPaper: { hi: '#047857', mid: '#B45309', lo: '#B91C1C' },
};

// Accent violet de l'app — MÊME distinction surface/texte. `#8B5CF6` (violet-500, l'accent
// signature de LiquidUI, `--liquid-primary`) ne fait que 4.42:1 sur le fond de l'app et 4.22:1
// sur `dark.bg` : c'est une couleur de SURFACE (bordures, glows, aplats), pas de texte. Pour un
// libellé accentué, utiliser la nuance 400 comme le fait déjà `LiquidBadge`.
// Plancher de lisibilité — SOURCE UNIQUE (2026-08-04, audit C5 règle E2).
//
// `getResponsiveAdjustments` applique déjà un plancher sur `fontSize.text`/`fontSize.small`, mais
// les composants recalculaient ensuite leur propre taille en aval (`Math.max(9, small - 2)`,
// `fontSize: 9.5`, `fontSize: 10`…), chacun avec son plancher improvisé. L'audit outillé a relevé
// 204 violations sur 36 combinaisons — des libellés à 9,5 / 10,2 / 11 px sur les 5 templates.
//
// Une fiche technique reste un document à LIRE : sous 12px, un libellé de mesure n'est plus
// consultable, et l'export rastérisé n'a pas de zoom pour compenser.
export const MIN_FONT_PX = 12;

/**
 * Attribut par lequel un bloc à chargement ASYNCHRONE déclare s'il a fini de se résoudre.
 *
 * Pourquoi il existe : la mesure de pagination attendait un DÉLAI FIXE, ce qui est une course par
 * construction. `ReadOnlyProductionChainCanvas`/`ReadOnlyGenealogyCanvas` enchaînent jusqu'à deux
 * requêtes séquentielles avant de pouvoir se rendre ; tant qu'elles n'ont pas abouti le composant
 * rend `null`, et `computeAdaptivePages` écarte silencieusement tout module de hauteur ~0. Le délai
 * a déjà été porté de 700ms à 1500ms (2026-08-03) sans régler la course : mesuré le 2026-08-10 sur
 * une même review, `productionChainCanvas` valait 317px en 4:3 mais 16-32px en A4, 16:9 et Article
 * de Blog — la chaîne de production, cœur de la traçabilité, disparaissait de la majorité des
 * exports SANS qu'aucune règle ne le signale (une disparition ne déborde pas).
 *
 * Un délai plus long n'aurait fait que déplacer le seuil. On attend donc un ÉTAT, pas une durée.
 */
export const CANVAS_READY_ATTR = 'data-canvas-ready';

/** Marqueur invisible posé tant qu'un bloc asynchrone n'a pas fini de se résoudre. */
export const PENDING_CANVAS_PROPS = { [CANVAS_READY_ATTR]: 'false', style: { height: 0 } };

/** Taille de police jamais inférieure au plancher de lisibilité. À utiliser partout où une taille
 *  est dérivée d'une autre (`small - 2`, etc.) plutôt que de réinventer un `Math.max` local. */
export function readableFontSize(px) {
    const n = Number(px);
    return Number.isFinite(n) ? Math.max(MIN_FONT_PX, n) : MIN_FONT_PX;
}

// ── Garantie de contraste (2026-08-05) ───────────────────────────────────────────────────────
//
// L'accent de palette est choisi par l'utilisateur ; on ne peut ni l'ignorer ni le remplacer par
// une teinte imposée. Mais posé en TEXTE sur un fond clair (mode papier A4), il descend à 2.48:1 —
// illisible sur un document destiné à l'impression, mesuré sur 16 éléments.
//
// `ensureReadable` conserve la TEINTE choisie et ne corrige que la luminosité, du strict nécessaire
// pour atteindre le seuil. L'utilisateur garde sa couleur, le lecteur garde un texte lisible.

function srgbToLinear(v) {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function parseHex(color) {
    if (typeof color !== 'string') return null;
    const hex = color.trim().replace('#', '');
    if (hex.length === 3) {
        return { r: parseInt(hex[0] + hex[0], 16), g: parseInt(hex[1] + hex[1], 16), b: parseInt(hex[2] + hex[2], 16) };
    }
    if (hex.length === 6) {
        return { r: parseInt(hex.slice(0, 2), 16), g: parseInt(hex.slice(2, 4), 16), b: parseInt(hex.slice(4, 6), 16) };
    }
    return null;
}

const toHex = ({ r, g, b }) => '#' + [r, g, b]
    .map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');

/** Luminance relative WCAG d'une couleur hex. */
export function relativeLuminance(color) {
    const c = parseHex(color);
    if (!c) return null;
    return 0.2126 * srgbToLinear(c.r) + 0.7152 * srgbToLinear(c.g) + 0.0722 * srgbToLinear(c.b);
}

/** Ratio de contraste WCAG entre deux couleurs hex opaques. */
export function contrastRatio(a, b) {
    const l1 = relativeLuminance(a);
    const l2 = relativeLuminance(b);
    if (l1 === null || l2 === null) return null;
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

/**
 * Aplatit `color` posée à `opacityPct` % au-dessus de `background` (deux couleurs hex opaques).
 *
 * Nécessaire pour juger le contraste d'un texte posé sur une SURFACE TEINTÉE : un chip d'arôme
 * repose sur `accent` à 12 % au-dessus du fond de page, pas sur le fond de page. Évaluer le
 * contraste contre le fond de page donnait 4.44:1 là où le seuil est 4.5 — un écart invisible en
 * raisonnement, mesurable en pratique.
 */
export function blendOver(color, background, opacityPct) {
    const fg = parseHex(color);
    const bg = parseHex(background);
    if (!fg || !bg) return background;
    const a = Math.max(0, Math.min(100, opacityPct)) / 100;
    return toHex({
        r: fg.r * a + bg.r * (1 - a),
        g: fg.g * a + bg.g * (1 - a),
        b: fg.b * a + bg.b * (1 - a),
    });
}

/**
 * Renvoie la couleur la plus proche de `color` atteignant `target` de contraste sur `background`.
 * On s'éloigne du fond : vers le noir si le fond est clair, vers le blanc s'il est sombre.
 * Retourne `color` inchangée si elle est déjà conforme, ou si une couleur est illisible.
 */
export function ensureReadable(color, background, target = 4.5) {
    const current = contrastRatio(color, background);
    if (current === null) return color;
    if (current >= target) return color;

    const base = parseHex(color);
    const bgLum = relativeLuminance(background);
    const towardBlack = bgLum > 0.5; // fond clair → assombrir le texte
    for (let i = 1; i <= 100; i++) {
        const t = i / 100;
        const candidate = towardBlack
            ? { r: base.r * (1 - t), g: base.g * (1 - t), b: base.b * (1 - t) }
            : { r: base.r + (255 - base.r) * t, g: base.g + (255 - base.g) * t, b: base.b + (255 - base.b) * t };
        const hex = toHex(candidate);
        if (contrastRatio(hex, background) >= target) return hex;
    }
    return towardBlack ? '#000000' : '#ffffff';
}

// Pile de repli typographique — alignée sur celle du site (tailwind.config.js > fontFamily.sans).
const FONT_FALLBACK = "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif";
const MONO_FALLBACK = "ui-monospace, Menlo, Consolas, monospace";

/**
 * Construit une pile CSS complète à partir du nom de police choisi par l'utilisateur.
 *
 * `config.typography.fontFamily` ne contient qu'un NOM ('Inter'), et les templates le posaient
 * tel quel en `font-family`. Sans famille générique en fin de pile, un échec ou un simple retard
 * de chargement de la police web ne dégrade pas vers une sans-serif système mais vers le SERIF
 * générique du navigateur — constaté sur un export PNG réel le 2026-08-04, où toute la fiche
 * sortait en serif alors que la police demandée était Inter.
 */
export function resolveFontStack(family) {
    const name = (family || '').trim();
    if (!name) return FONT_FALLBACK;
    const quoted = /\s/.test(name) ? `'${name}'` : name;
    if (/mono/i.test(name)) return `${quoted}, ${MONO_FALLBACK}`;
    return `${quoted}, ${FONT_FALLBACK}`;
}

export const ACCENT_TEXT_COLORS = {
    onDark: '#A78BFA',  // violet-400 — 6.88:1 sur #0b1220
    onPaper: '#9333EA', // violet-600 — 5.14:1 sur #F8FAFC
};

/**
 * Couleur conforme AA pour un score affiché EN TEXTE. Utiliser `SEMANTIC_SCORE_COLORS` pour les
 * surfaces (barres, points, aplats), cette fonction dès qu'il s'agit d'un caractère.
 * @param {number|string} value - score /10
 * @param {boolean} paper - true en mode papier A4 (fond crème)
 */
export function getScoreTextColor(value, paper = false) {
    const band = getScoreBand(value);
    return (paper ? SEMANTIC_SCORE_TEXT_COLORS.onPaper : SEMANTIC_SCORE_TEXT_COLORS.onDark)[band];
}

// Recette de verre LiquidUI (`apple-liquid-glass.css` — .liquid-card) traduite pour les templates
// d'export — source unique, partagée par `TemplateSection.jsx` et les blocs "carte" des autres
// templates (image principale, pipelines...), pour ne jamais dupliquer la logique de teinte.
// LiquidUI est pensé "glassmorphism sombre" (pas de variante fond clair côté app) — mais la palette
// "Minimaliste" (seule palette à fond clair, cf. `exportMakerConstants.js`) doit rester lisible :
// le verre y est donc teinté sombre au lieu de blanc, même recette en calques, teinte adaptée au fond.
export function getGlassTokens(colors) {
    const isLight = !colors.background?.includes('gradient');
    const tint = isLight ? (colors.title || '#0F172A') : '#ffffff';
    return {
        isLight,
        background: colorWithOpacity(tint, isLight ? 5 : 6),
        border: colorWithOpacity(tint, isLight ? 10 : 12),
        borderHighlight: colorWithOpacity(isLight ? tint : '#ffffff', isLight ? 18 : 25),
        shadow: isLight ? 'rgba(15,23,42,0.12)' : 'rgba(0,0,0,0.4)',
    };
}

/**
 * Détermine si une couleur est claire ou foncée
 * @param {string} hexColor - Couleur hex
 * @returns {boolean} true si la couleur est claire
 */
export function isLightColor(hexColor) {
    if (!hexColor) return true;
    const hex = hexColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5;
}

/**
 * Extrait les données de categoryRatings
 * Gère plusieurs formats possibles:
 * 1. Valeurs directes: { visual: 7.5, smell: 8 }
 * 2. Sous-objets: { visual: { densite: 6.5, trichome: 5.5 }, smell: { aromasIntensity: 8 } }
 * 3. Données imbriquées dans extraData
 * 4. Champs plats dans extraData: { densite: "6.5", trichome: "5.5", ... }
 * @param {*} categoryRatings - Données des notes par catégorie
 * @param {Object} reviewData - Données complètes de la review (optionnel)
 * @returns {Array} Liste des notes formatées
 */
export function extractCategoryRatings(categoryRatings, reviewData = null) {
    try {
        let ratings = asObject(categoryRatings);
        const result = [];

        // Définition des champs par catégorie pour reconstruction
        const categoryFields = {
            visual: {
                // Only canonical French/normalized keys — English form field aliases
                // (colorRating, density, trichomes, pistils, mold, seeds, transparency)
                // are all mapped to the French keys by normalizeByType, so using both
                // would produce duplicate entries in the sub-details breakdown.
                fields: [
                    'densiteVisuelle', 'trichome', 'pistil', 'manucure', 'moisissure', 'graines',
                    'couleur', 'pureteVisuelle', 'viscosite', 'melting', 'residus', 'couleurTransparence'
                ],
                labels: {
                    densiteVisuelle: 'Densité visuelle', trichome: 'Trichomes', pistil: 'Pistils',
                    manucure: 'Manucure', moisissure: 'Moisissures', graines: 'Graines',
                    couleur: 'Couleur / Nuancier', pureteVisuelle: 'Pureté visuelle',
                    viscosite: 'Viscosité', melting: 'Melting', residus: 'Résidus',
                    couleurTransparence: 'Couleur/transparence'
                }
            },
            smell: {
                fields: [
                    'aromasIntensity', 'complexiteAromas', 'fideliteCultivars',
                    'intensiteAromatique'
                ],
                labels: {
                    aromasIntensity: 'Intensité aromatique', fideliteCultivars: 'Fidélité cultivar',
                    complexiteAromas: 'Complexité', intensiteAromatique: 'Intensité aromatique'
                }
            },
            texture: {
                fields: [
                    // Actual form field names
                    'hardness', 'elasticity', 'stickiness', 'melting', 'residue',
                    'malleability', 'friability', 'viscosity',
                    // Legacy
                    'durete', 'densiteTactile', 'elasticite', 'collant', 'friabilite',
                    'friabiliteViscosite', 'viscositeTexture', 'granularite', 'homogeneite',
                    'meltingResidus', 'aspectCollantGras'
                ],
                labels: {
                    // Actual form field labels
                    hardness: 'Dureté', elasticity: 'Élasticité', stickiness: 'Collant',
                    melting: 'Melting', residue: 'Résidus', malleability: 'Malléabilité',
                    friability: 'Friabilité', viscosity: 'Viscosité',
                    // Legacy
                    durete: 'Dureté', densiteTactile: 'Densité tactile', elasticite: 'Élasticité',
                    collant: 'Collant', friabilite: 'Friabilité', friabiliteViscosite: 'Friabilité/Viscosité',
                    viscositeTexture: 'Viscosité', granularite: 'Granularité', homogeneite: 'Homogénéité',
                    meltingResidus: 'Melting/Résidus', aspectCollantGras: 'Aspect collant/gras'
                }
            },
            taste: {
                fields: [
                    // Actual form field names (mapped in normalizeByType: gouts.intensity→intensiteFumee, aggressiveness→agressivite)
                    'intensiteFumee', 'agressivite',
                    // Legacy
                    'intensiteFumeeDab', 'agressivitePiquant', 'cendre', 'cendreFumee',
                    'douceur', 'persistanceGout', 'tastesIntensity', 'goutIntensity',
                    'intensiteGout', 'intensiteGustative', 'textureBouche'
                ],
                labels: {
                    intensiteFumee: 'Intensité', agressivite: 'Agressivité / Piquant',
                    intensiteFumeeDab: 'Intensité fumée/dab',
                    agressivitePiquant: 'Agressivité/piquant',
                    cendre: 'Cendre', cendreFumee: 'Cendre fumée',
                    douceur: 'Douceur', persistanceGout: 'Persistance',
                    tastesIntensity: 'Intensité goût', goutIntensity: 'Intensité',
                    intensiteGout: 'Intensité goût', intensiteGustative: 'Intensité gustative',
                    textureBouche: 'Texture bouche'
                }
            },
            effects: {
                fields: ['montee', 'intensiteEffet', 'dureeEffet', 'effectsIntensity', 'intensiteEffets'],
                labels: {
                    montee: 'Montée', intensiteEffet: 'Intensité', dureeEffet: 'Durée',
                    effectsIntensity: 'Intensité effets', intensiteEffets: 'Intensité effets'
                }
            }
        };

        // Reconstruire depuis reviewData si ratings est vide ou incomplet
        if (reviewData) {
            // Parser extraData une seule fois
            let extra = {};
            try {
                if (typeof reviewData.extraData === 'string') {
                    extra = JSON.parse(reviewData.extraData);
                } else if (typeof reviewData.extraData === 'object' && reviewData.extraData !== null) {
                    extra = reviewData.extraData;
                }
            } catch (e) {
                console.warn('extractCategoryRatings: Failed to parse extraData', e);
            }

            // Fusionner extra avec reviewData pour chercher les champs
            // reviewData a priorité car il contient les valeurs directes de formData
            const dataSource = { ...extra, ...reviewData };



            // TOUJOURS reconstruire chaque catégorie depuis les champs plats
            // car même si ratings[catKey] existe comme nombre, on veut les sous-détails
            for (const [catKey, catDef] of Object.entries(categoryFields)) {
                // Reconstruire depuis les champs plats
                const reconstructed = {};
                for (const field of catDef.fields) {
                    const value = dataSource[field];
                    if (value !== undefined && value !== null && value !== '') {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue) && numValue > 0) {
                            reconstructed[field] = numValue;
                        }
                    }
                }

                // Si on a reconstruit des sous-champs, les utiliser
                if (Object.keys(reconstructed).length > 0) {
                    ratings[catKey] = reconstructed;
                }
                // Sinon garder la valeur existante (nombre ou objet)
            }
        }

        const categories = [
            { key: 'visual', label: 'Visuel', icon: '👁️' },
            { key: 'smell', label: 'Odeur', icon: '👃' },
            { key: 'texture', label: 'Texture', icon: '✋' },
            { key: 'taste', label: 'Goût', icon: '👅' },
            { key: 'effects', label: 'Effets', icon: '⚡' },
        ];

        for (const cat of categories) {
            const catValue = ratings[cat.key];

            if (catValue === undefined || catValue === null) continue;

            let value;
            let subDetails = null;

            // Si c'est un nombre directement
            if (typeof catValue === 'number') {
                value = catValue;
            }
            // Si c'est une chaîne numérique
            else if (typeof catValue === 'string' && !isNaN(parseFloat(catValue))) {
                value = parseFloat(catValue);
            }
            // Si c'est un objet avec des sous-champs (calcul de la moyenne)
            else if (typeof catValue === 'object' && catValue !== null) {
                const subLabels = categoryFields[cat.key]?.labels || {};
                const subEntries = Object.entries(catValue)
                    .filter(([k, v]) => typeof v === 'number' || (typeof v === 'string' && !isNaN(parseFloat(v))))
                    .map(([k, v]) => ({
                        key: k,
                        // Labels locaux (noms formData/legacy) puis fallback registre (noms DB
                        // couleurScore/intensiteAromeScore/dureteScore…), enfin la clé brute.
                        label: subLabels[k] || getFieldLabel(k) || k,
                        value: parseFloat(v)
                    }))
                    .filter(e => e.value > 0);

                if (subEntries.length > 0) {
                    value = subEntries.reduce((sum, e) => sum + e.value, 0) / subEntries.length;
                    subDetails = subEntries;
                } else {
                    continue;
                }
            }
            else {
                continue;
            }

            result.push({
                ...cat,
                value: Math.round(value * 10) / 10,
                subDetails,
                count: subDetails ? subDetails.length : 0
            });
        }

        return result;
    } catch (error) {
        return [];
    }
}

/**
 * Extrait les données extraData avec labels français - Liste COMPLÈTE
 * @param {*} extraData - Données extra
 * @param {Object} reviewData - Données complètes de la review (optionnel)
 * @returns {Array} Liste des données formatées
 */
export function extractExtraData(extraData, reviewData = null) {
    // Parser extraData si c'est une chaîne
    let extra = {};
    try {
        if (typeof extraData === 'string') {
            extra = JSON.parse(extraData);
        } else if (typeof extraData === 'object' && extraData !== null) {
            extra = extraData;
        }
    } catch (e) {
        console.warn('extractExtraData: Failed to parse extraData', e);
    }

    // Fusionner avec les champs de reviewData directement
    const merged = { ...extra };
    if (reviewData) {
        // Copier les champs directs de reviewData qui ne sont pas dans extra
        const directFields = [
            // Visuel — both form field names (densite/trichomes/pistils) AND normalized names
            'densiteVisuelle', 'densite', 'trichome', 'trichomes', 'pistil', 'manucure', 'moisissure', 'graines',
            'couleur', 'pureteVisuelle', 'viscosite', 'melting', 'residus', 'pistils', 'couleurTransparence',
            // Texture
            'durete', 'elasticite', 'collant', 'friabilite', 'granularite', 'densiteTactile', 'homogeneite',
            'friabiliteViscosite', 'viscositeTexture', 'meltingResidus', 'aspectCollantGras',
            // Fumée/Goût
            'intensiteFumee', 'intensiteFumeeDab', 'agressivite', 'agressivitePiquant',
            'cendre', 'cendreFumee', 'douceur', 'persistanceGout', 'retroGout', 'textureBouche',
            'intensiteGout', 'intensiteGustative', 'goutIntensity',
            // Effets
            'montee', 'intensiteEffet', 'intensiteEffets', 'dureeEffet',
            // Sensoriel
            'aromasIntensity', 'tastesIntensity', 'effectsIntensity', 'fideliteCultivars', 'complexiteAromas',
            'intensiteAromatique',
            // Process
            'purgevide', 'sechage', 'curing',
            // Culture
            'typeCulture', 'spectre', 'techniquesPropagation',
            // Cannabinoïdes secondaires
            'cbgPercent', 'cbcPercent', 'cbnPercent', 'thcvPercent',
            // Culture (Fleur) — cultureTimelineData/Config gérés séparément par extractPipelines
            'cultureDuration', 'cultureMode',
            // Récolte (Fleur)
            'trichomesTranslucides', 'trichomesLaiteux', 'trichomesAmbres', 'modeRecolte', 'poidsBrut', 'poidsNet',
            // Curing (tous types)
            'curingDuration', 'curingType', 'curingTemperature', 'curingHumidity',
            // Séparation (Hash)
            'rendementEstime', 'qualiteMatierePremiere', 'tempsTotalSeparation',
            // Extraction (Concentré)
            'methodeExtraction'
        ];
        directFields.forEach(f => {
            if (merged[f] === undefined && reviewData[f] !== undefined && reviewData[f] !== null && reviewData[f] !== '') {
                merged[f] = reviewData[f];
            }
        });

        // Also check nested 'visual' sub-object (VisualSection stores scores here in-session,
        // before flattenFlowerFormData runs on save: formData.visual = { density, trichomes, mold, seeds })
        if (reviewData.visual && typeof reviewData.visual === 'object') {
            const vd = reviewData.visual;
            if (merged.densiteVisuelle === undefined && vd.density !== undefined) merged.densiteVisuelle = vd.density;
            if (merged.densite === undefined && vd.density !== undefined) merged.densite = vd.density;
            if (merged.trichomes === undefined && vd.trichomes !== undefined) merged.trichomes = vd.trichomes;
            if (merged.trichome === undefined && vd.trichomes !== undefined) merged.trichome = vd.trichomes;
            if (merged.moisissure === undefined && vd.mold !== undefined) merged.moisissure = vd.mold;
            if (merged.graines === undefined && vd.seeds !== undefined) merged.graines = vd.seeds;
            if (merged.couleur === undefined && vd.colorRating !== undefined) merged.couleur = vd.colorRating;
            if (merged.transparenceScore === undefined && vd.transparency !== undefined) merged.transparenceScore = vd.transparency;
        }
    }  // end if (reviewData)

    const fieldDefs = [
        // Culture
        { key: 'typeCulture', label: 'Type de culture', icon: '🌿', category: 'culture' },
        { key: 'spectre', label: 'Spectre lumineux', icon: '🌈', category: 'culture' },
        { key: 'techniquesPropagation', label: 'Propagation', icon: '🌱', category: 'culture' },
        // Visuel — use canonical normalized keys only; English form aliases (density, trichomes,
        // pistils, mold, seeds, colorRating) are all mapped to these French keys by normalizeByType.
        // Keeping both would show duplicate rows for the same metric.
        { key: 'densiteVisuelle', label: 'Densité visuelle', icon: '📊', category: 'visual' },
        { key: 'couleurTransparence', label: 'Couleur/transparence', icon: '🎨', category: 'visual' },
        { key: 'trichome', label: 'Trichomes', icon: '✨', category: 'visual' },
        { key: 'pistil', label: 'Pistils', icon: '🌺', category: 'visual' },
        { key: 'manucure', label: 'Manucure', icon: '✂️', category: 'visual' },
        { key: 'couleur', label: 'Couleur', icon: '🎨', category: 'visual' },
        { key: 'pureteVisuelle', label: 'Pureté visuelle', icon: '🔍', category: 'visual' },
        { key: 'viscosite', label: 'Viscosité', icon: '🫠', category: 'visual' },
        { key: 'melting', label: 'Melting', icon: '🔥', category: 'visual' },
        { key: 'residus', label: 'Résidus', icon: '⚫', category: 'visual' },
        // Qualité
        { key: 'moisissure', label: 'Moisissure', icon: '🔬', category: 'quality' },
        { key: 'graines', label: 'Graines', icon: '🫘', category: 'quality' },
        // Texture
        { key: 'durete', label: 'Dureté', icon: '💎', category: 'texture' },
        { key: 'densiteTactile', label: 'Densité tactile', icon: '🧱', category: 'texture' },
        { key: 'elasticite', label: 'Élasticité', icon: '🔄', category: 'texture' },
        { key: 'collant', label: 'Collant', icon: '🍯', category: 'texture' },
        { key: 'friabilite', label: 'Friabilité', icon: '🥧', category: 'texture' },
        { key: 'friabiliteViscosite', label: 'Friabilité/Viscosité', icon: '🫠', category: 'texture' },
        { key: 'viscositeTexture', label: 'Viscosité', icon: '💧', category: 'texture' },
        { key: 'meltingResidus', label: 'Melting/Résidus', icon: '🔥', category: 'texture' },
        { key: 'aspectCollantGras', label: 'Aspect collant/gras', icon: '🍯', category: 'texture' },
        { key: 'granularite', label: 'Granularité', icon: '🔘', category: 'texture' },
        { key: 'homogeneite', label: 'Homogénéité', icon: '⚖️', category: 'texture' },
        { key: 'textureBouche', label: 'Texture bouche', icon: '👄', category: 'texture' },
        // Fumée/Combustion
        { key: 'intensiteFumee', label: 'Intensité fumée', icon: '💨', category: 'smoke' },
        { key: 'intensiteFumeeDab', label: 'Intensité fumée/dab', icon: '🔥', category: 'smoke' },
        { key: 'agressivite', label: 'Agressivité', icon: '🌶️', category: 'smoke' },
        { key: 'agressivitePiquant', label: 'Agressivité/piquant', icon: '🌶️', category: 'smoke' },
        { key: 'cendre', label: 'Cendre', icon: '⚪', category: 'smoke' },
        { key: 'cendreFumee', label: 'Cendre fumée', icon: '⚫', category: 'smoke' },
        { key: 'douceur', label: 'Douceur', icon: '🍬', category: 'smoke' },
        // Effets
        { key: 'montee', label: 'Montée', icon: '📈', category: 'effects' },
        { key: 'intensiteEffet', label: 'Intensité effets', icon: '⚡', category: 'effects' },
        { key: 'dureeEffet', label: 'Durée effets', icon: '⏱️', category: 'effects' },
        // Sensoriel
        { key: 'aromasIntensity', label: 'Intensité arômes', icon: '🌸', category: 'sensory' },
        { key: 'intensiteAromatique', label: 'Intensité aromatique', icon: '🌺', category: 'sensory' },
        { key: 'tastesIntensity', label: 'Intensité goûts', icon: '👅', category: 'sensory' },
        { key: 'intensiteGustative', label: 'Intensité gustative', icon: '👄', category: 'sensory' },
        { key: 'intensiteGout', label: 'Intensité goût', icon: '👅', category: 'sensory' },
        { key: 'goutIntensity', label: 'Intensité', icon: '💪', category: 'sensory' },
        { key: 'effectsIntensity', label: 'Intensité effets', icon: '⚡', category: 'sensory' },
        { key: 'intensiteEffets', label: 'Intensité des effets', icon: '⚡', category: 'sensory' },
        { key: 'fideliteCultivars', label: 'Fidélité cultivar', icon: '🎯', category: 'sensory' },
        { key: 'complexiteAromas', label: 'Complexité arômes', icon: '🧩', category: 'sensory' },
        { key: 'persistanceGout', label: 'Persistance goût', icon: '⏳', category: 'sensory' },
        { key: 'retroGout', label: 'Rétro-goût', icon: '🔙', category: 'sensory' },
        { key: 'notesDominantesOdeur', label: 'Notes dominantes', icon: '🎵', category: 'sensory' },
        { key: 'notesSecondairesOdeur', label: 'Notes secondaires', icon: '🎶', category: 'sensory' },
        // Process
        { key: 'purgevide', label: 'Purge vide', icon: '🫧', category: 'process' },
        { key: 'sechage', label: 'Séchage', icon: '☀️', category: 'process' },
        { key: 'curing', label: 'Curing', icon: '🫙', category: 'process' },
        // Cannabinoïdes secondaires
        { key: 'cbgPercent', label: 'CBG', icon: '🔬', category: 'analytics' },
        { key: 'cbcPercent', label: 'CBC', icon: '🔬', category: 'analytics' },
        { key: 'cbnPercent', label: 'CBN', icon: '🔬', category: 'analytics' },
        { key: 'thcvPercent', label: 'THCV', icon: '🔬', category: 'analytics' },
        // Culture (Fleur)
        { key: 'cultureDuration', label: 'Durée de culture (jours)', icon: '📅', category: 'culture' },
        { key: 'cultureMode', label: 'Mode de culture', icon: '🏠', category: 'culture' },
        // Récolte (Fleur)
        { key: 'trichomesTranslucides', label: 'Trichomes translucides (%)', icon: '💎', category: 'harvest' },
        { key: 'trichomesLaiteux', label: 'Trichomes laiteux (%)', icon: '🌫️', category: 'harvest' },
        { key: 'trichomesAmbres', label: 'Trichomes ambrés (%)', icon: '🟠', category: 'harvest' },
        { key: 'modeRecolte', label: 'Mode de récolte', icon: '✂️', category: 'harvest' },
        { key: 'poidsBrut', label: 'Poids brut (g)', icon: '⚖️', category: 'harvest' },
        { key: 'poidsNet', label: 'Poids net (g)', icon: '⚖️', category: 'harvest' },
        // Curing (tous types)
        { key: 'curingDuration', label: 'Durée curing', icon: '🫙', category: 'curing' },
        { key: 'curingType', label: 'Type de curing', icon: '❄️', category: 'curing' },
        { key: 'curingTemperature', label: 'Température curing (°C)', icon: '🌡️', category: 'curing' },
        { key: 'curingHumidity', label: 'Humidité curing (%)', icon: '💧', category: 'curing' },
        // Séparation (Hash)
        { key: 'rendementEstime', label: 'Rendement estimé (%)', icon: '📈', category: 'separation' },
        { key: 'qualiteMatierePremiere', label: 'Qualité matière première', icon: '🌿', category: 'separation' },
        { key: 'tempsTotalSeparation', label: 'Temps total séparation (min)', icon: '⏱️', category: 'separation' },
        // Extraction (Concentré)
        { key: 'methodeExtraction', label: "Méthode d'extraction", icon: '⚗️', category: 'extraction' },
    ];

    const results = fieldDefs
        .filter(({ key }) => {
            const v = merged[key];
            if (v === undefined || v === null || v === '') return false;
            // Skip complex objects and arrays — they can't be rendered as InfoCard values
            if (typeof v === 'object') return false;
            return true;
        })
        .map(({ key, label, icon, category }) => {
            let displayValue = merged[key];
            // Si c'est un nombre, formater
            if (typeof displayValue === 'number') {
                displayValue = displayValue % 1 === 0 ? displayValue : displayValue.toFixed(1);
            } else if (typeof displayValue === 'string') {
                // Essayer de parser comme nombre
                const numVal = parseFloat(displayValue);
                if (!isNaN(numVal)) {
                    displayValue = numVal % 1 === 0 ? numVal : numVal.toFixed(1);
                }
            }
            return { key, label, icon, category, value: displayValue };
        });

    console.log('📦 extractExtraData - Found:', results.length, 'fields from merged data');

    return results;
}

/**
 * Construit un court résumé lisible des métadonnées d'une xxxTimelineConfig
 * (interval, durée, mode...) — jusqu'ici jamais lues, seul le xxxTimelineData
 * (les étapes) était affiché.
 * @param {*} rawConfig - JSON string ou objet {interval, duration, mode, ...}
 * @returns {string|null}
 */
function buildTimelineConfigMeta(rawConfig) {
    const config = safeParse(rawConfig, null);
    if (!config || typeof config !== 'object') return null;
    const parts = [];
    if (config.interval) parts.push(`Intervalle: ${config.interval}`);
    if (config.duration != null) parts.push(`Durée: ${config.duration}`);
    if (config.mode) parts.push(`Mode: ${config.mode}`);
    if (config.extractionMethod) parts.push(`Méthode: ${config.extractionMethod}`);
    if (config.separationType) parts.push(`Type: ${config.separationType}`);
    if (config.batchSize) parts.push(`Lot: ${config.batchSize}`);
    return parts.length > 0 ? parts.join(' · ') : null;
}

// Vraies clés de données de timeline pipeline (JSON array), une par type de procédé — PAS les
// champs `pipelineGlobal`/`pipelineSeparation`/`pipelineExtraction`/`fertilizationPipeline` lus
// par `extractPipelines` ci-dessous, qui sont des champs morts sur `Review` (piège déjà connu,
// cf. CLAUDE.md) : `extractPipelines` ne les lit correctement qu'APRÈS traduction par
// `exportDataAdapter.js`, jamais sur le `reviewData` brut (pré-adaptateur) qu'a `TemplateSelector`.
const TIMELINE_DATA_KEYS = ['cultureTimelineData', 'curingTimelineData', 'extractionTimelineData', 'separationTimelineData'];

function hasAnyTimelineData(reviewData) {
    return TIMELINE_DATA_KEYS.some((k) => {
        const v = reviewData[k];
        if (Array.isArray(v)) return v.length > 0;
        if (typeof v === 'string') return safeParse(v, []).length > 0;
        return false;
    });
}

/**
 * Le contenu est-il assez dense pour justifier la pagination automatique ? Utilisé à la fois par
 * le sélecteur de template (session d'édition Export Maker) et par les chemins d'export
 * autonomes (ExportModal standalone, page publique /r/:id) qui n'ont jamais de session de pages
 * active — sans ce partage, ces derniers ne paginaient jamais, quel que soit le volume réel de
 * données (bug corrigé le 2026-07-27 : jusqu'à 65% d'une fiche dense pouvait être coupé
 * silencieusement par le canevas à hauteur fixe).
 * @param {Object} reviewData - reviewData BRUT (pré-adaptateur : `cultureTimelineData` etc. tels
 *   que renvoyés par l'API, pas les champs `pipelineGlobal`/... synthétisés par l'adaptateur).
 * @param {string} [template] - `config.template` courant. `traceabilityReport` est un rapport
 *   continu (Section non filtrées par `contentModules`, contrairement aux 4 autres templates) —
 *   le découper en N pages `PAGE_TEMPLATES` produit N pages avec le MÊME contenu intégral dupliqué
 *   plutôt qu'un contenu réparti (trouvé 2026-08-02 : rapport quasi vide/tronqué en export réel).
 *   Toujours rendu comme un seul document qui grandit (`allowOverflow`, TemplateRenderer.jsx) au
 *   lieu d'être scindé.
 */
export function shouldAutoLockPagination(reviewData, template) {
    if (!reviewData) return false;
    // Un template non paginable ne se pagine JAMAIS, quelle que soit la densité des données
    // (matrice C4). La densité déclenchait auparavant la pagination sur tous les templates, y
    // compris les cartes — d'où les 3 pages à 4 % mesurées sur Story. Ce qui ne tient pas dans
    // une carte doit en être exclu, pas reporté sur une page suivante.
    if (!isTemplatePaginable(template)) return false;
    const categoryCount = reviewData.categoryRatings ? Object.keys(reviewData.categoryRatings).length : 0;
    const aromasCount = Array.isArray(reviewData.aromas) ? reviewData.aromas.length : 0;
    const effectsCount = Array.isArray(reviewData.effects) ? reviewData.effects.length : 0;
    const tastesCount = Array.isArray(reviewData.tastes) ? reviewData.tastes.length : 0;
    return categoryCount >= 4 || aromasCount > 4 || effectsCount > 5 || tastesCount > 4 || hasAnyTimelineData(reviewData);
}

/**
 * Extrait les pipelines depuis les données de review
 * @param {Object} reviewData - Données de la review
 * @returns {Array} Liste des pipelines
 */
export function extractPipelines(reviewData) {
    if (!reviewData) return [];
    const pipelines = [];

    const pipelineTypes = [
        // Culture / Production (Flowers)
        { key: 'pipelineGlobal', name: 'Culture', icon: '🌱' },
        // Curing / Maturation (all types)
        { key: 'pipelineCuring', name: 'Curing & Maturation', icon: '🔥' },
        // Extraction (Concentrates)
        { key: 'pipelineExtraction', name: 'Extraction', icon: '⚗️' },
        // Separation (Hash)
        { key: 'pipelineSeparation', name: 'Séparation', icon: '🔬' },
        // Purification
        { key: 'pipelinePurification', name: 'Purification', icon: '✨' },
        // Fertilization
        { key: 'fertilizationPipeline', name: 'Fertilisation', icon: '🌱' },
    ];

    /**
     * Stringify a single step for compact display
     * @param {*} step - Step object or string
     * @returns {string}
     */
    function stepToString(step) {
        if (typeof step !== 'object' || step === null) return extractLabel(step);
        const label = extractLabel(step);
        const date = step.date || step.semaine || step.phase || step.jour || '';
        const note = step.note || step.comment || '';
        return date ? `${date}: ${label}${note ? ' — ' + note : ''}` : label;
    }

    for (const { key, name, icon } of pipelineTypes) {
        const raw = reviewData[key];
        const data = asArray(raw);
        if (data.length > 0) {
            pipelines.push({
                key,
                name,
                icon,
                // String summaries for backward-compat
                steps: data.map(stepToString),
                // Raw step objects for rich rendering
                rawSteps: data.map(step =>
                    (typeof step === 'object' && step !== null) ? step : { label: String(step) }
                ),
            });
        }
    }

    // Also try nested formats produced by normalizeByType:
    // formData.curing → { curingTimeline: [...] } gets flattened to reviewData.curingTimeline
    const curingTimeline = reviewData.curingTimeline ||
        reviewData.curingTimelineData ||  // key used after API load (flattenFlowerFormData)
        (typeof reviewData.curing === 'object' && reviewData.curing?.curingTimeline);
    if (curingTimeline) {
        const arr = asArray(curingTimeline);
        if (arr.length > 0 && !pipelines.find(p => p.key === 'pipelineCuring')) {
            pipelines.push({
                key: 'curingTimeline',
                name: 'Curing & Maturation',
                icon: '🔥',
                steps: arr.map(step => {
                    if (typeof step === 'object' && step !== null) {
                        const date = step.date || step.semaine || step.phase || step.jour || '';
                        const note = step.note || step.comment || extractLabel(step);
                        return date ? `${date}: ${note}` : note;
                    }
                    return extractLabel(step);
                }),
                rawSteps: arr.map(step =>
                    (typeof step === 'object' && step !== null) ? step : { label: String(step) }
                ),
            });
        }
    }

    // formData.culture → { cultureTimelineData: [...] } → reviewData.cultureTimelineData
    const cultureTimeline = reviewData.cultureTimelineData ||
        (typeof reviewData.culture === 'object' && reviewData.culture?.cultureTimelineData);
    if (cultureTimeline) {
        const arr = asArray(cultureTimeline);
        if (arr.length > 0 && !pipelines.find(p => p.key === 'pipelineGlobal')) {
            pipelines.push({
                key: 'cultureTimeline',
                name: 'Culture',
                icon: '🌱',
                steps: arr.map(step => {
                    if (typeof step === 'object' && step !== null) {
                        const date = step.date || step.semaine || step.phase || step.jour || '';
                        const note = step.note || step.comment || extractLabel(step);
                        return date ? `${date}: ${note}` : note;
                    }
                    return extractLabel(step);
                }),
                rawSteps: arr.map(step =>
                    (typeof step === 'object' && step !== null) ? step : { label: String(step) }
                ),
                configMeta: buildTimelineConfigMeta(reviewData.cultureTimelineConfig),
            });
        }
    }

    // Extraction (Concentré) / Séparation (Hash) — même pattern que culture/curing,
    // jamais couvert par pipelineTypes car les données vivent dans xxxTimelineData
    const timelineDefs = [
        { dataKey: 'extractionTimelineData', configKey: 'extractionTimelineConfig', pipelineKey: 'pipelineExtraction', name: 'Extraction', icon: '⚗️' },
        { dataKey: 'separationTimelineData', configKey: 'separationTimelineConfig', pipelineKey: 'pipelineSeparation', name: 'Séparation', icon: '🔬' },
    ];
    for (const { dataKey, configKey, pipelineKey, name, icon } of timelineDefs) {
        const timeline = reviewData[dataKey];
        if (!timeline) continue;
        const arr = asArray(timeline);
        if (arr.length > 0 && !pipelines.find(p => p.key === pipelineKey)) {
            pipelines.push({
                key: dataKey,
                name,
                icon,
                steps: arr.map(step => {
                    if (typeof step === 'object' && step !== null) {
                        const date = step.date || step.semaine || step.phase || step.jour || step.timestamp || '';
                        const note = step.note || step.comment || extractLabel(step);
                        return date ? `${date}: ${note}` : note;
                    }
                    return extractLabel(step);
                }),
                rawSteps: arr.map(step =>
                    (typeof step === 'object' && step !== null) ? step : { label: String(step) }
                ),
                configMeta: buildTimelineConfigMeta(reviewData[configKey]),
            });
        }
    }

    // Attache aussi les métadonnées de config (interval/mode/durée) aux pipelines curing déjà
    // poussés plus haut (curingTimeline / pipelineCuring), sans les dupliquer.
    const curingConfigMeta = buildTimelineConfigMeta(reviewData.curingTimelineConfig);
    if (curingConfigMeta) {
        const curingPipeline = pipelines.find(p => p.key === 'curingTimeline' || p.key === 'pipelineCuring');
        if (curingPipeline && !curingPipeline.configMeta) curingPipeline.configMeta = curingConfigMeta;
    }

    // Un pipeline dont AUCUNE étape ne porte de donnée n'est pas un pipeline, c'est une trame vide.
    // Chaque test ci-dessus ne vérifie que `arr.length > 0` : une trame créée puis jamais remplie
    // (cas courant — on choisit la durée du curing avant de saisir quoi que ce soit) produisait donc
    // une section entière « Curing & Maturation · 1 étape · 0/1 documentées · Pas de données ».
    // Signalé sur capture le 2026-08-07 dans le rendu écran d'une review Hash.
    //
    // Filtré ICI, à la source, plutôt que dans les rendus : les trois surfaces qui affichent un
    // pipeline (`PipelineTimeline`, `PipelineMiniGrid`, `InteractivePipelineViewer`) en héritent
    // d'un coup, et surtout le budget de pagination cesse de réserver de la place pour du vide.
    return pipelines.filter((p) => p.rawSteps.some(stepHasContent));
}

// Clés de STRUCTURE d'une étape : elles situent l'étape dans la trame, elles ne disent rien de ce
// qui s'y est passé. Une étape qui n'a que celles-là est vide.
const STEP_STRUCTURAL_KEYS = new Set(['timestamp', 'date', 'phase', 'jour', 'semaine', 'index', '_meta']);

function stepHasContent(step) {
    if (!step || typeof step !== 'object') return Boolean(step);
    const hasValue = (v) => v !== null && v !== undefined && v !== ''
        && !(Array.isArray(v) && v.length === 0)
        && !(typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length === 0);
    // `data` est le sac de champs saisis (cf. PipelineMiniGrid.getCellFields) : c'est lui qui
    // porte le contenu réel d'une cellule.
    if (step.data && typeof step.data === 'object' && Object.values(step.data).some(hasValue)) return true;
    return Object.entries(step).some(([k, v]) => k !== 'data' && !STEP_STRUCTURAL_KEYS.has(k) && hasValue(v));
}

/**
 * Filtre le résultat d'`extractPipelines()` pour ne garder que les pipelines actifs selon
 * `config.contentModules` — nécessaire en pagination : `TemplateRenderer`'s `filteredConfig`
 * met à `false` toute clé absente de la liste `modules` de la page active (voir
 * `exportMakerPagesStore.js`), donc sans ce filtre un template qui fait juste `pipelines.map(...)`
 * réaffiche TOUS les pipelines (Culture + Curing + Extraction + ...) sur CHAQUE page au lieu de
 * respecter la répartition en pages dédiées. Bug trouvé le 2026-07-28 : seul
 * `DetailedCardTemplate.jsx` avait ce filtre (en ligne, dupliqué) ; `ModernCompactTemplate.jsx`
 * et `BlogArticleTemplate.jsx` affichaient tout sans filtrage. Hors pagination (`contentModules`
 * = config globale, la plupart des clés à `true`), ce filtre ne retire rien — sans effet de bord
 * sur le rendu simple/non-paginé.
 * @param {Array} pipelines - retour de `extractPipelines(reviewData)`
 * @param {Object} contentModules - `config.contentModules` (déjà filtré par page si paginé)
 * @returns {Array}
 */
export function filterVisiblePipelines(pipelines, contentModules) {
    if (!Array.isArray(pipelines) || !contentModules) return pipelines || [];
    return pipelines.filter((p) => {
        if (contentModules.pipelines === true) return true;
        if (contentModules[p.key] === true) return true;
        if (p.key === 'pipelineCuring' || p.key === 'curingTimeline') return contentModules.curing !== false;
        if (p.key === 'pipelineGlobal' || p.key === 'cultureTimeline') return contentModules.fertilizationPipeline !== false;
        // Repli `extractPipelines` (timelineDefs) : quand l'adaptateur n'a pas déjà synthétisé
        // `pipelineExtraction`/`pipelineSeparation`, le pipeline est poussé avec `key` =
        // `extractionTimelineData`/`separationTimelineData` (le nom de la donnée brute, pas le nom
        // de module) — sans ce mapping explicite, aucune branche ci-dessus ne matche jamais et le
        // pipeline entier disparaît silencieusement (trouvé 2026-07-28 en vérifiant Concentré/Hash).
        if (p.key === 'extractionTimelineData') return contentModules.pipelineExtraction !== false;
        if (p.key === 'separationTimelineData') return contentModules.pipelineSeparation !== false;
        const explicitKeys = ['pipelineExtraction', 'pipelineSeparation', 'pipelinePurification', 'fertilizationPipeline'];
        return explicitKeys.some((k) => k === p.key && contentModules[k]);
    });
}

/**
 * Extrait les données du substrat
 * @param {*} substratMix - Données du substrat
 * @returns {Array} Liste des composants du substrat
 */
export function extractSubstrat(substratMix) {
    const substrat = asArray(substratMix);
    return substrat.map(s => {
        if (typeof s === 'string') return { name: s, percentage: null };
        return {
            name: s.substrat || s.component || s.name || 'Substrat',
            percentage: s.percentage || s.percent || null
        };
    });
}

/**
 * Dimensions par ratio
 */
export const RATIO_DIMENSIONS = {
    '1:1': { width: 800, height: 800, label: 'Carré (1:1)' },
    '16:9': { width: 1920, height: 1080, label: 'Paysage (16:9)' },
    '9:16': { width: 1080, height: 1920, label: 'Portrait (9:16)' },
    '4:3': { width: 1600, height: 1200, label: 'Standard (4:3)' },
    'A4': { width: 1754, height: 2480, label: 'A4 (Document)' },
};

/**
 * Calcule les dimensions du canvas
 * @param {string} ratio - Ratio sélectionné
 * @param {number} scale - Facteur d'échelle (0-1)
 * @returns {Object} { width, height, cssWidth, cssHeight }
 */
export function calculateDimensions(ratio, scale = 0.5) {
    const dims = RATIO_DIMENSIONS[ratio] || RATIO_DIMENSIONS['1:1'];
    return {
        width: dims.width,
        height: dims.height,
        cssWidth: dims.width * scale,
        cssHeight: dims.height * scale,
        label: dims.label
    };
}

/**
 * Types de produits avec leurs champs spécifiques
 */
export const PRODUCT_TYPES = {
    'Fleur': {
        icon: '🌸',
        fields: ['cultivar', 'breeder', 'farm', 'strainType', 'indicaRatio', 'thcLevel', 'cbdLevel', 'terpenes', 'aromas', 'effects']
    },
    'Concentré': {
        icon: '💎',
        fields: ['cultivar', 'hashmaker', 'pipelineExtraction', 'pipelineSeparation', 'pipelinePurification', 'thcLevel', 'terpenes', 'aromas', 'effects']
    },
    'Hash': {
        icon: '🟤',
        fields: ['cultivar', 'hashmaker', 'pipelineExtraction', 'thcLevel', 'aromas', 'effects', 'texture']
    },
    'Edible': {
        icon: '🍬',
        fields: ['thcLevel', 'cbdLevel', 'dureeEffet', 'effects', 'tastes']
    },
    'Vape': {
        icon: '💨',
        fields: ['cultivar', 'thcLevel', 'cbdLevel', 'terpenes', 'aromas', 'effects']
    },
    'Topical': {
        icon: '🧴',
        fields: ['cbdLevel', 'effects', 'ingredients']
    },
};

/**
 * Vérifie si un champ est pertinent pour un type de produit
 * @param {string} type - Type de produit
 * @param {string} field - Nom du champ
 * @returns {boolean}
 */
export function isFieldRelevant(type, field) {
    const productType = PRODUCT_TYPES[type];
    if (!productType) return true; // Par défaut, afficher tout
    return productType.fields.includes(field);
}

/**
 * Calcule les ajustements de style selon le ratio pour adapter le contenu sans scroll
 * @param {string} ratio - Ratio du canvas ('1:1', '16:9', '9:16', '4:3', 'A4')
 * @param {Object} baseTypography - Tailles de base de la typographie
 * @returns {Object} Ajustements pour padding, fontSize, spacing, etc.
 */
// ── Contrat de mise en page par FORMAT (2026-08-05) ───────────────────────────────────────────
//
// Jusqu'ici, la taille de l'image principale était régie par TROIS systèmes indépendants :
// `responsive.image.maxHeight` (Moderne Compact), `maxHeight: '500px'` en dur (Article de Blog),
// `96px` en dur (Rapport de Traçabilité). Corriger l'un ne touchait pas les autres — d'où des
// rendus où l'image écrase la page sur certains templates et reste une vignette sur d'autres.
//
// Une part de hauteur, pas une valeur en pixels : c'est le seul moyen qu'un même template garde
// la même ALLURE d'un format à l'autre. 500px valent 62 % d'un carré de 800 et 20 % d'un A4 de
// 2480 — le même nombre produit deux mises en page sans rapport.
//
// `columns` : les formats larges (16:9, 4:3) ont la place pour deux colonnes. Les y empiler en
// une seule colonne laisse mécaniquement la moitié basse vide, ce qui est le défaut observé sur
// Fiche Technique en 16:9 et 4:3.
export const FORMAT_LAYOUT = {
    // `imageShare` sert de PLAFOND à l'image, désormais élastique (`flex: 1 1 auto`) : elle prend
    // le mou laissé par le contenu, sans jamais dépasser cette part de la hauteur du canevas.
    //
    // Le plafond ne peut pas être uniforme. Mesuré le 2026-08-05 en le retirant purement et
    // simplement : le remplissage montait à 96-99 % sur presque tout, mais le carré dense passait
    // à 105,7 % — un débordement, donc une perte définitive de contenu sur une carte non
    // paginable. Le carré est contraint en hauteur, l'image y entre en concurrence directe avec le
    // texte ; le portrait a du mou à revendre et c'est là que se logeaient les zones vides
    // (72 % mesurés). D'où des parts franchement différentes.
    '1:1':  { imageShare: 0.50, columns: 1, orientation: 'square' },
    '16:9': { imageShare: 0.45, columns: 2, orientation: 'landscape' },
    '9:16': { imageShare: 0.65, columns: 1, orientation: 'portrait' },
    '4:3':  { imageShare: 0.40, columns: 2, orientation: 'landscape' },
    // A4 en DEUX colonnes. Il fait 1754px de large : en une seule colonne, une ligne de texte
    // atteint ~175 caractères (mesuré, règle E5 — la cible typographique est 45-90). C'est aussi ce
    // qui laissait ses dernières pages à moitié vides, une page absorbant deux fois moins de
    // contenu qu'elle ne le pourrait. Deux colonnes corrigent les deux à la fois.
    'A4':   { imageShare: 0.20, columns: 2, orientation: 'document' },
};

/** Contrat de mise en page d'un format. Repli sur le carré pour un ratio inconnu. */
/**
 * Templates qui font RÉELLEMENT couler leur contenu en colonnes (`columnCount`).
 *
 * `FORMAT_LAYOUT.columns` exprime ce qu'un format PERMET ; ceci exprime ce qu'un template en FAIT.
 * Les deux ont divergé et c'est ce qui a coupé du contenu : la pagination multipliait son budget de
 * hauteur par le nombre de colonnes du format, alors que seul `detailedCard` coule vraiment en
 * colonnes. `blogArticle` recevait donc un budget double tout en empilant sur une seule colonne —
 * mesuré le 2026-08-06 en 16:9 : trois pages rendues à 134 %, 121 % et 117 %, soit du contenu
 * définitivement coupé à l'export.
 *
 * D'où cette source unique, à consommer PARTOUT plutôt que `getFormatLayout(ratio).columns` seul.
 */
const MULTICOLUMN_TEMPLATES = new Set(['detailedCard']);

/** Nombre de colonnes réellement utilisé par un template à un ratio donné. */
export function getTemplateColumns(templateId, ratio) {
    if (!MULTICOLUMN_TEMPLATES.has(templateId)) return 1;
    return getFormatLayout(ratio).columns;
}

export function getFormatLayout(ratio) {
    return FORMAT_LAYOUT[ratio] || FORMAT_LAYOUT['1:1'];
}

export function getResponsiveAdjustments(ratio, baseTypography = {}) {
    const dimensions = RATIO_DIMENSIONS[ratio] || RATIO_DIMENSIONS['1:1'];
    const area = dimensions.width * dimensions.height;
    const isSquare = ratio === '1:1';
    const isPortrait = dimensions.height > dimensions.width * 1.2;
    const isLandscape = dimensions.width > dimensions.height * 1.2;
    const isA4 = ratio === 'A4';

    // Facteur de réduction basé sur la surface disponible
    // 1:1 (1080x1080) est le format le plus contraint, donc facteur le plus bas
    // NB (2026-07-29) : `isA4` DOIT être vérifié avant `isPortrait` dans les 3 ternaires de cette
    // fonction (ici, `padding.container`, `grid.cols`) — un canevas A4 (1754×2480) satisfait AUSSI
    // la condition portrait (hauteur > largeur×1.2), donc placé après `isPortrait` il n'atteint
    // JAMAIS sa propre branche : A4 héritait silencieusement de l'échelle du format 9:16 (0.8) au
    // lieu de la sienne (1.0), sous-dimensionné pour un format 2x plus grand pensé pour l'impression.
    // NB : la branche finale `: 0.85` qui existait ici était INATTEIGNABLE — elle n'aurait été
    // atteinte que par un ratio ni carré, ni A4, ni portrait, ni paysage, c'est-à-dire strictement
    // entre 1:1.2 et 1.2:1 sans être 1:1. Aucun des 5 ratios de `RATIO_DIMENSIONS` n'y correspond.
    // Retirée le 2026-08-04 : une valeur de repli jamais atteinte n'est pas un filet de sécurité,
    // c'est une fausse piste pour qui relit cette cascade (elle avait déjà induit en erreur la
    // transcription en table de ce fichier, qui donnait 0.85 au format 4:3 au lieu de 0.9).
    const scaleFactor = isSquare ? 0.7 : isA4 ? 1.0 : isPortrait ? 0.8 : 0.9;

    return {
        // Facteurs d'échelle
        scaleFactor,
        isSquare,
        isPortrait,
        isLandscape,
        isA4,

        // Padding adaptatif
        padding: {
            container: isSquare ? 16 : isA4 ? 48 : isPortrait ? 20 : 24,
            section: isSquare ? 8 : 12,
            card: isSquare ? 8 : 12,
        },

        // Marges et espacements
        spacing: {
            section: isSquare ? 12 : isPortrait ? 16 : 20,
            element: isSquare ? 6 : 8,
            gap: isSquare ? 4 : 6,
        },

        // Tailles de police ajustées — planchers appliqués sur text/small : quel que soit le
        // ratio, une fiche technique reste un document à LIRE. Les multiplicateurs en cascade
        // (ratio × sous-élément, ex. badges de pipeline) faisaient descendre le texte à 6-9px
        // effectifs sur certains ratios — illisible. `title`/`subtitle`/`section` restent scalés
        // librement (déjà nettement plus grands, la hiérarchie visuelle reste utile là).
        fontSize: {
            title: Math.round((baseTypography.titleSize || 32) * scaleFactor),
            subtitle: Math.round((baseTypography.titleSize || 32) * scaleFactor * 0.7),
            section: Math.round((baseTypography.titleSize || 32) * scaleFactor * 0.55),
            text: Math.max(14, Math.round((baseTypography.textSize || 14) * scaleFactor)),
            small: Math.max(12, Math.round((baseTypography.textSize || 14) * scaleFactor * 0.85)),
        },

        // `layout` (columns / imageHeight / contentHeight) supprimé le 2026-08-04 : relevé
        // exhaustif dans `client/src` — ZÉRO consommateur. Ces 3 valeurs étaient calculées à chaque
        // rendu des 5 templates sans que personne ne les lise. Elles avaient en prime failli servir
        // de fondation à `ExportFrame` (la spec C2 faisait piloter le Masthead par
        // `ExportFrame.columns`), c'est-à-dire à un champ mort. Pour un choix d'empilement, utiliser
        // `isSquare`/`isPortrait`, qui sont eux réellement consommés.

        // Tailles d'images
        image: {
            maxWidth: isSquare ? '100%' : '300px',
            // Hauteur d'image pensée en PROPORTION du canevas, pas en pixels absolus (2026-08-05).
            //
            // Le plafond unique de 220px pour tout format portrait donnait 27 % de la hauteur en
            // 1:1 (800px) mais seulement 11 % en 9:16 (1920px) — d'où une carte verticale remplie
            // à 25 % avec une vignette perdue en haut. Une carte n'est pas un carré étiré : la
            // proportion de l'image doit rester constante d'un format à l'autre.
            //
            // `isA4` AVANT `isPortrait` : A4 (1754×2480) satisfait aussi la condition portrait, et
            // placé après il hériterait de la valeur 9:16 — c'est le piège déjà rencontré sur le
            // facteur d'échelle. Un document A4 garde une image modérée : elle y accompagne le
            // texte, elle ne le domine pas.
            // Dérivé de `FORMAT_LAYOUT[ratio].imageShare` : une seule règle pour les 5 templates,
            // au lieu des trois systèmes divergents d'avant (cf. commentaire du contrat ci-dessus).
            maxHeight: `${Math.round(dimensions.height * getFormatLayout(ratio).imageShare)}px`,
            borderRadius: isSquare ? 8 : 12,
        },

        // Limites d'affichage
        limits: {
            // Le 9:16 fait 1920px de haut : il a la place d'en montrer plus, et le lui refuser
            // était la cause de son sous-remplissage (60 % mesuré). `isA4` traité AVANT `isPortrait`
            // — un document garde une densité de lecture, il ne s'allonge pas indéfiniment.
            maxTags: isSquare ? 3 : isA4 ? 4 : isPortrait ? 8 : 6,
            maxCategoryRatings: isSquare ? 4 : (isPortrait && !isA4) ? 9 : 5,
            maxInfoCards: isSquare ? 4 : 6,
            descriptionLines: isSquare ? 2 : isA4 ? 3 : isPortrait ? 8 : 4,
        },

        // Grid
        grid: {
            cols: isSquare ? 2 : isA4 ? 4 : isPortrait ? 2 : 3,
        },
    };
}

export default {
    safeParse,
    asArray,
    asObject,
    extractLabel,
    formatRating,
    formatDate,
    colorWithOpacity,
    isLightColor,
    extractCategoryRatings,
    extractExtraData,
    extractPipelines,
    filterVisiblePipelines,
    extractSubstrat,
    RATIO_DIMENSIONS,
    calculateDimensions,
    PRODUCT_TYPES,
    isFieldRelevant,
    getResponsiveAdjustments,
    shouldAutoLockPagination,
};
