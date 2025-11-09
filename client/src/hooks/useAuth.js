import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { authService } from '../services/apiService'

export function useAuth() {
    const { user, isAuthenticated, checkAuth, logout } = useStore()

    // Vérifier si l'utilisateur est connecté au chargement
    useEffect(() => {
        checkAuth()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const loginWithDiscord = () => {
        authService.loginWithDiscord()
    }

    return {
        user,
        isAuthenticated,
        loginWithDiscord,
        logout,
        checkAuth
    }
}
