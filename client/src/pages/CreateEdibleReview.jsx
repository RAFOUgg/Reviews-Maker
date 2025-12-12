import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Eye, Upload, X, Plus, Trash2 } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import OrchardPanel from '../components/orchard/OrchardPanel'
import { AnimatePresence, motion } from 'framer-motion'
import { edibleReviewsService } from '../services/apiService'

/**
 * CreateEdibleReview - Interface pour créer/éditer une review de Comestible
 * Types: Gâteaux, Cookies, Bonbons, Boissons, Chocolats, etc.
 * Sections: Infos, Recette, Goûts, Effets
 */
export default function CreateEdibleReview() {
    const navigate = useNavigate()
    const toast = useToast()
    const { id } = useParams()
    const [searchParams] = useSearchParams()
    const { user, isAuthenticated } = useStore()

    const [formData, setFormData] = useState({})
    const [photos, setPhotos] = useState([])
    const [currentSection, setCurrentSection] = useState(0)
    const [showOrchard, setShowOrchard] = useState(false)
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(!!id)
    const scrollContainerRef = useRef(null)

    // Définition des 4 sections spécifiques aux Comestibles
    const sections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'recette', icon: '🥘', title: 'Pipeline Recette' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effets', icon: '💥', title: 'Effets' }
    ]

    const scrollToSection = (index) => {
        setCurrentSection(index)
        if (scrollContainerRef.current) {
            const buttons = scrollContainerRef.current.children
            const button = buttons[index]
            if (button) {
                button.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
            }
        }
    }

    const handlePrevious = () => {
        if (currentSection > 0) scrollToSection(currentSection - 1)
    }

    const handleNext = () => {
        if (currentSection < sections.length - 1) scrollToSection(currentSection + 1)
    }

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handlePhotoUpload = (e) => {
        const files = Array.from(e.target.files)
        const remaining = 4 - photos.length
        if (files.length > remaining) {
            toast.warning(`Maximum 4 photos. ${remaining} emplacement(s) restant(s).`)
            return
        }
        const newPhotos = files.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            existing: false
        }))
        setPhotos(prev => [...prev, ...newPhotos])
    }

    const removePhoto = (index) => {
        setPhotos(prev => {
            const photo = prev[index]
            if (photo && !photo.existing && photo.preview) {
                URL.revokeObjectURL(photo.preview)
            }
            return prev.filter((_, i) => i !== index)
        })
    }

    const handleSubmit = async () => {
        if (!formData.nomProduit) {
            toast.error('Le nom du produit est requis')
            scrollToSection(0)
            return
        }
        if (photos.length === 0) {
            toast.error('Au moins 1 photo est requise')
            scrollToSection(0)
            return
        }

        setSaving(true)
        try {
            // Créer FormData pour l'upload
            const submitData = new FormData()
            
            // Ajouter les photos
            photos.forEach((photo) => {
                if (photo.file) {
                    submitData.append('images', photo.file)
                }
            })
            
            // Ajouter les données du formulaire
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (typeof value === 'object') {
                        submitData.append(key, JSON.stringify(value))
                    } else {
                        submitData.append(key, value)
                    }
                }
            })
            
            // Soumettre au backend
            if (id) {
                await edibleReviewsService.update(id, submitData)
                toast.success('Review Comestible mise à jour!')
            } else {
                await edibleReviewsService.create(submitData)
                toast.success('Review Comestible créée avec succès!')
            }
            navigate('/library')
        } catch (error) {
            console.error('Erreur soumission:', error)
            toast.error(error.message || 'Erreur lors de l\'enregistrement')
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(99, 102, 241) 100%)' }}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                    <p className="text-white">Chargement...</p>
                </div>
            </div>
        )
    }

    const currentSectionData = sections[currentSection]
    const progress = ((currentSection + 1) / sections.length) * 100

    return (
        <div className="min-h-screen pb-20" style={{ background: 'linear-gradient(135deg, rgb(139, 92, 246) 0%, rgb(99, 102, 241) 100%)' }}>
            {/* Header fixe */}
            <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/30 shadow-xl shadow-purple-900/20">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-extrabold text-white drop-shadow-2xl tracking-tight">
                            {id ? '✏️ Modifier la review Comestible' : '✨ Créer une review Comestible'}
                        </h1>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowOrchard(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-all backdrop-blur-sm border border-white/30 hover:shadow-lg hover:shadow-white/20"
                            >
                                <Eye className="w-4 h-4" />
                                Aperçu
                            </button>
                            <div className="text-sm text-white/90 font-medium">
                                {currentSection + 1} / {sections.length}
                            </div>
                        </div>
                    </div>

                    {/* Barre de progression */}
                    <div className="w-full bg-white/10 rounded-full h-3 backdrop-blur-sm overflow-hidden shadow-inner">
                        <div
                            className="bg-gradient-to-r from-white via-purple-200 to-white h-3 rounded-full transition-all duration-500 ease-out shadow-lg shadow-white/60 relative"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation sections avec flèches */}
            <div className="sticky top-[100px] z-40 bg-white/5 backdrop-blur-xl border-b border-white/20 shadow-lg shadow-purple-900/10">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex items-center gap-3 py-4">
                        <button
                            onClick={handlePrevious}
                            disabled={currentSection === 0}
                            className="flex-shrink-0 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        <div className="flex-1 overflow-x-auto scrollbar-hide">
                            <div ref={scrollContainerRef} className="flex gap-2 min-w-max">
                                {sections.map((section, index) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(index)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${index === currentSection
                                            ? 'bg-white text-purple-600 shadow-lg shadow-white/50 scale-105 glow-effect'
                                            : index < currentSection
                                                ? 'bg-white/60 text-purple-900 border border-white/30'
                                                : 'bg-white/50 text-purple-900 border border-white/30 hover:bg-white/70'
                                            }`}
                                    >
                                        <span className="mr-2">{section.icon}</span>
                                        {section.title}
                                        {section.required && <span className="text-red-400 ml-1">*</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={handleNext}
                            disabled={currentSection === sections.length - 1}
                            className="flex-shrink-0 p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-lg"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenu principal */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.98 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="bg-white/98 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border-2 border-white/40 hover:shadow-purple-500/20 transition-shadow"
                    >
                        <h2 className="text-2xl font-semibold text-purple-900 mb-6 flex items-center gap-3">
                            <span className="text-4xl">{currentSectionData.icon}</span>
                            {currentSectionData.title}
                            {currentSectionData.required && <span className="text-red-500">*</span>}
                        </h2>

                        {currentSection === 0 && (
                            <InfosGenerales
                                data={formData}
                                photos={photos}
                                onChange={handleChange}
                                onPhotoUpload={handlePhotoUpload}
                                onPhotoRemove={removePhoto}
                            />
                        )}
                        {currentSection === 1 && (
                            <PipelineRecette data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 2 && (
                            <Gouts data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 3 && (
                            <Effets data={formData} onChange={handleChange} />
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Boutons navigation */}
                <div className="flex items-center justify-between mt-6">
                    <button
                        onClick={handlePrevious}
                        disabled={currentSection === 0}
                        className="flex items-center gap-2 px-6 py-3 bg-white/80 text-purple-700 rounded-xl hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Précédent
                    </button>

                    <div className="flex gap-3">
                        {currentSection === sections.length - 1 ? (
                            <button
                                onClick={handleSubmit}
                                disabled={saving}
                                className="flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl font-bold"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Enregistrement...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        {id ? 'Mettre à jour' : 'Publier'}
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                onClick={handleNext}
                                className="flex items-center gap-2 px-8 py-3 bg-white text-purple-700 rounded-xl hover:bg-white/90 transition-all shadow-lg hover:shadow-xl font-bold"
                            >
                                Suivant
                                <ChevronRight className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal Orchard */}
            <AnimatePresence>
                {showOrchard && (
                    <OrchardPanel
                        reviewData={{
                            type: 'Comestible',
                            holderName: formData.nomProduit || '',
                            rating: formData.globalRating || 0,
                            imageUrl: photos.length > 0 ? photos[0].preview || photos[0].url : undefined,
                            images: photos.map(p => p.preview || p.url).filter(Boolean)
                        }}
                        onClose={() => setShowOrchard(false)}
                        onPresetApplied={(orchardData) => {
                            handleChange('orchardConfig', JSON.stringify(orchardData.orchardConfig))
                            handleChange('orchardPreset', orchardData.orchardPreset)
                            toast.success('✅ Aperçu défini avec succès !')
                        }}
                    />
                )}
            </AnimatePresence>
        </div>
    )
}

// Section 1: Informations générales
function InfosGenerales({ data, photos, onChange, onPhotoUpload, onPhotoRemove }) {
    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                    Nom du produit <span className="text-red-600 font-bold text-base">*</span>
                </label>
                <input
                    type="text"
                    value={data.nomProduit || ''}
                    onChange={(e) => onChange('nomProduit', e.target.value)}
                    placeholder="Ex: Space Brownies Premium"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de comestible
                </label>
                <select
                    value={data.typeComestible || ''}
                    onChange={(e) => onChange('typeComestible', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                >
                    <option value="">Sélectionner...</option>
                    <option value="gateau">Gâteau</option>
                    <option value="cookie">Cookie/Biscuit</option>
                    <option value="bonbon">Bonbon</option>
                    <option value="chocolat">Chocolat</option>
                    <option value="boisson">Boisson</option>
                    <option value="glace">Glace/Crème glacée</option>
                    <option value="beurre">Beurre/Huile infusée</option>
                    <option value="miel">Miel infusé</option>
                    <option value="autre">Autre</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fabricant
                </label>
                <input
                    type="text"
                    value={data.fabricant || ''}
                    onChange={(e) => onChange('fabricant', e.target.value)}
                    placeholder="Ex: Marie Bakery"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de génétiques utilisées
                </label>
                <input
                    type="text"
                    value={data.typeGenetiques || ''}
                    onChange={(e) => onChange('typeGenetiques', e.target.value)}
                    placeholder="Ex: Indica-dominant, Hybride 50/50..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Photos */}
            <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                    Photos (1-4) <span className="text-red-600 font-bold text-base">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square group">
                            <img
                                src={photo.preview || photo.url}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover rounded-2xl shadow-lg ring-2 ring-purple-200 group-hover:ring-purple-400 transition-all"
                            />
                            <button
                                onClick={() => onPhotoRemove(index)}
                                className="absolute -top-2 -right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-lg hover:scale-110 z-10"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {photos.length < 4 && (
                        <label className="aspect-square border-3 border-dashed border-purple-400 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-600 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all group shadow-md hover:shadow-xl">
                            <div className="p-4 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-all mb-3">
                                <Upload className="w-8 h-8 text-purple-600" />
                            </div>
                            <span className="text-sm text-purple-700 font-bold">📸 Ajouter</span>
                            <span className="text-xs text-purple-500 mt-1">Max 10MB</span>
                            <input
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={onPhotoUpload}
                                className="hidden"
                            />
                        </label>
                    )}
                </div>
            </div>
        </div>
    )
}

// Section 2: Pipeline Recette
function PipelineRecette({ data, onChange }) {
    const [ingredients, setIngredients] = useState(data.ingredients || [])

    const actionsPreparation = [
        'Mixer',
        'Mélanger',
        'Faire fondre',
        'Cuire au four',
        'Réfrigérer',
        'Congeler',
        'Chauffer',
        'Bouillir',
        'Infuser',
        'Décarboxyler',
        'Tamiser',
        'Verser',
        'Fouetter',
        'Pétrir',
        'Laisser reposer'
    ]

    const unites = ['g', 'kg', 'mg', 'ml', 'L', 'cl', 'pcs', 'c. à soupe', 'c. à café', 'pincée', 'tasse']

    const ajouterIngredient = () => {
        const newIngredient = {
            id: Date.now(),
            nom: '',
            quantite: '',
            unite: 'g',
            type: 'standard', // standard ou cannabinique
            actions: []
        }
        const newIngredients = [...ingredients, newIngredient]
        setIngredients(newIngredients)
        onChange('ingredients', newIngredients)
    }

    const supprimerIngredient = (id) => {
        const newIngredients = ingredients.filter(i => i.id !== id)
        setIngredients(newIngredients)
        onChange('ingredients', newIngredients)
    }

    const modifierIngredient = (id, field, value) => {
        const newIngredients = ingredients.map(i =>
            i.id === id ? { ...i, [field]: value } : i
        )
        setIngredients(newIngredients)
        onChange('ingredients', newIngredients)
    }

    const toggleAction = (ingredientId, action) => {
        const ingredient = ingredients.find(i => i.id === ingredientId)
        const newActions = ingredient.actions.includes(action)
            ? ingredient.actions.filter(a => a !== action)
            : [...ingredient.actions, action]
        modifierIngredient(ingredientId, 'actions', newActions)
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                    🥘 Ingrédients ({ingredients.length})
                </h3>
                <button
                    type="button"
                    onClick={ajouterIngredient}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
                >
                    <Plus className="w-5 h-5" />
                    Ajouter un ingrédient
                </button>
            </div>

            <div className="space-y-4">
                {ingredients.map((ingredient, idx) => (
                    <div key={ingredient.id} className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-2xl border-2 border-orange-200 shadow-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-lg font-bold text-orange-800">Ingrédient {idx + 1}</h4>
                            <button
                                type="button"
                                onClick={() => supprimerIngredient(ingredient.id)}
                                className="flex items-center gap-2 px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                            >
                                <Trash2 className="w-4 h-4" />
                                Supprimer
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-1 block">Nom</label>
                                <input
                                    type="text"
                                    value={ingredient.nom}
                                    onChange={(e) => modifierIngredient(ingredient.id, 'nom', e.target.value)}
                                    placeholder="Ex: Farine, Beurre cannabique..."
                                    className="w-full px-3 py-2 border border-orange-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Quantité</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={ingredient.quantite}
                                        onChange={(e) => modifierIngredient(ingredient.id, 'quantite', e.target.value)}
                                        placeholder="100"
                                        className="w-full px-3 py-2 border border-orange-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Unité</label>
                                    <select
                                        value={ingredient.unite}
                                        onChange={(e) => modifierIngredient(ingredient.id, 'unite', e.target.value)}
                                        className="w-full px-3 py-2 border border-orange-300 rounded-lg outline-none focus:ring-2 focus:ring-orange-500"
                                    >
                                        {unites.map(u => (
                                            <option key={u} value={u}>{u}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="md:col-span-2">
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">Type d'ingrédient</label>
                                <div className="flex gap-3">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`type-${ingredient.id}`}
                                            value="standard"
                                            checked={ingredient.type === 'standard'}
                                            onChange={(e) => modifierIngredient(ingredient.id, 'type', e.target.value)}
                                            className="w-4 h-4 text-orange-600"
                                        />
                                        <span className="text-sm text-gray-700">Standard</span>
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="radio"
                                            name={`type-${ingredient.id}`}
                                            value="cannabinique"
                                            checked={ingredient.type === 'cannabinique'}
                                            onChange={(e) => modifierIngredient(ingredient.id, 'type', e.target.value)}
                                            className="w-4 h-4 text-orange-600"
                                        />
                                        <span className="text-sm text-gray-700 font-semibold">🌿 Cannabinique</span>
                                    </label>
                                </div>
                            </div>
                        </div>

                        {/* Actions de préparation */}
                        <div>
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                Actions de préparation ({ingredient.actions?.length || 0})
                            </label>
                            <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                {actionsPreparation.map(action => (
                                    <button
                                        key={action}
                                        type="button"
                                        onClick={() => toggleAction(ingredient.id, action)}
                                        className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${ingredient.actions?.includes(action)
                                            ? 'bg-orange-600 text-white shadow-lg'
                                            : 'bg-white border border-orange-300 hover:border-orange-500'
                                            }`}
                                    >
                                        {ingredient.actions?.includes(action) && <span className="mr-1">✓</span>}
                                        {action}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}

                {ingredients.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        <p>🥘 Aucun ingrédient ajouté</p>
                        <p className="text-sm">Cliquez sur "Ajouter un ingrédient" pour commencer la recette</p>
                    </div>
                )}
            </div>

            {/* Dosage total de THC/CBD (optionnel) */}
            <div className="border-t-2 border-gray-200 pt-6 mt-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">💊 Dosage (optionnel)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">THC total (mg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={data.dosageTHC || ''}
                            onChange={(e) => onChange('dosageTHC', e.target.value)}
                            placeholder="Ex: 100"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">CBD total (mg)</label>
                        <input
                            type="number"
                            step="0.1"
                            value={data.dosageCBD || ''}
                            onChange={(e) => onChange('dosageCBD', e.target.value)}
                            placeholder="Ex: 50"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Nombre de portions</label>
                        <input
                            type="number"
                            value={data.nombrePortions || ''}
                            onChange={(e) => onChange('nombrePortions', e.target.value)}
                            placeholder="Ex: 12"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

