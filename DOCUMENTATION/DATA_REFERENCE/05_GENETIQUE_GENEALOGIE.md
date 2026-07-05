# Génétique & Généalogie (PhenoHunt) — inventaire, options, véracité scientifique

> Source du code : `client/src/config/phenoNodeFields.js`, `client/src/components/genetics/NodeFormModal.jsx`, `EdgeFormModal.jsx`, `client/src/pages/library/tabs/CultivarsTab.jsx`, modèles Prisma `Cultivar`/`GeneticTree`/`GenNode`/`GenEdge` (`server-new/prisma/schema.prisma`).

## 0. Vue d'ensemble du système

- **GeneticTree** : un projet d'arbre généalogique (`projectType` : `phenohunt`, `selection`, `crossing`, `hunt`).
- **GenNode** : un cultivar/individu placé sur l'arbre — champs "identité" + bloc `genetics` (JSON piloté par `phenoNodeFields.js`).
- **GenEdge** : une relation entre deux nœuds (parent→enfant), porte `relationshipType` + `pollinationMethod`.
- **Cultivar** : fiche de bibliothèque, distincte du nœud sur l'arbre mais reliée (`GenNode.cultivarId`).

Cette architecture (nœud = individu observé, arête = événement de reproduction avec sa méthode) correspond au modèle standard utilisé en sélection végétale (pedigree breeding) — c'est une base saine.

## 1. Identité & génération

