/**
 * Utilitaire pour aplatir les données de formulaire avant envoi au backend
 * Transforme les sous-objets (odeurs, gouts, texture, effets, curing) en champs plats
 */

/**
 * Aplatir les données communes à tous les types de produits
 * @param {Object} data - Données du formulaire avec sous-objets
 * @returns {Object} - Données aplaties pour le backend
 */
export function flattenCommonFormData(data) {
    const flat = {}

    // Section Odeurs
    if (data.odeurs) {
        if (data.odeurs.dominantNotes) flat.notesOdeursDominantes = data.odeurs.dominantNotes
        if (data.odeurs.secondaryNotes) flat.notesOdeursSecondaires = data.odeurs.secondaryNotes
        if (data.odeurs.intensity !== undefined) flat.intensiteAromeScore = data.odeurs.intensity
        if (data.odeurs.complexity !== undefined) flat.complexiteAromeScore = data.odeurs.complexity
        if (data.odeurs.fidelity !== undefined) flat.fideliteAromeScore = data.odeurs.fidelity
        // Pour Hash spécifiquement
        if (data.odeurs.fideliteCultivars !== undefined) flat.fideliteCultivars = data.odeurs.fideliteCultivars
        if (data.odeurs.intensiteAromatique !== undefined) flat.intensiteAromatique = data.odeurs.intensiteAromatique
    }

    // Section Texture
    if (data.texture) {
        if (data.texture.hardness !== undefined) flat.dureteScore = data.texture.hardness
        if (data.texture.density !== undefined) flat.densiteTactileScore = data.texture.density
        if (data.texture.elasticity !== undefined) flat.elasticiteScore = data.texture.elasticity
        if (data.texture.stickiness !== undefined) flat.collantScore = data.texture.stickiness
        // Champs additionnels pour Hash/Concentré
        if (data.texture.friability !== undefined) flat.friabiliteScore = data.texture.friability
        if (data.texture.viscosity !== undefined) flat.viscositeScore = data.texture.viscosity
        if (data.texture.melting !== undefined) flat.meltingScore = data.texture.melting
        if (data.texture.residue !== undefined) flat.residuScore = data.texture.residue
    }

    // Section Goûts
    if (data.gouts) {
        if (data.gouts.intensity !== undefined) flat.intensiteGoutScore = data.gouts.intensity
        if (data.gouts.aggressiveness !== undefined) flat.agressiviteScore = data.gouts.aggressiveness
        if (data.gouts.dryPuffNotes) flat.dryPuffNotes = data.gouts.dryPuffNotes
        if (data.gouts.inhalationNotes) flat.inhalationNotes = data.gouts.inhalationNotes
        if (data.gouts.exhalationNotes) flat.expirationNotes = data.gouts.exhalationNotes
    }

    // Section Effets & Expérience
    if (data.effets) {
        if (data.effets.onset !== undefined) flat.monteeScore = data.effets.onset
        if (data.effets.intensity !== undefined) flat.intensiteEffetScore = data.effets.intensity
        if (data.effets.duration) flat.effectDuration = data.effets.duration
        if (data.effets.effects) flat.effetsChoisis = data.effets.effects
        // Expérience
        if (data.effets.methodeConsommation) flat.consumptionMethod = data.effets.methodeConsommation
        if (data.effets.dosageUtilise) flat.dosage = data.effets.dosageUtilise
        if (data.effets.dosageUnite) flat.dosageUnit = data.effets.dosageUnite
        if (data.effets.dureeEffetsHeures || data.effets.dureeEffetsMinutes) {
            flat.effectDurationMinutes = (parseInt(data.effets.dureeEffetsHeures || 0) * 60) + parseInt(data.effets.dureeEffetsMinutes || 0)
        }
        if (data.effets.debutEffets) flat.effectOnset = data.effets.debutEffets
        if (data.effets.dureeEffetsCategorie) flat.effectLength = data.effets.dureeEffetsCategorie
        if (data.effets.profilsEffets) flat.effectProfiles = data.effets.profilsEffets
        if (data.effets.effetsSecondaires) flat.sideEffects = data.effets.effetsSecondaires
        if (data.effets.usagesPreferes) flat.preferredUse = data.effets.usagesPreferes
    }

    // Section Curing & Maturation
    // Nouvelle structure : UnifiedPipeline stocke dans formData.curingPipeline = { timelineConfig, timelineData }
    if (data.curingPipeline) {
        if (data.curingPipeline.timelineConfig) flat.curingTimelineConfig = data.curingPipeline.timelineConfig
        if (data.curingPipeline.timelineData) flat.curingTimelineData = data.curingPipeline.timelineData
    }
    // Compatibilité ancienne structure data.curing
    if (data.curing) {
        if (!flat.curingTimelineConfig && data.curing.curingTimelineConfig) flat.curingTimelineConfig = data.curing.curingTimelineConfig
        if (!flat.curingTimelineData && data.curing.curingTimeline) flat.curingTimelineData = data.curing.curingTimeline
        if (data.curing.curingType) flat.curingType = data.curing.curingType
        if (data.curing.temperature !== undefined) flat.curingTemperature = data.curing.temperature
        if (data.curing.humidity !== undefined) flat.curingHumidity = data.curing.humidity
    }

    return flat
}

