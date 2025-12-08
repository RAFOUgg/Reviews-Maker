# 🎨 Plan d'Implémentation - Features Orchard Avancées

## 📋 Contexte
L'utilisateur demande :
1. **Système drag & drop** : Glisser-déposer les infos depuis le panel "Contenu" vers des zones du rendu
2. **Multi-page** : Pagination pour formats 1:1 et 4:3

## 🎯 Objectifs

### Feature 1 : Drag & Drop Content Placement
**Problème actuel** : L'aperçu Orchard utilise des templates fixes, aucune personnalisation n'est possible.

**Solution** : Système de zones personnalisables où l'utilisateur peut glisser n'importe quel champ de données.

### Feature 2 : Multi-Page Export
**Problème actuel** : Les formats carrés (1:1, 4:3) sont surchargés, tout le contenu sur une seule page.

**Solution** : Pagination automatique ou manuelle avec export multi-images ou PDF.

---

## 📦 Phase 1 : Drag & Drop System (Priorité Haute)

### 1.1 Créer le ContentPanel Component

**Fichier** : `client/src/components/orchard/ContentPanel.jsx`

**Responsabilités** :
- Lister tous les champs disponibles de la review
- Rendre chaque champ draggable
- Indiquer visuellement les champs déjà placés

**Structure** :
```jsx
import { useDrag } from 'react-dnd';

const DRAGGABLE_FIELDS = {
  basic: [
    { id: 'holderName', label: 'Nom du cultivar', icon: '🏷️', type: 'text' },
    { id: 'breeder', label: 'Breeder', icon: '🧬', type: 'text' },
    { id: 'images', label: 'Image principale', icon: '🖼️', type: 'image' }
  ],
  ratings: [
    { id: 'overallRating', label: 'Note globale', icon: '⭐', type: 'rating' },
    { id: 'categoryRatings.visual', label: 'Note visuelle', icon: '👁️', type: 'rating' },
    { id: 'categoryRatings.smell', label: 'Note odeur', icon: '👃', type: 'rating' },
    // ... autres catégories
  ],
  details: [
    { id: 'aromas', label: 'Arômes', icon: '🌸', type: 'wheel' },
    { id: 'effects', label: 'Effets', icon: '⚡', type: 'effects' },
    { id: 'tastes', label: 'Goûts', icon: '👅', type: 'wheel' }
  ],
  advanced: [
    { id: 'holderComment', label: 'Commentaire', icon: '💬', type: 'textarea' },
    { id: 'fertilization', label: 'Pipeline fertilisation', icon: '🌱', type: 'pipeline' }
  ]
};

function DraggableField({ field, isPlaced }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'ORCHARD_FIELD',
    item: { field },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className={`
        p-3 rounded-lg cursor-move transition-all
        ${isDragging ? 'opacity-50 scale-95' : 'opacity-100 scale-100'}
        ${isPlaced ? 'bg-green-500/20 border-green-500' : 'bg-purple-500/20 border-purple-500'}
        border-2 hover:shadow-lg
      `}
    >
      <span className="text-2xl mr-2">{field.icon}</span>
      <span>{field.label}</span>
      {isPlaced && <span className="ml-auto text-xs">✓ Placé</span>}
    </div>
  );
}

export default function ContentPanel({ reviewData, placedFields, onFieldSelect }) {
  return (
    <div className="w-80 bg-gray-900/50 p-4 rounded-lg overflow-y-auto max-h-screen">
      <h2 className="text-xl font-bold mb-4">📦 Contenu Disponible</h2>
      
      <div className="space-y-4">
        <Section title="Informations de base" fields={DRAGGABLE_FIELDS.basic} />
        <Section title="Notes" fields={DRAGGABLE_FIELDS.ratings} />
        <Section title="Détails sensoriels" fields={DRAGGABLE_FIELDS.details} />
        <Section title="Avancé" fields={DRAGGABLE_FIELDS.advanced} />
      </div>
    </div>
  );
}
```

---

### 1.2 Modifier PreviewPane avec Drop Zones

**Fichier** : `client/src/components/orchard/PreviewPane.jsx`

**Modifications** :
- Ajouter un mode "Edit Layout" vs "Preview"
- Définir des zones droppables (header, main, footer, sidebar)
- Gérer les événements de drop
- Permettre de redimensionner/repositionner les éléments

