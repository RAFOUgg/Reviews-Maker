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
import ExtractionPipelineSection from '../components/reviews/sections/ExtractionPipelineSection'

/**
 * CreateConcentrateReview - Interface pour créer/éditer une review de Concentré
 * Types: Rosin, BHO, PHO, CO₂, EHO, etc.
 * Sections: Infos, Extraction, Purification, Visuel, Odeurs, Texture, Goûts, Effets, Curing, Expérience
 */
export default function CreateConcentrateReview() {
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

    // Définition des 10 sections spécifiques aux Concentrés
    const sections = [
        { id: 'infos', icon: '📋', title: 'Informations générales', required: true },
        { id: 'extraction', icon: '🔬', title: 'Pipeline Extraction' },
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
            toast.success('Review Concentré enregistrée!')
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
                            {id ? '✏️ Modifier la review Concentré' : '✨ Créer une review Concentré'}
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
                            <ExtractionPipelineSection
                                data={formData.extraction || {}}
                                onChange={(extractionData) => handleChange('extraction', extractionData)}
                            />
                        )}
                        {currentSection === 2 && (
                            <PipelinePurification data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 3 && (
                            <AnalyticsSection
                                productType="Concentré"
                                data={formData.analytics || {}}
                                onChange={(analyticsData) => handleChange('analytics', analyticsData)}
                            />
                        )}
                        {currentSection === 4 && (
                            <VisualSection
                                productType="Concentré"
                                data={formData.visual || {}}
                                onChange={(visualData) => handleChange('visual', visualData)}
                            />
                        )}
                        {currentSection === 5 && (
                            <OdorSection
                                productType="Concentré"
                                data={formData.odor || {}}
                                onChange={(odorData) => handleChange('odor', odorData)}
                            />
                        )}
                        {currentSection === 6 && (
                            <TextureSection
                                productType="Concentré"
                                data={formData.texture || {}}
                                onChange={(textureData) => handleChange('texture', textureData)}
                            />
                        )}
                        {currentSection === 7 && (
                            <TasteSection
                                productType="Concentré"
                                data={formData.taste || {}}
                                onChange={(tasteData) => handleChange('taste', tasteData)}
                            />
                        )}
                        {currentSection === 8 && (
                            <EffectsSection
                                productType="Concentré"
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
                            type: 'Concentré',
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
                    placeholder="Ex: Live Rosin Premium"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Extracteur / Hashmaker
                </label>
                <input
                    type="text"
                    value={data.hashmaker || ''}
                    onChange={(e) => onChange('hashmaker', e.target.value)}
                    placeholder="Ex: Pierre Extraction"
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
                    placeholder="Ex: ExtractLab Paris"
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
                    placeholder="Ex: Gelato, Wedding Cake"
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

// Section 2: Pipeline Extraction
function PipelineExtraction({ data, onChange }) {
    const methodesExtraction = [
        { value: 'eho', label: 'Extraction à l\'éthanol (EHO)' },
        { value: 'ipa', label: 'Extraction à l\'alcool isopropylique (IPA)' },
        { value: 'aho', label: 'Extraction à l\'acétone (AHO)' },
        { value: 'bho', label: 'Extraction au butane (BHO)' },
        { value: 'iho', label: 'Extraction à l\'isobutane (IHO)' },
        { value: 'pho', label: 'Extraction au propane (PHO)' },
        { value: 'hho', label: 'Extraction à l\'hexane (HHO)' },
        { value: 'huiles-vegetales', label: 'Extraction aux huiles végétales (coco, olive)' },
        { value: 'co2', label: 'Extraction au CO₂ supercritique' },
        { value: 'rosin-chaud', label: 'Pressage à chaud (Rosin)' },
        { value: 'rosin-froid', label: 'Pressage à froid' },
        { value: 'ultrasons', label: 'Extraction par ultrasons (UAE)' },
        { value: 'micro-ondes', label: 'Extraction assistée par micro-ondes (MAE)' },
        { value: 'tensioactifs', label: 'Extraction avec tensioactifs (Tween 20)' },
        { value: 'autre', label: 'Autre' }
    ]

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Méthode d'extraction
                </label>
                <select
                    value={data.methodeExtraction || ''}
                    onChange={(e) => onChange('methodeExtraction', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                >
                    <option value="">Sélectionner...</option>
                    {methodesExtraction.map(m => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                    ))}
                </select>
            </div>

            {/* Champs spécifiques selon la méthode */}
            {data.methodeExtraction === 'co2' && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pression (bar)
                            </label>
                            <input
                                type="number"
                                min="0"
                                step="10"
                                value={data.pressionCO2 || ''}
                                onChange={(e) => onChange('pressionCO2', e.target.value)}
                                placeholder="Ex: 200"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Température (°C)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="1"
                                value={data.temperatureCO2 || ''}
                                onChange={(e) => onChange('temperatureCO2', e.target.value)}
                                placeholder="Ex: 35"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>
                </>
            )}

            {(data.methodeExtraction === 'rosin-chaud' || data.methodeExtraction === 'rosin-froid') && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Température de pressage (°C)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="120"
                                step="5"
                                value={data.temperaturePressage || ''}
                                onChange={(e) => onChange('temperaturePressage', e.target.value)}
                                placeholder="Ex: 85"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Pression (tonnes)
                            </label>
                            <input
                                type="number"
                                min="0"
                                max="50"
                                step="0.5"
                                value={data.pressionPressage || ''}
                                onChange={(e) => onChange('pressionPressage', e.target.value)}
                                placeholder="Ex: 3.5"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Taille du sac (μm)
                            </label>
                            <input
                                type="number"
                                value={data.tailleSac || ''}
                                onChange={(e) => onChange('tailleSac', e.target.value)}
                                placeholder="Ex: 25, 37, 45, 90, 120, 160"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Durée de pressage (secondes)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={data.dureePressage || ''}
                                onChange={(e) => onChange('dureePressage', e.target.value)}
                                placeholder="Ex: 60"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Champs communs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                        placeholder="Ex: 8.5"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Durée totale d'extraction (minutes)
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={data.dureeExtraction || ''}
                        onChange={(e) => onChange('dureeExtraction', e.target.value)}
                        placeholder="Ex: 30"
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes sur l'extraction
                </label>
                <textarea
                    value={data.notesExtraction || ''}
                    onChange={(e) => onChange('notesExtraction', e.target.value)}
                    placeholder="Observations, particularités, conditions..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
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

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes sur la purification
                </label>
                <textarea
                    value={data.notesPurification || ''}
                    onChange={(e) => onChange('notesPurification', e.target.value)}
                    placeholder="Conditions, particularités, résultats observés..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>
        </div>
    )
}

// Section 4: Visuel & Technique
function VisuelTechnique({ data, onChange }) {
    return (
        <div className="space-y-6">
            {/* Couleur/Transparence */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🎨 Couleur/Transparence</label>
                    <span className="text-3xl font-bold text-purple-600">{data.couleurTransparence || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.couleurTransparence || 5}
                    onChange={(e) => onChange('couleurTransparence', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-amber-800 via-yellow-400 to-yellow-100 rounded-full appearance-none cursor-pointer"
                />
            </div>

            {/* Viscosité */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">💧 Viscosité</label>
                    <span className="text-3xl font-bold text-purple-600">{data.viscosite || 5}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.viscosite || 5}
                    onChange={(e) => onChange('viscosite', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-blue-300 to-amber-600 rounded-full appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>Liquide</span>
                    <span>Moyenne</span>
                    <span>Solide</span>
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

            {/* Melting (Full Melt) */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🔥 Melting (10 = Full Melt)</label>
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

            {/* Résidus */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800">🧪 Résidus (10 = aucun)</label>
                    <span className="text-3xl font-bold text-purple-600">{data.residus || 10}/10</span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.residus || 10}
                    onChange={(e) => onChange('residus', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-red-500 to-green-500 rounded-full appearance-none cursor-pointer"
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
                    className="w-full h-3 bg-gradient-to-r from-red-500 to-green-500 rounded-full appearance-none cursor-pointer"
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
        </div>
    )
}

// Section 5: Odeurs (identique Hash)
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
                    placeholder="Ex: Fruité, Diesel, Pin..."
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
                    placeholder="Ex: Terreux, Floral, Épices..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none"
                />
            </div>
        </div>
    )
}

// Section 6: Texture (identique Hash)
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

// Section 7: Goûts (identique Hash)
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

// Section 8: Effets (identique Hash)
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
