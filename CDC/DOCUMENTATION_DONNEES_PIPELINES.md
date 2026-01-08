# 📊 Documentation Complète des Données Pipelines

## 🎯 Objectif
Liste exhaustive de toutes les données manipulables dans les pipelines, leurs valeurs assignables, règles d'interaction et contraintes d'attribution.

---

## 🌱 Pipeline Culture (Fleurs)

### 📋 GÉNÉRAL

#### Mode de culture
- **ID**: `mode`
- **Type**: `select`
- **Valeurs**:
  - `indoor` - Indoor (intérieur)
  - `outdoor` - Outdoor (extérieur)
  - `greenhouse` - Greenhouse (serre)
  - `notill` - No-till (sans labour)
  - `autre` - Autre
- **Défaut**: `indoor`
- **Règles**: Obligatoire pour J1. Non modifiable après J7 de floraison.

#### Dates de culture
- **ID**: `dateDebut` / `dateFin`
- **Type**: `date`
- **Format**: ISO 8601 (YYYY-MM-DD)
- **Règles**: 
  - `dateDebut` ≤ `dateFin`
  - Durée max: 365 jours
  - Auto-calculé si trame = "Jours"

#### Phase actuelle
- **ID**: `phaseActuelle`
- **Type**: `computed` (auto)
- **Valeurs**:
  - `graine` - Graine (J0)
  - `germination` - Germination (J1-J7)
  - `plantule` - Plantule (J8-J14)
  - `croissance_debut` - Début croissance
  - `croissance_milieu` - Milieu croissance
  - `croissance_fin` - Fin croissance
  - `stretch_debut` - Début stretch
  - `stretch_milieu` - Milieu stretch
  - `stretch_fin` - Fin stretch
  - `floraison_debut` - Début floraison
  - `floraison_milieu` - Milieu floraison
  - `floraison_fin` - Fin floraison
- **Règles**: Calculé automatiquement selon durée et photopériode

---

### 🏡 ESPACE DE CULTURE

#### Type d'espace
- **ID**: `espaceType`
- **Type**: `select`
- **Valeurs**:
  - `armoire` - Armoire
  - `tente` - Tente de culture
  - `serre` - Serre
  - `exterieur` - Extérieur
  - `piece` - Pièce dédiée
  - `autre` - Autre
- **Défaut**: `tente`

#### Dimensions
- **ID**: `espaceDimensions`
- **Type**: `dimensions` (objet)
- **Format**: `{ longueur: Number, largeur: Number, hauteur: Number, unite: 'cm'|'m' }`
- **Unités**: cm, m
- **Règles**:
  - Longueur > 0
  - Largeur > 0
  - Hauteur > 0
  - Auto-calcul surface (m²) et volume (m³)

#### Surface au sol
- **ID**: `espaceSurface`
- **Type**: `computed`
- **Unité**: m²
- **Calcul**: `longueur × largeur`

#### Volume total
- **ID**: `espaceVolume`
- **Type**: `computed`
- **Unité**: m³
- **Calcul**: `longueur × largeur × hauteur`

---

### 🌍 ENVIRONNEMENT

#### Température moyenne
- **ID**: `temperature`
- **Type**: `number`
- **Unité**: °C
- **Min**: 0
- **Max**: 50
- **Défaut**: 24
- **Règles**: 
  - Croissance: 20-28°C recommandé
  - Floraison: 18-26°C recommandé
  - Alerte si < 15°C ou > 32°C

#### Humidité relative
- **ID**: `humidite`
- **Type**: `number`
- **Unité**: %
- **Min**: 0
- **Max**: 100
- **Défaut**: 60
- **Règles**:
  - Croissance: 60-70% recommandé
  - Floraison: 40-50% recommandé
  - Alerte si > 70% en floraison (risque moisissure)

#### CO2
- **ID**: `co2`
- **Type**: `number`
- **Unité**: ppm
- **Min**: 300
- **Max**: 2000
- **Défaut**: 400 (atmosphérique)
- **Règles**:
  - Optionnel
  - 400-800 ppm: normal
  - 800-1500 ppm: enrichissement
  - > 1500 ppm: alerte sécurité

#### Ventilation
- **ID**: `ventilationType` / `ventilationFrequence`
- **Type**: `select` + `frequency`
- **Valeurs Type**:
  - `continue` - Continue (24/7)
  - `cyclique` - Cyclique
  - `passive` - Passive
  - `aucune` - Aucune
