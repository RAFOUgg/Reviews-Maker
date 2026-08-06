# C11 — Reprise : à lire en premier dans la prochaine session

> Écrit le 2026-08-06 en fin de session, capacité de contexte épuisée. Tout ce qui suit est
> **mesuré**, pas supposé. Les chiffres viennent du harnais d'audit, pas d'une impression.

---

## 0. Comment travailler sur ce chantier — les 5 règles qui ont fait la différence

Elles ont toutes été payées en heures perdues. Les ignorer les fera repayer.

1. **Sonder, jamais inférer.** Trois tentatives d'affilée ont échoué sur `FitToFill` par déduction
   depuis le remplissage. Une sonde exposant l'état réel dans le DOM a donné la cause en UNE mesure.
   Même histoire pour les contrastes : tant que l'auditeur ne rapportait qu'un sélecteur (« div »),
   deux corrections ont visé le mauvais élément. Devant l'inexpliqué : instrumenter.
2. **Une mesure inchangée ne prouve rien si le jeu de test ne contient pas la donnée.** Les
   fixtures d'audit n'ont NI chaîne de production NI arbre généalogique. Une régression qui a fait
   disparaître les deux canevas est passée en production avec des métriques « inchangées ».
   → **Première tâche recommandée** : ajouter une chaîne et un arbre aux fixtures.
3. **Retirer ce qui n'a pas d'effet mesuré.** Six corrections de cette session se sont révélées
   inertes ; toutes ont été retirées. Un commentaire qui affirme plus que la mesure est un piège
   pour la session suivante.
4. **Vérifier au clic avant de déployer ce qui touche l'édition.** Le build et 82 tests ne prouvent
   pas qu'un graphe s'édite encore.
5. **Le vocabulaire deviné est LE bug récurrent de ce repo — 8 occurrences documentées.** Ne jamais
   écrire un nom de champ « qui semble correct » : le vérifier dans `fieldRegistry.js`,
   `extractPipelines()`, `DEFAULT_CONFIG.contentModules` ou la table de données concernée.

---

## 1. État mesuré au 2026-08-06, APRÈS la passe débordement (Fleur, densité dense)

| Template | Format | Pages | Erreurs | Remplissage |
|---|---|---|---|---|
| **Moderne Compact** | 1:1 / 16:9 / 9:16 | 1 | 1 / **0** / **0** | 98 / 97,8 / 96,7 % |
| **Story** | 1:1 / 9:16 | 1 | **0** | 89,7 / 95,1 % |
| Fiche Technique | 16:9 | 3 | 2 | **52,8** / 71,4 / **57,6** % |
| **Fiche Technique** | **4:3** | 2 | **0** | 69,6 / 74,7 % |
| **Fiche Technique** | **A4** | 2 | **0** | 80,5 / 66,5 % |
| Article de Blog | 16:9 | 6 | 2 | 72 / **61,7** / 77 / 78 / 70 / **17,3** % |
| Article de Blog | A4 | 3 | 3 | **61,3 / 56,6 / 54,1** % |
| Traçabilité | A4 | 3 | 1 | **17,4** / 98,1 % |

Fiche Technique sur les 3 autres types (dense) : Hash 16:9 52,8/59,7/61,3 · **4:3 72,5/75,9, 0
erreur** · A4 80,5/63,4 — Concentré 16:9 52,8/53,6/61,3 · **4:3 67/75,9, 0 erreur** · A4
80,5/62,4 — Comestible 16:9 52,4 · 4:3 47,1.

**Plus AUCUNE page au-dessus de 100 % sur toute la matrice** (5 templates × 5 formats × 4 types).
Toutes les erreurs restantes sont des sous-remplissages, sauf une : Moderne Compact 1:1 a un
conteneur interne coupé (335px dans 307px), défaut **antérieur** à cette passe — vérifié en
remesurant sur le code d'avant, chiffres identiques.

Commande pour reproduire :
```
node tools/export-audit/run.mjs --matrix --templates=… --ratios=… --types=flower --densities=dense
```
(nécessite les deux serveurs de dev lancés : `server-new` puis `client`)

---

## 2. Priorité 1 — Le débordement A4 de la Fiche Technique — **RÉGLÉ le 2026-08-06**

Sortie obtenue : aucune page > 100 % sur toute la matrice. A4 : 108,2 % → 80,5 / 66,5 %, 0 erreur.

La sonde recommandée a été posée (`publishProbe`, `adaptivePagination.js`, relayée par
`run.mjs`) : elle publie le budget appliqué, la hauteur mesurée et le coût de chaque module. Elle a
donné la cause en une mesure, comme prévu — et l'a donnée **quatre fois de suite**, chaque
correction en découvrant une autre derrière. Ce n'était pas un défaut mais cinq, empilés :

