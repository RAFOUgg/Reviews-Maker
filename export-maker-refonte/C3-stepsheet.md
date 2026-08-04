# C3 — Stepsheet de refonte (révision 2026-08-04)

> **Version 2**, après la revue critique `B4-revue-critique.md`. La version 1 comportait 15 étapes construites sur 3 prémisses fausses : une bibliothèque d'atomes à créer de zéro (elle existe — R1), une table de densité « identique à l'existant » qui contenait 5 valeurs fausses (R3/R4), et des clés de score inexistantes (R2). Le séquencement change en conséquence.
>
> Décisions figées : **D1** interactivité = aperçu Studio uniquement · **D2** PDF = image rastérisée par page · **D3** territoire « Lab Clinique Sombre » sur les 5 templates.

## Ce qui change par rapport à la v1

| v1 | v2 | Pourquoi |
|---|---|---|
| Créer `MetricChip`, `DataRow`, `SectionHeader`, `Legend` (étape 5) | **Supprimé** | `ScoreMetric`/`RegistrySections`/`PipelineStepFields` couvrent déjà ces rôles (B4 > R1). Les créer = 2ᵉ source de vérité. |
| Symptôme central traité en étape 8, sur `detailedCard` seul | **Étape 3, via un `PipelineTimeline` partagé** | La boucle est dupliquée dans 4 templates (B4 > R7) — la corriger une fois plutôt que quatre, et éviter la classe de régression « corrigé sur une surface, pas les autres ». |
| Aucune étape a11y | **Étape 1** | Le contraste AA n'est pas tenu aujourd'hui, sur les 5 templates (B4 > R5). Correction à 2 tokens, effort minimal, bénéfice immédiat. |
| Étape 1 = « charger IBM Plex Sans » | **Étape 2, portée élargie** | 4 défauts de template sur 5 pointent vers une police non chargée (B4 > R6). |

---

## Séquence

### Bloc 1 — Corrections à effet immédiat — ✅ **IMPLÉMENTÉ (2026-08-04)**

| # | Étape | Fichiers | État |
|---|---|---|---|
| 1 | **Contraste AA des bandes sémantiques** : `SEMANTIC_SCORE_TEXT_COLORS` + `getScoreTextColor(value, paper)` ajoutés. Les couleurs de surface (barres, points, dégradés) sont **inchangées** ; seul le texte bascule sur les variantes AA. Glow `boxShadow` retiré de `ScoreMetric` (B4 > R9). | `exportMakerHelpers.js`, `sections/ScoreMetric.jsx`, `DetailedCardTemplate.jsx` (5 usages en texte) | ✅ **Vérifié par calcul sur les valeurs réellement présentes dans le source** : 6/6 ≥ 4.5:1 (charcoal 4.53/6.73/4.57 · papier 4.55/4.63/4.57). Build + 34 tests verts. |
| 2 | **Polices** — décision utilisateur : *réaligner sur le territoire retenu*. IBM Plex Sans chargée (rôle corps) ; les 5 `TEMPLATE_DEFAULT_IDENTITY` et le défaut du store passent sur Space Grotesk / IBM Plex Sans ; `FONT_FAMILIES` réduite aux 3 polices chargées, avec conservation explicite d'une police héritée non chargée (label « (non chargée) ») pour ne pas écraser le réglage d'une review antérieure. | `client/index.html`, `exportMakerConstants.js`, `exportMakerStore.js`, `TypographyControls.jsx`, `DetailedCardTemplate.jsx`, `SocialStoryTemplate.jsx` | ✅ Build + 34 tests verts. **Reste à vérifier visuellement sur export PNG réel** (cf. ci-dessous). |

> **✅ Vérification visuelle faite (2026-08-04)** — Playwright + serveurs réels + **6 pages PNG réellement téléchargées et inspectées** sur une review de test dédiée (25 étapes de culture à conditions quasi stables + 3 divergences volontaires, supprimée après coup). Elle a trouvé **4 défauts réels que build et tests ne pouvaient pas voir** — voir « Défauts trouvés par la vérification visuelle » ci-dessous. Tous corrigés et re-vérifiés sur un second export réel.

