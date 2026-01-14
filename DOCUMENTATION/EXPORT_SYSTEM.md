# 📤 Système d'Export - Reviews-Maker

## 🎯 Vue d'Ensemble

L'export est le point culminant du workflow: transformer une review en document partageable dans formats multiples avec personnalisation avancée.

---

## 🎨 Architecture de l'ExportMaker

### Composant Principal

**File:** `client/src/components/export/ExportMaker.jsx`

```javascript
// Architecture générale
<ExportMaker>
  ├─ Sidebar (Gauche)
  │  ├─ TabTemplates
  │  │  ├─ PredefinedTemplates
  │  │  └─ CustomTemplates (si tier approprié)
  │  ├─ TabPersonalization
  │  │  ├─ ThemeSelector (Light/Dark)
  │  │  ├─ ColorPicker
  │  │  ├─ FontSelector (si PRODUCTEUR)
  │  │  └─ WatermarkConfig (si PRODUCTEUR)
  │  └─ TabAdvanced
  │     └─ DPISelector, Compression, etc.
  │
  ├─ Canvas (Droite)
  │  ├─ PreviewContainer
  │  │  └─ RenderedReview
  │  └─ ExportOptions
  │     ├─ FormatSelector
  │     ├─ QualitySelector
  │     └─ ExportButton
  │
  └─ Modal
     ├─ SocialShareDialog
     └─ EmailSendDialog
```

### State Management

```javascript
// Zustand store: exportStore.ts

interface ExportState {
  // Revue en cours d'export
  currentReview: Review;
  
  // Configuration template
  selectedTemplate: 'Compact' | 'Détaillé' | 'Complète' | 'Influenceur' | 'Personnalisé';
  
  // Personnalisation
  theme: 'light' | 'dark';
  colors: {
    text: '#000000',
    background: '#FFFFFF',
    accent: '#4CAF50',
    border: '#E0E0E0'
  };
  fonts: {
    primary: 'Segoe UI',
    secondary: 'Georgia'
  };
  watermark: {
    enabled: boolean;
    text: string;
    position: 'topLeft' | 'topRight' | 'center' | 'bottomLeft' | 'bottomRight';
    opacity: 0.5;
    size: 'small' | 'medium' | 'large'
  };
  
  // Format et qualité
  format: '1:1' | '16:9' | 'A4' | '9:16';
  outputFormat: 'PNG' | 'JPEG' | 'PDF' | 'SVG' | 'CSV' | 'JSON' | 'HTML';
  quality: {
    dpi: 72 | 300;
    compression: 'low' | 'medium' | 'high'
  };
  
  // Contenu à exporter
  sections: {
    generalInfo: boolean;
    genetics: boolean;
    pipelines: boolean;
    visualTechnical: boolean;
    aromas: boolean;
    tastes: boolean;
    texture: boolean;
    effects: boolean
  };
  
  // Pagination
  currentPage: 1;
  totalPages: 1;
}
```

---

## 📋 Templates Prédéfinis

### 1. Template COMPACT

**Limitations:**
- Format: 1:1 uniquement
- Pas de pagination
- Contenu limité aux highlights

**Contenu obligatoire:**
```javascript
{
  header: {
    productType: 'FLOWER',
    commercialName: 'Blue Dream OG',
    cultivar: 'Blue Dream Clone #3',
    farm: 'Sunshine Gardens',
    mainImage: 'review_main.jpg'
  },
  
  highlights: {
    // Summary scores
    visualScore: 8.5,
    aromaScore: 7.8,
    tasteScore: 8.2,
    effectsScore: 8.0,
    overallRating: 8.1
  },
  
  sections: [
    {
      name: 'Visuel & Technique',
      type: 'summary',
      layout: 'grid_3x2',
      items: ['color', 'density', 'trichomes', 'pistils', 'manicure', 'mold']
    },
    {
      name: 'Arômes Dominants',
      type: 'list',
      layout: 'pills',
      items: dominantAromas.slice(0, 4)
    },
    {
      name: 'Goûts Principaux',
      type: 'list',
      layout: 'pills',
      items: dominantTastes.slice(0, 4)
    },
    {
      name: 'Effets Ressentis',
      type: 'list',
      layout: 'pills',
      items: effectProfiles.slice(0, 3)
    }
  ],
  
  curingTimeline: {
    visible: true,
    maxStages: 3,  // Jours 0, 15, 30 seulement
    layout: 'horizontal'
  },
  
  footer: {
    branding: 'Reviews-Maker.com',
    timestamp: '2026-01-14',
    userCredit: true
  }
}
```

