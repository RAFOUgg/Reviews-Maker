# SYSTÈME PIPELINE RÉUTILISABLE - DOCUMENTATION COMPLÈTE

## 📋 Vue d'ensemble

Le système Pipeline de Reviews-Maker est un système **universel et réutilisable** qui s'adapte automatiquement au type de produit (Fleurs, Hash, Concentrés, Comestibles) via des **configurations statiques**.

**Architecture CDC-compliant :**
- ✅ 1 composant générique (`UnifiedPipeline`)
- ✅ Configurations statiques par type (`pipelineConfigs.js`)
- ✅ Drag & drop hiérarchisé
- ✅ Timeline configurable (secondes, heures, jours, semaines, phases)
- ✅ 4 emojis max superposables par case
- ✅ Préréglages sauvegardés
- ✅ Modal contextuel par case
- ✅ Système 3D : Plan (données) + Temps (évolution)

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    UnifiedPipeline (composant)                │
│   Props: type='culture' | 'curing' | 'separation' | etc...   │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    ↓
┌──────────────────────────────────────────────────────────────┐
│              pipelineConfigs.js (données)                     │
│  - CULTURE_PIPELINE_CONFIG (85+ champs)                      │
│  - CURING_PIPELINE_CONFIG (température, humidité...)         │
│  - SEPARATION_PIPELINE_CONFIG (Hash)                          │
│  - EXTRACTION_PIPELINE_CONFIG (18 méthodes)                  │
│  - PURIFICATION_PIPELINE_CONFIG (18 méthodes)                │
│  - RECIPE_PIPELINE_CONFIG (ingredients, phases)              │
└───────────────────┬──────────────────────────────────────────┘
                    │
                    ↓
┌──────────────────────────────────────────────────────────────┐
│         PipelineDragDropView (logique UI)                     │
│  - Sidebar hiérarchisé (sections + items)                    │
│  - Timeline avec cases drag & drop                           │
│  - Modals (PresetConfigModal, PipelineDataModal)            │
│  - Gestion préréglages (localStorage)                        │
└──────────────────────────────────────────────────────────────┘
```

---

## 📁 Fichiers clés

### 1. `client/src/components/UnifiedPipeline.jsx` (164 lignes)
**Composant générique principal**

```jsx
import { getPipelineConfig } from '../config/pipelineConfigs'

const UnifiedPipeline = ({ type, data, onChange }) => {
    // Récupère config statique selon type
    const config = getPipelineConfig(type)
    
    // Gère préréglages localStorage
    const [presets, setPresets] = useState(() => {
        const saved = localStorage.getItem(`${type}PipelinePresets`)
        return saved ? JSON.parse(saved) : []
    })
    
    // Render PipelineDragDropView avec config injectée
    return (
        <PipelineDragDropView
            type={type}
            sidebarContent={config.sidebarContent}
            timelineConfig={timelineConfig}
            timelineData={timelineData}
            presets={presets}
            onSavePreset={handleSavePreset}
            {...}
        />
    )
}
```

**Utilisation :**
```jsx
// Dans CreateFlowerReview
<UnifiedPipeline 
    type="culture" 
    data={formData.culturePipeline} 
    onChange={handlePipelineChange} 
/>

// Dans CreateHashReview
<UnifiedPipeline 
    type="separation" 
    data={formData.separationPipeline} 
    onChange={handlePipelineChange} 
