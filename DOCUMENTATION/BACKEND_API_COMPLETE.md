# 🔌 API Backend Complète - Reviews-Maker

## 📋 Vue d'Ensemble

Documentation exhaustive de tous les endpoints API du serveur Express.

**Base URL:**
```
Development:  http://localhost:3000/api
Production:   https://api.reviews-maker.com/api
```

**Versions:**
- Current: `v1`
- All endpoints prefixed: `/api/v1/...`

---

## 🔐 Authentification

### Headers Requis

```javascript
// Pour tout endpoint protégé:
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
X-Request-ID: {uuid}  // Optionnel, pour tracing
```

### Codes de Réponse

```javascript
200 OK                  // Succès
201 Created             // Création réussie
204 No Content          // Suppression réussie
400 Bad Request         // Données invalides
401 Unauthorized        // Token manquant/invalide
403 Forbidden           // Accès insuffisant
404 Not Found           // Ressource inexistante
409 Conflict            // Conflit (ex: email existant)
422 Unprocessable       // Validation échouée
429 Too Many Requests   // Rate limit atteint
500 Server Error        // Erreur serveur
503 Service Unavailable // Service down
```

---

## 👤 Authentification & Utilisateurs

### POST `/auth/register`

Créer un nouveau compte utilisateur.

```javascript
// Request
{
  email: "user@example.com",
  password: "SecurePass123!",
  name: "John Doe"
}

// Validation
{
  email: "must be valid email format and unique",
  password: "minimum 8 characters, 1 uppercase, 1 digit, 1 special char",
  name: "1-100 characters"
}

// Response 201
{
  success: true,
  user: {
    id: "clhjz9x0v0000fz4x8k5k6z3c",
    email: "user@example.com",
    name: "John Doe",
    tier: "AMATEUR",
    avatar: null,
    createdAt: "2026-01-14T10:30:00Z"
  },
  token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  expiresIn: 86400000
}

// Error 409
{
  success: false,
  error: "Email already registered"
}
```

### POST `/auth/login`

Authentifier un utilisateur avec email/password.

```javascript
// Request
{
  email: "user@example.com",
  password: "SecurePass123!"
}

// Response 200
{
  success: true,
  user: { ... },
  token: "...",
  expiresIn: 86400000,
  lastLogin: "2026-01-14T10:30:00Z"
}

// Error 401
{
  success: false,
  error: "Invalid email or password"
}
```

### GET `/auth/me`

Récupérer données de l'utilisateur actuel.

```javascript
// Request
GET /auth/me
Authorization: Bearer {token}

// Response 200
{
  success: true,
  user: {
    id: "clhjz9x0v0000fz4x8k5k6z3c",
    email: "user@example.com",
    name: "John Doe",
    tier: "AMATEUR",
    avatar: "https://...",
    bio: "...",
    website: "https://...",
    location: "Paris, France",
    kycVerified: false,
    ageVerified: false,
    createdAt: "2026-01-14T10:30:00Z",
    stats: {
      reviewsCount: 12,
      exportsCount: 45,
      publicReviewsCount: 3
    }
  }
}

// Error 401
{
  success: false,
  error: "Unauthorized"
}
```

### PATCH `/users/:userId`

Mettre à jour le profil utilisateur.

```javascript
// Request
PATCH /users/clhjz9x0v0000fz4x8k5k6z3c
Authorization: Bearer {token}
{
  name: "Jean Dupont",
  bio: "Producteur de cannabis artisanal",
  website: "https://monblog.com",
  location: "Provence",
  avatar: "base64_encoded_image"
}

// Response 200
{
  success: true,
  user: { ... updated user ... }
}

// Erreur 403
{
  success: false,
  error: "Can only update own profile"
}
```

### POST `/auth/logout`

Terminer la session utilisateur.

```javascript
// Request
POST /auth/logout
Authorization: Bearer {token}

// Response 200
{
  success: true,
  message: "Logged out successfully"
}
```

### POST `/auth/forgot-password`

