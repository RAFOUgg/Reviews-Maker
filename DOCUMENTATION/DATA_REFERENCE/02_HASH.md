# HASH — inventaire complet des champs, par section de formulaire

> Page : `client/src/pages/review/CreateHashReview/index.jsx`. Modèle Prisma : `HashReview`. 9 sections : Infos générales → Pipeline Séparation → Analytiques → Visuel &amp; Technique → Odeurs → Texture → Goûts → Effets &amp; Expérience → Curing &amp; Maturation.
>
> Le hash (kief pressé, dry-sift, bubble hash/ice-o-lator) est le **plus ancien concentré de cannabis** : il s'obtient par simple **séparation mécanique** des trichomes (par tamisage à sec ou par agitation dans l'eau glacée qui fragilise puis détache les têtes glandulaires), **sans aucun solvant chimique** — à bien distinguer conceptuellement des concentrés du document 03 (Concentrés), qui eux impliquent souvent une extraction par solvant ou par pressage thermique.
>
> **Sourcing & principe non négociable** : `id` renvoyant au registre **[13_REGISTRE_SOURCES.md](13_REGISTRE_SOURCES.md)**. Comme pour tout document produit : `hashmaker`/`cultivarsUtilises` sont des identifiants déclaratifs, jamais des prédicteurs de composition — cf. document 01 note de tête, document 05 §3.

## 1. Informations générales

| Champ | Widget | Contraintes |
|---|---|---|
| `nomCommercial` | texte, max 100 | Obligatoire |
| `hashmaker` | texte | — |
| `laboratoire` | texte | Laboratoire de production |
| `cultivarsUtilises` | texte + `SourceLineageSelector` (`allowedTypes=['flower']`) | Permet de lier une fiche Fleur source existante — traçabilité multi-source (`sourceLineage`) |
| `photos` | upload, 1-4 | Pas de tags photo (contrairement à Fleur) |

## 2. Pipeline Séparation (obligatoire)

Cf. **[06_PIPELINES_TRANSVERSES.md](06_PIPELINES_TRANSVERSES.md) §3** pour le détail complet : `separationType` (ice-water/dry-sift/ice-o-lator/rosin-press/manual), matière première, sous-sections ICE_WATER (mailles 25 à 220 µm — cf. correspondance avec la taille réelle des trichomes) et DRY_SIFT, rendement par passe (couleur/texture/melt).

## 3. Données analytiques — identique à [01_FLEURS.md](01_FLEURS.md) §5

Mêmes 4 cannabinoïdes (THC/CBD/CBG/CBC) + upload certificat/terpènes, mêmes limites scientifiques constatées (pas de THCA/CBDA, `otherCannabinoids`/`cbnPercent`/`thcvPercent` orphelins côté DB, `cannabinoids.js`/`terpenes.js` non branchés).

**Nuance Hash spécifique** : le hash étant un concentré (trichomes purs sans matière végétale), son taux de cannabinoïdes attendu est **structurellement plus élevé** que la fleur d'origine (souvent 40-60%+ de cannabinoïdes totaux pour un bubble hash full-melt de qualité, contre 15-25% pour une fleur) — c'est la conséquence directe et attendue de la concentration mécanique des trichomes, pas une anomalie de mesure.

## 4. Visuel & Technique

Palette dédiée `HASH_PALETTE` (déclarée localement dans `VisualSection.jsx`, distincte de `cannabisColors.js` utilisé par Fleur) :
`blonde`, `blond-ambré`, `or`, `brun-clair`, `brun`, `brun-foncé`, `noir`, `vert-olive` (verte), `gris` (grisâtre).

Sélection multi-couleur `couleurNuancier` avec répartition en % devant totaliser 100 (pas de max de couleurs codé — contrairement à Fleur limité à 5).

3 sliders /10 (`HASH_FIELDS`) : `couleurTransparence`, `pureteVisuelle`, `densiteVisuelle`.

### Commentaire scientifique
✅ **La couleur du hash est un indicateur qualité réel et bien établi dans l'industrie** : un bubble hash blond/blond-ambré full-melt de haute qualité (peu de contamination végétale, séparation propre) est généralement plus clair, tandis qu'un hash brun/noir foncé traduit souvent une proportion plus importante de matière végétale co-extraite (chlorophylle, cires) ou un procédé plus artisanal/moins sélectif (dry-sift à mailles larges par exemple) — cohérent avec le référentiel `tailleMailles`/`bagMicrons` du pipeline Séparation (mailles fines 25-73µm → hash plus pur et généralement plus clair).

## 5. Odeurs — identique à [01_FLEURS.md](01_FLEURS.md) §7

Différence : le champ `fideliteCultivars` (fidélité au cultivar d'origine) est **visible pour Hash** (masqué pour Fleur) — logique : le hash étant une transformation de la fleur, la question de savoir si son profil aromatique reste fidèle au cultivar de départ (ou s'il a été altéré/appauvri par le procédé de séparation) est pertinente ici et n'a pas de sens pour une fleur brute qui n'a subi aucune transformation.

## 6. Texture — branche Hash de `TextureSection.jsx`

Champs communs (`durete`, `densiteTactile`, `collant`) + spécifiques Hash : `malleabilite`/`malleability`, `friabilite`/`friability`.

Échelles :
- **Malléabilité** : Cassant → Fragile → Rigide → Peu souple → Moyen → Souple → Malléable → Très malléable → Plastique → Très plastique
- **Friabilité** : Très dur → Dur → Compact → Peu friable → Moyen → Friable → Très friable → S'émiette → Poudre → Poussière

✅ **Cohérent avec la diversité réelle des textures de hash** : un dry-sift frais peut être poudreux/friable (proche du kief brut), un bubble hash pressé à froid ("cold cure") peut être plus malléable/plastique proche du température ambiante, tandis qu'un hash très sec et vieilli devient cassant/friable — ces deux axes (malléabilité vs friabilité) capturent effectivement des propriétés physiques distinctes et non redondantes.

## 7. Goûts — identique à [01_FLEURS.md](01_FLEURS.md) §9

## 8. Effets & Expérience — identique à [01_FLEURS.md](01_FLEURS.md) §10

Champs renommés côté `HashReview` (mêmes valeurs/logique) : `monteeRapidite` (=montée), `dureeEffets` (catégorie), `methodeConsommation`, `dosageUtilise`.

## 9. Curing & Maturation

Cf. **[06_PIPELINES_TRANSVERSES.md](06_PIPELINES_TRANSVERSES.md) §2** — même sidebar que Fleur, avec la nuance d'humidité cible **62-65% pour le hash** (contre 55-62% fleur) déjà notée dans le code (`curingSidebarContent.js`), cohérente avec le fait qu'un hash trop sec devient cassant et perd en qualité de manipulation (cf. friabilité ci-dessus), justifiant une cible d'humidité légèrement supérieure à celle de la fleur.
