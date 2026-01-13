const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../client/src');
const componentsDir = path.join(srcDir, 'components');

// Phase 1: Export components
const exportFiles = [
  'DragDropExport.jsx',
  'ExportMaker.jsx',
  'ExportModal.jsx',
  'FlowerExportModal.jsx',
  'TemplateRenderer.jsx',
  'WatermarkEditor.jsx'
];

console.log('📦 Phase 1: Déplacement des composants Export\n');

// Déplacer chaque fichier
exportFiles.forEach(file => {
  const oldPath = path.join(componentsDir, file);
  const newPath = path.join(componentsDir, 'export', file);
  
  if (fs.existsSync(oldPath)) {
    console.log(`Moving ${file}...`);
    execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: srcDir });
    
    // Fixer les imports dans le fichier déplacé
    let content = fs.readFileSync(newPath, 'utf8');
    
    // Ajuster les imports relatifs (on monte d'un niveau de plus)
    content = content.replace(/from ['"]\.\.\/components\//g, `from '../../`);
    content = content.replace(/from ['"]\.\.\/(hooks|store|utils|services|config|data|lib)\//g, `from '../../$1/`);
    
    fs.writeFileSync(newPath, content);
    console.log(`  ✓ ${file} déplacé et imports ajustés`);
  }
});

// Mettre à jour App.jsx pour les imports d'export
const appPath = path.join(srcDir, 'App.jsx');
if (fs.existsSync(appPath)) {
  let appContent = fs.readFileSync(appPath, 'utf8');
  
  // Mettre à jour les imports si nécessaires
  exportFiles.forEach(file => {
    const componentName = file.replace('.jsx', '');
    const oldImport = `from './components/${componentName}'`;
    const newImport = `from './components/export/${componentName}'`;
    appContent = appContent.replace(new RegExp(oldImport, 'g'), newImport);
  });
  
  fs.writeFileSync(appPath, appContent);
  console.log('\n✓ App.jsx mis à jour');
}

console.log('\n✅ Phase 1 terminée - 6 fichiers déplacés\n');