Demander réinitialisation de mot de passe.

```javascript
// Request
{
  email: "user@example.com"
}

// Response 200
{
  success: true,
  message: "Reset link sent to email"
}

// Note: Toujours 200 même si email n'existe pas (sécurité)
```

### POST `/auth/reset-password`

Réinitialiser le mot de passe avec token.

```javascript
// Request
{
  token: "reset_token_from_email",
  newPassword: "NewSecurePass123!"
}

// Response 200
{
  success: true,
  message: "Password reset successful"
}

// Error 400
{
  success: false,
  error: "Token expired or invalid"
}
```

### POST `/auth/discord`

Initier authentification Discord OAuth.

```javascript
// Frontend redirect
window.location = `${API_URL}/auth/discord?state=${state}`;

// Backend performs:
// 1. Redirect user to Discord
// 2. Handle callback
// 3. Create/update user
// 4. Set session
// 5. Redirect to frontend with session
```

### GET `/auth/discord/callback`

Callback Discord OAuth (automatique).

```javascript
// Discord redirects here with code
// Backend:
// - Exchanges code for token
// - Fetches user profile
// - Creates or updates User
// - Sets session/JWT
// - Redirects to frontend
```

---

## 📝 Reviews API

### GET `/reviews`

Lister les reviews de l'utilisateur.

```javascript
// Query Parameters
{
  page: 1,                // Pagination
  limit: 20,              // Items par page
  type: "FLOWER",         // Filter: FLOWER|HASH|CONCENTRATE|EDIBLE
  status: "PUBLISHED",    // Filter: DRAFT|PUBLISHED|ARCHIVED
  search: "blue dream",   // Recherche par nom
  sortBy: "createdAt",    // createdAt|updatedAt|rating|name
  order: "desc"           // asc|desc
}

// Response 200
{
  success: true,
  data: [
    {
      id: "review-123",
      type: "FLOWER",
      name: "Blue Dream OG",
      cultivar: "Blue Dream Clone #3",
      farm: "Sunshine Gardens",
      isPublic: true,
      status: "PUBLISHED",
      images: [{ url: "...", isPrimary: true }],
      rating: 8.5,
      createdAt: "2026-01-13T10:00:00Z",
      updatedAt: "2026-01-14T15:30:00Z"
    }
  ],
  pagination: {
    page: 1,
    limit: 20,
    total: 45,
    pages: 3
  }
}
```

### POST `/reviews`

Créer une nouvelle review.

```javascript
// Request
{
  type: "FLOWER",           // Requis
  name: "Blue Dream OG",    // Requis
  
  // Données générales
  description: "...",
  images: [
    {
      url: "base64_or_file_id",
      isPrimary: true,
      alt: "Main bud shot"
    }
  ],
  
  // Données structurées
  generalInfo: {
    cultivar: "Blue Dream Clone #3",
    farm: "Sunshine Gardens",
    type: "Hybride Sativa-dominant",
    breeder: "DJ Short",
    harvestedAt: "2026-01-10",
    origin: "Clone library"
  },
  
  genetics: {
    breeder: "DJ Short",
    variety: "Blue Dream",
    type: "Hybride",
    percentage: { sativa: 60, indica: 40 },
    genealogy: "parent_ids"
  },
  
  // Sections évaluation
  visualTechnical: {
    color: 8,
    density: 8,
    trichomes: 9,
    pistils: 7,
    manicure: 8,
    mold: 10,
    seeds: 10,
    notes: "...",
    observations: "..."
  },
  
  aromas: {
    dominantNotes: ["fruity", "herbal"],
    secondaryNotes: ["citrus", "pine"],
    inhalationPrimary: ["berries"],
    intensity: 8,
    observations: "..."
  },
  
  tastes: {
    dominantFlavors: ["sweet", "herbal"],
    secondaryFlavors: [],
    dryPuff: ["citrus"],
    inhalation: ["herbal"],
    exhalation: ["sweet", "smooth"],
    intensity: 8,
    aggressiveness: 6
  },
  
  texture: {
    hardness: 7,
    tactileDensity: 8,
    elasticity: 6,
    stickiness: 7
  },
  
  effectsExperience: {
    onset: 8,                      // /10 rapidité
    intensity: 8,                  // /10
    duration: "longue",
    effectProfiles: ["relaxant", "créatif"],
    positiveEffects: ["calm", "focus"],
    negativeEffects: ["dry_mouth"],
    consumptionMethod: "Combustion",
    dosage: "0.5g",
    durationTime: "03:30",
    preferredTime: "soir",
    medicalUse: "stress relief"
  }
}

// Response 201
{
  success: true,
  review: {
    id: "review-123",
    type: "FLOWER",
    name: "Blue Dream OG",
    status: "DRAFT",
    isPublic: false,
    createdAt: "2026-01-14T10:30:00Z"
  }
}
```

