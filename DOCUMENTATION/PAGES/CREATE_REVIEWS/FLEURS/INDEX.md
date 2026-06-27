# Fleurs (Herbes/Buds) — État réel (vérifié 2026-06-19)

> ⚠️ Ce document remplace `SYNTHESE_ARCHITECTURE.md` et les fichiers `PHASE_1_*`/`SECTION_*` de ce dossier comme référence à jour. Ces fichiers restent en place comme archive historique du développement (sprints/phases passés) mais décrivent une architecture en partie fictive (modèle `Pipeline`/`PipelineStage` générique, scoring 0-10 uniforme) qui ne correspond pas au code réel. Voir aussi [PIPELINE_SYSTEME/sys.md](../PIPELINE_SYSTEME/sys.md) pour le système de pipeline réel.

## Vue d'ensemble

- **Page** : `client/src/pages/review/CreateFlowerReview/index.jsx`
- **Modèle Prisma** : `FlowerReview` (`server-new/prisma/schema.prisma:631-778`), lié à `Review` (commun à tous types) et optionnellement à `GeneticTree` (`geneticTreeId`)
- **Route backend** : `server-new/routes/flower-reviews.js` — `POST /` et `PUT /:id`
- **Multer** : `upload.fields([{name:'images', maxCount:4}, {name:'analyticsPdf', maxCount:1}])` (flower-reviews.js:598-601)

## Sections réelles (ordre d'affichage)

| # | id | Titre | Composant | Champs principaux (réels) |
|---|----|-------|-----------|---------------------------|
| 1 | `infos` | Informations générales | `InfosGenerales.jsx` | `nomCommercial*`, `cultivars`, `genetics{breeder, geneticType}`, photos (1-4)* |
| 2 | `genetics` | Génétiques & PhenoHunt | `Genetiques.jsx` | `breeder`, `variety`, `geneticType`, `indicaPercent`, `phenotypeCode`, `parentage` (JSON), lien `geneticTreeId` |
| 3 | `culture` | Pipeline Culture | `PipelineCulture.jsx` → `UnifiedPipeline(type="culture")` → `PipelineDragDropView` | `cultureTimelineConfig`/`cultureTimelineData` (JSON string) |
| 4 | `recolte` | Récolte & Post-Récolte | `Recolte.jsx` | `trichomesTranslucides/Laiteux/Ambres`, `modeRecolte`, `poidsBrut`, `poidsNet` |
| 5 | `analytics` | Analytiques | `AnalyticsSection` | `thcPercent`, `cbdPercent`, `cbgPercent`, `cbcPercent`, `terpeneProfile`, `labReportUrl`, **`certificateFile`/`terpeneFile`** (upload) |
| 6 | `visual` | Visuel & Technique | `VisuelTechnique.jsx` | `couleurScore`, `densiteVisuelle`, `trichomesScore`, `pistilsScore`, `manucureScore`, `moisissureScore`, `grainesScore` |
| 7 | `odeurs` | Odeurs | `OdorSection` | `notesOdeursDominantes[]`, `notesOdeursSecondaires[]`, `intensiteAromeScore`, `complexiteAromeScore`, `fideliteAromeScore` |
| 8 | `texture` | Texture | `TextureSection` | `dureteScore`, `densiteTactileScore`, `elasticiteScore`, `collantScore`, `malleabiliteScore`, `friabiliteScore`, `viscositeScore`, `meltingScore`, `residuScore` |
| 9 | `gouts` | Goûts | `TasteSection` | `intensiteGoutScore`, `agressiviteScore`, `dryPuffNotes[]`, `inhalationNotes[]`, `expirationNotes[]` |
| 10 | `effects-experience` | Effets & Expérience | `EffectsSectionImpl` | `monteeScore`, `intensiteEffetScore`, `effetsChoisis[]`, `effectDuration` |
| 11 | `curing` | Curing & Maturation | `CuringMaturationSection` → `CuringMaturationAdapter` → `PipelineDragDropView` | `curingTimelineConfig`/`curingTimelineData` (JSON string) |

## 🔴 Bug connu : upload analytics cassé

Le frontend (`AnalyticsSection.jsx`) envoie les fichiers sous les clés `certificateFile` et `terpeneFile`. Multer côté backend (flower-reviews.js:598-601) n'accepte que `images` et `analyticsPdf` → ces deux fichiers ne sont **jamais reçus, donc jamais sauvegardés**, silencieusement (pas d'erreur visible côté utilisateur). De plus, le modèle `FlowerReview` n'a qu'une colonne `labReportUrl`, pas de `terpeneFileUrl` (contrairement à `HashReview`/`ConcentrateReview` qui ont les deux). Pour corriger : étendre `upload.fields()` + ajouter la colonne `terpeneFileUrl` au schéma + migration. Statut détaillé : voir mémoire projet `ARCHITECTURAL_AUDIT_2026-04-01.md`.

## Permissions

Aucun garde de tier n'a été confirmé spécifiquement sur les sections Fleurs au niveau formulaire (à différence du Pipeline Culture/Curing qui dépend du hook `useAccountType`/`useAccountPermissions` — voir [PERMISSIONS.md](../../PERMISSIONS.md) pour l'état réel des permissions, très différent de ce qu'annonçait l'ancienne matrice "Amateur/Producteur/Influenceur").

## Fichiers référence

- Frontend : `client/src/pages/review/CreateFlowerReview/`
- Backend : `server-new/routes/flower-reviews.js`
- Schéma : `server-new/prisma/schema.prisma:631-778` (modèle `FlowerReview`)
- Pipeline : voir [PIPELINE_SYSTEME/sys.md](../PIPELINE_SYSTEME/sys.md)
- Génétiques/PhenoHunt : voir [BIBLIOTHEQUE/Phenohunt/phenohunt_sys.md](../../BIBLIOTHEQUE/Phenohunt/phenohunt_sys.md)