- **Fréquence**: Si cyclique → durée ON/OFF (ex: "15min ON / 45min OFF")

---

### 💡 LUMIÈRE

#### Type de lampe
- **ID**: `lumieretype`
- **Type**: `select`
- **Valeurs**:
  - `led` - LED
  - `hps` - HPS (sodium haute pression)
  - `mh` - MH (halogénures métalliques)
  - `cfl` - CFL (fluocompacte)
  - `naturel` - Lumière naturelle (soleil)
  - `mixte` - Mixte (LED + HPS, etc.)
  - `autre` - Autre
- **Défaut**: `led`

#### Spectre lumineux
- **ID**: `lumiereSpectre`
- **Type**: `select`
- **Valeurs**:
  - `complet` - Spectre complet (full spectrum)
  - `bleu` - Dominante bleue (croissance)
  - `rouge` - Dominante rouge (floraison)
  - `mixte` - Mixte ajustable
- **Défaut**: `complet`
- **Règles**: Optionnel, recommandé pour LED

#### Puissance totale
- **ID**: `lumierePuissance`
- **Type**: `number`
- **Unité**: W (watts)
- **Min**: 0
- **Max**: 10000
- **Défaut**: 400
- **Règles**: Calculer ratio W/m² si surface définie

#### Distance lampe/plante
- **ID**: `lumiereDistance`
- **Type**: `number`
- **Unités**: cm, m, pieds
- **Min**: 0
- **Règles**:
  - LED: 30-60 cm recommandé
  - HPS: 50-100 cm recommandé
  - Alerte si < 20 cm (brûlure)

#### Durée d'éclairage
- **ID**: `lumiereDuree`
- **Type**: `number`
- **Unité**: heures/jour
- **Min**: 0
- **Max**: 24
- **Défaut**: 18
- **Règles**:
  - Croissance: 18/6 ou 20/4 ou 24/0
  - Floraison: 12/12
  - Auto: 18/6 ou 20/4 constant

#### DLI (Daily Light Integral)
- **ID**: `lumiereDLI`
- **Type**: `number`
- **Unité**: mol/m²/jour
- **Min**: 0
- **Max**: 100
- **Défaut**: null (optionnel)
- **Règles**:
  - Croissance: 20-40 mol/m²/jour
  - Floraison: 40-65 mol/m²/jour

#### PPFD moyen
- **ID**: `lumierePPFD`
- **Type**: `number`
- **Unité**: µmol/m²/s
- **Min**: 0
- **Max**: 2000
- **Défaut**: null (optionnel)
- **Règles**:
  - Croissance: 300-600 µmol/m²/s
  - Floraison: 600-1000 µmol/m²/s

#### Kelvin (température couleur)
- **ID**: `lumiereKelvin`
- **Type**: `number`
- **Unité**: K
- **Min**: 2000
- **Max**: 10000
- **Défaut**: null (optionnel)
- **Règles**:
  - Croissance: 5000-6500K (lumière froide)
  - Floraison: 2700-3500K (lumière chaude)

---

### 🌱 SUBSTRAT

#### Type de substrat
- **ID**: `substratType`
- **Type**: `select`
- **Valeurs**:
  - `hydro` - Hydroponie
  - `bio` - Biologique
  - `organique` - Organique
  - `coco` - Fibre de coco
  - `laine_roche` - Laine de roche
  - `terre` - Terre classique
  - `mixte` - Mélange
- **Défaut**: `bio`

#### Volume
- **ID**: `substratVolume`
- **Type**: `number`
- **Unité**: L (litres)
- **Min**: 0
- **Défaut**: 11
- **Règles**: Volume par plante recommandé

#### Composition
- **ID**: `substratComposition`
- **Type**: `pie` (camembert %)
- **Format**: Array d'objets `{ ingredient: String, pourcentage: Number, marque: String }`
- **Ingrédients possibles**:
  - `terre` - Terre
  - `coco` - Fibre de coco
  - `perlite` - Perlite
  - `vermiculite` - Vermiculite
  - `laine_roche` - Laine de roche
  - `tourbe` - Tourbe
  - `compost` - Compost
  - `humus` - Humus de lombric
  - `autre` - Autre
- **Règles**: Somme des % = 100%

---

