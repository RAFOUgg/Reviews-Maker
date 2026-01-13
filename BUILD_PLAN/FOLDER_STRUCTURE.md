# Structure des Dossiers - Reviews-Maker

## 📁 Arborescence Complète

```
Reviews-Maker/
├── PLAN/                          ← Documentation (ce dossier)
│   ├── README.md                 # Index documentation
│   ├── ARCHITECTURE.md           # Architecture système
│   ├── STACK.md                  # Technologies utilisées
│   ├── FOLDER_STRUCTURE.md       # Structure dossiers (ce fichier)
│   ├── FEATURES.md               # Fonctionnalités
│   ├── GETTING_STARTED.md        # Guide démarrage
│   ├── DEVELOPMENT.md            # Workflow développement
│   ├── DEPLOYMENT.md             # Déploiement VPS
│   ├── API.md                    # Documentation API
│   ├── TESTING.md                # Stratégie tests
│   ├── SECURITY.md               # Sécurité
│   └── CONVENTIONS.md            # Standards de code
│
├── client/                        ← Frontend React + Vite
│   ├── index.html                # Entry point HTML
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js         # TailwindCSS config
│   ├── postcss.config.js          # PostCSS config
│   ├── package.json              # Dependencies frontend
│   ├── package-lock.json         # Lock file
│   │
│   ├── src/
│   │   ├── main.jsx              # React root
│   │   ├── App.jsx               # Router setup
│   │   ├── index.css             # Global styles
│   │   │
│   │   ├── pages/                # Page components
│   │   │   ├── HomePage.jsx      # Landing/dashboard
│   │   │   ├── CreateReviewPage.jsx
│   │   │   ├── EditReviewPage.jsx
│   │   │   ├── CreateFlowerReview/
│   │   │   │   ├── index.jsx     # Main component
│   │   │   │   └── sections/     # Review sections
│   │   │   │       ├── PipelineCulture.jsx
│   │   │   │       ├── PipelineCuring.jsx
│   │   │   │       └── [10+ autres sections]
│   │   │   ├── CreateHashReview/
│   │   │   │   └── sections/     # Hash-specific sections
│   │   │   ├── CreateConcentrateReview/
│   │   │   │   └── sections/
│   │   │   ├── CreateEditableReview/
│   │   │   │   └── sections/     # Editable review template
│   │   │   ├── GalleryPage.jsx   # Public gallery
│   │   │   ├── LibraryPage.jsx   # User library
│   │   │   ├── GeneticsManagementPage.jsx
│   │   │   ├── PhenoHuntPage.jsx
│   │   │   ├── ProfilePage.jsx   # User profile
│   │   │   ├── SettingsPage.jsx
│   │   │   ├── StatsPage.jsx     # User statistics
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── AgeVerificationPage.jsx
│   │   │   ├── ForgotPasswordPage.jsx
│   │   │   ├── ResetPasswordPage.jsx
│   │   │   └── ReviewDetailPage.jsx
│   │   │
│   │   ├── components/           # Reusable components
│   │   │   ├── pipeline/         # Pipeline system
│   │   │   │   ├── PipelineGitHubGrid.jsx        # Main component
│   │   │   │   ├── PipelineCell.jsx
│   │   │   │   ├── PipelineCellEditor.jsx
│   │   │   │   ├── CellContextMenu.jsx
│   │   │   │   ├── CellEmojiOverlay.jsx
│   │   │   │   ├── PipelineContentsSidebar.jsx
│   │   │   │   ├── MobilePipelineView.jsx
│   │   │   │   ├── MobilePipelineOptimized.jsx
│   │   │   │   ├── ResponsivePipelineView.jsx
│   │   │   │   ├── PipelineDataModal.jsx
│   │   │   │   ├── ItemContextMenu.jsx
│   │   │   │   ├── CellContextMenu.jsx
│   │   │   │   ├── PresetConfigModal.jsx
│   │   │   │   ├── PresetGroupsManager.jsx
│   │   │   │   ├── PresetSelector.jsx
│   │   │   │   ├── PresetsPanelCDC.jsx
│   │   │   │   ├── MassAssignModal.jsx
│   │   │   │   ├── MultiContentAssignModal.jsx
│   │   │   │   ├── CultureCSVExporter.js
│   │   │   │   ├── CulturePipelineDragDrop.jsx
│   │   │   │   ├── CuringPipelineDragDrop.jsx
│   │   │   │   ├── SeparationPipelineDragDrop.jsx
│   │   │   │   ├── PurificationPipelineDragDrop.jsx
│   │   │   │   ├── CultureEvolutionGraph.jsx
│   │   │   │   ├── CuringEvolutionGraph.jsx
│   │   │   │   ├── SeparationPassGraph.jsx
│   │   │   │   ├── PurityGraph.jsx
│   │   │   │   ├── fields/      # Field renderers
│   │   │   │   │   ├── FieldRenderer.jsx
│   │   │   │   │   └── [field types]
│   │   │   │   └── [40+ pipeline components]
│   │   │   │
│   │   │   ├── export/          # Export system
│   │   │   │   ├── ExportMaker.jsx         # Main export interface
│   │   │   │   ├── TemplateSelector.jsx
│   │   │   │   ├── WatermarkEditor.jsx
│   │   │   │   ├── templates/
│   │   │   │   │   ├── FlowerCompactTemplate.jsx
│   │   │   │   │   ├── FlowerDetailedTemplate.jsx
│   │   │   │   │   ├── FlowerCompleteTemplate.jsx
│   │   │   │   │   ├── InfluencerTemplate.jsx
│   │   │   │   │   └── [custom templates]
│   │   │   │   └── [export-related components]
│   │   │   │
│   │   │   ├── reviews/         # Review components
│   │   │   │   ├── sections/    # Review sections
│   │   │   │   │   ├── CuringPipelineSection.jsx
│   │   │   │   │   ├── ExtractionPipelineSection.jsx
│   │   │   │   │   ├── RecipePipelineSection.jsx
│   │   │   │   │   ├── GeneralInfoSection.jsx
│   │   │   │   │   ├── GeneticsSection.jsx
│   │   │   │   │   ├── VisualSection.jsx
│   │   │   │   │   ├── OdorSection.jsx
│   │   │   │   │   ├── TasteSection.jsx
│   │   │   │   │   ├── TextureSection.jsx
│   │   │   │   │   ├── EffectsSection.jsx
│   │   │   │   │   ├── AnalyticsSection.jsx
│   │   │   │   │   └── [15+ autres sections]
│   │   │   │   └── ReviewForm.jsx
│   │   │   │
│   │   │   ├── genetics/        # Genetics management
│   │   │   │   ├── GeneticsLibraryCanvas.jsx
│   │   │   │   ├── PhenoHuntPanel.jsx
│   │   │   │   ├── PhenoCodeGenerator.jsx
│   │   │   │   └── [genetics components]
│   │   │   │
│   │   │   ├── auth/            # Auth components
│   │   │   │   ├── LoginForm.jsx
│   │   │   │   ├── RegisterForm.jsx
│   │   │   │   ├── OAuthButtons.jsx
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   │
│   │   │   ├── legal/           # Legal components
│   │   │   │   ├── AgeVerification.jsx
│   │   │   │   ├── ConsentModal.jsx
│   │   │   │   ├── TermsModal.jsx
│   │   │   │   └── DisclaimerRDR.jsx
│   │   │   │
│   │   │   ├── kyc/             # KYC components
│   │   │   │   └── KYCUploader.jsx
│   │   │   │
│   │   │   ├── ui/              # UI components
│   │   │   │   ├── LiquidGlass.jsx         # Design system
│   │   │   │   ├── MultiSelectPills.jsx
│   │   │   │   ├── SegmentedControl.jsx
│   │   │   │   ├── AromaWheelPicker.jsx
│   │   │   │   ├── Tooltip.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Select.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   └── [20+ UI components]
│   │   │   │
│   │   │   ├── account/         # Account management
│   │   │   │   ├── AccountTypeSelector.jsx
│   │   │   │   ├── AccountSelector.jsx
│   │   │   │   ├── FeatureGate.jsx
│   │   │   │   ├── ThemeModal.jsx
│   │   │   │   └── [account components]
│   │   │   │
│   │   │   ├── analytics/       # Analytics
│   │   │   │   ├── TerpeneManualInput.jsx
│   │   │   │   └── [analytics components]
│   │   │   │
│   │   │   ├── home/            # Home page components
│   │   │   │   ├── QuickStatsSection.jsx
│   │   │   │   ├── RecentReviewsSection.jsx
│   │   │   │   └── [home components]
│   │   │   │
│   │   │   ├── orchard/         # Orchard/Export builder
│   │   │   │   ├── OrchardPanel.jsx
│   │   │   │   ├── LayoutCustomizer.jsx
│   │   │   │   ├── ContentPanel.jsx
│   │   │   │   ├── PreviewPane.jsx
│   │   │   │   ├── ExportModal.jsx
│   │   │   │   ├── controls/    # Control panels
│   │   │   │   │   ├── ColorPaletteControls.jsx
│   │   │   │   │   ├── TypographyControls.jsx
│   │   │   │   │   ├── ImageBrandingControls.jsx
│   │   │   │   │   └── ContentModuleControls.jsx
│   │   │   │   ├── renderers/   # Custom renderers
│   │   │   │   │   ├── TagCloud.jsx
│   │   │   │   │   └── TerpeneBar.jsx
│   │   │   │   └── templates/   # Template layouts
│   │   │   │       ├── DetailedCardTemplate.jsx
│   │   │   │       └── SocialStoryTemplate.jsx
│   │   │   │
│   │   │   ├── Layout.jsx        # Main layout
│   │   │   ├── Header.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── UpgradePrompt.jsx
│   │   │   └── [10+ other global components]
│   │   │
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useAuth.js       # Auth hook
│   │   │   ├── useReview.js     # Review management
│   │   │   ├── useExport.js     # Export functionality
│   │   │   ├── usePipeline.js   # Pipeline logic
│   │   │   ├── useDebounce.js   # Debouncing
│   │   │   ├── useFetch.js      # Data fetching
│   │   │   └── [10+ custom hooks]
│   │   │
│   │   ├── store/               # Zustand stores
│   │   │   ├── authStore.js     # Authentication
│   │   │   ├── reviewStore.js   # Reviews management
│   │   │   ├── exportStore.js   # Export settings
│   │   │   ├── uiStore.js       # UI state
│   │   │   └── [other stores]
│   │   │
│   │   ├── utils/               # Utilities
│   │   │   ├── api.js           # API client
│   │   │   ├── exportHelpers.js # Export functions
│   │   │   ├── validators.js    # Validation functions
│   │   │   ├── formatters.js    # Data formatting
│   │   │   ├── orchardHelpers.js
│   │   │   ├── GIFExporter.js   # GIF export
│   │   │   └── [15+ utility files]
│   │   │
│   │   ├── config/              # Configuration
│   │   │   ├── exportConfig.js  # Export settings
│   │   │   ├── apiConfig.js     # API configuration
│   │   │   ├── featureFlags.js  # Feature toggles
│   │   │   └── constants.js     # App constants
│   │   │
│   │   ├── data/                # Static data
│   │   │   ├── effectsCategories.js
│   │   │   ├── odorNotes.js
│   │   │   ├── tasteNotes.js
│   │   │   └── [lookup data]
│   │   │
│   │   ├── locales/             # i18n translations
│   │   │   ├── fr.json          # French
│   │   │   └── en.json          # English
│   │   │
│   │   └── assets/              # Static assets
│   │       ├── images/
│   │       ├── icons/
│   │       └── fonts/
│   │
│   ├── public/                  # Static files (root served)
│   │   └── favicon.ico
│   │
│   └── node_modules/            # Dependencies (auto-generated)
│
├── server-new/                   ← Backend Node.js + Express
│   ├── server.js                # Entry point
│   ├── package.json             # Dependencies backend
│   ├── package-lock.json        # Lock file
│   ├── .env                     # Environment variables
│   ├── .env.example             # Template .env
│   │
│   ├── routes/                  # API endpoints
│   │   ├── index.js             # Router setup
│   │   ├── auth.js              # Auth routes
│   │   ├── reviews.js           # Review CRUD
│   │   ├── exports.js           # Export routes
│   │   ├── genetics.js          # Genetics routes
│   │   ├── uploads.js           # File uploads
│   │   ├── gallery.js           # Gallery/public
│   │   ├── legal.js             # Legal (terms, age verify)
│   │   └── [other routes]
│   │
│   ├── middleware/              # Express middleware
│   │   ├── auth.js              # Auth middleware
│   │   ├── errorHandler.js      # Error handling
│   │   ├── requestLogger.js     # Logging
│   │   ├── rateLimit.js         # Rate limiting
│   │   └── validation.js        # Data validation
│   │
│   ├── controllers/             # Business logic (optional)
│   │   ├── reviewController.js
│   │   ├── authController.js
│   │   └── [other controllers]
│   │
│   ├── models/                  # Prisma models location
│   │   └── (see prisma/schema.prisma)
│   │
│   ├── services/                # Business logic
│   │   ├── authService.js       # Auth logic
│   │   ├── reviewService.js     # Review logic
│   │   ├── exportService.js     # Export generation
│   │   └── [other services]
│   │
│   ├── utils/                   # Backend utilities
│   │   ├── uploadHandler.js     # Upload logic
│   │   ├── validators.js        # Validation schemas
│   │   ├── emailSender.js       # Email logic
│   │   └── [utility functions]
│   │
│   ├── prisma/                  # Database ORM
│   │   ├── schema.prisma        # Database schema
│   │   ├── seed-templates.js    # Seed data
│   │   └── migrations/          # Database migrations
│   │       └── [migration files]
│   │
│   ├── session-options.js       # Session configuration
│   ├── config.js                # Server configuration
│   ├── constants.js             # App constants
│   │
│   └── node_modules/            # Dependencies (auto-generated)
│
├── data/                         ← Static data (JSON)
│   ├── aromas.json              # Aroma/terpene list
│   ├── effects.json             # Effects list
│   ├── tastes.json              # Taste notes
│   ├── terpenes.json            # Terpene data
│   └── [lookup data]
│
├── db/                          ← Database & uploads
│   ├── reviews.sqlite           # SQLite database
│   ├── reviews.sqlite-shm       # WAL file
│   ├── reviews.sqlite-wal       # WAL file
│   ├── review_images/           # Review images
│   │   └── [review-specific folders]
│   ├── kyc_documents/           # KYC uploads
│   │   └── [user KYC files]
│   └── backups/                 # Database backups
│       └── [backup files]
│
├── scripts/                     ← Utility scripts
│   ├── diagnostics.sh           # System diagnostics
│   ├── diagnostic-console.js    # Console diagnostics
│   ├── deploy.sh                # Deploy script
│   ├── deploy-vps.sh            # VPS deploy
│   └── [other scripts]
│
├── .github/                     ← GitHub configuration
│   ├── instructions/
│   │   ├── vps.instructions.md  # VPS guidelines
│   │   └── [other instructions]
│   ├── copilot-instructions.md  # Copilot guidelines
│   └── workflows/               # GitHub Actions (future)
│
├── .vscode/                     ← VS Code settings
│   └── settings.json
│
├── .gitignore                   # Git ignore rules
├── .env.example                 # Environment template
├── README.md                    # Main README
├── CLEANUP.md                   # Cleanup report
├── MVP_BETA_READY.txt           # MVP status
├── PROJECT_STRUCTURE.md         # Project overview
├── ecosystem.config.cjs         # PM2 configuration
├── nginx-terpologie.conf        # Nginx config (old)
├── nginx-reviews-maker-ssl.conf # Nginx config (current)
├── deploy.sh                    # Deploy script
├── deploy-vps.sh                # VPS deploy script
├── package.json                 # Root package (if monorepo)
│
└── node_modules/                # Root dependencies (if used)
```

