# 📊 Valeurs Assignables Pipeline Culture - Documentation Complète

**Date :** 2026-01-06  
**Statut :** ✅ COMPLET - 85+ champs définis  
**Fichier source :** `client/src/config/cultureSidebarContent.js`

---

## 🎯 Vue d'ensemble

La Pipeline Culture pour les **Fleurs** dispose de **85+ champs** répartis en **8 sections principales**. Chaque champ a son type, ses options, et ses contraintes bien définies.

### Sections disponibles :
1. **📋 GENERAL** - Informations générales (11 champs)
2. **🌱 ENVIRONNEMENT** - Environnement & Substrat (8 champs)
3. **💧 IRRIGATION** - Irrigation & Solution nutritive (6 champs)
4. **🧪 NUTRITION** - Engrais & Nutrition (5 champs)
5. **💡 LUMIERE** - Lumière & Éclairage (11 champs)
6. **🌡️ CLIMAT** - Climat & Atmosphère (13 champs)
7. **✂️ PALISSAGE** - Palissage & Training (4 champs)
8. **📏 MORPHOLOGIE** - Morphologie & Développement (7 champs)
9. **🌾 RECOLTE** - Récolte & Rendement (27 champs)

---

## 📋 Section 1 : GENERAL

### 1. Début culture
- **ID :** `startDate`
- **Type :** `date`
- **Valeur :** Date (YYYY-MM-DD)
- **Tooltip :** Date de germination ou de plantation

### 2. Fin culture
- **ID :** `endDate`
- **Type :** `date`
- **Valeur :** Date (YYYY-MM-DD)
- **Tooltip :** Date de récolte

### 3. Durée totale
- **ID :** `duration`
- **Type :** `computed` (calculé automatiquement)
- **Unité :** jours
- **Calcul :** Différence entre `endDate` et `startDate`

### 4. Mode de culture
- **ID :** `mode`
- **Type :** `select`
- **Options :**
  - `indoor` : 🏠 Indoor
  - `outdoor` : 🌞 Outdoor
  - `greenhouse` : 🏡 Greenhouse
  - `notill` : 🌿 No-till
  - `other` : ❓ Autre

### 5. Type d'espace
- **ID :** `spaceType`
- **Type :** `select`
- **Options :**
  - `tent` : ⛺ Tente
  - `closet` : 🚪 Armoire
  - `room` : 🏠 Chambre/Room
  - `greenhouse` : 🏡 Serre
  - `outdoor` : 🌳 Extérieur direct
  - `guerilla` : 🌲 Guérilla
  - `other` : ❓ Autre

### 6. Dimensions (L×l×H)
- **ID :** `dimensions`
- **Type :** `dimensions`
- **Unité :** cm
- **Valeur par défaut :** { length: 120, width: 120, height: 200 }

### 7. Surface au sol
- **ID :** `surfaceAuSol`
- **Type :** `computed`
- **Unité :** m²
- **Calcul :** (length/100) × (width/100)

### 8. Volume total
- **ID :** `volumeTotal`
- **Type :** `computed`
- **Unité :** m³
- **Calcul :** (length/100) × (width/100) × (height/100)

### 9. Densité de plantation
- **ID :** `densitePlantation`
- **Type :** `slider`
- **Min :** 0.5
- **Max :** 16
- **Step :** 0.5
- **Unité :** plantes/m²
- **Par défaut :** 4
- **Suggestions :**
  - 1 : SOG faible
  - 4 : Standard
  - 9 : SOG dense
  - 16 : SOG très dense

---

## 🌱 Section 2 : ENVIRONNEMENT

### 1. Méthode de propagation
- **ID :** `propagation`
- **Type :** `select`
- **Options :**
  - `seed` : 🌰 Graine
  - `clone` : 🧬 Clone
  - `cutting` : ✂️ Bouture
  - `tissue` : 🧻 Tissu humide (sopalin/coton)
  - `other` : ❓ Autre

