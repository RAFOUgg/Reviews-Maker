# ✅ CORRECTION BUG SÉLECTION + GUIDE GÉNÉRALISATION PIPELINES

## Date : 5 janvier 2026 - 15h00

## 🐛 Bug corrigé : Clic sur item sélectionne toute la section

### Problème
Quand on cliquait sur un item dans la sidebar, au lieu de sélectionner juste cet item, ça sélectionnait tous les items de la section au début du drag.

### Cause
Le code `handleSidebarItemClick` mettait l'item dans `multiSelectedItems`, puis `onDragStart` vérifiait `multiSelectedItems.length > 1` mais utilisait `.map()` qui retournait tous les items trouvés, pas seulement ceux sélectionnés.

### Solution appliquée
**Fichier** : `client/src/components/pipeline/PipelineDragDropView.jsx`

```jsx
// AVANT (BUGGÉ)
const handleSidebarItemClick = (e, item) => {
    if (e.ctrlKey || e.metaKey) {
        setMultiSelectedItems(prev => prev.includes(item.key)
            ? prev.filter(k => k !== item.key)
            : [...prev, item.key]);
    } else {
        setMultiSelectedItems([item.key]); // ❌ Sélectionne toujours l'item
    }
};

onDragStart={(e) => {
    if (multiSelectedItems.length > 1) {
        // ❌ map sur section.items au lieu de filter par multiSelectedItems
        e.dataTransfer.setData('application/multi-items', 
            JSON.stringify(multiSelectedItems.map(k => section.items.find(i => i.key === k))));
    } else {
        handleDragStart(e, item);
    }
}}

// APRÈS (CORRIGÉ)
const isSelected = multiSelectedItems.includes(item.key);

const handleSidebarItemClick = (e) => {
    if (e.type === 'mousedown') return; // Ignorer mousedown
    
    if (e.ctrlKey || e.metaKey) {
        // Multi-sélection avec Ctrl
        setMultiSelectedItems(prev => 
            prev.includes(item.key)
                ? prev.filter(k => k !== item.key)
                : [...prev, item.key]
        );
    } else if (!isSelected) {
        // Simple clic : sélection unique SI pas déjà sélectionné
        setMultiSelectedItems([item.key]);
    }
};

onDragStart={(e) => {
    // ✅ Si l'item n'est pas sélectionné OU c'est une sélection simple, drag unique
    if (!isSelected || multiSelectedItems.length === 1) {
        handleDragStart(e, item);
        setMultiSelectedItems([]); // Clear après drag
    } else {
        // ✅ Multi-items : filtrer correctement
        const selectedItems = multiSelectedItems
            .map(k => section.items.find(i => i.key === k))
            .filter(Boolean);
        e.dataTransfer.setData('application/multi-items', JSON.stringify(selectedItems));
        setDraggedContent({ type: 'multi', items: selectedItems });
    }
}}
```

### Comportement après correction
1. **Clic simple** : Sélectionne uniquement l'item cliqué
2. **Ctrl+Clic** : Ajoute/retire l'item de la sélection multiple
3. **Drag simple** : Drag uniquement l'item
4. **Drag multi-sélection** : Drag tous les items sélectionnés (visuellement highlight ring-2 ring-blue-500)
5. **Drop** : Ouvre le formulaire `PipelineDataModal` avec le(s) champ(s) approprié(s)

---

## 📋 Système de Pipeline : Fonctionnement complet

### Architecture centralisée

```
PipelineDragDropView.jsx (1818 lignes)
         ↑
         │ Utilise props configurables
         │
    ┌────┴────┬────────┬────────────┐
    │         │        │            │
Culture   Curing   Separation   Purification
Wrapper   Wrapper    Wrapper      Wrapper
(116L)    (176L)     (335L)       (216L)
```

### Fonctionnalités universelles (PipelineDragDropView)

**Toutes ces fonctionnalités sont déjà codées et fonctionnent pour TOUTES les pipelines** :

1. ✅ **Drag & Drop depuis sidebar**
   - Clic simple : drag un seul champ
   - Ctrl+Clic : multi-sélection
   - Drag multi : drag plusieurs champs en même temps

2. ✅ **Formulaire modal (PipelineDataModal)**
   - S'ouvre automatiquement au drop
   - Affiche uniquement le(s) champ(s) droppé(s)
   - Onglets : Formulaire / Préréglages
   - Sauvegarde locale des préréglages par champ

3. ✅ **Préréglages (Preconfig)**
   - Clic droit sur item → Définir valeur par défaut
   - Badge vert si pré-configuré
   - Drag pré-configuré → applique automatiquement la valeur
   - Stockage localStorage par pipeline type

