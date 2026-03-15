# Plan de Travail — Système de Création & Export de Reviews
> Établi après audit complet du codebase. Dernière mise à jour : 2026-03-14

---

## MÉTHODOLOGIE DE TRAVAIL

### Règles immuables
1. **Lire avant de toucher** — toujours lire le fichier en entier avant d'éditer
2. **Un problème à la fois** — finir une tâche complètement avant d'en commencer une autre
3. **Test mental à chaque étape** — vérifier la cohérence données formulaire ↔ DB ↔ ExportMaker
4. **Pas de réécriture complète** — améliorer le code existant, ne pas tout refaire
5. **Partager les sections** — préférer les composants sections/ partagés plutôt que dupliquer
6. **Back + Front ensemble** — valider le schéma DB avant de coder le frontend

### Ordre d'exécution obligatoire
```
Formulaires → Hooks → Service API → Route Backend → resolveReviewField → Template Render
```

---

## AUDIT — ÉTAT ACTUEL

### Formulaires de création (frontend)

| Type | Sections présentes | Sections manquantes |
|------|--------------------|---------------------|
| **Flower** ✅ | InfosGenerales, Génétiques, Pipeline Culture, Analytics, Visuel, Odeurs, Texture, Goûts, Effets, Curing | *(complet)* |
| **Hash** ⚠️ | InfosGenerales | Visuel, Odeurs, Texture, Goûts, Effets, Pipeline Séparation/Purification |
| **Concentrate** ⚠️ | InfosGenerales | Visuel, Odeurs, Texture, Goûts, Effets, Pipeline Extraction/Purification |
| **Edible** 🟡 | InfosGenerales, RecipePipeline | Goûts, Effets |

### Sections partagées existantes (réutilisables)

| Composant | Chemin | Utilisé par |
|-----------|--------|-------------|
| `AnalyticsSection` | `components/sections/AnalyticsSection.jsx` | Flower |
| `OdorSection` | `components/sections/OdorSection.jsx` | Flower |
| `TextureSection` | `components/sections/TextureSection.jsx` | Flower |
| `TasteSection` | `components/sections/TasteSection.jsx` | Flower |
| `EffectsSectionImpl` | `components/sections/EffectsSectionImpl.jsx` | Flower |
| `CuringMaturationSection` | `components/sections/CuringMaturationSection.jsx` | Flower |
| `CulturePipelineSection` | `components/pipelines/sections/CulturePipelineSection.jsx` | Flower |

### Modèles DB (Prisma — SQLite)

| Modèle | État | Champs notables |
|--------|------|-----------------|
| `FlowerReview` | ✅ Complet | 60+ champs couvrant toutes les sections |
| `HashReview` | ✅ Schéma ok | Séparation, purification, curing définis |
| `ConcentrateReview` | ✅ Schéma ok | Extraction, purification définis |
| `EdibleReview` | ✅ Schéma ok | Recipe JSON, effets |
| `GeneticTree` + `GenNode` + `GenEdge` | ✅ | Arbre généalogique (flower uniquement) |
| `PipelineGithub` | ✅ | Grille GitHub-style (culture, curing, extraction...) |

### ExportMaker — Données rendues vs manquantes

**Problème central : `resolveReviewField()` cherche des IDs génériques** (`odor`, `taste`, `effects`) **mais les données DB ont des noms spécifiques** (`notesOdeursDominantes`, `intensiteAromeScore`, etc.)

| Section Données | Template Compact | Standard | Detailed | Problème |
|----------------|-----------------|----------|----------|----------|
| Photo + Nom | ✅ | ✅ | ✅ | OK |
| THC/CBD | ✅ | ✅ | ✅ | OK |
| Catégorie Scores (radars) | ✅ | ✅ | ✅ | OK |
| **Odeurs (notes)** | ❌ | ⚠️ Partiel | ⚠️ Partiel | `resolveReviewField('odor')` trouve rien → renvoie `{}` |
| **Goûts (notes)** | ❌ | ⚠️ Partiel | ⚠️ Partiel | Même problème |
| **Texture détaillée** | ❌ | ⚠️ | ⚠️ | |
| **Effets (liste)** | ❌ | ⚠️ | ⚠️ | `effetsChoisis` non mappé |
| **CBG/CBC/CBN/THCV** | ❌ | ❌ | ❌ | Non affichés |
| **Profil terpénique** | ❌ | ⚠️ | ✅ | Partiel |
| **Génétiques (arbre)** | ❌ | ❌ | ❌ | Non rendu du tout |
| **Pipeline culture** | ❌ | ❌ | ❌ | Champ présent dans visibility mais non rendu |
| **Récolte (poids)** | ❌ | ❌ | ⚠️ | Données présentes mais routing cassé |
| **Phénotype / Farm / Breeder** | ❌ | ⚠️ | ✅ | Incomplet |
| **Hash : hashmaker, séparation** | ❌ | ❌ | ❌ | Non mappé |
| **Concentrate : méthode extraction** | ❌ | ❌ | ❌ | Non mappé |

