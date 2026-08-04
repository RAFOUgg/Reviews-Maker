# A1 — Inventaire produit Export Maker

> Vérifié directement dans le code le 2026-08-03 (package.json, constantes, stores, pipeline d'export). Pas de supposition — chaque item ci-dessous est sourcé.

## 1. Templates (5)

Définis dans `client/src/store/exportMakerConstants.js` (`DEFAULT_TEMPLATES`) :

| id | Nom | Ratio par défaut | Ratios supportés | Pagination |
|---|---|---|---|---|
| `modernCompact` | Moderne Compact | 1:1 | 1:1, 16:9, 9:16, 4:3, A4 | **Adaptative** (mesure réelle) |
| `detailedCard` | Fiche Technique Détaillée | 16:9 | 1:1, 16:9, 9:16, 4:3, A4 | **Adaptative** (pilote, livré 2026-07-31) |
| `blogArticle` | Article de Blog | A4 | 1:1, 16:9, 9:16, 4:3, A4 | **Adaptative** |
| `socialStory` | Story Social Media | 9:16 | 1:1, 16:9, 9:16, 4:3, A4 | **Adaptative** |
| `traceabilityReport` | Rapport de Traçabilité | A4 | **A4 seul** | Non paginé (document continu qui défile) |

`detailedCard` est le seul à avoir reçu la refonte DA "Terpologie COA v2" (**2026-07-30**, correctif #10 — la date « 2026-08-03 » de la version initiale de ce document était fausse ; le 08-03 correspond au correctif #12, pagination adaptative) : palette dédiée "Résine" (charcoal-vert + ambre `#C9922E`), polices Space Grotesk (titres) + JetBrains Mono (données), radar SVG 6 axes, bandes sémantiques de score fixes. Les 4 autres templates restent sur le langage visuel "glassmorphism violet" antérieur (correctif #7/#8, `TemplateSection.jsx` + `getGlassTokens`).

Fichiers : `client/src/components/templates/{DetailedCardTemplate,ModernCompactTemplate,BlogArticleTemplate,SocialStoryTemplate,TraceabilityReportTemplate}.jsx`.

## 2. Formats / ratios (5)

`RATIO_DIMENSIONS` (`client/src/utils/exportMakerHelpers.js:853`) — dimensions canvas réelles en px :

| Ratio | Dimensions | Usage |
|---|---|---|
| 1:1 | 800×800 | Carré / réseaux sociaux |
| 16:9 | 1920×1080 | Paysage |
| 9:16 | 1080×1920 | Portrait / Story |
| 4:3 | 1600×1200 | Standard |
| A4 | 1754×2480 | Document (mode "papier" sur `detailedCard`) |

Densité/typo pilotées par `getResponsiveAdjustments(ratio, baseTypography)` — **1 seule fonction partagée**, mais un bug A4/portrait y a été trouvé et corrigé le 2026-07-29 (ordre des ternaires) : signal que la logique de densité par ratio est fragile (branches en cascade, pas un vrai système de tokens formalisé). C'est la fonction la plus proche d'un "ExportFrame" au sens du devflow, mais elle ne fait QUE la typo/densité — pas la mise en page.

## 3. Composants de rendu (inventaire réel)

- **Partagés multi-templates** : `TemplateSection.jsx` (carte "verre" — flou, utilisée par `detailedCard`-ancien-style et `traceabilityReport`, **pas** par le nouveau COA v2 qui la rejette explicitement), `SensoryRadar.jsx` (radar SVG générique à N axes, `components/templates/sections/`), `CultureStatsChart.jsx` (Recharts, dimensions px fixes — pas de `ResponsiveContainer`).
- **Canevas interactifs en lecture seule** : `ReadOnlyGenealogyCanvas.jsx` / `ReadOnlyProductionChainCanvas.jsx` (`components/export/interactive/`) — React Flow réel, état 100% local, pas les stores globaux (évite les collisions multi-canevas).
- **Mesure de pagination** : `measureDetailedCardModules.jsx` — généralisé (registry `TEMPLATE_COMPONENTS`) aux 4 templates adaptatifs, rend hors-écran et lit `getBoundingClientRect()` sur des attributs `data-module`.
- **CORRIGÉ le 2026-08-04 (cf. B4 > R1)** — la version initiale de cet inventaire affirmait *« pas de bibliothèque de composants atomiques formalisée »*. **C'est faux** : `client/src/components/templates/sections/` contient 6 composants partagés, créés les 2026-08-02/03 (commits `dd553971`, `ebcbc618`), tous consommés par les templates :

| Fichier | Rôle | Consommé par |
|---|---|---|
| `ScoreMetric.jsx` | Barre de score /10 + bande sémantique — *« seule source pour toute note affichée dans les 5 templates »* | 5 templates |
| `PipelineStepFields.jsx` | Grille label/valeur des champs d'une étape + `PIPELINE_FIELD_ICONS` | DetailedCard, ModernCompact, BlogArticle |
| `RegistrySections.jsx` | Sections dérivées de `fieldRegistry` (récolte/labo/extraction/…) | 4 templates |
| `SensoryRadar.jsx` | Radar SVG à N axes | DetailedCard |
| `TemplateSection.jsx` | Carte de section (glassmorphism, territoire écarté) | TraceabilityReport |
| `CultureStatsChart.jsx` | Graphe Recharts (dimensions px explicites) | DetailedCard |

Le gap réel n'est donc **pas** l'absence d'atomes, mais : (a) l'absence d'un `ExportFrame` unifiant la densité, (b) l'absence de `ConstantsBanner`/`PhaseGroup` (symptôme central), et surtout (c) **la boucle de rendu des étapes de pipeline réimplémentée à l'identique dans 4 templates** (`DetailedCardTemplate:287-350`, `ModernCompactTemplate:536-569`, `BlogArticleTemplate:485-511`, `TraceabilityReportTemplate:342`), avec `PIPELINE_TYPE_BY_KEY` dupliqué dans 3 fichiers. Voir C2 catégorie 3.

## 4. Pipeline d'export réel (confirmé, pas supposé)

Stack confirmé dans `client/package.json` : **`html-to-image` (1.11.13)** + **`html2canvas` (1.4.1, legacy)** + **`jspdf` (4.2.1)** + **`gif.js` (0.2.0)** + **`MediaRecorder` natif** (vidéo, pas de dépendance ffmpeg.wasm — décision actée). **Pas de Puppeteer, pas de Satori, pas de react-pdf.**

Chemin réel dans `ExportModal.jsx` (`exportPNG`/`exportJPEG`/`exportSVG`/`exportPDF`/`exportHTML`) :
- **PNG/JPEG** : `html-to-image` → `toPng`/`toJpeg` par page, téléchargement séquentiel (1 fichier par page si multi-page).
- **SVG** : `toSvg` → produit un SVG contenant un `<foreignObject>` HTML (pas un vrai SVG vectoriel — donc pas éditable dans un outil vectoriel, juste un conteneur).
- **PDF** : **`toPng` par page (pixelRatio 2) puis `pdf.addImage()`** — c'est une image rastérisée collée par page dans un document jsPDF, **pas un PDF texte structuré**. Aucun en-tête/pied de page répété (le devflow §checklist l'exige explicitement — gap confirmé).
- **HTML** : `serializeMultiPageHtml`/`serializeRenderToHtml` (`htmlExport.js`) — sérialisation DOM statique, pas de JS interactif embarqué (donc pas d'accordéons/tooltips/radar interactif au sens du devflow §D5 — c'est un snapshot figé).
- **GIF/Vidéo** : `TimelapseExporter.js` (`gif.js`) / `videoExporter.js` (`MediaRecorder`), cyclent entre pages configurées.

**Aucun rendu HTML interactif "vivant" n'existe pour l'export lui-même** — l'interactivité (accordéons, radar au survol) n'existe que dans l'aperçu Studio (`ExportMakerPanel.jsx`/`PagedPreviewPane.jsx`), jamais dans un fichier exporté. Le devflow demande un toggle "mode export" qui fige une interactivité qui, aujourd'hui, n'a pas d'équivalent exporté à figer.

## 5. Pagination — état réel (le point le plus mature du produit)

Deux systèmes coexistent :
1. **Pagination adaptative** (`adaptivePagination.js` + `useAdaptivePages.js`) — mesure réelle de hauteur, packing séquentiel, cache de mesure partagé (`measureCache`), modules `ALWAYS_ISOLATE` (masthead, profil cannabinoïde, stats de culture) qui démarrent toujours leur propre page. Couvre les 4 templates non-traceability (`ADAPTIVE_TEMPLATES` dans `useAdaptivePages.js:13`).
2. **`PAGE_TEMPLATES` statique** (`exportMakerPagesStore.js`) — gabarits fixes par type×ratio, encore utilisé pour le Mode Custom (exempté de l'adaptatif par design) et comme filet quand aucune mesure n'est disponible.

C'est le chantier le plus abouti (6+ rounds de correctifs post-déploiement documentés dans CLAUDE.md, dont plusieurs bugs de contenu perdu silencieusement — tous corrigés et vérifiés par export PNG réel). **Le symptôme central du devflow (table de process qui répète les valeurs) n'est PAS un problème de pagination** — c'est un problème de composant/design (aucun `PhaseGroup`/bandeau de constantes n'existe), donc indépendant de ce système déjà solide.

## 6. Polices — gap confirmé

Seules 2 polices sont chargées via Google Fonts (`client/index.html:18`) : **Space Grotesk** + **JetBrains Mono**, ajoutées le 2026-07-30 pour `detailedCard`. `TypographyControls.jsx:5` en propose **11** — les 10 autres retombent silencieusement sur une police système.

**Aggravation trouvée le 2026-08-04 (cf. B4 > R6)** : le problème n'est pas seulement dans les options offertes, il est dans les **défauts**. `TEMPLATE_DEFAULT_IDENTITY` (`exportMakerConstants.js:267`) fait pointer **4 templates sur 5** vers une police non chargée :

| Template | Police par défaut | Chargée ? |
|---|---|---|
| `modernCompact` | Inter | ❌ |
| `detailedCard` | Space Grotesk | ✅ |
| `blogArticle` | Merriweather | ❌ |
| `socialStory` | Poppins | ❌ |
| `traceabilityReport` | Inter | ❌ |

L'utilisateur n'a donc rien à faire de particulier pour tomber sur un repli système : c'est l'état par défaut de 4 templates. Un `Merriweather` (serif) qui retombe sur une sans-serif système change entièrement le caractère du template « Article de Blog ». **Décision requise avant l'étape 1 du stepsheet** : charger Inter/Merriweather/Poppins, ou ramener les défauts sur les polices du territoire retenu.

## 7. Config UI (`ConfigPane.jsx`) — 7 onglets réels

`template`, `content`, `pagination`, `typography`, `colors`, `image`, `presets` (`ConfigPane.jsx:17-23`). Les onglets `content`/`typography`/`colors`/`image` sont "lockable" (`LOCKABLE_TABS`) — liés au verrou de config par template (déverrouillage auto au premier changement, correctif #11).
