const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '../client/src');
const pagesDir = path.join(srcDir, 'pages');

// Pages à réorganiser
const pagesPlan = {
  'auth': [
    'AgeVerificationPage.jsx',
    'EmailVerificationPage.jsx',
    'ForgotPasswordPage.jsx',
    'LoginPage.jsx',
    'RegisterPage.jsx',
    'ResetPasswordPage.jsx'
  ],
  'account': [
    'AccountChoicePage.jsx',
    'AccountSetupPage.jsx',
    'PaymentPage.jsx',
    'PreferencesPage.jsx',
    'ProfilePage.jsx',
    'ProfileSettingsPage.jsx',
    'SettingsPage.jsx',
    'StatsPage.jsx'
  ],
  'public': [
    'ExamplePipelineIntegration.jsx',
    'GalleryPage.jsx',
    'GeneticsManagementPage.jsx',
    'HomePage.jsx',
    'PhenoHuntPage.jsx',
    'ReviewDetailPage.jsx',
    'TemplatesDemo.jsx'
  ],
  'review': [
    'CreateReviewPage.jsx',
    'EditReviewPage.jsx',
    'LibraryPage.jsx'
  ]
};

// Sections de pages (doivent rester avec les Create*Review)
const pageSections = [
  'CulturePipelineSection.jsx',
  'Effets.jsx',
  'EffetsOptimized.jsx',
  'Experience.jsx',
    'ExtractionPipelineSection.jsx',
  'Genetiques.jsx',
  'Gouts.jsx',
  'GoutsOptimized.jsx',
  'InfosGenerales.jsx',
  'InfosGeneralesOptimized.jsx',
  'Odeurs.jsx',
  'OdeursOptimized.jsx',
  'PipelineCulture.jsx',
  'PipelineCuring.jsx',
  'RecipePipelineSection.jsx',
  'Recolte.jsx',
  'SeparationPipelineSection.jsx',
  'Texture.jsx',
  'Validation.jsx',
  'VisuelTechnique.jsx'
];

console.log('\n📦 RÉORGANISATION DES PAGES\n');

let total = 0;

// Déplacer les pages vers leurs catégories
for (const [category, files] of Object.entries(pagesPlan)) {
  console.log(`\n${category}/ (${files.length} pages):`);
  
  for (const file of files) {
    const oldPath = path.join(pagesDir, file);
    const newPath = path.join(pagesDir, category, file);
    
    if (!fs.existsSync(oldPath)) {
      console.log(`  ⚠ Skip: ${file} (n'existe pas)`);
      continue;
    }
    
    try {
      execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: srcDir, stdio: 'pipe' });
      
      // Ajuster imports
      let content = fs.readFileSync(newPath, 'utf8');
      const prefix = '../../';
      
      content = content.replace(/from ['"]\.\.\/components\//g, `from '${prefix}components/`);
      content = content.replace(/from ['"]\.\.\/(hooks|store|utils|services|config|data|lib)\//g, `from '${prefix}$1/`);
      
      fs.writeFileSync(newPath, content);
      console.log(`  ✓ ${file}`);
      total++;
    } catch (err) {
      console.log(`  ❌ ${file}: ${err.message.split('\n')[0]}`);
    }
  }
}

// Créer dossier review/ et déplacer les Create*Review
console.log(`\n\nDéplacement des dossiers Create*Review vers review/:`);

const createDirs = ['CreateConcentrateReview', 'CreateEdibleReview', 'CreateFlowerReview', 'CreateHashReview'];
const reviewDir = path.join(pagesDir, 'review');

createDirs.forEach(dir => {
  const oldPath = path.join(pagesDir, dir);
  const newPath = path.join(reviewDir, dir);
  
  if (fs.existsSync(oldPath)) {
    try {
      if (!fs.existsSync(reviewDir)) {
        fs.mkdirSync(reviewDir, { recursive: true });
      }
      execSync(`git mv "${oldPath}" "${newPath}"`, { cwd: srcDir, stdio: 'pipe' });
      console.log(`  ✓ ${dir}/`);
    } catch (err) {
      console.log(`  ❌ ${dir}: ${err.message.split('\n')[0]}`);
    }
  }
});

console.log(`\n\n✅ ${total} pages déplacées\n`);

// Afficher ce qui reste
console.log('Fichiers restants à la racine de pages/:');
const remaining = fs.readdirSync(pagesDir)
  .filter(f => f.endsWith('.jsx'));

if (remaining.length > 0) {
  remaining.forEach(f => console.log(`  - ${f}`));
  console.log(`\n⚠ ${remaining.length} fichiers à traiter manuellement`);
} else {
  console.log('  (aucun)\n');
}
