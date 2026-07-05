# COMESTIBLES — inventaire complet des champs, par section de formulaire

> Page : `client/src/pages/review/CreateEdibleReview/index.jsx`. Modèle Prisma : `EdibleReview`. **Seulement 4 sections** (le type le plus léger structurellement — pas d'Analytiques, Visuel, Odeurs ni Texture dédiés, pas de Curing) : Infos générales → Recette &amp; Préparation → Goûts → Effets &amp; Expérience.

## 1. Informations générales

| Champ | Widget | Options |
|---|---|---|
| `nomProduit` (remplace `nomCommercial`) | texte, max 100 | Obligatoire |
| `typeComestible` | select | `EDIBLE_TYPES` (liste complète) : `Brownie`, `Cookie`, `Gâteau`, `Bonbon/Candy`, `Chocolat`, `Gummies`, `Boisson`, `Thé/Infusion`, `Huile culinaire`, `Beurre cannabique`, `Sauce`, `Pâte à tartiner`, `Sirop`, `Capsule`, `Autre` |
| `fabricant` | texte | — |
| `typeGenetiques` + `SourceLineageSelector` | texte | `allowedTypes=['flower','hash','concentrate']` — un comestible peut être fabriqué à partir de n'importe lequel des 3 autres types |
| `photos` | upload, 1-4 | — |

### Commentaire scientifique sur `typeComestible`
✅ Catégorisation cohérente avec le marché réel (cf. document 07 §1 — les boissons infusées "THC drinks" sont d'ailleurs le segment en plus forte croissance actuellement). Une distinction scientifiquement importante mais absente de ce champ : la **matrice du produit détermine sa cinétique d'absorption** — un comestible gras (chocolat, huile, beurre) suit la voie classique de digestion lipidique lente (onset 30min-2h, cf. §4), tandis qu'une boisson ou un produit à base de nanoémulsion (cf. document 08 §3) peut avoir un onset beaucoup plus rapide (10-20min), plus proche de l'absorption sublinguale/gastrique directe — cette variable n'est actuellement pas capturée par un champ dédié (seul `typeComestible` en select libre, sans lien avec la technologie de formulation).

## 2. Recette & Préparation

Fichier propre (pas de sidebar/timeline générique comme les autres pipelines) : `RecipePipelineSection.jsx`.

### Ingrédients (liste dynamique)
- Ingrédient **cannabinique** : `cannabinoidType` (select) : `fleur`, `hash`, `concentre`, `huile`, `beurre` — `name`, `quantity`, `unit`
- Ingrédient **standard** : `name`, `quantity`, `unit`

`UNITS` (liste complète) : `g`, `kg`, `ml`, `L`, `c. à soupe`, `c. à café`, `pincée`, `pcs`, `autre`

### Étapes de préparation (liste dynamique)
- `action` (select) : `Mélanger`, `Chauffer`, `Refroidir`, `Cuire`, `Infuser`, `Broyer`, `Tamiser`, `Laisser reposer`, `Décarboyler` *(coquille dans le code — devrait être "Décarboxyler")*, `Extraire`, `Autre`
- `description` (textarea libre), `duration` (texte libre)

### Commentaire scientifique
- ✅ La présence explicite de l'action **"Décarboxyler"** est le point le plus important scientifiquement pour ce type de produit : **sans décarboxylation préalable, le THCA/CBDA de la matière première n'est que très faiblement psychoactif/actif** — c'est une étape chimique non négociable (conversion thermique irréversible de la forme acide vers la forme neutre active, ~100-120°C pendant 30-60 min pour la fleur, cf. document 08 §2) que la plupart des recettes amateur oublient ou réalisent mal (température insuffisante ou durée trop courte).
- Le choix d'un ingrédient cannabinique de type **`huile`/`beurre`** est cohérent avec la chimie : le THC/CBD sont **liposolubles** (non hydrosolubles), l'infusion dans un corps gras est le mécanisme d'extraction et de vecteur d'absorption digestive classique — un futur raffinement pourrait typer le corps gras utilisé (beurre/huile de coco/huile de tournesol/lécithine de soja) car cela influence la biodisponibilité (la lécithine, par exemple, est parfois ajoutée spécifiquement pour améliorer l'émulsification et l'absorption, cf. document 08 §3 sur la nanoémulsion/liposomes).
- **Écart de conception constaté** : un `RECIPE_PIPELINE_CONFIG` bien plus riche existe dans `client/src/config/pipelineConfigs.js` (avec des phases préparation→décarboxylation→infusion→cuisson→refroidissement→conservation et des actions étendues comme "hacher"/"émulsionner"/"fouetter") mais **n'est jamais utilisé** par cette page — la recette réelle en production reste la version simple ci-dessus (cf. [10_ANOMALIES_CODE_MORT.md](10_ANOMALIES_CODE_MORT.md)).

## 3. Goûts (composant partagé `TasteSection.jsx`, mode `isEdible=true`)

| Champ | Différence vs Fleur/Hash/Concentré |
|---|---|
| `intensite` | slider /10, identique |
| `aftertastePersistence` (remplace `agressivite`) | slider /10, échelle dédiée `EDIBLE_AFTERTASTE_LEVELS` : Inexistante → Très légère → Légère → Perceptible → Modérée → Présente → Marquée → Longue en bouche → Très persistante → Goût cannabis dominant et persistant |
| `saveursDominantes` (remplace dryPuff/inhalation/expiration) | roue CATA, **max 7** |

### Commentaire scientifique
✅ Le remplacement de "agressivité/piquant" (pertinent pour la combustion — irritation des voies respiratoires) par "persistance de l'arrière-goût" est **cohérent avec la réalité sensorielle du comestible** : il n'y a pas de combustion donc pas de piquant respiratoire, mais le **"goût d'herbe" résiduel** (souvent décrit comme végétal/chlorophylle, lié à une décarboxylation/infusion mal maîtrisée ou à un manque de masquage aromatique) est au contraire le défaut sensoriel le plus fréquemment rapporté sur les comestibles artisanaux — l'échelle choisie adresse donc le bon problème.

## 4. Effets & Expérience (composant partagé `EffectsSectionImpl.jsx`, mode Edible)

Différences vs les 3 autres types :
- `methodeConsommation` : masqué, fixé à `comestible` (pas de choix — cohérent, il n'y a qu'une seule voie d'administration possible pour ce type de produit).
- `dosageUnite` : réduit à `mg` (THC/dose) et `g`, au lieu de g/mg/ml.
- `debutEffets` : utilise l'échelle dédiée `EXPERIENCE_VALUES.debutEffetsEdible` : `rapide` (&lt;30min), `moyen` (30-60min), `differe` (1-2h), `long` (2h+), `tres-long` (variable, &gt;3h) — **au lieu** de l'échelle standard (`immediat`/`rapide`/`moyen`/`differe`/`long`, calibrée en minutes pour la voie inhalée).

### ✅ Point scientifique le plus solide de tout le système Comestible
Cette distinction d'échelle d'onset est **pharmacologiquement fondée et bien implémentée** : contrairement à l'inhalation (absorption pulmonaire quasi immédiate), la voie orale implique une **absorption digestive lente** suivie d'un **passage hépatique de premier ordre** ("first-pass metabolism") qui métabolise une partie du THC en **11-hydroxy-THC**, un métabolite actif **plus puissant et à durée d'action plus longue** que le THC lui-même — ce qui explique à la fois :
1. Le délai d'apparition plus long et plus variable (30 min à plusieurs heures selon l'estomac plein/vide, le métabolisme individuel, la matrice du produit) — bien capturé par l'échelle dédiée avec son option `tres-long`/variable.
2. La durée d'effet généralement plus longue que par voie inhalée (souvent 4-8h contre 1-3h en fumé/vapoté) — cohérent avec le fait que `dureeEffets` en édition Comestible propose des tranches longues (`"5-15min"` à `"24h+"` selon la config partagée, mais le contexte Edible pousse naturellement vers les tranches hautes).

C'est un des rares endroits du système où la **différence pharmacologique réelle entre voies d'administration est explicitement modélisée dans le schéma de données**, plutôt que traitée comme une simple variante cosmétique du même champ — bon niveau de rigueur.

### Champs communs restants
`onset`/`intensity` (sliders /10), `duration` (select), `usagesPreferes` (max 10), `profilsEffets` (max 8), `effetsSecondaires` (max 10), `selectedEffects` (roue CATA, max 8) — identiques à [01_FLEURS.md](01_FLEURS.md) §10.

## Synthèse des points d'attention spécifiques Comestible

1. Absence de section Analytiques/Visuel/Texture dédiée — cohérent avec la nature du produit fini (un brownie n'a pas de "profil visuel de trichomes"), mais signifie qu'aucun taux de cannabinoïde par dose n'est structurellement rattaché à la fiche produit elle-même (seul `dosageUtilise` dans Effets, déclaratif utilisateur, pas un COA de labo comme pour les 3 autres types).
2. Le pipeline recette réellement utilisé est une version simplifiée ; une version plus riche existe dans le code mais est orpheline.
3. Faute de frappe `Décarboyler` à corriger dans la liste `PREPARATION_ACTIONS`.
