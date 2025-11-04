import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { productStructures, calculateSectionTotal } from '../utils/productStructures'

export default function CreateReviewPage() {
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()
    const { isAuthenticated, user } = useStore()

    const typeFromUrl = searchParams.get('type') || 'Fleur'

    const [formData, setFormData] = useState({
        holderName: '',
        type: typeFromUrl,
        description: '',
        overallRating: 5
    })

    useEffect(() => {
        if (typeFromUrl) {
            setFormData(prev => ({ ...prev, type: typeFromUrl }))
        }
    }, [typeFromUrl])
    const [images, setImages] = useState([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState('')

    // États pour l'aperçu et les paramètres
    const [showPreview, setShowPreview] = useState(false) // Masqué par défaut
    const [previewStyle, setPreviewStyle] = useState('compact') // compact, detaille, resume, jolie, instagram, mobile
    const [showSaveModal, setShowSaveModal] = useState(false)
    const [saveSettings, setSaveSettings] = useState({
        isPublic: true,
        displayStyle: 'compact'
    })

    // États pour la navigation par section
    const [typeSelected, setTypeSelected] = useState(!!typeFromUrl) // Verrouillage du type après sélection
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0)

    // Obtenir la structure du produit actuel
    const currentStructure = productStructures[formData.type] || productStructures.Fleur
    const currentSection = currentStructure.sections[currentSectionIndex]

    if (!isAuthenticated) {
        navigate('/')
        return null
    }

    const productTypes = ['Fleur', 'Hash', 'Concentre', 'Comestible']

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
        setError('')
    }

    const handleTypeSelection = (type) => {
        if (!typeSelected) {
            setFormData(prev => ({ ...prev, type }))
            setTypeSelected(true)
        }
    }

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files)
        setImages(prev => [...prev, ...files])
    }

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index))
    }

    const goToNextSection = () => {
        if (currentSectionIndex < currentStructure.sections.length - 1) {
            setCurrentSectionIndex(prev => prev + 1)
        }
    }

    const goToPreviousSection = () => {
        if (currentSectionIndex > 0) {
            setCurrentSectionIndex(prev => prev - 1)
        }
    }

    const goToSection = (index) => {
        setCurrentSectionIndex(index)
    }

    const handleOpenSaveModal = (e) => {
        e.preventDefault()
        setError('')

        if (!formData.holderName.trim()) {
            setError('Le nom du produit est requis')
            return
        }

        setShowSaveModal(true)
    }

    const handleSubmit = async () => {
        setError('')
        setIsSubmitting(true)

        try {
            const submitData = new FormData()
            submitData.append('holderName', formData.holderName)
            submitData.append('type', formData.type)
            submitData.append('description', formData.description || '')
            submitData.append('overallRating', formData.overallRating)
            submitData.append('isPublic', saveSettings.isPublic)
            submitData.append('displayStyle', saveSettings.displayStyle)

            images.forEach((image) => {
                submitData.append('images', image)
            })

            const response = await fetch('/api/reviews', {
                method: 'POST',
                credentials: 'include',
                body: submitData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || 'Erreur lors de la creation')
            }

            const result = await response.json()
            console.log('Review creee:', result)
            navigate('/')
        } catch (err) {
            console.error('Erreur:', err)
            setError(err.message || 'Une erreur est survenue')
        } finally {
            setIsSubmitting(false)
            setShowSaveModal(false)
        }
    }

    const previewStyles = [
        { id: 'compact', name: 'Compact', icon: '📦', desc: 'Vue miniature simple' },
        { id: 'detaille', name: 'Détaillé', icon: '📋', desc: 'Toutes les infos visibles' },
        { id: 'resume', name: 'Résumé', icon: '📝', desc: 'Vue condensée' },
        { id: 'jolie', name: 'Jolie', icon: '✨', desc: 'Design élégant' },
        { id: 'instagram', name: 'Post Insta', icon: '📸', desc: 'Format carré' },
        { id: 'mobile', name: 'Format Mobile', icon: '📱', desc: 'Optimisé téléphone' }
    ]

    const renderPreview = () => {
        const previewImages = images.map(img => URL.createObjectURL(img))
        const rating = formData.overallRating || 0

        switch (previewStyle) {
            case 'compact':
                return (
                    <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-2xl overflow-hidden border border-gray-700 max-w-xs mx-auto">
                        <div className="relative aspect-square bg-gray-900">
                            {previewImages.length > 0 ? (
                                <img src={previewImages[0]} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-6xl opacity-20">
                                    {formData.type === 'Fleur' ? '🌿' : formData.type === 'Hash' ? '🟫' : formData.type === 'Concentré' ? '🔮' : '🍰'}
                                </div>
                            )}
                            <div className="absolute top-2 left-2 px-2 py-1 bg-green-600 rounded-lg text-white text-sm font-bold">
                                {rating}/10
                            </div>
                        </div>
                        <div className="p-3">
                            <h3 className="text-white font-bold">{formData.holderName || 'Nom du produit'}</h3>
                            <p className="text-gray-400 text-xs">{formData.type}</p>
                        </div>
                    </div>
                )

            case 'detaille':
                return (
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 max-w-md mx-auto">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="text-4xl">
                                {formData.type === 'Fleur' ? '🌿' : formData.type === 'Hash' ? '🟫' : formData.type === 'Concentré' ? '🔮' : '🍰'}
                            </div>
                            <div className="flex-1">
                                <h3 className="text-white font-black text-xl">{formData.holderName || 'Nom du produit'}</h3>
                                <p className="text-purple-400 text-sm">{formData.type}</p>
                            </div>
                            <div className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-black text-lg">
                                {rating}/10
                            </div>
                        </div>
                        {formData.description && (
                            <p className="text-gray-300 text-sm mb-4">{formData.description}</p>
                        )}
                        {previewImages.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {previewImages.slice(0, 3).map((img, idx) => (
                                    <img key={idx} src={img} alt={`Preview ${idx}`} className="w-full h-20 object-cover rounded-lg" />
                                ))}
                            </div>
                        )}
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <div className="text-xs text-gray-500">Créé par {user?.username || 'Vous'}</div>
                        </div>
                    </div>
                )

            case 'resume':
                return (
                    <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 max-w-sm mx-auto">
                        <div className="flex items-center gap-3">
                            <div className="w-16 h-16 rounded-lg bg-gray-900 flex items-center justify-center overflow-hidden">
                                {previewImages.length > 0 ? (
                                    <img src={previewImages[0]} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="text-2xl opacity-30">
                                        {formData.type === 'Fleur' ? '🌿' : formData.type === 'Hash' ? '🟫' : formData.type === 'Concentré' ? '🔮' : '🍰'}
                                    </span>
                                )}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-white font-bold text-sm">{formData.holderName || 'Nom du produit'}</h4>
                                <p className="text-gray-400 text-xs">{formData.type}</p>
                            </div>
                            <div className="px-3 py-1 bg-green-600 rounded-full text-white text-sm font-bold">
                                {rating}
                            </div>
                        </div>
                    </div>
                )

            case 'jolie':
                return (
                    <div className="relative bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-red-900/50 rounded-3xl p-6 border-2 border-purple-500/30 max-w-md mx-auto backdrop-blur-xl">
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-3xl"></div>
                        <div className="relative">
                            {previewImages.length > 0 && (
                                <div className="mb-4 rounded-2xl overflow-hidden shadow-2xl">
                                    <img src={previewImages[0]} alt="Preview" className="w-full h-48 object-cover" />
                                </div>
                            )}
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-xl rounded-full mb-3">
                                    <span className="text-2xl">
                                        {formData.type === 'Fleur' ? '🌿' : formData.type === 'Hash' ? '🟫' : formData.type === 'Concentré' ? '🔮' : '🍰'}
                                    </span>
                                    <span className="text-purple-300 text-sm font-semibold">{formData.type}</span>
                                </div>
                                <h3 className="text-white font-black text-2xl mb-2">{formData.holderName || 'Nom du produit'}</h3>
                                <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl">
                                    <span className="text-white font-black text-xl">{rating}</span>
                                    <span className="text-white/80 text-sm">/10</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )

            case 'instagram':
                return (
                    <div className="bg-white rounded-none max-w-sm mx-auto shadow-2xl">
                        <div className="p-3 flex items-center gap-2 border-b border-gray-200">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
                                {(user?.username || 'U')[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{user?.username || 'username'}</span>
                        </div>
                        <div className="aspect-square bg-gray-100">
                            {previewImages.length > 0 ? (
                                <img src={previewImages[0]} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex items-center justify-center h-full text-6xl opacity-20">
                                    {formData.type === 'Fleur' ? '🌿' : formData.type === 'Hash' ? '🟫' : formData.type === 'Concentré' ? '🔮' : '🍰'}
                                </div>
                            )}
                        </div>
                        <div className="p-3">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">❤️</span>
                                <span className="text-2xl">💬</span>
                                <span className="text-2xl">📤</span>
                            </div>
                            <div className="text-sm text-gray-900">
                                <span className="font-semibold">{formData.holderName || 'Nom du produit'}</span>
                                {' '}{formData.type} • {rating}/10 ⭐
                            </div>
                            {formData.description && (
                                <p className="text-xs text-gray-600 mt-1">{formData.description}</p>
                            )}
                        </div>
                    </div>
                )

            case 'mobile':
                return (
                    <div className="bg-gray-900 rounded-3xl overflow-hidden max-w-xs mx-auto shadow-2xl">
                        {previewImages.length > 0 && (
                            <div className="h-64 overflow-hidden">
                                <img src={previewImages[0]} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="text-3xl">
                                        {formData.type === 'Fleur' ? '🌿' : formData.type === 'Hash' ? '🟫' : formData.type === 'Concentré' ? '🔮' : '🍰'}
                                    </span>
                                    <div>
                                        <h4 className="text-white font-bold text-lg">{formData.holderName || 'Nom du produit'}</h4>
                                        <p className="text-gray-400 text-xs">{formData.type}</p>
                                    </div>
                                </div>
                                <div className="px-4 py-2 bg-green-600 rounded-xl text-white font-bold">
                                    {rating}
                                </div>
                            </div>
                            {formData.description && (
                                <p className="text-gray-300 text-sm line-clamp-3">{formData.description}</p>
                            )}
                        </div>
                    </div>
                )

            default:
                return null
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">Créer une Review</h1>
                        <p className="text-gray-400">Partagez votre expérience avec la communauté</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShowPreview(!showPreview)}
                        className="flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-medium transition-all border border-gray-700"
                    >
                        <span className="text-xl">{showPreview ? '👁️' : '🔍'}</span>
                        <span>{showPreview ? 'Masquer l\'aperçu' : 'Afficher l\'aperçu'}</span>
                    </button>
                </div>

                <div className={`grid gap-8 ${showPreview ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Formulaire */}
                    <form onSubmit={handleOpenSaveModal} className={`bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700 ${!showPreview ? 'max-w-3xl mx-auto w-full' : ''}`}>
                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-3">
                                Type de produit
                                {typeSelected && <span className="ml-2 text-xs text-green-400">✓ Sélectionné</span>}
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {productTypes.map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => handleTypeSelection(type)}
                                        disabled={typeSelected && formData.type !== type}
                                        className={`p-4 rounded-xl text-center transition-all ${formData.type === type
                                                ? 'bg-green-600 text-white shadow-lg shadow-green-600/50'
                                                : typeSelected
                                                    ? 'bg-gray-800/50 text-gray-600 cursor-not-allowed opacity-50'
                                                    : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700 cursor-pointer'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">
                                            {type === 'Fleur' && String.fromCodePoint(0x1F33F)}
                                            {type === 'Hash' && String.fromCodePoint(0x1F7EB)}
                                            {type === 'Concentre' && String.fromCodePoint(0x1F52E)}
                                            {type === 'Comestible' && String.fromCodePoint(0x1F370)}
                                        </div>
                                        <div className="text-xs font-medium">{type}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nom du produit *</label>
                            <input
                                type="text"
                                placeholder="Ex: Blue Dream, Sour Diesel..."
                                value={formData.holderName}
                                onChange={(e) => handleInputChange('holderName', e.target.value)}
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Note globale: {formData.overallRating}/10
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={formData.overallRating}
                                onChange={(e) => handleInputChange('overallRating', parseFloat(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0</span>
                                <span>5</span>
                                <span>10</span>
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                            <textarea
                                placeholder="Decrivez votre experience..."
                                value={formData.description}
                                onChange={(e) => handleInputChange('description', e.target.value)}
                                rows="4"
                                className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20 transition-all resize-none"
                            />
                        </div>

                        {/* Navigation entre les sections */}
                        {typeSelected && (
                            <>
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-xl font-bold text-white">Questions détaillées</h3>
                                        <span className="text-sm text-gray-400">
                                            Section {currentSectionIndex + 1} / {currentStructure.sections.length}
                                        </span>
                                    </div>

                                    {/* Indicateur de progression */}
                                    <div className="flex gap-2 mb-6">
                                        {currentStructure.sections.map((_, idx) => (
                                            <button
                                                key={idx}
                                                type="button"
                                                onClick={() => goToSection(idx)}
                                                className={`flex-1 h-2 rounded-full transition-all ${idx === currentSectionIndex
                                                        ? 'bg-green-600 shadow-lg shadow-green-600/50'
                                                        : idx < currentSectionIndex
                                                            ? 'bg-green-800 hover:bg-green-700 cursor-pointer'
                                                            : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Section actuelle */}
                                <div className="mb-8 p-6 bg-gray-900/30 rounded-xl border border-gray-700/50">
                                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                        <span className="text-green-500">▸</span>
                                        {currentSection.title}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {currentSection.fields.map((field, fieldIdx) => (
                                            <div key={fieldIdx} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    {field.label}
                                                    {field.required && <span className="text-red-400 ml-1">*</span>}
                                                </label>

                                                {field.type === 'text' && (
                                                    <input
                                                        type="text"
                                                        value={formData[field.key] || ''}
                                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                        required={field.required}
                                                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20 transition-all"
                                                    />
                                                )}

                                                {field.type === 'number' && (
                                                    <div>
                                                        <input
                                                            type="range"
                                                            min={field.min}
                                                            max={field.max}
                                                            step={field.step}
                                                            value={formData[field.key] || 0}
                                                            onChange={(e) => handleInputChange(field.key, parseFloat(e.target.value))}
                                                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-green-600"
                                                        />
                                                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                            <span>{field.min}</span>
                                                            <span className="text-green-400 font-bold">{formData[field.key] || 0}</span>
                                                            <span>{field.max}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {field.type === 'select' && (
                                                    <select
                                                        value={formData[field.key] || ''}
                                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20 transition-all"
                                                    >
                                                        <option value="">Sélectionner...</option>
                                                        {field.choices.map((choice, idx) => (
                                                            <option key={idx} value={choice}>{choice}</option>
                                                        ))}
                                                    </select>
                                                )}

                                                {field.type === 'textarea' && (
                                                    <textarea
                                                        value={formData[field.key] || ''}
                                                        onChange={(e) => handleInputChange(field.key, e.target.value)}
                                                        rows="3"
                                                        className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600/20 transition-all resize-none"
                                                    />
                                                )}

                                                {field.type === 'boolean' && (
                                                    <label className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData[field.key] || false}
                                                            onChange={(e) => handleInputChange(field.key, e.target.checked)}
                                                            className="w-5 h-5 rounded bg-gray-900/50 border-gray-700 text-green-600 focus:ring-green-600"
                                                        />
                                                        <span className="text-sm text-gray-300">Oui</span>
                                                    </label>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {section.total && (
                                        <div className="mt-4 pt-4 border-t border-gray-700/50">
                                            {(() => {
                                                const total = calculateSectionTotal(currentSection, formData)
                                                return total ? (
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-400">Total de la section:</span>
                                                        <div className="flex gap-4">
                                                            <span className="text-white font-bold">Somme: {total.total}</span>
                                                            <span className="text-green-400 font-bold">Moyenne: {total.average}/10</span>
                                                        </div>
                                                    </div>
                                                ) : null
                                            })()}
                                        </div>
                                    )}

                                    {/* Boutons de navigation */}
                                    <div className="flex gap-3 mt-6">
                                        <button
                                            type="button"
                                            onClick={goToPreviousSection}
                                            disabled={currentSectionIndex === 0}
                                            className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            ← Précédent
                                        </button>
                                        <button
                                            type="button"
                                            onClick={goToNextSection}
                                            disabled={currentSectionIndex === currentStructure.sections.length - 1}
                                            className="flex-1 py-3 px-6 bg-green-700 hover:bg-green-600 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Suivant →
                                        </button>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-300 mb-2">Photos</label>
                            <input
                                type="file"
                                id="image-upload"
                                multiple
                                accept="image/*"
                                onChange={handleImageChange}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => document.getElementById('image-upload').click()}
                                className="w-full py-3 px-4 bg-gray-700/50 hover:bg-gray-700 border-2 border-dashed border-gray-600 rounded-xl text-gray-300 transition-colors"
                            >
                                Ajouter des photos
                            </button>

                            {images.length > 0 && (
                                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-4">
                                    {images.map((image, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={URL.createObjectURL(image)}
                                                alt={`Preview ${index}`}
                                                className="w-full h-24 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                                            >
                                                &times;
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full py-3 px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-bold shadow-lg shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                💾 Enregistrer
                            </button>
                        </div>
                    </form>

                    {/* Section Aperçu - Conditionnelle */}
                    {showPreview && (
                        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-gray-700 lg:sticky lg:top-8">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-white">👁️ Aperçu en temps réel</h2>
                            </div>

                            {true && (
                                <>
                                    {/* Sélecteur de style */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-gray-300 mb-3">Style d'affichage</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            {previewStyles.map((style) => (
                                                <button
                                                    key={style.id}
                                                    type="button"
                                                    onClick={() => setPreviewStyle(style.id)}
                                                    className={`p-3 rounded-xl text-left transition-all ${previewStyle === style.id
                                                        ? 'bg-green-600 text-white shadow-lg shadow-green-600/50'
                                                        : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-xl">{style.icon}</span>
                                                        <span className="font-semibold text-sm">{style.name}</span>
                                                    </div>
                                                    <p className="text-xs opacity-75">{style.desc}</p>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Aperçu de la review */}
                                    <div className="bg-gray-900/50 rounded-xl p-6 min-h-[400px] flex items-center justify-center">
                                        {renderPreview()}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal de sauvegarde */}
                {showSaveModal && (
                    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl border border-gray-700">
                            <h2 className="text-2xl font-bold text-white mb-6">💾 Paramètres d'enregistrement</h2>

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                    {error}
                                </div>
                            )}

                            {/* Visibilité */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-3">Visibilité</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setSaveSettings(prev => ({ ...prev, isPublic: true }))}
                                        className={`p-4 rounded-xl text-center transition-all ${saveSettings.isPublic
                                            ? 'bg-green-600 text-white shadow-lg shadow-green-600/50'
                                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🌍</div>
                                        <div className="font-semibold text-sm">Public</div>
                                        <div className="text-xs opacity-75">Visible dans la galerie</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setSaveSettings(prev => ({ ...prev, isPublic: false }))}
                                        className={`p-4 rounded-xl text-center transition-all ${!saveSettings.isPublic
                                            ? 'bg-orange-600 text-white shadow-lg shadow-orange-600/50'
                                            : 'bg-gray-700/50 text-gray-300 hover:bg-gray-700'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🔒</div>
                                        <div className="font-semibold text-sm">Privé</div>
                                        <div className="text-xs opacity-75">Bibliothèque personnelle</div>
                                    </button>
                                </div>
                            </div>

                            {/* Format d'affichage */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-300 mb-3">
                                    Format d'affichage dans la galerie
                                </label>
                                <select
                                    value={saveSettings.displayStyle}
                                    onChange={(e) => setSaveSettings(prev => ({ ...prev, displayStyle: e.target.value }))}
                                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20"
                                >
                                    {previewStyles.map((style) => (
                                        <option key={style.id} value={style.id}>
                                            {style.icon} {style.name} - {style.desc}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Boutons */}
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowSaveModal(false)}
                                    className="flex-1 py-3 px-6 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-colors"
                                    disabled={isSubmitting}
                                >
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white rounded-xl font-bold shadow-lg shadow-green-600/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? '⏳ Enregistrement...' : '✅ Confirmer'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
