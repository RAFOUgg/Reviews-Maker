# Concentrés (Rosin, BHO, etc.) — État réel (vérifié 2026-06-19)

> ⚠️ Document réécrit pour remplacer la version précédente (spec aspirationnelle, modèle `Pipeline`/`PipelineStage` fictif). Voir [PIPELINE_SYSTEME/sys.md](../PIPELINE_SYSTEME/sys.md).

## Vue d'ensemble

- **Page** : `client/src/pages/review/CreateConcentrateReview/index.jsx`
- **Modèle Prisma** : `ConcentrateReview` (`schema.prisma:892-994`)
- **Route backend** : `server-new/routes/concentrate-reviews.js` — `POST /` (l.317-385) et `PUT /:id`
- **Multer** : `upload.fields([{name:'photos', maxCount:4}, {name:'certificateFile', maxCount:1}, {name:'terpeneFile', maxCount:1}])` ✅ correct

## Sections réelles (ordre d'affichage)

| # | id | Titre | Composant | Champs principaux (réels) |
|---|----|-------|-----------|---------------------------|
| 1 | `infos` | Informations générales | `InfosGenerales.jsx` | `nomCommercial*`, `type` (16 valeurs : Rosin, BHO, PHO, CO2 Oil, Live Resin, Live Rosin, Shatter, Wax, Budder, Crumble, Diamonds, Sauce, Distillate, RSO, FECO, Autre), `hashmaker`, `laboratoire`, `cultivarsUtilises`, `parentFlowerReviewId`, photos (1-4)* |
| 2 | `extraction` | Pipeline Extraction | `ExtractionPipelineAdapter` → `ExtractionPipelineDragDrop` (legacy actif) | `extractionTimelineConfig`/`extractionTimelineData`, `methodeExtraction` |
| 3 | `analytics` | Données Analytiques | `AnalyticsSection` | `thcPercent`, `cbdPercent`, `cbgPercent`, `cbcPercent`, `terpeneProfile`, `labReportUrl`, `terpeneFileUrl`, `certificateFile`/`terpeneFile` (upload) — ✅ fonctionne |
| 4 | `visual` | Visuel & Technique | `VisualSection` | `couleurTransparence`, `viscosite`, `pureteVisuelle`, `melting`, `residus`, `pistils`, `moisissure` |
| 5 | `odeurs` | Odeurs | `OdorSection` | `fideliteCultivars`, `intensiteAromatique`, `notesDominantes[]`, `notesSecondaires[]` |
| 6 | `texture` | Texture | `TextureSection` | `durete`, `densiteTactile`, `friabiliteViscositeMelting`, `meltingResidus` |
| 7 | `gouts` | Goûts | `TasteSection` | `intensite`, `agressivitePiquant`, `dryPuff[]`, `inhalation[]`, `expiration[]` |
| 8 | `effets` | Effets + Expérience | `EffectsSection` | `monteeRapidite`, `intensiteEffets`, `effetsChoisis[]`, `methodeConsommation`, `dosageUtilise`, `dureeEffets` |
| 9 | `curing` | Curing & Maturation | `CuringMaturationAdapter` → `PipelineDragDropView` | `curingPipelineGithubIdConcentrate` (référence ID, schema.prisma:981) — modèle de stockage distinct de Flower/Hash, à clarifier si encore actif |

**Note pas de section "Purification" séparée** dans le code réel actuel (contrairement à une ancienne spec) — la purification est traitée comme une partie de la Pipeline Extraction (`methodeExtraction` couvre les méthodes de pressage/solvant ; pas de pipeline distincte trouvée).

## Upload analytics (certificat/profil terpénique) — ✅ fonctionne

Même mapping que Hash : `certificateFile`/`terpeneFile` → `labReportUrl`/`terpeneFileUrl` (colonnes existantes, l.938).

## Produit lié (parent Flower)

Même mécanisme que Hash : `ParentFlowerSelector.jsx` + `ConcentrateReview.parentFlowerReviewId` → `Review` (relation `concentrateFromFlower`).

## Fichiers référence

- Frontend : `client/src/pages/review/CreateConcentrateReview/`
- Backend : `server-new/routes/concentrate-reviews.js`
- Schéma : `server-new/prisma/schema.prisma:892-994` (modèle `ConcentrateReview`)
- Pipeline : voir [PIPELINE_SYSTEME/sys.md](../PIPELINE_SYSTEME/sys.md)