**Rendu:**
```
┌─────────────────────────────────┐
│        BLUE DREAM OG            │
│     Sunshine Gardens Farm       │
│                                 │
│  ┌────────────────────────────┐ │
│  │   [Main Product Image]     │ │
│  └────────────────────────────┘ │
│                                 │
│  ⭐ RATING: 8.1/10             │
│                                 │
│  👁️ VISUAL: 8.5  |  👃 AROMA: 7.8 │
│  😋 TASTE: 8.2   |  💥 EFFECTS: 8.0 │
│                                 │
│  ┌─ APPEARANCE ─┐              │
│  │ Color: 8.5   │              │
│  │ Density: 8.2 │              │
│  │ Trichomes: 9 │              │
│  └───────────────┘              │
│                                 │
│  AROMAS: Fruité • Herbacé ...   │
│  TASTES: Sucré • Citrus ...     │
│  EFFECTS: Relaxant • Créatif ... │
│                                 │
│  CURING: Day 0 → Day 15 → Day 30│
│                                 │
└─────────────────────────────────┘
```

### 2. Template DÉTAILLÉ

**Limitations:**
- Format: 1:1, 16:9, 9:16, A4
- Pagination: Auto si nécessaire
- Contenu détaillé par section

**Contenu:**
```javascript
{
  pages: [
    {
      name: 'Couverture',
      layout: 'cover',
      sections: ['header', 'mainImage', 'basicInfo', 'overallRating']
    },
    {
      name: 'Informations Générales',
      layout: 'detailed',
      sections: ['generalInfo', 'genetics']
    },
    {
      name: 'Analyse Visuelle',
      layout: 'detailed',
      sections: ['visualTechnical_all']
    },
    {
      name: 'Profil Aromatique',
      layout: 'detailed',
      sections: ['aromas_detailed', 'aromaImages']
    },
    {
      name: 'Profil Gustatif',
      layout: 'detailed',
      sections: ['tastes_detailed', 'tasteNotes']
    },
    {
      name: 'Texture',
      layout: 'detailed',
      sections: ['texture_all']
    },
    {
      name: 'Effets Ressentis',
      layout: 'detailed',
      sections: ['effects_detailed', 'effectsCharts']
    },
    {
      name: 'Timeline de Curing',
      layout: 'timeline',
      sections: ['curingPipeline_all']
    }
  ]
}
```

### 3. Template COMPLÈTE

**Limitations:**
- Format: 1:1 ou A4 (multi-pages)
- Pagination: Jusqu'à 9 pages
- Tout le contenu disponible

**Contenu:**
```javascript
{
  includeAllSections: true,
  
  sections: [
    'cover',
    'toc',  // Table of contents
    'generalInfo_complete',
    'genetics_complete',
    'cultivationPipeline_all',
    'separationPipeline_all',  // si applicable
    'extractionPipeline_all',  // si applicable
    'curingPipeline_all',
    'visualTechnical_detailed',
    'aromaProfile_complete',
    'tasteProfile_complete',
    'textureProfile_complete',
    'effectsExperience_complete',
    'galleryPage',  // Toutes les images
    'certificateOfAnalysis',  // Si disponible
    'geneticsTree',  // Si FLOWER et PRODUCTEUR
    'backpage'  // QR code, branding
  ],
  
  genealogyTree: {
    visible: true,  // Si type FLOWER et tier PRODUCTEUR
    layout: 'graphical',  // ou 'tabular'
    depth: 3  // Générations d'ancêtres à afficher
  }
}
```

### 4. Template INFLUENCEUR

**Limitations:**
- Format: 9:16 uniquement (portrait mobile-friendly)
- Pas de pagination
- Optimisé pour réseaux sociaux

**Contenu:**
```javascript
{
  format: '9:16',
  aspectRatio: 0.5625,
  maxWidth: 1080,  // px
  maxHeight: 1920,
  
  sections: [
    {
      name: 'Intro',
      layout: 'impact',
      elements: ['emoji', 'productName', 'cultivar']
    },
    {
      name: 'Main Image',
      layout: 'full_height',
      height: 600
    },
    {
      name: 'Quick Stats',
      layout: 'rating_pills',
      items: ['overall', 'visual', 'aroma', 'taste', 'effects']
    },
    {
      name: 'Dominant Profiles',
      layout: 'vertical_list',
      items: ['topAromas', 'topTastes', 'topEffects']
    },
    {
      name: 'Curing Evolution',
      layout: 'timeline_vertical',
      maxStages: 4,
      showImages: true
    },
    {
      name: 'CTA',
      layout: 'call_to_action',
      text: 'Voir la review complète'
    }
  ]
}
```

