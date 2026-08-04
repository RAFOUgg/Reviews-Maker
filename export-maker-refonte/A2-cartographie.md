# A2 — Cartographie du code Export Maker

> Chemins vérifiés par recherche directe dans le repo (Glob/Grep), pas recopiés de mémoire sans contrôle.

## Flux de données (amont → rendu)

```
Formulaires (CreateFlowerReview/…, pipelines) + Prisma (Review + 4 tables détail)
        │
        ▼
fieldRegistry.js  (source de vérité des champs, ~100 entrées curées + getOverflowFields())
        │
        ▼
exportDataAdapter.js  (dérive les clés canoniques consommées par les templates — SEUL vrai
                        point de branchement pour ExportModal.jsx / PublicRenderPage.jsx)
        │
        ├──► exportMakerHelpers.js  (extractPipelines, extractCategoryRatings, extractExtraData,
        │                            getResponsiveAdjustments, getGlassTokens, filterVisiblePipelines,
        │                            shouldAutoLockPagination, SEMANTIC_SCORE_COLORS/getScoreBand,
        │                            RATIO_DIMENSIONS/calculateDimensions)
        │
        ▼
TemplateRenderer.jsx  (choisit le composant template selon config.templateId)
        │
        ▼
5 templates (client/src/components/templates/*.jsx)
        │
        ▼
3 surfaces de rendu :
  1. ExportMakerPanel.jsx / PagedPreviewPane.jsx  → aperçu LIVE Studio (édition)
  2. ExportModal.jsx                               → export réel (bouton Exporter sur une review)
  3. PublicRenderPage.jsx (/r/:id)                 → page publique (défile, allowOverflow=true)
```

**Piège historique documenté (6 occurrences distinctes)** : toute nouvelle clé de champ/pipeline doit être vérifiée contre `extractPipelines()`/`DEFAULT_CONFIG.contentModules`/`fieldRegistry.js` — jamais devinée. Ce fil rouge doit être respecté par toute Phase D à venir (nouveaux composants = nouvelles clés de lecture de données).

## Où vit quoi

