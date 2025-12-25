// Script de débogage rapide pour la pop-up légale
// Copier-coller dans la console du navigateur (F12)

console.clear();
console.log('%c🔍 Débogage Pop-up Légale', 'color: #a855f7; font-size: 20px; font-weight: bold;');
console.log('');

// 1. Vérifier le localStorage
const consent = localStorage.getItem('terpologie_legal_consent');
console.log('%c1️⃣ État du localStorage', 'color: #06b6d4; font-size: 16px;');
if (consent) {
    try {
        const data = JSON.parse(consent);
        console.table(data);
        const date = new Date(data.timestamp);
        const now = new Date();
        const daysSince = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        console.log(`   ✅ Consentement valide depuis ${daysSince} jours (expire dans ${30 - daysSince} jours)`);
    } catch (e) {
        console.error('   ❌ Consentement corrompu:', e);
    }
} else {
    console.log('   ⚠️  Aucun consentement trouvé → La modal DEVRAIT s\'afficher');
}
console.log('');

// 2. Forcer l'affichage de la modal
console.log('%c2️⃣ Pour forcer l\'affichage de la modal:', 'color: #06b6d4; font-size: 16px;');
console.log('%clocalStorage.removeItem("terpologie_legal_consent"); location.reload()', 'background: #1e293b; color: #f59e0b; padding: 4px 8px; border-radius: 4px;');
console.log('');

// 3. Vérifier les composants React
console.log('%c3️⃣ Vérification des composants:', 'color: #06b6d4; font-size: 16px;');
const hasLegalGate = document.querySelector('[class*="LegalConsent"]') || document.querySelector('[class*="legal"]');
const hasModal = document.querySelector('[class*="modal"]') || document.querySelector('[class*="Modal"]');
console.log('   LegalConsentGate présent:', hasLegalGate ? '✅' : '❌');
console.log('   Modal visible:', hasModal ? '✅' : '❌');
console.log('');

// 4. Info système
console.log('%c4️⃣ Informations système:', 'color: #06b6d4; font-size: 16px;');
console.log('   URL actuelle:', window.location.href);
console.log('   User-Agent:', navigator.userAgent.includes('Edg') ? 'Edge ✅' : 'Autre navigateur');
console.log('');

console.log('%c💡 Actions disponibles:', 'color: #10b981; font-size: 16px;');
console.log('   1. Supprimer le consentement: localStorage.removeItem("terpologie_legal_consent")');
console.log('   2. Voir le consentement: console.table(JSON.parse(localStorage.getItem("terpologie_legal_consent")))');
console.log('   3. Simuler expiration: ', `const c = JSON.parse(localStorage.getItem("terpologie_legal_consent")); c.timestamp = new Date(Date.now() - 31*24*60*60*1000).toISOString(); localStorage.setItem("terpologie_legal_consent", JSON.stringify(c))`);
