# 🔧 Orchard Studio - Guide de dépannage

## Problèmes résolus

### ❌ Erreur 1: `user is not defined`

**Symptôme:**
```
ReferenceError: user is not defined
```

**Cause:**
La variable `user` était utilisée dans `CreateReviewPage.jsx` mais n'était pas importée du store.

**Solution:**
```jsx
// AVANT
const { isAuthenticated, createReview } = useStore();

// APRÈS
const { isAuthenticated, createReview, user } = useStore();
```

**Fichier modifié:** `client/src/pages/CreateReviewPage.jsx`

---

### ❌ Erreur 2: `getTemplates is not a function`

**Symptôme:**
```
TypeError: getTemplates is not a function
at TemplateSelector
```

**Cause:**
Les fonctions `getTemplates()` et `getColorPalettes()` existaient dans le store mais n'étaient pas exportées dans le hook `useOrchardActions`.

**Solution:**
Ajout des deux fonctions dans `useOrchardActions`:

```javascript
export const useOrchardActions = () => useOrchardStore((state) => ({
    // ... autres actions
    getTemplates: state.getTemplates,
    getColorPalettes: state.getColorPalettes
}));
```

**Fichier modifié:** `client/src/store/orchardStore.js`

---

### ❌ Erreur 3: `Maximum update depth exceeded`

**Symptôme:**
```
Error: Maximum update depth exceeded. This can happen when a component 
repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

**Cause:**
Les fonctions `getTemplates()` et `getColorPalettes()` étaient appelées dans le corps des composants, créant une boucle infinie de re-renders. À chaque appel, un nouvel objet était retourné, ce qui déclenchait un nouveau rendu.

**Solution:** ✅ RÉSOLU
Séparer les constantes dans un fichier dédié pour garantir des références stables:

```jsx
// AVANT (causait une boucle infinie ❌)
const { getTemplates } = useOrchardActions();
const templates = getTemplates();

// TENTATIVE 1 (ne fonctionne pas non plus ❌)
const templates = useOrchardStore((state) => state.getTemplates());

// TENTATIVE 2 (toujours des problèmes ❌)
import { DEFAULT_TEMPLATES } from '../../../store/orchardStore';
const templates = DEFAULT_TEMPLATES;

// SOLUTION FINALE (correct ✅)
// Créer orchardConstants.js avec uniquement les constantes
// Importer depuis ce fichier dans orchardStore.js et les composants
import { DEFAULT_TEMPLATES } from '../../../store/orchardStore';
const templates = DEFAULT_TEMPLATES;
```

**Explication:**
Même avec l'import direct, avoir les constantes définies dans le même fichier que le store Zustand causait des problèmes de références instables avec React HMR (Hot Module Replacement). La solution finale a été de créer un fichier séparé `orchardConstants.js` contenant uniquement les définitions de `COLOR_PALETTES` et `DEFAULT_TEMPLATES`, puis de les importer dans `orchardStore.js` qui les réexporte.

**Fichiers créés/modifiés:**
- `client/src/store/orchardConstants.js` (NOUVEAU - contient les constantes pures)
- `client/src/store/orchardStore.js` (refactorisé - importe et réexporte les constantes)
- `client/src/components/orchard/controls/TemplateSelector.jsx` (utilise l'import depuis orchardStore)
- `client/src/components/orchard/controls/ColorPaletteControls.jsx` (utilise l'import depuis orchardStore)

**Résultat:** L'application démarre sans erreur, le cycle de re-render infini est éliminé. ✅

---

## Checklist de vérification

Si Orchard Studio ne fonctionne pas, vérifiez:

### 1. Dépendances installées
```bash
cd client
npm list framer-motion zustand html-to-image jspdf @dnd-kit/core
```

Toutes doivent être présentes.

### 2. Serveur de développement actif
```bash
npm run dev
```

Le serveur doit tourner sur `http://localhost:5173` ou `5174`.

### 3. Imports corrects dans les pages

**CreateReviewPage.jsx:**
```jsx
import OrchardPanel from '../components/orchard/OrchardPanel';
import { AnimatePresence } from 'framer-motion';
const { isAuthenticated, createReview, user } = useStore();
```

**EditReviewPage.jsx:**
```jsx
import OrchardPanel from '../components/orchard/OrchardPanel';
import { AnimatePresence } from 'framer-motion';
const { isAuthenticated, user } = useStore();
```

### 4. Store correctement configuré

Le fichier `orchardStore.js` doit exporter:
- `useOrchardStore` (hook principal)
- `useOrchardConfig` (config seulement)
- `useOrchardPresets` (presets seulement)
- `useOrchardActions` (toutes les actions + getters)

### 5. Tous les composants Orchard présents