**Structure** :
```jsx
import { useDrop } from 'react-dnd';

function DropZone({ zone, onDrop, children }) {
  const [{ isOver, canDrop }, drop] = useDrop(() => ({
    accept: 'ORCHARD_FIELD',
    drop: (item) => onDrop(zone, item.field),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop()
    })
  }));

  return (
    <div
      ref={drop}
      className={`
        relative min-h-[100px] border-2 border-dashed rounded-lg p-4
        ${isOver ? 'border-green-500 bg-green-500/10' : 'border-gray-500/30'}
        ${canDrop ? 'border-purple-500' : ''}
      `}
    >
      {children}
      {isOver && <div className="absolute inset-0 bg-green-500/20 pointer-events-none" />}
    </div>
  );
}

function PlacedField({ field, value, onRemove, onResize }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'PLACED_FIELD',
    item: { field },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }));

  return (
    <div
      ref={drag}
      className="relative group cursor-move"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <button
        onClick={() => onRemove(field.id)}
        className="absolute -top-2 -right-2 bg-red-500 rounded-full w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        ✕
      </button>
      <FieldRenderer field={field} value={value} />
    </div>
  );
}

export default function PreviewPane({ mode, layout, onLayoutChange }) {
  const [editMode, setEditMode] = useState(false);

  const handleDrop = (zone, field) => {
    onLayoutChange({
      ...layout,
      [zone]: [...(layout[zone] || []), field]
    });
  };

  if (mode === 'template') {
    // Mode actuel : templates fixes
    return <TemplateRenderer {...props} />;
  }

  // Nouveau mode : custom layout
  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setEditMode(!editMode)}
          className="bg-purple-500 px-4 py-2 rounded-lg"
        >
          {editMode ? '👁️ Prévisualiser' : '✏️ Éditer Layout'}
        </button>
      </div>

      <div className="grid grid-rows-[auto_1fr_auto] h-full gap-4 p-4">
        <DropZone zone="header" onDrop={handleDrop}>
          {layout.header?.map(field => (
            <PlacedField key={field.id} field={field} />
          ))}
        </DropZone>

        <div className="grid grid-cols-[1fr_300px] gap-4">
          <DropZone zone="main" onDrop={handleDrop}>
            {layout.main?.map(field => (
              <PlacedField key={field.id} field={field} />
            ))}
          </DropZone>

          <DropZone zone="sidebar" onDrop={handleDrop}>
            {layout.sidebar?.map(field => (
              <PlacedField key={field.id} field={field} />
            ))}
          </DropZone>
        </div>

        <DropZone zone="footer" onDrop={handleDrop}>
          {layout.footer?.map(field => (
            <PlacedField key={field.id} field={field} />
          ))}
        </DropZone>
      </div>
    </div>
  );
}
```

---

### 1.3 Modifier ConfigPane pour Mode Switch

**Fichier** : `client/src/components/orchard/ConfigPane.jsx`

**Ajouts** :
```jsx
<div className="mb-4">
  <label className="block mb-2">Mode de mise en page</label>
  <select value={config.layoutMode} onChange={handleModeChange}>
    <option value="template">Templates prédéfinis</option>
    <option value="custom">Personnalisé (Drag & Drop)</option>
  </select>
</div>

{config.layoutMode === 'custom' && (
  <>
    <button onClick={resetLayout} className="btn-danger">
      🔄 Réinitialiser Layout
    </button>
    <button onClick={saveLayoutAsTemplate} className="btn-primary">
      💾 Sauvegarder comme template
    </button>
  </>
)}
```

---

### 1.4 Modifier OrchardPanel pour Intégration

**Fichier** : `client/src/components/orchard/OrchardPanel.jsx`

**Structure finale** :
```jsx
export default function OrchardPanel({ reviewData, orchardConfig, onConfigChange }) {
  const [layout, setLayout] = useState(orchardConfig.customLayout || {});

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-[300px_1fr_350px] gap-4 h-screen">
        {/* Panel gauche : Contenu draggable */}
        <ContentPanel
          reviewData={reviewData}
          placedFields={getAllPlacedFields(layout)}
          onFieldSelect={() => {}}
        />

        {/* Panel central : Preview avec drop zones */}
        <PreviewPane
          mode={orchardConfig.layoutMode || 'template'}
          layout={layout}
          onLayoutChange={setLayout}
          reviewData={reviewData}
          config={orchardConfig}
        />

        {/* Panel droit : Configuration */}
        <ConfigPane
          config={orchardConfig}
          onChange={onConfigChange}
          onLayoutChange={setLayout}
        />
      </div>
    </DndProvider>
  );
}
```

---

## 📄 Phase 2 : Multi-Page Support (Priorité Moyenne)

### 2.1 Détecter Formats Carrés et Paginer Contenu