---

## PLAN D'EXÉCUTION

---

### PHASE 1 — Formulaires Hash & Concentrate (sections manquantes)
**Durée estimée : 4 sessions**
**Priorité : HAUTE — sans ça, les données n'existent pas pour l'export**

#### 1.1 `CreateHashReview` — Sections à ajouter
```
Sections actuelles : InfosGenerales
À ajouter :
├── Section Pipeline Séparation (méthode, paramètres, pipeline GitHub-style)
├── Section Visuel & Technique (couleur/transparence, densité, pureté, pistils, mold...)
├── Section Odeurs (réutiliser OdorSection avec config hashType)
├── Section Texture (réutiliser TextureSection avec config hashType)
├── Section Goûts (réutiliser TasteSection avec config hashType)
├── Section Effets (réutiliser EffectsSectionImpl)
└── Section Curing (optionnel, réutiliser CuringMaturationSection)
```

**Fichiers à créer/modifier :**
- `CreateHashReview/sections/PipelineSeparation.jsx` (nouveau)
- `CreateHashReview/sections/VisuelHash.jsx` (nouveau)
- `CreateHashReview/hooks/useHashForm.js` (compléter la logique save/load)
- `CreateHashReview/index.jsx` (intégrer les nouvelles sections dans le layout)
- `server-new/routes/hash-reviews.js` (vérifier que tous les champs sont sauvegardés)

#### 1.2 `CreateConcentrateReview` — Sections à ajouter
```
Sections actuelles : InfosGenerales
À ajouter :
├── Section Pipeline Extraction (méthode, paramètres, pipeline GitHub-style)
├── Section Pipeline Purification
├── Section Visuel & Technique (couleur, viscosité, pureté, melting, résidus...)
├── Section Odeurs (réutiliser OdorSection config concentrateType)
├── Section Texture (réutiliser)
├── Section Goûts (réutiliser)
├── Section Effets (réutiliser)
└── Section Curing optionnel
```

**Fichiers à créer/modifier :**
- `CreateConcentrateReview/sections/PipelineExtraction.jsx` (nouveau)
- `CreateConcentrateReview/sections/PipelinePurification.jsx` (nouveau)
- `CreateConcentrateReview/sections/VisuelConcentrate.jsx` (nouveau)
- `CreateConcentrateReview/hooks/useConcentrateForm.js` (compléter)
- `CreateConcentrateReview/index.jsx` (intégrer)
- `server-new/routes/concentrate-reviews.js` (vérifier/compléter)

#### 1.3 `CreateEdibleReview` — Complétion
```
Sections actuelles : InfosGenerales, RecipePipeline
À ajouter :
├── Section Goûts (spécifique : arôme, texture en bouche, douceur, intensité)
└── Section Effets (réutiliser EffectsSectionImpl)
```

---

### PHASE 2 — Fix `resolveReviewField` dans ExportMaker
**Durée estimée : 2 sessions**
**Priorité : CRITIQUE — c'est la cause de 80% des données manquantes en export**

**Problème :** La fonction `resolveReviewField(id)` cherche par IDs génériques. Elle ne trouve pas les données spécifiques car les champs ont des noms différents dans `flowerData`, `hashData`, etc.

**Fix :** Créer une **map de résolution par type de produit** dans ExportMaker :

```js
// Mapping ID générique → chemin réel dans les données
const FIELD_RESOLVER_MAP = {
  flower: {
    'odor': (d) => ({
      dominantNotes: parseArr(d.notesOdeursDominantes),
      secondaryNotes: parseArr(d.notesOdeursSecondaires),
      intensity: d.intensiteAromeScore,
      complexity: d.complexiteAromeScore,
      fidelity: d.fideliteAromeScore,
    }),
    'taste': (d) => ({
      intensity: d.intensiteGoutScore,
      aggressiveness: d.agressiviteScore,
      dryPuff: parseArr(d.dryPuffNotes),
      inhalation: parseArr(d.inhalationNotes),
      exhalation: parseArr(d.expirationNotes),
    }),
    'texture': (d) => ({...}),
    'effects': (d) => ({
      onset: d.monteeScore,
      intensity: d.intensiteEffetScore,
      list: parseArr(d.effetsChoisis),
      duration: d.effectDuration,
      profiles: parseArr(d.effectProfiles),
    }),
    'genetics': (d) => ({
      breeder: d.breeder,
      variety: d.variety,
      indicaPercent: d.indicaPercent,
      sativaPercent: d.sativaPercent,
      phenotype: d.phenotypeCode,
      parentage: parseObj(d.parentage),
    }),
    'recolte': (d) => ({...}),
    'culture': (d) => ({...}),
    'curing': (d) => ({...}),
  },
  hash: { ... },
  concentrate: { ... },
  edible: { ... },
}
```

