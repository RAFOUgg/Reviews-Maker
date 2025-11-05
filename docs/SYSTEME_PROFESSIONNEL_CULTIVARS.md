# 🌿 Système Professionnel de Gestion des Cultivars et Pipelines

## Vue d'ensemble

Implémentation d'un système avancé pour les professionnels du cannabis permettant de tracer précisément l'origine des matières et les processus de transformation pour les **Hash** et **Concentrés**.

## 🎯 Objectif

> "Un truc pro, pour des pro, on parle d'une plante avec 100 et 1 transformation possibles"

Ce système permet de :
- Gérer plusieurs cultivars avec leurs caractéristiques
- Définir des pipelines d'extraction/séparation multi-étapes
- Associer des cultivars spécifiques à chaque étape
- Spécifier les paramètres techniques (mailles, températures, durées)

---

## 📦 Composants créés

### 1. **CultivarList.jsx**
Composant pour gérer une liste de cultivars avec détails.

**Props :**
- `value` : Array des cultivars actuels
- `onChange` : Callback quand la liste change
- `matiereChoices` : Array des types de matières disponibles

**Structure d'un cultivar :**
```javascript
{
    id: 1234567890,
    name: "Purple Haze",
    farm: "La Fonce d'Alle",
    matiere: "Fleurs fraîches",
    percentage: 30  // % dans le mix
}
```

**Fonctionnalités :**
- ✅ Ajout/suppression de cultivars
- ✅ Grid layout avec cartes stylisées
- ✅ Validation de nom requis
- ✅ Pourcentages pour les mélanges

---

### 2. **PipelineWithCultivars.jsx**
Composant pour définir un pipeline d'extraction/séparation multi-étapes.

**Props :**
- `value` : Array des étapes du pipeline
- `onChange` : Callback quand le pipeline change
- `choices` : Array des méthodes disponibles
- `cultivarsList` : Array des cultivars (depuis CultivarList)

**Structure d'une étape :**
```javascript
{
    id: 1234567890,
    method: "Tamisage à l'eau glacée",
    cultivar: "Purple Haze",  // Optionnel, peut être vide pour "tous"
    microns: "73-120µ",       // Affiché seulement pour tamisages
    temperature: "-20°C",     // Optionnel
    duration: "15min",        // Optionnel
    notes: "Première passe"   // Optionnel
}
```

**Fonctionnalités :**
- ✅ Ajout/suppression d'étapes
- ✅ Réorganisation avec flèches ↑↓
- ✅ Sélection cultivar par étape (dropdown dynamique)
- ✅ Champ microns intelligent (apparaît selon la méthode)
- ✅ Paramètres optionnels complets
- ✅ Notes spécifiques par étape

**Méthodes détectant automatiquement les microns :**
- Tamisage WPFF
- Tamisage à l'eau glacée / Bubble Hash
- Tamisage à la glace carbonique / Ice Hash
- Tamisage à sec / Dry
- Tamisage à sec congelé / Ice Dry

---

## 🗂️ Structure des données mise à jour

### **Hash** (productStructures.js)

```javascript
Hash: {
    sections: [
        // ... sections info et photos ...
        {
            title: "🌱 Cultivars & Matières",
            fields: [
                { 
                    key: "cultivarsList", 
                    label: "Cultivars utilisés (détaillé)", 
                    type: "cultivar-list",
                    matiereChoices: [
                        "Fleurs fraîches", 
                        "Fleurs sèches", 
                        "Trim", 
                        "Larf", 
                        "Sugar Leaves", 
                        "Autre"
                    ]
                }
            ]
        },
        {
            title: "🧪 Pipeline de Séparation",
            fields: [
                { 
                    key: "pipelineSeparation", 
                    label: "Process de séparation", 
                    type: "pipeline-with-cultivars",
                    choices: choiceCatalog.separationTypes,
                    cultivarsSource: "cultivarsList"
                }
            ]
        }
        // ... autres sections ...
    ]
}
```

### **Concentré** (productStructures.js)

```javascript
Concentré: {
    sections: [
        // ... sections info et photos ...
        {
            title: "🌱 Cultivars & Matières",
            fields: [
                { 
                    key: "cultivarsList", 
                    label: "Cultivars utilisés (détaillé)", 
                    type: "cultivar-list",
                    matiereChoices: [
                        "Fleurs fraîches", 
                        "Fleurs sèches", 
                        "Trim", 
                        "Trichomes", 
                        "Hash", 
                        "Larf", 
                        "Autre"
                    ]
                }
            ]
        },
        {
            title: "🧪 Pipeline d'Extraction",
            fields: [
                { 
                    key: "pipelineExtraction", 
                    label: "Process d'extraction", 
                    type: "pipeline-with-cultivars",
                    choices: [
                        ...choiceCatalog.extractionSolvants, 
                        ...choiceCatalog.extractionSansSolvants
                    ],
                    cultivarsSource: "cultivarsList"
                },
                { 
                    key: "purgevide", 
                    label: "Purge à vide", 
                    type: "checkbox" 
                }
            ]
        }
        // ... autres sections ...
    ]
}
```

