const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../client/src');
const componentsDir = path.join(srcDir, 'components');

// Plan de réorganisation complet
const reorganizationPlan = {
    'export': [
        'DragDropExport.jsx',
        'ExportMaker.jsx',
        'ExportModal.jsx',
        'FlowerExportModal.jsx',
        'TemplateRenderer.jsx',
        'WatermarkEditor.jsx'
    ],
    'sections': [
        'AnalyticsSection.jsx',
        'CuringMaturationSection.jsx',
        'EffectsSection.jsx',
        'GeneticsSection.jsx',
        'OdorSection.jsx',
        'TasteSection.jsx',
        'TextureSection.jsx',
        'VisualSection.jsx'
    ],
    'pipelines/core': [
        'PipelineCell.jsx',
        'PipelineCellBadge.jsx',
        'PipelineCellEditor.jsx',
        'PipelineCellModal.jsx',
        'PipelineCellTooltip.jsx',
        'PipelineCore.jsx',
        'PipelineDataModal.jsx',
        'PipelineManager.jsx'
    ],
    'pipelines/views': [
        'CellContextMenu.jsx',
        'CellEmojiOverlay.jsx',
        'ItemContextMenu.jsx',
        'MassAssignModal.jsx',
        'MobilePipelineView.jsx',
        'MobilePipelineViewV2.jsx',
        'PipelineDragDropView.jsx',
        'PipelineGridView.jsx',
        'PipelineTimeline.jsx',
        'PipelineWithSidebar.jsx',
        'ResponsivePipelineView.jsx'
    ],
    'pipelines/sections': [
        'CulturePipelineSection.jsx',
        'CuringPipelineSection.jsx',
        'ExtractionPipelineSection.jsx',
        'RecipePipelineSection.jsx',
        'SeparationPipelineSection.jsx'
    ],
    'genetics': [
        'CanevasPhenoHunt.jsx',
        'CultivarNode.jsx',
        'EdgeContextMenu.jsx',
        'EdgeFormModal.jsx',
        'GenealogyCanvas.jsx',
        'GeneticsLibraryCanvas.jsx',
        'NodeContextMenu.jsx',
        'NodeFormModal.jsx',
        'PhenoEdge.jsx',
        'PhenoNode.jsx',
        'TreeFormModal.jsx',
        'TreeToolbar.jsx',
        'UnifiedGeneticsCanvas.jsx',
        'CultivarCard.jsx',
        'CultivarLibraryModal.jsx',
        'CultivarLibraryPanel.jsx',
        'CultivarList.jsx'
    ],
    'forms': [
        'AutocompleteField.jsx',
        'CulturePipelineForm.jsx',
        'CuringPipelineForm.jsx',
        'DimensionsField.jsx',
        'ExperienceUtilisation.jsx',
        'FieldRenderer.jsx',
        'FieldRendererClean.jsx',
        'FrequencyField.jsx',
        'PhasesField.jsx',
        'PhotoperiodField.jsx',
        'PieCompositionField.jsx'
    ],
    'forms/helpers': [
        'EffectSelector.jsx',
        'MobileReviewLayout.jsx',
        'PhenoCodeGenerator.jsx',
        'ProductSourceSelector.jsx',
        'RecipeSection.jsx',
        'ResponsiveCreateReviewLayout.jsx',
        'ResponsiveFormComponents.jsx',
        'ResponsiveSectionComponents.jsx',
        'SubstratMixer.jsx',
        'SubstratViewer.jsx',
        'TerpeneManualInput.jsx'
    ],
    'templates': [
        'BlogArticleTemplate.jsx',
        'DetailedCardTemplate.jsx',
        'FlowerCompactTemplate.jsx',
        'FlowerCompleteTemplate.jsx',
        'FlowerDetailedTemplate.jsx',
        'ModernCompactTemplate.jsx',
        'SocialStoryTemplate.jsx'
    ],
    'gallery': [
        'HomeReviewCard.jsx',
        'ReviewCard.jsx',
        'ReviewFullDisplay.jsx',
        'ReviewPreview.jsx',
        'TemplatePicker.jsx',
        'TemplatePreview.jsx'
    ],
    'legal': [
        'AgeVerificationModal.jsx',
        'KYCUploader.jsx',
        'LegalConsentGate.jsx',
        'LegalNoticeModal.jsx',
        'TermsModal.jsx'
    ],
    'ui': [
        'Button.jsx',
        'LiquidAlert.jsx',
        'LiquidBadge.jsx',
        'LiquidButton.jsx',
        'LiquidCard.jsx',
        'LiquidCheckbox.jsx',
        'LiquidGlass.jsx',
        'LiquidInput.jsx',
        'LiquidModal.jsx',
        'LiquidMultiSelect.jsx',
        'LiquidRadio.jsx',
        'LiquidSelect.jsx',
        'LiquidSlider.jsx',
        'LiquidTextarea.jsx',
        'LiquidToggle.jsx',
        'ThemeSwitcher.jsx'
    ],
    'account': [
        'AccountTypeSelector.jsx',
        'AuthCallback.jsx',
        'CreateReviewFormWrapper.jsx',
        'FeatureGate.jsx',
        'QuickStatsSection.jsx',
        'RecentReviewsSection.jsx',
        'UpgradePrompt.jsx',
        'UsageQuotas.jsx',
        'UserProfileDropdown.jsx',
        'OAuthButtons.jsx'
    ],
    'shared': [
        'ConfirmDialog.jsx',
        'ConfirmModal.jsx',
        'EmptyState.jsx',
        'ErrorBoundary.jsx',
        'ErrorMessage.jsx',
        'Layout.jsx',
        'LoadingSpinner.jsx',
        'ToastContainer.jsx'
    ],
    'shared/config': [
        'ColorPaletteControls.jsx',
        'ConfigPane.jsx',
        'ContentModuleControls.jsx',
        'ContentPanel.jsx',
        'CustomLayoutPane.jsx',
        'CustomTemplate.jsx',
        'ImageBrandingControls.jsx',
        'ModuleBuilder.jsx',
        'PresetConfigModal.jsx',
        'PresetGroupsManager.jsx',
        'PresetManager.jsx',
        'PresetSelector.jsx',
        'TemplateSelector.jsx',
        'TypographyControls.jsx'
    ],
    'shared/charts': [
        'AromaWheelPicker.jsx',
        'CategoryRatings.jsx',
        'CategoryRatingSummary.jsx',
        'ColorWheelPicker.jsx',
        'CultureEvolutionGraph.jsx',
        'CuringEvolutionGraph.jsx',
        'EffectsRadar.jsx',
        'PurityGraph.jsx',
        'QualityGauges.jsx',
        'RatingCircle.jsx',
        'RatingsGrid.jsx',
        'SeparationPassGraph.jsx',
        'TerpeneBar.jsx',
        'WheelSelector.jsx',
        'GlobalRating.jsx'
    ],
    'shared/modals': [
        'MultiContentAssignModal.jsx',
        'PipelineStepModal.jsx',
        'QuickSelectModal.jsx',
        'ThemeModal.jsx'
    ],
    'shared/orchard': [
        'OrchardPanel.jsx',
        'PagedPreviewPane.jsx',
        'PageManager.jsx',
        'PipelineContentsSidebar.jsx',
        'PipelineEditor.jsx',
        'PipelineGitHubGrid.jsx',
        'PipelineToolbar.jsx',
        'PresetGroupQuickPicker.jsx',
        'PresetsPanelCDC.jsx',
        'SidebarHierarchique.jsx',
        'UnifiedPipeline.jsx'
    ],
    'shared/preview': [
        'PreviewPane.jsx',
        'FlowerCanvasRenderer.jsx',
        'WeedPreview.jsx',
        'MobilePhotoGallery.jsx'
    ]
};

