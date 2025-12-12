import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Save, Eye, Upload, X } from 'lucide-react'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import OrchardPanel from '../components/orchard/OrchardPanel'
import { AnimatePresence, motion } from 'framer-motion'
import CuringMaturationTimeline from '../components/forms/flower/CuringMaturationTimeline'
import ExperienceUtilisation from '../components/forms/flower/ExperienceUtilisation'
import VisualSection from '../components/reviews/sections/VisualSection'
import OdorSection from '../components/reviews/sections/OdorSection'
import TextureSection from '../components/reviews/sections/TextureSection'
import TasteSection from '../components/reviews/sections/TasteSection'
import EffectsSection from '../components/reviews/sections/EffectsSection'
import AnalyticsSection from '../components/reviews/sections/AnalyticsSection'
import SeparationPipelineSection from '../components/reviews/sections/SeparationPipelineSection'

/**
 * CreateHashReview - Interface pour créer/éditer une review de Hash
 * Types: Hash, Kief, Ice-O-Lator, Dry-Sift
 * Sections: Infos, Séparation, Purification, Visuel, Odeurs, Texture, Goûts, Effets, Curing, Expérience
 */
export default function CreateHashReview() {
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

    // Définition des 10 sections spécifiques au Hash
    const sections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'separation', icon: '🔬', title: 'Pipeline Séparation' },
        { id: 'purification', icon: '⚗️', title: 'Pipeline Purification' },
        { id: 'analytics', icon: '🔬', title: 'Données Analytiques' },
        { id: 'visual', icon: '👁️', title: 'Visuel & Technique' },
        { id: 'odeurs', icon: '👃', title: 'Odeurs' },
        { id: 'texture', icon: '🤚', title: 'Texture' },
        { id: 'gouts', icon: '😋', title: 'Goûts' },
        { id: 'effets', icon: '💥', title: 'Effets' },
        { id: 'curing', icon: '🔥', title: 'Curing & Maturation' },
        { id: 'experience', icon: '🧪', title: 'Expérience d\'utilisation' }
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
            // TODO: Backend submission
            toast.success('Review Hash enregistrée!')
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
            <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/30 shadow-xl shadow-purple-900/20">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-extrabold text-white drop-shadow-2xl tracking-tight">
                            {id ? '✏️ Modifier la review Hash' : '✨ Créer une review Hash'}
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
                            <SeparationPipelineSection 
                                data={formData.separation || {}}
                                onChange={(separationData) => handleChange('separation', separationData)}
                            />
                        )}
                        {currentSection === 2 && (
                            <PipelinePurification data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 3 && (
                            <AnalyticsSection
                                productType="Hash"
                                data={formData.analytics || {}}
                                onChange={(analyticsData) => handleChange('analytics', analyticsData)}
                            />
                        )}
                        {currentSection === 4 && (
                            <VisualSection
                                productType="Hash"
                                data={formData.visual || {}}
                                onChange={(visualData) => handleChange('visual', visualData)}
                            />
                        )}
                        {currentSection === 5 && (
                            <OdorSection
                                productType="Hash"
                                data={formData.odor || {}}
                                onChange={(odorData) => handleChange('odor', odorData)}
                            />
                        )}
                        {currentSection === 6 && (
                            <TextureSection
                                productType="Hash"
                                data={formData.texture || {}}
                                onChange={(textureData) => handleChange('texture', textureData)}
                            />
                        )}
                        {currentSection === 7 && (
                            <TasteSection
                                productType="Hash"
                                data={formData.taste || {}}
                                onChange={(tasteData) => handleChange('taste', tasteData)}
                            />
                        )}
                        {currentSection === 8 && (
                            <EffectsSection
                                productType="Hash"
                                data={formData.effects || {}}
                                onChange={(effectsData) => handleChange('effects', effectsData)}
                            />
                        )}
                        {currentSection === 9 && (
                            <CuringMaturationTimeline data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 10 && (
                            <ExperienceUtilisation data={formData} onChange={handleChange} />
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
                            type: 'Hash',
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
            <div>
                <label className="block text-sm font-medium text-gray-800 mb-2">
                    Nom commercial <span className="text-red-600 font-bold text-base">*</span>
                </label>
                <input
                    type="text"
                    value={data.nomCommercial || ''}
                    onChange={(e) => onChange('nomCommercial', e.target.value)}
                    placeholder="Ex: Dry Sift Premium"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hashmaker
                </label>
                <input
                    type="text"
                    value={data.hashmaker || ''}
                    onChange={(e) => onChange('hashmaker', e.target.value)}
                    placeholder="Ex: Jean-Claude Hash"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Laboratoire de production
                </label>
                <input
                    type="text"
                    value={data.laboratoire || ''}
                    onChange={(e) => onChange('laboratoire', e.target.value)}
                    placeholder="Ex: HashLab Paris"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cultivars utilisés
                </label>
                <input
                    type="text"
                    value={data.cultivars || ''}
                    onChange={(e) => onChange('cultivars', e.target.value)}
                    placeholder="Ex: OG Kush, Amnesia Haze"
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

// Section 2: Pipeline Séparation
function PipelineSeparation({ data, onChange }) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Méthode de séparation
                    </label>
                    <select
                        value={data.methodeSeparation || ''}
                        onChange={(e) => onChange('methodeSeparation', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="manuelle">Manuelle</option>
                        <option value="tamisage-sec">Tamisage à sec (Dry Sift)</option>
                        <option value="eau-glace">Eau/Glace (Ice-O-Lator)</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>

                {data.methodeSeparation === 'eau-glace' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de passes
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                value={data.nombrePasses || ''}
                                onChange={(e) => onChange('nombrePasses', e.target.value)}
                                placeholder="Ex: 3"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Température de l'eau (°C)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.5"
                                value={data.temperatureEau || ''}
                                onChange={(e) => onChange('temperatureEau', e.target.value)}
                                placeholder="Ex: 2.5"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </>
                )}

                {data.methodeSeparation === 'tamisage-sec' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Taille des mailles (μm)
                        </label>
                        <input
                            type="text"
                            value={data.tailleMailles || ''}
                            onChange={(e) => onChange('tailleMailles', e.target.value)}
                            placeholder="Ex: 120μm, 90μm, 73μm"
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Type de matière première
                    </label>
                    <select
                        value={data.matierePremiere || ''}
                        onChange={(e) => onChange('matierePremiere', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="buds">Buds</option>
                        <option value="trim">Trim</option>
                        <option value="sugar-leaves">Sugar leaves</option>
                        <option value="mix">Mix</option>
                        <option value="autre">Autre</option>
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center justify-between">
                        <span>Qualité matière première</span>
                        <span className="text-2xl font-bold text-purple-600">{data.qualiteMatiere || 5}/10</span>
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={data.qualiteMatiere || 5}
                        onChange={(e) => onChange('qualiteMatiere', parseInt(e.target.value))}
                        className="w-full h-3 bg-gradient-to-r from-red-400 to-green-600 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rendement estimé (%)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={data.rendement || ''}
                        onChange={(e) => onChange('rendement', e.target.value)}
                        placeholder="Ex: 15.5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Temps total de séparation (minutes)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={data.tempsSeparation || ''}
                        onChange={(e) => onChange('tempsSeparation', e.target.value)}
                        placeholder="Ex: 45"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>
            </div>
        </div>
    )
}

// Section 3: Pipeline Purification
function PipelinePurification({ data, onChange }) {
    const methodesPurification = [
        'Chromatographie sur colonne',
        'Flash Chromatography',
        'HPLC',
        'GC',
        'TLC',
        'Winterisation',
        'Décarboxylation',
        'Fractionnement par température',
        'Fractionnement par solubilité',
        'Filtration',
        'Centrifugation',
        'Décantation',
        'Séchage sous vide',
        'Recristallisation',
        'Sublimation',
        'Extraction liquide-liquide',
        'Adsorption sur charbon actif',
        'Filtration membranaire'
    ]

    const methodesSelectionnees = data.methodesPurification || []

    const toggleMethode = (methode) => {
        const newMethods = methodesSelectionnees.includes(methode)
            ? methodesSelectionnees.filter(m => m !== methode)
            : [...methodesSelectionnees, methode]
        onChange('methodesPurification', newMethods)
    }

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                    ⚗️ Méthodes de purification utilisées
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-xl">
                    {methodesPurification.map(methode => (
                        <button
                            key={methode}
                            type="button"
                            onClick={() => toggleMethode(methode)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${methodesSelectionnees.includes(methode)
                                ? 'bg-purple-600 text-white shadow-lg'
                                : 'bg-white border-2 border-gray-200 hover:border-purple-400'
                                }`}
                        >
                            {methodesSelectionnees.includes(methode) && <span className="mr-2">✓</span>}
                            {methode}
                        </button>
                    ))}
                </div>
            </div>

            {methodesSelectionnees.length > 0 && (
                <div className="bg-purple-50 p-4 rounded-xl border-2 border-purple-200">
                    <p className="text-sm text-purple-800">
                        <span className="font-bold">{methodesSelectionnees.length}</span> méthode(s) sélectionnée(s)
                    </p>
                </div>
            )}
        </div>
    )
}

// Section 4: Visuel & Technique (nuancier noir → blanc pour Hash)
function VisuelTechnique({ data, onChange }) {
    const couleurs = [
        { nom: 'Noir', value: 'noir', hex: '#1a1a1a' },
        { nom: 'Brun foncé', value: 'brun-fonce', hex: '#3d2817' },
        { nom: 'Brun', value: 'brun', hex: '#6b4423' },
        { nom: 'Ambre', value: 'ambre', hex: '#c9802a' },
        { nom: 'Doré', value: 'dore', hex: '#d4af37' },
        { nom: 'Jaune clair', value: 'jaune-clair', hex: '#f4e4c1' },
        { nom: 'Blanc cassé', value: 'blanc', hex: '#f8f8f0' }
    ]

    return (
        <div className="space-y-6">
            {/* Couleur/Transparence */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <label className="text-lg font-semibold text-gray-800">🎨 Couleur/Transparence</label>
                    <span className="text-3xl font-bold text-purple-600">{data.couleurTransparence || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.couleurTransparence || 5}
                    onChange={(e) => onChange('couleurTransparence', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-black via-amber-600 to-yellow-200 rounded-full appearance-none cursor-pointer"
                />

                {/* Nuancier spécifique Hash */}
                <div className="grid grid-cols-4 md:grid-cols-7 gap-2 mt-4">
                    {couleurs.map(couleur => (
                        <button
                            key={couleur.value}
                            type="button"
                            onClick={() => onChange('couleurNuance', couleur.value)}
                            className={`relative aspect-square rounded-lg border-2 transition-all ${data.couleurNuance === couleur.value
                                ? 'border-purple-600 ring-4 ring-purple-200 scale-110'
                                : 'border-gray-300 hover:border-purple-400'
                                }`}
                            style={{ backgroundColor: couleur.hex }}
                            title={couleur.nom}
                        >
                            {data.couleurNuance === couleur.value && (
                                <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold drop-shadow-lg">
                                    ✓
                                </span>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Pureté visuelle */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">✨ Pureté visuelle</label>
                    <span className="text-3xl font-bold text-purple-600">{data.pureteVisuelle || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.pureteVisuelle || 5}
                    onChange={(e) => onChange('pureteVisuelle', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-gray-400 to-yellow-400 rounded-full appearance-none cursor-pointer"
                />
            </div>

            {/* Densité visuelle */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🔵 Densité visuelle</label>
                    <span className="text-3xl font-bold text-purple-600">{data.densiteVisuelle || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.densiteVisuelle || 5}
                    onChange={(e) => onChange('densiteVisuelle', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-blue-300 to-blue-700 rounded-full appearance-none cursor-pointer"
                />
            </div>

            {/* Pistils */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🌾 Pistils (10 = aucun)</label>
                    <span className="text-3xl font-bold text-purple-600">{data.pistils || 10}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.pistils || 10}
                    onChange={(e) => onChange('pistils', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-red-400 to-green-500 rounded-full appearance-none cursor-pointer"
                />
            </div>

            {/* Moisissure */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🦠 Moisissure (10 = aucune)</label>
                    <span className="text-3xl font-bold text-purple-600">{data.moisissure || 10}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.moisissure || 10}
                    onChange={(e) => onChange('moisissure', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-red-500 to-green-500 rounded-full appearance-none cursor-pointer"
                />
            </div>

            {/* Graines */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🌰 Graines (10 = aucune)</label>
                    <span className="text-3xl font-bold text-purple-600">{data.graines || 10}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.graines || 10}
                    onChange={(e) => onChange('graines', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-red-500 to-green-500 rounded-full appearance-none cursor-pointer"
                />
            </div>
        </div>
    )
}

// Section 5: Odeurs
function Odeurs({ data, onChange }) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🎯 Fidélité au cultivar</label>
                    <span className="text-3xl font-bold text-purple-600">{data.fideliteCultivar || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.fideliteCultivar || 5}
                    onChange={(e) => onChange('fideliteCultivar', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-orange-400 to-green-500 rounded-full appearance-none cursor-pointer"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">💨 Intensité aromatique</label>
                    <span className="text-3xl font-bold text-purple-600">{data.intensiteAromatique || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.intensiteAromatique || 5}
                    onChange={(e) => onChange('intensiteAromatique', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full appearance-none cursor-pointer"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes dominantes (max 7)
                </label>
                <textarea
                    value={data.notesDominantes || ''}
                    onChange={(e) => onChange('notesDominantes', e.target.value)}
                    placeholder="Ex: Pin, Citron, Diesel..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes secondaires (max 7)
                </label>
                <textarea
                    value={data.notesSecondaires || ''}
                    onChange={(e) => onChange('notesSecondaires', e.target.value)}
                    placeholder="Ex: Terre, Épices, Fruits..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>
        </div>
    )
}

// Section 6: Texture
function Texture({ data, onChange }) {
    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">💪 Dureté</label>
                    <span className="text-3xl font-bold text-purple-600">{data.durete || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.durete || 5}
                    onChange={(e) => onChange('durete', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-yellow-400 to-stone-600 rounded-full appearance-none cursor-pointer"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🔵 Densité tactile</label>
                    <span className="text-3xl font-bold text-purple-600">{data.densiteTactile || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.densiteTactile || 5}
                    onChange={(e) => onChange('densiteTactile', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-blue-300 to-blue-700 rounded-full appearance-none cursor-pointer"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">💧 Friabilité/Viscosité</label>
                    <span className="text-3xl font-bold text-purple-600">{data.friabilite || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.friabilite || 5}
                    onChange={(e) => onChange('friabilite', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-amber-400 to-blue-500 rounded-full appearance-none cursor-pointer"
                />
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🔥 Melting/Résidus (10 = Full Melt)</label>
                    <span className="text-3xl font-bold text-purple-600">{data.melting || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.melting || 5}
                    onChange={(e) => onChange('melting', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-gray-600 to-yellow-400 rounded-full appearance-none cursor-pointer"
                />
            </div>
        </div>
    )
}

// Section 7: Goûts
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
                    Dry puff/tirage à sec (max 7)
                </label>
                <textarea
                    value={data.dryPuff || ''}
                    onChange={(e) => onChange('dryPuff', e.target.value)}
                    placeholder="Ex: Sucré, Terreux, Floral..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inhalation (max 7)
                </label>
                <textarea
                    value={data.inhalation || ''}
                    onChange={(e) => onChange('inhalation', e.target.value)}
                    placeholder="Ex: Diesel, Pin, Citron..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expiration/arrière-goût (max 7)
                </label>
                <textarea
                    value={data.expiration || ''}
                    onChange={(e) => onChange('expiration', e.target.value)}
                    placeholder="Ex: Épicé, Boisé, Fruité..."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>
        </div>
    )
}

// Section 8: Effets
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
            </div>

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