// Section 3: Goûts
function Gouts({ data, onChange }) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">😋 Intensité</label>
                    <span className="text-3xl font-bold text-purple-600">{data.goutIntensite || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.goutIntensite || 5}
                    onChange={(e) => onChange('goutIntensite', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-blue-400 to-red-500 rounded-full appearance-none cursor-pointer"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🔥 Agressivité/Piquant</label>
                    <span className="text-3xl font-bold text-purple-600">{data.agressivite || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.agressivite || 5}
                    onChange={(e) => onChange('agressivite', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-green-400 to-red-600 rounded-full appearance-none cursor-pointer"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Saveurs dominantes (max 7)
                </label>
                <textarea
                    value={data.saveursDominantes || ''}
                    onChange={(e) => onChange('saveursDominantes', e.target.value)}
                    placeholder="Ex: Chocolat, Vanille, Noisette, Cannabis..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>
        </div>
    )
}

// Section 4: Effets
function Effets({ data, onChange }) {
    const [filter, setFilter] = useState('tous')
    const [search, setSearch] = useState('')

    const effetsListe = [
        { nom: 'Euphorique', type: 'positif', categorie: 'mental' },
        { nom: 'Heureux', type: 'positif', categorie: 'mental' },
        { nom: 'Créatif', type: 'positif', categorie: 'mental' },
        { nom: 'Énergique', type: 'positif', categorie: 'physique' },
        { nom: 'Concentré', type: 'positif', categorie: 'mental' },
        { nom: 'Relaxé', type: 'positif', categorie: 'physique' },
        { nom: 'Sociable', type: 'positif', categorie: 'mental' },
        { nom: 'Motivé', type: 'positif', categorie: 'mental' },
        { nom: 'Faim', type: 'neutre', categorie: 'physique' },
        { nom: 'Somnolent', type: 'neutre', categorie: 'physique' },
        { nom: 'Yeux secs', type: 'neutre', categorie: 'physique' },
        { nom: 'Bouche sèche', type: 'neutre', categorie: 'physique' },
        { nom: 'Anxieux', type: 'negatif', categorie: 'mental' },
        { nom: 'Paranoïa', type: 'negatif', categorie: 'mental' },
        { nom: 'Étourdi', type: 'negatif', categorie: 'physique' },
        { nom: 'Maux de tête', type: 'negatif', categorie: 'physique' },
        { nom: 'Anti-douleur', type: 'positif', categorie: 'therapeutique' },
        { nom: 'Anti-stress', type: 'positif', categorie: 'therapeutique' },
        { nom: 'Anti-nausée', type: 'positif', categorie: 'therapeutique' },
        { nom: 'Anti-inflammatoire', type: 'positif', categorie: 'therapeutique' }
    ]

    const dureesEffets = [
        '5-15min',
        '15-30min',
        '30-60min',
        '1-2h',
        '2h+',
        '4h+',
        '8h+',
        '24h+'
    ]

    const selected = data.effets || []

    const filtered = effetsListe.filter(e => {
        const matchFilter = filter === 'tous' || e.type === filter
        const matchSearch = e.nom.toLowerCase().includes(search.toLowerCase())
        return matchFilter && matchSearch
    })

    const toggleEffet = (effet) => {
        const newValue = selected.includes(effet)
            ? selected.filter(e => e !== effet)
            : [...selected, effet]
        if (newValue.length <= 8) {
            onChange('effets', newValue)
        }
    }

    const getTypeColor = (type) => {
        switch (type) {
            case 'positif': return 'bg-green-600'
            case 'neutre': return 'bg-blue-600'
            case 'negatif': return 'bg-red-600'
            default: return 'bg-gray-600'
        }
    }

    return (
        <div className="space-y-8">
            {/* Montée */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🚀 Montée (rapidité)</label>
                    <span className="text-3xl font-bold text-purple-600">{data.effetsMontee || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.effetsMontee || 5}
                    onChange={(e) => onChange('effetsMontee', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full appearance-none cursor-pointer"
                />
                <p className="text-sm text-gray-600">⚠️ Les effets des comestibles sont généralement plus lents mais plus longs</p>
            </div>

            {/* Intensité */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">💥 Intensité</label>
                    <span className="text-3xl font-bold text-purple-600">{data.effetsIntensite || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.effetsIntensite || 5}
                    onChange={(e) => onChange('effetsIntensite', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-orange-400 to-red-600 rounded-full appearance-none cursor-pointer"
                />
            </div>

            {/* Durée des effets */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-3 block">⏱️ Durée des effets</label>
                <div className="grid grid-cols-4 gap-3">
                    {dureesEffets.map(duree => (
                        <button
                            key={duree}
                            type="button"
                            onClick={() => onChange('dureeEffets', duree)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${data.dureeEffets === duree
                                ? 'bg-purple-600 text-white shadow-lg scale-105'
                                : 'bg-white border-2 border-gray-200 hover:border-purple-400'
                                }`}
                        >
                            {duree}
                        </button>
                    ))}
                </div>
            </div>

            {/* Sélection des effets */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-4 block">
                    🎯 Effets ressentis (max 8) <span className="text-purple-600">{selected.length}/8</span>
                </label>

                <div className="flex gap-2 mb-4 flex-wrap">
                    {['tous', 'positif', 'neutre', 'negatif'].map(f => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${filter === f
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            {f === 'tous' ? '🌐 Tous' :
                                f === 'positif' ? '✅ Positifs' :
                                    f === 'neutre' ? '➖ Neutres' : '❌ Négatifs'}
                        </button>
                    ))}
                </div>

                <input
                    type="text"
                    placeholder="🔍 Rechercher un effet..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
                />

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-3 bg-gray-50 rounded-xl">
                    {filtered.map(effet => (
                        <button
                            key={effet.nom}
                            type="button"
                            onClick={() => toggleEffet(effet.nom)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all relative ${selected.includes(effet.nom)
                                ? `${getTypeColor(effet.type)} text-white shadow-lg scale-105`
                                : 'bg-white border-2 border-gray-200 hover:border-purple-400'
                                }`}
                        >
                            <div className="flex items-center justify-between gap-2">
                                <span>{effet.nom}</span>
                                {selected.includes(effet.nom) && <span>✓</span>}
                            </div>
                            <span className="text-xs opacity-75 block mt-1">{effet.categorie}</span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