### Bloc 2 — Le symptôme central (cœur du devflow) — ✅ **IMPLÉMENTÉ (2026-08-04)**

| # | Étape | Fichiers | État |
|---|---|---|---|
| 3 | ✅ **`detectPipelineConstants()`** — un champ remonte en constante s'il est identique sur ≥ 80 % des étapes qui le renseignent, avec un minimum de 3 étapes ; les notes/commentaires sont exclus par principe (deux notes identiques sont une coïncidence, pas une condition stable) ; une étape divergente **conserve** son champ, c'est son delta. Lit exclusivement la sortie de `summarizeCellFields` — aucun nom de champ deviné. | `utils/chainCellPipelines.js` | ✅ **7 tests unitaires dédiés**, tous verts (`chainCellPipelines.constants.test.js`) : constante détectée, étape divergente préservée, champ trop variable rejeté, seuil de 3 étapes, note jamais remontée, champ partiellement renseigné, entrées vides. |
| 4-5 | ✅ **`PipelineTimeline` partagé** — en-tête + `ConstantsBanner` + groupement par phase + `PipelineStepFields` (existant, non dupliqué). `PIPELINE_TYPE_BY_KEY` défini **une seule fois**, clés canoniques **et** de repli. Enveloppe « carte de verre » optionnelle (`glass`) pour les templates qui présentent le pipeline en panneau. Groupes de phase dérivés de `step.phase` **uniquement si la donnée existe** — aucune taxonomie inventée. | nouveau `templates/sections/PipelineTimeline.jsx` | ✅ Build vert |
| 6 | ✅ **Bascule des 4 templates** — les 4 boucles locales et les 3 copies de `PIPELINE_TYPE_BY_KEY` supprimées ; imports morts nettoyés. Vérifié par grep : **une seule** définition de `PIPELINE_TYPE_BY_KEY` subsiste dans tout le repo, et plus aucun template ne boucle sur `summarizeCellFields`. | `DetailedCardTemplate.jsx`, `ModernCompactTemplate.jsx`, `BlogArticleTemplate.jsx`, `TraceabilityReportTemplate.jsx` | ✅ Build + 41 tests verts. **Vérification visuelle sur export PNG réel toujours due.** |

> **`PhaseGroup` en accordéon n'a pas été construit comme composant séparé.** Le groupement par phase est intégré à `PipelineTimeline`, mais **sans accordéon** : la décision D1 impose de toute façon un rendu « toujours replié » à la mesure et à l'export, et un accordéon dont la hauteur varie casserait la pagination adaptative. Un accordéon purement décoratif dans l'aperçu Studio n'apportait pas assez pour justifier le risque — à rouvrir seulement si l'usage le réclame.

### Défauts trouvés par la vérification visuelle (2026-08-04)

Aucun n'était détectable par `npm run build` ni par les tests — c'est l'argument de la méthode, redémontré une fois de plus.

