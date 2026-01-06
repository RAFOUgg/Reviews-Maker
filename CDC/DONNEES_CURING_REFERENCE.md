# 🔥 Référence Données Pipeline Curing/Maturation

## ⚙️ GÉNÉRAL

### Type maturation
- **ID**: `typeMaturation`
- **Type**: `select`
- **Valeurs**: `froid` (< 5°C), `chaud` (> 5°C), `mixte`
- **Défaut**: `froid`

### Méthode séchage
- **ID**: `methodeSechage`
- **Type**: `select`
- **Valeurs**: `suspendus`, `filet`, `plateau`, `papier`, `autre`
- **Défaut**: `suspendus`

### Durée totale
- **ID**: `dureeCuring`
- **Type**: `number`
- **Min**: 1
- **Défaut**: 14

### Unité durée
- **ID**: `dureeCuringUnite`
- **Type**: `select`
- **Valeurs**: `jours`, `semaines`, `mois`
- **Défaut**: `jours`

---

## 🌡️ ENVIRONNEMENT

### Température
- **ID**: `temperature`
- **Type**: `number`
- **Unité**: °C
- **Min**: -20, **Max**: 50
- **Défaut**: 18
- **Recommandé**: Froid 0-5°C, Chaud 15-20°C

### Humidité
- **ID**: `humidite`
- **Type**: `number`
- **Unité**: %
- **Min**: 0, **Max**: 100
- **Défaut**: 62
- **Recommandé**: Séchage 45-55%, Curing 58-65%

---

## 📦 BALLOTAGE & EMBALLAGE

### Type récipient
- **ID**: `typeRecipient`
- **Type**: `select`
- **Valeurs**: `aire_libre`, `verre`, `plastique`, `metal`, `bois`, `papier`, `autre`
- **Défaut**: `verre`

### Emballage primaire
- **ID**: `emballagePrimaire`
- **Type**: `select`
- **Valeurs**: `aucun`, `cellophane`, `papier_cuisson`, `aluminium`, `paper_hash`, `sac_vide`, `congelation`, `sous_vide_complet`, `sous_vide_partiel`, `autre`
- **Défaut**: `aucun`

### Opacité
- **ID**: `opaciteRecipient`
- **Type**: `select`
- **Valeurs**: `opaque` (0% lumière), `semi_opaque` (< 50%), `transparent` (> 80%), `ambre` (filtre UV)
- **Défaut**: `opaque`

### Volume occupé
- **ID**: `volumeOccupe`
- **Type**: `number`
- **Min**: 0

### Unité volume
- **ID**: `volumeOccupeUnite`
- **Type**: `select`
- **Valeurs**: `L` (litres), `mL` (millilitres)
- **Défaut**: `mL`

### Ballotage
- **ID**: `ballotage`
- **Type**: `select`
- **Valeurs**: `oui` (quotidien), `occasionnel`, `non`
- **Défaut**: `occasionnel`

---

## 👃 OBSERVATIONS

### Observations
- **ID**: `observations`
- **Type**: `textarea`
- **Max**: 1000 caractères
- **Placeholder**: "Notez vos observations..."

---

## 📊 ÉVOLUTION DES NOTES

### Visuel & Technique
- **note-couleur**: Slider 0-10, défaut 5
- **note-densite**: Slider 0-10, défaut 5
- **note-trichomes**: Slider 0-10, défaut 5
- **note-pistils**: Slider 0-10, défaut 5
- **note-manucure**: Slider 0-10, défaut 5

### Texture
- **note-durete**: Slider 0-10, défaut 5
- **note-densite-tactile**: Slider 0-10, défaut 5
- **note-elasticite**: Slider 0-10, défaut 5
- **note-collant**: Slider 0-10, défaut 5

### Odeurs
- **note-odeur-intensite**: Slider 0-10, défaut 5
- **note-odeur-fidelite**: Slider 0-10, défaut 5

### Goûts
- **note-gout-intensite**: Slider 0-10, défaut 5
- **note-gout-agressivite**: Slider 0-10, défaut 5

### Effets
- **note-effet-montee**: Slider 0-10, défaut 5
- **note-effet-intensite**: Slider 0-10, défaut 5

---

*Document de référence - Reviews-Maker 2026*
