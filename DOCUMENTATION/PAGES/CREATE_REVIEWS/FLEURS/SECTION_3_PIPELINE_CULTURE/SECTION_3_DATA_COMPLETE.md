# SECTION 3: PIPELINE CULTURE - Documentation Complète

## 🎯 Vue d'Ensemble

### Objectif
Documentation exhaustive du système de pipeline culture pour fleurs. Ce système permet une traçabilité complète de la culture du cannabis (graine → récolte) avec :
- Saisie structurée par intervalle (jour/semaine/phase)
- Sauvegarde réutilisable de groupes de données (setups/presets)
- Intégration avec la bibliothèque utilisateur
- Visualisation type "Github Commits Calendar"
- Modification dynamique des sections associées

### Permissions
- **Producteur**: Accès complet (création, modification, export)
- **Amateur**: Visualisation uniquement (si review est sa propre creation)
- **Influenceur**: Accès complet avec données simplifiées

---

## 📦 Système de Presets/Setups

### Concept Général

L'utilisateur peut créer et gérer des **configurations réutilisables** de données. Chaque groupe de données peut être :
- ✅ Sauvegardé indépendamment
- ✅ Réutilisé dans plusieurs reviews
- ✅ Modifié et versionné
- ✅ Synchronisé avec la bibliothèque utilisateur

### Architecture Presets

```json
{
  "presetId": "preset_env_indoor_led_2024",
  "name": "Setup Indoor LED Standard 2024",
  "description": "Configuration indoor complète avec LED pour floraison",
  "productType": "fleurs",
  "group": "environnement",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-15T00:00:00Z",
  "isGlobal": false,
  "userId": "user_123",
  "usageCount": 5,
  "averageScore": null,
  "data": { /* voir structure groupe ci-dessous */ }
}
```

### Modèle Prisma Presets

```typescript
model CultureSetup {
  id: String @id @default(cuid())
  userId: String
  user: User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Métadonnées
  name: String // "Setup Indoor LED Standard"
  description: String?
  group: String // "environnement" | "substrat" | "irrigation" | "engrais" | "lumiere" | "environement_climat" | "palissage" | "morphologie" | "recolte"
  productType: String @default("fleurs")
  
  // Versioning
  version: Int @default(1)
  isActive: Boolean @default(true)
  isTemplate: Boolean @default(false) // Peut être partagé
  
  // Statistiques d'utilisation
  usageCount: Int @default(0)
  usedInReviews: String[] // IDs des reviews utilisant ce setup
  
  // Données
  data: Json // Structure complète du groupe
  
  // Timestamps
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
  
  // Relation
  pipelineStages: PipelineStage[]
}
```

### Intégration Bibliothèque

La bibliothèque utilisateur structure :

```
📚 Ma Bibliothèque
├── 🌿 Fiches Techniques Fleurs
│   ├── Fiches sauvegardées (complètes reviews)
│   └── Exports générés
├── 🏗️ Groupes de Données Réutilisables
│   ├── 📁 Setups Environnement
│   │   ├── "Indoor LED 3x3"
│   │   ├── "Outdoor Spring 2024"
│   │   └── "Greenhouse Tempéré"
│   ├── 📁 Setups Substrat
│   │   ├── "Bio Composé Standard"
│   │   ├── "Hydro NFT"
│   │   └── "Coco Perlite 70-30"
│   ├── 📁 Setups Irrigation
│   │   ├── "Goutte-à-goutte manuel"
│   │   └── "Système automatisé"
│   ├── 📁 Setups Engrais/Nutrition
│   │   └── "Gamme Biobizz Full"
│   └── 📁 Setups Lumière
│       ├── "LED Spectrum QB288"
│       └── "HPS 600W"
├── 🧬 Cultivars
│   ├── "GSC" (conservé)
│   └── "OG Kush" (conservé)
└── 🎨 Préférences Générales
    ├── Unités par défaut (métrique/impérial)
    ├── Tailles préférées
    └── Marques favoris
```

---

## 🔧 Structure des Groupes de Données

### Convention de Documentation

Chaque groupe suit ce pattern :

```markdown
## Groupe N: NOM_GROUPE

### Métadonnées
- **ID Groupe**: `groupe_nom_complet`
- **Permutabilité**: Oui/Non
- **Réutilisabilité**: Données/Partiellement/Non
- **Dépendances**: Autres groupes requis

### Utilisation dans Pipeline
- Mode optimisé: Jour/Semaine/Phase/N.A.
- Enregistrement: À chaque étape / Au démarrage / Manuel

### Données Configurables

[Voir détail]
```

---

