# C9 — Plan de refonte Export Maker, sur plusieurs semaines

> Établi le 2026-08-06 à partir du relevé de défauts de l'utilisateur, et vérifié dans le code
> avant rédaction (composants réels identifiés, pas supposés).

---

## 0. Le principe de séquencement — à lire avant tout

L'ordre ci-dessous n'est pas une liste de souhaits rangée par envie. Il est contraint par **une
dépendance dure** :

> **Remplacer un composant de rendu change sa hauteur. Changer une hauteur invalide toute la
> pagination calée dessus.**

Or l'utilisateur demande à la fois de remplacer les pipelines et les canevas par leurs vrais
composants, ET d'améliorer la pagination. **Paginer d'abord serait du travail jeté.** Le lot A vient
donc en premier, et le lot B ensuite — jamais l'inverse.

Deuxième dépendance, du même ordre : **on ne peut pas câbler l'activation des contenus (lot F) tant
que la liste des contenus n'est pas stable** (lot E). L'utilisateur l'a d'ailleurs formulé lui-même
— « une fois ce système fait, revois ensuite la liaison ».

Chaque lot se termine par une mesure. Un lot dont le critère de sortie n'est pas atteint ne libère
pas le suivant.

---

## Lot A — Réutiliser les vrais composants (semaines 1-2)

**Le défaut de fond, et la demande la plus ancienne de l'utilisateur** : « depuis le temps que je
demande à ce que ce soit la pipeline githubgridview qui soit utilisée en read only » et « pour les
canva il faudrait utiliser le même design que celui que les pro ont dans l'appli ».

Le rendu affiche aujourd'hui des **imitations** des composants de saisie, pas les composants
eux-mêmes. C'est la source d'un écart visuel permanent, et de la dérive documentée dans ce repo
(sept bugs de vocabulaire réinventé).

| Aujourd'hui (imitation) | Le vrai composant | Verrou à lever |
|---|---|---|
| `PipelineMiniGrid.jsx` | `PipelineGridView.jsx` + `PipelineGridView.css` | Aucun verrou identifié — à confirmer par lecture |
| `ReadOnlyProductionChainCanvas.jsx` | `ProductionChainCanvas.jsx` (`readOnly` déjà présent) | Consomme le **store Zustand global** |
| `ReadOnlyGenealogyCanvas.jsx` | `UnifiedGeneticsCanvas.jsx` (`readOnly` déjà présent) | Idem |

### A1 — Rendre les stores instanciables
Le vrai blocage. `useProductionChainStore()` / `useGeneticsStore()` sont des singletons : deux
canevas sur une même page (page de lignée, galerie) se marchent dessus. À convertir en fabrique
d'instances fournie par contexte, avec repli sur l'instance globale pour les appelants d'édition
existants.
**Risque élevé** : touche les canevas d'ÉDITION PhenoHunt et Chaîne de production, qui sont des
fonctionnalités majeures et hors Export Maker.
*Sortie* : deux canevas montés simultanément, états indépendants, édition PhenoHunt et Chaîne
non régressées (parcours de test manuel documenté).

### A2 — Basculer sur les vrais canevas
Suppression des deux `ReadOnly*Canvas`. Les canevas réels en `readOnly`, avec leur design de l'app.
*Sortie* : le canevas de chaîne du rendu est visuellement identique à celui du formulaire —
comparaison de captures côte à côte.

### A3 — Basculer sur la vraie grille de pipeline

> **Blocage identifié le 2026-08-06, avant implémentation.** `PipelineGridView` a bien un prop
> `readonly` — mais il rend ses cellules dans une grille **virtualisée** (`react-window`), c'est-à-dire
> une fenêtre de hauteur fixe à défilement interne qui ne monte que les lignes visibles.
>
> Parfait pour éditer une culture de 90 jours. **Inutilisable tel quel pour un export** : la capture
> ne verrait que les premières lignes et perdrait silencieusement le reste — le mode de défaillance
> le plus coûteux de ce projet.
>
> **Solution retenue** : donner au composant un mode `staticRender` qui contourne `RVGrid` et pose
> toutes les cellules dans une grille CSS simple, **les deux chemins partageant le même rendu de
> cellule** (fonction `renderCell` extraite). La grille de l'export devient alors celle des
> formulaires au pixel près, et non une imitation — c'est exactement la demande.
>
> **Précaution** : ce composant sert les formulaires d'édition réels. L'extraction doit être faite
> à iso-rendu, avec vérification du parcours de saisie avant/après, pas glissée dans une passe
> d'export.
>
> Deux affordances d'édition sont par ailleurs à masquer en lecture seule : le curseur de zoom et
> le bouton « + » d'ajout de cases (ce dernier est déjà gardé par `!readonly`).

`PipelineGridView` en lecture seule, avec le vocabulaire d'interaction déjà acté (C8 §3) :
infobulle au survol, modale au clic au-delà de 6 mesures.
**Contrainte non négociable** (C8 §1) : la projection statique. Une grille dont la donnée n'est
accessible qu'au clic est un bug d'export.
*Sortie* : grille identique à celle du formulaire ; PNG exporté contenant toute la donnée.

