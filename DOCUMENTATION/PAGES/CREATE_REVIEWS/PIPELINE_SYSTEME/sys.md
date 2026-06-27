# Système Pipeline — État réel (vérifié 2026-06-19)

> ⚠️ Ce document remplace la version précédente qui décrivait un modèle Prisma `Pipeline`/`PipelineStage` générique et des routes `/api/reviews/:reviewId/pipelines` — **ça n'existe pas dans le code réel**. Chaque type de review stocke ses pipelines directement dans ses propres colonnes JSON (`cultureTimelineConfig`/`cultureTimelineData`, etc.), pas via une table relationnelle séparée.

## Concept réel

Un "Pipeline" est un éditeur de chronologie drag-and-drop (composant `PipelineDragDropView`) permettant de documenter les étapes de production via des cases assignables sur une grille temporelle (façon calendrier GitHub commits). Chaque case peut recevoir des champs de données via une modale (`PipelineDataModal`).

## Chaîne de montage réelle par type

| Pipeline | Page | Chaîne de composants | Implémentation case | Stockage Prisma |
|---|---|---|---|---|
| Culture (Fleur) | `CreateFlowerReview` | `PipelineCulture.jsx` → `UnifiedPipeline(type="culture")` → `PipelineDragDropView` | Moderne (via `UnifiedPipeline`) | `FlowerReview.cultureTimelineConfig`/`cultureTimelineData` (JSON string), l.668-669 |
| Curing/Maturation (Fleur) | `CreateFlowerReview` | `PipelineCuring.jsx` → `UnifiedPipeline(type="curing")` → `PipelineDragDropView` | Moderne | `FlowerReview.curingTimelineConfig`/`curingTimelineData`, l.760-761 |
| Séparation (Hash) | `CreateHashReview` | `SeparationPipelineAdapter` → `SeparationPipelineSection` → `SeparationPipelineDragDrop` (dossier `legacy/`, mais activement utilisé) | Legacy actif | `HashReview.separationTimelineConfig`/`separationTimelineData`, l.806-807 |
| Curing/Maturation (Hash) | `CreateHashReview` | `CuringMaturationAdapter` → `CuringMaturationSection` → `PipelineDragDropView` | Moderne | Colonnes curing sur `HashReview` (à confirmer l.873-876) |
| Extraction (Concentré) | `CreateConcentrateReview` | `ExtractionPipelineAdapter` → `ExtractionPipelineSection` → `ExtractionPipelineDragDrop` (dossier `legacy/`, actif) | Legacy actif | `ConcentrateReview.extractionTimelineConfig`/`extractionTimelineData`, l.917-918 |
| Curing/Maturation (Concentré) | `CreateConcentrateReview` | `CuringMaturationAdapter` → `PipelineDragDropView` | Moderne | `curingPipelineGithubIdConcentrate` (référence ID, l.981) — schéma de stockage différent, à clarifier |
| Recette (Edible) | `CreateEdibleReview` | `RecipePipelineSection.jsx` → `PipelineGitHubGrid` | Système distinct (pas `UnifiedPipeline`) | `EdibleReview.ingredients`/`etapesPreparation` (JSON) + `recipePipelineGithubId`, l.1011/1017-1018 |

**"Legacy actif"** = le composant vit dans `client/src/components/pipelines/legacy/` mais est bien importé et utilisé par les Adapters modernes (Séparation et Extraction) — ce n'est pas du code mort, juste une dénomination de dossier trompeuse à corriger un jour.

## Code réellement mort (confirmé par grep d'imports)

- `client/src/components/pipelines/core/PipelineCore.jsx` — 0 import actif
- `client/src/components/pipelines/core/PipelineCellEditor.jsx` — importé seulement par `PipelineCore.jsx` (donc mort par transitivité)
- `client/src/components/pipelines/core/PipelineManager.jsx` — importé seulement par `legacy/PipelineCuring.jsx`, lui-même non monté depuis une page de review active
- Composants legacy `PipelineWithCultivars`, `PurificationPipeline`, `FertilizationPipeline`, `CulturePipelineTimeline`, `CuringMaturationTimeline` — importés uniquement par `CreateReviewPage.jsx`/`EditReviewPage.jsx`, qui sont des pages de redirection deprecated (redirigent automatiquement vers les pages modernes sans jamais rendre ces composants)

## Architecture unifiée — `UnifiedPipeline`

`client/src/components/shared/orchard/UnifiedPipeline.jsx` est le point d'entrée générique pour Culture/Curing (et conceptuellement Extraction/Séparation, bien que ces deux derniers passent encore par les Adapters → composants legacy plutôt que directement par `UnifiedPipeline`). Il charge une config statique par type (`getPipelineConfig(type)`), des préréglages locaux, puis rend `PipelineDragDropView`.

## `PipelineDragDropView` — composant central

`client/src/components/pipelines/views/PipelineDragDropView.jsx`. Props clés : `type`, `sidebarContent`, `timelineConfig`, `timelineData` (array `[{timestamp, data}]`), `onConfigChange`, `onDataChange`. Contient aussi : `GroupedPresetModal` (création/édition de groupes de préréglages), la modale **"Bibliothèque de setups"** (`SavePipelineModal`, ajoutée en 2026-06) qui permet de sauvegarder/charger des configurations complètes (config + groupes de préréglages) en `localStorage` par type de pipeline, avec des templates prédéfinis statiques (`client/src/config/pipelineStarterSetups.js`, ex: "Indoor DWC", "Ice Water", etc. — stockage mémoire uniquement, pas d'API backend).

Toutes les modales de ce composant (`PipelineDataModal`, `GroupedPresetModal`, `SavePipelineModal`) sont rendues via `createPortal(..., document.body)` pour échapper aux stacking contexts CSS des layouts parents (cf. `ResponsiveCreateReviewLayout` qui crée un stacking context avec `relative z-10` — voir mémoire projet pour le détail du piège z-index).

## Préréglages (`usePresets` hook)

`client/src/hooks/usePresets.js` — hybride :
- **Authentifié** : `GET/POST/PUT/DELETE /api/presets` (modèle Prisma `UserPreset` : `id`, `userId`, `name`, `type` (`field`/`grouped`/`pipeline`), `pipelineType`, `data` JSON, `useCount`), avec synchronisation de secours en `localStorage`.
- **Non authentifié** : `localStorage` uniquement (clés `${pipelineType}_field_presets`, `pipeline-grouped-presets-${pipelineType}`, `pipeline-presets`).

## Format de données réel

```js
// timelineData (array)
[{ timestamp: number, data: { /* champs libres selon type pipeline */ } }]

// timelineConfig (objet)
{ type: 'phases' | 'days' | 'weeks' | 'months', startDate?, endDate?, duration?, phases?: [...] }
```

Stocké en base comme **string JSON** (pas un type JSON natif Prisma) sur la colonne correspondante de chaque modèle `*Review` — voir le tableau de montage ci-dessus pour les noms de colonnes exacts. Sérialisation/désérialisation faite manuellement dans les routes (`JSON.parse`/`JSON.stringify`), ex. `flower-reviews.js:213-225`.

## Fichiers référence

- `client/src/components/pipelines/views/PipelineDragDropView.jsx`
- `client/src/components/pipelines/core/PipelineDataModal.jsx`
- `client/src/components/shared/orchard/UnifiedPipeline.jsx`
- `client/src/config/pipelineStarterSetups.js`
- `client/src/hooks/usePresets.js`
- `server-new/prisma/schema.prisma` (champs `*TimelineConfig`/`*TimelineData` sur chaque modèle `*Review`, modèle `UserPreset` l.1364-1381)
