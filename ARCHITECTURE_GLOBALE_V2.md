# 🏗️ ARCHITECTURE SYSTÈME GLOBAL - MVP V1 REDESIGN

**Date**: 19 janvier 2026  
**Scope**: Architecture complète du MVP V1 - Clarifier les vraies dépendances systémiques  
**Impact**: Replanifier l'ordre d'implémentation

---

## 🎯 PROBLÈME IDENTIFIÉ

Approche actuelle = **patches superficiels** sans vision globale:
- ExportMaker inachevé = bloque tout (Fleurs, Hash, Concentrés, Comestibles)
- Library vague = pas de structure pour tout sauvegarder
- Stats basiques = pas de logique métier par tier
- Account incomplet = pas de vrai profil utilisateur

**Solution**: Refaire l'architecture en **3 couches**:
1. **Core Services** (données métier)
2. **Library System** (persistance + organisation)
3. **UI Layer** (présentation + workflows)

---

## 📊 ARCHITECTURE COMPLÈTE

### COUCHE 1: CORE SERVICES (Backend + Frontend)

#### **A. Product Services** (Fleurs, Hash, Concentrés, Comestibles)
Chaque produit a sa propre logique métier:

```
FLEURS
├─ CultureSetup (pipeline, durée, substrat, engrais)
├─ CultureStages (90 jours avec données)
├─ FlowerReview (visuel, odeurs, goûts, effets)
├─ CultivarGenealogy (arbre généalogique)
└─ PhenoHuntProject (gestion phénotypes)

HASH/CONCENTRÉS
├─ ExtractionSetup (méthode, paramètres)
├─ PurificationStages (chromatographie, hplc, etc)
├─ HashReview (couleur, pureté, melting, goûts, effets)
└─ SourceCultivars (cultivars utilisés)

COMESTIBLES
├─ RecipeSetup (ingrédients, dosages)
├─ RecipeStages (étapes préparation)
├─ EdibleReview (goûts, effets, timing)
└─ RecipeIngredients (composants réutilisables)
```

#### **B. Export System (OrchardMaker)** 🔴 CENTRAL = DÉPENDANCE
Unique service partagé par TOUS les produits:

```
ExportMaker (unified)
├─ Template Selection (Compact/Détaillé/Complète/Personnalisé)
├─ Format Selection (PNG/JPEG/PDF/SVG/CSV/JSON/HTML)
├─ Quality Selection (150dpi/300dpi, compression)
├─ Customization (couleurs, polices, filigrane)
├─ Preview System (temps réel)
└─ Generation Pipeline
    ├─ HTML rendering
    ├─ Image conversion (html-to-image)
    ├─ PDF generation (jspdf)
    ├─ ZIP archiving (jszip)
    └─ File delivery
```

**CRITIQUE**: ExportMaker must work for:
- Fleur reviews (avec pipelines culture)
- Hash reviews (avec pipelines extraction)
- Concentrated reviews
- Edible reviews
- Mix reviews (multi-produit)

#### **C. Genetics System** (Producteur only)
```
CultivarLibrary
├─ Cultivar Records (nom, breeder, type, %phéno)
├─ Genealogy Canvas (parent1, parent2 relationships)
├─ PhenoHunt Projects (gestion lignées)
│   ├─ Selection Canvas (like Section 2 Fleur)
│   ├─ Traits Tracking
│   └─ Generation Management
└─ Photo Gallery (variantes, phénotypes)
```

---

### COUCHE 2: LIBRARY SYSTEM (Persistence + Organization) 🔴 CRITICAL

Restructure complète nécessaire:

