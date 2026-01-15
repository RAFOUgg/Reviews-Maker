# Comestibles - Documentation Complète

## 📋 Overview

Type de produit: **Comestibles Cannabiniques**
- Variantes: Brownie, Gélule, Boisson, Bonbon, etc.
- Focalisation: Recette, goûts, effets
- Pipeline spéciale: Recette (ingrédients + étapes préparation)

---

## 🎯 Sections de la Review

### **SECTION 1: INFORMATIONS GÉNÉRALES**

#### Champs Obligatoires
- **Nom du produit** `string` - "Brownie Chocolat Noir", "Gélule THC", etc.
- **Photo principale** `image` - Produit fini
- **Type de comestible** `select` - "Brownie" | "Cookie" | "Gélule" | "Boisson" | "Bonbon" | "Pâte" | "Barre" | "Autre"
- **Fabricant** `string` - Nom du producteur/labo

#### Profil Génétique
- **Type de génétiques** `select` - "Indica" | "Sativa" | "Hybride" | "Mélange"
- **Cultivar(s) utilisé(s)** `cultivar-multi-select` - Depuis bibliothèque
- **Ou création nouveau** `add-new`

#### Champs Optionnels
- **Photos additionnelles** `images` - Photos du produit, ingrédients, préparation
- **Description générale** `textarea` - Contexte produit

---

### **SECTION 2: PIPELINE RECETTE** 🥘

#### Configuration Générale

**Dosage de cannabis total**
- **Type produit cannabinique** `select` - "Fleurs" | "Hash" | "Concentré" | "Distillate" | "Autre"
- **Quantité totale** `number` - g ou mg
- **THC total estimé** `number` - mg
- **CBD total estimé** `number` - mg

#### Ingrédients Pipeline

Interface d'ajout dynamique d'ingrédients avec 2 catégories:

##### 1. **Ingrédients Standards**
`multi-select` depuis liste prédéfinie
- Farine
- Sucre/Sucre brun
- Beurre
- Œufs
- Cacao en poudre
- Chocolat
- Levure chimique
- Sel
- Vanille
- Lait
- Huile
- etc.

Pour chaque ingrédient standard:
- Quantité: `number`
- Unité: `select` - g | ml | cuillères | tasses | etc.

##### 2. **Ingrédients Cannabiniques**
`select` depuis ressources utilisateur
- Choix du type (Fleurs | Hash | Concentré)
- Quantité: `number` g/mg
- Rapport final en THC/CBD: `auto-calculated`

#### Étapes de Préparation

Interface d'ajout étapes avec actions prédéfinies:

**Actions Disponibles**:
- Mélanger
- Chauffer
- Refroidir
- Reposer
- Verser
- Cuire au four
- Ajouter ingrédient
- Malaxer
- Fouetter
- Incorporer
- etc.

**Structure d'étape**:
```
Étape 1:
├─ Action: "Chauffer"
├─ Ingrédient(s): "Beurre" (50g)
├─ Durée: 5 minutes
├─ Température: 50°C
├─ Notes: "Beurre fondu mais pas chaud"

Étape 2:
├─ Action: "Mélanger"
├─ Ingrédient(s): "Farine" (100g), "Sucre" (80g)
├─ Durée: 2 minutes
├─ Notes: "Mélange homogène"

Étape 3:
├─ Action: "Incorporer"
├─ Ingrédient(s): "Mélange cannabinique" (5g)
├─ Durée: 1 minute
├─ Notes: "Distribution uniforme importante"

Étape 4:
├─ Action: "Cuire au four"
├─ Durée: 25 minutes
├─ Température: 180°C
├─ Notes: "Jusqu'à doré"
```

#### Résultat Recette
- **Nombre de portions** `number` - Combien de pièces/portions produit fini
- **Dosage par portion** `auto-calculated` - mg THC/CBD par portion
- **Poids total produit** `number` - g
- **Notes finales** `textarea` - Résultat, ajustements, recommendations

```json
{
  "cannabisType": "fleur",
  "totalCannabis": 10,
  "estimatedTHC": 250,
  "estimatedCBD": 5,
  "ingredients": [
    {
      "name": "Farine",
      "quantity": 200,
      "unit": "g",
      "type": "standard"
    },
    {
      "name": "Beurre",
      "quantity": 100,
      "unit": "g",
      "type": "standard"
    },
    {
      "name": "Fleur - Girl Scout Cookies",
      "quantity": 10,
      "unit": "g",
      "type": "cannabinoid"
    }
  ],
  "steps": [
    {
      "order": 1,
      "action": "Chauffer",
      "ingredients": ["Beurre"],
      "duration": 5,
      "temperature": 50,
      "notes": "Beurre fondu"
    }
  ],
  "portionsCount": 12,
  "dosagePerPortion": 21,
  "totalWeight": 300,
  "notes": "Brownie dense et riche"
}
```