---

## 💡 Workflow d'utilisation

### Exemple : Review de Hash multi-cultivars

**Étape 1 : Définir les cultivars**
```
Section "🌱 Cultivars & Matières"
├─ Cultivar 1
│  ├─ Nom: Purple Haze
│  ├─ Farm: La Fonce d'Alle
│  ├─ Matière: Fleurs fraîches
│  └─ %: 40%
├─ Cultivar 2
│  ├─ Nom: Gorilla Glue
│  ├─ Farm: Swiss Alpine Gardens
│  ├─ Matière: Fleurs fraîches
│  └─ %: 30%
└─ Cultivar 3
   ├─ Nom: White Widow
   ├─ Farm: La Fonce d'Alle
   ├─ Matière: Trim
   └─ %: 30%
```

**Étape 2 : Définir le pipeline**
```
Section "🧪 Pipeline de Séparation"
├─ Étape 1
│  ├─ Méthode: Tamisage WPFF
│  ├─ Cultivar: Purple Haze
│  ├─ Maille: 160-220µ
│  ├─ Température: -20°C
│  ├─ Durée: 5min
│  └─ Notes: Premier grade
├─ Étape 2
│  ├─ Méthode: Tamisage à l'eau glacée
│  ├─ Cultivar: (Tous/Mélange)
│  ├─ Maille: 73-120µ
│  ├─ Température: 0°C
│  ├─ Durée: 15min
│  └─ Notes: Full spectrum
└─ Étape 3
   ├─ Méthode: Pressage à froid
   ├─ Cultivar: (Tous/Mélange)
   ├─ Température: 25°C
   ├─ Durée: 2min
   └─ Notes: Finition rosin
```

---

## 🎨 Interface utilisateur

### CultivarList
```
┌─────────────────────────────────────────┐
│ [+ Ajouter un cultivar]                 │
├─────────────────────────────────────────┤
│ ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│ │ Purple  │  │ Gorilla │  │ White   │ │
│ │ Haze    │  │ Glue    │  │ Widow   │ │
│ │         │  │         │  │         │ │
│ │ 🏡 Farm │  │ 🏡 Farm │  │ 🏡 Farm │ │
│ │ 🌿 Type │  │ 🌿 Type │  │ 🌿 Type │ │
│ │ 📊 40%  │  │ 📊 30%  │  │ 📊 30%  │ │
│ │ [✕]     │  │ [✕]     │  │ [✕]     │ │
│ └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────┘
```

### PipelineWithCultivars
```
┌─────────────────────────────────────────┐
│ ┌────────────────────────────────────┐ │
│ │ [↑][↓] Étape 1            [✕ Sup] │ │
│ ├────────────────────────────────────┤ │
│ │ Méthode: [Tamisage WPFF ▼]        │ │
│ │ Cultivar: [Purple Haze ▼]         │ │
│ │ Maille: [160-220µ]                │ │
│ │ Température: [-20°C]              │ │
│ │ Durée: [5min]                     │ │
│ │ Notes: [Premier grade...]         │ │
│ └────────────────────────────────────┘ │
│                                         │
│ ┌────────────────────────────────────┐ │
│ │ [↑][↓] Étape 2            [✕ Sup] │ │
│ │ ...                                │ │
│ └────────────────────────────────────┘ │
│                                         │
│ [+ Ajouter une étape au pipeline]      │
│                                         │
│ 💡 Ordre du pipeline: Les étapes sont  │
│    exécutées dans l'ordre affiché.     │
│    Utilisez les flèches ↑↓ pour        │
│    réorganiser.                        │
└─────────────────────────────────────────┘
```

---

## 🔄 Intégration avec CreateReviewPage

Le composant `CreateReviewPage.jsx` gère maintenant deux nouveaux types de champs :

```jsx
case 'cultivar-list': 
    return <CultivarList 
        value={value} 
        onChange={(v) => handleInputChange(field.key, v)} 
        matiereChoices={field.matiereChoices || []} 
    />;

case 'pipeline-with-cultivars': 
    const cultivarsListData = formData[field.cultivarsSource] || []; 
    return <PipelineWithCultivars 
        value={value} 
        onChange={(v) => handleInputChange(field.key, v)} 
        choices={field.choices || []} 
        cultivarsList={cultivarsListData} 
    />;
```