---

## 🎛️ Système de Personnalisation

### Thème (Tous les tiers)

```javascript
// Thèmes prédéfinis
const themes = {
  light: {
    background: '#FFFFFF',
    text: '#1A1A1A',
    accent: '#4CAF50',
    border: '#E0E0E0',
    shadow: 'rgba(0,0,0,0.1)'
  },
  dark: {
    background: '#1E1E1E',
    text: '#FFFFFF',
    accent: '#81C784',
    border: '#404040',
    shadow: 'rgba(0,0,0,0.5)'
  },
  cannabis: {
    background: '#F5E6D3',
    text: '#2D5016',
    accent: '#6B8E23',
    border: '#8B7355',
    shadow: 'rgba(0,0,0,0.15)'
  }
};
```

### Couleurs Personnalisées (Tous les tiers)

```javascript
// Palette de sélection - 12 couleurs prédéfinies par défaut
// Utilisateur peut choisir custom colors via color picker

const customColors = {
  text: '#000000',          // Couleur du texte principal
  heading: '#333333',       // Titres
  background: '#FFFFFF',    // Fond général
  sectionBg: '#F5F5F5',     // Fond des sections
  accent: '#4CAF50',        // Éléments clés
  border: '#E0E0E0',        // Bordures
  scoreBar: '#81C784',      // Barres de score
  negative: '#F44336'       // Éléments négatifs/warnings
};
```

### Polices (PRODUCTEUR seulement)

```javascript
// Polices web-safe disponibles
const fonts = [
  'Segoe UI',     // Défaut
  'Georgia',
  'Arial',
  'Verdana',
  'Times New Roman'
];

// + Google Fonts (50+ options)
const googleFonts = [
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Playfair Display',  // Pour élégance
  'Merriweather'       // Pour sérifes
];
```

### Filigrane (PRODUCTEUR seulement)

```javascript
{
  enabled: boolean,
  
  text: string,  // "© MesCultures 2026"
  
  position: {
    horizontal: 'left' | 'center' | 'right',
    vertical: 'top' | 'middle' | 'bottom'
  },
  
  styling: {
    fontSize: 24,      // px
    opacity: 0.3,      // 0-1
    angle: 0,          // degrés (0 = horizontal)
    font: 'Georgia',
    color: '#888888'
  }
}
```

---

## 📊 Formats de Sortie

### PNG / JPEG

```javascript
{
  outputFormat: 'PNG' | 'JPEG',
  
  // Quality options
  quality: {
    standard: {
      dpi: 72,
      width: 1080,      // px
      height: 1080,     // px
      compression: 'medium'
    },
    high: {
      dpi: 150,
      width: 2400,
      height: 2400,
      compression: 'low'
    },
    ultra: {
      dpi: 300,
      width: 4800,
      height: 4800,
      compression: 'none'
    }
  },
  
  // Generation process
  process: [
    '1. Render DOM to Canvas (html-to-image)',
    '2. Apply watermark if enabled',
    '3. Compress based on quality',
    '4. Convert to selected format',
    '5. Download or upload'
  ]
}
```

### PDF

```javascript
{
  outputFormat: 'PDF',
  
  quality: {
    standard: {
      dpi: 72,
      compression: 'medium'
    },
    high: {
      dpi: 300,
      compression: 'low'
    }
  },
  
  options: {
    format: 'A4' | '1:1' | '16:9',
    orientation: 'portrait' | 'landscape',
    margins: { top: 10, right: 10, bottom: 10, left: 10 },  // mm
    pageNumbers: true,
    tableOfContents: true,  // Si multi-page
    compression: true
  },
  
  // Generation process
  process: [
    '1. For each page:',
    '   a. Render DOM to Canvas',
    '   b. Convert Canvas to image',
    '   c. Add to jsPDF document',
    '2. Apply document metadata',
    '3. Compress if enabled',
    '4. Download or upload'
  ]
}
```

### SVG

```javascript
{
  outputFormat: 'SVG',
  
  // SVG is vector-based (infinitely scalable)
  quality: 'scalable',  // No DPI concept
  
  advantages: [
    'Infinitely scalable without quality loss',
    'Smaller file size than raster formats',
    'Editableในprograms like Illustrator',
    'Perfect for print'
  ],
  
  limitations: [
    'Images embedded as base64 (larger files)',
    'Some filters not supported',
    'Browser support varies for advanced features'
  ]
}
```

### CSV / JSON / HTML

