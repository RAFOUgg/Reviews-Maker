# 🎯 PLAN D'ACTION - REFACTORISATIONS MAJEURES
## Reviews-Maker - Session 2026-01-06 (Suite)

---

## ✅ Corrections rapides COMPLÉTÉES

### 1. Section 6 (Odeurs) ⏳ EN ATTENTE
- ❌ Boutons d'odeurs sans fond sombre
- **Action requise :** Lire AromaWheelPicker.jsx et ajouter bg-gray-800/30

### 2. Section 8 (Goûts) ✅ CORRIGÉ
- ✅ Emoji ligne 123 corrigé : `note.icon || note.familyIcon`
- ✅ Tous les emojis individuels s'affichent correctement

### 3. Section 9 (Effets & Expérience) ⏳ PARTIEL
- ✅ Inputs dosage et méthode stylisés (dark theme)
- ⏳ Reste : inputs durée, début effets, durée globale, profils effets

### 4. Section 10 (Curing) ✅ CORRIGÉ
- ✅ Boutons "Phases prédéfinies" et "Personnalisé" supprimés
- ✅ Interface simplifiée comme Section 3

---

## 🔴 REFACTORISATIONS MAJEURES REQUISES

### **SECTION 2 : Arbre Généalogique PhenoHunt** (Estimation : 3-5 jours)

#### 📋 Objectif
Créer un système interactif de gestion d'arbres généalogiques pour cultivars avec drag & drop, liaison visuelle et organisation en projets.

#### 🎨 Interface cible
```
┌────────────────────────────────────────────────────────────┐
│  🌱 Génétiques & PhenoHunt                                 │
├───────────┬────────────────────────────────────────────────┤
│           │                                                │
│  📚 Onglets │           🎨 CANVA (fond sombre + points)   │
│           │                                                │
│  • Fleurs │   ┌─────┐         ┌─────┐                    │
│    (12)   │   │     │────────▶│     │                    │
│           │   │ 🌸  │         │ 🌺  │                    │
│  • Projets│   └─────┘         └─────┘                    │
│    (3)    │                       │                        │
│           │                       ▼                        │
│           │                   ┌─────┐                     │
│           │                   │ 🌻  │                     │
│           │                   └─────┘                     │
│           │                                                │
│           │   🛠️ Outils flottants :                       │
│           │   [🔗 Lier] [✏️ Modifier] [🗑️ Supprimer]     │
└───────────┴────────────────────────────────────────────────┘
```

#### 🏗️ Architecture technique

##### Composants à créer

1. **GenealogySection.jsx** (conteneur principal)
   ```jsx
   // client/src/pages/CreateFlowerReview/sections/Genetiques.jsx
   - État : selectedCultivar, projects, connections
   - Layout : Volet latéral + Canva principal
   ```

2. **GenealogyCanvas.jsx** (zone drag & drop)
   ```jsx
   // client/src/components/genealogy/GenealogyCanvas.jsx
   - Fond : repeating-linear-gradient points 
   - Drag & drop cultivars depuis sidebar
   - Affichage cercles avec photo
   - Lignes de liaison SVG
   ```

3. **CultivarNode.jsx** (carte cultivar draggable)
   ```jsx
   // client/src/components/genealogy/CultivarNode.jsx
   - Photo ronde avec bordure
   - Nom du cultivar
   - Drag handles
   - Points de connexion
   ```

4. **ConnectionLine.jsx** (ligne de parenté SVG)
   ```jsx
   // client/src/components/genealogy/ConnectionLine.jsx
   - Bézier curve parent → enfant
   - Type : mère/père/croisement
   - Couleur selon type
   ```

5. **GenealogyToolbar.jsx** (barre outils flottante)
   ```jsx
   // client/src/components/genealogy/GenealogyToolbar.jsx
   - Bouton "Lier" (mode création connexion)
   - Bouton "Modifier"
   - Bouton "Supprimer"
   - Undo/Redo
   ```

6. **GenealogyS idebar.jsx** (volet latéral avec onglets)
   ```jsx
   // client/src/components/genealogy/GenealogyS idebar.jsx
   - Onglet 1 : Fleurs (bibliothèque user)
   - Onglet 2 : Projets (groupes)
   - Filtres et recherche
   ```

#### 📦 Dépendances
- **react-beautiful-dnd** ou **dnd-kit** pour drag & drop
- **d3-shape** pour courbes Bézier
- **zustand** pour state global arbre

#### 🗂️ Structure de données

