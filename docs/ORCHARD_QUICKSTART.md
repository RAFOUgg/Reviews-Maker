# 🚀 Orchard Studio - Guide de Démarrage Rapide

## Installation (Déjà fait ✅)

Les dépendances ont déjà été installées :
```bash
npm install html-to-image jspdf @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

## Utilisation en 3 Étapes

### Étape 1 : Import
```jsx
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import OrchardPanel from './components/orchard/OrchardPanel';
```

### Étape 2 : State
```jsx
const [showOrchard, setShowOrchard] = useState(false);

const reviewData = {
  title: "Ma Super Review",
  rating: 4.5,
  category: "Fleur",
  author: "Nom de l'auteur",
  date: new Date().toISOString(),
  imageUrl: "/path/to/image.jpg",
  thcLevel: 22,
  cbdLevel: 0.5,
  description: "Description complète...",
  effects: ["Effet 1", "Effet 2"],
  aromas: ["Arôme 1", "Arôme 2"],
  tags: ["Tag1", "Tag2"]
};
```

### Étape 3 : Render
```jsx
return (
  <>
    <button onClick={() => setShowOrchard(true)}>
      Ouvrir Orchard Studio
    </button>

    <AnimatePresence>
      {showOrchard && (
        <OrchardPanel
          reviewData={reviewData}
          onClose={() => setShowOrchard(false)}
        />
      )}
    </AnimatePresence>
  </>
);
```

## Structure des Données

### Format Complet
```typescript
interface ReviewData {
  // Obligatoires
  title: string;
  
  // Recommandés
  rating?: number;           // 0-5
  category?: string;
  author?: string;
  date?: string;             // ISO format
  imageUrl?: string;
  description?: string;
  
  // Optionnels
  thcLevel?: number;
  cbdLevel?: number;
  cultivar?: string;
  effects?: string[];
  aromas?: string[];
  tags?: string[];
}
```

### Exemple Minimal
```javascript
const review = {
  title: "Purple Haze",
  imageUrl: "/images/purple-haze.jpg"
};
```

### Exemple Complet
```javascript
const review = {
  title: "Purple Haze",
  rating: 4.5,
  category: "Fleur",
  author: "Jean Dupont",
  date: "2025-01-15T10:30:00Z",
  imageUrl: "/images/purple-haze.jpg",
  thcLevel: 22,
  cbdLevel: 0.5,
  cultivar: "Sativa",
  description: "Une variété légendaire...",
  effects: ["Euphorique", "Créatif", "Énergisant"],
  aromas: ["Fruité", "Terreux", "Sucré"],
  tags: ["Premium", "Daytime", "Social"]
};
```

## Intégration dans l'Application Existante

### Option 1 : Page de détail de review
```jsx
// Dans ReviewDetailPage.jsx
import OrchardPanel from '../components/orchard/OrchardPanel';

export default function ReviewDetailPage() {
  const [showOrchard, setShowOrchard] = useState(false);
  const review = useReviewData(); // Votre hook/fetch

  return (
    <div>
      {/* Votre contenu existant */}
      
      <button onClick={() => setShowOrchard(true)}>
        Personnaliser & Exporter
      </button>

      {showOrchard && (
        <OrchardPanel
          reviewData={review}
          onClose={() => setShowOrchard(false)}
        />
      )}
    </div>
  );
}
```

### Option 2 : Menu contextuel
```jsx
// Dans ReviewCard.jsx
const handleOrchardOpen = (e) => {
  e.preventDefault();
  setSelectedReview(review);
  setShowOrchard(true);
};

<ContextMenu>
  <MenuItem onClick={handleOrchardOpen}>
    🎨 Personnaliser avec Orchard
  </MenuItem>
