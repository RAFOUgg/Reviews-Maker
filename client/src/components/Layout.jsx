import { Outlet, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import UserProfileDropdown from './UserProfileDropdown'

export default function Layout() {
    const { user, isAuthenticated } = useAuth()

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="glass sticky top-0 z-[100] border-b border-dark-border/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo - Toujours visible avec les couleurs du thème */}
                        <Link to="/" className="flex items-center space-x-3 group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--color-primary))] to-[rgb(var(--color-accent))] flex items-center justify-center shadow-lg group-hover:shadow-[0_0_20px_rgba(var(--color-accent),0.5)] transition-all">
                                <span className="text-2xl">🌿</span>
                            </div>
                            <span className="text-xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--color-accent))] transition-colors">Reviews Maker</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center space-x-6">
                            {!isAuthenticated ? (
                                <Link
                                    to="/choose-account"
                                    className="btn btn-secondary flex items-center gap-2"
                                >
                                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-3.31 0-6 2.02-6 4.5 0 .28.22.5.5.5h11c.28 0 .5-.22.5-.5C18 16.02 15.31 14 12 14Z" />
                                    </svg>
                                    Se connecter
                                </Link>
                            ) : (
                                <UserProfileDropdown />
                            )}
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>

            {/* Footer */}
            <footer className="glass border-t border-dark-border/50 py-6 mt-auto">
                <div className="container mx-auto px-4 text-center text-dark-muted">
                    <p>© 2025 Reviews Maker - Fait avec 💜 et 🌿</p>
                </div>
            </footer>
        </div>
    )
}
