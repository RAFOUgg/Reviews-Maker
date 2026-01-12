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
                            : t('auth.loginWithAmazon', 'Se connecter avec Amazon')}
                    </span>
                </button>
            )}

            <style jsx>{`
                .oauth-buttons {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: 0.875rem;
                    width: 100%;
                    max-width: 100%;
                }

                /* Mobile large: 1 colonne */
                @media (min-width: 480px) {
                    .oauth-buttons {
                        gap: 1rem;
                    }
                }

                /* Tablette: 2 colonnes équilibrées */
                @media (min-width: 768px) {
                    .oauth-buttons {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1rem;
                    }
                }

                /* Desktop: 2 colonnes avec meilleure largeur */
                @media (min-width: 1024px) {
                    .oauth-buttons {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.25rem;
                        max-width: 800px;
                        margin: 0 auto;
                    }
                }

                /* Large desktop: garde 2 colonnes centrées pour meilleure ergonomie */
                @media (min-width: 1280px) {
                    .oauth-buttons {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 1.5rem;
                        max-width: 700px;
                    }
                }

                .oauth-button {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.875rem;
                    width: 100%;
                    padding: 1rem 1.5rem;
                    font-size: 0.9375rem;
                    font-weight: 600;
                    border: 2px solid transparent;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    background-color: #fff;
                    color: #1f2937;
                    min-height: 56px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }

                .oauth-button::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(135deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0) 50%);
                    opacity: 0;
                    transition: opacity 0.3s ease;
                }

                .oauth-button:hover::before {
                    opacity: 1;
                }

                .oauth-button:disabled {
                    opacity: 0.5;
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
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                /* Ajuster la taille du texte sur petits écrans */
                @media (max-width: 380px) {
                    .oauth-button {
                        font-size: 0.875rem;
                        padding: 0.75rem 1rem;
                    }
                    
                    .oauth-button__icon {
                        width: 1.25rem;
                        height: 1.25rem;
                    }
                }

                /* Discord - Blurple brand color */
                .oauth-button--discord {
                    background: linear-gradient(135deg, #5865f2 0%, #4752c4 100%);
                    color: #fff;
                    border-color: #5865f2;
                }

                .oauth-button--discord:hover:not(:disabled) {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 24px rgba(88, 101, 242, 0.45), 0 0 0 4px rgba(88, 101, 242, 0.1);
                }

                .oauth-button--discord:active:not(:disabled) {
                    transform: translateY(-1px) scale(1);
                }

                /* Google - White background avec multi-color icon */
                .oauth-button--google {
                    background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
                    color: #1f2937;
                    border: 2px solid #e0e0e0;
                }

                .oauth-button--google:hover:not(:disabled) {
                    border-color: #4285f4;
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 24px rgba(66, 133, 244, 0.25), 0 0 0 4px rgba(66, 133, 244, 0.08);
                }

                .oauth-button--google:active:not(:disabled) {
                    transform: translateY(-1px) scale(1);
                }

                /* Apple */
                .oauth-button--apple {
                    background: linear-gradient(135deg, #000000 0%, #1c1c1e 100%);
                    color: #fff;
                    border-color: #000;
                }

                .oauth-button--apple:hover:not(:disabled) {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 4px rgba(0, 0, 0, 0.1);
                }

                .oauth-button--apple:active:not(:disabled) {
                    transform: translateY(-1px) scale(1);
                }

                /* Facebook */
                .oauth-button--facebook {
                    background: linear-gradient(135deg, #1877f2 0%, #0f5ec4 100%);
                    color: #fff;
                    border-color: #1877f2;
                }

                .oauth-button--facebook:hover:not(:disabled) {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 24px rgba(24, 119, 242, 0.4), 0 0 0 4px rgba(24, 119, 242, 0.1);
                }

                .oauth-button--facebook:active:not(:disabled) {
                    transform: translateY(-1px) scale(1);
                }

                /* Amazon */
                .oauth-button--amazon {
                    background: linear-gradient(135deg, #232f3e 0%, #131a22 100%);
                    color: #fefefe;
                    border-color: #232f3e;
                }

                .oauth-button--amazon:hover:not(:disabled) {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 8px 24px rgba(35, 47, 62, 0.4), 0 0 0 4px rgba(35, 47, 62, 0.1);
                }

                .oauth-button--amazon:active:not(:disabled) {
                    transform: translateY(-1px) scale(1);
                }

                /* Boutons désactivés - Style grisé avec tooltip élégant */
                .oauth-button--disabled {
                    opacity: 0.45;
                    cursor: not-allowed;
                    position: relative;
                    filter: grayscale(0.8);
                }

                .oauth-button--disabled::after {
                    content: '(Bientôt disponible)';
                    position: absolute;
                    bottom: -28px;
                    left: 50%;
                    transform: translateX(-50%);
                    font-size: 0.6875rem;
                    font-weight: 500;
                    color: #6b7280;
                    white-space: nowrap;
                    pointer-events: none;
                    padding: 0.25rem 0.5rem;
                    background: rgba(107, 114, 128, 0.08);
                    border-radius: 6px;
                }

                .oauth-button--disabled:hover {
                    transform: none !important;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08) !important;
                }

                /* Animation de chargement améliorée */
                @keyframes pulse-glow {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.6;
                    }
                }

                .oauth-button:disabled:not(.oauth-button--disabled) {
                    animation: pulse-glow 1.5s ease-in-out infinite;
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
