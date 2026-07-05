# Anomalies, code mort & divergences constatées pendant l'audit

> Constats factuels (grep/lecture de code), pas des jugements scientifiques — recensés ici séparément car ils affectent directement la fiabilité de tout futur travail sur les menus déroulants/configurations : implémenter une évolution sur un fichier orphelin n'aurait aucun effet visible en production.

## 1. Fichiers de données orphelins (non importés, confirmés par grep)

| Fichier | Raison d'être probable | Doublon actif de |
|---|---|---|
| `client/src/data/cannabinoids.js` | Référentiel riche de 18 cannabinoïdes (dont THCA/CBDA/CBGA/Δ8/Δ10) | Non remplacé — `AnalyticsSection.jsx` code THC/CBD/CBG/CBC en dur, sans lien avec ce fichier |
| `client/src/data/terpenes.js` | 20 terpènes documentés | Non remplacé — le profil terpénique n'existe que via upload de fichier |
| `client/src/data/odorNotes.js` | 11 familles, ~110 notes | `client/src/data/aromasWheel.js` (utilisé réellement) |
| `client/src/data/effects.js` | 30 effets, 4 catégories | `client/src/data/effectsCategories.js` (utilisé réellement) |
| `client/src/data/curingMethods.js` | Types récipient/emballage/opacité | `client/src/config/curingSidebarContent.js` (utilisé réellement) |
| `client/src/data/cultureMethods.js` | Méthodes de culture | `client/src/config/cultureSidebarContent.js` (utilisé réellement) |
| `client/src/data/culturePhases.js` | Phases de culture | `client/src/config/pipelinePhases.js` (utilisé réellement) |
| `client/src/data/extractionMethods.js` | Méthodes d'extraction | `client/src/config/extractionSidebarContent.js` (utilisé réellement) |
| `client/src/data/separationMethods.js` | Méthodes de séparation | `client/src/config/separationSidebarContent.js` (utilisé réellement) |
| `client/src/data/purificationMethods.js` | Méthodes de purification | `client/src/config/purificationSidebarContent.js` (lui-même orphelin, voir §2) |
| `client/src/data/flowerData.js` | Inconnu/non identifié | — |
| `client/src/data/timelineVisualization.js` | Inconnu/non identifié | — |
| `client/src/config/pipelineConfigs.js` | Configuration centrale legacy (6 pipelines) | `getPipelineConfig()` sans aucun appelant — fichier mort dans son ensemble, y compris son `CULTURE_PIPELINE_CONFIG` basé sur `data/cultureFormData.js` |

## 2. Pipeline Purification : jamais branché dans un flux de review

Le pipeline dédié `purificationSidebarContent.js` (17 méthodes : winterisation, chromatographie/flash/HPLC/GC/TLC, décarboxylation, distillation fractionnée/short-path/moléculaire, filtration, centrifugation, séchage sous vide, recristallisation, sublimation, extraction liquide-liquide — le niveau de détail le plus proche du vocabulaire de laboratoire professionnel de tout le système) et ses composants (`PurificationPipelineDragDrop.jsx`, `PurificationMethodForm.jsx`) **existent en tant que code mais ne sont utilisés par aucune des 4 pages de review**. Les seuls champs de purification réellement saisissables se trouvent **noyés dans la sous-section "PURIFICATION" du pipeline Extraction** (Concentré uniquement, cf. [03_CONCENTRES.md](03_CONCENTRES.md) §2) — une version simplifiée (toggles winterization/filtration/decarboxylation/distillation) sans les options avancées (colonnes chromatographiques, solvants multiples, distillation moléculaire) du pipeline dédié.

**Implication produit** : si l'app veut un jour exposer le niveau de détail scientifique du fichier `purificationSidebarContent.js` (largement supérieur), il faut le brancher explicitement dans un flux (probablement Hash et/ou Concentré) plutôt que d'étoffer la sous-section actuelle qui duplique une partie plus pauvre du même concept.

