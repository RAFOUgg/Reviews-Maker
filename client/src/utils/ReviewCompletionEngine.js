/**
 * 📋 ReviewCompletionEngine.js
 * 
 * Module exhaustif pour la complétion des reviews avec support
 * de tous les types (Fleur, Hash, Concentré, Comestible) et
 * toutes les méthodes anciennes adaptées au nouveau stack.
 * 
 * Basé sur les anciennes méthodes app.js ligne 501-7884
 * Adapté pour React + Express + Prisma
 */

import { validateReviewData } from './validation'
import { calculateReviewMetrics } from './metrics'

// ============================================================================
// 1. STRUCTURES DE DONNÉES COMPLÈTES
// ============================================================================

export const PRODUCT_TYPES = {
    FLEUR: 'Fleur',
    HASH: 'Hash',
    CONCENTRE: 'Concentré',
    COMESTIBLE: 'Comestible'
}

export const VISIBILITY_LEVELS = {
    PUBLIC: 'public',
    AUTHENTICATED: 'authenticated',
    PRIVATE: 'private'
}

export const choiceCatalog = {
    // WEED: Cannabis
    typesCulture: [
        'Indoor',
        'Outdoor',
        'Greenhouse',
        'Living Soil',
        'Culture en terre naturelle',
        'Culture en substrat de coco',
        'Culture en perlite',
        'Culture en laine de roche',
        'Hydroponie Deep Water Culture (DWC)',
        'Hydroponie à flux et reflux (Ebb and Flow)',
        'Hydroponie goutte-à-goutte',
        'Aéroponie haute pression',
        'Aéroponie basse pression',
        'Culture verticale en tours',
        'NFT (Nutrient Film Technique)',
        'Autre'
    ],

    TypesSpectre: [
        'Complet',
        'Far-red',
        'Mint green',
        'Blanc froid',
        'Blanc chaud',
        'UV-A',
        'UV-B',
        'HPS',
        'Autre'
    ],

    substratsSystemes: [
        'Culture en terre naturelle',
        'Culture en substrat de coco',
        'Culture en perlite',
        'Culture en laine de roche',
        'Hydroponie Deep Water Culture (DWC)',
        'Hydroponie à flux et reflux (Ebb and Flow)',
        'Hydroponie goutte-à-goutte',
        'Aéroponie haute pression',
        'Aéroponie basse pression',
        'Culture verticale en tours',
        'NFT (Nutrient Film Technique)',
        'Autre'
    ],

    techniquesPropagation: [
        'Bouturage',
        'Semis',
        'Culture de tissus',
        'Greffage',
        'Autre'
    ],

    engraisOrganiques: [
        'Fumiers compostés',
        'Compost végétal',
        'Tourteaux de ricin',
        'Tourteaux de neem',
        'Guano de chauve-souris',
        'Émulsion de poisson',
        'Farines d\'os et de sang',
        'Algues marines (kelp)',
        'Mélasses',
        'Autre'
    ],

    engraisMineraux: [
        'Solutions nutritives NPK',
        'Nitrate de calcium',
        'Phosphate monopotassique',
        'Sulfate de magnésium',
        'Chélates de fer',
        'Solutions hydroponiques complètes',
        'Autre'
    ],

    additifsStimulants: [
        'Stimulateurs racinaires',
        'Enzymes digestives',
        'Trichoderma',
        'Mycorrhizes',
        'Acides humiques et fulviques',
        'Régulateurs de pH',
        'Autre'
    ],

    extractionSolvants: [
        'Extraction à l\'éthanol (EHO)',
        'Extraction à l\'alcool isopropylique (IPA)',
        'Extraction à l\'acétone (AHO)',
        'Extraction au butane (BHO)',
        'Extraction a l\'isobutane (IHO)',
        'Extraction au propane (PHO)',
        'Extraction à l\'hexane (HHO)',
        'Extraction aux huiles végétales (coco, olive)',
        'Extraction au CO₂ supercritique',
        'Autre'
    ],

    extractionSansSolvants: [
        'Pressage à chaud (Rosin)',
        'Pressage à froid',
        'Extraction par ultrasons (UAE)',
        'Extraction assistée par micro-ondes (MAE)',
        'Extraction avec tensioactifs (Tween 20)',
        'Autre'
    ],

    extractionAvancees: [
        'Extraction par ultrasons (UAE)',
        'Extraction assistée par micro-ondes (MAE)',
        'Extraction avec tensioactifs (Tween 20)'
    ],

    separationTypes: [
        'Tamisage WPFF (Whole Plant Fresh Frozen)',
        'Tamisage à l\'eau glacée (Bubble Hash)',
        'Tamisage à la glace carbonique (Ice Hash)',
        'Tamisage à sec (Dry)',
        'Tamisage à sec congelé (Ice Dry)',
        'Séparation électrostatique (Static)',
        'Friction manuelle (Charas)',
        'Séparation par densité',
        'Décantation',
        'Autre'
    ],

    purificationsAvancees: [
        'Recristallisation',
        'Sublimation',
        'Extraction liquide-liquide',
        'Adsorption sur charbon actif',
        'Filtration membranaire',
        'Autre'
    ],

    separationsChromato: [
        'Chromatographie sur colonne',
        'Flash Chromatography',
        'HPLC',
        'GC',
        'TLC',
        'Autre'
    ],

    fractionnement: [
        'Winterisation',
        'Décarboxylation',
        'Fractionnement par température',
        'Fractionnement par solubilité',
        'Autre'
    ],

    separationsPhysiques: [
        'Filtration',
        'Centrifugation',
        'Décantation',
        'Séchage sous vide',
        'Autre'
    ],

    typesComestibles: [
        'Pâtisserie',
        'Confiserie',
        'Boisson',
        'Capsule',
        'Huile',
        'Chocolat',
        'Bonbon',
        'Gélule',
        'Autre'
    ],

    infoDiet: [
        'Vegan',
        'Sans gluten',
        'Sans sucre',
        'Sans lactose',
        'Bio',
        'Halal',
        'Kasher'
    ]
}