### 2. Méthode germination
- **ID :** `germinationMethod`
- **Type :** `select`
- **Condition :** Affiché si `propagation === 'seed'`
- **Options :**
  - `soil` : 🪴 Terre directe
  - `paper` : 🧻 Papier/Sopalin
  - `water` : 💧 Verre d'eau
  - `rockwool` : 🧱 Laine de roche
  - `jiffy` : ⚪ Pastille Jiffy

### 3. Type de graine
- **ID :** `seedType`
- **Type :** `select`
- **Condition :** Affiché si `propagation === 'seed'`
- **Options :**
  - `regular` : 🌱 Régulière
  - `feminized` : ♀️ Féminisée
  - `auto` : ⚡ Auto-florissante

### 4. Type de substrat
- **ID :** `substrateType`
- **Type :** `select`
- **Options :**
  - `soil` : 🟤 Terreau
  - `coco` : 🥥 Coco
  - `rockwool` : 🧱 Laine de roche
  - `living-soil` : 🌿 Mélange organique vivant
  - `hydro-dtw` : 💧 Hydro drain-to-waste
  - `dwc` : 🌊 DWC (Deep Water Culture)
  - `nft` : 💦 NFT (Nutrient Film Technique)
  - `aero` : 💨 Aéroponique
  - `other` : ❓ Autre

### 5. Volume du pot
- **ID :** `potVolume`
- **Type :** `slider`
- **Min :** 0.5
- **Max :** 100
- **Step :** 0.5
- **Unité :** L
- **Par défaut :** 11
- **Suggestions :**
  - 3L : Petit
  - 11L : Standard
  - 25L : Grand
  - 50L : Très grand

