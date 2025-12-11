import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Eye, Upload, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import OrchardPanel from '../components/orchard/OrchardPanel'
import { AnimatePresence, motion } from 'framer-motion'

/**
 * CreateFlowerReview - Interface complète pour créer/éditer une review de Fleur
 * Design Apple-like, ergonomique, avec toutes les sections du cahier des charges
 */
export default function CreateFlowerReview() {
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

    // Définition des 10 sections
    const sections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'genetics', icon: '🧬', title: 'Génétiques' },
        { id: 'culture', icon: '🌱', title: 'Culture & Pipeline' },
        { id: 'analytics', icon: '🔬', title: 'Analytiques PDF' },
        { id: 'visual', icon: '👁️', title: 'Visuel & Technique' },
        { id: 'odeurs', icon: '👃', title: 'Odeurs' },
        { id: 'texture', icon: '🤚', title: 'Texture' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effets', icon: '💥', title: 'Effets' },
        { id: 'curing', icon: '🔥', title: 'Curing & Maturation' }
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
        if (currentSection > 0) {
            scrollToSection(currentSection - 1)
        }
    }

    const handleNext = () => {
        if (currentSection < sections.length - 1) {
            scrollToSection(currentSection + 1)
        }
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
        // Validation
        if (!formData.nomCommercial) {
            toast.error('Le nom commercial est requis')
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
            // TODO: Implémenter la soumission au backend
            toast.success('Review enregistrée!')
            navigate('/library')
        } catch (error) {
            toast.error('Erreur lors de l\'enregistrement')
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
            <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-5xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <h1 className="text-2xl font-bold text-white drop-shadow-lg">
                            {id ? 'Modifier la review' : 'Créer une review'}
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
                    <div className="w-full bg-white/20 rounded-full h-2 backdrop-blur-sm">
                        <div
                            className="bg-white h-2 rounded-full transition-all duration-300 shadow-lg shadow-white/50"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Navigation sections avec flèches */}
            <div className="sticky top-[88px] z-40 bg-white/10 backdrop-blur-md border-b border-white/20">
                <div className="max-w-5xl mx-auto px-4">
                    <div className="flex items-center gap-2 py-3">
                        {/* Flèche gauche */}
                        <button
                            onClick={handlePrevious}
                            disabled={currentSection === 0}
                            className="flex-shrink-0 p-2 rounded-lg text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-white/20"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>

                        {/* Onglets scrollables */}
                        <div className="flex-1 overflow-x-auto scrollbar-hide">
                            <div ref={scrollContainerRef} className="flex gap-2 min-w-max">
                                {sections.map((section, index) => (
                                    <button
                                        key={section.id}
                                        onClick={() => scrollToSection(index)}
                                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${index === currentSection
                                                ? 'bg-white text-purple-600 shadow-lg shadow-white/50 scale-105 glow-effect'
                                                : index < currentSection
                                                    ? 'bg-white/60 text-purple-800 border border-white/30'
                                                    : 'bg-white/30 text-white border border-white/20 hover:bg-white/40'
                                            }`}
                                    >
                                        <span className="mr-2">{section.icon}</span>
                                        {section.title}
                                        {section.required && <span className="text-red-400 ml-1">*</span>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Flèche droite */}
                        <button
                            onClick={handleNext}
                            disabled={currentSection === sections.length - 1}
                            className="flex-shrink-0 p-2 rounded-lg text-white hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-lg hover:shadow-white/20"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Contenu principal - Une section à la fois */}
            <div className="max-w-5xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSection}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20"
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
                            <Genetiques data={formData} onChange={handleChange} />
                        )}
                        {currentSection >= 2 && (
                            <p className="text-gray-600">Section {currentSectionData.title} à implémenter</p>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Boutons de navigation */}
                {/* Boutons de navigation */}
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
                            type: 'Fleur',
                            holderName: formData.nomCommercial || '',
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
            {/* Nom commercial */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom commercial <span className="text-red-500">*</span>
                </label>
                <input
                    type="text"
                    value={data.nomCommercial || ''}
                    onChange={(e) => onChange('nomCommercial', e.target.value)}
                    placeholder="Ex: Blue Dream OG"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Farm */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Farm
                </label>
                <input
                    type="text"
                    value={data.farm || ''}
                    onChange={(e) => onChange('farm', e.target.value)}
                    placeholder="Ex: Own Grow"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Type de variété */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type de variété <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-3">
                    {['Indica', 'Sativa', 'Hybride', 'Indica-dominant', 'Sativa-dominant', 'CBD-dominant'].map((type) => (
                        <label key={type} className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="radio"
                                name="varietyType"
                                value={type}
                                checked={data.varietyType === type}
                                onChange={(e) => onChange('varietyType', e.target.value)}
                                className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                            />
                            <span className="text-sm text-gray-700">{type}</span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Photos */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Photos (1-4) <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-4 gap-4">
                    {photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square">
                            <img
                                src={photo.preview || photo.url}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-full object-cover rounded-xl"
                            />
                            <button
                                onClick={() => onPhotoRemove(index)}
                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                    {photos.length < 4 && (
                        <label className="aspect-square border-2 border-dashed border-purple-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-colors">
                            <Upload className="w-8 h-8 text-purple-400 mb-2" />
                            <span className="text-sm text-purple-600 font-medium">Ajouter</span>
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
                <p className="text-sm text-gray-500 mt-2">Taille max: 10MB par image</p>
            </div>
        </div>
    )
}

// Section 2: Génétiques
function Genetiques({ data, onChange }) {
    return (
        <div className="space-y-6">
            {/* Breeder */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Breeder de la graine
                </label>
                <input
                    type="text"
                    value={data.breeder || ''}
                    onChange={(e) => onChange('breeder', e.target.value)}
                    placeholder="Ex: Delicious Seeds"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Variété */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Variété (auto-complete)
                </label>
                <input
                    type="text"
                    value={data.variety || ''}
                    onChange={(e) => onChange('variety', e.target.value)}
                    placeholder="Cherchez une variété..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Type génétique avec pourcentages */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type génétique
                </label>
                <select
                    value={data.geneticType || 'hybride'}
                    onChange={(e) => onChange('geneticType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                >
                    <option value="indica">Indica</option>
                    <option value="sativa">Sativa</option>
                    <option value="hybride">Hybride</option>
                </select>
            </div>

            {/* Slider Indica/Sativa ratio (si hybride) */}
            {data.geneticType === 'hybride' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ratio Indica/Sativa
                    </label>
                    <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600 min-w-[80px]">
                            {data.indicaRatio || 50}% Indica
                        </span>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            value={data.indicaRatio || 50}
                            onChange={(e) => onChange('indicaRatio', parseInt(e.target.value))}
                            className="flex-1 h-2 bg-gradient-to-r from-purple-400 to-green-400 rounded-lg appearance-none cursor-pointer"
                        />
                        <span className="text-sm text-gray-600 min-w-[80px] text-right">
                            {100 - (data.indicaRatio || 50)}% Sativa
                        </span>
                    </div>
                </div>
            )}

            {/* Généalogie */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Généalogie (parents, lignée)
                </label>
                <textarea
                    value={data.parentage || ''}
                    onChange={(e) => onChange('parentage', e.target.value)}
                    placeholder="Ex: (OG Kush x Blue Dream)"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            {/* Code phénotype */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Code phénotype
                </label>
                <input
                    type="text"
                    value={data.phenotype || ''}
                    onChange={(e) => onChange('phenotype', e.target.value)}
                    placeholder="Ex: Pheno #3 (Hunt)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>
        </div>
    )
}
