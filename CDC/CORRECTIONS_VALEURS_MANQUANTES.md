# 🔧 Corrections à apporter - Valeurs manquantes Pipelines

## 🎯 Objectif
Liste des valeurs `defaultValue`, `options`, `min`, `max` manquantes identifiées dans les pipelines Culture, Curing, Hash et Concentrés.

---

## ✅ État actuel des fichiers

### 📁 `cultureSidebarContent.js`
**Localisation**: `client/src/data/cultureSidebarContent.js`

#### ⚠️ Valeurs manquantes à ajouter

##### Section GÉNÉRAL
```javascript
{
    id: 'mode',
    label: 'Mode de culture',
    type: 'select',
    options: [ // ✅ OK
        { value: 'indoor', label: 'Indoor (intérieur)' },
        { value: 'outdoor', label: 'Outdoor (extérieur)' },
        { value: 'greenhouse', label: 'Greenhouse (serre)' },
        { value: 'notill', label: 'No-till (sans labour)' },
        { value: 'autre', label: 'Autre' }
    ],
    defaultValue: 'indoor' // ✅ OK
}
```

##### Section ESPACE DE CULTURE
```javascript
{
    id: 'espaceType',
    // ❌ MANQUE: options
    options: [
        { value: 'armoire', label: 'Armoire' },
        { value: 'tente', label: 'Tente de culture' },
        { value: 'serre', label: 'Serre' },
        { value: 'exterieur', label: 'Extérieur' },
        { value: 'piece', label: 'Pièce dédiée' },
        { value: 'autre', label: 'Autre' }
    ],
    defaultValue: 'tente'
}
```

##### Section LUMIÈRE
```javascript
{
    id: 'lumieretype',
    // ❌ MANQUE: options complètes
    options: [
        { value: 'led', label: 'LED' },
        { value: 'hps', label: 'HPS (sodium haute pression)' },
        { value: 'mh', label: 'MH (halogénures métalliques)' },
        { value: 'cfl', label: 'CFL (fluocompacte)' },
        { value: 'naturel', label: 'Lumière naturelle (soleil)' },
        { value: 'mixte', label: 'Mixte (LED + HPS, etc.)' },
        { value: 'autre', label: 'Autre' }
    ],
    defaultValue: 'led'
},
{
    id: 'lumiereSpectre',
    // ❌ MANQUE: options
    options: [
        { value: 'complet', label: 'Spectre complet (full spectrum)' },
        { value: 'bleu', label: 'Dominante bleue (croissance)' },
        { value: 'rouge', label: 'Dominante rouge (floraison)' },
        { value: 'mixte', label: 'Mixte ajustable' }
    ],
    defaultValue: 'complet'
},
{
    id: 'lumierePuissance',
    // ❌ MANQUE: min, max, defaultValue
    min: 0,
    max: 10000,
    defaultValue: 400
},
{
    id: 'lumiereDistance',
    // ❌ MANQUE: min, defaultValue
    min: 0,
    defaultValue: 40
},
{
    id: 'lumiereDuree',
    // ❌ MANQUE: min, max, defaultValue
    min: 0,
    max: 24,
    defaultValue: 18
},
{
    id: 'lumiereDLI',
    // ❌ MANQUE: min, max
    min: 0,
    max: 100,
    defaultValue: null // Optionnel
},
{
    id: 'lumierePPFD',
    // ❌ MANQUE: min, max
    min: 0,
    max: 2000,
    defaultValue: null // Optionnel
},
{
    id: 'lumiereKelvin',
    // ❌ MANQUE: min, max
    min: 2000,
    max: 10000,
    defaultValue: null // Optionnel
}
```

##### Section SUBSTRAT
```javascript
{
    id: 'substratType',
    // ❌ MANQUE: options
    options: [
        { value: 'hydro', label: 'Hydroponie' },
        { value: 'bio', label: 'Biologique' },
        { value: 'organique', label: 'Organique' },
        { value: 'coco', label: 'Fibre de coco' },
        { value: 'laine_roche', label: 'Laine de roche' },
        { value: 'terre', label: 'Terre classique' },
        { value: 'mixte', label: 'Mélange' }
    ],
    defaultValue: 'bio'
},
{
    id: 'substratVolume',
    // ❌ MANQUE: min, defaultValue
    min: 0,
    defaultValue: 11
}
```

##### Section IRRIGATION
```javascript
{
    id: 'irrigationType',
    // ❌ MANQUE: options
    options: [
        { value: 'goutte_a_goutte', label: 'Goutte à goutte' },
        { value: 'inondation', label: 'Inondation/vidange' },
        { value: 'manuel', label: 'Manuel (arrosoir)' },
        { value: 'aspersion', label: 'Aspersion' },
        { value: 'capillarite', label: 'Capillarité' },
        { value: 'autre', label: 'Autre' }
    ],
    defaultValue: 'manuel'
},
{
    id: 'typeIrrigation',
    // ❌ DOUBLON avec irrigationType - À supprimer ou fusionner
},
{
    id: 'frequenceArrosage',
    // ❌ MANQUE: min, max, defaultValue
    min: 0,
    max: 21,
    defaultValue: 7
},
{
    id: 'volumeArrosage',
    // ❌ MANQUE: min, defaultValue
    min: 0,
    defaultValue: 1
},
{
    id: 'pH',
    // ❌ MANQUE: min, max, defaultValue
    min: 0,
    max: 14,
    defaultValue: 6.5
},
{
    id: 'EC',
    // ❌ MANQUE: min, max, defaultValue
    min: 0,
    max: 5,
    defaultValue: 1.2
},
{
    id: 'typeEau',
    // ❌ MANQUE: options
    options: [
        { value: 'robinet', label: 'Eau du robinet' },
        { value: 'osmosee', label: 'Eau osmosée' },
        { value: 'pluie', label: 'Eau de pluie' },
        { value: 'source', label: 'Eau de source' },
        { value: 'minerale', label: 'Eau minérale' }
    ],
    defaultValue: 'robinet'
}
```