```javascript
// Schema Prisma (nouveau modèle)
model GenealogyProject {
  id          String   @id @default(cuid())
  userId      String
  name        String   // "Purple Haze Pheno Hunt 2026"
  description String?
  nodes       Json[]   // [{cultivarId, x, y, photo}]
  connections Json[]   // [{from, to, type: "mother"|"father"}]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

#### 🔄 Workflow utilisateur

1. **Sélectionner cultivar** depuis sidebar (bibliothèque perso)
2. **Drag & drop** sur le canva
3. **Positionner** le nœud à l'emplacement souhaité
4. **Créer liaison** : cliquer sur point de connexion source → cible
5. **Définir type** : mère/père dans modal
6. **Sauvegarder projet** pour réutilisation

#### 🎯 MVP Features (Phase 1 - 2 jours)

- ✅ Canva avec fond pointillé
- ✅ Drag & drop cultivars depuis sidebar
- ✅ Affichage cercles avec photo
- ✅ Onglets Fleurs/Projets fonctionnels

#### 🚀 Features avancées (Phase 2 - 3 jours)

- ✅ Lignes de liaison SVG dynamiques
- ✅ Barre outils flottante
- ✅ Sauvegarde/chargement projets
- ✅ Undo/Redo
- ✅ Export PNG/SVG de l'arbre

#### 📐 CSS Canva (fond pointillé)
```css
.genealogy-canvas {
  background-color: #1a1f2e;
  background-image: 
    radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  position: relative;
  min-height: 600px;
  overflow: hidden;
}
```

---

### **SECTION 5 : Visualisation Couleurs Interactive** (Estimation : 2-3 jours)

#### 📋 Objectif
Remplacer le nuancier actuel par :
1. **Roue de couleurs** interactive pour sélection
2. **Visualisation weed stylisée** avec changement de couleur dynamique

#### 🎨 Interface cible

```
┌────────────────────────────────────────────────────────────┐
│  👁️ Visuel & Technique                                     │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  🎨 Sélection couleurs                                     │
│  ┌─────────────────┬─────────────────┐                    │
│  │   ROUE COULEUR  │   PREVIEW WEED  │                    │
│  │                 │                 │                    │
│  │       🌈        │       🌿        │                    │
│  │    (cliquable)  │   (dynamique)   │                    │
│  └─────────────────┴─────────────────┘                    │
│                                                            │
│  Couleurs sélectionnées :                                 │
│  ┌────────────────────────────────────┐                   │
│  │ 🟢 Vert clair    ████ 60% ▲▼     │                   │
│  │ 🟣 Violet        ████ 30% ▲▼     │                   │
│  │ 🟠 Orange        ████ 10% ▲▼     │                   │
│  │                  Total: 100%      │                   │
│  └────────────────────────────────────┘                   │
│                                                            │
│  [WhiteSlider] Densité       5/10                         │
│  [WhiteSlider] Trichomes     5/10                         │
│  ...                                                       │
└────────────────────────────────────────────────────────────┘
```

#### 🏗️ Architecture technique

##### Composants à créer

1. **ColorWheelPicker.jsx** (roue interactive)
   ```jsx
   // client/src/components/ui/ColorWheelPicker.jsx
   - Roue SVG avec segments
   - Clic pour sélectionner couleur
   - Ajout à la liste avec %=0
   ```

2. **WeedPreview.jsx** (visualisation stylisée)
   ```jsx
   // client/src/components/ui/WeedPreview.jsx
   - SVG feuille de cannabis stylisée
   - Gradient dynamique selon couleurs sélectionnées
   - Animation transition lors changement
   ```

3. **ColorPercentageSlider.jsx** (jauge % couleur)
   ```jsx
   // client/src/components/ui/ColorPercentageSlider.jsx
   - Slider 0-100%
   - Couleur de fond dynamique
   - Auto-ajustement si total > 100%
   ```

#### 📦 Dépendances
- **chroma-js** pour manipulation couleurs
- **framer-motion** pour animations

#### 🎨 Roue de couleurs
```javascript
const COLOR_WHEEL_SEGMENTS = [
  { id: 'green-bright', label: 'Vert clair', hex: '#9ACD32', angle: 0 },
  { id: 'green', label: 'Vert', hex: '#228B22', angle: 30 },
  { id: 'green-dark', label: 'Vert foncé', hex: '#006400', angle: 60 },
  { id: 'blue-green', label: 'Bleu-vert', hex: '#20B2AA', angle: 90 },
  { id: 'purple', label: 'Violet', hex: '#9370DB', angle: 120 },
  { id: 'purple-dark', label: 'Violet foncé', hex: '#4B0082', angle: 150 },
  { id: 'pink', label: 'Rose', hex: '#FF69B4', angle: 180 },
  { id: 'red', label: 'Rouge', hex: '#DC143C', angle: 210 },
  { id: 'orange', label: 'Orange', hex: '#FF8C00', angle: 240 },
  { id: 'yellow', label: 'Jaune', hex: '#FFD700', angle: 270 },
  { id: 'brown', label: 'Brun', hex: '#8B4513', angle: 300 },
  { id: 'gray', label: 'Gris', hex: '#808080', angle: 330 }
];
```

#### 🌿 SVG Weed Preview
```jsx
<svg viewBox="0 0 200 300" className="w-32 h-48">
  <defs>
    <linearGradient id="weedGradient">
      {selectedColors.map((color, i) => (
        <stop 
          key={color.id}
          offset={`${(i / selectedColors.length) * 100}%`}
          stopColor={color.hex}
          stopOpacity={color.percentage / 100}
        />
      ))}
    </linearGradient>
  </defs>
  <path
    d="M100,50 L120,100 L140,120 L120,140 L100,180 L80,140 L60,120 L80,100 Z"
    fill="url(#weedGradient)"
    stroke="#2d3748"
    strokeWidth="2"
  />
