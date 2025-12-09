import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

/**
 * Composant de boutons OAuth pour connexion multi-providers
 * Affiche uniquement les providers configurés côté serveur
 */
export function OAuthButtons({ className = '', onLoginStart, onLoginError }) {
    const { t } = useTranslation()
    const [loadingProvider, setLoadingProvider] = useState(null)
    const [enabledProviders, setEnabledProviders] = useState([])
    const [loading, setLoading] = useState(true)

    // Récupérer la liste des providers configurés
    useEffect(() => {
        fetch('/api/auth/providers')
            .then(res => res.json())
            .then(data => {
                setEnabledProviders(data.providers || [])
                setLoading(false)
            })
            .catch(err => {
                console.error('Erreur lors de la récupération des providers OAuth:', err)
                // Par défaut, afficher Discord si l'appel échoue
                setEnabledProviders(['discord'])
                setLoading(false)
            })
    }, [])

    const handleLogin = (provider, url) => {
        try {
            setLoadingProvider(provider)
            if (onLoginStart) onLoginStart(provider)
            window.location.href = url
        } catch (error) {
            console.error(`Erreur connexion ${provider}:`, error)
            setLoadingProvider(null)
            if (onLoginError) onLoginError(provider, error)
        }
    }

    // Afficher un loader pendant le chargement
    if (loading) {
        return (
            <div className={`oauth-buttons ${className}`}>
                <div className="text-center text-dark-muted">Chargement des options de connexion...</div>
            </div>
        )
    }

    // Ne rien afficher si aucun provider n'est configuré
    if (enabledProviders.length === 0) {
        return (
            <div className={`oauth-buttons ${className}`}>
                <div className="text-center text-dark-muted text-sm">Aucun fournisseur OAuth configuré. Utilisez la connexion email.</div>
            </div>
        )
    }

    return (
        <div className={`oauth-buttons ${className}`}>
            {/* Bouton Discord */}
            {enabledProviders.includes('discord') && <button
                type="button"
                onClick={() => handleLogin('discord', '/api/auth/discord')}
                disabled={loadingProvider !== null}
                className="oauth-button oauth-button--discord"
                aria-label={t('auth.loginWithDiscord', 'Se connecter avec Discord')}
            >
                {loadingProvider === 'discord' ? (
                    <span className="oauth-button__spinner" aria-hidden="true">
                        ⏳
                    </span>
                ) : (
                    <svg
                        className="oauth-button__icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
                    </svg>
                )}
                <span className="oauth-button__text">
                    {loadingProvider === 'discord'
                        ? t('auth.connecting', 'Connexion...')
                        : t('auth.loginWithDiscord', 'Se connecter avec Discord')}
                </span>
            </button>}

            {/* Bouton Google */}
            {enabledProviders.includes('google') && <button
                type="button"
                onClick={() => handleLogin('google', '/api/auth/google')}
                disabled={loadingProvider !== null}
                className="oauth-button oauth-button--google"
                aria-label={t('auth.loginWithGoogle', 'Se connecter avec Google')}
            >
                {loadingProvider === 'google' ? (
                    <span className="oauth-button__spinner" aria-hidden="true">
                        ⏳
                    </span>
                ) : (
                    <svg
                        className="oauth-button__icon"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                )}
                <span className="oauth-button__text">
                    {loadingProvider === 'google'
                        ? t('auth.connecting', 'Connexion...')
                        : t('auth.loginWithGoogle', 'Se connecter avec Google')}
                </span>
            </button>}

            {/* Bouton Apple */}
            {enabledProviders.includes('apple') && <button
                type="button"
                onClick={() => handleLogin('apple', '/api/auth/apple')}
                disabled={loadingProvider !== null}
                className="oauth-button oauth-button--apple"
                aria-label={t('auth.loginWithApple', 'Se connecter avec Apple')}
            >
                {loadingProvider === 'apple' ? (
                    <span className="oauth-button__spinner" aria-hidden="true">⏳</span>
                ) : (
                    <svg className="oauth-button__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M16.365 1.43c0 1.14-.41 2.08-1.23 2.85-.99.95-2.18 1.07-2.64 1.07-.08-1.14.43-2.21 1.2-2.95.86-.85 1.99-1.41 2.67-1.41.01.15.03.3.03.44zM19.93 17.18c-.54 1.24-.8 1.79-1.49 2.88-.97 1.53-2.34 3.44-4.05 3.46-1.51.01-1.9-.99-3.95-.98-2.05.01-2.47.99-3.99.98-1.71-.01-3.01-1.73-3.98-3.25-1.55-2.38-2.75-6.73-1.15-9.67 1.07-2.02 2.99-3.28 4.73-3.28 1.86 0 3.03 1.1 4.56 1.1 1.48 0 2.38-1.1 4.56-1.1 1.66 0 3.42.9 4.49 2.46-3.92 2.14-3.29 7.75.26 9.4z" />
                    </svg>
                )}
                <span className="oauth-button__text">
                    {loadingProvider === 'apple'
                        ? t('auth.connecting', 'Connexion...')
                        : t('auth.loginWithApple', 'Se connecter avec Apple')}
                </span>
            </button>}

            {/* Bouton Facebook */}
            {enabledProviders.includes('facebook') && <button
                type="button"
                onClick={() => handleLogin('facebook', '/api/auth/facebook')}
                disabled={loadingProvider !== null}
                className="oauth-button oauth-button--facebook"
                aria-label={t('auth.loginWithFacebook', 'Se connecter avec Facebook')}
            >
                {loadingProvider === 'facebook' ? (
                    <span className="oauth-button__spinner" aria-hidden="true">⏳</span>
                ) : (
                    <svg className="oauth-button__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M22 12a10 10 0 1 0-11.6 9.87v-6.99H7.9V12h2.5V9.8c0-2.46 1.46-3.82 3.7-3.82 1.07 0 2.2.19 2.2.19v2.4h-1.24c-1.22 0-1.6.76-1.6 1.54V12h2.73l-.44 2.88h-2.29v6.99A10 10 0 0 0 22 12" />
                    </svg>
                )}
                <span className="oauth-button__text">
                    {loadingProvider === 'facebook'
                        ? t('auth.connecting', 'Connexion...')
                        : t('auth.loginWithFacebook', 'Se connecter avec Facebook')}
                </span>
            </button>}

            {/* Bouton Amazon */}
            {enabledProviders.includes('amazon') && <button
                type="button"
                onClick={() => handleLogin('amazon', '/api/auth/amazon')}
                disabled={loadingProvider !== null}
                className="oauth-button oauth-button--amazon"
                aria-label={t('auth.loginWithAmazon', 'Se connecter avec Amazon')}
            >
                {loadingProvider === 'amazon' ? (
                    <span className="oauth-button__spinner" aria-hidden="true">⏳</span>
                ) : (
                    <svg className="oauth-button__icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <path d="M18.91 14.86c.1-1.34-.23-2.63-.99-3.87-.95-1.58-2.36-2.37-4.23-2.37-.34 0-.73.04-1.15.12V5.05H8.53v13.75h3.78v-5.8c0-.36.02-.61.08-.77.17-.48.55-.72 1.13-.72.5 0 .87.23 1.1.7.15.3.23.74.23 1.31v5.28h3.78l-.04-3.94zM9.82 4.16c0 .64.21 1.14.64 1.49.39.3.85.46 1.37.46.55 0 1-.15 1.37-.46.42-.35.63-.85.63-1.49 0-.62-.21-1.12-.63-1.47C12.84 2.34 12.38 2.16 12 2.16c-.52 0-.98.18-1.37.53-.43.35-.64.85-.64 1.47z" />
                    </svg>
                )}
                <span className="oauth-button__text">
                    {loadingProvider === 'amazon'
                        ? t('auth.connecting', 'Connexion...')
                        : t('auth.loginWithAmazon', 'Se connecter avec Amazon')}
                </span>
            </button>}

            <style jsx>{`
                .oauth-buttons {
                    display: flex;
                    flex-direction: column;
                    gap: 1rem;
                    width: 100%;
                }

                .oauth-button {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    width: 100%;
                    padding: 0.875rem 1.5rem;
                    font-size: 1rem;
                    font-weight: 500;
                    border: 2px solid transparent;
                    border-radius: 0.5rem;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    background-color: #fff;
                    color: #1f2937;
                }

                .oauth-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .oauth-button__icon {
                    width: 1.5rem;
                    height: 1.5rem;
                    flex-shrink: 0;
                }

                .oauth-button__spinner {
                    font-size: 1.5rem;
                    animation: spin 1s linear infinite;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }
                    to {
                        transform: rotate(360deg);
                    }
                }

                .oauth-button__text {
                    white-space: nowrap;
                }

                /* Discord - Blurple brand color */
                .oauth-button--discord {
                    background-color: #5865f2;
                    color: #fff;
                    border-color: #5865f2;
                }

                .oauth-button--discord:hover:not(:disabled) {
                    background-color: #4752c4;
                    border-color: #4752c4;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(88, 101, 242, 0.4);
                }

                .oauth-button--discord:active:not(:disabled) {
                    transform: translateY(0);
                }

                /* Google - White background avec multi-color icon */
                .oauth-button--google {
                    background-color: #fff;
                    color: #1f2937;
                    border-color: #d1d5db;
                }

                .oauth-button--google:hover:not(:disabled) {
                    border-color: #9ca3af;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .oauth-button--google:active:not(:disabled) {
                    transform: translateY(0);
                }

                /* Apple */
                .oauth-button--apple {
                    background-color: #000;
                    color: #fff;
                    border-color: #000;
                }

                .oauth-button--apple:hover:not(:disabled) {
                    background-color: #111;
                    border-color: #111;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
                }

                .oauth-button--apple:active:not(:disabled) {
                    transform: translateY(0);
                }

                /* Facebook */
                .oauth-button--facebook {
                    background-color: #1877f2;
                    color: #fff;
                    border-color: #1877f2;
                }

                .oauth-button--facebook:hover:not(:disabled) {
                    background-color: #0f5ec4;
                    border-color: #0f5ec4;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(24, 119, 242, 0.35);
                }

                .oauth-button--facebook:active:not(:disabled) {
                    transform: translateY(0);
                }

                /* Amazon */
                .oauth-button--amazon {
                    background-color: #232f3e;
                    color: #fefefe;
                    border-color: #232f3e;
                }

                .oauth-button--amazon:hover:not(:disabled) {
                    background-color: #1c2430;
                    border-color: #1c2430;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(35, 47, 62, 0.35);
                }

                .oauth-button--amazon:active:not(:disabled) {
                    transform: translateY(0);
                }

                /* Responsive */
                @media (min-width: 640px) {
                    .oauth-buttons {
                        flex-direction: row;
                    }
                }
            `}</style>
        </div>
    )
}

OAuthButtons.propTypes = {
    className: PropTypes.string,
    onLoginStart: PropTypes.func,
    onLoginError: PropTypes.func,
}

export default OAuthButtons
