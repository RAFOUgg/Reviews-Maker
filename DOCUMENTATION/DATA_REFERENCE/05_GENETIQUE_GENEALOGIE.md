# Génétique & Généalogie (PhenoHunt) — inventaire, options, véracité scientifique

> Source du code : `client/src/config/phenoNodeFields.js`, `client/src/components/genetics/NodeFormModal.jsx`, `EdgeFormModal.jsx`, `client/src/pages/library/tabs/CultivarsTab.jsx`, modèles Prisma `Cultivar`/`GeneticTree`/`GenNode`/`GenEdge` (`server-new/prisma/schema.prisma`).
>
> **Sourcing** : conforme au brief méthodologique `terpologie-knowledge-base-brief.md` — chaque citation renvoie à un `id` du registre **[13_REGISTRE_SOURCES.md](13_REGISTRE_SOURCES.md)** (tier de preuve T1-T5, `contested`, `uncertainty`). Sauf mention contraire, les citations de ce document sont **T1** (peer-reviewed).

## Principe non négociable — nom de variété ≠ génotype ≠ effet

Rappel du brief (§0, réflexe non négociable) : **la nomenclature "Indica/Sativa" et les noms commerciaux sont scientifiquement peu fiables** (croisements clandestins sans pedigree vérifié). Toute donnée de ce document doit se rattacher en priorité à un **chémotype mesuré** (`chemotype`) et, si possible, à un **génotype** (marqueurs SNP), jamais à un nom marketing seul — cf. `sawler2015` §3 ci-dessous pour la quantification exacte de ce risque.

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

> Section mise à jour et précisée à partir d'une synthèse scientifique dédiée (« De 420 à 710 », M.R. — Terpologie, 2023-2025) qui confirme et quantifie exactement le point déjà soulevé ici.

Le champ `type` de `Cultivar` et `genetics.type` de `GenNode` (`Indica`, `Sativa`, `Hybride`, + `Ruderalis`/`Chanvre` côté nœud) reposent sur une **taxonomie populaire dont la validité scientifique est aujourd'hui largement contestée** :

