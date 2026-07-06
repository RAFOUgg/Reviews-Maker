# Saisie intelligente des valeurs à unité — jauge + conversion automatique

> Spécification transverse : **toute donnée numérique qui porte une unité physique** (température, pression, masse, volume, durée, taille de maille, concentration...) doit être saisie via un composant "jauge à unité convertible", pas un simple champ numérique lié à une unité figée. Exemple donné par l'utilisateur : une température se saisit sur une jauge de **-250°C à +250°C**, l'unité étant changeable à tout instant (°C/°F/K) avec **auto-conversion simultanée de la jauge et de la valeur affichée**. Ce document généralise le principe à toutes les familles d'unités présentes dans l'app et fournit les formules, bornes et pièges à connaître pour chacune.

## 0. Principe de fonctionnement du composant

1. **Stockage canonique unique** : la valeur est toujours conservée en base dans une unité canonique fixe (ex. température en °C), jamais dans l'unité affichée par l'utilisateur. C'est la seule façon d'éviter qu'une même colonne contienne un mélange d'unités selon la review (piège classique si on stockait "la valeur telle que saisie" + un champ unité séparé sans conversion garantie à la lecture).
2. **Affichage convertible** : l'unité affichée est une préférence d'interface (par champ ou globale utilisateur), reconvertie à la volée depuis la valeur canonique — jamais l'inverse.
3. **Changement d'unité = double recalcul instantané** :
   - la **valeur affichée** est reconvertie (100°C → 212°F → 373,15 K) ;
   - les **bornes/graduations de la jauge** sont reconverties dans la nouvelle unité (la jauge -250°C/+250°C devient -418°F/+482°F, ou 23,15 K/523,15 K) — l'utilisateur garde la même plage physique utilisable, jamais les mêmes chiffres bruts.
4. **Précision d'arrondi adaptée à l'unité** : ne pas afficher plus de décimales que l'instrument ne le justifie (ex. °C à 0,5 près, °F à l'entier, K à 0,1 près) — sinon on affiche une fausse précision.
5. **Ne convertir automatiquement QUE des unités de la même grandeur physique.** Certaines paires déjà présentes dans l'app ne sont **pas** interconvertibles automatiquement et doivent le rester explicitement (cf. §7 pièges) — auto-convertir dans ces cas produirait une donnée fausse, pas juste imprécise.

## 1. Température

