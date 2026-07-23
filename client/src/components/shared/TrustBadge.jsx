import { BadgeCheck } from 'lucide-react'

// Même libellés que BUSINESS_TYPE_LABELS dans DetailedCardTemplate.jsx/TraceabilityReportTemplate.jsx
// (dupliqué volontairement, pas importé : ces templates rendent en styles inline pour la
// rasterisation html-to-image, un import croisé risquerait de coupler leur rendu figé à ce badge
// interactif — même logique que la duplication GenAnnotation/ChainAnnotation sur ce projet).
const BUSINESS_TYPE_LABELS = {
    farm: 'Ferme',
    laboratory: 'Laboratoire',
    extractor: 'Extracteur',
    manufacturer: 'Fabricant',
    distributor: 'Distributeur',
    other: 'Producteur',
}

/**
 * Badge de confiance affiché à côté d'une mention (UserMention) ou dans la ProfileModal — le
 * contenu dépend du type de compte de la personne MENTIONNÉE, jamais de celui qui consulte.
 * `consumer`/`merchant`/rôles internes n'ont pas de certification à afficher : ne rend rien.
 *
 * @param {{ producerProfile?: {isVerified, businessType, companyName}, influencerProfile?: {isVerified, brandName} }} props
 */
export default function TrustBadge({ producerProfile, influencerProfile, className = '' }) {
    if (producerProfile?.isVerified) {
        const label = BUSINESS_TYPE_LABELS[producerProfile.businessType] || BUSINESS_TYPE_LABELS.other
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/35 text-emerald-400 text-xs font-medium ${className}`}>
                <BadgeCheck className="w-3.5 h-3.5" />
                Producteur vérifié · {label}
            </span>
        )
    }

    if (influencerProfile?.isVerified) {
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/35 text-cyan-400 text-xs font-medium ${className}`}>
                <BadgeCheck className="w-3.5 h-3.5" />
                Créateur vérifié
            </span>
        )
    }

    return null
}