| # | Défaut | Cause racine | Statut |
|---|---|---|---|
| V1 | Chaque étape de chaque pipeline affichait une fiche parasite **« CELLLABEL / J1 »** | `META_KEYS` (`chainCellPipelines.js`) n'excluait pas `cellLabel`, la clé que produit pourtant `generateTimelineCells()` juste au-dessus. **Défaut pré-existant** sur les 4 templates : il était noyé dans les valeurs répétées, la suppression de celles-ci l'a mis en pleine lumière. | ✅ `cellLabel` ajoutée aux clés techniques |
| V2 | Pastille d'étape affichant « 1, 2, 3 » au lieu de « J1, J2, J3 » | `stepLabel()` ne considérait pas `cellLabel` — même liste de replis que l'ancien code, donc **pré-existant** aussi. | ✅ `cellLabel` ajoutée aux replis |
| V3 | **Tout l'export en serif** alors qu'Inter était demandée | Deux causes cumulées : (a) les templates posaient `font-family: Inter` **sans pile de repli** → l'échec dégradait vers le serif générique et non vers une sans-serif système ; (b) une `@font-face` n'est téléchargée qu'au premier usage, donc la rasterisation `html-to-image` capturait pendant le chargement. `document.fonts.ready` ne protège pas : il se résout immédiatement tant qu'aucune police n'est en attente. | ✅ `resolveFontStack()` (pile complète, câblée dans les 4 templates) + préchargement explicite des 3 polices au démarrage (`main.jsx`) |
| V4 | Accent **or `#ffd700`** au lieu du violet, malgré la palette réalignée | `DEFAULT_CONFIG.colors` (`exportMakerStore.js`) était une **copie manuelle divergente** : elle s'annonçait `palette: 'modern'` en portant des valeurs sans aucun rapport avec `COLOR_PALETTES.modern`. Réaligner la palette n'avait donc aucun effet sur le rendu par défaut, qui ne la lisait jamais. Encore une seconde source de vérité — le motif de défaillance récurrent de ce module. | ✅ `DEFAULT_CONFIG.colors` dérive désormais de `COLOR_PALETTES.modern` |

**Confirmé sur le second export réel** : bandeau « CONDITIONS CONSTANTES — Température 24 °C · Humidité 68 % · CO₂ 888 ppm · pH 6.2 » affiché **une seule fois** ; groupes GERMINATION (7) / CROISSANCE (10) ; étapes conformes réduites à « conditions nominales » ; **J12 ressortant seul avec son delta 🌡️ 27 °C**, bordure accentuée. Inter et JetBrains Mono effectivement rasterisées, accent violet, fond de l'app.

### Second passage : investigation des points louches (2026-08-04)

