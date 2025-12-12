# 🗺️ ROADMAP - Implémentation Système Principal Reviews-Maker

**Dernière mise à jour**: 12 décembre 2025  
**Objectif**: Compléter le système principal avant d'ajouter les pages entreprises

---

## ✅ **PHASE 1 - DÉJÀ IMPLÉMENTÉ**

### Backend
- ✅ Routes `/api/reviews/flower`, `/hash`, `/concentrate`, `/edible`
- ✅ Modèle Prisma `Review` avec champs multi-types
- ✅ Upload images (multer) + validation
- ✅ Middleware auth (requireAuth)

### Frontend
- ✅ `CreateFlowerReview.jsx` (11 sections, 2180 lignes)
- ✅ Composants Timeline (`CulturePipelineTimeline`, `CuringMaturationTimeline`)
- ✅ OrchardPanel (génétique/génotype)
- ✅ Formulaire structuré avec navigation sections

### Fonctionnalités Partielles
- ⚠️ **PipeLine** : Timeline visuelle existe mais manque:
  - Configuration trame (jours/semaines/phases)
  - Saisie données par case (style GitHub commits)
  - Export GIF évolution culture : introduction dans export animé
- ⚠️ **Export Maker** : Pas encore implémenté
- ⚠️ **Généalogie** : OrchardPanel existe mais incomplet (drag&drop, relations parents/enfants)
- ⚠️ **Bibliothèque** : Route `/api/library` existe mais interface incomplète
- ⚠️ **Stats** : Route `/api/stats` existe mais dashboard manquant

---

## 🔧 **PHASE 2 - COMPLÉTER LES 4 TYPES DE REVIEWS**

### Priorité 1 : Hash Reviews
**Fichier backend**: `server-new/routes/hash-reviews.js`  
**Page frontend**: `client/src/pages/CreateHashReview.jsx` (À créer)

**Champs spécifiques** (selon cahier des charges):
- Pipeline Séparation (méthode, nombre de passes, température eau, mailles, rendement)
- Pipeline Purification (chromatographie, winterisation, filtration, etc.)
- Visuel: Couleur/transparence nuancier (noir → blanc)
- Curing: Type recipient, emballage primaire, opacité, volume

**Actions**:
1. Dupliquer `CreateFlowerReview.jsx` → `CreateHashReview.jsx`
2. Adapter les 11 sections pour Hash (remplacer Culture → Séparation)
3. Créer composants:
   - `SeparationPipelineTimeline.jsx`
   - `PurificationSteps.jsx`
4. Valider backend hash-reviews.js (ajouter champs manquants)

### Priorité 2 : Concentrés Reviews
**Page frontend**: `client/src/pages/CreateConcentrateReview.jsx` (À créer)

**Champs spécifiques**:
- Pipeline Extraction (méthode: EHO, BHO, PHO, Rosin, CO₂, etc.)
- Paramètres par méthode (pression, température, solvant, temps)
- Pipeline Purification (winterisation, décarboxylation, filtration)

**Actions**:
1. Créer `CreateConcentrateReview.jsx`
2. Composants:
   - `ExtractionPipelineTimeline.jsx`
   - `PurificationConfigPanel.jsx`

### Priorité 3 : Comestibles Reviews
**Page frontend**: `client/src/pages/CreateEdibleReview.jsx` (À créer)

**Champs spécifiques**:
- Pipeline Recette (ingrédients standard + cannabiniques)
- Étapes préparation assignables par ingrédient
- Dosage THC/CBD par portion
- Durée effets (5-15min, 15-30min, ..., 24h+)

**Actions**:
1. Créer `CreateEdibleReview.jsx`
2. Composants:
   - `RecipePipelineBuilder.jsx` (drag & drop ingrédients)
   - `DosageCalculator.jsx`

---

## 🌟 **PHASE 3 - SYSTÈME PIPELINE COMPLET**

### Vision Finale
Reprendre le principe visuel GitHub commits : **365 cases = 365 jours**

