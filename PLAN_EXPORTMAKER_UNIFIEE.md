# 🎨 PLAN EXPORTMAKER UNIFIÉE - SYSTÈME CENTRAL

**Date**: 22 janvier 2026  
**Scope**: ExportMaker - Système unifié pour TOUS les produits (Fleurs, Hash, Concentrés, Comestibles, Mix)  
**Priority**: P0 - BLOCKER pour Phase 1 Fleur

---

## 🎯 PROBLÈME ACTUEL

**ExportMaker fragmenté**:
- Pas utilisé par tous les produits
- Logique d'export spread across components
- Templates non réutilisables
- Pas de preview système
- Pas de sauvegarde configurations

**Solution**: UNE seule système CENTRALISÉE:
```
ReviewData (any type) → ExportMaker → Format Selector → Template Selector
→ Customization → Preview → Generation → Download
```

---

## 📐 ARCHITECTURE EXPORTMAKER

### **LAYER 1: Data Input (ReviewData)**
```
Tous les types de reviews convergent vers une structure commune:

export interface ExportableReview {
  // Meta
  id: string
  type: 'fleur' | 'hash' | 'concentrate' | 'edible' | 'mix'
  createdAt: DateTime
  
  // Section 1: Informations générales (TOUS)
  general: {
    name: string
    type?: string // cultivar type
    farm?: string // source
    images: string[]
  }
  
  // Section 2: Données techniques (variables par type)
  technical: {
    // FLEURS:
    cultivar?: string
    breeder?: string
    thc?: number
    cbd?: number
    
    // HASH/CONCENTRÉS:
    extractionMethod?: string
    purityVisual?: number
    
    // COMESTIBLES:
    ingredients?: array
    dosage?: number
  }
  
  // Section 3: Pipelines (TOUS)
  pipelines: {
    culture?: PipelineData[] // Fleurs
    extraction?: PipelineData[] // Hash/Concentrés
    recipe?: PipelineData[] // Comestibles
    curing?: PipelineData[] // All
  }
  
  // Section 4: Sensory (TOUS)
  sensory: {
    visual?: VisualRating
    aromas?: AromaRating
    flavors?: FlavorRating
    texture?: TextureRating
    effects?: EffectRating
  }
  
  // Section 5: Meta (TOUS)
  metadata: {
    rating: number
    visibility: 'private' | 'friends' | 'public'
    tags: string[]
    notes: string
  }
}
```

### **LAYER 2: Format Selector**
```
Formats disponibles:
├─ IMAGE (150 dpi standard, 300 dpi premium)
│   ├─ PNG
│   ├─ JPEG
│   └─ SVG (Producteur only)
├─ DOCUMENT
│   ├─ PDF (Producteur only: 300 dpi)
│   └─ HTML (Producteur only: interactive)
├─ DATA
│   ├─ CSV (Producteur only)
│   ├─ JSON (Producteur only)
│   └─ EXCEL (Producteur only)
└─ ARCHIVE
    └─ ZIP (multi-format export)

Restrictions par tier:
├─ Amateur: PNG, JPEG, PDF (150 dpi)
├─ Producteur: ALL
└─ Influenceur: PNG, JPEG, SVG, PDF (300 dpi)
```

### **LAYER 3: Template Selector**
```
Templates prédéfinis (TOUS):
├─ COMPACT (1:1 uniquement)
│   └─ Affiche: Name, Cultivar, Photo, Mini-ratings
├─ DÉTAILLÉ (1:1, 16:9, 9:16, A4)
│   └─ Affiche: Info + 5 étapes pipeline + ratings détaillées
├─ COMPLÈTE (All)
│   └─ Affiche: TOUT (info + pipeline complet + ratings + analyses)
└─ INFLUENCEUR (9:16 uniquement)
    └─ Affiche: Photo grande + ratings essentiels + engagement hooks

Templates personnalisés (Producteur + Influenceur):
├─ Drag-drop canvas editor
├─ Zones configurables (header, body, footer, sidebars)
├─ Réutilisable via Library
└─ Sauvegardable comme preset

Templates preset (Amateur read-only, Producteur editable):
├─ Instagram (1:1)
├─ TikTok (9:16)
├─ Twitter (16:9)
└─ Document A4
```

### **LAYER 4: Customization**
```
Personnalisation (tous):
├─ Thème
│   ├─ Light/Dark/Auto
│   ├─ Couleurs (palette prédéfinie ou custom)
│   └─ Gradient backgrounds
├─ Typographie
│   ├─ Choix polices (Producteur: custom fonts + Google Fonts)
│   ├─ Tailles
│   └─ Weights
├─ Layout
│   ├─ Orientation (portrait/landscape/auto)
│   ├─ Spacing/Padding
│   └─ Zones visibility (Amateur: toggle simple, Producteur: drag-drop)
├─ Images
│   ├─ Borders (none, rounded, thick, shadow)
│   ├─ Filters (saturation, brightness, blur, sepia)
│   └─ Aspect ratio (crop/fit/cover)
├─ Watermark (Producteur + Influenceur default watermark)
│   ├─ Position
│   ├─ Opacity
│   └─ Scale
└─ Branding (Producteur only)
    ├─ Logo placement
    ├─ Company color scheme
    └─ Custom footer
```

