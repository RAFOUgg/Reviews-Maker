# Système de Modaux - Reviews Maker

## Architecture

L'application utilise deux types de modaux distincts avec des structures différentes :

### 1. Modal d'Authentification (`#authModal`)
**Structure :** Modal standard avec overlay intégré
**Classe d'activation :** Utilise `display: flex` directement
**Usage :** Connexion/inscription des utilisateurs non connectés

```html
<div class="modal" id="authModal" style="display: none;">
  <div class="modal-overlay" id="authModalOverlay"></div>
  <div class="modal-content">...</div>
</div>
```

**Ouverture :**
```javascript
dom.authModal.style.display = "flex";
```

**Fermeture :**
```javascript
dom.authModal.style.display = "none";
```

### 2. Modal de Compte (`#accountModal`)
**Structure :** Modal avec overlay séparé (meilleure performance)
**Classe d'activation :** Classe `.show` pour le toggle
**Usage :** Gestion du compte utilisateur connecté

```html
<div class="account-overlay" id="accountModalOverlay" style="display: none;"></div>
<div id="accountModal" style="display: none;">
  <div class="account-dialog">...</div>
</div>
```

**Ouverture :**
```javascript
openAccountModal(); // Fonction dédiée
```

**Fermeture :**
```javascript
closeAccountModal(); // Fonction dédiée
```

## CSS

### Variables CSS
```css
:root {
  --z-modal: 10000;
}
```

### Hiérarchie Z-Index
- **Modal overlay :** `z-index: 10100`
- **Modal container :** `z-index: 10120`
- **Modal dialog :** `z-index: 10121` (relatif)

### Classes importantes

#### `.show` (Account Modal)
```css
.account-overlay.show {
  display: block !important;
}

#accountModal.show {
  display: block !important;
}
```

#### `.active` (Generic Modals)
```css
.modal.active {
  display: flex !important;
}
```

## JavaScript

### Fonctions principales

#### `openAccountModal()`
Ouvre le modal de compte avec :
- ✅ Masquage des autres modaux
- ✅ Affichage de l'overlay
- ✅ Gestion du focus
- ✅ Chargement des données utilisateur

#### `closeAccountModal()`
Ferme le modal de compte avec :
- ✅ Masquage de l'overlay
- ✅ Libération du focus
- ✅ Restauration du scroll

#### `trapFocus(root)`
Piège le focus dans un élément pour l'accessibilité :
- ⌨️ `Tab` : Navigation circulaire
- ⌨️ `Esc` : Fermeture du modal

### Gestion des événements

#### Bouton flottant (🔗)
```javascript
dom.floatingAuthBtn.addEventListener("click", () => {
  if (isUserConnected) {
    openAccountModal(); // Si connecté
  } else {
    dom.authModal.style.display = "flex"; // Si non connecté
  }
});
```

#### Fermeture par overlay
```javascript
dom.accountModalOverlay.addEventListener('click', closeAccountModal);
```

#### Fermeture par bouton ✕
```javascript
dom.closeAccountModal.addEventListener('click', closeAccountModal);
```

## Accessibilité

### Attributs ARIA
- `role="dialog"` sur `.account-dialog`
- `aria-modal="true"` pour indiquer un modal
- `aria-labelledby` pour le titre du modal
- `aria-hidden` pour masquer du lecteur d'écran

### Gestion du clavier
- **Tab** : Navigation entre éléments focusables
- **Shift+Tab** : Navigation inverse
- **Escape** : Fermeture du modal

### Focus Management
Le focus est piégé dans le modal pour éviter que l'utilisateur navigue en dehors.

## Débogage

### Console du navigateur
```javascript
// Vérifier si le modal existe
console.log(document.getElementById('accountModal'));

// Tester l'ouverture
openAccountModal();

// Vérifier les styles calculés
const modal = document.getElementById('accountModal');
console.log(window.getComputedStyle(modal).display);
```

### Script de diagnostic
```javascript
// Charger le script de diagnostic
const script = document.createElement('script');
script.src = 'scripts/modal-diagnostic.js';
document.body.appendChild(script);
```

## Problèmes courants

### Le modal ne s'affiche pas
1. **Vérifier le CSS** : S'assurer qu'il n'y a pas de `display: none !important` qui écrase
2. **Vérifier la classe** : Le modal doit avoir la classe `.show`
3. **Vérifier le z-index** : Le modal doit être au-dessus des autres éléments
4. **Console** : Regarder les erreurs JavaScript

### L'overlay ne se ferme pas
1. **Event listener** : Vérifier que `closeAccountModal` est bien attaché
2. **Propagation** : S'assurer que `event.stopPropagation()` n'est pas appelé sur le dialog

### Le focus ne fonctionne pas
1. **trapFocus()** : Vérifier que la fonction est bien appelée
2. **Éléments focusables** : S'assurer qu'il y a des boutons/inputs dans le modal

## Bonnes pratiques

✅ **Utiliser les fonctions dédiées** (`openAccountModal()`, `closeAccountModal()`)  
✅ **Ne pas manipuler le CSS directement** sauf pour le modal d'auth  
✅ **Toujours libérer le focus** avec `releaseFocusTrap()` à la fermeture  
✅ **Ajouter `modal-open`** sur body pour bloquer le scroll  
✅ **Gérer les erreurs** avec `showToast()` pour le feedback utilisateur  

❌ **Ne pas utiliser `!important`** sauf dans les règles centralisées  
❌ **Ne pas mélanger `.show` et `.active`**  
❌ **Ne pas oublier de masquer l'overlay** à la fermeture  
❌ **Ne pas utiliser `alert()`** pour les erreurs (utiliser `showToast()`)  

## Historique

- **02/11/2025** : Refactorisation complète du système de modaux
  - Correction des conflits CSS
  - Nettoyage du code JavaScript
  - Séparation de l'overlay
  - Documentation complète
