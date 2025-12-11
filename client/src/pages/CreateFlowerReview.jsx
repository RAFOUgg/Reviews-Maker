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
            <div className="sticky top-0 z-50 bg-white/10 backdrop-blur-xl border-b border-white/30 shadow-xl shadow-purple-900/20">
                <div className="max-w-6xl mx-auto px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-3xl font-extrabold text-white drop-shadow-2xl tracking-tight">
                            {id ? '✏️ Modifier la review' : '✨ Créer une review'}
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
                            <Genetiques data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 2 && (
                            <CulturePipeline data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 3 && (
                            <AnalytiquesPDF data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 4 && (
                            <VisuelTechnique data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 5 && (
                            <Odeurs data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 6 && (
                            <Texture data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 7 && (
                            <Gouts data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 8 && (
                            <Effets data={formData} onChange={handleChange} />
                        )}
                        {currentSection === 9 && (
                            <CuringMaturation data={formData} onChange={handleChange} />
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
                <label className="block text-sm font-medium text-gray-800 mb-2">
                    Nom commercial <span className="text-red-600 font-bold text-base">*</span>
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
                <label className="block text-sm font-medium text-gray-800 mb-3">
                    Type de variété <span className="text-red-600 font-bold text-base">*</span>
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
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-all"></div>
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
                <p className="text-sm text-gray-600 mt-3 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 bg-purple-500 rounded-full"></span>
                    Formats acceptés: JPG, PNG, WEBP • Max 10MB par image
                </p>
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
// Section 3: Culture & Pipeline
function CulturePipeline({ data, onChange }) {
    const phases = data.culturePhases || []
    
    const ajouterPhase = () => {
        const newPhase = {
            id: Date.now(),
            nom: '',
            dateDebut: '',
            dateFin: '',
            duree: 0,
            notes: ''
        }
        onChange('culturePhases', [...phases, newPhase])
    }
    
    const supprimerPhase = (id) => {
        onChange('culturePhases', phases.filter(p => p.id !== id))
    }
    
    const modifierPhase = (id, champ, valeur) => {
        const newPhases = phases.map(p => {
            if (p.id === id) {
                const updated = { ...p, [champ]: valeur }
                // Calculer la durée automatiquement
                if (champ === 'dateDebut' || champ === 'dateFin') {
                    if (updated.dateDebut && updated.dateFin) {
                        const debut = new Date(updated.dateDebut)
                        const fin = new Date(updated.dateFin)
                        const diffJours = Math.ceil((fin - debut) / (1000 * 60 * 60 * 24))
                        updated.duree = diffJours
                    }
                }
                return updated
            }
            return p
        })
        onChange('culturePhases', newPhases)
    }

    return (
        <div className="space-y-8">
            {/* Infos générales culture */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-lg font-semibold text-gray-800 mb-2 block">
                        🌱 Mode de culture <span className="text-red-600 font-bold text-base">*</span>
                    </label>
                    <select
                        value={data.modeCulture || ''}
                        onChange={(e) => onChange('modeCulture', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="indoor">Indoor / Intérieur</option>
                        <option value="outdoor">Outdoor / Extérieur</option>
                        <option value="greenhouse">Serre / Greenhouse</option>
                        <option value="hydro">Hydroponique</option>
                        <option value="aero">Aéroponique</option>
                        <option value="aqua">Aquaponique</option>
                        <option value="bio">Biologique / Organique</option>
                    </select>
                </div>

                <div>
                    <label className="text-lg font-semibold text-gray-800 mb-2 block">
                        🏭 Espace de culture
                    </label>
                    <input
                        type="text"
                        value={data.espaceCulture || ''}
                        onChange={(e) => onChange('espaceCulture', e.target.value)}
                        placeholder="Ex: Box 120x120, Jardin, Chambre..."
                        className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 outline-none"
                    />
                </div>
            </div>

            {/* Médium de culture */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-2 block">
                    🧪 Médium / Substrat
                </label>
                <input
                    type="text"
                    value={data.medium || ''}
                    onChange={(e) => onChange('medium', e.target.value)}
                    placeholder="Ex: Terre, Coco, Hydro, Laine de roche..."
                    className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
            </div>

            {/* Nutriments */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-2 block">
                    🧪 Nutriments / Engrais
                </label>
                <textarea
                    value={data.nutriments || ''}
                    onChange={(e) => onChange('nutriments', e.target.value)}
                    placeholder="Ex: BioBizz, Advanced Nutrients, fait maison..."
                    className="w-full px-4 py-3 border-2 border-lime-300 rounded-xl focus:ring-2 focus:ring-lime-500 outline-none"
                    rows="2"
                />
            </div>

            {/* Pipeline des phases */}
            <div className="border-t-2 border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        📅 Pipeline de culture ({phases.length} phases)
                    </h3>
                    <button
                        type="button"
                        onClick={ajouterPhase}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-lg"
                    >
                        + Ajouter une phase
                    </button>
                </div>

                <div className="space-y-4">
                    {phases.map((phase, idx) => (
                        <div key={phase.id} className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-2xl border-2 border-green-200 shadow-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h4 className="text-lg font-bold text-green-800">Phase {idx + 1}</h4>
                                <button
                                    type="button"
                                    onClick={() => supprimerPhase(phase.id)}
                                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                                >
                                    ✕ Supprimer
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Nom de la phase</label>
                                    <input
                                        type="text"
                                        value={phase.nom}
                                        onChange={(e) => modifierPhase(phase.id, 'nom', e.target.value)}
                                        placeholder="Ex: Germination, Végétation, Floraison..."
                                        className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Date début</label>
                                    <input
                                        type="date"
                                        value={phase.dateDebut}
                                        onChange={(e) => modifierPhase(phase.id, 'dateDebut', e.target.value)}
                                        className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Date fin</label>
                                    <input
                                        type="date"
                                        value={phase.dateFin}
                                        onChange={(e) => modifierPhase(phase.id, 'dateFin', e.target.value)}
                                        className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                    />
                                </div>

                                {phase.duree > 0 && (
                                    <div className="md:col-span-2">
                                        <div className="bg-white px-4 py-2 rounded-lg border border-green-300">
                                            <span className="text-sm text-gray-600">Durée: </span>
                                            <span className="font-bold text-green-700">{phase.duree} jours</span>
                                        </div>
                                    </div>
                                )}

                                <div className="md:col-span-2">
                                    <label className="text-sm font-semibold text-gray-700 mb-1 block">Notes</label>
                                    <textarea
                                        value={phase.notes}
                                        onChange={(e) => modifierPhase(phase.id, 'notes', e.target.value)}
                                        placeholder="Paramètres, observations, techniques utilisées..."
                                        className="w-full px-3 py-2 border border-green-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                                        rows="2"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {phases.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>🌱 Aucune phase ajoutée</p>
                            <p className="text-sm">Cliquez sur "Ajouter une phase" pour commencer</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

// Section 4: Analytiques PDF
function AnalytiquesPDF({ data, onChange }) {
    return (
        <div className="space-y-6">
            {/* Taux cannabinoïdes */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                        <span className="text-2xl mr-2">🌿</span>THC (%)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={data.thc || ''}
                        onChange={(e) => onChange('thc', e.target.value)}
                        placeholder="Ex: 24.5"
                        className="w-full px-4 py-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                        <span className="text-2xl mr-2">🧘</span>CBD (%)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={data.cbd || ''}
                        onChange={(e) => onChange('cbd', e.target.value)}
                        placeholder="Ex: 0.8"
                        className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                        <span className="text-2xl mr-2">🔬</span>CBG/CBC (%)
                    </label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={data.cbg || ''}
                        onChange={(e) => onChange('cbg', e.target.value)}
                        placeholder="Ex: 1.2"
                        className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Upload certificat d'analyse */}
            <div>
                <label className="block text-sm font-medium text-gray-800 mb-3">
                    <span className="text-2xl mr-2">📊</span>Certificat d'analyse (PDF/Image)
                </label>
                <div className="border-3 border-dashed border-purple-300 rounded-2xl p-8 text-center hover:border-purple-500 hover:bg-gradient-to-br hover:from-purple-50 hover:to-pink-50 transition-all cursor-pointer">
                    <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                        <Upload className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-lg font-semibold text-gray-700 mb-2">
                        Glissez votre certificat ici
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                        ou cliquez pour parcourir
                    </p>
                    <input
                        type="file"
                        accept=".pdf,image/*"
                        onChange={(e) => {
                            const file = e.target.files[0]
                            if (file) onChange('analyticsCertificate', file)
                        }}
                        className="hidden"
                        id="certificate-upload"
                    />
                    <label
                        htmlFor="certificate-upload"
                        className="inline-block px-6 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all cursor-pointer font-medium shadow-lg hover:shadow-xl"
                    >
                        📂 Sélectionner un fichier
                    </label>
                    <p className="text-xs text-gray-400 mt-4">
                        Formats: PDF, JPG, PNG • Max 20MB
                    </p>
                </div>
                {data.analyticsCertificate && (
                    <div className="mt-4 p-4 bg-green-50 border-2 border-green-200 rounded-xl flex items-center gap-3">
                        <span className="text-2xl">✅</span>
                        <div className="flex-1">
                            <p className="font-medium text-green-800">Fichier chargé</p>
                            <p className="text-sm text-green-600">{data.analyticsCertificate.name || 'Certificat.pdf'}</p>
                        </div>
                        <button
                            onClick={() => onChange('analyticsCertificate', null)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Note */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-xl">
                <p className="text-sm text-blue-800">
                    <span className="font-semibold">ℹ️ Info:</span> Le certificat d'analyse permet de valider les taux de cannabinoïdes et le profil terpénique complet.
                </p>
            </div>
        </div>
    )
}

// Section 5: Visuel & Technique
function VisuelTechnique({ data, onChange }) {
    const couleurs = [
        { value: 'vert-clair', label: 'Vert clair', color: '#90EE90' },
        { value: 'vert-fonce', label: 'Vert foncé', color: '#228B22' },
        { value: 'violet', label: 'Violet', color: '#9370DB' },
        { value: 'orange', label: 'Orange', color: '#FF8C00' },
        { value: 'brun', label: 'Brun', color: '#8B4513' },
        { value: 'gris', label: 'Gris', color: '#808080' },
    ]

    const criteres = [
        { key: 'visuelDensite', label: 'Densité visuelle', icon: '🔍' },
        { key: 'visuelTrichomes', label: 'Trichomes', icon: '💎' },
        { key: 'visuelPistils', label: 'Pistils', icon: '🧵' },
        { key: 'visuelManucure', label: 'Manucure', icon: '✂️' },
        { key: 'visuelMoisissure', label: 'Moisissure (10=aucune)', icon: '🍄' },
        { key: 'visuelGraines', label: 'Graines (10=aucune)', icon: '🌰' },
    ]

    return (
        <div className="space-y-8">
            {/* Nuancier de couleurs */}
            <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">🎨 Couleur dominante</label>
                <div className="grid grid-cols-3 gap-3">
                    {couleurs.map((c) => (
                        <button
                            key={c.value}
                            type="button"
                            onClick={() => onChange('visuelCouleur', c.value)}
                            className={`p-4 rounded-xl border-3 transition-all ${
                                data.visuelCouleur === c.value
                                    ? 'border-purple-600 shadow-lg scale-105'
                                    : 'border-gray-200 hover:border-purple-300'
                            }`}
                        >
                            <div
                                className="w-full h-12 rounded-lg mb-2 shadow-inner"
                                style={{ backgroundColor: c.color }}
                            ></div>
                            <span className="text-sm font-medium text-gray-700">{c.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Critères visuels */}
            {criteres.map((critere) => (
                <div key={critere.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-base font-semibold text-gray-800 flex items-center gap-2">
                            <span className="text-xl">{critere.icon}</span>
                            {critere.label}
                        </label>
                        <span className="text-2xl font-bold text-purple-600">
                            {data[critere.key] || 5}/10
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={data[critere.key] || 5}
                        onChange={(e) => onChange(critere.key, parseInt(e.target.value))}
                        className="w-full h-2 bg-gradient-to-r from-purple-400 to-purple-600 rounded-full appearance-none cursor-pointer"
                    />
                </div>
            ))}
        </div>
    )
}

// Section 6: Odeurs
function Odeurs({ data, onChange }) {
    const [searchDominant, setSearchDominant] = useState('')
    const [searchSecondaire, setSearchSecondaire] = useState('')
    
    const odeursListe = [
        'Agrumes', 'Citron', 'Orange', 'Pamplemousse', 'Pin', 'Diesel', 'Skunk',
        'Terreux', 'Boisé', 'Épicé', 'Poivre', 'Floral', 'Fruité', 'Baies',
        'Mangue', 'Tropical', 'Menthe', 'Herbe', 'Cheese', 'Vanille', 'Chocolat',
        'Café', 'Miel', 'Piquant', 'Chimique', 'Gaz', 'Pneu', 'Amnésique'
    ]

    const selectedDominant = data.odeursDominantes || []
    const selectedSecondaire = data.odeursSecondaires || []

    const toggleOdeur = (type, odeur) => {
        const key = type === 'dominant' ? 'odeursDominantes' : 'odeursSecondaires'
        const current = data[key] || []
        const newValue = current.includes(odeur)
            ? current.filter(o => o !== odeur)
            : [...current, odeur]
        if (newValue.length <= 7) {
            onChange(key, newValue)
        }
    }

    const filteredDominant = odeursListe.filter(o => 
        o.toLowerCase().includes(searchDominant.toLowerCase())
    )
    const filteredSecondaire = odeursListe.filter(o => 
        o.toLowerCase().includes(searchSecondaire.toLowerCase())
    )

    return (
        <div className="space-y-8">
            {/* Intensité aromatique */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">💨</span>
                        Intensité aromatique
                    </label>
                    <span className="text-3xl font-bold text-purple-600">
                        {data.odeursIntensite || 5}/10
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.odeursIntensite || 5}
                    onChange={(e) => onChange('odeursIntensite', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-yellow-400 to-orange-600 rounded-full appearance-none cursor-pointer shadow-lg"
                />
            </div>

            {/* Notes dominantes */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-3 block">
                    👃 Notes dominantes (max 7) <span className="text-purple-600">{selectedDominant.length}/7</span>
                </label>
                <input
                    type="text"
                    placeholder="🔍 Rechercher..."
                    value={searchDominant}
                    onChange={(e) => setSearchDominant(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                    {filteredDominant.map(odeur => (
                        <button
                            key={odeur}
                            type="button"
                            onClick={() => toggleOdeur('dominant', odeur)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedDominant.includes(odeur)
                                    ? 'bg-purple-600 text-white shadow-lg scale-105'
                                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-purple-400'
                            }`}
                        >
                            {odeur}
                        </button>
                    ))}
                </div>
            </div>

            {/* Notes secondaires */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-3 block">
                    🌸 Notes secondaires (max 7) <span className="text-purple-600">{selectedSecondaire.length}/7</span>
                </label>
                <input
                    type="text"
                    placeholder="🔍 Rechercher..."
                    value={searchSecondaire}
                    onChange={(e) => setSearchSecondaire(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-pink-300 rounded-xl mb-4 focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                    {filteredSecondaire.map(odeur => (
                        <button
                            key={odeur}
                            type="button"
                            onClick={() => toggleOdeur('secondaire', odeur)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                selectedSecondaire.includes(odeur)
                                    ? 'bg-pink-600 text-white shadow-lg scale-105'
                                    : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-pink-400'
                            }`}
                        >
                            {odeur}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Section 7: Texture
function Texture({ data, onChange }) {
    const sliders = [
        { key: 'textureDurete', label: 'Dureté', icon: '💎', color: 'from-gray-400 to-gray-600' },
        { key: 'textureDensite', label: 'Densité tactile', icon: '⚖️', color: 'from-blue-400 to-blue-600' },
        { key: 'textureElasticite', label: 'Élasticité', icon: '🎯', color: 'from-green-400 to-green-600' },
        { key: 'textureCollant', label: 'Collant', icon: '🍯', color: 'from-amber-400 to-amber-600' }
    ]

    return (
        <div className="space-y-8">
            {sliders.map((slider) => (
                <div key={slider.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                        <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                            <span className="text-2xl">{slider.icon}</span>
                            {slider.label}
                        </label>
                        <span className="text-3xl font-bold text-purple-600">
                            {data[slider.key] || 5}/10
                        </span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="10"
                        value={data[slider.key] || 5}
                        onChange={(e) => onChange(slider.key, parseInt(e.target.value))}
                        className={`w-full h-3 bg-gradient-to-r ${slider.color} rounded-full appearance-none cursor-pointer shadow-lg hover:shadow-xl transition-all`}
                        style={{
                            background: `linear-gradient(to right, ${slider.color.split(' ')[1].replace('from-', '')} 0%, ${slider.color.split(' ')[2].replace('to-', '')} ${(data[slider.key] || 5) * 10}%, #e5e7eb ${(data[slider.key] || 5) * 10}%)`
                        }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 px-1">
                        <span>Faible</span>
                        <span>Moyen</span>
                        <span>Très élevé</span>
                    </div>
                </div>
            ))}
        </div>
    )
}

// Section 8: Goûts
function Gouts({ data, onChange }) {
    const [searchDry, setSearchDry] = useState('')
    const [searchInhale, setSearchInhale] = useState('')
    const [searchExhale, setSearchExhale] = useState('')
    
    const goutsListe = [
        'Citron', 'Orange', 'Baies', 'Fraise', 'Mangue', 'Ananas', 'Raisin',
        'Pomme', 'Cerise', 'Pin', 'Diesel', 'Terreux', 'Boisé', 'Épicé',
        'Poivre', 'Menthe', 'Vanille', 'Chocolat', 'Café', 'Miel', 'Cheese',
        'Skunk', 'Herbe', 'Floral', 'Chimique', 'Métallique', 'Sucré', 'Amer'
    ]

    const toggleGout = (type, gout) => {
        const key = `gouts${type}`
        const current = data[key] || []
        const newValue = current.includes(gout)
            ? current.filter(g => g !== gout)
            : [...current, gout]
        if (newValue.length <= 7) {
            onChange(key, newValue)
        }
    }

    return (
        <div className="space-y-8">
            {/* Intensité */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">🔥</span>
                        Intensité
                    </label>
                    <span className="text-3xl font-bold text-purple-600">
                        {data.goutsIntensite || 5}/10
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.goutsIntensite || 5}
                    onChange={(e) => onChange('goutsIntensite', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-orange-400 to-red-600 rounded-full appearance-none cursor-pointer shadow-lg"
                />
            </div>

            {/* Agressivité */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">⚡</span>
                        Agressivité / Piquant
                    </label>
                    <span className="text-3xl font-bold text-purple-600">
                        {data.goutsAgressivite || 5}/10
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.goutsAgressivite || 5}
                    onChange={(e) => onChange('goutsAgressivite', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-yellow-400 to-red-600 rounded-full appearance-none cursor-pointer shadow-lg"
                />
            </div>

            {/* Dry puff */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-3 block">
                    🚬 Dry puff / Tirage à sec (max 7) <span className="text-purple-600">{(data.goutsDryPuff || []).length}/7</span>
                </label>
                <input
                    type="text"
                    placeholder="🔍 Rechercher..."
                    value={searchDry}
                    onChange={(e) => setSearchDry(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl mb-4 focus:ring-2 focus:ring-amber-500 outline-none"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                    {goutsListe.filter(g => g.toLowerCase().includes(searchDry.toLowerCase())).map(gout => (
                        <button
                            key={gout}
                            type="button"
                            onClick={() => toggleGout('DryPuff', gout)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                (data.goutsDryPuff || []).includes(gout)
                                    ? 'bg-amber-600 text-white shadow-lg scale-105'
                                    : 'bg-white border-2 border-gray-200 hover:border-amber-400'
                            }`}
                        >
                            {gout}
                        </button>
                    ))}
                </div>
            </div>

            {/* Inhalation */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-3 block">
                    💨 Inhalation (max 7) <span className="text-purple-600">{(data.goutsInhalation || []).length}/7</span>
                </label>
                <input
                    type="text"
                    placeholder="🔍 Rechercher..."
                    value={searchInhale}
                    onChange={(e) => setSearchInhale(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-blue-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                    {goutsListe.filter(g => g.toLowerCase().includes(searchInhale.toLowerCase())).map(gout => (
                        <button
                            key={gout}
                            type="button"
                            onClick={() => toggleGout('Inhalation', gout)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                (data.goutsInhalation || []).includes(gout)
                                    ? 'bg-blue-600 text-white shadow-lg scale-105'
                                    : 'bg-white border-2 border-gray-200 hover:border-blue-400'
                            }`}
                        >
                            {gout}
                        </button>
                    ))}
                </div>
            </div>

            {/* Expiration */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-3 block">
                    🌬️ Expiration / Arrière-goût (max 7) <span className="text-purple-600">{(data.goutsExpiration || []).length}/7</span>
                </label>
                <input
                    type="text"
                    placeholder="🔍 Rechercher..."
                    value={searchExhale}
                    onChange={(e) => setSearchExhale(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-green-300 rounded-xl mb-4 focus:ring-2 focus:ring-green-500 outline-none"
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-48 overflow-y-auto p-2 bg-gray-50 rounded-xl">
                    {goutsListe.filter(g => g.toLowerCase().includes(searchExhale.toLowerCase())).map(gout => (
                        <button
                            key={gout}
                            type="button"
                            onClick={() => toggleGout('Expiration', gout)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                (data.goutsExpiration || []).includes(gout)
                                    ? 'bg-green-600 text-white shadow-lg scale-105'
                                    : 'bg-white border-2 border-gray-200 hover:border-green-400'
                            }`}
                        >
                            {gout}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

// Section 9: Effets
function Effets({ data, onChange }) {
    const [filter, setFilter] = useState('tous')
    const [search, setSearch] = useState('')
    
    const effetsListe = [
        // Positifs
        { nom: 'Euphorique', type: 'positif', categorie: 'mental' },
        { nom: 'Heureux', type: 'positif', categorie: 'mental' },
        { nom: 'Créatif', type: 'positif', categorie: 'mental' },
        { nom: 'Énergique', type: 'positif', categorie: 'physique' },
        { nom: 'Concentré', type: 'positif', categorie: 'mental' },
        { nom: 'Relaxé', type: 'positif', categorie: 'physique' },
        { nom: 'Sociable', type: 'positif', categorie: 'mental' },
        { nom: 'Motivé', type: 'positif', categorie: 'mental' },
        // Neutres
        { nom: 'Faim', type: 'neutre', categorie: 'physique' },
        { nom: 'Somnolent', type: 'neutre', categorie: 'physique' },
        { nom: 'Yeux secs', type: 'neutre', categorie: 'physique' },
        { nom: 'Bouche sèche', type: 'neutre', categorie: 'physique' },
        // Négatifs
        { nom: 'Anxieux', type: 'negatif', categorie: 'mental' },
        { nom: 'Paranoïa', type: 'negatif', categorie: 'mental' },
        { nom: 'Étourdi', type: 'negatif', categorie: 'physique' },
        { nom: 'Maux de tête', type: 'negatif', categorie: 'physique' },
        // Thérapeutiques
        { nom: 'Anti-douleur', type: 'positif', categorie: 'therapeutique' },
        { nom: 'Anti-stress', type: 'positif', categorie: 'therapeutique' },
        { nom: 'Anti-nausée', type: 'positif', categorie: 'therapeutique' },
        { nom: 'Anti-inflammatoire', type: 'positif', categorie: 'therapeutique' },
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
        switch(type) {
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
                    <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">🚀</span>
                        Montée (rapidité)
                    </label>
                    <span className="text-3xl font-bold text-purple-600">
                        {data.effetsMontee || 5}/10
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.effetsMontee || 5}
                    onChange={(e) => onChange('effetsMontee', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-blue-400 to-purple-600 rounded-full appearance-none cursor-pointer shadow-lg"
                />
                <div className="flex justify-between text-xs text-gray-500 px-1">
                    <span>Lente</span>
                    <span>Moyenne</span>
                    <span>Rapide</span>
                </div>
            </div>

            {/* Intensité */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <label className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                        <span className="text-2xl">💥</span>
                        Intensité
                    </label>
                    <span className="text-3xl font-bold text-purple-600">
                        {data.effetsIntensite || 5}/10
                    </span>
                </div>
                <input
                    type="range"
                    min="0"
                    max="10"
                    value={data.effetsIntensite || 5}
                    onChange={(e) => onChange('effetsIntensite', parseInt(e.target.value))}
                    className="w-full h-3 bg-gradient-to-r from-orange-400 to-red-600 rounded-full appearance-none cursor-pointer shadow-lg"
                />
            </div>

            {/* Sélection des effets */}
            <div>
                <label className="text-lg font-semibold text-gray-800 mb-4 block">
                    🎯 Effets ressentis (max 8) <span className="text-purple-600">{selected.length}/8</span>
                </label>
                
                {/* Filtres */}
                <div className="flex gap-2 mb-4 flex-wrap">
                    {['tous', 'positif', 'neutre', 'negatif'].map(f => (
                        <button
                            key={f}
                            type="button"
                            onClick={() => setFilter(f)}
                            className={`px-4 py-2 rounded-lg font-medium transition-all ${
                                filter === f
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

                {/* Recherche */}
                <input
                    type="text"
                    placeholder="🔍 Rechercher un effet..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-purple-300 rounded-xl mb-4 focus:ring-2 focus:ring-purple-500 outline-none"
                />

                {/* Liste des effets */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-3 bg-gray-50 rounded-xl">
                    {filtered.map(effet => (
                        <button
                            key={effet.nom}
                            type="button"
                            onClick={() => toggleEffet(effet.nom)}
                            className={`px-4 py-3 rounded-lg text-sm font-medium transition-all relative ${
                                selected.includes(effet.nom)
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

// Section 10: Curing & Maturation
function CuringMaturation({ data, onChange }) {
    const phases = data.curingPhases || []
    
    const ajouterPhase = () => {
        const newPhase = {
            id: Date.now(),
            dateDebut: '',
            dateFin: '',
            temperature: 20,
            humidite: 62,
            conteneur: '',
            ballotage: false,
            notes: ''
        }
        onChange('curingPhases', [...phases, newPhase])
    }
    
    const supprimerPhase = (id) => {
        onChange('curingPhases', phases.filter(p => p.id !== id))
    }
    
    const modifierPhase = (id, champ, valeur) => {
        const newPhases = phases.map(p => 
            p.id === id ? { ...p, [champ]: valeur } : p
        )
        onChange('curingPhases', newPhases)
    }

    const calculerDuree = (phase) => {
        if (phase.dateDebut && phase.dateFin) {
            const debut = new Date(phase.dateDebut)
            const fin = new Date(phase.dateFin)
            return Math.ceil((fin - debut) / (1000 * 60 * 60 * 24))
        }
        return 0
    }

    return (
        <div className="space-y-8">
            {/* Infos générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-lg font-semibold text-gray-800 mb-2 block">
                        🔪 Méthode de séchage
                    </label>
                    <select
                        value={data.methodeSechage || ''}
                        onChange={(e) => onChange('methodeSechage', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                        <option value="">Sélectionner...</option>
                        <option value="air">Séchage à l'air libre</option>
                        <option value="dark">Séchage dans le noir</option>
                        <option value="rack">Séchoir / Rack</option>
                        <option value="hang">Suspendu (branches)</option>
                        <option value="screen">Sur filet / Screen</option>
                    </select>
                </div>

                <div>
                    <label className="text-lg font-semibold text-gray-800 mb-2 block">
                        ⏱️ Durée totale de curing (jours)
                    </label>
                    <input
                        type="number"
                        value={data.dureeCuring || ''}
                        onChange={(e) => onChange('dureeCuring', e.target.value)}
                        placeholder="Ex: 14, 21, 30..."
                        className="w-full px-4 py-3 border-2 border-amber-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    />
                </div>
            </div>

            {/* Pipeline des phases de curing */}
            <div className="border-t-2 border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-800">
                        📅 Phases de curing & maturation ({phases.length})
                    </h3>
                    <button
                        type="button"
                        onClick={ajouterPhase}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg font-medium hover:bg-amber-700 transition-colors shadow-lg"
                    >
                        + Ajouter une phase
                    </button>
                </div>

                <div className="space-y-4">
                    {phases.map((phase, idx) => {
                        const duree = calculerDuree(phase)
                        return (
                            <div key={phase.id} className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200 shadow-lg">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-lg font-bold text-amber-800">Phase {idx + 1}</h4>
                                    <button
                                        type="button"
                                        onClick={() => supprimerPhase(phase.id)}
                                        className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                                    >
                                        ✕ Supprimer
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Date début</label>
                                        <input
                                            type="date"
                                            value={phase.dateDebut}
                                            onChange={(e) => modifierPhase(phase.id, 'dateDebut', e.target.value)}
                                            className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Date fin</label>
                                        <input
                                            type="date"
                                            value={phase.dateFin}
                                            onChange={(e) => modifierPhase(phase.id, 'dateFin', e.target.value)}
                                            className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>

                                    {duree > 0 && (
                                        <div className="md:col-span-2">
                                            <div className="bg-white px-4 py-2 rounded-lg border border-amber-300">
                                                <span className="text-sm text-gray-600">Durée: </span>
                                                <span className="font-bold text-amber-700">{duree} jours</span>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                            🌡️ Température (°C) <span className="font-bold text-amber-600">{phase.temperature}°</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="10"
                                            max="30"
                                            value={phase.temperature}
                                            onChange={(e) => modifierPhase(phase.id, 'temperature', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gradient-to-r from-blue-400 to-red-500 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 flex items-center gap-2">
                                            💧 Humidité (%) <span className="font-bold text-blue-600">{phase.humidite}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="40"
                                            max="80"
                                            value={phase.humidite}
                                            onChange={(e) => modifierPhase(phase.id, 'humidite', parseInt(e.target.value))}
                                            className="w-full h-2 bg-gradient-to-r from-yellow-400 to-blue-500 rounded-full appearance-none cursor-pointer"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">🏺 Type de conteneur</label>
                                        <select
                                            value={phase.conteneur}
                                            onChange={(e) => modifierPhase(phase.id, 'conteneur', e.target.value)}
                                            className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                        >
                                            <option value="">Sélectionner...</option>
                                            <option value="bocal">Bocal en verre</option>
                                            <option value="tupperware">Tupperware</option>
                                            <option value="grove">Grove Bag</option>
                                            <option value="paper">Sac papier</option>
                                            <option value="cvault">CVault</option>
                                            <option value="autre">Autre</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-3 bg-white px-4 py-3 rounded-lg border border-amber-300 cursor-pointer hover:bg-amber-50">
                                            <input
                                                type="checkbox"
                                                checked={phase.ballotage}
                                                onChange={(e) => modifierPhase(phase.id, 'ballotage', e.target.checked)}
                                                className="w-5 h-5 text-amber-600"
                                            />
                                            <span className="text-sm font-semibold text-gray-700">🔄 Ballotage quotidien</span>
                                        </label>
                                    </div>

                                    <div className="md:col-span-2">
                                        <label className="text-sm font-semibold text-gray-700 mb-1 block">Notes</label>
                                        <textarea
                                            value={phase.notes}
                                            onChange={(e) => modifierPhase(phase.id, 'notes', e.target.value)}
                                            placeholder="Odeur, texture, observations..."
                                            className="w-full px-3 py-2 border border-amber-300 rounded-lg outline-none focus:ring-2 focus:ring-amber-500"
                                            rows="2"
                                        />
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {phases.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            <p>🔪 Aucune phase de curing ajoutée</p>
                            <p className="text-sm">Cliquez sur "Ajouter une phase" pour documenter le curing</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}