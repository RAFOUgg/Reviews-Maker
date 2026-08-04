# C5 — Plan de vérification grammaire / ergonomie / stylistique

> Objectif : disposer d'une méthode **reproductible et objective** pour juger un rendu, au lieu de l'impression « c'est moche ». Chaque critère est soit mesurable automatiquement, soit vérifiable sur une capture par une question fermée.
>
> Portée : les 5 templates × leurs formats autorisés × les 2 modes de rendu (Site / Document), sur les 4 types de review.

---

## 0. Principe

Trois axes, dans cet ordre de priorité. Un rendu qui échoue à l'axe 1 ne mérite pas qu'on regarde l'axe 3.

1. **Grammaire** — le rendu parle-t-il la langue du produit ? (cohérence avec les formulaires et LiquidUI)
2. **Ergonomie** — l'information est-elle trouvable, lisible, hiérarchisée ? (indépendant du goût)
3. **Stylistique** — la finition est-elle au niveau commercial ?

---

## 1. Axe GRAMMAIRE — cohérence avec le produit

La référence n'est pas un moodboard : ce sont les **formulaires**, que l'utilisateur a déjà en main quand il découvre son rendu.

| # | Critère | Vérification | Seuil |
|---|---|---|---|
| G1 | Une section de rendu = une section de formulaire (même nom, même emoji) | Comparer les intitulés rendus à la liste des sections du type | 100 % — aucun intitulé inventé |
| G2 | Chaque section porte la pastille d'icône du formulaire (32×32, `rounded-xl`, dégradé) | Inspection visuelle | Toutes |
| G3 | Chaque section porte **sa** couleur (analytique bleu · visuel violet · odeurs vert · texture rose · goûts ambre · effets cyan) | Relevé des couleurs rendues vs table de référence | 100 % |
| G4 | Aucune numérotation « 01 / 02 » — grammaire absente du reste du produit | Grep + visuel | 0 occurrence |
| G5 | Cartes conformes à `.liquid-card` : rayon 24px, `blur(24px) saturate(150%)`, bordure `rgba(255,255,255,0.12)` | Relevé des styles calculés | Écart nul |
| G6 | Flou réservé aux grandes surfaces ; jamais sur un chip/badge | Inspection | 0 chip flouté |
| G7 | Accent violet en **surface** uniquement ; texte accentué en nuance 400 | Grep `ACCENT_TEXT_COLORS` + visuel | 0 texte en `#8B5CF6` |
| G8 | Sous-blocs au motif `from-X/10 to-Y/10 border-X/20` | Inspection | Cohérent |

---

## 2. Axe ERGONOMIE — mesurable

### 2.1 Lisibilité (automatisable)

| # | Critère | Méthode | Seuil |
|---|---|---|---|
| E1 | Contraste texte / fond | Calcul WCAG sur chaque couple réellement rendu | **≥ 4.5:1** (texte), ≥ 3:1 (surfaces) |
| E2 | Taille de police effective | Relevé des `font-size` calculés après mise à l'échelle | **≥ 12px**, corps ≥ 14px |
| E3 | Aucune troncature silencieuse | Détecter `scrollWidth > clientWidth` sur tout élément texte | **0** |
| E4 | Aucun débordement de page | `scrollHeight > clientHeight` sur chaque page | **0** |
| E5 | Longueur de ligne en lecture longue | Caractères par ligne sur les paragraphes | 45–90 |
| E6 | Densité : remplissage de page (mode Document) | Contenu / hauteur de canevas | **65–95 %** |

> **Limite connue de E6 — à ne jamais oublier (constatée 2026-08-05).** La règle mesure l'**étendue**
> du contenu (bas du dernier module ÷ hauteur du canevas), pas sa **densité**. Un simple
> `justify-content: space-between` suffirait à faire afficher ~100 % à toutes les cartes en écartant
> trois blocs dans le vide — la métrique serait verte, le rendu inchangé.
>
> E6 détecte donc fiablement le **débordement** (> 100 %) et le **contenu qui s'arrête trop tôt**,
> mais un score élevé ne prouve pas une bonne composition. Toute correction visant E6 doit être
> validée par une capture, jamais par le seul chiffre. Ne pas « optimiser » E6.

### 2.2 Hiérarchie et parcours

| # | Critère | Vérification | Seuil |
|---|---|---|---|
| E7 | Un seul point d'entrée visuel dominant par page | Test du plissement des yeux : un seul élément ressort | 1 |
| E8 | Niveaux typographiques distincts et limités | Relevé des tailles distinctes | ≤ 4 niveaux |
| E9 | Aucune donnée identique répétée | Diff des valeurs rendues | 0 répétition |
| E10 | L'ordre de lecture suit l'ordre du formulaire | Comparer la séquence rendue à la séquence de saisie | Identique |
| E11 | Une section vide ne laisse pas de trace (titre orphelin, cadre vide) | Rendu d'une review minimale | 0 bloc vide |

