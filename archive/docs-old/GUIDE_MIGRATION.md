# 🔄 GUIDE DE MIGRATION - Reviews-Maker v2.0

## Vue d'ensemble

Cette refonte remplace le code chaotique par 4 modules centralisés:
- **StorageManager**: Tout le stockage (localStorage, sessionStorage)
- **ReviewsAPI**: Tous les appels API
- **ModalManager**: Toutes les modales
- **UserDataManager**: Cache et données utilisateur

## 📦 Nouveaux modules créés

```
src/
├── core/
│   ├── StorageManager.js    ✅ Créé
│   ├── ReviewsAPI.js         ✅ Créé
│   ├── ModalManager.js       ✅ Créé
│   └── UserDataManager.js    ✅ Créé
└── compat/
    └── compat-layer.js       ✅ Créé (rétrocompatibilité)
```

## 🚀 Intégration dans le HTML

### index.html & review.html

Ajouter **AVANT** `app.js`:

```html
<!-- Nouveaux modules (dans l'ordre) -->
<script type="module" src="src/core/StorageManager.js"></script>
<script type="module" src="src/core/ReviewsAPI.js"></script>
<script type="module" src="src/core/ModalManager.js"></script>
<script type="module" src="src/core/UserDataManager.js"></script>
<script type="module" src="src/compat/compat-layer.js"></script>

<!-- Ancien code (fonctionne grâce à la compat layer) -->
<script src="app.js"></script>
```

## 📝 Migration progressive du code

### PHASE 1: Intégration (IMMÉDIAT)

✅ **Aucun changement requis dans app.js pour l'instant**

La couche de compatibilité (`compat-layer.js`) expose tous les anciens noms:
- `localStorage.getItem('authToken')` → Redirigé vers `storage.get('auth_token')`
- `remoteListReviews()` → Redirigé vers `reviewsAPI.listReviews()`
- `openAccountModal()` → Redirigé vers `modalManager.open()`

### PHASE 2: Migration localStorage (1-2h)

Remplacer progressivement les accès directs:

#### Avant
```javascript
const token = localStorage.getItem('authToken');
localStorage.setItem('authToken', newToken);
localStorage.removeItem('authToken');
```

#### Après
```javascript
import { storage } from './src/core/StorageManager.js';

const token = storage.get('auth_token');
storage.set('auth_token', newToken);
storage.remove('auth_token');
```

**Mappings des clés:**
| Ancienne clé | Nouvelle clé |
|--------------|--------------|
| `authToken` | `auth_token` |
| `authEmail` | `auth_email` |
| `discordUsername` | `discord_username` |
| `discordId` | `discord_id` |
| `siteTheme` | `theme` |
| `previewMode` | `preview_mode` |
| `cannaReviews` | *(IndexedDB uniquement)* |

### PHASE 3: Migration API (2h)

Supprimer les 10 fonctions `remote*` de `app.js`:

#### Avant (app.js lignes 6150-6400)
```javascript
async function remoteListReviews() {
  if (!remoteEnabled) return dbGetAllReviews();
  try {
    const headers = {};
    const token = localStorage.getItem('authToken');
    if (token) headers['X-Auth-Token'] = token;
    const r = await fetchWithTimeout(remoteBase + '/api/reviews', { headers }, 5000);
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return await r.json();
  } catch (e) { 
    console.warn('Remote list erreur', e); 
    return dbGetAllReviews(); 
  }
}
// ... 9 autres fonctions similaires
```

#### Après
```javascript
import { reviewsAPI } from './src/core/ReviewsAPI.js';

// Tout remplacé par:
const reviews = await reviewsAPI.listReviews({ mode: 'all' });
const review = await reviewsAPI.getReview(id);
const result = await reviewsAPI.saveReview(data, imageFile);
await reviewsAPI.deleteReview(id);
// etc.
```

**Économie: -500 lignes**

### PHASE 4: Migration Modales (1h)

