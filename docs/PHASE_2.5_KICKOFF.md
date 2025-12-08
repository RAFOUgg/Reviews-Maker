# 🚀 PHASE 2.5 - PARCOURS & EXPORT

**Date de Démarrage**: 9 Novembre 2025  
**Durée Estimée**: 4-6 heures  
**Pré-requis**: ✅ Phase 2 Approfondie terminée

---

## 📋 Objectifs Phase 2.5

### **A. Amélioration Parcours Reviews** (2-3h)
Enrichir la navigation et le filtrage des reviews pour une expérience utilisateur optimale.

### **B. Système d'Export Avancé** (2-3h)
Créer un système d'export professionnel multi-format (PNG/PDF/JSON) avec templates personnalisables.

---

## 🎯 Sprint 1 - Analyse Infrastructure Existante (30 min)

### **Étape 1.1 - Analyser HomePage.jsx** ✅
**Fichier**: `client/src/pages/HomePage.jsx` (174 lignes)

**Déjà fait**:
- ✅ Composants: FilterBar, HeroSection, ProductTypeCards, HomeReviewCard
- ✅ Pagination: 8 items par défaut, bouton "Show More"
- ✅ Grid: 4 colonnes (responsive)
- ✅ Actions: Like/Dislike, AuthorStatsModal

**À améliorer**:
- 🔲 Ajouter vues multiples (carte/liste/grille)
- 🔲 Améliorer pagination (infinite scroll option)
- 🔲 Quick view modal (hover preview)

### **Étape 1.2 - Analyser FilterBar.jsx** ✅
**Fichier**: `client/src/components/FilterBar.jsx` (229 lignes)

**Déjà fait**:
- ✅ Filtres: type, minRating, search, dureeEffet, sortBy
- ✅ Advanced filters toggle
- ✅ Active filters count

**À améliorer**:
- 🔲 Ajouter filtres arômes (wheel interactive)
- 🔲 Ajouter filtres effets (checkboxes)
- 🔲 Ajouter filtre cultivars/breeder (autocomplete)
- 🔲 Sauvegarder préférences (localStorage)

### **Étape 1.3 - Analyser ReviewDetailPage.jsx** 🔄
**Fichier**: `client/src/pages/ReviewDetailPage.jsx` (387 lignes)

**État actuel**:
- ✅ Lignes 1-50 lues (imports, state, JSON parsing)
- ⏳ Lignes 51-387 à analyser

**À identifier**:
- 🔲 Bouton export existant ?
- 🔲 Structure affichage complète
- 🔲 Parsing purificationPipeline (à ajouter)

### **Étape 1.4 - Identifier Export Infrastructure** ✅
**Recherche**: `grep export|Export|PDF`

**Résultats**:
- ✅ SettingsPage.jsx: `exportFormat` preferences (pdf/png)
- ❌ Pas de ExportModal existant
- ❌ Pas de templates export

**Conclusion**: Infrastructure export à créer from scratch

---

## 🎯 Sprint 2 - Amélioration Parcours Reviews (2-3h)

### **Tâche 2.1 - Enrichir FilterBar (1h)**
**Fichier**: `client/src/components/FilterBar.jsx`

#### **Ajouter Filtres Avancés**:

**1. Filtre Arômes** (wheel interactive):
```jsx
import WheelSelector from './WheelSelector';

// Dans FilterBar state:
const [selectedAromas, setSelectedAromas] = useState([]);

// Dans render (section Advanced Filters):
<div className="mb-4">
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Arômes recherchés
  </label>
  <WheelSelector
    value={selectedAromas}
    onChange={setSelectedAromas}
    options={allAromas}
    maxSelections={5}
    placeholder="Sélectionnez jusqu'à 5 arômes..."
  />
</div>
```

**2. Filtre Effets** (checkboxes):
```jsx
const [selectedEffects, setSelectedEffects] = useState([]);

<div className="mb-4">
  <label className="block text-sm font-medium text-gray-300 mb-2">
    Effets recherchés
  </label>
  <div className="grid grid-cols-2 gap-2">
    {allEffects.slice(0, 10).map(effect => (
      <label key={effect} className="flex items-center space-x-2 cursor-pointer">
        <input
          type="checkbox"
          checked={selectedEffects.includes(effect)}
          onChange={(e) => {
            if (e.target.checked) {
              setSelectedEffects([...selectedEffects, effect]);
            } else {
              setSelectedEffects(selectedEffects.filter(e => e !== effect));
            }
          }}
          className="form-checkbox text-cyan-500"
        />
        <span className="text-sm text-gray-300">{effect}</span>
      </label>
    ))}
  </div>
</div>
```

