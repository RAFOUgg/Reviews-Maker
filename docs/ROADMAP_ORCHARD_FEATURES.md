# 🚀 Roadmap Features Orchard - Drag & Drop + Multi-Page

## 📋 Vue d'ensemble

Deux features majeures demandées pour améliorer l'expérience Orchard :

1. **Système Drag & Drop** : Placement personnalisé des champs de données
2. **Support Multi-Page** : Pagination pour formats carrés (1:1 et 4:3)

---

## 🎨 Feature 1 : Drag & Drop System

### Objectif
Permettre aux utilisateurs de glisser-déposer les champs de données (cultivar, notes, arômes, effets) directement sur le canvas Orchard pour personnaliser complètement la mise en page.

### Architecture Proposée

#### 1. Nouveau Composant : `ContentPanel`
**Localisation** : `client/src/components/orchard/ContentPanel.jsx`

**Responsabilités** :
- Afficher la liste des champs disponibles (cultivar, notes catégories, arômes, effets, etc.)
- Rendre les éléments draggables
- Indiquer visuellement les champs déjà placés vs disponibles

**Props** :
```jsx
{
  reviewData: Object,      // Données de la review
  placedFields: Array,     // Champs déjà placés sur le canvas
  onFieldDrag: Function    // Callback quand un champ commence à être traîné
}
```

**UI Mockup** :
```
┌─────────────────────────┐
│  📦 Contenu Disponible  │
├─────────────────────────┤
│ [🏷️] Nom du cultivar   │ ← Draggable
│ [⭐] Note globale       │ ← Draggable
│ [👁️] Note visuelle     │ ← Draggable
│ [👃] Arômes             │ ← Draggable
│ [⚡] Effets             │ ← Draggable
│ [💬] Commentaire        │ ← Draggable
│ ...                      │
└─────────────────────────┘
```

---

#### 2. Modification : `PreviewPane`
**Localisation** : `client/src/components/orchard/PreviewPane.jsx`

**Nouvelles Responsabilités** :
- Définir des drop zones (zones de dépôt)
- Gérer les événements onDrop
- Positionner les éléments déposés (x, y, width, height)
- Persister la configuration dans `orchardConfig`

**Nouvelles Props** :
```jsx
{
  // ... props existantes
  mode: 'template' | 'custom',  // Mode template (existant) ou custom (drag & drop)
  layoutConfig: Object,          // Configuration de layout personnalisé
  onLayoutChange: Function       // Callback quand un élément est déposé
}
```

**Drop Zones** :
```javascript
const dropZones = [
  { id: 'header', x: 0, y: 0, width: '100%', height: '15%' },
  { id: 'main', x: 0, y: '15%', width: '100%', height: '70%' },
  { id: 'footer', x: 0, y: '85%', width: '100%', height: '15%' }
];
```

---

#### 3. Modification : `ConfigPane`
**Localisation** : `client/src/components/orchard/ConfigPane.jsx`

**Nouveaux Contrôles** :
- Toggle "Mode Template" vs "Mode Personnalisé"
- Bouton "Réinitialiser Layout"
- Contrôles d'alignement (gauche, centre, droite)
- Contrôles de taille de police pour chaque élément

---

### Implémentation Technique

#### Option A : React DnD (Recommandé)
**Bibliothèque** : `react-dnd` + `react-dnd-html5-backend`

**Installation** :
```bash
npm install react-dnd react-dnd-html5-backend
```

**Exemple ContentPanel** :
```jsx
import { useDrag } from 'react-dnd';

function DraggableField({ field }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'FIELD',
    item: { field },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div ref={drag} style={{ opacity: isDragging ? 0.5 : 1 }}>
      {field.label}
    </div>
  );
}
```

**Exemple PreviewPane** :
```jsx
import { useDrop } from 'react-dnd';

function DropZone({ id, onDrop }) {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'FIELD',
    drop: (item) => onDrop(id, item.field),
    collect: (monitor) => ({
      isOver: monitor.isOver()
    })
  }));

  return (
    <div ref={drop} style={{ background: isOver ? '#e0e0e0' : 'transparent' }}>
      {/* Drop zone content */}
    </div>
  );
}
```

---

#### Option B : Drag Events Natifs
**Avantage** : Pas de dépendance externe  
**Inconvénient** : Plus de code boilerplate

**Exemple** :
```jsx
// ContentPanel
<div
  draggable
  onDragStart={(e) => {
    e.dataTransfer.setData('field', JSON.stringify(field));
  }}
>
  {field.label}
</div>

// PreviewPane
<div
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const field = JSON.parse(e.dataTransfer.getData('field'));
    handleDrop(field);
  }}
>
  {/* Drop zone */}
</div>
```

---

### Structure de Layout Config
```javascript
{
  mode: 'custom',
  elements: [
    {
      id: 'cultivar-name',
      field: 'holderName',
      zone: 'header',
      position: { x: 10, y: 10 },
      size: { width: '80%', height: 'auto' },
      style: { fontSize: 24, fontWeight: 'bold', textAlign: 'center' }
    },
    {
      id: 'overall-rating',
      field: 'overallRating',
      zone: 'main',
      position: { x: 50, y: 20 },
      size: { width: 100, height: 100 },
      style: { fontSize: 48, color: '#FFD700' }
    }
    // ... autres éléments
  ]
}
```

---

## 📄 Feature 2 : Multi-Page Support

### Objectif
Permettre l'export de reviews sur plusieurs pages pour les formats carrés (1:1 et 4:3) afin de ne pas surcharger une seule image.

### Architecture Proposée