**Fonctionnalités**:
- Choix trame:
  - **Jours**: Date début/fin obligatoire, 1 case = 1 jour
  - **Semaines**: Semaine début obligatoire, 1 case = S1, S2, ... Sn
  - **Phases**: 12 phases prédéfinies (ex: Germination, Croissance, Floraison, Séchage, Curing)
- Données par case:
  - Icône d'événement (arrosage, taille, transplantation, etc.)
  - Valeurs numériques (température, humidité, pH, EC)
  - Photos horodatées
  - Notes textuelles courtes
- Export GIF: Animation temporelle des photos case par case

**Composants à créer**:
1. `PipelineCanvas.jsx` (grille cases style GitHub)
2. `CaseEditor.jsx` (modal édition données case)
3. `TimelineExporter.jsx` (génération GIF)
4. `PhaseSelector.jsx` (12 phases prédéfinies par type produit)

### Intégration
- `CulturePipelineTimeline` → Remplacer par PipelineCanvas
- `ExtractionPipelineTimeline` → Utiliser PipelineCanvas
- `CuringMaturationTimeline` → Utiliser PipelineCanvas

---

## 🎨 **PHASE 4 - EXPORT MAKER**

### Interface Bandeau Latéral Gauche

**Onglets**:
1. **Templates** (prédéfinis + personnalisés utilisateur)
2. **Personnalisation Gratuite**:
   - Thème clair/sombre
   - Palette couleurs (textes, bordures, fonds)
   - Polices (Google Fonts)
   - Filigrane (upload image, position, opacité)
   - Effets images (bordure, colorimétrie, flou)

### Canvas Central (Producteur/Influenceur)

**Modes**:
- **Compact** (1:1, éléments fixes)
- **Détaillé** (1:1/16:9/9:16/A4, plus de sections)
- **Complet** (tous les champs)
- **Influenceur** (9:16 vertical, optimisé stories Instagram/TikTok)
- **Personnalisé** (drag & drop zones)

**Fonctionnalités**:
- Drag & drop sections depuis liste vers zones canvas
- Réorganisation sections
- Pagination (max 9 pages pour 1:1 et 16:9)
- Preview temps réel
- Export: PNG/JPEG/SVG/PDF (300dpi), CSV, JSON, HTML

**Composants à créer**:
1. `ExportStudioSidebar.jsx` (bandeau gauche)
2. `TemplateGallery.jsx` (liste templates)
3. `ExportCanvas.jsx` (canvas drag & drop)
4. `SectionDragItem.jsx` (élément draggable)
5. `ExportFormatSelector.jsx` (1:1, 16:9, 9:16, A4)
6. `ExportQualitySettings.jsx` (DPI, compression)
7. `WatermarkUploader.jsx` (filigrane personnalisé)

### Sauvegarde Templates
- Table Prisma `ExportTemplate`:
  ```prisma
  model ExportTemplate {
    id        String   @id @default(uuid())
    userId    String
    user      User     @relation(fields: [userId], references: [id])
    name      String
    format    String   // "1:1", "16:9", "9:16", "A4"
    mode      String   // "compact", "detailed", "full", "influencer", "custom"
    layout    String   // JSON: { sections: [...], positions: {...} }
    settings  String   // JSON: { colors, fonts, watermark, etc. }
    shared    Boolean  @default(false) // Partagé publiquement
    shareCode String?  @unique // Code partage (6-8 chars)
    createdAt DateTime @default(now())
    updatedAt DateTime @updatedAt
  }
  ```

---

## 🌳 **PHASE 5 - SYSTÈME GÉNÉALOGIE CULTIVARS**

### Interface Actuelle
`OrchardPanel.jsx` semble exister mais incomplet.

### Fonctionnalités Requises
1. **Bibliothèque Cultivars** (bandeau gauche):
   - Liste cultivars enregistrés (filtre, recherche)
   - Bouton "+ Nouveau Cultivar"
   - Informations cultivar (nom, breeder, type, photo)

2. **Canvas Généalogie** (droite):
   - Drag & drop cultivars depuis bibliothèque
   - Création relations parent → enfant (lignes connecteurs)
   - Nodes interactifs (double-clic édition)
   - Zoom/Pan (react-zoom-pan-pinch)
   - Export canvas (PNG/SVG)

