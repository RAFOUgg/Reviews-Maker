import { motion } from 'framer-motion'
import { Check, Sparkles, TrendingUp, Users } from 'lucide-react'

/**
 * AccountTypeSelector - Sélecteur de type de compte
 * Design Apple-like avec descriptions détaillées
 */
export default function AccountTypeSelector({ selected, onChange }) {
    const accountTypes = [
        {
            id: 'consumer',
            name: 'Amateur',
            price: 'Gratuit',
            icon: Users,
            color: 'from-blue-500 to-cyan-500',
            features: [
                'Accès aux sections : Infos générales, Visuel & Technique, PipeLine Curing, Odeurs, Goûts, Effets',
                'Templates prédéfinis : Compact, Détaillé, Complète',
                'Format imposé par les templates',
                'Export PNG/JPEG/PDF moyenne qualité',
                'Personnalisation limitée (thème clair/sombre, couleurs, images, typo)'
            ]
        },
        {
            id: 'influencer',
            name: 'Influenceur',
            price: '15.99€/mois',
            icon: TrendingUp,
            color: 'from-pink-500 to-rose-500',
            features: [
                'Accès aux aperçus détaillés et complets',
                'Système drag & drop pour composition',
                'Configuration avancée des rendus',
                'Export haute qualité : PNG/JPEG/SVG/PDF 300dpi',
                'Toutes les fonctionnalités Amateur incluses'
            ]
        },
        {
            id: 'producer',
            name: 'Producteur',
            price: '29.99€/mois',
            icon: Sparkles,
            color: 'from-purple-500 to-indigo-500',
            features: [
                'Accès à TOUS les templates (y compris Personnalisé)',
                'Mode contenus zone personnalisable avec drag & drop',
                'Export très haute qualité : PNG/JPEG/PDF 300dpi, SVG, CSV, JSON, HTML',
                'Personnalisation avancée complète (polices, filigrane, agencement)',
                'PipeLine configurable pour exports détaillés',
                'Bibliothèque génétique avec arbres généalogiques',
                'Toutes les fonctionnalités Influenceur incluses'
            ]
        }
    ]

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-center mb-6 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">
                Choisissez votre type de compte
            </h3>

            <div className="grid md:grid-cols-3 gap-4">
                {accountTypes.map((type) => {
                    const Icon = type.icon
                    const isSelected = selected === type.id

                    return (
                        <motion.button
                            key={type.id}
                            onClick={() => onChange(type.id)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative p-6 rounded-2xl text-left transition-all duration-300 ${isSelected
                                    ? 'bg-white shadow-2xl ring-4 ring-purple-500'
                                    : 'bg-white/80 hover:bg-white shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {/* Badge sélectionné */}
                            {isSelected && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg"
                                >
                                    <Check className="w-5 h-5 text-white" strokeWidth={3} />
                                </motion.div>
                            )}

                            {/* Header avec icône et prix */}
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-xl bg-gradient-to-br ${type.color}`}>
                                    <Icon className="w-6 h-6 text-white" />
                                </div>
                                <div className="text-right">
                                    <div className={`text-2xl font-bold bg-gradient-to-br ${type.color} bg-clip-text text-transparent`}>
                                        {type.price}
                                    </div>
                                    {type.id !== 'consumer' && (
                                        <div className="text-xs text-gray-700 font-medium">par mois</div>
                                    )}
                                </div>
                            </div>

                            {/* Nom du compte */}
                            <h4 className={`text-xl font-bold mb-3 bg-gradient-to-br ${type.color} bg-clip-text text-transparent`}>
                                {type.name}
                            </h4>

                            {/* Features list */}
                            <ul className="space-y-2">
                                {type.features.map((feature, idx) => (
                                    <li key={idx} className="flex items-start gap-2 text-sm text-gray-800">
                                        <Check className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {/* Obligations légales */}
                            {(type.id === 'producer' || type.id === 'influencer') && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <p className="text-xs text-gray-700 italic">
                                        ⚠️ Vérification d'identité (KYC) requise
                                    </p>
                                </div>
                            )}
                        </motion.button>
                    )
                })}
            </div>

            {/* Note légale */}
            <p className="text-center text-xs text-gray-700 mt-6 font-medium">
                Vous devez avoir {'>'}18 ans (ou {'>'}21 selon votre pays) pour créer un compte.
                En continuant, vous acceptez nos CGU et notre politique de confidentialité.
            </p>
        </div>
    )
}