**Note importante :** Le pipeline accède dynamiquement à la liste des cultivars via `field.cultivarsSource` qui pointe vers la clé `cultivarsList` du formData.

---

## 📊 Données sauvegardées

Lorsqu'une review Hash/Concentré est créée, le formData contiendra :

```json
{
    "type": "Hash",
    "holderName": "Purple x Gorilla Full Spectrum",
    "hashmaker": "John Doe",
    "cultivarsList": [
        {
            "id": 1234567890,
            "name": "Purple Haze",
            "farm": "La Fonce d'Alle",
            "matiere": "Fleurs fraîches",
            "percentage": 40
        },
        {
            "id": 1234567891,
            "name": "Gorilla Glue",
            "farm": "Swiss Alpine Gardens",
            "matiere": "Fleurs fraîches",
            "percentage": 30
        },
        {
            "id": 1234567892,
            "name": "White Widow",
            "farm": "La Fonce d'Alle",
            "matiere": "Trim",
            "percentage": 30
        }
    ],
    "pipelineSeparation": [
        {
            "id": 1234567893,
            "method": "Tamisage WPFF",
            "cultivar": "Purple Haze",
            "microns": "160-220µ",
            "temperature": "-20°C",
            "duration": "5min",
            "notes": "Premier grade"
        },
        {
            "id": 1234567894,
            "method": "Tamisage à l'eau glacée",
            "cultivar": "",
            "microns": "73-120µ",
            "temperature": "0°C",
            "duration": "15min",
            "notes": "Full spectrum"
        }
    ],
    // ... autres champs ...
}
```

---

## ✅ Validation et contrôles

### CultivarList
- ✅ Au moins un nom requis pour ajouter
- ✅ ID unique auto-généré (timestamp)
- ✅ Pourcentages optionnels
- ✅ Suppression avec confirmation visuelle

### PipelineWithCultivars
- ✅ Méthode requise par étape
- ✅ Tous les autres champs optionnels
- ✅ Dropdown cultivar dynamique basé sur cultivarsList
- ✅ Option "Tous/Mélange" disponible
- ✅ Champ microns apparaît intelligemment
- ✅ Réorganisation impossible si 1 seule étape

---

## 🚀 Prochaines évolutions possibles

### À court terme
- [ ] Prévisualisation visuelle du pipeline (flow diagram)
- [ ] Import/Export de templates de pipeline
- [ ] Calculateur de rendements par étape

### À moyen terme
- [ ] Base de données de cultivars avec auto-complétion
- [ ] Historique des pipelines par hash maker
- [ ] Analytics : cultivars les plus utilisés, méthodes préférées

### À long terme
- [ ] API externe de tracking génétique (Leafly, Phylos)
- [ ] QR code de traçabilité complète
- [ ] Certification blockchain pour authentification

---

## 📝 Notes techniques

### Performance
- Composants optimisés avec clés uniques (timestamp IDs)
- Pas de re-render inutiles grâce à l'immutabilité des arrays
- Lazy loading possible si beaucoup de cultivars

### Accessibilité
- Labels clairs sur tous les champs
- Contrôles clavier (tab navigation)
- Boutons désactivés visuellement quand inapplicables

### Responsive
- Grid layout adaptable (cols-1 md:cols-2)
- Cards compactes sur mobile
- Boutons touch-friendly

---

## 🎓 Formation utilisateur

**Pour les Hash Makers :**
1. Commencez par définir tous vos cultivars dans la section "Cultivars & Matières"
2. Puis construisez votre pipeline étape par étape
3. Associez chaque étape au cultivar concerné (ou laissez vide pour "tous")
4. Spécifiez les mailles pour les tamisages
5. Ajoutez vos paramètres techniques (température, durée)

**Pour les Extract Artists :**
1. Listez vos matières premières (cultivars, hash, trim, etc.)
2. Définissez votre chaîne d'extraction complète
3. Précisez les solvants ou méthodes sans solvant
4. Documentez vos températures de purge
5. Notez les particularités de chaque étape

---

## 🐛 Debugging

En cas de problème :
1. Ouvrir DevTools console (F12)
2. Vérifier `formData.cultivarsList` et `formData.pipelineSeparation`
3. S'assurer que les cultivars sont bien créés avant d'utiliser le pipeline
4. Vérifier que `cultivarsSource` pointe vers la bonne clé

---

**Créé le :** $(date)  
**Version :** 1.0.0  
**Auteurs :** Équipe Reviews-Maker  
**Statut :** ✅ Implémenté et testé
