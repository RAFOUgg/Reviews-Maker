import { useState, useRef, useLayoutEffect } from 'react'
import { createPortal } from 'react-dom'
import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function UserProfileDropdown() {
    const [isOpen, setIsOpen] = useState(false)
    const [position, setPosition] = useState({ top: 0, right: 0 })
    const buttonRef = useRef(null)
    const { user, logout } = useStore()

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

    const dropdownContent = isOpen && (
        <>
            <div
                className="fixed inset-0 z-[9998]"
                onClick={() => setIsOpen(false)}
            />
            <div
                className="fixed w-64 bg-theme-input backdrop-blur-xl rounded-xl shadow-2xl border border-theme z-[9999] overflow-hidden"
                style={{
                    top: `${position.top}px`,
                    right: `${position.right}px`
                }}
            >
                <div className="p-4 border-b border-theme bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))]">
                    <div className="flex items-center gap-3">
                        <img
                            src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff`}
                            alt={user.username}
                            className="w-12 h-12 rounded-full border-2 border-white"
                        />
                        <div>
                            <p className="font-semibold text-white">{user.username}</p>
                            <p className="text-sm text-white opacity-90">{user.email}</p>
                        </div>
                    </div>
                </div>
                <div className="py-2">
                    <Link to="/account" className="flex items-center gap-3 px-4 py-3 hover:bg-theme-secondary transition-colors" onClick={() => setIsOpen(false)}>
                        <svg className="w-5 h-5 text-[rgb(var(--color-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <div>
                            <p className="font-medium text-[rgb(var(--text-primary))]">Mon Compte</p>
                            <p className="text-xs text-[rgb(var(--text-secondary))] opacity-80">Profil & Paramètres</p>
                        </div>
                    </Link>
                    <Link to="/library" className="flex items-center gap-3 px-4 py-3 hover:bg-theme-secondary transition-colors" onClick={() => setIsOpen(false)}>
                        <svg className="w-5 h-5 text-[rgb(var(--color-primary))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                        <div>
                            <p className="font-medium text-[rgb(var(--text-primary))]">Ma bibliothèque</p>
                            <p className="text-xs text-[rgb(var(--text-secondary))] opacity-80">Gérer mes reviews</p>
                        </div>
                    </Link>
                    <Link to="/stats" className="flex items-center gap-3 px-4 py-3 hover:bg-theme-secondary transition-colors" onClick={() => setIsOpen(false)}>
                        <svg className="w-5 h-5 text-[rgb(var(--color-accent))]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <div>
                            <p className="font-medium text-[rgb(var(--text-primary))]">Mes statistiques</p>
                            <p className="text-xs text-[rgb(var(--text-secondary))] opacity-80">Voir mes stats détaillées</p>
                        </div>
                    </Link>
                </div>
                <div className="border-t border-theme py-2">
                    <button onClick={() => { logout(); setIsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-3 bg-[rgba(220,38,38,0.15)] hover:bg-[rgba(220,38,38,0.3)] transition-colors text-[rgb(220,38,38)] font-medium border-t border-[rgba(220,38,38,0.2)]">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        <p className="font-medium">Déconnexion</p>
                    </button>
                </div>
            </div>
        </>
    )

    return (
        <>
            <button ref={buttonRef} onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 p-2 rounded-lg hover:bg-theme-secondary transition-colors">
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username)}&background=6366f1&color=fff`} alt={user.username} className="w-10 h-10 rounded-full border-2 border-[rgb(var(--color-primary))]" />
                <span className="hidden md:block font-medium text-[rgb(var(--text-primary))]">{user.username}</span>
                <svg className={`w-4 h-4 text-[rgb(var(--text-secondary))] transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {dropdownContent && createPortal(dropdownContent, document.body)}
        </>
    )
}