4. ✅ **Groupes de préréglages**
   - Bouton "+ Groupe de préréglages"
   - Drag groupe entier → applique tous les champs
   - Badge "👥" pour identifier les groupes

5. ✅ **Multi-sélection cellules (Marquee)**
   - Drag rectangle sur grille
   - Sélection visuelle avec overlay bleu
   - Compatible avec mass-assign

6. ✅ **Mass Assignment (MultiAssignModal)**
   - Sélection → Drag champ → Modal avec tabs
   - Tab "Données" : choisir champs à appliquer
   - Tab "Groupe" : choisir groupe pré-configuré
   - Applique à toutes les cellules sélectionnées

7. ✅ **Édition cellule**
   - Clic sur cellule remplie → Modal avec tous ses champs
   - Édition / Suppression champs individuels
   - Badges visuels colorés

8. ✅ **Copy/Paste**
   - Sélection cellule → Ctrl+C
   - Sélection autre cellule → Ctrl+V
   - Copie toutes les données

9. ✅ **Undo/Redo**
   - Bouton "⎌ Undo"
   - Historique 50 actions
   - Annule tous types de modifications

10. ✅ **Save/Load Presets complets**
    - Bouton "Sauvegarder configuration"
    - SavePipelineModal
    - localStorage par pipeline type
    - Reload complet de timeline + config

11. ✅ **Context Menu**
    - Clic droit sur item sidebar
    - "Définir valeur par défaut"
    - Stockage par champ

12. ✅ **Tooltips & Badges**
    - Survol cellule → Tooltip données
    - Badges colorés par type (température, humidité, etc.)
    - Emojis visuels

13. ✅ **Barre progression**
    - Calcul automatique % complétion
    - Affichage graphique
    - Stats "X/Y cases remplies"

14. ✅ **Validation champs (FieldRenderer)**
    - Type number : input numérique
    - Type select : dropdown
    - Type multiselect : checkboxes
    - Type slider : range input
    - Type date : date picker
    - Type color : color picker
    - Validation min/max/step

---

## 🔧 Comment généraliser le système pour toutes les pipelines

### Principe : Un seul composant central, configuration par wrapper

**PipelineDragDropView est déjà générique** ! Il suffit de lui passer :
1. Le contenu sidebar (sections + items)
2. La configuration timeline (type, totalDays, phases, etc.)
3. Les handlers (onConfigChange, onDataChange)

### Étape 1 : Créer le fichier de contenu (config)

**Exemple** : `client/src/config/cultureSidebarContent.js`

```javascript
export const CULTURE_SIDEBAR_CONTENT = {
    GENERAL: {
        icon: '📋',
        label: 'Informations générales',
        color: 'blue',
        collapsed: false,
        items: [
            {
                id: 'startDate',
                label: 'Début culture',
                key: 'startDate',
                type: 'date',
                icon: '📅',
                required: true
            },
            {
                id: 'mode',
                label: 'Mode de culture',
                key: 'mode',
                type: 'select',
                icon: '🌱',
                options: ['Indoor', 'Outdoor', 'Greenhouse'],
                required: true
            },
            // ... 82 autres champs
        ]
    },
    ENVIRONNEMENT: {
        icon: '🌡️',
        label: 'Environnement & Substrat',
        items: [ /* ... */ ]
    },
    // ... 6 autres sections
};
```

**Structure d'un item** :
```javascript
{
    id: 'temperature',           // Identifiant unique
    key: 'temperature',          // Clé stockage données
    label: 'Température (°C)',   // Texte affiché
    type: 'number',              // Type de champ (voir FieldRenderer)
    icon: '🌡️',                 // Emoji visuel
    min: 0,                      // Validation (optionnel)
    max: 50,                     // Validation (optionnel)
    step: 0.1,                   // Incrément (optionnel)
    unit: '°C',                  // Unité affichée (optionnel)
    required: false,             // Champ obligatoire (optionnel)
    dependsOn: 'mode',           // Dépendance conditionnelle (optionnel)
    showIf: 'Indoor'             // Condition d'affichage (optionnel)
}
```

**Types de champs supportés** (FieldRenderer) :
- `text` : Input texte
- `number` : Input numérique (avec min/max/step)
- `date` : Date picker
- `select` : Dropdown (options required)
- `multiselect` : Checkboxes multiples
- `slider` : Range slider (avec min/max/step)
- `stepper` : Boutons +/- (avec min/max/step)
- `color` : Color picker
- `textarea` : Textarea multilignes
- `toggle` : Switch on/off

