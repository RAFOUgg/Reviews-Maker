# B3 — Audit visuel & technique

> Sévérité : **bloquant** (empêche le produit fini), **majeur** (dégrade fortement l'expérience), **mineur** (finition). Chaque ligne s'appuie sur du code lu directement (A1/A2) ou sur un correctif déjà documenté dans `CLAUDE.md`.
>
> **Complété le 2026-08-04 par `B4-revue-critique.md`** — passe de contre-vérification qui a trouvé 9 écarts entre ces artefacts et le code réel. Deux ajouts modifient les conclusions de cet audit :
> - **Contraste AA (nouveau §7 ci-dessous)** : cet audit ne mesurait le contraste nulle part alors que la checklist l'exige. Mesuré : **il n'est pas tenu** aujourd'hui.
> - **§3.3 (polices)** sous-estimait le problème : ce ne sont pas seulement les options qui sont non chargées, ce sont les **défauts de 4 templates sur 5** (B4 > R6).

## 1. Densité & lisibilité

| # | Problème | Sévérité | Recommandation |
|---|---|---|---|
| 1.1 | Table de process : les constantes (température/humidité/CO₂...) sont répétées identiques sur chaque ligne/étape au lieu d'être affichées une fois — symptôme central du devflow. | **Bloquant** | `ConstantsBanner` + `PhaseGroup` en accordéon (deltas seuls affichés), voir moodboard §03. |
| 1.2 | Historique documenté : troncature de badges à 3-6 caractères et dégradation en carrés colorés sans texte au-delà de 12 étapes — corrigé par décision utilisateur ("tout garder affiché, quitte à allonger la fiche"), plancher de police remonté à 12-14px minimum. | Résolu (2026-07-27) | Contrainte à respecter dans toute nouvelle table/accordéon : jamais de troncature silencieuse, jamais sous 12px. |
| 1.3 | Aucune bibliothèque de composants atomiques formalisée — chaque template réimplémente ses variantes de badge/carte, avec des niveaux de densité incohérents entre eux (`ModernCompactTemplate` très compact vs `BlogArticleTemplate` aéré) sans règle partagée explicite. | Majeur | Formaliser `MetricChip`/`DataRow`/`SectionHeader` en Phase C2, un seul jeu de règles de densité dérivé de `getResponsiveAdjustments`. |

## 2. Hiérarchie visuelle

| # | Problème | Sévérité | Recommandation |
|---|---|---|---|
| 2.1 | Seul `detailedCard` a un vrai "masthead" stable (marque + pastille + note globale isolée, correctif #10). Les 4 autres templates n'ont pas de header hiérarchisé équivalent — la note globale/titre se noie au même niveau que le reste du contenu. | Majeur | Étendre le pattern masthead à `modernCompact`/`blogArticle`/`socialStory` (traceabilityReport reste un document qui défile, moins concerné). |
| 2.2 | Sur `DetailedCardTemplate.jsx` (ancien style, avant COA v2), un bug de mise en page a déjà effacé le header entier par débordement recadré symétriquement (`justify-center`, correctif post-déploiement #1) — la classe de bug (contenu variable + conteneur à hauteur fixe) reste un risque structurel tant qu'un `ExportFrame` ne gère pas explicitement le débordement par contrat plutôt que par correctif ponctuel. | Majeur (risque récurrent) | `ExportFrame` (Phase D1) doit définir un contrat explicite de dépassement (scroll interne / pagination forcée / jamais de recadrage centré) — pas une propriété CSS locale par template. |
| 2.3 | Numérotation/séparateurs incohérents entre templates — `DetailedCardTemplate` (COA v2) a des sections numérotées "01/02/03/04", les autres non. | Mineur | Décision de Phase C2 : la numérotation n'a de sens que si l'ordre de lecture est réellement significatif (c'est le cas pour un rapport de labo) — à trancher template par template, pas à généraliser par défaut (cf. règle "Structure is information"). |

## 3. Cohérence design system

| # | Problème | Sévérité | Recommandation |
|---|---|---|---|
| 3.1 | Deux langages visuels coexistent : glassmorphism violet (`TemplateSection.jsx`/`getGlassTokens`, 4 templates) vs "Lab Résine" (`detailedCard` seul, COA v2). Un utilisateur changeant de template voit deux identités de marque différentes. | **Bloquant** pour le statut "produit fini" | Propager la direction "Lab Clinique Sombre" (moodboard B2) aux 4 templates restants — décision déjà actée avec l'utilisateur comme prochaine étape naturelle après validation du pilote `detailedCard`. |
| 3.2 | Bug A4 déjà trouvé et corrigé (`isA4` vérifié après `isPortrait` dans 3 ternaires de `getResponsiveAdjustments`, correctif #6) — signale que la logique de densité par ratio est de la logique conditionnelle ad hoc, pas un vrai système de tokens/contraintes déclaratif. | Majeur (dette structurelle, pas un bug ouvert) | Reformaliser `getResponsiveAdjustments` en table de tokens par ratio (Phase C1), pas en cascade de `if`. |
| 3.3 | Seulement 2 polices sur ~10+ proposées dans l'onglet Typographie sont réellement chargées (`Space Grotesk`, `JetBrains Mono`) — sélectionner une autre police retombe silencieusement sur un fallback système, sans avertissement UI. | Majeur | Trancher en Phase C1 : soit charger les polices manquantes (coût perf), soit réduire la liste de l'onglet Typographie aux polices réellement disponibles (cohérence immédiate, coût nul). |
| 3.4 | Bandes sémantiques de score fixes (`SEMANTIC_SCORE_COLORS`) n'existent que sur `detailedCard` — les 4 autres templates encodent encore le scoring via l'accent de palette (变e selon la palette choisie), ce qui rend un score "bon" visuellement incohérent d'un template à l'autre. | Majeur | Étendre `SEMANTIC_SCORE_COLORS`/`getScoreBand` (déjà factorisés dans `exportMakerHelpers.js`) aux 4 autres templates en même temps que 3.1. |

## 4. Rendu multi-format

| # | Problème | Sévérité | Recommandation |
|---|---|---|---|
| 4.1 | Limite connue et acceptée : un bloc individuellement plus grand qu'une page (pipeline très long, radar avec libellé en 1:1) déborde encore sa page — déjà documenté et accepté comme limite bornée, pas une régression. | Mineur (déjà scope-limité par décision utilisateur) | Rappeler explicitement cette limite dans la checklist E1 pour ne pas la re-découvrir comme "nouveau bug". |
| 4.2 | `traceabilityReport` est le seul template non couvert par la pagination adaptative (document continu, décision assumée) — cohérent, mais signifie que la future refonte visuelle (Phase D) devra le traiter comme un cas à part dans l'`ExportFrame` (pas de contrainte de hauteur de page). | Mineur (déjà une décision documentée) | `ExportFrame` doit avoir un mode "continu" explicite, pas juste un mode "paginé". |
| 4.3 | Mode Custom (mise en page libre) est exempté de la pagination adaptative et du système de tokens — un utilisateur en Mode Custom ne bénéficiera d'aucune amélioration issue de la refonte D. | Mineur (scope déjà tranché) | À documenter clairement dans le stepsheet C3 comme hors-scope explicite, pour éviter toute confusion pendant l'implémentation. |

## 5. Interactivité

| # | Problème | Sévérité | Recommandation |
|---|---|---|---|
| 5.1 | Aucune interactivité n'existe dans un fichier réellement exporté (PNG/JPEG/SVG/PDF/HTML) — l'interactivité (accordéons prévus en D5, radar au survol) n'existerait que dans l'aperçu Studio. Le devflow demande un "toggle mode export" qui fige une interactivité qui n'a, aujourd'hui, pas d'équivalent exporté. | **Bloquant** pour la demande explicite du devflow (§D5/§checklist) | Décision produit à trancher AVANT Phase C : le "rendu HTML interactif" du devflow vise-t-il seulement l'aperçu Studio (déjà largement acquis), ou un nouvel export HTML avec JS embarqué (accordéons/tooltips fonctionnels après téléchargement) ? Impact stepsheet majeur selon la réponse — voir question ouverte en fin de document. |
| 5.2 | Le seul filtre/interactivité déjà "figeable" existant est la pagination (`allowOverflow` sur `/r/:id`) — pas un vrai pattern générique interactif↔statique réutilisable pour de nouveaux composants. | Majeur | S'appuyer sur le pattern déjà validé des canevas `ReadOnlyGenealogyCanvas`/`ReadOnlyProductionChainCanvas` (prop `readOnly` explicite) comme modèle à répliquer pour tout futur composant interactif (Phase C2). |

## 6. Qualité d'export

| # | Problème | Sévérité | Recommandation |
|---|---|---|---|
| 6.1 | Export "PDF" n'est pas un document structuré : c'est une image rastérisée par page (`toPng` pixelRatio 2) collée dans un `jsPDF` via `addImage()`. Aucun texte sélectionnable, aucun en-tête/pied de page répété (explicitement requis par la checklist §Export du devflow). | **Bloquant** pour la checklist produit fini | Décision à trancher en Phase C3 : accepter le PDF-image comme limite assumée du stack (`html-to-image`+`jsPDF`, pas de Puppeteer/react-pdf), ou investir dans un vrai pipeline PDF structuré (changement de stack, effort élevé, hors du scope "front only" actuel). |
| 6.2 | Export SVG produit un `<foreignObject>` HTML englobant, pas un SVG vectoriel réellement éditable — trompeur si un utilisateur attend un vrai fichier vectoriel (ex. retouche dans Illustrator/Figma). | Mineur | Documenter la limite dans l'UI d'export (tooltip "SVG conteneur HTML, pas vectoriel pur") plutôt que la corriger (changement de stack disproportionné pour ce format secondaire). |
| 6.3 | Fidélité preview↔export historiquement fragile : 3 classes de bugs déjà rencontrées et corrigées (polices web non chargées avant mesure, `backdrop-filter` incertain à la rasterisation, mesures asynchrones divergentes entre 2 pipelines de mesure indépendants) — révèle un pipeline de rendu dupliqué entre aperçu Studio et export réel (2 arbres DOM distincts), pas un seul moteur partagé comme Figma (cf. B1 Groupe B). | Majeur (dette structurelle) | Phase E1 doit inclure explicitement un test de non-régression sur ces 3 classes de bugs précises, pas seulement un audit visuel générique. |
| 6.4 | Résolution image déjà à `pixelRatio: 2` (≥2× demandé par la checklist) — conforme. | Résolu / conforme | Aucune action, à confirmer simplement en Phase E1. |

## 7. Accessibilité — contraste (ajouté 2026-08-04, mesuré)

Calcul WCAG réel, fond charcoal `#0E1512` et fond papier A4 `#F5F2E9` (lu dans `DetailedCardTemplate.jsx:120`) :

| # | Problème | Sévérité | Recommandation |
|---|---|---|---|
| 7.1 | `ScoreMetric.jsx:26` colore la **valeur chiffrée** (12-14 px) avec la couleur de bande : `hi` = **3.73:1**, `lo` = **3.76:1** — sous le seuil AA 4.5. Composant partagé → défaut présent sur les **5 templates**. | **Bloquant** (checklist « AA partout ») | Séparer couleurs de *surface* (barres/pastilles, seuil 3:1, inchangées) et couleurs de *texte* (variantes AA : `hi` `#51896B`, `lo` `#BD6650`). Tokens ajoutés dans `C1-tokens.json > color.semanticScore.text`. |
| 7.2 | En **mode papier A4**, l'accent ambre est conservé à l'identique (décision correctif #10) : `#C9922E` sur crème = **2.44:1** — échec AA, et même sous le seuil 3:1 des surfaces. Or A4 est le format explicitement pensé pour l'impression. | **Majeur** | Variante papier `#8D6620` (4.63:1) pour tout texte/filet accentué imprimé. L'accent d'origine reste utilisable en aplat sous encre sombre. |
| 7.3 | Aucun test de non-régression de contraste n'existe — le respect de la checklist repose sur une inspection visuelle ponctuelle. | Mineur | Ajouter le calcul de contraste des tokens à la validation E2 (fonction pure, testable sans navigateur). |

---

## Question ouverte à trancher avant Phase C (bloque le dimensionnement du stepsheet)

Le point **5.1** conditionne fortement l'ampleur de la Phase D : le devflow demande un export HTML interactif figeable, mais le pipeline actuel n'exporte que des snapshots rastérisés (PNG/JPEG/SVG/PDF) ou un HTML statique sérialisé (`serializeMultiPageHtml`). Construire un vrai export HTML interactif (accordéons/tooltips fonctionnels dans le fichier téléchargé) est un chantier d'une toute autre ampleur qu'une refonte visuelle — à clarifier avec l'utilisateur avant de rédiger le stepsheet C3.
