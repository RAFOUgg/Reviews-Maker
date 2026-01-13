# Plan de Restructuration - Reviews-Maker

**Date**: 13 Janvier 2026  
**Status**: En Planification  
**Objectif**: Réorganiser la structure du projet pour clarté et maintenabilité

---

## 🔍 Analyse Actuelle

### Structure Problématique

#### Frontend Components (client/src/components/)
**Problème**: Fichiers dispersés à la racine sans organisation claire
```
components/
├── [60+ fichiers JSX à la racine]  ← DÉSORGANISÉ
│   ├── CanevasPhenoHunt.jsx
│   ├── AdvancedSearchBar.jsx
│   ├── AuthCallback.jsx
│   ├── PipelineWithCultivars.jsx
│   ├── ... (trop nombreux)
│
├── pipeline/               ← Bien organisé
│   └── [40+ components]
│
├── export/                 ← Bien organisé
│   └── [components export]
│
├── reviews/                ← Bien organisé
│   └── [review sections]
│
├── auth/                   ← Bien organisé
├── genetic/                ← À optimiser
├── orchard/                ← À optimiser
└── [10+ autres dossiers]
```

**Impact**: Difficile à trouver les composants, mélange de niveaux d'abstraction

#### Frontend Pages (client/src/pages/)
**Problème**: Structure par type de produit mais avec fichiers inutilisés
```
pages/
├── [20+ pages à la racine]         ← Peu d'organisation
│   ├── CreateReviewPage.jsx        ← Pas utilisé (remplacé par CreateFlower/Hash/etc)
│   ├── EditReviewPage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── GalleryPage.jsx
│   └── ...
│
├── CreateFlowerReview/
│   └── sections/
│       ├── CulturePipelineSection.jsx
│       ├── CulturePipelineSection.jsx.backup  ← BACKUP À SUPPRIMER
│       ├── EffetsOptimized.jsx                ← Version "optimized" redondante?
│       └── [10+ sections]
│
├── CreateHashReview/
├── CreateConcentrateReview/
└── CreateEdibleReview/
```

**Impact**: Redondance, fichiers backup mélangés, logique dupliquée entre types

#### Backend (server-new/)
**Problème**: Structure basique mais manque de modules
```
server-new/
├── routes/         ← Basique, pas de séparation logique
├── prisma/         ← Bien
├── session-options.js
├── server.js
└── [peu de structure interne]
```

---

## 🎯 Structure Cible Proposée

### FRONTEND - Nouvelle Architecture