| Champ | Options code | Véracité / commentaire scientifique |
|---|---|---|
| `generation` | `P, F1, F2, F3, F4, BX1, BX2, BX3, S1, other` | ✅ Vocabulaire standard de génétique mendélienne appliqué au cannabis : **P** = parentale, **F1** = 1ère génération filiale (croisement de 2 lignées, hétérozygote, souvent hétérosis/vigueur hybride maximale), **F2** = croisement de 2 F1 (ré-ouvre la variance génétique — c'est là qu'apparaissent le plus de phénotypes différents, base du "pheno hunting"), **F3/F4** = générations suivantes de stabilisation. **BX** (backcross) = croisement d'un hybride avec l'un de ses parents (utilisé pour réintroduire un trait du parent récurrent tout en gardant le reste du fond génétique). **S1** = autofécondation (selfing) d'une plante sur elle-même (nécessite une inversion de sexe chimique, cf. §4). Manque cependant `IBL` (Inbred Line, ligne stabilisée après plusieurs S/F consécutives) qui existe côté `Cultivar.generationStatus` mais pas ici — incohérence mineure entre les deux systèmes de champs. |
| `seedType` | `regular, feminized, auto` | ✅ Distinction réelle et importante : graine **régulière** (ratio naturel ~50/50 mâle/femelle), **féminisée** (obtenue par inversion de sexe d'une mère via traitement au thiosulfate d'argent (STS) ou argent colloïdal — pas de modification génétique, épigénétique/hormonale uniquement), **auto-florissante** (génétique *ruderalis* introgressée, floraison déclenchée par l'âge et non par le photopériodisme). |
| `crossDate` / `plantingDate` | date | Factuel, pas de discussion scientifique nécessaire. |
| `selectionGoal` / `parentsNote` | texte libre | — |

## 2. Type génétique

| Champ | Options code | Véracité / commentaire scientifique |
|---|---|---|
| `geneticType` | `landrace, ibl, polyhybrid, auto` | ✅ Classification par **origine du pool génétique** plutôt que par effet ressenti — **landrace** (population native adaptée localement depuis des générations, sans croisement moderne — ex. Hindu Kush, Durban Poison originelles), **IBL** (Inbred Line, lignée stabilisée qui "reproduit vrai"), **polyhybride** (croisement de plusieurs lignées, cas de la quasi-totalité des cultivars commerciaux modernes), **auto** (génétique ruderalis introgressée). C'est une classification **plus rigoureuse** que le triptyque Indica/Sativa/Hybride du champ `type` de `Cultivar` — bon signal de conception. |
| `origin` | `seedbank, breeder, clone, landrace, ibl, polyhybrid` | Mélange une notion de **provenance commerciale** (seedbank/breeder/clone) avec une notion de **statut génétique** (landrace/ibl/polyhybrid) déjà couverte par `geneticType` juste au-dessus — chevauchement conceptuel à clarifier dans une future itération (deux axes différents : "d'où vient ma graine" vs "quel type de pool génétique"). |
| `thcMin`/`thcMax`, `cbdMin`/`cbdMax` | number 0-100 | ✅ Correct de les stocker en fourchette (min/max) plutôt qu'en valeur unique : le taux de cannabinoïdes varie fortement selon le phénotype individuel, les conditions de culture et le moment de récolte, même au sein d'un même cultivar. |
| `thcSource`/`cbdSource` | `breeder_claim, lab_tested` | ✅ Distinction essentielle et trop souvent absente des autres apps : un taux "annoncé par le breeder" (souvent optimiste, à but marketing) n'a pas la même valeur qu'un taux **mesuré par COA de laboratoire accrédité**. **Point d'amélioration scientifique concret** : la mesure de labo distingue en réalité **THCA et THC** (et CBDA/CBD) séparément — le taux "THC total" affiché au consommateur est calculé par la formule `THC total = THC + (THCA × 0.877)` (le facteur 0.877 est le ratio de perte de masse molaire lors de la décarboxylation, CO2 relargué). Le schéma actuel (`thcPercent` unique) fusionne implicitement cette distinction — cf. section 3 pour la recommandation de champ. |

## 3. ⚠️ Le point le plus important scientifiquement : Indica / Sativa / Hybride

Le champ `type` de `Cultivar` et `genetics.type` de `GenNode` (`Indica`, `Sativa`, `Hybride`, + `Ruderalis`/`Chanvre` côté nœud) reposent sur une **taxonomie populaire dont la validité scientifique est aujourd'hui largement contestée** :

- Les études de génotypage à grande échelle (notamment Sawler et al. 2015, *PLOS ONE*, analyse de marqueurs génétiques sur des centaines de cultivars commerciaux) montrent que les **étiquettes commerciales "Indica"/"Sativa" ne correspondent pas de façon fiable aux clusters génétiques réels** ni au profil chimique (chimiotype). Un cultivar vendu comme "Sativa pure" peut être génétiquement plus proche d'un cluster "Indica" et inversement.
- L'effet ressenti "Indica = relaxant/corporel" vs "Sativa = énergisant/cérébral" que rapportent les consommateurs est **davantage corrélé au profil terpénique et au ratio THC:CBD réel** qu'à l'ascendance botanique Indica/Sativa au sens historique (morphologie de la plante — feuilles larges vs fines, port court vs élancé — qui elle est réelle botaniquement mais ne prédit pas l'effet).
- La classification scientifiquement la plus robuste actuellement reconnue est le **système de chémotype de de Meijer et al. (2003)** : **Type I** (THC-dominant, ratio THC:CBD élevé), **Type II** (intermédiaire/équilibré THC:CBD ≈ 1:1), **Type III** (CBD-dominant), auquel on ajoute usuellement un **Type IV** (CBG-dominant, cultivars récents à faible THC/CBD). C'est exactement ce que capture déjà le champ `Cultivar.chemotype` (`thc-dominant`/`balanced`/`cbd-dominant`/`high-cbg`) — **ce champ est le bon axe scientifique**, le champ `type` (Indica/Sativa/Hybride) doit être conservé uniquement comme **classification commerciale/déclarative usuelle** (c'est d'ailleurs déjà noté ainsi dans les commentaires du schéma Prisma — bon signal, la réserve scientifique est déjà documentée dans le code).

**Recommandation** : dans toute UI/tooltip visible utilisateur, présenter clairement `type` comme "classification commerciale usuelle (non scientifiquement stricte)" et `chemotype` comme "classification chimique reconnue" — c'est déjà globalement fait dans les commentaires internes (`CultivarsTab.jsx` L61-62), il faudrait vérifier que la tooltip utilisateur reflète bien cette nuance dans l'UI (hors périmètre de cet audit purement data).

## 4. Sexe et reproduction

