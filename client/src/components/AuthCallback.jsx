import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function AuthCallback() {
    const navigate = useNavigate()
    const setUser = useStore((state) => state.setUser)

    useEffect(() => {
        // Vérifier l'authentification après callback Discord
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/me', {
                    credentials: 'include'
                })

                if (response.ok) {
                    const userData = await response.json()
                    setUser(userData)
                    navigate('/')
                } else {
                    navigate('/')
                }
            } catch (error) {
                navigate('/')
            }
        }

        checkAuth()
    }, [navigate, setUser])

    return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="glass rounded-2xl p-8 text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary-600/30 border-t-primary-600 rounded-full animate-spin mx-auto" />
                <h2 className="text-xl font-semibold text-dark-text">Connexion en cours...</h2>
                <p className="text-dark-muted">Authentification avec Discord</p>
            </div>
        </div>
    )
}