/>
```

---

### 2. `client/src/config/pipelineConfigs.js` (765 lignes)
**Configurations statiques centralisées**

Structure d'une configuration :
```javascript
export const CULTURE_PIPELINE_CONFIG = {
    type: 'culture',
    title: '🌱 Pipeline de Culture',
    description: 'Traçabilité complète...',
    
    // Types d'intervalles disponibles
    intervalTypes: [
        { value: 'jour', label: 'Jours', icon: '📅', maxCells: 365 },
        { value: 'semaine', label: 'Semaines', icon: '📆', maxCells: 52 },
        { value: 'phase', label: 'Phases physiologiques', icon: '🌱', maxCells: 12 }
    ],
    
    // Phases prédéfinies (si type='phase')
    phases: [
        { id: 'graine', label: '🌰 Graine (J0)', duration: 1 },
        { id: 'germination', label: '🌱 Germination', duration: 3 },
        // ... 10 autres phases
    ],
    
    // Contenus hiérarchisés (panneau latéral)
    sidebarContent: [
        {
            id: 'general',
            label: 'GÉNÉRAL',
            icon: '⚙️',
            items: [
                {
                    id: 'modeCulture',
                    label: 'Mode de culture',
                    icon: '🏕️',
                    type: 'select',
                    options: [
                        { value: 'indoor', label: 'Indoor' },
                        { value: 'outdoor', label: 'Outdoor' },
                        // ... autres options
                    ]
                },
                { id: 'dimensionsL', label: 'Longueur (cm)', icon: '📏', type: 'number', unit: 'cm' },
                // ... 85+ champs au total
            ]
        },
        // Section SUBSTRAT (15 champs)
        // Section ENVIRONNEMENT (20 champs)
        // Section LUMIÈRE (12 champs)
        // Section IRRIGATION (8 champs)
        // Section ENGRAIS (10 champs)
        // Section PALISSAGE (5 champs)
        // Section MORPHOLOGIE (8 champs)
        // Section RÉCOLTE (7 champs)
    ]
}
```

**Mapper function :**
```javascript
export const getPipelineConfig = (type) => {
    switch (type) {
        case 'culture': return CULTURE_PIPELINE_CONFIG
        case 'curing': return CURING_PIPELINE_CONFIG
        case 'separation': return SEPARATION_PIPELINE_CONFIG
        case 'extraction': return EXTRACTION_PIPELINE_CONFIG
        case 'purification': return PURIFICATION_PIPELINE_CONFIG
        case 'recipe': return RECIPE_PIPELINE_CONFIG
        default: return CULTURE_PIPELINE_CONFIG
    }
}
```

---

### 3. `client/src/components/pipeline/PipelineDragDropView.jsx` (1006 lignes)
**Logique UI complète**

Fonctionnalités :
- ✅ **Panneau latéral** : Sections expandables + items draggables
- ✅ **Timeline** : Génération automatique des cases selon `intervalType`
- ✅ **Drag & drop** : `onDragStart` → `onDrop` → ouvre modal
- ✅ **Modals** :
  - `PipelineDataModal` : Saisie valeurs case
  - `PresetConfigModal` : Créer préréglage global
  - `MassAssignModal` : Attribution en masse
- ✅ **Préréglages** : Sauvegarde localStorage par type
- ✅ **4 emojis max** : `CellEmojiOverlay` superpose visuellement
- ✅ **Tooltip** : Au survol case → infos résumées
- ✅ **Progress bar** : % cases remplies

---

## 🎯 Conformité CDC

### Trame temporelle (CDC PIPELINE_DONNEE_CULTURES.md)

✅ **Intervalles supportés :**
- Secondes (max 900s avec pagination)
- Heures (max 336h = 14 jours)
- Jours (max 365 jours)
- Dates (calcul auto début/fin)
- Semaines (nombre libre)
- Phases physiologiques (12 phases prédéfinies)

✅ **Configuration dynamique :**
```javascript
const generateCells = () => {
    const { type, start, end, duration, totalSeconds, totalHours, totalDays, totalWeeks } = timelineConfig
    
    if (type === 'seconde') return Array.from({ length: Math.min(totalSeconds, 900) }, ...)
    if (type === 'heure') return Array.from({ length: Math.min(totalHours, 336) }, ...)
    if (type === 'jour') return Array.from({ length: Math.min(totalDays, 365) }, ...)
    if (type === 'date') {
        const days = Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24)) + 1
        return Array.from({ length: Math.min(days, 365) }, ...)
    }
    if (type === 'semaine') return Array.from({ length: totalWeeks }, ...)
    if (type === 'phase') return phases.map(phase => ({ id: phase.id, label: phase.name, ... }))
}
```

### Interface CDC (REAL_VISION_CDC_DEV.md)

✅ **Presque aucune saisie textuelle** : Tout par sélections, choix, menus
✅ **Apple-like design** : Liquid Glass UI, backdrop-blur, gradients
✅ **Ergonomie** : Tooltips contextuels, aide intégrée
✅ **Unités SI** : (g, ml, cm, m², °C, ppm) précisées entre parenthèses

✅ **Concept visuel exact :**
```
┌─────────────────────────────────────────────────────────────┐
│                    PipeLine Culture                         │
├─────────────────────────────────────────────────────────────┤
│ Type d'intervalles: [Jours ▼]   Nombre: [90]   Phases: [–] │
│ ___________________________________________________________ │
│ Préréglages | ☐ Config1 ☐ Config2  [+ Nouveau]            │
│─────────────│                                               │
│   Contenus  │  J1  J2  J3  J4  J5  J6  J7  J8  J9  J10 ... │
│     📦      │ [🌱][  ][  ][🌾][  ][  ][🏕️][  ][  ][  ] ... │
│  GÉNÉRAL    │ [💧][  ][  ][  ][  ][  ][  ][  ][  ][  ] ... │
│  SUBSTRAT   │ [  ][  ][  ][  ][  ][  ][  ][  ][  ][  ] ... │
│  LUMIÈRE    │                                               │
│  etc...     │                                               │
└─────────────────────────────────────────────────────────────┘
```

✅ **4 emojis superposables :**
```javascript
// CellEmojiOverlay.jsx
return (
    <div className="absolute top-2 left-2 w-12 h-12">
        {emojis.slice(0, 4).map((item, idx) => (
            <div 
                style={{
                    top: `${idx * 4}px`,
                    left: `${idx * 4}px`,
                    zIndex: 4 - idx,
                    filter: `brightness(${1 - idx * 0.08})`,
                    transform: `scale(${1 - idx * 0.05})`
                }}
            >
                {item.emoji}
            </div>
        ))}
    </div>
)
```

---

## 🔄 Workflow utilisateur

### 1. Créer un préréglage global
1. Clic **"+ Créer un préréglage global"**
2. Modal `PresetConfigModal` s'ouvre
3. Saisir nom, description
4. Parcourir **toutes les sections** (GÉNÉRAL, SUBSTRAT, etc.)
5. Définir **valeurs par défaut** pour chaque champ souhaité
6. **Sauvegarder** → stocké dans `localStorage`

### 2. Drag & Drop contenu → case
1. **Drag** élément depuis sidebar (ex: "Mode de culture 🏕️")
2. **Drop** sur case timeline (ex: J5)
3. **Modal** s'ouvre automatiquement avec formulaire
4. Saisir valeur (ex: "Indoor")
5. **Enregistrer** → données sauvegardées dans `timelineData[timestamp]`
6. **4 emojis** s'affichent superposés sur la case

### 3. Clic case → Édition
- **Case vide** : Modal avec tous les contenus disponibles
- **Case remplie** : Modal avec valeurs assignées + possibilité d'ajouter

### 4. Attribution en masse
1. Activer **mode sélection** (checkbox icon)
2. **Cliquer** plusieurs cases → sélection multiple
3. **Choisir préréglages** à appliquer
4. Clic **"✓ Appliquer"** → préréglages copiés sur toutes cases sélectionnées

---

## 📊 Données stockées

### Structure localStorage
```javascript
// Préréglages par type
localStorage.setItem('culturePipelinePresets', JSON.stringify([
    {
        id: 'preset-1',
        name: 'Config Indoor LED',
        description: 'Setup classique 3x3x2m',
        data: {
            modeCulture: 'indoor',
            dimensionsL: 300,
            dimensionsl: 300,
            dimensionsH: 200,
            typeLampe: 'led-panneau',
            puissanceTotale: 600,
            // ... autres champs
        }
    }
]))

