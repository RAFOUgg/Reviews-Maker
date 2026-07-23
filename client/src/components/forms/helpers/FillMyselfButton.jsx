import { User } from 'lucide-react'
import { useStore } from '../../../store/useStore'

/**
 * Petit bouton "Moi-même" à placer dans le label d'un champ (cultivateur, hashmaker,
 * fabricant, etc.) pour remplir automatiquement le champ avec l'identité du compte connecté.
 * `onFill(text, userId)` — le 2e argument permet au champ de garder un lien de compte réel
 * (cf. `<field>LinkedUserId` sur FlowerReview/HashReview/ConcentrateReview/EdibleReview) pour
 * qu'une mention cliquable (UserMention) puisse être affichée plus tard sur la review.
 */
export default function FillMyselfButton({ onFill }) {
    const { user } = useStore()
    if (!user?.username) return null

    return (
        <button
            type="button"
            onClick={() => onFill(user.username, user.id)}
            title="Remplir avec mon nom"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 hover:text-violet-200 text-[11px] font-medium transition-colors"
        >
            <User className="w-3 h-3" />
            Moi-même
        </button>
    )
}