/**
 * Aplatir les données spécifiques à FlowerReview
 */
export function flattenFlowerFormData(data) {
    const flat = flattenCommonFormData(data)

    // Section 1 - Infos Générales
    if (data.nomCommercial) flat.nomCommercial = data.nomCommercial
    if (data.cultivars) flat.cultivars = data.cultivars
    if (data.farm) flat.farm = data.farm
    if (data.varietyType) flat.varietyType = data.varietyType

    // Aperçu / Orchard preset — doit être persisté dans extraData côté serveur
    if (data.orchardPreset) flat.orchardPreset = data.orchardPreset
    if (data.orchardConfig) flat.orchardConfig = data.orchardConfig
    if (data.orchardCustomLayout) flat.orchardCustomLayout = data.orchardCustomLayout
    if (data.orchardLayoutMode) flat.orchardLayoutMode = data.orchardLayoutMode

    // Section 2 - Génétiques
    if (data.genetics) {
        if (data.genetics.breeder) flat.breeder = data.genetics.breeder
        if (data.genetics.variety) flat.variety = data.genetics.variety
        if (data.genetics.geneticType) flat.geneticType = data.genetics.geneticType
        if (data.genetics.indicaPercent !== undefined) flat.indicaPercent = data.genetics.indicaPercent
        if (data.genetics.sativaPercent !== undefined) flat.sativaPercent = data.genetics.sativaPercent
        if (data.genetics.parentage) flat.parentage = data.genetics.parentage
        if (data.genetics.phenotypeCode) flat.phenotypeCode = data.genetics.phenotypeCode
        if (data.genetics.treeId) flat.geneticTreeId = data.genetics.treeId
    }
    // Top-level geneticTreeId (set directly via Genetiques section handleChange)
    if (data.geneticTreeId !== undefined && !flat.geneticTreeId) flat.geneticTreeId = data.geneticTreeId || null

    // Section 3 - Culture Pipeline
    // Nouvelle structure : UnifiedPipeline stocke dans formData.culturePipeline = { timelineConfig, timelineData }
    if (data.culturePipeline) {
        if (data.culturePipeline.timelineConfig) flat.cultureTimelineConfig = data.culturePipeline.timelineConfig
        if (data.culturePipeline.timelineData) flat.cultureTimelineData = data.culturePipeline.timelineData
    }
    // Compatibilité ancienne structure data.culture
    if (data.culture) {
        if (!flat.cultureTimelineConfig && data.culture.cultureTimelineConfig) flat.cultureTimelineConfig = data.culture.cultureTimelineConfig
        // CulturePipelineSection écrit 'cultureTimeline', le backend attend 'cultureTimelineData'
        if (!flat.cultureTimelineData && data.culture.cultureTimelineData) flat.cultureTimelineData = data.culture.cultureTimelineData
        if (!flat.cultureTimelineData && data.culture.cultureTimeline) flat.cultureTimelineData = data.culture.cultureTimeline
        if (data.culture.mode) flat.cultureMode = data.culture.mode
        if (data.culture.spaceType) flat.cultureSpaceType = data.culture.spaceType
        if (data.culture.substrat) flat.cultureSubstrat = data.culture.substrat
    }

    // Section 3.5 - Récolte (Harvest)
    if (data.recolte) {
        if (data.recolte.trichomesTranslucides !== undefined) flat.trichomesTranslucides = data.recolte.trichomesTranslucides
        if (data.recolte.trichomesLaiteux !== undefined) flat.trichomesLaiteux = data.recolte.trichomesLaiteux
        if (data.recolte.trichomesAmbres !== undefined) flat.trichomesAmbres = data.recolte.trichomesAmbres
        if (data.recolte.modeRecolte) flat.modeRecolte = data.recolte.modeRecolte
        if (data.recolte.poidsBrut !== undefined) flat.poidsBrut = data.recolte.poidsBrut
        if (data.recolte.poidsNet !== undefined) flat.poidsNet = data.recolte.poidsNet
    }

    // Section 4 - Analytics
    if (data.analytics) {
        if (data.analytics.thcPercent !== undefined) flat.thcPercent = data.analytics.thcPercent
        if (data.analytics.cbdPercent !== undefined) flat.cbdPercent = data.analytics.cbdPercent
        if (data.analytics.cbgPercent !== undefined) flat.cbgPercent = data.analytics.cbgPercent
        if (data.analytics.terpeneProfile) flat.terpeneProfile = data.analytics.terpeneProfile
    }

    // Section 5 - Visuel & Technique
    // Primary: VisualSection stores scores under formData.visual.* (nested object)
    if (data.visual) {
        if (data.visual.colors) flat.couleurNuancier = data.visual.colors
        if (data.visual.colorRating !== undefined) flat.couleurRating = data.visual.colorRating
        if (data.visual.density !== undefined) flat.densiteVisuelle = data.visual.density
        if (data.visual.trichomes !== undefined) flat.trichomesScore = data.visual.trichomes
        if (data.visual.transparency !== undefined) flat.transparenceScore = data.visual.transparency
        if (data.visual.mold !== undefined) flat.moisissureScore = data.visual.mold
        if (data.visual.seeds !== undefined) flat.grainesScore = data.visual.seeds
        if (data.visual.pistils !== undefined) flat.pistilsScore = data.visual.pistils
        if (data.visual.manucure !== undefined) flat.manucureScore = data.visual.manucure
    }
    // Legacy fallback: direct top-level fields (older reviews / other code paths)
    if (!flat.couleurNuancier && data.selectedColors) flat.couleurNuancier = data.selectedColors
    if (!flat.densiteVisuelle && data.densite !== undefined) flat.densiteVisuelle = data.densite
    if (!flat.trichomesScore && data.trichomes !== undefined) flat.trichomesScore = data.trichomes
    if (!flat.pistilsScore && data.pistils !== undefined) flat.pistilsScore = data.pistils
    if (!flat.manucureScore && data.manucure !== undefined) flat.manucureScore = data.manucure
    if (!flat.moisissureScore && data.moisissure !== undefined) flat.moisissureScore = data.moisissure
    if (!flat.grainesScore && data.graines !== undefined) flat.grainesScore = data.graines

    return flat
}