// Préréglages curing
localStorage.setItem('curingPipelinePresets', JSON.stringify([...]))
```

### Structure données review
```javascript
formData.culturePipeline = {
    timelineConfig: {
        type: 'jour',
        start: '',
        end: '',
        duration: 90,
        totalCells: 90
    },
    timelineData: [
        {
            timestamp: 'day-1',
            data: {
                modeCulture: 'indoor',
                dimensionsL: 300,
                techniquePropagation: 'graine',
                note: 'Début de culture'
            },
            _meta: {
                completionPercentage: 15,
                lastModified: '2025-12-18T16:30:00Z'
            }
        },
        {
            timestamp: 'day-5',
            data: {
                temperature: 24,
                humidite: 65,
                typeLampe: 'led-panneau'
            }
        }
        // ... autres timestamps
    ]
}
```

---

## 🚀 Ajouter un nouveau type de Pipeline

### Étape 1 : Créer configuration dans `pipelineConfigs.js`
```javascript
export const NEW_TYPE_PIPELINE_CONFIG = {
    type: 'newtype',
    title: '🆕 Nouveau Type',
    description: 'Description...',
    
    intervalTypes: [
        { value: 'heure', label: 'Heures', icon: '⏰', maxCells: 24 }
    ],
    
    phases: [], // Si applicable
    
    sidebarContent: [
        {
            id: 'section1',
            label: 'MA SECTION',
            icon: '📁',
            items: [
                { id: 'field1', label: 'Champ 1', icon: '📝', type: 'text' },
                { id: 'field2', label: 'Champ 2', icon: '🔢', type: 'number', unit: 'kg' }
            ]
        }
    ]
}

