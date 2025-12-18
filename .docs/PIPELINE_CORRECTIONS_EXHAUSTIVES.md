# Corrections exhaustives Pipeline Culture - 18 Décembre 2025

## 🔴 PROBLÈMES CRITIQUES IDENTIFIÉS

### 1. SUBSTRAT - Composition personnalisée
**❌ Actuel** : Champ texte libre `substrateComposition`
**✅ CDC exige** : Système multi-ingrédients avec pourcentages

**Solution** : Créer un système de composition dynamique avec :
- Liste d'ingrédients élémentaires (48 matériaux selon CDC)
- Chaque ingrédient : nom + % + marque optionnelle
- Total doit = 100%

### 2. MARQUES - Architecture incorrecte
**❌ Actuel** : 
- `substrateBrand` (section SUBSTRAT)
- `fertilizerBrand` (section ENGRAIS)
- Pas de marque pour lumière, ventilation, etc.

**✅ CDC exige** : Marque assignable à chaque produit
- Substrat : marque par ingrédient
- Engrais : marque + gamme
- Lumière : marque fabricant lampe
- Ventilation : marque équipements
- Irrigation : marque système

### 3. VENTILATION - Sélection simple au lieu de multiple
**❌ Actuel** : `ventilationType` = select simple
**✅ CDC exige** : Sélection multiple (un producteur peut avoir Extracteur + Intracteur + Ventilateur + Filtre charbon)

### 4. PALISSAGE - Sélection simple au lieu de multiple
**❌ Actuel** : `trainingMethod` = select simple
**✅ CDC exige** : "liste exhaustive de sélection **multiple**"
(Un producteur peut faire LST + SCROG + Lollipopping simultanément)

### 5. LUMIÈRE - Marque manquante
**❌ Actuel** : Pas de champ marque lampe
**✅ CDC exige** : Marque fabricant (Mars Hydro, Spider Farmer, Lumatek, etc.)

### 6. FONCTIONNALITÉS UI MANQUANTES

#### A. Ctrl+clic sur contenus
**Manquant** : Sélection multiple de données avant drag & drop
**Requis** : Pouvoir sélectionner 5-10 données d'un coup puis les glisser ensemble

#### B. Clic droit sur contenu
**Manquant** : Menu contextuel avec :
1. **"Assigner à la trame (cases X à X)"** 
   - Modal pour choisir plage de cases (ex: J7 à J45)
   - Applique la donnée à toutes ces cases
2. **"Définir une/des valeurs"**
   - Modal pour saisir valeur(s)
   - Enregistrer comme préréglage pour cette donnée seule

### 7. RELATIONS CONDITIONNELLES MANQUANTES

#### A. Type d'espace → Dimensions
**❌ Actuel** : Tous les champs affichés en même temps
**✅ CDC exige** : 
- Si "Plein champ extérieur" → Montrer seulement Surface (m²)
- Si "Armoire/Tente" → Montrer L×l×H ou Surface + Volume
- Si "Balcon/terrasse" → Surface suffit

#### B. Mode distance lumière
**❌ Actuel** : Champ `lightDistanceMode` mais pas de logique
**✅ CDC exige** :
- Si "Fixe" → une seule valeur globale
- Si "Variable" → valeur modifiable dans chaque case timeline

---

## ✅ CORRECTIONS À IMPLÉMENTER

### PHASE 1 : Refonte système SUBSTRAT

