# Reviews-Maker (Terpologie) — CLAUDE.md

Référence de session pour toute future instance de Claude Code travaillant sur ce repo. Ce fichier documente la vision, la direction artistique, l'architecture et l'état réel des fonctionnalités — la mémoire persistante (`~/.claude/projects/.../memory/MEMORY.md`) documente l'historique détaillé des chantiers ; ce fichier documente l'état stable et le "pourquoi" produit.

## Vision produit

Reviews-Maker / **Terpologie** est une app de reviews cannabis **centrée sur la traçabilité**, pas un simple carnet de dégustation. Ce qui la différencie :

- **Chaîne complète de traçabilité** : Fleur → Hash → Concentré → Comestible, avec lignage entre reviews (`sourceLineage`), généalogie génétique (PhenoHunt / arbres de croisement), et chaîne de production (pipelines culture/extraction/séparation/purification/curing avec bilan matière calculé).
- **Comptes Pro vérifiés** : Producteur/Influenceur avec vérification SIRET réelle (API `recherche-entreprises.api.gouv.fr`), entreprises multi-utilisateurs (`ProducerProfile` + `CompanyMember`), ressources partagées d'entreprise (reviews, presets, arbres génétiques, chaînes de production).
- **La traçabilité produit se rend sous forme d'Export Maker** : Export Maker (Orchard Studio / `ExportModal`, page publique `/r/:id`) n'est pas juste un outil d'export, c'est **le produit fini que voit l'utilisateur final** — la fiche technique vivante qui matérialise toute la donnée de traçabilité saisie (formulaires, pipelines, génétique). C'est pourquoi sa capacité à absorber l'évolution des données prime sur tout le reste.
- **Exigence structurante : les données sont mouvantes.** Les formulaires (contenu des pipelines, questionnaires de review) changeront dans le temps. Export Maker doit pouvoir encaisser cette évolution **facilement et automatiquement, sans perdre ses fonctionnalités ni son paramétrage existant** — la conceptualisation d'une review se fait par les questions posées dans les formulaires et par les données demandées dans les systèmes principaux (pipelines/canevas), donc ce sont ces points de saisie qui doivent piloter Export Maker, pas l'inverse. Voir [Roadmap](#état-des-fonctionnalités-mères--roadmap-priorisée) — c'est aujourd'hui la plus grande fragilité architecturale de l'app.

## Direction artistique (DA)

Système **glassmorphism sombre "Apple-like"**, nom de code **LiquidUI** :

- Blur ~24px, fonds translucides blanc/noir à faible opacité (`rgba(255,255,255,0.02–0.1)`), bordures fines translucides, grands rayons de bordure (`rounded-xl`/`rounded-2xl`).
- Glow violet primaire (`#8B5CF6` / `rgba(139,92,246,*)`), cyan/vert/ambre/rose en glows secondaires.
- Micro-interactions Framer Motion : shimmer suivant le curseur sur cards/boutons, easing "Apple" (`cubic-bezier(0.25,0.46,0.45,0.94)`).
- **Sources de vérité** :
  - `client/src/components/ui/LiquidUI.jsx` — barrel des composants (`LiquidCard`, `LiquidButton`, `LiquidInput`, `LiquidSelect`, `LiquidModal`, `LiquidTabs`, `LiquidRating`, `LiquidChip`, `LiquidToggle`, `LiquidBadge`, `LiquidTooltip`, `LiquidSkeleton`, `LiquidAvatar`, `LiquidDivider`), plus composants autonomes au même standard (`LiquidAlert.jsx`, `LiquidCheckbox.jsx`, `LiquidMultiSelect.jsx`, `LiquidRadio.jsx`, `LiquidSlider.jsx`, `LiquidGlass.jsx`).
  - `client/src/assets/apple-liquid-glass.css` — feuille canonique (classes réellement consommées par `LiquidUI.jsx`).
  - `client/src/assets/theme-tokens.css` — tokens sémantiques (`--app-bg`, `--panel-bg/border`, `--card-bg/border`, `--text-primary/muted`), variantes clair/sombre.
  - `client/tailwind.config.js` — palettes `primary`/`accent`/`cyan`, `boxShadow.glass/glow`, easing personnalisé.
  - Page de démo/référence visuelle : `client/src/pages/demo/LiquidPreview.jsx`.
- **Couverture actuelle : ~87%** de l'app. `ConfigPane.jsx` + ses 7 sous-panneaux (Export Maker : `TemplateSelector`, `TypographyControls`, `ColorPaletteControls`, `ContentModuleControls`, `ImageBrandingControls`, `PresetManager`, `PageManager`) convertis en LiquidUI le 2026-07-27. Zones encore en Tailwind brut (roadmap DA, voir plus bas) : `AdminPanel.jsx`, `FieldRenderer.jsx` (+ doublon `FieldRendererClean.jsx` à trancher), tout `client/src/components/pipelines/legacy/`, `PipelineDragDropView.jsx`, et les sous-modales Export Maker plus profondes (`PresetGroupsManager.jsx`, `PresetConfigModal.jsx`, `PresetSelector.jsx`, `ContentPanel.jsx`, `CustomLayoutPane.jsx`, `CustomTemplate.jsx`, `ModuleBuilder.jsx` — non converties, hors scope du passage 2026-07-27 qui couvrait les 7 onglets principaux).
- Toute nouvelle UI doit utiliser les composants `Liquid*` existants — ne pas réinventer un style Tailwind brut à côté.

## Architecture

### Frontend (`client/`)
- Stack : React + Vite. Scripts : `npm run dev` (Vite), `build`, `preview`, `lint` (ESLint, `--max-warnings 0`), `test` (Vitest), `test:coverage`.
- `client/src/pages/review/CreateFlowerReview/` — formulaire complet de review, **référence** pour tout nouveau type.
- `client/src/pages/review/CreateHashReview/`, `CreateConcentrateReview/`, `CreateEdibleReview/` — mêmes patterns, InfosGenerales déjà en LiquidUI.
- `client/src/components/sections/` — sections de formulaire partagées entre types de review.
- `client/src/components/export/ExportModal.jsx` — **seul** chemin d'export réellement branché en prod (`ReviewDetailPage.jsx`, et page publique `client/src/pages/public/PublicRenderPage.jsx` sur `/r/:id`). `ExportMaker.jsx` (l'ancien moteur, ~1980 lignes) n'est plus utilisé qu'en QA (`ExportValidationDashboard.jsx`) et par ses 8 tests — gardé intentionnellement, ne pas le supprimer sans migrer tests + dashboard.
- `client/src/utils/fieldRegistry.js` — **source de vérité unique** des champs affichables par type de produit (~100 entrées curées : `key`, `label`, `group`, `type`, `sources[]`, `unit?`, `ref?`), **plus `getOverflowFields(reviewData)`** (livré 2026-07-27) : détecte à l'exécution les clés de `reviewData` non couvertes par une entrée curée et les expose génériquement (groupe "Données supplémentaires") — un nouveau champ de formulaire/pipeline ne disparaît donc plus jamais silencieusement d'Export Maker, même sans entrée manuelle. `exportDataAdapter.js` dérive les clés canoniques ; `ContentModuleControls.jsx` et `RegistrySections.jsx`/`GisementSections` en dérivent leur UI/affichage (curé + overflow fusionnés).
- `client/src/store/orchardStore.js` — `resolveOrchardConfig()`/`resolveContentModules()` (livré 2026-07-27) : répare un `orchardConfig` sauvegardé sur une review **avant** l'ajout de nouvelles clés à `DEFAULT_CONFIG.contentModules` — sans ça, une review déjà configurée dans Orchard Studio affichait un export presque vide (sections "opt-in" silencieusement absentes). Utilisé par `ExportModal.jsx` et `PublicRenderPage.jsx`, qui contournaient auparavant ce garde-fou (déjà présent, lui, dans le `merge()` du `persist` Zustand local).
- `client/src/components/forms/helpers/ResponsiveCreateReviewLayout.jsx` — layout formulaire avec carousel.
- `client/src/components/wizard/` — mode automatique mobile (wizard déclaratif par type de produit).
- `client/src/components/graph-canvas/GraphCanvasShell.jsx` — canevas React Flow partagé par PhenoHunt et Chaîne de production (virtualisation, LOD zoom, tuning tactile).
- `client/src/components/pipelines/views/PipelineDragDropView.jsx` — vue pipeline principale (culture/curing/extraction/séparation/purification), 3400+ lignes.