1. **Le budget ignorait les blocs pleine largeur.** Le budget vaut « hauteur de page × colonnes »,
   ce qui suppose que tout coule dans les colonnes. Le masthead, lui, est rendu AU-DESSUS du flux :
   ses 1948px amputent les DEUX colonnes, soit 3896px de budget, pas 1948. Le packer le croyait à
   45 % d'un budget de 4387 et lui adjoignait « Évaluation sensorielle ». → `FULL_WIDTH_MODULES`.
2. **Les pipelines n'étaient plus rendus du tout, sur aucune page paginée.** Le filtre de page
   n'acceptait que les identifiants à tronçons `pipeline:<clé>#N`, alors que la grille — le rendu
   PAR DÉFAUT depuis le 2026-08-05 — pose un bloc unique `pipeline:<clé>`. Le paginateur réservait
   la place, le rendu supprimait le contenu. Personne ne le signalait : une page plus vide ne
   déclenche qu'un avertissement de remplissage. **6e occurrence du bug de vocabulaire deviné.**
3. **Le graphique de culture était calculé sur la pleine largeur du canevas** et se superposait à
   la colonne voisine. Invisible à la mesure de hauteur ; vu sur un PNG réellement exporté.
4. **La grille de pipeline coupait son propre contenu**, barre de défilement rasterisée dans le
   PNG : des cases carrées de 47px pour un contenu qui en demande 78, dans une colonne de demi-page.
   Le nombre de colonnes était fixé à 14 ; il est maintenant dérivé de la largeur (`auto-fit`).
5. **Tous les pipelines étaient enfermés dans UNE `Section` insécable.** Le paginateur les comptait
   séparément (363 + 515) et les croyait répartissables ; le rendu en faisait un bloc de 930px.
   Résultat mesuré en 16:9 : colonne gauche à 451px, colonne droite à 1167px sur une page de 1032.

Le modèle de budget a été refait en conséquence : il **simule le remplissage colonne par colonne**
au lieu de comparer une somme de hauteurs à une capacité globale. Une somme qui tient dans le
budget ne garantit rien quand les blocs sont insécables — mesuré : 1789 sur 1899, rendu à 108,1 %.

La marge de sécurité (`BUDGET_SAFETY_FACTOR`) n'a PAS été touchée : elle n'était pas en cause,
exactement comme la mesure précédente le disait déjà.

**Coût assumé** : la Fiche Technique 16:9 passe de 2 pages (dont une coupée) à 3 pages plus vides.
Conforme à la préférence déjà actée — une fiche plus longue plutôt que la moindre perte.

Deux règles d'audit ont été ajoutées, parce qu'aucune ne voyait ces défauts :
- **E4b** — conteneur INTERNE qui coupe son contenu (E4 ne regardait que la page). C'est elle qui a
  nommé le conteneur fautif de la grille, après deux corrections ratées à côté.
- **Position des modules** dans le rapport (`top`/`bottom`/`left`) : sans la colonne où un bloc
  atterrit, un débordement en multi-colonnes ne se diagnostique pas.
- Corrigé au passage : E1 jugeait le contraste des emoji, rendus par la police couleur du système
  et donc insensibles à `color` — 75 fausses violations qui envoyaient corriger une couleur sans
  effet possible. Et `bg` était rapporté « [object Object] », c'est-à-dire inutilisable.

---

## 3. Priorité 2 — Réorganiser la Fiche Technique — **plan validé et appliqué le 2026-08-07**

Plan de page validé par l'utilisateur avant écriture, comme la méthode l'exigeait :

| Groupe | Blocs |
|---|---|
| **identité** | masthead · évaluation sensorielle · empreinte sensorielle (radar) |
| **chimie** | profil cannabinoïde · profil aromatique · données labo & curing |
| **production** | commentaire · statistiques de culture · pipelines · généalogie · chaîne |
| **annexe** | caractéristiques détaillées · gisements génériques |

Deux mécanismes, et un seul déplacement de code :

1. **L'ordre du JSX EST l'ordre de lecture**, le paginateur étant séquentiel. Seul le radar a
   bougé : il vivait après le profil cannabinoïde, séquelle du découpage du 2026-08-04 qui l'avait
   extrait de ce bloc. Il est désormais collé à l'évaluation sensorielle qu'il résume.
2. **`MODULE_GROUPS`** (`adaptivePagination.js`) déclare le groupe de chaque bloc, et le packer
   **préfère** couper à une frontière de groupe. Ce n'est PAS un gabarit : le nombre de pages reste
   décidé par la mesure. Deux garde-fous, chacun posé après une mesure qui l'a rendu nécessaire :
   - on ne coupe que si la page est déjà remplie à 62 % — sinon on troque un défaut de structure
     contre un défaut de remplissage, qui est le défaut dominant ;
   - et seulement si le groupe qui commence pèse au moins 35 % d'une page. Sans ça, les 146px de
     « Caractéristiques détaillées » chassaient une page entière à eux seuls (A4 : 2 pages à
     80,5/66,5 % → 3 pages à 80,5/41,8/30,6 %).
   Le seuil se calcule sur le budget NOMINAL, jamais sur le budget exploratoire de la dichotomie de
   rééquilibrage — l'y indexer faisait dériver les coupures à chaque itération.

