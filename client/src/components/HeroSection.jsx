/**
 * HeroSection Component
 * Section hero de la page d'accueil avec titre animé et message de bienvenue
 */

import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

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
            {isAuthenticated && user ? (
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 border border-white/20 backdrop-blur-sm">
                    <span className="text-white/90">Bienvenue</span>
                    <span className="font-bold text-white">{user.username}</span>
                    <span className="text-2xl">👋</span>
                </div>
            ) : (
                <Link
                    to="/choose-account"
                    className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white text-gray-900 font-semibold shadow-lg hover:shadow-xl transition-shadow"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-3.31 0-6 2.02-6 4.5 0 .28.22.5.5.5h11c.28 0 .5-.22.5-.5C18 16.02 15.31 14 12 14Z" />
                    </svg>
                    Connexion
                </Link>
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
