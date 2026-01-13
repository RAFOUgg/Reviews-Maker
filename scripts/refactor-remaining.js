const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../client/src');
const componentsDir = path.join(srcDir, 'components');

// Fichiers restants à catégoriser
const remainingFiles = {
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
  'gallery': [
    'HomeReviewCard.jsx',
    'ReviewCard.jsx',
    'ReviewFullDisplay.jsx',
    'ReviewPreview.jsx',
    'TemplatePicker.jsx',
    'TemplatePreview.jsx'
  ],
  'pipelines/legacy': [
    'CulturePipelineDragDrop.jsx',
    'CulturePipelineTimeline.jsx',
    'CuringPipelineDragDrop.jsx',
    'CuringMaturationTimeline.jsx',
    'FertilizationPipeline.jsx',
    'MobilePipelineCellEditor.jsx',
    'MobilePipelineOptimized.jsx',
    'PipelineCulture.jsx',
    'PipelineCuring.jsx',
    'PipelineRenderer.jsx',
    'PipelineWithCultivars.jsx',
    'PurificationMethodForm.jsx',
    'PurificationPipeline.jsx',
    'PurificationPipelineDragDrop.jsx',
    'SeparationPipelineDragDrop.jsx',
    'TimelineGrid.jsx'
  ],
  'shared/ui-helpers': [
    'AdvancedSearchBar.jsx',
    'CompletionBar.jsx',
    'FilterBar.jsx',
    'HeroSection.jsx',
    'MultiSelectPills.jsx',
    'ProductTypeCards.jsx',
    'SectionNavigator.jsx',
    'SegmentedControl.jsx',
    'TagCloud.jsx'
  ],
  // Sections de pages spécifiques (à déplacer vers pages/ plus tard)
  'page-sections': [
    'Effets.jsx',
    'Genetiques.jsx',
    'Gouts.jsx',
    'InfosGeneralesFleur.jsx',
    'Odeurs.jsx',
    'Texture.jsx',
    'VisuelTechnique.jsx'
  ],
  'misc': [
    'AnalyticsPDF.jsx'
  ]
};

function moveFiles(targetDir, files) {
  let moved = 0;
  
  // Créer le dossier s'il n'existe pas
  const targetPath = path.join(componentsDir, targetDir);
  if (!fs.existsSync(targetPath)) {
    fs.mkdirSync(targetPath, { recursive: true });
  }
  
  files.forEach(file => {
    const oldPath = path.join(componentsDir, file);
    const newPath = path.join(targetPath, file);
    
    if (!fs.existsSync(oldPath)) {
      console.log(`  ⚠ Skip: ${file}`);
      return;
    }
    
    try {
      execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: srcDir, stdio: 'pipe' });
      
      // Ajuster imports
      let content = fs.readFileSync(newPath, 'utf8');
      const depth = targetDir.split('/').length;
      const prefix = '../'.repeat(depth + 1);
      
      content = content.replace(/from ['"]\.\.\/components\//g, `from '${prefix}`);
      content = content.replace(/from ['"]\.\.\/(hooks|store|utils|services|config|data|lib)\//g, `from '${prefix}$1/`);
      
      fs.writeFileSync(newPath, content);
      console.log(`  ✓ ${file}`);
      moved++;
    } catch (err) {
      console.log(`  ❌ ${file}: ${err.message.split('\n')[0]}`);
    }
  });
  
  return moved;
}

console.log('\n📦 PHASE 2: Déplacement des fichiers restants\n');

let total = 0;
for (const [category, files] of Object.entries(remainingFiles)) {
  console.log(`\n${category}/ (${files.length} fichiers):`);
  total += moveFiles(category, files);
}

console.log(`\n✅ ${total} fichiers supplémentaires déplacés\n`);