**3. Filtre Cultivars/Breeder** (autocomplete):
```jsx
import Autocomplete from './Autocomplete';

const [selectedCultivar, setSelectedCultivar] = useState('');
const [selectedBreeder, setSelectedBreeder] = useState('');

<div className="grid grid-cols-2 gap-4 mb-4">
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Cultivar
    </label>
    <Autocomplete
      value={selectedCultivar}
      onChange={setSelectedCultivar}
      options={allCultivars}
      placeholder="Rechercher un cultivar..."
    />
  </div>
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-2">
      Breeder
    </label>
    <Autocomplete
      value={selectedBreeder}
      onChange={setSelectedBreeder}
      options={allBreeders}
      placeholder="Rechercher un breeder..."
    />
  </div>
</div>
```

**4. Sauvegarder Préférences** (localStorage):
```jsx
import { useEffect } from 'react';

// Charger préférences au mount
useEffect(() => {
  const savedFilters = localStorage.getItem('RM_FILTERS');
  if (savedFilters) {
    const filters = JSON.parse(savedFilters);
    setSelectedAromas(filters.aromas || []);
    setSelectedEffects(filters.effects || []);
    setSelectedCultivar(filters.cultivar || '');
    setSelectedBreeder(filters.breeder || '');
    // ... autres filtres
  }
}, []);

// Sauvegarder à chaque changement
useEffect(() => {
  const filters = {
    aromas: selectedAromas,
    effects: selectedEffects,
    cultivar: selectedCultivar,
    breeder: selectedBreeder,
    // ... autres filtres
  };
  localStorage.setItem('RM_FILTERS', JSON.stringify(filters));
}, [selectedAromas, selectedEffects, selectedCultivar, selectedBreeder]);
```

#### **Logique Filtrage Backend**:
```javascript
// server-new/routes/reviews.js

// GET /api/reviews avec query params
router.get('/', async (req, res) => {
  const { 
    type, 
    minRating, 
    search, 
    dureeEffet,
    aromas,      // Nouveau
    effects,     // Nouveau
    cultivar,    // Nouveau
    breeder,     // Nouveau
    sortBy 
  } = req.query;

  let where = {};

  // ... filtres existants

  // Filtre arômes (JSON LIKE)
  if (aromas) {
    const aromasList = aromas.split(',');
    where.OR = aromasList.map(aroma => ({
      OR: [
        { aromas: { contains: `"${aroma}"` } },
        { notesDominantesOdeur: { contains: `"${aroma}"` } },
        { notesSecondairesOdeur: { contains: `"${aroma}"` } }
      ]
    }));
  }

  // Filtre effets (JSON LIKE)
  if (effects) {
    const effectsList = effects.split(',');
    where.effects = {
      OR: effectsList.map(effect => ({ contains: `"${effect}"` }))
    };
  }

  // Filtre cultivar (JSON LIKE ou cultivars String)
  if (cultivar) {
    where.OR = [
      { cultivars: { contains: `"${cultivar}"` } },
      { cultivarsList: { contains: `"name":"${cultivar}"` } }
    ];
  }

  // Filtre breeder (String LIKE)
  if (breeder) {
    where.breeder = { contains: breeder, mode: 'insensitive' };
  }

  // Query Prisma
  const reviews = await prisma.review.findMany({ where, orderBy, include });

  res.json(reviews);
});
```

---

### **Tâche 2.2 - Vues Multiples (45 min)**
**Fichier**: `client/src/pages/HomePage.jsx`

#### **Créer State Vue Active**:
```jsx
const [viewMode, setViewMode] = useState(() => 
  localStorage.getItem('RM_VIEW_MODE') || 'card'
);

useEffect(() => {
  localStorage.setItem('RM_VIEW_MODE', viewMode);
}, [viewMode]);
```

