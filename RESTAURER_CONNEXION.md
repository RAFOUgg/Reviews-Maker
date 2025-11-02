# 🆘 RESTAURER LA CONNEXION - 30 SECONDES

## Étape 1 : Ouvrir la console
**Appuie sur F12** dans ton navigateur

## Étape 2 : Copier ce code

```javascript
// RESTAURATION AUTH
const rm = localStorage.getItem('rm_authToken');
if (rm) {
    localStorage.setItem('authToken', rm);
    localStorage.setItem('authEmail', localStorage.getItem('rm_authEmail') || '');
    localStorage.removeItem('rm_authToken');
    localStorage.removeItem('rm_authEmail');
    console.log('✅ Restauré! Recharge la page...');
    setTimeout(() => location.reload(), 1000);
} else {
    const token = localStorage.getItem('authToken');
    if (token) {
        console.log('✅ Token présent:', token.substring(0,10)+'...');
        updateAuthUI().then(() => {
            console.log('isUserConnected:', isUserConnected);
            if (!isUserConnected) {
                console.log('⚠️ Problème détecté, recharge: location.reload()');
            }
        });
    } else {
        console.log('❌ Pas de token. Tu dois te reconnecter.');
    }
}
```

## Étape 3 : Attendre

- **Si ça dit "Restauré! Recharge la page..."** → Parfait, la page va se recharger
- **Si ça dit "Token présent"** → Regarde si `isUserConnected: true`
  - Si `true` → Tout est OK !
  - Si `false` → Tape `location.reload()` dans la console
- **Si ça dit "Pas de token"** → Il faut te reconnecter via l'interface

## Étape 4 : Vérifier

Après rechargement, vérifie :
```javascript
console.log('Auth:', {
    token: !!localStorage.getItem('authToken'),
    email: localStorage.getItem('authEmail'),
    isConnected: isUserConnected
});
```

Devrait afficher : `isConnected: true`

---

## Si ça ne marche TOUJOURS pas

Copie **TOUT** le contenu de `scripts/RESTORE_NOW.js` dans la console

---

**→ Commence par l'Étape 1 ! (F12)** 🔑
