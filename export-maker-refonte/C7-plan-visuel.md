# C7 — Plan de refonte visuelle continue

> Objectif utilisateur : **« plus visuel, toujours moins d'espace vide »**.
> Établi le 2026-08-05, après la session qui a corrigé le routage de template et les images.

---

## 0. Les cinq leçons de méthode — à appliquer à chaque phase

Elles ont toutes été payées cher dans cette session. Les ignorer coûtera à nouveau des heures.

1. **Mesurer dans les conditions RÉELLES.** Mes fixtures avaient une image valide, la review de
   l'utilisateur avait des images cassées. J'annonçais 72–98 % de remplissage pendant qu'il voyait
   un tiers de carte. Nos deux mesures étaient justes, sur deux réalités différentes.
   → Toute mesure doit être doublée d'une vérification sur une review réelle.

2. **Sonder plutôt qu'inférer.** `FitToFill` est resté inerte pendant trois tours de tâtonnement.
   Une sonde exposant `scale` et `clientHeight` dans le DOM a donné la cause en une mesure.
   → Devant un comportement inexpliqué : instrumenter, jamais deviner.

3. **Un drapeau hérité peut tout écraser en silence.** `exportMakerLayoutMode: 'custom'` forçait
   `detailedCard` quel que soit le template choisi. L'utilisateur a jugé plusieurs jours de travail
   sur un rendu qui n'était pas celui qu'il croyait regarder.
   → Devant un « rien ne change » : vérifier d'abord que la bonne chose s'affiche.

4. **Retirer ce qui n'a pas d'effet mesuré.** Trois corrections de cette session n'ont rien changé ;
   deux ont été retirées, la troisième documentée comme inerte.
   → Ne jamais laisser du code dont le commentaire affirme plus que la mesure.

5. **Ne pas optimiser E6.** La règle mesure l'étendue, pas la densité : un `space-between` la
   mettrait au vert sans rien améliorer. Elle détecte le débordement de façon fiable ; le
   remplissage se valide à l'œil.

---

## 1. Ce que « plus visuel » veut dire, concrètement

Le rendu actuel est majoritairement **textuel** : des libellés, des valeurs, des listes de chips.
Les seuls éléments visuels sont la photo, les barres de score et un radar.

Quatre leviers, par ordre de rapport valeur/effort :

| Levier | Aujourd'hui | Cible |
|---|---|---|
| **Photo** | une vignette bornée | élément dominant, cadrage plein, galerie exploitée |
| **Données chiffrées** | texte + barre linéaire | jauges, anneaux, comparatifs — le radar existe déjà et n'est utilisé qu'une fois |
| **Pipelines** | liste d'étapes | grille de cellules (le composant existe, désactivé par défaut) |
| **Sections** | titre + filet | pastille d'icône colorée reprise des formulaires |

Le quatrième levier est déjà spécifié dans `C4-matrice.md` §1.3 et jamais implémenté.

---

## 2. Phases

Chaque phase a un critère de sortie mesurable ET une validation visuelle. Aucune phase n'est
déclarée close sur le seul chiffre.

### Phase 1 — Re-baseline en conditions réelles
Toutes les mesures antérieures ont été prises avant la correction du routage de template et des
images. **Elles sont à refaire.**
- Passe complète : 5 templates × formats autorisés × 3 densités × 4 types.
- Sur une review réelle en plus des fixtures.
- *Sortie* : tableau de référence à jour, écarts entre fixture et réel documentés.

### Phase 2 — Éliminer les débordements résiduels
Le débordement est le seul défaut qui **perd du contenu** ; il prime sur tout le reste.
- Story `flower/dense` 1:1 à 114 % — sonde instrumentée, pas une quatrième tentative à l'aveugle.
- Contraste 3,04:1 apparu sur Story `edible/dense`.
- *Sortie* : zéro page > 100 % sur toute la matrice.

### Phase 3 — La photo comme élément dominant
Le levier le plus rentable pour « plus visuel » : l'image est la seule donnée qui remplit sans
ajouter de charge cognitive.
- Exploiter la galerie (jusqu'à 4 photos disponibles) au lieu d'une seule.
- Compositions par format : hero plein cadre en 9:16, bande en 16:9, mosaïque en 1:1.
- Recadrage intelligent plutôt que boîte à hauteur fixe.
- *Sortie* : part visuelle ≥ 45 % de la surface sur les templates carte, validée à l'œil.

### Phase 4 — Densifier les données par la visualisation
- Jauges circulaires pour les cannabinoïdes plutôt que des barres empilées.
- Radar sensoriel étendu aux templates qui n'en ont pas.
- Pipelines en **grille de cellules** (`PipelineMiniGrid`, existant, `pipelineDetailGrids: false`).
- *Sortie* : ratio texte/visuel inversé sur Fiche Technique, zéro perte d'information.

### Phase 5 — La grammaire des formulaires
Spécifiée dans `C4-matrice.md`, jamais faite. C'est elle qui réglera le « c'est moche ».
- Pastille d'icône 32×32 en dégradé + couleur par section (analytique bleu, visuel violet,
  odeurs vert, texture rose, goûts ambre, effets cyan).
- Suppression de la numérotation « 01 / 02 » (règle G4).
- *Sortie* : G4 à zéro, et un rendu reconnaissable comme Terpologie en une seconde.

### Phase 6 — Composition par format sur les 5 templates
`FORMAT_LAYOUT.columns` déclare deux colonnes pour 16:9 et 4:3 ; seule Fiche Technique le consomme.
- Étendre aux quatre autres.
- *Sortie* : aucun format large sous 80 % de remplissage.

### Phase 7 — Le rendu HTML interactif
Demande explicite jamais entamée : `/r/:id` doit être un site, pas une image figée.
- Cellules de pipeline cliquables (`PipelineMiniGrid` est déjà interactif).
- Sections repliables sur les notations denses, recette groupée par catégories.
- Réutiliser `ProductionChainCanvas` / `UnifiedGeneticsCanvas` en `readOnly` — le prop existe,
  mes `ReadOnly*Canvas` sont des doublons à supprimer.
- *Sortie* : `/r/:id` défile, aucune pagination, interactions en lecture seule.

### Phase 8 — Finitions mesurables
12 polices sous plancher hors Compact · contraste papier · troncature · longueur de ligne ·
échelle 4/8 (~600 avertissements) · chasse tabulaire.
- *Sortie* : zéro erreur sur les règles automatiques.

### Phase 9 — Passe finale
Matrice complète, exports PNG réels téléchargés et inspectés, checklist « produit fini ».

---

## 3. Ce qui reste hors de ces phases

- Traçabilité réellement paginé (déclaré `false` aujourd'hui).
- Partage d'entreprise des préréglages.
- `ExportMaker.jsx` legacy (8 tests + dashboard QA en dépendent).
