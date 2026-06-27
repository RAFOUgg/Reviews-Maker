> ⚠️ **Document historique** : spec détaillée champ-par-champ du Pipeline Culture, écrite avant l'implémentation réelle. Décrit un modèle de stockage (`pipeline: { mode: enum {...} }`) différent du code actuel (`FlowerReview.cultureTimelineConfig`/`cultureTimelineData`, JSON string). Voir [PAGES/CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md](./PAGES/CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md) pour l'état réel vérifié 2026-06-19. Conservé ci-dessous comme référence de l'intention de design originale (les 3 modes Jours/Semaines/Phases sont bien implémentés).

# SECTION 3 - PIPELINE CULTURE (Fleurs)

## 📋 Finalité
Documenter toutes les étapes de culture d'une plante, de la graine à la récolte, avec tracking données et modifications observations.

**Permissions:** Producteur uniquement
**Visualisation:** Calendrier Github-style ou Timeline

---

## 🎯 Configuration Pipeline

### FIELD 3.1: Mode Temporel (Sélection)

**Type de donnée:** `radio-select`
**Obligatoire:** ✅ OUI
**Choix:** 3 options mutuellement exclusives

```
Choisir mode documentation:

○ JOURS
  └─ Dates début/fin obligatoires
  └─ Chaque case = 1 jour calendrier
  └─ Max 365 jours affichés
  └─ Granularité: Très détaillée
  └─ Usage: Documentations méticuleuses, courts cycles

○ SEMAINES  
  └─ Semaine début obligatoire (ex: S1)
  └─ Semaine fin facultatif
  └─ Chaque case = 1 semaine (S1-S52)
  └─ Granularité: Modérée
  └─ Usage: Standard, cultures 3-4 mois

○ PHASES (Prédéfinies)
  └─ 12 phases fixes automatiques
  └─ Chaque case = 1 phase
  └─ Granularité: Moins détaillée
  └─ Usage: Vue d'ensemble, comparaison variétés
```

**Comportement:**
- ❌ Impossible changer mode après création
- Créer nouveau pipeline si besoin autre mode
- Affichage UI s'adapte automatiquement

**Validations:**
- ❌ Aucun choix sélectionné
- ✅ Un seul mode à la fois

**Stockage BDD:**
```typescript
pipeline: {
  mode: enum { DAYS | WEEKS | PHASES }
}
```

---

### FIELD 3.2: Dates Culture (si mode JOURS ou SEMAINES)

#### A. Mode JOURS