### **LAYER 5: Preview**
```
Preview System:
├─ Real-time preview (updates on every change)
├─ Multi-format preview (see how looks on different formats)
├─ Responsive preview (mobile/tablet/desktop)
├─ Zoom (25% to 200%)
└─ Full-screen preview mode

Performance:
├─ Lazy render preview (virtualize if many elements)
├─ Cache generated HTML
├─ Debounce updates (200ms)
└─ Worker thread for heavy computations
```

### **LAYER 6: Generation Pipeline**
```
Generation (async):

Review Data
  ↓
Validate (check required fields)
  ↓
Prepare (normalize data, sort pipelines)
  ↓
Render HTML (template + data + customization)
  ↓
Convert Format:
  ├─ PNG/JPEG: html-to-image (canvas-based)
  ├─ SVG: html-to-image (svg output)
  ├─ PDF: jsPDF (html/images)
  ├─ CSV: Papa Parse (transform data)
  ├─ JSON: JSON.stringify (structured)
  ├─ HTML: already ready
  └─ ZIP: JSZip (archive multiple files)
  ↓
Optimize (compress if needed)
  ↓
Download / Share
```

---

## 📁 FILE STRUCTURE

```
client/src/components/export/
├─ ExportMaker.jsx (MAIN - wrapper/controller)
├─ ExportMakerLayout.jsx (layout with sidebar)
│
├─ steps/
│   ├─ StepFormatSelector.jsx
│   ├─ StepTemplateSelector.jsx
│   ├─ StepCustomization.jsx
│   ├─ StepPreview.jsx
│   └─ StepGeneration.jsx
│
├─ templates/
│   ├─ TemplateCompact.jsx
│   ├─ TemplateDetailed.jsx
│   ├─ TemplateComplete.jsx
│   ├─ TemplateInfluencer.jsx
│   └─ TemplateCustom.jsx
│
├─ preview/
│   ├─ PreviewCanvas.jsx
│   ├─ PreviewResponsive.jsx
│   └─ PreviewZoom.jsx
│
├─ customize/
│   ├─ ThemeSelector.jsx
│   ├─ TypographyEditor.jsx
│   ├─ LayoutEditor.jsx (drag-drop zones)
│   ├─ ImageEditor.jsx (filters, borders)
│   ├─ WatermarkSelector.jsx
│   └─ ColorPicker.jsx
│
├─ generators/
│   ├─ generateHTML.js (render to HTML string)
│   ├─ generatePNG.js (html-to-image)
│   ├─ generatePDF.js (jsPDF)
│   ├─ generateCSV.js (Papa Parse)
│   ├─ generateJSON.js
│   ├─ generateSVG.js
│   └─ generateZIP.js (JSZip)
│
├─ hooks/
│   ├─ useExportState.js (manage export flow)
│   ├─ useExportValidation.js (validate data)
│   └─ useExportGeneration.js (handle generation)
│
└─ styles/
    ├─ export-templates.css (CSS pour rendering)
    └─ export-customization.css
```

---

## 🔄 USER FLOW

```
1. USER OPENS REVIEW
   ↓
2. CLICKS "EXPORTER"
   ↓
3. ExportMaker opens modal
   ↓
4. STEP 1: Format Selection
   ├─ Choose: PNG, JPEG, PDF, SVG (if allowed)
   ├─ DPI selection (if applicable)
   └─ Next →
   ↓
5. STEP 2: Template Selection
   ├─ Choose: Compact / Détaillé / Complète / Influenceur / Custom
   ├─ Format auto-selected from Step 1
   └─ Next →
   ↓
6. STEP 3: Customization
   ├─ Adjust: Colors, Fonts, Layout, Images, Watermark
   ├─ Real-time preview on right
   └─ Next →
   ↓
7. STEP 4: Preview
   ├─ Full-screen preview
   ├─ Responsive view toggle
   ├─ Zoom controls
   ├─ Can go back to step 3
   └─ Next →
   ↓
8. STEP 5: Generation & Download
   ├─ Click "Generate & Download"
   ├─ Show progress bar
   ├─ Once ready: auto-download
   ├─ Option: Copy to clipboard (if image)
   ├─ Option: Share on social
   └─ Save config as preset (Producteur)
   ↓
9. DOWNLOAD COMPLETE
```

---

## 🎯 MINIMAL VIABLE PRODUCT (MVP)

