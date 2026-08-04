# B2 — Moodboard

> **Révision 2026-08-04 — le territoire retenu a changé.** La version 1 retenait « Lab Clinique Sombre » (charcoal-vert, ambre résine, Space Grotesk) et écartait explicitement l'identité de l'app. Décision utilisateur : **les rendus doivent porter la direction artistique du site et de son UI**, pas une identité séparée. Le raisonnement de la v1 avait un angle mort : il justifiait le territoire « Lab » par le fait qu'il était *déjà livré sur un template pilote* — un argument de coût de bascule, pas un argument d'identité de marque.

## Territoires visuels

### 1. LiquidUI — glassmorphism sombre — **RETENU**

L'identité réelle du produit, déjà appliquée à ~87 % de l'app : fond sombre profond, cartes de verre translucides floutées, bordures fines lumineuses, accent violet, glows secondaires cyan/vert/ambre.

**Pourquoi celle-ci** : c'est la seule qui ne crée pas de rupture de marque. Export Maker n'est pas un outil annexe — c'est **le produit fini que voit l'utilisateur final** (cf. CLAUDE.md, « Vision produit »). Une fiche exportée qui ne ressemble pas à l'app dans laquelle elle a été produite affaiblit les deux. Les 5 templates se différencient désormais par leur **mise en page**, jamais par leur palette.

**Sources canoniques — valeurs reprises telles quelles, jamais approchées à l'œil** :

| Source | Ce qu'elle fournit |
|---|---|
| `client/src/assets/apple-liquid-glass.css` | `--liquid-primary` `#8b5cf6`, `--liquid-secondary` `#06b6d4`, `--glass-bg` `rgba(255,255,255,0.06)`, `--glass-border` `rgba(255,255,255,0.12)`, `--glass-border-highlight` `rgba(255,255,255,0.25)`, `--glass-shadow` `rgba(0,0,0,0.4)`, `.liquid-card` (rayon 24px, `blur(24px) saturate(150%)`, ombres en couches + inset) |
| `client/src/assets/theme-tokens.css` | `--app-bg` (radial), `--app-bg-solid` `#0b1220`, `--text-primary` `#E6EEF8`, `--text-title` `#FFFFFF` |
| `client/tailwind.config.js` | `dark.muted` `#CBD5E1`, `boxShadow.glass/glow`, easing `apple` |
| `client/src/components/ui/LiquidUI.jsx` | **La règle sémantique** : `LiquidBadge` écrit `bg-emerald-500/20 text-emerald-400` — surface en nuance 500, texte en nuance 400 |

### 2. Lab Clinique Sombre — écartée

Charcoal-vert + ambre résine + Space Grotesk (palette « Résine », livrée sur `detailedCard` le 2026-07-30). Visuellement soignée et bien adaptée à de la donnée dense, mais c'est une **identité orpheline** : elle n'existe sur aucune autre surface du produit. La palette reste sélectionnable pour qui la préfère ; elle n'est simplement plus le défaut.

### 3. Terminal Technique — écartée

Tout en mono, noir pur, esthétique logs. Trop austère pour les sections sensorielles/éditoriales, et encore plus éloignée de l'app que le territoire 2.

## Palette (valeurs réelles du site)

| Token | Valeur | Rôle |
|---|---|---|
| `bg` | `radial-gradient(700px 420px at 50% 28%, rgba(255,255,255,.02), rgba(0,0,0,.5) 38%, rgba(0,0,0,.95) 100%)` sur `#0b1220` | Fond — recette exacte de `--app-bg` |
| `ink` | `#E6EEF8` | Texte primaire (`--text-primary`) |
| `title` | `#FFFFFF` | Titres (`--text-title`) |
| `muted` | `#CBD5E1` | Texte secondaire (`dark.muted`) |
| `accent` (surface) | `#8B5CF6` | Bordures, glows, aplats — **jamais du texte** |
| `accent` (texte) | `#A78BFA` | Libellés accentués |
| `glass-bg` / `glass-border` | `rgba(255,255,255,0.06)` / `rgba(255,255,255,0.12)` | Cartes de verre |

