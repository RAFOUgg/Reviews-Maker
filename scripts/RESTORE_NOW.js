/**
 * RESTAURATION AUTH IMMÉDIATE
 * Copie TOUT ce code dans la console (F12)
 */

console.log('=== RESTAURATION AUTH ===\n');

// 1. Vérifier état actuel
const token = localStorage.getItem('authToken');
const email = localStorage.getItem('authEmail');
const rmToken = localStorage.getItem('rm_authToken');
const rmEmail = localStorage.getItem('rm_authEmail');

console.log('État actuel:');
console.log('  authToken:', token ? `PRÉSENT (${token.substring(0, 10)}...)` : 'ABSENT');
console.log('  authEmail:', email || 'ABSENT');
console.log('  rm_authToken:', rmToken ? 'PRÉSENT (migré)' : 'absent');
console.log('  rm_authEmail:', rmEmail || 'absent');

// 2. Restaurer depuis rm_* si disponible
if (!token && rmToken) {
    console.log('\n→ Restauration depuis rm_authToken...');
    localStorage.setItem('authToken', rmToken);
    localStorage.setItem('authEmail', rmEmail || '');

    const rmDiscord = localStorage.getItem('rm_discordUsername');
    const rmDiscordId = localStorage.getItem('rm_discordId');

    if (rmDiscord) localStorage.setItem('discordUsername', rmDiscord);
    if (rmDiscordId) localStorage.setItem('discordId', rmDiscordId);

    // Nettoyer
    localStorage.removeItem('rm_authToken');
    localStorage.removeItem('rm_authEmail');
    localStorage.removeItem('rm_discordUsername');
    localStorage.removeItem('rm_discordId');

    console.log('✅ AUTH RESTAURÉE !');
    console.log('→ Token:', localStorage.getItem('authToken').substring(0, 10) + '...');
    console.log('→ Email:', localStorage.getItem('authEmail'));

    // Forcer update UI
    if (typeof updateAuthUI === 'function') {
        updateAuthUI().then(() => {
            console.log('✅ UI mise à jour');
            console.log('→ isUserConnected:', isUserConnected);
            console.log('\n🔄 RECHARGE LA PAGE : location.reload()');
        });
    } else {
        console.log('⚠️ updateAuthUI non disponible, recharge la page');
        console.log('→ location.reload()');
    }
} else if (token) {
    console.log('\n✅ Token trouvé !');
    console.log('→ Token:', token.substring(0, 10) + '...');
    console.log('→ Email:', email);
    console.log('→ isUserConnected:', typeof isUserConnected !== 'undefined' ? isUserConnected : 'undefined');

    // Forcer updateAuthUI
    console.log('\n→ Forçage updateAuthUI...');
    if (typeof updateAuthUI === 'function') {
        updateAuthUI().then(() => {
            console.log('✅ updateAuthUI terminé');
            console.log('→ isUserConnected:', isUserConnected);

            const btn = document.getElementById('floatingAuthBtn');
            if (btn) {
                const isConnected = btn.classList.contains('connected');
                console.log('→ Bouton flottant:', isConnected ? '✅ CONNECTÉ' : '❌ déconnecté');

                if (!isConnected && token) {
                    console.log('\n⚠️ PROBLÈME: Tu as un token mais le bouton dit déconnecté');
                    console.log('→ Essaye de recharger: location.reload()');
                }
            }
        });
    }
} else {
    console.log('\n❌ AUCUN TOKEN TROUVÉ');
    console.log('Tu dois te reconnecter via l\'interface');
}

console.log('\n=== FIN ===');