**Phase 1** (this sprint):
- ✅ ExportMaker structure (steps framework)
- ✅ Format selector (PNG, JPEG, PDF only)
- ✅ Template selector (Compact, Détaillé, Complète only)
- ✅ Basic customization (colors, fonts)
- ✅ Preview system
- ✅ Generation pipeline (html-to-image + jsPDF)
- ✅ Download functionality

**Phase 2** (next sprint):
- SVG export
- CSV/JSON/HTML export
- Custom template editor
- Watermark system
- Branding options
- ZIP archive

---

## 💾 DATA PERSISTENCE

Save export configurations:
```
model ExportTemplate {
  id: string
  userId: string
  name: string
  description: string
  
  // Configuration sauvegardée
  format: string // PNG, PDF, etc.
  template: string // compact, detailed, custom
  customization: {
    theme: string
    colors: object
    fonts: object
    layout: object
    watermark: object
  }
  
  // Metadata
  isDefault: boolean
  usageCount: number
  createdAt: DateTime
  updatedAt: DateTime
}

// Storage: Indexed
Utilisateurs peuvent:
- Créer templates personnalisés
- Marquer comme défaut
- Réutiliser entre reviews
- Dupliquer & modifier
- Exporter config (JSON)
```

---

## ⚡ PERFORMANCE OPTIMIZATIONS

```
Generation speed targets:
├─ PNG/JPEG (<2s): html-to-image + canvas
├─ PDF (<3s): jsPDF + embedded images
├─ CSV/JSON (<500ms): data transformation
└─ Preview (<100ms): debounced updates

Optimization techniques:
├─ Lazy load assets
├─ Cache rendered templates
├─ Debounce preview updates
├─ Virtualize large lists (pipelines)
├─ Worker threads for generation
├─ Compress output images
└─ Preload common fonts
```

---

## 🧪 TESTING STRATEGY

```
Unit Tests:
├─ generateHTML.js (data → HTML)
├─ generatePNG.js (HTML → PNG)
├─ useExportValidation.js (data validation)
└─ useExportState.js (state transitions)

Integration Tests:
├─ Full export flow (all steps)
├─ Format switching
├─ Template switching
├─ Customization changes
└─ Preview updates

E2E Tests (Cypress):
├─ Export Fleur review
├─ Export Hash review
├─ Export Concentrate review
├─ Export Edible review
├─ Save as preset
├─ Download file
└─ Share on social
```

---

## ✅ CHECKLIST

### Phase 1: Core (This Week)
- [ ] Create ExportMaker.jsx (main wrapper)
- [ ] Create step components (Format, Template, Customization, Preview, Generation)
- [ ] Implement template components (Compact, Detailed, Complete)
- [ ] Build HTML generator
- [ ] Integrate html-to-image (PNG/JPEG)
- [ ] Integrate jsPDF (PDF)
- [ ] Build preview system
- [ ] Implement download functionality
- [ ] Test with Fleur reviews
- [ ] Test with Hash reviews
- [ ] Test with Concentrate reviews
- [ ] Test with Edible reviews
- [ ] Responsive design
- [ ] Performance optimization

### Phase 2: Advanced
- [ ] SVG export
- [ ] CSV/JSON/HTML export
- [ ] ZIP archive
- [ ] Custom template editor
- [ ] Watermark integration
- [ ] Branding options
- [ ] Save templates to Library
- [ ] Share on social networks

---

## 🚀 IMPLEMENTATION ORDER

**Day 1** (6h):
1. Create ExportMaker main structure
2. Create step components skeleton
3. Implement StepFormatSelector
4. Implement StepTemplateSelector

**Day 2** (6h):
5. Create template components (all 3)
6. Build HTML generator for templates
7. Integrate html-to-image for PNG/JPEG
8. Implement preview system

**Day 3** (4h):
9. Integrate jsPDF for PDF
10. Implement customization controls
11. Test with all 4 product types
12. Polish & responsive

**Total**: 16h = 2 days full

---

## 🎨 DESIGN REFERENCE

```
Modal Layout:

┌─ EXPORTMAKER ──────────────────────────────────────────┐
│                                                         │
│ [← Step 1/5: Format]                                   │
│                                                         │
│ ┌──────────────────────┬──────────────────────────────┐│
│ │ LEFT SIDEBAR         │ RIGHT PREVIEW                ││
│ │                      │                              ││
│ │ [PNG]  [JPEG]        │    ┌────────────────────┐   ││
│ │ [PDF]  [SVG]         │    │  PREVIEW            │   ││
│ │                      │    │  (Real-time)        │   ││
│ │ Quality:             │    │                     │   ││
│ │ [Std] [High]         │    │  [Zoom controls]    │   ││
│ │                      │    │  [Responsive]       │   ││
│ │ [← Back] [Next →]    │    │                     │   ││
│ │                      │    └────────────────────┘   ││
│ └──────────────────────┴──────────────────────────────┘│
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---