### Étape 2 : Créer le wrapper

**Exemple** : `client/src/components/pipeline/CulturePipelineDragDrop.jsx`

```jsx
import { useState, useMemo } from 'react'
import PipelineDragDropView from './PipelineDragDropView'
import { CULTURE_SIDEBAR_CONTENT } from '../../config/cultureSidebarContent'
import { CULTURE_PHASES } from '../../config/pipelinePhases'

const CulturePipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange,
    initialData = {}
}) => {
    // Convertir CULTURE_SIDEBAR_CONTENT (objet) → format array
    const sidebarArray = useMemo(() => {
        return Object.entries(CULTURE_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            color: section.color || 'blue',
            collapsed: section.collapsed !== undefined ? section.collapsed : false,
            items: section.items || []
        }))
    }, [])

    // Ajouter phases si type === 'phase'
    const configWithPhases = useMemo(() => {
        if (timelineConfig.type === 'phase') {
            return {
                ...timelineConfig,
                phases: CULTURE_PHASES
            }
        }
        return timelineConfig
    }, [timelineConfig])

    return (
        <div className="space-y-4">
            {/* Features supplémentaires (graphiques, export CSV, etc.) */}
            
            {/* Pipeline principal */}
            <PipelineDragDropView
                type="culture"                    // Type pour localStorage
                sidebarContent={sidebarArray}     // Contenu sidebar
                timelineConfig={configWithPhases} // Config timeline
                timelineData={timelineData}       // Données
                onConfigChange={onConfigChange}   // Handler config
                onDataChange={onDataChange}       // Handler données
            />
        </div>
    )
}

export default CulturePipelineDragDrop
```

### Étape 3 : Intégrer dans la section du formulaire

**Exemple** : `client/src/pages/CreateFlowerReview/sections/CulturePipelineSection.jsx`

```jsx
import CulturePipelineDragDrop from '../../../components/pipeline/CulturePipelineDragDrop'

const CulturePipelineSection = ({ data = {}, onChange }) => {
    // Adapter handlers pour PipelineDragDropView
    const handleConfigChange = (key, value) => {
        const updatedConfig = { ...(data.cultureTimelineConfig || {}), [key]: value };
        onChange({ ...data, cultureTimelineConfig: updatedConfig });
    };

    const handleDataChange = (timestamp, field, value) => {
        const currentData = data.cultureTimelineData || [];
        const existingIndex = currentData.findIndex(cell => cell.timestamp === timestamp);

        let updatedData;
        if (existingIndex >= 0) {
            updatedData = [...currentData];
            if (value === null || value === undefined) {
                const { [field]: removed, ...rest } = updatedData[existingIndex];
                updatedData[existingIndex] = rest;
            } else {
                updatedData[existingIndex] = { ...updatedData[existingIndex], [field]: value };
            }
        } else {
            updatedData = [...currentData, { timestamp, [field]: value }];
        }

        onChange({ ...data, cultureTimelineData: updatedData });
    };

    return (
        <CulturePipelineDragDrop
            timelineConfig={data.cultureTimelineConfig || { type: 'jour', totalDays: 90 }}
            timelineData={data.cultureTimelineData || []}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
        />
    );
};
```

---

## 🎯 Application à TOUTES les pipelines

### Culture (FAIT ✅)
- **Content** : `cultureSidebarContent.js` (1252L, 84+ champs)
- **Phases** : `pipelinePhases.js` (12 phases)
- **Wrapper** : `CulturePipelineDragDrop.jsx` (116L)
- **Features** : Graphiques évolution, Export CSV

### Curing (FAIT ✅)
- **Content** : `curingSidebarContent.js`
- **Wrapper** : `CuringPipelineDragDrop.jsx` (176L)
- **Features** : Evolution tracking, GIF export

### Separation (FAIT ✅)
- **Content** : `separationSidebarContent.js`
- **Wrapper** : `SeparationPipelineDragDrop.jsx` (335L)
- **Features** : PassModal (multi-passes), Graphiques rendement

### Purification (FAIT ✅)
- **Content** : `purificationSidebarContent.js`
- **Wrapper** : `PurificationPipelineDragDrop.jsx` (216L)
- **Features** : Multi-steps, Graphiques pureté, Export CSV

### Extraction (À CRÉER)
**Pour ajouter cette pipeline** :

