# Comestibles — État réel (vérifié 2026-06-19)

> ⚠️ Document réécrit pour remplacer la version précédente (spec aspirationnelle). Voir [PIPELINE_SYSTEME/sys.md](../PIPELINE_SYSTEME/sys.md).

## Vue d'ensemble

- **Page** : `client/src/pages/review/CreateEdibleReview/index.jsx`
- **Modèle Prisma** : `EdibleReview` (`schema.prisma:997-1039`)
- **Route backend** : `server-new/routes/edible-reviews.js` — `POST /` (l.202-248) et `PUT /:id` (l.282-348)
- **Multer** : `upload.array('photos', 4)` — **uniquement les photos**, pas de champ fichier pour analytics

## Sections réelles (ordre d'affichage) — seulement 4, pas 9

Edible est le type le plus simple : **pas de section Analytiques, pas de section Visuel/Texture/Odeurs**, contrairement aux 3 autres types.

| # | id | Titre | Composant | Champs principaux (réels) |
|---|----|-------|-----------|---------------------------|
| 1 | `infos` | Informations générales | `InfosGenerales.jsx` | `nomProduit*`, `type` (15 valeurs : Brownie, Cookie, Gâteau, Bonbon/Candy, Chocolat, Gummies, Boisson, Thé/Infusion, Huile culinaire, Beurre cannabique, Sauce, Pâte à tartiner, Sirop, Capsule, Autre), `fabricant`, `cultivars`, photos (1-4)* |
| 2 | `recipe` | Recette & Préparation | `RecipePipelineSection.jsx` → `PipelineGitHubGrid` | `ingredients[]` (type/standard/cannabis), `etapesPreparation[]` (action/duration) |
| 3 | `gouts` | Goûts | `TasteSection` | `intensite`, `agressivitePiquant`, `saveursDominantes[]` |
| 4 | `effets` | Effets + Expérience | `EffectsSection` | `monteeRapidite`, `intensiteEffets`, `effetsChoisis[]`, `dureeEffets` |

## ⚠️ Pas de section Analytiques — par design, pas par bug

`AnalyticsSection` n'est ni importée ni montée dans `CreateEdibleReview/index.jsx`. Le modèle `EdibleReview` n'a aucune colonne `labReportUrl`/`terpeneFileUrl`. Ce n'est donc pas un cas de "fichier perdu silencieusement" comme pour Flower : la fonctionnalité d'upload de certificat de labo **n'a jamais été conçue pour Edible**. Si on veut l'ajouter (cohérence avec les 3 autres types), il faut : monter `AnalyticsSection`, étendre multer (`upload.fields()` au lieu de `upload.array('photos', 4)`), ajouter les colonnes au schéma, et écrire le code de persistance (actuellement inexistant pour ce type).

## Pipeline Recette — système distinct

Contrairement à Culture/Séparation/Extraction (qui passent par `UnifiedPipeline` → `PipelineDragDropView`), la section Recette utilise un composant différent : `PipelineGitHubGrid` directement dans `RecipePipelineSection.jsx`. Persistance : `ingredients`/`etapesPreparation` (JSON) + `recipePipelineGithubId` (référence ID, schema.prisma:1011).

## Fichiers référence

- Frontend : `client/src/pages/review/CreateEdibleReview/`
- Backend : `server-new/routes/edible-reviews.js`
- Schéma : `server-new/prisma/schema.prisma:997-1039` (modèle `EdibleReview`)
- Pipeline : voir [PIPELINE_SYSTEME/sys.md](../PIPELINE_SYSTEME/sys.md)
