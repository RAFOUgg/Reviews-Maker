# Pipelines transverses — Culture, Curing, Séparation, Extraction, Purification, Recette

> Ces 6 pipelines sont partagés par les 4 types de review (chacun n'active que les pipelines pertinents : Fleur=Culture+Curing ; Hash=Séparation+Purification+Curing ; Concentré=Extraction+Purification+Curing ; Comestible=Recette). Source : `client/src/config/pipelineConfigs.js`, `cultureSidebarContent.js`, `curingSidebarContent.js`, `separationSidebarContent.js`, `extractionSidebarContent.js`, `purificationSidebarContent.js`, `pipelinePhases.js`, `intervalTypes.js`, `pipelineStarterSetups.js`, `data/cultureFormData.js`.
>
> ⚠️ Principe déjà documenté dans le code (`pipelineConfigs.js`) : tous les champs numériques sont des bornes UI indicatives (sliders/suggestions), **pas** des contraintes serveur strictes — cohérent avec la variabilité réelle des pratiques de terrain (un grower peut légitimement sortir des plages "standard").
>
> **Sourcing** : citations renvoyant à un `id` du registre **[13_REGISTRE_SOURCES.md](13_REGISTRE_SOURCES.md)** — tier T1 (peer-reviewed) sauf mention explicite T3/T4 (matériel/praticiens, à valider empiriquement selon le brief méthodologique).

## 1. Pipeline Culture (Fleur)

### 1.1 Intervalles disponibles
`phases` (max 12, prédéfinies), `jour` (365), `semaine` (52), `mois`/`annee`. Les 12 phases physiologiques prédéfinies (graine → germination → plantule → croissance début/milieu/fin → stretch début/milieu/fin → floraison début/milieu/fin) ✅ **correspondent au cycle de vie réel documenté du cannabis photopériodique** : le "stretch" (étirement rapide en début de floraison, la plante peut doubler de hauteur) est un phénomène physiologique bien connu et bien isolé ici comme sous-phase distincte — bonne granularité.

### 1.2 Général
`mode` (indoor/outdoor/greenhouse/no-till/other), `spaceType` (tente/armoire/chambre/serre/extérieur/guerilla), dimensions (L×l×H cm), densité de plantation (0.5-16 plantes/m², repères SOG "faible→très dense" cohérents avec les densités réelles observées en Sea of Green).

### 1.3 Environnement — propagation & substrat
- `propagation` : graine/clone/bouture/tissu — ✅ les 3 voies de multiplication réelles du cannabis (graine = reproduction sexuée, clone/bouture = reproduction végétative génétiquement identique à la mère, culture de tissu = multiplication in vitro, cf. document 08).
- `substrateType` : terreau/coco/laine de roche/sol vivant/hydro (DWC/NFT/aéro) — ✅ couvre l'éventail réel des substrats en usage, y compris le spectre inerte→organique qui a un vrai impact sur la disponibilité des nutriments et le rôle de la microbiologie du sol (living soil = fertilité portée par un écosystème microbien actif, pas d'apport minéral).
- `waterPH` (4.5-8.0, zones 5.5-6.5 terre / 5.8-6.2 hydro) : ✅ **conforme à la littérature horticole** — le cannabis absorbe le mieux ses nutriments dans ces plages ; en dehors, certains éléments minéraux se précipitent ou deviennent indisponibles (verrouillage/"lockout" nutritif), phénomène bien documenté indépendamment du cannabis (courbe de disponibilité des nutriments de Mulder, valable pour la plupart des cultures).
- `waterEC` (0.2-3.0 mS/cm, zones croissance 0.8-1.2 / floraison 1.2-2.0) : ✅ cohérent avec la pratique — la demande en nutriments augmente en floraison (formation des fleurs, forte demande en phosphore/potassium) puis peut redescendre en toute fin de cycle ("flush").

### 1.4 Nutrition
`fertilizerType` (organic/mineral/organo-mineral/living-soil/other) — ✅ distinction agronomique réelle. `fertilizerLine` (grow/bloom/booster/calmag/pk/enzymes/microbes/vitamins) : reflète le découpage marketing standard de l'industrie des engrais horticoles (Grow=azote dominant pour la croissance végétative, Bloom=phosphore-potassium dominant pour la floraison) — cohérent avec les besoins physiologiques réels (ratio N:P:K qui doit s'inverser entre croissance et floraison).

