import { TASTE_FAMILIES } from '../../../data/tasteNotes'
import { EFFECTS_CATEGORIES } from '../../../data/effectsCategories'
import { WIZARD_WIDGETS } from '../wizardFieldTypes'

const EDIBLE_TYPE_OPTIONS = [
    'Brownie', 'Cookie', 'Gâteau', 'Bonbon/Candy', 'Chocolat', 'Gummies', 'Boisson',
    'Thé/Infusion', 'Huile culinaire', 'Beurre cannabique', 'Sauce', 'Pâte à tartiner',
    'Sirop', 'Capsule', 'Autre',
].map(t => ({ value: t, label: t }))

const TASTE_CHIP_OPTIONS = Object.values(TASTE_FAMILIES).map(f => ({ value: f.id, label: f.label, emoji: f.icon }))
const EFFECT_CHIP_OPTIONS = Object.values(EFFECTS_CATEGORIES)
    .flatMap(cat => (cat.positive || []).map(e => ({ value: e.id, label: e.name, emoji: cat.icon })))

/**
 * Schéma du wizard pour Comestible. `path` doit matcher flattenEdibleFormData()
 * (client/src/utils/formDataFlattener.js). La recette (ingrédients + étapes) n'est pas
 * linéarisable en questions unitaires : étape "handoff" vers RecipePipelineSection.
 */
export function getEdibleWizardQuestions() {
    return [
        {
            id: 'nomProduit', section: 'infos', title: 'Informations générales',
            label: 'Quel est le nom du produit ?',
            widget: WIZARD_WIDGETS.TEXT, path: { kind: 'flat', field: 'nomProduit' },
            required: true, maxLength: 100, placeholder: 'Nom du comestible',
        },
        {
            id: 'typeComestible', section: 'infos', title: 'Informations générales',
            label: 'Quel type de comestible ?',
            widget: WIZARD_WIDGETS.SELECT, path: { kind: 'flat', field: 'typeComestible' },
            options: EDIBLE_TYPE_OPTIONS, sentinel: '',
        },
        {
            id: 'fabricant', section: 'infos', title: 'Informations générales',
            label: 'Qui l\'a fabriqué ?',
            widget: WIZARD_WIDGETS.TEXT, path: { kind: 'flat', field: 'fabricant' },
            allowFillMyself: true, sentinel: '',
        },
        {
            id: 'photos', section: 'infos', title: 'Informations générales',
            label: 'Ajoutez 1 à 4 photos du produit',
            widget: WIZARD_WIDGETS.PHOTO, path: { kind: 'photos' },
        },

        {
            id: 'recipe-handoff', section: 'recipe', title: 'Recette & Préparation',
            label: 'Renseigner la recette (ingrédients, étapes) ?',
            widget: WIZARD_WIDGETS.HANDOFF, handoffTarget: 'recipe', ctaLabel: 'Renseigner la recette',
        },

        {
            id: 'saveursDominantes', section: 'gouts', title: 'Goûts', label: 'Quelles saveurs dominent ?',
            widget: WIZARD_WIDGETS.CHIPS, path: { kind: 'nested', section: 'gouts', field: 'saveursDominantes' },
            options: TASTE_CHIP_OPTIONS, maxSelections: 5, sentinel: [],
        },
        {
            id: 'goutIntensity', section: 'gouts', title: 'Goûts', label: 'Intensité gustative',
            widget: WIZARD_WIDGETS.SLIDER, path: { kind: 'nested', section: 'gouts', field: 'intensity' },
        },

        {
            id: 'dosageUtilise', section: 'effets', title: 'Effets & Expérience', label: 'Dosage consommé (en mg) ?',
            widget: WIZARD_WIDGETS.TEXT, inputType: 'number',
            path: { kind: 'nested', section: 'effets', field: 'dosageUtilise' }, sentinel: '',
        },
        {
            id: 'effetsOnset', section: 'effets', title: 'Effets & Expérience', label: 'Vitesse d\'apparition des effets',
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
    ]
}

export default getEdibleWizardQuestions
