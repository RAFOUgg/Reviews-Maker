# 🌿 FLEURS - Quick Reference Card

*One-page cheat sheet for all Fleur documentation*

---

## 📊 9 Sections de la Review

```
1. INFOS GÉNÉRALES        → Nom, photos, cultivar, farm, type
2. GÉNÉTIQUES            → Breeder, variété, %, traits, généalogie  
3. PIPELINE CULTURE ⚙️   → Culture tracking (3D: plan+temps)
4. VISUEL & TECHNIQUE    → Couleur/10, Densité/10, Trichomes/10, etc.
5. ODEURS                → Notes dominantes/secondaires, intensité
6. TEXTURE               → Dureté/10, Densité/10, Élasticité/10, Collant/10
7. GOÛTS                 → Intensité/10, Agressivité/10, flaveur
8. EFFETS RESSENTIS      → Montée/10, Intensité/10, profils effets (8 max)
9. PIPELINE CURING       → Post-récolte tracking
```

---

## ⚙️ SECTION 3: 9 Groupes de Données (Presets Réutilisables)

```
1. ESPACE DE CULTURE      → Mode, type, dimensions, surface, volume, densité
2. SUBSTRAT               → Type (solide/hydro), volume, composition %, marques, pH, EC
3. IRRIGATION             → Système, source, schedule, volume, fréquence, suppléments
4. ENGRAIS/NUTRITION      → Marque, type (bio/chimique), produits, dosages, schedule
5. LUMIÈRE                → Type (LED/HPS/etc), power, spectrum, distance, schedule, PPFD
6. CLIMAT                 → Ventilation, targets par phase (temp, humidity, CO2)
7. PALISSAGE              → Techniques (SCROG/SOG/LST/etc), start week, recovery
8. MORPHOLOGIE            → Measurements: hauteur, volume, poids, branches, buds, health
9. RÉCOLTE & FINITION     → Date, trichomes, poids brut/sec, rendements, drying params
```

---

## 📅 Modes Pipeline SECTION 3

| Mode | Granularité | Example | Cas Usage |
|------|------------|---------|-----------|
| **JOURS** | 1 jour = 1 case | Day 1, Day 42, ... (365 max) | Tracking quotidien |
| **SEMAINES** | 1 semaine = 1 case | W1, W2, ..., W52 | Logging hebdo |
| **PHASES** | 12 phases fixes | Germination, Plantule, Croissance-début/milieu/fin, Stretch-début/milieu/fin, Floraison-début/milieu/fin | Culture standardisée |

---

## 📦 Système Presets

**Chaque groupe → Sauvegardable comme Preset**

```
Preset Structure:
├─ ID unique
├─ Name ("Setup Indoor LED 3x3")
├─ Group ("space", "substrate", ...)
├─ Data (JSON structure du groupe)
├─ Usage count
├─ Last used date
├─ Personal rating ⭐
└─ Personal notes
```

**Bénéfices**:
- Gain UX: 80% moins de saisie
- Consistance entre reviews
- Analytics: meilleurs setups identifiables
- Réutilisabilité: même setup dans plusieurs reviews

---

## 🗂️ Bibliothèque Utilisateur

```
📚 MA BIBLIOTHÈQUE
├─ 🌿 FICHES TECHNIQUES FLEURS
│  └─ [Reviews complètes avec toutes sections]
├─ 🏗️ GROUPES DONNÉES RÉUTILISABLES (par type)
│  ├─ Setups Environnement (Indoor LED, Outdoor, etc.)
│  ├─ Setups Substrat (Bio, Hydro, Coco, etc.)
│  ├─ Setups Irrigation (Goutte-à-goutte, NFT, etc.)
│  ├─ Setups Nutrition (Biobizz, Canna, etc.)
│  ├─ Setups Lumière (LED 300W, HPS 600W, etc.)
│  ├─ Setups Climat (Targets végétatif, floraison, etc.)
│  └─ Setups Techniques (SCROG, Main-Lining, etc.)
├─ 🧬 CULTIVARS (conservés avec historique)
└─ ⚙️ PRÉFÉRENCES GLOBALES
```

---

## 🔄 Workflow Complet Création Review

```
1. Créer Review (type: Fleur)
   ├─ SECTION 1: Infos générales (5 min)
   ├─ SECTION 2: Génétiques (5 min)
   │
   ├─ SECTION 3: Pipeline Culture (20-30 min)
   │  ├─ Choix Mode (Jours/Semaines/Phases)
   │  ├─ Dates culture
   │  ├─ Charger/Créer 9 Groupes
   │  │  └─ À chaque: "Enregistrer comme preset?" ✅
   │  └─ Remplir étapes (auto-générées)
   │
   ├─ SECTIONS 4-8: Évaluations (15-20 min)
   │  └─ Saisie scores + observations
   │
   └─ SECTION 9: Pipeline Curing (optionnel, post-récolte)

2. Pendant culture:
   └─ Étapes mises à jour selon mode

3. À récolte:
   └─ Remplissage SECTION 9 (curing tracking)

4. À fin curing:
   ├─ Test final
   ├─ Remplissage final SECTIONS 4-8
   └─ Review COMPLÉTÉE ✅

5. Export:
   └─ Template + format (PNG/PDF/JSON/CSV/etc.)
```

---

## 📊 9 Groupes: Données Clés

### 1. ESPACE DE CULTURE
```
cultureMode: "indoor" | "outdoor" | "greenhouse" | "no-till" | "aquaponie"
spaceType: "tent" | "cabinet" | "room" | "greenhouse" | "outdoor"
dimensions: L×l×H (cm/m)
→ Auto-calc: surface (m²), volume (m³)
plantingDensity: plants/m²
```