### 1.5 Lumière
- `lightType` (LED/HPS/MH/CMH/CFL/naturel/mixte), `photoperiod` (presets 18/6, 20/4, 24/0, 12/12) — ✅ le 12/12 est le déclencheur photopériodique standard de floraison en indoor (simule le raccourcissement des jours d'automne), le 18/6 ou 20/4 sont des standards de croissance végétative, le 24/0 n'a de sens que pour les génétiques auto-florissantes (non sensibles au photopériodisme).
- `ppfd` (200-1200 µmol/m²/s) et `dli` (10-60 mol/m²/j) : ✅ ce sont les deux **métriques scientifiques standard** de mesure de la lumière utile à la photosynthèse (PPFD = intensité instantanée, DLI = intégrale journalière) — leur présence conjointe est correcte techniquement (le DLI est calculable à partir du PPFD et de la photopériode, `DLI = PPFD × heures_lumière × 3600 / 1 000 000`), les zones proposées (400-600 croissance, 600-900 floraison, 900-1200 intense/CO2) sont cohérentes avec les recommandations horticoles actuelles pour le cannabis.
- `spectrum` (full/veg/bloom/uv/farred/other) : ✅ le rouge lointain (far-red, ~730nm) est documenté scientifiquement pour son rôle dans l'effet Emerson et la régulation du phytochrome (influence la morphologie/l'étirement) — champ scientifiquement fondé, pas un gadget marketing.

### 1.6 Climat
- `vpd` calculé par la formule de Tetens (`svp = 0.6108 × exp(17.27T/(T+237.3))`) : ✅ **formule standard et correcte** d'estimation de la pression de vapeur saturante ; le VPD (Vapor Pressure Deficit) est aujourd'hui considéré comme un pilote de référence plus fiable que l'humidité relative seule pour l'irrigation/climatisation, car il intègre la température — bon niveau de rigueur technique pour un champ "calculé" plutôt que déclaré.
- `co2Level` (400-1600 ppm, zones 800-1200 enrichi / 1200-1500 très enrichi) : ✅ cohérent — l'enrichissement CO2 n'a d'effet que si la lumière et la température ne sont pas limitantes (loi du facteur limitant de Liebig), point qui n'est pas explicité dans un champ mais qui devrait idéalement apparaître en aide contextuelle.

### 1.7 Palissage (training)
`trainingMethods` (LST, HST, topping, FIM, mainlining, SCROG, SOG, supercropping, defoliation, lollipopping, schwazzing) — ✅ liste exhaustive et correcte des techniques de conduite réellement utilisées, y compris des techniques plus confidentielles (schwazzing = défoliation massive à deux moments précis du cycle, popularisée par le grower "The Man in Black").

### 1.8 Récolte

> Mis à jour à partir d'une synthèse scientifique dédiée (« De 420 à 710 », M.R. — Terpologie, 2023-2025) — la corrélation couleur des trichomes/biochimie/effet est en réalité **quantifiée**, pas seulement une impression de terrain.

- `trichomeColor` (clear/milky/amber, avec %) : ✅ heuristique de terrain **plus précise qu'on ne le pensait**, quantifiée par Booth & Bohlmann (2019, *Plant Science* 284:67-72) et Livingston et al. (2020, *Plant J.* 101:37-56) :

| Stade | Couleur | Biochimie dominante | Profil d'effets attendu | Fenêtre |
|---|---|---|---|---|
| Précoce | Transparent, clair | CBGA résiduel >5 %, THCA en accumulation, monoterpènes dominants | Léger, stimulant, énergisant | 1-2 sem. avant maturité optimale |
| Optimal | Laiteux, opaque blanc | THCA/CBDA au pic, terpènes à l'apogée, CBGA <2 % | Équilibré cérébral + physique | Fenêtre de 3-7 jours |
| Sur-maturité précoce | 30-50 % ambré | Début THCA→CBNA, monoterpènes en déclin (-20 à -30 %) | Plus relaxant, sédatif léger | 7-10 j après stade laiteux |
| Sur-maturité avancée | >70 % ambré | CBNA→CBN majoritaire, dégradation terpénique marquée | Fortement sédatif, puissance réduite | >14 j après stade laiteux |

  Étude longitudinale de référence (`aizpurua2016`, T1, 6 chémotypes suivis — `uncertainty` : échantillon limité à 6 chémotypes, généralisabilité à recouper) : le THC total culmine entre les **semaines 9 et 11** post-induction florale (18 à 31 % du poids sec selon cultivar) ; le ratio monoterpènes/sesquiterpènes chute de **5,5 à 2,8** entre les semaines 7 et 13 (volatilité différentielle) — une récolte tardive perd donc mécaniquement en fraîcheur terpénique même si le taux de cannabinoïdes reste élevé. Cela reste une **tendance biologique documentée**, pas une horloge universelle à la seconde près : la cinétique exacte varie selon cultivar, lumière et température — le champ reste donc à bon droit un indicateur terrain, mais un indicateur **beaucoup mieux corrélé chimiquement qu'un simple repère visuel empirique**.