// Ajouter dans le mapper
export const getPipelineConfig = (type) => {
    switch (type) {
        // ... existing cases
        case 'newtype': return NEW_TYPE_PIPELINE_CONFIG
        default: return CULTURE_PIPELINE_CONFIG
    }
}
```

### Étape 2 : Utiliser dans page de création
```jsx
// Dans CreateNewProductReview.jsx
import UnifiedPipeline from '../../components/UnifiedPipeline'

<UnifiedPipeline
    type="newtype"
    data={formData.newtypePipeline || {}}
    onChange={(data) => handleChange('newtypePipeline', data)}
/>
```

**C'EST TOUT !** Le système s'adapte automatiquement.

---

## 🎨 Personnalisation UI

### Thème Liquid Glass (déjà intégré)
```jsx
// PipelineDragDropView.jsx
<div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
```

### Couleurs configurables
- Sections : `bg-gradient-to-r from-gray-50 to-gray-100`
- Cases vides : `border-2 border-dashed border-gray-300`
- Cases remplies : `bg-gradient-to-br from-purple-100 to-blue-100`
- Drag actif : `border-blue-500 bg-blue-50`

---

## ✅ Tests de conformité

### Checklist production
- [x] Drag & drop fonctionne (item → case)
- [x] Modal case vide affiche tous contenus
- [x] Modal case remplie affiche valeurs assignées
- [x] Préréglages sauvegardés (localStorage)
- [x] Chargement préréglages fonctionne
- [x] Attribution masse (multi-sélection)
- [x] 4 emojis max superposés visuellement
- [x] Timeline génère cases selon intervalType
- [x] Configuration jours/semaines/phases fonctionne
- [x] Progress bar affiche % completion
- [x] Tooltip au survol case remplie
- [x] Données sauvegardées dans formData

---

## 📈 Statistiques

**Configurations disponibles :**
- ✅ CULTURE : 85+ champs, 9 sections, 12 phases
- ✅ CURING : 6 champs température/humidité/container
- ✅ SEPARATION : 2 méthodes (Ice-water, Dry-sift), 7 mesh sizes
- ✅ EXTRACTION : 18 méthodes (BHO, EHO, Rosin, CO₂...)
- ✅ PURIFICATION : 18 méthodes (chromatography, winterization...)
- ✅ RECIPE : Ingredients + 6 phases préparation

**Code metrics :**
- UnifiedPipeline : 164 lignes
- pipelineConfigs : 765 lignes
- PipelineDragDropView : 1006 lignes
- **Total système** : ~2000 lignes

---

## 🔗 Liens documentation

- [PIPELINE_DONNEE_CULTURES.md](.docs/PIPELINE_DONNEE_CULTURES.md) : Specs CDC complètes
- [REAL_VISION_CDC_DEV.md](.docs/REAL_VISION_CDC_DEV.md) : Vision produit globale
- [UNIFIED_PIPELINE_SYSTEM.md](docs/UNIFIED_PIPELINE_SYSTEM.md) : Architecture unifiée

---

**Dernière mise à jour** : 18 décembre 2025  
**Auteur** : GitHub Copilot & RAFOUgg  
**Version** : 2.0 (Système unifié CDC-compliant)
