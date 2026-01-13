#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const componentsDir = 'client/src/components';
const pagesDir = 'client/src/pages';

// Mapping of old nested paths to new root paths
const importMap = {
    // ui components
    'ui/ColorWheelPicker': 'ColorWheelPicker',
    'ui/SegmentedControl': 'SegmentedControl',
    'ui/MultiSelectPills': 'MultiSelectPills',
    'ui/ResponsiveSectionComponents': 'ResponsiveSectionComponents',
    'ui/LiquidGlass': 'LiquidGlass',
    'ui/ConfirmModal': 'ConfirmModal',
    'ui/EmptyState': 'EmptyState',
    'ui/ErrorMessage': 'ErrorMessage',

    // pipeline components
    'pipeline/PipelineTimeline': 'PipelineTimeline',
    'pipeline/PipelineEditor': 'PipelineEditor',
    'pipeline/PipelineGitHubGrid': 'PipelineGitHubGrid',
    'pipeline/CulturePipelineDragDrop': 'CulturePipelineDragDrop',
    'pipeline/CellContextMenu': 'CellContextMenu',

    // forms components
    'forms/CreateReviewFormWrapper': 'CreateReviewFormWrapper',

    // sections components
    'sections/TasteSection': 'TasteSection',
    'sections/EffectsSection': 'EffectsSection',
    'sections/OdorSection': 'OdorSection',
};

// Find all JSX files in pages
const pageFiles = glob.sync(path.join(pagesDir, '**/*.jsx'));

let totalFixed = 0;
let totalFiles = 0;

pageFiles.forEach(filePath => {
    let content = fs.readFileSync(filePath, 'utf-8');
    let originalContent = content;
    totalFiles++;

    // Fix each import pattern
    Object.entries(importMap).forEach(([oldPath, newName]) => {
        const patterns = [
            // Named imports
            new RegExp(`from\\s+['"](\\.\\./)+components/${oldPath}['"]`, 'g'),
            // Default imports
            new RegExp(`from\\s+['"](\\.\\./)+components/${oldPath}\\.jsx?['"]`, 'g'),
        ];

        patterns.forEach(pattern => {
            if (pattern.test(content)) {
                const parentDirs = (content.match(/from\s+['"](\.\.\/)*/g)?.[0] || 'from ".').split('/').length - 2;
                const relativePath = '../'.repeat(parentDirs) + 'components/' + newName;

                content = content.replace(
                    new RegExp(`from\\s+['"](\\.\\./)+components/${oldPath.replace(/\//g, '\\/')}['"]`, 'g'),
                    `from '${relativePath}'`
                );

                totalFixed++;
            }
        });
    });

    // Also fix direct relative imports like ../../ui/Component -> ../../Component
    content = content.replace(
        /from\s+['"](\.\.\/)+(components\/)?(ui|pipeline|forms|sections)\/([A-Z][a-zA-Z0-9]*)['"]/g,
        (match, p1, p2, p3, p4) => {
            const parentCount = (p1 || '').split('/').filter(x => x).length;
            const componentName = p4;
            return `from '${Array(parentCount + 1).fill('..').join('/')}/components/${componentName}'`;
        }
    );

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`✓ Fixed: ${filePath}`);
    }
});

console.log(`\n📊 Summary:`);
console.log(`   Files processed: ${totalFiles}`);
console.log(`   Import patterns fixed: ${totalFixed}`);
