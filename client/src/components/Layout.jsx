import { Outlet, Link } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function Layout() {
    const { user, isAuthenticated } = useStore()

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="glass sticky top-0 z-50 border-b border-dark-border/50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        {/* Logo */}
                        <Link to="/" className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                                <span className="text-2xl">🌿</span>
                            </div>
                            <span className="text-xl font-bold text-gradient">Reviews Maker</span>
                        </Link>

                        {/* Navigation Links */}
                        <div className="flex items-center space-x-6">
                            <Link to="/" className="text-dark-text hover:text-primary-400 transition-colors">
                                Accueil
                            </Link>
                            {isAuthenticated && (
                                <Link to="/create" className="btn btn-primary">
                                    Nouvelle Review
                                </Link>
                            )}
                            {!isAuthenticated ? (
                                <button className="btn btn-secondary">
                                    Se connecter
                                </button>
                            ) : (
                                <div className="flex items-center space-x-3">
                                    <img
                                        src={user?.avatar || '/default-avatar.png'}
                                        alt={user?.username}
                                        className="w-8 h-8 rounded-full border-2 border-primary-500"
                                    />
                                    <span className="text-dark-text">{user?.username}</span>
                                </div>
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