| # | Point | Verdict |
|---|---|---|
| V5 | Titre affiché « Brouillon » | **Faux positif — comportement correct.** `validateFlowerReviewData` pose délibérément `nomCommercial = 'Brouillon'` sur un brouillon sans nom (garde-fou documenté contre l'écrasement par autosave). Mon payload de test envoyait `name` au lieu de `nomCommercial`. Confirmé : avec le bon champ, le titre s'affiche correctement. |
| V6 | **Une page entière occupée par un cadre pointillé vide** sur une review sans photo | **Défaut réel, corrigé.** La branche portrait/carré de `ModernCompactTemplate` rendait un placeholder de 120px portant `data-module="mainImage"` ; `mainImage` étant dans `ALWAYS_ISOLATE`, ce rectangle vide décrochait une page complète. La branche paysage du même fichier exigeait déjà `&& mainImage`, et `SocialStoryTemplate` avait eu exactement ce bug le 2026-08-03. **Mesuré : 6 → 5 pages** sur la même review après correction. |
| V7 | `fontPreloader.js` — le module censé garantir les polices avant export | **Défaut réel, corrigé.** Sa liste comptait 8 familles dont **7 sans aucune `@font-face` dans l'app** (Poppins, Montserrat, Roboto, Open Sans, Lato, Playfair Display, Merriweather) — du travail à vide — et **omettait `JetBrains Mono` et `Space Grotesk`**, les deux familles que les templates codent en dur. Le module ne garantissait donc pas la police mono utilisée par tous les chiffres des fiches. Liste réalignée sur les 3 familles réellement chargées. |
| V8 | Budget de pagination à **70 %** de la hauteur de page + 4 modules dans `ALWAYS_ISOLATE` | **Pas touché — délibérément.** C'est la cause principale des pages clairsemées (page de masthead à ~1/3 de hauteur), mais les deux garde-fous ont été durcis en réaction à des pertes de contenu **silencieuses**, un mode de défaillance bien pire que du vide. Les desserrer à l'aveugle en fin de session serait un pari. À re-dériver empiriquement (comparer hauteur mesurée vs hauteur réellement rendue par ratio) au bloc 3, avec `ExportFrame`. |

### Calibration de la pagination — mesurée, pas estimée (2026-08-04)

Les deux limites ci-dessus (débordement des pipelines longs, pages clairsemées) ont été traitées ensemble, sur instrumentation réelle plutôt qu'au jugé : mesure du **remplissage effectif de chaque page rendue** (hauteur du contenu / hauteur du canevas), avant et après.

**Diagnostic (ratio 1:1, review de 25 étapes de culture + 14 de curing)** — le système était mauvais dans les deux sens simultanément :

| Page | Avant | Contenu |
|---|---|---|
| p1 | **30 %** | masthead seul, isolé de force |
| p2 | 38 % | deux petites sections |
| p3 | 91 % | correct |
| p4 | **158 % — débordait** | pipeline Culture, 1229px sur un canevas de 800 (J15→J25 perdus) |
| p5 | **7 %** | une description de 42px, seule sur une page |

Constat décisif : **aucune page n'était sur-remplie**. La marge de 30 % protégeait donc contre un risque qui ne se matérialisait pas, pendant que le seul vrai débordement venait d'un module atomique trop gros — contre lequel aucune marge ne peut rien.

**Quatre corrections, dans cet ordre** :
1. **Pipelines sécables** (`PipelineTimeline.jsx`) — une chronologie est une LISTE ; la rendre insécable était la cause racine. Découpe par frontière sémantique (une phase = un tronçon), puis par paquets de 6 étapes si une phase dépasse à elle seule une page. Chaque tronçon (`pipeline:<key>#<n>`) devient une unité paginable. En-tête reporté avec mention « (suite) » sur les pages de continuation ; le bandeau de constantes, lui, n'apparaît qu'une fois.
2. **Isolement forcé restreint aux widgets qui le méritent** (`adaptivePagination.js`) — `masthead` et `mainImage` en sortent : ce sont des blocs simples dont la hauteur se mesure sans ambiguïté. `cannabinoidProfile` (grille + radar SVG) et `cultureStats` (Recharts) y restent : leur mesure a réellement échoué par le passé, avec perte **silencieuse** de contenu.
3. **Budget 0.70 → 0.92**, justifié par la mesure et par la disparition de deux causes de sous-estimation (course de chargement des polices entre mesure et capture, désormais supprimée par le préchargement ; pipelines insécables, désormais découpés).
4. **Coût d'en-tête de pipeline réservé au budget** — l'en-tête et le bandeau de constantes sont reportés sur chaque page portant un tronçon : ils n'appartiennent à aucun tronçon mesuré et échappaient au budget (~90-124px par page). Regroupés sous un `data-module` propre (`#hdr`), lu par le packer et réservé une fois par page et par pipeline.

**Résultat mesuré, même review, même ratio** :

| Page | Après | |
|---|---|---|
| p1 | 67 % | masthead + évaluation sensorielle + profil aromatique |
| p2 | 78 % | Curing (tronçons 0-1) |
| p3 | 76 % | fin Curing + début Culture |
| p4 | 69 % | Culture (tronçons 2-3) |
| p5 | 67 % | fin Culture + description |

**Zéro débordement** (max 78 % contre 158 %), **zéro page sous 67 %** (contre 7 % et 30 %), et surtout **plus aucune étape perdue** — vérifié sur export PNG réel : le pipeline va bien jusqu'à J25, avec ses deltas (J19 humidité+pH, J22 note).

Testé aussi à 4 étapes par tronçon : gain marginal (une seule page passe de 69 à 72 %), au prix d'une fragmentation supplémentaire — conservé à 6.

**Finition trouvée à l'export** : deux tronçons consécutifs d'une même phase affichaient « FLORAISON » puis « FLORAISON (SUITE) » à quelques centimètres sur la même page. L'en-tête de phase n'est désormais reporté que s'il ouvre la phase ou si le tronçon précédent est sur une autre page.

**Code mort supprimé au passage** (relevé exhaustif, zéro consommateur dans `client/src`) :
- `layout.columns` / `layout.imageHeight` / `layout.contentHeight` de `getResponsiveAdjustments` — calculés à chaque rendu des 5 templates sans que personne ne les lise. Ils avaient failli servir de fondation à `ExportFrame` (la spec C2 y faisait piloter le `Masthead`), c'est-à-dire à un champ mort.
- La branche `: 0.85` du `scaleFactor` — inatteignable pour les 5 ratios, et déjà responsable d'une erreur de transcription (4:3 noté 0.85 au lieu de 0.9).
- `fontPreloader.js` : 7 familles sur 8 sans `@font-face` dans l'app.

**Limite restante** : le packing reste un premier-ajustement séquentiel qui ne réordonne jamais. Un petit module en fin de document ne remonte pas combler une page antérieure — d'où les ~30 % résiduels. Corriger cela supposerait de réordonner le contenu, ce qui dégraderait l'ordre de lecture : gain esthétique contre perte éditoriale, arbitrage à trancher, pas un défaut à corriger par défaut.

---

### Bloc 3 — Fondations de densité

| # | Étape | Fichiers | Dépend de | Critère « fait » | Risque |
|---|---|---|---|---|---|
| 7 | **Reformaliser `getResponsiveAdjustments` en table déclarative.** Transcrire `C1-tokens.json > density.byRatio` **exactement** — y compris les valeurs contre-intuitives d'A4 héritées de la branche portrait. Supprimer la branche morte `0.85`. | `exportMakerHelpers.js` | — | Test de non-régression comparant l'ancienne et la nouvelle fonction sur les 5 ratios × toutes les clés : **égalité stricte** ; plus aucun résultat dépendant d'un ordre de `if` | **Moyen** — consommée par 5 templates + `measureDetailedCardModules` + `useAdaptivePages` |
| 8 | **`ExportFrame`** : contexte de densité (objet `getResponsiveAdjustments` **complet**, pas un sous-ensemble) + `data-em-ratio`/`data-em-mode` + contrat de débordement `paged`/`continuous`. Ne pas exposer `layout.*` (mort). | nouveau `templates/frame/ExportFrame.jsx` | 7 | Rendu identique à l'existant sur `detailedCard` avant migration ; aucun `justify-center` sur conteneur à hauteur contrainte | Moyen |

### Bloc 4 — Rollout du territoire visuel (décision D3)

| # | Étape | Fichiers | Dépend de | Critère « fait » | Risque |
|---|---|---|---|---|---|
> **Révision 2026-08-04 — le territoire visuel a changé** (B2 révisé, décision utilisateur) : les rendus portent la DA du **site** (LiquidUI), pas le territoire « Lab Résine ». Conséquences sur ce bloc : (a) `TemplateSection`/`getGlassTokens` ne sont **plus à déprécier**, ils deviennent la fondation — l'étape 13 perd son objet principal ; (b) les 5 templates partagent désormais une seule palette par défaut (`modern`/« Terpologie », réalignée sur les valeurs réelles de l'app), la différenciation se faisant par la mise en page ; (c) une partie du bloc est **déjà faite** — voir ci-dessous.

