# 📚 PLAN LIBRARY SYSTÈME - ORGANISATION COMPLÈTE

**Date**: 22 janvier 2026  
**Scope**: Library - Système de sauvegarde, organisation et réutilisation de TOUS les contenus  
**Priority**: P1 - Fini quand Fleur v1 est fini

---

## 🎯 VISION

Library n'est PAS juste "reviews sauvegardées".  
C'est un **document store complet** où utilisateurs peuvent:

1. **Sauvegarder & organiser** reviews (tous types)
2. **Gérer génétiques** (cultivars, arbres généalogiques, phénotypes)
3. **Réutiliser données** (fiches techniques, substrats, engrais, équipement)
4. **Templates export** (configurations, presets, filigranes)
5. **Projets PhenoHunt** (gestion sélection génétique - Producteur only)

---

## 📁 STRUCTURE COMPLÈTE

### **SECTION 1: MES REVIEWS**
```
/library/reviews

Visualisation:
├─ Grid view (cards avec image principale)
├─ List view (tableau avec colonnes: nom, type, date, rating)
├─ Timeline view (par date de création)
└─ Map view (par localisation - si géolocalisation)

Filtres:
├─ Par type (Fleur, Hash, Concentré, Comestible, Mix)
├─ Par date (dernière semaine, mois, année, custom)
├─ Par rating (≥4★, ≥3★, etc.)
├─ Par visibilité (privé, amis, public)
├─ Par tag/keyword
└─ Search bar (recherche fulltext)

Actions:
├─ Ouvrir review (edit mode)
├─ Dupliquer review
├─ Exporter (via ExportMaker)
├─ Partager (link + réseaux sociaux)
├─ Archiver
├─ Supprimer (confirm)
└─ Marquer comme favori

Metadata affiché:
├─ Image principale
├─ Nom + Cultivar
├─ Type de produit (emoji)
├─ Rating (⭐⭐⭐⭐⭐)
├─ Date création
├─ Visibilité (🔒 private, 👥 friends, 🌍 public)
└─ Nombre exports
```

**Prisma Models**:
```prisma
model Review {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Meta
  productType String // fleur, hash, concentrate, edible
  title String
  rating Float @default(5)
  visibility String @default("private")
  tags String[] // array of tags
  notes String?
  
  // Data (JSON because varies by type)
  data Json
  
  // Stats
  viewCount Int @default(0)
  shareCount Int @default(0)
  exportCount Int @default(0)
  
  // Images
  images String[]
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  archivedAt DateTime?
}
```

---

### **SECTION 2: GÉNÉTIQUES & CULTIVARS**

#### **2A: Library Cultivars**
```
/library/cultivars

Visualisation:
├─ Cards avec photos (cultivar cover)
├─ List avec informations générales
└─ Grid taxonomique (type, breeder, origin)

Par cultivar, afficher:
├─ Informations de base
│   ├─ Nom officiel
│   ├─ Breeder / Créateur
│   ├─ Type (Indica / Sativa / Hybrid)
│   ├─ Origin / Région
│   └─ Description
├─ Génétique
│   ├─ Parents (parent 1, parent 2)
│   ├─ Généalogie (arbre)
│   ├─ Phénotypes documentés
│   └─ Clones / variations
├─ Statut
│   ├─ Personal library (propriété utilisateur)
│   ├─ Public library (searchable)
│   └─ Favorite (flag)
├─ Gallery photos
│   ├─ Buds (à la récolte)
│   ├─ Phénotypes (variants)
│   └─ User uploads
├─ Données associées
│   ├─ Reviews utilisant ce cultivar
│   ├─ Rendement moyen (Producteur)
│   ├─ Profil terpénique (si dispo)
│   └─ Effets moyens
└─ Actions
    ├─ Éditer
    ├─ Dupliquer
    ├─ Supprimer
    ├─ Voir généalogie
    └─ Voir toutes les reviews

Prisma Model:
model Cultivar {
  id String @id @default(cuid())
  userId String? // null = public library
  user User? @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name String
  breeder String?
  type String // Indica, Sativa, Hybrid
  origin String?
  description String?
  
  // Génétique
  parent1Id String?
  parent2Id String?
  parents Cultivar[] @relation("CultivarParents")
  children Cultivar[] @relation("CultivarParents")
  
  // Photos
  images String[]
  
  // Public library metadata
  isPublic Boolean @default(false)
  verifiedBy String? // admin who verified
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### **2B: Arbres Généalogiques**
```
/library/cultivars/:id/genealogy

