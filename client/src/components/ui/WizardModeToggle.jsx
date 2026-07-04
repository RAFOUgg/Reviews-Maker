import { Sparkles } from 'lucide-react'

/**
 * Bouton-poussoir (toggle) pour basculer entre le mode automatique (wizard une-question-à-
 * la-fois) et le formulaire classique. Utilisé à deux endroits avec un style identique :
 * `WizardProgressBar` (en haut du wizard, pour revenir au classique) et le footer de
 * `ResponsiveCreateReviewLayout` (en bas du classique, pour activer le wizard) — un seul
 * composant pour garder l'apparence et le comportement cohérents entre les deux vues.
 */
export default function WizardModeToggle({ active, onClick, compact = false }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title={active ? 'Revenir au formulaire classique' : 'Passer en mode automatique (une question à la fois)'}
            className={`inline-flex items-center gap-1.5 rounded-full border transition-colors flex-shrink-0 ${compact ? 'px-2 py-1 text-[11px]' : 'px-3 py-1.5 text-xs'
                } ${active
                    ? 'bg-violet-500/90 border-violet-400 text-white'
                    : 'bg-violet-500/15 border-violet-500/30 text-violet-200 hover:bg-violet-500/25'
                }`}
        >
            <Sparkles className={compact ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
            <span className="font-medium">Mode auto</span>
            <span className={`relative inline-flex h-4 w-7 items-center rounded-full transition-colors ${active ? 'bg-white/40' : 'bg-white/15'}`}>
                <span
                    className={`inline-block h-3 w-3 transform rounded-full bg-white shadow transition-transform ${active ? 'translate-x-3.5' : 'translate-x-0.5'
                        }`}
                />
            </span>
        </button>
    )
}
