import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/i18n'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import CreateReviewPage from './pages/CreateReviewPage'
import CreateFlowerReview from './pages/CreateFlowerReview'
import EditReviewPage from './pages/EditReviewPage'
import LibraryPage from './pages/LibraryPage'
import StatsPage from './pages/StatsPage'
import SettingsPage from './pages/SettingsPage'
import ProfilePage from './pages/ProfilePage'
import ProfileSettingsPage from './pages/ProfileSettingsPage'
import AuthCallback from './components/AuthCallback'
import ToastContainer from './components/ToastContainer'
import ErrorBoundary from './components/ErrorBoundary'
import { useStore } from './store/useStore'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import AccountChoicePage from './pages/AccountChoicePage'
import RDRBanner from './components/legal/RDRBanner'
import AgeVerification from './components/legal/AgeVerification'
import ConsentModal from './components/legal/ConsentModal'
import AccountSelector from './components/account/AccountSelector'
import LegalConsentGate from './components/LegalConsentGate'

function App() {
    const checkAuth = useStore((state) => state.checkAuth)
    const {
        isAuthenticated,
        loading,
        needsAgeVerification,
        needsConsent,
        needsAccountTypeSelection,
        accountInfo,
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
        <I18nextProvider i18n={i18n}>
            <ErrorBoundary>
                {/* Gate légal - Premier niveau de protection, s'affiche AVANT tout le reste */}
                <LegalConsentGate>
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
                                        onVerified={handleAgeVerified}
                                        onReject={handleAgeRejected}
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
                                    <AccountSelector
                                        isOpen={true}
                                        onAccountSelected={handleAccountTypeSelected}
                                    />
                                )}
                            </>
                        )}

                        <Routes>
                            <Route path="/" element={<Layout />}>
                                <Route index element={<HomePage />} />
                                <Route path="/review/:id" element={<ReviewDetailPage />} />
                                <Route path="/create" element={<CreateReviewPage />} />
                                {/* Routes spécifiques AVANT les routes génériques */}
                                <Route path="/create/flower" element={<CreateFlowerReview />} />
                                <Route path="/edit/flower/:id" element={<CreateFlowerReview />} />
                                <Route path="/create/type/:productType" element={<CreateReviewPage />} />
                                <Route path="/edit/:id" element={<EditReviewPage />} />
                                <Route path="/library" element={<LibraryPage />} />
                                <Route path="/stats" element={<StatsPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/account" element={<ProfileSettingsPage />} />
                            </Route>
                            <Route path="/choose-account" element={<AccountChoicePage />} />
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                        </Routes>
                    </div>
                </LegalConsentGate>
            </ErrorBoundary>
        </I18nextProvider>
    )
}

export default App