/**
 * Aplatir les données spécifiques à HashReview
 */
export function flattenHashFormData(data) {
    const flat = flattenCommonFormData(data)

    // Section 1 - Infos Générales
    if (data.nomCommercial) flat.nomCommercial = data.nomCommercial
    if (data.hashmaker) flat.hashmaker = data.hashmaker
    if (data.laboratoire) flat.laboratoire = data.laboratoire
    if (data.cultivarsUtilises) flat.cultivarsUtilises = data.cultivarsUtilises

    // Section 2 - Pipeline Séparation
    if (data.separation) {
        if (data.separation.methodeSeparation) flat.methodeSeparation = data.separation.methodeSeparation
        if (data.separation.nombrePasses !== undefined) flat.nombrePasses = data.separation.nombrePasses
        if (data.separation.temperatureEau !== undefined) flat.temperatureEau = data.separation.temperatureEau
        if (data.separation.tailleMailles) flat.tailleMailles = data.separation.tailleMailles
        if (data.separation.typeMatierePremiere) flat.typeMatierePremiere = data.separation.typeMatierePremiere
        if (data.separation.qualiteMatierePremiere !== undefined) flat.qualiteMatierePremiere = data.separation.qualiteMatierePremiere
        if (data.separation.rendementEstime !== undefined) flat.rendementEstime = data.separation.rendementEstime
        if (data.separation.tempsTotalSeparation !== undefined) flat.tempsTotalSeparation = data.separation.tempsTotalSeparation
        if (data.separation.timelineConfig) flat.separationTimelineConfig = data.separation.timelineConfig
        if (data.separation.timelineData) flat.separationTimelineData = data.separation.timelineData
    }

    // Champs directs de séparation (si pas dans sous-objet)
    if (data.methodeSeparation) flat.methodeSeparation = data.methodeSeparation
    if (data.nombrePasses !== undefined) flat.nombrePasses = data.nombrePasses
    if (data.temperatureEau !== undefined) flat.temperatureEau = data.temperatureEau
    if (data.tailleMailles) flat.tailleMailles = data.tailleMailles
    if (data.typeMatierePremiere) flat.typeMatierePremiere = data.typeMatierePremiere
    if (data.qualiteMatierePremiere !== undefined) flat.qualiteMatierePremiere = data.qualiteMatierePremiere
    if (data.rendementEstime !== undefined) flat.rendementEstime = data.rendementEstime
    if (data.tempsTotalSeparation !== undefined) flat.tempsTotalSeparation = data.tempsTotalSeparation

    // Section 4 - Visuel & Technique (spécifique Hash)
    if (data.couleurTransparence !== undefined) flat.couleurTransparence = data.couleurTransparence
    if (data.pureteVisuelle !== undefined) flat.pureteVisuelle = data.pureteVisuelle
    if (data.densiteVisuelle !== undefined) flat.densiteVisuelle = data.densiteVisuelle
    if (data.pistils !== undefined) flat.pistilsScore = data.pistils
    if (data.moisissure !== undefined) flat.moisissureScore = data.moisissure
    if (data.graines !== undefined) flat.grainesScore = data.graines

    return flat
}