**Fonction de pagination** :
```javascript
function shouldPaginate(ratio) {
  return ratio === '1:1' || ratio === '4:3';
}

function paginateReviewContent(reviewData, productType, maxItemsPerPage = 5) {
  const pages = [];
  
  // Page 1 : Toujours nom + image + note globale
  pages.push({
    pageNumber: 1,
    content: {
      title: reviewData.holderName,
      image: reviewData.images?.[0],
      overallRating: reviewData.overallRating,
      categoryRatings: reviewData.categoryRatings
    }
  });

  // Page 2+ : Détails selon type de produit
  if (productType === 'Concentré') {
    // Concentré a beaucoup de données taste
    pages.push({
      pageNumber: 2,
      content: {
        title: `${reviewData.holderName} - Profil Sensoriel`,
        aromas: reviewData.aromas,
        tastes: reviewData.tastes,
        texture: reviewData.texture
      }
    });
    
    pages.push({
      pageNumber: 3,
      content: {
        title: `${reviewData.holderName} - Effets`,
        effects: reviewData.effects,
        comment: reviewData.holderComment
      }
    });
  } else {
    // Fleur/Hash : 2 pages suffisent
    pages.push({
      pageNumber: 2,
      content: {
        title: `${reviewData.holderName} - Détails`,
        aromas: reviewData.aromas,
        effects: reviewData.effects,
        comment: reviewData.holderComment
      }
    });
  }

  return pages;
}
```

---

### 2.2 Ajouter Navigation dans OrchardPanel

```jsx
function PageNavigator({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex items-center justify-center gap-4 mt-4">
      <button
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="btn"
      >
        ◄ Précédent
      </button>
      
      <span className="font-bold">
        Page {currentPage} / {totalPages}
      </span>
      
      <button
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="btn"
      >
        Suivant ►
      </button>
    </div>
  );
}
```

---

### 2.3 Export Multi-Page

**Option 1 : ZIP avec plusieurs images**
```javascript
import JSZip from 'jszip';

async function exportMultiPageZip(pages, format, fileName) {
  const zip = new JSZip();
  
  for (let i = 0; i < pages.length; i++) {
    const canvas = await renderPageToCanvas(pages[i]);
    const blob = await canvasToBlob(canvas, format);
    zip.file(`${fileName}_page_${i + 1}.${format}`, blob);
  }
  
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  downloadBlob(zipBlob, `${fileName}_multipage.zip`);
}
```

**Option 2 : PDF multi-page**
```javascript
import { jsPDF } from 'jspdf';

async function exportMultiPagePDF(pages, dimensions, fileName) {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'px',
    format: [dimensions.width, dimensions.height]
  });

  for (let i = 0; i < pages.length; i++) {
    if (i > 0) pdf.addPage();
    
    const canvas = await renderPageToCanvas(pages[i]);
    const imgData = canvas.toDataURL('image/png');
    pdf.addImage(imgData, 'PNG', 0, 0, dimensions.width, dimensions.height);
  }

  pdf.save(`${fileName}_multipage.pdf`);
}
```

---

## 📦 Dépendances Requises

```bash
npm install react-dnd react-dnd-html5-backend jszip jspdf
```

---

## 🗓️ Timeline d'Implémentation

### Semaine 1 : Drag & Drop
- **Jour 1-2** : ContentPanel + types de champs draggables
- **Jour 3-4** : PreviewPane avec drop zones + gestion layout
- **Jour 5** : ConfigPane mode switch + sauvegarde templates

### Semaine 2 : Multi-Page
- **Jour 1** : Détection ratio + fonction de pagination
- **Jour 2** : Navigation entre pages
- **Jour 3** : Export ZIP
- **Jour 4** : Export PDF
- **Jour 5** : Tests + polish UI

### Semaine 3 : Intégration & Tests
- **Jour 1-2** : Intégration complète des deux features
- **Jour 3-4** : Tests utilisateurs + corrections
- **Jour 5** : Documentation

---

## 🧪 Tests Critiques

- [ ] Glisser un champ depuis ContentPanel vers PreviewPane
- [ ] Repositionner un champ déjà placé
- [ ] Supprimer un champ du canvas
- [ ] Sauvegarder layout personnalisé
- [ ] Charger layout sauvegardé
- [ ] Pagination automatique pour 1:1
- [ ] Navigation prev/next entre pages
- [ ] Export ZIP de 3 images
- [ ] Export PDF de 3 pages
- [ ] Drag & drop sur layout paginé

---

**Prêt à commencer dès que le problème de notes est résolu** 🚀
