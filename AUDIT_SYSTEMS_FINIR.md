# 🔍 AUDIT DES SYSTÈMES À FINIR - Reviews-Maker
> Date: 3 Février 2026
> Scope: PhenoHunt (Fleurs) + Pipeline (4 types) + Export (4 types)

---

## 📊 SYNTHÈSE EXÉCUTIVE

| Système | Avancement | Priorité | Effort Restant |
|---------|------------|----------|----------------|
| **PhenoHunt** | 70% | 🟡 Moyenne | ~2-3 jours |
| **Pipeline Culture (Fleurs)** | 85% | 🟢 Faible | ~1 jour |
| **Pipeline Curing (4 types)** | 60% | 🟡 Moyenne | ~2 jours |
| **Pipeline Extraction/Séparation** | 40% | 🔴 Haute | ~3-4 jours |
| **Pipeline Recipe (Comestibles)** | 30% | 🔴 Haute | ~3-4 jours |
| **Export Maker** | 65% | 🟡 Moyenne | ~2-3 jours |

---

## 🌿 1. SYSTÈME PHENOHUNT (Fleurs uniquement)

### 1.1 État Actuel ✅

**Fichiers existants:**
```
client/src/
├── pages/public/PhenoHuntPage.jsx         ✅ Page principale (202 lignes)
├── components/genetics/
│   ├── CanevasPhenoHunt.jsx               ✅ Canvas React Flow (346 lignes)
│   ├── UnifiedGeneticsCanvas.jsx          ✅ Canvas unifié (documenté)
│   ├── GenealogyCanvas.jsx                ✅ Canvas drag-drop
│   ├── GeneticsLibraryCanvas.jsx          ✅ Bibliothèque cultivars
│   ├── CultivarNode.jsx                   ✅ Nœud custom
│   ├── CultivarCard.jsx                   ✅ Carte cultivar
│   ├── PhenoNode.jsx / PhenoEdge.jsx      ✅ Custom nodes/edges
│   ├── TreeFormModal.jsx                  ✅ Modale création arbre
│   ├── NodeFormModal.jsx / EdgeFormModal  ✅ Modales édition
│   └── TreeToolbar.jsx                    ✅ Barre d'outils
├── store/
│   ├── usePhenoHuntStore.js               ✅ State management (370+ lignes)
│   └── useGeneticsStore.js                ✅ Store genetics

server-new/routes/
├── genetics.js                            ✅ API complète (538 lignes)
└── cultivars.js                           ✅ CRUD cultivars
```

**Backend (Prisma):**
- ✅ Model `GeneticTree` - Arbres généalogiques
- ✅ Model `GenNode` - Nœuds (cultivars sur canvas)
- ✅ Model `GenEdge` - Relations parent/enfant
- ✅ Model `Cultivar` - Bibliothèque utilisateur

### 1.2 Fonctionnalités Implémentées ✅

| Feature | Statut | Notes |
|---------|--------|-------|
| Créer arbre généalogique | ✅ | Via modal + API |
| Ajouter cultivars via drag-drop | ✅ | CanevasPhenoHunt.jsx |
| Connexions parent/enfant | ✅ | React Flow edges |
| Bibliothèque de cultivars | ✅ | Sidebar gauche |
| Zoom/Pan/Controls | ✅ | React Flow built-in |
| Sauvegarde arbre | ✅ | API PATCH + local persist |
| Duplication nœuds | ✅ | Ctrl+D raccourci |
| Suppression nœuds | ✅ | Delete key |

### 1.3 Fonctionnalités MANQUANTES ❌

| Feature | Priorité | Estimation |
|---------|----------|------------|
| **Projets PhenoHunt** (catégorie distincte) | 🔴 Haute | 4h |
| Onglet "PhenoHunt" dans sidebar | 🔴 Haute | 2h |
| Nomination/Code phénotype | 🟡 Moyenne | 2h |
| Export arbre en image/JSON | 🟡 Moyenne | 3h |
| Intégration dans CreateFlowerReview | 🔴 Haute | 4h |
| Share code (partage arbre) | 🟢 Faible | 2h |
| Statistiques cultivars | 🟢 Faible | 2h |

### 1.4 Actions Requises

```javascript
// 1. Ajouter onglet PhenoHunt dans SidebarHierarchique
// Fichier: client/src/components/shared/orchard/SidebarHierarchique.jsx
const TABS = [
  { id: 'library', name: 'Bibliothèque', icon: '📚' },
  { id: 'phenohunt', name: 'PhenoHunt', icon: '🔬' }, // ← AJOUTER
];

// 2. Créer ProjectSelector pour PhenoHunt
// Nouveau fichier: client/src/components/genetics/PhenoHuntProjectSelector.jsx

// 3. Intégrer dans section Génétiques du form Fleur
// Fichier: client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx
// Ajouter: Bouton "Ouvrir PhenoHunt" + Modal sélection arbre
```