### GET `/reviews/:reviewId`

Récupérer une review spécifique.

```javascript
// Response 200
{
  success: true,
  review: {
    id: "review-123",
    type: "FLOWER",
    name: "Blue Dream OG",
    // ... all fields ...
    user: {
      id: "user-123",
      name: "John Doe",
      tier: "PRODUCTEUR"
    },
    pipelines: {
      cultivation: { ... },
      curing: { ... }
    },
    stats: {
      likes: 45,
      comments: 12,
      shares: 8
    }
  }
}

// Error 404
{
  success: false,
  error: "Review not found"
}
```

### PATCH `/reviews/:reviewId`

Mettre à jour une review (mode brouillon).

```javascript
// Request
PATCH /reviews/review-123
Authorization: Bearer {token}
{
  name: "Blue Dream OG - Updated",
  visualTechnical: {
    color: 9,
    // ... autres fields ...
  }
}

// Response 200
{
  success: true,
  review: { ... updated review ... }
}

// Error 403
{
  success: false,
  error: "Can only edit own reviews"
}
```

### POST `/reviews/:reviewId/publish`

Publier une review (passer de DRAFT → PUBLISHED).

```javascript
// Request
POST /reviews/review-123/publish
Authorization: Bearer {token}
{
  isPublic: true,  // Optionnel - rendre publique
  defaultTemplate: "Compact"  // Template d'export par défaut
}

// Response 200
{
  success: true,
  review: {
    id: "review-123",
    status: "PUBLISHED",
    isPublic: true,
    publicUrl: "https://reviews-maker.com/r/abc123"
  }
}
```

### DELETE `/reviews/:reviewId`

Supprimer une review.

```javascript
// Request
DELETE /reviews/review-123
Authorization: Bearer {token}

// Response 204
// No content

// Error 403
{
  success: false,
  error: "Can only delete own reviews"
}
```

### POST `/reviews/:reviewId/duplicate`

Dupliquer une review.

```javascript
// Request
POST /reviews/review-123/duplicate
{
  newName: "Blue Dream OG - Copy"  // Optionnel
}

// Response 201
{
  success: true,
  review: {
    id: "review-456",
    name: "Blue Dream OG - Copy",
    status: "DRAFT"
  }
}
```

---

## 🔀 Pipelines API

### POST `/reviews/:reviewId/pipelines/cultivation`

Créer une pipeline de culture.

```javascript
// Request
{
  frameType: "JOURS",
  startDate: "2025-10-01",
  endDate: "2026-01-10",
  indoorOutdoor: "Indoor",
  
  cultivationSpace: {
    type: "Tente",
    dimensions: { length: 100, width: 80, height: 160, unit: "cm" },
    surfaceArea: 8,
    volume: 12.8
  },
  
  substrat: {
    type: "Bio",
    volume: 40,
    composition: { earth: 60, coco: 30, perlite: 10 },
    ingredients: [...]
  },
  
  // ... autres paramètres ...
}

// Response 201
{
  success: true,
  pipeline: {
    id: "pipeline-123",
    frameType: "JOURS",
    stages: []  // Empty initially
  }
}
```

### POST `/reviews/:reviewId/pipelines/cultivation/stages`

