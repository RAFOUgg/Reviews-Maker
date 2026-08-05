# C8 — Plan du rendu interactif

> **Cadrage corrigé le 2026-08-06 par l'utilisateur.** La version précédente de ce document
> opposait un « mode Site » interactif à un mode figé. C'était une mauvaise lecture.
>
> Cadrage retenu : *« certaines données sont compliquées à décrire, donc il faut créer des modales,
> des infobulles, des menus déroulants — tous les rendus doivent être interactifs en soi. »*
>
> **L'interactivité n'est pas un mode, c'est une propriété des composants de rendu.** Il n'y a pas
> deux rendus à construire : ce sont les templates existants qui deviennent interactifs.
>
> Cela remplace la contrainte antérieure (« pagination ON → interaction limitée aux canevas et aux
> pipelines ») : l'interaction devient la norme partout où le rendu est affiché à l'écran.

---

## 1. La seule contrainte dure

**Un PNG ne se clique pas.** Un export en fichier (PNG, JPEG, PDF, SVG) est une rasterisation : ce
qui n'est pas visible au moment de la capture est définitivement perdu.

Donc chaque composant interactif doit définir **deux états** :

| | Rendu à l'écran | Export en fichier |
|---|---|---|
| Studio, `/r/:id`, page de détail | interactif (survol, clic, repli) | — |
| PNG / PDF / SVG | — | **projection statique** : l'information que le clic aurait révélée doit être présente autrement |

C'est ce contrat qui empêche l'interactivité de devenir une perte de données à l'export. Le
précédent existe déjà et a coûté cher : les cellules de `PipelineMiniGrid` étaient des carrés vides
dont l'information n'apparaissait qu'au clic — parfait à l'écran, illisible en PNG. Elles portent
désormais leur numéro d'étape (corrigé le 2026-08-05).

**Règle** : aucun composant ne passe en interactif tant que sa projection statique n'est pas
définie. Un composant dont le clic est la SEULE voie d'accès à une donnée est un bug d'export.

---

## 2. État réel des briques, vérifié dans le code

| Brique | État | Reste à faire |
|---|---|---|
| `PipelineMiniGrid` | Sélection `useState` locale, cellules cliquables, numéro visible | Infobulle au survol ; modale au lieu du panneau en ligne quand les champs sont nombreux |
| `ProductionChainCanvas` / `UnifiedGeneticsCanvas` | Vrai prop `readOnly` avec gardes réelles sur drag/drop/menus | Consomment le store Zustand **global** — d'où les doublons `ReadOnly*`. À rendre instanciable |
| `ReadOnlyGenealogyCanvas` / `ReadOnlyProductionChainCanvas` | Doublons créés faute de store scopé | À supprimer une fois le point ci-dessus réglé |
| `CultureStatsChart` (Recharts) | Statique | Recharts fournit `<Tooltip>` nativement — quasi gratuit |
| `SensoryRadar` | SVG maison, statique | Infobulle par axe |
| `GisementSections` / `DataCell` | Statique | Infobulle sur les libellés tronqués ou abrégés |
| `SingleReviewCard` (`/r/:id`) | Canevas à dimensions **fixes** rétréci au `transform: scale` | Les clics fonctionnent dans un élément `scale`, mais le texte devient minuscule sur mobile. À traiter (§4) |

---

## 3. Le vocabulaire d'interaction

Trois affordances, choisies selon la densité de ce qu'il y a à révéler. Uniformes sur tous les
templates — pas une invention par composant.

| Affordance | Quand | Projection statique |
|---|---|---|
| **Infobulle** | Une précision courte : unité, nom complet d'un libellé abrégé, valeur exacte d'un point de graphique | L'information tient déjà dans le libellé visible |
| **Modale** | Un détail structuré : toutes les mesures d'une étape de pipeline, une cellule de chaîne, un nœud génétique | Le tableau détaillé est rendu à plat sous le composant |
| **Repli / menu déroulant** | Une liste longue et homogène : notations par catégorie, ingrédients, données supplémentaires | Déplié |

Ces composants doivent réutiliser `LiquidModal`, `LiquidTooltip`, `LiquidChip` — ils existent dans
`LiquidUI.jsx`. Le projet a déjà payé sept fois le prix d'un vocabulaire réinventé à côté de celui
qui existait.

---

## 4. Le point ouvert : `/r/:id` sur mobile

`SingleReviewCard` rend un canevas de taille fixe (1920×1080…) puis le rétrécit. Les clics
fonctionnent, mais **tout rétrécit ensemble** : sur un téléphone, le texte devient illisible au lieu
de se recomposer.

Ce n'est pas un problème d'interactivité — c'est un problème de mise en page, indépendant. Deux
issues possibles, à trancher après les phases 1-3 (une fois l'interactivité en place, on saura si la
gêne est réelle) :

- **a.** Laisser le canevas et n'agir que sur l'échelle minimale.
- **b.** Sur petit écran uniquement, empiler les sections en pleine largeur au lieu de rétrécir le
  canevas — les composants étant déjà les mêmes, c'est une disposition alternative, pas un
  deuxième moteur de rendu.

---

## 5. Phases

### 7.1 — Le socle d'interaction
`LiquidTooltip`/`LiquidModal` câblés dans le contexte d'export, avec un drapeau `interactive`
propagé par `TemplateRenderer` : **faux pendant la capture** (`html-to-image`), vrai à l'écran.
*Sortie* : un composant témoin (une `DataCell`) affiche son infobulle à l'écran et rend sa
projection statique en PNG. Vérifié sur export réel téléchargé.

### 7.2 — Pipelines
Infobulle au survol d'une cellule, modale au clic avec toutes les mesures de l'étape.
*Sortie* : cliquer une cellule ouvre son détail ; le PNG conserve le rendu détaillé actuel.

### 7.3 — Canevas réels
Store de chaîne/génétique instanciable par canevas (instance Zustand fournie par contexte) ;
suppression des deux doublons `ReadOnly*`.
*Sortie* : deux canevas montés sur la même page sans collision ; zoom, survol de nœud et détail au
clic fonctionnels ; zéro doublon.

### 7.4 — Graphiques et notations
`<Tooltip>` Recharts sur `CultureStatsChart` ; infobulle par axe sur `SensoryRadar` ; repli sur les
notations denses et les données supplémentaires.
*Sortie* : chaque point de donnée est interrogeable.

### 7.5 — Vérification
Extension du harnais : cibles tactiles ≥ 44×44, contraste des états survolés, et surtout
**équivalence statique** — pour chaque composant interactif, vérifier sur un PNG réel téléchargé
qu'aucune donnée n'est accessible uniquement au clic.
*Sortie* : 0 erreur sur 4 types × 3 densités.

---

## 6. Hors de ce plan

- Débordement d'Article de Blog 16:9 (134 %) et sévérité de la règle E6 — défauts du rendu figé,
  à traiter avant, indépendamment.
- Dernière page de la Fiche Technique à 46 %.