---

## 🔄 2. SYSTÈME PIPELINE

### 2.1 Architecture Actuelle

```
client/src/components/pipelines/
├── core/                          # Composants cœur
│   ├── PipelineCore.jsx           ✅ Timeline GitHub-style (306 lignes)
│   ├── PipelineManager.jsx        ✅ Gestion steps (308 lignes)
│   ├── PipelineCell.jsx           ✅ Cellule individuelle
│   ├── PipelineCellEditor.jsx     ✅ Éditeur de cellule
│   ├── PipelineCellModal.jsx      ✅ Modal détails cellule
│   └── PipelineDataModal.jsx      ✅ Modal données
├── views/                         # Vues d'affichage
│   ├── PipelineGridView.jsx       ✅ Grille GitHub (375 lignes)
│   ├── PipelineTimeline.jsx       ✅ Timeline verticale
│   ├── PipelineDragDropView.jsx   ✅ Drag-drop
│   └── PipelineWithSidebar.jsx    ✅ Vue avec sidebar
├── sections/                      # Sections par type
│   ├── CulturePipelineSection.jsx ✅ Fleurs - Culture
│   ├── CuringPipelineSection.jsx  ✅ Curing (4 types)
│   ├── ExtractionPipelineSection.jsx ⚠️ Incomplet
│   ├── SeparationPipelineSection.jsx ⚠️ Incomplet
│   └── RecipePipelineSection.jsx  ⚠️ Incomplet
└── legacy/                        # Anciens composants
    ├── PipelineCulture.jsx
    ├── PipelineCuring.jsx
    └── PipelineRenderer.jsx

store/
├── pipelineStore.js               ✅ State management (171 lignes)
└── orchardStore.js                ✅ Orchard/sidebar state

server-new/routes/
├── pipelines.js                   ✅ API générique (244 lignes)
├── pipeline-culture.js            ✅ Culture specifique (558 lignes)
└── pipeline-github.js             ✅ Format GitHub grid
```

### 2.2 État par Type de Produit

#### 🌸 FLEURS - Pipeline Culture
| Composant | Statut | Notes |
|-----------|--------|-------|
| Configuration (intervalType, dates) | ✅ | jours/semaines/phases |
| Grille GitHub-style | ✅ | 53 semaines |
| 12 phases prédéfinies | ✅ | Germination → Récolte |
| 84 champs (CDC) | ⚠️ 70% | Manque quelques champs |
| Drag-drop données | ✅ | Via sidebar |
| Presets (CultureSetup) | ✅ | Backend + frontend |
| Intégration form | ✅ | CulturePipelineSection |

**Manquant Culture:**
- [ ] Tous les 84 champs du CDC validés
- [ ] Export pipeline GIF
- [ ] Mode "journal de bord" (semaine par semaine)

#### 🔥 CURING - Pipeline Maturation (4 types)
| Composant | Statut | Notes |
|-----------|--------|-------|
| Configuration curing type | ✅ | Froid/Chaud |
| Intervalles (s/m/h/j/sem/mois) | ✅ | |
| Température/Humidité | ✅ | |
| Container/Emballage | ⚠️ | Liste incomplète |
| Évolution notes (Visuel/Odeur/Goût/Effets) | ⚠️ | Partiellement |
| Intégration 4 types | ⚠️ | Fleur OK, autres partiels |

**Manquant Curing:**
- [ ] Opacité récipient (options complètes)
- [ ] Volume occupé
- [ ] Modification tests par cellule
- [ ] Intégration Hash/Concentré/Comestible complète

#### 🔬 HASH - Pipeline Séparation
| Composant | Statut | Notes |
|-----------|--------|-------|
| Section dans form Hash | ⚠️ | Existe mais basique |
| Méthodes séparation | ⚠️ | Liste partielle |
| Pipeline GitHub grid | ❌ | Non intégré |
| Purification methods | ⚠️ | Liste mais pas pipeline |

**Manquant Hash:**
- [ ] `SeparationPipelineSection.jsx` complet avec:
  - Méthode séparation (manuelle, tamisage, eau/glace, autre)
  - Nombre de passes
  - Température eau
  - Taille mailles
  - Type matière première
  - Qualité matière
  - Rendement estimé
  - Temps total
- [ ] Pipeline purification (18 méthodes listées dans CDC)
- [ ] Intégration grille GitHub

