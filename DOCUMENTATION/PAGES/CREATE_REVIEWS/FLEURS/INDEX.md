# Fleurs (Herbes/Buds) - Documentation Complète

## 📋 Overview

Type de produit: **Fleurs / Herbes / Buds**
- Focalisation: Culture, génétique, caractéristiques sensorielles
- Pipeline spéciale: Culture + Maturation
- Fonctionnalités avancées: Arbre généalogique (Producteur seulement)

---

## 🎯 Sections de la Review

### **SECTION 1: INFORMATIONS GÉNÉRALES**

#### Champs Obligatoires
- **Nom commercial** `string` - Nom de la fleur
- **Photo principale** `image` - Image de présentation (1+ photos)
- **Cultivar** `select` - Sélection depuis bibliothèque ou création
- **Farm** `string` - Nom de la ferme/producteur
- **Type** `select` - "Indica" | "Sativa" | "Hybride" | "Hybride Indica-dom" | "Hybride Sativa-dom" | "CBD-dominant"

#### Champs Optionnels
- **Photos additionnelles** `images` - 1-4 photos supplémentaires
- **Description générale** `textarea` - Notes libres

---

### **SECTION 2: GÉNÉTIQUES & GÉNÉALOGIE**

#### Données Génétiques
- **Breeder** `string` - Créateur de la graine
- **Variété** `autocomplete` - Sélection depuis liste (data/terpenes.json)
- **Type génétique** `select` - "Indica" | "Sativa" | "Hybride"
- **Pourcentage Indica** `number` - 0-100%
- **Pourcentage Sativa** `number` - 0-100%
- **Code phénotype** `string` - "Pheno#", clone name, etc.

#### Généalogie (Parents/Lignée)
- **Parent 1** `cultivar-select` - Sélection depuis bibliothèque utilisateur
- **Parent 2** `cultivar-select` - Sélection depuis bibliothèque utilisateur
- **Relation** `visual-tree` - Arbre généalogique interactif (Producteur)

#### Notes Génétiques
- **Traits distinctifs** `multi-select` - Sélection traits (de data ou custom)
- **Notes complètes** `textarea` - Description généalogique

---

### **SECTION 3: PIPELINE CULTURE** ⚙️

**Permissions**: Producteur uniquement

#### Configuration Pipeline

##### Mode Sélection
```
Choix obligatoire du mode de documentation:
├── JOURS (date début/fin obligatoires)
│   └─ Chaque case = 1 jour (365 jours max affichés comme Github commits)
├── SEMAINES (semaine début obligatoire)
│   └─ Chaque case = 1 semaine (S1, S2, S52)
└── PHASES (automatique selon type produit)
    └─ 12 phases prédéfinies: Germination, Plantule, Croissance-début/milieu/fin, etc.
```

##### Paramètres Généraux
- **Début de culture** `date` - Obligatoire
- **Fin de culture** `date` - Obligatoire
- **Durée totale** `auto-calculated` - Jours/Semaines
- **Mode culture** `select` - "Indoor" | "Outdoor" | "Greenhouse" | "No-till" | "Autre"

#### Données par Étape

##### [GENERAL]
- Définition des phases (si pipeline par phase choisie)
- Dates début/fin de culture
- Mode de culture sélectionné
- **Espace de culture**
  - Type: "Armoire" | "Tente" | "Serre" | "Extérieur" | "Autre"
  - Dimensions: L×l×H (cm ou m)
  - Surface au sol: m²
  - Volume total: m³

##### [ENVIRONNEMENT]
- **Technique de propagation** `select` - "Graine" | "Clone" | "Bouture" | "Sopalin" | "Coton" | etc.
- **Substrat**
  - Type: "Hydro" | "Bio" | "Organique"
  - Volume: L
  - Composition %: (terre, coco, laine roche, etc.) avec marques
- **Système d'irrigation**
  - Type: "Goutte à goutte" | "Inondation" | "Manuel" | etc.
  - Fréquence: par jour/semaine
  - Volume d'eau par arrosage: L