### Backend (`server-new/`) — **pas `server/`, qui n'existe plus/est legacy**
- Stack : Express + Prisma + SQLite (`server-new/prisma/schema.prisma`). Scripts : `npm run dev` (`node --watch server.js`), `start`, `prisma:generate`, `prisma:migrate`, `prisma:deploy`, `prisma:studio`, `check-env`.
- `server-new/routes/flower-reviews.js` — **référence** de validation enrichie pour les autres types.
- `server-new/routes/genetics.js` — PhenoHunt (arbres, nœuds, arêtes) : FK et détection de cycles validées côté serveur.
- `server-new/routes/production-chains.js` — Chaîne de production (nœuds/arêtes/annotations liés à des reviews via `reviewType`+`reviewId`, résolus par `utils/reviewTypeMap.js`).
- `server-new/services/paypal.js` + `server-new/routes/payment.js` — paiement Comptes Pro (voir roadmap : clés absentes de `.env.example`).
- `server-new/services/access.js` — source de vérité des droits d'accès (accountType + statut d'abonnement).
- `server-new/middleware/` — `requireAuth` (vérifie le ban), `validateGenetics.js`, etc.

### Modèle de données clé (`schema.prisma`)
- Un seul modèle `Review` de base + 4 tables détail 1-to-1 (`FlowerReview`, `HashReview`, `ConcentrateReview`, `EdibleReview`), chacune `reviewId String @unique` → `Review.id`.
- Lignage : `sourceLineage` (JSON) sur Hash/Concentrate/Edible référence les reviews amont ; `parentFlowerReviewId` est déprécié au profit de `sourceLineage`. Lignage **mono-auteur uniquement** (pas de rapprochement cross-auteur du même lot physique — décision de scope volontaire).
- `ProducerProfile` = entité entreprise (SIRET, vérification), `CompanyMember` lie des utilisateurs à une entreprise avec rôle.
- Convention d'identifiants partageables : `shareCode String? @unique` déjà utilisé sur `GeneticTree`, `ProductionChain`, `TemplateShare` — à réutiliser pour tout futur mécanisme de code partageable (ex. futur code de lot).

