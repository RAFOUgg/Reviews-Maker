# C8 — Plan du rendu interactif (phase 7)

> Demande d'origine : « je souhaite que le rendu soit un site html propre → les datas y sont en
> read only ; reprends l'UX des pipelines → rends le readonly ; il faut rendre ça intelligent et
> ergonomique ». Modèle confirmé par l'utilisateur : **pagination OFF → site interactif, sans
> débordement ni contenu illisible ni espace vide ; pagination ON → interaction limitée aux
> canevas et aux pipelines.**
>
> Établi le 2026-08-06, après vérification du code existant (pas d'hypothèse).

---

## 1. État réel, vérifié

| Brique | État | Conséquence |
|---|---|---|
| `PublicRenderPage` → `SingleReviewCard` | Rend `TemplateRenderer` dans un canevas de **dimensions fixes** (`{1:1: 800×800, 16:9: 1920×1080…}`) puis le rétrécit au `transform: scale` via `ResizeObserver` | **L'obstacle de fond.** `/r/:id` n'est pas un site : c'est une image mise à l'échelle. Sur mobile, tout rétrécit ensemble — le texte devient minuscule au lieu de se recomposer. |
| Les 5 templates | Construits autour de `dimensions` + `getResponsiveAdjustments(ratio)` : tailles, limites de tags, part d'image, tout est dérivé d'un **ratio fixe** | Les rendre fluides reviendrait à combattre leur conception entière. |
| `ProductionChainCanvas` / `UnifiedGeneticsCanvas` | Ont un vrai prop `readOnly`, avec gardes réelles (`if (readOnly) return;` sur drag, drop, menus) | Utilisables tels quels… |
| …mais | Consomment le **store Zustand global** (`useProductionChainStore()`) | …seulement à raison d'un par page. C'est ce qui a motivé les doublons `ReadOnlyGenealogyCanvas`/`ReadOnlyProductionChainCanvas` (état 100 % local). |
| `PipelineMiniGrid` | Sélection en `useState` local, cellules cliquables | **Déjà interactif.** Il est depuis le 2026-08-05 la représentation par défaut des pipelines. |

---

## 2. La décision d'architecture

Trois options, et pourquoi une seule tient :

1. **Rendre les templates fluides** — il faudrait retirer `dimensions`/`ratio` de leur cœur, c'est-à-dire réécrire les 5. Le travail de calibrage des phases 2-3 (image élastique, parts par format, pagination adaptative) serait perdu : il n'a de sens que pour un canevas fixe.
2. **Garder le canevas et ajouter des interactions** — les clics fonctionnent dans un élément `scale`, mais le résultat reste une image zoomée. Ne répond pas à « un site html propre ».
3. ✅ **Un rendu Site distinct, composé des MÊMES composants de section.**

**Recommandation : option 3.** Un `SiteRenderer` qui n'invente aucun affichage de champ : il assemble `TemplateSection`, `GisementSections`, `PipelineMiniGrid`, `SensoryRadar`, `CultureStatsChart`, les canevas — pilotés par le **même `contentModules`** et le même `fieldRegistry`.

**Le risque à ne pas répéter** : ce repo a déjà souffert de trois moteurs de rendu concurrents (mémoire `export-rendering-three-paths-2026-06`), et de 7 bugs de « vocabulaire deviné ». La garde est explicite : *le Site ne définit aucune liste de champs, aucun libellé, aucune clé.* Il ne fait que disposer des composants existants. Toute tentation d'y écrire `reviewData.xxx` en direct est le signal d'alarme.

---

## 3. Phases

### Phase 7.1 — Socle Site (le plus gros)
- `SiteRenderer.jsx` : mise en page fluide réelle (grille CSS, `clamp()` pour la typographie, points de rupture), **sans `transform: scale`**.
- Branché sur `/r/:id` quand la pagination est OFF ; `SingleReviewCard` conservé pour le mode figé et pour `ReviewLineagePage`.
- *Sortie* : `/r/:id` défile, se recompose à 360px comme à 1920px, aucun texte sous 14px, aucun débordement horizontal.

### Phase 7.2 — Pipelines interactifs
- `PipelineMiniGrid` en pleine largeur, cellules cliquables ouvrant le détail de l'étape — **l'UX des formulaires**, en lecture seule.
- Repli statique conservé pour l'export figé (les cellules portent déjà leur numéro depuis le 2026-08-05).
- *Sortie* : cliquer une cellule affiche ses champs, sans navigation ni rechargement.

### Phase 7.3 — Canevas réels au lieu des doublons
- Rendre le store de chaîne/génétique **instanciable par canevas** (Zustand permet de créer une instance et de la fournir par contexte) plutôt que globale.
- Supprimer `ReadOnlyGenealogyCanvas`/`ReadOnlyProductionChainCanvas` au profit des vrais canevas en `readOnly` — c'est la demande explicite : « pourquoi avoir refait un UI alors qu'il en existe déjà un ».
- *Sortie* : deux canevas montés simultanément (page de lignée) sans collision d'état ; zéro doublon.

### Phase 7.4 — Ergonomie de lecture
- Sections repliables sur les notations denses ; recette groupée par catégories.
- Sommaire latéral collant sur grand écran.
- *Sortie* : une review dense se parcourt sans défilement interminable.

### Phase 7.5 — Vérification
- Étendre le harnais d'audit au mode Site : pas de remplissage à mesurer (le document défile), mais contraste, plancher de police, longueur de ligne, cibles tactiles (44×44) et **absence de débordement horizontal** restent mesurables.
- *Sortie* : 0 erreur sur les 4 types × 3 densités, à 360 / 768 / 1440px.

---

## 4. À trancher avant de commencer

1. **Le mode Site respecte-t-il le template choisi** (Moderne Compact ↔ Fiche Technique donnent deux sites différents), ou existe-t-il **un seul site** dont le template ne pilote que le contenu ? Un seul site est plus simple et plus cohérent ; à confirmer.
2. **Le gating par type de compte** s'applique-t-il au mode Site comme aux templates (Amateur → Compact seul) ?
3. **La page de lignée** (`/r/:id/lineage`) bascule-t-elle aussi en mode Site, ou reste-t-elle une pile de fiches ?

---

## 5. Ce que ce plan ne couvre pas

- Le débordement d'Article de Blog 16:9 (134 %) et la sévérité de la règle E6 — défaut du mode **figé**, à traiter avant, indépendamment.
- La dernière page de la Fiche Technique à 46 % — idem.
