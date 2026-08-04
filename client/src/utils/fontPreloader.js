/**
 * Font Preloader - Garantit que toutes les polices sont chargées avant l'export
 */

// Familles RÉELLEMENT chargées par l'app (`client/index.html`) — seules celles-ci peuvent être
// préchargées, `document.fonts.load()` sur une famille sans `@font-face` déclarée ne fait rien.
//
// Corrigé le 2026-08-04 : cette liste contenait 8 familles dont 7 (Poppins, Montserrat, Roboto,
// Open Sans, Lato, Playfair Display, Merriweather) n'ont JAMAIS eu de `@font-face` dans cette app —
// du travail à vide. Et surtout elle omettait `JetBrains Mono` et `Space Grotesk`, les deux
// familles que les templates codent en dur : le module dont le rôle est de garantir les polices
// avant export ne garantissait donc pas la police mono utilisée par TOUS les chiffres des fiches.
const COMMON_FONTS = [
    'Inter',
    'JetBrains Mono',
    'Space Grotesk'
];

/**
 * Précharge toutes les polices nécessaires
 * @returns {Promise<void>}
 */
export async function preloadFonts() {
    console.log('🔤 Preloading fonts...');

    try {
        // Attendre que toutes les polices du document soient chargées
        await document.fonts.ready;

        // Vérifier et charger les polices communes
        const loadPromises = COMMON_FONTS.map(async (font) => {
            try {
                // Essayer de charger différentes variantes
                await Promise.all([
                    document.fonts.load(`16px "${font}"`),
                    document.fonts.load(`bold 16px "${font}"`),
                    document.fonts.load(`600 16px "${font}"`)
                ]);
            } catch (err) {
                console.warn(`⚠️ Font "${font}" not available:`, err);
            }
        });

        await Promise.all(loadPromises);

        console.log('✅ All fonts preloaded');
    } catch (error) {
        console.error('❌ Font preloading failed:', error);
    }
}

/**
 * Précharge les polices spécifiques d'une configuration
 * @param {string} fontFamily - Famille de police à charger
 * @returns {Promise<void>}
 */
export async function preloadSpecificFont(fontFamily) {
    if (!fontFamily) return;

    try {
        await Promise.all([
            document.fonts.load(`16px "${fontFamily}"`),
            document.fonts.load(`bold 16px "${fontFamily}"`),
            document.fonts.load(`600 16px "${fontFamily}"`)
        ]);
        console.log(`✅ Font "${fontFamily}" loaded`);
    } catch (error) {
        console.warn(`⚠️ Could not load font "${fontFamily}":`, error);
    }
}

/**
 * Vérifie si une police est disponible
 * @param {string} fontFamily - Famille de police à vérifier
 * @returns {boolean}
 */
export function isFontAvailable(fontFamily) {
    if (!fontFamily) return false;

    try {
        return document.fonts.check(`16px "${fontFamily}"`);
    } catch {
        return false;
    }
}

export default {
    preloadFonts,
    preloadSpecificFont,
    isFontAvailable
};
