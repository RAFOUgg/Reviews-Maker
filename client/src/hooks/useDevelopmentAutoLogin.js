/**
 * DevMockAuth - Auto-login en développement local
 * Permet de tester l'app sans avoir à se logger à chaque fois
 * 
 * Usage: import { useDevelopmentAutoLogin } from '@/hooks/useDevelopmentAutoLogin'
 *        useDevelopmentAutoLogin() // Call dans App ou Page principale
 */

import { useEffect } from 'react'
import { useStore } from '../store/useStore'

const DEV_AUTO_LOGIN_ENABLED = import.meta.env.MODE === 'development'
const DEV_USER_EMAIL = 'test@example.com'
const DEV_USER_PASSWORD = 'test123456'

/**
 * Auto-login en dev mode si pas déjà connecté
 */
export function useDevelopmentAutoLogin() {
    const { isAuthenticated, user, login } = useStore()

    useEffect(() => {
        // Only in development mode
        if (!DEV_AUTO_LOGIN_ENABLED) return

        // Only if not already authenticated
        if (isAuthenticated || user) return

        // Auto-login
        const attemptAutoLogin = async () => {
            try {
                console.log('🔐 [DEV MODE] Attempting auto-login with test credentials...')

                // Appel API pour login
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: DEV_USER_EMAIL,
                        password: DEV_USER_PASSWORD
                    }),
                    credentials: 'include' // Important pour les cookies de session
                })

                if (response.ok) {
                    const data = await response.json()
                    // Update Zustand store
                    useStore.setState({
                        user: data.user,
                        isAuthenticated: true
                    })
                    console.log('✅ [DEV MODE] Auto-login successful!', data.user)
                } else {
                    console.warn('⚠️  [DEV MODE] Auto-login failed:', response.statusText)
                }
            } catch (error) {
                console.error('❌ [DEV MODE] Auto-login error:', error)
            }
        }

        // Delay to ensure DOM is ready
        const timer = setTimeout(attemptAutoLogin, 500)
        return () => clearTimeout(timer)

    }, [isAuthenticated, user])
}

/**
 * Alternative: Store test credentials in localStorage for manual login
 * Call this to populate login form with test credentials
 */
export function fillDevTestCredentials() {
    if (!DEV_AUTO_LOGIN_ENABLED) return

    // Find login inputs and fill them
    const emailInput = document.querySelector('input[type="email"]')
    const passwordInput = document.querySelector('input[type="password"]')

    if (emailInput) emailInput.value = DEV_USER_EMAIL
    if (passwordInput) passwordInput.value = DEV_USER_PASSWORD

    console.log('✅ Test credentials filled in login form')
}