// ============================================================================
// 2. TEMPLATES DE REVUE VIDES
// ============================================================================

export const createEmptyReview = (type = PRODUCT_TYPES.FLEUR) => {
    const baseTemplate = {
        type,
        holderName: '',
        description: '',
        photo: null,
        images: [],
        visibility: VISIBILITY_LEVELS.PUBLIC,
        isDraft: false,
        ratings: {},
        terpenes: [],
        tastes: [],
        aromas: [],
        effects: [],
        metadata: {
            createdAt: new Date(),
            updatedAt: new Date(),
            version: '2.0',
            source: 'ReviewCompletionEngine'
        }
    }

    const typeSpecificFields = {
        [PRODUCT_TYPES.FLEUR]: {
            cultivars: '',
            breeder: '',
            farm: '',
            typeCulture: '',
            spectre: '',
            substratSysteme: '',
            techniquesPropagation: [],
            engraisOrganiques: [],
            engraisMineraux: [],
            additifsStimulants: [],
            ratings: {
                densite: null,
                trichome: null,
                pistil: null,
                manucure: null,
                intensiteOdeur: null,
                durete: null,
                densiteTexture: null,
                elasticite: null,
                collant: null,
                dryPuff: '',
                inhalation: '',
                expiration: '',
                intensiteFumee: null,
                agressivite: null,
                cendre: null,
                montee: null,
                intensiteEffet: null,
                typeEffet: '',
                duree: ''
            }
        },

        [PRODUCT_TYPES.HASH]: {
            cultivarsList: [],
            pipelineSeparation: [],
            hashmaker: '',
            separationsChromato: '',
            fractionnement: '',
            separationsPhysiques: '',
            purificationsAvancees: '',
            ratings: {
                couleurTransparence: null,
                pureteVisuelle: null,
                densite: null,
                intensiteAromatique: null,
                notesDominantesOdeur: '',
                notesSecondairesOdeur: '',
                fideliteCultivars: null,
                durete: null,
                densiteTexture: null,
                friabiliteViscosite: null,
                meltingResidus: null,
                aspectCollantGras: null,
                dryPuff: '',
                inhalation: '',
                expiration: '',
                intensiteFumee: null,
                agressivite: null,
                cendre: null,
                montee: null,
                intensiteEffet: null,
                typeEffet: '',
                duree: ''
            }
        },

        [PRODUCT_TYPES.CONCENTRE]: {
            cultivarsList: [],
            typeExtraction: '',
            pipelineExtraction: [],
            purgevide: false,
            separationsChromato: '',
            fractionnement: '',
            separationsPhysiques: '',
            purificationsAvancees: '',
            ratings: {
                couleur: null,
                viscosite: null,
                pureteVisuelle: null,
                odeur: null,
                melting: null,
                residus: null,
                intensiteAromatique: null,
                notesDominantesOdeur: '',
                notesSecondairesOdeur: '',
                fideliteCultivars: null,
                dryPuff: '',
                inhalation: '',
                expiration: '',
                notesDominantes: '',
                notesSecondaires: '',
                textureBouche: null,
                douceur: null,
                intensite: null,
                intensiteFumee: null,
                agressivite: null,
                cendre: null,
                montee: null,
                intensiteEffets: null,
                typeEffet: '',
                duree: ''
            }
        },

        [PRODUCT_TYPES.COMESTIBLE]: {
            productName: '',
            marque: '',
            typeComestible: '',
            ingredients: '',
            infoDiet: [],
            matiere: '',
            cultivars: '',
            typeExtrait: [],
            thcMg: null,
            cbdMg: null,
            autresCannaMg: null,
            terpenes: '',
            ratings: {
                experience: '',
                apparence: null,
                intensiteOdeur: null,
                gout: null,
                notesDominantes: '',
                notesCannabis: '',
                equilibreSaveurs: '',
                texture: null,
                qualiteAlimentaire: null,
                dosagePris: '',
                tempsMontee: '',
                intensiteMax: null,
                plateau: '',
                typeEffet: ''
            }
        }
    }

    return {
        ...baseTemplate,
        ...typeSpecificFields[type]
    }
}

