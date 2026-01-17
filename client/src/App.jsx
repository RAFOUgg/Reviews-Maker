import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from './i18n/i18n'
import Layout from './components/shared/Layout'
import HomePage from './pages/public/HomePage'
import LoginPage from './pages/auth/LoginPage'
import AuthCallback from './components/account/AuthCallback'
import ToastContainer from './components/shared/ToastContainer'
import ErrorBoundary from './components/shared/ErrorBoundary'
import { useStore } from './store/useStore'
import { useAuth } from './hooks/useAuth'
import RDRBanner from './components/legal/RDRBanner'
import AgeVerification from './components/legal/AgeVerification'
import ConsentModal from './components/legal/ConsentModal'
import DisclaimerRDRModal from './components/legal/DisclaimerRDRModal'
import AccountSelector from './components/account/AccountSelector'
import LegalConsentGate from './components/legal/LegalConsentGate'
import { initializeTheme } from './store/themeStore'
import AnimatedMeshGradient from './components/ui/AnimatedMeshGradient'
import { PrivateRoute } from './components/PrivateRoute'

// Lazy-loaded pages (code splitting)
const ReviewDetailPage = lazy(() => import('./pages/public/ReviewDetailPage'))
const CreateReviewPage = lazy(() => import('./pages/review/CreateReviewPage'))
const CreateFlowerReview = lazy(() => import('./pages/review/CreateFlowerReview'))
const CreateHashReview = lazy(() => import('./pages/review/CreateHashReview'))
const CreateConcentrateReview = lazy(() => import('./pages/review/CreateConcentrateReview'))
const CreateEdibleReview = lazy(() => import('./pages/review/CreateEdibleReview'))
const EditReviewPage = lazy(() => import('./pages/review/EditReviewPage'))
const LibraryPage = lazy(() => import('./pages/review/LibraryPage'))
const GalleryPage = lazy(() => import('./pages/public/GalleryPage'))
const StatsPage = lazy(() => import('./pages/account/StatsPage'))
const AccountPage = lazy(() => import('./pages/account/AccountPage'))

const AccountChoicePage = lazy(() => import('./pages/account/AccountChoicePage'))
const AgeVerificationPage = lazy(() => import('./pages/auth/AgeVerificationPage'))
const DisclaimerRDR = lazy(() => import('./components/legal/DisclaimerRDR'))
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'))
const EmailVerificationPage = lazy(() => import('./pages/auth/EmailVerificationPage'))
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'))
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'))
const PaymentPage = lazy(() => import('./pages/account/PaymentPage'))
const ManageSubscription = lazy(() => import('./pages/account/ManageSubscription'))
const PhenoHuntPage = lazy(() => import('./pages/public/PhenoHuntPage'))
const GeneticsManagementPage = lazy(() => import('./pages/public/GeneticsManagementPage'))
const AdminPanel = lazy(() => import('./pages/admin/AdminPanel'))

// Loading fallback component
const PageLoader = () => (
    <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600"></div>
    </div>
)

// Admin panel error fallback
const AdminPanelError = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        padding: '2rem'
    }}>
        <div style={{
            background: '#0f3460',
            border: '2px solid #ff6b6b',
            padding: '2rem',
            borderRadius: '12px',
            textAlign: 'center',
            maxWidth: '500px',
            color: '#e0e0e0'
        }}>
            <h2 style={{ color: '#ff6b6b', marginBottom: '1rem' }}> Admin Panel Load Error</h2>
            <p>Failed to load the admin panel component.</p>
            <p style={{ fontSize: '0.9em', marginTop: '1rem', color: '#e0e0e0' }}>
                Check browser console (F12) for detailed error messages.
            </p>
        </div>
    </div>
)

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
                        <DisclaimerRDRModal />
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

                        <Suspense fallback={<PageLoader />}>
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
                                    <Route path="/account" element={<AccountPage />} />
                                    <Route path="/manage-subscription" element={<ManageSubscription />} />
                                    <Route path="/phenohunt" element={<PhenoHuntPage />} />
                                    <Route path="/genetics" element={<GeneticsManagementPage />} />

                                    <Route path="/choose-account" element={<AccountChoicePage />} />
                                    <Route path="/admin" element={
                                        <PrivateRoute requiredRole="admin">
                                            <ErrorBoundary>
                                                <Suspense fallback={<AdminPanelError />}>
                                                    <AdminPanel />
                                                </Suspense>
                                            </ErrorBoundary>
                                        </PrivateRoute>
                                    } />
                                </Route>
                                <Route path="/login" element={<LoginPage />} />
                                <Route path="/register" element={<RegisterPage />} />
                                <Route path="/payment" element={<PaymentPage />} />
                                <Route path="/verify-email" element={<EmailVerificationPage />} />
                                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                                <Route path="/reset-password" element={<ResetPasswordPage />} />
                                <Route path="/choose-account" element={<AccountChoicePage />} />

                                <Route path="/age-verification" element={<AgeVerificationPage />} />
                                <Route path="/disclaimer-rdr" element={<DisclaimerRDR />} />
                                <Route path="/auth/callback" element={<AuthCallback />} />
                            </Routes>
                        </Suspense>

                    </div>
                </LegalConsentGate>
            </ErrorBoundary>
        </I18nextProvider>
    )
}

export default App