### 💧 IRRIGATION & SOLUTION NUTRITIVE

#### Système d'irrigation
- **ID**: `irrigationType`
- **Type**: `select`
- **Valeurs**:
  - `goutte_a_goutte` - Goutte à goutte
  - `inondation` - Inondation/vidange
  - `manuel` - Manuel (arrosoir)
  - `aspersion` - Aspersion
  - `capillarite` - Capillarité
  - `autre` - Autre
- **Défaut**: `manuel`

#### Fréquence d'irrigation
- **ID**: `irrigationFrequence`
- **Type**: `frequency`
- **Format**: Objet `{ nombre: Number, unite: 'jour'|'semaine'|'fois_par_jour' }`
- **Exemples**:
  - `{ nombre: 1, unite: 'jour' }` → 1 fois/jour
  - `{ nombre: 2, unite: 'fois_par_jour' }` → 2 fois/jour
  - `{ nombre: 3, unite: 'semaine' }` → 3 fois/semaine

#### Volume d'eau par arrosage
- **ID**: `irrigationVolume`
- **Type**: `number`
- **Unité**: L (litres)
- **Min**: 0
- **Défaut**: 1
- **Règles**: Calculer ratio par plante si nb plantes défini

#### Type d'irrigation
- **ID**: `typeIrrigation`
- **Type**: `select`
- **Valeurs**:
  - `goutte_goutte` - Goutte à goutte
  - `inondation` - Inondation
  - `manuel` - Manuel
- **Défaut**: `manuel`

#### Fréquence arrosage
- **ID**: `frequenceArrosage`
- **Type**: `number`
- **Unité**: fois/semaine
- **Min**: 0
- **Max**: 21 (3 fois/jour max)
- **Défaut**: 7

#### Volume par arrosage
- **ID**: `volumeArrosage`
- **Type**: `number`
- **Unité**: L
- **Min**: 0
- **Défaut**: 1

#### pH de l'eau
- **ID**: `pH`
- **Type**: `number`
- **Min**: 0
- **Max**: 14
- **Défaut**: 6.5
- **Règles**:
  - Terre: 6.0-7.0 recommandé
  - Hydro/coco: 5.5-6.5 recommandé
  - Alerte si < 5.0 ou > 8.0

#### EC (Conductivité)
- **ID**: `EC`
- **Type**: `number`
- **Unité**: mS/cm
- **Min**: 0
- **Max**: 5
- **Défaut**: 1.2
- **Règles**:
  - Croissance: 0.8-1.5 mS/cm
  - Floraison: 1.2-2.0 mS/cm
  - Rinçage: 0.0-0.4 mS/cm

#### Type d'eau
- **ID**: `typeEau`
- **Type**: `select`
- **Valeurs**:
  - `robinet` - Eau du robinet
  - `osmosee` - Eau osmosée
  - `pluie` - Eau de pluie
  - `source` - Eau de source
  - `minerale` - Eau minérale
- **Défaut**: `robinet`

---

### 🥗 ENGRAIS & NUTRITION

#### Type d'engrais
- **ID**: `engraisType`
- **Type**: `select`
- **Valeurs**:
  - `bio` - Biologique
  - `chimique` - Minéral/chimique
  - `organique` - Organique
  - `mixte` - Mixte
  - `aucun` - Aucun
- **Défaut**: `bio`

#### Marque et gamme
- **ID**: `engraisMarque` / `engraisGamme`
- **Type**: `text`
- **Exemples**:
  - Marque: "BioBizz", "General Hydroponics", "Advanced Nutrients"
  - Gamme: "Organic", "Trio", "pH Perfect"

#### Dosage
- **ID**: `engraisDosage`
- **Type**: `number`
- **Unités**: g/L ou mL/L
- **Min**: 0
- **Règles**: Respecter recommandations fabricant

#### Fréquence d'application
- **ID**: `engraisFrequence`
- **Type**: `frequency`
- **Unités**: seconde, minute, heure, jour, semaine
- **Exemples**:
  - `{ nombre: 1, unite: 'semaine' }` → 1 fois/semaine
  - `{ nombre: 3, unite: 'jour' }` → Tous les 3 jours

#### NPK (Azote-Phosphore-Potassium)
- **ID**: `engraisNPK`
- **Type**: `text` (format: "X-Y-Z")
- **Format**: "N-P-K" (ex: "10-5-7")
- **Règles**:
  - Croissance: N élevé (ex: 10-5-7)
  - Floraison: P/K élevés (ex: 5-10-10)