```
USER LIBRARY
│
├─ 📁 SAVED REVIEWS
│   ├─ Fleur Reviews
│   ├─ Hash Reviews
│   ├─ Concentrate Reviews
│   ├─ Edible Reviews
│   └─ Metadata (dates, tags, status)
│
├─ 📁 GENETICS & CULTIVARS
│   ├─ My Cultivar Library
│   │   ├─ Cultivar records (avec photos)
│   │   ├─ Genealogy trees (arbre généalogique)
│   │   └─ Phenotype variants
│   │
│   ├─ PhenoHunt Projects (Producteur only)
│   │   ├─ Project canvas (éditable, drag-drop)
│   │   ├─ Selection history
│   │   ├─ Traits tracking
│   │   └─ Generation lineage
│   │
│   └─ Public Genetics (shared by community)
│
├─ 📁 TECHNICAL SHEETS (Fiches Techniques)
│   ├─ Culture Setups (réutilisables)
│   │   ├─ Substrat presets
│   │   ├─ Engrais profiles
│   │   ├─ Lighting configs
│   │   ├─ Climate presets
│   │   └─ Palissage templates
│   │
│   ├─ Extraction Setups (Hash/Concentrés)
│   │   ├─ Extraction methods
│   │   ├─ Purification chains
│   │   └─ Parameters presets
│   │
│   └─ Recipe Templates (Comestibles)
│       ├─ Ingredient libraries
│       ├─ Preparation steps
│       └─ Dosage calculators
│
├─ 📁 EXPORT TEMPLATES (OrchardMaker configs)
│   ├─ Preset Templates
│   │   ├─ Compact (1:1)
│   │   ├─ Detailed (multi-format)
│   │   ├─ Complete (all data)
│   │   └─ Influencer (9:16)
│   │
│   ├─ Custom Templates (Producteur + Influenceur only)
│   │   ├─ Canvas layout (drag-drop)
│   │   ├─ Color scheme
│   │   ├─ Font selection
│   │   └─ Watermark settings
│   │
│   └─ Quick Presets (saved exports)
│       ├─ Recently used
│       ├─ Favorites
│       └─ Per-product defaults
│
├─ 📁 WATERMARKS (Producteur only)
│   ├─ Custom watermarks
│   ├─ Logo uploads
│   ├─ Text watermarks
│   └─ Positioning presets
│
├─ 📁 SAVED DATA (Auto-complete data)
│   ├─ Frequent cultivars
│   ├─ Frequent substrats
│   ├─ Frequent fertilizers
│   ├─ Equipment list
│   ├─ Supplier contacts
│   └─ Standard parameters
│
└─ 📁 COMPANY DATA (Producteur + Influenceur)
    ├─ Company info
    ├─ Brand assets
    ├─ Contact details
    └─ KYC documents
```

**Implementation**: Prisma models + React UI
```javascript
// Database structure needed:
- SavedDataItem (substrat, engrais, equipment, cultivar)
- ExportTemplate (config, layout, colors, fonts)
- Watermark (images, text, position)
- CultivarRecord (full genealogy + variants)
- PhenoHuntProject (canvas data + lineage)
- TechnicalSheet (reusable setups)
- CompanyProfile (name, KYC, branding)
```

---

### COUCHE 3: UI LAYER (Pages & Components)

#### **3.1 ACCOUNT PAGE** (Complète redesign)

```
/account
├─ PROFILE TAB
│   ├─ Basic Info
│   │   ├─ Email (changeable)
│   │   ├─ Password reset
│   │   ├─ Phone number
│   │   └─ Avatar upload
│   │
│   ├─ KYC SECTION (tous les tiers)
│   │   ├─ Legal name (pour producteur/influenceur)
│   │   ├─ Physical address
│   │   ├─ ID verification (uploading documents)
│   │   └─ Verification status badge
│   │
│   └─ Privacy Settings
│       ├─ Profile visibility
│       ├─ Email visibility
│       └─ Data sharing preferences
│
├─ SUBSCRIPTION TAB
│   ├─ Current subscription display
│   │   ├─ Type badge (Amateur/Producteur/Influenceur)
│   │   ├─ Price & renewal date
│   │   ├─ Features list
│   │   └─ Status indicator
│   │
│   ├─ Upgrade/Downgrade options
│   │   └─ Modal with comparison
│   │
│   └─ Payment History
│       ├─ Invoices list
│       ├─ Download receipts
│       └─ Refund requests
│
├─ PAYMENT SETTINGS TAB (Producteur + Influenceur only)
│   ├─ Payment methods
│   │   ├─ Credit cards
│   │   ├─ Bank transfer
│   │   └─ Add/remove methods
│   │
│   ├─ Billing address
│   │
│   └─ VAT/Tax ID (for companies)
│
├─ COMPANY PROFILE TAB (Producteur + Influenceur only)
│   ├─ Company name & type
│   ├─ Legal entity info
│   ├─ Bank details
│   ├─ Brand logo upload
│   ├─ Website/social links
│   └─ KYC document management
│
├─ WATERMARKS TAB (Producteur only)
│   ├─ Create custom watermark
│   ├─ Upload logo
│   ├─ Position presets
│   └─ Watermark library
│
├─ PREFERENCES TAB (all)
│   ├─ Language selection
│   ├─ Theme (light/dark)
│   ├─ Notification settings
│   ├─ Email preferences
│   └─ Auto-save drafts
│
└─ SECURITY TAB
    ├─ Password change
    ├─ 2FA setup
    ├─ Login history
    └─ Session management
```

