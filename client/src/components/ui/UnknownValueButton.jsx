import { HelpCircle } from 'lucide-react'

/**
 * Petit bouton "Information inconnue" à placer dans le label d'un champ pour le laisser
 * vide/non évalué et passer à la suite (formulaire classique ou wizard).
 */
export default function UnknownValueButton({ onClick, label = 'Information inconnue' }) {
    return (
        <button
            type="button"
            onClick={onClick}
            title="Laisser ce champ non renseigné"
            data-testid="unknown-value-button"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-white/50 hover:text-white/70 text-[11px] font-medium transition-colors"
        >
            <HelpCircle className="w-3 h-3" />
            {label}
        </button>
    )
}
