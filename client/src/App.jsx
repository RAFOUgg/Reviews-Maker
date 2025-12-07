import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import CreateReviewPage from './pages/CreateReviewPage'
import EditReviewPage from './pages/EditReviewPage'
import LibraryPage from './pages/LibraryPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import AuthCallback from './components/AuthCallback'
import ToastContainer from './components/ToastContainer'
import ErrorBoundary from './components/ErrorBoundary'
import { useStore } from './store/useStore'
import { useAuth } from './hooks/useAuth'
import '../i18n/i18n'
import { RDRBanner } from './components/legal/RDRBanner'
import { AgeVerification } from './components/legal/AgeVerification'
import { ConsentModal } from './components/legal/ConsentModal'
import { AccountTypeSelector } from './components/account/AccountTypeSelector'

function App() {
    const checkAuth = useStore((state) => state.checkAuth)
    const {
        isAuthenticated,
        loading,
        needsAgeVerification,
        needsConsent,
        needsAccountTypeSelection,
        handleAgeVerified,
        handleConsentAccepted,
        handleAccountTypeSelected,
        handleConsentDeclined,
        handleAgeRejected,
    } = useAuth()

    // ✅ Appliquer le thème au démarrage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme') || 'violet-lean'
        const root = window.document.documentElement

        const applyTheme = (themeValue) => {
            root.removeAttribute('data-theme')

            switch (themeValue) {
                case 'violet-lean':
                    root.setAttribute('data-theme', 'violet-lean')
                    root.classList.remove('dark')
                    break
                case 'emerald':
                    root.setAttribute('data-theme', 'emerald')
                    root.classList.remove('dark')
                    break
                case 'tahiti':
                    root.setAttribute('data-theme', 'tahiti')
                    root.classList.remove('dark')
                    break
                case 'sakura':
                    root.setAttribute('data-theme', 'sakura')
                    root.classList.remove('dark')
                    break
                case 'dark':
                    root.setAttribute('data-theme', 'dark')
                    root.classList.add('dark')
                    break
                case 'auto':
                    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
                    if (isDark) {
                        root.setAttribute('data-theme', 'dark')
                        root.classList.add('dark')
                    } else {
                        // keep default accent theme when system is light
                        root.setAttribute('data-theme', 'violet-lean')
                        root.classList.remove('dark')
                    }
                    break
                default:
                    root.setAttribute('data-theme', 'violet-lean')
            }
        }

        applyTheme(savedTheme)

        // If user chose 'auto', listen to system changes globally so the whole app respects system theme
        if (savedTheme === 'auto') {
            const mq = window.matchMedia('(prefers-color-scheme: dark)')
            const handler = (e) => {
                applyTheme('auto')
            }
            // Modern API
            if (mq.addEventListener) mq.addEventListener('change', handler)
            else if (mq.addListener) mq.addListener(handler)

            return () => {
                if (mq.removeEventListener) mq.removeEventListener('change', handler)
                else if (mq.removeListener) mq.removeListener(handler)
            }
        }
    }, [])

    // ✅ Vérifier la session au démarrage
    useEffect(() => {
        checkAuth()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <ErrorBoundary>
            <div className="min-h-screen bg-dark-bg text-dark-text">
                {/* Bannière RDR - Toujours visible */}
                <RDRBanner />

                <ToastContainer />

                {/* Modales d'onboarding - Affichage conditionnel pour utilisateurs authentifiés */}
                {isAuthenticated && !loading && (
                    <>
                        {/* 1. Vérification d'âge - Première étape obligatoire */}
                        {needsAgeVerification && (
                            <AgeVerification
                                isOpen={true}
                                onAccepted={handleAgeVerified}
                                onRejected={handleAgeRejected}
                            />
                        )}

                        {/* 2. Consentement RDR - Après vérification d'âge */}
                        {needsConsent && (
                            <ConsentModal
                                isOpen={true}
                                onAccept={handleConsentAccepted}
                                onDecline={handleConsentDeclined}
                            />
                        )}

                        {/* 3. Sélection type de compte - Après consentement */}
                        {needsAccountTypeSelection && (
                            <AccountTypeSelector
                                isOpen={true}
                                onClose={handleAccountTypeSelected}
                            />
                        )}
                    </>
                )}

                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route index element={<HomePage />} />
                        <Route path="/review/:id" element={<ReviewDetailPage />} />
                        <Route path="/create" element={<CreateReviewPage />} />
                        <Route path="/edit/:id" element={<EditReviewPage />} />
                        <Route path="/library" element={<LibraryPage />} />
                        <Route path="/stats" element={<StatsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Route>
                    <Route path="/auth/callback" element={<AuthCallback />} />
                </Routes>
            </div>
        </ErrorBoundary>
    )
}

export default App