---

### 🌿 PALISSAGE (LST/HST)

#### Méthodes appliquées
- **ID**: `palissageMethodes`
- **Type**: `multiselect`
- **Valeurs**:
  - `scrog` - ScrOG (Screen of Green)
  - `sog` - SOG (Sea of Green)
  - `mainlining` - Main-Lining
  - `topping` - Topping (étêtage)
  - `fimming` - FIMming
  - `lst` - LST (Low Stress Training)
  - `supercropping` - Super-cropping
  - `lollipopping` - Lollipopping
  - `defoliation` - Défoliation
  - `aucun` - Aucun
- **Défaut**: `[]` (aucun)

#### Commentaire palissage
- **ID**: `palissageCommentaire`
- **Type**: `textarea`
- **Max**: 500 caractères
- **Placeholder**: "Décrivez vos manipulations..."

---

### 📏 MORPHOLOGIE DE LA PLANTE

#### Taille
- **ID**: `morphologieTaille`
- **Type**: `number`
- **Unités**: cm, m
- **Min**: 0
- **Règles**: Mesure du sommet de la plante

#### Volume
- **ID**: `morphologieVolume`
- **Type**: `number`
- **Unités**: cm³, L
- **Min**: 0
- **Règles**: Estimation visuelle ou calcul géométrique

#### Poids
- **ID**: `morphologiePoids`
- **Type**: `number`
- **Unités**: g, kg
- **Min**: 0
- **Règles**: Pesée sur pied (rare) ou estimation

#### Nombre de branches principales
- **ID**: `morphologieBranches`
- **Type**: `stepper`
- **Min**: 0
- **Max**: 50
- **Défaut**: 4

#### Nombre de feuilles
- **ID**: `morphologieFeuilles`
- **Type**: `stepper`
- **Min**: 0
- **Règles**: Estimation visuelle

#### Nombre de buds
- **ID**: `morphologieBuds`
- **Type**: `stepper`
- **Min**: 0
- **Règles**: Compter les têtes formées

---

### 🌾 RÉCOLTE

#### Couleur des trichomes
- **ID**: `recolteTrichomes`
- **Type**: `multiselect`
- **Valeurs**:
  - `translucide` - Translucide (clair)
  - `laiteux` - Laiteux (blanc opaque)
  - `ambre` - Ambré (brun/orange)
- **Règles**: Permet plusieurs valeurs (ex: 70% laiteux + 30% ambré)

#### Date de récolte
- **ID**: `recolteDate`
- **Type**: `date`
- **Format**: ISO 8601
- **Règles**: Doit être ≥ dateDebut

#### Poids brut
- **ID**: `recoltePoidsBrut`
- **Type**: `number`
- **Unité**: g (grammes)
- **Min**: 0
- **Règles**: Poids total immédiatement après récolte (branches + feuilles)

#### Poids net
- **ID**: `recoltePoidsNet`
- **Type**: `number`
- **Unité**: g
- **Min**: 0
- **Règles**: Poids après 1ère défoliation (≤ poidsBrut)

#### Rendement
- **ID**: `recolteRendement`
- **Type**: `computed`
- **Unités**: g/m² ou g/plante
- **Calcul**:
  - Si surface définie: `poidsNet / surface`
  - Sinon: `poidsNet / nombre_plantes`

---

## 🔥 Pipeline Curing/Maturation (Tous types)

### ⚙️ GÉNÉRAL

#### Type de maturation
- **ID**: `typeMaturation`
- **Type**: `select`
- **Valeurs**:
  - `froid` - Froid (< 5°C)
  - `chaud` - Chaud (> 5°C)
  - `mixte` - Mixte (alternance)
- **Défaut**: `froid`

#### Méthode de séchage
- **ID**: `methodeSechage`
- **Type**: `select`
- **Valeurs**:
  - `suspendus` - Branches suspendues
  - `filet` - Filet de séchage
  - `plateau` - Plateau
  - `papier` - Papier/carton
  - `autre` - Autre
- **Défaut**: `suspendus`

#### Durée totale
- **ID**: `dureeCuring`
- **Type**: `number`
- **Min**: 1
- **Défaut**: 14

