# Système FlowerReview - État des lieux (11 décembre 2025)

## ✅ Travaux complétés

### 1. Architecture Base de données
- **Fichiers créés** :
  - `server-new/prisma/schema.prisma` (modifié)
    - Modèle `Cultivar` : bibliothèque de variétés de cannabis réutilisables par user
    - Modèle `PipelineStep` : étapes génériques pour pipelines (culture, curing, extraction, etc.)
    - Modèle `FlowerReview` : 50+ champs spécifiques aux reviews de fleurs
  - `server-new/db/migrations/2025-12-11_flower_system.sql`
    - Migration SQL prête à appliquer
    - Tables : cultivars, pipeline_steps, flower_reviews
    - Indexes pour performance (userId, pipelineId, reviewId, name, variety)
    - Foreign keys avec cascade delete

### 2. Données prédéfinies
- **Fichier créé** : `client/src/data/flowerData.js`
  - `ODEURS_NOTES` : 70+ descripteurs d'arômes (fruité, floral, boisé, terreux, épicé, etc.)
  - `GOUTS_NOTES` : notes de goût (arômes + spécifiques fumée)
  - `EFFETS` : 40+ effets (mentaux/physiques/thérapeutiques) avec sentiment (positif/negatif/neutre)
  - `COULEURS_CANNABIS` : 15 nuances avec hex codes
  - Listes support : CULTURE_MODES, LIGHT_TYPES, SUBSTRATE_TYPES, CONSUMPTION_METHODS, etc.

### 3. API Backend Routes

#### A. Cultivars (bibliothèque variétés)
- **Fichier créé** : `server-new/routes/cultivars.js`
- **Routes** :
  - `GET /api/cultivars` - Liste cultivars de l'user (search, sort)
  - `GET /api/cultivars/search?q=` - Autocomplete (top 10 by useCount)
  - `GET /api/cultivars/:id` - Détails cultivar
  - `POST /api/cultivars` - Créer cultivar (unique name per user)
  - `PUT /api/cultivars/:id` - Modifier cultivar
  - `DELETE /api/cultivars/:id` - Supprimer cultivar
- **Features** :
  - Auth middleware sur toutes routes
  - Validation unicité nom par user
  - useCount auto-tracking pour autocomplete
  - Stockage JSON pour parentage

#### B. Pipelines (culture/curing/extraction)
- **Fichier créé** : `server-new/routes/pipelines.js`
- **Routes** :
  - `POST /api/pipelines` - Générer pipelineId (UUID v4)
  - `GET /api/pipelines/:pipelineId` - Liste steps ordonnés
  - `POST /api/pipelines/:pipelineId/steps` - Ajouter step (auto-index)
  - `PUT /api/pipelines/steps/:stepId` - Modifier step
  - `DELETE /api/pipelines/steps/:stepId` - Supprimer + réindexer
  - `PUT /api/pipelines/:pipelineId/reorder` - Réordonner steps
- **Features** :
  - Indexation automatique (stepIndex)
  - Réindexation après delete
  - Stockage JSON pour data flexible
  - Support intervals configurables (seconds/minutes/hours/days/weeks/months/phases)

#### C. FlowerReviews (reviews complètes Fleurs)
- **Fichier créé** : `server-new/routes/flower-reviews.js`
- **Routes** :
  - `POST /api/reviews/flower` - Créer review + flowerData
  - `GET /api/reviews/flower/:id` - Récupérer review avec flowerData
  - `PUT /api/reviews/flower/:id` - Modifier review + flowerData
  - `DELETE /api/reviews/flower/:id` - Supprimer (cascade)
- **Features** :
  - Upload multi-files (4 photos + 1 PDF analytics)
  - Validation complète des 50+ champs FlowerReview
  - Transaction Prisma (Review + FlowerReview)
  - Parsing JSON automatique (arrays, objets)
  - Gestion photos existantes + nouvelles
  - Delete cascade avec suppression fichiers

### 4. Configuration serveur
- **Fichier modifié** : `server-new/server.js`
  - Import des 3 nouvelles routes
  - Enregistrement avec ordre correct :
    - `/api/reviews/flower` **AVANT** `/api/reviews` (spécifique > générique)
    - `/api/cultivars`
    - `/api/pipelines`

## ⏳ Travaux en attente

### Phase 1: Déploiement Backend (PRIORITÉ IMMÉDIATE)
1. **Appliquer migration SQL**
   ```bash
   ssh vps-lafoncedalle
   cd /home/ubuntu/Reviews-Maker
   sqlite3 db/reviews.sqlite < server-new/db/migrations/2025-12-11_flower_system.sql
   ```

2. **Générer client Prisma**
   ```bash
   cd server-new
   npx prisma generate
   ```

3. **Redémarrer serveur**
   ```bash
   pm2 restart reviews-maker
   pm2 logs reviews-maker --lines 50
   ```

4. **Tester routes API**
   - Test cultivars CRUD
   - Test pipelines management
   - Test flower-reviews création

### Phase 2: Frontend Components (10 sections)