### 2. SUBSTRAT
```
type: "solide" | "hydro" | "aero"
volumeTotal: L
composition[]:
  ├─ component (terre, coco, perlite, laine_roche, etc.)
  ├─ percentage (sum = 100%)
  ├─ brand
  └─ specificProps (ex: taille grain perlite)
ph, ec (optionnel)
```

### 3. IRRIGATION
```
system: "drip" | "manual" | "flood" | "NFT" | "DWC" | "aero"
waterSource: "tap" | "rain" | "source" | "RO" | "distilled"
schedule: frequency (daily/weekly), timesPerDay
volumePerWatering: L
ph, ec, temperature: eau
runoffPercentage: %
supplementation[]: array nutrients
```

### 4. ENGRAIS
```
brand: autocomplete
type: "organic" | "mineral" | "organomineral" | "hydro"
lines[]:
  ├─ product: name
  ├─ stage: "veg" | "flowering"
  ├─ dosage: ml/L or g/L
  ├─ frequency: every_watering | weekly | etc.
  ├─ npk: "7-9-5"
  └─ weeks: [1-4] | [5-10] | etc.
```

### 5. LUMIÈRE
```
lampType: "LED" | "HPS" | "CFL" | "naturel" | "mixte"
quantity: nombre
totalPower: W
spectrum: "full" | "blue" | "red" | "custom"
distance: cm (ajustable)
schedule par phase:
  ├─ vegetative: 16h/day
  ├─ pre_flowering: 14h/day
  └─ flowering: 12h/day
ppfd (µmol/m²/s), dli (mol/m²/day), kelvin: optionnel
```

### 6. CLIMAT
```
ventilation: type, power, frequency
targets per phase:
  ├─ temperature: min/optimal/max (°C)
  ├─ humidity: min/optimal/max (%)
  └─ CO2: ppm (default 400, optional enrichment)
```

### 7. PALISSAGE
```
techniques[]:
  ├─ technique: "LST" | "HST" | "SCROG" | "SOG" | "defoliation" | etc.
  ├─ startWeek: number
  ├─ description: textarea
  ├─ expectedOutcome: string
  ├─ tools: array
  └─ recoveryDays: number
```

### 8. MORPHOLOGIE (Observations)
```
height: cm/m
volume: L/m³
weight: g (estimated)
branches: number
nodes: number
estimatedBuds: number
stemThickness: cm
leafColor: "light_green" | "deep_green" | "purple" | etc.
healthScore: 1-10
```

### 9. RÉCOLTE
```
harvestDate: date
trichromeAnalysis:
  ├─ percentage_clear: 0-100
  ├─ percentage_cloudy: 0-100 (optimal 60-80)
  └─ percentage_amber: 0-100 (optimal 10-30)
weights:
  ├─ weightBrut: g
  ├─ weightAfterDefoliation: g
  ├─ weightDry: g
  └─ weightCured: g
yields:
  ├─ gramsPerPlant: auto-calc
  ├─ gramsPerM2: auto-calc
  ├─ gramsPerWatt: auto-calc
  └─ dryYieldPercentage: auto-calc
drying: method, temp, humidity, duration
```

---

## 🎛️ Modèles Prisma (Essentials)

```typescript
// Reusable preset for each data group
model CultureSetup {
  id, userId, name, description
  group: "space" | "substrate" | "irrigation" | ...
  data: Json                    // Full group structure
  usageCount, usedInReviews
  personalRating, personalNotes
  createdAt, updatedAt
}

// Main pipeline
model Pipeline {
  id, reviewId
  type: "culture" | "curing" | "separation" | ...
  mode: "days" | "weeks" | "phases"
  startDate, endDate, estimatedDuration
  activeSetups: String[]         // CultureSetup IDs
  stages: PipelineStage[]
}

// Individual stage/event
model PipelineStage {
  id, pipelineId
  stageNumber, intervalType, intervalLabel
  scheduledDate, actualDate
  dataChanges: Json              // Group modifications
  observations, photos[], event
  eventData: Json                // Event-specific data
  usedSetupId                    // Link to CultureSetup
}
```

---

## 🛣️ Implementation Roadmap (7 Phases)

| Phase | Duration | Focus |
|-------|----------|-------|
| 1 | 2 weeks | Prisma models, API stubs, seed data |
| 2 | 2 weeks | Frontend SECTIONS 1-2 |
| 3 | 4 weeks | Frontend SECTION 3 (Pipeline - core) |
| 4 | 3 weeks | Frontend SECTIONS 4-9 |
| 5 | 3 weeks | Integrations, backend completion |
| 6 | 2 weeks | QA, polish, documentation |
| 7 | 1 week | Launch |
| **TOTAL** | **17 weeks (~4 months)** | Full implementation |

---

## 🎯 Success Criteria

✅ **Technical**:
- All sections + pipeline working
- Presets save/load correctly
- API response <200ms
- 100+ stages auto-generated correctly

✅ **UX**:
- Form completion: ~45 min/review
- 70%+ users save presets (reusability)
- Mobile parity: 90%
- Apple-like design maintained

✅ **Exhaustivité**:
- All 9 sections complete
- All data groups captured
- 3D traçabilité (time + space)
- Presets library operational

---

## 📞 Quick Navigation

| Need | Document |
|------|----------|
| Big picture | SYNTHESE_ARCHITECTURE.md |
| All fields/sections | INDEX.md |
| SECTION 3 quick view | SECTION_3_DATA.md |
| SECTION 3 detailed | SECTION_3_DATA_COMPLETE.md |
| Implementation (DB) | PRISMA_MODELS.md |
| Development plan | ROADMAP_IMPLEMENTATION.md |
| This card | QUICK_REFERENCE.md |

---

**Last Updated**: 2024-01-15
**Print this or bookmark it!** 🚀
