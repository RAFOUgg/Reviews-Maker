# C13 — Plan d'attaque : configurations intelligentes + revue des templates

> Demande du 2026-08-07 : « les configurations intelligentes contenus × formats × pagination ne
> sont pas introduites » et « revoir chaque template ».
>
> Tout ce qui suit est **sondé dans le code**, pas déduit de la capture. Ce qui n'a pas été mesuré
> est signalé comme tel.

---

## 1. Pourquoi les configurations intelligentes « ne sont pas introduites »

Ce n'est pas un oubli d'implémentation. C'est structurel, et ça se mesure en trois faits.

### 1.1 L'écran et le fichier divergent, mais moins que je ne l'ai d'abord écrit

> **Correction du 2026-08-07.** La première version de ce document affirmait que l'écran était
> rendu par `InteractiveReviewCard.jsx` (2013 lignes) et n'utilisait aucune source unique. Les deux
> affirmations étaient fausses, et c'est une leçon en soi : elles venaient d'un `grep` sur le nom du
> fichier, pas d'une vérification de qui le monte.

Mesuré, cette fois :

- **`InteractiveReviewCard.jsx` est du CODE MORT** — plus aucun import dans l'application, seulement
  deux mentions en commentaire.
- Le rendu écran réel est **`ReviewFullDisplay.jsx` (748 lignes)**, monté par `ScreenPreviewPane`
  (aperçu Studio), `PublicRenderPage` (`/r/:id`) et `ReviewDetailPage`.
- Il **consomme déjà** les sources uniques : `GisementSections`/`isModuleOn` (registre),
  `GROUP_ICONS` (`fieldIcons`), `SensoryRadar`, `CultureStatsChart`, les deux canevas en lecture
  seule, et `DEFAULT_CONFIG`. Il reçoit `contentModules` depuis la config Export Maker.

Ce qui diverge réellement se réduit donc à **un point** : l'écran rend ses pipelines avec
`InteractivePipelineViewer`, un troisième composant (§1.2). Le lot 4 s'en trouve considérablement
réduit — ce n'est pas une réécriture, c'est l'unification d'un composant.

### 1.2 Il y a un TROISIÈME rendu de pipeline

`InteractivePipelineViewer` (écran) vit à côté de `PipelineTimeline` (liste, fichier) et
`PipelineMiniGrid` (grille, fichier). Trois implémentations de la même idée. Le C11 §6 pose
`PipelineGridView` comme source unique de la grille — c'est vrai côté fichier seulement.

C'est ce troisième rendu qui produit le « Curing & Maturation · 1 étape · 0/1 · Étape 1 · Pas de
données » de la capture.

### 1.3 Des affordances d'ÉDITEUR partent dans le rendu

`GraphCanvasShell.jsx` monte `<Controls />` et `<MiniMap />` **sans condition** — aucune prop de
lecture seule. `ProductionChainCanvas readOnly` passe par ce shell : boutons de zoom, minimap et
attribution « React Flow » se retrouvent donc dans la fiche, à l'écran comme au fichier.

C'est exactement la même famille de défaut que le bloc « Astuce : maintenez Ctrl/Cmd » retiré le
2026-08-06, et que les curseurs de zoom retirés avant lui. **Troisième occurrence.** Il faut
traiter la classe, plus les cas.

### 1.3 bis — Le jeu de test était aveugle sur les canevas · **corrigé, et ça a tout changé**

Découvert en voulant vérifier §1.3. Les fixtures créaient deux nœuds de chaîne pointant sur **la
même review** ; le serveur rejette le second (400, à raison), `post()` avalait l'erreur, et
`ReadOnlyProductionChainCanvas` exige `nodes.length >= 2`. **Aucun audit n'a donc jamais monté un
canevas** — leurs modules mesuraient 16-20px, ce qu'on prenait pour « peu de données ».

Fixtures réparées (la review amont est désormais une review distincte, comme dans une vraie
chaîne), le résultat a immédiatement changé : **la Fiche Technique redébordait à 108,2 % en A4 et
110,5 % en 4:3**, masthead répété sur chaque page — c'est-à-dire le contraire de ce que la session
précédente avait mesuré et déployé.

Cause tracée en une sonde (`pageErrors` du rapport) :
`useNavigate() may be used only in the context of a <Router> component.`

