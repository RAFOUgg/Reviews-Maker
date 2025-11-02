/**
 * RESTAURATION AUTH - À copier dans la console
 * 
 * Si tu avais un token avant, il a peut-être été renommé en rm_authToken
 * Ce script le restaure
 */

console.log('=== RESTAURATION AUTH ===\n');

// 1. Vérifier l'état actuel
const hasAuth = localStorage.getItem('authToken');
const hasRM = localStorage.getItem('rm_authToken');

console.log('authToken:', hasAuth ? 'PRÉSENT' : 'absent');
console.log('rm_authToken:', hasRM ? 'PRÉSENT (migré)' : 'absent');

// 2. Restaurer si nécessaire
if (!hasAuth && hasRM) {
    console.log('\n→ Restauration depuis rm_authToken...');
    localStorage.setItem('authToken', localStorage.getItem('rm_authToken'));
    localStorage.setItem('authEmail', localStorage.getItem('rm_authEmail') || '');
    if (localStorage.getItem('rm_discordUsername')) {
        localStorage.setItem('discordUsername', localStorage.getItem('rm_discordUsername'));
    }
    if (localStorage.getItem('rm_discordId')) {
        localStorage.setItem('discordId', localStorage.getItem('rm_discordId'));
    }

    // Nettoyer les anciennes clés
    localStorage.removeItem('rm_authToken');
    localStorage.removeItem('rm_authEmail');
    localStorage.removeItem('rm_discordUsername');
    localStorage.removeItem('rm_discordId');

    console.log('✅ Auth restaurée!');
    console.log('→ authToken:', localStorage.getItem('authToken').substring(0, 10) + '...');
    console.log('→ authEmail:', localStorage.getItem('authEmail'));
} else if (hasAuth) {
    console.log('✅ Auth déjà OK');
    console.log('→ authToken:', hasAuth.substring(0, 10) + '...');
    console.log('→ authEmail:', localStorage.getItem('authEmail'));
} else {
    console.log('⚠️ Pas d\'auth trouvée');
    console.log('Tu dois te reconnecter');
}

// 3. Forcer updateAuthUI
console.log('\n→ Mise à jour de l\'UI...');
if (typeof updateAuthUI === 'function') {
    updateAuthUI().then(() => {
        console.log('✅ UI mise à jour');
        console.log('→ isUserConnected:', isUserConnected);

        // Vérifier le bouton flottant
        const btn = document.getElementById('floatingAuthBtn');
        if (btn) {
            console.log('→ Bouton flottant:', btn.classList.contains('connected') ? 'CONNECTÉ' : 'déconnecté');
        }
    });
} else {
    console.error('❌ updateAuthUI non disponible');
}

console.log('\n=== FIN RESTAURATION ===');