#### **Sélecteur Vue** (dans FilterBar):
```jsx
<div className="flex items-center gap-2 ml-auto">
  <button
    onClick={() => setViewMode('card')}
    className={`p-2 rounded ${viewMode === 'card' ? 'bg-cyan-500' : 'bg-gray-700'}`}
    title="Vue Carte"
  >
    📇
  </button>
  <button
    onClick={() => setViewMode('list')}
    className={`p-2 rounded ${viewMode === 'list' ? 'bg-cyan-500' : 'bg-gray-700'}`}
    title="Vue Liste"
  >
    ☰
  </button>
  <button
    onClick={() => setViewMode('grid')}
    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-cyan-500' : 'bg-gray-700'}`}
    title="Vue Grille"
  >
    ⊞
  </button>
</div>
```

#### **Rendu Conditionnel**:
```jsx
{viewMode === 'card' && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
    {displayedReviews.map(review => (
      <HomeReviewCard key={review.id} review={review} />
    ))}
  </div>
)}

{viewMode === 'list' && (
  <div className="space-y-4">
    {displayedReviews.map(review => (
      <ReviewListItem key={review.id} review={review} />
    ))}
  </div>
)}

{viewMode === 'grid' && (
  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
    {displayedReviews.map(review => (
      <ReviewGridItem key={review.id} review={review} />
    ))}
  </div>
)}
```

#### **Nouveaux Composants**:

**1. ReviewListItem.jsx** (vue liste compacte):
```jsx
const ReviewListItem = ({ review }) => {
  const image = review.images?.[0] || '/placeholder.jpg';
  const rating = review.categoryRatings?.global || 0;

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800/50 rounded-xl hover:bg-gray-800 transition">
      {/* Image miniature */}
      <img 
        src={image} 
        alt={review.holderName}
        className="w-20 h-20 object-cover rounded-lg"
      />

      {/* Infos */}
      <div className="flex-1">
        <h3 className="text-lg font-bold text-white">{review.holderName}</h3>
        <p className="text-sm text-gray-400">
          {review.cultivars || review.cultivarsList?.[0]?.name || 'N/A'}
        </p>
        <p className="text-xs text-gray-500">
          {new Date(review.createdAt).toLocaleDateString('fr-FR')}
        </p>
      </div>

      {/* Note */}
      <div className="text-right">
        <div className="text-3xl font-bold text-cyan-400">{rating.toFixed(1)}</div>
        <div className="text-xs text-gray-500">/ 10</div>
      </div>

      {/* Type */}
      <div className="px-3 py-1 bg-cyan-500/20 rounded-full text-sm text-cyan-300">
        {review.productType}
      </div>
    </div>
  );
};
```

**2. ReviewGridItem.jsx** (vue grille images):
```jsx
const ReviewGridItem = ({ review }) => {
  const image = review.images?.[0] || '/placeholder.jpg';
  const rating = review.categoryRatings?.global || 0;

  return (
    <div className="relative group cursor-pointer rounded-lg overflow-hidden">
      {/* Image */}
      <img 
        src={image} 
        alt={review.holderName}
        className="w-full aspect-square object-cover transition group-hover:scale-110"
      />

      {/* Overlay hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition">
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h4 className="text-sm font-bold text-white truncate">
            {review.holderName}
          </h4>
          <div className="flex items-center justify-between mt-1">
            <span className="text-xs text-gray-300">{review.productType}</span>
            <span className="text-lg font-bold text-cyan-400">{rating.toFixed(1)}</span>
          </div>
        </div>
      </div>

      {/* Badge note (toujours visible) */}
      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-bold text-cyan-400">
        {rating.toFixed(1)}
      </div>
    </div>
  );
};
```

---

### **Tâche 2.3 - Pagination Améliorée (30 min)**
**Fichier**: `client/src/pages/HomePage.jsx`

#### **Options Pagination**:
```jsx
const [paginationMode, setPaginationMode] = useState('load-more'); // 'load-more' | 'numbered' | 'infinite'
const [itemsPerPage, setItemsPerPage] = useState(() => 
  parseInt(localStorage.getItem('RM_ITEMS_PER_PAGE')) || 8
);

// Sauvegarder préférences
useEffect(() => {
  localStorage.setItem('RM_ITEMS_PER_PAGE', itemsPerPage);
}, [itemsPerPage]);
```

#### **Sélecteur Items/Page**:
```jsx
<div className="flex items-center gap-2 mb-4">
  <label className="text-sm text-gray-400">Items par page:</label>
  <select 
    value={itemsPerPage}
    onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
    className="px-3 py-1 bg-gray-800 text-white rounded"
  >
    <option value="8">8</option>
    <option value="16">16</option>
    <option value="32">32</option>
    <option value="64">64</option>
  </select>