/**
 * Aplatir les données spécifiques à ConcentrateReview
 */
export function flattenConcentrateFormData(data) {
    const flat = flattenCommonFormData(data)

    // Section 1 - Infos Générales
    if (data.nomCommercial) flat.nomCommercial = data.nomCommercial
    if (data.hashmaker) flat.hashmaker = data.hashmaker
    if (data.laboratoire) flat.laboratoire = data.laboratoire
    if (data.cultivarsUtilises) flat.cultivarsUtilises = data.cultivarsUtilises

    // Section 2 - Pipeline Extraction
    if (data.extraction) {
        if (data.extraction.methodeExtraction) flat.methodeExtraction = data.extraction.methodeExtraction
        if (data.extraction.solvant) flat.solvant = data.extraction.solvant
        if (data.extraction.temperature !== undefined) flat.extractionTemperature = data.extraction.temperature
        if (data.extraction.pression !== undefined) flat.extractionPression = data.extraction.pression
        if (data.extraction.duree !== undefined) flat.extractionDuree = data.extraction.duree
        if (data.extraction.rendement !== undefined) flat.rendement = data.extraction.rendement
        if (data.extraction.timelineConfig) flat.extractionTimelineConfig = data.extraction.timelineConfig
        if (data.extraction.timelineData) flat.extractionTimelineData = data.extraction.timelineData
    }

    // Section 3 - Pipeline Purification
    if (data.purification) {
        if (data.purification.methodePurification) flat.methodePurification = data.purification.methodePurification
        if (data.purification.timelineConfig) flat.purificationTimelineConfig = data.purification.timelineConfig
        if (data.purification.timelineData) flat.purificationTimelineData = data.purification.timelineData
    }

    // Section 4 - Visuel & Technique (spécifique Concentré)
    if (data.couleurTransparence !== undefined) flat.couleurTransparence = data.couleurTransparence
    if (data.viscositeVisuelle !== undefined) flat.viscositeVisuelle = data.viscositeVisuelle
    if (data.pureteVisuelle !== undefined) flat.pureteVisuelle = data.pureteVisuelle
    if (data.meltingScore !== undefined) flat.meltingScore = data.meltingScore
    if (data.residuScore !== undefined) flat.residuScore = data.residuScore
    if (data.pistils !== undefined) flat.pistilsScore = data.pistils
    if (data.moisissure !== undefined) flat.moisissureScore = data.moisissure

    return flat
}

