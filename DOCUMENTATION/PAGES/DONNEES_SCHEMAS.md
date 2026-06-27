# Schémas de Données — État réel (vérifié 2026-06-19)

> ⚠️ Document entièrement réécrit. L'ancienne version décrivait un schéma générique (`Review` + `ReviewGeneralInfo` + `ReviewSection` + `Pipeline`/`PipelineStage`, requêtes GraphQL) qui **n'existe pas** dans le code réel. Le vrai schéma est dans `server-new/prisma/schema.prisma` (~1590 lignes) : un modèle `Review` commun + un modèle complet dédié par type de produit, chacun avec ses propres colonnes (pas de table de sections génériques).

## Modèle `User` (l.14-116)

Champs clés réels :
- `id`, `email` (unique), `username` (unique), `passwordHash`
- `roles` (String JSON, défaut `{"roles":["consumer"]}`) — **champ qui détermine le tier réel**
- `accountType` (String, défaut `"consumer"`) — legacy, maintenu en parallèle de `roles`
- `kycStatus` (`none`/`pending`/`verified`/`rejected`), `kycDocuments` (String JSON), `kycVerifiedAt`, `kycRejectionReason`
- `totpSecret`, `totpEnabled` (2FA — infra présente, voir [PROFILS/INDEX.md](./PROFILS/INDEX.md))
- `isBanned` (+ raison, via panneau admin)
- Relations OAuth (Discord/Google IDs, etc.)
- Pas de modèle `UserProfile` séparé — les infos perso vivent directement sur `User` (à confirmer champ par champ si besoin précis)

## Modèle `Subscription` (l.378-406)

- `plan` : `free`/`influencer_basic`/`influencer_pro`/`producer`/`merchant`
- `status` : `active`/`canceled`/`past_due`/`trialing`
- `stripeCustomerId`/`stripeSubscriptionId` — colonnes présentes mais **non utilisées réellement** (Stripe non intégré, voir [PROFILS/INDEX.md](./PROFILS/INDEX.md))

## Modèle `Review` (commun, parent)

Métadonnées partagées entre tous les types de produit. Relations vers les sous-types et vers les reviews dérivées :
- `derivedHashReviews: HashReview[]` (relation `hashFromFlower`, l.280)
- `derivedConcentrateReviews: ConcentrateReview[]` (relation `concentrateFromFlower`, l.281)

## Modèles par type de produit (un modèle complet par type, pas de table "sections" générique)

| Modèle | Lignes schema.prisma | Champs notables |
|---|---|---|
| `FlowerReview` | 631-778 | `nomCommercial`, `breeder`, `variety`, `geneticType`, `indicaPercent`/`sativaPercent`, `parentage` (JSON), `phenotypeCode`, `geneticTreeId` (FK `GeneticTree`), `cultureTimelineConfig`/`cultureTimelineData`, `curingTimelineConfig`/`curingTimelineData`, `thcPercent`/`cbdPercent`/`cbgPercent`/`cbcPercent`, `labReportUrl` (⚠️ pas de `terpeneFileUrl`) |
| `HashReview` | 781-889 | `nomCommercial`, `hashmaker`, `laboratoire`, `cultivarsUtilises`, `parentFlowerReviewId` (FK `Review`), `separationTimelineConfig`/`separationTimelineData`, `labReportUrl`, `terpeneFileUrl` (l.834) |
| `ConcentrateReview` | 892-994 | `nomCommercial`, `type` (16 valeurs), `hashmaker`, `laboratoire`, `parentFlowerReviewId`, `extractionTimelineConfig`/`extractionTimelineData`, `curingPipelineGithubIdConcentrate` (l.981), `labReportUrl`, `terpeneFileUrl` (l.938) |
| `EdibleReview` | 997-1039 | `nomProduit`, `typeComestible`, `fabricant`, `ingredients` (JSON), `etapesPreparation` (JSON), `recipePipelineGithubId` (l.1011) — **pas de `labReportUrl`/`terpeneFileUrl`** (pas de section analytics, voir doc Comestibles) |

## Génétiques / PhenoHunt

| Modèle | Lignes | Champs notables |
|---|---|---|
| `GeneticTree` | 1386-1410 | `userId`, `name`, `projectType` (`phenohunt`/`selection`/`crossing`/`hunt`), `isPublic`, `shareCode` (unique), relations `nodes`/`edges`/`flowerReviews` |
| `GenNode` | 1413-1443 | `treeId`, `cultivarId?`, `cultivarName`, `position` (JSON `{x,y}` pour React Flow), `color`, `image?`, `genetics` (JSON), `notes?` |
| `GenEdge` | 1446-1470 | `treeId`, `parentNodeId`, `childNodeId`, `relationshipType` (`parent`/`pollen_donor`/`sibling`/`clone`/`mutation`), contrainte unique `[parentNodeId, childNodeId, relationshipType]` |
| `Cultivar` | 528-560 | `userId`, `name`, `breeder?`, `type?`, `indicaRatio?` (0-100), `parentage?` (JSON), `phenotype?`, `useCount`, contrainte unique `[userId, name]` |

## Bibliothèque / Export

| Modèle | Champs notables |
|---|---|
| `ExportTemplate` | `templateType`, `exportConfig` (JSON), `appearance` (JSON), `isDefault`, `usageCount` |
| `TemplateShare` | code de partage unique pour templates |
| `Watermark` | `type` (texte/image/logo), `position`, `opacity`, `scale`, `isDefault` |
| `SavedData` | `dataType`, `category`, `data` (JSON) — substrats/engrais/matériel/techniques (Producer only) |
| `UserPreset` | l.1364-1381 — `type` (`field`/`grouped`/`pipeline`), `pipelineType`, `data` (JSON), `useCount` — voir [CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md](./CREATE_REVIEWS/PIPELINE_SYSTEME/sys.md) |
| `UserStats` | `totalReviews`, `publicReviews`, compteurs par type produit, compteurs par format d'export, `totalLikes`/`totalViews`/`totalShares`/`totalComments` |

## Galerie publique

Pas de modèles `Like`/`Comment` génériques confirmés sous ces noms exacts dans cette passe d'audit — la galerie (`server-new/routes/gallery.js`) gère likes/commentaires/vues sur les reviews publiques (voir [Home/INDEX.md](./Home/INDEX.md)). À vérifier précisément les noms de modèles Prisma associés si du code doit s'y brancher.

## Fichiers Statiques JSON

`data/aromas.json`, `data/effects.json`, `data/tastes.json`, `data/terpenes.json` — non ré-audités dans cette passe, structure présumée stable.

## Fichiers référence

- Schéma Prisma complet : `server-new/prisma/schema.prisma` (~1590 lignes)
- Migrations : `server-new/prisma/migrations/`
