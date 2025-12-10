/**
 * Script de diagnostic pour le frontend Reviews-Maker
 * Vérifie l'état du localStorage et les données utilisateur
 */

console.log('=== DIAGNOSTIC FRONTEND REVIEWS-MAKER ===\n');

// 1. Vérifier le localStorage
console.log('1. État du localStorage:');
const keys = Object.keys(localStorage);
console.log(`   Total clés: ${keys.length}`);

keys.forEach(key => {
    try {
        const value = localStorage.getItem(key);
        console.log(`   - ${key}: ${value ? value.substring(0, 100) + (value.length > 100 ? '...' : '') : 'null'}`);
    } catch (e) {
        console.log(`   - ${key}: ERREUR - ${e.message}`);
    }
});

// 2. Vérifier orchard-pages-storage
console.log('\n2. État orchard-pages-storage:');
const orchardPages = localStorage.getItem('orchard-pages-storage');
if (orchardPages) {
    try {
        const parsed = JSON.parse(orchardPages);
        console.log('   ✓ Parse réussi');
        console.log('   - pagesEnabled:', parsed.state?.pagesEnabled);
        console.log('   - pages count:', parsed.state?.pages?.length);
        console.log('   - pages:', JSON.stringify(parsed.state?.pages, null, 2));
    } catch (e) {
        console.log('   ✗ ERREUR de parsing:', e.message);
        console.log('   → Valeur brute:', orchardPages.substring(0, 200));
    }
} else {
    console.log('   ℹ Aucune donnée sauvegardée');
}

// 3. Vérifier les données utilisateur
console.log('\n3. Données utilisateur (fetch /api/auth/me):');
fetch('/api/auth/me', { credentials: 'include' })
    .then(res => res.json())
    .then(user => {
        console.log('   ✓ Requête réussie');
        console.log('   - ID:', user.id);
        console.log('   - Username:', user.username);
        console.log('   - Email:', user.email);
        console.log('   - Avatar:', user.avatar);
        console.log('   - DiscordId:', user.discordId);
        console.log('   - Roles:', user.roles);
        console.log('   → Objet complet:', JSON.stringify(user, null, 2));
    })
    .catch(err => {
        console.log('   ✗ ERREUR:', err.message);
    });

// 4. Vérifier les erreurs dans la console
console.log('\n4. Instructions pour nettoyer le localStorage:');
console.log('   Pour réinitialiser orchard-pages-storage:');
console.log('   → localStorage.removeItem("orchard-pages-storage")');
console.log('   Pour tout nettoyer:');
console.log('   → localStorage.clear()');

console.log('\n=== FIN DU DIAGNOSTIC ===');