</div>
```

#### **Pagination Numérotée**:
```jsx
{paginationMode === 'numbered' && (
  <div className="flex justify-center items-center gap-2 mt-8">
    <button
      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
      disabled={currentPage === 1}
      className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
    >
      ← Précédent
    </button>

    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
      <button
        key={page}
        onClick={() => setCurrentPage(page)}
        className={`px-3 py-2 rounded ${
          currentPage === page 
            ? 'bg-cyan-500 text-white' 
            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
        }`}
      >
        {page}
      </button>
    ))}

    <button
      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
      disabled={currentPage === totalPages}
      className="px-4 py-2 bg-gray-800 text-white rounded disabled:opacity-50"
    >
      Suivant →
    </button>
  </div>
)}
```

#### **Infinite Scroll**:
```jsx
import { useEffect, useRef } from 'react';

const observerRef = useRef(null);

useEffect(() => {
  if (paginationMode !== 'infinite') return;

  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore();
      }
    },
    { threshold: 0.5 }
  );

  if (observerRef.current) {
    observer.observe(observerRef.current);
  }

  return () => observer.disconnect();
}, [paginationMode, hasMore]);

// Sentinel element
{paginationMode === 'infinite' && (
  <div ref={observerRef} className="h-20 flex items-center justify-center">
    {hasMore && <LoadingSpinner />}
  </div>
)}
```

---

### **Tâche 2.4 - Quick View Modal (30 min)**
**Nouveau Composant**: `client/src/components/QuickViewModal.jsx`

```jsx
import { useState } from 'react';
import { parseImages } from '../utils/imageUtils';

