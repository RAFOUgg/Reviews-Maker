# Architecture Système - Reviews-Maker

## 🏗️ Vue d'Ensemble Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT (React + Vite)                     │
├─────────────────────────────────────────────────────────────┤
│  Pages                  Components                 State      │
│  ├─ CreateReview ──┐   ├─ ReviewForm           Zustand Store │
│  ├─ EditReview  ───┼──→├─ PipelineGitHubGrid  ├─ Reviews    │
│  ├─ Gallery    ─────┘   ├─ ExportMaker         ├─ User       │
│  ├─ Library           │  ├─ GeneticsCanvas     └─ Auth       │
│  └─ Profile           └─ UI Components                       │
└──────────────┬─────────────────────────────────────────────┘
               │ HTTP/REST
               ↓
┌─────────────────────────────────────────────────────────────┐
│                 SERVER (Express + Node.js)                   │
├─────────────────────────────────────────────────────────────┤
│  Routes                 Middleware             Database      │
│  ├─ /auth              ├─ Passport.js         SQLite3       │
│  ├─ /reviews           ├─ Session (httpOnly)  Prisma ORM    │
│  ├─ /exports           ├─ CORS                ├─ Reviews    │
│  ├─ /genetics          ├─ Rate Limit          ├─ Users      │
│  ├─ /uploads           └─ Error Handler       └─ Exports    │
│  └─ /api/*                                                   │
└──────────────┬─────────────────────────────────────────────┘
               │ File Uploads
               ↓
┌─────────────────────────────────────────────────────────────┐
│               STORAGE & SERVICES                             │
├─────────────────────────────────────────────────────────────┤
│  ├─ db/review_images/ - Review images                       │
│  ├─ db/kyc_documents/ - KYC uploads                         │
│  ├─ data/*.json - Static lookups                            │
│  └─ Exports - PNG/PDF/SVG files                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 Flux de Données Principal

### Création d'une Review

```mermaid
User Input
    ↓
[ReviewForm Component]
    ├─ Validation locale (TailwindCSS UI)
    ├─ Images upload (Multer middleware)
    └─ Zustand state update
    ↓
[API POST /api/reviews]
    ├─ Express middleware (auth, validate)
    ├─ Prisma ORM (database insert)
    └─ Response avec review ID
    ↓
[Client state update]
    └─ Redirect vers ExportMaker
```

### Export d'une Review

```
User clicks "Export"
    ↓
[ExportMaker Component]
    ├─ Select template (Compact/Détaillé/Complète)
    ├─ Configure layout
    └─ Choose format
    ↓
[Canvas Rendering]
    ├─ html-to-image (DOM → Canvas)
    ├─ jspdf (Canvas → PDF)
    └─ jszip (Multiple files → ZIP)
    ↓
[Download/Share]
    ├─ Save locally
    └─ Share to socials (Twitter/Instagram)
```

### Pipeline Timeline

```
User defines frame (jours/semaines/phases/mois)
    ↓
[PipelineGitHubGrid Component]
    ├─ Generate grid cells based on frame
    ├─ Each cell = data entry point
    └─ Drag & drop support
    ↓
User enters data for each cell
    ├─ Notes (500 chars)
    ├─ Images
    ├─ Measurements (temp, humidity, etc.)
    └─ Custom fields
    ↓
[Data Stored in Review]
    └─ pipelineGithub object in database
```

---

## 📦 Modules Principaux

### Frontend

#### Pages Core
- **CreateReviewPage**: Point d'entrée création
- **EditReviewPage**: Modification review existante
- **GalleryPage**: Affichage galerie publique
- **LibraryPage**: Bibliothèque personnelle
- **ProfilePage**: Profil utilisateur

#### Components Réutilisables
```
components/
├─ pipeline/
│  ├─ PipelineGitHubGrid.jsx (Principal)
│  ├─ PipelineCell.jsx
│  ├─ CellContextMenu.jsx
│  └─ [10+ composants support]
│
├─ export/
│  ├─ ExportMaker.jsx (Principal)
│  ├─ TemplateSelector.jsx
│  └─ [5+ templates]
│
├─ reviews/sections/
│  ├─ CuringPipelineSection.jsx
│  ├─ ExtractionPipelineSection.jsx
│  ├─ RecipePipelineSection.jsx
│  ├─ VisualSection.jsx
│  ├─ OdorSection.jsx
│  ├─ TasteSection.jsx
│  ├─ EffectsSection.jsx
│  └─ [10+ autres sections]
│
├─ genetics/
│  ├─ GeneticsLibraryCanvas.jsx
│  ├─ PhenoHuntPanel.jsx
│  └─ [genetics management]
│
├─ auth/
│  ├─ LoginForm.jsx
│  ├─ RegisterForm.jsx
│  └─ OAuthButtons.jsx
│
└─ ui/
   ├─ LiquidGlass.jsx (Design system)
   ├─ MultiSelectPills.jsx
   ├─ SegmentedControl.jsx
   └─ [15+ UI components]
```

#### State Management (Zustand)
```javascript
// Structure des stores
useStore = {
  // Auth
  user: { id, email, tier, ... },
  isAuthenticated: boolean,
  
  // Reviews
  reviews: Review[],
  currentReview: Review,
  
  // UI State
  darkMode: boolean,
  selectedTemplate: string,
  
  // Actions
  login(), logout(), createReview(), ...
}
```

### Backend

#### Routes API
```
/api/auth/
  POST   /register         - Créer compte
  POST   /login            - Connexion
  POST   /logout           - Déconnexion
  POST   /oauth/discord    - Discord OAuth
  GET    /verify           - Vérifier session

/api/reviews/
  GET    /                 - Lister reviews
  POST   /                 - Créer review
  GET    /:id              - Détail review
  PUT    /:id              - Modifier review
  DELETE /:id              - Supprimer review
  GET    /:id/export       - Générer export

/api/exports/
  GET    /                 - Lister exports
  POST   /                 - Créer nouvel export
  DELETE /:id              - Supprimer export

/api/genetics/
  GET    /                 - Lister cultivars
  POST   /                 - Créer cultivar
  GET    /:id/tree         - Arbre généalogique

/api/uploads/
  POST   /image            - Upload image
  POST   /document         - Upload document KYC

/api/gallery/
  GET    /                 - Reviews publiques
  POST   /:id/like         - Liker review
  POST   /:id/comment      - Commenter
```

#### Middleware
```javascript
// Ordre d'exécution
app.use(cors());
app.use(express.json());
app.use(session());                    // Sessions
app.use(passport.initialize());         // Authentication
app.use(passport.session());
app.use(checkAuthentication);           // Custom auth check
app.use(rateLimit);                    // Rate limiting
app.use(requestLogger);                // Logging
app.use('/api', apiRoutes);            // API routes
app.use(errorHandler);                 // Error handling
```

#### Database Schema (Prisma)
```prisma
model User {
  id              String
  email           String      @unique
  passwordHash    String?
  discordId       String?
  tier            String      // 'amateur', 'producteur', 'influenceur'
  reviews         Review[]
  exports         Export[]
  cultivars       Cultivar[]
  createdAt       DateTime
}

model Review {
  id              String
  userId          String
  user            User        @relation(fields: [userId])
  type            String      // 'flower', 'hash', 'concentrate', 'edible'
  data            Json        // Contenu complet (sections, pipelines, etc)
  isPublic        Boolean
  likes           Int
  comments        Comment[]
  exports         Export[]
  createdAt       DateTime
  updatedAt       DateTime
}

model Export {
  id              String
  reviewId        String
  review          Review      @relation(fields: [reviewId])
  template        String
  format          String      // 'png', 'pdf', 'svg', etc
  fileUrl         String
  createdAt       DateTime
}

model Cultivar {
  id              String
  userId          String?
  user            User?       @relation(fields: [userId])
  name            String
  breeder         String?
  genetics        Json        // Lineage info
  isPublic        Boolean
}

model Comment {
  id              String
  reviewId        String
  review          Review      @relation(fields: [reviewId])
  userId          String
  user            User        @relation(fields: [userId])
  text            String
  createdAt       DateTime
}
```

---

## 🔐 Sécurité & Authentification

### Flux Authentication

```
Login Page
  ↓
[POST /api/auth/login]
  ├─ Validate email/password
  ├─ Passport.LocalStrategy
  ├─ Generate session token
  └─ Set httpOnly cookie
  ↓
[Session Middleware]
  ├─ Verify token on each request
  ├─ Attach user to req.user
  └─ Auto-redirect si non-auth
  ↓
Protected Routes
  └─ Check req.isAuthenticated()
```

### Niveaux d'Accès
```
Anonymous User
  ├─ Voir galerie publique
  ├─ Voir reviews publiques
  └─ Pas: créer, modifier, exporter

Authenticated User (Amateur)
  ├─ Créer 3 reviews max
  ├─ Voir templates prédéfinis
  ├─ Exporter en PNG/PDF basic
  └─ Pas: personnaliser, pipelines avancées

Producteur (Payant)
  ├─ Reviews illimités
  ├─ Templates personnalisés
  ├─ Pipelines complètes
  ├─ Exports multi-formats (SVG, JSON, CSV)
  └─ Genetics management

Influenceur (Payant)
  ├─ Focus sur exports qualité
  ├─ Format 9:16 optimisé
  ├─ Partage réseaux sociaux
  └─ Analytics basiques
```

---

## 🎨 Frontend Component Hierarchy

```
App.jsx (Router setup)
  │
  ├─ AuthLayout
  │   ├─ LoginPage
  │   ├─ RegisterPage
  │   └─ AgeVerificationModal
  │
  ├─ MainLayout (protected)
  │   ├─ Header (Navigation)
  │   ├─ Sidebar (Menu)
  │   │
  │   └─ Pages
  │       ├─ HomePage
  │       │   └─ QuickStatsSection
  │       │
  │       ├─ CreateReviewPage
  │       │   └─ ReviewForm
  │       │       ├─ GeneralInfoSection
  │       │       ├─ VisualsSection
  │       │       ├─ OdorSection
  │       │       ├─ TasteSection
  │       │       ├─ EffectsSection
  │       │       └─ PipelineGitHubGrid (multiple)
  │       │
  │       ├─ ExportMaker
  │       │   ├─ TemplateSelector
  │       │   ├─ LayoutCustomizer
  │       │   └─ ExportPreview
  │       │
  │       ├─ GalleryPage
  │       │   ├─ SearchFilters
  │       │   ├─ ReviewCard (list)
  │       │   └─ ReviewDetailModal
  │       │
  │       ├─ LibraryPage
  │       │   ├─ ReviewsList
  │       │   └─ TemplatesList
  │       │
  │       └─ GeneticsManagementPage
  │           ├─ GeneticsLibraryCanvas
  │           ├─ PhenoHuntPanel
  │           └─ CultivarList
```

---

## 📊 Data Flow Patterns

### Pattern 1: Form Submission
```javascript
// Component
const [formData, setFormData] = useState();

const handleSubmit = async () => {
  // 1. Validate locally
  if (!validate(formData)) return;
  
  // 2. POST to API
  const response = await fetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(formData)
  });
  
  // 3. Update store
  if (response.ok) {
    useStore.addReview(response.data);
    navigate('/library');
  }
}
```

### Pattern 2: Real-time Grid Updates
```javascript
// PipelineGitHubGrid
const handleCellChange = (cellIndex, data) => {
  // 1. Update local grid state
  const newGrid = [...gridData];
  newGrid[cellIndex] = { ...newGrid[cellIndex], ...data };
  setGridData(newGrid);
  
  // 2. Propagate to parent
  onChange?.({ pipelineGithub: newGrid });
  
  // 3. Parent (ReviewForm) updates Zustand
  useStore.updateCurrentReview({ pipelineGithub: newGrid });
  
  // 4. Auto-save via debounce
  debouncedSave();
}
```

### Pattern 3: File Upload
```javascript
// Upload component
const handleFileUpload = async (file) => {
  // 1. Validate file
  if (!isValidType(file)) return;
  
  // 2. Create FormData
  const formData = new FormData();
  formData.append('file', file);
  
  // 3. POST with progress
  const response = await fetch('/api/uploads/image', {
    method: 'POST',
    body: formData
  });
  
  // 4. Update state with URL
  const { fileUrl } = response.data;
  setImage(fileUrl);
}
```

---

## 🔄 Cycle de Vie Review

```
1. CREATION
   ├─ User selects product type
   ├─ Empty form initialized
   └─ Stored in Zustand (temp)

2. EDITING
   ├─ User fills sections progressively
   ├─ Auto-save toasts (debounced)
   ├─ Images uploaded to server
   └─ Pipeline data structured

3. VALIDATION
   ├─ Check required fields
   ├─ Validate data types
   └─ Ensure images present

4. SAVING
   ├─ POST/PUT to /api/reviews
   ├─ Prisma stores in database
   └─ Return with ID

5. EXPORTING
   ├─ Select template + format
   ├─ Render to canvas
   ├─ Generate file (PNG/PDF/etc)
   └─ Download or share

6. PUBLISHING
   ├─ Set isPublic = true
   ├─ Appears in gallery
   ├─ Visible to other users
   └─ Receivable likes/comments

7. ARCHIVING/DELETION
   ├─ Soft delete (keep for history)
   ├─ Hard delete (complete remove)
   └─ Clean up associated files
```

---

## ⚙️ Configuration & Secrets

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
VITE_OAUTH_DISCORD_ID=...
```

### Backend (.env)
```
NODE_ENV=development
PORT=3000
DATABASE_URL=file:./reviews.sqlite
JWT_SECRET=...
DISCORD_CLIENT_ID=...
DISCORD_CLIENT_SECRET=...
OAUTH_CALLBACK_URL=http://localhost:3000/auth/discord/callback
```

---

## 🚀 Performance Considerations

### Frontend Optimizations
- **Code Splitting**: Routes lazy-loaded via React.lazy()
- **Image Optimization**: html-to-image for canvas rendering
- **State Management**: Zustand pour minimal re-renders
- **Debouncing**: Auto-save avec 2s delay
- **Virtualization**: PipelineGitHubGrid scrolling optimisé

### Backend Optimizations
- **Database Indexing**: UserID, reviewType sur queries
- **Caching**: Static data (aromas.json, effects.json)
- **Rate Limiting**: 100 req/min par IP
- **Pagination**: Reviews en pages de 20
- **Compression**: Gzip responses

---

## 🔗 Intégrations Externes

### OAuth
- **Discord**: Single Sign-On
- **Future**: Google, GitHub

### Payment
- **Stripe** (préparé): Pour tiers Producteur/Influenceur

### Export Services
- **html-to-image**: Client-side rendering
- **jspdf**: PDF generation
- **jszip**: Multi-file compression

---

**Dernière mise à jour**: 13 Jan 2026
