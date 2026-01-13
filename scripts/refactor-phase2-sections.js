const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../client/src');
const componentsDir = path.join(srcDir, 'components');

// Phase 2: Section components
const sectionFiles = [
    'AnalyticsSection.jsx',
    'CuringMaturationSection.jsx',
    'EffectsSection.jsx',
    'GeneticsSection.jsx',
    'OdorSection.jsx',
    'TasteSection.jsx',
    'TextureSection.jsx',
    'VisualSection.jsx'
];

console.log('📦 Phase 2: Déplacement des composants Sections\n');

sectionFiles.forEach(file => {
    const oldPath = path.join(componentsDir, file);
    const newPath = path.join(componentsDir, 'sections', file);

    if (fs.existsSync(oldPath)) {
        console.log(`Moving ${file}...`);
        execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: srcDir });

        let content = fs.readFileSync(newPath, 'utf8');

        // Ajuster les imports relatifs
        content = content.replace(/from ['"]\.\.\/components\//g, `from '../../`);
        content = content.replace(/from ['"]\.\.\/(hooks|store|utils|services|config|data|lib)\//g, `from '../../$1/`);

        fs.writeFileSync(newPath, content);
        console.log(`  ✓ ${file} déplacé et imports ajustés`);
    } else {
        console.log(`  ⚠ ${file} non trouvé, skip`);
    }
});

// Mettre à jour App.jsx
const appPath = path.join(srcDir, 'App.jsx');
if (fs.existsSync(appPath)) {
    let appContent = fs.readFileSync(appPath, 'utf8');

    sectionFiles.forEach(file => {
        const componentName = file.replace('.jsx', '');
        const oldImport = `from './components/${componentName}'`;
        const newImport = `from './components/sections/${componentName}'`;
        appContent = appContent.replace(new RegExp(oldImport, 'g'), newImport);
    });

    fs.writeFileSync(appPath, appContent);
    console.log('\n✓ App.jsx mis à jour');
}

console.log('\n✅ Phase 2 terminée\n');