// ============================================================================
// 3. CLASSE PRINCIPALE - ReviewCompletionEngine
// ============================================================================

export class ReviewCompletionEngine {
    constructor(config = {}) {
        this.config = {
            apiBase: config.apiBase || '/api',
            maxRetries: config.maxRetries || 3,
            uploadTimeout: config.uploadTimeout || 30000,
            ...config
        }
        this.validators = {}
        this.calculateFunctions = {}
        this.initializeValidators()
        this.initializeCalculators()
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3.1 INITIALIZATION
    // ─────────────────────────────────────────────────────────────────────

    initializeValidators() {
        this.validators = {
            holderName: (v) => v && v.trim().length > 0 && v.length <= 100,
            type: (v) => Object.values(PRODUCT_TYPES).includes(v),
            rating: (v) => typeof v === 'number' && v >= 0 && v <= 10,
            terpenes: (v) => Array.isArray(v) && v.length <= 8,
            images: (v) => Array.isArray(v) && v.length <= 10,
            image: (f) => {
                if (!f) return true
                const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
                return (
                    validTypes.includes(f.type) &&
                    f.size <= 10 * 1024 * 1024
                )
            },
            visibility: (v) => Object.values(VISIBILITY_LEVELS).includes(v),
            email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
        }
    }

    initializeCalculators() {
        this.calculateFunctions = {
            [PRODUCT_TYPES.FLEUR]: this.calculateFleurTotals.bind(this),
            [PRODUCT_TYPES.HASH]: this.calculateHashTotals.bind(this),
            [PRODUCT_TYPES.CONCENTRE]: this.calculateConcentreTotals.bind(this),
            [PRODUCT_TYPES.COMESTIBLE]: this.calculateComestibleTotals.bind(this)
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3.2 VALIDATION
    // ─────────────────────────────────────────────────────────────────────

    validateReview(review) {
        const errors = {}

        // Validations obligatoires
        if (!this.validators.holderName(review.holderName)) {
            errors.holderName = 'Le nom du produit est obligatoire (1-100 caractères)'
        }

        if (!this.validators.type(review.type)) {
            errors.type = 'Type de produit invalide'
        }

        // Validations conditionnelles par type
        if (review.type === PRODUCT_TYPES.FLEUR) {
            if (!review.cultivars?.trim()) {
                errors.cultivars = 'Le cultivar est obligatoire pour une Fleur'
            }
        }

        if (review.type === PRODUCT_TYPES.COMESTIBLE) {
            if (!review.productName?.trim()) {
                errors.productName = 'Le nom du produit est obligatoire'
            }
        }

        // Validations ratings
        if (Object.keys(review.ratings || {}).length === 0) {
            errors.ratings = 'Au moins une évaluation est requise'
        }

        // Validations images
        if (review.images?.length > 10) {
            errors.images = 'Maximum 10 images autorisées'
        }

        // Validations visibilité
        if (!this.validators.visibility(review.visibility)) {
            errors.visibility = 'Visibilité invalide'
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        }
    }

    validateStep(review, step) {
        const stepValidations = {
            general: () => {
                if (!review.holderName?.trim())
                    throw new Error('holderName_required')
                if (!this.validators.type(review.type))
                    throw new Error('invalid_type')
            },

            ratings: () => {
                if (Object.keys(review.ratings || {}).length === 0)
                    throw new Error('no_ratings')
            },

            images: () => {
                if (review.images?.length > 10)
                    throw new Error('too_many_images')
            },

            visibility: () => {
                if (!this.validators.visibility(review.visibility))
                    throw new Error('invalid_visibility')
            }
        }

        try {
            stepValidations[step]?.()
            return { isValid: true }
        } catch (err) {
            return { isValid: false, error: err.message }
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3.3 CALCULS DE TOTAUX (par type)
    // ─────────────────────────────────────────────────────────────────────

    calculateFleurTotals(ratings) {
        const sections = {
            'Visuel et Technique': ['densite', 'trichome', 'pistil', 'manucure'],
            'Odeur': ['intensiteOdeur'],
            'Texture': ['durete', 'densiteTexture', 'elasticite', 'collant'],
            'Goûts & Expérience fumée': ['intensiteFumee', 'agressivite', 'cendre'],
            'Effet': ['montee', 'intensiteEffet']
        }

        return this.calculateSectionTotals(ratings, sections)
    }

    calculateHashTotals(ratings) {
        const sections = {
            'Visuel & Technique': ['couleurTransparence', 'pureteVisuelle', 'densite'],
            'Odeur': ['intensiteAromatique', 'fideliteCultivars'],
            'Texture': ['durete', 'densiteTexture', 'friabiliteViscosite', 'meltingResidus', 'aspectCollantGras'],
            'Goûts & Expérience fumée': ['intensiteFumee', 'agressivite', 'cendre'],
            'Effet': ['montee', 'intensiteEffet']
        }

        return this.calculateSectionTotals(ratings, sections)
    }

    calculateConcentreTotals(ratings) {
        const sections = {
            'Visuel & Technique': ['couleur', 'viscosite', 'pureteVisuelle', 'odeur', 'melting', 'residus'],
            'Odeur': ['intensiteAromatique', 'fideliteCultivars'],
            'Texture': ['durete', 'densiteTexture', 'viscositeTexture', 'collant'],
            'Expérience Inhalation': ['textureBouche', 'douceur', 'intensite'],
            'Effet': ['montee', 'intensiteEffets']
        }

        return this.calculateSectionTotals(ratings, sections)
    }

    calculateComestibleTotals(ratings) {
        const sections = {
            'Expérience gustative': ['apparence', 'intensiteOdeur', 'gout', 'texture', 'qualiteAlimentaire'],
            'Effet': ['intensiteMax']
        }

        return this.calculateSectionTotals(ratings, sections)
    }

    calculateSectionTotals(ratings, sections) {
        const totals = {}
        let sectionScores = []

        for (const [sectionName, keys] of Object.entries(sections)) {
            const values = keys
                .map(k => ratings[k])
                .filter(v => typeof v === 'number' && !isNaN(v))

            if (values.length > 0) {
                const avg = values.reduce((a, b) => a + b, 0) / values.length
                totals[`total_${sectionName}`] = parseFloat(avg.toFixed(1))
                sectionScores.push(avg)
            }
        }

        // Score global
        if (sectionScores.length > 0) {
            totals.global = parseFloat(
                (sectionScores.reduce((a, b) => a + b, 0) / sectionScores.length).toFixed(1)
            )
        }

        return totals
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3.4 PRÉPARATION & TRANSFORMATION
    // ─────────────────────────────────────────────────────────────────────

    prepareForSubmission(review) {
        const validation = this.validateReview(review)
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`)
        }

        // Calculer les totaux
        const calculateFn = this.calculateFunctions[review.type]
        const totals = calculateFn(review.ratings)

        // Préparer les données finales
        const finalData = {
            type: review.type,
            holderName: review.holderName.trim(),
            description: review.description || null,
            ratings: JSON.stringify(review.ratings),
            terpenes: JSON.stringify(review.terpenes || []),
            tastes: JSON.stringify(review.tastes || []),
            aromas: JSON.stringify(review.aromas || []),
            effects: JSON.stringify(review.effects || []),
            images: JSON.stringify(review.images || []),
            isPublic: review.visibility === VISIBILITY_LEVELS.PUBLIC,
            isDraft: review.isDraft || false,
            metadata: {
                totals,
                completionPercentage: this.calculateCompletionPercentage(review),
                version: '2.0'
            }
        }

        return finalData
    }

    calculateCompletionPercentage(review) {
        const sections = {
            [PRODUCT_TYPES.FLEUR]: ['holderName', 'cultivars', 'ratings', 'photo'],
            [PRODUCT_TYPES.HASH]: ['holderName', 'cultivarsList', 'ratings', 'photo'],
            [PRODUCT_TYPES.CONCENTRE]: ['holderName', 'cultivarsList', 'typeExtraction', 'ratings'],
            [PRODUCT_TYPES.COMESTIBLE]: ['holderName', 'productName', 'ratings', 'photo']
        }

        const requiredFields = sections[review.type] || []
        const filledFields = requiredFields.filter(field => {
            const value = review[field]
            if (Array.isArray(value)) return value.length > 0
            if (typeof value === 'object') return Object.keys(value).length > 0
            return !!value
        })

        return Math.round((filledFields.length / requiredFields.length) * 100)
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3.5 SOUMISSION & GESTION API
    // ─────────────────────────────────────────────────────────────────────

    async submitReview(review, files = []) {
        try {
            const preparedData = this.prepareForSubmission(review)

            // Préparer FormData pour multipart
            const formData = new FormData()

            // Ajouter les champs
            Object.entries(preparedData).forEach(([key, value]) => {
                if (key !== 'metadata') {
                    formData.append(key, value)
                }
            })

            // Ajouter metadata
            formData.append('metadata', JSON.stringify(preparedData.metadata))

            // Ajouter les fichiers
            files.forEach((file) => {
                formData.append('images', file)
            })

            // Soumettre
            const response = await this.fetchWithRetry(
                `${this.config.apiBase}/reviews`,
                {
                    method: 'POST',
                    body: formData,
                    timeout: this.config.uploadTimeout
                }
            )

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Submission failed')
            }

            return await response.json()
        } catch (err) {
            console.error('Review submission error:', err)
            throw err
        }
    }

    async updateReview(reviewId, review, files = []) {
        try {
            const preparedData = this.prepareForSubmission(review)
            const formData = new FormData()

            Object.entries(preparedData).forEach(([key, value]) => {
                if (key !== 'metadata') {
                    formData.append(key, value)
                }
            })

            formData.append('metadata', JSON.stringify(preparedData.metadata))

            files.forEach((file) => {
                formData.append('images', file)
            })

            const response = await this.fetchWithRetry(
                `${this.config.apiBase}/reviews/${reviewId}`,
                {
                    method: 'PUT',
                    body: formData,
                    timeout: this.config.uploadTimeout
                }
            )

            if (!response.ok) {
                throw new Error('Update failed')
            }

            return await response.json()
        } catch (err) {
            console.error('Review update error:', err)
            throw err
        }
    }

    async fetchWithRetry(url, options, attempt = 1) {
        try {
            const controller = new AbortController()
            const timeoutId = setTimeout(
                () => controller.abort(),
                options.timeout || 30000
            )

            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            })

            clearTimeout(timeoutId)
            return response
        } catch (err) {
            if (attempt < this.config.maxRetries) {
                await new Promise(r => setTimeout(r, 1000 * attempt))
                return this.fetchWithRetry(url, options, attempt + 1)
            }
            throw err
        }
    }

    // ─────────────────────────────────────────────────────────────────────
    // 3.6 UTILITAIRES
    // ─────────────────────────────────────────────────────────────────────

    getChoicesForField(type, fieldName) {
        const fieldChoices = {
            typesCulture: choiceCatalog.typesCulture,
            spectre: choiceCatalog.TypesSpectre,
            substratSysteme: choiceCatalog.substratsSystemes,
            techniquesPropagation: choiceCatalog.techniquesPropagation,
            engraisOrganiques: choiceCatalog.engraisOrganiques,
            engraisMineraux: choiceCatalog.engraisMineraux,
            additifsStimulants: choiceCatalog.additifsStimulants,
            extractionSolvants: choiceCatalog.extractionSolvants,
            extractionSansSolvants: choiceCatalog.extractionSansSolvants,
            separationTypes: choiceCatalog.separationTypes,
            separationsChromato: choiceCatalog.separationsChromato,
            fractionnement: choiceCatalog.fractionnement,
            separationsPhysiques: choiceCatalog.separationsPhysiques,
            purificationsAvancees: choiceCatalog.purificationsAvancees,
            typesComestibles: choiceCatalog.typesComestibles,
            infoDiet: choiceCatalog.infoDiet
        }

        return fieldChoices[fieldName] || []
    }

    duplicateReview(sourceReview) {
        const duplicated = { ...sourceReview }
        duplicated.holderName = `${duplicated.holderName} (Copie)`
        duplicated.isDraft = true
        return duplicated
    }

    async exportAsJSON(review) {
        return JSON.stringify(review, null, 2)
    }

    async exportAsCSV(reviews) {
        if (!Array.isArray(reviews)) reviews = [reviews]

        const headers = [
            'Type',
            'Holder Name',
            'Description',
            'Global Score',
            'Is Public',
            'Is Draft',
            'Created At'
        ]

        const rows = reviews.map(r => [
            r.type,
            r.holderName,
            r.description || '',
            r.metadata?.totals?.global || '-',
            r.isPublic ? 'Yes' : 'No',
            r.isDraft ? 'Yes' : 'No',
            r.metadata?.createdAt || new Date().toISOString()
        ])

        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        return csv
    }

    async validateBulk(reviews) {
        return reviews.map((review, index) => ({
            index,
            review,
            validation: this.validateReview(review)
        }))
    }
}

// ============================================================================
// 4. INSTANCES PRÉ-CONFIGURÉES
// ============================================================================

export const reviewEngine = new ReviewCompletionEngine({
    apiBase: process.env.REACT_APP_API_BASE || '/api',
    maxRetries: 3,
    uploadTimeout: 30000
})

export default ReviewCompletionEngine