- **Engrais utilisés**
  - Type: "Bio" | "Chimique" | "Mixte"
  - Marque et gamme
  - Dosage: g/L ou ml/L
  - Fréquence d'application
- **Lumière**
  - Type lampe: "LED" | "HPS" | "CFL" | "Naturel" | "Mixte"
  - Spectre: "Complet" | "Bleu" | "Rouge"
  - Distance lampe/plante: cm/m/pieds
  - Puissance: W
  - Durée d'éclairage: heures/jour
  - DLI: mol/m²/jour (optionnel)
  - PPFD: µmol/m²/s (optionnel)
  - Kelvin: °K (température couleur)
- **Environnement**
  - Température moyenne: °C
  - Humidité relative: %
  - CO₂: ppm (optionnel)
  - Ventilation: type, fréquence

##### [PALISSAGE]
- **Méthodologies** `multi-select` - "SCROG" | "SOG" | "Main-Lining" | etc.
- **Commentaire** `textarea` - Description manipulations

##### [MORPHOLOGIE]
- Taille: cm/m
- Volume: L/m³
- Poids: g (estimé)
- Nombre branches principales: int
- Nombre feuilles: int
- Nombre de buds: int

##### [RÉCOLTE]
- **Couleur trichomes** `select` - Nuancier (Translucide | Laiteux | Ambré)
- **Date de récolte** `date`
- **Poids brut** `number` - g
- **Poids net** `number` - g (après défoliation)
- **Rendement** `number` - g/m² ou g/plante

#### Visualisation Pipeline
```
Interface type "Github Commits Calendar":
├── Chaque case = intervalle (jour/semaine/phase)
├── Couleurs = intensité données/événements
├── Click sur case = détails étape
└── Modification données modifie review sections
```

---

### **SECTION 4: VISUEL & TECHNIQUE**

#### Critères Évaluatifs (0-10 scale)

| Critère | Description | Échelle |
|---------|-------------|---------|
| **Couleur** | Nuancier couleurs cannabis | Vert → Violet → Jaune → Brun → Gris |
| **Densité visuelle** | Compacité des buds | Aérée (1) → Très compacte (10) |
| **Trichomes** | Brillance/cristallisation | Faible (1) → Très cristallisé (10) |
| **Pistils** | Visibilité/couleur pistils | Peu visibles (1) → Très rouges/bruns (10) |
| **Manucure** | Qualité trim/épuration | Mal trimé (1) → Parfaitement trimé (10) |
| **Moisissure** | Absence de moisissure | Très moisi (0) → Aucune moisissure (10) |
| **Graines** | Absence de graines | Beaucoup (0) → Aucune (10) |

#### Données Collectées
```json
{
  "color": 8.5,
  "density": 9,
  "trichomes": 9.2,
  "pistils": 7.5,
  "manicure": 8.8,
  "mold": 10,
  "seeds": 10,
  "colorNuance": "Violet-Vert",
  "notes": "Très bien présentée, cristallisation exceptionnelle"
}
```

---

### **SECTION 5: ODEURS**

#### Structure

**Notes Dominantes** `multi-select` (max 7)
- Sélection depuis liste complète aromas
- Catégories: Fruité, Épicé, Terreux, Boisé, Floral, etc.

**Notes Secondaires** `multi-select` (max 7)
- Sous-nuances olfactives

**Arômes Consommation**
- À l'inhalation: `multi-select` (primaire/secondaire)
- Saveur en bouche: `text`
- Rétro-olfaction: `text`

**Intensité Aromatique** (0-10)
```json
{
  "dominantNotes": ["Citron", "Herbe", "Bois"],
  "secondaryNotes": ["Pin", "Épice"],
  "inhalation": {
    "primary": ["Citron"],
    "secondary": ["Frais"]
  },
  "mouthFlavor": "Légèrement sucré avec finale épicée",
  "retroolfaction": "Persistant, herbal",
  "intensity": 8.5
}
```

---

### **SECTION 6: TEXTURE**