#### **3.2 LIBRARY PAGE** (Major redesign)

```
/library
├─ SIDEBAR (left)
│   ├─ 📋 Mes reviews (avec filtres par type)
│   ├─ 🧬 Génétiques & Cultivars
│   │   ├─ Cultivar library
│   │   └─ PhenoHunt projects (Producteur only)
│   ├─ 📄 Fiches techniques
│   ├─ 🎨 Export templates (Producteur only)
│   ├─ 🏷️ Filigranes (Producteur only)
│   └─ 💾 Données sauvegardées
│
├─ MAIN AREA (right)
│   ├─ Reviews Section
│   │   ├─ Grid/List view toggle
│   │   ├─ Filters (type, date, rating)
│   │   ├─ Search bar
│   │   └─ Duplicate/Export/Delete actions
│   │
│   ├─ Cultivars Section
│   │   ├─ Cultivar cards
│   │   ├─ Genealogy tree view
│   │   ├─ Photo gallery per cultivar
│   │   └─ Edit/delete/duplicate buttons
│   │
│   ├─ PhenoHunt Section (Producteur only)
│   │   ├─ Project list
│   │   ├─ Create new project button
│   │   ├─ Project canvas editor (like Section 2)
│   │   ├─ Lineage visualization
│   │   └─ Export lineage
│   │
│   ├─ Technical Sheets Section
│   │   ├─ Filter by type (culture/extraction/recipe)
│   │   ├─ Preset cards
│   │   ├─ Use in review button
│   │   └─ Edit/duplicate buttons
│   │
│   ├─ Export Templates Section (Producteur only)
│   │   ├─ Template library
│   │   ├─ Custom configs
│   │   ├─ Preview on hover
│   │   ├─ Edit layout (drag-drop canvas)
│   │   └─ Use as default button
│   │
│   ├─ Watermarks Section (Producteur only)
│   │   ├─ Watermark library
│   │   ├─ Upload new
│   │   ├─ Position preview
│   │   └─ Set as default
│   │
│   └─ Saved Data Section
│       ├─ Cultivar quick list
│       ├─ Substrat presets
│       ├─ Fertilizer profiles
│       ├─ Equipment list
│       └─ Edit/add buttons
```

#### **3.3 STATISTICS PAGE** (Complete redesign)

**AMATEUR Stats**:
```
Dashboard stats basiques
├─ Total reviews créées
├─ Note moyenne
├─ Type de produit préféré
├─ Top cultivars (par mention)
└─ Chart: reviews par mois
```

**PRODUCTEUR Stats** (Advanced):
```
Dashboard production
├─ CULTURE STATS
│   ├─ Nombre de cultures actives
│   ├─ Durée moyenne culture (jours)
│   ├─ Rendement moyen (g/m²)
│   ├─ Meilleur rendement (cultivar + valeur)
│   ├─ Pire rendement (problèmes détectés)
│   └─ Chart: rendement trend
│
├─ TIMELINE & PLANNING
│   ├─ Récoltes planifiées (next 3 months)
│   ├─ Cultures en cours (avec % complétude)
│   └─ Historical recoltes
│
├─ ENVIRONMENTAL DATA
│   ├─ Température moyenne
│   ├─ Humidité moyenne
│   ├─ Lighting average (hours/day)
│   └─ Environmental problems detected
│
├─ RESOURCE USAGE
│   ├─ Substrat used (volume, cost)
│   ├─ Fertilizer consumption (trend)
│   ├─ Water usage (liters)
│   ├─ Cost per culture
│   └─ ROI calculation
│
├─ CULTIVATION METHODS
│   ├─ Most used techniques (SCROG, LST, etc)
│   ├─ Most used substrats
│   ├─ Most effective lighting setup
│   └─ Best temperature/humidity combo
│
├─ GENETICS INSIGHTS
│   ├─ Most productive cultivars
│   ├─ Most robust cultivars
│   ├─ Most aromatic cultivars
│   ├─ Quality trends
│   └─ Lineage success rate
│
└─ EXPORT INSIGHTS
    ├─ Most downloaded templates
    ├─ Export frequency
    ├─ Format preferences
    └─ Customer feedback on exports
```

