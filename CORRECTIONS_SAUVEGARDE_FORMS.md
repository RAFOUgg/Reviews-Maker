# 🔧 Corrections de sauvegarde des données de formulaires

**Date:** 2026-02-03  
**Problème:** Les données des formulaires de reviews (Fleurs, Hash, Concentré, Comestible) ne se sauvegardaient pas correctement en base de données.

## 🔍 Diagnostic

### Cause racine
Le frontend envoyait les données dans une structure **nested/imbriquée** (`formData.odeurs`, `formData.gouts`, `formData.texture`, etc.) mais le backend attendait des champs **plats** avec des noms différents (ex: `notesOdeursDominantes`, `intensiteGoutScore`).

### Exemple du problème
```javascript
// Frontend envoyait:
{
  odeurs: { dominantNotes: [...], intensity: 8 },
  gouts: { intensity: 7, dryPuffNotes: [...] }
}

// Backend attendait:
{
  notesOdeursDominantes: [...],
  intensiteAromeScore: 8,
  intensiteGoutScore: 7,
  dryPuffNotes: [...]
}
```

## ✅ Corrections apportées

### 1. Nouveau module utilitaire: `formDataFlattener.js`
**Fichier:** `client/src/utils/formDataFlattener.js`

Fonctions créées:
- `flattenCommonFormData(data)` - Aplatit les sections communes (odeurs, gouts, texture, effets, curing)
- `flattenFlowerFormData(data)` - Spécifique aux Fleurs (+ génétiques, culture, analytics)
- `flattenHashFormData(data)` - Spécifique au Hash (+ séparation)
- `flattenConcentrateFormData(data)` - Spécifique aux Concentrés (+ extraction)
- `flattenEdibleFormData(data)` - Spécifique aux Comestibles (+ recette)
- `createFormDataFromFlat(flatData, photos, status)` - Crée le FormData final

### 2. Mise à jour des formulaires frontend

| Fichier | Modification |
|---------|-------------|
| `CreateFlowerReview/index.jsx` | Import et utilisation de `flattenFlowerFormData` |
| `CreateHashReview/index.jsx` | Import et utilisation de `flattenHashFormData` |
| `CreateConcentrateReview/index.jsx` | Import et utilisation de `flattenConcentrateFormData` |
| `CreateEdibleReview/index.jsx` | Import et utilisation de `flattenEdibleFormData` |

### 3. Backend - Validation FlowerReview

**Fichier:** `server-new/routes/flower-reviews.js`

- Fonction `validateFlowerReviewData()` réécrite complètement
- Accepte maintenant les nouveaux noms de champs aplatis
- Validation `varietyType` assouplie (accepte tous les types CDC)
- Gestion des nouveaux champs JSON (timeline config/data)

### 4. Schéma Prisma - Nouveaux champs

**Fichier:** `server-new/prisma/schema.prisma`

Champs ajoutés au modèle `FlowerReview`:
```prisma
// Pipeline Culture inline
cultureTimelineConfig   String?
cultureTimelineData     String?
cultureMode             String?
cultureSpaceType        String?
cultureSubstrat         String?

// Pipeline Curing inline
curingTimelineConfig    String?
curingTimelineData      String?
curingTemperature       Float?
curingHumidity          Float?

// Odeurs additionnels
complexiteAromeScore    Float?
fideliteAromeScore      Float?
```

### 5. Migration Prisma
```bash
npx prisma migrate dev --name add_timeline_fields_to_flower
```
Migration appliquée avec succès.

## 📋 Mapping des champs (Frontend → Backend/Prisma)

### Odeurs
| Frontend | Backend/Prisma |
|----------|----------------|
| `odeurs.dominantNotes` | `notesOdeursDominantes` |
| `odeurs.secondaryNotes` | `notesOdeursSecondaires` |
| `odeurs.intensity` | `intensiteAromeScore` |
| `odeurs.complexity` | `complexiteAromeScore` |
| `odeurs.fidelity` | `fideliteAromeScore` |

### Texture
| Frontend | Backend/Prisma |
|----------|----------------|
| `texture.hardness` | `dureteScore` |
| `texture.density` | `densiteTactileScore` |
| `texture.elasticity` | `elasticiteScore` |
| `texture.stickiness` | `collantScore` |

### Goûts
| Frontend | Backend/Prisma |
|----------|----------------|
| `gouts.intensity` | `intensiteGoutScore` |
| `gouts.aggressiveness` | `agressiviteScore` |
| `gouts.dryPuffNotes` | `dryPuffNotes` |
| `gouts.inhalationNotes` | `inhalationNotes` |
| `gouts.exhalationNotes` | `expirationNotes` |

### Effets
| Frontend | Backend/Prisma |
|----------|----------------|
| `effets.onset` | `monteeScore` |
| `effets.intensity` | `intensiteEffetScore` |
| `effets.effects` | `effetsChoisis` |
| `effets.methodeConsommation` | `consumptionMethod` |
| `effets.profilsEffets` | `effectProfiles` |
| `effets.effetsSecondaires` | `sideEffects` |
| `effets.usagesPreferes` | `preferredUse` |

### Curing
| Frontend | Backend/Prisma |
|----------|----------------|
| `curing.curingTimelineConfig` | `curingTimelineConfig` |
| `curing.curingTimeline` | `curingTimelineData` |
| `curing.curingType` | `curingType` |
| `curing.temperature` | `curingTemperature` |
| `curing.humidity` | `curingHumidity` |

## 🧪 Test recommandé

1. Démarrer le backend: `cd server-new && npm run dev`
2. Démarrer le frontend: `cd client && npm run dev`
3. Se connecter et créer une nouvelle review Fleur
4. Remplir quelques sections (Infos générales + Odeurs + Texture)
5. Cliquer sur "Sauvegarder brouillon"
6. Vérifier en console le log `📤 Sending flattened data:`
7. Vérifier que la review est bien créée dans la base de données

## 📁 Fichiers modifiés

1. `client/src/utils/formDataFlattener.js` (nouveau)
2. `client/src/pages/review/CreateFlowerReview/index.jsx`
3. `client/src/pages/review/CreateHashReview/index.jsx`
4. `client/src/pages/review/CreateConcentrateReview/index.jsx`
5. `client/src/pages/review/CreateEdibleReview/index.jsx`
6. `server-new/routes/flower-reviews.js`
7. `server-new/prisma/schema.prisma`
8. `server-new/prisma/migrations/20260203123259_add_timeline_fields_to_flower/`