- **Chiffre précis** (`sawler2015`, T1) : Sawler et al. (2015, *PLOS ONE* 10:e0133292) ont génotypé 81 individus étiquetés sativa/indica/chanvre/hybride à l'aide de 13 marqueurs microsatellites (SSR) — résultat : **plus de 35 % des variétés vendues commercialement comme "sativa" présentaient un profil génétique indiscernable de lignées indica, et vice versa**. La distinction phénotypique/commerciale apparaît comme une catégorisation héritée du marketing plus qu'une réalité génomique stable. `uncertainty` : échantillon de 81 individus, résultat robuste mais à ne pas sur-généraliser à 100% du marché mondial.
- L'effet ressenti "Indica = relaxant/corporel" vs "Sativa = énergisant/cérébral" que rapportent les consommateurs est **davantage corrélé au profil terpénique et au ratio THC:CBD réel** qu'à l'ascendance botanique Indica/Sativa au sens historique (morphologie de la plante — feuilles larges vs fines, port court vs élancé — qui elle est réelle botaniquement et bien documentée, cf. tableau ci-dessous, mais ne prédit pas l'effet).
- Sur le plan **botanique morphologique** (indépendamment de la question de l'effet), les 3 sous-types restent des repères empiriquement valides (Small & Cronquist 1976 ; Hillig 2005 ; Clarke & Merlin 2013) :

| Caractère | *C. sativa s.s.* | *C. indica* | *C. ruderalis* |
|---|---|---|---|
| Hauteur adulte | 1,5-6 m | 0,6-1,5 m | 0,3-0,8 m |
| Architecture | Élancée, internœuds longs | Compacte, internœuds courts | Très petite, peu ramifiée |
| Folioles/feuille | 7-11 | 5-7 (parfois 9) | 3-5 |
| Cycle floraison | 10-16 semaines | 7-10 semaines | 5-9 sem. (autofleurissante) |
| Réponse photopériodique | Forte (jours courts) | Modérée (jours courts) | Aucune (autonome) |
| Origine géographique | Tropicale, équatoriale | Subtropicale, montagneuse | Tempérée, continentale |

  Ces caractères morphologiques/culturaux sont réels et documentés — ce qui est scientifiquement contesté, c'est leur usage comme **prédicteur fiable de composition chimique ou d'effet** sur des cultivars commerciaux hybrides modernes, précisément parce que 35 %+ d'entre eux ne correspondent pas génétiquement à leur étiquette (cf. Sawler ci-dessus).

- **Classification chémotypique de référence actualisée** (`mcpartland2018`, T1) : McPartland (2018, *Cannabis Cannabinoid Res.* 3:203-212) propose **5 chémotypes** basés sur le ratio THCA/CBDA — une mise à jour du système attribué à de Meijer et al. (2003) qui n'en comptait que 3-4 (⚠️ `demeijer2003` : citation reprise de connaissance générale, **non vérifiée directement dans une source consultée cette session** — cf. registre, à confirmer avant réutilisation stricte de cette attribution historique) :

| Type | Définition | Équivalent app (`Cultivar.chemotype`) |
|---|---|---|
| **Type I** | THC dominant (>0,3 %), CBD <0,5 % | `thc-dominant` |
| **Type II** | THC et CBD intermédiaires (≈équilibré) | `balanced` |
| **Type III** | CBD dominant, THC <0,3 % (chanvre médical) | `cbd-dominant` |
| **Type IV** | CBG dominant (mutation rare des synthases terminales) | `high-cbg` |
| **Type V** | Cannabinoïdes négligeables (chanvre industriel/fibre) | ❌ **absent de l'enum actuel** |

  Cette classification chémotypique est **aujourd'hui le standard de référence pharmaceutique et analytique**, supplantant largement la classification morphologique — confirmé explicitement par la conclusion de la synthèse (§15.1) : *« La classification morphologique indica/sativa est scientifiquement insuffisante et doit être systématiquement complétée — voire remplacée — par une caractérisation chémotypique... La notion de chémovar constitue désormais le standard de référence. »* **Recommandation concrète** : ajouter l'option manquante `negligible` ("Type V — cannabinoïdes négligeables / chanvre") à l'enum `Cultivar.chemotype`, qui n'en compte actuellement que 4 sur les 5 types scientifiquement reconnus.

- **Base génomique** : le génome diploïde de *Cannabis sativa* (818 Mb, 2n=20, séquencé par Bakel et al. 2011 et raffiné par Grassa et al. 2018/2021) regroupe les gènes de biosynthèse cannabinoïdienne (THCA/CBDA/CBCA synthases) **en cluster sur le chromosome 6 (locus B)** — cette architecture génomique explique directement pourquoi le chémotype se transmet de façon relativement mendélienne simple (locus unique) alors que la morphologie Indica/Sativa, elle, est polygénique et se dilue rapidement par croisement — ce qui explique concrètement *pourquoi* le chémotype est un marqueur plus stable et prédictif que l'étiquette Indica/Sativa d'un point de vue moléculaire.

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

### Cannabinoïdes (déjà dans le schéma : THC, CBD, CBG, CBC, CBN, THCV) — pharmacologie précise

> Table de référence (Ki = constante d'inhibition, plus la valeur est basse plus l'affinité est forte ; LD₅₀ = dose létale médiane orale rat). Toutes les entrées sont **T1** (peer-reviewed) — voir `id` registre en dernière colonne.

| Cannabinoïde | Ki CB1 (nM) | Ki CB2 (nM) | LD₅₀ oral rat | Mécanisme principal | Propriétés documentées | Tier / `contested` | id registre |
|---|---|---|---|---|---|---|---|
| **Δ⁹-THC** | 41 ± 2 | 36 ± 2 | 800-1000 mg/kg (~50 000× la dose psychoactive humaine) | Agoniste **partiel** CB1 (Emax≈56 %) et CB2 (Emax≈76 %) | Psychoactif principal ; métabolisé par CYP2C9/3A4 en 11-OH-THC (2-3× plus puissant) | T1 | `pertwee2008` |
| **CBD** | >2860 | >3780 | >2000 mg/kg | Modulateur allostérique **négatif** de CB1 (atténue le THC) ; inhibiteur FAAH (IC₅₀≈27µM) ; agoniste 5-HT1A ; antagoniste GPR55 | Antiépileptique (Epidiolex®, FDA 2018), anxiolytique, anti-inflammatoire, neuroprotecteur | T1 | `laprairie2015` |
| **CBG** | >30 000 | 350 ± 25 | N.D. | Faible affinité CB1/CB2 directe — agoniste **α2-adrénergique puissant** (Ki=0,2µM), antagoniste partiel 5-HT1A | Précurseur universel (CBGA) ; neuroprotecteur ; antibactérien puissant (CMI=2µg/mL contre MRSA, comparable à la vancomycine) | T1 | `cascio2010` |
| **CBC** | 510 ± 50 | 620 ± 60 | >100 mg/kg | Agoniste **TRPA1/TRPV3/TRPV4** (pas CB1/CB2 principalement) | Anti-inflammatoire, analgésique (synergie THC), neuroprotecteur, antibactérien | T1 | `pertwee2008` |
| **CBN** | 211 ± 42 | 126 ± 22 | >10 000 mg/kg | Agoniste partiel, préférentiel CB2 | ⚠️ **N'est pas synthétisé directement par la plante en quantité significative** — produit de dégradation oxydative/photochimique du THC (marqueur de vieillissement, cf. document 06). Puissance psychoactive ~5-10× inférieure au THC. | T1, **`contested`** sur l'attribution de l'effet sédatif (`hlozek2017` suggère que l'effet vient du THC résiduel + terpènes co-présents, pas du CBN lui-même) | `karniol1975`, `hlozek2017` |
| **THCV** | 30 ± 4 | 63 ± 6 | 663 mg/kg | **Antagoniste neutre** CB1 à faible dose (<5mg), agoniste partiel CB2 à dose plus élevée | Anorexigène (coupe-faim, à l'inverse du THC), antidiabétique, antiépileptique préclinique | T1, `uncertainty` : essai clinique antidiabétique à petit effectif | `jadoon2016` |
| β-Caryophyllène (terpène-cannabinoïde) | >10 000 | 155 ± 50 | >5000 mg/kg | Agoniste **sélectif CB2** — seul terpène connu à agir directement sur un récepteur cannabinoïde | Anti-inflammatoire puissant sans psychoactivité — statut de "cannabinoïde alimentaire" | T1 | `gertsch2008` |

**Formes acides (THCA, CBDA) — non capturées par le schéma actuel** : ce sont les formes **naturellement présentes dans la plante fraîche/séchée non chauffée**, non psychoactives (faible affinité CB1) mais biologiquement actives par d'autres voies : THCA = anti-inflammatoire (inhibition COX-1/COX-2), neuroprotecteur, antiémétique via 5-HT1A (efficacité comparable à l'ondansétron en modèle murin, Rock et al. 2013) ; CBDA = agoniste 5-HT1A avec affinité **supérieure** au CBD lui-même (Bolognini et al. 2013), biodisponibilité orale significativement supérieure au CBD. Le "THC total" affiché sur un COA réel est calculé par `THC total = THC + (THCA × 0,877)` — le facteur 0,877 étant le ratio de perte de masse molaire lors de la décarboxylation (CO2 relargué).

