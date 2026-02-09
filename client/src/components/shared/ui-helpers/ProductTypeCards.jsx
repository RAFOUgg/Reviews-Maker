/**
 * ProductTypeCards Component
 * Affiche les 4 cards de types de produits pour créer une review
 * Liquid Glass UI Design System
 */

import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function ProductTypeCards({ isAuthenticated, onCreateReview }) {
    const productTypes = [
        {
            name: 'flower',
            icon: '🌿',
            gradient: 'from-green-500/30 to-emerald-500/30',
            border: 'border-green-500/50',
            glow: 'rgba(34, 197, 94, 0.4)'
        },
        {
            name: 'Hash',
            icon: '🍫',
            gradient: 'from-amber-500/30 to-orange-500/30',
            border: 'border-amber-500/50',
            glow: 'rgba(245, 158, 11, 0.4)'
        },
        {
            name: 'Concentré',
            icon: '🔮',
            gradient: 'from-violet-500/30 to-purple-500/30',
            border: 'border-violet-500/50',
            glow: 'rgba(139, 92, 246, 0.4)'
        },
        {
            name: 'Comestible',
            icon: '🍰',
            gradient: 'from-rose-500/30 to-pink-500/30',
            border: 'border-rose-500/50',
            glow: 'rgba(244, 63, 94, 0.4)'
        }
    ];

    return (
        <div className="space-y-6">
            <div className="text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
                    {isAuthenticated ? 'Créer une nouvelle review' : 'Connectez-vous pour créer'}
                </h2>
                <p className="text-white/60 text-lg">
                    Choisissez le type de produit à reviewer
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
                {productTypes.map((type, index) => (
                    <motion.button
                        key={type.name}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={isAuthenticated ? { scale: 1.05, y: -5 } : {}}
                        whileTap={isAuthenticated ? { scale: 0.98 } : {}}
                        onClick={() => isAuthenticated && onCreateReview(type.name)}
                        disabled={!isAuthenticated}
                        className={`group relative overflow-hidden rounded-2xl p-8 transition-all duration-300 backdrop-blur-md border ${type.border} bg-gradient-to-br ${type.gradient} ${isAuthenticated
                            ? 'cursor-pointer hover:shadow-2xl'
                            : 'opacity-40 cursor-not-allowed'
                            }`}
                        style={{
                            boxShadow: isAuthenticated ? `0 0 30px ${type.glow}` : 'none'
                        }}
                    >
                        {/* Glow effect background */}
                        <div
                            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                            style={{
                                background: `radial-gradient(circle at center, ${type.glow}, transparent 70%)`
                            }}
                        />

                        {/* Content */}
                        <div className="relative z-10 space-y-4">
                            <motion.div
                                className="text-6xl"
                                whileHover={isAuthenticated ? { scale: 1.2, rotate: 5 } : {}}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                {type.icon}
                            </motion.div>
                            <h3 className="text-2xl font-bold text-white">
                                {type.name}
                            </h3>
                        </div>

                        {/* Shine effect on hover */}
                        {isAuthenticated && (
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                        )}
                    </motion.button>
                ))}
            </div>
        </div>
    );
}

ProductTypeCards.propTypes = {
    isAuthenticated: PropTypes.bool.isRequired,
    onCreateReview: PropTypes.func.isRequired
};