const QuickViewModal = ({ review, onClose }) => {
  if (!review) return null;

  const images = parseImages(review.images);
  const rating = review.categoryRatings?.global || 0;
  const aromas = JSON.parse(review.aromas || '[]');
  const effects = JSON.parse(review.effects || '[]');

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gray-900 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{review.holderName}</h2>
            <p className="text-gray-400">
              {review.cultivars || review.cultivarsList?.[0]?.name || 'N/A'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white text-3xl"
          >
            ×
          </button>
        </div>

        {/* Image principale */}
        {images[0] && (
          <img 
            src={images[0]} 
            alt={review.holderName}
            className="w-full h-64 object-cover rounded-xl mb-6"
          />
        )}

        {/* Grid infos */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* Note globale */}
          <div className="text-center p-6 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl">
            <div className="text-5xl font-bold text-cyan-400 mb-2">{rating.toFixed(1)}</div>
            <div className="text-gray-400">Note globale</div>
          </div>

          {/* Type */}
          <div className="text-center p-6 bg-gray-800/50 rounded-xl">
            <div className="text-2xl font-bold text-white mb-2">{review.productType}</div>
            <div className="text-gray-400">Type de produit</div>
          </div>
        </div>

        {/* Arômes */}
        {aromas.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">🌿 Arômes</h3>
            <div className="flex flex-wrap gap-2">
              {aromas.slice(0, 8).map(aroma => (
                <span 
                  key={aroma}
                  className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm"
                >
                  {aroma}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Effets */}
        {effects.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">⚡ Effets</h3>
            <div className="flex flex-wrap gap-2">
              {effects.slice(0, 6).map(effect => (
                <span 
                  key={effect}
                  className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                >
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {review.description && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-white mb-3">📝 Description</h3>
            <p className="text-gray-300 leading-relaxed">
              {review.description.substring(0, 300)}
              {review.description.length > 300 && '...'}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            onClick={() => window.location.href = `/review/${review.id}`}
            className="flex-1 px-6 py-3 bg-cyan-500 text-white rounded-xl hover:bg-cyan-600 transition font-medium"
          >
            Voir détails complets
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
```

#### **Intégration dans HomeReviewCard**:
```jsx
import { useState } from 'react';
import QuickViewModal from './QuickViewModal';

const HomeReviewCard = ({ review }) => {
  const [showQuickView, setShowQuickView] = useState(false);

  return (
    <>
      <div 
        className="... relative"
        onMouseEnter={() => setShowQuickView(true)}
        onMouseLeave={() => setShowQuickView(false)}
      >
        {/* Contenu carte existant */}
        
        {/* Overlay hover */}
        {showQuickView && (
          <div className="absolute inset-0 bg-cyan-500/10 border-2 border-cyan-500 rounded-2xl pointer-events-none" />
        )}
      </div>

      {/* Modal Quick View */}
      {showQuickView && (
        <QuickViewModal 
          review={review} 
          onClose={() => setShowQuickView(false)} 
        />
      )}
    </>
  );
};
```

---

## 🎯 Sprint 3 - Système d'Export Avancé (2-3h)

### **Tâche 3.1 - Architecture Export (30 min)**

#### **Structure de Dossiers**:
```
client/src/
├── components/
│   └── export/
│       ├── ExportModal.jsx
│       ├── ExportTemplateSelector.jsx
│       ├── ExportPreview.jsx
│       ├── ExportOptions.jsx
│       └── templates/
│           ├── InstagramCard.jsx
│           ├── InstagramStory.jsx
│           ├── FacebookPost.jsx
│           ├── TechnicalSheet.jsx
│           └── DetailedReport.jsx
└── utils/
    └── export/
        ├── exportToPNG.js
        ├── exportToPDF.js
        ├── exportToJSON.js
        └── templateRenderer.js
```

#### **Dépendances à Installer**:
```bash
cd client
npm install html2canvas jspdf
```

---

### **Tâche 3.2 - Utilitaires Export (45 min)**

#### **1. exportToPNG.js**:
```javascript
import html2canvas from 'html2canvas';

/**
 * Exporte un élément DOM en PNG haute résolution
 * @param {HTMLElement} element - Élément à exporter
 * @param {Object} options - Options d'export
 * @param {number} options.scale - Échelle (1=normal, 2=2x, 3=3x)
 * @param {string} options.filename - Nom du fichier
 * @param {string} options.format - 'png' | 'jpeg' | 'webp'
 * @param {number} options.quality - Qualité JPEG/WebP (0-1)
 * @returns {Promise<void>}
 */
export const exportToPNG = async (element, options = {}) => {
  const {
    scale = 2,
    filename = 'review-export.png',
    format = 'png',
    quality = 0.95
  } = options;

  try {
    // Générer canvas haute résolution
    const canvas = await html2canvas(element, {
      scale,
      useCORS: true,
      allowTaint: false,
      backgroundColor: '#1a1a2e',
      logging: false
    });

    // Convertir en blob
    const blob = await new Promise(resolve => {
      canvas.toBlob(resolve, `image/${format}`, quality);
    });

    // Télécharger
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, format, size: blob.size };
  } catch (error) {
    console.error('Erreur export PNG:', error);
    throw new Error(`Échec export PNG: ${error.message}`);
  }
};
```

#### **2. exportToPDF.js**:
```javascript
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Exporte un élément DOM en PDF multi-pages
 * @param {HTMLElement|HTMLElement[]} elements - Élément(s) à exporter
 * @param {Object} options - Options d'export
 * @param {string} options.filename - Nom du fichier
 * @param {string} options.orientation - 'portrait' | 'landscape'
 * @param {string} options.format - 'a4' | 'letter' | 'legal'
 * @param {number} options.scale - Échelle rendu (2 recommandé)
 * @returns {Promise<void>}
 */
export const exportToPDF = async (elements, options = {}) => {
  const {
    filename = 'review-export.pdf',
    orientation = 'portrait',
    format = 'a4',
    scale = 2
  } = options;

  try {
    // Initialiser PDF
    const pdf = new jsPDF({
      orientation,
      unit: 'mm',
      format
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    // Convertir en array
    const elementsArray = Array.isArray(elements) ? elements : [elements];

    for (let i = 0; i < elementsArray.length; i++) {
      const element = elementsArray[i];

      // Générer canvas
      const canvas = await html2canvas(element, {
        scale,
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Convertir en image
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const imgWidth = pageWidth - 20; // Marges 10mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      // Ajouter nouvelle page si nécessaire
      if (i > 0) {
        pdf.addPage();
      }

      // Ajouter image
      pdf.addImage(imgData, 'JPEG', 10, 10, imgWidth, imgHeight);

      // Numéro de page
      pdf.setFontSize(10);
      pdf.setTextColor(150);
      pdf.text(
        `Page ${i + 1} / ${elementsArray.length}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    // Télécharger
    pdf.save(filename);

    return { success: true, pages: elementsArray.length };
  } catch (error) {
    console.error('Erreur export PDF:', error);
    throw new Error(`Échec export PDF: ${error.message}`);
  }
};
```

#### **3. exportToJSON.js**:
```javascript
/**
 * Exporte une review en JSON formaté
 * @param {Object} review - Objet review complet
 * @param {Object} options - Options d'export
 * @param {boolean} options.pretty - Indentation JSON
 * @param {string[]} options.exclude - Champs à exclure
 * @returns {Promise<void>}
 */
export const exportToJSON = async (review, options = {}) => {
  const {
    pretty = true,
    exclude = ['id', 'ownerId', 'updatedAt']
  } = options;

  try {
    // Filtrer champs exclus
    const filtered = Object.fromEntries(
      Object.entries(review).filter(([key]) => !exclude.includes(key))
    );

    // Parser JSON fields
    const parsed = {
      ...filtered,
      categoryRatings: JSON.parse(filtered.categoryRatings || '{}'),
      aromas: JSON.parse(filtered.aromas || '[]'),
      tastes: JSON.parse(filtered.tastes || '[]'),
      effects: JSON.parse(filtered.effects || '[]'),
      notesDominantesOdeur: JSON.parse(filtered.notesDominantesOdeur || '[]'),
      notesSecondairesOdeur: JSON.parse(filtered.notesSecondairesOdeur || '[]'),
      dryPuff: JSON.parse(filtered.dryPuff || '[]'),
      inhalation: JSON.parse(filtered.inhalation || '[]'),
      expiration: JSON.parse(filtered.expiration || '[]'),
      purificationPipeline: JSON.parse(filtered.purificationPipeline || '[]'),
      cultivarsList: JSON.parse(filtered.cultivarsList || '[]'),
      pipelineExtraction: JSON.parse(filtered.pipelineExtraction || '[]'),
      pipelineSeparation: JSON.parse(filtered.pipelineSeparation || '[]')
    };

    // Générer JSON
    const json = pretty 
      ? JSON.stringify(parsed, null, 2)
      : JSON.stringify(parsed);

    // Télécharger
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${review.holderName.replace(/\s/g, '-')}.json`;
    link.click();
    URL.revokeObjectURL(url);

    return { success: true, size: blob.size };
  } catch (error) {
    console.error('Erreur export JSON:', error);
    throw new Error(`Échec export JSON: ${error.message}`);
  }
};
```

---

### **Tâche 3.3 - Templates Export (1h)**

**(À développer dans prochaine session - détails complets dans PHASE_2_APPROFONDIE_TERMINEE.md section "Phase 2.5 - Système d'Export Avancé")**

---

## 📋 Checklist Complète Phase 2.5

### **Sprint 1 - Analyse** ✅:
- [x] Analyser HomePage.jsx
- [x] Analyser FilterBar.jsx
- [ ] Compléter analyse ReviewDetailPage.jsx
- [x] Identifier infrastructure export existante

### **Sprint 2 - Parcours Reviews**:
- [ ] Enrichir FilterBar (arômes, effets, cultivar/breeder)
- [ ] Sauvegarder filtres (localStorage)
- [ ] Créer vues multiples (carte/liste/grille)
- [ ] Implémenter pagination améliorée
- [ ] Créer QuickViewModal

### **Sprint 3 - Export**:
- [ ] Installer dépendances (html2canvas, jsPDF)
- [ ] Créer utilitaires (exportToPNG, exportToPDF, exportToJSON)
- [ ] Créer templates (Instagram, Facebook, Fiche A4, Rapport)
- [ ] Créer ExportModal + sous-composants
- [ ] Intégrer bouton export ReviewDetailPage

---

## 🚀 Prochaine Action Immédiate

**Commencer par**: Compléter l'analyse de `ReviewDetailPage.jsx` (lignes 51-387) pour identifier l'emplacement optimal du bouton export et comprendre la structure d'affichage complète.

```bash
# Action 1
Lire ReviewDetailPage.jsx lignes 51-387

# Action 2
Identifier section pour bouton export

# Action 3  
Vérifier parsing purificationPipeline (à ajouter)
```

---

*Document créé automatiquement - 9 Novembre 2025*  
*Durée estimée Phase 2.5: 4-6 heures*  
*Pré-requis: ✅ Phase 2 Approfondie terminée*