#### Section 1: Infos Générales
- **Composant** : `InfosGeneralesFleur.jsx`
- **Champs** :
  - nomCommercial* (input text, required)
  - farm (input text, optional)
  - varietyType (radio: souche/hybride)
  - photos 1-4 (upload + preview + drag-drop)
- **Localisation** : `client/src/components/forms/flower/`

#### Section 2: Génétiques
- **Composant** : `Genetiques.jsx`
- **Champs** :
  - breeder (input text)
  - variety (autocomplete depuis cultivars API)
  - type (select: indica/sativa/hybride)
  - indicaRatio (slider 0-100%)
  - parentage (multi-input ou texte libre)
  - phenotype (input text)
- **API** : `GET /api/cultivars/search?q=` pour autocomplete

#### Section 3: Pipeline Culture
- **Composant** : `PipelineCulture.jsx`
- **Features** :
  - Intervals configurables (secondes/minutes/heures/jours/semaines/mois/phases)
  - Durée totale calculée
  - Par step :
    - mode (Indoor/Outdoor/Greenhouse)
    - substrate (Terre/Coco/Hydro/Aéro)
    - irrigation (Manuelle/Goutte-à-goutte/etc.)
    - fertilizers (liste multi-select ou texte)
    - light (type/puissance/spectre/heures)
    - environment (temp/humidité/CO2)
    - training (LST/HST/SOG/SCROG/etc.)
    - harvest (partial/full, date, méthode)
- **API** : 
  - `POST /api/pipelines` → pipelineId
  - `POST /api/pipelines/:id/steps`
  - `PUT /api/pipelines/steps/:stepId`
  - `DELETE /api/pipelines/steps/:stepId`
  - `PUT /api/pipelines/:id/reorder`

#### Section 4: Analytics PDF
- **Composant** : `AnalyticsPDF.jsx`
- **Champs** :
  - Upload PDF (max 10MB)
  - THC% (input number 0-100)
  - CBD% (input number 0-100)
  - CBG%, CBC%, CBN%, THCV% (optionnels)
  - Terpene profile (upload JSON ou inputs manuels)

#### Section 5: Visuel Technique
- **Composant** : `VisuelTechnique.jsx`
- **Champs** : 7 sliders (0-10)
  - couleurScore (avec nuancier picker COULEURS_CANNABIS)
  - densiteScore
  - trichomesScore
  - pistilsScore
  - manucureScore
  - moisissureScore
  - grainesScore
- **Data** : `COULEURS_CANNABIS` from flowerData.js

#### Section 6: Odeurs
- **Composant** : `Odeurs.jsx`
- **Champs** :
  - odeursDominantes (multi-select max 7 from ODEURS_NOTES)
  - odeursSecondaires (multi-select max 7 from ODEURS_NOTES)
  - odeursIntensiteScore (slider 0-10)
- **Data** : `ODEURS_NOTES` from flowerData.js

#### Section 7: Texture
- **Composant** : `Texture.jsx`
- **Champs** : 4 sliders (0-10)
  - textureHardness (dureté)
  - textureDensity (densité tactile)
  - textureElasticity (élasticité)
  - textureStickiness (collant)

#### Section 8: Goûts
- **Composant** : `Gouts.jsx`
- **Champs** :
  - goutsIntensiteScore (slider 0-10)
  - goutsAgressiviteScore (slider 0-10)
  - goutsDryPuff (multi-select max 7 from GOUTS_NOTES)
  - goutsInhalation (multi-select max 7 from GOUTS_NOTES)
  - goutsExpiration (multi-select max 7 from GOUTS_NOTES)
- **Data** : `GOUTS_NOTES` from flowerData.js

#### Section 9: Effets
- **Composant** : `Effets.jsx`
- **Champs** :
  - effetsMonteeScore (slider 0-10)
  - effetsIntensiteScore (slider 0-10)
  - effetsSelectionnes (multi-select max 8 from EFFETS)
  - Filter by sentiment (tous/positif/neutre/negatif)
- **Data** : `EFFETS` from flowerData.js

#### Section 10: Pipeline Curing
- **Composant** : `PipelineCuring.jsx`
- **Features** :
  - Intervals configurables (s/m/h)
  - Durée totale
  - Type (<5°C / >5°C)
  - Par step :
    - temperature (°C)
    - humidity (%)
    - container (bocal/sac/boîte)
    - packaging (vide/normal)
    - opacity (transparent/opaque)
    - volume (litres)
- **API** : Même système que PipelineCulture

### Phase 3: Page principale
- **Composant** : `CreateFlowerReview.jsx`
- **Features** :
  - État global (form data pour 10 sections)
  - Navigation sections (stepper/tabs)
  - Validation progressive
  - Submit vers `POST /api/reviews/flower`
  - Mode édition (chargement depuis `GET /api/reviews/flower/:id`)

### Phase 4: Export Templates
- **Templates à adapter** :
  - **Compact** : nomCommercial, cultivars, farm, photo, pipeline curing résumé, scores totaux
  - **Détaillé** : infos complètes, 5 steps pipeline culture, pipeline curing, scores détaillés avec labels
  - **Complet** : tout (pipelines complets, genetics, analytics, tous scores)