## 📋 GROUPES DE DONNÉES DÉTAILLÉS

### **GROUPE 1: ESPACE DE CULTURE**

#### Métadonnées
- **ID Groupe**: `groupe_espace_culture`
- **Permutabilité**: Oui (peut changer d'espace pendant culture)
- **Réutilisabilité**: Oui (plusieurs reviews peuvent utiliser même espace)
- **Dépendances**: Aucune (indépendant)

#### Utilisation dans Pipeline
- Mode optimisé: Tous (défini au démarrage, modifiable par phase/semaine)
- Enregistrement: Au démarrage + possibilité modification à chaque étape

#### Données Configurables

```json
{
  "id": "setup_espace_1",
  "name": "Tente 3x3 LED",
  "cultureMode": "indoor",
  "spaceType": "tent",
  "dimensions": {
    "length": { "value": 3, "unit": "m" },
    "width": { "value": 3, "unit": "m" },
    "height": { "value": 2, "unit": "m" }
  },
  "groundSurface": { "value": 9, "unit": "m²" },
  "totalVolume": { "value": 18, "unit": "m³" },
  "plantingDensity": { "value": 4, "unit": "plant/m²" },
  "totalPlants": 36,
  "layout": "description or diagram",
  "notes": "Texte libre"
}
```

#### Champs Détaillés

| Champ | Type | Options | Exemple |
|-------|------|---------|---------|
| **cultureMode** | `select` | Indoor, Outdoor, Greenhouse, No-till, Guérilla, Aquaponie, Aeroponie | Indoor |
| **spaceType** | `select` | Tente, Armoire, Chambre, Serre, Plein air, Étuve, Conteneur | Tente |
| **dimensions.length** | `number` + `select unit` | cm, m, pieds | 3 m |
| **dimensions.width** | `number` + `select unit` | cm, m, pieds | 3 m |
| **dimensions.height** | `number` + `select unit` | cm, m, pieds | 2 m |
| **groundSurface** | `auto-calculated` | Read-only (calculé) | 9 m² |
| **totalVolume** | `auto-calculated` | Read-only (calculé) | 18 m³ |
| **plantingDensity** | `number` | Plantes par m² | 4 |
| **totalPlants** | `auto-calculated` | Read-only (calculé) | 36 |

#### Utilisation au sein de la Pipeline

```
À chaque étape (jour/semaine/phase), l'utilisateur peut :
1. Conserver l'espace défini
2. Modifier l'espace (ex: réduction surface pour SOG)
3. Ajouter commentaire sur changement d'espace
→ Chaque modification crée un nouvel enregistrement d'étape
```

---

### **GROUPE 2: SUBSTRAT & COMPOSITION**

#### Métadonnées
- **ID Groupe**: `groupe_substrat`
- **Permutabilité**: Oui (changement substrат rare mais possible)
- **Réutilisabilité**: Oui (très courant réutiliser même composition)
- **Dépendances**: Aucune

#### Utilisation dans Pipeline
- Mode optimisé: Au démarrage uniquement (peu changement en cours)
- Enregistrement: Au démarrage de culture

#### Données Configurables

```json
{
  "id": "setup_substrat_coco70_perlite30",
  "name": "Coco 70% + Perlite 30%",
  "type": "solide",
  "volumeTotal": { "value": 60, "unit": "L" },
  "isOrganic": true,
  "composition": [
    {
      "component": "coco_coir",
      "percentage": 70,
      "volume": { "value": 42, "unit": "L" },
      "brand": "Canna Coco",
      "prewashed": true,
      "nutritionLevel": "buffered"
    },
    {
      "component": "perlite",
      "percentage": 30,
      "volume": { "value": 18, "unit": "L" },
      "brand": "Perlite Fine Grade",
      "grainSize": "fine"
    }
  ],
  "ph": 6.2,
  "ec": 0.4,
  "drainage": "excellent",
  "retention": "good",
  "aeration": "excellent",
  "notes": "Bien equilibré, bon drainage, rétention modérée"
}
```

#### Champs Détaillés

| Champ | Type | Description |
|-------|------|-------------|
| **type** | `select` | Solide, Hydro, Aéroponie, Autre |
| **volumeTotal** | `number` | Volume total en L/mL |
| **composition[]** | `array` | Liste composants |
| **composition[].component** | `select` | Voir liste ci-dessous |
| **composition[].percentage** | `number` | % du total (total = 100%) |
| **composition[].brand** | `autocomplete` | Marques reconnues |
| **composition[].specificProperties** | `select/number` | Selon type composant |

#### Liste des Composants Possibles

**Solides (Terrestres)**
- `terre_naturelle` - Terre jardin naturelle
- `terreau_industriel` - Terreau préparé
- `tourbe` - Tourbe (blonde/brune)
- `perlite` - Perlite expansée
- `vermiculite` - Vermiculite
- `fibres_coco` - Fibres de coco
- `laine_roche` - Laine minérale
- `sable_fin` - Sable fin
- `gravier` - Gravier (préciser roche)
- `charbon_actif` - Charbon actif
- `ponce` - Ponce volcanique
- `argile` - Argile expansée (LECA)
- `bark` - Écorce de pin
- `sphaigne` - Sphaigne mousse

**Liquides (Hydro)**
- `solution_hydroponique` - Solution nutritive (marque)
- `eau_filtrée` - Eau RO/Filtrée
- `nutrient_layer` - Couche nutritive

#### Exemple Complet Hydro

```json
{
  "type": "hydro",
  "system": "NFT",
  "solution": {
    "volume": { "value": 100, "unit": "L" },
    "brand": "General Hydroponics",
    "stage": "vegetative",
    "ph": 5.8,
    "ec": 1.2,
    "ppm": 840
  },
  "waterSource": "RO",
  "circulation": "continuous",
  "oxygenation": "air_stone",
  "recycling": "partial"
}
```

---

### **GROUPE 3: IRRIGATION & HYDRATATION**

#### Métadonnées
- **ID Groupe**: `groupe_irrigation`
- **Permutabilité**: Moyen (peut changer système en cours)
- **Réutilisabilité**: Oui (setups irrigation très réutilisables)
- **Dépendances**: Groupe Substrat (types compatibles)

#### Utilisation dans Pipeline
- Mode optimisé: Jour/Semaine (fréquence dépend phase)
- Enregistrement: À chaque arrosage ou changement fréquence

#### Données Configurables

```json
{
  "id": "setup_irrigation_goutte_10L",
  "name": "Goutte-à-goutte 10L/jour",
  "system": "drip",
  "waterSource": "tap",
  "schedule": {
    "frequency": "daily",
    "timesPerDay": 1,
    "timeOfDay": "06:00"
  },
  "waterCharacteristics": {
    "ph": 6.8,
    "ec": 0.6,
    "temperature": { "value": 18, "unit": "°C" },
    "mineralContent": "moderate"
  },
  "volumePerWatering": { "value": 10, "unit": "L" },
  "totalVolumePerDay": { "value": 10, "unit": "L" },
  "totalVolumePerWeek": { "value": 70, "unit": "L" },
  "perPlant": { "value": 0.28, "unit": "L" },
  "runoff": { "value": 10, "unit": "%" },
  "supplementation": [
    {
      "type": "nutrient",
      "product": "Biobizz Grow",
      "dosage": { "value": 2, "unit": "ml/L" },
      "frequency": "every_watering"
    }
  ]
}
```

#### Champs Détaillés

| Champ | Type | Options |
|-------|------|---------|
| **system** | `select` | Goutte-à-goutte, Manuel, Inondation, NFT, DWC, Aéroponie, Brumisation |
| **waterSource** | `select` | Robinet, Pluie, Source, RO, Distillée |
| **frequency** | `select` | Hourly, Daily, Every other day, Weekly, Manual |
| **timesPerDay** | `number` | 1-24 |
| **volumePerWatering** | `number` | L ou mL |
| **ph** | `number` | 4.5-8.0 (typical 6.0-7.0) |
| **ec** | `number` | 0.0-2.5 |
| **temperature** | `number` | °C (optimal 15-22°C) |

#### Interactions avec Pipeline

```
à chaque étape d'arrosage:
- Enregistrer volume réel versé
- Enregistrer pH/EC eau (si testé)
- Enregistrer observations runoff
- Lier à un événement "engraissage" si appliqué
- Modifier fréquence si besoin (transition phase)
```

---

### **GROUPE 4: ENGRAIS & NUTRITION**

#### Métadonnées
- **ID Groupe**: `groupe_engrais`
- **Permutabilité**: Moyen (changement de gamme possible)
- **Réutilisabilité**: Oui (très haute réutilisabilité)
- **Dépendances**: Groupe Irrigation (application liée)

#### Utilisation dans Pipeline
- Mode optimisé: Jour/Semaine (changements fréquents dosage)
- Enregistrement: À chaque application d'engrais

#### Données Configurables

```json
{
  "id": "setup_engrais_biobizz_full",
  "name": "Biobizz Full Pack",
  "brand": "Biobizz",
  "type": "organic",
  "lines": [
    {
      "product": "Biobizz Grow",
      "stage": "vegetative",
      "dosage": { "value": 2, "unit": "ml/L" },
      "frequency": "every_watering",
      "startWeek": 1,
      "endWeek": 4,
      "npk": "7-9-5"
    },
    {
      "product": "Biobizz Bloom",
      "stage": "flowering",
      "dosage": { "value": 2.5, "unit": "ml/L" },
      "frequency": "every_watering",
      "startWeek": 5,
      "endWeek": 10,
      "npk": "2-7-6"
    },
    {
      "product": "Biobizz TopMax",
      "stage": "flowering",
      "dosage": { "value": 1, "unit": "ml/L" },
      "frequency": "once_per_week",
      "week": "8-10",
      "purpose": "potentiation"
    }
  ],
  "supplementaryProducts": [
    {
      "product": "Rhizotonic",
      "dosage": { "value": 0.4, "unit": "ml/L" },
      "frequency": "weekly",
      "purpose": "root_development"
    }
  ],
  "schedule": {
    "phase_germination": { "active": false },
    "phase_seedling": { "dosage_reduction": 0.5 },
    "phase_vegetative": { "active": true, "standard_dosage": 1.0 },
    "phase_pre_flowering": { "transition": "gradually" },
    "phase_flowering": { "active": true, "standard_dosage": 1.0 },
    "phase_harvest": { "flush": true, "flush_duration_days": 14 }
  },
  "application": {
    "method": "via_irrigation",
    "mixTiming": "30min_before_watering"
  },
  "notes": "Gamme complète testée, résultats constants"
}
```

#### Champs Détaillés

| Champ | Type | Description |
|-------|------|-------------|
| **type** | `select` | Bio, Chimique, OrganoMineural, Hydro |
| **brand** | `autocomplete` | Biobizz, Canna, Plagron, General Hydroponics, etc. |
| **lines[]** | `array` | Produits de la gamme |
| **lines[].product** | `string` | Nom produit exact |
| **lines[].npk** | `string` | Ratio NPK ex: "7-9-5" |
| **lines[].dosage** | `number` | ml/L ou g/L |
| **lines[].frequency** | `select` | every_watering, weekly, bi-weekly, once |
| **lines[].stage** | `select` | vegetative, pre-flowering, flowering, harvest |

#### Liens Pipeline

```
Événement Engraissage = Liaison à Irrigation
- Date: automatiqueement liée
- Volume eau + dosage engrais = calcul automatique concentration
- Historique modifications dosage visible
```

---

### **GROUPE 5: LUMIÈRE**

#### Métadonnées
- **ID Groupe**: `groupe_lumiere`
- **Permutabilité**: Non (rarement changement en cours)
- **Réutilisabilité**: Oui (setups lumière très réutilisables)
- **Dépendances**: Groupe Espace (distance lampe)

#### Utilisation dans Pipeline
- Mode optimisé: Phases (changement 16h → 12h → 10h)
- Enregistrement: Au démarrage + à chaque changement photopériode

#### Données Configurables

```json
{
  "id": "setup_lumiere_led_300w",
  "name": "LED Spectrum King 300W",
  "lampType": "LED",
  "quantity": 2,
  "totalPower": { "value": 300, "unit": "W" },
  "specifications": {
    "brand": "Spectrum King",
    "model": "SK600",
    "consumption": { "value": 150, "unit": "W" },
    "spectrum": "full",
    "kelvin": 3500,
    "lumens": "high",
    "ppfd": 1200
  },
  "positioning": {
    "distanceFromCanopy": { "value": 80, "unit": "cm" },
    "adjustmentFrequency": "weekly",
    "adjustmentNotes": "Augmenter distance au fur et à mesure croissance"
  },
  "lightSchedule": {
    "vegetative": {
      "duration": { "value": 16, "unit": "h/day" },
      "onTime": "06:00",
      "offTime": "22:00"
    },
    "pre_flowering": {
      "duration": { "value": 14, "unit": "h/day" },
      "transitionWeek": 4,
      "gradualTransition": true
    },
    "flowering": {
      "duration": { "value": 12, "unit": "h/day" },
      "onTime": "06:00",
      "offTime": "18:00",
      "darknessPeriod": {
        "importance": "critical",
        "message": "Ne jamais interrompre la période sombre"
      }
    }
  },
  "environmentalData": {
    "dli": { "value": 14, "unit": "mol/m²/day" },
    "ppfd": { "value": 800, "unit": "µmol/m²/s" },
    "coverage": "90%"
  }
}
```

#### Champs Détaillés

| Champ | Type | Options |
|-------|------|---------|
| **lampType** | `select` | LED, HPS, MH, CMH/LEC, CFL, Naturel, Mixte |
| **spectrum** | `select` | Complet (full), Bleu (veg), Rouge (flower), Personnalisé |
| **kelvin** | `number` | 2700-6500 |
| **quantity** | `number` | Nombre de lampes |
| **totalPower** | `number` | W total |
| **distanceFromCanopy** | `number` | cm/m (ajustable) |
| **duration** | `number` | h/day (photopériode) |
| **dli** | `number` | mol/m²/day (optionnel) |
| **ppfd** | `number` | µmol/m²/s (optionnel) |

#### Modifications Dynamiques dans Pipeline

```
à chaque phase/semaine:
1. Vérifier transition photopériode requise
2. Si requise:
   - Créer événement "Changement photopériode"
   - Enregistrer ancienne durée + nouvelle durée
   - Ajouter notes sur transition
3. Mettre à jour distance lampe/canopy
4. Calculer impact DLI/PPFD
```

---

### **GROUPE 6: ENVIRONNEMENT CLIMATIQUE**

#### Métadonnées
- **ID Groupe**: `groupe_climat`
- **Permutabilité**: Oui (ajustements constants)
- **Réutilisabilité**: Partiellement (targets varient par phase)
- **Dépendances**: Groupe Espace (type impacte climat)

#### Utilisation dans Pipeline
- Mode optimisé: Jour (mesures quotidiennes/continues)
- Enregistrement: À chaque mesure (idealement automatisé si capteurs)

#### Données Configurables

```json
{
  "id": "setup_climat_indoor_temp_control",
  "name": "Climat Contrôlé Végétatif",
  "ventilation": {
    "type": "extractor_fan",
    "model": "Systemair SR250",
    "power": { "value": 350, "unit": "m³/h" },
    "intakeType": "passive_intake",
    "frequency": "continuous",
    "co2Enrichment": false
  },
  "targetValues": {
    "vegetative": {
      "temperature": {
        "min": { "value": 20, "unit": "°C" },
        "optimal": { "value": 24, "unit": "°C" },
        "max": { "value": 28, "unit": "°C" },
        "dayTemp": { "value": 24, "unit": "°C" },
        "nightTemp": { "value": 18, "unit": "°C" }
      },
      "humidity": {
        "min": { "value": 40, "unit": "%" },
        "optimal": { "value": 60, "unit": "%" },
        "max": { "value": 70, "unit": "%" }
      },
      "co2": {
        "ambient": { "value": 400, "unit": "ppm" },
        "enriched": { "value": 1200, "unit": "ppm" },
        "isEnriched": false
      }
    },
    "flowering": {
      "temperature": {
        "min": { "value": 18, "unit": "°C" },
        "optimal": { "value": 22, "unit": "°C" },
        "max": { "value": 26, "unit": "°C" }
      },
      "humidity": {
        "min": { "value": 30, "unit": "%" },
        "optimal": { "value": 50, "unit": "%" },
        "max": { "value": 60, "unit": "%" }
      },
      "co2": {
        "ambient": { "value": 400, "unit": "ppm" },
        "isEnriched": false
      }
    }
  },
  "measuredData": [
    {
      "timestamp": "2024-01-15T14:00:00Z",
      "phase": "vegetative_day3",
      "temperature": 24.5,
      "humidity": 58,
      "co2": 420,
      "deviation": "within_range"
    }
  ],
  "notes": "Contrôle automatisé, alertes si hors limites"
}
```

#### Champs Détaillés

| Champ | Type | Description |
|-------|------|-------------|
| **ventilationType** | `select` | Extracteur, Soufflage, Circulation, Passive |
| **temperatureMin/Max** | `number` | °C (variables par phase) |
| **humidityMin/Max** | `number` | % (variables par phase) |
| **co2** | `number` | ppm (optionnel, défaut 400) |
| **measuredData[]** | `array` | Historique mesures |

---

### **GROUPE 7: PALISSAGE & TECHNIQUES**

#### Métadonnées
- **ID Groupe**: `groupe_palissage`
- **Permutabilité**: Oui (changement techniques possible)
- **Réutilisabilité**: Modéré (techniques réutilisables mais contexte-dépendant)
- **Dépendances**: Groupe Espace

#### Utilisation dans Pipeline
- Mode optimisé: Phase/Semaine (changements techniques réguliers)
- Enregistrement: À chaque technique appliquée

#### Données Configurables

```json
{
  "id": "setup_palissage_scrog_mainline",
  "name": "SCROG + Main-Lining Hybride",
  "techniques": [
    {
      "technique": "main_lining",
      "startWeek": 2,
      "description": "Création de 2 tiges principales via pinçage au nœud 3",
      "expectedOutcome": "Structure symétrique, meilleur rendement",
      "tools": ["pinces_douces"],
      "recovery_days": 3
    },
    {
      "technique": "scrog",
      "startWeek": 4,
      "description": "SCROG avec maille 15x15cm",
      "meshSize": "15x15cm",
      "meshHeight": "30cm",
      "expectedOutcome": "Canopy uniforme, rendement optimisé",
      "tools": ["maille_scrog", "attaches_douces"],
      "maintenance": "Ajustement quotidien tiges"
    },
    {
      "technique": "defoliation",
      "type": "light_defoliation",
      "startWeek": 2,
      "frequency": "weekly",
      "description": "Suppression feuilles grandes obstruant lumière",
      "timing": "always_morning",
      "recovery_days": 1
    }
  ],
  "totalManipulations": 12,
  "estimatedCannopyHeight": { "value": 45, "unit": "cm" },
  "estimatedBudsSites": 156,
  "notes": "Structure bien testée, rendement 500g/m²"
}
```

#### Champs Détaillés

| Champ | Type | Options |
|-------|------|---------|
| **techniques[]** | `array` | SCROG, SOG, LST, HST, Main-Lining, Defoliation, Lollipopping, etc. |
| **technique** | `select` | Voir liste ci-dessous |
| **startWeek** | `number` | Semaine démarrage (1+) |
| **frequency** | `select` | Once, daily, weekly, bi-weekly |

#### Techniques Disponibles

```
LST (Low Stress Training)
├─ Gentle tying/bending
├─ No cutting/damage
└─ Recovery: immediate

HST (High Stress Training)
├─ Main-Lining (création tiges secondaires)
├─ Topping (suppression apex)
├─ FIMing (Far Into the Middle)
└─ Recovery: 3-7 days

SCROG (Screen of Green)
├─ Horizontal mesh control
├─ Weaving tiges
└─ Maintenance: daily

SOG (Sea of Green)
├─ Densité très haute
├─ Clones identiques
└─ Rendement: masse globale

Defoliation
├─ Light (feuilles gênantes)
├─ Aggressive (pré-floraison)
└─ Recovery: 3-5 days

Lollipopping
├─ Suppression branches basses
├─ Concentration énergie apex
└─ Timing: pré-floraison

Autre
└─ Commentaire custom
```

---

### **GROUPE 8: MORPHOLOGIE & CARACTÉRISTIQUES PLANTE**

#### Métadonnées
- **ID Groupe**: `groupe_morphologie`
- **Permutabilité**: Non (observation seulement)
- **Réutilisabilité**: Non (unique par culture)
- **Dépendances**: Groupe Palissage, Groupe Lumière

#### Utilisation dans Pipeline
- Mode optimisé: Jour (observations régulières)
- Enregistrement: À chaque phase majeure + si changement notable

#### Données Configurables

```json
{
  "id": "observation_morpho_gsc_d42",
  "timestamp": "2024-01-15T14:00:00Z",
  "phase": "flowering_week3",
  "measurements": {
    "plantHeight": { "value": 65, "unit": "cm" },
    "plantVolume": { "value": 180, "unit": "L" },
    "estimatedWeight": { "value": 850, "unit": "g" },
    "mainBranches": 4,
    "totalNodes": 156,
    "estimatedBuds": 180,
    "stemThickness": { "value": 2.5, "unit": "cm" }
  },
  "observations": {
    "growthRate": "normal",
    "internode": "tight",
    "leafColor": "deep_green",
    "leafTexture": "slightly_waxy",
    "deviations": "none",
    "vigor": 9,
    "healthScore": 9.5
  },
  "photoEvidence": [
    "photo_d42_001.jpg",
    "photo_d42_002.jpg"
  ]
}
```

#### Champs Détaillés

| Champ | Type | Description |
|-------|------|-------------|
| **plantHeight** | `number` | cm ou m |
| **plantVolume** | `number` | L (estimé par formule) |
| **estimatedWeight** | `number` | g (avant récolte) |
| **mainBranches** | `number` | Nombre branches primaires |
| **totalNodes** | `number` | Nombre nœuds total |
| **estimatedBuds** | `number` | Nombre buds estimé |
| **growthRate** | `select` | slow, normal, fast |
| **leafColor** | `select` | light_green, dark_green, purple, yellow, etc. |
| **healthScore** | `number` | 0-10 |

---

### **GROUPE 9: RÉCOLTE & FINITION**

#### Métadonnées
- **ID Groupe**: `groupe_recolte`
- **Permutabilité**: Non (une récolte unique)
- **Réutilisabilité**: Non (unique)
- **Dépendances**: Groupe Morphologie

#### Utilisation dans Pipeline
- Mode optimisé: Final (dernière étape)
- Enregistrement: À récolte uniquement

#### Données Configurables

```json
{
  "id": "recolte_gsc_2024_01",
  "harvestDate": "2024-01-20",
  "harvestTime": "08:00",
  "phase": "flowering_week8",
  "trichromeAnalysis": {
    "percentage_clear": 5,
    "percentage_cloudy": 70,
    "percentage_amber": 25,
    "readiness": "optimal_thc_cbd_balance"
  },
  "harvesting": {
    "method": "selective_cutting",
    "tools": "razor_sharp_secateurs",
    "duration": { "value": 45, "unit": "minutes" },
    "trimmed_immediately": true
  },
  "weights": {
    "weightBrut": { "value": 650, "unit": "g" },
    "weightAfterFirstDefoliation": { "value": 580, "unit": "g" },
    "weightDry": { "value": 145, "unit": "g" },
    "weightCured": { "value": 142, "unit": "g" }
  },
  "yields": {
    "gramsPerPlant": 142,
    "gramsPerM2": 510,
    "gramsPerWatt": 1.7,
    "dryYield": "22%"
  },
  "drying": {
    "method": "hang_drying",
    "temperature": { "value": 18, "unit": "°C" },
    "humidity": { "value": 55, "unit": "%" },
    "duration": { "value": 7, "unit": "days" },
    "location": "dark_closet"
  },
  "notes": "Récolte exceptionnelle, couleurs magnifiques"
}
```

#### Champs Détaillés

| Champ | Type | Description |
|-------|------|-------------|
| **harvestDate** | `date` | Date récolte |
| **trichromeColor** | `select` | Clear, Cloudy, Amber |
| **cloudyPercentage** | `number` | % (optimal 60-80%) |
| **amberPercentage** | `number` | % (optimal 10-30%) |
| **weightBrut** | `number` | g avant traitement |
| **weightDry** | `number` | g après séchage |
| **weightCured** | `number` | g après cure |
| **dryingDuration** | `number` | jours |
| **dryingTemperature** | `number` | °C |
| **dryingHumidity** | `number` | % |

---

## 🔗 INTÉGRATION PIPELINE

### Architecture Globale

```
Review Fleur
│
└─ Pipeline Culture
    │
    ├─ Configuration (Au démarrage)
    │   ├─ Mode: JOURS / SEMAINES / PHASES
    │   ├─ Dates: Début / Fin
    │   └─ Groupes actifs: Tous sélectionnés
    │
    ├─ Étapes (Répétées)
    │   │
    │   ├─ JOUR/SEMAINE/PHASE N
    │   │   ├─ Timestamp automatique
    │   │   ├─ Données modifiables (changements groupe)
    │   │   ├─ Commentaires étape
    │   │   └─ Photos étape (optionnel)
    │   │
    │   └─ JOUR/SEMAINE/PHASE N+1
    │       └─ ...
    │
    └─ Visualisation
        ├─ Github-style calendar (couleurs intensité)
        ├─ Timeline linéaire
        └─ Tableau détail toutes étapes
```

### Modèle Prisma Pipeline

```typescript
model Pipeline {
  id: String @id @default(cuid())
  reviewId: String
  review: Review @relation(fields: [reviewId], references: [id], onDelete: Cascade)
  
  type: String @default("culture") // "culture" | "curing" | "separation" | "extraction" | "recipe"
  mode: String @default("days") // "days" | "weeks" | "phases"
  
  // Configuration
  startDate: DateTime
  endDate: DateTime?
  estimatedDuration: Int? // en jours
  
  // Setups Actifs
  activeSetups: String[] // IDs CultureSetup actifs
  
  // Étapes
  stages: PipelineStage[]
  
  // Métadonnées
  totalEvents: Int @default(0)
  lastUpdated: DateTime @updatedAt
  
  createdAt: DateTime @default(now())
}

model PipelineStage {
  id: String @id @default(cuid())
  pipelineId: String
  pipeline: Pipeline @relation(fields: [pipelineId], references: [id], onDelete: Cascade)
  
  // Localisation étape
  stageNumber: Int
  intervalType: String // "day" | "week" | "phase"
  intervalValue: String // "Day 1", "Week 3", "Germination"
  
  // Timing
  scheduledDate: DateTime
  actualDate: DateTime?
  
  // Données étape
  dataChanges: Json // {groupe: {champ: valeur}}
  observations: String?
  photos: String[]
  
  // Événements associés
  event: String? // "watering", "fertilizing", "technique_applied", "climate_adjusted"
  
  createdAt: DateTime @default(now())
  updatedAt: DateTime @updatedAt
}
```

### Visualisation "Github Commits"

```
                     Janvier 2024
  Lun Mar Mer Jeu Ven Sam Dim
    1   2   3   4   5   6   7
    8   9  10  11  12  13  14
   15  16  17  18  19  20  21
   22  23  24  25  26  27  28
   29  30  31

   Légende:
   ■ = Pas d'activité
   ■ = 1-2 événements
   ■ = 3-4 événements
   ■ = 5+ événements
   
   Clic sur case → Liste événements jour
   → Modification données possibles
```

---

## 💾 WORKFLOW COMPLET

### Création Nouvelle Fiche Technique Fleur

```
1. Saisir Infos Générales (SECTION 1)
2. Saisir Génétiques (SECTION 2) ← OPTIONNEL POUR AMATEUR
3. Créer/Charger Pipeline Culture (SECTION 3) ← PRODUCTEUR UNIQUEMENT
   │
   ├─ Choix Mode (Jours/Semaines/Phases)
   ├─ Définir Dates Culture
   ├─ Créer/Charger Groupes:
   │  ├─ Espace Culture
   │  │  └─ Sauvegarder comme preset?
   │  ├─ Substrat
   │  │  └─ Sauvegarder comme preset?
   │  ├─ Irrigation
   │  │  └─ Sauvegarder comme preset?
   │  ├─ Engrais/Nutrition
   │  │  └─ Sauvegarder comme preset?
   │  ├─ Lumière
   │  │  └─ Sauvegarder comme preset?
   │  ├─ Climat
   │  ├─ Palissage
   │  ├─ Morphologie (observations)
   │  └─ Récolte
   │
   └─ Remplir Étapes (Auto-généré ou manuel)
4. Remplir Sections Évaluatives (4-9)
5. Générer Export Template
6. Sauvegarder Fiche dans Bibliothèque
```

### Réutilisation Presets

```
Utilisateur clique "Charger Preset"
│
├─ Affiche Catégories Disponibles
│  ├─ Environnement (Espace culture)
│  ├─ Substrat
│  ├─ Irrigation
│  ├─ Engrais
│  ├─ Lumière
│  └─ Climat
│
├─ Sélectionne Presets
│  └─ Ex: "Setup Indoor LED Standard"
│
└─ Auto-remplit tous les champs
   └─ Utilise ensuite dans pipeline actuelle

Possibilité modifier preset chargé
  → "Modifier" → Crée variation
  → "Enregistrer variation" → Nouveau preset
```

### Statistiques & Historique Présets

```
Bibliothèque Utilisateur → Groupes Données
│
├─ Chaque Preset affiche:
│  ├─ Nombre d'utilisations
│  ├─ Dernière modif date
│  ├─ Dernière utilisation
│  ├─ Rating personnel (optionnel)
│  └─ Tags/Notes personnels
│
└─ Analytics Possible:
   ├─ Présets > utilisés
   ├─ Setups > efficaces (par type produit)
   └─ Tendances personnelles
```

## 📊 Modèle Données Complet (Prisma)

👉 **Modèles Prisma Détaillés**: Voir [PRISMA_MODELS.md](PRISMA_MODELS.md) pour :
- Modèles complets (`CultureSetup`, `Pipeline`, `PipelineStage`)
- Relation avec `Review`/`ReviewSection` existants
- Exemples données JSON par type événement
- Queries Prisma courantes
- Routes API requises
- Checklist implémentation

---

## 🎯 Résumé Points Clés

### Pour l'exhaustivité:
✅ **9 Groupes de données** couvrant tous aspects culture
✅ **Sauvegarde réutilisable** de chaque groupe (presets)
✅ **Intégration Bibliothèque** complète
✅ **Visualisation temporelle** type Github commits
✅ **Modifications dynamiques** par étape
✅ **Liens événements** (arrosage ↔ engraissage)
✅ **Statistiques usage** presets
✅ **Versionning** configurations

### Points d'optimisation:
- Groupes quasi-indépendants (modularité)
- Presets réutilisables réduit saisie (UX)
- Données structurées → Exports/Analyses faciles
- Photos + observations → Traçabilité complète

### Prochaines étapes:
1. Implémenter modèles Prisma
2. Créer pages de saisie groupes (réutilisable)
3. Développer visualisation calendar
4. Implémenter système presets Bibliothèque
5. Tests exhaustivité données vs use cases
