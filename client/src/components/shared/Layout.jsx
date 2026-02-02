/**
 * Layout - Composant de mise en page principale
 * Liquid Glass UI Design System
 */
import { useState } from 'react';
import { Outlet, Link, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth.js';
import { usePermissions } from '../../hooks/usePermissions';
import UserProfileDropdown from '../account/UserProfileDropdown';
import { LiquidButton, LiquidAvatar, LiquidModal } from '@/components/ui/LiquidUI';
import { Home, Library, BarChart3, Menu, X, Dna, Image } from 'lucide-react';

export default function Layout() {
    const { user, isAuthenticated } = useAuth();
    const { hasFeature } = usePermissions();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Navigation items
    const navItems = [
        { to: '/', label: 'Accueil', icon: Home, show: true },
        { to: '/library', label: 'Bibliothèque', icon: Library, show: isAuthenticated },
        { to: '/gallery', label: 'Galerie', icon: Image, show: true },
        { to: '/stats', label: 'Statistiques', icon: BarChart3, show: isAuthenticated },
        { to: '/genetics', label: 'Génétiques', icon: Dna, show: isAuthenticated && hasFeature('phenohunt') },
    ];

    const visibleNavItems = navItems.filter(item => item.show);

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#07070f] via-[#0a0a1a] to-[#07070f] text-white">
            {/* Navigation - Glassmorphism navbar */}
            <nav className="fixed top-0 left-0 right-0 z-[100] bg-white/5 backdrop-blur-xl border-b border-white/10">
                <div className="container mx-auto px-4 py-3">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <motion.div
                                whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(139, 92, 246, 0.4)' }}
                                whileTap={{ scale: 0.98 }}
                                className="w-10 h-10 rounded-xl overflow-hidden border border-white/20 shadow-lg group-hover:border-violet-500/50 transition-all duration-300"
                                style={{ boxShadow: '0 0 20px rgba(139, 92, 246, 0.2)' }}
                            >
                                <img
                                    src="/branding_logo.png"
                                    alt="Terpologie Reviews Maker"
                                    className="w-full h-full object-cover"
                                />
                            </motion.div>
                            <span className="text-xl font-bold text-white group-hover:text-violet-400 transition-colors duration-300 hidden sm:block">
                                Reviews Maker
                            </span>
                        </Link>

                        {/* Desktop Navigation Links */}
                        <div className="hidden md:flex items-center space-x-1">
                            {visibleNavItems.map((item) => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    className={({ isActive }) => `
                                        flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300
                                        ${isActive
                                            ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]'
                                            : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                                        }
                                    `}
                                >
                                    <item.icon className="w-4 h-4" />
                                    <span>{item.label}</span>
                                </NavLink>
                            ))}
                        </div>

                        {/* Right side: Auth / User */}
                        <div className="flex items-center space-x-3">
                            {!isAuthenticated ? (
                                <div className="hidden sm:flex items-center space-x-2">
                                    <Link to="/login">
                                        <LiquidButton variant="ghost" size="sm">
                                            Connexion
                                        </LiquidButton>
                                    </Link>
                                    <Link to="/choose-account">
                                        <LiquidButton variant="primary" size="sm" glow="purple">
                                            Créer un compte
                                        </LiquidButton>
                                    </Link>
                                </div>
                            ) : (
                                <UserProfileDropdown />
                            )}

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(true)}
                                className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all"
                            >
                                <Menu className="w-5 h-5 text-white" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Subtle glow line under navbar */}
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.5), transparent)'
                    }}
                />
            </nav>

            {/* Mobile Menu Modal */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[150] md:hidden"
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setMobileMenuOpen(false)}
                        />

                        {/* Slide-in panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="absolute right-0 top-0 bottom-0 w-72 bg-[#0a0a1a]/95 backdrop-blur-xl border-l border-white/10"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-white/10">
                                <span className="text-lg font-semibold text-white">Menu</span>
                                <button
                                    onClick={() => setMobileMenuOpen(false)}
                                    className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-all"
                                >
                                    <X className="w-5 h-5 text-white" />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <div className="p-4 space-y-2">
                                {visibleNavItems.map((item) => (
                                    <NavLink
                                        key={item.to}
                                        to={item.to}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className={({ isActive }) => `
                                            flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                                            ${isActive
                                                ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                                : 'text-white/70 hover:text-white hover:bg-white/10 border border-transparent'
                                            }
                                        `}
                                    >
                                        <item.icon className="w-5 h-5" />
                                        <span>{item.label}</span>
                                    </NavLink>
                                ))}
                            </div>

                            {/* Auth buttons for mobile */}
                            {!isAuthenticated && (
                                <div className="p-4 border-t border-white/10 space-y-3">
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="block">
                                        <LiquidButton variant="ghost" size="md" className="w-full">
                                            Connexion
                                        </LiquidButton>
                                    </Link>
                                    <Link to="/choose-account" onClick={() => setMobileMenuOpen(false)} className="block">
                                        <LiquidButton variant="primary" size="md" glow="purple" className="w-full">
                                            Créer un compte
                                        </LiquidButton>
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Content - with top padding for fixed navbar */}
            <main className="flex-1 w-full pt-20 px-4 py-8">
                <Outlet />
            </main>

            {/* Footer - Glassmorphism style */}
            <footer className="relative bg-white/5 backdrop-blur-xl border-t border-white/10 py-8 mt-auto">
                {/* Subtle glow line */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
                    style={{
                        background: 'linear-gradient(90deg, transparent, rgba(139, 92, 246, 0.3), transparent)'
                    }}
                />
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        {/* Logo & Copyright */}
                        <div className="flex items-center gap-3">
                            <img
                                src="/branding_logo.png"
                                alt="Terpologie"
                                className="w-8 h-8 rounded-lg opacity-60"
                            />
                            <p className="text-white/40 text-sm">
                                © 2026 Reviews Maker - Fait avec 💜 et 🌿
                            </p>
                        </div>

                        {/* Footer Links */}
                        <div className="flex items-center gap-6 text-sm text-white/40">
                            <Link to="/disclaimer-rdr" className="hover:text-white/70 transition-colors">
                                Mentions légales
                            </Link>
                            <a
                                href="https://github.com/terpologie"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-white/70 transition-colors"
                            >
                                GitHub
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}