- **Canonique** : °C. **Alternatives** : °F, K.
- **Formules** : `°F = °C × 9/5 + 32` ; `K = °C + 273,15`.
- **Bornes de jauge recommandées : -250°C à +250°C** (reprend exactement votre exemple) — plage choisie pour couvrir tous les cas réels déjà documentés dans l'app et les documents scientifiques :
  - -196°C : azote liquide (conservation génétique long terme, cryo-extraction extrême)
  - -80°C à -40°C : cryoextraction BHO/PHO, extractionTemp
  - -78,5°C : glace carbonique (dry-ice sift, dry-ice bubble hash)
  - -20°C à 0°C : winterisation, eau glacée bubble hash
  - 18-24°C : culture, curing
  - 100-160°C : décarboxylation
  - **Pressage rosin — plage vérifiée (2026-07-06) via LowTemp Plates/thepressclub/dabpress** :
    - Hash/dry-sift/bubble hash : cold press **60-77°C** (140-170°F), hot press **77-93°C** (170-200°F)
    - Fleur/trim : cold press **82-93°C** (180-200°F), hot press **93-104°C** (200-220°F)
    - La plupart des terpènes commencent à se dégrader autour de **93°C** (200°F), les plus volatils dès **~38°C** (100°F) — d'où l'intérêt réel du cold press pour la préservation aromatique
    - **175-220°C est erroné pour le rosin** (correction de l'erreur initiale) — une telle température carboniserait la matière ; au-delà de ~110°C on sort de la pratique normale de pressage
  - 175-250°C : distillation short-path/moléculaire uniquement (ne concerne pas le pressage)
  - 250°C : borne haute de sécurité englobant tous les cas de purification/distillation du document 06
- **Champs de l'app concernés** (tous actuellement en °C figé, à faire évoluer) : `plateTemperature`, `prePressTemperature`, `extractionTemp`, `purgeTemp`, `winterization_temperature`/`winterizationTemp`, `decarb_temperature`/`decarboxylationTemp`, `distillation_temperature`/`distillationTemp`, `curingTemperature`/`temperature` (curing), `temperatureDay`/`temperatureNight` (culture), `waterTemperature` (ice-water), `ambientTemperature` (dry-sift), `temperatureExtraction`, `temperaturePurification`, `temperaturePreparation` (recette comestible).

## 2. Pression

- **Canonique** : bar. **Alternatives** : PSI, mbar, atm, inHg.
- **Formules** : `PSI = bar × 14,5038` ; `atm = bar × 0,986923` ; `mbar = bar × 1000` ; `inHg = bar × 29,53`.
- ⚠️ **Sous-famille à traiter à part : le vide poussé.** `distillation_pressure` descend jusqu'à **0,001 mbar** (distillation moléculaire) — une jauge linéaire de 0 à 500 bar serait inutilisable pour distinguer 0,001 de 1 mbar. Pour toute pression **sous** 1 bar (vide), utiliser une **échelle logarithmique dédiée** (mbar/Torr/Pa/inHg-vide), pas la même jauge linéaire que les hautes pressions d'extraction CO2/rosin.
- **Bornes de jauge recommandées** : 0-500 bar linéaire pour les pressions "process" (CO2 supercritique jusqu'à 400 bar, presses rosin jusqu'à 2000 PSI ≈ 138 bar) ; 0,0001-1000 mbar logarithmique pour le vide (purge sous vide, distillation short-path/moléculaire).
- **Champs concernés** : `platePressure` (PSI), `distillation_pressure` (mbar, vide), `pressionExtraction` (bar).

## 3. Masse / Poids

- **Canonique** : g. **Alternatives** : mg (dosage fin), kg (batch), oz, lb.
- **Formules** : `oz = g / 28,3495` ; `lb = g / 453,592` ; `kg = g / 1000`.
- **Deux sous-familles à ne pas confondre** (bornes de jauge différentes) :
  - **Dosage/mesure fine** (mg-g) : `dosageUtilise`/`dosage`, échelle 0-10 000 mg.
  - **Poids de production** (g-kg) : `poidsBrut`/`poidsNet`, `batchSize`, `finalWeight`, `totalYield`, `wetWeight`/`trimmedWeight`/`dryWeight`, `vegetativeWeight`, `ratioIce` — échelle 0-10 000+ g / jusqu'à plusieurs kg pour un batch industriel.
- **Champs concernés** : tous les champs "poids"/"rendement" listés aux documents 01, 02, 03, 06.

## 4. Volume

- **Canonique** : mL. **Alternatives** : L, cL, gal (⚠️ préciser US gallon 3,785L ou imperial gallon 4,546L si utilisé — sinon **ne pas proposer gal** pour éviter l'ambiguïté silencieuse).
- **Formules** : `L = mL / 1000`.
- **Champs concernés** : `waterVolume`, `containerVolume`, `productVolume`, `ratioWater` (déjà en L).
- **Cas non convertible tel quel** : `solventRatio` (mL/g) est un **ratio composé** (volume par unité de masse), pas une grandeur simple — la jauge doit convertir le volume ET la masse séparément si on change l'unité de l'un des deux, pas transformer le ratio comme un seul nombre.

## 5. Longueur / taille de maille (microns)

- **Canonique** : µm. **Alternatives** : mm, **US mesh** (nombre de mailles par pouce linéaire).
- ⚠️ **Piège important — le mesh US n'est PAS une conversion par formule simple mais une table de correspondance non linéaire** (dépend du diamètre du fil du tamis, normé ASTM E11) : 220µm≈70 mesh, 160µm≈90 mesh, 120µm≈120 mesh, 90µm≈170 mesh, 73µm≈200 mesh, 45µm≈325 mesh, 25µm≈500 mesh (valeurs standard approximatives de l'industrie du bubble hash/dry-sift). **Ne pas générer cette correspondance par calcul — utiliser une table de correspondance officielle et l'afficher comme "équivalence usuelle", pas comme une conversion exacte.**
- **Champs concernés** : `bagMicrons`, `screenMicrons`, `tailleMailles`, `filtrationMicrons` — déjà en µm dans l'app, actuellement des `select` à valeurs fixes (220/190/160/120/90/73/45/25) plutôt qu'une jauge continue : cohérent de garder un `select`/tags ici (les mailles commerciales sont des tailles discrètes standardisées, pas un continuum), mais ajouter l'équivalence mesh US en label complémentaire serait utile pour les utilisateurs nord-américains.

## 6. Temps / Durée

- **Canonique** : secondes. **Alternatives** : minutes, heures, jours, semaines, mois.
- **Formules** : linéaires standard (× 60, × 3600, × 86400...).
- **Champs concernés** : `pressDuration`, `washDuration`, `purgeDuration`, `decarboxylationDuration`/`decarb_duration`, `siftingDuration`, `tempsTotalSeparation`, `distillationDuration` (implicite), `curingDuration`, `floweringMinWeeks`/`floweringMaxWeeks`/`germinationSpeed`/`vegTime` (déjà `number-unit` avec choix d'unité dans `phenoNodeFields.js` — bon précédent à généraliser, cf. §8).
- Distinct des `intervalType` de pipeline (`intervalTypes.js`, déjà bien conçu pour la granularité de la timeline) — ici il s'agit de la **durée d'une étape**, pas de l'intervalle d'affichage de la trame.

## 7. ⚠️ Familles à NE PAS auto-convertir silencieusement (pièges de fausse précision)

- **EC ⇄ PPM (conductivité nutritive)** : il existe **deux échelles PPM concurrentes et incompatibles** dans l'industrie horticole — échelle "500" (norme Hanna/US, `PPM = EC(mS/cm) × 500`) et échelle "700" (norme Eutech/Australie, `PPM = EC × 700`). Une conversion automatique sans préciser l'échelle utilisée peut introduire une **erreur allant jusqu'à 40 %** sur la valeur affichée. Recommandation : si l'utilisateur choisit d'afficher en PPM, **exiger explicitement le choix de l'échelle (500/700)** avec un avertissement visible, ne jamais convertir "par défaut" silencieusement. Champ concerné : `waterEC` (déjà en mS/cm dans l'app — bon choix d'unité canonique par défaut, à ne pas perdre en ajoutant PPM).
- **PPFD ⇄ lux** : le lux mesure la sensibilité de l'œil humain (pondérée photopique), pas la lumière utile à la photosynthèse (PAR, 400-700nm) — la conversion lux→PPFD dépend du **spectre de la source** (un lux de LED full-spectrum ≠ un lux de HPS en équivalent PPFD). **Ne pas proposer de conversion automatique PPFD⇄lux** sans préciser le type de source lumineuse ; si une équivalence est affichée, la marquer explicitement "approximative, dépend du spectre". Champ concerné : `ppfd`.
- **`yieldValue`/`yieldEstimate` (g/m² ⇄ g/plante)** : déjà identifié comme non convertible dans les documents 05/06 — la conversion exacte nécessite de connaître la densité de plantation (déjà capturée par `densitePlantation`, plantes/m²). **Recommandation d'amélioration concrète** : si `densitePlantation` est renseignée sur la même fiche, permettre une conversion assistée (`g/plante = g/m² ÷ densité`) plutôt que de la laisser indisponible — mais toujours avec une mention explicite "calculé, pas mesuré" pour ne pas confondre une valeur dérivée avec une valeur saisie.
- **pH** : échelle logarithmique sans unité alternative — hors périmètre de cette convention, ne pas chercher à lui appliquer un sélecteur d'unité.

## 8. Ce qui existe déjà dans le code et peut servir de socle

Le widget `number-unit` de `phenoNodeFields.js` (document 05) stocke déjà un objet `{value, unit}` avec un sélecteur d'unité pour `germinationSpeed` (h/j), `vegTime`/`floweringTime` (j/sem), `yieldEstimate` (g_m2/g_plant/oz_plant) — **c'est le bon pattern de stockage**, mais il lui manque aujourd'hui :
1. L'**auto-conversion de la valeur** au changement d'unité (actuellement, changer l'unité ne semble reconvertir ni la valeur ni suggérer une jauge adaptée — à vérifier/corriger dans l'implémentation réelle).
2. Le rendu **jauge/slider** plutôt qu'un simple champ numérique + select à côté (le principe demandé ici est explicitement une jauge visuelle, pas juste un menu déroulant d'unité).

## 9. Récapitulatif — recommandation d'implémentation

Un seul composant réutilisable `QuantityGaugeInput` paramétré par famille (`temperature`, `pressure`, `mass`, `volume`, `duration`, `micron`) suffit à couvrir tous les champs listés ci-dessus, avec pour chaque famille : liste des unités supportées, unité canonique de stockage, formules ou table de conversion, bornes de jauge par défaut (éventuellement resserrées par champ via une prop `min`/`max` spécifique, ex. `decarboxylationTemp` n'a pas besoin d'aller jusqu'à -250°C mais peut réutiliser le même composant avec des bornes plus resserrées). Les familles à piège (§7) doivent explicitement **ne pas** faire partie de ce composant générique — les traiter avec un avertissement dédié plutôt que de les faire rentrer de force dans le même mécanisme d'auto-conversion.