---

### **SECTION 3: GOÛTS**

#### Critères Évaluatifs

| Critère | Description |
|---------|-------------|
| **Intensité** | Léger (1) → Très intense (10) |
| **Agressivité/Piquant** | Doux (1) → Très agressif (10) |

#### Profils Saveurs

**Saveurs Dominantes** `multi-select` (max 7)
- Sélection depuis liste complète de goûts
- Catégories: Sucré, Salé, Amer, Acide, Umami, Chocolaté, Fruité, Herbal, etc.

#### Notes Détaillées
- **Goût initial** `textarea` - Première impression
- **Palais intermédiaire** `textarea` - Saveurs qui se développent
- **Arrière-goût** `textarea` - Finale/persistance

```json
{
  "intensity": 8.5,
  "aggressiveness": 4.2,
  "dominantFlavors": ["Chocolat", "Cacahuète", "Sucré"],
  "initialTaste": "Riche chocolat avec note cacahuète",
  "midpalate": "Goût sucré qui s'équilibre",
  "aftertaste": "Finale légèrement salée et persistante"
}
```

---

### **SECTION 4: EFFETS RESSENTIS** 💥

#### Configuration Expérience
- **Dosage utilisé** `number` - Nombre de portions/mg
- **Méthode consommation** `select` - "Consommation directe" | "Avec nourriture" | "Avec boisson" | "Autre"
- **État consommateur** `select` - "À jeun" | "Après repas" | "Standard"

#### Latence & Durée

**Délai d'apparition** `select`
- "5-15 minutes"
- "15-30 minutes"
- "30-60 minutes"
- "1-2 heures"
- "2+ heures"
- "Très variable"

**Durée totale des effets** `select`
- "Courte (< 2h)"
- "Moyenne (2-4h)"
- "Longue (4-8h)"
- "Très longue (8h+)"
- "24h+"

#### Critères Évaluatifs (0-10 scale)

| Critère | Description |
|---------|-------------|
| **Montée** | Très progressive (1) → Très rapide (10) |
| **Intensité** | Léger (1) → Très intense (10) |

#### Profils Effets `multi-select` (max 8)
Même catégories que Fleurs/Hash (Mental, Physical, Therapeutic)

#### Effets Secondaires
```multi-select```
- Nausées, Maux de tête, Fatigue, Anxiété, Paranoia, Vertige, etc.

#### Notes Complètes
- **Ressenti global** `textarea` - Impression générale
- **Adapté pour** `textarea` - Contexte d'utilisation recommandé
- **Ajustements** `textarea` - Modifications dosage si nécessaire

```json
{
  "dosageUsed": 1.5,
  "consumptionMethod": "direct",
  "consumerState": "after_meal",
  "onsetTime": "30-60",
  "durationTotal": "medium",
  "onset": 6.5,
  "intensity": 7.2,
  "profiles": ["Relaxant", "Euphorie", "Créatif"],
  "sideEffects": ["Bouche sèche"],
  "overallFeeling": "Effet puissant et agréable, bien adapté soirée",
  "recommendedFor": "Consommation sociale en soirée",
  "adjustments": "Demi-portion pour novices"
}
```

---

## 🔍 Flux de Création Review Comestible

```
1. Infos Générales (obligatoires: nom, type, fabricant, type cannabinique, photo)
   ↓
2. Pipeline Recette (Ingrédients + Étapes préparation)
   ↓
3. Goûts
   ↓
4. Effets Ressentis
   ↓
SAUVEGARDE / EXPORT
```

---

## 📊 Données Export

### Template "Compact"
- Infos générales + photo
- Dosage par portion
- Profil saveur résumé
- Profil effets résumé

### Template "Détaillé"
- Infos complètes
- Recette complète (ingrédients + étapes)
- Goûts détaillés
- Effets détaillés

### Template "Complète"
- Tous les contenus intégraux
- Recette complète avec notes
- Analyse nutritive (si dispo)
- Conseils préparation/consommation

---

## 🔗 Fichiers Référence

- Backend: `server-new/routes/reviews.js`
- Schema: `server-new/prisma/schema.prisma`

---

## ✅ Checklist Complétude Review Comestible

- [ ] Nom commercial + photo(s)
- [ ] Type de comestible
- [ ] Fabricant
- [ ] Type génétique + cultivar(s)
- [ ] Recette: ingrédients + étapes
- [ ] Dosage cannabis total + par portion
- [ ] Goûts: min 3 saveurs dominantes
- [ ] Profil saveur détaillé (initial, mid, aftertaste)
- [ ] Effets: latence, durée, intensité
- [ ] Effets: min 3 profils
- [ ] Observations consommation