**Découverte de contraste (mesurée, pas supposée)** : `#8B5CF6`, l'accent signature du site, ne fait que **4.42:1** sur `#0b1220` et **4.22:1** sur `dark.bg` — il échoue AA en texte. Ce n'est pas un défaut à corriger : l'app applique déjà la bonne règle (`LiquidBadge` met le texte en nuance 400). Les templates d'export, eux, ne la respectaient pas.

## Bandes sémantiques de score

Fixes, indépendantes de la palette active. **Ce ne sont plus des teintes inventées pour l'export** — ce sont celles du système sémantique de l'app (`LiquidBadge`, `LiquidAlert`) :

| Bande | Surface (seuil 3:1) | Texte (seuil AA 4.5:1) | Sur papier |
|---|---|---|---|
| `hi` (≥ 7.5) | emerald-500 `#10B981` | emerald-400 `#34D399` — 10.44:1 | emerald-700 `#047857` — 5.24:1 |
| `mid` (≥ 5) | amber-500 `#F59E0B` | amber-400 `#FBBF24` — 12.02:1 | amber-700 `#B45309` — 4.80:1 |
| `lo` (< 5) | red-500 `#EF4444` | red-400 `#F87171` — 7.26:1 | red-600 `#DC2626` — 4.62:1 |

## Typographie

Le site n'utilise **pas** de police web : sa pile est `-apple-system, BlinkMacSystemFont, SF Pro Display, Segoe UI…` (`tailwind.config.js`). Un export ne peut pas s'en contenter — il est rasterisé sur la machine du client, donc une pile système produirait un rendu différent par poste, exactement le problème de repli silencieux corrigé par ailleurs.

- **Display + corps : Inter** — l'équivalent web fidèle de cette pile, désormais réellement chargée. Une seule police pour les 5 templates.
- **Données chiffrées : JetBrains Mono** — seule exception assumée. L'app n'a pas de mono, mais les colonnes de chiffres ont besoin d'une chasse tabulaire pour s'aligner. Besoin fonctionnel, pas un choix d'identité.
- **Space Grotesk** — conservée comme display alternatif (déjà chargée, déjà choisie sur des reviews existantes), plus par défaut.

## Traitement des données / iconographie

- Icônes : traits fins, `lucide-react` déjà utilisé partout dans le repo.
- Cartes de verre (`blur(24px) saturate(150%)`, rayon 24px) réservées aux **grandes surfaces** — sections, panneaux. Jamais sur un chip ou un badge : c'est la hiérarchie réelle de LiquidUI (`LiquidCard` a du flou, `LiquidChip`/`LiquidBadge` n'en ont pas).
- Radar/graphes : séries en nuances 400 des accents de l'app (violet/cyan/emerald/amber/red), toutes AA sur fond sombre.

## Do / Don't

**Do**
- Reprendre les valeurs des feuilles canoniques, jamais les ré-échantillonner à l'œil.
- Surface en nuance 500, texte en nuance 400 — la règle que `LiquidBadge` applique déjà.
- Un bandeau de constantes affiché une seule fois, puis seuls les deltas par phase.
- Toute valeur chiffrée en mono tabulaire, alignée à droite dans les tableaux.
- Header (« masthead ») stable quelle que soit la densité en dessous.

**Don't**
- Ne pas donner à un template une palette par défaut différente des autres — la différenciation se fait par la mise en page.
- Ne pas utiliser `#8B5CF6` pour du texte (4.42:1).
- Ne pas flouter un petit chip/badge.
- Ne pas répéter une valeur constante sur plus d'une ligne.
- Ne pas tronquer une colonne pour gagner de la place — réorganiser en accordéon plutôt que couper.