```javascript
{
  // CSV - Tableau de données
  outputFormat: 'CSV',
  content: {
    header: 'Review Name,Cultivar,Type,Score,...',
    rows: [
      'Blue Dream,Blue Dream Clone,FLOWER,8.5,...',
      '...'
    ]
  },
  
  // JSON - Données structurées complètes
  outputFormat: 'JSON',
  content: {
    id: 'review-123',
    name: 'Blue Dream',
    type: 'FLOWER',
    generalInfo: { ... },
    pipelines: { ... },
    sections: { ... },
    // Complètement sérialisable
  },
  
  // HTML - Page web autonome
  outputFormat: 'HTML',
  content: {
    includes: ['inline-css', 'embedded-images'],
    responsive: true,
    standalone: true,  // Peut être ouvert sans serveur
    interactive: true  // Peut contenir JavaScript
  }
}
```

---

## 🔄 Flux d'Export Complet

### Interface Utilisateur

```
1. Utilisateur clique "Exporter" sur review
   ↓
2. ExportMaker s'ouvre avec defaults
   ├─ Template: Compact (amateur) ou dernier utilisé
   ├─ Format: 1:1
   └─ Quality: Standard
   ↓
3. Utilisateur configure (optionnel)
   ├─ Change template
   ├─ Ajuste couleurs/thème
   └─ Choisit format de sortie
   ↓
4. Preview mises à jour en temps réel
   ├─ Canvas à droite affiche rendu
   └─ Métadonnées en pied de page
   ↓
5. Utilisateur clique "Exporter"
   ├─ Validation (données complètes?)
   ├─ Génération (peut prendre 5-30s selon qualité)
   └─ Options d'action:
      ├─ Télécharger localement
      ├─ Partager sur réseaux
      ├─ Envoyer par email
      └─ Sauvegarder cette config
```

### Code Backend: Generation

```javascript
// server-new/routes/exports.js

router.post('/generate', authenticate, async (req, res) => {
  const { reviewId, template, format, quality, colors, outputFormat } = req.body;
  
  try {
    // 1. Récupérer la review
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        user: true,
        images: true,
        pipelines: true,
        // ... tous les includes nécessaires
      }
    });
    
    if (!review) return res.status(404).json({ error: 'Review not found' });
    if (review.userId !== req.user.id) return res.status(403).json({ error: 'Unauthorized' });
    
    // 2. Valider les permissions tier
    if (template === 'PERSONNALISÉ' && req.user.tier !== 'PRODUCTEUR') {
      return res.status(403).json({ error: 'Feature requires PRODUCTEUR tier' });
    }
    
    // 3. Créer contenu selon template
    const content = await buildTemplateContent(review, template, colors);
    
    // 4. Générer le fichier
    const file = await generateExport(content, {
      format,
      quality,
      outputFormat
    });
    
    // 5. Envoyer le fichier
    res.set('Content-Type', file.mimeType);
    res.set('Content-Disposition', `attachment; filename="${file.name}"`);
    res.send(file.buffer);
    
    // 6. Logger l'export (pour statistiques)
    await prisma.exportLog.create({
      data: {
        userId: req.user.id,
        reviewId,
        template,
        outputFormat,
        timestamp: new Date()
      }
    });
    
  } catch (error) {
    console.error('Export generation failed:', error);
    res.status(500).json({ error: 'Export generation failed' });
  }
});
```

---

## 📊 Intégration Réseaux Sociaux

### Configuration Partage

```javascript
{
  socialPlatforms: {
    twitter: {
      available: true,
      requiresAuth: true,
      maxCharacters: 280,
      cardSupport: true,  // Rich preview
      hashtags: ['#CannabisReview', '#Reviews-Maker']
    },
    instagram: {
      available: true,
      requiresAuth: true,
      supportedFormats: ['9:16', '1:1'],
      maxCaption: 2200,
      hashtags: ['#CannabisReview', '#Reviews-Maker']
    },
    facebook: {
      available: true,
      requiresAuth: true,
      supportedFormats: ['1:1', '16:9'],
      description: true
    },
    reddit: {
      available: true,
      requiresAuth: false,
      supportedFormats: ['1:1'],
      communityFocus: true
    }
  },
  
  shareDialog: {
    title: 'Partager cette review',
    selectedPlatforms: [],
    caption: '',  // Utilisateur peut personnaliser
    includeReviewLink: true,
    includeWatermark: true
  }
}
```

### Flux de Partage

```
User clicks "Partager"
  ↓
ShareDialog modal appears
  ├─ Sélect platform(s)
  ├─ Edit caption
  └─ Preview avant partage
  ↓
User clicks "Partager maintenant"
  ├─ Export preview image généré
  ├─ OAuth redirect si nécessaire
  ├─ Post via platform API
  └─ Return success confirmation
```

