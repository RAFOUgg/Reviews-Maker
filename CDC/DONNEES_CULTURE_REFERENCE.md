# 🌱 Référence Données Pipeline Culture

## 📋 GÉNÉRAL

### Mode de culture
- **ID**: `mode`
- **Type**: `select`
- **Valeurs**: `indoor`, `outdoor`, `greenhouse`, `notill`, `autre`
- **Défaut**: `indoor`

### Dates
- **dateDebut**: Date ISO (YYYY-MM-DD)
- **dateFin**: Date ISO (YYYY-MM-DD)

---

## 🏡 ESPACE DE CULTURE

### Type d'espace
- **ID**: `espaceType`
- **Type**: `select`
- **Valeurs**: `armoire`, `tente`, `serre`, `exterieur`, `piece`, `autre`
- **Défaut**: `tente`

### Dimensions
- **ID**: `espaceDimensions`
- **Type**: `dimensions`
- **Format**: `{ longueur: Number, largeur: Number, hauteur: Number, unite: 'cm'|'m' }`

### Surface/Volume
- **espaceSurface**: Calculé auto (m²)
- **espaceVolume**: Calculé auto (m³)

---

## 🌡️ ENVIRONNEMENT

### Température
- **ID**: `temperature`
- **Type**: `number`
- **Unité**: °C
- **Min**: 0, **Max**: 50
- **Défaut**: 24

### Humidité
- **ID**: `humidite`
- **Type**: `number`
- **Unité**: %
- **Min**: 0, **Max**: 100
- **Défaut**: 60

### CO2
- **ID**: `co2`
- **Type**: `number`
- **Unité**: ppm
- **Min**: 300, **Max**: 2000
- **Défaut**: 400

### Ventilation
- **ID**: `ventilationType`
- **Type**: `select`
- **Valeurs**: `continue`, `cyclique`, `passive`, `aucune`
- **Défaut**: `continue`

---

## 💡 LUMIÈRE

### Type de lampe
- **ID**: `lumieretype`
- **Type**: `select`
- **Valeurs**: `led`, `hps`, `mh`, `cfl`, `naturel`, `mixte`, `autre`
- **Défaut**: `led`

### Spectre
- **ID**: `lumiereSpectre`
- **Type**: `select`
- **Valeurs**: `complet`, `bleu`, `rouge`, `mixte`
- **Défaut**: `complet`

### Puissance
- **ID**: `lumierePuissance`
- **Type**: `number`
- **Unité**: W
- **Min**: 0, **Max**: 10000
- **Défaut**: 400

### Distance
- **ID**: `lumiereDistance`
- **Type**: `number`
- **Unités**: cm, m, pieds
- **Min**: 0
- **Défaut**: 40

### Durée
- **ID**: `lumiereDuree`
- **Type**: `number`
- **Unité**: h/jour
- **Min**: 0, **Max**: 24
- **Défaut**: 18

### DLI
- **ID**: `lumiereDLI`
- **Type**: `number`
- **Unité**: mol/m²/jour
- **Min**: 0, **Max**: 100
- **Optionnel**

### PPFD
- **ID**: `lumierePPFD`
- **Type**: `number`
- **Unité**: µmol/m²/s
- **Min**: 0, **Max**: 2000
- **Optionnel**

### Kelvin
- **ID**: `lumiereKelvin`
- **Type**: `number`
- **Unité**: K
- **Min**: 2000, **Max**: 10000
- **Optionnel**

---

## 🌱 SUBSTRAT

### Type
- **ID**: `substratType`
- **Type**: `select`
- **Valeurs**: `hydro`, `bio`, `organique`, `coco`, `laine_roche`, `terre`, `mixte`
- **Défaut**: `bio`

### Volume
- **ID**: `substratVolume`
- **Type**: `number`
- **Unité**: L
- **Min**: 0
- **Défaut**: 11

### Composition
- **ID**: `substratComposition`
- **Type**: `pie`
- **Ingrédients**: `terre`, `coco`, `perlite`, `vermiculite`, `laine_roche`, `tourbe`, `compost`, `humus`, `autre`
- **Règle**: Total = 100%