**Recommandation d'amélioration inchangée** : distinguer explicitement, dans un futur schéma de "Données analytiques", les formes acides (THCA/CBDA/CBGA) des formes neutres — cf. document 01 §5.

### ⚠️ Cannabinoïdes synthétiques — distinction de sécurité critique (hors périmètre actuel de l'app, à ne jamais confondre)
Les cannabinoïdes de synthèse (JWH-018, HU-210, AM-2201, etc. — "Spice"/"K2") sont des **agonistes complets** de CB1 (Emax≈100 % contre 56 % pour le THC, sans plafonnement protecteur), avec des affinités 5 à 700 fois supérieures au THC (HU-210 : Ki=0,06nM). Toxicité aiguë documentée : convulsions, arythmies ventriculaires, insuffisance rénale aiguë, décès rapportés (épidémie AMB-FUBINACA, New York 2016, 33 patients, *NEJM* 2017). **Ne présentent aucune analogie de sécurité avec les phytocannabinoïdes naturels** — mention utile si l'app devait un jour aborder la sécurité/mise en garde produit.

### Biologie des trichomes — fondement physique du champ `trichomesScore`/`trichomes`

> Les scores visuels de densité de trichomes (Fleur, document 01 §6) reposent en réalité sur une classification morphologique précise (Dayanandan & Kaufman 1976 ; Livingston et al. 2020, *Plant J.* 101:37-56) :