### 6. ✨ Composition du substrat (PIE CHART)
- **ID :** `substrateComposition`
- **Type :** `pie`
- **Condition :** Affiché si `substrateType` in ['soil', 'coco', 'living-soil']
- **Composants avec couleurs :**
  - `soil` : Terreau (#8b4513)
  - `coco` : Coco (#d2691e)
  - `perlite` : Perlite (#ffffff)
  - `vermiculite` : Vermiculite (#ffd700)
  - `compost` : Compost (#654321)
  - `humus` : Humus (#8b7355)
  - `biochar` : Biochar (#2f4f4f)
  - `sand` : Sable (#f4a460)
  - `rockwool` : Laine roche (#dcdcdc)
  - `other` : Autre (#808080)
- **Fonctionnalités :**
  - Saisie % par composant
  - Normalisation automatique à 100%
  - Pie chart visuel
  - Boutons : Modifier, Normaliser, Réinitialiser

### 7. Marque substrat
- **ID :** `substrateBrand`
- **Type :** `autocomplete`
- **Suggestions :**
  - BioBizz Light Mix
  - BioBizz All Mix
  - Plagron Light Mix
  - Plagron Royalty Mix
  - Canna Terra Professional
  - Fox Farm Ocean Forest
  - Composté maison
  - Autre

---

## 💧 Section 3 : IRRIGATION

### 1. Type d'irrigation
- **ID :** `irrigationType`
- **Type :** `select`
- **Options :**
  - `manual` : 🚰 Manuel
  - `drip` : 💧 Goutte à goutte
  - `flood` : 🌊 Table d'inondation
  - `dtw` : 💦 Drip-to-waste
  - `autopot` : 🪴 Autopot
  - `rdwc` : 🔄 RDWC
  - `other` : ❓ Autre

### 2. Fréquence d'arrosage
- **ID :** `irrigationFrequency`
- **Type :** `frequency`
- **Par défaut :** { value: 2, period: 'day' } (2 fois par jour)

### 3. Volume par arrosage
- **ID :** `waterVolume`
- **Type :** `slider`
- **Min :** 0.1
- **Max :** 5
- **Step :** 0.1
- **Unité :** L
- **Par défaut :** 1

### 4. pH de l'eau
- **ID :** `waterPH`
- **Type :** `slider`
- **Min :** 4.5
- **Max :** 8.0
- **Step :** 0.1
- **Par défaut :** 6.5
- **Zones :**
  - 5.5-6.5 : Optimal terre (vert)
  - 5.8-6.2 : Optimal hydro (bleu)

### 5. EC (Conductivité)
- **ID :** `waterEC`
- **Type :** `slider`
- **Min :** 0.2
- **Max :** 3.0
- **Step :** 0.1
- **Unité :** mS/cm
- **Par défaut :** 1.2
- **Zones :**
  - 0.8-1.2 : Croissance (vert)
  - 1.2-2.0 : Floraison (violet)

### 6. Type d'eau
- **ID :** `waterType`
- **Type :** `select`
- **Options :**
  - `tap` : 🚰 Eau du robinet
  - `ro` : 💧 Osmose inverse (RO)
  - `spring` : 🏔️ Eau de source
  - `rain` : 🌧️ Eau de pluie
  - `mix` : 🔄 Mélange

---

## 🧪 Section 4 : NUTRITION

### 1. Type d'engrais
- **ID :** `fertilizerType`
- **Type :** `select`
- **Options :**
  - `organic` : 🌿 Organique
  - `mineral` : ⚗️ Minéral
  - `organo-mineral` : 🔬 Organo-minéral
  - `living-soil` : 🪴 Living Soil (sans engrais)
  - `other` : ❓ Autre

### 2. Marque d'engrais
- **ID :** `fertilizerBrand`
- **Type :** `autocomplete`
- **Suggestions :**
  - BioBizz
  - General Hydroponics (GHE)
  - Advanced Nutrients
  - Plagron
  - Canna
  - House & Garden
  - Biobact
  - Green House Feeding
  - Composté maison
  - Autre

### 3. Gamme/Produits
- **ID :** `fertilizerLine`
- **Type :** `multiselect`
- **Options :**
  - `grow` : 🌱 Grow (Croissance)
  - `bloom` : 🌸 Bloom (Floraison)
  - `booster` : 🚀 Booster
  - `calmag` : 💪 CalMag
  - `pk` : ⚡ PK Booster
  - `enzymes` : 🧬 Enzymes
  - `microbes` : 🦠 Micro-organismes
  - `vitamins` : 💊 Vitamines
  - `other` : ❓ Autre

### 4. Dosage
- **ID :** `fertilizerDosage`
- **Type :** `slider`
- **Min :** 0.1
- **Max :** 5.0
- **Step :** 0.1
- **Unité :** mL/L
- **Par défaut :** 2

### 5. Fréquence fertilisation
- **ID :** `fertilizerFrequency`
- **Type :** `frequency`
- **Presets :**
  - 1 fois sur 2 arrosages
  - Chaque arrosage
  - Hebdomadaire

---

## 💡 Section 5 : LUMIERE

### 1. Type de lampe
- **ID :** `lightType`
- **Type :** `select`
- **Options :**
  - `led` : 💡 LED
  - `hps` : 🔶 HPS (Sodium haute pression)
  - `mh` : ⚪ MH (Halogénures métalliques)
  - `cmh` : 🌟 CMH/LEC (Céramique)
  - `cfl` : 💡 CFL/T5 (Néons)
  - `natural` : ☀️ Lumière naturelle
  - `mixed` : 🌈 Mixte

### 2. Nombre de lampes
- **ID :** `lightCount`
- **Type :** `stepper`
- **Min :** 1
- **Max :** 20
- **Par défaut :** 1

### 3. Puissance par lampe
- **ID :** `lightPowerPerUnit`
- **Type :** `slider`
- **Min :** 10
- **Max :** 1000
- **Step :** 10
- **Unité :** W
- **Par défaut :** 250

### 4. Puissance totale
- **ID :** `lightTotalPower`
- **Type :** `computed`
- **Unité :** W
- **Calcul :** lightCount × lightPowerPerUnit

### 5. Distance lampe/plante
- **ID :** `lightDistance`
- **Type :** `slider`
- **Min :** 10
- **Max :** 200
- **Step :** 5
- **Unité :** cm
- **Par défaut :** 50
- **Zones :**
  - 20-40cm : Proche (LED forte) - orange
  - 40-80cm : Optimal - vert
  - 80-150cm : Éloigné - bleu

### 6. Photopériode
- **ID :** `photoperiod`
- **Type :** `photoperiod`
- **Presets :**
  - 18/6 : Croissance
  - 20/4 : Croissance intensive
  - 24/0 : Continu auto
  - 12/12 : Floraison

### 7. PPFD moyen
- **ID :** `ppfd`
- **Type :** `slider`
- **Min :** 200
- **Max :** 1200
- **Step :** 50
- **Unité :** µmol/m²/s
- **Par défaut :** 600
- **Zones :**
  - 200-400 : Faible - jaune
  - 400-600 : Croissance - vert
  - 600-900 : Floraison - violet
  - 900-1200 : Intense (CO2) - rouge

### 8. DLI (Daily Light Integral)
- **ID :** `dli`
- **Type :** `slider`
- **Min :** 10
- **Max :** 60
- **Step :** 1
- **Unité :** mol/m²/j
- **Par défaut :** 30
- **Zones :**
  - 15-25 : Croissance - vert
  - 25-40 : Floraison - violet
  - 40-60 : Intense (CO2) - rouge

### 9. Spectre lumineux
- **ID :** `spectrum`
- **Type :** `select`
- **Options :**
  - `full` : 🌈 Full Spectrum
  - `veg` : 🔵 Veg (bleu dominé)
  - `bloom` : 🔴 Bloom (rouge dominé)
  - `uv` : 🟣 UV+
  - `farred` : 🔴 Far Red
  - `other` : ❓ Autre

### 10. ✨ Graphique spectre (IMAGE UPLOAD)
- **ID :** `spectrumImage`
- **Type :** `image-upload`
- **Accept :** image/*
- **Taille max :** 5 MB
- **Preview :** Oui
- **Fonctionnalités :**
  - Upload fichier image (PNG, JPEG, etc.)
  - Validation type et taille
  - Aperçu de l'image
  - Stockage en base64
  - Bouton supprimer

---

## 🌡️ Section 6 : CLIMAT

### 1. Température jour
- **ID :** `temperatureDay`
- **Type :** `slider`
- **Min :** 10
- **Max :** 35
- **Step :** 0.5
- **Unité :** °C
- **Par défaut :** 24
- **Zones :**
  - 20-26°C : Optimal - vert
  - 26-30°C : Chaud - orange
  - 30-35°C : Très chaud - rouge

### 2. Température nuit
- **ID :** `temperatureNight`
- **Type :** `slider`
- **Min :** 10
- **Max :** 35
- **Step :** 0.5
- **Unité :** °C
- **Par défaut :** 18
- **Zones :**
  - 16-22°C : Optimal - vert

### 3. Humidité jour
- **ID :** `humidityDay`
- **Type :** `slider`
- **Min :** 20
- **Max :** 90
- **Step :** 5
- **Unité :** %
- **Par défaut :** 60
- **Zones :**
  - 40-60% : Croissance - vert
  - 40-50% : Floraison - violet
  - 30-40% : Fin floraison - orange

### 4. Humidité nuit
- **ID :** `humidityNight`
- **Type :** `slider`
- **Min :** 20
- **Max :** 90
- **Step :** 5
- **Unité :** %
- **Par défaut :** 50

### 5. VPD (Vapor Pressure Deficit)
- **ID :** `vpd`
- **Type :** `computed`
- **Unité :** kPa
- **Calcul :** Basé sur temperatureDay et humidityDay
- **Zone optimale :** 0.8-1.2 kPa

### 6. Enrichissement CO2
- **ID :** `co2Enabled`
- **Type :** `toggle`
- **Par défaut :** false

### 7. Niveau CO2
- **ID :** `co2Level`
- **Type :** `slider`
- **Condition :** Affiché si `co2Enabled === true`
- **Min :** 400
- **Max :** 1600
- **Step :** 50
- **Unité :** ppm
- **Par défaut :** 1200
- **Zones :**
  - 400 : Ambiant - gris
  - 800-1200 : Enrichi - vert
  - 1200-1500 : Très enrichi - orange

### 8. Mode CO2
- **ID :** `co2Mode`
- **Type :** `select`
- **Condition :** Affiché si `co2Enabled === true`
- **Options :**
  - `continuous` : ♾️ Continu
  - `phases` : ⏱️ Par phases

### 9. Type de ventilation
- **ID :** `ventilationType`
- **Type :** `select`
- **Options :**
  - `extract-intake` : 🔄 Extracteur + Intracteur
  - `extract-only` : 💨 Extracteur seul
  - `passive-fans` : 🌀 Passif + Ventilateurs
  - `other` : ❓ Autre

### 10. Intensité ventilation
- **ID :** `ventilationIntensity`
- **Type :** `slider`
- **Min :** 0
- **Max :** 10
- **Step :** 1
- **Par défaut :** 5

### 11. Renouvellement d'air
- **ID :** `airRenewal`
- **Type :** `select`
- **Options :**
  - `10` : 10 volumes/h
  - `20` : 20 volumes/h
  - `30` : 30 volumes/h
  - `60` : 60 volumes/h

---

## ✂️ Section 7 : PALISSAGE

### 1. Méthodes utilisées
- **ID :** `trainingMethods`
- **Type :** `multiselect`
- **Options :**
  - `lst` : 🪢 LST (Low Stress Training)
  - `hst` : ✂️ HST (High Stress Training)
  - `topping` : 🔝 Topping
  - `fim` : 🌿 FIM
  - `mainlining` : 🌳 Main-lining
  - `scrog` : 🕸️ SCROG (Screen of Green)
  - `sog` : 🌊 SOG (Sea of Green)
  - `supercropping` : 💪 Supercropping
  - `defoliation` : 🍃 Défoliation
  - `lollipopping` : 🍭 Lollipopping
  - `schwazzing` : 🔪 Schwazzing
  - `other` : ❓ Autre

### 2. Intensité du palissage
- **ID :** `trainingIntensity`
- **Type :** `slider`
- **Min :** 0
- **Max :** 10
- **Step :** 1
- **Par défaut :** 5

### 3. Phases d'application
- **ID :** `trainingPhases`
- **Type :** `phases`
- **Phases disponibles :**
  - Pré-croissance
  - Début croissance
  - Milieu croissance
  - Fin croissance
  - Début stretch
  - Milieu stretch
  - Fin stretch
  - Début floraison
  - Milieu floraison
  - Fin floraison

### 4. Notes palissage
- **ID :** `trainingNotes`
- **Type :** `textarea`
- **Max :** 500 caractères

---

## 📏 Section 8 : MORPHOLOGIE

### 1. Taille de la plante
- **ID :** `plantHeight`
- **Type :** `slider`
- **Min :** 10
- **Max :** 300
- **Step :** 5
- **Unité :** cm
- **Par défaut :** 100

### 2. Largeur de la canopée
- **ID :** `canopyWidth`
- **Type :** `slider`
- **Min :** 10
- **Max :** 200
- **Step :** 5
- **Unité :** cm
- **Par défaut :** 60

### 3. Volume approximatif
- **ID :** `plantVolume`
- **Type :** `select`
- **Options :**
  - `small` : 🌱 Petit (<0.5m³)
  - `medium` : 🌿 Moyen (0.5-1m³)
  - `large` : 🌳 Grand (1-2m³)
  - `xlarge` : 🌲 Très grand (>2m³)

### 4. Poids végétatif estimé
- **ID :** `vegetativeWeight`
- **Type :** `slider`
- **Min :** 10
- **Max :** 3000
- **Step :** 50
- **Unité :** g
- **Par défaut :** 500

### 5. Branches principales
- **ID :** `mainBranches`
- **Type :** `stepper`
- **Min :** 1
- **Max :** 32
- **Par défaut :** 8

### 6. Buds visibles
- **ID :** `visibleBuds`
- **Type :** `stepper`
- **Min :** 1
- **Max :** 200
- **Par défaut :** 20

### 7. Espacement internodal
- **ID :** `internodeSpacing`
- **Type :** `select`
- **Options :**
  - `tight` : 🟢 Serré (<3cm)
  - `medium` : 🟡 Moyen (3-6cm)
  - `wide` : 🔴 Large (>6cm)

---

## 🌾 Section 9 : RECOLTE

### 1. Date de récolte
- **ID :** `harvestDate`
- **Type :** `date`

### 2. Durée du rinçage
- **ID :** `flushDuration`
- **Type :** `stepper`
- **Min :** 0
- **Max :** 21
- **Unité :** jours
- **Par défaut :** 7

### 3. Couleur des trichomes
- **ID :** `trichomeColor`
- **Type :** `multiselect`
- **Options :**
  - `clear` : ⚪ Translucides
  - `milky` : 🥛 Laiteux
  - `amber` : 🟠 Ambrés

### 4-6. % Trichomes
- **IDs :** `trichomeClearPercent`, `trichomeMilkyPercent`, `trichomeAmberPercent`
- **Type :** `slider`
- **Min :** 0
- **Max :** 100
- **Step :** 5
- **Unité :** %
- **Par défaut :** 10, 70, 20

### 7. Couleur des pistils
- **ID :** `pistilColor`
- **Type :** `select`
- **Options :**
  - `white` : ⚪ Majoritairement blancs
  - `mixed` : 🟡 Mixte blanc/orange
  - `orange` : 🟠 Majoritairement oranges
  - `brown` : 🟤 Majoritairement bruns

### 8. Poids brut (humide)
- **ID :** `wetWeight`
- **Type :** `slider`
- **Min :** 10
- **Max :** 5000
- **Step :** 10
- **Unité :** g
- **Par défaut :** 500

### 9. Poids après trim humide
- **ID :** `trimmedWeight`
- **Type :** `slider`
- **Min :** 5
- **Max :** 3000
- **Step :** 10
- **Unité :** g
- **Par défaut :** 350

### 10. Poids sec final
- **ID :** `dryWeight`
- **Type :** `slider`
- **Min :** 1
- **Max :** 1000
- **Step :** 5
- **Unité :** g
- **Par défaut :** 100

### 11. Type de manucure
- **ID :** `trimType`
- **Type :** `select`
- **Options :**
  - `wet` : 💧 Wet trim (humide)
  - `dry` : 🌾 Dry trim (sec)
  - `mixed` : 🔄 Mixte
  - `none` : 🌿 Sans trim

### 12. Qualité de la manucure
- **ID :** `trimQuality`
- **Type :** `slider`
- **Min :** 0
- **Max :** 10
- **Step :** 1
- **Par défaut :** 7

### 13-15. Rendements (calculés)
- **IDs :** `yieldPerPlant`, `yieldPerM2`, `yieldPerWatt`
- **Type :** `computed`
- **Unités :** g/plante, g/m², g/W

### 16. Densité des têtes
- **ID :** `budDensity`
- **Type :** `select`
- **Options :**
  - `airy` : 💨 Aérées (faible)
  - `medium` : 🌿 Moyenne
  - `dense` : 💪 Dense
  - `rock` : 🪨 Très dense (rock hard)

### 17. Structure des buds
- **ID :** `budStructure`
- **Type :** `select`
- **Options :**
  - `sativa` : 🌾 Sativa (allongées)
  - `indica` : 🌲 Indica (compactes)
  - `foxtail` : 🦊 Foxtails
  - `spear` : 🗡️ Spear (lance)

### 18. Déchets de trim
- **ID :** `trimWaste`
- **Type :** `slider`
- **Min :** 0
- **Max :** 50
- **Step :** 1
- **Unité :** %
- **Par défaut :** 20

### 19. Qualité sugar leaves
- **ID :** `sugarLeafQuality`
- **Type :** `slider`
- **Min :** 0
- **Max :** 10
- **Step :** 1
- **Par défaut :** 6

### 20. Hermaphrodisme
- **ID :** `hermaphroditism`
- **Type :** `select`
- **Options :**
  - `none` : ✅ Aucun
  - `rare` : 🟡 Rare (1-5 bananes)
  - `moderate` : 🟠 Modéré
  - `severe` : 🔴 Sévère

### 21. Graines trouvées
- **ID :** `seedsFound`
- **Type :** `stepper`
- **Min :** 0
- **Max :** 500
- **Par défaut :** 0

### 22. Moisissure détectée
- **ID :** `moldDetected`
- **Type :** `select`
- **Options :**
  - `none` : ✅ Aucune
  - `light` : 🟡 Légère (<5%)
  - `moderate` : 🟠 Modérée (5-15%)
  - `severe` : 🔴 Sévère (>15%)

### 23. Dégâts nuisibles
- **ID :** `pestDamage`
- **Type :** `select`
- **Options :**
  - `none` : ✅ Aucun
  - `light` : 🟡 Légers
  - `moderate` : 🟠 Modérés
  - `severe` : 🔴 Sévères

### 24. Qualité globale récolte
- **ID :** `overallHarvestQuality`
- **Type :** `slider`
- **Min :** 0
- **Max :** 10
- **Step :** 0.5
- **Par défaut :** 7

### 25. Notes de récolte
- **ID :** `harvestNotes`
- **Type :** `textarea`
- **Max :** 1000 caractères

### 26. Améliorations futures
- **ID :** `nextGrowImprovements`
- **Type :** `textarea`
- **Max :** 500 caractères

---

## 🎯 Résumé par type de champ

### Types de champs utilisés :
- **date** : 3 champs
- **select** : 23 champs
- **slider** : 28 champs
- **stepper** : 5 champs
- **toggle** : 1 champ
- **multiselect** : 3 champs
- **autocomplete** : 2 champs
- **textarea** : 4 champs
- **computed** : 9 champs
- **dimensions** : 1 champ
- **frequency** : 2 champs
- **photoperiod** : 1 champ
- **pie** : 1 champ ✨ (Composition substrat)
- **phases** : 1 champ
- **image-upload** : 1 champ ✨ (Spectre lumineux)

**TOTAL : 85 champs**

---

## ✅ Statut d'implémentation

### Fonctionnalités complètes :
- ✅ 85 champs définis avec options/contraintes
- ✅ PieCompositionField pour composition substrat (% par composant)
- ✅ Image-upload pour graphique de spectre
- ✅ Tous les champs `select`/`multiselect` ont leurs options
- ✅ Champs computed avec fonctions de calcul
- ✅ Dépendances conditionnelles (showIf)
- ✅ Zones de validation (optimal/warning/danger)
- ✅ Suggestions/presets pour faciliter la saisie
- ✅ Tooltips explicatifs sur tous les champs

### Tests requis :
- 🔄 Test drag & drop de "Composition du substrat" → Affichage PieCompositionField
- 🔄 Test saisie % par composant (40% terre, 30% coco, 20% perlite, 10% humus)
- 🔄 Test normalisation à 100%
- 🔄 Test upload image spectre → Preview et stockage
- 🔄 Test sauvegarde valeurs dans cellules de la pipeline

---

**Document généré automatiquement le 2026-01-06**  
**Source :** client/src/config/cultureSidebarContent.js  
**FieldRenderer :** client/src/components/pipeline/FieldRenderer.jsx  
**PieCompositionField :** client/src/components/pipeline/fields/PieCompositionField.jsx
