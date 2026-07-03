import React, { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useWizardEngine } from './useWizardEngine'
import WizardProgressBar from './WizardProgressBar'
import WizardQuestion from './WizardQuestion'

/**
 * Orchestration générique du mode automatique : une question à la fois. Ne connaît
 * aucun produit spécifique — seul `questions` (le schéma déclaratif) change par type
 * de review. Réutilise `handleChange` du hook useXxxForm existant, donc l'autosave
 * déjà branché sur [formData] dans chaque CreateXReview/index.jsx continue de fonctionner
 * sans aucune modification.
 */
export default function WizardFlow({
    questions,
    formData,
    handleChange,
    photos,
    handlePhotoUpload,
    removePhoto,
    title,
    onExitToClassic,
    onComplete,
    onOpenHandoff,
    saving = false,
    isDirty = false,
    onSave,
}) {
    const {
        question,
        currentIndex,
        total,
        isLast,
        isFirst,
        currentValue,
        onChange,
        onSkip,
        goNext,
        goPrevious,
    } = useWizardEngine({ questions, formData, handleChange })

    const handleNext = () => {
        if (isLast) {
            onComplete?.()
            return
        }
        goNext()
    }

    // Le conteneur est le même noeud DOM d'une question à l'autre (seul l'enfant animé change) —
    // sans ce reset, une longue question (ex: photos) laisse le scroll en place et masque le
    // titre de la question suivante, plus courte.
    const mainRef = useRef(null)
    useEffect(() => {
        if (mainRef.current) mainRef.current.scrollTop = 0
    }, [currentIndex])

    if (!question) return null

    return (
        <div className="h-full bg-[#07070f] relative flex flex-col overflow-hidden">
            <WizardProgressBar
                currentIndex={currentIndex}
                total={total}
                sectionLabel={question.title || title}
                onExitToClassic={onExitToClassic}
            />

            <main ref={mainRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6 pb-24">
                <div className="max-w-lg mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={question.id}
                            initial={{ opacity: 0, x: 24 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -24 }}
                            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                        >
                            <WizardQuestion
                                question={question}
                                value={currentValue}
                                onChange={onChange}
                                onSkip={onSkip}
                                onOpenHandoff={onOpenHandoff}
                                photos={photos}
                                handlePhotoUpload={handlePhotoUpload}
                                removePhoto={removePhoto}
                            />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>

            <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#07070f] via-[#07070f] to-transparent border-t border-white/10 backdrop-blur-xl z-50 safe-area-inset-bottom">
                <div className="px-4 py-2.5 max-w-lg mx-auto">
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={goPrevious}
                            disabled={isFirst}
                            className={`flex items-center justify-center rounded-xl font-medium transition-all px-4 py-2.5 text-base ${isFirst ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white/10 hover:bg-white/20 text-white active:scale-95'}`}
                        >
                            ←
                        </button>

                        {onSave && (
                            <button
                                onClick={onSave}
                                disabled={!isDirty || saving}
                                title={saving ? 'Sauvegarde en cours…' : isDirty ? 'Sauvegarder maintenant' : 'Déjà sauvegardé'}
                                className={`rounded-xl transition-all font-medium px-3 py-2.5 text-sm flex-shrink-0 ${isDirty && !saving ? 'bg-purple-600 hover:bg-purple-700 text-white active:scale-95' : 'bg-white/5 text-white/30 cursor-not-allowed'}`}
                            >
                                {saving ? 'Sauvegarde…' : 'Sauvegarder'}
                            </button>
                        )}

                        <button
                            onClick={handleNext}
                            className="flex-1 flex items-center justify-center rounded-xl font-medium transition-all px-4 py-2.5 text-base bg-purple-600 hover:bg-purple-700 text-white active:scale-95"
                        >
                            {isLast ? 'Terminer' : 'Suivant →'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
