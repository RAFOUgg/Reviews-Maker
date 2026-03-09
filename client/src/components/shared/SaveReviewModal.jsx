import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Save, Globe, Lock, Eye, X, CheckCircle, Loader2, RefreshCw, ChevronRight } from 'lucide-react'

/**
 * SaveReviewModal — Disponible à tout moment depuis le footer de création/édition
 *
 * Comportement intelligent :
 *   • Nouvelle review  → choix immédiat de la visibilité (privée / publique)
 *   • Review existante → propose d'écraser avec la même visibilité OU de la changer
 *
 * Props :
 *   onClose           ()  → fermer la modale
 *   onSaveDraft       ()  → sauvegarder comme brouillon privé
 *   onPublish         ()  → publier (appelé après que l'aperçu est validé)
 *   onOpenPreview     ()  → ouvre l'OrchardPanel (aperçu + export)
 *   isSaving          bool
 *   reviewId          string|null      (null = pas encore sauvegardée)
 *   hasPreview        bool             (true = un rendu a déjà été créé)
 *   currentVisibility 'private'|'public'|null  (visibilité actuelle de la review)
 */
export default function SaveReviewModal({
    onClose,
    onSaveDraft,
    onPublish,
    onOpenPreview,
    isSaving = false,
    reviewId = null,
    hasPreview = false,
    currentVisibility = null,
}) {
    // Existing review → start at update_choice; new review → start at choice
    const initialStep = reviewId ? 'update_choice' : 'choice'
    const [step, setStep] = useState(initialStep)   // 'update_choice' | 'choice' | 'confirm_public' | 'saved'
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const handleSaveKeepVisibility = async () => {
        if (currentVisibility === 'public') {
            await handlePublish()
        } else {
            await handleSaveDraft()
        }
    }

    const handleSaveDraft = async () => {
        setError(null)
        setSaving(true)
        try {
            await onSaveDraft()
            setStep('saved')
        } catch (e) {
            setError(e?.message || 'Erreur lors de la sauvegarde')
        } finally {
            setSaving(false)
        }
    }

    const handlePublish = async () => {
        setError(null)
        // If no preview yet, first require creating one
        if (!hasPreview) {
            setStep('confirm_public')
            return
        }
        setSaving(true)
        try {
            await onPublish()
            setStep('saved')
        } catch (e) {
            setError(e?.message || 'Erreur lors de la publication')
        } finally {
            setSaving(false)
        }
    }

    const handleConfirmOpenPreview = async () => {
        // Save draft first (if not yet saved), then open the preview
        if (!reviewId) {
            setSaving(true)
            try {
                await onSaveDraft()
            } catch (e) {
                setError(e?.message || 'Erreur lors de la sauvegarde')
                setSaving(false)
                return
            }
            setSaving(false)
        }
        onClose()
        onOpenPreview()
    }

    return (
        <AnimatePresence>
            <motion.div
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
            >
                {/* Backdrop */}
                <div
                    className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                    onClick={onClose}
                />

                {/* Modal */}
                <motion.div
                    className="relative z-10 w-full max-w-md rounded-2xl bg-[#0e0e1a] border border-white/10 shadow-2xl overflow-hidden"
                    initial={{ scale: 0.92, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    exit={{ scale: 0.92, y: 20 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
                                <Save className="w-4 h-4 text-purple-400" />
                            </div>
                            <div>
                                <h2 className="text-base font-semibold text-white">
                                    {step === 'saved'
                                        ? 'Sauvegardé ✓'
                                        : step === 'update_choice'
                                            ? 'Mettre à jour la review'
                                            : 'Sauvegarder la review'}
                                </h2>
                                {step === 'choice' && (
                                    <p className="text-xs text-gray-400 mt-0.5">Choisissez la visibilité</p>
                                )}
                                {step === 'update_choice' && (
                                    <p className="text-xs text-gray-400 mt-0.5">Écraser ou changer la visibilité ?</p>
                                )}
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Body */}
                    <div className="px-6 py-5">

                        {/* === STEP: update_choice — review existante === */}
                        {step === 'update_choice' && (
                            <div className="space-y-3">
                                {/* Option 1 — Écraser avec même visibilité */}
                                <button
                                    onClick={handleSaveKeepVisibility}
                                    disabled={saving || isSaving}
                                    className="w-full flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${currentVisibility === 'public'
                                            ? 'bg-purple-600/20 group-hover:bg-purple-600/30'
                                            : 'bg-slate-700/60 group-hover:bg-slate-700'
                                        }`}>
                                        {saving || isSaving ? (
                                            <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                                        ) : currentVisibility === 'public' ? (
                                            <Globe className="w-5 h-5 text-purple-400" />
                                        ) : (
                                            <Lock className="w-5 h-5 text-slate-300" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white text-sm flex items-center gap-2">
                                            <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                                            Écraser — même visibilité
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                            {currentVisibility === 'public'
                                                ? 'Met à jour la review et la maintient publiée dans la galerie.'
                                                : 'Met à jour le brouillon dans votre bibliothèque privée.'}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 self-center" />
                                </button>

                                {/* Option 2 — Changer la visibilité */}
                                <button
                                    onClick={() => setStep('choice')}
                                    disabled={saving || isSaving}
                                    className="w-full flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10">
                                        {currentVisibility === 'public' ? (
                                            <Lock className="w-5 h-5 text-gray-400" />
                                        ) : (
                                            <Globe className="w-5 h-5 text-gray-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-white text-sm">Changer la visibilité</div>
                                        <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                            {currentVisibility === 'public'
                                                ? 'Remettre en brouillon ou modifier les paramètres de publication.'
                                                : 'Publier dans la galerie ou modifier la visibilité.'}
                                        </div>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0 self-center" />
                                </button>

                                {error && (
                                    <div className="text-sm text-rose-400 bg-rose-400/10 rounded-lg px-3 py-2">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === STEP: choice === */}
                        {step === 'choice' && (
                            <div className="space-y-3">
                                {/* Retour si on vient du step update_choice */}
                                {reviewId && (
                                    <button
                                        onClick={() => setStep('update_choice')}
                                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-1"
                                    >
                                        ← Retour
                                    </button>
                                )}

                                {/* Option 1 — Brouillon privé */}
                                <button
                                    onClick={handleSaveDraft}
                                    disabled={saving || isSaving}
                                    className="w-full flex items-start gap-4 p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-slate-700/60 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-700">
                                        {saving || isSaving ? (
                                            <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                                        ) : (
                                            <Lock className="w-5 h-5 text-slate-300" />
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-medium text-white text-sm">Bibliothèque privée</div>
                                        <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                            Sauvegarde comme brouillon dans votre bibliothèque personnelle.
                                            Invisible publiquement.
                                        </div>
                                    </div>
                                </button>

                                {/* Option 2 — Galerie publique */}
                                <button
                                    onClick={handlePublish}
                                    disabled={saving || isSaving}
                                    className="w-full flex items-start gap-4 p-4 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 border border-purple-500/30 hover:border-purple-500/50 transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600/30">
                                        <Globe className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="font-medium text-white text-sm flex items-center gap-2">
                                            Galerie publique
                                            {!hasPreview && (
                                                <span className="text-xs bg-amber-500/20 text-amber-400 px-1.5 py-0.5 rounded font-normal">
                                                    Aperçu requis
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-400 mt-0.5 leading-relaxed">
                                            Publie votre review dans la galerie communautaire.
                                            {!hasPreview && ' Un rendu visuel est obligatoire.'}
                                        </div>
                                    </div>
                                </button>

                                {error && (
                                    <div className="text-sm text-rose-400 bg-rose-400/10 rounded-lg px-3 py-2">
                                        {error}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* === STEP: confirm_public — aperçu requis === */}
                        {step === 'confirm_public' && (
                            <div className="space-y-4">
                                <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                                    <Eye className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                                    <div className="text-sm text-amber-200 leading-relaxed">
                                        Pour publier dans la galerie publique, vous devez d'abord créer
                                        un <strong>aperçu visuel</strong> via l'Export Maker.<br />
                                        L'aperçu sera le rendu visible sur votre profil et dans la galerie.
                                    </div>
                                </div>

                                {!reviewId && (
                                    <div className="text-xs text-gray-400 bg-white/5 rounded-lg px-3 py-2">
                                        Votre review sera d'abord sauvegardée comme brouillon, puis vous pourrez créer le rendu.
                                    </div>
                                )}

                                {error && (
                                    <div className="text-sm text-rose-400 bg-rose-400/10 rounded-lg px-3 py-2">
                                        {error}
                                    </div>
                                )}

                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setStep('choice')}
                                        className="flex-1 py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-all"
                                    >
                                        Retour
                                    </button>
                                    <button
                                        onClick={handleConfirmOpenPreview}
                                        disabled={saving}
                                        className="flex-1 py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                                    >
                                        {saving ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Eye className="w-4 h-4" />
                                        )}
                                        Ouvrir l'aperçu
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* === STEP: saved === */}
                        {step === 'saved' && (
                            <div className="text-center py-4 space-y-4">
                                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                                    <CheckCircle className="w-7 h-7 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        {reviewId ? 'Review mise à jour' : 'Review sauvegardée'}
                                    </p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Retrouvez-la dans votre bibliothèque personnelle.
                                    </p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-all"
                                >
                                    Fermer
                                </button>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    )
}