function moveAndFixImports(targetDir, files) {
    let moved = 0;
    let skipped = 0;

    files.forEach(file => {
        const oldPath = path.join(componentsDir, file);
        const newPath = path.join(componentsDir, targetDir, file);

        if (!fs.existsSync(oldPath)) {
            console.log(`  ⚠ Skip: ${file} (n'existe pas)`);
            skipped++;
            return;
        }

        try {
            // Déplacer avec git mv
            execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: srcDir, stdio: 'pipe' });

            // Lire et ajuster les imports
            let content = fs.readFileSync(newPath, 'utf8');

            // Calculer le nombre de niveaux à remonter
            const depth = targetDir.split('/').length;
            const prefix = '../'.repeat(depth + 1);

            // Remplacer les imports
            content = content.replace(/from ['"]\.\.\/components\//g, `from '${prefix}`);
            content = content.replace(/from ['"]\.\.\/(hooks|store|utils|services|config|data|lib)\//g, `from '${prefix}$1/`);

            fs.writeFileSync(newPath, content);
            console.log(`  ✓ ${file}`);
            moved++;
        } catch (err) {
            console.log(`  ❌ Error: ${file} - ${err.message}`);
        }
    });

    return { moved, skipped };
}

console.log('🚀 RESTRUCTURATION COMPLÈTE DU PROJET\n');
console.log('='.repeat(50) + '\n');

let totalMoved = 0;
let totalSkipped = 0;

for (const [targetDir, files] of Object.entries(reorganizationPlan)) {
    console.log(`\n📦 ${targetDir}/ (${files.length} fichiers)`);
    const { moved, skipped } = moveAndFixImports(targetDir, files);
    totalMoved += moved;
    totalSkipped += skipped;
}

console.log('\n' + '='.repeat(50));
console.log(`\n✅ TERMINÉ: ${totalMoved} fichiers déplacés, ${totalSkipped} skippés\n`);