---

## 💧 IRRIGATION

### Système
- **ID**: `irrigationType`
- **Type**: `select`
- **Valeurs**: `goutte_a_goutte`, `inondation`, `manuel`, `aspersion`, `capillarite`, `autre`
- **Défaut**: `manuel`

### Fréquence
- **ID**: `frequenceArrosage`
- **Type**: `number`
- **Unité**: fois/semaine
- **Min**: 0, **Max**: 21
- **Défaut**: 7

### Volume
- **ID**: `volumeArrosage`
- **Type**: `number`
- **Unité**: L
- **Min**: 0
- **Défaut**: 1

### pH
- **ID**: `pH`
- **Type**: `number`
- **Min**: 0, **Max**: 14
- **Défaut**: 6.5

### EC
- **ID**: `EC`
- **Type**: `number`
- **Unité**: mS/cm
- **Min**: 0, **Max**: 5
- **Défaut**: 1.2

### Type d'eau
- **ID**: `typeEau`
- **Type**: `select`
- **Valeurs**: `robinet`, `osmosee`, `pluie`, `source`, `minerale`
- **Défaut**: `robinet`

---

## 🥗 ENGRAIS

### Type
- **ID**: `engraisType`
- **Type**: `select`
- **Valeurs**: `bio`, `chimique`, `organique`, `mixte`, `aucun`
- **Défaut**: `bio`

### Marque/Gamme
- **ID**: `engraisMarque` / `engraisGamme`
- **Type**: `text`

### Dosage
- **ID**: `engraisDosage`
- **Type**: `number`
- **Unités**: g/L, mL/L
- **Min**: 0

### Fréquence
- **ID**: `engraisFrequence`
- **Type**: `frequency`
- **Unités**: seconde, minute, heure, jour, semaine

### NPK
- **ID**: `engraisNPK`
- **Type**: `text`
- **Format**: "N-P-K" (ex: "10-5-7")

---

## 🌿 PALISSAGE

### Méthodes
- **ID**: `palissageMethodes`
- **Type**: `multiselect`
- **Valeurs**: `scrog`, `sog`, `mainlining`, `topping`, `fimming`, `lst`, `supercropping`, `lollipopping`, `defoliation`, `aucun`
- **Défaut**: `[]`

### Commentaire
- **ID**: `palissageCommentaire`
- **Type**: `textarea`
- **Max**: 500 caractères

---

## 📏 MORPHOLOGIE

### Taille
- **ID**: `morphologieTaille`
- **Type**: `number`
- **Unités**: cm, m
- **Min**: 0

### Volume
- **ID**: `morphologieVolume`
- **Type**: `number`
- **Unités**: cm³, L
- **Min**: 0

### Poids
- **ID**: `morphologiePoids`
- **Type**: `number`
- **Unités**: g, kg
- **Min**: 0

### Branches
- **ID**: `morphologieBranches`
- **Type**: `stepper`
- **Min**: 0, **Max**: 50
- **Défaut**: 4

### Feuilles
- **ID**: `morphologieFeuilles`
- **Type**: `stepper`
- **Min**: 0

### Buds
- **ID**: `morphologieBuds`
- **Type**: `stepper`
- **Min**: 0

---

## 🌾 RÉCOLTE

### Trichomes
- **ID**: `recolteTrichomes`
- **Type**: `multiselect`
- **Valeurs**: `translucide`, `laiteux`, `ambre`
- **Défaut**: `['laiteux']`

### Date
- **ID**: `recolteDate`
- **Type**: `date`
- **Format**: ISO 8601

### Poids brut
- **ID**: `recoltePoidsBrut`
- **Type**: `number`
- **Unité**: g
- **Min**: 0

### Poids net
- **ID**: `recoltePoidsNet`
- **Type**: `number`
- **Unité**: g
- **Min**: 0

### Rendement
- **ID**: `recolteRendement`
- **Type**: `computed`
- **Unités**: g/m², g/plante
- **Calcul**: `poidsNet / surface` ou `poidsNet / nb_plantes`

---

*Document de référence - Reviews-Maker 2026*
