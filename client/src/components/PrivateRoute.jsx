import { Navigate } from 'react-router-dom'
import { useStore } from '../store'
import { Shield } from 'lucide-react'

/**
 * PrivateRoute: Protège les routes authentifiées
 * Redirige vers /login si pas d'utilisateur
 */
export function PrivateRoute({ children, requiredRole = null }) {
    const { user } = useStore()

    // Si pas d'utilisateur, rediriger vers login
    if (!user) {
        return <Navigate to="/login" replace />
    }

    // Si rôle requis (ex: admin), vérifier
    if (requiredRole) {
        const userRoles = Array.isArray(user.roles) 
            ? user.roles 
            : (typeof user.roles === 'string' ? JSON.parse(user.roles) : [])
        
        if (!userRoles.includes(requiredRole)) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                    <div className="text-center max-w-md">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Shield className="w-8 h-8 text-red-500" />
                            </div>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">Accès refusé</h1>
                        <p className="text-gray-400 mb-6">Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
                        <a 
                            href="/" 
                            className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all"
                        >
                            Retour à l'accueil
                        </a>
                    </div>
                </div>
            )
        }
    }

    return children
}
