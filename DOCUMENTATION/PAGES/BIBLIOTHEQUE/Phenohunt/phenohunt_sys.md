# PhenoHunt — Vision & État réel

## État réel implémenté (vérifié 2026-06-19)

- **Accès** : route `/phenohunt` (`client/src/App.jsx:166`, page `client/src/pages/public/PhenoHuntPage.jsx`), accessible à tout utilisateur authentifié. La bibliothèque de cultivars (Producer only, voir [BIBLIOTHEQUE/INDEX.md](../INDEX.md)) a un onglet "Cultivars" (`CultivarsTab.jsx`) listant "Bibliothèque", "Projets PhenoHunt", "Arbres Généalogiques".
- **Canvas** : `UnifiedGeneticsCanvas.jsx` (lib **React Flow**), nœuds custom `CultivarNode.jsx`, arêtes custom `PhenoEdge.jsx`, plus `NodeContextMenu`/`EdgeContextMenu`/`NodeFormModal`/`EdgeFormModal`/`TreeToolbar`.
- **State** : store Zustand `client/src/store/useGeneticsStore.js` (trees, nodes, edges, sélection, modes vue/édition/création). ⚠️ Un second store `usePhenoHuntStore.js` (persistance localStorage) existe encore mais **n'est plus utilisé nulle part** dans le code — candidat à suppression.
- **Backend** : `server-new/routes/genetics.js` — CRUD complet sur arbres (`/api/genetics/trees`), nœuds (`/api/genetics/trees/:id/nodes`, `/api/genetics/nodes/:nodeId`), arêtes (`/api/genetics/trees/:id/edges`, `/api/genetics/edges/:edgeId`). Partage public via `shareCode`.
- **Schéma Prisma** : `GeneticTree` (l.1386-1410), `GenNode` (l.1413-1443, position JSON pour React Flow, `genetics` JSON, `cultivarId` optionnel), `GenEdge` (l.1446-1470, `relationshipType` : parent/pollen_donor/sibling/clone/mutation), `Cultivar` (l.528-560, bibliothèque indépendante des arbres).
- **Lien avec les reviews** : `FlowerReview.geneticTreeId` relie une review Fleur à un arbre. Le code legacy (`CanevasPhenoHunt.jsx`, `GenealogyCanvas.jsx`, `GeneticsLibraryCanvas.jsx`) a été supprimé du repo (confirmé absent, ne reste que dans des scripts de migration `scripts/refactor-complete.js`).

## Vision / notes de conception (pas encore entièrement vérifiées comme implémentées)

> Notes originales conservées ci-dessous — certains points (onglets horizontaux par type de produit dans la bibliothèque, duplication de phénotype par clic droit avec import direct dans un arbre, split-screen jusqu'à 4 arbres) n'ont pas été confirmés comme implémentés lors de l'audit du code réel. À vérifier/distinguer avant de les considérer comme acquis.

Vu depuis bibliothèque :
Page library de l'utilisateur à revoir pour meilleur introduction des données sauvegarables. (Cf library-refonte.md)

Container horizontal : Onglet :
- Fleur
 - Donnée et prereglages pipeline culture, curing
- PhenoHunt
 - Arbre et groupes
- Hash
 - Donnée et prereglages pipeline séparation, curing
- Concentré
 - Donnée et prereglages pipeline extraction, curing
- Comestible
 - Donnée et prereglages pipeline recettes, consommation

Chaque fiche technique séparée

La bibliothèque de phénohunt est tout bonnement le même système que le phenohunt section 2 type fleur :

Volet lateral a gauche avec les projets/arbres/phénotypes/données.
Et à droite le canva avec systems d'onglet fenêtre pour les arbres ouverts, capable d'être mis dans les coins ou sous forme d'écran scindé pour visualiser jusqu'à 4 arbres en même temps.

Depuis la bibliothèque on peut, en faisant clic droit, dupliquer le phénotype -> importer directement à un arbre existant et cela définit directement le code phénotype à partir de celui dupliqué. En faisant ça, l'utilisateur passe automatiquement de la bibliothèque à la modification de la duplication d'une fiche technique existante. Directement section 2, avec le phénotype pré-importé dans l'arbre contenant le phénotype dupliqué initialement.

## Fichiers référence

- Frontend : `client/src/components/genetics/UnifiedGeneticsCanvas.jsx`, `client/src/store/useGeneticsStore.js`
- Backend : `server-new/routes/genetics.js`, `server-new/routes/cultivars.js`
- Schéma : `server-new/prisma/schema.prisma` (`GeneticTree`, `GenNode`, `GenEdge`, `Cultivar`)