**Fichiers à modifier :**
- `client/src/components/export/ExportMaker.jsx` — fonction `resolveReviewField()` (lignes ~100-200)

---

### PHASE 3 — Enrichir les templates d'export
**Durée estimée : 3 sessions**
**Priorité : HAUTE — les données sont là après la phase 2, il faut les afficher**

#### 3.1 Template Standard — Compléter le rendu
Données à ajouter :
- **Génétiques** : breeder, variety, indicaPercent/sativaPercent ratio, phénotype
- **Odeurs** : notes dominantes + secondaires en pills colorées (existant en partie, à connecter)
- **Goûts** : dry puff / inhalation / expiration notes
- **Texture** : tous les scores pas seulement les 2 premiers
- **Effets** : liste des effets + profils + durée
- **Analytics complet** : CBG, CBC, CBN, THCV (si disponibles)
- **Récolte** : poids brut/net, % trichomes
- **Pipeline résumé** : ligne "Indoor, LED, 70j" pour culture

#### 3.2 Template Detailed — Rendu complet
Données supplémentaires :
- **Arbre généalogique** : visualisation simplifiée (2-3 niveaux)
- **Pipeline culture** : aperçu des phases (semaine 1-4 → veg, semaine 5-8 → floraison...)
- **Pipeline curing** : durée, temp, humidité
- **Profil terpénique complet** : pie chart ou liste avec %
- **Lab report info** : logo "Analysé en laboratoire" si labReportUrl présent

#### 3.3 Template Compact — Améliorer la densité
- Ajouter les 2-3 arômes dominants (notes odeur) sous le nom du produit
- Afficher phénotype si présent

#### 3.4 Adaptation par type de produit
Le canvas doit adapter selon `productType` :
- **Hash** : hashmaker, méthode séparation, fidélité cultivars
- **Concentrate** : méthode extraction, viscosité, melting
- **Edible** : ingrédients clés, dosage cannabinoïdes, temps d'effet

**Fichiers à modifier :**
- `client/src/components/export/ExportMaker.jsx` — fonctions `renderStandardCanvas()`, `renderDetailedCanvas()`, `renderCompactCanvas()`

---

### PHASE 4 — Vérification Backend (routes + formatters)
**Durée estimée : 2 sessions**
**Priorité : MOYENNE — s'assurer que tout est bien sauvegardé et retourné**

#### 4.1 Vérifier les routes de sauvegarde
Pour chaque type :
- `POST /api/flower-reviews` + `PUT /api/flower-reviews/:id` → tous les champs de FlowerReview sauvegardés ?
- `POST /api/hash-reviews` → idem HashReview
- `POST /api/concentrate-reviews` → idem ConcentrateReview
- `POST /api/edible-reviews` → idem EdibleReview

**Audit rapide :** Comparer les champs envoyés par le frontend (`flattenFlowerFormData`) avec les champs acceptés dans `validateFlowerReviewData`

#### 4.2 Vérifier les routes de récupération
- `GET /api/flower-reviews/:id` → inclut bien `flowerData` et `pipeline` et `geneticTree` ?
- Format JSON retourné utilisable par `resolveReviewField` ?

#### 4.3 Vérifier `reviewFormatter.js` et `fieldMapper.js`
- Ces utilitaires formatent-ils correctement les données pour le frontend ?
- Les champs JSON (terpeneProfile, effetsChoisis, etc.) sont-ils bien parsés ?

#### 4.4 Route export
- `POST /api/library/exports` → fonctionne-t-elle ?
- Sauvegarde-t-elle l'image + les métadonnées ?

---

### PHASE 5 — Intégration, Tests, Polissage
**Durée estimée : 1 session**

- Test complet : créer une review Flower, Hash, Concentrate, Edible de bout en bout
- Vérifier chaque champ dans l'export
- Vérifier le responsive du modal ExportMaker (tous les formats : 1:1, 16:9, 9:16, A4)
- Polissage visuel des templates (espacement, typography, densité)

