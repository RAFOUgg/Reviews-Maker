# 📋 Guide Complet - Complétion Exhaustive des Reviews

**Date:** 4 novembre 2025  
**Version:** 2.0 (Nouveau Stack)  
**Status:** 🟢 Production-Ready

---

## 🎯 Vue d'ensemble

Ce document fournit les **anciennes méthodes de complétion** adaptées au **nouveau stack** (React + Express + Prisma). Il couvre tous les types de produits, tous les scénarios et toutes les possibilités exhaustivement.

### Types de Produits Supportés
1. **Fleur** (cannabis séché)
2. **Hash** (résine de cannabis)
3. **Concentré** (extraits lipidiques)
4. **Comestible** (produits infusés)

---

## 📊 Structure de Données Universelle

### Modèle Prisma (Backend)
```prisma
model Review {
  id              String   @id @default(cuid())
  type            String   // "Fleur" | "Hash" | "Concentré" | "Comestible"
  holderName      String   // Nom du produit ou cultivar
  description     String?  // Description générale
  note            Float?   // Note globale (0-10)
  ratings         Json?    // { [key: string]: number }
  
  // Attributs
  terpenes        Json?    // String[]
  tastes          Json?    // String[]
  aromas          Json?    // String[]
  effects         Json?    // String[]
  
  // Images
  images          Json?    // { filename: string, path: string }[]
  mainImage       String?  // Primary image filename
  
  // Metadata
  isPublic        Boolean  @default(true)
  isDraft         Boolean  @default(false)
  authorId        String
  author          User     @relation(fields: [authorId], references: [id])
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

### Structure Frontend (React State)
```javascript
const reviewData = {
  // Informations générales
  type: "Fleur|Hash|Concentré|Comestible",
  holderName: String,        // Obligatoire
  description: String,
  photo: File,               // Upload image
  
  // Évaluations (0-10)
  ratings: {
    apparence: Number,
    arôme: Number,
    goût: Number,
    texture: Number,
    effet: Number,
    global: Number            // Calculé automatiquement
  },
  
  // Sélections (tags)
  terpenes: String[],        // Max 8 (ex: "Myrcène", "Limonène")
  tastes: String[],          // Goûts (ex: "Sucré", "Herbacé")
  aromas: String[],          // Arômes (ex: "Fruité", "Épicé")
  effects: String[],         // Effets (ex: "Relaxant", "Énergisant")
  
  // Métadonnées
  visibility: "public|private|authenticated",
  isDraft: Boolean
}
```

---

## 🌿 TYPE 1: FLEUR (Cannabis Séché)

### Sections Complètes

#### 1️⃣ Informations Générales
| Champ | Type | Obligatoire | Exemple | Validation |
|-------|------|-------------|---------|-----------|
| Cultivar | text | ✅ OUI | "OG Kush" | Non-vide |
| Breeder | text | ❌ NON | "DNA Genetics" | - |
| Farm | text | ❌ NON | "Royal Farm CO" | - |
| Type de culture | select | ❌ NON | "Indoor" | choiceCatalog.typesCulture |
| Spectre lumineux | select | ❌ NON | "Complet" | choiceCatalog.TypesSpectre |
| Photo | file | ❌ NON | `.jpg/.png` | Max 10MB |

#### 2️⃣ Plan Cultural
| Champ | Type | Options |
|-------|------|---------|
| Substrat/Système | select-multi | terre, coco, hydro DWC, NFT, etc. |
| Techniques propagation | select-multi | Bouturage, Semis, Culture tissus, Greffage |
| Engrais organiques | multi-checkbox | Fumier, Compost, Guano, Émulsion poisson |
| Engrais minéraux | multi-checkbox | NPK, Nitrate calcium, Sulfate mag |
| Additifs & stimulants | multi-checkbox | Mycorrhizes, Trichoderma, Acides humiques |

#### 3️⃣ Évaluations Visuelles et Techniques (scoring 1-10)
```javascript
visualRatings = {
  densite: Number,           // 1-10 (très espace → très compact)
  trichome: Number,          // 1-10 (peu visible → cristallin)
  pistil: Number,            // 1-10 (peu visible → très rouges/ambrés)
  manucure: Number           // 1-10 (mal → parfait)
}
// Total automatique = (densite + trichome + pistil + manucure) / 4
```

#### 4️⃣ Odeur (scoring 1-10)
```javascript
smellRatings = {
  intensite: Number,              // 1-10
  notesDominantes: String,        // Textarea: "Fruité, Épicé"
  notesSecondaires: String        // Textarea: "Herbacé"
}
// Total = intensite (moyenne)
```

#### 5️⃣ Texture (scoring 1-10)
```javascript
textureRatings = {
  durete: Number,                 // 1-10
  densiteTexture: Number,         // 1-10
  elasticite: Number,             // 1-10
  collant: Number                 // 1-10
}
// Total = (durete + densiteTexture + elasticite + collant) / 4
```

#### 6️⃣ Goûts & Expérience Fumée (scoring 1-10)
```javascript
smokeRatings = {
  dryPuff: String,                // Textarea: "Notes légères, sucrées"
  inhalation: String,             // Textarea
  expiration: String,             // Textarea
  intensiteFumee: Number,         // 1-10
  agressivite: Number,            // 1-10 (doux → piquant)
  cendre: Number                  // 1-10 (blanche/grise → noire)
}
// Total = (intensiteFumee + agressivite + cendre) / 3
```

#### 7️⃣ Effet (scoring 1-10)
```javascript
effectRatings = {
  montee: Number,                 // 1-10 (rapidité)
  intensiteEffet: Number,         // 1-10
  typeEffet: String,              // Textarea: "Sativa relaxant"
  duree: String                   // Select: "<15min|<30min|<1h|<2h|2h+"
}
// Total = (montee + intensiteEffet) / 2
```

---

## #️⃣ TYPE 2: HASH (Résine de Cannabis)

### Sections Complètes

#### 1️⃣ Informations Générales
| Champ | Type | Obligatoire | Détails |
|-------|------|-------------|---------|
| Cultivars utilisés | cultivar-list | ✅ OUI | Pipeline avec matière (fraîche/sèche/trim) |
| Pipeline séparation | pipeline-order | ✅ OUI | Ordre d'étapes (Bubble → Tamisage sec → etc.) |
| Hash Maker | text | ❌ NON | Producteur |
| Photo | file | ❌ NON | Hash pressé ou non |

**Cultivar List Structure:**
```javascript
cultivarsList = [
  {
    name: "OG Kush",
    matiere: "Fleurs fraîches",    // Source de la matière première
    ratio: Number                  // % du pipeline
  },
  // ...
]
```

**Pipeline Séparation:**
```javascript
pipelineSeparation = [
  { step: 1, method: "Tamisage WPFF", cultivar: "OG Kush" },
  { step: 2, method: "Tamisage eau glacée", cultivar: "OG Kush" },
  { step: 3, method: "Tamisage à sec", cultivar: "OG Kush" },
  // ...
]
```

**Choix disponibles:**
- Tamisage WPFF (Whole Plant Fresh Frozen)
- Tamisage eau glacée (Bubble Hash)
- Tamisage glace carbonique (Ice Hash)
- Tamisage à sec (Dry)
- Tamisage à sec congelé (Ice Dry)
- Séparation électrostatique (Static)
- Friction manuelle (Charas)
- Séparation par densité
- Décantation

#### 2️⃣ Post-traitement & Purification
```javascript
postProcessing = {
  separationsChromato: String,         // Select-multi
  fractionnement: String,              // Select-multi
  separationsPhysiques: String,        // Select-multi
  purificationsAvancees: String        // Select-multi
}
```

**Options Chromatographie:**
- Chromatographie sur colonne
- Flash Chromatography
- HPLC, GC, TLC

**Options Fractionnement:**
- Winterisation, Décarboxylation
- Fractionnement température
- Fractionnement solubilité

**Options Séparations Physiques:**
- Filtration, Centrifugation
- Décantation, Séchage sous vide

**Options Purifications:**
- Recristallisation, Sublimation
- Extraction liquide-liquide
- Adsorption charbon actif

#### 3️⃣ Visuel & Technique (scoring 1-10)
```javascript
visualRatings = {
  couleurTransparence: Number,    // 1-10
  pureteVisuelle: Number,         // 1-10
  densite: Number                 // 1-10
}
// Total = (couleur + purete + densite) / 3
```

#### 4️⃣ Odeur (scoring 1-10)
```javascript
smellRatings = {
  intensiteAromatique: Number,     // 1-10
  notesDominantes: String,         // Textarea
  notesSecondaires: String,        // Textarea
  fideliteCultivars: Number        // 1-10 (fidélité au profil)
}
// Total = (intensite + fidelite) / 2
```

#### 5️⃣ Texture (scoring 1-10)
```javascript
textureRatings = {
  durete: Number,                  // 1-10
  densiteTexture: Number,          // 1-10
  friabiliteViscosite: Number,     // 1-10
  meltingResidus: Number,          // 1-10
  aspectCollantGras: Number        // 1-10
}
// Total = (durete + densite + friabilite + melting + collant) / 5
```

#### 6️⃣ Goûts & Expérience Fumée (scoring 1-10)
```javascript
smokeRatings = {
  dryPuff: String,                 // Textarea
  inhalation: String,              // Textarea
  expiration: String,              // Textarea
  intensiteFumee: Number,          // 1-10
  agressivite: Number,             // 1-10
  cendre: Number                   // 1-10
}
// Total = (intensite + agressivite + cendre) / 3
```

#### 7️⃣ Effet (scoring 1-10)
```javascript
effectRatings = {
  montee: Number,                  // 1-10
  intensiteEffet: Number,          // 1-10
  typeEffet: String,               // Textarea
  duree: String                    // "<15min" | "<30min" | "<1h" | "<2h" | "2h+"
}
// Total = (montee + intensite) / 2
```

---

## ⚗️ TYPE 3: CONCENTRÉ (Extraits Lipidiques)

### Sections Complètes

#### 1️⃣ Informations Générales
```javascript
generalInfo = {
  cultivarsList: CultivarList[],   // Avec matière (fraîches/sèches/trim/trichomes)
  typeExtraction: String,          // Rosin, Live Resin, Wax, Crumble, etc.
  pipelineExtraction: Pipeline[],  // Ordre des étapes
  purgeVide: Boolean,              // Oui/Non
  photo: File                      // Upload image
}
```

**Types d'extraction disponibles:**
- Rosin (Pressage à chaud)
- Live Resin
- Wax
- Crumble
- Sauce (Terpy)
- Distillate
- Diamonds + Sauce
- RSO (Rick Simpson Oil)
- Shatter
- Budder
- Sand

**Pipeline Extraction/Séparation combines:**
```javascript
pipelineExtraction = [
  { step: 1, method: "Extraction BHO", cultivar: "OG Kush", ratio: 60 },
  { step: 2, method: "Winterisation", cultivar: "OG Kush", ratio: 60 },
  { step: 3, method: "Chromatographie colonne", cultivar: "OG Kush", ratio: 60 },
  // ...
]
```

**Méthodes Extraction:**

*Avec Solvants:*
- Éthanol (EHO)
- Alcool isopropylique (IPA)
- Acétone (AHO)
- Butane (BHO)
- Isobutane (IHO)
- Propane (PHO)
- Hexane (HHO)
- Huiles végétales (coco, olive)
- CO₂ supercritique

*Sans Solvants:*
- Pressage à chaud (Rosin)
- Pressage à froid
- Extraction ultrasons (UAE)
- Extraction micro-ondes (MAE)
- Extraction tensioactifs (Tween 20)

#### 2️⃣ Purification & Séparation
```javascript
purification = {
  separationsChromato: String[],
  fractionnement: String[],
  separationsPhysiques: String[],
  purificationsAvancees: String[]
}
// (Voir détails TYPE 2 - Hash)
```

#### 3️⃣ Visuel & Technique (scoring 1-10)
```javascript
visualRatings = {
  couleur: Number,                 // 1-10
  viscosite: Number,               // 1-10
  pureteVisuelle: Number,          // 1-10
  odeur: Number,                   // 1-10
  melting: Number,                 // 1-10 (capacité à fondre)
  residus: Number                  // 1-10 (absence de résidus)
}
// Total = moyenne de tous
```

#### 4️⃣ Odeur (scoring 1-10)
```javascript
smellRatings = {
  intensiteAromatique: Number,     // 1-10
  notesDominantes: String,         // Textarea
  notesSecondaires: String,        // Textarea
  fideliteCultivars: Number        // 1-10
}
// Total = (intensite + fidelite) / 2
```

#### 5️⃣ Goût (scoring 1-10)
```javascript
tasteRatings = {
  intensiteAromatique: Number,     // 1-10
  dryPuff: String,                 // Textarea
  inhalation: String,              // Textarea
  expiration: String,              // Textarea
  notesDominantes: String,         // Textarea
  notesSecondaires: String         // Textarea
}
// Total = intensite
```

#### 6️⃣ Texture (scoring 1-10)
```javascript
textureRatings = {
  durete: Number,                  // 1-10
  densiteTexture: Number,          // 1-10
  viscositeTexture: Number,        // 1-10
  collant: Number                  // 1-10
}
// Total = (durete + densite + viscosite + collant) / 4
```

#### 7️⃣ Expérience Inhalation (scoring 1-10)
```javascript
inhalationRatings = {
  textureBouche: Number,           // 1-10
  douceur: Number,                 // 1-10 (Doux ↔ Agressif)
  intensite: Number,               // 1-10
  intensiteFumee: Number,          // 1-10 (redondant, combine)
  agressivite: Number,             // 1-10
  cendre: Number                   // 1-10
}
// Total = (texture + douceur + intensite) / 3
```

#### 8️⃣ Effet (scoring 1-10)
```javascript
effectRatings = {
  montee: Number,                  // 1-10
  intensiteEffets: Number,         // 1-10
  typeEffet: String,               // Textarea
  duree: String                    // Sélection durée
}
// Total = (montee + intensiteEffets + duree_numeric) / 3
```

---

## 🍪 TYPE 4: COMESTIBLE (Produits Infusés)

### Sections Complètes

#### 1️⃣ Informations Générales
```javascript
generalInfo = {
  productName: String,             // "Brownie au Chocolat"
  marque: String,                  // "Green Kitchen"
  typeComestible: String,          // Pâtisserie|Confiserie|Boisson|etc.
  ingredients: String,             // Textarea
  infoDiet: String[],              // Vegan, Sans gluten, Bio, etc.
  photo: File                      // Image du produit
}
```

**Types de comestibles:**
- Pâtisserie
- Confiserie
- Boisson
- Capsule
- Huile
- Chocolat
- Bonbon
- Gélule
- Autre

**Informations diététiques:**
- Vegan
- Sans gluten
- Sans sucre
- Sans lactose
- Bio
- Halal
- Kasher

#### 2️⃣ Informations sur l'Infusion
```javascript
infusionInfo = {
  matiere: String,                 // "Fleurs sèches"
  cultivars: String,               // "OG Kush, Lemon Haze"
  typeExtrait: String[],           // Distillat, Rosin, RSO, etc.
  thcMg: Number,                   // 0-1000
  cbdMg: Number,                   // 0-1000
  autresCannaMg: Number,           // 0-1000
  terpenes: String                 // Textarea si connu
}
```

#### 3️⃣ Expérience Gustative & Sensorielle (scoring 1-10)
```javascript
gustativeRatings = {
  experience: String,              // Textarea: Description générale
  apparence: Number,               // 1-10
  intensiteOdeur: Number,          // 1-10
  gout: Number,                    // 1-10
  notesDominantes: String,         // Textarea
  notesCannabis: String,           // Textarea: "Présence subtile"
  equilibreSaveurs: String,        // Textarea
  texture: Number,                 // 1-10
  qualiteAlimentaire: Number       // 1-10
}
// Total = (apparence + intensiteOdeur + gout + texture + qualite) / 5
```

#### 4️⃣ Effets & Expérience Psychotrope (scoring 1-10)
```javascript
psychotropicRatings = {
  dosagePris: String,              // "10mg THC"
  tempsMontee: String,             // "<30min"|"30-60min"|"60-90min"|"90min+"
  intensiteMax: Number,            // 1-10
  plateau: String,                 // "<1h"|"1-2h"|"2-4h"|"4h+"
  typeEffet: String                // Textarea
}
// Total = intensiteMax
```

---

## 🔄 PROCESSUS DE SOUMISSION (Frontend + Backend)

### Frontend: Complétion Progressive
```javascript
// src/hooks/useReviewForm.js

