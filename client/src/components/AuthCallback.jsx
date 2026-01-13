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
        <div className="min-h-screen bg-gradient-to-br flex items-center justify-center px-4">
            <div className="glass rounded-3xl p-10 text-center space-y-6 max-w-md w-full animate-fade-in shadow-2xl">
                <div className="relative">
                    <div className="w-20 h-20 border-4 border-violet-300/30 border-t-violet-600 rounded-full animate-spin mx-auto" />
                    <div className="absolute inset-0 w-20 h-20 border-4 /20 border-b-purple-600 rounded-full animate-spin mx-auto" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-gray-900">Connexion en cours...</h2>
                    <p className="text-gray-600">🔐 Authentification OAuth</p>
                    <p className="text-sm text-gray-500">Veuillez patienter pendant que nous finalisons votre connexion</p>
                </div>
            </div>
        </div>
    )
}


