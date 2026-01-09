/**
 * CreateReviewFormWrapper - Composant wrapper unifié pour TOUS les types
 * Utilise la structure et l'apparence de Fleur (la plus avancée)
 * OPTIMISÉ MOBILE FIRST - Responsive et accessible sur tous les appareils
 * 
 * Paramètres:
 * - productType: 'flower' | 'hash' | 'concentrate' | 'edible'
 * - sections: array de sections avec { id, icon, title, required?, premium? }
 * - sectionComponents: objet mapant id → composant React
 * - formData, handleChange, photos, etc.
 * - onSave, onSubmit
 */

import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Eye } from 'lucide-react'
import { useResponsiveLayout } from '../hooks/useResponsiveLayout'
import { ResponsiveCreateReviewLayout } from './ResponsiveCreateReviewLayout'
import OrchardPanel from './orchard/OrchardPanel'

const CreateReviewFormWrapper = ({
    productType = 'flower',
    sections = [],
    sectionComponents = {},
    formData = {},
    handleChange = () => {},
    photos = [],
    handlePhotoUpload = () => {},
    removePhoto = () => {},
    onSave = async () => {},
    onSubmit = async () => {},
    title = 'Créer une review',
    subtitle = 'Documentez votre produit en détail',
    loading = false,
    saving = false,
    onLoadingChange = () => {},
    onSavingChange = () => {}
}) => {
    const [currentSection, setCurrentSection] = useState(0)
    const [showOrchard, setShowOrchard] = useState(false)
    const layout = useResponsiveLayout()
    const scrollContainerRef = useRef(null)

    // Synchroniser les photos avec formData
    useEffect(() => {
        if (photos.length > 0) {
            handleChange('photos', photos)
        }
    }, [photos])

    // Emojis pour le carousel
    const sectionEmojis = sections.map(s => s.icon)

    // Current section data avec validation
    const currentSectionData = sections[currentSection] || sections[0]

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Chargement...</p>
                </div>
            </div>
        )
    }

    // Obtenir le composant pour la section actuelle
    const SectionComponent = sectionComponents[currentSectionData?.id]

    return (
        <ResponsiveCreateReviewLayout
            currentSection={currentSection}
            totalSections={sections.length}
            onSectionChange={setCurrentSection}
            title={title}
            subtitle={subtitle}
            sectionEmojis={sectionEmojis}
            showProgress={true}
            onSave={onSave}
            onSubmit={onSubmit}
            isSaving={saving}
        >
            {/* Aperçu Button - Mobile Optimized */}
            <div className={`flex justify-end mb-4 ${layout.isMobile ? 'px-0' : 'px-0'}`}>
                <button
                    onClick={() => setShowOrchard(!showOrchard)}
                    className={`flex items-center gap-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg font-medium transition-all ${
                        layout.isMobile 
                            ? 'px-3 py-2 text-xs'
                            : 'px-4 py-2 text-sm'
                    }`}
                >
                    <Eye className={layout.isMobile ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
                    <span>{layout.isMobile ? 'Aperçu' : 'Aperçu'}</span>
                </button>
            </div>

            {/* Section Header - Mobile Optimized */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`header-${currentSection}`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.2 }}
                    className={`flex items-start gap-3 mb-4 ${layout.isMobile ? '-mx-4 px-4 py-3 bg-gray-800/30 border-b border-gray-700/50' : 'p-0'}`}
                >
                    <span className={layout.isMobile ? 'text-2xl flex-shrink-0' : 'text-3xl flex-shrink-0'}>
                        {currentSectionData?.icon}
                    </span>
                    <div className="flex-1 min-w-0">
                        <h2 className={`font-semibold text-gray-100 ${
                            layout.isMobile ? 'text-base' : 'text-xl'
                        }`}>
                            {currentSectionData?.title}
                            {currentSectionData?.required && <span className="text-red-500 ml-2">*</span>}
                        </h2>
                        {layout.isMobile && (
                            <p className="text-xs text-gray-400 mt-0.5">Étape {currentSection + 1}/{sections.length}</p>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Section Content - Mobile Optimized */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`content-${currentSection}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.25 }}
                    className={`space-y-4 ${layout.isMobile ? '' : 'space-y-6'}`}
                >
                    {/* Render current section component */}
                    {SectionComponent ? (
                        <SectionComponent
                            formData={formData}
                            handleChange={handleChange}
                            photos={photos}
                            handlePhotoUpload={handlePhotoUpload}
                            removePhoto={removePhoto}
                            productType={productType}
                        />
                    ) : (
                        <div className={`text-center text-gray-400 py-8 ${
                            layout.isMobile ? 'text-xs' : 'text-sm'
                        }`}>
                            Composant non trouvé pour {currentSectionData?.id}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Orchard Preview Panel - Mobile Optimized */}
            {showOrchard && (
                <OrchardPanel
                    reviewData={formData}
                    productType={productType}
                    onClose={() => setShowOrchard(false)}
                />
            )}
        </ResponsiveCreateReviewLayout>
    )
}

export default CreateReviewFormWrapper