##### Section ENGRAIS
```javascript
{
    id: 'engraisType',
    // ❌ MANQUE: options
    options: [
        { value: 'bio', label: 'Biologique' },
        { value: 'chimique', label: 'Minéral/chimique' },
        { value: 'organique', label: 'Organique' },
        { value: 'mixte', label: 'Mixte' },
        { value: 'aucun', label: 'Aucun' }
    ],
    defaultValue: 'bio'
},
{
    id: 'engraisDosage',
    // ❌ MANQUE: min
    min: 0,
    defaultValue: null
}
```

##### Section PALISSAGE
```javascript
{
    id: 'palissageMethodes',
    // ❌ MANQUE: options
    options: [
        { value: 'scrog', label: 'ScrOG (Screen of Green)' },
        { value: 'sog', label: 'SOG (Sea of Green)' },
        { value: 'mainlining', label: 'Main-Lining' },
        { value: 'topping', label: 'Topping (étêtage)' },
        { value: 'fimming', label: 'FIMming' },
        { value: 'lst', label: 'LST (Low Stress Training)' },
        { value: 'supercropping', label: 'Super-cropping' },
        { value: 'lollipopping', label: 'Lollipopping' },
        { value: 'defoliation', label: 'Défoliation' },
        { value: 'aucun', label: 'Aucun' }
    ],
    defaultValue: [] // MultiSelect
},
{
    id: 'palissageCommentaire',
    // ❌ MANQUE: maxLength
    maxLength: 500
}
```

##### Section MORPHOLOGIE
```javascript
{
    id: 'morphologieTaille',
    // ❌ MANQUE: min, defaultValue
    min: 0,
    defaultValue: null
},
{
    id: 'morphologieVolume',
    min: 0,
    defaultValue: null
},
{
    id: 'morphologiePoids',
    min: 0,
    defaultValue: null
},
{
    id: 'morphologieBranches',
    min: 0,
    max: 50,
    defaultValue: 4
},
{
    id: 'morphologieFeuilles',
    min: 0,
    defaultValue: null
},
{
    id: 'morphologieBuds',
    min: 0,
    defaultValue: null
}
```

##### Section RÉCOLTE
```javascript
{
    id: 'recolteTrichomes',
    // ❌ MANQUE: options
    options: [
        { value: 'translucide', label: 'Translucide (clair)' },
        { value: 'laiteux', label: 'Laiteux (blanc opaque)' },
        { value: 'ambre', label: 'Ambré (brun/orange)' }
    ],
    defaultValue: ['laiteux']
},
{
    id: 'recoltePoidsBrut',
    min: 0,
    defaultValue: null
},
{
    id: 'recoltePoidsNet',
    min: 0,
    defaultValue: null
}
```

---

### 📁 `CuringMaturationTimeline.jsx`
**Localisation**: `client/src/components/forms/flower/CuringMaturationTimeline.jsx`

#### ✅ État: Complet
Toutes les valeurs `defaultValue`, `options`, `min`, `max` sont correctement définies.

---

### 📁 Pipelines Hash et Concentrés
**Localisation**: À créer

#### ❌ Non implémentés
Les pipelines Hash et Concentrés n'ont **pas encore de fichiers dédiés** comme `hashSidebarContent.js` ou `concentrateSidebarContent.js`.

**Action requise**: Créer ces fichiers avec toutes les données de la documentation.

---

## 🔧 Plan d'action

### Étape 1: Compléter `cultureSidebarContent.js`
- [ ] Ajouter `options` manquantes (espaceType, lumieretype, lumiereSpectre, etc.)
- [ ] Ajouter `min`, `max`, `defaultValue` pour tous les champs `number`
- [ ] Supprimer le doublon `typeIrrigation` (fusionner avec `irrigationType`)
- [ ] Ajouter `maxLength` pour les `textarea`

### Étape 2: Créer `hashSidebarContent.js`
- [ ] Définir structure hiérarchisée par sections (SÉPARATION, PURIFICATION, etc.)
- [ ] Ajouter toutes les options selon documentation
- [ ] Inclure valeurs par défaut

### Étape 3: Créer `concentrateSidebarContent.js`
- [ ] Définir structure hiérarchisée (EXTRACTION, PURIFICATION, etc.)
- [ ] Ajouter toutes les options selon documentation
- [ ] Inclure valeurs par défaut

### Étape 4: Créer `edibleSidebarContent.js`
- [ ] Définir structure INGRÉDIENTS + ÉTAPES
- [ ] Système dynamique pour ajout d'ingrédients
- [ ] Actions prédéfinies pour étapes de préparation

### Étape 5: Validation
- [ ] Tester modal après drop (affichage options correctes)
- [ ] Vérifier pré-remplissage avec defaultValue
- [ ] Confirmer min/max appliqués sur inputs number
- [ ] Valider multiselect pour palissageMethodes, recolteTrichomes

---

## 📊 Statistiques

### Champs Culture à corriger
- **Total**: ~85 champs
- **Manque options**: 12 champs
- **Manque min/max**: 18 champs
- **Manque defaultValue**: 15 champs

### Pipelines à créer
- Hash: ~40 champs estimés
- Concentrés: ~35 champs estimés
- Comestibles: Structure dynamique (ingrédients + étapes)

---

*Document généré le 2026-01-06 pour Reviews-Maker*
