/**
 * HeroSection Component
 * Section hero de la page d'accueil avec titre animé et message de bienvenue
 */

import PropTypes from 'prop-types'

export default function HeroSection({ user, isAuthenticated }) {
    return (
        <div className="text-center space-y-6 animate-fade-in">
            <div className="relative inline-block">
                <h1 className="text-7xl font-black text-white drop-shadow-2xl">
                    Reviews-Maker
                </h1>
                <div className="absolute -inset-4 bg-white/10 blur-3xl -z-10"></div>
            </div>
            <p className="text-xl text-white/80 font-light">
                Créez et partagez vos avis sur les produits cannabis
            </p>
            {isAuthenticated && user && (
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                    <span className="text-white/90">Bienvenue</span>
                    <span className="font-bold text-white">{user.username}</span>
                    <span className="text-2xl">👋</span>
                </div>
            )}
        </div>
    )
}

HeroSection.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string
    }),
    isAuthenticated: PropTypes.bool.isRequired
}