- `pistilColor` (blanc/mixte/orange/brun) : ✅ indicateur terrain complémentaire réel — 70 à 90 % de pistils orangés signale une phase de maturité avancée (repère macroscopique visible à l'œil nu, contrairement aux trichomes qui demandent un grossissement) — mais corrélation chimique plus lâche que la couleur des trichomes.
- `hermaphroditism`, `moldDetected`, `pestDamage` (none/light/moderate/severe) : ✅ échelles qualitatives standard pour du reporting terrain, cohérentes.

## 2. Pipeline Curing (Fleur, Hash, Concentré)

- `curingType` (froid <5°C / chaud >5°C / ambiante / contrôlée) et `targetHumidity` (55-62% fleurs, 62-65% hash, défaut 62%) : ✅ **cohérent avec la pratique de référence** de l'industrie (souvent citée autour de 58-62% HR pour la fleur en bocal) — en dessous, risque de dégradation aromatique par dessiccation excessive ; au-dessus, risque de moisissure. Précision scientifique (`synthese_420_710` §9.1, sources primaires T1 non individuellement identifiées pour ce passage — `uncertainty`) : en dessous de **45 % HR**, dessiccation excessive et fragilisation des têtes glandulaires ; au-dessus de **65 % HR**, risque significatif de développement fongique — *Botrytis cinerea*, *Aspergillus flavus* (mycotoxine aflatoxine B1), *Penicillium* spp. (ochratoxine A) ; entre 0°C et 20°C, la conservation est stable, au-delà de 25°C les monoterpènes s'évaporent significativement (jusqu'à **-30 % en 6 mois** à température ambiante non contrôlée).
- Mécanisme "burping" (ouverture périodique du bocal) : ✅ pratique réelle et recommandée pour évacuer l'humidité/l'éthylène excédentaire en début de cure sans assécher le produit. Remplissage recommandé du contenant : **75 % du volume** (25 % d'espace de tête) — cet espace partiellement saturé en terpènes volatils crée une pression de vapeur protectrice qui ralentit les pertes ultérieures par évaporation (mécanisme physico-chimique précis, pas une simple habitude).
- `containerOpacity` (opaque/semi-opaque/transparent/ambré/noir) : ✅ fondement scientifique réel et **quantifié** — les UV-A (315-400nm) induisent la photoisomérisation du THC en CBN avec une constante cinétique **k₁ = 1,2×10⁻⁴ h⁻¹ sous 50 W/m² UV-A** (`trofin2012`, T1), d'où l'intérêt réel (pas seulement présumé) du verre ambré/stockage opaque pour la conservation à long terme.
- Le `moldRisk` (0-10) croisé avec humidité/température est cohérent avec les conditions favorables réelles au développement de moisissures (*Botrytis cinerea* notamment, "bud rot") : humidité excessive + mauvaise circulation d'air.
- **Pour un stockage >1 an ou un usage de référence analytique** : l'atmosphère inerte (azote/argon) ou le vide partiel éliminent l'oxygène et suppriment les voies d'oxydation — piste de champ futur (`atmosphereType: air/azote/argon/vide`) non capturée actuellement par `curingSidebarContent.js`.

### 2.1 Chimie du vieillissement/affinage — tableau de référence

Le curing est une maturation chimique contrôlée, analogue conceptuel au vieillissement du vin ou à l'affinage du fromage (source : synthèse §9.2-9.3) :

| Réaction | Substrats | Produits | Cinétique | Conséquence organoleptique |
|---|---|---|---|---|
| Oxydation cannabinoïdes | Δ⁹-THC + O₂ | CBN + 2H₂O (lente) | k=10⁻⁴ h⁻¹ à 25°C, accélérée par UV | Effet "stone" accentué, puissance réduite, couleur ambrée |
| Oxydation terpènes monocycliques | Limonène, α-pinène + O₂ | Carvone, oxydes de pinène, époxydes | Auto-oxydation, accélérée par chaleur | Arômes plus complexes ; toxicité potentielle (allergènes) |
| Décarboxylation | THCA/CBDA/CBCA + chaleur | THC/CBD/CBC + CO₂ (irréversible) | t½ = 6 min à 140°C (Wang 2016) | Activation psychoactive, modification des ratios |
| Dégradation chlorophyllienne | Chlorophylle a, b | Phéophytine, phéophorbide, aldéhydes | Lente, accélérée lumière+chaleur | Réduction amertume, vert→olive→brun |
| Évaporation de l'eau | H₂O résiduelle | Vapeur d'eau | Loi de Fick (diffusion) | Stabilisation microbienne, texture friable |
| Hydrolyse des esters | Acétates de terpényle | Acides + alcools libres | Lente en absence d'eau libre | Modification aromatique |
| Estérification (Fischer) | Acides + alcools terpéniques | Esters aromatiques | Réversible, catalysée par acides | Notes florales/fruitées plus prononcées |
| Isomérisation Δ⁹→Δ⁸-THC | Δ⁹-THC + acides + chaleur | Δ⁸-THC (plus stable) | Catalysée par milieu acide | Profil psychoactif plus calme |
| Fragmentation sesquiterpénique | β-Caryophyllène, humulène | Sesquiterpènes plus petits, isoprène | T°>40°C, durée prolongée | Appauvrissement aromatique |

**Indicateurs empiriques de qualité d'affinage** (§9.4) : un curing réussi donne une texture cassante/friable (solide) ou une viscosité élastique stable (sauce/HTFSE), une couleur ambrée à miel doré uniforme, un profil aromatique complexe et harmonieux. À l'inverse, une résine "trop molle" signale un affinage insuffisant (excès d'eau, décarboxylation incomplète) ; une résine "cuite" (excès d'affinage/chaleur) est **irréversiblement altérée** — perte de puissance, arômes acides, parfois traces de combustion à la dégustation — par analogie au vin suroxydé ayant dépassé sa fenêtre de consommation. Citation représentative (Frenchy Cannoli) : *« L'affinage est un dialogue entre le temps et la résine, non une transformation forcée. »*

## 3. Pipeline Séparation (Hash)

- `separationType` (ice-water/dry-sift/ice-o-lator/rosin-press/manual) : ✅ couvre les méthodes réelles de séparation mécanique des trichomes (sans solvant chimique — le hash est historiquement le premier "concentré" de cannabis, obtenu par simple séparation physique).
- `bagMicrons`/`screenMicrons` (220/190/160/120/90/73/45/25 µm) : ✅ **tailles de mailles réelles et standard de l'industrie du bubble hash/dry sift** — précisément cohérentes avec la taille documentée des trichomes capités-pédiculés (50-500 µm de hauteur, site de >90 % de la production cannabinoïdique totale ; les capités-sessiles ne font que 20-30µm et les bulbeux 10-15µm, cf. document 05). Les fractions les plus pures (25-45µm) sont constituées quasi-exclusivement de têtes glandulaires intactes — le "full-melt" qui fond entièrement sans résidu ; la fraction 73-90µm est le compromis qualité/rendement le plus courant commercialement. La pureté des fractions les plus fines en dry-sift atteint typiquement **70-85 %** de têtes glandulaires (contre quasi 100 % pour la fraction la plus fine en bubble hash — l'eau glacée sépare mieux par densité que le tamisage à sec seul).
- `iceType` incluant `dry-ice` (glace carbonique) : le "dry sift" à la glace carbonique est une technique réelle alternative à l'eau glacée pour fragiliser/détacher les trichomes par le froid sans utiliser d'eau.
- `machineType` incluant "Machine à laver" : ✅ pratique artisanale réelle et répandue (les machines à laver domestiques sont couramment détournées pour l'agitation contrôlée en méthode ice-water, avant l'existence de machines dédiées).
- **Étapes manquantes vérifiées (2026-07-06, hashcru.com)** à ajouter comme sous-étapes du pipeline Séparation, distinctes de `separationType` lui-même :
  - **HashVac** (`hashcru_site`, **T4**) : séchage + raffinage combinés, immédiatement après `ice-water` — aspirateur (4-6HP) + tamis fin (typiquement 70µm nylon) qui sèche le hash humide par évaporation accélérée tout en séparant mécaniquement les têtes glandulaires des fragments de plante par turbulence. Performance rapportée : activité de l'eau (Aw) <0,6 en moins de 60 minutes. Pas de température fixe (seule consigne : rester assez froid pour ne pas rompre les têtes). `uncertainty` : chiffres publiés par le fabricant lui-même, pas de validation indépendante tierce.
  - **Headhunter (Stalk Removal Sieve, SRS)** (`hashcru_site`, **T4** mais specs matériel vérifiables publiquement donc plus fiable que la moyenne T4) : étape de finition en fin de tamisage — tamis acier inoxydable 304 précision-perforé (30×30cm) + tamis de support 40 mesh, temps d'usage <2min/tamis, pureté rapportée >99% en têtes glandulaires. Purement mécanique (pas de charge électrostatique), à ne pas confondre avec les techniques triboélectriques ci-dessous.

## 4. Pipeline Extraction (Concentré)

Cf. document 08 pour le détail scientifique de chaque méthode (rosin, BHO/PHO, CO2, éthanol). Les champs de `extractionSidebarContent.js` sont scientifiquement bien construits :
- Distinction claire rosin (`rosin_enabled`, sans solvant) vs solvant (`solvent_enabled`, avec `solventType`) — reflète la distinction fondamentale de l'industrie entre concentrés "solventless" et "solvent-based".
- `plateTemperature` (40-220°C, hint "40-80°C=cold press, 80-120°C=standard") : ✅ la zone 40-120°C est cohérente avec la pratique rosin réelle. **Plage vérifiée (2026-07-06, `lowtemp_plates_blog`/`thepressclub_blog`/`dabpress_blog`, tier T3/T4 — matériel/communauté spécialisée, pas peer-reviewed)** : hash/dry-sift/bubble hash → cold press 60-77°C, hot press 77-93°C ; fleur/trim → cold press 82-93°C, hot press 93-104°C. La plupart des terpènes se dégradent significativement dès ~93°C (200°F), les plus volatils dès ~38°C — d'où l'intérêt réel du cold press pour la préservation aromatique, au prix d'un rendement 5-10% inférieur au hot press. ⚠️ **Correction d'une erreur précédente** : au-delà de ~110°C on sort de la pratique normale de pressage (une presse à 175-220°C carboniserait la matière) — la borne haute du slider de l'app (jusqu'à 220°C) doit être comprise comme une limite technique large de l'UI, pas une plage recommandée ; ce plafond est d'ailleurs cohérent avec l'usage réel de `plateTemperature` pour la distillation/décarboxylation en aval, pas pour le pressage rosin proprement dit.
- `cryoExtraction`/`extractionTemp` (-80 à 60°C, défaut -40°C pour le BHO) : ✅ l'extraction à très basse température (cryo) limite la co-extraction de chlorophylle et de cires, produisant un extrait plus pur — principe physico-chimique réel (solubilité différentielle selon la température).
- `purgeMethod`/`purgeTemp`/`purgeDuration` (four à vide, 38°C, 48h) : ✅ paramètres réalistes et cohérents avec la pratique de purge de solvant résiduel (température modérée pour éviter de dégrader les terpènes tout en assurant l'évaporation complète du butane/propane résiduel — enjeu de sécurité et de conformité réglementaire, pas seulement de qualité).
- `concentrateType` (fresh-press, budder, badder, shatter, wax, sauce, diamonds THCA, distillate, RSO, hash) : ✅ nomenclature standard et à jour de l'industrie des textures de concentré.
- `meltQuality` (1-6 étoiles) : convention "star rating" effectivement utilisée dans la communauté hash/rosin pour qualifier le "full melt" (fonte complète sans résidu à la combustion, signe de pureté).

## 5. Pipeline Purification (Hash & Concentré)

Le champ `purificationMethod` (17 options : winterisation, chromatographie/flash/HPLC/GC/TLC, décarboxylation, distillation fractionnée/short-path/moléculaire, filtration, centrifugation, séchage sous vide, recristallisation, sublimation, extraction liquide-liquide) et les sections conditionnelles associées (solvants, colonnes, températures/pressions de distillation) correspondent **fidèlement aux techniques réelles de chimie analytique/préparative utilisées en laboratoire d'extraction professionnel** — c'est un niveau de détail qui dépasse largement l'usage amateur et rejoint le vocabulaire de laboratoire pharmaceutique (cf. document 09) :
- **Winterisation** : ✅ dissolution dans l'éthanol puis congélation pour précipiter cires/lipides — description et paramètres (-20°C, 24h) cohérents.
- **Décarboxylation** (100-160°C, 15-180 min, défaut 120°C/60min) : ✅ cohérent avec la cinétique réelle de conversion THCA→THC, aujourd'hui précisément quantifiée par `wang2016` (T1) : **50 % de conversion en 6 min à 140°C, 90 % en 19 min à 140°C, >95 % en 20 min à 110°C**. Au-delà de **145°C**, apparition de produits de dégradation thermique (CBN par oxydation, Δ⁸-THC par isomérisation) qui réduisent le rendement net en THC — d'où l'intérêt réel (pas seulement une préférence artisanale) des protocoles "basse température longue durée" (~110°C/20-30min) qui atteignent une conversion quasi-complète *sans* franchir le seuil de dégradation. Le défaut actuel de l'app (120°C/60min) est cohérent mais **au-delà du strict nécessaire** — une réduction de la borne haute par défaut de `decarboxylationTemp` viendrait avec un gain réel de préservation terpénique. À température ambiante (~22°C), la demi-vie du THCA en fleur séchée est estimée à **7-10 mois** (décarboxylation lente spontanée par voie photochimique/oxydative) — explique pourquoi le cannabis cru est très faiblement psychoactif comparé au cannabis chauffé.
- **Distillation short-path sous vide poussé** (`distillation_pressure` en mbar, jusqu'à 0.001 mbar) : ✅ le vide poussé permet d'abaisser le point d'ébullition effectif des cannabinoïdes (évite de les dégrader thermiquement à pression atmosphérique où leur point d'ébullition réel serait bien plus élevé) — paramètre physico-chimiquement fondé.
- Colonnes chromatographiques (silice/alumine/C18/échange d'ions/exclusion de taille) : ✅ types de phase stationnaire réels utilisés en purification de cannabinoïdes à l'échelle préparative/industrielle.

## 6. Pipeline Recette (Comestible)

- Phases (préparation, décarboxylation, infusion/mélange, cuisson, refroidissement, conservation) : ✅ séquence réelle et complète de la fabrication de comestibles infusés.
- `actionPreparation` incluant `decarboxyler`, `infuser`, `emulsionner` : ✅ l'étape de décarboxylation est **indispensable** avant infusion (sans elle, le THCA/CBDA ingéré n'a quasiment pas d'effet psychoactif/thérapeutique comparable aux formes neutres) — bien présente comme étape dédiée plutôt que sous-entendue.
- Absence de champ dédié à la matière grasse d'infusion (beurre/huile) et à son ratio — le THC et les autres cannabinoïdes sont **liposolubles** (pas hydrosolubles), l'infusion dans un corps gras (beurre, huile de coco/tournesol) est le mécanisme chimique qui permet l'extraction et l'absorption digestive ; ce n'est pas un champ actuellement dédié dans `recipe`/`ingredients` au-delà du texte libre `nomIngredient` — piste d'amélioration si l'app veut aller plus loin (type de corps gras comme facteur de biodisponibilité, cf. §3 du document 08 sur la nanoémulsion).

## 7. Divergences internes constatées (à connaître, non corrigées ici)

L'agent d'extraction a relevé que `pipelineStarterSetups.js` référence des clés de champs (`ph`, `ec`, `medium`, `targetTemp`, `targetRh`, `curingType` avec des valeurs `standard/auto`) qui **ne correspondent pas exactement** aux noms de champs réels définis dans `cultureSidebarContent.js`/`curingSidebarContent.js` (`waterPH`/`waterEC`, `curingType` avec valeurs `cold/warm/room/controlled`). C'est une divergence de code (presets legacy jamais resynchronisés), pas une question de véracité scientifique — à traiter séparément comme dette technique si les presets starter sont utilisés en production.