---

## 📊 Dossiers Clés

### `/client/src/pages/`
**Rôle**: Pages principales de l'application
- Routes principales (Create, Edit, Gallery, Library)
- Chaque type de produit a sa propre structure

### `/client/src/components/`
**Rôle**: Composants réutilisables
- **pipeline/**: Système de pipeline avec 40+ composants
- **export/**: Système d'export avec templates
- **reviews/**: Sections de review (visual, odors, taste, effects, etc.)
- **genetics/**: Gestion des génétiques
- **ui/**: Composants UI (design system)
- **auth/**: Authentification
- **orchard/**: Builder d'export personnalisé

### `/client/src/store/`
**Rôle**: State management global (Zustand)
- authStore: User, authentication
- reviewStore: Reviews data
- exportStore: Export settings
- uiStore: UI preferences

### `/client/src/utils/`
**Rôle**: Fonctions utilitaires
- API calls
- Export helpers
- Validation
- Formatting

### `/server-new/routes/`
**Rôle**: API endpoints
- `/auth`: Authentication
- `/reviews`: CRUD reviews
- `/exports`: Export management
- `/genetics`: Genetics system
- `/uploads`: File uploads
- `/gallery`: Public gallery

### `/server-new/prisma/`
**Rôle**: Database (Prisma ORM)
- `schema.prisma`: Database schema definition
- `migrations/`: Database changes tracking
- `seed-templates.js`: Initial data

### `/data/`
**Rôle**: Données statiques (lookups)
- `aromas.json`: Terpenes/aromas
- `effects.json`: Effects list
- `tastes.json`: Taste notes
- `terpenes.json`: Detailed terpene data

### `/db/`
**Rôle**: Données persisted
- `reviews.sqlite`: SQLite database
- `review_images/`: Review image uploads
- `kyc_documents/`: User document uploads
- `backups/`: Database backups

---

## 🔄 File Organization Principles

### Frontend
```
pages/        → Entry points (one per route)
components/   → Reusable (used in 2+ places)
hooks/        → Custom React hooks
store/        → Global state (Zustand)
utils/        → Helper functions
config/       → Configuration
data/         → Static data
```

### Backend
```
routes/       → API endpoints
middleware/   → Express middleware
services/     → Business logic
utils/        → Helper functions
prisma/       → Database definitions
```

---

## 📝 Naming Conventions

### Files
```
PascalCase.jsx   for React components
camelCase.js     for utilities/helpers
snake_case.json  for data files
UPPER_CASE.md    for documentation
```

### Folders
```
kebab-case/      for feature folders
components/      pluralized for collections
```

---

## 🚀 Key Paths

| Path | Purpose |
|------|---------|
| `client/src/pages/CreateFlowerReview/` | Create flower reviews |
| `client/src/components/pipeline/` | Pipeline UI system |
| `client/src/components/export/` | Export system |
| `server-new/prisma/schema.prisma` | Database schema |
| `server-new/routes/` | API endpoints |
| `data/*.json` | Lookup data |
| `.github/` | GitHub config |
| `PLAN/` | Documentation |

---

**Dernière mise à jour**: 13 Jan 2026
