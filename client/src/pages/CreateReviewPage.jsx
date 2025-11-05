import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import useReviewCompletion from '../hooks/useReviewCompletion'

export default function CreateReviewPage() {
    const navigate = useNavigate()
    const { user, isAuthenticated } = useStore()
    const [productType, setProductType] = useState('Fleur')
    const [showTypeSelector, setShowTypeSelector] = useState(!productType)

    const {
        reviewData,
        errors,
        uploadedFiles,
        completionPercentage,
        totals,
        isSubmitting,
        submitStatus,
        updateField,
        updateRating,
        toggleArrayItem,
        handleImageUpload,
        removeImage,
        validateForm,
        saveDraft,
        submitReview
    } = useReviewCompletion()

    // ✅ Vérifier l'authentification
    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/')
        }
    }, [isAuthenticated, navigate])

    const productTypes = ['Fleur', 'Hash', 'Concentré', 'Comestible']

    const handleSelectType = (type) => {
        setProductType(type)
        setShowTypeSelector(false)
        updateField('type', type)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Valider le formulaire
        if (!validateForm()) {
            console.error('Form validation failed')
            return
        }

        // Soumettre
        await submitReview()

        // Rediriger si succès
        if (submitStatus?.type === 'success') {
            setTimeout(() => navigate('/'), 2000)
        }
    }

    const handleSaveDraft = async () => {
        await saveDraft()
    }

    if (!isAuthenticated) {
        return null
    }

    return (
        <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h1 className="text-4xl font-bold text-dark-text">Créer une Review</h1>
                <p className="text-dark-muted">Remplissez les détails de votre produit cannabis</p>
                <div className="h-2 bg-gradient-to-r from-primary-600 to-primary-400 rounded-full w-1/3" />
            </div>

            {/* Barre de progression */}
            <div className="bg-dark-card rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-dark-text font-medium">Progression: {completionPercentage}%</span>
                    <span className="text-dark-muted">{Object.keys(reviewData).filter(k => reviewData[k]).length} champs complétés</span>
                </div>
                <div className="w-full bg-dark-bg rounded-full h-3 overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary-600 to-primary-400 transition-all duration-300"
                        style={{ width: `${completionPercentage}%` }}
                    />
                </div>
            </div>

            {/* Sélecteur de type de produit */}
            {showTypeSelector && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {productTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => handleSelectType(type)}
                            className="glass rounded-xl p-6 text-center hover:bg-primary-600/20 transition-colors space-y-2"
                        >
                            <div className="text-3xl">
                                {type === 'Fleur' && '🌿'}
                                {type === 'Hash' && '🟫'}
                                {type === 'Concentré' && '🔮'}
                                {type === 'Comestible' && '🍰'}
                            </div>
                            <h3 className="font-semibold text-dark-text">{type}</h3>
                            <p className="text-sm text-dark-muted">
                                {type === 'Fleur' && 'Fleur de cannabis'}
                                {type === 'Hash' && 'Concentré par extraction'}
                                {type === 'Concentré' && 'Produit hautement concentré'}
                                {type === 'Comestible' && 'Produit comestible infusé'}
                            </p>
                        </button>
                    ))}
                </div>
            )}

            {/* Formulaire */}
            {productType && !showTypeSelector && (
                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Informations générales */}
                    <section className="glass rounded-xl p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-dark-text">Informations générales</h2>

                        {/* Nom du produit */}
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Nom du produit
                            </label>
                            <input
                                type="text"
                                placeholder="Ex: Blue Dream, Sour Diesel..."
                                value={reviewData.holderName || ''}
                                onChange={(e) => updateField('holderName', e.target.value)}
                                className={`w-full px-4 py-2 rounded-lg bg-dark-bg border ${errors.holderName ? 'border-red-500' : 'border-dark-border'
                                    } text-dark-text placeholder-dark-muted focus:outline-none focus:border-primary-600 transition-colors`}
                            />
                            {errors.holderName && (
                                <p className="text-red-500 text-sm mt-1">{errors.holderName}</p>
                            )}
                        </div>

                        {/* Photo */}
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Photo du produit
                            </label>
                            <div className="relative">
                                <div className="flex gap-2">
                                    <input
                                        type="file"
                                        id="photo-input"
                                        multiple
                                        accept="image/*"
                                        onChange={(e) => handleImageUpload(Array.from(e.target.files))}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => document.getElementById('photo-input').click()}
                                        className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                    >
                                        📸 Ajouter des photos
                                    </button>
                                </div>

                                {/* Aperçu des photos */}
                                {uploadedFiles.length > 0 && (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                                        {uploadedFiles.map((file, idx) => (
                                            <div key={idx} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Upload ${idx}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(idx)}
                                                    className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-sm font-medium text-dark-text mb-2">
                                Description
                            </label>
                            <textarea
                                placeholder="Décrivez votre expérience..."
                                value={reviewData.description || ''}
                                onChange={(e) => updateField('description', e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-text placeholder-dark-muted focus:outline-none focus:border-primary-600 transition-colors resize-none"
                            />
                        </div>
                    </section>

                    {/* Ratings / Scores */}
                    <section className="glass rounded-xl p-6 space-y-4">
                        <h2 className="text-2xl font-bold text-dark-text">Scores</h2>
                        <p className="text-dark-muted text-sm">Évaluez les différents aspects sur 0-10</p>

                        {/* Note: En production, vous créeriez des composants pour chaque type de produit */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.entries(reviewData.ratings || {}).map(([key, value]) => (
                                <div key={key}>
                                    <label className="block text-sm font-medium text-dark-text mb-2 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="range"
                                            min="0"
                                            max="10"
                                            value={value || 0}
                                            onChange={(e) => updateRating(key, parseInt(e.target.value))}
                                            className="flex-1"
                                        />
                                        <span className="text-dark-text font-bold w-8 text-center">{value || 0}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Totals */}
                        {totals && Object.keys(totals).length > 0 && (
                            <div className="mt-6 pt-6 border-t border-dark-border">
                                <h3 className="text-lg font-semibold text-dark-text mb-3">Totaux calculés</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {Object.entries(totals).map(([section, total]) => (
                                        <div key={section} className="bg-dark-bg rounded-lg p-3">
                                            <p className="text-dark-muted text-xs uppercase">{section}</p>
                                            <p className="text-2xl font-bold text-primary-600">{total}/10</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    {/* Messages de statut */}
                    {submitStatus && (
                        <div
                            className={`rounded-lg p-4 ${submitStatus.type === 'success'
                                ? 'bg-green-900/30 border border-green-600 text-green-400'
                                : 'bg-red-900/30 border border-red-600 text-red-400'
                                }`}
                        >
                            {submitStatus.message}
                        </div>
                    )}

                    {/* Erreurs générales */}
                    {Object.keys(errors).length > 0 && !submitStatus && (
                        <div className="bg-red-900/30 border border-red-600 rounded-lg p-4 text-red-400">
                            <p className="font-semibold mb-2">Erreurs dans le formulaire:</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                                {Object.entries(errors).map(([field, error]) => (
                                    <li key={field}>{error}</li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Boutons */}
                    <div className="flex gap-4 justify-end pt-6 border-t border-dark-border">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-6 py-2 rounded-lg bg-dark-bg border border-dark-border text-dark-text hover:bg-dark-border transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            type="button"
                            onClick={handleSaveDraft}
                            disabled={isSubmitting}
                            className="px-6 py-2 rounded-lg bg-dark-border text-dark-text hover:bg-dark-border/70 transition-colors disabled:opacity-50"
                        >
                            💾 Brouillon
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting || completionPercentage < 50}
                            className="px-6 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isSubmitting ? '⏳ Envoi...' : '✅ Publier la Review'}
                        </button>
                    </div>
                </form>
            )}
        </div>
    )
}
