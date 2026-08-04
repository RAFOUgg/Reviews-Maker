# C4 — Matrice Template × Contenus × Formats × Pagination

> Redéfinie le 2026-08-04 **à partir des formulaires de review**, pas d'une taxonomie inventée pour l'export. Les 4 formulaires portent déjà un contrat de contenu et une grammaire visuelle complets ; l'export doit en hériter au lieu de réinventer.

---

## 1. Ce que les formulaires définissent déjà

### 1.1 Le découpage en sections — c'est le contrat de contenu

| Type | Sections, dans l'ordre du formulaire |
|---|---|
| **Fleur** (10) | 📋 Informations générales · 🧬 Génétiques & PhenoHunt *(producteur)* · 🌱 Culture & Pipeline *(producteur)* · 🔬 Analytiques · 👁️ Visuel & Technique · 👃 Odeurs · 🤚 Texture · 😋 Goûts · 💥 Effets & Expérience · 🔥 Curing & Maturation |
| **Hash** (9) | 📋 Informations générales · ⚗️ Pipeline Séparation · 🔬 Données Analytiques · 👁️ Visuel & Technique · 👃 Odeurs · 🤚 Texture · 😋 Goûts · 💥 Effets + Expérience · 🔥 Curing & Maturation |
| **Concentré** (9) | 📋 Informations générales · ⚗️ Pipeline Extraction · 🔬 Données Analytiques · 👁️ Visuel & Technique · 👃 Odeurs · 🤚 Texture · 😋 Goûts · 💥 Effets + Expérience · 🔥 Curing & Maturation |
| **Comestible** (4) | 📋 Informations générales · 🥘 Recette & Préparation · 😋 Goûts · 💥 Effets + Expérience |

**Conséquence directe** : l'unité de contenu d'un template n'est plus « un champ parmi ~70 interrupteurs », c'est **une section de formulaire**. Un template déclare quelles sections il rend. C'est fini, borné, et ça correspond à la façon dont la donnée est saisie.

Note : Comestible n'a ni analytique, ni visuel, ni texture, ni curing. Tout template doit donc gérer un type à 4 sections aussi bien qu'un type à 10 — ce n'est pas un cas limite, c'est un quart des types.

### 1.2 La grammaire visuelle — à reprendre telle quelle

Relevée dans `components/sections/*.jsx` et `ResponsiveCreateReviewLayout.jsx` :

