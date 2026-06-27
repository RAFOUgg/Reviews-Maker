# Hash (Hash, Kief, Ice-O-Lator, Dry-Sift) — État réel (vérifié 2026-06-19)

> ⚠️ Document réécrit pour remplacer la version précédente (spec aspirationnelle avec modèle `Pipeline`/`PipelineStage` générique fictif). Voir [PIPELINE_SYSTEME/sys.md](../PIPELINE_SYSTEME/sys.md) pour le système de pipeline réel.

## Vue d'ensemble

- **Page** : `client/src/pages/review/CreateHashReview/index.jsx`
- **Modèle Prisma** : `HashReview` (`schema.prisma:781-889`)
- **Route backend** : `server-new/routes/hash-reviews.js` — `POST /` (l.427-500) et `PUT /:id` (l.536-539)
- **Multer** : `upload.fields([{name:'photos', maxCount:4}, {name:'certificateFile', maxCount:1}, {name:'terpeneFile', maxCount:1}])` ✅ correct

## Sections réelles (ordre d'affichage)

| # | id | Titre | Composant | Champs principaux (réels) |
|---|----|-------|-----------|---------------------------|
| 1 | `infos` | Informations générales | `InfosGenerales.jsx` | `nomCommercial*`, `hashmaker`, `laboratoire`, `cultivarsUtilises`, `parentFlowerReviewId` (lien produit lié, via `ParentFlowerSelector`), photos (1-4)* |
| 2 | `separation` | Pipeline Séparation | `SeparationPipelineAdapter` → `SeparationPipelineSection` → `SeparationPipelineDragDrop` (legacy actif) | `separationTimelineConfig`/`separationTimelineData`, `methodeSeparation`, `nombrePasses`, `temperatureEau` |
| 3 | `analytics` | Données Analytiques | `AnalyticsSection` | `thcPercent`, `cbdPercent`, `cbgPercent`, `cbcPercent`, `terpeneProfile`, `labReportUrl`, `terpeneFileUrl`, `certificateFile`/`terpeneFile` (upload) — ✅ fonctionne |
| 4 | `visual` | Visuel & Technique | `VisualSection` | `couleurTransparence`, `pureteVisuelle`, `densiteVisuelle`, `pistils`, `moisissure`, `graines` |
| 5 | `odeurs` | Odeurs | `OdorSection` | `fideliteCultivars`, `intensiteAromatique`, `notesDominantes[]`, `notesSecondaires[]` |
| 6 | `texture` | Texture | `TextureSection` | `durete`, `densiteTactile`, `friabiliteViscositeMelting`, `meltingResidus` |
| 7 | `gouts` | Goûts | `TasteSection` | `intensite`, `agressivitePiquant`, `dryPuff[]`, `inhalation[]`, `expiration[]` |
| 8 | `effets` | Effets + Expérience | `EffectsSection` | `monteeRapidite`, `intensiteEffets`, `effetsChoisis[]`, `methodeConsommation`, `dosageUtilise`, `dureeEffets` |
| 9 | `curing` | Curing & Maturation | `CuringMaturationAdapter` → `PipelineDragDropView` | `curingTimelineConfig`/`curingTimelineData` (stockage exact à confirmer — pas localisé sur `HashReview` lors de l'audit, possiblement non persisté ou porté par `Review`) |

## Upload analytics (certificat/profil terpénique) — ✅ fonctionne

Contrairement à Flower et Edible, ce type a été corrigé : multer accepte `certificateFile`/`terpeneFile`, et le code mappe correctement vers `labReportUrl`/`terpeneFileUrl` (colonnes existantes au schéma, l.834).

## Produit lié (parent Flower)

Sélecteur `ParentFlowerSelector.jsx` (dans `InfosGenerales.jsx`) charge les reviews Fleurs de l'utilisateur via `GET /api/reviews/my`, filtre `productType === 'flower'`, et lie via `HashReview.parentFlowerReviewId` → `Review` (relation `hashFromFlower`).

## Fichiers référence

- Frontend : `client/src/pages/review/CreateHashReview/`
- Backend : `server-new/routes/hash-reviews.js`
- Schéma : `server-new/prisma/schema.prisma:781-889` (modèle `HashReview`)
- Pipeline : voir [PIPELINE_SYSTEME/sys.md](../PIPELINE_SYSTEME/sys.md)
