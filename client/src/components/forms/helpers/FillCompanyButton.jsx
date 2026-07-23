import { Factory } from 'lucide-react'
import { useProducerProfile } from '../../../hooks/useProducerProfile'

/**
 * Petit bouton "Ma production" à placer dans le label d'un champ (farm, laboratoire de
 * production, etc.) pour remplir automatiquement le champ avec l'entreprise déclarée
 * par le compte producteur connecté. Même principe que FillMyselfButton — `onFill(text,
 * null, producerProfileId)` pour poser le lien de compte côté entreprise plutôt que personnel.
 */
export default function FillCompanyButton({ onFill }) {
    const { producerProfile } = useProducerProfile()
    if (!producerProfile?.companyName) return null

    return (
        <button
            type="button"
            onClick={() => onFill(producerProfile.companyName, null, producerProfile.id)}
            title="Remplir avec mon entreprise déclarée"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-200 text-[11px] font-medium transition-colors"
        >
            <Factory className="w-3 h-3" />
            Ma production
        </button>
    )
}
