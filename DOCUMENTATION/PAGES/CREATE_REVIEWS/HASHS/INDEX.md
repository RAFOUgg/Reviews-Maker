# Hash (Hash, Kief, Ice-O-Lator, Dry-Sift) - Documentation Complète

## 📋 Overview

Type de produit: **Hash** (Concentré de trichomes séparés)
- Variantes: Hash, Kief, Ice-O-Lator, Dry-Sift, etc.
- Focalisation: Séparation, pureté, consommation
- Pipeline spéciale: Séparation + Maturation

---

## 🎯 Sections de la Review

### **SECTION 1: INFORMATIONS GÉNÉRALES**

#### Champs Obligatoires
- **Nom commercial** `string` - Nom du hash
- **Photo principale** `image` - Image de présentation (1+ photos)
- **Hashmaker** `string` - Créateur du hash
- **Laboratoire de production** `string` - Labo officiellement enregistré
- **Type de hash** `select` - "Hash traditionnel" | "Kief" | "Ice-O-Lator" | "Dry-Sift" | "Autre"

#### Cultivars Utilisés
- **Sélection cultivars** `cultivar-multi-select` - Depuis bibliothèque utilisateur
- **Ou création nouveau** `add-new` - Possibilité créer cultivar à la volée
- **Ratio mix** `number` - % de chaque cultivar si plusieurs

#### Champs Optionnels
- **Photos additionnelles** `images` - 1-4 photos supplémentaires
- **Description générale** `textarea` - Notes libres production

---

### **SECTION 2: PIPELINE SÉPARATION** ⚙️

**Permissions**: Producteur uniquement

#### Configuration Pipeline

**Mode Sélection**
```
Choix obligatoire du mode:
├── SECONDES (très détaillé)
├── MINUTES (standard)
└── HEURES (moins détaillé)
```

**Paramètres Généraux**
- **Méthode de séparation** `select` - "Manuelle" | "Tamisage à sec" | "Eau/Glace" | "Autre"
- **Nombre de passes** `number` - Si eau/glace
- **Température eau** `number` - °C (si eau/glace)
- **Tailles mailles** `multi-select` - µm (si tamisage à sec, ex: 73µm, 90µm, 120µm, etc.)

#### Données Matière Première

- **Type matière première** `select` - "Buds" | "Trim" | "Sugar leaves" | "Fan leaves" | "Autre"
- **Qualité matière** `number` (0-10) - Évaluation entrante
- **Poids matière première** `number` - g
- **Rendement estimé** `number` - %
- **Temps total séparation** `number` - minutes

#### Étapes Pipeline

À chaque intervalle (seconde/minute/heure), données modifiables:
- **Température** `number` - °C
- **Durée étape** `number` - selon unité pipeline
- **Matériel utilisé** `string` - Description équipement
- **Observations** `textarea` - Notes étape
- **Poids intermédiaire** `number` - g (tracking du rendement)

#### Données Finales Séparation

- **Poids final obtenu** `number` - g
- **Rendement réel** `number` - % (auto-calculé)
- **Pureté visuelle** `number` (0-10)
- **Notes finales** `textarea`

```json
{
  "type": "separation",
  "method": "water_ice",
  "mode": "minutes",
  "numberOfPasses": 3,
  "waterTemperature": 5,
  "inputMaterial": {
    "type": "trim",
    "quality": 8.5,
    "weight": 500,
    "estimatedYield": 8
  },
  "stages": [
    {
      "passNumber": 1,
      "temperature": 5,
      "duration": 15,
      "equipment": "Bubble bags 73µm",
      "observations": "Premère passe productive",
      "intermediateWeight": 38
    }
  ],
  "finalWeight": 42,
  "realYield": 8.4,
  "purityScore": 9.2
}
```

---

### **SECTION 3: VISUEL & TECHNIQUE**

#### Critères Évaluatifs (0-10 scale)

| Critère | Description |
|---------|-------------|
| **Couleur/Transparence** | Noir opaque (1) → Ambre transparent (10) |
| **Pureté visuelle** | Beaucoup impuretés (1) → Très pur (10) |
| **Densité visuelle** | Poudre légère (1) → Très compacte (10) |
| **Pistils** | Présents (1) → Aucun (10) |
| **Moisissure** | Très moisi (0) → Aucune (10) |
| **Graines** | Beaucoup (0) → Aucune (10) |

#### Profil Couleur Détaillé
- **Nuance dominante** `select` - Noir, Brun foncé, Brun moyen, Brun clair, Ambre foncé, Ambre, Doré, Jaune clair, Blanc/Blonde

```json
{
  "color": 7.5,
  "purity": 8.8,
  "density": 8.2,
  "pistils": 9.5,
  "mold": 10,
  "seeds": 10,
  "colorProfile": "Ambre doré",
  "notes": "Excellente pureté visuelle, couleur uniforme"
}
```

---

### **SECTION 4: ODEURS**

#### Structure

**Fidélité au cultivar** (0-10)
- Ressemble-t-il au profil original?

**Intensité aromatique** (0-10)
- Force odeur

**Notes Dominantes** `multi-select` (max 7)
**Notes Secondaires** `multi-select` (max 7)

```json
{
  "cultivarFidelity": 8.0,
  "intensity": 7.5,
  "dominantNotes": ["Terreux", "Bois", "Épice"],
  "secondaryNotes": ["Miel", "Herbe"],
  "notes": "Profil aromatique bien préservé en hash"
}
```

---

### **SECTION 5: TEXTURE**

#### Critères Évaluatifs (0-10 scale)