---

## FICHIERS CLÉS PAR SECTION

```
client/src/
├── pages/review/
│   ├── CreateFlowerReview/       ← REFERENCE (le plus complet)
│   │   ├── index.jsx              ← Layout principal, section routing
│   │   ├── hooks/useFlowerForm.js ← State + load/save logic
│   │   └── sections/              ← Toutes les sections spécifiques flower
│   ├── CreateHashReview/          ← À COMPLÉTER (Phase 1)
│   ├── CreateConcentrateReview/   ← À COMPLÉTER (Phase 1)
│   └── CreateEdibleReview/        ← À COMPLÉTER PARTIELLEMENT (Phase 1)
├── components/
│   ├── sections/                  ← PARTAGÉS - réutiliser !
│   │   ├── AnalyticsSection.jsx
│   │   ├── OdorSection.jsx
│   │   ├── TextureSection.jsx
│   │   ├── TasteSection.jsx
│   │   ├── EffectsSectionImpl.jsx
│   │   └── CuringMaturationSection.jsx
│   ├── pipelines/sections/        ← Pipeline réutilisable
│   │   └── CulturePipelineSection.jsx
│   └── export/
│       └── ExportMaker.jsx        ← À ENRICHIR (Phase 2+3)
server-new/
├── prisma/schema.prisma           ← DB OK, ne pas modifier
├── routes/
│   ├── flower-reviews.js          ← REFERENCE
│   ├── hash-reviews.js            ← Vérifier/compléter (Phase 4)
│   ├── concentrate-reviews.js     ← Vérifier/compléter (Phase 4)
│   ├── edible-reviews.js          ← Vérifier/compléter (Phase 4)
│   └── export.js                  ← Vérifier (Phase 4)
└── utils/
    ├── reviewFormatter.js          ← Formattage sortie API
    └── fieldMapper.js              ← Mapping champs
```

---

## ORDRE DE DÉMARRAGE RECOMMANDÉ

```
1. Phase 2 d'abord : fix resolveReviewField
   → Impact immédiat sur les exports Flower (déjà créés)
   → Permet de voir les résultats tout de suite

2. Phase 3 : enrichir les templates Standard + Detailed
   → Afficher toutes les données maintenant correctement résolues

3. Phase 1 : compléter Hash + Concentrate
   → Suivre exactement le pattern Flower (copier/adapter)
   → Commencer par Hash (plus proche de Flower)

4. Phase 4 : audit backend
   → Valider que Hash/Concentrate/Edible sauvegardent bien tout

5. Phase 5 : intégration finale
```

---

## SUIVI D'AVANCEMENT

| Phase | Tâche | État |
|-------|-------|------|
| Phase 2 | Fix `resolveReviewField` — mapping flower | ✅ Fait |
| Phase 2 | Fix `resolveReviewField` — genetics objet, hash/concentrate fields, CBC/CBN/THCV/labReport | ✅ Fait |
| Phase 2 | Fix `case 'terpeneProfile'/'terpenes'` manquant + doublon `laboratoire` | ✅ Fait |
| Phase 3 | Template Standard — genetics objet rendu, CBG/THCV pills, Visual+Texture+Récolte sections | ✅ Fait |
| Phase 3 | Template Detailed — CBG/CBC/THCV pills, odeur complexité/fidélité, effets profilesETC | ✅ Fait |
| Phase 3 | Template Standard — effets + analytics complet + récolte | ✅ Fait |
| Phase 3 | Template Detailed — arbre généalogique + pipeline | 🟡 Partiel (pipeline OK, arbre génétique = TODO) |
| Phase 3 | Adaptation par productType (hash/concentrate) | 🔴 À faire |
| Phase 1 | CreateHashReview — PipelineSeparation + VisuelHash | 🟡 Composants présents, intégration à vérifier |
| Phase 1 | CreateHashReview — intégrer sections partagées (odeur/texture/goût/effets) | 🟡 Présents, à vérifier |
| Phase 1 | CreateConcentrateReview — PipelineExtraction + Purification + Visuel | 🟡 Présents, à vérifier |
| Phase 1 | CreateConcentrateReview — intégrer sections partagées | 🟡 Présents, à vérifier |
| Phase 1 | CreateEdibleReview — Goûts + Effets | 🟡 Présents, à vérifier |
| Phase 4 | Audit routes hash/concentrate/edible | 🔴 À faire |
| Phase 4 | Vérifier reviewFormatter + fieldMapper | 🔴 À faire |
| Phase 5 | Tests end-to-end | 🔴 À faire |