Vérifier que ces fichiers existent:
```
client/src/
├── components/orchard/
│   ├── OrchardPanel.jsx
│   ├── ConfigPane.jsx
│   ├── PreviewPane.jsx
│   ├── TemplateRenderer.jsx
│   ├── PresetManager.jsx
│   ├── ExportModal.jsx
│   ├── controls/
│   │   ├── TemplateSelector.jsx
│   │   ├── TypographyControls.jsx
│   │   ├── ColorPaletteControls.jsx
│   │   ├── ContentModuleControls.jsx
│   │   └── ImageBrandingControls.jsx
│   └── templates/
│       ├── ModernCompactTemplate.jsx
│       ├── DetailedCardTemplate.jsx
│       ├── BlogArticleTemplate.jsx
│       └── SocialStoryTemplate.jsx
└── store/
    └── orchardStore.js
```

---

## Erreurs courantes et solutions

### Port déjà utilisé

**Symptôme:**
```
Port 5173 is in use, trying another one...
```

**Solution:**
Le serveur démarre automatiquement sur le port suivant (5174). Utilisez l'URL affichée dans le terminal.

---

### Module not found

**Symptôme:**
```
Error: Cannot find module './OrchardPanel'
```

**Solution:**
Vérifiez que tous les fichiers Orchard existent dans `client/src/components/orchard/`.

---

### Animations ne fonctionnent pas

**Symptôme:**
Le modal ne s'ouvre pas avec animation, ou s'affiche instantanément.

**Solution:**
Vérifiez que Framer Motion est bien installé:
```bash
npm list framer-motion
```

Si manquant:
```bash
npm install framer-motion@11.18.2
```

---

### Export ne fonctionne pas

**Symptôme:**
Le bouton "Exporter" ne fait rien, ou produit une erreur.

**Solution:**
Vérifiez que les bibliothèques d'export sont installées:
```bash
npm list html-to-image jspdf
```

Si manquantes:
```bash
npm install html-to-image jspdf
```

---

### Preview vide ou blanc

**Symptôme:**
La prévisualisation Orchard ne montre rien, juste un fond blanc.

**Causes possibles:**
1. Aucune donnée de review n'est passée
2. Les templates ne s'importent pas correctement
3. Le TemplateRenderer ne trouve pas le template

**Solution:**
1. Vérifier que `reviewData` est bien passé à `OrchardPanel`
2. Vérifier que tous les templates sont dans `client/src/components/orchard/templates/`
3. Ouvrir la console navigateur pour voir les erreurs

---

### Presets ne se sauvegardent pas

**Symptôme:**
Les presets créés disparaissent après rechargement de la page.

**Cause:**
Le localStorage n'est pas activé ou le middleware `persist` de Zustand ne fonctionne pas.

**Solution:**
1. Vérifier que le navigateur autorise localStorage
2. Vérifier dans DevTools → Application → Local Storage → `orchard-storage`
3. Vérifier que `zustand/middleware` est bien importé dans `orchardStore.js`

---

## Tests de validation

Pour vérifier que tout fonctionne:

### Test 1: Ouverture du modal
1. Créer une review
2. Cliquer sur "🎨 Aperçu"
3. ✅ Le modal Orchard doit s'ouvrir avec animation

### Test 2: Changement de template
1. Ouvrir Orchard
2. Onglet "Templates"
3. Cliquer sur un template différent
4. ✅ La preview doit changer instantanément

### Test 3: Export PNG
1. Configurer une preview
2. Cliquer "Exporter"
3. Sélectionner PNG
4. Cliquer "Télécharger PNG"
5. ✅ Un fichier PNG doit se télécharger

### Test 4: Preset
1. Configurer Orchard
2. Onglet "Presets"
3. Sauvegarder un preset
4. Recharger la page
5. Rouvrir Orchard
6. ✅ Le preset doit être toujours là

---

## Commandes utiles

### Nettoyer et réinstaller
```bash
cd client
rm -rf node_modules package-lock.json
npm install
```

### Vider le cache Vite
```bash
cd client
rm -rf node_modules/.vite
npm run dev
```

### Vérifier les erreurs de compilation
```bash
cd client
npm run build
```

---

## Logs de débogage

Pour activer les logs détaillés, ouvrez la console navigateur (F12) et ajoutez:

```javascript
// Dans la console navigateur
localStorage.setItem('debug', 'orchard:*')
```

Puis rechargez la page.

---

## Support

Si le problème persiste après avoir suivi ce guide:

1. Vérifier que toutes les corrections ci-dessus ont été appliquées
2. Consulter la documentation complète: [ORCHARD_README.md](./ORCHARD_README.md)
3. Vérifier les tests: [ORCHARD_TESTS.md](./ORCHARD_TESTS.md)
4. Examiner les logs de la console navigateur et du terminal

---

**Dernière mise à jour:** 10 novembre 2025  
**Version:** 1.0.1 (corrections de bugs)
