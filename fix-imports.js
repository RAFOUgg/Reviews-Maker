#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, 'client', 'src');
let filesModified = 0;

const replacements = [
    // Liquid Components
    { old: "from './components/LiquidAlert'", new: "from '@/components/liquid/LiquidAlert'" },
    { old: 'from "./components/LiquidAlert"', new: 'from "@/components/liquid/LiquidAlert"' },
    { old: "from './components/LiquidBadge'", new: "from '@/components/liquid/LiquidBadge'" },
    { old: 'from "./components/LiquidBadge"', new: 'from "@/components/liquid/LiquidBadge"' },
    { old: "from './components/LiquidButton'", new: "from '@/components/liquid/LiquidButton'" },
    { old: 'from "./components/LiquidButton"', new: 'from "@/components/liquid/LiquidButton"' },
    { old: "from './components/LiquidCard'", new: "from '@/components/liquid/LiquidCard'" },
    { old: 'from "./components/LiquidCard"', new: 'from "@/components/liquid/LiquidCard"' },
    { old: "from './components/LiquidInput'", new: "from '@/components/liquid/LiquidInput'" },
    { old: 'from "./components/LiquidInput"', new: 'from "@/components/liquid/LiquidInput"' },
    { old: "from './components/LiquidModal'", new: "from '@/components/liquid/LiquidModal'" },
    { old: 'from "./components/LiquidModal"', new: 'from "@/components/liquid/LiquidModal"' },
    { old: "from './components/LiquidMultiSelect'", new: "from '@/components/liquid/LiquidMultiSelect'" },
    { old: 'from "./components/LiquidMultiSelect"', new: 'from "@/components/liquid/LiquidMultiSelect"' },
    { old: "from './components/LiquidSelect'", new: "from '@/components/liquid/LiquidSelect'" },
    { old: 'from "./components/LiquidSelect"', new: 'from "@/components/liquid/LiquidSelect"' },
    { old: "from './components/LiquidSlider'", new: "from '@/components/liquid/LiquidSlider'" },
    { old: 'from "./components/LiquidSlider"', new: 'from "@/components/liquid/LiquidSlider"' },

    // Button & UI
    { old: "from './components/Button'", new: "from '@/components/ui/Button'" },
    { old: 'from "./components/Button"', new: 'from "@/components/ui/Button"' },
    { old: "from './components/Layout'", new: "from '@/components/shared/Layout'" },
    { old: 'from "./components/Layout"', new: 'from "@/components/shared/Layout"' },

    // Auth
    { old: "from './components/AuthCallback'", new: "from '@/components/auth/AuthCallback'" },
    { old: 'from "./components/AuthCallback"', new: 'from "@/components/auth/AuthCallback"' },

    // Legal
    { old: "from './components/legal/RDRBanner'", new: "from '@/components/legal/RDRBanner'" },
    { old: 'from "./components/legal/RDRBanner"', new: 'from "@/components/legal/RDRBanner"' },
    { old: "from './components/legal/AgeVerification'", new: "from '@/components/legal/AgeVerification'" },
    { old: 'from "./components/legal/AgeVerification"', new: 'from "@/components/legal/AgeVerification"' },
    { old: "from './components/legal/ConsentModal'", new: "from '@/components/legal/ConsentModal'" },
    { old: 'from "./components/legal/ConsentModal"', new: 'from "@/components/legal/ConsentModal"' },
    { old: "from './components/legal/DisclaimerRDRModal'", new: "from '@/components/legal/DisclaimerRDRModal'" },
    { old: 'from "./components/legal/DisclaimerRDRModal"', new: 'from "@/components/legal/DisclaimerRDRModal"' },
    { old: "from './components/legal/DisclaimerRDR'", new: "from '@/components/legal/DisclaimerRDR'" },
    { old: 'from "./components/legal/DisclaimerRDR"', new: 'from "@/components/legal/DisclaimerRDR"' },
    { old: "from './components/LegalConsentGate'", new: "from '@/components/legal/LegalConsentGate'" },
    { old: 'from "./components/LegalConsentGate"', new: 'from "@/components/legal/LegalConsentGate"' },

    // Account
    { old: "from './components/account/AccountSelector'", new: "from '@/components/account/AccountSelector'" },
    { old: 'from "./components/account/AccountSelector"', new: 'from "@/components/account/AccountSelector"' },

    // Feedback
    { old: "from './components/ToastContainer'", new: "from '@/components/feedback/ToastContainer'" },
    { old: 'from "./components/ToastContainer"', new: 'from "@/components/feedback/ToastContainer"' },
    { old: "from './components/ErrorBoundary'", new: "from '@/components/errors/ErrorBoundary'" },
    { old: 'from "./components/ErrorBoundary"', new: 'from "@/components/errors/ErrorBoundary"' },

    // PAGES
    { old: "from './pages/HomePage'", new: "from '@/pages/home/HomePage'" },
    { old: 'from "./pages/HomePage"', new: 'from "@/pages/home/HomePage"' },
    { old: "from './pages/LoginPage'", new: "from '@/pages/auth/LoginPage'" },
    { old: 'from "./pages/LoginPage"', new: 'from "@/pages/auth/LoginPage"' },
    { old: "from './pages/RegisterPage'", new: "from '@/pages/auth/RegisterPage'" },
    { old: 'from "./pages/RegisterPage"', new: 'from "@/pages/auth/RegisterPage"' },
    { old: "from './pages/ForgotPasswordPage'", new: "from '@/pages/auth/ForgotPasswordPage'" },
    { old: 'from "./pages/ForgotPasswordPage"', new: 'from "@/pages/auth/ForgotPasswordPage"' },
    { old: "from './pages/ResetPasswordPage'", new: "from '@/pages/auth/ResetPasswordPage'" },
    { old: 'from "./pages/ResetPasswordPage"', new: 'from "@/pages/auth/ResetPasswordPage"' },
    { old: "from './pages/EmailVerificationPage'", new: "from '@/pages/auth/EmailVerificationPage'" },
    { old: 'from "./pages/EmailVerificationPage"', new: 'from "@/pages/auth/EmailVerificationPage"' },
    { old: "from './pages/AgeVerificationPage'", new: "from '@/pages/auth/AgeVerificationPage'" },
    { old: 'from "./pages/AgeVerificationPage"', new: 'from "@/pages/auth/AgeVerificationPage"' },
    { old: "from './pages/ReviewDetailPage'", new: "from '@/pages/reviews/ReviewDetailPage'" },
    { old: 'from "./pages/ReviewDetailPage"', new: 'from "@/pages/reviews/ReviewDetailPage"' },
    { old: "from './pages/CreateReviewPage'", new: "from '@/pages/reviews/CreateReviewPage'" },
    { old: 'from "./pages/CreateReviewPage"', new: 'from "@/pages/reviews/CreateReviewPage"' },
    { old: "from './pages/EditReviewPage'", new: "from '@/pages/reviews/EditReviewPage'" },
    { old: 'from "./pages/EditReviewPage"', new: 'from "@/pages/reviews/EditReviewPage"' },
    { old: "from './pages/CreateFlowerReview'", new: "from '@/pages/reviews/CreateFlowerReview'" },
    { old: 'from "./pages/CreateFlowerReview"', new: 'from "@/pages/reviews/CreateFlowerReview"' },
    { old: "from './pages/CreateHashReview'", new: "from '@/pages/reviews/CreateHashReview'" },
    { old: 'from "./pages/CreateHashReview"', new: 'from "@/pages/reviews/CreateHashReview"' },
    { old: "from './pages/CreateConcentrateReview'", new: "from '@/pages/reviews/CreateConcentrateReview'" },
    { old: 'from "./pages/CreateConcentrateReview"', new: 'from "@/pages/reviews/CreateConcentrateReview"' },
    { old: "from './pages/CreateEdibleReview'", new: "from '@/pages/reviews/CreateEdibleReview'" },
    { old: 'from "./pages/CreateEdibleReview"', new: 'from "@/pages/reviews/CreateEdibleReview"' },
    { old: "from './pages/LibraryPage'", new: "from '@/pages/library/LibraryPage'" },
    { old: 'from "./pages/LibraryPage"', new: 'from "@/pages/library/LibraryPage"' },
    { old: "from './pages/GalleryPage'", new: "from '@/pages/gallery/GalleryPage'" },
    { old: 'from "./pages/GalleryPage"', new: 'from "@/pages/gallery/GalleryPage"' },
    { old: "from './pages/StatsPage'", new: "from '@/pages/account/StatsPage'" },
    { old: 'from "./pages/StatsPage"', new: 'from "@/pages/account/StatsPage"' },
    { old: "from './pages/SettingsPage'", new: "from '@/pages/account/SettingsPage'" },
    { old: 'from "./pages/SettingsPage"', new: 'from "@/pages/account/SettingsPage"' },
    { old: "from './pages/ProfilePage'", new: "from '@/pages/account/ProfilePage'" },
    { old: 'from "./pages/ProfilePage"', new: 'from "@/pages/account/ProfilePage"' },
    { old: "from './pages/ProfileSettingsPage'", new: "from '@/pages/account/ProfileSettingsPage'" },
    { old: 'from "./pages/ProfileSettingsPage"', new: 'from "@/pages/account/ProfileSettingsPage"' },
    { old: "from './pages/AccountSetupPage'", new: "from '@/pages/account/AccountSetupPage'" },
    { old: 'from "./pages/AccountSetupPage"', new: 'from "@/pages/account/AccountSetupPage"' },
    { old: "from './pages/AccountChoicePage'", new: "from '@/pages/account/AccountChoicePage'" },
    { old: 'from "./pages/AccountChoicePage"', new: 'from "@/pages/account/AccountChoicePage"' },
    { old: "from './pages/PaymentPage'", new: "from '@/pages/account/PaymentPage'" },
    { old: 'from "./pages/PaymentPage"', new: 'from "@/pages/account/PaymentPage"' },
    { old: "from './pages/PreferencesPage'", new: "from '@/pages/account/PreferencesPage'" },
    { old: 'from "./pages/PreferencesPage"', new: 'from "@/pages/account/PreferencesPage"' },
    { old: "from './pages/GeneticsManagementPage'", new: "from '@/pages/genetics/GeneticsManagementPage'" },
    { old: 'from "./pages/GeneticsManagementPage"', new: 'from "@/pages/genetics/GeneticsManagementPage"' },
    { old: "from './pages/PhenoHuntPage'", new: "from '@/pages/genetics/PhenoHuntPage'" },
    { old: 'from "./pages/PhenoHuntPage"', new: 'from "@/pages/genetics/PhenoHuntPage"' },

    // Dynamic imports - lazy loading patterns
    { old: "import('./pages/HomePage')", new: "import('@/pages/home/HomePage')" },
    { old: 'import("./pages/HomePage")', new: 'import("@/pages/home/HomePage")' },
    { old: "import('./pages/LoginPage')", new: "import('@/pages/auth/LoginPage')" },
    { old: 'import("./pages/LoginPage")', new: 'import("@/pages/auth/LoginPage")' },
    { old: "import('./pages/RegisterPage')", new: "import('@/pages/auth/RegisterPage')" },
    { old: 'import("./pages/RegisterPage")', new: 'import("@/pages/auth/RegisterPage")' },
    { old: "import('./pages/ForgotPasswordPage')", new: "import('@/pages/auth/ForgotPasswordPage')" },
    { old: 'import("./pages/ForgotPasswordPage")', new: 'import("@/pages/auth/ForgotPasswordPage")' },
    { old: "import('./pages/ResetPasswordPage')", new: "import('@/pages/auth/ResetPasswordPage')" },
    { old: 'import("./pages/ResetPasswordPage")', new: 'import("@/pages/auth/ResetPasswordPage")' },
    { old: "import('./pages/EmailVerificationPage')", new: "import('@/pages/auth/EmailVerificationPage')" },
    { old: 'import("./pages/EmailVerificationPage")', new: 'import("@/pages/auth/EmailVerificationPage")' },
    { old: "import('./pages/AgeVerificationPage')", new: "import('@/pages/auth/AgeVerificationPage')" },
    { old: 'import("./pages/AgeVerificationPage")', new: 'import("@/pages/auth/AgeVerificationPage")' },
    { old: "import('./pages/ReviewDetailPage')", new: "import('@/pages/reviews/ReviewDetailPage')" },
    { old: 'import("./pages/ReviewDetailPage")', new: 'import("@/pages/reviews/ReviewDetailPage")' },
    { old: "import('./pages/CreateReviewPage')", new: "import('@/pages/reviews/CreateReviewPage')" },
    { old: 'import("./pages/CreateReviewPage")', new: 'import("@/pages/reviews/CreateReviewPage")' },
    { old: "import('./pages/EditReviewPage')", new: "import('@/pages/reviews/EditReviewPage')" },
    { old: 'import("./pages/EditReviewPage")', new: 'import("@/pages/reviews/EditReviewPage")' },
    { old: "import('./pages/CreateFlowerReview')", new: "import('@/pages/reviews/CreateFlowerReview')" },
    { old: 'import("./pages/CreateFlowerReview")', new: 'import("@/pages/reviews/CreateFlowerReview")' },
    { old: "import('./pages/CreateHashReview')", new: "import('@/pages/reviews/CreateHashReview')" },
    { old: 'import("./pages/CreateHashReview")', new: 'import("@/pages/reviews/CreateHashReview")' },
    { old: "import('./pages/CreateConcentrateReview')", new: "import('@/pages/reviews/CreateConcentrateReview')" },
    { old: 'import("./pages/CreateConcentrateReview")', new: 'import("@/pages/reviews/CreateConcentrateReview")' },
    { old: "import('./pages/CreateEdibleReview')", new: "import('@/pages/reviews/CreateEdibleReview')" },
    { old: 'import("./pages/CreateEdibleReview")', new: 'import("@/pages/reviews/CreateEdibleReview")' },
    { old: "import('./pages/LibraryPage')", new: "import('@/pages/library/LibraryPage')" },
    { old: 'import("./pages/LibraryPage")', new: 'import("@/pages/library/LibraryPage")' },
    { old: "import('./pages/GalleryPage')", new: "import('@/pages/gallery/GalleryPage')" },
    { old: 'import("./pages/GalleryPage")', new: 'import("@/pages/gallery/GalleryPage")' },
    { old: "import('./pages/StatsPage')", new: "import('@/pages/account/StatsPage')" },
    { old: 'import("./pages/StatsPage")', new: 'import("@/pages/account/StatsPage")' },
    { old: "import('./pages/SettingsPage')", new: "import('@/pages/account/SettingsPage')" },
    { old: 'import("./pages/SettingsPage")', new: 'import("@/pages/account/SettingsPage")' },
    { old: "import('./pages/ProfilePage')", new: "import('@/pages/account/ProfilePage')" },
    { old: 'import("./pages/ProfilePage")', new: 'import("@/pages/account/ProfilePage")' },
    { old: "import('./pages/ProfileSettingsPage')", new: "import('@/pages/account/ProfileSettingsPage')" },
    { old: 'import("./pages/ProfileSettingsPage")', new: 'import("@/pages/account/ProfileSettingsPage")' },
    { old: "import('./pages/AccountSetupPage')", new: "import('@/pages/account/AccountSetupPage')" },
    { old: 'import("./pages/AccountSetupPage")', new: 'import("@/pages/account/AccountSetupPage")' },
    { old: "import('./pages/AccountChoicePage')", new: "import('@/pages/account/AccountChoicePage')" },
    { old: 'import("./pages/AccountChoicePage")', new: 'import("@/pages/account/AccountChoicePage")' },
    { old: "import('./pages/PaymentPage')", new: "import('@/pages/account/PaymentPage')" },
    { old: 'import("./pages/PaymentPage")', new: 'import("@/pages/account/PaymentPage")' },
    { old: "import('./pages/PreferencesPage')", new: "import('@/pages/account/PreferencesPage')" },
    { old: 'import("./pages/PreferencesPage")', new: 'import("@/pages/account/PreferencesPage")' },
    { old: "import('./pages/GeneticsManagementPage')", new: "import('@/pages/genetics/GeneticsManagementPage')" },
    { old: 'import("./pages/GeneticsManagementPage")', new: 'import("@/pages/genetics/GeneticsManagementPage")' },
    { old: "import('./pages/PhenoHuntPage')", new: "import('@/pages/genetics/PhenoHuntPage')" },
    { old: 'import("./pages/PhenoHuntPage")', new: 'import("@/pages/genetics/PhenoHuntPage")' },

    // Components dynamic imports
    { old: "import('./components/legal/DisclaimerRDR')", new: "import('@/components/legal/DisclaimerRDR')" },
    { old: 'import("./components/legal/DisclaimerRDR")', new: 'import("@/components/legal/DisclaimerRDR")' },
    { old: "import('./components/ui/AnimatedMeshGradient')", new: "import('@/components/ui/AnimatedMeshGradient')" },
    { old: 'import("./components/ui/AnimatedMeshGradient")', new: 'import("@/components/ui/AnimatedMeshGradient")' },
];

function walkDir(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            walkDir(filePath);
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            let content = fs.readFileSync(filePath, 'utf8');
            const originalContent = content;

            replacements.forEach(({ old, new: newVal }) => {
                content = content.split(old).join(newVal);
            });

            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                filesModified++;
                console.log('✅', file);
            }
        }
    });
}

console.log('🔧 Correction des imports...\n');
walkDir(projectRoot);
console.log('\n✨ FAIT - ' + filesModified + ' fichiers modifiés\n');