#### ⚗️ CONCENTRÉS - Pipeline Extraction
| Composant | Statut | Notes |
|-----------|--------|-------|
| Section dans form | ⚠️ | Basique |
| Méthodes extraction | ⚠️ | Liste partielle |
| Pipeline steps | ❌ | Non implémenté |
| Purification | ⚠️ | Réutilise Hash |

**Manquant Concentrés:**
- [ ] `ExtractionPipelineSection.jsx` complet avec:
  - 18+ méthodes extraction (EHO, BHO, PHO, Rosin, CO2, etc.)
  - Paramètres par méthode
  - Timeline extraction
- [ ] Pipeline purification spécifique

#### 🍪 COMESTIBLES - Pipeline Recette
| Composant | Statut | Notes |
|-----------|--------|-------|
| Section recette | ⚠️ | `RecipeSection.jsx` existe |
| Ingrédients | ⚠️ | Basique |
| Étapes préparation | ❌ | Non structuré |
| Actions prédéfinies | ❌ | Non implémenté |

**Manquant Comestibles:**
- [ ] `RecipePipelineSection.jsx` avec:
  - Choix produit standard/cannabique
  - Quantité + unité par ingrédient
  - Actions prédéfinies par étape
  - Timeline préparation

### 2.3 Backend Pipeline

```prisma
// ✅ Existant
model PipelineStep {
  pipelineId, pipelineType, stepIndex, stepName,
  intervalType, intervalValue, data (JSON), notes
}

model PipelineGithub {
  reviewId, reviewType, pipelineType,
  intervalType, startDate, endDate,
  curingType, curingDuration,
  cells (JSON), totalCells, filledCells, completionRate
}

// ⚠️ Routes existantes
- GET/POST /api/pipelines/:pipelineId
- POST /api/pipelines/:pipelineId/steps
- PUT/DELETE /api/pipelines/steps/:stepId
```

---

## 📤 3. SYSTÈME EXPORT

### 3.1 État Actuel

```
client/src/components/export/
├── ExportMaker.jsx           ✅ Principal (405 lignes)
├── ExportModal.jsx           ✅ Modal wrapper
├── DragDropExport.jsx        ✅ Drag-drop sections (294 lignes)
├── WatermarkEditor.jsx       ✅ Éditeur filigrane
└── TemplateRenderer.jsx      ✅ Rendu templates

server-new/routes/
└── export.js                 ✅ API export (365 lignes)

utils/
└── GIFExporter.js            ✅ Export GIF pipeline
```

### 3.2 Fonctionnalités Export

| Feature | Statut | Notes |
|---------|--------|-------|
| **Templates prédéfinis** | | |
| Compact | ✅ | Format 1:1 |
| Détaillé | ⚠️ | Partiellement |
| Complète | ❌ | Non implémenté |
| Influenceur | ⚠️ | 9:16 basique |
| Personnalisé | ✅ | Drag-drop |
| **Formats** | | |
| PNG | ✅ | html2canvas |
| JPEG | ✅ | |
| PDF | ⚠️ | Basique (pas jspdf) |
| SVG | ⚠️ | Placeholder |
| CSV | ❌ | Non implémenté |
| JSON | ❌ | Non implémenté |
| HTML | ❌ | Non implémenté |
| GIF Pipeline | ✅ | Fonctionnel |
| **Personnalisation** | | |
| Thème clair/sombre | ⚠️ | Partiellement |
| Couleurs | ⚠️ | Partiellement |
| Polices | ❌ | Non implémenté |
| Filigrane texte | ✅ | WatermarkEditor |
| Filigrane image | ✅ | WatermarkEditor |
| Filigrane forcé Amateur | ✅ | "Terpologie" |
| **Drag & Drop** | | |
| Sections disponibles par type | ✅ | AVAILABLE_SECTIONS |
| Réorganisation | ✅ | |
| Ajout/Suppression | ✅ | |
| **Permissions** | | |
| Export basic (Amateur) | ✅ | PNG/JPEG |
| Export premium (Producer) | ✅ | +SVG/PDF/CSV/JSON/HTML |
| Export influenceur | ✅ | +SVG haute qualité |

### 3.3 Manquant Export

```javascript
// TEMPLATES MANQUANTS
// 1. Template "Complète" - toutes les sections + pipelines
// 2. Template "Détaillé" - améliorer rendu

// FORMATS MANQUANTS
// CSV Export
const exportToCSV = (reviewData) => {
  // Convertir reviewData en CSV
  // Gérer arrays imbriqués (odeurs, goûts, effets)
};

// JSON Export
const exportToJSON = (reviewData) => {
  // Sérialiser cleanly
  // Inclure metadata
};

// HTML Export
const exportToHTML = (reviewData, template) => {
  // Générer HTML standalone
  // Inclure CSS inline
};

// PERSONNALISATION MANQUANTE
// 1. Sélecteur de polices (Google Fonts)
// 2. Palette couleurs complète
// 3. Agencement zones (grid layout editor)
```