export const useReviewForm = (type = 'Fleur') => {
  const [formData, setFormData] = useState({
    type,
    holderName: '',
    description: '',
    photo: null,
    ratings: {},
    terpenes: [],
    tastes: [],
    aromas: [],
    effects: [],
    visibility: 'public',
    isDraft: false
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Validation par étape
  const validateStep = (stepName) => {
    const stepValidations = {
      general: () => {
        if (!formData.holderName.trim()) 
          throw new Error('holderName is required')
      },
      ratings: () => {
        const ratings = Object.values(formData.ratings)
        if (ratings.length === 0) 
          throw new Error('At least one rating required')
      }
    }
    
    try {
      stepValidations[stepName]?.()
      return true
    } catch (err) {
      setErrors(prev => ({ ...prev, [stepName]: err.message }))
      return false
    }
  }

  // Calcul des totaux
  const calculateTotals = () => {
    const sections = productStructures[type]?.sections || []
    const totals = {}
    
    sections.forEach(section => {
      if (section.total && section.totalKeys) {
        const values = section.totalKeys
          .map(key => formData.ratings[key])
          .filter(v => typeof v === 'number')
        
        if (values.length > 0) {
          totals[`total_${section.title}`] = 
            values.reduce((a, b) => a + b, 0) / values.length
        }
      }
    })
    
    return totals
  }

  // Soumission
  const submit = async (asDraft = false) => {
    if (!validateStep('general') || !validateStep('ratings')) {
      return false
    }

    setIsSubmitting(true)
    try {
      const finalData = {
        ...formData,
        isDraft: asDraft,
        totals: calculateTotals()
      }

      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      })

      if (!response.ok) throw new Error('Submission failed')
      
      return await response.json()
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    formData,
    setFormData,
    errors,
    isSubmitting,
    validateStep,
    calculateTotals,
    submit
  }
}
```

### Backend: Validation et Persistence
```javascript
// server-new/routes/reviews.js

router.post('/', requireAuth, upload.array('images', 10), async (req, res) => {
  try {
    const {
      type,
      holderName,
      description,
      ratings,
      terpenes,
      tastes,
      aromas,
      effects,
      isDraft,
      visibility = 'public'
    } = req.body

    // ✅ Validations
    if (!holderName || !type) {
      return res.status(400).json({ 
        error: 'validation_error',
        message: 'holderName and type are required' 
      })
    }

    if (!['Fleur', 'Hash', 'Concentré', 'Comestible'].includes(type)) {
      return res.status(400).json({ 
        error: 'invalid_type',
        message: `Type must be one of: Fleur, Hash, Concentré, Comestible` 
      })
    }

    // Process images
    const images = req.files?.map(file => ({
      filename: file.filename,
      path: `/images/${file.filename}`,
      uploadedAt: new Date()
    })) || []

    const mainImage = images[0]?.filename || null

    // Create review
    const review = await prisma.review.create({
      data: {
        type,
        holderName,
        description: description || null,
        ratings: ratings ? JSON.stringify(ratings) : null,
        terpenes: terpenes ? JSON.stringify(terpenes) : null,
        tastes: tastes ? JSON.stringify(tastes) : null,
        aromas: aromas ? JSON.stringify(aromas) : null,
        effects: effects ? JSON.stringify(effects) : null,
        images: JSON.stringify(images),
        mainImage,
        isPublic: visibility === 'public',
        isDraft: isDraft || false,
        authorId: req.user.id
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
            discordId: true
          }
        }
      }
    })

    res.status(201).json({
      success: true,
      message: `Review ${isDraft ? 'saved as draft' : 'published'} successfully`,
      review: formatReviewResponse(review)
    })
  } catch (error) {
    console.error('Review creation error:', error)
    res.status(500).json({ 
      error: 'server_error',
      message: 'Failed to create review'
    })
  }
})
```

---

## 📝 CHAMPS DYNAMIQUES PAR TYPE

### Matrice Complète de Disponibilité

| Champ | Fleur | Hash | Concentré | Comestible |
|-------|-------|------|-----------|-----------|
| **Informations générales** | | | | |
| Cultivar(s) | ✅ | ✅ | ✅ | ❌ |
| Product Name | ❌ | ❌ | ❌ | ✅ |
| Breeder/Farm | ✅ | ❌ | ❌ | ❌ |
| Type Culture | ✅ | ❌ | ❌ | ❌ |
| Type Extraction | ❌ | ✅ (Pipeline) | ✅ (Type) | ✅ (Extrait) |
| Spectre/Type Comestible | ✅ | ❌ | ❌ | ✅ |
| **Plan Cultural/Production** | | | | |
| Substrats & Systèmes | ✅ | ❌ | ❌ | ❌ |
| Techniques Propagation | ✅ | ❌ | ❌ | ❌ |
| Engrais Organiques | ✅ | ❌ | ❌ | ❌ |
| Engrais Minéraux | ✅ | ❌ | ❌ | ❌ |
| Additifs & Stimulants | ✅ | ❌ | ❌ | ❌ |
| **Post-traitement** | | | | |
| Séparations Chromato | ❌ | ✅ | ✅ | ❌ |
| Fractionnement | ❌ | ✅ | ✅ | ❌ |
| Séparations Physiques | ❌ | ✅ | ✅ | ❌ |
| Purifications Avancées | ❌ | ✅ | ✅ | ❌ |
| **Évaluations** | | | | |
| Visuel & Technique | ✅ (4 critères) | ✅ (3 critères) | ✅ (6 critères) | ✅ (Apparence) |
| Odeur | ✅ | ✅ | ✅ | ✅ |
| Texture | ✅ | ✅ | ✅ | ✅ |
| Goût/Saveur | ✅ | ✅ | ✅ | ✅ |
| Expérience Fumée | ✅ | ✅ | ✅ | ❌ |
| Expérience Inhalation | ❌ | ❌ | ✅ | ❌ |
| Effet | ✅ | ✅ | ✅ | ✅ |

---

## 🔐 Validation Complète

### Règles Globales
```javascript
const validationRules = {
  // Types acceptés
  type: (v) => ['Fleur', 'Hash', 'Concentré', 'Comestible'].includes(v),
  
  // Champs obligatoires
  holderName: (v) => v && v.trim().length > 0 && v.length <= 100,
  
  // Ratings (0-10)
  rating: (v) => typeof v === 'number' && v >= 0 && v <= 10,
  
  // Arrays
  terpenes: (v) => Array.isArray(v) && v.length <= 8,
  images: (v) => Array.isArray(v) && v.length <= 10,
  
  // Files
  image: (f) => {
    if (!f) return true // Optional
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    return validTypes.includes(f.type) && f.size <= 10 * 1024 * 1024
  },
  
  // Visibilité
  visibility: (v) => ['public', 'private', 'authenticated'].includes(v)
}
```

### Erreurs Typiques et Corrections
```javascript
const errorHandling = {
  missingHolderName: 'Veuillez entrer le nom du produit/cultivar',
  invalidRating: 'Les notes doivent être entre 0 et 10',
  tooManyTerpenes: 'Maximum 8 terpènes autorisés',
  imageTooLarge: 'Maximum 10MB par image',
  noRatings: 'Au moins une évaluation est requise',
  invalidType: 'Type de produit invalide'
}
```

---

## 🎯 Cas d'Usage Avancés

### Scénario 1: Remplissage Progressif (Brouillon)
```javascript
// Utilisateur sauvegarde le brouillon à chaque étape
const saveDraft = async (currentFormData) => {
  const response = await fetch('/api/reviews', {
    method: 'POST',
    body: JSON.stringify({
      ...currentFormData,
      isDraft: true
    })
  })
  
  const draft = await response.json()
  // Rediriger vers l'édition du brouillon
  navigate(`/edit/${draft.review.id}`)
}
```

### Scénario 2: Duplication de Review
```javascript
const duplicateReview = async (sourceReviewId) => {
  const sourceReview = await fetch(`/api/reviews/${sourceReviewId}`)
    .then(r => r.json())
  
  // Copier tous les champs sauf ID/dates
  const newReview = {
    ...sourceReview,
    holderName: `${sourceReview.holderName} (Copie)`
  }
  
  return await submitReview(newReview)
}
```

### Scénario 3: Import Bulk (Lot)
```javascript
const importBulkReviews = async (csvFile) => {
  const text = await csvFile.text()
  const reviews = Papa.parse(text, { header: true }).data
  
  const results = []
  for (const review of reviews) {
    try {
      const result = await submitReview(review)
      results.push({ status: 'success', id: result.review.id })
    } catch (err) {
      results.push({ status: 'error', message: err.message })
    }
  }
  
  return results
}
```

### Scénario 4: Comparaison Multi-Produits
```javascript
const compareReviews = async (reviewIds) => {
  const reviews = await Promise.all(
    reviewIds.map(id => fetch(`/api/reviews/${id}`).then(r => r.json()))
  )
  
  // Aligner les ratings pour comparer
  const comparison = {
    labels: reviews.map(r => r.holderName),
    datasets: [
      {
        label: 'Apparence',
        data: reviews.map(r => r.ratings?.apparence || 0)
      },
      // ... autres ratings
    ]
  }
  
  return comparison // Pour graphique radar
}
```

---

## 📊 Calculs et Totaux

### Formules de Calcul Automatique
```javascript
const calculateTotals = (section, ratings) => {
  const sections = {
    'Visuel et Technique': ['densite', 'trichome', 'pistil', 'manucure'],
    'Odeur': ['intensiteOdeur'],
    'Texture': ['durete', 'densiteTexture', 'elasticite', 'collant'],
    'Goûts & Expérience fumée': ['intensiteFumee', 'agressivite', 'cendre'],
    'Effet': ['montee', 'intensiteEffet']
  }
  
  const keys = sections[section] || []
  const values = keys
    .map(k => ratings[k])
    .filter(v => typeof v === 'number')
  
  if (values.length === 0) return null
  return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1)
}