| Type de trichome | Taille | Localisation | Contenu cannabinoïdique | Rôle |
|---|---|---|---|---|
| Bulbeux unicellulaires | 10-15 µm | Feuilles, tiges, pétioles | <1 µg/trichome | Précurseur, biosynthèse initiale |
| Capités-sessiles | 20-30 µm | Feuilles, tiges, bractées | 1-5 µg/trichome | Biosynthèse intermédiaire |
| **Capités-pédiculés** | **50-500 µm** | Bractées, calices, sugar leaves | **5-50 µg/trichome** | **Majeur — >90 % de la production totale** |
| Anthérides (mâles) | 30-80 µm | Fleurs mâles uniquement | 0,5-2 µg/trichome | Minoritaire (10-50× moins concentré) |
| Cystolithiques | Variable | Surface foliaire | CaCO₃, aucun cannabinoïde | Fonction structurale/défensive uniquement |

Le trichome capité-pédiculé (le seul visuellement dominant et pertinent pour le score `trichomes`) a une architecture précise : pédoncule pluricellulaire, rosette basale de 8-16 cellules sécrétrices, cavité sub-cuticulaire de stockage (70-200 picolitres), cuticule externe imperméable contenant la résine. Densité maximale documentée sur cultivars élites : **800 à 1200 trichomes/mm²** de surface bractéale — au-delà de laquelle les teneurs en cannabinoïdes totaux peuvent dépasser 30 % du poids sec. Cela confirme scientifiquement que le score visuel "densité de trichomes" est un **vrai proxy biologique** de la capacité de production de résine (pas juste une impression esthétique) — mais reste un proxy de *densité*, pas de *contenu par tête* (deux cultivars à densité trichomale égale peuvent avoir des têtes de tailles/contenus différents, invisibles à l'œil nu ou même au grossissement standard).

**Biosynthèse cannabinoïdienne (résumé mécanistique)** : voie polycétide (acide olivétolique, OLA) + voie isoprénoïde plastidiale (géranyl pyrophosphate, GPP) → couplage par la GOT/PT4 → **CBGA** (précurseur universel) → trois synthases terminales concurrentes sécrétées dans la cavité de stockage (THCA synthase, CBDA synthase, CBCA synthase) → THCA/CBDA/CBCA. Fait notable : ces enzymes sont sécrétées **hors des cellules** (extracellularisation), ce qui protégerait la plante de la cytotoxicité de ses propres cannabinoïdes (THCA documenté cytotoxique pour les cellules végétales >1mM). Base moléculaire directe de la sélection assistée par marqueurs (cf. document 08 §1).

### Terpènes (`client/src/data/terpenes.js`)
✅ Les terpènes sont des composés aromatiques réellement biosynthétisés par les trichomes du cannabis (même compartimentation cellulaire que les cannabinoïdes, voies biosynthétiques MVA cytoplasmique → sesquiterpènes/C15, et MEP plastidiale → monoterpènes/C10, d'où une corrélation observée entre profil terpénique et chémotype). Plus de **200 terpènes distincts** identifiés dans *Cannabis sativa* par GC-MS (Booth & Bohlmann 2019) ; ils représentent 0,5-1 % du poids sec en fleur fraîche (jusqu'à 3-5,5 % pour des chémotypes d'exception, Hazekamp & Fischedick 2012). Les monoterpènes dominent en fleur fraîche (80-90 % du profil), les sesquiterpènes (10-20 %) prennent proportionnellement plus de poids après séchage/stockage du fait de leur plus faible volatilité (cf. document 06 §2, ratio monoterpènes/sesquiterpènes qui chute de 5,5 à 2,8 entre semaines 7 et 13 de floraison).

| Classe | Formule | Représentants dans *Cannabis sativa* |
|---|---|---|
| Monoterpènes acycliques | C₁₀H₁₆ | Myrcène, Ocimène, Linalol, Géraniol, Citronellol |
| Monoterpènes monocycliques | C₁₀H₁₆ | Limonène, Terpinolène, α-Terpinéol, p-Cymène |
| Monoterpènes bicycliques | C₁₀H₁₆ | α-Pinène, β-Pinène, Δ³-Carène, Sabinène, Camphène, Eucalyptol |
| Sesquiterpènes | C₁₅H₂₄ | β-Caryophyllène, α-Humulène, Nérolidol, α-Bisabolol, Valencène, Guaiol |

La liste de terpènes du fichier (Myrcène, Limonène, Pinène, Caryophyllène, Linalol, Humulène, Terpinolène, etc.) correspond aux terpènes effectivement les plus documentés dans la littérature sur le cannabis — cohérente avec cette classification.

**`contested = true` — voir `contested-entourage` dans le registre** : l'**"entourage effect"** (hypothèse selon laquelle terpènes et cannabinoïdes agiraient en synergie pour moduler l'effet ressenti, formulée par `benshabat1998` et popularisée par `russo2011`) reste une **hypothèse partiellement étayée mais pas définitivement démontrée cliniquement** à ce jour. Conformément au réflexe non négociable du brief méthodologique (« stocker le contradictoire, jamais trancher unilatéralement »), il faut noter explicitement la **position critique** : des études (dont une publiée dans *Frontiers in Pharmacology* en 2020, non consultée directement cette session — à vérifier) indiquent que les terpénoïdes n'agiraient pas directement aux récepteurs cannabinoïdes, et que des essais comparant THC pur vs fleur entière ne montrent pas toujours de différence significative. À traiter dans l'app comme un cadre explicatif plausible et largement utilisé par l'industrie, **jamais comme un fait clinique établi** au même niveau que la pharmacologie du THC/CBD eux-mêmes. Seule exception notable et non contestée : le **β-caryophyllène agit directement comme agoniste CB2** (`gertsch2008`) — à la différence des autres terpènes, un cas où l'effet pharmacologique direct sur le système endocannabinoïde est déjà établi T1 et pas seulement hypothétique.

## 8. Synthèse des champs à considérer pour une v2 (opportunités, pas des bugs)

1. Distinguer THCA/CBDA (formes acides) des formes neutres THC/CBD dans les données analytiques.
2. Calculer `inbreedingLevel` automatiquement à partir de la structure d'arbre plutôt qu'en saisie libre.
3. Clarifier/fusionner le chevauchement conceptuel entre `origin` et `geneticType` (GenNode) qui capturent deux axes différents avec un vocabulaire qui se recoupe partiellement.
4. Ajouter `IBL` à la liste `generation` du GenNode pour cohérence avec `Cultivar.generationStatus` qui l'a déjà.
5. Champ optionnel `geneticVerificationMethod` si l'app veut un jour distinguer généalogie déclarée vs génotypage réel (SNP).
6. **Ajouter l'option manquante `negligible` ("Type V — cannabinoïdes négligeables/chanvre") à `Cultivar.chemotype`** — la classification scientifique de référence (McPartland 2018) en compte 5, l'app n'en expose que 4.