```javascript
// Remplacer substrateComposition par système multi-ingrédients
{
    name: 'substrateComposition',
    label: 'Composition substrat',
    section: 'SUBSTRAT',
    type: 'composition', // NOUVEAU TYPE
    ingredients: [
        // Matériaux minéraux/inertes
        'Laine de roche',
        'Coco (fibres, chips, peat)',
        'Billes d\'argile expansée',
        'Perlite',
        'Vermiculite',
        'Sable (siliceux)',
        'Pouzzolane',
        'Pumice / pierre ponce',
        'Gravillon / graviers',
        'Brique concassée',
        
        // Matériaux terreux et organiques
        'Terre végétale',
        'Terreau horticole générique',
        'Terreau spécial cannabis',
        'Tourbe blonde',
        'Tourbe brune',
        'Compost végétal',
        'Compost animal',
        'Lombricompost / vermicompost',
        'Humus de forêt',
        
        // Amendements organiques solides
        'Guano de chauve-souris',
        'Guano d\'oiseau marin',
        'Farine de sang',
        'Farine d\'os',
        'Farine de poisson',
        'Farine de plumes',
        'Fumier composté (bovin)',
        'Fumier composté (cheval)',
        'Fumier composté (volaille)',
        'Fumier composté (ovin/caprin)',
        'Vinasse de betterave sèche',
        'Tourteaux (ricin, neem, etc.)',
        'Mélasse solide / sucre brut',
        
        // Amendements minéraux et rocheux
        'Dolomie',
        'Chaux agricole',
        'Gypse',
        'Poudre de basalte',
        'Poudre de lave',
        'Poudre de roche (rock dust)',
        'Zeolite',
        'Argile (bentonite, kaolinite)',
        'Sels minéraux encapsulés',
        
        // Autres
        'Biochar / charbon végétal',
        'Fibre de bois',
        'Écorce compostée',
        'Coques de riz',
        'Coques de coco (brutes)'
    ],
    defaultValue: []
    // Format stocké : 
    // [
    //   { ingredient: 'Coco (fibres, chips, peat)', percent: 60, brand: 'Canna' },
    //   { ingredient: 'Perlite', percent: 30, brand: '' },
    //   { ingredient: 'Lombricompost', percent: 10, brand: 'Autre' }
    // ]
}
```

### PHASE 2 : Ajout champs marque manquants

```javascript
// Après lightKelvin, ajouter :
{
    name: 'lightBrand',
    label: 'Marque lampe',
    section: 'LUMIÈRE',
    type: 'text',
    placeholder: 'Mars Hydro, Spider Farmer, Lumatek...',
    defaultValue: ''
},

// Après ventilationMode, ajouter :
{
    name: 'ventilationBrand',
    label: 'Marque(s) équipement',
    section: 'CLIMAT',
    type: 'text',
    placeholder: 'Prima Klima, Can-Fan, Honeywell...',
    defaultValue: ''
},

// Après irrigationType, ajouter :
{
    name: 'irrigationBrand',
    label: 'Marque système',
    section: 'IRRIGATION',
    type: 'text',
    placeholder: 'Gardena, Blumat, AutoPot...',
    defaultValue: ''
}
```

### PHASE 3 : Convertir sélections simples en multiples

**⚠️ ATTENTION** : PipelineTimeline ne supporte que 4 types (select, number, text, date)
**Solution** : Utiliser type 'multiselect' et gérer le rendu spécial

```javascript
// VENTILATION - Remplacer :
{
    name: 'ventilationType',
    label: 'Type de ventilation',
    section: 'CLIMAT',
    type: 'multiselect', // MODIFIÉ
    options: [
        'Extracteur d\'air',
        'Intracteur d\'air',
        'Ventilateur oscillant',
        'Ventilation au plafond',
        'Ventilation par gaines (HVACD)',
        'Déshumidificateur',
        'Humidificateur',
        'Filtre à charbon'
    ],
    defaultValue: []
},

// PALISSAGE - Remplacer :
{
    name: 'trainingMethod',
    label: 'Méthodologies LST/HST',
    section: 'PALISSAGE',
    type: 'multiselect', // MODIFIÉ
    options: [
        'Pas de palissage',
        'LST (Low Stress Training)',
        'HST (High Stress Training)',
        'Topping (étêtage)',
        'Fimming',
        'Main-Lining / Manifolding',
        'SCROG (Screen of Green)',
        'SOG (Sea of Green)',
        'Lollipopping',
        'Super-cropping',
        'Defoliation ciblée',
        'Super-cropping + support tuteur / filet',
        'Splitting / fente de tige',
        'Tuteurs individuels',
        'Filets multi-niveaux',
        'Palissage horizontal',
        'Palissage vertical',
        'Ligaturage / tie-down simple',
        'Ligaturage en étoile',
        'Taille apicale répétée',
        'Taille latérale',
        'Taille de racines',
        'Autre'
    ],
    defaultValue: []
}
```

### PHASE 4 : Fonctionnalités UI manquantes (PipelineTimeline.jsx)

#### A. Menu contextuel clic droit sur contenu