---

## 🎯 Email Marketing

```javascript
{
  emailExport: {
    enabled: true,
    
    recipients: ['user@example.com', 'friend@example.com'],
    
    subject: 'Voici ma review: Blue Dream OG',
    
    template: 'review_share',  // Prédéfini
    
    attachments: [
      {
        filename: 'review.pdf',
        type: 'PDF'
      }
    ],
    
    bodyOptions: {
      includeReviewText: true,
      includeLink: true,
      personalize: true
    }
  }
}
```

---

## 💾 Sauvegarde de Configurations

### Custom Templates

```javascript
{
  customTemplates: [
    {
      id: 'template-123',
      name: 'Mon export compact personnel',
      description: 'Format carré, thème sombre, mes couleurs',
      
      configuration: {
        template: 'PERSONNALISÉ',
        format: '1:1',
        quality: 'high',
        colors: { /* ... */ },
        fonts: { /* ... */ },
        watermark: { /* ... */ },
        sections: { /* ... */ }
      },
      
      isDefault: true,
      usageCount: 45,
      createdAt: '2025-12-01',
      lastUsed: '2026-01-13'
    }
  ],
  
  // API Endpoints
  // POST /api/export-templates - Créer
  // GET /api/export-templates - Lister
  // PATCH /api/export-templates/:id - Éditer
  // DELETE /api/export-templates/:id - Supprimer
  // POST /api/export-templates/:id/setDefault - Définir comme défaut
}
```

---

## 🚀 Optimisations de Performance

### Rendu Canvas

```javascript
// Utiliser webworker pour rendu lourd
const renderWorker = new Worker('render-worker.js');

renderWorker.postMessage({
  type: 'render',
  dom: domString,
  options: { width, height, scale }
});

renderWorker.onmessage = (event) => {
  const canvas = event.data.canvas;
  // ... traitement du canvas
};
```

### Compression

```javascript
// Compression adapté au format
const compressionSettings = {
  PNG: {
    pngquant: { colors: 256, speed: 3 },
    level: 9  // 1-9, 9 = max
  },
  JPEG: {
    quality: 85,  // 1-100, 85 est bon compromis
    progressive: true
  },
  PDF: {
    compression: 'DEFLATE',
    level: 6
  }
};
```

### Caching

```javascript
// Cache les previews générées pendant session
const exportCache = new Map();

function getCacheKey(review, template, format) {
  return `${review.id}-${template}-${format}`;
}

function cacheExport(key, data) {
  exportCache.set(key, data);
  // Auto-clear après 1h
  setTimeout(() => exportCache.delete(key), 3600000);
}
```

---

## 📱 Responsive Design

### Layouts par Format

```css
/* Format 1:1 (carré) */
@media (--format-square) {
  .export-container {
    aspect-ratio: 1 / 1;
    max-width: 1080px;
  }
}

/* Format 16:9 */
@media (--format-widescreen) {
  .export-container {
    aspect-ratio: 16 / 9;
    max-width: 1920px;
  }
}

/* Format 9:16 (portrait) */
@media (--format-portrait) {
  .export-container {
    aspect-ratio: 9 / 16;
    max-width: 1080px;
  }
}

/* Format A4 */
@media (--format-a4) {
  .export-container {
    aspect-ratio: 8.5in / 11in;
    max-width: 816px;
  }
}
```

---

## 🔍 Statistiques d'Export

```javascript
{
  userExportStats: {
    totalExports: 245,
    
    byTemplate: {
      compact: 120,
      detailed: 80,
      complete: 30,
      custom: 15
    },
    
    byFormat: {
      png: 100,
      pdf: 120,
      jpeg: 15,
      csv: 5,
      json: 5
    },
    
    byQuality: {
      standard: 120,
      high: 100,
      ultra: 25
    },
    
    mostPopularTemplate: 'Compact',
    averageExportSize: '2.4 MB',
    
    socialShares: {
      twitter: 45,
      instagram: 32,
      facebook: 28,
      reddit: 12
    }
  }
}
```

---

## 🎯 Roadmap Futures

1. **Export vidéo** - Créer GIF/MP4 montrant évolution pipeline
2. **Export interactif** - Viewer web permettant zoom/détails
3. **Batch export** - Exporter plusieurs reviews d'un coup
4. **Presets templates** - Marketplace de templates communautaires
5. **A/B Testing** - Comparer différents layouts pour optimiser engagement
6. **API d'export** - Permettre exports programmés/automatisés
7. **Print integration** - Commander imprimés directement
8. **Blockchain export** - Certificat d'authenticité sur blockchain