- **Une section = une `LiquidCard`** avec un `glow` teinté.
- **En-tête de section** : pastille d'icône 32×32 `rounded-xl` en dégradé + titre avec emoji + sous-titre `text-xs text-white/50`.
- **Sous-blocs** : `bg-gradient-to-br from-X/10 to-Y/10 rounded-xl border border-X/20` — une carte teintée par thème.
- **Grille** : `grid-cols-1 md:grid-cols-2 gap-4`.
- **Fond d'app** : `#07070f` + halo radial violet.
- **L'emoji est l'identifiant primaire** de la section (le carrousel de navigation n'affiche QUE des emojis).

### 1.3 L'identité chromatique par section — déjà définie, ignorée par l'export

| Section | glow | Pastille d'icône |
|---|---|---|
| 🔬 Analytiques | `blue` | blue-500 → indigo-600 |
| 👁️ Visuel | `purple` | violet-500 → purple-600 |
| 👃 Odeurs | `green` | emerald-500 → green-600 |
| 🤚 Texture | `purple` | pink-500 → purple-600 |
| 😋 Goûts | `amber` | amber-500 → orange-600 |
| 💥 Effets | `cyan` | cyan-500 → blue-600 |

C'est un système de couleurs sémantique **déjà en production dans les formulaires**. Les templates d'export l'ignorent totalement : ils teintent tout avec l'unique accent de palette, et numérotent les sections « 01 / 02 / 03 » — une grammaire qui n'existe nulle part ailleurs dans le produit.

**Décision** : les rendus reprennent la pastille d'icône + la couleur de section du formulaire. La numérotation « 01/02 » disparaît. L'utilisateur retrouve dans sa fiche exportée exactement les repères visuels qu'il avait en la saisissant.

---

## 2. La matrice

Unité = **section de formulaire**. `●` rendu complet · `◐` rendu condensé (1 note de synthèse) · `—` absent.

| Section | Compact | Story | Blog | Fiche Technique | Traçabilité |
|---|:--:|:--:|:--:|:--:|:--:|
| 📋 Informations générales | ● | ● | ● | ● | ● |
| 🔬 Analytiques | ◐ THC/CBD | ◐ THC/CBD | ● | ● | ● |
| 👁️ Visuel | ◐ | — | ● | ● | — |
| 👃 Odeurs | ◐ | ◐ arômes | ● | ● | — |
| 🤚 Texture | ◐ | — | ● | ● | — |
| 😋 Goûts | ◐ | — | ● | ● | — |
| 💥 Effets | ◐ | — | ● | ● | — |
| 🌱/⚗️/🥘 Pipeline du type | — | — | ◐ résumé | ● **grille** | ● **grille** |
| 🔥 Curing | — | — | ◐ résumé | ● **grille** | ● **grille** |
| 🧬 Généalogie (canevas) | — | — | — | ● | ● |
| 🔗 Chaîne de production (canevas) | — | — | — | ● | ● |
| 🏷️ Lot + QR | — | — | — | ● | ● |
| 📋 Journal d'événements | — | — | — | — | ● |
| ⚖️ Bilan matière | — | — | — | ● | ● |

### Formats et pagination

| Template | Rôle | Formats | Pagination |
|---|---|---|---|
| **Moderne Compact** | Carte glanceable, réseaux sociaux | 1:1 · 9:16 · 16:9 | **Non** — une carte par définition. Ce qui ne rentre pas est exclu, jamais reporté. |
| **Story Social Media** | Story verticale | 9:16 · 1:1 | **Non** |
| **Article de Blog** | Lecture longue, éditorial | A4 · 16:9 | **Oui** |
| **Fiche Technique Détaillée** | Le COA complet | A4 · 16:9 · 4:3 | **Oui** |
| **Rapport de Traçabilité** | Document probant | A4 | **Oui** — vraiment paginé. Le non-sens actuel vient d'un document conçu comme continu, affiché dans une coquille paginée. |

**Formats retirés** : plus de A4 sur Compact ni Story (un carré social n'a rien à faire en page imprimée), plus de 1:1/9:16 sur Fiche Technique et Blog (un COA dense dans un carré de 800px est le défaut d'origine).

---

## 3. Conséquences techniques

1. **Pipelines en grille** — `PipelineMiniGrid` existe déjà (« grille interactive lecture seule d'une timeline »), il est simplement **désactivé par défaut** (`pipelineDetailGrids: false`), jugé redondant lors d'une passe antérieure. La grille devient la représentation **primaire** sur Fiche Technique et Traçabilité ; la liste d'étapes détaillée devient le mode secondaire, réservé à ce que la grille ne peut pas porter (deltas, notes).
2. **Canevas réutilisés, pas réécrits** — `ProductionChainCanvas` et `UnifiedGeneticsCanvas` ont **déjà** un prop `readOnly` (14 gardes dans le premier). `ReadOnlyGenealogyCanvas`/`ReadOnlyProductionChainCanvas` sont des doublons à supprimer au profit des vrais canevas en `readOnly`, avec davantage d'informations affichées puisque aucune interaction d'édition n'est nécessaire.
3. **`contentModules` (~70 booléens) devient une couche secondaire** — le template déclare ses sections ; les interrupteurs ne servent plus qu'à retirer une section que l'utilisateur ne veut pas, jamais à en ajouter une hors contrat.
4. **Reflow à 2 secondes** — `useAdaptivePages` affiche `getDefaultPages()` (gabarits statiques) puis remplace par la mesure ~2 s plus tard : d'où « 1/5 » qui devient « 1/8 ». On n'affiche plus une mise en page qu'on sait provisoire ; état de calcul explicite jusqu'à la mesure.

---

## 4. Arbitrages — TRANCHÉS (2026-08-04)

1. **Compact / Story sans pagination** — confirmé. Un contenu qui ne rentre pas est **exclu**, jamais reporté.
2. **Traçabilité sans sensoriel** — confirmé, on se concentre sur le technique.
3. **Gating producteur** — un utilisateur non-producteur n'a pas accès aux sections PRO, donc **aucun rendu PRO**. Le gating du formulaire (`access: 'producteur'`) se propage au rendu.
4. **Comestible** — les 4 sections restent, le rendu actuel est jugé largement améliorable (capture Gookies).

### Accès aux templates par type de compte

| Compte | Templates disponibles |
|---|---|
| **Amateur** | Moderne Compact |
| **Influenceur** | Moderne Compact · Article de Blog · Story Social Media |
| **Producteur (pro)** | Les 5 |

**État actuel : ce gating n'existe nulle part.** `TemplateSelector.jsx` ne contient aucune référence à `accountType`/`isProducteur` — les 5 templates sont proposés à tout le monde. À câbler sur `services/access.js` (déjà la source de vérité des droits).

---

## 5. Deux modes de rendu — la clarification qui débloque tout

### Le diagnostic

Un seul pipeline de rendu sert aujourd'hui **deux produits aux contraintes opposées** :

| | Mode Document (figé) | Mode Site (vivant) |
|---|---|---|
| Sorties | PNG · JPEG · PDF | `/r/:id`, export HTML autonome |
| Surface | canevas de taille fixe | page qui défile |
| Pagination | **indispensable** | **absurde** |
| Interaction | impossible — tout doit être visible d'emblée | **c'est l'intérêt même** |
| Densité | tout étaler → pages longues | replier, révéler à la demande |

Le code a systématiquement arbitré en faveur du mode figé, et le rendu vivant a hérité de ces compromis. La preuve est écrite dans le code, en toutes lettres : `TraceabilityReportTemplate.jsx` documente le retrait de `PipelineMiniGrid` parce qu'elle est *« interactive "cliquer pour révéler", pertinente dans l'aperçu Studio mais MUETTE une fois figée en export statique — un rapport de traçabilité en PDF/PNG ne peut pas être cliqué »*.

Ce raisonnement est **juste pour le PDF et faux pour le site**. C'est exactement la réponse à « pourquoi le rendu n'est pas interactif » : on a désactivé l'interactivité pour satisfaire la contrainte de l'image.

### La brique existe déjà

`PipelineMiniGrid.jsx` fait **déjà** ce qui est demandé : `useState(selected)`, `onClick` sur chaque cellule, affichage des champs de la cellule sélectionnée en dessous — la reprise exacte de l'UX des formulaires en lecture seule. Elle est simplement **désactivée par défaut** (`pipelineDetailGrids: false`).

De même, `ProductionChainCanvas` et `UnifiedGeneticsCanvas` ont déjà un prop `readOnly`.

**Il ne s'agit donc pas de construire l'interactivité, mais de cesser de la brider.**

### Le contrat des deux modes

- **Mode Document** : le template déclare ses sections, le format et la pagination (matrice §2). Tout est visible sans interaction. C'est ce qui a été calibré jusqu'ici.
- **Mode Site** : mêmes sections, même identité visuelle, mais **pas de pagination**, défilement naturel, et interactivité **en lecture seule** :
  - pipelines rendus en **grille de cellules** comme dans les formulaires, cliquables pour révéler le détail d'une étape ;
  - canevas généalogie / chaîne de production **réels en `readOnly`**, avec plus d'informations affichées puisqu'aucune interaction d'édition n'est nécessaire ;
  - sections repliables quand la donnée est dense (notations nombreuses) ;
  - recette **groupée par catégories d'étapes** ;
  - aucune écriture, aucune modification — le rendu est externe à Terpologie.

`/r/:id` doit passer en mode Site. Aujourd'hui il re-rend `TemplateRenderer` via `SingleReviewCard`, c'est-à-dire le template pensé pour l'image figée.
