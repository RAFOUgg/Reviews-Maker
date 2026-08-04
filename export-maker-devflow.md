# Export Maker — Dev Flow & Prompt de finalisation (produit fini)

> Cible : amener l'Export Maker de Terpologie au statut **produit fini** — UI de config + rendu HTML interactif + export multi-format (1:1 / 16:9 / 9:16 / 4:3 / A4) fidèle et premium.
> Usage : à coller dans une session Claude Code dédiée, ou à dérouler phase par phase.

---

## 0. RÈGLE DU JEU

- Chaque phase produit un **livrable validé** avant de passer à la suivante. Pas de code avant l'audit, pas de refonte avant le design system.
- Tout est versionné : `audit.md`, `benchmark.md`, `moodboard/`, `stepsheet.md`, `tokens.json`, puis le code.
- Le fil rouge : **ne jamais répéter une donnée identique** (la table de process actuelle répète 24 °C / 68 % / 888 ppm sur 25 lignes → c'est le symptôme central à corriger).

---

## 1. DEV FLOW (vue d'ensemble)

```
PHASE A — Cadrage & inventaire
   └─ A1 Inventaire du produit (templates, formats, composants, pipeline export)
   └─ A2 Cartographie du code (où vit quoi dans le repo)

PHASE B — Recherche & direction
   └─ B1 Benchmark concurrentiel  → benchmark.md
   └─ B2 Moodboard                → moodboard/ + moodboard.md
   └─ B3 Audit visuel & technique → audit.md

PHASE C — Design system
   └─ C1 Tokens formalisés        → tokens.json + variables CSS
   └─ C2 Bibliothèque de composants (specs) → components.md
   └─ C3 Stepsheet de refonte     → stepsheet.md   ← validation obligatoire ici

PHASE D — Implémentation
   └─ D1 ExportFrame + tokens (fondations)
   └─ D2 Composants atomiques (MetricChip, DataRow, SectionHeader…)
   └─ D3 Refonte table de process (bandeau constantes + accordéon par phase)
   └─ D4 Templates un par un, chacun testé sur les 5 ratios
   └─ D5 Rendu HTML interactif (accordéons, tooltips, radar, filtres)
   └─ D6 Pipeline d'export (image HD + PDF A4 paginé)

PHASE E — Validation & durcissement
   └─ E1 Matrice fidélité preview↔export
   └─ E2 Accessibilité (contraste AA, tailles de touche)
   └─ E3 Régression sur templates existants
   └─ E4 Checklist "produit fini"
```

Ordre de dépendance strict : **B → C → D**. Les fondations (D1) débloquent tout le reste ; ne pas commencer un template avant que l'ExportFrame pilote la densité selon le ratio.

---

## 2. PROMPT — à coller dans Claude Code

```
# MISSION : Finaliser l'Export Maker (Terpologie) — produit fini

Tu es lead design + ingénieur front. Objectif : auditer, cadrer une direction
visuelle, puis refondre l'Export Maker et son rendu final (HTML interactif +
tous formats d'export) au niveau produit fini premium.

Contexte produit :
- Export Maker = rendu/export de fiches (COA, fiches techniques, process de
  production, rapports de traçabilité). Config à gauche (Template / Contenu /
  Pagination / Typographie / Couleurs / Image & Logo / Préréglages), preview à droite.
- Templates : Moderne Compact, Fiche Technique Détaillée, Article de Blog,
  Story Social Media, Rapport de Traçabilité.
- Formats : Carré 1:1, Paysage 16:9, Portrait 9:16, Standard 4:3, A4.
- Design system existant : accent ambre unique, scoring value-coded, regroupement
  métrique par famille, radar SVG clean, fond sombre.
- Symptôme central : la table "Processus de production" (25 étapes) répète des
  valeurs identiques ligne par ligne, colonnes tronquées, icônes minuscules.

Déroule les phases DANS L'ORDRE. Ne code rien avant la validation du stepsheet (Phase C3).
Livre chaque artefact comme un fichier séparé.

────────────────────────────────────────────
PHASE A — CADRAGE
A1. Inventorie : chaque template, chaque format, chaque composant de rendu, et
    le pipeline d'export actuel (image ? PDF ? via quoi — html2canvas, Puppeteer,
    satori, react-pdf ?). Confirme le stack depuis le repo, ne suppose pas.
A2. Cartographie le code : où vit l'UI de config, où vivent les templates, où
    se fait le rendu, où se fait l'export.

────────────────────────────────────────────
PHASE B — RECHERCHE & DIRECTION

B1. BENCHMARK CONCURRENTIEL → benchmark.md
    Analyse 6–10 références pertinentes réparties en 3 groupes :
    a) Labo/COA & data cannabis : Confident Cannabis, SC Labs, Steep Hill,
       BelCosta, plateformes de COA — comment ils rendent les fiches d'analyse.
    b) Générateurs de rendu/export : Canva, Figma export, Framer, Beautiful.ai,
       Typeform results, htmlcsstoimage — pour la partie multi-format et fidélité.
    c) Dashboards data denses : Linear, Vercel Analytics, Retool, Observable —
       pour la lisibilité de tableaux et métriques denses sur fond sombre.
    Pour chaque référence : capture/description, ce qu'ils font mieux que nous,
    ce qu'on peut leur emprunter, ce qu'on évite. Termine par une SYNTHÈSE :
    "notre positionnement visuel = X, notre différenciateur = Y".

B2. MOODBOARD → moodboard/ + moodboard.md
    Construis un moodboard qui fixe la direction AVANT tout token. Structure-le :
    - Territoire visuel (2–3 pistes nommées, ex. "Lab clinique sombre",
      "Botanique premium", "Terminal technique"). Choisis-en UNE, justifie.
    - Références image par thème : palette, typographie, traitement des données,
      iconographie, densité, radar/graphes, texture de fond.
    - Palette candidate (ambre + neutres sombres + couleurs de scoring) avec hex.
    - Couples typographiques candidats (titre / corps / mono pour valeurs).
    - Do / Don't visuels explicites.
    Produis le moodboard comme un artefact HTML/SVG visuel rendu (grille de
    swatches, specimens typo, exemples de composants), pas juste une liste.

B3. AUDIT → audit.md
    Tableau par axe → problème → sévérité (bloquant / majeur / mineur) →
    recommandation, sur :
    1. Densité & lisibilité (répétition de valeurs, troncature, icônes).
    2. Hiérarchie visuelle (titres, numérotation, séparateurs, respiration).
    3. Cohérence design system (accent ambre réel, contraste AA, échelle typo, grille).
    4. Rendu multi-format (ce qui casse en 1:1 / 9:16 / 16:9 / 4:3 / A4).
    5. Interactivité (ce qui devrait l'être : accordéons, tri, filtres, tooltips,
       radar au survol) vs figé pour l'export.
    6. Qualité d'export (fidélité preview↔export, polices embarquées, résolution,
       pagination A4 : sauts de page, en-têtes/pieds répétés).

────────────────────────────────────────────
PHASE C — DESIGN SYSTEM

C1. TOKENS → tokens.json + variables CSS
    Formalise : couleurs (accent ambre + neutres + états scoring), typo (échelle
    modulaire), espacement (base 4/8), rayons, ombres, densités par ratio.

C2. COMPOSANTS (specs) → components.md
    Spécifie une bibliothèque réutilisable :
    - ExportFrame  : pilote densité + taille de police selon le ratio (1 source de vérité).
    - SectionHeader, PhaseGroup, DataRow, MetricChip, RadarCard, Legend, Footer.
    Pour chacun : props, variantes par ratio, états, comportement interactif vs export.

C3. STEPSHEET → stepsheet.md   ← VALIDATION OBLIGATOIRE
    Découpe l'implémentation en étapes atomiques, ordonnées, chacune avec :
    - Objectif, fichiers touchés, dépendances, critère de "fait", risque de régression.
    Séquence imposée : fondations (ExportFrame + tokens) → atomes → table de
    process → templates un par un → interactivité → export.
    ARRÊTE-TOI ICI et attends ma validation.

────────────────────────────────────────────
PHASE D — IMPLÉMENTATION (après validation du stepsheet)

Suis le stepsheet. Points non négociables :
- Table de process refondue : bandeau "conditions constantes" affiché UNE fois,
  puis accordéon par phase (germination / croissance / floraison…) avec seuls
  les DELTAS mis en évidence. Zéro valeur répétée à l'identique sur 25 lignes.
- Chaque template rendu correct sur les 5 ratios via l'ExportFrame.
- Rendu HTML : accordéons, tooltips métriques, radar interactif, filtres de phase,
  + un toggle "mode export" qui fige l'interactivité pour capture propre.
- Export : image HD (1:1/16:9/9:16/4:3) + PDF A4 paginé, mêmes polices et mêmes
  tokens que la preview (fidélité pixel).

────────────────────────────────────────────
PHASE E — VALIDATION
- Matrice fidélité preview↔export (5 formats × 5 templates).
- Contraste AA vérifié sur fond sombre, tailles de touche.
- Zéro régression sur les templates existants (migration progressive).
- Checklist "produit fini" cochée.

Commence par la Phase A. Rends A1 + A2, puis enchaîne B1, B2, B3 comme fichiers
séparés. N'attaque C qu'après B, et ne code qu'après validation de C3.
```

---

## 3. STEPSHEET DÉTAILLÉE (gabarit à faire remplir en Phase C3)

À utiliser tel quel : chaque ligne = une étape mergeable indépendamment.

| # | Étape | Fichiers | Dépend de | Critère "fait" | Risque régression |
|---|-------|----------|-----------|----------------|-------------------|
| 1 | Extraire tokens en `tokens.json` + CSS vars | `tokens.json`, `theme.css` | — | Toutes les couleurs/typo/espacements référencés par variable | Faible |
| 2 | Créer `ExportFrame` (densité pilotée par ratio) | `ExportFrame.tsx` | 1 | Rendu identique en 5 ratios sur un dummy | Moyen |
| 3 | Atomes : `MetricChip`, `DataRow`, `SectionHeader` | `components/` | 1,2 | Storybook/preview des 3 sur chaque ratio | Faible |
| 4 | `PhaseGroup` + accordéon | `PhaseGroup.tsx` | 3 | Ouvre/ferme, deltas visibles | Moyen |
| 5 | Bandeau "conditions constantes" | `ConstantsBanner.tsx` | 3 | Valeurs constantes affichées 1×, non répétées | Moyen |
| 6 | Refonte table de process (assemble 4+5) | template process | 4,5 | 25 étapes lisibles, 0 valeur répétée | **Élevé** |
| 7 | Migrer "Fiche Technique Détaillée" | template | 6 | OK sur 5 ratios | Élevé |
| 8 | Migrer les 4 autres templates | templates | 7 | OK sur 5 ratios chacun | Élevé |
| 9 | `RadarCard` interactif + tooltips | `RadarCard.tsx` | 3 | Survol, valeurs, mode export fige | Moyen |
| 10 | Filtres de phase + tri | UI rendu | 4 | Filtre/tri sans casser l'export | Moyen |
| 11 | Toggle "mode export" | état global | 9,10 | Interactivité figée en export | Moyen |
| 12 | Export image HD | pipeline | 11 | 4 ratios, résolution ≥2× | Élevé |
| 13 | Export PDF A4 paginé | pipeline | 11 | Sauts de page propres, en-tête/pied répétés | **Élevé** |
| 14 | Matrice fidélité + a11y + régression | tests | 12,13 | Checklist verte | — |

---

## 4. CHECKLIST "PRODUIT FINI"

**Lisibilité**
- [ ] Aucune donnée identique répétée (constantes en bandeau, deltas seuls affichés)
- [ ] Zéro colonne tronquée sur aucun ratio
- [ ] Icônes lisibles (taille + contraste)

**Design system**
- [ ] 100 % des couleurs/typo/espacements viennent des tokens
- [ ] Contraste AA minimum sur fond sombre partout
- [ ] Accent ambre utilisé avec intention (hiérarchie, pas décoration)

**Multi-format**
- [ ] Les 5 templates rendus correctement sur 1:1 / 16:9 / 9:16 / 4:3 / A4
- [ ] ExportFrame = seule source de vérité de la densité

**Interactivité**
- [ ] Accordéons, tooltips, radar interactif, filtres fonctionnels
- [ ] Toggle "mode export" fige proprement l'interactivité

**Export**
- [ ] Fidélité pixel preview↔export (polices embarquées, mêmes tokens)
- [ ] Image ≥2× résolution ; PDF A4 paginé avec en-têtes/pieds répétés
- [ ] Matrice 5 formats × 5 templates entièrement validée

**Non-régression**
- [ ] Templates existants intacts, migration progressive documentée
```
