/**
 * Font Preloader - Garantit que toutes les polices sont chargées avant l'export
 */

const COMMON_FONTS = [
    'Inter',
    'Poppins',
    'Montserrat',
    'Roboto',
    'Open Sans',
    'Lato',
    'Playfair Display',
    'Merriweather'
];

/**
 * Précharge toutes les polices nécessaires
 * @returns {Promise<void>}
 */
export async function preloadFonts() {
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
            }
        });

        await Promise.all(loadPromises);
    } catch (error) {
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
    } catch (error) {
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
