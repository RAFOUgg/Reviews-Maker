import { AROMA_CATEGORIES } from '../../../data/aromasWheel'
import { EFFECTS_CATEGORIES } from '../../../data/effectsCategories'
import { EXPERIENCE_VALUES } from '../../../data/formValues'
import { WIZARD_WIDGETS } from '../wizardFieldTypes'

// Simplification volontaire pour le wizard : les roues CATA (arômes, effets) proposent
// des dizaines d'entrées granulaires, ingérables en un seul écran mobile question-par-
// question. On propose ici une sélection réduite (catégories d'arômes, effets positifs les
// plus courants) ; la sélection granulaire complète reste disponible via "Voir toutes les
// questions" (formulaire classique, AromaWheelPicker / EffectsWheelPicker).
const AROMA_CHIP_OPTIONS = AROMA_CATEGORIES.map(c => ({ value: c.id, label: c.label, emoji: c.emoji }))

const EFFECT_CHIP_OPTIONS = Object.values(EFFECTS_CATEGORIES)
    .flatMap(cat => (cat.positive || []).map(e => ({ value: e.id, label: e.name, emoji: cat.icon })))

/**
 * Schéma déclaratif du wizard "une question à la fois" pour Fleur. Chaque `path` doit
 * matcher exactement ce que lit flattenFlowerFormData() (client/src/utils/formDataFlattener.js) :
 * - Les champs visuels (trichomes, densite, pistils...) sont FLAT (pas sous formData.visual).
 * - Odeurs/Texture/Goûts/Effets/Analytics sont NESTED sous leur clé de section.
 * - Culture, Génétique et Curing ne sont pas linéarisés (pipelines/canvas complexes) : ce
 *   sont des étapes "handoff" qui renvoient vers l'UX tactile dédiée (chantiers C/D).
 */