**INFLUENCEUR Stats** (Engagement):
```
Dashboard influence & audience
├─ ENGAGEMENT METRICS
│   ├─ Total likes reçus
│   ├─ Total shares (across platforms)
│   ├─ Total comments
│   ├─ Average engagement rate
│   └─ Engagement trend (chart)
│
├─ CONTENT PERFORMANCE
│   ├─ Top 5 reviews by engagement
│   ├─ Worst performing reviews
│   ├─ Average views per review
│   ├─ Click-through rate
│   └─ Share of voice
│
├─ AUDIENCE ANALYTICS
│   ├─ Follower growth (if applicable)
│   ├─ Audience demographics (estimated)
│   ├─ Peak engagement times
│   ├─ Geographic distribution
│   └─ Device breakdown
│
├─ CONTENT TRENDS
│   ├─ Most popular product type
│   ├─ Most popular cultivar mentioned
│   ├─ Trending effects
│   ├─ Trending aromas
│   └─ Seasonal patterns
│
├─ SOCIAL REACH
│   ├─ Instagram shares
│   ├─ Twitter mentions
│   ├─ Reddit upvotes
│   ├─ TikTok views (if applicable)
│   └─ Direct shares
│
└─ MONETIZATION (if applicable)
    ├─ Estimated reach value
    ├─ Partnership opportunities
    └─ Growth recommendations
```

---

## 🔄 INTERDEPENDENCIES (Ordre d'implémentation critique)

```
FOUNDATION (Must do first):
  ↓
  ├─ Export System (ExportMaker) 🔴 BLOCKER
  │   └─ Used by: Fleurs, Hash, Concentrés, Comestibles
  │
  ├─ Library System structure
  │   └─ Used by: All reviews, all products
  │
  └─ Account Profile structure
      └─ Needed for: KYC, payments, preferences

THEN:

  ├─ Fleur product complete (Pipeline + Review)
  ├─ Hash product 
  ├─ Concentrate product
  └─ Edible product

THEN:

  ├─ Statistics (differentiated by tier)
  ├─ Genetics System (Producteur only)
  ├─ PhenoHunt projects (Producteur only)
  ├─ Watermarks system (Producteur only)
  └─ Payment/Subscription system

FINALLY:

  ├─ Public gallery
  ├─ Social sharing
  ├─ Analytics dashboard
  └─ Admin panel
```

---

## 🎯 REVISED SPRINT ROADMAP

### **SPRINT 2** (1 week) - FOUNDATION
```
Priority P0 (MUST HAVE):
├─ ExportMaker completion (unify all product exports)
├─ Library system database schema
├─ Account profile fields (real KYC structure)
└─ Basic tier differentiation

Priority P1:
├─ ExportMaker UI (drag-drop canvas)
├─ Library sidebar + main areas
├─ Account tabs complete
└─ Stats page tier-specific
```

### **SPRINT 3** (1 week) - PHASE 2 PRODUCTS
```
├─ Hash product implementation (full)
├─ Concentrate product implementation (full)
├─ ExportMaker integration (test with all products)
└─ Statistics aggregation for producteur/influenceur
```

### **SPRINT 4+** (Ongoing)
```
├─ Genetics system (genealogy canvas)
├─ PhenoHunt projects
├─ Public gallery
├─ Payment integration
└─ Admin panel
```

---

## 🚨 CRITICAL DECISIONS

1. **ExportMaker must be UNIVERSAL**
   - One system for ALL products
   - Not product-specific
   - Flexible enough for future products

2. **Library is DOCUMENT STORE**
   - Not just reviews
   - Cultivars, presets, templates, projects
   - Versioning & history needed

3. **Stats are BUSINESS LOGIC**
   - Not cosmetic
   - Different value per tier
   - Requires aggregation queries

4. **Account = IDENTITY + BUSINESS**
   - Not just preferences
   - KYC compliance
   - Company management for pros
   - Payment methods storage

---

## 📋 NEXT STEPS

Avant de continuer Sprint 2, confirmation de:

1. ✅ ExportMaker scope & unified design (approved?)
2. ✅ Library structure & data models (correct?)
3. ✅ Account complete fields list (OK?)
4. ✅ Statistics metrics by tier (sufficient?)

Puis on peux vraiment commencer l'implémentation.