Affichage:
├─ Arbre généalogique visuel
├─ Timeline génération (G1, G2, G3...)
├─ Phénotypes par génération
└─ Statistiques de transmission

Interactions:
├─ Click sur cultivar → voir détails
├─ Drag-drop pour ajouter parents
├─ Auto-layout (graphique)
└─ Zoom/pan controls

Données tracking:
├─ Nombre de générations
├─ Cultivars étudiés
├─ Traits transmis
└─ Success rate (%)
```

#### **2C: Projets PhenoHunt** (Producteur only)
```
/library/phenohunt

Chaque projet = gestion sélection génétique

Par projet:
├─ Nom + description
├─ Cultivar parent utilisé
├─ Canvas d'édition
│   ├─ Grille de phénotypes (like Github commit graph)
│   ├─ Données par phénotype (traits, photos)
│   ├─ Sélection (marqué comme "keeper"?)
│   └─ Rejet (marked as discard)
├─ Timeline
│   ├─ Générations complétées
│   ├─ Sélections actuelles
│   └─ Résultats partiels
├─ Traits tracking
│   ├─ Traits recherchés (check as found)
│   ├─ Traits indésirables (avoid)
│   └─ Traits émergents (new traits)
├─ Photos gallery
│   ├─ Par phénotype
│   ├─ Par étape (seed, veg, flower, final)
│   └─ Annotations
└─ Export
    ├─ Lineage export (JSON)
    ├─ Report PDF
    └─ Photo collection ZIP