---

## 📋 4. PLAN D'ACTION PRIORISÉ

### Sprint 1 (3 jours) - Pipeline Critique

**Jour 1: Pipeline Curing complet**
1. Finaliser `CuringPipelineSection.jsx` pour les 4 types
2. Ajouter tous les champs CDC (container, emballage, opacité, volume)
3. Intégrer modification tests par cellule

**Jour 2: Pipeline Hash/Concentré**
1. Créer `SeparationPipelineSection.jsx` complet
2. Créer `ExtractionPipelineSection.jsx` complet
3. Ajouter méthodes purification

**Jour 3: Pipeline Comestibles**
1. Refactoriser `RecipePipelineSection.jsx`
2. Système ingrédients + actions
3. Timeline préparation

### Sprint 2 (2 jours) - PhenoHunt

**Jour 4: PhenoHunt Core**
1. Onglet PhenoHunt dans sidebar
2. Projets PhenoHunt (catégorie)
3. Nomination phénotypes

**Jour 5: Intégration**
1. Intégrer PhenoHunt dans CreateFlowerReview
2. Sélecteur arbre pour génétiques
3. Export arbre en JSON/image

### Sprint 3 (2 jours) - Export

**Jour 6: Formats Export**
1. Implémenter CSV export
2. Implémenter JSON export
3. Implémenter HTML export

**Jour 7: Templates & UX**
1. Template "Complète" avec pipelines
2. Sélecteur polices
3. Améliorer prévisualisation

---

## 📁 5. FICHIERS À CRÉER/MODIFIER

### Nouveaux Fichiers
```
client/src/components/
├── genetics/
│   └── PhenoHuntProjectSelector.jsx     # Sélecteur projets PhenoHunt
├── pipelines/sections/
│   ├── SeparationPipelineSection.jsx    # Pipeline Hash complet
│   ├── ExtractionPipelineSection.jsx    # Pipeline Concentré complet
│   └── RecipePipelineSection.jsx        # Pipeline Comestible complet
└── export/
    ├── CSVExporter.js                   # Export CSV
    ├── JSONExporter.js                  # Export JSON
    └── HTMLExporter.js                  # Export HTML

data/
├── purification-methods.json            # 18 méthodes purification
├── extraction-methods.json              # 18+ méthodes extraction
└── recipe-actions.json                  # Actions prédéfinies recettes
```

### Fichiers à Modifier
```
client/src/
├── components/shared/orchard/SidebarHierarchique.jsx  # +Onglet PhenoHunt
├── pages/review/CreateFlowerReview/sections/Genetiques.jsx  # +Intégration PhenoHunt
├── pages/review/CreateHashReview/...    # +Pipeline sections
├── pages/review/CreateConcentrateReview/...  # +Pipeline sections
├── pages/review/CreateEdibleReview/...  # +Recipe pipeline
└── components/export/ExportMaker.jsx    # +Templates + Formats
```

---

## ✅ CHECKLIST FINALE

### PhenoHunt
- [ ] Onglet PhenoHunt dans sidebar bibliothèque
- [ ] Création projet PhenoHunt
- [ ] Nomination phénotype
- [ ] Intégration dans form Fleurs
- [ ] Export arbre JSON/Image
- [ ] Partage via code

### Pipeline Culture (Fleurs)
- [ ] Valider 84 champs CDC
- [ ] Mode journal de bord
- [ ] Export GIF fonctionnel

### Pipeline Curing (4 types)
- [ ] Container options complètes
- [ ] Emballage options complètes
- [ ] Opacité récipient
- [ ] Volume occupé
- [ ] Modification tests par cellule
- [ ] Intégration Hash/Concentré/Comestible

### Pipeline Hash
- [ ] Méthodes séparation complètes
- [ ] Paramètres par méthode
- [ ] Pipeline purification (18 méthodes)
- [ ] Grille GitHub intégrée

### Pipeline Concentré
- [ ] Méthodes extraction (18+)
- [ ] Paramètres par méthode
- [ ] Pipeline purification
- [ ] Grille GitHub intégrée

### Pipeline Comestible
- [ ] Système ingrédients amélioré
- [ ] Actions prédéfinies
- [ ] Timeline préparation
- [ ] Distinction produit standard/cannabique

### Export
- [ ] Template Complète
- [ ] Template Détaillé amélioré
- [ ] Export CSV
- [ ] Export JSON
- [ ] Export HTML
- [ ] Sélecteur polices
- [ ] Palette couleurs étendue

---

> **Note**: Ce document est généré automatiquement. Mettre à jour après chaque sprint.
