# C10 — Le rendu cible existe déjà : la Vue Détaillée

> **Direction donnée par l'utilisateur le 2026-08-06**, en découvrant `/review/:id` :
> *« tu as capté comment je voulais que Export Maker fasse son rendu interactif HTML — seulement tu
> l'as fait en tant que vue détaillée dans la galerie publique. J'aimerais désormais que ce style de
> rendu soit utilisé pour Export Maker. »*

Ce document remplace la recherche d'un « style à inventer » : **le rendu cible est
`components/gallery/ReviewFullDisplay.jsx`**, servi par la route `/review/:id`.

---

## 1. Pourquoi cette page est la bonne référence

| | Vue Détaillée (`/review/:id`) | Rendus Export Maker |
|---|---|---|
| Mise en page | fluide, elle DÉFILE | canevas à taille fixe, rétréci au `transform: scale` |
| Composants | `LiquidCard`, `LiquidRating` — l'UI réelle de l'app | composants d'export à part |
| Pipelines | `InteractivePipelineViewer` — cellules cliquables | grille ou liste selon le template |
| Interaction | native, sans contrainte de capture | bridée par le contrat « un PNG ne se clique pas » |

Elle règle par construction ce que je cherchais à obtenir de biais : pas de mise à l'échelle, pas
de pagination, l'UI de l'app.

---

## 2. Ses manques, relevés par l'utilisateur

À corriger AVANT d'en faire la référence — sinon on généralise un rendu incomplet.

1. **Beaucoup de données de formulaire absentes** : le détail de toutes les notations, tous les
   goûts et odeurs, les analytiques.
   → **Cause identifiée** : `ReviewFullDisplay.jsx` n'utilise PAS `fieldRegistry.js`. Il assemble
   ses sections à la main, comme le faisaient les templates avant leur mise au registre. C'est
   exactement le défaut que `getOverflowFields()` avait éliminé côté export.
2. **Libellés d'étapes faux** — « Étape 1 » au lieu de « S1 »/« J1 ».
   → **Corrigé le 2026-08-06** : `getStepLabel` ne lisait pas `cellLabel`, le libellé réellement
   produit par `generateTimelineCells()`. Septième occurrence du même motif dans ce repo.
3. **Pas d'images dans les pipelines** — les photos d'étape ne sont pas rendues.
4. **Cellules trop petites** — à agrandir et à styler comme dans les formulaires : icônes de donnée
   superposées, effet de profondeur.

---

## 3. Ce que cela implique pour Export Maker

Deux surfaces, et il faut cesser de les confondre :

| Surface | Rôle | Conséquence |
|---|---|---|
| **Rendu à l'écran** (`/r/:id`, aperçu Studio, page de détail) | le produit vivant | adopte la Vue Détaillée : fluide, interactif, UI de l'app |
| **Export en fichier** (PNG/PDF/SVG) | l'artefact figé | garde les canevas à taille fixe et la pagination — un fichier a des dimensions, ce n'est pas négociable |

Le travail de calibrage (image élastique, pagination adaptative, densités par format) **reste
entièrement valable pour la seconde** et n'a pas de sens pour la première.

---

## 4. Ordre de travail

### C10-1 — Mettre la Vue Détaillée au registre
`ReviewFullDisplay` consomme `fieldRegistry.js` + `getOverflowFields()` au lieu de sa taxonomie
manuelle. C'est ce qui fait revenir les notations, goûts, odeurs et analytiques manquants — et ce
qui garantit qu'un futur champ de formulaire y apparaîtra seul.
*Sortie* : aucun champ rempli dans un formulaire n'est absent de la vue.

### C10-2 — Cellules de pipeline au niveau des formulaires
Agrandir, icônes superposées, effet de profondeur, photos d'étape rendues.
*Sortie* : une cellule de la vue est indiscernable d'une cellule de formulaire.

### C10-3 — Faire de la Vue Détaillée le rendu écran d'Export Maker
`/r/:id` et l'aperçu Studio basculent dessus. La configuration (contenus, couleurs, typo) doit la
piloter comme elle pilote les templates.
*Sortie* : le rendu écran et la vue publique sont le même composant.

### C10-4 — Les templates deviennent le mode FICHIER
Les 5 templates restent la sortie PNG/PDF. La pagination et le calibrage leur restent réservés.
*Sortie* : plus d'ambiguïté sur ce que chaque surface doit faire.

---

## 5. Ce qui devient caduc

- La recherche d'interactivité DANS les templates à canevas fixe (plan C8) : le rendu écran n'a
  plus à être un canevas. Le contrat de projection statique reste vrai pour le mode fichier.
- Le point ouvert « `/r/:id` illisible sur mobile » (C8 §4) : réglé par construction, la Vue
  Détaillée est fluide.