3. **Gestion PhenoHunt**:
   - Projets PhenoHunt (ex: "F2 OG Kush x Gelato #33")
   - Sélections phénotypes (#1, #2, #3, etc.)
   - Notes phénotypes (vigueur, rendement, arômes, résistance)
   - Association review → phénotype

### Composants à créer
1. `CultivarLibrarySidebar.jsx`
2. `GenealogyCanvas.jsx` (react-flow ou canvas custom)
3. `CultivarNode.jsx` (node généalogique)
4. `PhenoHuntProjectManager.jsx`
5. `PhenotypeSelector.jsx`

### Routes Backend
```javascript
// server-new/routes/cultivars.js (déjà existe?)
GET    /api/cultivars              // Liste cultivars user
POST   /api/cultivars              // Créer cultivar
PUT    /api/cultivars/:id          // Modifier cultivar
DELETE /api/cultivars/:id          // Supprimer cultivar

GET    /api/cultivars/genealogy    // Arbre généalogie
POST   /api/cultivars/genealogy    // Sauvegarder arbre
GET    /api/cultivars/phenohunt    // Projets PhenoHunt
POST   /api/cultivars/phenohunt    // Créer projet
```

---

## 📚 **PHASE 6 - BIBLIOTHÈQUE PERSONNELLE**

### Sections Existantes (à compléter)
**Routes**: `server-new/routes/library.js` (existe)

**Fonctionnalités**:
1. **Reviews Sauvegardées**:
   - ✅ Liste reviews (privées/publiques)
   - ❌ Édition review
   - ❌ Duplication review
   - ❌ Partage review (génération lien public)
   - ❌ Gestion visibilité (privé/public/amis)

2. **Templates Export**:
   - ❌ Liste templates créés
   - ❌ Édition/Suppression/Duplication
   - ❌ Partage templates (code unique)

3. **Filigranes**:
   - ❌ Upload filigranes personnalisés
   - ❌ Gestion bibliothèque filigranes

4. **Données Récurrentes** (autocomplete):
   - ❌ Systèmes de culture (Indoor/Outdoor/Greenhouse, lampes, substrat)
   - ❌ Substrats fréquents (Coco, Terre, Hydro)
   - ❌ Engrais fréquents (marque, gamme, dosages)
   - ❌ Matériel fréquent (lampes, ventilation, etc.)
   - ❌ Sauvegarde profils complets (ex: "Setup Indoor 600W HPS Biobizz")

### Page Frontend
`client/src/pages/LibraryPage.jsx`

**Onglets**:
1. Mes Reviews
2. Templates Export
3. Filigranes
4. Données Récurrentes

---

## 🌍 **PHASE 7 - GALERIE PUBLIQUE**

**Route**: `server-new/routes/gallery.js` (existe)  
**Page**: `client/src/pages/GalleryPage.jsx`

### Fonctionnalités
1. **Navigation**:
   - Filtres: Type produit (Fleur/Hash/Concentré/Comestible)
   - Tri: Popularité (likes), Note moyenne, Récence, Top hebdo/mensuel/annuel
   - Recherche avancée (cultivar, farm, effets, terpènes, THC%, etc.)

2. **Interactions Sociales**:
   - ❤️ Like review
   - 💬 Commenter review
   - 🔗 Partager review (lien, réseaux sociaux)
   - 🚩 Signaler contenu inapproprié

3. **Classements**:
   - Top 10 hebdo (réinitialisé chaque lundi)
   - Top 10 mensuel
   - Top 10 annuel
   - Hall of Fame (tout temps)

### Backend
```javascript
// Prisma models déjà existants
model ReviewLike
model ReviewComment
model ReviewView

// Routes à compléter
GET    /api/gallery                // Liste reviews publiques (filtres)
GET    /api/gallery/:id            // Détail review publique
POST   /api/gallery/:id/like       // Liker review
DELETE /api/gallery/:id/like       // Unliker
POST   /api/gallery/:id/comment    // Commenter
GET    /api/gallery/:id/comments   // Liste commentaires
POST   /api/gallery/:id/report     // Signaler
GET    /api/gallery/rankings/week  // Top hebdo
GET    /api/gallery/rankings/month // Top mensuel
GET    /api/gallery/rankings/year  // Top annuel
```

---

## 📊 **PHASE 8 - STATISTIQUES UTILISATEUR**

**Route**: `server-new/routes/stats.js` (existe)  
**Page**: `client/src/pages/StatsPage.jsx`

### Statistiques Générales (Tous Comptes)
- 📝 Nombre reviews créées (total, par type)
- 📤 Nombre exports réalisés (total, par format)
- 📊 Types produits recensés (graphique camembert)
- ⭐ Notes moyennes données (par type produit)
- 👀 Vues totales reviews publiques
- ❤️ Likes reçus total
- 💬 Commentaires reçus total

### Statistiques Producteurs (Avancées)
- 🌱 Nombre cultures complétées
- ⚖️ Rendements moyens (g/m², g/plant)
- 🌍 Cultivars différents cultivés
- 🔬 Taux THC/CBD moyens
- 📈 Évolution qualité (notes) dans le temps
- 🏆 Meilleur phénotype (par note)
- 📊 Répartition méthodes culture (Indoor/Outdoor/Greenhouse)

### Statistiques Influenceurs (Avancées)
- 👁️ Vues totales reviews publiques
- 📈 Évolution audience (vues/semaine)
- ⭐ Note moyenne reçue
- 💬 Engagement (commentaires/review)
- 🔗 Partages totaux
- 🏆 Reviews les plus populaires (top 5)

### Composants
1. `StatsOverview.jsx` (KPIs généraux)
2. `ReviewsChart.jsx` (graphique évolution)
3. `TopProductsTable.jsx` (classement produits)
4. `EngagementMetrics.jsx` (likes, commentaires, partages)
5. `CultivationStats.jsx` (producteurs uniquement)

---

## 🎯 **PRIORITÉS IMMÉDIATES**

### Sprint 1 (Cette semaine)
1. ✅ **Corriger erreur DB kycStatus** (FAIT)
2. 🔄 **Créer CreateHashReview.jsx** (dupliquer Flower)
3. 🔄 **Créer CreateConcentrateReview.jsx**
4. 🔄 **Créer CreateEdibleReview.jsx**
5. 🔄 **Valider backend routes (hash/concentrate/edible)**

### Sprint 2 (Semaine prochaine)
1. 🔄 **PipelineCanvas.jsx** (système GitHub-like)
2. 🔄 **Export Studio** (templates + drag & drop)
3. 🔄 **Généalogie Cultivars** (canvas + relations)

### Sprint 3
1. 🔄 **Bibliothèque complète** (templates, filigranes, données)
2. 🔄 **Galerie publique** (filtres, interactions sociales)
3. 🔄 **Dashboard Statistiques** (graphiques, KPIs)

---

## 📝 **NOTES TECHNIQUES**

### Dépendances Nécessaires
```json
{
  "react-flow-renderer": "^10.x", // Pour généalogie cultivars
  "react-zoom-pan-pinch": "^3.x", // Zoom canvas
  "html2canvas": "^1.x", // Export PNG (déjà installé)
  "jspdf": "^2.x", // Export PDF
  "canvas-to-blob": "^1.x", // Conversion canvas → blob
  "gifshot": "^0.4.x" // Création GIF timeline
}
```

### Conventions Code
- Tous les formulaires suivent la structure 11 sections de CreateFlowerReview
- Chaque type review a son fichier backend dédié (`*-reviews.js`)
- Composants Timeline réutilisables (`*PipelineTimeline.jsx`)
- Validation côté backend + frontend
- Upload via multer (10MB max)

---

**🚀 Objectif Final**: Système complet et fonctionnel des 4 types de reviews avec PipeLines, Export Maker, Généalogie, Bibliothèque, Galerie Publique et Statistiques avancées avant d'ajouter les pages entreprises.
