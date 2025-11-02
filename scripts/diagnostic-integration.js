/**
 * Script de diagnostic pour vérifier l'état de l'application après les correctifs
 * À exécuter dans la console du navigateur après chargement de index.html
 */

console.log('=== DIAGNOSTIC REVIEWS-MAKER ===\n');

// 1. Vérifier que la compat layer est chargée
console.log('1. Compat Layer:');
console.log('   - __RM_COMPAT_READY__:', window.__RM_COMPAT_READY__ || false);
console.log('   - __RM_INTERNAL__ (debug):', typeof window.__RM_INTERNAL__ === 'object' ? 'disponible' : 'non disponible');

// 2. Vérifier que les modules core sont accessibles
console.log('\n2. Modules Core:');
if (window.__RM_INTERNAL__) {
    console.log('   - StorageManager:', typeof window.__RM_INTERNAL__.storage === 'object' ? '✓' : '✗');
    console.log('   - ReviewsAPI:', typeof window.__RM_INTERNAL__.reviewsAPI === 'object' ? '✓' : '✗');
    console.log('   - ModalManager:', typeof window.__RM_INTERNAL__.modalManager === 'object' ? '✓' : '✗');
    console.log('   - UserDataManager:', typeof window.__RM_INTERNAL__.userDataManager === 'object' ? '✓' : '✗');
} else {
    console.log('   (Mode production - modules non exposés)');
}

// 3. Vérifier que les fonctions de compatibilité sont disponibles
console.log('\n3. Fonctions de Compatibilité:');
const compatFunctions = [
    'openAccountModal',
    'closeAccountModal',
    'openLibraryModal',
    'remoteListPublicReviews',
    'remoteListMyReviews',
    'remoteSave'
];
compatFunctions.forEach(fn => {
    console.log(`   - ${fn}:`, typeof window[fn] === 'function' ? '✓' : '✗');
});

// 4. Vérifier l'état de l'authentification
console.log('\n4. Authentification:');
console.log('   - authToken:', localStorage.getItem('authToken') ? 'présent' : 'absent');
console.log('   - authEmail:', localStorage.getItem('authEmail') || 'absent');
console.log('   - isUserConnected:', typeof isUserConnected !== 'undefined' ? isUserConnected : 'indéfini');

// 5. Vérifier que le DOM est prêt
console.log('\n5. DOM Elements:');
const domElements = [
    'accountModal',
    'accountModalOverlay',
    'closeAccountModal',
    'floatingAuthBtn',
    'libraryModal',
    'compactLibraryList'
];
domElements.forEach(id => {
    const el = document.getElementById(id);
    console.log(`   - #${id}:`, el ? '✓' : '✗');
});

// 6. Test d'ouverture du modal de compte
console.log('\n6. Test Modal de Compte:');
if (typeof openAccountModal === 'function') {
    console.log('   - openAccountModal() disponible');
    console.log('   → Tentative d\'ouverture...');
    try {
        openAccountModal();
        console.log('   ✓ Modal ouvert avec succès');
        setTimeout(() => {
            console.log('   → Fermeture automatique dans 2s...');
            if (typeof closeAccountModal === 'function') {
                closeAccountModal();
                console.log('   ✓ Modal fermé');
            }
        }, 2000);
    } catch (e) {
        console.error('   ✗ Erreur:', e.message);
    }
} else {
    console.error('   ✗ openAccountModal non disponible');
}

// 7. Vérifier l'API Backend
console.log('\n7. API Backend:');
console.log('   - remoteEnabled:', typeof remoteEnabled !== 'undefined' ? remoteEnabled : 'indéfini');
console.log('   - remoteBase:', typeof remoteBase !== 'undefined' ? remoteBase : 'indéfini');

// 8. Test de chargement des reviews
console.log('\n8. Test Chargement Reviews:');
if (typeof remoteListPublicReviews === 'function') {
    console.log('   → Chargement des reviews publiques...');
    remoteListPublicReviews()
        .then(reviews => {
            console.log(`   ✓ ${reviews.length} reviews chargées`);
            if (reviews.length > 0) {
                const sample = reviews[0];
                console.log('   → Exemple de review:');
                console.log('     - productName:', sample.productName || 'absent');
                console.log('     - productType:', sample.productType || 'absent');
                console.log('     - holderName:', sample.holderName || 'absent');
                console.log('     - date:', sample.date || 'absent');
                console.log('     - image:', sample.image ? 'présente' : 'absente');
            }
        })
        .catch(err => {
            console.error('   ✗ Erreur:', err.message);
        });
} else {
    console.error('   ✗ remoteListPublicReviews non disponible');
}

console.log('\n=== FIN DIAGNOSTIC ===');
console.log('\nPour activer le mode debug et voir les logs détaillés:');
console.log('  window.DEBUG = true;');
console.log('  // puis recharger la page ou aller à: ?debug=1');
