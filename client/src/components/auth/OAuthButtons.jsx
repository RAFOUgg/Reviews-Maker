import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PropTypes from 'prop-types'

/**
 * Composant de boutons OAuth pour connexion multi-providers
 * Phase 2 - Supporte Discord (opérationnel) et Google (préparé)
 */
export function OAuthButtons({ className = '', onLoginStart, onLoginError }) {
    const { t } = useTranslation()
    const [loadingProvider, setLoadingProvider] = useState(null)

    const handleDiscordLogin = () => {
        try {
            setLoadingProvider('discord')
            if (onLoginStart) onLoginStart('discord')
            window.location.href = '/api/auth/discord'
        } catch (error) {
            console.error('Erreur connexion Discord:', error)
            setLoadingProvider(null)
            if (onLoginError) onLoginError('discord', error)
        }
    }

    const handleGoogleLogin = () => {
        try {
            setLoadingProvider('google')
            if (onLoginStart) onLoginStart('google')
            window.location.href = '/api/auth/google'
        } catch (error) {
            console.error('Erreur connexion Google:', error)
            setLoadingProvider(null)
            if (onLoginError) onLoginError('google', error)
        }
    }

    return (
        <div className={`oauth-buttons ${className}`}>
            {/* Bouton Discord - Opérationnel */}
            <button
                type="button"
                onClick={handleDiscordLogin}
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
            </button>

            {/* Bouton Google - Préparé (Phase 2) */}
            <button
                type="button"
                onClick={handleGoogleLogin}
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
            </button>

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
