import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/i18n'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import ReviewDetailPage from './pages/ReviewDetailPage'
import CreateReviewPage from './pages/CreateReviewPage'
import CreateFlowerReview from './pages/CreateFlowerReview'
import CreateHashReview from './pages/CreateHashReview'
import CreateConcentrateReview from './pages/CreateConcentrateReview'
import CreateEdibleReview from './pages/CreateEdibleReview'
import EditReviewPage from './pages/EditReviewPage'
import LibraryPage from './pages/LibraryPage'
import GalleryPage from './pages/GalleryPage'
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
import AgeVerificationPage from './pages/AgeVerificationPage'
import DisclaimerRDR from './components/legal/DisclaimerRDR'
import RDRBanner from './components/legal/RDRBanner'
import AgeVerification from './components/legal/AgeVerification'
import ConsentModal from './components/legal/ConsentModal'
import AccountSelector from './components/account/AccountSelector'
import LegalConsentGate from './components/LegalConsentGate'
import { initializeTheme } from './store/themeStore'
import AnimatedMeshGradient from './components/ui/AnimatedMeshGradient'

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

    useEffect(() => {
        initializeTheme()
    }, [])

    useEffect(() => {
        checkAuth()
    }, [])

    return (
        <I18nextProvider i18n={i18n}>
            <ErrorBoundary>
                <LegalConsentGate>
                    <div className="min-h-screen bg-transparent text-dark-text relative overflow-hidden">
                        <AnimatedMeshGradient />
                        <RDRBanner />
                        <ToastContainer />

                        {isAuthenticated && !loading && (
                            <>
                                {needsAgeVerification && (
                                    <AgeVerification
                                        isOpen={true}
                                        onVerified={handleAgeVerified}
                                        onReject={handleAgeRejected}
                                    />
                                )}
                                {needsConsent && (
                                    <ConsentModal
                                        isOpen={true}
                                        onAccept={handleConsentAccepted}
                                        onDecline={handleConsentDeclined}
                                    />
                                )}
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

                                <Route path="/create/flower" element={<CreateFlowerReview />} />
                                <Route path="/edit/flower/:id" element={<CreateFlowerReview />} />

                                <Route path="/create/hash" element={<CreateHashReview />} />
                                <Route path="/edit/hash/:id" element={<CreateHashReview />} />

                                <Route path="/create/concentrate" element={<CreateConcentrateReview />} />
                                <Route path="/edit/concentrate/:id" element={<CreateConcentrateReview />} />

                                <Route path="/create/edible" element={<CreateEdibleReview />} />
                                <Route path="/edit/edible/:id" element={<CreateEdibleReview />} />

                                <Route path="/library" element={<LibraryPage />} />
                                <Route path="/gallery" element={<GalleryPage />} />
                                <Route path="/stats" element={<StatsPage />} />
                                <Route path="/profile" element={<ProfilePage />} />
                                <Route path="/settings" element={<SettingsPage />} />

                                <Route path="/choose-account" element={<AccountChoicePage />} />
                                <Route path="/profile-settings" element={<ProfileSettingsPage />} />
                            </Route>
                            <Route path="/login" element={<LoginPage />} />
                            <Route path="/age-verification" element={<AgeVerificationPage />} />
                            <Route path="/disclaimer-rdr" element={<DisclaimerRDR />} />
                            <Route path="/auth/callback" element={<AuthCallback />} />
                        </Routes>

                    </div>
                </LegalConsentGate>
            </ErrorBoundary>
        </I18nextProvider>
    )
}

export default App