#### Critères Évaluatifs (0-10 scale)

| Critère | Description |
|---------|-------------|
| **Dureté** | Cassant (1) → Très flexible (10) |
| **Densité tactile** | Léger (1) → Très dense (10) |
| **Élasticité** | Pas d'élasticité (1) → Très élastique (10) |
| **Collant** | Sec (1) → Très collant/gomme (10) |

```json
{
  "hardness": 6.5,
  "tactileDensity": 8.2,
  "elasticity": 5.5,
  "stickiness": 7.8,
  "notes": "Texture friable mais avec bonnes propriétés adhésives"
}
```

---

### **SECTION 7: GOÛTS**

#### Critères Évaluatifs

| Critère | Description | Échelle |
|---------|-------------|---------|
| **Intensité** | Force du goût | Léger (1) → Très intense (10) |
| **Agressivité** | Piquant/irritation | Doux (1) → Très agressif (10) |

#### Profils Saveurs `multi-select` (max 7 chacun)

- **Dry puff** (tirage à sec)
- **Inhalation** (au premier tirage)
- **Expiration** (arrière-goût)

Sélection depuis liste complète: Sucré, Amer, Fruité, Épicé, Terreux, Boisé, Herbal, etc.

```json
{
  "intensity": 8.0,
  "aggressiveness": 6.5,
  "dryPuff": ["Poivre", "Herbe"],
  "inhalation": ["Citron", "Pin"],
  "expiration": ["Bois", "Terre"],
  "notes": "Profil saveur stable et persistant"
}
```

---

### **SECTION 8: EFFETS RESSENTIS**

#### Configuration Expérience
- **Méthode consommation** `select` - "Combustion" | "Vapeur" | "Infusion"
- **Dosage utilisé** `number` - Estimé en grammes
- **Durée des effets** `time` - HH:MM
- **Début des effets** `select` - "Immédiat" | "Différé (5-15min)" | "Lent (15-30min)"
- **Durée profil** `select` - "Courte" | "Moyenne" | "Longue"
- **Usage préféré** `multi-select` - "Soir" | "Journée" | "Seul" | "Social" | "Médical"

#### Critères Évaluatifs (0-10 scale)

| Critère | Description |
|---------|-------------|
| **Montée** | Rapidité des effets | Très lente (1) → Immédiate (10) |
| **Intensité** | Force des effets | Léger (1) → Très intense (10) |

#### Profils Effets `multi-select` (max 8)

**Catégorie Mentale**
- Créatif, Énergique, Euphorie, Concentration, Lucidité, Rêveur, Introspectif

**Catégorie Physique**
- Relaxant, Soulagement douleur, Stimulation, Sommeil, Appétit augmenté

**Catégorie Thérapeutique**
- Anxiété, Insomnie, Inflammations, Nausées, Stress, TDAH, Migraines

**Filtrage**: Tous | Neutre | Positif | Négatif

#### Effets Secondaires
```multi-select```
- Yeux secs, Bouche sèche, Faim, Anxiété, Paranoia, Vertiges, etc.

```json
{
  "consumption": "Combustion",
  "dosage": 0.5,
  "effectDuration": "2h30",
  "onset": "Immédiat",
  "durationProfile": "Longue",
  "preferredUsage": ["Soir", "Social"],
  "onset": 9.0,
  "intensity": 8.5,
  "profiles": ["Créatif", "Relaxant", "Euphorie"],
  "sideEffects": ["Yeux secs", "Faim"],
  "notes": "Excellent pour activités créatives le soir"
}
```

---

### **SECTION 9: PIPELINE CURING/MATURATION** 🔥

**Permissions**: Producteur (écriture) | Influenceur (lecture)

#### Configuration Pipeline

**Mode Sélection**
```
Choix obligatoire du mode:
├── JOURS
├── SEMAINES
└── MOIS
```