export function getFlowerWizardQuestions({ isProducteur = false } = {}) {
    const questions = [
        {
            id: 'nomCommercial', section: 'infos', title: 'Informations générales',
            label: 'Quel est le nom commercial du produit ?',
            widget: WIZARD_WIDGETS.TEXT, path: { kind: 'flat', field: 'nomCommercial' },
            required: true, maxLength: 100, placeholder: 'Ex: Marque – Cultivar – Batch #',
        },
        {
            id: 'cultivars', section: 'infos', title: 'Informations générales',
            label: 'Quel(s) cultivar(s) ?',
            widget: WIZARD_WIDGETS.TEXT, path: { kind: 'flat', field: 'cultivars' },
            placeholder: 'Ex: OG Kush, Purple Haze...', sentinel: '',
        },
        {
            id: 'farm', section: 'infos', title: 'Informations générales',
            label: 'Farm / Producteur ?',
            widget: WIZARD_WIDGETS.TEXT, path: { kind: 'flat', field: 'farm' },
            placeholder: 'Nom du producteur', allowFillMyself: true, sentinel: '',
        },
        {
            id: 'photos', section: 'infos', title: 'Informations générales',
            label: 'Ajoutez 1 à 4 photos du produit',
            widget: WIZARD_WIDGETS.PHOTO, path: { kind: 'photos' },
        },

        isProducteur && {
            id: 'genetics-handoff', section: 'genetics', title: 'Génétiques & PhenoHunt',
            label: 'Lier une génétique via PhenoHunt (optionnel)',
            widget: WIZARD_WIDGETS.HANDOFF, handoffTarget: 'genetics', ctaLabel: 'Ouvrir PhenoHunt',
        },
        isProducteur && {
            id: 'culture-handoff', section: 'culture', title: 'Culture & Pipeline',
            label: 'Configurer la pipeline de culture (optionnel)',
            widget: WIZARD_WIDGETS.HANDOFF, handoffTarget: 'culture', ctaLabel: 'Configurer la culture',
        },

        {
            id: 'thcPercent', section: 'analytics', title: 'Analytiques',
            label: 'Taux de THC (%) ?', hint: 'Optionnel — laissez vide si inconnu',
            widget: WIZARD_WIDGETS.TEXT, inputType: 'number',
            path: { kind: 'nested', section: 'analytics', field: 'thcPercent' }, sentinel: '',
        },
        {
            id: 'cbdPercent', section: 'analytics', title: 'Analytiques',
            label: 'Taux de CBD (%) ?',
            widget: WIZARD_WIDGETS.TEXT, inputType: 'number',
            path: { kind: 'nested', section: 'analytics', field: 'cbdPercent' }, sentinel: '',
        },

        { id: 'colorRating', section: 'visual', title: 'Visuel & Technique', label: 'Notez la couleur / le nuancier', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'flat', field: 'colorRating' } },
        { id: 'densite', section: 'visual', title: 'Visuel & Technique', label: 'Notez la densité visuelle', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'flat', field: 'densite' } },
        { id: 'trichomes', section: 'visual', title: 'Visuel & Technique', label: 'Notez la densité de trichomes', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'flat', field: 'trichomes' } },
        { id: 'manucure', section: 'visual', title: 'Visuel & Technique', label: 'Notez la manucure', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'flat', field: 'manucure' } },

        {
            id: 'odeurDominantes', section: 'odeurs', title: 'Odeurs', label: 'Quelles familles olfactives dominent ?',
            widget: WIZARD_WIDGETS.CHIPS, path: { kind: 'nested', section: 'odeurs', field: 'dominantNotes' },
            options: AROMA_CHIP_OPTIONS, maxSelections: 5, sentinel: [],
        },
        {
            id: 'odeurIntensity', section: 'odeurs', title: 'Odeurs', label: "Intensité globale de l'arôme",
            widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'odeurs', field: 'intensity' },
        },

        { id: 'textureHardness', section: 'texture', title: 'Texture', label: 'Dureté au toucher', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'texture', field: 'hardness' } },
        { id: 'textureStickiness', section: 'texture', title: 'Texture', label: 'Collant / poisseux', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'texture', field: 'stickiness' } },

        { id: 'goutIntensity', section: 'gouts', title: 'Goûts', label: 'Intensité gustative', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'gouts', field: 'intensity' } },
        { id: 'goutAggressiveness', section: 'gouts', title: 'Goûts', label: 'Agressivité en gorge', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'gouts', field: 'aggressiveness' } },

        {
            id: 'methodeConsommation', section: 'effets', title: 'Effets & Expérience', label: 'Méthode de consommation utilisée ?',
            widget: WIZARD_WIDGETS.SELECT, path: { kind: 'nested', section: 'effets', field: 'methodeConsommation' },
            options: EXPERIENCE_VALUES.methodeConsommation, sentinel: '',
        },
        {
            id: 'effetsOnset', section: 'effets', title: 'Effets & Expérience', label: 'Vitesse de montée des effets',
            widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'effets', field: 'onset' },
        },
        {
            id: 'effetsIntensity', section: 'effets', title: 'Effets & Expérience', label: 'Intensité des effets ressentis',
            widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'effets', field: 'intensity' },
        },
        {
            id: 'effetsList', section: 'effets', title: 'Effets & Expérience', label: 'Quels effets avez-vous ressentis ?',
            widget: WIZARD_WIDGETS.CHIPS, path: { kind: 'nested', section: 'effets', field: 'effects' },
            options: EFFECT_CHIP_OPTIONS, maxSelections: 8, sentinel: [],
        },

        {
            id: 'curing-handoff', section: 'curing', title: 'Curing & Maturation',
            label: 'Configurer le curing / la maturation (optionnel)',
            widget: WIZARD_WIDGETS.HANDOFF, handoffTarget: 'curing', ctaLabel: 'Configurer le curing',
        },
    ]

    return questions.filter(Boolean)
}

export default getFlowerWizardQuestions