L'arbre de mesure hors-écran est monté par `createRoot` sur un hôte détaché : il n'hérite d'aucun
contexte de la page, routeur compris. Les nœuds de canevas appellent `useNavigate()`. Le hook lève,
**toute la mesure échoue**, et `useAdaptivePages` retombe silencieusement sur les gabarits
statiques. Autrement dit : **la pagination adaptative ne fonctionnait plus du tout pour une review
portant une chaîne ou un arbre** — et c'était en production.

Corrigé par un `MemoryRouter` autour de l'arbre de mesure. Après correction, canevas réellement
montés : A4 **80,5 / 72,8 %**, plus aucun débordement.

**Règle à retenir, au-delà de ce cas** : un arbre de mesure détaché doit reproduire *tous* les
fournisseurs de contexte de l'arbre réel. C'est la deuxième occurrence après le `ReactFlowProvider`.
Et : une mesure verte obtenue sur un jeu de test qui n'exerce pas la donnée ne prouve rien — c'est
la règle 2 du C11, tombée ici en grandeur nature.

### 1.4 Le C12 n'a aucune ligne de code

La table de propriétés de blocs (`priority`, `minWidth`, `aspect`, `density`, `splittable`,
`affinity`) n'existe pas. Ce qui a été livré depuis en tient lieu, mais **éparpillé sur quatre
tables partielles** dans `adaptivePagination.js` : `MODULE_META`, `FULL_WIDTH_MODULES`,
`MODULE_GROUPS`, `ALWAYS_ISOLATE` — plus `TEMPLATE_SECTIONS.byFormat` ailleurs. C'est déjà le
début de la divergence que le C12 cherchait à éviter.

---

## 2. L'ordre d'attaque, et pourquoi

Le principe qui commande tout : **ne pas corriger à la main ce que le système doit corriger.** Une
revue template par template menée AVANT les lots structurels produirait des rustines que les lots
suivants effaceraient.

D'où : la revue sert d'abord à **produire l'inventaire**, la correction vient du système.

### Lot 0 — Sortir l'éditeur du rendu · effort faible, effet immédiatement visible

Une règle, pas trois correctifs : **un rendu figé ou public n'affiche aucun contrôle de saisie.**

- `GraphCanvasShell` reçoit un mode lecture : pas de `Controls`, pas de `MiniMap`, attribution
  React Flow masquée (`proOptions.hideAttribution`).
- Un bloc sans donnée ne se rend pas du tout (le « 0/1 · Pas de données » occupe une section
  entière pour dire qu'elle est vide).
- Les champs bruts en tête de fiche (« RAFOU. », « draft ») : à tracer jusqu'à leur source — non
  sondé à ce stade, c'est le premier point à mesurer du lot.
- **Garde-fou durable** : une règle d'audit qui échoue si un rendu contient un contrôle interactif
  de saisie (bouton, input, slider). Sans elle, il y aura une quatrième occurrence.

### Lot 1 — La table de propriétés des blocs (C12-1) · fondation de tout le reste

Une seule table, à côté de `fieldRegistry.js`, qui **absorbe** les quatre tables partielles
existantes plutôt que de s'y ajouter. Chaque bloc déclare : `group`, `fullWidth`, `splittable`,
`minWidth`, `aspect`, `priority`.

Sortie vérifiable : un test qui échoue si un bloc rendu par un template n'y figure pas. C'est ce
test qui empêche la 7e occurrence du vocabulaire deviné.

Aucun changement de mise en page dans ce lot — uniquement la déclaration.

### Lot 2 — Blocs sécables (C12-3) · c'est ce qui débloque le remplissage

Cause **unique** des pages à 17 %, 47 %, 52 % du relevé actuel. Les pipelines savent déjà se
couper en tronçons ; il faut l'étendre aux grosses sections (gisements, notations, cannabinoïdes,
grille labo). Tant que ce lot n'est pas fait, tout réglage de constante est du bruit — mesuré trois
fois cette semaine.

Sortie : aucune page sous 65 %.

### Lot 3 — Composition par format (C12-2)

Dériver le nombre de colonnes et la disposition de `minWidth`/`aspect` au lieu des exceptions
`byFormat` écrites à la main. C'est ici que naît la vraie différence entre un 16:9 et un 9:16, au
lieu d'étirer la même pile.