## 3. Deux implémentations parallèles de "Visuel & Technique"

- `CreateFlowerReview/sections/VisuelTechnique.jsx` (Fleur — roue `ColorWheelPicker`/`cannabisColors.js`, max 5 couleurs, 7 sliders incluant pistils/manucure/graines).
- `components/sections/VisualSection.jsx` (Hash/Concentré — palettes `HASH_PALETTE`/`CONCENTRATE_PALETTE` déclarées localement, 3 à 5 sliders selon type).

La branche interne "Fleur" de `VisualSection.jsx` (qui référence `visualOptions.js`/`CANNABIS_COLORS`, un troisième système de couleurs à 7 familles/~23 nuances) n'est **jamais exécutée en production** car aucune page n'invoque ce composant avec `productType='flower'`. `visualOptions.js` est donc lui-même quasi-orphelin (code atteignable uniquement par une branche morte).

## 4. Barrel de sections Fleur non branché

`CreateFlowerReview/sections/{Effets,Experience,Gouts,Odeurs,Texture,PipelineCulture,PipelineCuring,Validation}.jsx`, exportés par un `sections/index.js`, ne sont importés nulle part — `CreateFlowerReview/index.jsx` utilise directement les composants partagés (`components/sections/*`). Ces 8 fichiers sont du code potentiellement obsolète, à vérifier avant toute réutilisation de leur contenu (ils peuvent décrire une version antérieure/différente des champs).

## 5. Bugs de contenu ponctuels

| Bug | Fichier | Détail |
|---|---|---|
| Clé dupliquée | `client/src/data/cannabinoids.js` | `id: 'thca'` utilisé deux fois (la seconde entrée, censée être THCVA, hérite par erreur de l'id `thca`) |
| Faute de frappe fonctionnelle | `CreateEdibleReview` `PREPARATION_ACTIONS` | `'Décarboyler'` au lieu de `'Décarboxyler'` — visible utilisateur dans le select |
| Faute de frappe cosmétique | `client/src/config/pipelineConfigs.js:364` | Clé d'objet `'poidsPlanteF raiche'` (espace au milieu) — sans incidence car fichier mort |
| Divergence presets/champs réels | `client/src/config/pipelineStarterSetups.js` | Référence des clés (`ph`, `ec`, `medium`, `targetTemp`, `targetRh`, `curingType` avec valeurs `standard/auto`) qui ne correspondent pas aux noms/valeurs réels des champs dans `cultureSidebarContent.js`/`curingSidebarContent.js` (`waterPH`/`waterEC`, `curingType` avec valeurs `cold/warm/room/controlled`) — les presets rapides sont donc potentiellement non fonctionnels ou partiellement silencieux selon la façon dont ils sont appliqués au state. |

## 6. Incohérence de génération entre GenNode et Cultivar (breeding)

Le champ `generation` du nœud PhenoHunt (`phenoNodeFields.js`) propose `P, F1, F2, F3, F4, BX1, BX2, BX3, S1, other` — **sans `IBL`** (Inbred Line, ligne stabilisée) — alors que `Cultivar.generationStatus` (bibliothèque) propose un vocabulaire légèrement différent et plus complet incluant `landrace, p, f1, f2, f3plus, s1, s2plus, bx1, bx2plus, ibl`. Les deux systèmes décrivent le même concept de génération/breeding mais avec des granularités différentes (`f3plus`/`s2plus`/`bx2plus` regroupent plusieurs générations côté Cultivar, alors que le nœud distingue F3/F4 et BX1/BX2/BX3 individuellement) — pas un bug bloquant mais une incohérence de modélisation à harmoniser si l'un des deux systèmes évolue.

## 7. Portée de cette liste

Cette liste ne prétend pas à l'exhaustivité totale (elle reflète ce que les deux agents d'exploration ont pu vérifier par grep/lecture dans le temps imparti) — mais chaque point ci-dessus a été confirmé par une recherche de références dans le code, pas supposé.