#### Unité de durée
- **ID**: `dureeCuringUnite`
- **Type**: `select`
- **Valeurs**:
  - `jours` - Jours
  - `semaines` - Semaines
  - `mois` - Mois
- **Défaut**: `jours`

---

### 🌡️ ENVIRONNEMENT

#### Température
- **ID**: `temperature`
- **Type**: `number`
- **Unité**: °C
- **Min**: -20
- **Max**: 50
- **Défaut**: 18
- **Règles**:
  - Froid: 0-5°C
  - Chaud: 15-20°C
  - Alerte si > 25°C (dégradation terpènes)

#### Humidité relative
- **ID**: `humidite`
- **Type**: `number`
- **Unité**: %
- **Min**: 0
- **Max**: 100
- **Défaut**: 62
- **Règles**:
  - Séchage: 45-55%
  - Curing: 58-65%
  - Alerte si > 70% (moisissure)

---

### 📦 BALLOTAGE & EMBALLAGE

#### Type de récipient
- **ID**: `typeRecipient`
- **Type**: `select`
- **Valeurs**:
  - `aire_libre` - Aire libre (suspendu)
  - `verre` - Bocal en verre
  - `plastique` - Récipient plastique
  - `metal` - Boîte métal
  - `bois` - Caisse bois
  - `papier` - Sac papier
  - `autre` - Autre
- **Défaut**: `verre`

#### Emballage primaire
- **ID**: `emballagePrimaire`
- **Type**: `select`
- **Valeurs**:
  - `aucun` - Aucun
  - `cellophane` - Cellophane
  - `papier_cuisson` - Papier cuisson
  - `aluminium` - Papier aluminium
  - `paper_hash` - Paper hash (parchemin)
  - `sac_vide` - Sac à vide
  - `congelation` - Sac congélation
  - `sous_vide_complet` - Sous vide complet (machine)
  - `sous_vide_partiel` - Sous vide partiel (manuel)
  - `autre` - Autre
- **Défaut**: `aucun`

#### Opacité du récipient
- **ID**: `opaciteRecipient`
- **Type**: `select`
- **Valeurs**:
  - `opaque` - Opaque (0% lumière)
  - `semi_opaque` - Semi-opaque (< 50% lumière)
  - `transparent` - Transparent (> 80% lumière)
  - `ambre` - Ambré (filtre UV)
- **Défaut**: `opaque`
- **Règles**: Opaque recommandé (protection UV)

#### Volume occupé
- **ID**: `volumeOccupe`
- **Type**: `number`
- **Min**: 0
- **Défaut**: null

#### Unité volume
- **ID**: `volumeOccupeUnite`
- **Type**: `select`
- **Valeurs**:
  - `L` - L (litres)
  - `mL` - mL (millilitres)
- **Défaut**: `mL`

#### Ballotage effectué
- **ID**: `ballotage`
- **Type**: `select`
- **Valeurs**:
  - `oui` - Oui (quotidien)
  - `occasionnel` - Occasionnel
  - `non` - Non
- **Défaut**: `occasionnel`
- **Règles**: Recommandé durant les 2 premières semaines

---

### 👃 OBSERVATIONS

#### Observations odeur/texture
- **ID**: `observations`
- **Type**: `textarea`
- **Max**: 1000 caractères
- **Placeholder**: "Notez vos observations..."

---

### 📊 MODIFICATIONS NOTES (Évolution)

#### Notes Visuel & Technique
- **ID**: `note-couleur`, `note-densite`, `note-trichomes`, `note-pistils`, `note-manucure`
- **Type**: `slider`
- **Min**: 0
- **Max**: 10
- **Défaut**: 5
- **Règles**: Permet de suivre l'évolution de chaque note au fil du curing

#### Notes Texture
- **ID**: `note-durete`, `note-densite-tactile`, `note-elasticite`, `note-collant`
- **Type**: `slider`
- **Min**: 0
- **Max**: 10
- **Défaut**: 5

#### Notes Odeurs
- **ID**: `note-odeur-intensite`, `note-odeur-fidelite`
- **Type**: `slider`
- **Min**: 0
- **Max**: 10
- **Défaut**: 5

#### Notes Goûts
- **ID**: `note-gout-intensite`, `note-gout-agressivite`
- **Type**: `slider`
- **Min**: 0
- **Max**: 10
- **Défaut**: 5

