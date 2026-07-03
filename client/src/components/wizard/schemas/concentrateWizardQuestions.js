import { AROMA_CATEGORIES } from '../../../data/aromasWheel'
import { EFFECTS_CATEGORIES } from '../../../data/effectsCategories'
import { EXPERIENCE_VALUES } from '../../../data/formValues'
import { WIZARD_WIDGETS } from '../wizardFieldTypes'

// Cf. flowerWizardQuestions.js pour la justification de cette simplification.
const AROMA_CHIP_OPTIONS = AROMA_CATEGORIES.map(c => ({ value: c.id, label: c.label, emoji: c.emoji }))
const EFFECT_CHIP_OPTIONS = Object.values(EFFECTS_CATEGORIES)
    .flatMap(cat => (cat.positive || []).map(e => ({ value: e.id, label: e.name, emoji: cat.icon })))

/**
 * Schéma du wizard pour Concentré. `path` doit matcher flattenConcentrateFormData()
 * (client/src/utils/formDataFlattener.js) : visuel est NESTED sous `formData.visuel`.
 * Extraction et Curing sont des pipelines complexes : étapes "handoff".
 */
export function getConcentrateWizardQuestions() {
    return [
        {
            id: 'nomCommercial', section: 'infos', title: 'Informations générales',
            label: 'Quel est le nom du produit ?',
            widget: WIZARD_WIDGETS.TEXT, path: { kind: 'flat', field: 'nomCommercial' },
            required: true, maxLength: 100, placeholder: 'Nom du concentré',
        },
        {
            id: 'hashmaker', section: 'infos', title: 'Informations générales',
            label: 'Qui a produit ce concentré ?',
            widget: WIZARD_WIDGETS.TEXT, path: { kind: 'flat', field: 'hashmaker' },
            allowFillMyself: true, sentinel: '',
        },
        {
            id: 'laboratoire', section: 'infos', title: 'Informations générales',
            label: 'Laboratoire de production ?',
            widget: WIZARD_WIDGETS.TEXT, path: { kind: 'flat', field: 'laboratoire' }, sentinel: '',
        },
        {
            id: 'cultivarsUtilises', section: 'infos', title: 'Informations générales',
            label: 'Quel(s) cultivar(s) ont servi de matière première ?',
            widget: WIZARD_WIDGETS.TEXT, path: { kind: 'flat', field: 'cultivarsUtilises' }, sentinel: '',
        },
        {
            id: 'photos', section: 'infos', title: 'Informations générales',
            label: 'Ajoutez 1 à 4 photos du produit',
            widget: WIZARD_WIDGETS.PHOTO, path: { kind: 'photos' },
        },

        {
            id: 'extraction-handoff', section: 'extraction', title: 'Pipeline Extraction',
            label: "Configurer la pipeline d'extraction (optionnel)",
            widget: WIZARD_WIDGETS.HANDOFF, handoffTarget: 'extraction', ctaLabel: "Configurer l'extraction",
        },

        {
            id: 'thcPercent', section: 'analytics', title: 'Analytiques', label: 'Taux de THC (%) ?',
            widget: WIZARD_WIDGETS.TEXT, inputType: 'number',
            path: { kind: 'nested', section: 'analytics', field: 'thcPercent' }, sentinel: '',
        },
        {
            id: 'cbdPercent', section: 'analytics', title: 'Analytiques', label: 'Taux de CBD (%) ?',
            widget: WIZARD_WIDGETS.TEXT, inputType: 'number',
            path: { kind: 'nested', section: 'analytics', field: 'cbdPercent' }, sentinel: '',
        },

        { id: 'couleurTransparence', section: 'visual', title: 'Visuel & Technique', label: 'Notez la couleur / clarté', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'visuel', field: 'couleurTransparence' } },
        { id: 'pureteVisuelle', section: 'visual', title: 'Visuel & Technique', label: 'Notez la pureté visuelle', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'visuel', field: 'pureteVisuelle' } },
        { id: 'melting', section: 'visual', title: 'Visuel & Technique', label: 'Notez la qualité de fusion (melting)', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'visuel', field: 'melting' } },

        {
            id: 'odeurDominantes', section: 'odeurs', title: 'Odeurs', label: 'Quelles familles olfactives dominent ?',
            widget: WIZARD_WIDGETS.CHIPS, path: { kind: 'nested', section: 'odeurs', field: 'dominantNotes' },
            options: AROMA_CHIP_OPTIONS, maxSelections: 5, sentinel: [],
        },
        { id: 'odeurIntensity', section: 'odeurs', title: 'Odeurs', label: "Intensité globale de l'arôme", widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'odeurs', field: 'intensity' } },

        { id: 'textureViscosity', section: 'texture', title: 'Texture', label: 'Viscosité', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'texture', field: 'viscosity' } },
        { id: 'textureStickiness', section: 'texture', title: 'Texture', label: 'Collant / poisseux', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'texture', field: 'stickiness' } },

        { id: 'goutIntensity', section: 'gouts', title: 'Goûts', label: 'Intensité gustative', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'gouts', field: 'intensity' } },
        { id: 'goutAggressiveness', section: 'gouts', title: 'Goûts', label: 'Agressivité en gorge', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'gouts', field: 'aggressiveness' } },

        {
            id: 'methodeConsommation', section: 'effets', title: 'Effets & Expérience', label: 'Méthode de consommation utilisée ?',
            widget: WIZARD_WIDGETS.SELECT, path: { kind: 'nested', section: 'effets', field: 'methodeConsommation' },
            options: EXPERIENCE_VALUES.methodeConsommation, sentinel: '',
        },
        { id: 'effetsOnset', section: 'effets', title: 'Effets & Expérience', label: 'Vitesse de montée des effets', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'effets', field: 'onset' } },
        { id: 'effetsIntensity', section: 'effets', title: 'Effets & Expérience', label: 'Intensité des effets ressentis', widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'effets', field: 'intensity' } },
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
}

export default getConcentrateWizardQuestions
