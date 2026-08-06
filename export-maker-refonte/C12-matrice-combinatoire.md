# C12 — Organiser TOUTES les combinaisons : config × contenus × pagination × format

> Demande de l'utilisateur, 2026-08-06 : une organisation intelligente pour **toute** combinaison
> possible, y compris quand il n'utilise aucun template prédéfini ou qu'il en modifie un.

---

## 1. Le constat qui commande le reste

Comptons honnêtement l'espace à couvrir :

| Dimension | Cardinalité |
|---|---|
| Templates | 5 (+ « aucun / modifié » = **illimité**) |
| Formats | 5 ratios |
| Pagination | 2 états |
| Contenus | ~80 clés `contentModules` activables **indépendamment** |

Les trois premières font 50 cas. La quatrième, à elle seule, en fait **2⁸⁰**.

**Aucune matrice écrite à la main ne peut couvrir ça.** Ce n'est pas une opinion : ce projet a déjà
essayé, deux fois.

- `PAGE_TEMPLATES` — des gabarits de pages figés par type × ratio. Résultat documenté : des clés
  qui ne correspondaient à aucun contenu réel (`typeCulture`, `pipelineCuring`), des modules
  entiers absents de certains ratios, un pipeline Curing qui disparaissait silencieusement. Il a
  fallu les remplacer par la pagination adaptative.
- `TEMPLATE_SECTIONS.byFormat` — des exceptions écrites cas par cas. Ça tient pour 2 ou 3 cas
  (Compact 1:1, Story 1:1). Ça ne tient pas pour 50, encore moins pour l'espace complet.

> **La bonne réponse n'est pas une matrice, c'est un système de règles.** Un template cesse d'être
> une mise en page figée pour devenir un **jeu de préférences** que le moteur applique au contenu
> réellement présent, dans le format réellement choisi.

---

## 2. Le modèle : chaque bloc se décrit lui-même

Aujourd'hui, la mise en page est décidée **par le template**, qui suppose ce qu'il va recevoir.
D'où toutes les divergences quand la supposition est fausse.

Renversement : chaque bloc de contenu **déclare ses propres contraintes**, une fois, dans un seul
endroit. Le moteur compose ensuite.

| Propriété | Ce qu'elle dit | Exemple |
|---|---|---|
| `priority` | Ce qui part en premier quand la place manque | photo 100, note globale 95, données complémentaires 20 |
| `minWidth` | En dessous, le bloc devient illisible | un radar sous 220px n'a plus de libellés lisibles |
| `aspect` | Format qui lui va | radar → carré ; pipeline → large ; description → colonne étroite |
| `density` | Poids visuel par unité de surface | une grille de cannabinoïdes est dense, une photo ne l'est pas |
| `splittable` | Peut-il être coupé entre deux pages ? | un pipeline oui (par tronçons) ; un radar non |
| `affinity` | Voisins souhaitables | notes ↔ radar ; labo ↔ cannabinoïdes |

**Source unique obligatoire.** Ces propriétés vivent à côté de `fieldRegistry.js`, jamais dupliquées
dans un template. C'est la leçon des 5 tables d'icônes concurrentes et des 8 bugs de vocabulaire
deviné : toute table parallèle finit par diverger.

---

## 3. Ce que devient un template

Plus une mise en page. Un **jeu de préférences** :

```
{
  priorityBias:  { pipelines: -30, aromas: +20 },   // Story privilégie le glanceable
  densityTarget: 'low' | 'medium' | 'high',
  allowedFormats: ['9:16','1:1'],
  paginable: false,
  identity: { palette, typo }                        // déjà en place
}
```

Conséquence directe, et c'est ce que l'utilisateur demande : **« aucun template » et « template
modifié » cessent d'être des cas particuliers.** Ce sont simplement des jeux de préférences
différents. Le moteur ne fait aucune différence entre eux.

---

## 4. Le moteur, en trois étapes

1. **Sélection** — quels blocs ont réellement de la donnée ET sont activés dans `contentModules`.
   *Rien de nouveau : c'est ce que font déjà `isModuleOn` et `getOverflowFields`.*
2. **Composition** — répartir les blocs retenus dans la surface disponible, en respectant
   `minWidth`, `aspect` et les affinités. C'est ici que naît la différence réelle entre un 16:9
   (deux colonnes) et un 9:16 (une colonne haute) — au lieu d'étirer la même pile.
3. **Pagination** — si le mode fichier est actif, découper selon `splittable` et `priority`.
   *L'algorithme existe déjà (`computeAdaptivePages`) ; il gagne juste des blocs qui savent se
   couper, ce qui répond directement aux pages à 17 % du relevé actuel.*

L'aperçu **Écran** court-circuite l'étape 3 : le document défile, il n'a pas de budget de hauteur.

---

## 5. Ordre d'exécution

### C12-1 — Déclarer les propriétés des blocs
Sans code de mise en page : seulement la table, à côté du registre, et un test qui vérifie que tout
bloc rendu par un template y figure.
*Sortie* : couverture complète, aucun bloc orphelin.

### C12-2 — Composition par format
Remplacer les `byFormat` écrits à la main par la composition dérivée de `minWidth`/`aspect`.
*Sortie* : les 5 formats sur les 5 templates, ≥ 90 % de remplissage, 0 débordement.

### C12-3 — Blocs sécables
Donner `splittable` aux grosses sections (gisement, notations, cannabinoïdes) comme les pipelines
l'ont déjà. **C'est ce qui débloque les sous-remplissages** — cause unique identifiée au relevé du
2026-08-06.
*Sortie* : aucune page sous 65 %.

### C12-4 — Templates réduits à des préférences
`TEMPLATE_SECTIONS` et les exceptions `byFormat` disparaissent au profit des biais.
*Sortie* : modifier la config d'un template produit un résultat sensé sans code dédié.

### C12-5 — Vérification combinatoire
Le harnais tire au sort N sous-ensembles de `contentModules` et vérifie les invariants — pas
l'apparence : **0 débordement, 0 page vide, 0 police sous le plancher**.
*Sortie* : 200 combinaisons aléatoires sans violation.

---

## 6. Ce qu'il ne faut PAS faire

- **Écrire une mise en page par combinaison.** Déjà tenté deux fois, échoué deux fois.
- **Ajouter une exception `byFormat` de plus.** Chaque nouvelle est une dette : elle traite un cas
  et laisse les 49 autres.
- **Faire dépendre la composition du template.** C'est ce qui a produit les divergences actuelles.
  Elle doit dépendre du CONTENU et du FORMAT ; le template ne fait qu'incliner les priorités.

---

## 7. Prérequis, à traiter avant

Deux points du relevé du 2026-08-06 doivent être réglés d'abord — sinon on bâtirait sur du sable :

1. **Le débordement A4 de la Fiche Technique (108,2 %)** — du contenu est coupé. Voir C11 §2.
2. **Les fixtures d'audit sans chaîne ni arbre** — sans elles, la vérification combinatoire du
   C12-5 hériterait du même angle mort qui a laissé passer une régression en production.