**Paramètres Généraux**
- **Durée de curing** `number` - jours/semaines/mois (selon choix)
- **Type maturation** `select` - "Froid (<5°C)" | "Chaud (>5°C)"
- **Température curing** `number` - °C
- **Humidité relative** `number` - %

#### Conteneur/Emballage
- **Type récipient** `select` - "Air libre" | "Verre" | "Plastique" | "Bois" | "Autre"
- **Emballage primaire** `select` - "Cellophane" | "Papier cuisson" | "Aluminium" | "Paper hash" | "Sac à viande" | "Congélation" | "Sous vide" (machine/manuel) | "Autre"
- **Opacité récipient** `select` - "Opaque" | "Semi-opaque" | "Transparent" | "Ambré"
- **Volume occupé** `number` - L ou mL

#### Données par Étape

À chaque intervalle (jour/semaine/mois), possibilité de modifier:
- Température
- Humidité
- Notes (max 500 caractères)
- Modification des tests (voir section ci-dessous)

#### Modifications de Tests

Possibilité de modifier à chaque étape:
- **Visuel & Technique** - Nouvelle évaluation scores
- **Odeurs** - Évolution aromatique
- **Goûts** - Changement profils saveur
- **Effets** - Modification ressenti

```json
{
  "type": "curing",
  "mode": "weeks",
  "duration": 8,
  "temperature": 18,
  "humidity": 62,
  "containerType": "verre",
  "packaging": "sous_vide",
  "opacity": "opaque",
  "volumeOccupied": 2.5,
  "stages": [
    {
      "week": 1,
      "temperature": 20,
      "humidity": 65,
      "notes": "Odeur très herbacée",
      "modifiedSections": {
        "odors": { "intensity": 7.5 },
        "visual": { "mold": 10 }
      }
    }
  ]
}
```

---

### **SECTION 10: DONNÉES ANALYTIQUES (PDF)**

**Optionnel** - Import depuis certificat d'analyse

- **Taux THC** `number` - %
- **Taux CBD** `number` - %
- **Taux CBG/CBC** `number` - % ou mg/g
- **Profil terpénique** `pdf-import` - Certificat d'analyse (image/PDF)

---

## 🔍 Flux de Création Review Fleurs

```
1. Infos Générales (obligatoires: nom, cultivar, farm, type, photo)
   ↓
2. Génétiques (facultatif mais recommandé)
   ↓
3. Pipeline Culture (Producteur seulement)
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
10. Données Analytiques (optionnel)
   ↓
SAUVEGARDE / EXPORT
```

---

## 📊 Données Export dans Templates

### Template "Compact"
- Infos générales
- Photo
- Pipeline maturation (résumé)
- Scores visuels (total)
- Scores odeurs (total)
- Scores goûts (total)
- Scores effets (total)

### Template "Détaillé"
- Infos complètes
- 5 étapes pipelines
- Tous les scores individuels
- Notes texte (résumé)

### Template "Complète"
- Tous les contenus complets
- Pipelines intégrales
- Données analytiques
- Arbre généalogique
- Notes détaillées

---

## 🔗 Fichiers Référence

- Frontend: `client/src/pages/ReviewForm*.jsx` (pages formulaires)
- Composants: `client/src/components/review/` (sections évaluatives)
- Données: `data/*.json` (aromas, effects, tastes, terpenes)
- Backend: `server-new/routes/reviews.js` (API)
- Schema Prisma: `server-new/prisma/schema.prisma` (modèle Review)

---

## ✅ Checklist Complétude Review Fleurs

- [ ] Nom commercial + photo(s)
- [ ] Cultivar et farm
- [ ] Type produit (Indica/Sativa/Hybride)
- [ ] Génétiques: breeder, parents (si producteur)
- [ ] Pipeline culture (si producteur)
- [ ] Visuel & Technique: min 5 critères
- [ ] Odeurs: min 3 notes dominantes
- [ ] Texture: min 2 critères
- [ ] Goûts: profils inhalation/expiration
- [ ] Effets: min 3 profils
- [ ] Pipeline maturation (si producteur)
- [ ] Données analytiques (si disponible)

