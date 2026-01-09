/**
 * CreateReviewFormWrapper - Composant wrapper unifié pour TOUS les types
 * Utilise la structure et l'apparence de Fleur (la plus avancée)
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
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600 mx-auto mb-4"></div>
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
            {/* Orchard Preview Button - Mobile optimized */}
            <div className="flex justify-end mb-4">
                <button
                    onClick={() => setShowOrchard(!showOrchard)}
                    className="px-4 py-2 bg-purple-600/20 hover:bg-purple-600/30 border border-purple-500/50 text-purple-300 rounded-lg text-sm font-medium transition-all"
                >
                    <Eye className="w-4 h-4 inline mr-2" />
                    Aperçu
                </button>
            </div>

            {/* Section Content */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentSection}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className="space-y-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className="text-3xl">{currentSectionData?.icon}</span>
                        <div>
                            <h2 className="text-xl font-semibold text-gray-100">
                                {currentSectionData?.title}
                                {currentSectionData?.required && <span className="text-red-500 ml-2">*</span>}
                            </h2>
                        </div>
                    </div>

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
                        <div className="text-center text-gray-400 py-8">
                            Composant non trouvé pour {currentSectionData?.id}
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Orchard Preview Panel */}
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
