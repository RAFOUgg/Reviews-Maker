# CONCENTRÉS — inventaire complet des champs, par section de formulaire

> Page : `client/src/pages/review/CreateConcentrateReview/index.jsx`. Modèle Prisma : `ConcentrateReview`. 9 sections : Infos générales → Pipeline Extraction → Analytiques → Visuel &amp; Technique → Odeurs → Texture → Goûts → Effets &amp; Expérience → Curing &amp; Maturation.

## 1. Informations générales

| Champ | Widget | Options |
|---|---|---|
| `nomCommercial` | texte, max 100 | Obligatoire |
| `concentrateType` | select | `CONCENTRATE_TYPES` (liste complète) : `Rosin`, `BHO (Butane Hash Oil)`, `PHO (Propane Hash Oil)`, `CO2 Oil`, `Live Resin`, `Live Rosin`, `Shatter`, `Wax`, `Budder`, `Crumble`, `Diamonds`, `Sauce`, `Distillate`, `RSO (Rick Simpson Oil)`, `FECO (Full Extract Cannabis Oil)`, `Autre` |
| `hashmaker` (label "Hashmaker/Extracteur") | texte | — |
| `laboratoire` | texte | — |
| `cultivarsUtilises` + `SourceLineageSelector` | texte | `allowedTypes=['flower','hash']` — un concentré peut provenir soit d'une fleur, soit d'un hash (extraction secondaire, cf. `materialType='hash'` dans le pipeline Extraction) |
| `photos` | upload, 1-4 | — |

### Commentaire scientifique sur `concentrateType`
✅ Liste à jour et représentative de la nomenclature réelle de l'industrie (2020s). Quelques distinctions utiles à connaître pour juger de la cohérence des champs qui suivront (pipeline Extraction) :
- **RSO/FECO** : extraits "full spectrum" (souvent à l'éthanol), destinés à un usage médical/thérapeutique orienté (fortes doses, ingestion), historiquement associés au mouvement Rick Simpson — distincts des concentrés "recreational" type wax/shatter en texture et en usage.
- **Live Resin/Live Rosin** : préfixe "Live" = matière première congelée fraîche ("fresh frozen") plutôt que séchée avant extraction — préserve un profil terpénique jugé plus proche de la plante vivante (moins de pertes de terpènes volatils pendant le séchage classique).
- **Diamonds** (cristaux de THCA) : produit de recristallisation, généralement obtenu par séparation lente en solution (pas simplement un "concentré de plus" mais le résultat d'un procédé de purification poussé, cf. document 06 §5 recristallisation).

## 2. Pipeline Extraction

Cf. **[06_PIPELINES_TRANSVERSES.md](06_PIPELINES_TRANSVERSES.md) §4** pour le détail complet des sous-sections Configuration/Matière première/Rosin/Solvant/Purification/Rendement — c'est la section la plus riche scientifiquement du système (paramètres physico-chimiques réels : température de plaque, pression PSI, température d'extraction cryogénique, méthode de purge, winterisation, décarboxylation, distillation).

**Point notable non couvert en doc 06** : la sous-section "PURIFICATION" est **intégrée directement dans le pipeline Extraction** (et non dans le pipeline Purification dédié, qui existe dans le code mais n'est branché dans aucun flux de review — cf. [10_ANOMALIES_CODE_MORT.md](10_ANOMALIES_CODE_MORT.md)). Concrètement pour le Concentré, winterisation/filtration/décarboxylation/distillation sont des **toggles optionnels** au sein même de la fiche extraction, pas une étape séparée du parcours utilisateur.

## 3. Données analytiques — identique à [01_FLEURS.md](01_FLEURS.md) §5

Mêmes limites (4 cannabinoïdes seulement, pas de THCA/CBDA, terpènes non structurés). **Nuance Concentré** : c'est le type de produit où l'absence de distinction THCA/CBD est la plus dommageable scientifiquement, car de nombreux concentrés (distillats, diamonds) sont justement caractérisés par leur **taux de pureté en une forme précise** (ex. "90% THC distillate" désigne généralement du THC déjà décarboxylé, tandis qu'un extrait "diamonds" brut est essentiellement du THCA cristallisé, non psychoactif tel quel) — deux produits avec un même `thcPercent` affiché pourraient donc avoir des effets très différents selon qu'il s'agit de la forme acide ou neutre.

## 4. Visuel & Technique

Palette dédiée `CONCENTRATE_PALETTE` : `transparent`, `jaune-pâle`, `or-pâle`, `or`, `ambre`, `ambre-foncé`, `brun`, `crème` (wax), `vert` (live).

3 sliders /10 (`CONCENTRATE_FIELDS`) : `couleurTransparence`, `pureteVisuelle`, `viscosite`, `melting` ("10=melting parfait"), `residus` ("10=aucun résidu après consommation").

### Commentaire scientifique
✅ **La transparence/couleur est un indicateur de pureté réel et directement exploité par l'industrie** ("full melt", cristal clair) : un extrait très transparent/doré pâle avec peu de résidu à la combustion signale généralement une purification poussée (peu de lipides/cires résiduels, peu de contamination par la chlorophylle) ; un extrait vert plus foncé (souvent live resin ou rosin non winterisé) contient davantage de composés végétaux co-extraits — cohérent avec le fait que `melting`/`residus` sont justement les deux sliders qui capturent cette notion de pureté résiduelle de façon quantifiée.

## 5-8. Odeurs / Texture / Goûts / Effets & Expérience

Identiques à [01_FLEURS.md](01_FLEURS.md) §7-10, avec pour Texture la branche Concentré : `durete`, `densiteTactile`, `collant` + `viscosite` (spécifique, absent Fleur/Hash) — échelle : Très liquide → Liquide → Coulant → Fluide → Moyen → Épais → Très épais → Visqueux → Très visqueux → Pâteux.

✅ La viscosité est une propriété physico-chimique réelle et pertinente ici : elle varie fortement selon la texture visée (shatter = solide cassant, sauce/live resin = semi-liquide très visqueux, RSO = pâteux épais, distillat chaud = quasi-liquide) et dépend directement du taux de terpènes résiduels et de la température ambiante au moment de l'observation — à noter que la viscosité d'un même extrait varie avec la température, ce qui n'est pas capturé comme covariable dans le schéma actuel (piste d'amélioration possible : associer une température d'observation au score de viscosité).

## 9. Curing & Maturation

Cf. **[06_PIPELINES_TRANSVERSES.md](06_PIPELINES_TRANSVERSES.md) §2**. Pour un concentré déjà purifié/stable (distillat, isolat), le curing a une pertinence moindre que pour la fleur ou le hash — il reste utile pour les concentrés "vivants" (live resin/rosin, sauce) dont le profil terpénique/texture continue d'évoluer légèrement après extraction (cristallisation progressive des cannabinoïdes dans la "sauce", par exemple, un phénomène physique réel de séparation de phase entre cannabinoïdes cristallisables et terpènes liquides).
