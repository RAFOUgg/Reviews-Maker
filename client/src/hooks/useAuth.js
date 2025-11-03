import { useEffect } from 'react'
import { useStore } from '../store/useStore'

export function useAuth() {
    const { user, isAuthenticated, setUser, logout } = useStore()

    // Vérifier si l'utilisateur est connecté au chargement
    useEffect(() => {
        checkAuthStatus()
    }, [])

    const checkAuthStatus = async () => {
        try {
            const response = await fetch('/api/auth/me', {
                credentials: 'include'
            })
            if (response.ok) {
                const userData = await response.json()
                setUser(userData)
            }
        } catch (error) {
            console.error('Auth check failed:', error)
        }
    }

    const loginWithDiscord = () => {
        // Rediriger vers l'endpoint Discord OAuth2
        window.location.href = '/api/auth/discord'
    }

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include'
            })
            logout()
        } catch (error) {
            console.error('Logout failed:', error)
        }
    }

    return {
        user,
        isAuthenticated,
        loginWithDiscord,
        logout: handleLogout,
        checkAuthStatus
    }
}