</ContextMenu>
```

### Option 3 : Action globale
```jsx
// Dans un Provider global
export const OrchardProvider = ({ children }) => {
  const [orchardData, setOrchardData] = useState(null);

  const openOrchard = (review) => {
    setOrchardData(review);
  };

  return (
    <OrchardContext.Provider value={{ openOrchard }}>
      {children}
      {orchardData && (
        <OrchardPanel
          reviewData={orchardData}
          onClose={() => setOrchardData(null)}
        />
      )}
    </OrchardContext.Provider>
  );
};
```

## Personnalisation

### Ajouter une Palette de Couleurs

Dans `orchardStore.js` :
```javascript
const COLOR_PALETTES = {
  // ... palettes existantes
  myBrand: {
    name: 'Ma Marque',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #4ECDC4 100%)',
    textPrimary: '#FFFFFF',
    textSecondary: '#F0F0F0',
    accent: '#FFE66D',
    title: '#FFFFFF'
  }
};
```

### Ajouter une Police

Dans `TypographyControls.jsx` :
```javascript
const FONT_FAMILIES = [
  // ... polices existantes
  'Poppins',
  'Playfair Display',
  'Ma Nouvelle Police'
];
```

N'oubliez pas d'ajouter la police dans votre HTML :
```html
<link href="https://fonts.googleapis.com/css2?family=Ma+Nouvelle+Police:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

### Créer un Nouveau Template

1. Créez le fichier :
```jsx
// components/orchard/templates/MyTemplate.jsx
export default function MyTemplate({ config, reviewData, dimensions }) {
  return (
    <div style={{
      background: config.colors.background,
      fontFamily: config.typography.fontFamily,
      width: dimensions.width,
      height: dimensions.height
    }}>
      {/* Votre design */}
    </div>
  );
}
```

2. Ajoutez-le dans `orchardStore.js` :
```javascript
const DEFAULT_TEMPLATES = {
  // ... templates existants
  myTemplate: {
    id: 'myTemplate',
    name: 'Mon Template',
    description: 'Description du template',
    layout: 'custom',
    defaultRatio: '16:9',
    supportedRatios: ['16:9', '1:1']
  }
};
```

3. Enregistrez-le dans `TemplateRenderer.jsx` :
```javascript
import MyTemplate from './templates/MyTemplate';

const TEMPLATES = {
  // ... templates existants
  myTemplate: MyTemplate
};
```

## Debugging

### Vérifier l'état du store
```jsx
import { useOrchardStore } from './store/orchardStore';

const config = useOrchardStore(state => state.config);
console.log('Config actuelle:', config);
```

### Tester l'export sans ouvrir le panel
```jsx
import { toPng } from 'html-to-image';

const element = document.getElementById('orchard-preview-container');
const dataUrl = await toPng(element);
console.log('Export réussi:', dataUrl);
```

### Vérifier les préréglages sauvegardés
```javascript
const saved = localStorage.getItem('orchard-storage');
console.log('Préréglages:', JSON.parse(saved));
```

## FAQ Rapide

**Q: Les exports ne fonctionnent pas ?**
R: Vérifiez que l'élément `#orchard-preview-container` existe et que toutes les images sont chargées.

**Q: Les polices ne s'affichent pas ?**
R: Ajoutez les Google Fonts dans votre `index.html` :
```html
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
```

**Q: Le drag & drop ne fonctionne pas ?**
R: Assurez-vous que `@dnd-kit` est bien installé et que les composants sont dans un contexte `DndContext`.

**Q: Comment réinitialiser Orchard ?**
R: Utilisez `resetConfig()` ou videz le localStorage :
```javascript
localStorage.removeItem('orchard-storage');
```

**Q: Puis-je utiliser Orchard avec TypeScript ?**
R: Oui ! Ajoutez simplement les types pour `reviewData` et les props.

## Support

- 📖 Documentation complète : `ORCHARD_README.md`
- 📝 Résumé : `ORCHARD_SUMMARY.md`
- 💡 Exemple d'intégration : `client/src/examples/OrchardIntegrationExample.jsx`

## Checklist d'Intégration

- [ ] Import de OrchardPanel dans votre composant
- [ ] Import de orchard.css (vérifié dans index.css)
- [ ] State pour contrôler l'affichage
- [ ] Données de review au bon format
- [ ] Bouton pour ouvrir Orchard
- [ ] AnimatePresence pour les animations
- [ ] Test des 4 formats d'export
- [ ] Vérification responsive
- [ ] Test du drag & drop
- [ ] Sauvegarde/chargement des préréglages

---

**Vous êtes prêt à utiliser Orchard Studio ! 🎉**

Pour tout problème, consultez les fichiers de documentation ou vérifiez les exemples fournis.
