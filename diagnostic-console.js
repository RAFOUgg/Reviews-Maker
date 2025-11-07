/**
 * Script de diagnostic pour les thèmes
 * À coller dans la console DevTools (F12) de l'application
 */

console.clear();
console.log('='.repeat(60));
console.log('🔍 DIAGNOSTIC SYSTÈME DE THÈMES');
console.log('='.repeat(60));

const root = document.documentElement;
const styles = getComputedStyle(root);

// 1. Vérifier l'attribut data-theme
const currentTheme = root.getAttribute('data-theme');
const isDark = root.classList.contains('dark');

console.log('\n📋 ÉTAT ACTUEL:');
console.log('  data-theme:', currentTheme || '❌ NON DÉFINI');
console.log('  classe .dark:', isDark ? '✅ OUI' : '❌ NON');

// 2. Vérifier les variables CSS
console.log('\n🎨 VARIABLES CSS:');
const vars = [
    '--primary',
    '--primary-light',
    '--primary-dark',
    '--accent',
    '--accent-light',
    '--accent-dark',
    '--gradient-primary',
    '--gradient-accent'
];

vars.forEach(varName => {
    const value = styles.getPropertyValue(varName).trim();
    if (value) {
        console.log(`  ✅ ${varName}: ${value}`);
    } else {
        console.log(`  ❌ ${varName}: NON DÉFINIE`);
    }
});

// 3. Tester un élément avec classe Tailwind
const purpleElements = document.querySelectorAll('.bg-purple-600, .bg-purple-500');
const greenElements = document.querySelectorAll('.bg-green-600, .bg-green-500');

console.log('\n🔍 ÉLÉMENTS TAILWIND:');
console.log(`  .bg-purple-* trouvés: ${purpleElements.length}`);
console.log(`  .bg-green-* trouvés: ${greenElements.length}`);

if (purpleElements.length > 0) {
    const el = purpleElements[0];
    const bgColor = getComputedStyle(el).backgroundColor;
    console.log(`  Couleur appliquée sur 1er purple: ${bgColor}`);
}

// 4. Test de changement de thème
console.log('\n🧪 TEST DE CHANGEMENT:');
console.log('  Exécutez ces commandes pour tester:');
console.log('');
console.log('  // Tester Émeraude:');
console.log("  document.documentElement.setAttribute('data-theme', 'emerald')");
console.log('');
console.log('  // Puis vérifier:');
console.log("  getComputedStyle(document.documentElement).getPropertyValue('--primary')");
console.log('  // Devrait afficher: #06B6D4 (cyan)');
console.log('');
console.log('  // Tester Sakura:');
console.log("  document.documentElement.setAttribute('data-theme', 'sakura')");
console.log('');
console.log('  // Puis vérifier:');
console.log("  getComputedStyle(document.documentElement).getPropertyValue('--primary')");
console.log('  // Devrait afficher: #EC4899 (rose)');

console.log('\n' + '='.repeat(60));
console.log('💡 SI LES VARIABLES SONT VIDES:');
console.log('  1. Faire Ctrl+Shift+R (hard reload)');
console.log('  2. Vérifier que index.css est bien chargé dans Network tab');
console.log('  3. Redémarrer le serveur Vite: npm run dev');
console.log('='.repeat(60) + '\n');
