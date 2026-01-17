import { Navigate } from 'react-router-dom'
import { useStore } from '../store'

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
            return <Navigate to="/" replace />
        }
    }

    return children
}