| # | Étape | Fichiers | Dépend de | Critère « fait » | Risque |
|---|---|---|---|---|---|
| 9a | ✅ **Fait** — Socle DA commun : `SEMANTIC_SCORE_COLORS`/`SEMANTIC_SCORE_TEXT_COLORS` sur le système sémantique de l'app (emerald/amber/red, surface 500 / texte 400) ; `ACCENT_TEXT_COLORS` (violet-500 = surface, violet-400 = texte) ; palette « Terpologie » réalignée sur `theme-tokens.css` ; les 5 `TEMPLATE_DEFAULT_IDENTITY` unifiés ; Inter chargée et posée partout ; séries de `CultureStatsChart`, accents de `SensoryRadar` et des 2 canevas React Flow réalignés ; mode papier passé sur l'échelle slate. | `exportMakerHelpers.js`, `exportMakerConstants.js`, `exportMakerStore.js`, `index.html`, `TypographyControls.jsx`, `DetailedCardTemplate.jsx`, `SocialStoryTemplate.jsx`, `CultureStatsChart.jsx`, `SensoryRadar.jsx`, `ReadOnly*Canvas.jsx` | — | Build + 34 tests verts | Moyen |
| 9b | Migrer `ModernCompactTemplate` sur `ExportFrame` + `TemplateSection` | `ModernCompactTemplate.jsx` | 6, 8 | OK sur 5 ratios ; pagination adaptative non régressée ; cycle `templateLocked` intact | Élevé |
| 10 | Migrer `BlogArticleTemplate` | idem | 6, 8 | idem | Élevé |
| 11 | Migrer `SocialStoryTemplate` | idem | 6, 8 | idem ; hero bord-à-bord conservé (décision actée) | Élevé |
| 12 | Migrer `TraceabilityReportTemplate` (mode `continuous`) | idem | 6, 8 | Document continu toujours défilant ; `/r/:id/lineage` non affecté | Élevé |
| 13 | Nettoyage : supprimer `layout.*` si toujours zéro consommateur ; harmoniser le rayon de carte à 24px (`.liquid-card`). **`TemplateSection`/`getGlassTokens` ne sont plus concernés — conservés.** | — | 12 | Build + 34 tests verts | Faible |

