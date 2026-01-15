# Concentrés (Rosin, BHO, etc.) - Documentation Complète

## 📋 Overview

Type de produit: **Concentrés Cannabiniques**
- Variantes: Rosin, BHO, CO₂, PHO, Éthanol, etc.
- Focalisation: Extraction, purification, composition
- Pipelines spéciales: Extraction + Purification + Maturation

---

## 🎯 Sections de la Review

### **SECTION 1: INFORMATIONS GÉNÉRALES**

#### Champs Obligatoires
- **Nom commercial** `string`
- **Photo principale** `image` - (1+ photos)
- **Extracteur/Hashmaker** `string`
- **Laboratoire de production** `string`
- **Type de concentré** `select` - "Rosin" | "BHO" | "PHO" | "CO₂" | "Éthanol" | "Autre"

#### Cultivars Utilisés
- **Sélection cultivars** `cultivar-multi-select` - Depuis bibliothèque
- **Ou création nouveau** `add-new`
- **Ratio mix** `number` - % de chaque si plusieurs

#### Champs Optionnels
- **Photos additionnelles** `images`
- **Description générale** `textarea`

---

### **SECTION 2: PIPELINE EXTRACTION** ⚙️

**Permissions**: Producteur uniquement

#### Configuration Pipeline

**Mode Sélection** (selon détail souhaité)
```
├── SECONDES / MINUTES (très détaillé)
├── HEURES (standard)
└── JOURS (overview)
```

#### Méthode Extraction Obligatoire
```
Choix exclusif:

EXTRACTION PAR SOLVANT:
├── Éthanol (EHO)
├── Alcool isopropylique (IPA)
├── Acétone
├── Butane (BHO)
├── Isobutane
├── Propane (PHO)
├── Hexane
└── Huiles végétales (coco, olive)

EXTRACTION SUPERCRITIQUE:
└── CO₂ supercritique

PRESSAGE:
├── Pressage à chaud (Rosin)
└── Pressage à froid

EXTRACTION AVANCÉE:
├── Ultrasons (UAE)
├── Micro-ondes (MAE)
└── Tensioactifs (Tween 20)
```

#### Paramètres Extraction (selon méthode)

**Pour Solvant Liquide**
- Solvant utilisé: sélection ci-dessus
- Ratio solvant/matière: numeric
- Température solvant: °C
- Durée contact: minutes
- Nombre passes: int
- Rendement brut: %
- Poids matière première: g
- Poids extrait brut: g

**Pour CO₂ Supercritique**
- Température CO₂: °C
- Pression: bar/PSI
- Durée extraction: minutes
- Débit: kg/h
- Rendement: %

**Pour Pressage Rosin**
- Température plaques: °C
- Pression appliquée: bar
- Durée pressage: minutes
- Type presse: string
- Rendement: %

#### Étapes Pipeline Extraction

À chaque intervalle, données modifiables:
- **Température** `number`
- **Pression** `number` (si applicable)
- **Durée étape** `number`
- **Observations** `textarea`
- **Mesures intermédiaires** `json`

---

### **SECTION 3: PIPELINE PURIFICATION** ⚙️

**Permissions**: Producteur uniquement

#### Sélection Méthodes Purification

```
Choix multiple (ajouter méthodes sequentiellement):

CHROMATOGRAPHIE:
├── Chromatographie sur colonne
├── Flash Chromatography
├── HPLC
├── GC
└── TLC

FRACTIONNEMENT:
├── Fractionnement par température
└── Fractionnement par solubilité

TRAITEMENT PHYSIQUE:
├── Winterisation
├── Décarboxylation
├── Filtration
├── Centrifugation
├── Décantation
├── Séchage sous vide
└── Filtration membranaire

TECHNIQUES AVANCÉES:
├── Sublimation
├── Recristallisation
├── Extraction liquide-liquide
├── Adsorption sur charbon actif
└── Autre
```

#### Configuration Purification

Pour chaque méthode ajoutée:
- **Ordre d'application** (1, 2, 3...)
- **Paramètres spécifiques**:
  - Température °C
  - Durée minutes/heures
  - Solvant utilisé (si applicable)
  - Perte de matière %
  - Observations

#### Résultats Purification
- Poids final purifié: g
- Purity improvement %
- Couleur avant/après
- Rendement final %

```json
{
  "purificationSteps": [
    {
      "order": 1,
      "method": "winterization",
      "temperature": -20,
      "duration": 480,
      "solvent": "ethanol",
      "materialLoss": 5,
      "observations": "Séparation nette lipides"
    },
    {
      "order": 2,
      "method": "vacuum_drying",
      "temperature": 40,
      "duration": 120,
      "vacuum": "full"
    }
  ],
  "finalPurity": 95.5,
  "colorImprovement": "Brun foncé → Or clair"
}
```

---

