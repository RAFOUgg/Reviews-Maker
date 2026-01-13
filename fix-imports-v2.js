#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client/src');

// Mapping exhaustif : ancien chemin -> nouveau chemin
const importMappings = [
    // Pages - Reorganised 
    // from home/
    { old: "from './pages/HomePage'", new: "from './pages/home/HomePage'" },
    { old: 'from "./pages/HomePage"', new: 'from "./pages/home/HomePage"' },
    { old: "import('./pages/HomePage')", new: "import('./pages/home/HomePage')" },
    { old: 'import("./pages/HomePage")', new: 'import("./pages/home/HomePage")' },

    // from auth/
    { old: "from './pages/LoginPage'", new: "from './pages/auth/LoginPage'" },
    { old: 'from "./pages/LoginPage"', new: 'from "./pages/auth/LoginPage"' },
    { old: "import('./pages/LoginPage')", new: "import('./pages/auth/LoginPage')" },
    { old: 'import("./pages/LoginPage")', new: 'import("./pages/auth/LoginPage")' },

    { old: "from './pages/AgeVerificationPage'", new: "from './pages/auth/AgeVerificationPage'" },
    { old: 'from "./pages/AgeVerificationPage"', new: 'from "./pages/auth/AgeVerificationPage"' },
    { old: "import('./pages/AgeVerificationPage')", new: "import('./pages/auth/AgeVerificationPage')" },
    { old: 'import("./pages/AgeVerificationPage")', new: 'import("./pages/auth/AgeVerificationPage")' },

    { old: "from './pages/RegisterPage'", new: "from './pages/auth/RegisterPage'" },
    { old: 'from "./pages/RegisterPage"', new: 'from "./pages/auth/RegisterPage"' },
    { old: "import('./pages/RegisterPage')", new: "import('./pages/auth/RegisterPage')" },
    { old: 'import("./pages/RegisterPage")', new: 'import("./pages/auth/RegisterPage")' },

    { old: "from './pages/EmailVerificationPage'", new: "from './pages/auth/EmailVerificationPage'" },
    { old: 'from "./pages/EmailVerificationPage"', new: 'from "./pages/auth/EmailVerificationPage"' },
    { old: "import('./pages/EmailVerificationPage')", new: "import('./pages/auth/EmailVerificationPage')" },
    { old: 'import("./pages/EmailVerificationPage")', new: 'import("./pages/auth/EmailVerificationPage")' },

    { old: "from './pages/ForgotPasswordPage'", new: "from './pages/auth/ForgotPasswordPage'" },
    { old: 'from "./pages/ForgotPasswordPage"', new: 'from "./pages/auth/ForgotPasswordPage"' },
    { old: "import('./pages/ForgotPasswordPage')", new: "import('./pages/auth/ForgotPasswordPage')" },
    { old: 'import("./pages/ForgotPasswordPage")', new: 'import("./pages/auth/ForgotPasswordPage")' },

    { old: "from './pages/ResetPasswordPage'", new: "from './pages/auth/ResetPasswordPage'" },
    { old: 'from "./pages/ResetPasswordPage"', new: 'from "./pages/auth/ResetPasswordPage"' },
    { old: "import('./pages/ResetPasswordPage')", new: "import('./pages/auth/ResetPasswordPage')" },
    { old: 'import("./pages/ResetPasswordPage")', new: 'import("./pages/auth/ResetPasswordPage")' },

    // from reviews/
    { old: "from './pages/CreateReviewPage'", new: "from './pages/reviews/CreateReviewPage'" },
    { old: 'from "./pages/CreateReviewPage"', new: 'from "./pages/reviews/CreateReviewPage"' },
    { old: "import('./pages/CreateReviewPage')", new: "import('./pages/reviews/CreateReviewPage')" },
    { old: 'import("./pages/CreateReviewPage")', new: 'import("./pages/reviews/CreateReviewPage")' },

    { old: "from './pages/EditReviewPage'", new: "from './pages/reviews/EditReviewPage'" },
    { old: 'from "./pages/EditReviewPage"', new: 'from "./pages/reviews/EditReviewPage"' },
    { old: "import('./pages/EditReviewPage')", new: "import('./pages/reviews/EditReviewPage')" },
    { old: 'import("./pages/EditReviewPage")', new: 'import("./pages/reviews/EditReviewPage")' },

    { old: "from './pages/ReviewDetailPage'", new: "from './pages/reviews/ReviewDetailPage'" },
    { old: 'from "./pages/ReviewDetailPage"', new: 'from "./pages/reviews/ReviewDetailPage"' },
    { old: "import('./pages/ReviewDetailPage')", new: "import('./pages/reviews/ReviewDetailPage')" },
    { old: 'import("./pages/ReviewDetailPage")', new: 'import("./pages/reviews/ReviewDetailPage")' },

    // from gallery/
    { old: "from './pages/GalleryPage'", new: "from './pages/gallery/GalleryPage'" },
    { old: 'from "./pages/GalleryPage"', new: 'from "./pages/gallery/GalleryPage"' },
    { old: "import('./pages/GalleryPage')", new: "import('./pages/gallery/GalleryPage')" },
    { old: 'import("./pages/GalleryPage")', new: 'import("./pages/gallery/GalleryPage")' },

    // from library/
    { old: "from './pages/LibraryPage'", new: "from './pages/library/LibraryPage'" },
    { old: 'from "./pages/LibraryPage"', new: 'from "./pages/library/LibraryPage"' },
    { old: "import('./pages/LibraryPage')", new: "import('./pages/library/LibraryPage')" },
    { old: 'import("./pages/LibraryPage")', new: 'import("./pages/library/LibraryPage")' },

    // from genetics/
    { old: "from './pages/GeneticsManagementPage'", new: "from './pages/genetics/GeneticsManagementPage'" },
    { old: 'from "./pages/GeneticsManagementPage"', new: 'from "./pages/genetics/GeneticsManagementPage"' },
    { old: "import('./pages/GeneticsManagementPage')", new: "import('./pages/genetics/GeneticsManagementPage')" },
    { old: 'import("./pages/GeneticsManagementPage")', new: 'import("./pages/genetics/GeneticsManagementPage")' },

    { old: "from './pages/PhenoHuntPage'", new: "from './pages/genetics/PhenoHuntPage'" },
    { old: 'from "./pages/PhenoHuntPage"', new: 'from "./pages/genetics/PhenoHuntPage"' },
    { old: "import('./pages/PhenoHuntPage')", new: "import('./pages/genetics/PhenoHuntPage')" },
    { old: 'import("./pages/PhenoHuntPage")', new: 'import("./pages/genetics/PhenoHuntPage")' },

    // from account/
    { old: "from './pages/StatsPage'", new: "from './pages/account/StatsPage'" },
    { old: 'from "./pages/StatsPage"', new: 'from "./pages/account/StatsPage"' },
    { old: "import('./pages/StatsPage')", new: "import('./pages/account/StatsPage')" },
    { old: 'import("./pages/StatsPage")', new: 'import("./pages/account/StatsPage")' },

    { old: "from './pages/SettingsPage'", new: "from './pages/account/SettingsPage'" },
    { old: 'from "./pages/SettingsPage"', new: 'from "./pages/account/SettingsPage"' },
    { old: "import('./pages/SettingsPage')", new: "import('./pages/account/SettingsPage')" },
    { old: 'import("./pages/SettingsPage")', new: 'import("./pages/account/SettingsPage")' },

    { old: "from './pages/ProfilePage'", new: "from './pages/account/ProfilePage'" },
    { old: 'from "./pages/ProfilePage"', new: 'from "./pages/account/ProfilePage"' },
    { old: "import('./pages/ProfilePage')", new: "import('./pages/account/ProfilePage')" },
    { old: 'import("./pages/ProfilePage")', new: 'import("./pages/account/ProfilePage")' },

    { old: "from './pages/ProfileSettingsPage'", new: "from './pages/account/ProfileSettingsPage'" },
    { old: 'from "./pages/ProfileSettingsPage"', new: 'from "./pages/account/ProfileSettingsPage"' },
    { old: "import('./pages/ProfileSettingsPage')", new: "import('./pages/account/ProfileSettingsPage')" },
    { old: 'import("./pages/ProfileSettingsPage")', new: 'import("./pages/account/ProfileSettingsPage")' },

    { old: "from './pages/PreferencesPage'", new: "from './pages/account/PreferencesPage'" },
    { old: 'from "./pages/PreferencesPage"', new: 'from "./pages/account/PreferencesPage"' },
    { old: "import('./pages/PreferencesPage')", new: "import('./pages/account/PreferencesPage')" },
    { old: 'import("./pages/PreferencesPage")', new: 'import("./pages/account/PreferencesPage")' },

    { old: "from './pages/PaymentPage'", new: "from './pages/account/PaymentPage'" },
    { old: 'from "./pages/PaymentPage"', new: 'from "./pages/account/PaymentPage"' },
    { old: "import('./pages/PaymentPage')", new: "import('./pages/account/PaymentPage')" },
    { old: 'import("./pages/PaymentPage")', new: 'import("./pages/account/PaymentPage")' },

    { old: "from './pages/AccountSetupPage'", new: "from './pages/account/AccountSetupPage'" },
    { old: 'from "./pages/AccountSetupPage"', new: 'from "./pages/account/AccountSetupPage"' },
    { old: "import('./pages/AccountSetupPage')", new: "import('./pages/account/AccountSetupPage')" },
    { old: 'import("./pages/AccountSetupPage")', new: 'import("./pages/account/AccountSetupPage")' },

    { old: "from './pages/AccountChoicePage'", new: "from './pages/account/AccountChoicePage'" },
    { old: 'from "./pages/AccountChoicePage"', new: 'from "./pages/account/AccountChoicePage"' },
    { old: "import('./pages/AccountChoicePage')", new: "import('./pages/account/AccountChoicePage')" },
    { old: 'import("./pages/AccountChoicePage")', new: 'import("./pages/account/AccountChoicePage")' },

    // Components reorganised - fix those at root
    { old: "from './components/AuthCallback'", new: "from './components/auth/AuthCallback'" },
    { old: 'from "./components/AuthCallback"', new: 'from "./components/auth/AuthCallback"' },

    { old: "from './components/ErrorBoundary'", new: "from './components/errors/ErrorBoundary'" },
    { old: 'from "./components/ErrorBoundary"', new: 'from "./components/errors/ErrorBoundary"' },

    { old: "from './components/ToastContainer'", new: "from './components/feedback/ToastContainer'" },
    { old: 'from "./components/ToastContainer"', new: 'from "./components/feedback/ToastContainer"' },

    { old: "from './components/LegalConsentGate'", new: "from './components/legal/LegalConsentGate'" },
    { old: 'from "./components/LegalConsentGate"', new: 'from "./components/legal/LegalConsentGate"' },

    // Components - imports WITHIN components (relative paths)
    { old: "from './Button'", new: "from '../liquid/Button'" },
    { old: 'from "./Button"', new: 'from "../liquid/Button"' },

    { old: "from './AdvancedSearchBar'", new: "from '../gallery/AdvancedSearchBar'" },
    { old: 'from "./AdvancedSearchBar"', new: 'from "../gallery/AdvancedSearchBar"' },

    { old: "from './ResponsiveCreateReviewLayout'", new: "from '../shared/ResponsiveCreateReviewLayout'" },
    { old: 'from "./ResponsiveCreateReviewLayout"', new: 'from "../shared/ResponsiveCreateReviewLayout"' },

    { old: "from './ReviewPreview'", new: "from '../review/ReviewPreview'" },
    { old: 'from "./ReviewPreview"', new: 'from "../review/ReviewPreview"' },

    { old: "from './orchard/OrchardPanel'", new: "from '../orchardPanel/OrchardPanel'" },
    { old: 'from "./orchard/OrchardPanel"', new: 'from "../orchardPanel/OrchardPanel"' },

    { old: "from './TimelineGrid'", new: "from '../pipeline/TimelineGrid'" },
    { old: 'from "./TimelineGrid"', new: 'from "../pipeline/TimelineGrid"' },

    { old: "from './PipelineStepModal'", new: "from '../modals/PipelineStepModal'" },
    { old: 'from "./PipelineStepModal"', new: 'from "../modals/PipelineStepModal"' },

    { old: "from './LiquidCard'", new: "from '../liquid/LiquidCard'" },
    { old: 'from "./LiquidCard"', new: 'from "../liquid/LiquidCard"' },

    { old: "from './LiquidButton'", new: "from '../liquid/LiquidButton'" },
    { old: 'from "./LiquidButton"', new: 'from "../liquid/LiquidButton"' },

    { old: "from './LiquidInput'", new: "from '../liquid/LiquidInput'" },
    { old: 'from "./LiquidInput"', new: 'from "../liquid/LiquidInput"' },

    { old: "from './LiquidModal'", new: "from '../liquid/LiquidModal'" },
    { old: 'from "./LiquidModal"', new: 'from "../liquid/LiquidModal"' },

    // Index files
    { old: "from './cultureSchema'", new: "from './schemas/cultureSchema'" },
    { old: 'from "./cultureSchema"', new: 'from "./schemas/cultureSchema"' },

    { old: "from './separationSchema'", new: "from './schemas/separationSchema'" },
    { old: 'from "./separationSchema"', new: 'from "./schemas/separationSchema"' },

    { old: "from './extractionSchema'", new: "from './schemas/extractionSchema'" },
    { old: 'from "./extractionSchema"', new: 'from "./schemas/extractionSchema"' },

    { old: "from './purificationSchema'", new: "from './schemas/purificationSchema'" },
    { old: 'from "./purificationSchema"', new: 'from "./schemas/purificationSchema"' },

    { old: "from './recipeSchema'", new: "from './schemas/recipeSchema'" },
    { old: 'from "./recipeSchema"', new: 'from "./schemas/recipeSchema"' },
];

let filesModified = 0;

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

            importMappings.forEach(({ old, new: newVal }) => {
                content = content.split(old).join(newVal);
            });

            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                filesModified++;
                console.log('OK', path.relative(srcPath, filePath));
            }
        }
    });
}

console.log('Correction des imports...\n');
walkDir(srcPath);
console.log('\nFAIT - ' + filesModified + ' fichiers modifie\n');