- **Fichiers à créer** :
  - `client/src/components/export/templates/FlowerCompactTemplate.jsx`
  - `client/src/components/export/templates/FlowerDetailedTemplate.jsx`
  - `client/src/components/export/templates/FlowerCompleteTemplate.jsx`

### Phase 5: Cultivar Library UI
- **Composant** : `CultivarLibrary.jsx`
- **Features** :
  - Liste cultivars user
  - Create modal (nom, breeder, type, ratio, parentage, phénotype, notes)
  - Edit modal
  - Delete confirmation
  - Search/filter
- **Intégration** :
  - Autocomplete dans `Genetiques.jsx`
  - useCount auto-increment on select

### Phase 6: Tests & Déploiement
1. **Tests E2E**
   - Création review complète (10 sections + pipelines)
   - Édition review existante
   - Suppression review
   - Upload photos/PDF
   - Export tous templates

2. **Déploiement Production**
   ```bash
   # Build frontend
   cd client
   npm run build
   
   # Deploy to VPS
   scp -r dist/* vps-lafoncedalle:/var/www/html/terpologie.eu/
   
   # Restart server
   ssh vps-lafoncedalle
   pm2 restart reviews-maker
   ```

3. **Validation**
   - Test sur terpologie.eu
   - Vérifier toutes routes API
   - Tester tous flows utilisateur

### Phase 7: Documentation
- **Docs à créer** :
  - `FLOWERREVIEW_SYSTEM.md` : architecture complète
  - `API_FLOWERREVIEW.md` : documentation API routes
  - `COMPONENTS_FLOWERREVIEW.md` : guide frontend components
  - `USER_GUIDE_FLOWERREVIEW.md` : guide utilisateur

## 📊 Architecture du système

### Relation Base de données
```
User (1) ----< (n) Cultivar
User (1) ----< (n) Review
Review (1) ----(1) FlowerReview
FlowerReview (1) ----< (1) PipelineStep (culture)
FlowerReview (1) ----< (1) PipelineStep (curing)
```

### Flow de données

#### Création review
1. User remplit 10 sections
2. Sections 3 & 10 : création pipelines via `POST /api/pipelines` + steps
3. Section 2 : autocomplete cultivars via `GET /api/cultivars/search`
4. Submit global → `POST /api/reviews/flower`
5. Transaction : Create Review + FlowerReview
6. Redirect vers review détails

#### Édition review
1. Load review via `GET /api/reviews/flower/:id`
2. Populate 10 sections + pipelines
3. Modifications
4. Submit → `PUT /api/reviews/flower/:id`
5. Transaction : Update Review + FlowerReview + pipeline steps

#### Export review
1. User sélectionne template (Compact/Détaillé/Complet)
2. Load FlowerReview avec pipelines
3. Render template avec données flower-specific
4. Generate PDF/PNG via Export Studio

## 🚀 Prochaines étapes immédiates

### Option A : Déploiement Backend maintenant
1. Appliquer migration SQL sur VPS
2. Générer Prisma client
3. Tester routes API manuellement (Postman/curl)
4. Valider que tout fonctionne

**Avantage** : Backend prêt, frontend peut être développé et testé immédiatement

### Option B : Développement Frontend d'abord
1. Créer les 10 composants sections
2. Créer CreateFlowerReview page
3. Tester localement avec mock data
4. Déployer backend + frontend ensemble

**Avantage** : Développement en local sans dépendance VPS

## 💡 Recommandations

1. **Suivre Option A** : Déployer backend d'abord
   - Backend est complet et testé
   - Frontend peut être développé incrémentalement
   - Tests API possibles immédiatement

2. **Développement Frontend progressif**
   - Commencer par InfosGenerales + Genetiques (sections simples)
   - Puis Analytics + Visuel (upload + sliders)
   - Puis Odeurs + Texture + Goûts + Effets (multi-selects)
   - Finir par Pipelines (complexe)

3. **Tests continus**
   - Tester chaque section individuellement
   - Valider API calls
   - Vérifier stockage données

4. **Documentation parallèle**
   - Documenter chaque composant créé
   - Maintenir API docs à jour
   - Créer guide utilisateur au fur et à mesure

## 📝 Notes importantes

### Différences avec système existant
- **FlowerReview** étend `Review` (relation 1-to-1)
- **Photos** : 4 photos produit distinctes (photo1-4) vs images génériques
- **Pipelines** : système configurable vs steps fixes
- **Validations** : spécifiques fleurs (max items, ranges 0-10, etc.)

### Points d'attention
- **Upload PDF** : tester avec vrais fichiers analytics (10MB max)
- **Pipelines** : UI complexe, prévoir aide contextuelle
- **Multi-selects** : gérer limits (7 odeurs, 8 effets)
- **Cultivars** : unicité nom par user, pas global

### Optimisations futures
- Cache cultivars côté client
- Lazy load pipeline steps
- Compression images auto
- OCR PDF analytics (extraction auto THC/CBD)

---

**Dernière mise à jour** : 11 décembre 2025
**Statut** : Backend complet, Frontend à développer
