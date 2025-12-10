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
                            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg group-hover:shadow-[0_0_20px_rgba(var(--color-accent),0.5)] transition-all">
                                <img
                                    src="/branding_logo.png"
                                    alt="Terpologie Reviews Maker"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <span className="text-xl font-bold text-[rgb(var(--text-primary))] group-hover:text-[rgb(var(--color-accent))] transition-colors">Reviews Maker</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center space-x-6">
                            {!isAuthenticated ? (
                                <Link
                                    to="/choose-account"
                                    className="btn btn-secondary px-4 py-2 font-semibold"
                                >
                                    Choisir mon compte
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