Ajouter une étape à la pipeline.

```javascript
// Request
{
  frameValue: 7,
  notes: "Plantule a 2 vraies feuilles",
  images: ["base64_image"],
  measurements: {
    temperature: 23,
    humidity: 65,
    plantHeight: 5
  },
  customFields: {
    "notes_arrosage": "50mL eau pure"
  }
}

// Response 201
{
  success: true,
  stage: {
    id: "stage-123",
    frameValue: 7,
    createdAt: "2026-01-14T10:30:00Z"
  }
}
```

### PATCH `/reviews/:reviewId/pipelines/cultivation/stages/:stageId`

Mettre à jour une étape.

```javascript
// Request
PATCH /reviews/review-123/pipelines/cultivation/stages/stage-123
{
  notes: "Updated notes",
  measurements: { temperature: 24 }
}

// Response 200
{
  success: true,
  stage: { ... updated stage ... }
}
```

### GET `/reviews/:reviewId/pipelines/cultivation`

Récupérer toute la pipeline de culture.

```javascript
// Response 200
{
  success: true,
  pipeline: {
    id: "pipeline-123",
    frameType: "JOURS",
    startDate: "2025-10-01",
    endDate: "2026-01-10",
    stages: [
      {
        id: "stage-1",
        frameValue: 0,
        notes: "...",
        measurements: {...},
        images: [...]
      },
      // ... plus stages ...
    ]
  }
}
```

### POST `/reviews/:reviewId/pipelines/curing`

Créer une pipeline de curing.

```javascript
// Request
{
  frameType: "JOURS",
  duration: 30,
  curingType: "Froid",
  temperature: 3,
  humidity: 62,
  containerType: "Bocal verre",
  primaryPackaging: "Sous vide",
  productVolume: 0.8
}

// Response 201
{
  success: true,
  pipeline: { ... }
}
```

### POST `/reviews/:reviewId/pipelines/separation`

Créer une pipeline de séparation (HASH uniquement).

```javascript
// Request
{
  frameType: "HEURES",
  separationMethod: "Tamisage à sec",
  meshSizes: ["120µm", "100µm", "73µm"],
  temperature: 18,
  
  rawMaterialType: "Trim",
  rawMaterialQuality: 8
}

// Response 201
{
  success: true,
  pipeline: { ... }
}
```

### POST `/reviews/:reviewId/pipelines/extraction`

Créer une pipeline d'extraction (CONCENTRATE).

```javascript
// Request
{
  frameType: "MINUTES",
  extractionMethod: "Pressage à chaud",
  
  extractionParameters: {
    inputMaterial: 3.5,
    inputMaterialType: "Fleur séchée",
    pressurePsi: 1200,
    plateTemp: 95,
    pressTime: 120
  },
  
  purificationMethods: ["Vacuum purge"]
}

// Response 201
{
  success: true,
  pipeline: { ... }
}
```

---

## 📤 Exports API

### POST `/exports/generate`

Générer un export d'une review.

```javascript
// Request
POST /exports/generate
Authorization: Bearer {token}
{
  reviewId: "review-123",
  template: "Compact",
  format: "1:1",
  quality: "standard",
  outputFormat: "PNG",
  
  colors: {
    text: "#000000",
    background: "#FFFFFF",
    accent: "#4CAF50"
  },
  
  watermark: {
    enabled: false
  }
}

// Response 200
// Binary file (PNG/PDF/etc.)
// Headers:
// Content-Type: image/png
// Content-Disposition: attachment; filename="review-123.png"

// Error 403
{
  success: false,
  error: "Feature not available for AMATEUR tier"
}
```

### POST `/exports/preview`

Générer une preview HTML de l'export (plus rapide).

```javascript
// Request
{
  reviewId: "review-123",
  template: "Compact",
  format: "1:1",
  
  colors: { ... }
}

// Response 200
{
  success: true,
  preview: "<html>...</html>",  // HTML brut
  dimensions: { width: 1080, height: 1080 }
}
```