Prisma Model:
model PhenoHuntProject {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name String
  description String?
  parentCultivarId String
  parentCultivar Cultivar @relation(fields: [parentCultivarId], references: [id])
  
  // Canvas data (JSON structure for pheno grid)
  canvasData Json
  
  // Traits tracking
  targetTraits String[]
  undesiredTraits String[]
  emergentTraits String[]
  
  // Status
  status String // active, completed, archived
  generation Int @default(1)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

### **SECTION 3: FICHES TECHNIQUES**

```
/library/technical-sheets

Organisation:
├─ Culture Setups (Fleurs)
│   ├─ Substrat presets
│   ├─ Engrais profiles
│   ├─ Lighting configs
│   ├─ Climate presets
│   ├─ Palissage templates
│   └─ General grow notes
├─ Extraction Setups (Hash/Concentrés)
│   ├─ Extraction methods
│   ├─ Purification chains
│   └─ Parameters presets
└─ Recipe Templates (Comestibles)
    ├─ Ingredient libraries
    ├─ Preparation steps
    └─ Dosage calculators

Par fiche, afficher:
├─ Nom + description
├─ Type (substrat, engrais, etc.)
├─ Contenu détaillé
├─ Réutilisabilité (click to use in review)
├─ Tagging
└─ Actions (edit, duplicate, delete)

Exemple - Substrat Preset:
{
  name: "BioBizz Light Mix 50L",
  type: "substrat",
  volume: 50,
  unit: "L",
  composition: [
    { ingredient: "Coco", percentage: 40 },
    { ingredient: "Perlite", percentage: 30 },
    { ingredient: "Vermiculite", percentage: 30 }
  ],
  brand: "BioBizz",
  cost: 15.99,
  supplier: "Local Hydro Store",
  notes: "Perfect for seedlings and veg stage"
}

Prisma Model:
model TechnicalSheet {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name String
  category String // substrat, engrais, lighting, extraction, recipe
  type String
  description String?
  
  // Content (JSON varies by category)
  content Json
  
  // Metadata
  tags String[]
  usageCount Int @default(0)
  lastUsedAt DateTime?
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

### **SECTION 4: TEMPLATES EXPORT & PRESETS**

```
/library/export-templates

Visualisation:
├─ Prédéfinis (lecture seule, utilisateurs tous types)
│   ├─ Compact (1:1)
│   ├─ Détaillé (multi-format)
│   ├─ Complète (all)
│   └─ Influenceur (9:16)
├─ Mes templates personnalisés (Producteur + Influenceur)
│   ├─ Custom layouts
│   ├─ Color schemes
│   ├─ Font configs
│   └─ Branding elements

Par template, afficher:
├─ Preview thumbnail
├─ Nom + description
├─ Formats supportés
├─ Compatibilité types produits
├─ Actions
│   ├─ Use (go to ExportMaker with this template)
│   ├─ Edit (Producteur only)
│   ├─ Duplicate
│   ├─ Preview fullscreen
│   └─ Delete (custom only)
└─ Quick presets (recently used)

Prisma Model: ExportTemplate (already in Account schema)
```

---

### **SECTION 5: FILIGRANES**

```
/library/watermarks (Producteur only)

Visualisation:
├─ Galerie des filigranes
├─ Preview avec différents backgrounds
└─ Usage stats (combien de fois utilisé)

Par filigrane:
├─ Preview
├─ Type (text, image, both)
├─ Settings
│   ├─ Position
│   ├─ Opacity
│   ├─ Scale
│   └─ Rotation
├─ Actions
│   ├─ Edit
│   ├─ Duplicate
│   ├─ Set as default
│   └─ Delete
└─ Usage (nombre d'exports)

Prisma Model: Watermark (already in Account schema)
```

---

### **SECTION 6: DONNÉES SAUVEGARDÉES (Auto-complete)**

```
/library/saved-data

Quick access pour remplissage rapide des reviews:

├─ 🌱 Cultivars Fréquents
│   ├─ Top 10 utilisés
│   ├─ Quick-add button
│   └─ View all cultivars
├─ 🌍 Substrats
│   ├─ Recent 5
│   ├─ Favorites
│   └─ Add new preset
├─ 🧪 Engrais
│   ├─ Recent 5
│   ├─ Favorites
│   └─ Add new profile
├─ 🔧 Équipement
│   ├─ Lampes
│   ├─ Ventilation
│   ├─ Autres
│   └─ Add new
├─ 📋 Fournisseurs
│   ├─ Contacts
│   ├─ Notes
│   └─ Edit
└─ 📍 Localités Fréquentes
    ├─ Grow locations
    ├─ Labs
    └─ Suppliers

Prisma Model:
model SavedDataItem {
  id String @id @default(cuid())
  userId String
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  category String // cultivar, substrat, engrais, equipment, supplier, location
  name String
  data Json
  
  usageCount Int @default(0)
  lastUsedAt DateTime?
  isFavorite Boolean @default(false)
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

### **SECTION 7: COMPANY DATA** (Producteur + Influenceur only)

```
/library/company

Centraliser données professionelles:

├─ Company Profile (déjà dans Account.company)
├─ Brand Assets
│   ├─ Logos
│   ├─ Color palette
│   ├─ Font family
│   └─ Style guidelines
├─ Contact Management
│   ├─ Employees
│   ├─ Partners
│   ├─ Suppliers
│   └─ Distributors
└─ Documentation
    ├─ Invoices (linked to Subscription)
    ├─ Contracts
    ├─ Certifications
    └─ Legal docs
```

---

## 🏗️ ARCHITECTURE TECHNIQUE

### **Database Schema (Prisma)**
```
User
├─ reviews: Review[]
├─ cultivars: Cultivar[]
├─ phenohuntProjects: PhenoHuntProject[]
├─ technicalSheets: TechnicalSheet[]
├─ exportTemplates: ExportTemplate[]
├─ watermarks: Watermark[]
├─ savedDataItems: SavedDataItem[]
└─ company: Company?

Review
├─ user: User
├─ productType: String
├─ data: Json (varies by type)
└─ images: String[]

Cultivar
├─ user: User? (null = public)
├─ parents: Cultivar[] (relationships)
├─ children: Cultivar[]
└─ images: String[]

PhenoHuntProject
├─ user: User
├─ parentCultivar: Cultivar
├─ canvasData: Json
└─ traits: String[]

... (others follow similar pattern)
```

### **File Structure**
```
client/src/pages/library/
├─ LibraryPage.jsx (main wrapper + navigation)
├─ LibraryLayout.jsx (sidebar + main area)
│
├─ sections/
│   ├─ ReviewsSection.jsx
│   ├─ CultivarsSection.jsx
│   ├─ PhenoHuntSection.jsx
│   ├─ TechnicalSheetsSection.jsx
│   ├─ ExportTemplatesSection.jsx
│   ├─ WatermarksSection.jsx
│   ├─ SavedDataSection.jsx
│   └─ CompanyDataSection.jsx
│
├─ components/
│   ├─ ReviewCard.jsx
│   ├─ CultivarCard.jsx
│   ├─ GenealogyTree.jsx
│   ├─ PhenoHuntCanvas.jsx
│   ├─ TechnicalSheetForm.jsx
│   ├─ SavedDataGrid.jsx
│   └─ ...
│
├─ hooks/
│   ├─ useLibrary.js (main data fetching)
│   ├─ useCultivars.js
│   ├─ useReviews.js
│   ├─ useSavedData.js
│   └─ ...
│
└─ styles/
    └─ library.css
```

---

## 📊 API ENDPOINTS NEEDED

**Backend** (`server-new/routes/library.js`):

```javascript
// Reviews
GET    /api/library/reviews (with filters)
GET    /api/library/reviews/:id
POST   /api/library/reviews (create new)
PATCH  /api/library/reviews/:id (update)
DELETE /api/library/reviews/:id (delete)
POST   /api/library/reviews/:id/archive (archive)

// Cultivars
GET    /api/library/cultivars (user's + public)
GET    /api/library/cultivars/:id
POST   /api/library/cultivars (create)
PATCH  /api/library/cultivars/:id (update)
DELETE /api/library/cultivars/:id
GET    /api/library/cultivars/:id/genealogy (tree data)

// PhenoHunt (Producteur only)
GET    /api/library/phenohunt
GET    /api/library/phenohunt/:id
POST   /api/library/phenohunt (create project)
PATCH  /api/library/phenohunt/:id (update canvas)
PATCH  /api/library/phenohunt/:id/traits (update traits)
DELETE /api/library/phenohunt/:id
POST   /api/library/phenohunt/:id/export (generate report)

// Technical Sheets
GET    /api/library/technical-sheets (with filters)
GET    /api/library/technical-sheets/:id
POST   /api/library/technical-sheets (create)
PATCH  /api/library/technical-sheets/:id (update)
DELETE /api/library/technical-sheets/:id

// Saved Data
GET    /api/library/saved-data/:category (cultivars, substrats, etc.)
POST   /api/library/saved-data (add item)
PATCH  /api/library/saved-data/:id (update)
DELETE /api/library/saved-data/:id
```

---

## ✅ IMPLEMENTATION ROADMAP

### **Phase 1** (When Fleur v1 done): Basic Structure
- [x] Create LibraryPage + navigation
- [x] Reviews section (list/grid/timeline views)
- [x] Cultivars section (basic cards)
- [x] Saved data section (quick access)
- [x] Basic filtering & search
- [x] Database schema (all models)

### **Phase 2** (After Phase 1): Advanced Features
- [ ] Genealogy tree visualization
- [ ] PhenoHunt project canvas editor
- [ ] Technical sheets full editor
- [ ] Export templates management
- [ ] Watermarks management (Producteur only)
- [ ] Company data management (Producteur only)

### **Phase 3** (Polish & Optimization)
- [ ] Import/Export (JSON, CSV)
- [ ] Versioning & undo/redo
- [ ] Collaborative sharing (with other users)
- [ ] Analytics (usage stats)
- [ ] Full-text search across all sections

---

## 🎯 SUCCESS CRITERIA

✅ Users can:
- Save all review types
- Search & filter reviews
- Create & organize cultivars with genealogy
- Create & manage PhenoHunt projects (Producteur)
- Build reusable technical sheets
- Save export configurations
- Access auto-complete data for faster review creation
- Export all library data (backup)

Performance:
- Load initial section in <1s
- Search results in <500ms
- Filtering in real-time
- Canvas rendering smooth (60fps)

---
