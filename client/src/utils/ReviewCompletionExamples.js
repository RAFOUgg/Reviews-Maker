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