### A4 — Re-calibrage
Les hauteurs ont changé : re-mesurer toute la matrice et réajuster les budgets.
*Sortie* : aucune régression de débordement sur les 5 templates.

---

## Lot A-bis — Chaînes de production reliées entre reviews (semaines 2-3)

**Fonctionnalité demandée le 2026-08-06, non prévue jusqu'ici.** Afficher deux produits liés avec
**leurs chaînes de production qui se rejoignent** — pas deux chaînes côte à côte, une seule chaîne
continue traversant les deux produits.

### Pourquoi cela rend le lot A1 obligatoire
`/r/:id/lineage` empile déjà N fiches complètes, chacune portant son propre canevas. Plusieurs
canevas coexistent donc **déjà**, et c'est exactement pour cela que les copies à mémoire locale
avaient été écrites. Une chaîne fusionnée n'est pas rattrapable avec une mémoire partagée unique :
le scoping des stores cesse d'être une option d'hygiène pour devenir un prérequis fonctionnel.

### La donnée nécessaire existe déjà — rien à inventer
| Brique | Ce qu'elle apporte |
|---|---|
| `sourceLineage` (JSON sur Hash/Concentré/Comestible) | Quelle review provient de quelle(s) autre(s) |
| `ChainNode.reviewType` + `reviewId` | Un nœud de chaîne désigne une review précise |
| `GET /api/reviews/:id/lineage` | Remonte déjà la chaîne ascendante, avec garde anti-cycle et contrôle d'accès par nœud |

Le point de jonction est donc **déductible** : là où la chaîne du produit aval porte un nœud
référençant la review amont, on raccorde la sortie de la chaîne amont.

### A-bis-1 — Modèle de fusion
Définir la règle de raccordement (quel nœud de sortie vers quel nœud d'entrée), le comportement
quand un maillon est inaccessible (déjà géré en placeholder côté API), et celui quand une review
amont n'a **pas** de chaîne.
*Sortie* : règle écrite et validée avant code.

### A-bis-2 — Graphe fusionné
Construire un graphe unique à partir de N chaînes : préfixage des identifiants de nœuds par review
(deux chaînes peuvent avoir des ids identiques), arêtes de jonction, disposition par produit
(bandes ou couleurs distinguant à qui appartient chaque segment).
*Sortie* : une chaîne à 3 niveaux (Fleur → Hash → Concentré) rendue comme un seul graphe continu.

### A-bis-3 — Intégration au rendu
Où l'afficher : sur `/r/:id/lineage` en remplacement des canevas isolés, et en option dans le
Rapport de Traçabilité — c'est précisément son objet.
*Sortie* : vérifié sur une chaîne réelle à 3 niveaux, et sur PNG exporté.

**Risque propre** : une chaîne fusionnée est bien plus large qu'une chaîne seule. Sa hauteur et sa
largeur rendues conditionnent la pagination — d'où sa place **avant** le lot B, pas après.

---

## Lot B — Pagination universelle (semaine 3)

**Bug 1 signalé** : le bouton ne fait rien, et il est absent pour Story et Traçabilité. Cause
identifiée : `TEMPLATE_PAGINATION` déclare `socialStory: false` et `traceabilityReport: false`.
L'utilisateur tranche : **le Rapport de Traçabilité doit obligatoirement être paginé.**

### B1 — Politique de pagination par template
| Template | Pagination | Motif |
|---|---|---|
| Moderne Compact | non | carte unique — confirmé par l'utilisateur |
| Story Social Media | **oui** | à activer |
| Fiche Technique | oui | déjà |
| Article de Blog | oui | déjà |
| Rapport de Traçabilité | **oui, obligatoire** | document, non désactivable |

### B2 — Rendre le basculement effectif
Le toggle doit produire un effet visible et immédiat sur les 4 templates paginables, et être
absent (pas inerte) sur Moderne Compact.
*Sortie* : pour chaque template paginable, activer/désactiver change réellement le nombre de pages ;
vérifié sur export réel, pas sur l'aperçu.

### B3 — Extension de la pagination adaptative
`socialStory` et `traceabilityReport` entrent dans `ADAPTIVE_TEMPLATES` : `data-module` sur leurs
blocs, entrées `MODULE_META`, budgets calibrés.
*Sortie* : 0 page coupée, 0 page sous 65 %, sur 4 types × 3 densités × formats autorisés.

---

## Lot C — Composition et densité (semaines 4-5)

**Défauts signalés** : « Fiche technique détaillée est bordélique », « moins d'espace vide
partouuuut », Moderne Compact paysage et portrait « encore pire » que le carré, notes de goûts à
agrandir.

### C1 — Plan de composition de la Fiche Technique
Le problème n'est pas le remplissage mais **l'ordre et le regroupement**. À produire d'abord sur
papier : quelles sections voisinent, lesquelles ne doivent jamais être séparées, quel est l'ordre
de lecture. Puis traduire en contraintes de pagination (groupes insécables, affinités).
*Sortie* : un plan de page validé par l'utilisateur AVANT implémentation.

### C2 — Hiérarchie typographique des notes
Les notes objectives (goûts, arômes, effets) sont rendues à la même échelle que le texte courant.
Elles sont pourtant la donnée principale d'une review.
*Sortie* : les notes lisibles à distance de bras sur un export 1:1.

### C3 — Moderne Compact paysage et portrait
Le carré est réussi ; les deux autres formats ne le sont pas. Composition propre à chacun —
`FORMAT_LAYOUT` existe déjà pour porter ces différences.
*Sortie* : ≥ 90 % de remplissage sur les 3 formats, validé à l'œil et pas seulement à la règle E6.

---

## Lot D — Configuration (semaine 6)

### D1 — Thèmes et colorimétrie
Les 7 palettes actuelles sont des jeux de 4-5 couleurs. À approfondir : palettes complètes
(surfaces, filets, états sémantiques), mode clair/sombre par palette, aperçu réel dans le
sélecteur.

### D2 — Gestion des médias
Aujourd'hui : choix de la photo principale et bascule galerie. À étendre à **tous** les médias, y
compris ceux portés par les canevas et les pipelines (photos d'étape) — actuellement invisibles
depuis la configuration.
*Sortie* : un inventaire de tous les médias d'une review, chacun affichable ou non.

### D3 — Typographie
Les 10 polices proposées dans l'onglet ne sont pas chargées (gap connu depuis le 2026-07-30, jamais
corrigé) ; seules Inter, Space Grotesk et JetBrains Mono le sont. Soit on charge les 10, soit on
réduit la liste à ce qui existe — mais pas d'option qui ne fait rien.

---

## Lot E — Contenus évolutifs (semaine 7)

**La demande structurante**, et déjà la « plus grande fragilité architecturale » selon `CLAUDE.md` :
si on ajoute une méthode, un instrument ou un produit aux réponses possibles d'un formulaire,
Export Maker doit le récupérer **automatiquement**.

L'existant : `getOverflowFields()` rattrape les *clés* de champ inconnues. Il ne rattrape pas les
nouvelles *valeurs* d'un champ existant (nouvelle méthode d'extraction, nouvel instrument), qui
s'affichent alors en identifiant brut — le défaut déjà corrigé au cas par cas avec `noteEmoji.js`.