#### Notes Effets
- **ID**: `note-effet-montee`, `note-effet-intensite`
- **Type**: `slider`
- **Min**: 0
- **Max**: 10
- **Défaut**: 5

---

## 🔬 Pipeline Hash (Séparation)

### 🧪 SÉPARATION

#### Méthode de séparation
- **ID**: `methodeSeparation`
- **Type**: `select`
- **Valeurs**:
  - `manuelle` - Manuelle (frottage)
  - `tamisage_sec` - Tamisage à sec (dry-sift)
  - `eau_glace` - Eau + glace (ice-o-lator)
  - `autre` - Autre
- **Défaut**: `eau_glace`

#### Nombre de passes
- **ID**: `nombrePasses`
- **Type**: `stepper`
- **Min**: 1
- **Max**: 20
- **Défaut**: 5
- **Règles**: Applicable si eau/glace

#### Température de l'eau
- **ID**: `temperatureEau`
- **Type**: `number`
- **Unité**: °C
- **Min**: -5
- **Max**: 30
- **Défaut**: 2
- **Règles**: Applicable si eau/glace. Idéal: 0-4°C

#### Taille des mailles
- **ID**: `tailleMailles`
- **Type**: `multiselect`
- **Valeurs**: 220µm, 190µm, 160µm, 120µm, 90µm, 73µm, 45µm, 25µm
- **Règles**:
  - Tamisage sec: sélection unique ou multiple
  - Eau/glace: bag set complet

#### Type de matière première
- **ID**: `matierePremiereType`
- **Type**: `multiselect`
- **Valeurs**:
  - `buds` - Buds/têtes
  - `trim` - Trim (chutes)
  - `sugar_leaves` - Sugar leaves (petites feuilles résineuses)
  - `fan_leaves` - Fan leaves (grandes feuilles)
  - `autre` - Autre
- **Défaut**: `['buds']`

#### Qualité matière première
- **ID**: `matierePremiereQualite`
- **Type**: `slider`
- **Min**: 1
- **Max**: 10
- **Défaut**: 7

#### Rendement estimé
- **ID**: `rendement`
- **Type**: `number`
- **Unité**: %
- **Min**: 0
- **Max**: 100
- **Règles**: Calcul automatique si poids avant/après définis

#### Temps total de séparation
- **ID**: `tempsSeparation`
- **Type**: `number`
- **Unité**: minutes
- **Min**: 0

---

### 🧬 PURIFICATION (Pipeline Hash & Concentrés)

#### Méthode de purification
- **ID**: `methodePurification`
- **Type**: `multiselect`
- **Valeurs**:
  - `chromatographie_colonne` - Chromatographie sur colonne
  - `flash_chromatography` - Flash Chromatography
  - `hplc` - HPLC (Chromatographie liquide haute performance)
  - `gc` - GC (Chromatographie en phase gazeuse)
  - `tlc` - TLC (Chromatographie sur couche mince)
  - `winterisation` - Winterisation
  - `decarboxylation` - Décarboxylation
  - `fractionnement_temperature` - Fractionnement par température
  - `fractionnement_solubilite` - Fractionnement par solubilité
  - `filtration` - Filtration
  - `centrifugation` - Centrifugation
  - `decantation` - Décantation
  - `sechage_vide` - Séchage sous vide
  - `recristallisation` - Recristallisation
  - `sublimation` - Sublimation
  - `extraction_liquide_liquide` - Extraction liquide-liquide
  - `adsorption_charbon` - Adsorption sur charbon actif
  - `filtration_membranaire` - Filtration membranaire
- **Règles**: Chaque méthode ouvre des sous-champs spécifiques

---

## 💎 Pipeline Concentrés (Extraction)

### 🔬 EXTRACTION

#### Méthode d'extraction
- **ID**: `methodeExtraction`
- **Type**: `select`
- **Valeurs**:
  - `pressage_chaud` - Pressage à chaud (Rosin)
  - `pressage_froid` - Pressage à froid
  - `ethanol` - Extraction à l'éthanol (EHO)
  - `ipa` - Extraction à l'alcool isopropylique (IPA)
  - `acetone` - Extraction à l'acétone (AHO)
  - `butane` - Extraction au butane (BHO)
  - `isobutane` - Extraction à l'isobutane (IHO)
  - `propane` - Extraction au propane (PHO)
  - `hexane` - Extraction à l'hexane (HHO)
  - `huiles_vegetales` - Extraction aux huiles végétales (coco, olive)
  - `co2_supercritique` - Extraction au CO₂ supercritique
  - `ultrasons` - Extraction par ultrasons (UAE)
  - `micro_ondes` - Extraction assistée par micro-ondes (MAE)
  - `tensioactifs` - Extraction avec tensioactifs (Tween 20)
  - `autre` - Autre