```
client/src/
├── pages/                          ← RÉORGANISÉ
│   ├── auth/                       ← Toutes les auth pages
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── ForgotPasswordPage.jsx
│   │   ├── ResetPasswordPage.jsx
│   │   ├── AgeVerificationPage.jsx
│   │   └── EmailVerificationPage.jsx
│   │
│   ├── reviews/                    ← Création/édition reviews
│   │   ├── CreateReviewPage.jsx    ← Router/wrapper
│   │   ├── EditReviewPage.jsx
│   │   ├── ReviewDetailPage.jsx
│   │   │
│   │   └── types/                  ← Par type de produit
│   │       ├── flower/
│   │       │   ├── index.jsx
│   │       │   └── sections/       ← Sections spécifiques fleur
│   │       ├── hash/
│   │       │   ├── index.jsx
│   │       │   └── sections/
│   │       ├── concentrate/
│   │       │   ├── index.jsx
│   │       │   └── sections/
│   │       └── edible/
│   │           ├── index.jsx
│   │           └── sections/
│   │
│   ├── gallery/                    ← Galerie public
│   │   ├── GalleryPage.jsx
│   │   └── GalleryDetailPage.jsx
│   │
│   ├── library/                    ← Bibliothèque utilisateur
│   │   ├── LibraryPage.jsx
│   │   └── TemplatesPage.jsx       ← Si besoin distinct
│   │
│   ├── genetics/                   ← Gestion génétiques
│   │   ├── GeneticsPage.jsx
│   │   └── PhenoHuntPage.jsx
│   │
│   ├── account/                    ← Account & profile
│   │   ├── ProfilePage.jsx
│   │   ├── SettingsPage.jsx
│   │   ├── PreferencesPage.jsx
│   │   ├── AccountSetupPage.jsx
│   │   └── AccountChoicePage.jsx
│   │
│   ├── admin/                      ← Admin (future)
│   │   ├── DashboardPage.jsx
│   │   └── ModerationPage.jsx
│   │
│   ├── marketing/                  ← Marketing pages
│   │   ├── HomePage.jsx
│   │   ├── PaymentPage.jsx
│   │   └── PricingPage.jsx
│   │
│   └── errors/                     ← Error pages
│       ├── NotFoundPage.jsx
│       └── ErrorPage.jsx
│
├── components/                     ← RÉORGANISÉ
│   │
│   ├── layout/                     ← Layout global
│   │   ├── Layout.jsx
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   │
│   ├── ui/                         ← Design system
│   │   ├── buttons/
│   │   │   ├── Button.jsx
│   │   │   ├── LiquidButton.jsx
│   │   │   └── IconButton.jsx
│   │   ├── forms/
│   │   │   ├── Input.jsx
│   │   │   ├── Select.jsx
│   │   │   ├── LiquidSelect.jsx
│   │   │   └── TextArea.jsx
│   │   ├── modals/
│   │   │   ├── Modal.jsx
│   │   │   └── LiquidModal.jsx
│   │   ├── cards/
│   │   │   ├── Card.jsx
│   │   │   └── LiquidCard.jsx
│   │   ├── alerts/
│   │   │   ├── Alert.jsx
│   │   │   └── LiquidAlert.jsx
│   │   ├── badges/
│   │   │   └── Badge.jsx
│   │   ├── loaders/
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProgressBar.jsx
│   │   ├── sliders/
│   │   │   ├── Slider.jsx
│   │   │   └── LiquidSlider.jsx
│   │   ├── utils/
│   │   │   ├── Tooltip.jsx
│   │   │   ├── Dropdown.jsx
│   │   │   └── Tabs.jsx
│   │   └── index.js                ← Re-exports
│   │
│   ├── auth/                       ← Auth components
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   ├── OAuthButtons.jsx
│   │   ├── AgeVerificationModal.jsx
│   │   ├── ProtectedRoute.jsx
│   │   └── index.js
│   │
│   ├── forms/                      ← Réusable forms
│   │   ├── ReviewForm.jsx          ← Form wrapper principal
│   │   ├── SearchForm.jsx
│   │   └── FilterForm.jsx
│   │
│   ├── reviews/                    ← Review components
│   │   ├── ReviewCard.jsx
│   │   ├── ReviewPreview.jsx
│   │   ├── ReviewFullDisplay.jsx
│   │   │
│   │   ├── sections/               ← Review sections
│   │   │   ├── GeneralInfoSection.jsx
│   │   │   ├── VisualSection.jsx
│   │   │   ├── OdorSection.jsx
│   │   │   ├── TasteSection.jsx
│   │   │   ├── TextureSection.jsx
│   │   │   ├── EffectsSection.jsx
│   │   │   ├── AnalyticsSection.jsx
│   │   │   └── index.js
│   │   │
│   │   ├── pipelines/              ← Pipeline sections
│   │   │   ├── CuringPipelineSection.jsx
│   │   │   ├── ExtractionPipelineSection.jsx
│   │   │   ├── RecipePipelineSection.jsx
│   │   │   ├── CulturePipelineSection.jsx
│   │   │   └── index.js
│   │   │
│   │   └── index.js
│   │
│   ├── pipeline/                   ← Pipeline system
│   │   ├── PipelineGitHubGrid.jsx  ← Core
│   │   ├── PipelineCell.jsx
│   │   ├── PipelineCellEditor.jsx
│   │   │
│   │   ├── ui/                     ← Pipeline UI
│   │   │   ├── CellContextMenu.jsx
│   │   │   ├── CellEmojiOverlay.jsx
│   │   │   ├── CellTooltip.jsx
│   │   │   └── PipelineContentsSidebar.jsx
│   │   │
│   │   ├── modals/                 ← Pipeline modals
│   │   │   ├── PipelineDataModal.jsx
│   │   │   ├── CellContextMenu.jsx  (ou dans ui/)
│   │   │   └── PresetConfigModal.jsx
│   │   │
│   │   ├── presets/                ← Preset system
│   │   │   ├── PresetSelector.jsx
│   │   │   ├── PresetGroupsManager.jsx
│   │   │   └── PresetsPanelCDC.jsx
│   │   │
│   │   ├── responsive/             ← Responsive variants
│   │   │   ├── MobilePipelineView.jsx
│   │   │   ├── MobilePipelineOptimized.jsx
│   │   │   └── ResponsivePipelineView.jsx
│   │   │
│   │   ├── graphs/                 ← Data visualization
│   │   │   ├── CultureEvolutionGraph.jsx
│   │   │   ├── CuringEvolutionGraph.jsx
│   │   │   ├── SeparationPassGraph.jsx
│   │   │   └── PurityGraph.jsx
│   │   │
│   │   ├── fields/                 ← Field renderers
│   │   │   ├── FieldRenderer.jsx
│   │   │   └── [field types]
│   │   │
│   │   ├── drag-drop/              ← Drag & drop system
│   │   │   ├── PipelineDragDropView.jsx
│   │   │   ├── CulturePipelineDragDrop.jsx
│   │   │   ├── CuringPipelineDragDrop.jsx
│   │   │   └── [other drag-drop]
│   │   │
│   │   └── index.js
│   │
│   ├── export/                     ← Export system
│   │   ├── ExportMaker.jsx         ← Core
│   │   ├── ExportPreview.jsx
│   │   │
│   │   ├── templates/              ← Export templates
│   │   │   ├── CompactTemplate.jsx
│   │   │   ├── DetailedTemplate.jsx
│   │   │   ├── CompleteTemplate.jsx
│   │   │   ├── InfluencerTemplate.jsx
│   │   │   └── CustomTemplate.jsx
│   │   │
│   │   ├── controls/               ← Export controls
│   │   │   ├── TemplateSelector.jsx
│   │   │   ├── LayoutCustomizer.jsx
│   │   │   ├── WatermarkEditor.jsx
│   │   │   └── ColorPaletteControls.jsx
│   │   │
│   │   └── index.js
│   │
│   ├── genetics/                   ← Genetics system
│   │   ├── GeneticsLibraryCanvas.jsx
│   │   ├── PhenoHuntPanel.jsx
│   │   ├── PhenoCodeGenerator.jsx
│   │   │
│   │   ├── genealogy/              ← Genealogy visualization
│   │   │   ├── GenealogyCanvas.jsx
│   │   │   └── CultivarNode.jsx
│   │   │
│   │   ├── modals/                 ← Genetics modals
│   │   │   ├── CultivarLibraryModal.jsx
│   │   │   └── AddCultivarModal.jsx
│   │   │
│   │   └── index.js
│   │
│   ├── gallery/                    ← Gallery components
│   │   ├── GalleryGrid.jsx
│   │   ├── ReviewCard.jsx
│   │   ├── SearchFilters.jsx
│   │   ├── SortControls.jsx
│   │   └── index.js
│   │
│   ├── legal/                      ← Legal components
│   │   ├── AgeVerification.jsx
│   │   ├── ConsentModal.jsx
│   │   ├── TermsModal.jsx
│   │   ├── DisclaimerRDR.jsx
│   │   └── index.js
│   │
│   ├── kyc/                        ← KYC components
│   │   ├── KYCUploader.jsx
│   │   └── DocumentList.jsx
│   │
│   ├── account/                    ← Account components
│   │   ├── AccountTypeSelector.jsx
│   │   ├── AccountSelector.jsx
│   │   ├── FeatureGate.jsx
│   │   ├── UserProfileDropdown.jsx
│   │   ├── ThemeModal.jsx
│   │   └── index.js
│   │
│   ├── home/                       ← Home page components
│   │   ├── HeroSection.jsx
│   │   ├── QuickStatsSection.jsx
│   │   ├── RecentReviewsSection.jsx
│   │   └── index.js
│   │
│   ├── shared/                     ← Shared/utility components
│   │   ├── ErrorBoundary.jsx
│   │   ├── EmptyState.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── ConfirmDialog.jsx
│   │   ├── ToastContainer.jsx
│   │   ├── CompletionBar.jsx
│   │   ├── SectionNavigator.jsx
│   │   ├── UpgradePrompt.jsx
│   │   ├── UsageQuotas.jsx
│   │   └── index.js
│   │
│   └── index.js                    ← Main exports
│
├── hooks/                          ← Custom hooks
│   ├── useAuth.js
│   ├── useReview.js
│   ├── useExport.js
│   ├── usePipeline.js
│   ├── useDebounce.js
│   ├── useFetch.js
│   ├── useLocalStorage.js
│   ├── usePrevious.js
│   ├── useAsync.js
│   └── index.js
│
├── store/                          ← Zustand stores
│   ├── authStore.js
│   ├── reviewStore.js
│   ├── exportStore.js
│   ├── uiStore.js
│   ├── geneticsStore.js
│   └── index.js
│
├── utils/                          ← Utilities
│   ├── api.js
│   ├── exportHelpers.js
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   ├── errorHandler.js
│   └── index.js
│
├── config/                         ← Configuration
│   ├── exportConfig.js
│   ├── apiConfig.js
│   ├── featureFlags.js
│   └── constants.js
│
├── data/                           ← Static data
│   ├── effectsCategories.js
│   ├── odorNotes.js
│   ├── tasteNotes.js
│   └── terpenes.json
│
├── locales/                        ← i18n
│   ├── fr.json
│   └── en.json
│
├── assets/                         ← Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── styles/                         ← Global styles
│   ├── index.css
│   ├── tailwind.css
│   └── animations.css
│
└── App.jsx                         ← Root component
```