## État des fonctionnalités mères / Roadmap priorisée

Audit mené le 2026-07-26 sur le code réel (pas seulement la mémoire). Quatre chantiers identifiés, dans l'ordre où ils devraient être repris :

### 1. Comptes Pro / Paiement — priorité 1, effort faible, bloquant business
Le code serveur (`services/paypal.js`, `routes/payment.js`) est complet et solide (OAuth, vérif webhook, sync abonnement). Mais **`server-new/.env.example` ne documente aucune variable `PAYPAL_*`** — il documente à la place un bloc Stripe entier jamais utilisé par le code. Variables réellement nécessaires : `PAYPAL_ENV`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_PLAN_ID_INFLUENCER`, `PAYPAL_PLAN_ID_PRODUCER`. Tant qu'elles ne sont pas posées en prod, `isPaypalConfigured()` renvoie `false` et personne ne peut payer un abonnement réel (l'UX gère déjà proprement ce cas avec un bandeau d'indisponibilité — ce n'est pas un bug silencieux, juste un blocage business). En prime, `client/src/pages/account/tabs/StubTabs.jsx` (`PaymentTab`/`InvoicesTab`/`BankTab`) est du code mort jamais importé — facturation/IBAN n'existent nulle part, même en UI.
**Prochaine étape** : documenter les vars PayPal dans `.env.example`, obtenir/poser les vraies clés en prod, décider si `StubTabs.jsx` doit être supprimé ou implémenté.

### 2. Mode mobile (pipelines tactiles) — priorité 2, effort faible
PhenoHunt/Chaîne de production (`GraphCanvasShell.jsx`) sont déjà bien traités côté tactile (pinch-zoom, pan, rayon de connexion élargi). Le seul gap réel est localisé dans `PipelineDragDropView.jsx` : le pattern tactile (long-press 500ms + vibration) déjà appliqué aux items de sidebar et aux cellules de grille **n'est pas appliqué aux chips de "preset groupé"**, qui restent en `draggable` HTML5 pur (donc inopérantes au toucher).
**Prochaine étape** : étendre le pattern `onTouchStart/onTouchEnd/onTouchMove` déjà existant au bloc des chips de preset groupé.

### 3. Export Maker — évolutivité automatique + finition — **livré 2026-07-27**, un point mineur restant
Reformulation actée avec l'utilisateur (2026-07-27) : la traçabilité produit **est** Export Maker — c'est la fiche technique rendue qui matérialise toute la donnée saisie. Chantier complet livré et vérifié (build + tests) le jour même :
- **Cause racine de "review pleine, export presque vide" corrigée** : `resolveOrchardConfig()`/`resolveContentModules()` (`orchardStore.js`) réparent un `orchardConfig` sauvegardé sur une review avant l'ajout de nouvelles clés à `DEFAULT_CONFIG.contentModules` — utilisé par `ExportModal.jsx` et `PublicRenderPage.jsx`. `TEMPLATE_MODULE_PRESETS` (`orchardConstants.js`) réaligné sur le vocabulaire canonique de `fieldRegistry.js` (utilisait des clés pointées mortes type `visual.colorRating`).
- **Évolutivité automatique** : `getOverflowFields()` (`fieldRegistry.js`) — un champ de formulaire/pipeline sans entrée curée n'est plus jamais invisible, il apparaît génériquement (groupe "Données supplémentaires", `ContentModuleControls`/`GisementSections`).
- **Pagination réelle** : `ExportModal.jsx` monte désormais toutes les pages configurées hors-écran (`TemplateRenderer` + classe `.orchard-export-page`, prop `className` ajoutée) au lieu de ne capturer que la page visible — PNG/JPEG/SVG produisent N fichiers, PDF un vrai document multi-page, HTML un document unique composé (`serializeMultiPageHtml`, `htmlExport.js`).
- **Chaîne de production / généalogie sur tous les templates** : `ProductionChainMiniView`/`GenealogyMiniView` portés dans `ModernCompactTemplate`, `BlogArticleTemplate`, `SocialStoryTemplate` (`TraceabilityReportTemplate` et `DetailedCardTemplate` les avaient déjà).
- **Nouveaux formats** : GIF pleine carte (`exportCanvasesToGIF`, `TimelapseExporter.js`) et vidéo `.webm` (`videoExporter.js`, `MediaRecorder` natif — décision actée : pas de dépendance ffmpeg.wasm) qui cyclent entre les pages configurées (nécessite ≥2 pages).
- **DA** : `ConfigPane.jsx` + ses 7 sous-panneaux convertis en LiquidUI (voir section DA ci-dessus).
- Plan de référence : `C:\Users\Rafi\.claude\plans\glowing-snacking-coral.md` (Phases 0-3) — le chantier 2026-07-27 va au-delà (Phases 4-5 : formats, DA).
**Reste ouvert (mineur, non bloquant)** : la synchronisation schéma Prisma→registre reste manuelle pour les entrées *curées* (labels/groupes soignés) — `getOverflowFields` est un filet de sécurité qui affiche tout automatiquement avec un libellé dérivé de la clé, pas un remplacement de la curation humaine pour un rendu vraiment soigné. Rapprochement cross-auteur du même lot physique : toujours absent, décision de scope volontaire.

### 4. DA — finition des ~13% restants — effort important, en parallèle
Par effort croissant : `AdminPanel.jsx` (déjà 24 réf. Liquid, ~14 contrôles bruts restants, le plus proche d'être fini) → `FieldRenderer.jsx` (à réconcilier d'abord avec le doublon apparent `FieldRendererClean.jsx`) → sous-modales Export Maker plus profondes (`PresetGroupsManager.jsx`, `PresetConfigModal.jsx`, `PresetSelector.jsx`, `ContentPanel.jsx`, `CustomLayoutPane.jsx`, `CustomTemplate.jsx`, `ModuleBuilder.jsx`) → dossier entier `client/src/components/pipelines/legacy/` (~13 fichiers, zéro Liquid) → `PipelineDragDropView.jsx` (le plus gros, 3400+ lignes, à traiter en dernier).

### Déjà sain (vérifié, pas d'action requise)
- FK/cycles PhenoHunt : validés côté serveur (`genetics.js`).
- ExportMaker.jsx vs ExportModal.jsx : plus de chemins concurrents en prod, situation stable (voir Architecture).
- GrowBrain (`growbrain.terpologie.eu`) : confirmé 100% externe à ce repo (simple lien gaté `isProducteur`), pas une fonctionnalité de cette app.
- Réconciliation cross-auteur du même lot : décision de scope volontaire, pas un bug.

## Conventions & pièges connus

- **SQLite + Prisma : `mode: 'insensitive'` plante silencieusement** — ne jamais l'utiliser, comparer en JS à la place.
- **`pkill` n'existe pas dans ce Git Bash** — tout script qui en dépend produira de faux bugs.
- Les fichiers `.md` à la racine du repo (nombreux : `AUDIT_*`, `PLAN_*`, `PHASE_*`, `DEPLOYMENT_*`, etc.) sont des **artefacts historiques**, pas des docs vivantes — ne pas s'y fier pour l'état actuel. La doc vivante est `DOCUMENTATION/` (voir `DOCUMENTATION/INDEX_MASTER.md`), elle-même réécrite en 2026-06-19 pour matcher le code réel après avoir été trouvée fictive/aspirationnelle.
- `EditReviewPage.jsx` est du code mort — les vraies pages d'édition sont `Create{Type}Review`.
- Pas d'OAuth Google en local → toujours tester en prod pour ce flux.
- Un mécanisme d'auto-commit/auto-push vers `origin/main` tourne indépendamment de Claude — des commits inattendus dans `git log` correspondant à des fichiers en cours d'édition ne sont pas une anomalie à corriger.

## Préférences de collaboration

- Communication en français.
- Ne jamais committer sans demande explicite de l'utilisateur.
- Toujours lire un fichier avant de l'éditer.
- Accès VPS : `ssh vps-lafoncedalle` (clé déjà configurée) ; déploiement via `./deploy.sh "msg"` en local (build+commit+push+SSH deploy) ou `bash deploy.sh --vps` directement sur le VPS.