### Lot 4 — Unifier le rendu de pipeline de l'écran · bien plus petit qu'annoncé

`ReviewFullDisplay.jsx` consomme déjà le registre, les icônes, le radar, les statistiques et les
canevas (§1.1). Il ne reste qu'à remplacer `InteractivePipelineViewer` par le composant du fichier,
et à supprimer `InteractiveReviewCard.jsx`, confirmé mort.

La séparation Écran/Fichier actée au C10 reste — ce sont les **sources** qui s'unifient, pas les
surfaces.

### Lot 5 — Templates = jeux de préférences (C12-4) puis vérification combinatoire (C12-5)

`TEMPLATE_SECTIONS` et les exceptions `byFormat` disparaissent au profit de biais de priorité. Le
harnais tire N sous-ensembles de `contentModules` au hasard et vérifie les invariants : 0
débordement, 0 page vide, 0 police sous le plancher.

---

## 3. Revue des templates — méthode

Pas une revue à l'œil, template par template, corrigée à la main. Une **grille commune**, appliquée
aux 5, dont le résultat alimente la table du lot 1 :

| Critère | Comment il se mesure |
|---|---|
| Blocs rendus | inventaire des `data-module` réellement posés |
| Blocs manquants | comparaison à `fieldRegistry` + `getOverflowFields` |
| Doublons | même clé rendue par deux chemins |
| Formats déclarés vs tenables | remplissage mesuré par ratio |
| Affordances d'éditeur | règle d'audit du lot 0 |
| Sources uniques consommées | grep : registre, icônes, colonnes, grille |

État connu à ce jour, mesuré : **Moderne Compact** et **Story** sont les plus sains (0 erreur, 96-98 %
de remplissage) ; **Article de Blog** a une dernière page à 17,3 % en 16:9 et trois pages sous 62 %
en A4 ; **Traçabilité** a une première page à 17,4 % ; **Fiche Technique** est désormais propre en
A4 et 4:3, encore à 52,8 % en 16:9.

---

## 4. Ce que je recommande de faire en premier

**Lot 0, puis Lot 1, puis Lot 2.** Dans cet ordre :

- le lot 0 se voit tout de suite sur la capture que vous venez d'envoyer, et pose le garde-fou qui
  évite la 4e récidive ;
- le lot 1 ne change rien visuellement mais conditionne tout le reste ;
- le lot 2 est celui qui supprime le défaut dominant du relevé (les pages à moitié vides).

Le lot 4 (l'ÉCRAN) est le plus coûteux et le plus transformateur. Il mérite d'être décidé
séparément, une fois les lots 0-2 livrés — pas emballé dans le même mouvement.

---

## 5. Points tranchés le 2026-08-07 (« oui à tout »)

1. **L'écran devient configurable** comme le fichier. Réduit au lot 4 ci-dessus, l'essentiel étant
   déjà en place.
2. **Champs bruts en tête de fiche** (« RAFOU. », « draft ») : sondé — **aucune clé de ce genre
   n'existe** dans une review Hash (les 120 clés racine ont été listées, cf.
   `tools/export-audit/keys-check.mjs`). Ce n'est donc pas du bookkeeping mais de la donnée saisie,
   affichée sans libellé lisible. **Il faut la review réelle** pour identifier le champ.
3. **Article de Blog en A4** : à retravailler, trois pages toutes sous 62 %.

## 6. État du lot 0 au 2026-08-07

| Point | État | Preuve |
|---|---|---|
| Contrôles React Flow hors du rendu | fait | minimap/boutons/attribution : 1/1/1 → **0/0/0** |
| Pipelines vides non rendus | fait | filtré dans `extractPipelines`, à la source |
| Règle E13 (affordance d'édition) | posée | ne détectait rien avant la réparation des fixtures |
| Fixtures qui exercent les canevas | fait | chaîne à 2 nœuds, canevas monté, 2 nœuds React Flow |
| Pagination adaptative avec canevas | **réparée** | `MemoryRouter` ; A4 108,2 % → 80,5/72,8 % |
| Champs bruts en tête de fiche | bloqué | review réelle nécessaire |
| Canevas qui coupe ses propres nœuds | ouvert | E4b : 343px de contenu dans 258px |
