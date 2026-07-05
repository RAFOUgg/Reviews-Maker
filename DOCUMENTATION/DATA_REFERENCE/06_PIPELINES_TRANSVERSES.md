# Pipelines transverses — Culture, Curing, Séparation, Extraction, Purification, Recette

> Ces 6 pipelines sont partagés par les 4 types de review (chacun n'active que les pipelines pertinents : Fleur=Culture+Curing ; Hash=Séparation+Purification+Curing ; Concentré=Extraction+Purification+Curing ; Comestible=Recette). Source : `client/src/config/pipelineConfigs.js`, `cultureSidebarContent.js`, `curingSidebarContent.js`, `separationSidebarContent.js`, `extractionSidebarContent.js`, `purificationSidebarContent.js`, `pipelinePhases.js`, `intervalTypes.js`, `pipelineStarterSetups.js`, `data/cultureFormData.js`.
>
> ⚠️ Principe déjà documenté dans le code (`pipelineConfigs.js`) : tous les champs numériques sont des bornes UI indicatives (sliders/suggestions), **pas** des contraintes serveur strictes — cohérent avec la variabilité réelle des pratiques de terrain (un grower peut légitimement sortir des plages "standard").

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
- `trichomeColor` (clear/milky/amber, avec %) : ✅ heuristique de terrain **largement utilisée mais empirique** — la transition trichomes translucides→laiteux→ambrés reflète une évolution réelle de la composition chimique (accumulation puis dégradation progressive du THC, apparition de CBN en fin de cycle par oxydation) mais **ce n'est pas une horloge scientifique universelle et précise** : la vitesse de cette transition varie selon le cultivar, la lumière et la température — à présenter comme un indicateur terrain fiable en tendance, pas comme une mesure de labo.
- `pistilColor` (blanc/mixte/orange/brun) : ✅ autre indicateur terrain complémentaire réel (les pistils brunissent avec la maturation) mais moins précis que les trichomes pour le timing de récolte — corrélation plus faible avec la composition chimique réelle.
- `hermaphroditism`, `moldDetected`, `pestDamage` (none/light/moderate/severe) : ✅ échelles qualitatives standard pour du reporting terrain, cohérentes.

## 2. Pipeline Curing (Fleur, Hash, Concentré)

- `curingType` (froid <5°C / chaud >5°C / ambiante / contrôlée) et `targetHumidity` (55-62% fleurs, 62-65% hash, défaut 62%) : ✅ **cohérent avec la pratique de référence** de l'industrie (souvent citée autour de 58-62% HR pour la fleur en bocal) — en dessous, risque de dégradation aromatique par dessiccation excessive ; au-dessus, risque de moisissure.
- Mécanisme "burping" (ouverture périodique du bocal) : ✅ pratique réelle et recommandée pour évacuer l'humidité/l'éthylène excédentaire en début de cure sans assécher le produit.
- `containerOpacity` (opaque/semi-opaque/transparent/ambré/noir) : ✅ fondement scientifique réel — les UV/lumière visible dégradent le THC en CBN dans le temps (photo-oxydation), d'où l'intérêt du verre ambré ou du stockage à l'obscurité pour la conservation à long terme.
- Le `moldRisk` (0-10) croisé avec humidité/température est cohérent avec les conditions favorables réelles au développement de moisissures (*Botrytis cinerea* notamment, "bud rot") : humidité excessive + mauvaise circulation d'air.

## 3. Pipeline Séparation (Hash)

- `separationType` (ice-water/dry-sift/ice-o-lator/rosin-press/manual) : ✅ couvre les méthodes réelles de séparation mécanique des trichomes (sans solvant chimique — le hash est historiquement le premier "concentré" de cannabis, obtenu par simple séparation physique).
- `bagMicrons`/`screenMicrons` (220/190/160/120/90/73/45/25 µm) : ✅ **tailles de mailles réelles et standard de l'industrie du bubble hash/dry sift** — la plage 90-120µm correspond à peu près à la taille des têtes de trichomes glandulaires du cannabis (typiquement 50-150µm de diamètre selon la variété), ce qui explique pourquoi ces mailles-là donnent le rendement le plus pur ("full melt" à 73-120µm généralement) tandis que les mailles plus grosses (160-220µm) laissent passer davantage de débris végétaux.
- `iceType` incluant `dry-ice` (glace carbonique) : le "dry sift" à la glace carbonique est une technique réelle alternative à l'eau glacée pour fragiliser/détacher les trichomes par le froid sans utiliser d'eau.
- `machineType` incluant "Machine à laver" : ✅ pratique artisanale réelle et répandue (les machines à laver domestiques sont couramment détournées pour l'agitation contrôlée en méthode ice-water, avant l'existence de machines dédiées).

## 4. Pipeline Extraction (Concentré)

Cf. document 08 pour le détail scientifique de chaque méthode (rosin, BHO/PHO, CO2, éthanol). Les champs de `extractionSidebarContent.js` sont scientifiquement bien construits :
- Distinction claire rosin (`rosin_enabled`, sans solvant) vs solvant (`solvent_enabled`, avec `solventType`) — reflète la distinction fondamentale de l'industrie entre concentrés "solventless" et "solvent-based".
- `plateTemperature` (40-220°C, hint "40-80°C=cold press, 80-120°C=standard") : ✅ cohérent avec la pratique rosin réelle — les températures plus basses préservent mieux les terpènes volatils (point d'ébullition souvent 150-200°C mais dégradation/évaporation dès température plus faible sous pression) au prix d'un rendement légèrement inférieur.
- `cryoExtraction`/`extractionTemp` (-80 à 60°C, défaut -40°C pour le BHO) : ✅ l'extraction à très basse température (cryo) limite la co-extraction de chlorophylle et de cires, produisant un extrait plus pur — principe physico-chimique réel (solubilité différentielle selon la température).
- `purgeMethod`/`purgeTemp`/`purgeDuration` (four à vide, 38°C, 48h) : ✅ paramètres réalistes et cohérents avec la pratique de purge de solvant résiduel (température modérée pour éviter de dégrader les terpènes tout en assurant l'évaporation complète du butane/propane résiduel — enjeu de sécurité et de conformité réglementaire, pas seulement de qualité).
- `concentrateType` (fresh-press, budder, badder, shatter, wax, sauce, diamonds THCA, distillate, RSO, hash) : ✅ nomenclature standard et à jour de l'industrie des textures de concentré.
- `meltQuality` (1-6 étoiles) : convention "star rating" effectivement utilisée dans la communauté hash/rosin pour qualifier le "full melt" (fonte complète sans résidu à la combustion, signe de pureté).

## 5. Pipeline Purification (Hash & Concentré)

Le champ `purificationMethod` (17 options : winterisation, chromatographie/flash/HPLC/GC/TLC, décarboxylation, distillation fractionnée/short-path/moléculaire, filtration, centrifugation, séchage sous vide, recristallisation, sublimation, extraction liquide-liquide) et les sections conditionnelles associées (solvants, colonnes, températures/pressions de distillation) correspondent **fidèlement aux techniques réelles de chimie analytique/préparative utilisées en laboratoire d'extraction professionnel** — c'est un niveau de détail qui dépasse largement l'usage amateur et rejoint le vocabulaire de laboratoire pharmaceutique (cf. document 09) :
- **Winterisation** : ✅ dissolution dans l'éthanol puis congélation pour précipiter cires/lipides — description et paramètres (-20°C, 24h) cohérents.
- **Décarboxylation** (100-160°C, 15-180 min, défaut 120°C/60min) : ✅ cohérent avec la cinétique réelle de conversion THCA→THC (la décarboxylation est une réaction de premier ordre accélérée par la température — un compromis doit être trouvé entre vitesse de conversion et dégradation thermique des terpènes, d'où l'existence de protocoles "basse température longue durée" vs "haute température courte durée").
- **Distillation short-path sous vide poussé** (`distillation_pressure` en mbar, jusqu'à 0.001 mbar) : ✅ le vide poussé permet d'abaisser le point d'ébullition effectif des cannabinoïdes (évite de les dégrader thermiquement à pression atmosphérique où leur point d'ébullition réel serait bien plus élevé) — paramètre physico-chimiquement fondé.
- Colonnes chromatographiques (silice/alumine/C18/échange d'ions/exclusion de taille) : ✅ types de phase stationnaire réels utilisés en purification de cannabinoïdes à l'échelle préparative/industrielle.

## 6. Pipeline Recette (Comestible)

- Phases (préparation, décarboxylation, infusion/mélange, cuisson, refroidissement, conservation) : ✅ séquence réelle et complète de la fabrication de comestibles infusés.
- `actionPreparation` incluant `decarboxyler`, `infuser`, `emulsionner` : ✅ l'étape de décarboxylation est **indispensable** avant infusion (sans elle, le THCA/CBDA ingéré n'a quasiment pas d'effet psychoactif/thérapeutique comparable aux formes neutres) — bien présente comme étape dédiée plutôt que sous-entendue.
- Absence de champ dédié à la matière grasse d'infusion (beurre/huile) et à son ratio — le THC et les autres cannabinoïdes sont **liposolubles** (pas hydrosolubles), l'infusion dans un corps gras (beurre, huile de coco/tournesol) est le mécanisme chimique qui permet l'extraction et l'absorption digestive ; ce n'est pas un champ actuellement dédié dans `recipe`/`ingredients` au-delà du texte libre `nomIngredient` — piste d'amélioration si l'app veut aller plus loin (type de corps gras comme facteur de biodisponibilité, cf. §3 du document 08 sur la nanoémulsion).

## 7. Divergences internes constatées (à connaître, non corrigées ici)

L'agent d'extraction a relevé que `pipelineStarterSetups.js` référence des clés de champs (`ph`, `ec`, `medium`, `targetTemp`, `targetRh`, `curingType` avec des valeurs `standard/auto`) qui **ne correspondent pas exactement** aux noms de champs réels définis dans `cultureSidebarContent.js`/`curingSidebarContent.js` (`waterPH`/`waterEC`, `curingType` avec valeurs `cold/warm/room/controlled`). C'est une divergence de code (presets legacy jamais resynchronisés), pas une question de véracité scientifique — à traiter séparément comme dette technique si les presets starter sont utilisés en production.