### Bloc 5 — Validation

| # | Étape | Critère « fait » |
|---|---|---|
| 14 | Matrice fidélité 5 formats × 5 templates, par **exports PNG réels téléchargés** | Aucune perte de contenu, aucun débordement non documenté |
| 15 | Non-régression ciblée sur les **3 classes de bugs de fidélité déjà rencontrées** : polices web non chargées avant mesure, mesures asynchrones divergentes entre surfaces, débordement recadré | Les 3 scénarios rejoués explicitement, pas un audit visuel générique |
| 16 | Checklist « produit fini » (devflow §4), amendée des décisions D1/D2 | Cochée, avec les 2 exclusions explicitement notées comme telles |

---

## Limites connues, à ne pas re-découvrir comme bugs

- Un bloc individuellement plus haut qu'une page (pipeline très long, radar en 1:1) déborde toujours sa page — limite bornée, déjà acceptée (correctif #11).
- Le PDF reste une image par page : pas de texte sélectionnable, pas d'en-tête/pied répété (D2). **La checklist devflow §Export n'est donc pas satisfaite sur ce point — elle est amendée, pas cochée.**
- L'export SVG est un `<foreignObject>` HTML, pas un vectoriel éditable — à documenter dans l'UI plutôt qu'à corriger.
- Mode Custom : hors scope, exempté du système adaptatif et des tokens.
- `ExportMaker.jsx` + dashboard QA : non touchés (8 tests en dépendent).

## Risques transverses

- **Vocabulaire deviné (6 occurrences historiques + 1 trouvée dans ces artefacts mêmes, B4 > R2)** : toute lecture de champ passe par `fieldRegistry.js` / `extractPipelines()` / `summarizeCellFields()`. Jamais un nom supposé.
- **3 surfaces de rendu** (Studio live / `ExportModal` / `/r/:id`) : vérifier les 3 à chaque étape de bascule de template, pas seulement l'aperçu Studio.
- **Pagination adaptative** : tout composant à hauteur variable selon un état (accordéon) casse la mesure — d'où la contrainte « toujours replié à la mesure et à l'export ».

---

## Décision requise avant de démarrer

**Étape 2 (polices)** est bloquée par un choix produit : charger Inter + Merriweather + Poppins (3 requêtes Google Fonts supplémentaires, les 4 templates gardent leur caractère actuel), ou réaligner les défauts des 4 templates sur Space Grotesk / IBM Plex Sans (cohérence stricte avec le territoire retenu, aucun coût réseau, mais change l'allure de « Article de Blog » et « Story »).

Les blocs 1 (étape 1), 2 et 3 ne dépendent pas de cette décision et peuvent démarrer immédiatement.