**FIELD 3.2a: Date Début Culture**
- **Type:** `date-picker`
- **Obligatoire:** ✅ OUI
- **Format:** YYYY-MM-DD
- **Constraints:** Pas future date (max aujourd'hui)
- **Exemple:** 2024-10-01

**FIELD 3.2b: Date Fin Culture (Récolte)**
- **Type:** `date-picker`
- **Obligatoire:** ✅ OUI
- **Format:** YYYY-MM-DD
- **Constraints:** >= Date Début
- **Exemple:** 2024-12-30

**Auto-calcul:**
- Durée totale = Fin - Début
- Affichage: "Durée: 90 jours"
- Nombre phases suggéré

#### B. Mode SEMAINES

**FIELD 3.2c: Semaine Début**
- **Type:** `number-picker` OR `date-picker`
- **Obligatoire:** ✅ OUI
- **Range:** 1-52
- **Exemple:** S1 (semaine 1)

**FIELD 3.2d: Semaine Fin**
- **Type:** `number-picker` OR `date-picker`
- **Obligatoire:** ❌ NON (facultatif)
- **Range:** >= Semaine Début
- **Exemple:** S16 (semaine 16)

**Comportement:**
- Si Fin vide: Affiche jusqu'à semaine actuelle
- Auto-calcul: "16 semaines documentées"

#### C. Mode PHASES

**Auto-populated:**
- 12 phases fixes générées automatiquement
- Pas de champs date à remplir
- Durées estimées affichées

**Phases Prédéfinies:**
```
Phase 0:  Graine (avant plantation)
Phase 1:  Germination (0-7 jours)
Phase 2:  Plantule (7-14 jours)
Phase 3:  Croissance Début (2-3 semaines)
Phase 4:  Croissance Milieu (3-4 semaines)
Phase 5:  Croissance Fin (4-6 semaines)
Phase 6:  Stretch Début (6-8 semaines)
Phase 7:  Stretch Milieu (8-9 semaines)
Phase 8:  Stretch Fin (9-10 semaines)
Phase 9:  Floraison Début (10-13 semaines)
Phase 10: Floraison Milieu (13-18 semaines)
Phase 11: Floraison Fin / Récolte (18-24 semaines)
```

**Stockage BDD:**
```typescript
pipeline: {
  startDate: DateTime? // Si DAYS
  endDate: DateTime?   // Si DAYS
  startWeek: Int?      // Si WEEKS
  endWeek: Int?        // Si WEEKS
  totalDuration: Int   // Auto-calculated
  durationUnit: enum { DAYS | WEEKS | PHASES }
}
```

---

## 🎯 Données Paramétrales (Configuration Générale)

### FIELD 3.3: Mode de Culture

**Type de donnée:** `select` (single)
**Obligatoire:** ✅ OUI

**Valeurs possibles:**
```
○ Indoor (intérieur, contrôlé)
○ Outdoor (extérieur, naturel)
○ Greenhouse (serre, semi-contrôlé)
○ No-till (sol vivant, régénératif)
○ Autre (hybride, aquaponique, etc)
```

**Impacts:**
- Détermine données environnement disponibles
- Tips suggestions adapté au mode
- Aide comparaison galerie

**Exemples:**
- "Indoor" → Éclairage artificiel tracked
- "Outdoor" → Saisons, photopériode naturelle
- "Greenhouse" → Mix temperature/light control

**Stockage BDD:**
```typescript
pipelineConfig: {
  cultivationMode: enum {
    INDOOR
    OUTDOOR
    GREENHOUSE
    NO_TILL
    OTHER
  }
}
```

---

### FIELD 3.4: Espace de Culture

#### 3.4a: Type Espace

**Type:** `select` (single)
**Obligatoire:** ✅ OUI

**Valeurs possibles:**
```
○ Armoire de culture
○ Tente de culture
○ Serre
○ Extérieur
○ Pièce complète
○ Balcon/Terrasse
○ Jardin (outdoor)
○ Autre
```

#### 3.4b: Dimensions

**Type:** `text-input` (3 fields)
**Obligatoire:** ✅ OUI
**Format:** "L x l x H"
**Unités:** `select` (cm OU m)

**Exemples valides:**
- "80 x 80 x 160 cm" (tente standard)
- "1.2 x 1.0 x 2.0 m"
- "Custom dimensions"

**Calculs Auto:**
- Surface sol: L × l
- Volume total: L × l × H
- Affichage: "Surface: 0.64m² | Volume: 1.024m³"

#### 3.4c: Surface Au Sol

**Type:** `auto-calculated`
**Valeur:** L × l (en m²)
**Affichage:** "0.64 m²"
**Editable:** Oui (override auto)

#### 3.4d: Volume Total

**Type:** `auto-calculated`
**Valeur:** L × l × H (en m³)
**Affichage:** "1.024 m³"
**Editable:** Oui (override auto)

**Validations:**
- ❌ Dimensions = 0
- ❌ Dimensions impossibles (< 0.3m)
- ✅ Auto-calcul

**Stockage BDD:**
```typescript
pipelineConfig: {
  growSpaceType: enum { TENT | CABINET | GREENHOUSE | OUTDOOR | etc }
  dimensions: {
    length: number
    width: number
    height: number
    unit: enum { CM | M }
    lengthM: number // Auto en mètres
    widthM: number
    heightM: number
    floorArea: number // m²
    totalVolume: number // m³
  }
}
```

---

## 🎯 Données Environnement (par étape)

### Structure Générale

**Chaque étape pipeline (jour/semaine/phase) peut contenir:**

```json
{
  "stage": {
    "stageName": "Croissance J15",
    "timestamp": "2024-10-15T10:00:00Z",
    "measurements": { ... },
    "observations": "...",
    "images": [...],
    "modifiedSections": { ... }
  }
}
```

---

### FIELD 3.5: Technique Propagation

**Enregistre:** Une seule fois (généralement Stage 0/Phase 0)
**Type:** `select` (single)
**Obligatoire:** ✅ OUI

**Valeurs possibles:**
```
○ Graine (directement en pot/sol)
○ Graine (germination humidité d'abord)
○ Clone (bouture de plante existante)
○ Bouture (sans racines)
○ Sopalin (germination papier)
○ Coton (coton imbibé)
○ Serviette humide
○ Rockwool cube
○ Jiffy pellets
○ Aeroponic rooting
○ Autre
```

**Affichage:**
- Explications courtes pour chaque méthode
- Tips d'optimisation

**Stockage:**
```typescript
measurements: {
  propagationMethod: enum { ... }
}
```

---

### FIELD 3.6: Substrat

#### 3.6a: Type Substrat

**Type:** `select` (single)
**Obligatoire:** ✅ OUI

**Valeurs possibles:**
```
○ Hydroponique (eau + nutrients)
├─ Deep Water Culture (DWC)
├─ Nutrient Film Technique (NFT)
├─ Flood & Drain
└─ Drip Irrigation

○ Bio-organique
├─ Terre + compost
├─ Composé bio-certifié
└─ Super-soil

○ Substrat Inerte
├─ Coco (fiber de coco)
├─ Laine de roche
├─ Perlite
├─ Tourbe
├─ Mix (coco+perlite)
└─ Mix custom

○ Système No-Till
├─ Sol vivant permanent
├─ Amendements réguliers
└─ Réutilisation
```

#### 3.6b: Volume Substrat

**Type:** `number-input`
**Obligatoire:** ✅ OUI
**Unité:** `select` (L OU gallons)
**Exemples:** 11L, 20L, 50L

#### 3.6c: Composition (%)

**Type:** `multi-field` avec sliders
**Obligatoire:** ✅ OUI si substrat inerte
**Constraint:** Total doit = 100%

**Composition Standard:**
```
Terre/Tourbe:      [========|] 50%
Coco Fiber:        [|========] 30%
Perlite/Vermiculite:[||======] 15%
Autres améliorants: [||======] 5%
Total:             100% ✓
```

**Composants Available:**
- Terre noire / Tourbe
- Fiber de coco
- Perlite
- Vermiculite
- Laine roche
- Charbon actif
- Compost
- Worm castings
- Mycorrhizae powder
- Custom amendments

#### 3.6d: Marques Ingrédients

**Type:** `tags-input`
**Obligatoire:** ❌ NON (recommandé)
**Exemple:** "BioBizz, Canna Coco, Perlite standard"

**Format:**
```
[BioBizz] [Plagron] [Canna] [+ Ajouter marque]
```

**Stockage:**
```typescript
measurements: {
  substrate: {
    type: enum { HYDRO | BIO | INERT | NO_TILL }
    volume: number
    volumeUnit: enum { LITERS | GALLONS }
    composition: {
      peat: number? // % 0-100
      cocoFiber: number?
      perlite: number?
      vermiculite: number?
      rockWool: number?
      compost: number?
      other: string?
      total: number // Must = 100
    },
    brands: string[]
  }
}
```

---

### FIELD 3.7: Système d'Irrigation

#### 3.7a: Type Système

**Type:** `select` (single)
**Obligatoire:** ✅ OUI

**Valeurs:**
```
○ Goutte à goutte (drip)
○ Inondation/Drainage (flood & drain)
○ Manuel (arrosoir)
○ Spray automatique
○ Brumisateur (misting)
○ Subirrigation (bottom watering)
○ Aeroponic
○ NFT (Nutrient Film Technique)
○ DWC (Deep Water Culture)
○ Otro
```

#### 3.7b: Fréquence Arrosage

**Type:** `select` + `number`
**Obligatoire:** ✅ OUI

**Format:** "[Nombre] [Période]"

**Exemples valides:**
```
1 fois par jour
2 fois par jour
3 fois par semaine
1 fois par semaine
Manually (varies)
```

#### 3.7c: Volume Eau par Arrosage

**Type:** `number-input`
**Obligatoire:** ✅ OUI
**Unité:** `select` (L OU mL)

**Exemples:** "2L", "500mL", "5 gallons"

**Règle doigt:** ~20-30% drain (runoff)

**Stockage:**
```typescript
measurements: {
  irrigation: {
    type: enum { DRIP | FLOOD_DRAIN | MANUAL | etc }
    frequency: string // "1 per day", "3 per week"
    volumePerWatering: number
    volumeUnit: enum { LITERS | ML | GALLONS }
  }
}
```

---

### FIELD 3.8: Nutriments / Engrais

**Type:** `complex-repeatable`
**Obligatoire:** ❌ NON (recommandé)
**Max fertilizers:** 10

**Pour Chaque Engrais:**

#### 3.8a: Identification Engrais

- **Type:** `select` - "Bio" | "Chimique" | "Minéral" | "Hybride"
- **Marque:** `autocomplete-select` (données récurrentes)
- **Gamme produit:** `text` - "Advanced Nutrients 3-part" | "BioBizz" | custom

#### 3.8b: Dosage

- **Quantité:** `number`
- **Unité:** `select` - "g/L" | "ml/L" | "ppm" | "EC" | "TDS"
- **Exemple:** "2 ml/L" OU "600 ppm"

#### 3.8c: Fréquence Application

- **Période:** `select` - "À chaque arrosage" | "2x/semaine" | "1x/semaine" | "1x/mois"
- **Phases appliqué:** `multi-select` - Croissance | Stretch | Floraison | All

#### 3.8d: Notes Spéciales

- `textarea` (200 chars max)
- Exemple: "Réduire pendant Stretch, augmenter Floraison"

**Interface Ajout:**
```
[+ Ajouter Engrais]
  ├─ Marque: [BioBizz Grow] ✓
  ├─ Type: [Bio] ✓
  ├─ Dosage: 2 ml/L ✓
  ├─ Fréquence: À chaque arrosage ✓
  ├─ Phases: [Croissance] [Stretch] ✓
  ├─ Notes: "..."
  └─ [Ajouter] [Annuler]

[Fertilizer 1] [Fertilizer 2] [...]
```

**Stockage:**
```typescript
measurements: {
  fertilizers: [
    {
      type: enum { BIO | CHEMICAL | MINERAL | HYBRID }
      brand: string
      product: string
      dosage: number
      dosageUnit: enum { G_L | ML_L | PPM | EC | TDS }
      frequency: string
      phasesApplied: enum[]
      notes: string?
    }
  ]
}
```

---

### FIELD 3.9: Lumière

#### 3.9a: Type Lampe

**Type:** `select` (single)
**Obligatoire:** ✅ OUI si Indoor

**Valeurs:**
```
○ LED (technologie moderne)
├─ LED Full Spectrum
├─ LED Red/Blue
├─ LED COB (Chip-on-Board)
└─ LED Quantum Board

○ HPS/HM (Sodium/Halogénure)
├─ HPS (Sodium haute pression)
├─ MH (Halogénure métallique)
└─ Mix HPS+MH

○ CFL (Fluorescent compact)

○ Naturel (fenêtre, serre outdoor)

○ Mixte (multiple types)

○ LED + HPS (combinaison)
```

#### 3.9b: Spectre Lumière

**Type:** `multi-select` (si applicable)
**Obligatoire:** ❌ NON

**Options:**
```
□ Complet (400-700nm)
□ Bleu (400-500nm, croissance)
□ Rouge (600-700nm, floraison)
□ UV-A (supportant)
□ IR (chaleur supplément)
□ Autre spectre personnalisé
```

#### 3.9c: Distance Lampe/Plante

**Type:** `number-input`
**Obligatoire:** ✅ OUI si Indoor
**Unité:** `select` (cm OU m OU pieds)
**Exemple:** "30 cm" OU "1 pied"

**Règles:**
- Se réduit à mesure croissance plante
- Ajustement recommandé par semaine

#### 3.9d: Puissance Totale

**Type:** `number-input`
**Obligatoire:** ✅ OUI si Indoor
**Unité:** Watts (W)
**Exemple:** "600W LED" OU "1000W HPS"

#### 3.9e: Durée Éclairage Quotidienne

**Type:** `time-picker` OU `number/select`
**Obligatoire:** ✅ OUI
**Format:** "HH:MM" OU heures
**Exemple:** "18:00" (18 heures) OU "12 hours"

**Suggestions par phase:**
- Croissance: 18-24h
- Stretch/Floraison: 12h
- Outdoor: Photopériode naturelle

#### 3.9f: DLI (Optionnel, avancé)

**Type:** `number-input`
**Obligatoire:** ❌ NON
**Unité:** "mol/m²/jour"
**Exemple:** "25" OU "35"
**Range recommandé:** 15-35 selon espèce/phase

#### 3.9g: PPFD (Optionnel, avancé)

**Type:** `number-input`
**Obligatoire:** ❌ NON
**Unité:** "µmol/m²/s" (micromol par m² par seconde)
**Exemple:** "400" OU "600"
**Range:** 200-1000 typique

#### 3.9h: Température Couleur (Kelvin)

**Type:** `number-input` OU `slider`
**Obligatoire:** ❌ NON (recommandé)
**Unité:** "°K" (Kelvins)
**Range:** 3000-6500 typique
**Exemples:**
- 3000K = Rougissant (floraison)
- 4000K = Neutre
- 6500K = Bleuissant (croissance)

**Stockage:**
```typescript
measurements: {
  lighting: {
    lampType: enum { LED | HPS | MH | CFL | NATURAL | MIXED }
    spectrum: enum[] // FULL | BLUE | RED | UV | IR
    distanceFromPlant: number
    distanceUnit: enum { CM | M | FEET }
    totalPower: number // Watts
    lightingDuration: string // "18:00" or "18 hours"
    dli: number? // mol/m²/jour
    ppfd: number? // µmol/m²/s
    kelvin: number? // °K
  }
}
```

---

### FIELD 3.10: Environnement (Température/Humidité/CO₂)

#### 3.10a: Température Moyenne

**Type:** `number-input`
**Obligatoire:** ✅ OUI
**Unité:** `select` (°C OU °F)
**Exemple:** "23.5°C" OU "74°F"

**Ranges recommandés:**
- Croissance: 20-26°C
- Floraison: 18-24°C
- Jour/Nuit: différence 3-5°C optimal

#### 3.10b: Humidité Relative Moyenne

**Type:** `number-input` + slider
**Obligatoire:** ✅ OUI
**Unité:** "%" (0-100)
**Exemple:** "65%"

**Ranges recommandés:**
- Croissance: 50-70%
- Stretch: 40-60%
- Floraison: 40-50%

#### 3.10c: CO₂ (Optionnel, avancé)

**Type:** `number-input`
**Obligatoire:** ❌ NON
**Unité:** "ppm" (parties par million)
**Range:** 400-1500 ppm
**Exemples:**
- 400 ppm = Ambient naturel
- 800-1200 ppm = Supplément optimization
- > 1500 ppm = Toxique plante

#### 3.10d: Ventilation

**Type:** `text-input`
**Obligatoire:** ❌ NON

**Exemples:**
- "Ventilateur extraction 200 m³/h"
- "Ventilo intérieur 60cm 3 vitesses"
- "Circulation air passive"
- "AC split 12000 BTU"

**Fréquence ventilation:**
- `number` + `select` - "2 fois par jour" | "Continu" | "Manual"

**Stockage:**
```typescript
measurements: {
  environment: {
    temperature: number // °C
    temperatureUnit: enum { C | F }
    humidity: number // 0-100%
    co2: number? // ppm
    ventilation: {
      type: string
      frequency: string
      notes: string?
    }
  }
}
```

---

### FIELD 3.11: Palissage / Defoliation / Techniques

#### 3.11a: Méthodologies Entraînement

**Type:** `multi-select` (checkboxes)
**Obligatoire:** ❌ NON
**Exemple technique:**
```
□ SCROG (Screen of Green)
□ SOG (Sea of Green)
□ Main-Lining
□ Topping
□ FIM (Fuck I Missed)
□ LST (Low Stress Training)
□ HST (High Stress Training)
□ Supercropping
□ Defoliation (feuillage partiel)
□ Lollipopping (suppression bas)
□ Autre [text]
```

#### 3.11b: Description Manipulation

**Type:** `textarea`
**Obligatoire:** ❌ NON
**Max:** 500 chars

**Exemples:**
- "SCROG grid 60x80cm appliqué J21, tucking quotidien"
- "Topped une fois à 4ème nœud, puis LST légère"
- "Defoliation 30% feuilles grandes semaine avant floraison"

**Stockage:**
```typescript
measurements: {
  trainingMethods: enum[]
  trainingNotes: string?
}
```

---

### FIELD 3.12: Morphologie Plante (Data Tracking)

**À enregistrer à plusieurs étapes (ex: J14, J30, J60, Récolte)**

#### 3.12a: Hauteur Plante

**Type:** `number-input`
**Unité:** `select` (cm OU m)
**Exemple:** "45 cm"

#### 3.12b: Volume Estimé

**Type:** `number-input`
**Unité:** L OU m³
**Exemple:** "0.8 L" OU "800 cm³"
**Calcul:** (Height × Width × Depth) approximatif

#### 3.12c: Poids Estimé (optionnel, pré-récolte)

**Type:** `number-input`
**Unité:** "g" OU "oz"
**Note:** Estimation seulement

#### 3.12d: Nombre Branches Principales

**Type:** `number-input`
**Exemple:** "8"

#### 3.12e: Nombre Feuilles (approximatif)

**Type:** `number-input`
**Exemple:** "120"

#### 3.12f: Nombre Buds Visibles

**Type:** `number-input`
**Exemple:** "45"

**Stockage:**
```typescript
measurements: {
  morphology: {
    height: number
    heightUnit: enum { CM | M }
    volume: number
    volumeUnit: enum { L | M3 }
    estimatedWeight: number? // grams
    mainBranches: number
    leaves: number
    visibleBuds: number
  }
}
```

---

### FIELD 3.13: Récolte

#### 3.13a: Couleur Trichomes (Maturation)

**Type:** `select` (single)
**Obligatoire:** ✅ OUI pour récolte
**Visual Nuancier:**
```
Stade Maturation:
○ Translucide (10% récolte)
○ Laiteux/Ambré Mix (70-80% récolte, PEAK)
○ Ambré (90%+, plus body)
```

**Affichage Comparatif:**
- Images nuancier trichomes
- Microscope recommandé

#### 3.13b: Date Récolte

**Type:** `date-picker`
**Obligatoire:** ✅ OUI
**Format:** YYYY-MM-DD

#### 3.13c: Poids Brut (Immédiat post-récolte)

**Type:** `number-input`
**Unité:** `select` (g OU oz OU kg)
**Exemple:** "150 g"

**Note:** Poids avec tige complète, humide

#### 3.13d: Poids Net (Après 1ère Défoliation)

**Type:** `number-input`
**Unité:** même que brut
**Exemple:** "125 g"

**Note:** Tige principale + petites feuilles éliminées

#### 3.13e: Rendement Calculé

**Type:** `auto-calculated`
**Formule 1:** Poids net ÷ Volume espace (g/L)
**Formule 2:** Poids net ÷ Nombre plantes (g/plante)
**Formule 3:** Poids net ÷ Surface sol (g/m²)

**Affichages:**
- "Rendement: 125g ÷ 50L = 2.5 g/L"
- "Rendement: 125g ÷ 1 plante = 125g/plant"
- "Rendement: 125g ÷ 0.64m² = 195 g/m²"

**Stockage:**
```typescript
measurements: {
  harvest: {
    trichomeMaturity: enum { CLEAR | MILKY_AMBER_MIX | AMBER }
    harvestDate: DateTime
    weightRaw: number // Brut
    weightRawUnit: enum { G | OZ | KG }
    weightNet: number // Après défoliation
    weightNetUnit: enum { G | OZ | KG }
    yield_g_per_liter: number? // Auto
    yield_g_per_plant: number? // Auto
    yield_g_per_m2: number? // Auto
  }
}
```

---

## 📊 Interface Pipeline - Affichage

### Mode JOURS - Calendrier Github

```
CULTURE FLEURS - JANVIER 2024 (JOURS)

Dim Lun Mar Mer Jeu Ven Sam
                [1]█ [2]█ [3]█
[4]█ [5]█ [6]█ [7]█ [8]█ [9]█ [10]█
[11]█ [12]█ [13]█ [14]█ [15]█ [16]█ [17]█
...

Légende:
█ Blanc = Pas de données
█ Vert clair = Activité légère
█ Vert = Activité standard
█ Vert foncé = Bcp de données/événements

Click case → Voir détails jour
[+] Ajouter nouvelle étape
```

### Mode SEMAINES - Timeline

```
PIPELINE CULTURE - SEMAINES

[S1]█ [S2]█ [S3]█ [S4]█ [S5]█ [S6]█ [S7]█ [S8]█ [S9]█ [S10]█ [S11]█ [S12]█
 Germ Plant Crois...                                    Florai...      Réc

Hover S5 → "Croissance J35 | Temp: 23.5°C | Humidity: 65% | Notes: RAS"
Click S5 → Modal détails complets
```

### Mode PHASES - Timeline 12 phases

```
PHASES DE CULTURE

[Germ]█ [Plant]█ [Crois Début]█ ... [Florai Fin]█
   
Hover → Infos phase
Click → Détails
```

---

## 🔗 Modifications Tests Parallèles

**Lors création/édition étape pipeline:**

```
[✓] Modifier Visuel & Technique
    ├─ Nouvelle photo?
    ├─ Scores couleur/densité/trichomes?
    └─ [Mettre à jour scores]

[✓] Modifier Odeurs
    ├─ Évolution aromatique?
    └─ [Mettre à jour notes]

[✓] Modifier Goûts
    ├─ Changement saveurs?
    └─ [Mettre à jour profils]

[✓] Modifier Effets
    ├─ Changement ressenti?
    └─ [Mettre à jour intensités]
```

---

## ✅ Checklist Complétude Section 3

- [ ] Mode pipeline sélectionné (JOURS/SEMAINES/PHASES)
- [ ] Dates/semaines remplies
- [ ] Mode culture spécifié
- [ ] Espace de culture configuré (dimensions, surface, volume)
- [ ] Substrat défini (type, volume, composition)
- [ ] Irrigation paramétrée
- [ ] Engrais documentés (au moins 1)
- [ ] Lumière configurée (type, puissance, durée, distance)
- [ ] Environnement documenté (temp, humidité)
- [ ] Techniques d'entraînement notées
- [ ] Étapes pipeline créées (min 3-5)
- [ ] Morphologie trackée
- [ ] Récolte documentée (si appliquée)

---

## 🔐 Permissions Section 3

| Tier | Créer | Visualiser | Modifier |
|------|-------|-----------|----------|
| Amateur | ❌ | N/A | N/A |
| Producteur | ✅ | ✅ | ✅ |
| Influenceur | ❌ | ✅ (lecture) | ❌ |

*Section 3 réservée Producteurs (création/édition)*