### POST `/exports/share-social`

Partager un export sur réseaux sociaux.

```javascript
// Request
{
  reviewId: "review-123",
  platform: "twitter",  // twitter|instagram|facebook|reddit
  
  exportConfig: { ... },
  
  caption: "Découvrez ma review de Blue Dream OG!",
  hashtags: ["#CannabisReview", "#Reviews-Maker"]
}

// Response 200
{
  success: true,
  url: "https://twitter.com/user/status/123456789",
  message: "Posted successfully"
}
```

### POST `/exports/email`

Envoyer un export par email.

```javascript
// Request
{
  reviewId: "review-123",
  
  recipients: ["friend@example.com"],
  
  subject: "Voici ma review de Blue Dream",
  message: "Personnalised message",
  
  exportConfig: { ... },
  attachFormat: "PDF"
}

// Response 200
{
  success: true,
  message: "Email sent"
}
```

### GET `/exports/templates`

Lister les templates disponibles.

```javascript
// Response 200
{
  success: true,
  templates: {
    predefined: [
      {
        id: "compact",
        name: "Compact",
        description: "Format carré, info essentielles",
        supportedFormats: ["1:1"],
        supportedTiers: ["AMATEUR", "INFLUENCEUR", "PRODUCTEUR"]
      },
      {
        id: "detailed",
        name: "Détaillé",
        description: "Multi-page, sections complètes",
        supportedFormats: ["1:1", "16:9", "9:16", "A4"],
        supportedTiers: ["AMATEUR", "INFLUENCEUR", "PRODUCTEUR"]
      },
      // ... autres templates ...
    ],
    custom: [
      // Templates personnalisés de l'utilisateur
    ]
  }
}
```

### POST `/exports/templates`

Créer/sauvegarder une configuration d'export personnalisée.

```javascript
// Request
{
  name: "Mon export personnel",
  description: "Thème sombre avec couleurs personnalisées",
  
  configuration: {
    template: "PERSONNALISÉ",
    format: "1:1",
    colors: {...},
    fonts: {...},
    watermark: {...}
  },
  
  isDefault: true
}

// Response 201
{
  success: true,
  template: {
    id: "custom-123",
    name: "Mon export personnel",
    isDefault: true
  }
}
```

---

## 👨‍💼 Génétiques API (PRODUCTEUR seulement)

### GET `/genetics/cultivars`

Lister tous les cultivars de la bibliothèque utilisateur.

```javascript
// Query
{
  page: 1,
  limit: 20,
  type: "FLOWER",  // Filter
  search: "blue"
}

// Response 200
{
  success: true,
  data: [
    {
      id: "cultivar-123",
      name: "Blue Dream",
      type: "FLOWER",
      breeder: "DJ Short",
      geneticType: "Hybride",
      description: "...",
      genetics: {
        sativa: 60,
        indica: 40
      },
      parents: ["parent-1", "parent-2"],
      children: ["child-1"],
      createdAt: "2025-12-01"
    }
  ]
}
```

### POST `/genetics/cultivars`

Créer un nouveau cultivar.

```javascript
// Request
{
  name: "Blue Dream Clone #3",
  type: "FLOWER",
  breeder: "DJ Short",
  geneticType: "Hybride",
  genetics: {
    sativa: 60,
    indica: 40
  },
  parents: ["cultivar-123"],
  description: "..."
}

// Response 201
{
  success: true,
  cultivar: {
    id: "cultivar-456",
    name: "Blue Dream Clone #3"
  }
}
```

### GET `/genetics/genealogy/:cultivarId`

Récupérer l'arbre généalogique d'un cultivar.

```javascript
// Response 200
{
  success: true,
  genealogy: {
    cultivarId: "cultivar-123",
    name: "Blue Dream Clone #3",
    parents: [
      {
        id: "parent-1",
        name: "Blue Dream",
        genetics: { sativa: 60, indica: 40 }
      }
    ],
    children: [
      {
        id: "child-1",
        name: "BD x OG",
        genetics: { ... }
      }
    ],
    depth: 2,
    totalRelatives: 5
  }
}
```

