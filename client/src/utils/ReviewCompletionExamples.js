/**
 * 📚 EXEMPLES D'UTILISATION - ReviewCompletionEngine
 * 
 * Tous les cas d'usage et patterns pour les anciennes méthodes
 * adaptées au nouveau stack
 */

import { ReviewCompletionEngine, PRODUCT_TYPES, createEmptyReview } from './ReviewCompletionEngine'
import { useReviewCompletion } from '../hooks/useReviewCompletion'

// ============================================================================
// EXEMPLE 1: Composant Formulaire Fleur (React)
// ============================================================================

export const ReviewFleurExample = () => {
    const {
        reviewData,
        errors,
        totals,
        completionPercentage,
        isSubmitting,
        updateField,
        updateRating,
        toggleArrayItem,
        handleImageUpload,
        removeImage,
        submitReview,
        getChoices,
        hasError
    } = useReviewCompletion(PRODUCT_TYPES.FLEUR)

    return (
        <div className="review-form">
            {/* Barre de progression */}
            <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${completionPercentage}%` }}>
                    {completionPercentage}%
                </div>
            </div>

            {/* Section 1: Informations générales */}
            <section className="form-section">
                <h3>📝 Informations Générales</h3>

                <input
                    type="text"
                    placeholder="Cultivar (ex: OG Kush)"
                    value={reviewData.cultivars}
                    onChange={(e) => updateField('cultivars', e.target.value)}
                    className={hasError('cultivars') ? 'error' : ''}
                />
                {hasError('cultivars') && <span className="error-msg">{errors.cultivars}</span>}

                <input
                    type="text"
                    placeholder="Breeder (optionnel)"
                    value={reviewData.breeder}
                    onChange={(e) => updateField('breeder', e.target.value)}
                />

                <select
                    value={reviewData.typeCulture}
                    onChange={(e) => updateField('typeCulture', e.target.value)}
                >
                    <option value="">Sélectionner type de culture</option>
                    {getChoices('typesCulture').map(choice => (
                        <option key={choice} value={choice}>{choice}</option>
                    ))}
                </select>

                {/* Upload image */}
                <div className="image-upload" onClick={() => document.querySelector('input[type=file]')?.click()}>
                    <p>Cliquez ou glissez une image</p>
                    <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        style={{ display: 'none' }}
                    />
                </div>

                {/* Aperçu images */}
                <div className="image-preview">
                    {reviewData.images?.map((img) => (
                        <div key={img.id} className="preview-item">
                            <img src={img.preview} alt="preview" />
                            <button onClick={() => removeImage(img.id)}>✕</button>
                        </div>
                    ))}
                </div>
            </section>

            {/* Section 2: Évaluations */}
            <section className="form-section">
                <h3>⭐ Évaluations Visuelles</h3>

                <div className="rating-group">
                    {['densite', 'trichome', 'pistil', 'manucure'].map(key => (
                        <div key={key} className="rating-item">
                            <label>{key}</label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={reviewData.ratings[key] || 0}
                                onChange={(e) => updateRating(key, e.target.value)}
                            />
                            <span>{reviewData.ratings[key] || 0}/10</span>
                        </div>
                    ))}
                </div>

                {/* Total section automatique */}
                {totals.total_Visuel && (
                    <div className="total-display">
                        <strong>Total Visuel: {totals.total_Visuel}</strong>
                    </div>
                )}
            </section>

            {/* Section 3: Terpènes */}
            <section className="form-section">
                <h3>🌿 Sélection Terpènes (max 8)</h3>
                <div className="checkbox-group">
                    {['Myrcène', 'Limonène', 'Pinène', 'Caryophyllène', 'Humulène', 'Linalool'].map(terpene => (
                        <label key={terpene}>
                            <input
                                type="checkbox"
                                checked={reviewData.terpenes?.includes(terpene)}
                                onChange={() => toggleArrayItem('terpenes', terpene)}
                                disabled={reviewData.terpenes?.length >= 8 && !reviewData.terpenes?.includes(terpene)}
                            />
                            {terpene}
                        </label>
                    ))}
                </div>
            </section>

            {/* Score global */}
            {totals.global && (
                <div className="global-score">
                    <h2>🎯 Score Global: {totals.global}/10</h2>
                </div>
            )}

            {/* Boutons */}
            <div className="form-actions">
                <button onClick={() => saveDraft()} disabled={isSubmitting}>
                    💾 Sauvegarder en Brouillon
                </button>
                <button onClick={() => submitReview()} disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? 'Soumission...' : '✅ Publier'}
                </button>
            </div>
        </div>
    )
}

// ============================================================================
// EXEMPLE 2: Validation et Gestion d'Erreurs
// ============================================================================

export const validateReviewExample = () => {
    const engine = new ReviewCompletionEngine()

    const invalidReview = {
        type: 'InvalidType',
        holderName: '',
        ratings: {}
    }

    const validation = engine.validateReview(invalidReview)
    console.log('Validation result:', validation)

    // Output:
    // {
    //   isValid: false,
    //   errors: {
    //     holderName: 'Le nom du produit est obligatoire...',
    //     type: 'Type de produit invalide',
    //     ratings: 'Au moins une évaluation est requise'
    //   }
    // }

    // Valider une étape
    const stepValidation = engine.validateStep(invalidReview, 'general')
    if (!stepValidation.isValid) {
        console.error('Step validation failed:', stepValidation.error)
    }
}

// ============================================================================
// EXEMPLE 3: Calcul des Totaux pour Chaque Type
// ============================================================================

export const calculateTotalsExample = () => {
    const engine = new ReviewCompletionEngine()

    // FLEUR
    const fleurRatings = {
        densite: 8,
        trichome: 9,
        pistil: 7,
        manucure: 8,
        intensiteOdeur: 9,
        durete: 7,
        densiteTexture: 8,
        elasticite: 8,
        collant: 7,
        intensiteFumee: 8,
        agressivite: 6,
        cendre: 8,
        montee: 8,
        intensiteEffet: 9
    }

    const fleurTotals = engine.calculateFleurTotals(fleurRatings)
    console.log('Fleur totals:', fleurTotals)
    // Output:
    // {
    //   total_Visuel et Technique: 8,
    //   total_Odeur: 9,
    //   total_Texture: 7.5,
    //   total_Goûts & Expérience fumée: 7.3,
    //   total_Effet: 8.5,
    //   global: 8.1
    // }

    // HASH
    const hashRatings = {
        couleurTransparence: 9,
        pureteVisuelle: 8,
        densite: 7,
        intensiteAromatique: 8,
        fideliteCultivars: 9
    }

    const hashTotals = engine.calculateHashTotals(hashRatings)
    console.log('Hash totals:', hashTotals)

    // CONCENTRÉ
    const concentreRatings = {
        couleur: 9,
        viscosite: 8,
        pureteVisuelle: 9,
        odeur: 8,
        melting: 9,
        residus: 7
    }

    const concentreTotals = engine.calculateConcentreTotals(concentreRatings)
    console.log('Concentré totals:', concentreTotals)
}

// ============================================================================
// EXEMPLE 4: Soumission Complète avec Gestion d'Erreurs
// ============================================================================

export const submitReviewWithHandlingExample = async () => {
    const engine = new ReviewCompletionEngine()

    const reviewData = {
        type: PRODUCT_TYPES.FLEUR,
        holderName: 'OG Kush',
        cultivars: 'OG Kush',
        description: 'Une fleur exceptionnelle',
        ratings: {
            densite: 8,
            trichome: 9,
            pistil: 7,
            manucure: 8
        },
        terpenes: ['Myrcène', 'Limonène'],
        visibility: 'public',
        isDraft: false
    }

    // Valider d'abord
    const validation = engine.validateReview(reviewData)
    if (!validation.isValid) {
        console.error('Validation errors:', validation.errors)
        return
    }

    try {
        // Préparer les données
        const prepared = engine.prepareForSubmission(reviewData)
        console.log('Prepared data:', prepared)

        // Soumettre
        const result = await engine.submitReview(reviewData, [])
        console.log('Success:', result)

        return result.review.id
    } catch (error) {
        console.error('Submission failed:', error.message)
        // Gérer les différents types d'erreurs
        if (error.message.includes('timeout')) {
            console.error('La requête a dépassé le délai')
        } else if (error.message.includes('validation')) {
            console.error('Erreur de validation')
        } else {
            console.error('Erreur serveur')
        }
    }
}

// ============================================================================
// EXEMPLE 5: Duplication et Export
// ============================================================================

export const duplicateAndExportExample = async () => {
    const engine = new ReviewCompletionEngine()

    const sourceReview = {
        type: PRODUCT_TYPES.FLEUR,
        holderName: 'OG Kush #1',
        cultivars: 'OG Kush',
        ratings: {
            densite: 8,
            trichome: 9
        }
    }

    // Dupliquer
    const duplicated = engine.duplicateReview(sourceReview)
    console.log('Duplicated:', duplicated)
    // Output: { ...sourceReview, holderName: 'OG Kush #1 (Copie)', isDraft: true }

    // Exporter en JSON
    const json = await engine.exportAsJSON(duplicated)
    console.log('JSON export:', json)

    // Exporter en CSV
    const reviews = [sourceReview, duplicated]
    const csv = await engine.exportAsCSV(reviews)
    console.log('CSV export:', csv)
}

// ============================================================================
// EXEMPLE 6: Importation Bulk
// ============================================================================

export const importBulkExample = async (csvFile) => {
    const engine = new ReviewCompletionEngine()

    // Supposer que Papa.parse est disponible
    const text = await csvFile.text()
    const rows = text.split('\n').map(row => row.split(','))

    const reviews = rows.slice(1).map(row => ({
        type: row[0],
        holderName: row[1],
        description: row[2],
        ratings: JSON.parse(row[3] || '{}')
    }))

    // Valider en bulk
    const validationResults = await engine.validateBulk(reviews)

    const successful = validationResults.filter(r => r.validation.isValid)
    const failed = validationResults.filter(r => !r.validation.isValid)

    console.log(`✅ ${successful.length} reviews valides`)
    console.log(`❌ ${failed.length} reviews invalides`)

    // Soumettre les valides
    const results = []
    for (const { review } of successful) {
        try {
            const result = await engine.submitReview(review, [])
            results.push({ status: 'success', id: result.review.id })
        } catch (err) {
            results.push({ status: 'error', message: err.message })
        }
    }

    return { results, failed }
}

// ============================================================================
// EXEMPLE 7: Utilisation Hook React (Formulaire complet)
// ============================================================================

export const ReviewFormComponentExample = () => {
    const {
        reviewData,
        errors,
        completionPercentage,
        totals,
        isSubmitting,
        submitStatus,
        updateField,
        updateRating,
        toggleArrayItem,
        handleImageUpload,
        saveDraft,
        submitReview,
        validateForm
    } = useReviewCompletion(PRODUCT_TYPES.CONCENTRE)

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Valider
        if (!validateForm()) {
            alert('Veuillez corriger les erreurs')
            return
        }

        // Soumettre
        const result = await submitReview()

        if (result) {
            alert('Review publiée!')
            // Rediriger ou réinitialiser
        }
    }

    return (
        <form onSubmit={handleSubmit} className="review-form concentre-form">
            {/* Afficher le statut */}
            {submitStatus && (
                <div className={`status-message ${submitStatus.type}`}>
                    {submitStatus.message}
                </div>
            )}

            {/* Progression */}
            <div className="progress">
                <div className="bar" style={{ width: `${completionPercentage}%` }} />
                <span>{completionPercentage}%</span>
            </div>

            {/* Champs */}
            <input
                type="text"
                value={reviewData.holderName}
                onChange={(e) => updateField('holderName', e.target.value)}
                placeholder="Nom du concentré"
            />

            {/* Ratings concentré */}
            <div className="ratings-grid">
                {['couleur', 'viscosite', 'pureteVisuelle'].map(key => (
                    <div key={key}>
                        <label>{key}</label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            value={reviewData.ratings[key] || 0}
                            onChange={(e) => updateRating(key, e.target.value)}
                        />
                    </div>
                ))}
            </div>

            {/* Totaux */}
            {totals.global && <div className="global-score">Score: {totals.global}/10</div>}

            {/* Boutons */}
            <button type="button" onClick={saveDraft} disabled={isSubmitting}>
                Brouillon
            </button>
            <button type="submit" disabled={isSubmitting}>
                {isSubmitting ? '...' : 'Publier'}
            </button>
        </form>
    )
}

// ============================================================================
// EXEMPLE 8: Récupérer les choix pour un champ
// ============================================================================

export const getChoicesExample = () => {
    const engine = new ReviewCompletionEngine()

    // Pour Fleur
    const substrateChoices = engine.getChoicesForField(
        PRODUCT_TYPES.FLEUR,
        'substratSysteme'
    )
    console.log('Substrate choices:', substrateChoices)

    // Pour Concentré
    const extractionChoices = engine.getChoicesForField(
        PRODUCT_TYPES.CONCENTRE,
        'extractionSolvants'
    )
    console.log('Extraction choices:', extractionChoices)

    // Pour Comestible
    const dietChoices = engine.getChoicesForField(
        PRODUCT_TYPES.COMESTIBLE,
        'infoDiet'
    )
    console.log('Diet choices:', dietChoices)
}

// ============================================================================
// EXEMPLE 9: Comparaison Multi-Produits
// ============================================================================

export const compareReviewsExample = async (reviewIds) => {
    const engine = new ReviewCompletionEngine()

    // Récupérer les reviews
    const reviews = await Promise.all(
        reviewIds.map(id =>
            fetch(`/api/reviews/${id}`).then(r => r.json())
        )
    )

    // Préparer pour comparaison (radar chart)
    const comparison = {
        labels: reviews.map(r => r.holderName),
        datasets: [
            {
                label: 'Apparence',
                data: reviews.map(r => r.ratings?.densite || r.ratings?.apparence || 0)
            },
            {
                label: 'Arôme',
                data: reviews.map(r => r.ratings?.intensiteOdeur || r.ratings?.intensiteAromatique || 0)
            },
            {
                label: 'Goût',
                data: reviews.map(r => r.ratings?.intensiteFumee || r.ratings?.gout || 0)
            },
            {
                label: 'Texture',
                data: reviews.map(r => r.ratings?.durete || r.ratings?.texture || 0)
            },
            {
                label: 'Effet',
                data: reviews.map(r => r.ratings?.intensiteEffet || r.ratings?.intensiteMax || 0)
            }
        ]
    }

    return comparison
}

// ============================================================================
// EXEMPLE 10: Édition d'une Review Existante
// ============================================================================

export const editReviewExample = () => {
    const {
        loadReview,
        updateRating,
        submitReview
    } = useReviewCompletion(PRODUCT_TYPES.FLEUR)

    // Charger une review existante
    const loadExisting = async (reviewId) => {
        const response = await fetch(`/api/reviews/${reviewId}`)
        const review = await response.json()

        loadReview(review)
    }

    // Modifier et soumettre
    const editAndUpdate = async (reviewId, newRating) => {
        await loadExisting(reviewId)

        // Modifier un rating
        updateRating('densite', newRating)

        // Soumettre la mise à jour
        const result = await submitReview()
        return result
    }

    return { loadExisting, editAndUpdate }
}

export default {
    ReviewFleurExample,
    validateReviewExample,
    calculateTotalsExample,
    submitReviewWithHandlingExample,
    duplicateAndExportExample,
    importBulkExample,
    ReviewFormComponentExample,
    getChoicesExample,
    compareReviewsExample,
    editReviewExample
}