### BACKEND - Nouvelle Architecture

```
server-new/
├── server.js                       ← Entry point
├── config.js                       ← Server config
│
├── routes/                         ← API endpoints
│   ├── index.js
│   ├── auth.js                     ← /auth
│   ├── reviews.js                  ← /reviews
│   ├── exports.js                  ← /exports
│   ├── genetics.js                 ← /genetics
│   ├── uploads.js                  ← /uploads
│   ├── gallery.js                  ← /gallery
│   ├── legal.js                    ← /legal
│   ├── users.js                    ← /users
│   └── admin.js                    ← /admin (future)
│
├── middleware/                     ← Express middleware
│   ├── auth.js
│   ├── errorHandler.js
│   ├── requestLogger.js
│   ├── rateLimit.js
│   ├── cors.js
│   ├── validation.js
│   └── index.js
│
├── controllers/                    ← Route handlers (optional)
│   ├── authController.js
│   ├── reviewController.js
│   ├── exportController.js
│   └── [other controllers]
│
├── services/                       ← Business logic
│   ├── authService.js
│   ├── reviewService.js
│   ├── exportService.js
│   ├── geneticsService.js
│   ├── uploadService.js
│   ├── emailService.js
│   └── [other services]
│
├── models/                         ← Data models (Prisma)
│   ├── User.js
│   ├── Review.js
│   ├── Export.js
│   └── [other models]
│
├── validators/                     ← Input validation
│   ├── schemas.js                  ← Joi schemas
│   ├── reviewValidator.js
│   ├── authValidator.js
│   └── [other validators]
│
├── utils/                          ← Utilities
│   ├── uploadHandler.js
│   ├── fileManager.js
│   ├── errorFormatter.js
│   ├── constants.js
│   └── logger.js
│
├── prisma/                         ← Database (Prisma)
│   ├── schema.prisma               ← Database schema
│   ├── seed.js                     ← Seed data
│   └── migrations/                 ← Database migrations
│
├── config/                         ← Config files
│   ├── database.js
│   ├── session.js
│   ├── passport.js
│   └── constants.js
│
├── constants.js                    ← App constants
├── session-options.js              ← Session config
│
└── package.json
```