- Le cannabis est **dioïque** (plantes mâles et femelles séparées, contrairement à la plupart des plantes cultivées hermaphrodites) — le champ `genetics.sex` (`unknown/female/male`) est donc scientifiquement pertinent, contrairement à beaucoup de plantes où ce champ n'aurait pas de sens.
- **Hermaphrodisme** : possible sous stress (lumière, chaleur, dommage physique) — la plante développe alors des fleurs mâles sur un pied femelle ("bananes"), ce qui est déjà capturé par `Recolte`/`hermaphroditism` (`none/rare/moderate/severe`) côté Pipeline Culture (cf. document 06).
- **Féminisation par inversion chimique** (`chemical-feminization` dans `POLLINATION_METHODS`) : traitement au thiosulfate d'argent (STS) ou nitrate d'argent, qui bloque la production d'éthylène et déclenche la formation de fleurs mâles sur une plante génétiquement femelle — le pollen produit ne porte que des chromosomes X, donc 100% de la descendance est féminine. C'est un mécanisme épigénétique/physiologique, **pas** une modification génétique — bien reflété par le libellé actuel.
- **Selfing** (S1/S2) : nécessite la même technique de féminisation appliquée à la plante elle-même pour obtenir du pollen "auto-fécondant" — cohérent avec `selfing-inversion` dans `POLLINATION_METHODS`.

