import { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { usePermissions } from '../../hooks/usePermissions'
import { LiquidAvatar } from '@/components/ui/LiquidUI'
import { User, Library, Dna, LogOut, ChevronDown, Settings } from 'lucide-react'

export default function UserProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState({ top: 0, right: 0 })
    const buttonRef = useRef(null)
    const { user, logout } = useStore()
    const { hasFeature } = usePermissions()

    useLayoutEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect()
            const adjustedTop = Math.max(rect.bottom + 8, 0) // Ensure dropdown doesn't flicker at incorrect positions
            const adjustedRight = Math.max(window.innerWidth - rect.right, 0)
            setPosition({
                top: adjustedTop,
                right: adjustedRight
            })
        }
    }, [isOpen])

    if (!user) return null

    const menuItems = [
        { to: '/account', icon: User, label: 'Mon Compte', sublabel: 'Profil & Paramètres', color: 'violet' },
        { to: '/library', icon: Library, label: 'Ma bibliothèque', sublabel: 'Reviews & Statistiques', color: 'violet' },
    ]

    if (hasFeature('phenohunt')) {
        menuItems.push({ to: '/genetics', icon: Dna, label: 'Mes génétiques', sublabel: 'Bibliothèque généalogique', color: 'green' })
    }

    const dropdownContent = isOpen && (
        <AnimatePresence>
            <>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9998]"
                    onClick={() => setIsOpen(false)}
                />
                <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="fixed w-72 bg-[#0a0a1a]/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-[9999] overflow-hidden"
                    style={{
                        top: `${position.top}px`,
                        right: `${position.right}px`,
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 30px rgba(139, 92, 246, 0.1)'
                    }}
                >
                    {/* Header with user info */}
                    <div
                        className="p-4 border-b border-white/10"
                        style={{
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.1))'
                        }}
                    >
                        <div className="flex items-center gap-3">
                            <LiquidAvatar
                                src={user.avatar}
                                name={user.username}
                                size="lg"
                                glow="purple"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-white truncate">{user.username}</p>
                                <p className="text-sm text-white/60 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Menu items */}
                    <div className="py-2">
                        {menuItems.map((item) => (
                            <Link
                                key={item.to}
                                to={item.to}
                                className="flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-all duration-200 group"
                                onClick={() => setIsOpen(false)}
                            >
                                <div className={`p-2 rounded-xl bg-${item.color}-500/10 group-hover:bg-${item.color}-500/20 transition-colors`}>
                                    <item.icon className={`w-4 h-4 text-${item.color}-400`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white/90 group-hover:text-white transition-colors">{item.label}</p>
                                    <p className="text-xs text-white/40 truncate">{item.sublabel}</p>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Logout button */}
                    <div className="border-t border-white/10 p-2">
                        <button
                            onClick={() => { logout(); setIsOpen(false); }}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 hover:bg-red-500/20 transition-all duration-200 group"
                        >
                            <div className="p-2 rounded-xl bg-red-500/10 group-hover:bg-red-500/20 transition-colors">
                                <LogOut className="w-4 h-4 text-red-400" />
                            </div>
                            <span className="font-medium text-red-400 group-hover:text-red-300 transition-colors">
                                Déconnexion
                            </span>
                        </button>
                    </div>
                </motion.div>
            </>
        </AnimatePresence>
    )

    return (
        <>
            <button
                ref={buttonRef}
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 p-1.5 pr-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 group"
            >
                <LiquidAvatar
                    src={user.avatar}
                    name={user.username}
                    size="sm"
                    glow={isOpen ? 'purple' : 'none'}
                />
                <span className="hidden md:block font-medium text-white/80 group-hover:text-white transition-colors">
                    {user.username}
                </span>
                <ChevronDown className={`w-4 h-4 text-white/50 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {dropdownContent && createPortal(dropdownContent, document.body)}
        </>
    )
}


