# B1 — Benchmark concurrentiel

## Groupe A — Labo / COA & data cannabis

### 1. SC Labs (PhytoFacts / COA)
Ce qu'ils font mieux : le COA classique (tableau réglementaire) est délibérément séparé du rapport "chemometric" PhytoFacts, qui traduit les mêmes données en visuels — proportion terpènes/cannabinoïdes, résumé "top 3 terpènes et leur ratio" en un coup d'œil, profil organoleptique dérivé. C'est exactement le principe qui manque à Export Maker : **une couche de synthèse visuelle au-dessus de la couche de données brutes**, pas une seule table qui essaie de tout porter.
À emprunter : le "résumé en tête" (3-4 métriques dominantes extraites automatiquement) avant le détail exhaustif.
À éviter : SC Labs reste un document réglementaire figé (PDF statique, pas d'interactivité) — pas un modèle pour la Phase D5 (HTML interactif).
Sources : [SC Labs PhytoFacts](https://www.sclabs.com/sc-labs-launches-phytofacts-advanced-cannabis-chemometrics-reporting/), [Chemometric Reports](https://www.sclabs.com/resources/phytofacts-chemometric-reports/)

### 2. Confident Cannabis
Ce qu'ils font mieux : structuration en couches (en-tête labo/accréditation → identité du lot/QR → résumé de tests → détail), un motif de hiérarchie de lecture en entonnoir qu'Export Maker n'a pas formalisé (chaque template a sa propre hiérarchie ad hoc).
À emprunter : le header de confiance (accréditation, batch, QR) toujours au même endroit, quel que soit le contenu variable en dessous — un vrai "masthead" stable, ce que `detailedCard` a commencé à faire (correctif #10) mais que les 4 autres templates n'ont pas.
À éviter : reste orienté conformité réglementaire pure, aucune dimension "expérience sensorielle/story" (hors scope pour Export Maker, qui doit rester premium/éditorial autant que technique).
Sources : [Cannabis Workforce Initiative — How to Read a COA](https://cannabisworkforce.org/how-to-read-a-certificate-of-analysis-coa-for-marijuana-type-cannabis-sativa/), [Ivy Hall — How to Read a COA](https://ivyhalldispensary.com/blog/how-to-read-a-cannabis-certificate-of-analysis-coa/)

### 3. ACS Laboratory / Encore Labs (COA génériques du secteur)
Ce qu'ils font mieux : convention de secteur bien ancrée — sections nommées identiquement partout (Cannabinoids / Terpenes / Safety : Pesticides, Heavy Metals, Microbials, Mycotoxins, Residual Solvents), ce qui rend le document immédiatement lisible par un habitué du secteur même sans jamais l'avoir vu.
À emprunter : nommage de section standardisé et prévisible, utile pour la partie "labo" du template `detailedCard`/`traceabilityReport`.
À éviter : densité typographique très faible, tableaux noir/blanc sans hiérarchie de couleur — c'est justement le symptôme du "tableau qui répète tout" à ne pas reproduire.
Source : [ACS Laboratory — Certificate of Analysis](https://www.acslab.com/certificate-of-analysis), [Encore Labs — Interpreting a COA](https://encorelabs.com/interpreting-a-coa/)

**Synthèse Groupe A** : le secteur labo maîtrise la hiérarchie de lecture (résumé → détail) et la stabilité du header, mais reste figé (PDF statique) et pauvre visuellement (pas de mode "premium éditorial"). Export Maker doit prendre leur rigueur de structuration sans hériter de leur austérité.

## Groupe B — Générateurs de rendu / export

### 4. Canva (export multi-format)
Ce qu'ils font mieux : le même document se redimensionne intelligemment entre formats (post Instagram carré → story 9:16 → doc A4) via un système de contraintes par bloc, pas un simple `scale()`. C'est conceptuellement ce que `getResponsiveAdjustments` fait pour la typo, mais Canva l'étend à la mise en page elle-même (recomposition, pas juste redimensionnement).
À emprunter : penser "contraintes par bloc" (min/max, priorité de troncature/masquage) plutôt qu'un seul facteur d'échelle global — pertinent pour l'`ExportFrame` de la Phase C2/D1.
À éviter : Canva autorise un chaos créatif total (positionnement libre) — Export Maker doit rester sur une grille disciplinée pour garder la cohérence data-driven.

### 5. Figma (export)
Ce qu'ils font mieux : fidélité pixel-perfect export↔design garantie par construction (le moteur de rendu de l'éditeur EST le moteur d'export) — exactement le problème de fidélité que le devflow pointe en Phase E1. Export Maker a un aperçu Studio et un export réel qui sont deux pipelines de rendu distincts (React DOM live vs `html-to-image` sur un DOM cloné/hors-écran) — source structurelle de désynchronisation déjà documentée dans l'historique (bug #3, #11c).
À emprunter : minimiser l'écart entre "ce qui est mesuré/affiché" et "ce qui est capturé" — au minimum partager le même arbre de composants React entre aperçu et capture (déjà largement le cas via `TemplateRenderer.jsx`, à vérifier explicitement en Phase E1).

### 6. Framer (sites/exports interactifs)
Ce qu'ils font mieux : le "mode preview" et le "mode publié" sont le même runtime — pas de bascule interactif→figé qui perd du contenu. Pertinent pour la demande devflow §D5/§D11 (toggle "mode export" qui fige l'interactivité) : Framer ne fige rien, il republie le même composant sans les handles d'édition.
À emprunter : concevoir dès la Phase C2 des composants qui savent être "interactifs" ou "statiques" via une seule prop (`readOnly`/`interactive`), comme déjà fait pour `ReadOnlyGenealogyCanvas.jsx` — généraliser ce pattern à tous les futurs composants atomiques.

### 7. htmlcsstoimage / html2canvas-style services (fidélité de rasterisation)
Ce qu'ils font mieux : documentent explicitement les limites connues de rasterisation DOM→image (polices web non chargées à temps, `backdrop-filter` inconstant selon moteur, mesures asynchrones) — exactement les 3 classes de bugs déjà rencontrées et corrigées dans Export Maker (attente `document.fonts.ready`, test empirique `backdrop-filter`, cache de mesure partagé). Confirme que ces frictions sont un problème de catégorie d'outil (`html-to-image`/`html2canvas`), pas une erreur d'implémentation isolée.
À emprunter : traiter la checklist Phase E1 (fidélité preview↔export) comme un test de non-régression permanent, pas un audit ponctuel — vu le nombre de fois où ce type de bug est réapparu.

### 8. Typeform (results/rendu de synthèse)
Ce qu'ils font mieux : transformation d'un formulaire dense en un rendu de résultats aéré, avec une seule métrique/insight par écran plutôt que tout entasser — proche philosophiquement de ce qu'il faut faire à la table de process (aujourd'hui 25 lignes identiques).
À emprunter : le principe "un module = une idée visuelle dominante", pas un tableau générique qui essaie de tout montrer au même niveau.

**Synthèse Groupe B** : ces outils prouvent qu'un même moteur de composants peut servir l'édition, l'aperçu ET l'export — c'est l'écart architectural principal d'Export Maker (3 surfaces de rendu historiquement désynchronisées, déjà partiellement unifiées via `TemplateRenderer.jsx`/`SingleReviewCard.jsx`, mais le pipeline d'export final (Phase A1 §4) reste un DOM→raster séparé).

## Groupe C — Dashboards data denses

### 9. Linear
Ce qu'ils font mieux : densité d'information très élevée sans jamais paraître chargé — grâce à une seule couleur d'accent utilisée avec parcimonie et une hiérarchie typographique à 3 niveaux stricts (jamais plus). Le "accent ambre unique" déjà en place pour `detailedCard` (correctif #10, bandes sémantiques fixes + accent décoratif séparé) suit déjà ce principe — à répliquer sur les 4 autres templates qui gardent encore un violet plus décoratif/moins discipliné.
À emprunter : limiter strictement le nombre de couleurs porteuses de sens (aujourd'hui : accent palette + 3 bandes sémantiques fixes sur `detailedCard` seulement).

### 10. Vercel Analytics / Observable (tableaux + séries denses sur fond sombre)
Ce qu'ils font mieux : les valeurs répétées/constantes sont **résumées une fois** puis seules les variations (deltas, anomalies) sont mises en avant visuellement — exactement la recommandation du devflow pour la table de process (bandeau constantes + accordéon deltas).
À emprunter : c'est la référence directe pour l'étape D3/D4 (`ConstantsBanner` + `PhaseGroup`).

**Synthèse Groupe C** : ces dashboards valident que le "symptôme central" du devflow (répétition de valeurs identiques) a une solution connue et éprouvée (résumé + deltas), pas un problème inédit à Export Maker.

---

## Synthèse — positionnement

**Notre positionnement visuel** : documentation technique premium à la croisée du certificat de laboratoire (rigueur, header stable, nomenclature sectorielle) et du dashboard dense discipliné (accent unique, résumé + deltas) — direction déjà amorcée sur `detailedCard`/COA v2 (2026-08-03) mais pas encore propagée aux 4 autres templates ni au tableau de process.

**Notre différenciateur** : aucun concurrent (labo ou générateur d'export) ne rend la **traçabilité de production** (pipeline culture/curing/extraction, généalogie, chaîne de production) comme une donnée de premier plan avec une hiérarchie de lecture premium — c'est l'angle produit unique de Terpologie (cf. CLAUDE.md, "Vision produit"). La refonte doit donc traiter le pipeline de process (le symptôme central) comme LE composant signature, pas un tableau annexe.
