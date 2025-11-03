# 🔧 GUIDE DEBUG AUTH & MODALES

## ✅ Ce qui a été fait

### 1. Rollback des modules ES6
- ✅ Supprimé tous les modules ES6 cassés
- ✅ Restauré le code original dans `index.html` et `app.js`
- ✅ Application revenue à l'état stable

### 2. Ajout de logs de debug
- ✅ Logs dans `updateAuthUI()` pour tracer l'état auth
- ✅ Console affichera maintenant :
  ```
  [Auth] updateAuthUI called - token: true/false, email: true/false
  [Auth] Floating button set to CONNECTED/DISCONNECTED
  [Auth] isUserConnected set to: true/false
  ```

### 3. Outils de diagnostic créés

| Fichier | Description |
|---------|-------------|
| `scripts/diagnostic-complet.js` | Diagnostic complet à copier dans la console |
| `scripts/restore-auth.js` | Restaure l'auth si elle a été renommée en rm_* |
| `test-auth.html` | Page de test interactive pour debugger l'auth |

---

## 🧪 Tests à Faire

### Test 1 : Vérifier l'état auth

1. **Ouvrir la console** (F12)
2. **Copier ce code** :

```javascript
// Vérifier l'auth
console.log('authToken:', localStorage.getItem('authToken') ? 'OK' : 'ABSENT');
console.log('authEmail:', localStorage.getItem('authEmail'));
console.log('isUserConnected:', isUserConnected);

// Forcer updateAuthUI
updateAuthUI();
```

3. **Regarder les logs** - Tu devrais voir :
   ```
   [Auth] updateAuthUI called - token: true, email: true, isConnected: true
   [Auth] Floating button set to CONNECTED
   [Auth] isUserConnected set to: true
   ```

---

### Test 2 : Restaurer l'auth (si perdue)

Si tu n'as plus ton token, copie ce code dans la console :

```javascript
// Restaurer depuis rm_* si nécessaire
const hasRM = localStorage.getItem('rm_authToken');
if (hasRM) {
    localStorage.setItem('authToken', hasRM);
    localStorage.setItem('authEmail', localStorage.getItem('rm_authEmail') || '');
    localStorage.removeItem('rm_authToken');
    localStorage.removeItem('rm_authEmail');
    console.log('✅ Auth restaurée!');
    updateAuthUI();
} else {
    console.log('Pas de rm_authToken trouvé');
}
```

---

### Test 3 : Tester le modal de compte

1. **Cliquer sur le bouton compte** (coin supérieur droit 👤)
2. **Le modal devrait s'ouvrir**
3. **Vérifier que les stats s'affichent**

Si ça ne marche pas, dans la console :

```javascript
// Forcer l'ouverture
openAccountModal();

// Vérifier le DOM
document.getElementById('accountModal');
document.getElementById('accountModalOverlay');
```

---

### Test 4 : Page de test dédiée

Ouvre `test-auth.html` dans ton navigateur :

```
file:///c:/Users/Rafi/Documents/.0AMes-Logiciel/Reviews-Maker/test-auth.html
```

Cette page te permet de :
- ✓ Voir l'état localStorage
- ✓ Définir un auth de test
- ✓ Tester updateAuthUI()
- ✓ Tester l'ouverture du modal
- ✓ Voir les logs en temps réel

---

## 🐛 Problèmes Potentiels

### Problème : "isUserConnected is false" mais tu as un token

**Solution :**
```javascript
// Dans la console
updateAuthUI();
// Attendre 1 seconde
console.log('isUserConnected:', isUserConnected); // Devrait être true
```

---

### Problème : Le modal ne s'ouvre pas

**Vérifier :**
```javascript
// 1. La fonction existe ?
typeof openAccountModal // devrait être "function"

// 2. L'élément DOM existe ?
document.getElementById('accountModal') // devrait être un élément

// 3. Forcer l'ouverture
openAccountModal();

// 4. Vérifier les classes
const modal = document.getElementById('accountModal');
console.log(modal.classList.contains('show')); // devrait être true
```

---

### Problème : Erreurs "runtime.lastError"

Ces erreurs viennent d'une **extension Chrome**, pas de ton code. Ignore-les.

---

## 📋 Prochaines Étapes

Une fois l'auth confirmée fonctionnelle :

1. ✅ Vérifier que le modal de compte s'ouvre
2. ✅ Vérifier que les stats s'affichent
3. ✅ Tester l'accès à "Ma bibliothèque"
4. ✅ Tester les paramètres utilisateur
5. ✅ Tester la déconnexion

---

## 🆘 Si Ça Ne Marche Toujours Pas

Copie dans la console et envoie-moi le résultat :

```javascript
console.log({
    hasToken: !!localStorage.getItem('authToken'),
    hasEmail: !!localStorage.getItem('authEmail'),
    isUserConnected: isUserConnected,
    floatingBtn: document.getElementById('floatingAuthBtn')?.classList.contains('connected'),
    accountModal: !!document.getElementById('accountModal'),
    updateAuthUIExists: typeof updateAuthUI === 'function',
    openAccountModalExists: typeof openAccountModal === 'function'
});
```

---

**Status :** ✅ Outils de debug en place, attente de ton feedback sur l'état actuel de l'auth
