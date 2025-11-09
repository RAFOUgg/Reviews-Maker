/**
 * ProductTypeCards Component
 * Affiche les 4 cards de types de produits pour créer une review
 */

import PropTypes from 'prop-types'

export default function ProductTypeCards({ isAuthenticated, onCreateReview }) {
    const productTypes = [
        {
            name: 'Fleur',
            icon: '🌿',
            gradient: 'from-green-500 via-emerald-500 to-teal-500',
            color: 'green'
        },
        {
            name: 'Hash',
            icon: '🍫',
            gradient: 'from-amber-500 via-yellow-600 to-orange-500',
            color: 'amber'
        },
        {
            name: 'Concentré',
            icon: '🔮',
            gradient: 'from-purple-500 via-violet-500 to-indigo-500',
            color: 'purple'
        },
        {
            name: 'Comestible',
            icon: '🍰',
            gradient: 'from-pink-500 via-rose-500 to-red-500',
            color: 'pink'
        }
    ]

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-4xl font-bold text-white mb-3">
                    {isAuthenticated ? 'Créer une nouvelle review' : 'Connectez-vous pour créer'}
                </h2>
                <p className="text-white/70 text-lg">
                    Choisissez le type de produit à reviewer
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {productTypes.map((type) => (
                    <button
                        key={type.name}
                        onClick={() => onCreateReview(type.name)}
                        disabled={!isAuthenticated}
                        className={`group relative overflow-hidden rounded-3xl p-8 transition-all duration-500 transform ${isAuthenticated
                                ? 'hover:scale-110 hover:rotate-2 cursor-pointer shadow-2xl hover:shadow-green-500/50'
                                : 'opacity-40 cursor-not-allowed'
                            }`}
                    >
                        {/* Gradient Background avec animation */}
                        <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-90 group-hover:opacity-100 transition-opacity`} />

                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>

                        {/* Content */}
                        <div className="relative z-10 space-y-4">
                            <div className="text-6xl transform group-hover:scale-125 transition-transform duration-500">
                                {type.icon}
                            </div>
                            <h3 className="text-2xl font-black text-white drop-shadow-lg">
                                {type.name}
                            </h3>
                        </div>

                        {/* Shine effect on hover */}
                        {isAuthenticated && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    )
}

ProductTypeCards.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    onCreateReview: PropTypes.func.isRequired
}