Liste complète `POLLINATION_METHODS` (9 valeurs + vide) — toutes correspondent à des techniques réelles de breeding cannabis : pollinisation ouverte (aléatoire, non contrôlée), manuelle contrôlée, isolement de la mère + mâle sélectionné, sac de pollinisation (isolation physique d'une branche), pinceau (transfert manuel précis), collecte/conservation de pollen (le pollen de cannabis se conserve au congélateur plusieurs mois à années si bien desséché), récolte sur fleurs mâles, inversion de sexe pour le selfing, féminisation chimique. Le backcross (BX) est volontairement exclu de cette liste car déjà capturé par le champ `generation` — c'est cohérent, un backcross est un *objectif de croisement* (quel parent on recroise), pas une *méthode de pollinisation* (comment on transfère le pollen) : les deux axes sont orthogonaux et la séparation est correcte.

## 5. Infos de sélection & caractères techniques

Champs comme `stability`, `uniformity`, `vigor`, `floralDensity`, `branching`, `stretch`, `nutrientSensitivity`, `hermaphroditeTendency` sont explicitement documentés dans le code comme **évaluation qualitative auto-rapportée par l'utilisateur, non issue d'une mesure normalisée** (sectionHint du code) — c'est la bonne posture scientifique : ne pas prétendre à une précision de laboratoire là où il s'agit d'observation terrain empirique.

- `germinationSpeed`, `vegTime`, `floweringTime` (number-unit heures/jours/semaines) : ✅ mesures factuelles standard en horticulture.
- `heterosis` (checkbox "vigueur hybride, si F1") : ✅ concept scientifique réel — l'hétérosis (ou "vigueur hybride") désigne la performance supérieure d'un croisement F1 par rapport à la moyenne de ses deux parents (vigueur de croissance, rendement), phénomène bien documenté en génétique végétale, cohérent de le limiter conceptuellement à F1 (il s'estompe dès F2 par ségrégation).
- `geneticStabilityIndex`, `reproducibilityScore`, `inbreedingLevel` : le code documente lui-même honnêtement l'absence d'échelle standardisée officielle pour les deux premiers — seul `inbreedingLevel` a un ancrage scientifique réel possible : le **coefficient de consanguinité F** (0 à 1, popularisé par Sewall Wright) mesure la probabilité que les deux allèles d'un gène soient identiques par descendance ; il peut être calculé exactement à partir du pedigree (nombre de générations de selfing/backcross) plutôt que laissé en texte libre — piste d'amélioration : calculer `inbreedingLevel` automatiquement depuis la structure de l'arbre généalogique (les données existent déjà via `GenEdge`/`generation`) plutôt que de le laisser en saisie manuelle.

## 6. Statut & fiabilité

- `status` (`prototype/selection/stabilized/commercialized`) et `parentageReliability` (`confirmed/probable/claimed`) : ✅ distinctions utiles et réalistes — beaucoup de généalogies dans l'industrie sont en réalité **non vérifiées génétiquement** (héritage oral/marketing du breeder), la case "claimed (non vérifié)" reflète honnêtement cette réalité du secteur plutôt que de présenter toute généalogie comme un fait établi.
- Vérification génétique réelle possible aujourd'hui : séquençage/génotypage SNP (services commerciaux type Phylos Galaxy, ou tests d'ascendance comparables au séquençage humain grand public) — pourrait justifier un futur champ `geneticVerificationMethod` (`none/snp-genotyping/whole-genome`) si l'app veut aller plus loin que le déclaratif.

## 7. Cannabinoïdes & terpènes — cadre scientifique de référence (transverse à tous les produits)

### Cannabinoïdes (déjà dans le schéma : THC, CBD, CBG, CBC, CBN, THCV)
| Cannabinoïde | Statut scientifique |
|---|---|
| THC (Δ9-tétrahydrocannabinol) | Psychoactif principal, agoniste partiel des récepteurs CB1 (SNC) et CB2 (système immunitaire) |
| CBD (cannabidiol) | Non intoxicant, modulateur allostérique négatif du CB1 (atténue en partie les effets du THC), mécanisme d'action large et encore partiellement compris (récepteurs sérotoninergiques 5-HT1A notamment) |
| CBG (cannabigérol) | Précurseur biosynthétique de tous les autres cannabinoïdes (CBGA est le "cannabinoïde mère" dont dérivent enzymatiquement THCA, CBDA, CBCA) — présent en faible quantité dans la plupart des cultivars matures car converti en cours de croissance, d'où l'intérêt des cultivars "high-CBG" sélectionnés pour bloquer cette conversion |
| CBC (cannabichromène) | Non intoxicant, peu étudié cliniquement comparé à THC/CBD |
| **CBN (cannabinol)** | ⚠️ Point scientifique important : le CBN **n'est pas synthétisé directement par la plante en quantité significative** — c'est principalement un **produit de dégradation oxydative du THC** dans le temps (exposition à l'air/lumière/chaleur). Un taux de CBN élevé est donc un **marqueur de vieillissement/oxydation** du produit plutôt qu'un trait variétal — cohérent avec son usage dans l'app comme mesure de "curing"/conservation plutôt que comme trait génétique intrinsèque. |
| THCV (tétrahydrocannabivarine) | Analogue du THC à chaîne propyle (au lieu de pentyle) — effets rapportés différents (moins sédatif, potentiellement coupe-faim à l'inverse du THC) mais littérature clinique encore limitée |

**Recommandation d'amélioration** : distinguer explicitement, dans un futur schéma de "Données analytiques", les formes **acides** (THCA, CBDA, CBGA — présentes dans la plante fraîche/non chauffée, non intoxicantes) des formes **neutres/actives** (THC, CBD, CBG — après décarboxylation). Actuellement le schéma n'a que `thcPercent`/`cbdPercent` etc. sans préciser s'il s'agit du total calculé ou d'une des deux formes — c'est la pratique de terrain courante (les COA réels de laboratoire distinguent toujours les deux).

### Terpènes (`client/src/data/terpenes.js`)
✅ Les terpènes sont des composés aromatiques réellement biosynthétisés par les trichomes du cannabis (même voie métabolique — méthylérythritol phosphate/MEP — que la biosynthèse des cannabinoïdes, d'où une corrélation observée entre profil terpénique et chimiotype). La liste de terpènes du fichier (Myrcène, Limonène, Pinène, Caryophyllène, Linalol, Humulène, Terpinolène, etc. selon contenu exact du fichier) correspond aux terpènes effectivement les plus documentés dans la littérature sur le cannabis.

**Nuance scientifique à garder en tête** : l'**"entourage effect"** (hypothèse selon laquelle terpènes et cannabinoïdes agiraient en synergie pour moduler l'effet ressenti, popularisée par Russo 2011) reste une **hypothèse partiellement étayée mais pas définitivement démontrée cliniquement** à ce jour — à traiter dans l'app comme un cadre explicatif plausible et largement utilisé par l'industrie, pas comme un fait clinique établi au même niveau que la pharmacologie du THC/CBD eux-mêmes.

## 8. Synthèse des champs à considérer pour une v2 (opportunités, pas des bugs)

1. Distinguer THCA/CBDA (formes acides) des formes neutres THC/CBD dans les données analytiques.
2. Calculer `inbreedingLevel` automatiquement à partir de la structure d'arbre plutôt qu'en saisie libre.
3. Clarifier/fusionner le chevauchement conceptuel entre `origin` et `geneticType` (GenNode) qui capturent deux axes différents avec un vocabulaire qui se recoupe partiellement.
4. Ajouter `IBL` à la liste `generation` du GenNode pour cohérence avec `Cultivar.generationStatus` qui l'a déjà.
5. Champ optionnel `geneticVerificationMethod` si l'app veut un jour distinguer généalogie déclarée vs génotypage réel (SNP).
