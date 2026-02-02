/**
 * HeroSection Component
 * Section hero de la page d'accueil avec titre animé et message de bienvenue
 * Liquid Glass UI Design System
 */

import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, UserPlus } from 'lucide-react';
import { LiquidButton } from '@/components/ui/LiquidUI';

export default function HeroSection({ user, isAuthenticated }) {
    return (
        <div className="text-center space-y-6 md:space-y-8 px-3 md:px-0">
            {/* Titre principal avec glow effect */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="relative inline-block"
            >
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white drop-shadow-2xl leading-tight">
                    Terpologie
                </h1>
                {/* Glow background */}
                <div
                    className="absolute -inset-8 -z-10 blur-3xl opacity-50"
                    style={{
                        background: 'radial-gradient(ellipse, rgba(139, 92, 246, 0.4), rgba(59, 130, 246, 0.2), transparent 70%)'
                    }}
                />
            </motion.div>

            {/* Sous-titre */}
            <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-sm md:text-lg lg:text-xl text-white/70 font-light px-2"
            >
                Créez et partagez vos avis sur les produits cannabis
            </motion.p>

            {/* Welcome message / Auth buttons */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {isAuthenticated && user ? (
                    <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 border border-white/20 backdrop-blur-md">
                        <span className="text-white/80">Bienvenue</span>
                        <span className="font-bold text-white">{user.username}</span>
                        <span className="text-2xl">👋</span>
                    </div>
                ) : (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/login">
                            <LiquidButton
                                variant="ghost"
                                icon={LogIn}
                                className="min-w-[160px]"
                            >
                                Se connecter
                            </LiquidButton>
                        </Link>
                        <Link to="/choose-account">
                            <LiquidButton
                                variant="primary"
                                icon={UserPlus}
                                className="min-w-[160px]"
                                style={{
                                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(59, 130, 246, 0.3))',
                                    borderColor: 'rgba(139, 92, 246, 0.5)'
                                }}
                            >
                                Créer un compte
                            </LiquidButton>
                        </Link>
                    </div>
                )}
            </motion.div>
        </div>
    );
}

HeroSection.propTypes = {
    user: PropTypes.shape({
        username: PropTypes.string
    }),
    isAuthenticated: PropTypes.bool.isRequired
};