**Effet mesuré** (Fleur dense) : 4:3 passe de 3 pages avec 1 erreur à **2 pages, 69,6/74,7 %, 0
erreur** ; A4 reste à 80,5/66,5 %, 0 erreur ; 16:9 reste à 3 pages, page 1 remontée de 47,6 à
52,8 %. Hash et Concentré en 4:3 passent aussi à 0 erreur. Aucun autre template n'est touché
(Article de Blog, Story, Moderne Compact, Traçabilité : chiffres strictement identiques).

**Non traité, faute de cas reproductible** : les doublons labo / « données supplémentaires » vus
sur vos captures du 2026-08-06 ne se reproduisent pas sur les fixtures d'audit. Il faut la review
réelle concernée pour les voir.

---

## 4. Priorité 3 — Les sous-remplissages

Article de Blog (17,3 % en fin de 16:9), Traçabilité (17,4 % en première page A4), Fiche Technique
(41,7 %). Même cause unique : **les blocs sont indivisibles**, le packer ne peut pas mieux répartir.

Un rééquilibrage par dichotomie est déjà en place (`computeAdaptivePages`) — il a fait passer une
dernière page de 30,1 à 45,7 %. Aller plus loin demande de rendre les grosses sections **sécables**,
pas d'affiner le packer.

⚠ Toute tentative de fusionner une page trop vide avec sa voisine risque de réintroduire du
débordement. Le projet a acté qu'**une fiche plus longue vaut mieux que la moindre perte de
contenu**.

---

## 5. Chantiers ouverts, non commencés

- **Article de Blog n'utilise pas la grille de cellules.** Tentative du 2026-08-06 : porter la
  grille dans le composant partagé `PipelineTimeline` a fait que Blog et Fiche Technique ne
  montaient **plus aucune page** (4 erreurs JS). Retirée. À reprendre par diagnostic : probablement
  un contexte manquant dans l'arbre de mesure hors-écran — même famille de cause que le
  `ReactFlowProvider` oublié le même jour.
- **Chaînes de production reliées entre reviews** (plan C9, lot A-bis) : bandes séparées, une
  couleur par produit. La jonction se déduit **uniquement** des canevas (`ChainNode.reviewId`,
  `GenNode.sourceReviewId`), jamais de `sourceLineage` — décision explicite de l'utilisateur.
  Le socle est prêt : les stores sont instanciables depuis `scopedCanvasStores.jsx`.
- **Suppression des doublons `ReadOnly*Canvas`** : ils ne sont plus que des enveloppes autour des
  vrais canevas. À nettoyer.
- **`document.querySelector('.react-flow__viewport')` global** dans `ProductionChainCanvas` (export
  SVG) : viserait le mauvais canevas si plusieurs sont montés. À corriger **avant** les chaînes
  reliées, qui en montent plusieurs par construction.
- **Photos d'étape** : rendues en fond de cellule, mais **jamais vues** — aucune review de la base
  de développement ne porte de média. À confirmer sur une review réelle qui en a.
- **Interrupteur de pagination** : corrigé, mais `LiquidToggle` n'expose aucun état lisible par
  script — la bascule visuelle n'est pas prouvée par mesure.
- **`PipelineGridView` n'a plus aucune surface ÉDITABLE vivante.** Constaté en cherchant à honorer
  la règle 4 : la vue pipeline du formulaire (`PipelineDragDropView.jsx`) a sa propre grille et
  n'importe pas ce composant. Ses seuls consommateurs sont `PipelineMiniGrid` (export/galerie, en
  lecture seule) et `PipelineWithSidebar`, monté par la route de démonstration
  `/example-pipeline` — laquelle **plante** (4 erreurs JS, « Cannot convert undefined or null to
  object »), à l'identique sur le code d'avant cette session, donc antérieurement. `edit-check.mjs`
  outille cette vérification ; il faudra d'abord réparer ou retirer cette route.
- **Moderne Compact 1:1** : conteneur interne coupé de 28px (règle E4b, nouvelle). Antérieur.

---

## 6. Ce qui est acquis et ne doit pas être défait

- **La répartition des surfaces** (plan C10) : l'ÉCRAN (`/r/:id`, aperçu Studio) est la Vue
  Détaillée, fluide et interactive ; le FICHIER (PNG/PDF/SVG) reste les 5 templates à canevas fixe,
  seul endroit où pagination et calibrage ont un sens.
- **Les sources uniques**, chacune ayant remplacé plusieurs copies divergentes :
  `fieldRegistry.js` (champs), `fieldIcons.js` (icônes — a absorbé 5 tables concurrentes),
  `noteEmoji.js` (valeurs), `getTemplateColumns()` (colonnes), `PipelineGridView` (grille).
  Toute nouvelle table d'icônes ou de libellés à côté est une régression.
- **Le contrat de projection statique** : aucun composant ne passe en interactif tant que
  l'information révélée au clic n'est pas AUSSI présente dans le fichier exporté.