// Score Global (moyenne de tous les totaux)
const calculateGlobalScore = (allRatings) => {
  const sections = [
    'Visuel et Technique',
    'Odeur',
    'Texture',
    'Goûts & Expérience fumée',
    'Effet'
  ]
  
  const totals = sections
    .map(s => calculateTotals(s, allRatings))
    .filter(v => v !== null)
    .map(v => parseFloat(v))
  
  if (totals.length === 0) return null
  return (totals.reduce((a, b) => a + b, 0) / totals.length).toFixed(1)
}
```

---

## 🔄 Migration depuis l'Ancien Système

### Mapping Old → New
```javascript
const migrateReview = (oldReview) => {
  return {
    // Champs directs
    holderName: oldReview.productName || oldReview.cultivarName,
    description: oldReview.notes,
    type: oldReview.productType,
    
    // Ratings (parsage depuis ancien format)
    ratings: {
      apparence: oldReview.apparence_score,
      arome: oldReview.arome_score,
      gout: oldReview.gout_score,
      texture: oldReview.texture_score,
      effet: oldReview.effet_score
    },
    
    // Tags
    terpenes: oldReview.terpenes || [],
    effects: oldReview.effects || [],
    
    // Métadonnées
    isDraft: oldReview.isDraft || false,
    isPublic: !oldReview.isPrivate
  }
}
```

---

## ✅ Checklist de Complétion

### Avant la Soumission
- [ ] `holderName` rempli (non-vide)
- [ ] Type de produit sélectionné
- [ ] Au moins une évaluation complétée
- [ ] Image uploadée (optionnel mais recommandé)
- [ ] Visibilité définie
- [ ] Accord avec la politique

### Après la Soumission
- [ ] Redirection vers la review créée
- [ ] Confirmation toast affichée
- [ ] Historique mis à jour
- [ ] Brouillon supprimé si applicable
- [ ] Email de confirmation envoyé (si applicable)

---

## 🚀 Prochaines Étapes

1. **Implémenter le formulaire React** complet pour chaque type
2. **Ajouter validation progressive** (par étape)
3. **Créer composants réutilisables** (RatingSlider, TagSelector, etc.)
4. **Tester tous les scénarios** d'edge cases
5. **Optimiser performance** (lazy loading, pagination)

---

**Fin du Guide Exhaustif**