#### Avant
```javascript
function openAccountModal() {
  if (!dom.accountModal) return;
  
  const otherModals = document.querySelectorAll('.modal');
  otherModals.forEach(modal => {
    modal.style.display = 'none';
    modal.classList.remove('show', 'active');
  });
  
  const overlay = document.getElementById('accountModalOverlay');
  if (overlay) {
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden', 'false');
  }
  
  dom.accountModal.classList.add('show');
  dom.accountModal.setAttribute('aria-hidden', 'false');
  
  trapFocus(dom.accountModal);
  document.body.classList.add('modal-open');
  
  renderAccountView();
}

function closeAccountModal() {
  if (!dom.accountModal) return;
  // ... 15 lignes de cleanup
}

// × 20 fonctions de modales différentes
```

#### Après
```javascript
import { modalManager } from './src/core/ModalManager.js';

// Ouvrir
modalManager.open('accountModal', {
  onOpen: async (modal) => {
    await renderAccountView();
  }
});

// Fermer
modalManager.close('accountModal');

// Bascule
modalManager.toggle('accountModal');
```

**Économie: -200 lignes, 0 bugs d'overlay**

### PHASE 5: Migration UserDataManager (30min)

#### Avant (app.js lignes 2173-2370)
```javascript
const UserDataManager = {
  getCachedData(key) {
    try {
      const cached = localStorage.getItem(key); // ❌ Collision!
      const timestamp = localStorage.getItem(`${key}_timestamp`);
      // ...
    }
  },
  
  clearLegacyCache() {
    // Code mort
    localStorage.removeItem('accountStats');
  },
  
  // Double stockage
  if (profile.username) localStorage.setItem('discordUsername', profile.username);
  if (profile.discordId) localStorage.setItem('discordId', profile.discordId);
}
```

#### Après
```javascript
import { userDataManager } from './src/core/UserDataManager.js';

// Tout est géré automatiquement
const displayName = await userDataManager.getDisplayName();
const stats = await userDataManager.getUserStats();
const profile = await userDataManager.getUserProfile(email);

// Cache invalidé automatiquement
userDataManager.invalidateUserCache(email);
```

**Plus de collision, plus de code mort**

## 🗑️ Code à SUPPRIMER après migration

### Dans app.js

**Lignes 987-992**: Variables obsolètes
```javascript
let db = null; // IndexedDB handle
let currentReviewId = null;
let isReadOnlyView = false;
let draftSaveTimer = null; // ❌ "kept for legacy hooks but no-op"
let dbSaveTimer = null;
let dbFailedOnce = false;
```

**Lignes 1007**: Draft supprimé
```javascript
let isNonDraftRecord = false; // ❌ Drafts dépréciés
```

**Lignes 2173-2370**: Ancien UserDataManager
```javascript
const UserDataManager = { ... }  // ❌ Remplacé par module
```

**Lignes 2487**: Fonction commentée
```javascript
// REMOVED: renderAuthConnectedStats() // ❌ À supprimer
```

**Lignes 6150-6400**: Toutes les fonctions remote*
```javascript
async function remoteListReviews() { ... }     // ❌ → reviewsAPI.listReviews()
async function remoteListPublicReviews() { ... } // ❌
async function remoteListMyReviews() { ... }   // ❌
async function remoteGetReview() { ... }       // ❌
async function remoteSave() { ... }            // ❌
async function remoteDeleteReview() { ... }    // ❌
async function remoteTogglePrivacy() { ... }   // ❌
async function remoteGetReviewVotes() { ... }  // ❌
async function remoteCastVote() { ... }        // ❌
async function remoteDeleteVote() { ... }      // ❌
```

**Lignes 290-350**: Fonctions modales individuelles
```javascript
function lockBodyScroll() { ... }          // ❌ → modalManager
function unlockBodyScroll() { ... }        // ❌
function openConfirmDelete() { ... }       // ❌
function closeConfirmDelete() { ... }      // ❌
function openAccountModal() { ... }        // ❌
function closeAccountModal() { ... }       // ❌
// ... etc
```

### Dans server/server.js

**Lignes 72-110**: Colonne isDraft
```sql
-- ❌ À supprimer de la DB
ALTER TABLE reviews DROP COLUMN isDraft;
```

**Migration SQL:**
```sql
-- Backup avant migration
CREATE TABLE reviews_backup AS SELECT * FROM reviews;

-- Supprime la colonne deprecated
ALTER TABLE reviews DROP COLUMN isDraft;

-- Recréer les index
CREATE INDEX IF NOT EXISTS idx_reviews_visibility 
ON reviews(isPrivate, ownerId, updatedAt);
```

