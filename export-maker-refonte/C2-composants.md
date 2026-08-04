# C2 — Bibliothèque de composants (specs)

> **Révision 2026-08-04 après la revue critique B4 (R1).** La version antérieure de ce document partait d'une prémisse fausse — *« pas de bibliothèque de composants atomiques formalisée »* — et spécifiait `MetricChip`/`DataRow`, qui auraient dupliqué des composants partagés **déjà en production depuis les 2026-08-02/03**. Les implémenter aurait créé une deuxième source de vérité : exactement le mode de défaillance que ce repo a payé 6 fois.
>
> Ce document est donc désormais organisé en **3 catégories** : ce qui existe et reste tel quel, ce qui existe et doit être amendé, ce qui manque réellement.

---

## Catégorie 1 — Existe déjà, à réutiliser tel quel (ne rien recréer)

| Composant | Fichier | Rôle | Utilisé par |
|---|---|---|---|
| `ScoreMetric` | `templates/sections/ScoreMetric.jsx` | Barre de score /10 + bande sémantique. **Déjà la seule source pour toute note affichée.** | 5 templates |
| `PipelineStepFields` | `templates/sections/PipelineStepFields.jsx` | Grille label/valeur des champs d'une étape + `PIPELINE_FIELD_ICONS` + gestion du champ note | DetailedCard, ModernCompact, BlogArticle |
| `RegistrySections` | `templates/sections/RegistrySections.jsx` | Sections dérivées de `fieldRegistry` (récolte / labo / extraction / purification / recette…) | 4 templates |
| `SensoryRadar` | `templates/sections/SensoryRadar.jsx` | Radar SVG à N axes, labels en `<text>` (sûr à la rasterisation) | DetailedCard |
| `CultureStatsChart` | `templates/sections/CultureStatsChart.jsx` | Graphe Recharts, dimensions px explicites (pas de `ResponsiveContainer`) | DetailedCard |

**Règle** : tout besoin de « puce métrique » ou de « ligne clé/valeur » passe par `ScoreMetric` / `RegistrySections` / `PipelineStepFields`. Aucun nouvel atome concurrent.

---

## Catégorie 2 — Existe, mais doit être amendé

### `ScoreMetric` — 2 corrections