| Critère | Description |
|---------|-------------|
| **Dureté** | Poudre (1) → Très dur (10) |
| **Densité tactile** | Léger (1) → Très dense (10) |
| **Friabilité/Viscosité** | Très friable (1) → Très visqueux (10) |
| **Melting/Résidus** | Beaucoup résidus (1) → Full melt (10) |

```json
{
  "hardness": 6.5,
  "tactileDensity": 7.8,
  "friability": 4.2,
  "melting": 8.5,
  "notes": "Texture plastique, bon melting, peu de résidus"
}
```

---

### **SECTION 6: GOÛTS**

#### Critères Évaluatifs

| Critère | Description |
|---------|-------------|
| **Intensité** | Léger (1) → Très intense (10) |
| **Agressivité** | Doux (1) → Très agressif/piquant (10) |

#### Profils Saveurs `multi-select` (max 7 chacun)
- **Dry puff** (tirage à sec)
- **Inhalation** (au premier tirage)
- **Expiration** (arrière-goût)

```json
{
  "intensity": 8.5,
  "aggressiveness": 6.0,
  "dryPuff": ["Épice", "Poivre"],
  "inhalation": ["Bois", "Résineux"],
  "expiration": ["Terre", "Persistant"],
  "notes": "Saveur intense et persistante"
}
```

---

### **SECTION 7: EFFETS RESSENTIS**

#### Configuration Expérience
- **Méthode consommation** `select` - "Combustion" | "Vapeur" | "Infusion"
- **Dosage utilisé** `number` - Estimé en grammes/mg
- **Durée des effets** `time` - HH:MM
- **Début des effets** `select` - "Immédiat" | "Différé (5-15min)" | "Lent (15-30min)"
- **Durée profil** `select` - "Courte" | "Moyenne" | "Longue"
- **Usage préféré** `multi-select` - "Soir" | "Journée" | "Seul" | "Social" | "Médical"

#### Critères Évaluatifs (0-10 scale)

| Critère | Description |
|---------|-------------|
| **Montée** | Très lente (1) → Immédiate (10) |
| **Intensité** | Léger (1) → Très intense (10) |

#### Profils Effets `multi-select` (max 8)
Même liste que Fleurs (Mental, Physical, Therapeutic)

```json
{
  "consumption": "Combustion",
  "dosage": 0.1,
  "effectDuration": "3h",
  "onset": "Immédiat",
  "durationProfile": "Moyenne",
  "preferredUsage": ["Soir", "Social"],
  "onset": 9.2,
  "intensity": 9.0,
  "profiles": ["Relaxant", "Euphorie", "Créatif"],
  "sideEffects": ["Yeux secs"],
  "notes": "Très puissant, à doser avec précaution"
}
```

---

### **SECTION 8: PIPELINE CURING/MATURATION** 🔥

**Permissions**: Producteur (écriture) | Influenceur (lecture)

#### Configuration Pipeline

**Mode Sélection**
```
Choix obligatoire du mode:
├── SECONDES / MINUTES (très court terme)
├── HEURES / JOURS
└── SEMAINES / MOIS
```

#### Paramètres Généraux
- **Durée de curing** `number` - selon mode choisi
- **Type maturation** `select` - "Froid (<5°C)" | "Chaud (>5°C)"
- **Température curing** `number` - °C
- **Humidité relative** `number` - %

#### Conteneur/Emballage
- **Type récipient** `select` - "Air libre" | "Verre" | "Plastique" | "Conteneur hermétique" | "Autre"
- **Emballage primaire** `select` - "Cellophane" | "Papier" | "Aluminium" | "Vide" | "Congélation" | "Autre"
- **Opacité récipient** `select` - "Opaque" | "Semi-opaque" | "Transparent"
- **Volume occupé** `number` - L ou mL

#### Données par Étape
- Température, Humidité, Notes
- Possibilité modifier tests: Visuel, Odeurs, Goûts, Effets

```json
{
  "type": "curing",
  "mode": "weeks",
  "duration": 4,
  "temperature": 15,
  "humidity": 58,
  "containerType": "verre",
  "packaging": "vide"
}
```

---

## 🔍 Flux de Création Review Hash

```
1. Infos Générales (obligatoires: nom, hashmaker, labo, type, cultivars, photo)
   ↓
2. Pipeline Séparation (Producteur seulement)
   ↓
3. Visuel & Technique
   ↓
4. Odeurs
   ↓
5. Texture
   ↓
6. Goûts
   ↓
7. Effets Ressentis
   ↓
8. Pipeline Maturation (Producteur seulement)
   ↓
SAUVEGARDE / EXPORT
```

---

## 📊 Données Export

### Template "Compact"
- Infos générales + photo
- Pipeline séparation (résumé)
- Scores visuels, odeurs, texture, goûts (totals)
- Scores effets

### Template "Détaillé"
- Infos complètes
- 5 étapes pipelines séparation/maturation
- Tous les scores individuels

### Template "Complète"
- Tous les contenus intégraux
- Pipelines complètes
- Notes détaillées

---

## 🔗 Fichiers Référence

- Frontend: `client/src/pages/ReviewForm*.jsx`
- Backend: `server-new/routes/reviews.js`
- Schema: `server-new/prisma/schema.prisma`

---

## ✅ Checklist Complétude Review Hash

- [ ] Nom commercial + photo(s)
- [ ] Hashmaker et laboratoire
- [ ] Type de hash
- [ ] Cultivars utilisés (minimum 1)
- [ ] Pipeline séparation (si producteur)
- [ ] Visuel & Technique: min 5 critères
- [ ] Odeurs: min 3 notes + intensité
- [ ] Texture: min 2 critères
- [ ] Goûts: profils complets
- [ ] Effets: min 3 profils
- [ ] Pipeline maturation (si producteur)

