#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const srcPath = path.join(__dirname, 'client/src');

// Mapping complet: ancien chemin -> nouveau chemin
const importMappings = [
    // PAGES - restants
    { old: "from './pages/AgeVerificationPage'", new: "from './pages/auth/AgeVerificationPage'" },
    { old: 'from "./pages/AgeVerificationPage"', new: 'from "./pages/auth/AgeVerificationPage"' },
    { old: "from './pages/EmailVerificationPage'", new: "from './pages/auth/EmailVerificationPage'" },
    { old: 'from "./pages/EmailVerificationPage"', new: 'from "./pages/auth/EmailVerificationPage"' },
    { old: "from './pages/ForgotPasswordPage'", new: "from './pages/auth/ForgotPasswordPage'" },
    { old: 'from "./pages/ForgotPasswordPage"', new: 'from "./pages/auth/ForgotPasswordPage"' },
    { old: "from './pages/RegisterPage'", new: "from './pages/auth/RegisterPage'" },
    { old: 'from "./pages/RegisterPage"', new: 'from "./pages/auth/RegisterPage"' },
    { old: "from './pages/ResetPasswordPage'", new: "from './pages/auth/ResetPasswordPage'" },
    { old: 'from "./pages/ResetPasswordPage"', new: 'from "./pages/auth/ResetPasswordPage"' },
    { old: "from './pages/PhenoHuntPage'", new: "from './pages/genetics/PhenoHuntPage'" },
    { old: 'from "./pages/PhenoHuntPage"', new: 'from "./pages/genetics/PhenoHuntPage"' },

    // COMPONENTS - restants
    { old: "from './components/CategoryRatingSummary'", new: "from './components/sections/CategoryRatingSummary'" },
    { old: 'from "./components/CategoryRatingSummary"', new: 'from "./components/sections/CategoryRatingSummary"' },
    { old: "from './components/CompletionBar'", new: "from './components/sections/CompletionBar'" },
    { old: 'from "./components/CompletionBar"', new: 'from "./components/sections/CompletionBar"' },
    { old: "from './components/ConfirmDialog'", new: "from './components/modals/ConfirmDialog'" },
    { old: 'from "./components/ConfirmDialog"', new: 'from "./components/modals/ConfirmDialog"' },
    { old: "from './components/EffectSelector'", new: "from './components/selectors/EffectSelector'" },
    { old: 'from "./components/EffectSelector"', new: 'from "./components/selectors/EffectSelector"' },
    { old: "from './components/FilterBar'", new: "from './components/gallery/FilterBar'" },
    { old: 'from "./components/FilterBar"', new: 'from "./components/gallery/FilterBar"' },
    { old: "from './components/GlobalRating'", new: "from './components/sections/GlobalRating'" },
    { old: 'from "./components/GlobalRating"', new: 'from "./components/sections/GlobalRating"' },
    { old: "from './components/HomeReviewCard'", new: "from './components/review/HomeReviewCard'" },
    { old: 'from "./components/HomeReviewCard"', new: 'from "./components/review/HomeReviewCard"' },
    { old: "from './components/LoadingSpinner'", new: "from './components/feedback/LoadingSpinner'" },
    { old: 'from "./components/LoadingSpinner"', new: 'from "./components/feedback/LoadingSpinner"' },
    { old: "from './components/MobilePhotoGallery'", new: "from './components/review/MobilePhotoGallery'" },
    { old: 'from "./components/MobilePhotoGallery"', new: 'from "./components/review/MobilePhotoGallery"' },
    { old: "from './components/PipelineStepModal'", new: "from './components/modals/PipelineStepModal'" },
    { old: 'from "./components/PipelineStepModal"', new: 'from "./components/modals/PipelineStepModal"' },
    { old: "from './components/QuickSelectModal'", new: "from './components/selectors/QuickSelectModal'" },
    { old: 'from "./components/QuickSelectModal"', new: 'from "./components/selectors/QuickSelectModal"' },
    { old: "from './components/ResponsiveCreateReviewLayout'", new: "from './components/shared/ResponsiveCreateReviewLayout'" },
    { old: 'from "./components/ResponsiveCreateReviewLayout"', new: 'from "./components/shared/ResponsiveCreateReviewLayout"' },
    { old: "from './components/ResponsiveFormComponents'", new: "from './components/shared/ResponsiveFormComponents'" },
    { old: 'from "./components/ResponsiveFormComponents"', new: 'from "./components/shared/ResponsiveFormComponents"' },
    { old: "from './components/ReviewFullDisplay'", new: "from './components/review/ReviewFullDisplay'" },
    { old: 'from "./components/ReviewFullDisplay"', new: 'from "./components/review/ReviewFullDisplay"' },
    { old: "from './components/ReviewPreview'", new: "from './components/review/ReviewPreview'" },
    { old: 'from "./components/ReviewPreview"', new: 'from "./components/review/ReviewPreview"' },
    { old: "from './components/SectionNavigator'", new: "from './components/shared/SectionNavigator'" },
    { old: 'from "./components/SectionNavigator"', new: 'from "./components/shared/SectionNavigator"' },
    { old: "from './components/WheelSelector'", new: "from './components/selectors/WheelSelector'" },
    { old: 'from "./components/WheelSelector"', new: 'from "./components/selectors/WheelSelector"' },

    // Dynamic imports - PAGES
    { old: "import('./pages/AgeVerificationPage')", new: "import('./pages/auth/AgeVerificationPage')" },
    { old: 'import("./pages/AgeVerificationPage")', new: 'import("./pages/auth/AgeVerificationPage")' },
    { old: "import('./pages/EmailVerificationPage')", new: "import('./pages/auth/EmailVerificationPage')" },
    { old: 'import("./pages/EmailVerificationPage")', new: 'import("./pages/auth/EmailVerificationPage")' },
    { old: "import('./pages/ForgotPasswordPage')", new: "import('./pages/auth/ForgotPasswordPage')" },
    { old: 'import("./pages/ForgotPasswordPage")', new: 'import("./pages/auth/ForgotPasswordPage")' },
    { old: "import('./pages/RegisterPage')", new: "import('./pages/auth/RegisterPage')" },
    { old: 'import("./pages/RegisterPage")', new: 'import("./pages/auth/RegisterPage")' },
    { old: "import('./pages/ResetPasswordPage')", new: "import('./pages/auth/ResetPasswordPage')" },
    { old: 'import("./pages/ResetPasswordPage")', new: 'import("./pages/auth/ResetPasswordPage")' },
    { old: "import('./pages/PhenoHuntPage')", new: "import('./pages/genetics/PhenoHuntPage')" },
    { old: 'import("./pages/PhenoHuntPage")', new: 'import("./pages/genetics/PhenoHuntPage")' },
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
                console.log('✅', path.relative(srcPath, filePath));
            }
        }
    });
}

console.log('🔧 Correction des imports...\n');
walkDir(srcPath);
console.log('\n✨ FAIT - ' + filesModified + ' fichiers modifiés\n');
