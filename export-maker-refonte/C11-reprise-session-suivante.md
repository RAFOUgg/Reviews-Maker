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

## 1. État mesuré au 2026-08-06 (Fleur, densité dense)

| Template | Format | Pages | Erreurs | Remplissage |
|---|---|---|---|---|
| **Moderne Compact** | 1:1 / 16:9 / 9:16 | 1 | **0** | 98 / 97,8 / 96,7 % |
| **Story** | 1:1 / 9:16 | 1 | **0** | 89,7 / 95,1 % |
| Fiche Technique | 16:9 | 2 | 1 | 72,2 / **41,7** % |
| Fiche Technique | **A4** | 2 | 2 | **108,2** / 34,3 % ⚠ |
| Article de Blog | 16:9 | 6 | 2 | 72 / **61,7** / 77 / 78 / 70 / **17,3** % |
| Article de Blog | A4 | 3 | 3 | **61,3 / 56,6 / 54,1** % |
| Traçabilité | A4 | 3 | 1 | **17,4** / 98,1 % |

Commande pour reproduire :
```
node tools/export-audit/run.mjs --matrix --templates=… --ratios=… --types=flower --densities=dense
```
(nécessite les deux serveurs de dev lancés : `server-new` puis `client`)

---

## 2. Priorité 1 — Le débordement A4 de la Fiche Technique

**Le seul défaut qui PERD de la donnée.** 108,2 % = le contenu dépasse le bas de la page et se
fait couper à l'export. Tout le reste n'est que du vide, laid mais sans perte.

**Régression introduite** en passant l'A4 de 1 à 2 colonnes (commit `2f9ce905`, motivé par des
lignes de ~175 caractères, cible typographique 45-90). Avant : 80,5 %. Après : 108,2 %.

**Piste déjà éliminée par mesure** : durcir la marge de sécurité en multi-colonnes (facteur 0,78)
n'a eu **aucun effet** — chiffres identiques. Ce n'est donc PAS le budget de pagination.

**Piste à sonder ensuite** : un bloc individuellement plus haut qu'une page. Instrumenter
`computeAdaptivePages` pour rapporter la hauteur mesurée de chaque module, et comparer au budget.
Si un seul module dépasse, c'est la limite connue et il faut le rendre sécable — pas retoucher le
packer.

**Sortie attendue** : aucune page > 100 % sur toute la matrice.

---

## 3. Priorité 2 — Réorganiser la Fiche Technique

Demande utilisateur, captures à l'appui : *« la pagination n'a aucun sens, des infos sont en double
partout, espace vide énorme, il faut réorganiser les éléments »*.

Ce n'est **pas** un problème de calcul mais de structure — d'où l'échec prévisible de tout réglage
de constante. Le désordre explique probablement une partie des sous-remplissages du §1.

**Méthode imposée par l'expérience** : produire le plan de page **sur papier et le faire valider
par l'utilisateur AVANT d'écrire une ligne**. Quelles sections voisinent, lesquelles ne se séparent
jamais, quel ordre de lecture. Sans critère écrit, ça part en préférences subjectives.

À vérifier au passage : les données labo et « données supplémentaires » apparaissent en double sur
plusieurs pages (visible sur les captures du 2026-08-06).

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