- **Défaut**: `pressage_chaud`

#### Température d'extraction (si pressage)
- **ID**: `extractionTemperature`
- **Type**: `number`
- **Unité**: °C
- **Min**: -20
- **Max**: 250
- **Règles**:
  - Pressage froid: 0-60°C
  - Pressage chaud: 80-120°C

#### Pression (si pressage)
- **ID**: `extractionPression`
- **Type**: `number`
- **Unité**: bars ou PSI
- **Min**: 0
- **Règles**: Rosin: 300-1000 PSI

#### Solvant utilisé
- **ID**: `extractionSolvant`
- **Type**: `select`
- **Règles**: Auto-rempli selon méthode

#### Ratio solvant/matière
- **ID**: `extractionRatio`
- **Type**: `text`
- **Format**: "X:Y" (ex: "10:1" → 10mL solvant pour 1g matière)

---

### 🧬 PURIFICATION (Concentrés)
*Identique à Pipeline Hash, voir section précédente*

---

## 🍪 Pipeline Comestibles (Recette)

### 🥘 INGRÉDIENTS

#### Ingrédient
- **ID**: `ingredient-{index}`
- **Type**: Objet composite
- **Structure**:
  ```json
  {
    "nom": String,
    "type": "standard" | "cannabinique",
    "quantite": Number,
    "unite": String,
    "actif": Boolean // Si cannabinique: true
  }
  ```
- **Unités possibles**: g, kg, mL, L, pcs (pièces), cs (cuillères à soupe), cc (cuillères à café)

#### Étapes de préparation
- **ID**: `etape-{index}`
- **Type**: Objet
- **Structure**:
  ```json
  {
    "action": String, // "melanger", "cuire", "refroidir", etc.
    "ingredientsConcer": Array<Number>, // Index des ingrédients
    "duree": Number, // minutes
    "temperature": Number, // °C (si applicable)
    "notes": String
  }
  ```

#### Actions prédéfinies
- `melanger` - Mélanger
- `fouetter` - Fouetter
- `chauffer` - Chauffer
- `cuire` - Cuire
- `refroidir` - Refroidir
- `infuser` - Infuser
- `decarboxyler` - Décarboxyler
- `filtrer` - Filtrer
- `mouler` - Mouler
- `congeler` - Congeler

---

## 🔄 Règles d'interaction globales

### Attribution de valeurs
1. **Clic normal** sur une case → Ouvre modal de configuration pour cette case uniquement
2. **Ctrl+Clic** sur plusieurs cases → Sélection multiple (bordure verte)
3. **Drop** depuis sidebar → Ouvre modal pour attribution (case unique ou sélection)
4. **Modal multi-assign** → Applique les valeurs à toutes les cases sélectionnées

### Validation des données
- Les champs `number` vérifient min/max avant sauvegarde
- Les champs `select` n'acceptent que les valeurs prédéfinies
- Les champs `computed` sont recalculés automatiquement
- Les champs `date` vérifient la cohérence chronologique

### Interdépendances
- `espaceSurface` = auto-calculé depuis `espaceDimensions`
- `espaceVolume` = auto-calculé depuis `espaceDimensions`
- `recolteRendement` = auto-calculé depuis `recoltePoidsNet` et `espaceSurface`
- `phaseActuelle` = auto-calculé selon durée et photopériode

### Contraintes CDC
- Aucune donnée texte libre sauf `textarea` pour observations
- Toutes les entrées via sélecteurs, sliders, steppers, etc.
- Valeurs par défaut obligatoires pour tous les champs
- Logs console pour traçabilité (dev mode)

---

## 📈 Prochaines étapes

### Phase suivante: Arbre généalogique & Phénohunt
- Section 2 du formulaire Fleurs
- Système de bibliothèque de cultivars
- Canvas drag & drop pour lignées généalogiques
- Gestion projets PhenoHunt (sélection phénotypes)

---

*Document généré le 2026-01-06 pour Reviews-Maker*
