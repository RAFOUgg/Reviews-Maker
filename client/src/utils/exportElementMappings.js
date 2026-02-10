import { getModulesByProductType } from './orchard/moduleMappings'

// Mapping element id -> module fields that imply its availability
export const ELEMENT_MODULES_MAP = {
    productName: [],
    photo: ['images', 'mainImage', 'image', 'gallery'],
    photos: ['images', 'gallery', 'mainImage'],
    genetics: ['breeder', 'variety', 'geneticTreeId', 'parentage'],
    breeder: ['breeder'],
    analytics: ['terpeneProfile', 'thcPercent', 'cbdPercent', 'analyticsPdfUrl'],
    visual: ['densiteVisuelle', 'trichomesScore', 'pistilsScore', 'manucureScore', 'couleurNuancier'],
    odor: ['notesOdeursDominantes', 'notesOdeursSecondaires', 'intensiteAromeScore'],
    taste: ['intensiteGoutScore', 'dryPuffNotes', 'inhalationNotes', 'expirationNotes'],
    effects: ['effetsChoisis', 'intensiteEffetScore', 'monteeScore'],
    culture: ['cultureTimelineData', 'cultureTimelineConfig'],
    curing: ['curingTimelineData', 'curingTimelineConfig'],
    recolte: ['trichomesTranslucides', 'trichomesLaiteux', 'trichomesAmbres', 'poidsBrut', 'poidsNet', 'modeRecolte'],
    terpeneProfile: ['terpeneProfile'],
    notes: ['description', 'notes'],
    watermark: ['watermark']
}

export function isElementAvailableForProduct(productType = 'flower', elementId) {
    const modules = new Set(getModulesByProductType(productType))

    // If elementId is directly a module, it's available
    if (modules.has(elementId)) return true

    const mapped = ELEMENT_MODULES_MAP[elementId] || []
    return mapped.some(m => modules.has(m))
}