### E1 — Inventaire des sources de valeurs
`extractionMethods.js`, `separationMethods.js`, `curingMethods.js`, `purificationMethods.js`,
`cultureMethods.js`, `aromasWheel.js`, `effects.js`, `tasteNotes.js`, `odorNotes.js`,
`terpenes.js`… — recenser lesquelles alimentent réellement les formulaires.

### E2 — Résolution générique valeur → libellé + icône
Généraliser `noteEmoji.js` à toutes ces sources : une valeur enregistrée trouve son libellé humain
et son icône, quelle que soit la table d'origine, sans câblage par champ.
*Sortie* : ajouter une entrée à une table la rend affichable dans les 5 templates sans toucher au
rendu. **Vérifié par un test qui ajoute une valeur factice.**

### E3 — Détection des valeurs orphelines
Une valeur enregistrée qu'aucune table ne connaît doit être signalée en développement, pas
silencieusement dégradée.

---

## Lot F — Câblage des contenus (semaine 8)

Ne peut commencer qu'après E : câbler l'activation sur une liste instable serait à refaire.

- Revue de `contentModules` pour les 4 types × 5 templates : quelles clés existent, lesquelles sont
  réellement lues, lesquelles sont mortes.
- Cohérence de la sémantique : aujourd'hui une clé absente de `contentModules` est traitée comme
  **active** (opt-out) — ce qui a déjà causé 13 champs échappant au filtrage par page.
- *Sortie* : chaque bascule de l'onglet Contenu produit un effet visible sur chaque template où le
  champ est pertinent, et aucune bascule n'est inerte.

---

## Risques, nommés

| Risque | Lot | Parade |
|---|---|---|
| Le scoping des stores casse l'édition PhenoHunt/Chaîne | A1 | Repli sur l'instance globale ; parcours de test manuel avant/après |
| Les vrais composants sont plus lourds → pagination à refaire | A4 | C'est prévu, d'où l'ordre A avant B |
| La composition (C1) part en préférences subjectives | C1 | Plan validé sur papier avant code |
| Le lot E dérive en refonte du registre | E | Périmètre borné : résolution valeur→libellé, rien d'autre |
| Régression silencieuse à l'export | tous | Vérification sur PNG réellement téléchargé, jamais sur l'aperçu |

---

## Ce que ce plan ne contient pas

- Reprise de `ExportMaker.jsx` (moteur legacy, 8 tests + dashboard QA).
- Dernière page de la Fiche Technique à 45,7 % — sera traitée dans le lot C, pas isolément.
- Rapprochement cross-auteur du même lot physique : hors périmètre, décision de scope déjà actée.