| Domaine | Fichier(s) |
|---|---|
| **State management (config Studio)** | `client/src/store/exportMakerStore.js` (config active, `setTemplate`, verrou, `resolveExportMakerConfig`) |
| **Constantes de style** | `client/src/store/exportMakerConstants.js` (`COLOR_PALETTES`, `TEMPLATE_MODULE_PRESETS`, `DEFAULT_TEMPLATES`, `TEMPLATE_DEFAULT_IDENTITY`) |
| **Pagination — store pages statiques** | `client/src/store/exportMakerPagesStore.js` (`PAGE_TEMPLATES`, `getDefaultPages`, `normalizePageTemplateType`) |
| **Pagination — adaptative** | `client/src/utils/adaptivePagination.js` (`computeAdaptivePages`, `MODULE_META`, `ALWAYS_ISOLATE`) + `client/src/hooks/useAdaptivePages.js` (`ADAPTIVE_TEMPLATES`, cache de mesure) + `client/src/components/templates/measureDetailedCardModules.jsx` (mesure hors-écran, `TEMPLATE_COMPONENTS` registry) |
| **Helpers de rendu partagés** | `client/src/utils/exportMakerHelpers.js` (le fichier le plus central — extraction data, responsive, glass tokens, scoring) |
| **Adaptateur de données** | `client/src/utils/exportDataAdapter.js` |
| **Registre de champs** | `client/src/utils/fieldRegistry.js` |
| **UI de config (panneau gauche)** | `client/src/components/shared/config/ConfigPane.jsx` + sous-panneaux (`TemplateSelector`, `TypographyControls`, `ColorPaletteControls`, `ContentModuleControls`, `ImageBrandingControls`, `PresetManager`, `PageManager.jsx`) |
| **Panneau Studio (conteneur)** | `client/src/components/shared/export-maker/ExportMakerPanel.jsx` |
| **Aperçu paginé Studio** | `client/src/components/shared/export-maker/PagedPreviewPane.jsx` |
| **Menu contextuel sections** | `client/src/components/shared/export-maker/ExportMakerContextMenu.jsx` |
| **Mode Custom (mise en page libre)** | `ContentPanel.jsx`, `CustomTemplate.jsx`, `CustomLayoutPane.jsx` (branché sur `fieldRegistry.js` depuis le correctif #11) |
| **Templates de rendu (5)** | `client/src/components/templates/{DetailedCardTemplate,ModernCompactTemplate,BlogArticleTemplate,SocialStoryTemplate,TraceabilityReportTemplate}.jsx` |
| **Composants de section partagés** | `client/src/components/templates/sections/{TemplateSection,SensoryRadar}.jsx`, `client/src/components/templates/CultureStatsChart.jsx` |
| **Canevas interactifs (généalogie/chaîne)** | `client/src/components/export/interactive/{ReadOnlyGenealogyCanvas,ReadOnlyProductionChainCanvas,PipelineMiniGrid}.jsx` |
| **Modale d'export réel + pipeline formats** | `client/src/components/export/ExportModal.jsx` (PNG/JPEG/SVG/PDF/HTML), `client/src/utils/{htmlExport,TimelapseExporter,videoExporter}.js` |
| **Rendu d'une review isolée (partagé /r/:id et /r/:id/lineage)** | `client/src/components/export/SingleReviewCard.jsx` |
| **Page publique** | `client/src/pages/public/PublicRenderPage.jsx` (`/r/:id`), `ReviewLineagePage.jsx` (`/r/:id/lineage`) |
| **QA / dashboard de validation** | `client/src/components/export/ExportValidationDashboard.jsx` + `ExportMaker.jsx` (ancien moteur, ~1980L, gardé pour 8 tests + dashboard uniquement — **hors scope de toute refonte**, ne pas y toucher) |
| **Tests existants** | `client/src/components/export/__tests__/*.test.jsx` (smoke, formats, performance, vulnerabilities, infrastructure) + `fieldRegistry.adapter.test.js` (34 tests, référence de non-régression citée dans tout l'historique CLAUDE.md) |
| **Chargement de polices** | `client/index.html` (2 polices Google Fonts seulement) |
| **Backend — persistance config** | `server-new/routes/{flower,hash,concentrate,edible}-reviews.js` (lisent `exportMakerConfig`/`exportMakerPreset` en dur par nom littéral — **tout renommage de clé côté client doit être répercuté ici**), `liftExportMakerFromExtra` (repli legacy `orchardConfig`) |

## Contraintes à respecter pour toute refonte (issues de l'historique)

1. **Ne pas casser `ExportMaker.jsx`/dashboard QA** — chemin mort en prod mais vivant en tests, migration explicitement déferrée par décision utilisateur antérieure.
2. **`fieldRegistry.js` est la seule source de vérité de champs** — tout nouveau composant (ex. `PhaseGroup`, `DataRow`) doit lire depuis cet adaptateur, jamais deviner un nom de champ (6 occurrences du bug contraire déjà documentées).
3. **3 surfaces de rendu distinctes doivent rester synchronisées** (Studio live / ExportModal / page publique) — un bug corrigé sur une seule surface a été trouvé et corrigé au moins 2 fois dans l'historique (correctif #3, #11c).
4. **`getResponsiveAdjustments`/`RATIO_DIMENSIONS` sont déjà LA source de densité par ratio** — toute Phase C1/D1 (ExportFrame) doit consolider autour de cette fonction existante plutôt que la dupliquer.
5. **Persistance : `exportMakerConfig` traverse le JSON `extraData` en base** — toute nouvelle clé de config doit passer par le même mécanisme (`liftExportMakerFromExtra`) et les 4 routes serveur type-spécifiques.
6. **`templateLocked` / auto-déverrouillage** (correctif #11c) doit être respecté par toute nouvelle action de mutation visuelle ajoutée dans le store.

## Ce qui manque structurellement pour le devflow (gaps à combler en Phase C)

- Pas de `tokens.json`/variables CSS formalisées — les tokens vivent dispersés dans `exportMakerConstants.js` (couleurs) + `exportMakerHelpers.js` (densité/typo) + styles inline par template.
- Pas de bibliothèque de composants atomiques (`MetricChip`, `DataRow`, `SectionHeader`, `PhaseGroup`) — chaque template réimplémente ses propres variantes.
- Pas d'`ExportFrame` unique — la logique de densité est correcte mais dispersée (`getResponsiveAdjustments` + logique locale par template pour le mode papier A4 sur `detailedCard` uniquement).
- Le export HTML/PDF est un **snapshot figé rastérisé**, pas un document interactif ou structuré — le devflow §D5/D6 (accordéons, PDF paginé avec en-têtes/pieds) suppose une capacité qui n'existe pas encore dans le pipeline actuel (`html-to-image` + `jsPDF addImage`).