### POST `/genetics/projects`

Créer un projet PhenoHunt.

```javascript
// Request
{
  name: "PhenoHunt 2026 BD",
  description: "Sélection phénotypes Blue Dream",
  startDate: "2026-01-14",
  targetCultivar: "cultivar-123",
  
  phenotypes: [
    {
      code: "BD-P1",
      description: "Phénotype fruité",
      parentalGenetics: ["cultivar-1", "cultivar-2"]
    }
  ]
}

// Response 201
{
  success: true,
  project: {
    id: "project-123",
    name: "PhenoHunt 2026 BD"
  }
}
```

---

## 🖼️ Gallery Publique API

### GET `/gallery/public`

Lister les reviews publiques (galerie communautaire).

```javascript
// Query
{
  page: 1,
  limit: 20,
  
  type: "FLOWER",        // Filter
  sortBy: "trending",    // trending|new|rating|likes
  search: "blue dream",
  
  filters: {
    minRating: 7,
    maxRating: 10,
    tier: "all"  // all|PRODUCTEUR|INFLUENCEUR
  }
}

// Response 200
{
  success: true,
  reviews: [
    {
      id: "review-123",
      name: "Blue Dream OG",
      type: "FLOWER",
      
      user: {
        id: "user-123",
        name: "John Doe",
        tier: "PRODUCTEUR",
        avatar: "..."
      },
      
      thumbnail: "...",
      rating: 8.5,
      
      stats: {
        likes: 245,
        comments: 45,
        shares: 12
      },
      
      publicUrl: "https://reviews-maker.com/r/abc123"
    }
  ],
  
  pagination: { ... }
}
```

### POST `/gallery/:reviewId/like`

Liker une review publique.

```javascript
// Request
POST /gallery/review-123/like

// Response 200
{
  success: true,
  liked: true,
  likeCount: 246
}

// POST à nouveau pour contraindre le like
// Response 200
{
  success: true,
  liked: false,
  likeCount: 245
}
```

### POST `/gallery/:reviewId/comments`

Commenter une review publique.

```javascript
// Request
{
  text: "Super review! J'aime bien cette génétique."
}

// Response 201
{
  success: true,
  comment: {
    id: "comment-123",
    text: "...",
    author: {
      id: "user-456",
      name: "Jane Doe",
      avatar: "..."
    },
    createdAt: "2026-01-14T10:30:00Z"
  }
}
```

### GET `/gallery/:reviewId/comments`

Récupérer les commentaires d'une review.

```javascript
// Query
{
  page: 1,
  limit: 20,
  sortBy: "recent"  // recent|popular
}

// Response 200
{
  success: true,
  comments: [
    {
      id: "comment-123",
      text: "...",
      author: {...},
      likes: 12,
      replies: 3,
      createdAt: "2026-01-14T10:30:00Z"
    }
  ],
  pagination: {...}
}
```

---

## 📊 Stats & Analytics API

### GET `/users/:userId/stats`

Récupérer les statistiques d'un utilisateur.

```javascript
// Response 200
{
  success: true,
  stats: {
    reviews: {
      total: 45,
      byType: {
        FLOWER: 30,
        HASH: 10,
        CONCENTRATE: 5,
        EDIBLE: 0
      },
      byStatus: {
        DRAFT: 5,
        PUBLISHED: 40
      }
    },
    
    exports: {
      total: 245,
      byFormat: {
        PNG: 100,
        PDF: 120,
        JPEG: 25
      },
      byTemplate: {
        Compact: 120,
        Detailed: 80,
        Complete: 30,
        Custom: 15
      }
    },
    
    gallery: {
      publicReviews: 8,
      totalLikes: 1250,
      totalComments: 340,
      totalShares: 89,
      avgLikesPerReview: 156,
      topReview: {
        id: "review-123",
        name: "Blue Dream OG",
        likes: 450
      }
    },
    
    engagement: {
      lastActive: "2026-01-14T10:30:00Z",
      monthlyActive: true,
      streak: 15  // Days
    }
  }
}
```