---

## 📋 Plan d'Action Détaillé

### Phase 1: Préparation (Étape 1)
- [ ] Créer la nouvelle structure de dossiers
- [ ] Copier tous les fichiers à la nouvelle localisation
- [ ] Mettre à jour tous les imports

### Phase 2: Frontend (Étape 2-5)
- [ ] Réorganiser `/pages` par domaine (auth, reviews, gallery, account, etc.)
- [ ] Restructurer `/components` avec sous-dossiers logiques
- [ ] Regrouper les composants de pipeline
- [ ] Organiser les composants d'export
- [ ] Nettoyer les doublons (.backup, *Optimized)

### Phase 3: Backend (Étape 6)
- [ ] Ajouter `/controllers` si absent
- [ ] Ajouter `/services` pour logique métier
- [ ] Ajouter `/validators` pour schémas
- [ ] Créer `/config` pour centraliser configuration

### Phase 4: Validation (Étape 7)
- [ ] Tester toutes les imports
- [ ] Vérifier que aucune feature n'est cassée
- [ ] Commit & push

---

## 📊 Fichiers à Réorganiser

### À DÉPLACER (components/)

**À la racine → ui/buttons/**
- Button.jsx → LiquidButton.jsx

**À la racine → shared/**
- ErrorBoundary.jsx
- EmptyState.jsx
- ErrorMessage.jsx
- ConfirmDialog.jsx
- ToastContainer.jsx
- CompletionBar.jsx
- SectionNavigator.jsx
- UpgradePrompt.jsx
- UsageQuotas.jsx

**À la racine → auth/**
- AccountTypeSelector.jsx (duplicate?)

**À la racine → forms/**
- (À analyser)

**À la racine → pipeline/ (réorganiser)**
- PipelineWithCultivars.jsx

**À la racine → export/ (réorganiser)**
- (Check si bien organisé)

**À la racine → genetics/ (réorganiser)**
- CanevasPhenoHunt.jsx
- GenealogyCanvas.jsx

### À SUPPRIMER

**Fichiers backup**
- `client/src/pages/CreateFlowerReview/sections/CulturePipelineSection.jsx.backup`

**Fichiers "Optimized" redondants**
- `EffetsOptimized.jsx` (garder une version, supprimer duplicate)
- `OdeursOptimized.jsx`
- `GoutsOptimized.jsx`
- `VisuelTechniqueOptimized.jsx`
- `InfosGeneralesOptimized.jsx`

### À ANALYSER

**Pages potentiellement non utilisées**
- CreateReviewPage.jsx (remplacé par CreateFlower/Hash/etc?)
- EditReviewPage.jsx (vs CreateEditableReview/)

---

## 🔗 Impacts des Changements

### Imports à Mettre à Jour

**Pattern actuel**:
```javascript
import Component from '@/components/ComponentName'
```

**Pattern cible**:
```javascript
import Component from '@/components/[category]/ComponentName'
```

### Fichiers à Mettre à Jour
- Tous les fichiers qui importent depuis `/components` ou `/pages`
- Points d'entrée (App.jsx, index.jsx)
- Routes (router configuration)

---

## ✅ Checklist Validation

- [ ] Structure nouvelle créée
- [ ] Tous les fichiers déplacés
- [ ] Tous les imports mis à jour
- [ ] Pas de duplicate files
- [ ] Pas de fichiers .backup restants
- [ ] npm install fonctionne
- [ ] npm run dev démarre
- [ ] Pas d'erreurs console
- [ ] Toutes les routes accessibles
- [ ] Exports fonctionnent
- [ ] Authentification OK
- [ ] Pipelines OK
- [ ] Galerie OK
- [ ] Profil utilisateur OK

---

**Prochaine étape**: Confirmer ce plan et commencer Phase 1 (création structure)