#### 1. Modification : `OrchardPanel`
**Localisation** : `client/src/components/orchard/OrchardPanel.jsx`

**Nouvelles Responsabilités** :
- Détecter si le ratio est 1:1 ou 4:3
- Paginer automatiquement le contenu si nécessaire
- Afficher des contrôles de navigation (Page 1/3, Précédent, Suivant)

**Nouvelle State** :
```jsx
const [currentPage, setCurrentPage] = useState(1);
const [totalPages, setTotalPages] = useState(1);
```

**UI Mockup** :
```
┌─────────────────────────┐
│      Page 1/3           │ ← Navigation
├─────────────────────────┤
│                         │
│   [Canvas Orchard]      │
│                         │
├─────────────────────────┤
│  [◄ Précédent] [Suivant ►] │
└─────────────────────────┘
```

---

#### 2. Pagination Logic

**Règles de Pagination** :
- **Fleur/Hash** : Maximum 2 pages
  - Page 1 : Nom, Image, Notes catégories, Arômes principaux
  - Page 2 : Effets, Commentaire, Détails pipeline
- **Concentré** : Maximum 3 pages (plus de données taste)
  - Page 1 : Nom, Image, Notes visuelles
  - Page 2 : Arômes, Taste, Texture
  - Page 3 : Effets, Commentaire
- **Comestible** : 1 page (peu de données)

**Fonction de Pagination** :
```javascript
function paginateContent(reviewData, productType, ratio) {
  if (ratio !== '1:1' && ratio !== '4:3') {
    return [reviewData]; // Single page pour autres ratios
  }

  const pages = [];
  
  if (productType === 'Concentré') {
    pages.push({
      title: `${reviewData.holderName} - Visual`,
      content: { visual: reviewData.visual, image: reviewData.images[0] }
    });
    pages.push({
      title: `${reviewData.holderName} - Profil`,
      content: { aromas: reviewData.aromas, taste: reviewData.taste, texture: reviewData.texture }
    });
    pages.push({
      title: `${reviewData.holderName} - Effets`,
      content: { effects: reviewData.effects, comment: reviewData.holderComment }
    });
  } else {
    // ... logique Fleur/Hash
  }

  return pages;
}
```

---

#### 3. Export Multi-Page

**Option A : Export ZIP avec plusieurs images**
```javascript
async function exportMultiPage(pages, format) {
  const zip = new JSZip();
  
  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderPageToCanvas(pages[i]);
    const blob = await canvasToBlob(canvas, format);
    zip.file(`page-${i + 1}.${format}`, blob);
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `review-${reviewData.holderName}.zip`);
}
```

**Option B : Export PDF multi-page**
```javascript
import jsPDF from 'jspdf';

async function exportMultiPagePDF(pages) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [800, 800] // 1:1 ratio
  });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();
    const canvas = await renderPageToCanvas(pages[i]);
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, 800, 800);
  }

  pdf.save(`review-${reviewData.holderName}.pdf`);
}
```

---

#### 4. Modification : `ConfigPane`

**Nouveaux Contrôles** :
- Checkbox "Activer pagination automatique" (pour 1:1 et 4:3)
- Input "Pages maximum" (1-5)
- Bouton "Prévisualiser toutes les pages"
- Select "Format d'export multi-page" (ZIP, PDF)

---

### Template Config Extension
```javascript
{
  // ... config existante
  pagination: {
    enabled: true,
    maxPages: 3,
    exportFormat: 'pdf', // 'zip' | 'pdf'
    pageBreakStrategy: 'auto' // 'auto' | 'manual'
  }
}
```

---

## 🧪 Tests à Prévoir

### Tests Drag & Drop
1. Glisser un champ depuis ContentPanel vers PreviewPane
2. Repositionner un champ déjà placé
3. Supprimer un champ du canvas (drag vers ContentPanel)
4. Sauvegarder la configuration personnalisée
5. Charger une configuration sauvegardée

### Tests Multi-Page
1. Créer une review Concentré en 1:1 → vérifier pagination automatique
2. Naviguer entre les pages avec les boutons
3. Exporter en ZIP → vérifier 3 images générées
4. Exporter en PDF → vérifier 3 pages dans le PDF
5. Désactiver pagination → vérifier single page

---

## 📦 Dépendances Nécessaires

```json
{
  "react-dnd": "^16.0.1",
  "react-dnd-html5-backend": "^16.0.1",
  "jszip": "^3.10.1",
  "jspdf": "^2.5.1"
}
```

---

## 🗓️ Plan d'Implémentation

### Phase 1 : Drag & Drop (Estimé : 2-3 jours)
1. Installer react-dnd
2. Créer ContentPanel avec champs draggables
3. Modifier PreviewPane pour drop zones
4. Implémenter sauvegarde layoutConfig
5. Tests et ajustements UI

### Phase 2 : Multi-Page (Estimé : 2 jours)
1. Implémenter logique de pagination
2. Ajouter contrôles navigation dans OrchardPanel
3. Implémenter export ZIP
4. Implémenter export PDF
5. Tests avec reviews réelles

### Phase 3 : Intégration (Estimé : 1 jour)
1. Combiner les deux features (drag & drop sur multi-page)
2. Tests de régression complets
3. Documentation utilisateur
4. Optimisations performances

---

## 🎯 Résultat Attendu

### Drag & Drop
✅ Layout 100% personnalisable  
✅ Sauvegarde de configurations  
✅ UX intuitive et fluide  

### Multi-Page
✅ Export propre pour formats carrés  
✅ Pagination intelligente par type de produit  
✅ Support ZIP et PDF  

---

**Prêt à commencer après validation de la refonte mappings** 🚀