### 2.3 Interaction — mode Site uniquement

| # | Critère | Vérification | Seuil |
|---|---|---|---|
| E12 | Cible tactile | Mesure des zones cliquables | **≥ 44×44 px** |
| E13 | L'état interactif est signalé (curseur, survol, focus) | Inspection | Tous les éléments cliquables |
| E14 | Navigation clavier possible et focus visible | Parcours au clavier | Complet |
| E15 | Aucune écriture possible — lecture seule stricte | Tentative de modification sur canevas/cellules | Aucune mutation |
| E16 | Repli/dépli sans saut de page (pas de décalage du contenu déjà lu) | Mesure du décalage au dépli | ≤ 0 px au-dessus du point cliqué |

---

## 3. Axe STYLISTIQUE

| # | Critère | Seuil |
|---|---|---|
| S1 | Espacements issus de l'échelle 4/8 | 100 % |
| S2 | Alignements : bords partagés, colonnes cohérentes | Aucun décalage < 4px non intentionnel |
| S3 | Chiffres en chasse tabulaire, alignés à droite | Tous |
| S4 | Rayons cohérents (24 carte / 16 sous-bloc / 999 chip) | 3 valeurs max |
| S5 | Ombres : 2 recettes maximum dans tout le rendu | ≤ 2 |
| S6 | Aucun élément décoratif sans fonction | 0 |
| S7 | Le rendu est reconnaissable comme Terpologie en 1 seconde | Jugement, tracé |

---

## 4. Matrice de passage

Chaque combinaison est vérifiée avec **3 jeux de données** :

- **Minimal** — le strict requis (Comestible à 4 sections, sans photo, sans pipeline). Cible les blocs vides et les titres orphelins.
- **Nominal** — une review réaliste complète.
- **Dense** — 25+ étapes de pipeline, généalogie et chaîne liées, tous champs remplis. Cible débordement et perte de contenu.

| Template | Formats | Modes | Combinaisons |
|---|---|---|---|
| Moderne Compact | 1:1 · 9:16 · 16:9 | Site + Document | 6 |
| Story | 9:16 · 1:1 | Site + Document | 4 |
| Article de Blog | A4 · 16:9 | Site + Document | 4 |
| Fiche Technique | A4 · 16:9 · 4:3 | Site + Document | 6 |
| Traçabilité | A4 | Site + Document | 2 |

**22 combinaisons × 3 jeux = 66 rendus**, × 4 types de review là où le type change la structure (Comestible surtout).

---

## 5. Méthode

1. **Automatisable, en premier** : E1–E6, E12, G4, G7, S1, S3 se mesurent par script dans le DOM rendu. Ils tournent sur les 66 rendus sans intervention et éliminent le gros des défauts avant tout jugement visuel.
2. **Capture réelle ensuite** : mode Document vérifié sur **PNG téléchargé**, jamais sur l'aperçu — l'historique du projet montre trois classes de bugs visibles uniquement sur le fichier final (polices, mesure asynchrone, débordement recadré).
3. **Jugement visuel en dernier** : G1–G3, G5–G6, E7–E11, S2, S4–S7, sur les rendus ayant passé les deux premières étapes.
4. **Journal des écarts** : chaque défaut consigné avec template + format + mode + jeu de données + capture. Un défaut trouvé sur une combinaison est **systématiquement rejoué sur les 21 autres** — c'est la leçon des bugs corrigés sur une surface et pas sur les autres (correctifs #3, #11, et le placeholder d'image du 2026-08-04).

---

## 6. Critères de sortie

Le chantier est terminé quand, sur les 66 rendus :

- Axe Ergonomie : **aucun** écart sur E1–E6 et E11 (les critères mesurables, non négociables).
- Axe Grammaire : **aucun** écart sur G1–G4 et G7.
- Axe Stylistique : écarts résiduels documentés et acceptés explicitement, pas ignorés.
- Mode Site : E12–E16 vérifiés sur au moins un rendu par template.

---

## 7. Ordre d'exécution proposé

1. Outiller les mesures automatiques (§5.1) — un script réutilisable sur toute la matrice.
2. **Comestible / Moderne Compact** en premier : c'est le cas le plus pauvre en données (4 sections) et le seul template accessible aux amateurs — donc le plus vu, et celui où les blocs vides se voient le plus. C'est aussi la capture qui a motivé ce chantier.
3. Puis Compact sur les 2 autres formats, puis Blog, puis Fiche Technique, puis Story, puis Traçabilité.
4. À chaque template terminé : rejouer la mesure automatique sur **toute** la matrice pour détecter les régressions croisées.
