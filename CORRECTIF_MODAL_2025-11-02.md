# Correctif du Modal de Compte - 2025-11-02

## Problèmes identifiés et corrigés

### 1. Race condition module ES6
**Problème:** Les modules ES6 (`type="module"`) se chargent de manière asynchrone. Le code dans `app.js` s'exécutait avant que la compat layer ne soit prête, donc les fonctions globales (window.openAccountModal, etc.) n'étaient pas disponibles.

**Solution:** Ajout d'un système de synchronisation dans `compat-layer.js` et `app.js` :
- `compat-layer.js` définit `window.__RM_COMPAT_READY__` et émet l'événement `rm:compat-ready` quand prêt
- `app.js` attend cet événement avant d'appeler `init()` via la fonction `waitForCompatLayer()`

### 2. Conflit de définition de fonctions
**Problème:** `app.js` redéfinissait `openAccountModal`, `closeAccountModal`, etc. après que la compat layer les ait exposées, écrasant les versions de la compat layer.

**Solution:** Modification de la compat layer pour **ne pas écraser** les fonctions si elles existent déjà :
```javascript
if (!window.openAccountModal) {
  window.openAccountModal = function () { ... };
}
```

### 3. setupAccountModalEvents non appelée
**Problème:** Dans `setupModalEvents()` ligne 1864, il y avait :
```javascript
document.addEventListener('DOMContentLoaded', setupAccountModalEvents);
```

Comme `app.js` s'exécute maintenant **après** `DOMContentLoaded` (grâce à `waitForCompatLayer`), cet événement ne se déclenche jamais.

**Solution:** Appel direct de `setupAccountModalEvents()` au lieu d'attendre l'événement :
```javascript
// Setup account modal events immediately (DOM is already ready when this runs)
setupAccountModalEvents();
```

## Fichiers modifiés

### 1. `src/compat/compat-layer.js`
- Ajout d'un flag `window.__RM_COMPAT_READY__` et événement `rm:compat-ready`
- Modification auto-init avec `async function autoInit()` qui attend le DOM
- Ajout de `if (!window.functionName)` pour toutes les fonctions modales

### 2. `app.js`
- Remplacement du système d'init synchrone par `waitForCompatLayer()` async
- Modification de `setupModalEvents()` pour appeler `setupAccountModalEvents()` immédiatement

## Test

1. Ouvrir `index.html` dans le navigateur
2. Cliquer sur le bouton de compte (coin supérieur droit)
3. Le modal de compte devrait s'ouvrir correctement
4. Vérifier dans la console :
   - `[Compat] Initializing compatibility layer...`
   - `[Compat] Compatibility layer ready`
   - `[App] Compatibility layer ready, initializing app...`

## Prochaines étapes

1. ✅ Corriger le timing de chargement des modules
2. ✅ Corriger les conflits de fonctions
3. ✅ Corriger setupAccountModalEvents
4. ✅ Protéger toutes les fonctions API dans la compat layer
5. ⏳ Vérifier que les informations des reviews s'affichent correctement
6. ⏳ Tester toutes les fonctionnalités du modal (déconnexion, navigation vers bibliothèque, etc.)

## Stratégie de compatibilité retenue

La stratégie choisie est de **laisser `app.js` définir ses propres fonctions** et la compat layer fournit un **fallback uniquement si les fonctions n'existent pas**. Cela permet :

1. Une migration progressive sans casser le code existant
2. De ne pas écraser les fonctions définies dans `app.js`
3. De fournir des implémentations basées sur les nouveaux modules pour le code qui n'a pas encore ses propres fonctions

Toutes les fonctions exposées dans `compat-layer.js` sont maintenant protégées par `if (!window.functionName)`.

## Fonctions protégées

- Modals: `openAccountModal`, `closeAccountModal`, `openLibraryModal`, `lockBodyScroll`, `unlockBodyScroll`, `trapFocus`, `releaseFocusTrap`
- API: `remoteListPublicReviews`, `remoteListMyReviews`, `remoteGetReview`, `remoteSave`, `remoteDeleteReview`, `remoteTogglePrivacy`, `remoteGetReviewVotes`, `remoteCastVote`, `remoteDeleteVote`

## Notes techniques

- **ES6 modules** : Les modules avec `type="module"` sont **toujours** asynchrones, même si inline
- **Script order** : L'ordre dans le HTML ne garantit **pas** l'ordre d'exécution pour les modules ES6
- **Backward compatibility** : La stratégie actuelle est de laisser `app.js` définir ses fonctions et la compat layer fournit un fallback si elles n'existent pas