/**
 * Aplatir les données spécifiques à EdibleReview
 */
export function flattenEdibleFormData(data) {
    const flat = flattenCommonFormData(data)

    // Section 1 - Infos Générales
    if (data.nomProduit) flat.nomProduit = data.nomProduit
    if (data.typeComestible) flat.typeComestible = data.typeComestible
    if (data.fabricant) flat.fabricant = data.fabricant
    if (data.genetiquesType) flat.genetiquesType = data.genetiquesType

    // Section 2 - Pipeline Recette
    if (data.recette) {
        if (data.recette.ingredients) flat.ingredients = data.recette.ingredients
        if (data.recette.etapes) flat.etapesPreparation = data.recette.etapes
        if (data.recette.timelineConfig) flat.recetteTimelineConfig = data.recette.timelineConfig
        if (data.recette.timelineData) flat.recetteTimelineData = data.recette.timelineData
    }

    // Section 3 - Goûts (spécifique comestible)
    if (data.gouts) {
        if (data.gouts.saveursDominantes) flat.saveursDominantes = data.gouts.saveursDominantes
    }

    // Section 4 - Effets (durée spécifique)
    if (data.effets) {
        if (data.effets.dureeEffetsCategorie) flat.dureeEffets = data.effets.dureeEffetsCategorie
    }

    return flat
}

/**
 * Crée un FormData à partir des données aplaties
 * @param {Object} flatData - Données aplaties
 * @param {Array} photos - Photos à uploader (nouveaux fichiers)
 * @param {string} status - 'draft' ou 'published'
 * @param {Array} existingImages - Noms de fichiers d'images existantes à conserver
 */
export function createFormDataFromFlat(flatData, photos = [], status = 'draft', existingImages = []) {
    const formData = new FormData()

    // Ajouter toutes les données aplaties
    Object.keys(flatData).forEach(key => {
        const value = flatData[key]
        if (value !== undefined && value !== null) {
            if (Array.isArray(value) || (typeof value === 'object' && value !== null)) {
                formData.append(key, JSON.stringify(value))
            } else {
                formData.append(key, value)
            }
        }
    })

    // Ajouter les images existantes à conserver (pour PUT/update)
    if (existingImages && existingImages.length > 0) {
        formData.append('existingImages', JSON.stringify(existingImages))
    }

    // Ajouter les nouvelles photos
    if (photos && photos.length > 0) {
        photos.forEach((photo) => {
            if (photo.file) {
                formData.append('images', photo.file)
            }
        })
    }

    formData.append('status', status)

    return formData
}