## ✅ Tests de validation

### Test 1: Storage
```javascript
// Console debug
import { storage } from './src/core/StorageManager.js';

storage.set('test_key', { value: 'test' });
console.log(storage.get('test_key')); // { value: 'test' }

storage.setWithTTL('ttl_test', 'expiring', 5000); // 5s TTL
setTimeout(() => {
  console.log(storage.getWithTTL('ttl_test')); // null (expiré)
}, 6000);
```

### Test 2: API
```javascript
import { reviewsAPI } from './src/core/ReviewsAPI.js';

// Check availability
await reviewsAPI.checkAvailability(); // true si API disponible

// List reviews
const reviews = await reviewsAPI.listReviews({ mode: 'mine' });
console.log(`${reviews.length} reviews trouvées`);

// Get one
const review = await reviewsAPI.getReview(123);
console.log(review?.productName);
```

### Test 3: Modales
```javascript
import { modalManager } from './src/core/ModalManager.js';

// Ouvre
modalManager.open('authModal');

// Vérifie
console.log(modalManager.isOpen('authModal')); // true

// Ferme
modalManager.close('authModal');
```

### Test 4: User Data
```javascript
import { userDataManager } from './src/core/UserDataManager.js';

const email = 'test@example.com';

// Stats
const stats = await userDataManager.getUserStats(email);
console.log(`${stats.total} reviews`);

// Display name
const name = await userDataManager.getDisplayName(email);
console.log(`Nom: ${name}`);
```

## 📊 Métriques attendues

### Avant refactoring
- **app.js**: 7528 lignes
- **Duplications**: ~35%
- **Temps de chargement**: 2-3s (migrations)
- **Bugs modales**: 5-10 signalés

### Après refactoring
- **app.js**: ~5000 lignes (-33%)
- **Modules core**: ~1200 lignes (bien structurées)
- **Duplications**: <5%
- **Temps de chargement**: <500ms
- **Bugs modales**: 0

## 🚨 Points d'attention

### 1. Migration des clés localStorage

Les anciennes clés sont migrées automatiquement au premier chargement par `compat-layer.js`.

**Vérification:**
```javascript
// Avant migration
localStorage.getItem('authToken') // ✅

// Après migration automatique
storage.get('auth_token') // ✅
storage.get('authToken')  // ❌ undefined (ancienne clé supprimée)
```

### 2. Compatibilité navigateurs

Les modules ES6 requièrent:
- Chrome 61+
- Firefox 60+
- Safari 10.1+
- Edge 16+

**Fallback pour vieux navigateurs:**
```html
<script nomodule>
  alert('Navigateur non supporté. Veuillez mettre à jour.');
</script>
```

### 3. IndexedDB inchangé

La logique IndexedDB dans `app.js` (lignes 2895-3070) reste inchangée pour l'instant.
Migration prévue en Phase 2 (StorageManager v2 avec support IndexedDB).

## 🎯 Plan d'action recommandé

### Jour 1-2: Intégration
- [x] Créer les 4 modules core
- [x] Créer la compat layer
- [x] Ajouter scripts dans HTML
- [ ] Tester que rien ne casse

### Jour 3-4: Migration progressive
- [ ] Remplacer localStorage par storage
- [ ] Remplacer remote* par reviewsAPI
- [ ] Remplacer fonctions modales

### Jour 5: Nettoyage
- [ ] Supprimer code mort de app.js
- [ ] Supprimer colonne isDraft (SQL)
- [ ] Tests complets

### Jour 6: Optimisations
- [ ] Index SQL (performance)
- [ ] Compression assets
- [ ] Tests de charge

## 📞 Support

Pour toute question sur la migration:
- Consulter `DIAGNOSTIC_CODE_2025-11-02.md` (problèmes détaillés)
- Activer mode debug: `?debug=1` dans l'URL
- Inspecter `window.__RM_INTERNAL__` (console)

---

**Auteur**: GitHub Copilot  
**Date**: 2 Novembre 2025  
**Version**: 2.0.0