1. **Contraste (B4 > R5, bloquant a11y)** : ligne 26, la valeur chiffrée utilise `barColor` (= couleur de *surface* de la bande) comme couleur de texte, à 12-14 px. Mesuré : 3.73:1 (`hi`) et 3.76:1 (`lo`) sur charcoal — **sous le seuil AA 4.5**, sur les 5 templates. → utiliser `semanticScore.text.onDark/onPaper` pour le texte, en gardant `semanticScore.surface` pour la barre (qui, elle, n'a besoin que de 3:1 et est déjà conforme).
2. **Glow (B4 > R9)** : ligne 36, `boxShadow: 0 0 6px` contredit le Don't explicite du moodboard B2 (« pas de glow décoratif »). Le composant étant partagé, le glow est présent partout, y compris sur le pilote COA v2 censé incarner le territoire retenu. → retirer.

### `PipelineStepFields` — 1 amendement

Devient un enfant de `PipelineTimeline` (catégorie 3) plutôt qu'un composant appelé directement par chaque template. Son contrat interne (`fields[]` déjà résumés par `summarizeCellFields`) ne change pas — il reçoit désormais des `fields` **déjà filtrés des constantes** par `PhaseGroup`. Aucune modification de sa signature.

### `TemplateSection` — **plus déprécié : promu fondation** (révision 2026-08-04)

La v1 de ce document le condamnait comme « dernier porteur du glassmorphism, territoire écarté ». Le territoire retenu ayant changé (B2 révisé : la DA des rendus = celle du site), le glassmorphism **est** l'identité cible. `getGlassTokens()` (`exportMakerHelpers.js:192`) reproduit déjà fidèlement la recette de `.liquid-card` (0.06 / 0.12 / 0.25 / `rgba(0,0,0,0.4)`).

→ `TemplateSection` devient le conteneur de section des 5 templates, au lieu d'être supprimé. Seul amendement : rayon à 24px (valeur de `.liquid-card`) et flou réservé aux grandes surfaces, jamais aux chips.

---

## Catégorie 3 — Réellement manquant (à créer)

Trois composants seulement. Tous consomment les tokens `C1-tokens.json` / `C1-theme.css`, jamais de valeur en dur. Aucun n'a de mode « interactif exporté » (décision D1).

### `ExportFrame`

**Rôle** : source unique de densité + contrat de débordement. Consolide `getResponsiveAdjustments` (qui reste la fonction de calcul) plutôt que de la dupliquer.

- **Props** : `ratio` (`'1:1'|'16:9'|'9:16'|'4:3'|'A4'`), `mode` (`'paged'|'continuous'`), `children`.
- **Comportement** : pose `data-em-ratio={ratio}` et, si `ratio === 'A4'`, `data-em-mode="paper"` sur le conteneur racine ; expose par contexte React **l'objet complet retourné par `getResponsiveAdjustments`** — pas un sous-ensemble. C'est non négociable : le relevé réel (B4 > R4) montre que les templates consomment `limits.maxCategoryRatings`, `limits.maxInfoCards`, `image.maxHeight`, `image.borderRadius` et toutes les `fontSize.*` ; un contexte partiel produirait des `undefined` en cascade.
- **Ne pas exposer `layout.*`** (`columns`/`imageHeight`/`contentHeight`) : zéro consommateur dans les 5 templates, candidat suppression. La version antérieure de cette spec faisait piloter le `Masthead` par `ExportFrame.columns` — une prop morte. Utiliser `isSquare`/`isPortrait` pour les décisions d'empilement.
- **Contrat de débordement** (corrige B3 §2.2, bug `justify-center` déjà rencontré) : `paged` = contenu pagé en amont par `useAdaptivePages`, jamais de recadrage ; `continuous` = scroll normal (`traceabilityReport`, `/r/:id`). **Jamais** de `justify-center`/`align-center` sur un conteneur à hauteur contrainte — c'est ce qui avait effacé un header entier (correctif #1).
- **États** : `measuring` (rendu hors-écran pour `measureDetailedCardModules.jsx`, dans le flux mais invisible) vs `display`.

### `ConstantsBanner`

**Rôle** : afficher **une seule fois** les valeurs constantes d'un pipeline. Résout le symptôme central (devflow §fil rouge).

- **Props** : `items[]` (`{ key, label, value }`), `compact`.
- **Détection** : fonction `detectPipelineConstants(pipelineType, steps)` à ajouter dans `chainCellPipelines.js` (à côté de `summarizeCellFields`, dont elle réutilise la sortie — **jamais** une lecture de champ devinée).
  - Un champ est remonté en constante si sa valeur est identique sur **≥ 80 %** des étapes qui le renseignent, **et** qu'il est renseigné sur ≥ 3 étapes (sous ce seuil, « constant » n'a pas de sens statistique et masquerait de l'information).
  - Les étapes minoritaires **conservent** ce champ dans leur détail, marqué comme delta — une valeur qui varie une fois sur 20 doit rester visible sur SON étape, pas disparaître dans la bannière.
  - Le champ note/commentaire (`NOTE_FIELD_KEYS`, déjà défini dans `PipelineStepFields.jsx`) est **exclu** de la détection : deux notes identiques sont une coïncidence, pas une constante.

### `PhaseGroup`

**Rôle** : regrouper les étapes par phase et n'afficher que les **deltas** par rapport au `ConstantsBanner`.

- **Props** : `index`, `name`, `steps[]`, `constants` (pour soustraction), `expanded?` (Studio uniquement).
- **Comportement mesure — contrainte dure** : un accordéon dont la hauteur dépend de l'état ouvert/fermé **casserait la pagination adaptative** (`useAdaptivePages` mesure hors-écran, puis le rendu réel doit correspondre). Donc : **toujours mesuré et exporté replié**. L'expansion est un raffinement de l'aperçu Studio, jamais une variable de mise en page à l'export. Cohérent avec la décision D1.
- **Découpage en phases** : dérivé des libellés d'étape déjà produits par `generateTimelineCells` (`J1`, `S3`, dates…) et de la phase déclarée sur la cellule quand elle existe. **Ne pas inventer de taxonomie de phases** — si aucune phase n'est déclarée, un seul groupe « Toutes les étapes ».

---

## Le composant qui change tout : `PipelineTimeline` partagé

**C'est l'élément central de la refonte** (B4 > R7), et il n'était pas dans la version antérieure de cette spec.

Aujourd'hui, la boucle qui produit le symptôme central est **réimplémentée 4 fois** :

| Template | Emplacement | Détail |
|---|---|---|
| `DetailedCardTemplate.jsx` | 287-350 | `StepCard` + `PipelineTimeline` locaux |
| `ModernCompactTemplate.jsx` | 536-569 | boucle locale + `summarizeCellFields` |
| `BlogArticleTemplate.jsx` | 485-511 | boucle locale + `summarizeCellFields` |
| `TraceabilityReportTemplate.jsx` | 342 | boucle locale + `summarizeCellFields` |

…et `PIPELINE_TYPE_BY_KEY` est dupliqué dans 3 fichiers, avec le commentaire aveu *« même mapping que DetailedCardTemplate »*.

**Spec** : `templates/sections/PipelineTimeline.jsx` — en-tête de pipeline (icône, nom, `configMeta`, compte d'étapes) + `ConstantsBanner` + `PhaseGroup[]` + `PipelineStepFields` (existant) pour le détail des deltas.

- **Props** : `pipeline` (sortie d'`extractPipelines`), `moduleId` (pour `data-module`, contrat de pagination adaptative), `variant` (`'full'|'compact'`), plus les tokens de rendu issus du contexte `ExportFrame`.
- `PIPELINE_TYPE_BY_KEY` y est défini **une seule fois** et exporté — les clés canoniques **et** les clés de repli (`extractionTimelineData`, `separationTimelineData`, `cultureTimeline`, `curingTimeline`) doivent y figurer, la confusion entre les deux ayant déjà causé une disparition silencieuse de pipeline (correctif #3, 4ᵉ/5ᵉ occurrence du vocabulaire deviné).
- **Bénéfice décisif** : le symptôme central se corrige **une fois** au lieu de quatre. C'est aussi ce qui évite de reproduire la classe de régression « corrigé sur une surface, pas sur les autres » qui a produit les correctifs #3 et #11.

---

## Hors scope confirmé

- Pas de composant « accordéon interactif exporté » — l'interactivité reste Studio-only (décision D1).
- Pas de `PageHeader`/`PageFooter` PDF — le PDF reste une image par page (décision D2).
- `MetricChip` / `DataRow` : **supprimés de cette spec** (B4 > R1) — `ScoreMetric` et `RegistrySections` couvrent déjà ces rôles.
- Mode Custom : inchangé, comme toujours exempté du système adaptatif.