```javascript
// Dans PipelineTimeline.jsx, ajouter fonction :
const handleContentContextMenu = (content, e) => {
    e.preventDefault()
    setContextMenuContent(content)
    setContextMenuPosition({ x: e.clientX, y: e.clientY })
    setShowContextMenu(true)
}

// Menu contextuel avec 2 options :
// 1. "Assigner à la trame (plage de cases)"
// 2. "Définir valeur(s) et enregistrer préréglage"
```

#### B. Sélection multiple contenus (Ctrl+clic)

```javascript
// Déjà implémenté dans handleContentClick
// ✅ Vérifier que ça fonctionne correctement
```

### PHASE 5 : Relations conditionnelles

```javascript
// Ajouter propriété "conditional" aux champs
{
    name: 'spaceArea',
    label: 'Surface au sol',
    section: 'GÉNÉRAL',
    type: 'number',
    unit: 'm²',
    conditional: {
        showIf: {
            field: 'spaceType',
            values: ['Plein champ extérieur', 'Balcon / terrasse', 'Serre verre', 'Serre polycarbonate']
        }
    },
    defaultValue: ''
},

{
    name: 'spaceLength',
    label: 'Longueur',
    section: 'GÉNÉRAL',
    type: 'number',
    unit: 'cm',
    conditional: {
        hideIf: {
            field: 'spaceType',
            values: ['Plein champ extérieur', 'Balcon / terrasse']
        }
    },
    defaultValue: ''
}
```

---

## 📋 ORDRE DE PRIORITÉ

1. **URGENT** : Substrat composition multi-ingrédients
2. **URGENT** : Ventilation + Palissage → multiselect
3. **IMPORTANT** : Marques pour lumière, irrigation, ventilation
4. **IMPORTANT** : Clic droit menu contextuel
5. **MOYEN** : Relations conditionnelles

---

## 🔧 MODIFICATIONS PipelineTimeline.jsx REQUISES

### 1. Support type 'multiselect'

```javascript
// Dans ContentValueModal, ajouter :
{content.type === 'multiselect' ? (
    <div className="space-y-2">
        {content.options?.map(opt => (
            <label key={opt} className="flex items-center gap-2">
                <input
                    type="checkbox"
                    checked={(value || []).includes(opt)}
                    onChange={(e) => {
                        const newValue = e.target.checked
                            ? [...(value || []), opt]
                            : (value || []).filter(v => v !== opt)
                        setValue(newValue)
                    }}
                />
                <span>{opt}</span>
            </label>
        ))}
    </div>
) : /* ... autres types ... */}
```

### 2. Support type 'composition'

```javascript
// Créer nouveau modal CompositionBuilder
function CompositionBuilderModal({ content, onSave, onClose }) {
    const [ingredients, setIngredients] = useState([])
    
    const addIngredient = () => {
        setIngredients([...ingredients, { ingredient: '', percent: 0, brand: '' }])
    }
    
    const totalPercent = ingredients.reduce((sum, ing) => sum + parseFloat(ing.percent || 0), 0)
    const isValid = totalPercent === 100
    
    // UI pour ajouter/supprimer ingrédients avec validation 100%
}
```

### 3. Menu contextuel clic droit

```javascript
// Ajouter état et composant ContextMenu
function ContextMenu({ content, position, onClose, onAssignToRange, onDefinePreset }) {
    return (
        <div 
            className="fixed bg-white dark:bg-gray-800 shadow-lg rounded-lg border"
            style={{ top: position.y, left: position.x }}
        >
            <button onClick={() => onAssignToRange(content)}>
                📍 Assigner à la trame (cases X à X)
            </button>
            <button onClick={() => onDefinePreset(content)}>
                💾 Définir valeur(s) + enregistrer préréglage
            </button>
        </div>
    )
}
```

---

## ✅ CHECKLIST VALIDATION

- [ ] Substrat : Composition multi-ingrédients fonctionnelle
- [ ] Ventilation : Sélection multiple opérationnelle
- [ ] Palissage : Sélection multiple opérationnelle
- [ ] Marques : Ajoutées pour lumière, irrigation, ventilation
- [ ] Clic droit : Menu contextuel avec 2 options
- [ ] Ctrl+clic : Sélection multiple contenus
- [ ] Relations conditionnelles : Champs masqués selon contexte
- [ ] Validation CDC : 100% conforme PIPELINE_DONNEE_CULTURES.md
