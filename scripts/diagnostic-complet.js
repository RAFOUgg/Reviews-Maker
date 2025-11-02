/**
 * DIAGNOSTIC COMPLET - État de l'application
 * Copier/coller dans la console du navigateur (F12)
 */

console.log('=== DIAGNOSTIC REVIEWS MAKER ===\n');

// 1. Vérifier localStorage
console.log('1. LOCAL STORAGE:');
const authToken = localStorage.getItem('authToken');
const authEmail = localStorage.getItem('authEmail');
const discordUsername = localStorage.getItem('discordUsername');
const discordId = localStorage.getItem('discordId');

console.log('   authToken:', authToken ? `présent (${authToken.substring(0, 10)}...)` : '❌ ABSENT');
console.log('   authEmail:', authEmail || '❌ ABSENT');
console.log('   discordUsername:', discordUsername || 'absent');
console.log('   discordId:', discordId || 'absent');

// 2. Vérifier les variables globales
console.log('\n2. VARIABLES GLOBALES:');
console.log('   isUserConnected:', typeof isUserConnected !== 'undefined' ? isUserConnected : '❌ UNDEFINED');
console.log('   remoteEnabled:', typeof remoteEnabled !== 'undefined' ? remoteEnabled : '❌ UNDEFINED');
console.log('   remoteBase:', typeof remoteBase !== 'undefined' ? remoteBase : '❌ UNDEFINED');

// 3. Vérifier les fonctions
console.log('\n3. FONCTIONS:');
const functions = [
    'updateAuthUI',
    'openAccountModal',
    'closeAccountModal',
    'renderAccountView',
    'openLibraryModal',
    'tryEnableRemote'
];
functions.forEach(fn => {
    console.log(`   ${fn}:`, typeof window[fn] === 'function' ? '✓' : '❌ MISSING');
});

// 4. Vérifier les éléments DOM
console.log('\n4. DOM ELEMENTS:');
const elements = [
    'floatingAuthBtn',
    'accountModal',
    'accountModalOverlay',
    'authModal',
    'libraryModal',
    'openLibrary'
];
elements.forEach(id => {
    const el = document.getElementById(id);
    console.log(`   #${id}:`, el ? '✓' : '❌ MISSING');
});

// 5. Test de connexion
console.log('\n5. TEST DE CONNEXION:');
const isConnected = !!(authToken && authEmail);
console.log('   État calculé:', isConnected ? '✅ CONNECTÉ' : '❌ DÉCONNECTÉ');
console.log('   isUserConnected (var):', typeof isUserConnected !== 'undefined' ? isUserConnected : 'undefined');

// 6. Tester updateAuthUI
console.log('\n6. TEST updateAuthUI():');
if (typeof updateAuthUI === 'function') {
    try {
        updateAuthUI().then(() => {
            console.log('   ✅ updateAuthUI() terminé');
            console.log('   isUserConnected après:', isUserConnected);

            const floatingBtn = document.getElementById('floatingAuthBtn');
            if (floatingBtn) {
                console.log('   Bouton flottant:', floatingBtn.classList.contains('connected') ? 'connecté' : 'déconnecté');
            }
        });
    } catch (e) {
        console.error('   ❌ Erreur:', e.message);
    }
} else {
    console.error('   ❌ updateAuthUI non disponible');
}

// 7. Vérifier API backend
console.log('\n7. API BACKEND:');
if (typeof tryEnableRemote === 'function') {
    tryEnableRemote().then(() => {
        console.log('   remoteEnabled:', remoteEnabled);
        console.log('   remoteBase:', remoteBase);
    }).catch(e => {
        console.error('   ❌ Erreur API:', e.message);
    });
}

// 8. Tester ouverture modale compte
console.log('\n8. TEST MODAL COMPTE:');
setTimeout(() => {
    if (typeof openAccountModal === 'function' && isUserConnected) {
        console.log('   → Ouverture du modal compte...');
        try {
            openAccountModal();
            setTimeout(() => {
                const modal = document.getElementById('accountModal');
                if (modal && modal.classList.contains('show')) {
                    console.log('   ✅ Modal ouvert');
                    // Fermer automatiquement
                    setTimeout(() => {
                        if (typeof closeAccountModal === 'function') {
                            closeAccountModal();
                            console.log('   → Modal fermé');
                        }
                    }, 2000);
                } else {
                    console.error('   ❌ Modal pas visible');
                }
            }, 500);
        } catch (e) {
            console.error('   ❌ Erreur:', e.message);
        }
    } else {
        console.log('   ⚠️ Non connecté ou fonction manquante');
    }
}, 2000);

console.log('\n=== FIN DIAGNOSTIC ===');
console.log('Attendre 3 secondes pour les tests async...');