</svg>
```

#### 🔄 Workflow utilisateur

1. **Cliquer sur roue** pour sélectionner couleur
2. **Ajuster %** avec slider pour chaque couleur
3. **Visualiser en temps réel** sur la weed preview
4. **Auto-normalisation** si total > 100% (redistribution proportionnelle)

#### 🎯 MVP Features (Phase 1 - 1 jour)

- ✅ Roue de couleurs cliquable
- ✅ Liste couleurs sélectionnées
- ✅ Sliders % fonctionnels

#### 🚀 Features avancées (Phase 2 - 2 jours)

- ✅ WeedPreview avec gradient dynamique
- ✅ Animation transitions
- ✅ Auto-normalisation %
- ✅ Indicateur total %
- ✅ Retrait couleur avec X

---

## 🐛 BUGS À CORRIGER

### **SECTION 3 : Pipeline Culture - Bugs drag & drop**

#### Problème 1 : Drop de données ne fonctionne pas
**Fichier :** `client/src/components/pipeline/PipelineDragDropView.jsx`

**Diagnostic :**
```javascript
// Ligne ~400 - onDrop handler
const handleDrop = (e, index) => {
  e.preventDefault();
  const data = JSON.parse(e.dataTransfer.getData('application/json'));
  // ❌ BUG : data peut être null/undefined
  // ❌ BUG : cellData[index] non initialisé
}
```

**Solution :**
```javascript
const handleDrop = (e, index) => {
  e.preventDefault();
  try {
    const draggedData = e.dataTransfer.getData('application/json');
    if (!draggedData) {
      console.warn('No data transferred');
      return;
    }
    const data = JSON.parse(draggedData);
    
    // Initialiser cellData[index] si inexistant
    const updatedData = [...timelineData];
    updatedData[index] = {
      ...updatedData[index],
      ...data,
      timestamp: Date.now()
    };
    onDataChange(updatedData);
  } catch (error) {
    console.error('Drop error:', error);
  }
};
```

#### Problème 2 : Ctrl+click multi-sélection non fonctionnel
**Fichier :** `client/src/components/pipeline/PipelineGitHubGrid.jsx`

**Diagnostic :**
```javascript
// Ligne ~350 - onClick handler
const handleCellClick = (index, data) => {
  setSelectedCell(index); // ❌ Écrase la sélection
}
```

**Solution :**
```javascript
const [selectedCells, setSelectedCells] = useState([]); // Array au lieu de single

const handleCellClick = (e, index, data) => {
  if (e.ctrlKey || e.metaKey) {
    // Multi-sélection
    setSelectedCells(prev => 
      prev.includes(index)
        ? prev.filter(i => i !== index) // Retirer
        : [...prev, index] // Ajouter
    );
  } else {
    // Sélection unique
    setSelectedCells([index]);
  }
  setModalData(data);
  setShowModal(true);
};
```

---

## 📅 PLANNING RECOMMANDÉ

### Semaine 1 (Corrections rapides)
- **Jour 1 :** ✅ Sections 6, 8, 9, 10 (FAIT)
- **Jour 2 :** Section 3 bugs (drop + Ctrl+click)
- **Jour 3 :** Section 9 compléter stylisation

### Semaine 2 (Section 5)
- **Jour 4-5 :** ColorWheelPicker + WeedPreview MVP
- **Jour 6 :** Animations + polish Section 5

### Semaines 3-4 (Section 2 - MAJEUR)
- **Jour 7-8 :** GenealogyCanvas + sidebar MVP
- **Jour 9-10 :** Système de liaison (ConnectionLine)
- **Jour 11 :** Toolbar + undo/redo
- **Jour 12 :** Sauvegarde projets + tests

---

## 🎯 PRIORITÉS

1. **🔴 URGENT** : Bugs Section 3 (bloquants pour utilisation)
2. **🟠 IMPORTANT** : Section 9 stylisation (UX incohérente)
3. **🟡 MOYEN** : Section 5 roue couleur (amélioration UX)
4. **🟢 LONG TERME** : Section 2 arbre généalogique (feature majeure)

---

**Document créé le :** 2026-01-06  
**Durée estimée totale :** 12-15 jours  
**Prochain checkpoint :** Après correction bugs Section 3
