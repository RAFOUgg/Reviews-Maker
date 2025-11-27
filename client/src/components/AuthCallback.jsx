import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

export default function AuthCallback() {
    const navigate = useNavigate()
    const setUser = useStore((state) => state.setUser)

    useEffect(() => {
        // Vérifier l'authentification après callback Discord
        // Retry a few times to allow cookies to be set after the OAuth redirect
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

        const tryCheckAuth = async (attempt = 1, maxAttempts = 5) => {
            try {
                const response = await fetch('/api/auth/me', { credentials: 'include' })
                if (response.ok) {
                    const userData = await response.json()
                    setUser(userData)
                    navigate('/')
                    return
                }
            } catch (err) {
                // swallow and retry
            }

            if (attempt < maxAttempts) {
                await delay(250 * attempt) // backoff: 250ms, 500ms, ...
                return tryCheckAuth(attempt + 1, maxAttempts)
            }

            // If all attempts failed, go back to home
            navigate('/')
        }

        tryCheckAuth()
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