### **SECTION 4: VISUEL & TECHNIQUE**

#### Critères Évaluatifs (0-10 scale)

| Critère | Description |
|---------|-------------|
| **Couleur/Transparence** | Noir opaque (1) → Cristallin transparent (10) |
| **Viscosité** | Liquide (1) → Cristallin dur (10) |
| **Pureté visuelle** | Beaucoup impuretés (1) → Très pur (10) |
| **Melting** | Aucun melt (1) → Full melt (10) |
| **Résidus** | Beaucoup (1) → Aucun (10) |
| **Pistils** | Présents (1) → Aucun (10) |
| **Moisissure** | Très moisi (0) → Aucune (10) |

#### Profil Couleur
- Nuance dominante: Black, Dark Brown, Brown, Honey, Amber, Gold, Clear, White

```json
{
  "color": 8.5,
  "viscosity": 7.2,
  "purity": 9.0,
  "melting": 9.5,
  "residue": 9.8,
  "pistils": 10,
  "mold": 10,
  "colorProfile": "Or transparent",
  "texture": "Cristallin léger"
}
```

---

### **SECTION 5: ODEURS**

#### Critères

- **Fidélité cultivar** (0-10)
- **Intensité aromatique** (0-10)
- **Notes dominantes** `multi-select` (max 7)
- **Notes secondaires** `multi-select` (max 7)

```json
{
  "cultivarFidelity": 9.0,
  "intensity": 8.5,
  "dominantNotes": ["Terpènes", "Résineux", "Épice"],
  "secondaryNotes": ["Citron", "Bois"]
}
```

---

### **SECTION 6: TEXTURE**

#### Critères Évaluatifs (0-10 scale)

| Critère | Description |
|---------|-------------|
| **Dureté** | Liquide (1) → Très dur/cristallin (10) |
| **Densité tactile** | Léger (1) → Très dense (10) |
| **Friabilité/Viscosité** | Très collant (1) → Très friable (10) |
| **Melting/Résidus** | Beaucoup résidus (1) → Full melt (10) |

```json
{
  "hardness": 8.5,
  "tactileDensity": 7.8,
  "friability": 6.2,
  "melting": 9.8
}
```

---

### **SECTION 7: GOÛTS**

#### Critères

- **Intensité** (0-10)
- **Agressivité/Piquant** (0-10)
- **Dry puff** `multi-select` (max 7)
- **Inhalation** `multi-select` (max 7)
- **Expiration** `multi-select` (max 7)

```json
{
  "intensity": 9.0,
  "aggressiveness": 7.5,
  "dryPuff": ["Terpènes", "Citron"],
  "inhalation": ["Résineux", "Herbal"],
  "expiration": ["Épice", "Persistant"]
}
```

---

### **SECTION 8: EFFETS RESSENTIS**

Identique à Fleurs/Hash (voir documentation respective)

```json
{
  "consumption": "Vapeur",
  "dosage": 0.05,
  "effectDuration": "2h",
  "onset": "Immédiat",
  "intensity": 9.2,
  "profiles": ["Relaxant", "Euphorie", "Créatif"]
}
```

---

### **SECTION 9: PIPELINE CURING/MATURATION** 🔥

**Permissions**: Producteur (écriture)

Identique à autres types (voir documentation générale)

```json
{
  "type": "curing",
  "mode": "days",
  "duration": 14,
  "temperature": 20,
  "humidity": 55
}
```

---

## 🔍 Flux de Création Review Concentré

```
1. Infos Générales (obligatoires: nom, extracteur, labo, type, cultivars, photo)
   ↓
2. Pipeline Extraction (Producteur seulement)
   ↓
3. Pipeline Purification (Producteur seulement)
   ↓
4. Visuel & Technique
   ↓
5. Odeurs
   ↓
6. Texture
   ↓
7. Goûts
   ↓
8. Effets Ressentis
   ↓
9. Pipeline Maturation (Producteur seulement)
   ↓
SAUVEGARDE / EXPORT
```

---

## 📊 Données Export

Templates identiques à autres types (Compact, Détaillé, Complète)

---

## 🔗 Fichiers Référence

- Backend API: `server-new/routes/reviews.js`
- Schema Prisma: `server-new/prisma/schema.prisma`

---

## ✅ Checklist Complétude Review Concentré

- [ ] Nom commercial + photo(s)
- [ ] Extracteur et laboratoire
- [ ] Type de concentré
- [ ] Cultivars utilisés
- [ ] Pipeline extraction (si producteur)
- [ ] Pipeline purification (si applicable)
- [ ] Visuel & Technique: min 5 critères
- [ ] Odeurs: min 3 notes + intensité
- [ ] Texture: min 2 critères
- [ ] Goûts: profils complets
- [ ] Effets: min 3 profils
- [ ] Pipeline maturation (si producteur)

