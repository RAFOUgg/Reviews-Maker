const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../client/src');

// Mappage des composants déplacés
const componentMoves = {
    // Account
    'AuthCallback': 'components/account',
    'AccountTypeSelector': 'components/account',
    'CreateReviewFormWrapper': 'components/account',
    'FeatureGate': 'components/account',
    'OAuthButtons': 'components/account',
    'QuickStatsSection': 'components/account',
    'RecentReviewsSection': 'components/account',
    'UpgradePrompt': 'components/account',
    'UsageQuotas': 'components/account',
    'UserProfileDropdown': 'components/account',

    // Export
    'DragDropExport': 'components/export',
    'ExportMaker': 'components/export',
    'ExportModal': 'components/export',
    'FlowerExportModal': 'components/export',
    'TemplateRenderer': 'components/export',
    'WatermarkEditor': 'components/export',

    // Sections
    'AnalyticsSection': 'components/sections',
    'CuringMaturationSection': 'components/sections',
    'EffectsSection': 'components/sections',
    'GeneticsSection': 'components/sections',
    'OdorSection': 'components/sections',
    'TasteSection': 'components/sections',
    'TextureSection': 'components/sections',
    'VisualSection': 'components/sections',

    // Gallery
    'HomeReviewCard': 'components/gallery',
    'ReviewCard': 'components/gallery',
    'ReviewFullDisplay': 'components/gallery',
    'ReviewPreview': 'components/gallery',
    'TemplatePicker': 'components/gallery',
    'TemplatePreview': 'components/gallery',

    // Legal
    'AgeVerificationModal': 'components/legal',
    'KYCUploader': 'components/legal',
    'LegalConsentGate': 'components/legal',
    'LegalNoticeModal': 'components/legal',
    'TermsModal': 'components/legal',
    'DisclaimerRDR': 'components/legal',

    // UI
    'Button': 'components/ui',
    'ThemeSwitcher': 'components/ui',
    'LiquidAlert': 'components/ui',
    'LiquidBadge': 'components/ui',
    'LiquidButton': 'components/ui',
    'LiquidCard': 'components/ui',
    'LiquidCheckbox': 'components/ui',
    'LiquidGlass': 'components/ui',
    'LiquidInput': 'components/ui',
    'LiquidModal': 'components/ui',
    'LiquidMultiSelect': 'components/ui',
    'LiquidRadio': 'components/ui',
    'LiquidSelect': 'components/ui',
    'LiquidSlider': 'components/ui',
    'LiquidTextarea': 'components/ui',
    'LiquidToggle': 'components/ui',

    // Shared
    'Layout': 'components/shared',
    'ToastContainer': 'components/shared',
    'ErrorBoundary': 'components/shared',
    'LoadingSpinner': 'components/shared',
    'ConfirmDialog': 'components/shared',
    'ConfirmModal': 'components/shared',
    'EmptyState': 'components/shared',
    'ErrorMessage': 'components/shared',

    // Shared/charts
    'AromaWheelPicker': 'components/shared/charts',
    'ColorWheelPicker': 'components/shared/charts',
    'WheelSelector': 'components/shared/charts',
    'EffectsRadar': 'components/shared/charts',
    'CategoryRatings': 'components/shared/charts',
    'CategoryRatingSummary': 'components/shared/charts',
    'GlobalRating': 'components/shared/charts',

    // Shared/ui-helpers
    'FilterBar': 'components/shared/ui-helpers',
    'HeroSection': 'components/shared/ui-helpers',
    'ProductTypeCards': 'components/shared/ui-helpers',
    'MultiSelectPills': 'components/shared/ui-helpers',
    'SegmentedControl': 'components/shared/ui-helpers',
    'SectionNavigator': 'components/shared/ui-helpers',

    // Forms
    'EffectSelector': 'components/forms/helpers',
    'ProductSourceSelector': 'components/forms/helpers',
    'PhenoCodeGenerator': 'components/forms/helpers',
    'MobileReviewLayout': 'components/forms/helpers',
    'ResponsiveCreateReviewLayout': 'components/forms/helpers',
    'ResponsiveSectionComponents': 'components/forms/helpers',
    'RecipeSection': 'components/forms/helpers',

    // Genetics
    'UnifiedGeneticsCanvas': 'components/genetics',
    'CanevasPhenoHunt': 'components/genetics',
    'TreeFormModal': 'components/genetics',
    'CultivarList': 'components/genetics',

    // Pipelines
    'UnifiedPipeline': 'components/shared/orchard',
    'OrchardPanel': 'components/shared/orchard',
    'PipelineWithSidebar': 'components/pipelines/views',
    'PipelineDragDropView': 'components/pipelines/views'
};

function getRelativePath(fromFile, toPath) {
    const fromDir = path.dirname(fromFile);
    const relative = path.relative(fromDir, path.join(srcDir, toPath));
    return relative.replace(/\\/g, '/');
}

function fixImports(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    // Pour chaque composant déplacé
    Object.entries(componentMoves).forEach(([component, newPath]) => {
        // Patterns d'import possibles
        const patterns = [
            // from '../components/Component'
            new RegExp(`from ['"]\\.\\.\/components\/${component}['"]`, 'g'),
            // from '../../components/Component'
            new RegExp(`from ['"]\\.\\.\/\\.\\.\/components\/${component}['"]`, 'g'),
            // from '../../../components/Component'
            new RegExp(`from ['"]\\.\\.\/\\.\\.\/\\.\\.\/components\/${component}['"]`, 'g'),
            // from './components/Component'
            new RegExp(`from ['"]\\.\/components\/${component}['"]`, 'g'),
        ];

        patterns.forEach(pattern => {
            if (pattern.test(content)) {
                const correctPath = getRelativePath(filePath, newPath);
                content = content.replace(pattern, `from '${correctPath}/${component}'`);
                changed = true;
            }
        });
    });

    if (changed) {
        fs.writeFileSync(filePath, content);
        return true;
    }
    return false;
}

function walkDir(dir, callback) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules') {
                walkDir(fullPath, callback);
            }
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            callback(fullPath);
        }
    });
}

console.log('🔧 Correction globale des imports...\n');

let fixed = 0;
walkDir(srcDir, (filePath) => {
    if (fixImports(filePath)) {
        const rel = path.relative(srcDir, filePath);
        console.log(`✓ ${rel}`);
        fixed++;
    }
});

console.log(`\n✅ ${fixed} fichiers corrigés\n`);