1. Créer `client/src/config/extractionSidebarContent.js` :
```javascript
export const EXTRACTION_SIDEBAR_CONTENT = {
    METHODE: {
        icon: '⚗️',
        label: 'Méthode d\'extraction',
        items: [
            {
                id: 'method',
                key: 'method',
                label: 'Méthode',
                type: 'select',
                icon: '🧪',
                options: ['BHO', 'PHO', 'Rosin', 'CO2', 'Ethanol']
            },
            // ... autres champs
        ]
    },
    // ... autres sections
}
```

2. Créer `client/src/components/pipeline/ExtractionPipelineDragDrop.jsx` :
```jsx
import { useMemo } from 'react'
import PipelineDragDropView from './PipelineDragDropView'
import { EXTRACTION_SIDEBAR_CONTENT } from '../../config/extractionSidebarContent'

const ExtractionPipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange
}) => {
    const sidebarArray = useMemo(() => {
        return Object.entries(EXTRACTION_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            items: section.items || []
        }))
    }, [])

    return (
        <PipelineDragDropView
            type="extraction"
            sidebarContent={sidebarArray}
            timelineConfig={timelineConfig}
            timelineData={timelineData}
            onConfigChange={onConfigChange}
            onDataChange={onDataChange}
        />
    )
}

export default ExtractionPipelineDragDrop
```

3. Utiliser dans `CreateConcentrateReview` :
```jsx
import ExtractionPipelineDragDrop from '../../components/pipeline/ExtractionPipelineDragDrop'

// Dans la section
<ExtractionPipelineDragDrop
    timelineConfig={data.extractionTimelineConfig || { type: 'heure', totalHours: 12 }}
    timelineData={data.extractionTimelineData || []}
    onConfigChange={handleConfigChange}
    onDataChange={handleDataChange}
/>
```

**C'EST TOUT !** Toutes les fonctionnalités (drag&drop, formulaire, préréglages, multi-sélection, etc.) fonctionnent automatiquement.

---

## 📊 Résumé : Ce qui change vs ce qui est universel

### ✅ Universel (PipelineDragDropView - 1818L)
- Drag & drop
- Formulaire modal
- Préréglages individuels
- Groupes de préréglages
- Multi-sélection cellules
- Mass assignment
- Copy/Paste
- Undo/Redo
- Tooltips & Badges
- Context menu
- Barre progression
- Validation champs (FieldRenderer)

### 🎨 Spécifique par pipeline (Wrapper + Config)
- **Contenu sidebar** (sections + items) → fichier config
- **Phases prédéfinies** (optionnel) → fichier phases
- **Features additionnelles** (graphiques, exports) → wrapper
- **Type d'intervalles par défaut** → config initiale

### Exemple complet : Créer "Pipeline Recette" (Edibles)

**1. Content (`recetteSidebarContent.js`)** :
```javascript
export const RECETTE_SIDEBAR_CONTENT = {
    INGREDIENTS: {
        icon: '🥘',
        label: 'Ingrédients',
        items: [
            { id: 'ingredient1', key: 'ingredient1', label: 'Ingrédient 1', type: 'text', icon: '🌿' },
            { id: 'quantity1', key: 'quantity1', label: 'Quantité', type: 'number', icon: '⚖️', unit: 'g' }
        ]
    },
    PREPARATION: {
        icon: '👨‍🍳',
        label: 'Préparation',
        items: [
            { id: 'temperature', key: 'temperature', label: 'Température four', type: 'number', icon: '🌡️', unit: '°C' },
            { id: 'duree', key: 'duree', label: 'Durée cuisson', type: 'number', icon: '⏱️', unit: 'min' }
        ]
    }
}
```

**2. Wrapper (`RecettePipelineDragDrop.jsx`)** : 50 lignes

**3. Section** : 60 lignes avec adapters

**RÉSULTAT** : Pipeline complète avec toutes les 14 fonctionnalités en ~110 lignes de code !

---

## 🎉 Conclusion

**Le système est maintenant :**
1. ✅ **Corrigé** : Clic sur item ne sélectionne plus toute la section
2. ✅ **Complet** : Toutes les fonctionnalités codées et fonctionnelles
3. ✅ **Générique** : S'applique à n'importe quelle pipeline
4. ✅ **Modulaire** : Ajout nouvelle pipeline = 1 fichier config + 1 wrapper
5. ✅ **Maintenable** : Logique centralisée dans PipelineDragDropView

**Pour ajouter une nouvelle pipeline :**
1. Créer fichier config (structure données)
2. Créer wrapper (50-200 lignes)
3. Utiliser dans section (60 lignes adapters)

**Toutes les fonctionnalités avancées sont automatiques !**

---

*Dernière mise à jour : 5 janvier 2026 - 15h00*