### GET `/reviews/:reviewId/stats`

Obtenir stats d'une review.

```javascript
// Response 200
{
  success: true,
  stats: {
    reviewId: "review-123",
    
    engagement: {
      views: 1250,
      likes: 245,
      comments: 45,
      shares: 12,
      exports: 8
    },
    
    demographics: {
      topCountries: ["FR", "BE", "CH"],
      topPlatforms: ["web", "twitter", "instagram"]
    },
    
    timeline: {
      createdAt: "2026-01-13T10:00:00Z",
      firstLike: "2026-01-13T15:30:00Z",
      peakTrafficTime: "2026-01-14T12:00:00Z"
    }
  }
}
```

---

## ⚙️ Configuration & Preferences

### GET `/preferences`

Récupérer les préférences de l'utilisateur.

```javascript
// Response 200
{
  success: true,
  preferences: {
    language: "fr",
    theme: "light",
    
    notifications: {
      emailOnComment: true,
      emailOnLike: false,
      emailOnGalleryFeature: true,
      emailMarketing: false
    },
    
    privacy: {
      profilePublic: true,
      showStats: true,
      allowMessaging: true
    },
    
    export: {
      defaultTemplate: "Compact",
      defaultFormat: "1:1",
      autoWatermark: false
    }
  }
}
```

### PATCH `/preferences`

Mettre à jour les préférences.

```javascript
// Request
{
  language: "en",
  theme: "dark",
  notifications: {
    emailOnComment: false
  }
}

// Response 200
{
  success: true,
  preferences: { ... }
}
```

---

## ⚡ Rate Limiting

Tous les endpoints respectent le rate limiting:

```
AMATEUR:   100 requêtes par minute, 10,000 par jour
INFLUENCEUR: 500 requêtes par minute, 50,000 par jour
PRODUCTEUR: 2,000 requêtes par minute, 200,000 par jour
```

**Headers de réponse:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1673462847
```

---

## 🔄 Webhooks (Futur)

Support prévu pour webhooks permettant intégrations tierces:

```javascript
POST /webhooks/subscribe
{
  url: "https://myapp.com/webhook",
  events: ["review.created", "review.published", "export.generated"],
  secret: "webhook_secret_key"
}

// Events disponibles:
{
  "review.created": "Review créée",
  "review.updated": "Review modifiée",
  "review.published": "Review publiée",
  "review.deleted": "Review supprimée",
  "export.generated": "Export généré",
  "comment.added": "Commentaire ajouté",
  "subscription.upgraded": "Upgrade souscription"
}
```

---

## 📚 Pagination Standard

Toutes les réponses listées utilisent:

```javascript
{
  success: true,
  data: [ ... ],
  pagination: {
    page: 1,
    limit: 20,
    total: 245,
    pages: 13,
    hasNextPage: true,
    hasPrevPage: false
  }
}
```

**Query parameters:**
```
?page=2&limit=50&sortBy=createdAt&order=desc
```

---

## 🔍 Recherche Fulltext

Certains endpoints supportent recherche fulltext:

```javascript
// GET /reviews?search=blue+dream+fruity
// GET /gallery/public?search=hash+thc

// Recherche sur: nom, cultivar, description, tags
// Support wildcards: * pour tout
```

---

## 📋 Validation d'Erreurs

Erreurs de validation standardisées:

```javascript
{
  success: false,
  error: "Validation failed",
  errors: {
    email: ["Invalid email format"],
    password: ["Must be at least 8 characters", "Must contain uppercase letter"],
    name: ["Name is required"]
  }
}
```

---

## 🚀 Versioning API

Toutes les URLs incluent version:

```
/api/v1/...

Futures versions:
/api/v2/... (compatible backward-compat au lancement)
```

**Dépréciation:**
- v1 supporté minimum 2 ans après v2 launch
- Annonce 6 mois avant dépréciation
- Migration guides fourni
