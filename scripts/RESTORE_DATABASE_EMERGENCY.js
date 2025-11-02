/**
 * SCRIPT DE RESTAURATION D'URGENCE
 * 
 * La migration automatique a renommé les clés localStorage avec le préfixe "rm_"
 * Ce script restaure les anciennes clés pour que l'application fonctionne à nouveau
 * 
 * À exécuter IMMÉDIATEMENT dans la console du navigateur
 */

console.log('=== RESTAURATION DES DONNÉES ===\n');

const keysToRestore = [
    'authToken',
    'authEmail',
    'discordUsername',
    'discordId',
    'siteTheme',
    'previewMode'
];

let restored = 0;
let notFound = [];

keysToRestore.forEach(key => {
    const newKey = 'rm_' + key;
    const migratedValue = localStorage.getItem(newKey);

    if (migratedValue !== null) {
        // Restaurer l'ancienne clé
        localStorage.setItem(key, migratedValue);

        // Supprimer la nouvelle clé préfixée
        localStorage.removeItem(newKey);

        console.log(`✅ Restauré: ${key} = ${migratedValue.substring(0, 20)}...`);
        restored++;
    } else {
        notFound.push(key);
    }
});

console.log(`\n✅ ${restored} clés restaurées`);

if (notFound.length > 0) {
    console.log(`⚠️ Clés non trouvées (pas migrées ou absentes): ${notFound.join(', ')}`);
}

// Vérifier l'état final
console.log('\n=== ÉTAT FINAL ===');
keysToRestore.forEach(key => {
    const value = localStorage.getItem(key);
    console.log(`${key}: ${value ? '✓ présent' : '✗ absent'}`);
});

console.log('\n🔄 Recharge la page pour appliquer les changements');
console.log('→ location.reload();');
