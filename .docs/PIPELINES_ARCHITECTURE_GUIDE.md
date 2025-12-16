# 📐 Architecture Pipelines - Guide Complet

**Date:** 16 décembre 2025  
**Version:** 2.0 - Refonte CDC  
**Statut:** Documentation architecture

---

## 📚 Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture des composants](#architecture-des-composants)
3. [Flux de données](#flux-de-données)
4. [Utilisation PipelineCore](#utilisation-pipelinecore)
5. [Exemples d'implémentation](#exemples-dimplémentation)
6. [Field Schema - Définition](#field-schema-définition)
7. [Migration depuis ancien système](#migration-ancien-système)
8. [Tests & Validation](#tests--validation)

---

## 🎯 Vue d'ensemble

### Concept central CDC

> **"Chaque infos est définissable, et modifiable à un moment de la PipeLine"**

Le nouveau système de pipelines permet:
- ✅ Timeline visuelle style GitHub commits
- ✅ Chaque case peut contenir TOUTES les données pertinentes
- ✅ Notes qualitatives (visuel/odeurs/goûts) peuvent **évoluer dans le temps**
- ✅ Architecture unifiée pour tous les types de produits
- ✅ Export GIF avec évolution graphique des données

### Types de pipelines

```
┌─────────────────────────────────────────────────────────┐
│                   PIPELINES SYSTÈME                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  🌿 FLEURS          🪨 HASH           💎 CONCENTRÉS      │
│  ├─ Culture         ├─ Séparation    ├─ Extraction      │
│  └─ Curing          ├─ Purification  ├─ Purification    │
│                     └─ Curing         └─ Curing          │
│                                                          │
│  🍪 COMESTIBLES                                          │
│  └─ Recette (structure différente)                      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture des composants

### Structure hiérarchique

```
┌───────────────────────────────────────────────────────────┐
│                      PipelineCore                         │
│  ┌─────────────────────────────────────────────────────┐ │
│  │  Timeline GitHub-style universelle                  │ │
│  │  - Grille adaptative                                │ │
│  │  - Gestion interactions                             │ │
│  │  - Calcul intensité                                 │ │
│  │  - Tooltips                                         │ │
│  └─────────────────────────────────────────────────────┘ │
│               ↓ Délègue contenu via props ↓              │
│  ┌─────────────────────────────────────────────────────┐ │
│  │           PipelineCellEditor (Modal)                │ │
│  │  - Rendu dynamique selon fieldSchema                │ │
│  │  - Validation                                       │ │
│  │  - Sauvegarde                                       │ │
│  └─────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────┘
          ↑ Utilisé par pipelines spécifiques ↑

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│ CulturePipeline │  │SeparationPipeline│ │ExtractionPipeline│
│   (Fleurs)      │  │     (Hash)       │  │  (Concentrés)   │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Fichiers créés

```
client/src/
├── types/
│   └── pipelineTypes.js           # ✅ Interfaces TypeScript
│
├── components/
│   └── pipeline/
│       ├── PipelineCore.jsx       # ✅ Timeline universelle
│       ├── PipelineCellEditor.jsx # ⏳ Modal édition
│       │
│       ├── flower/
│       │   ├── CulturePipeline.jsx      # ⏳ À créer
│       │   └── CuringPipeline.jsx       # ⏳
│       │
│       ├── hash/
│       │   ├── SeparationPipeline.jsx   # ⏳
│       │   ├── PurificationPipeline.jsx # ⏳
│       │   └── CuringPipeline.jsx       # ⏳
│       │
│       ├── concentrate/
│       │   ├── ExtractionPipeline.jsx   # ⏳
│       │   ├── PurificationPipeline.jsx # ⏳
│       │   └── CuringPipeline.jsx       # ⏳
│       │
│       └── edible/
│           └── RecipePipeline.jsx       # ⏳
│
└── data/
    └── pipelineSchemas/
        ├── cultureSchema.js       # ⏳ Définitions champs Culture
        ├── curingSchema.js        # ⏳
        ├── separationSchema.js    # ⏳
        ├── extractionSchema.js    # ⏳
        ├── purificationSchema.js  # ⏳
        └── recipeSchema.js        # ⏳
```

---

## 🔄 Flux de données

### 1. Initialisation Pipeline

```javascript
// Dans CreateFlowerReview.jsx
import CulturePipeline from '../components/pipeline/flower/CulturePipeline';

const [cultureData, setCultureData] = useState({
  config: {
    intervalType: 'phases', // phases prédéfinies
    duration: 12,
    customPhases: CULTURE_PHASES // 12 phases CDC
  },
  cells: {} // { [index]: PipelineCell }
});

// Rendu
<CulturePipeline
  value={cultureData}
  onChange={setCultureData}
/>
```

### 2. Édition cellule

```
User clique case → PipelineCore.handleCellClick()
                 ↓
           setEditingCell({ index, data })
                 ↓
           <PipelineCellEditor />
                 ↓
         User édite champs
                 ↓
           Validation
                 ↓
      onCellUpdate(index, updatedData)
                 ↓
    setState({ ...cells, [index]: updatedData })
```

### 3. Sauvegarde Review

```javascript
// Données complètes pipeline
const pipelineData = {
  config: { intervalType, duration, startDate, endDate },
  cells: {
    0: { environment: { temperature: 22, humidity: 65 }, notes: "..." },
    1: { environment: { temperature: 23 }, irrigation: {...} },
    // ...
  }
};

// Sauvegarde dans Review
const review = {
  // ... autres champs
  pipelineGlobal: JSON.stringify(pipelineData), // Culture
  pipelineCuring: JSON.stringify(curingData)
};

// POST /api/reviews/flower
```

---

## 🎨 Utilisation PipelineCore

### Props

```typescript
interface PipelineCoreProps {
  // Identification
  type: 'culture' | 'curing' | 'separation' | 'extraction' | 'purification';
  productType: 'flower' | 'hash' | 'concentrate' | 'edible';
  
  // Configuration timeline
  config: {
    intervalType: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'phases';
    startDate?: string; // ISO (pour days/weeks)
    endDate?: string;
    duration?: number; // Nombre unités
    customPhases?: Phase[]; // Si intervalType = phases
  };
  
  // Données
  cells: { [index: number]: PipelineCell };
  onCellUpdate: (index: number, data: PipelineCell) => void;
  
  // Customisation
  fieldSchema: FieldSchema; // Définition champs éditables
  renderCell?: (index, cellData, intensity) => ReactNode; // Rendu custom
  showEvolutionTracking?: boolean; // Graphiques évolution
  title?: string;
  description?: string;
}
```

### Exemple minimal

```jsx
import PipelineCore from './PipelineCore';
import { curingSchema } from '../../data/pipelineSchemas/curingSchema';

function SimpleCuring({ value, onChange }) {
  const handleCellUpdate = (index, data) => {
    onChange({
      ...value,
      cells: {
        ...value.cells,
        [index]: data
      }
    });
  };

  return (
    <PipelineCore
      type="curing"
      productType="flower"
      config={value.config}
      cells={value.cells}
      onCellUpdate={handleCellUpdate}
      fieldSchema={curingSchema}
      title="Pipeline Curing"
      description="Suivi température, humidité et évolution qualitative"
      showEvolutionTracking={true}
    />
  );
}
```

---

## 💻 Exemples d'implémentation

### Exemple 1: Pipeline Culture Fleurs (12 phases)

```jsx
// components/pipeline/flower/CulturePipeline.jsx
import React from 'react';
import PipelineCore from '../PipelineCore';
import { cultureSchema } from '../../../data/pipelineSchemas/cultureSchema';

// 12 phases prédéfinies CDC
const CULTURE_PHASES = [
  { id: 'seed', name: 'Graine', icon: '🌰', duration: 1, color: '#8B4513', order: 0 },
  { id: 'germination', name: 'Germination', icon: '🌱', duration: 3, color: '#228B22', order: 1 },
  { id: 'seedling', name: 'Plantule', icon: '🌿', duration: 7, color: '#32CD32', order: 2 },
  { id: 'early-veg', name: 'Début Croissance', icon: '🌳', duration: 14, color: '#00A86B', order: 3 },
  { id: 'mid-veg', name: 'Milieu Croissance', icon: '🌲', duration: 14, color: '#008B45', order: 4 },
  { id: 'late-veg', name: 'Fin Croissance', icon: '🎋', duration: 7, color: '#20B2AA', order: 5 },
  { id: 'stretch', name: 'Stretch', icon: '⬆️', duration: 14, color: '#00CED1', order: 6 },
  { id: 'early-flower', name: 'Début Floraison', icon: '🌸', duration: 14, color: '#FF69B4', order: 7 },
  { id: 'mid-flower', name: 'Milieu Floraison', icon: '🌺', duration: 21, color: '#FF1493', order: 8 },
  { id: 'late-flower', name: 'Fin Floraison', icon: '🌻', duration: 14, color: '#FFA500', order: 9 },
  { id: 'drying', name: 'Séchage', icon: '💨', duration: 14, color: '#FBBF24', order: 10 },
  { id: 'curing', name: 'Curing', icon: '📦', duration: 30, color: '#EAB308', order: 11 }
];

export default function CulturePipeline({ value, onChange }) {
  const handleCellUpdate = (index, data) => {
    onChange({
      ...value,
      cells: {
        ...value.cells,
        [index]: data
      }
    });
  };

  return (
    <PipelineCore
      type="culture"
      productType="flower"
      config={{
        intervalType: 'phases',
        duration: 12,
        customPhases: CULTURE_PHASES
      }}
      cells={value.cells || {}}
      onCellUpdate={handleCellUpdate}
      fieldSchema={cultureSchema}
      title="🌿 Pipeline Culture"
      description="12 phases de la graine au curing - Tracez chaque étape"
      showEvolutionTracking={false}
    />
  );
}
```

### Exemple 2: Pipeline Curing (Évolution notes)

```jsx
// components/pipeline/flower/CuringPipeline.jsx
import React, { useState } from 'react';
import PipelineCore from '../PipelineCore';
import { curingSchema } from '../../../data/pipelineSchemas/curingSchema';

export default function CuringPipeline({ value, onChange }) {
  const [config, setConfig] = useState(value.config || {
    intervalType: 'days',
    startDate: new Date().toISOString().split('T')[0],
    duration: 30
  });

  const handleCellUpdate = (index, data) => {
    onChange({
      ...value,
      config,
      cells: {
        ...value.cells,
        [index]: data
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Configuration intervalle */}
      <div className="flex gap-4">
        <select
          value={config.intervalType}
          onChange={(e) => setConfig({ ...config, intervalType: e.target.value })}
          className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg"
        >
          <option value="days">Jours</option>
          <option value="weeks">Semaines</option>
          <option value="months">Mois</option>
        </select>

        {config.intervalType === 'days' && (
          <>
            <input
              type="date"
              value={config.startDate}
              onChange={(e) => setConfig({ ...config, startDate: e.target.value })}
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg"
            />
            <input
              type="date"
              value={config.endDate || ''}
              onChange={(e) => setConfig({ ...config, endDate: e.target.value })}
              placeholder="Date fin (optionnel)"
              className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg"
            />
          </>
        )}

        {config.intervalType !== 'days' && (
          <input
            type="number"
            value={config.duration}
            onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
            min={1}
            className="px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg w-24"
          />
        )}
      </div>

      {/* Timeline */}
      <PipelineCore
        type="curing"
        productType="flower"
        config={config}
        cells={value.cells || {}}
        onCellUpdate={handleCellUpdate}
        fieldSchema={curingSchema}
        title="🔥 Pipeline Curing & Maturation"
        description="Suivez l'évolution de vos notes dans le temps"
        showEvolutionTracking={true}
      />
    </div>
  );
}
```

### Exemple 3: Pipeline Extraction Concentrés

```jsx
// components/pipeline/concentrate/ExtractionPipeline.jsx
import React from 'react';
import PipelineCore from '../PipelineCore';
import { extractionSchema } from '../../../data/pipelineSchemas/extractionSchema';

const EXTRACTION_METHODS = [
  'Extraction éthanol (EHO)',
  'Extraction butane (BHO)',
  'Extraction propane (PHO)',
  'Extraction CO₂ supercritique',
  'Pressage à chaud (Rosin)',
  'Pressage à froid',
  'Extraction ultrasons (UAE)',
  'Autre'
];

export default function ExtractionPipeline({ value, onChange }) {
  const [selectedMethod, setSelectedMethod] = useState('');

  const handleCellUpdate = (index, data) => {
    onChange({
      ...value,
      cells: {
        ...value.cells,
        [index]: data
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Sélection méthode */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Méthode d'extraction
        </label>
        <select
          value={selectedMethod}
          onChange={(e) => setSelectedMethod(e.target.value)}
          className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg"
        >
          <option value="">Sélectionner...</option>
          {EXTRACTION_METHODS.map(method => (
            <option key={method} value={method}>{method}</option>
          ))}
        </select>
      </div>

      {selectedMethod && (
        <PipelineCore
          type="extraction"
          productType="concentrate"
          config={{
            intervalType: 'minutes',
            duration: 120 // 2h par défaut
          }}
          cells={value.cells || {}}
          onCellUpdate={handleCellUpdate}
          fieldSchema={extractionSchema}
          title={`💎 Extraction ${selectedMethod}`}
          description="Tracez température, pression et rendement"
          showEvolutionTracking={false}
        />
      )}
    </div>
  );
}
```

---

## 📋 Field Schema - Définition

### Structure FieldSchema

```typescript
interface FieldSchema {
  sections: Section[];
}

interface Section {
  id: string;
  label: string;
  icon?: string;
  collapsed?: boolean; // Par défaut collapsed
  fields: Field[];
}

interface Field {
  key: string; // Clé dans PipelineCell (notation pointée)
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea' | 'slider' | 'toggle' | 'composition' | 'list';
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  options?: string[];
  maxItems?: number;
  rows?: number;
  required?: boolean;
  tooltip?: string;
  
  // Pour type = 'composition'
  compositionFields?: Field[];
  
  // Pour type = 'list'
  listItemFields?: Field[];
}
```

### Exemple: curingSchema.js

```javascript
// data/pipelineSchemas/curingSchema.js

export const curingSchema = {
  sections: [
    {
      id: 'environment',
      label: 'Environnement',
      icon: '🌡️',
      collapsed: false,
      fields: [
        {
          key: 'environment.temperature',
          label: 'Température',
          type: 'number',
          min: -20,
          max: 50,
          step: 0.5,
          unit: '°C',
          placeholder: '18',
          tooltip: 'Température ambiante de curing'
        },
        {
          key: 'environment.humidity',
          label: 'Humidité relative',
          type: 'slider',
          min: 0,
          max: 100,
          step: 1,
          unit: '%',
          placeholder: '62',
          tooltip: 'Humidité dans le contenant'
        }
      ]
    },
    {
      id: 'storage',
      label: 'Stockage',
      icon: '📦',
      collapsed: false,
      fields: [
        {
          key: 'storage.containerType',
          label: 'Type de contenant',
          type: 'select',
          options: ['Verre', 'Plastique', 'Air libre', 'Métal', 'Autre'],
          placeholder: 'Sélectionner...'
        },
        {
          key: 'storage.packaging',
          label: 'Emballage primaire',
          type: 'select',
          options: [
            'Cellophane',
            'Papier cuisson',
            'Aluminium',
            'Paper hash',
            'Sac à vide',
            'Congelation',
            'Sous vide complet',
            'Sous vide partiel',
            'Autre'
          ]
        },
        {
          key: 'storage.opacity',
          label: 'Opacité',
          type: 'select',
          options: ['Opaque', 'Semi-opaque', 'Transparent', 'Ambré']
        },
        {
          key: 'storage.volumeOccupied',
          label: 'Volume occupé',
          type: 'number',
          min: 0,
          step: 0.1,
          unit: 'mL',
          placeholder: '500'
        },
        {
          key: 'storage.curingType',
          label: 'Type de curing',
          type: 'select',
          options: ['Froid (<5°C)', 'Chaud (>5°C)']
        }
      ]
    },
    {
      id: 'reviewEvolution',
      label: '🔥 Évolution des notes',
      icon: '📊',
      collapsed: false,
      fields: [
        // Visuel
        {
          key: 'reviewEvolution.visual.color',
          label: 'Couleur',
          type: 'slider',
          min: 0,
          max: 10,
          step: 0.5,
          unit: '/10'
        },
        {
          key: 'reviewEvolution.visual.density',
          label: 'Densité',
          type: 'slider',
          min: 0,
          max: 10,
          step: 0.5,
          unit: '/10'
        },
        {
          key: 'reviewEvolution.visual.trichomes',
          label: 'Trichomes',
          type: 'slider',
          min: 0,
          max: 10,
          step: 0.5,
          unit: '/10'
        },
        
        // Odeurs
        {
          key: 'reviewEvolution.aromas.intensity',
          label: 'Intensité aromatique',
          type: 'slider',
          min: 0,
          max: 10,
          step: 0.5,
          unit: '/10'
        },
        {
          key: 'reviewEvolution.aromas.dominant',
          label: 'Arômes dominants',
          type: 'multiselect',
          options: [], // Charger depuis aromas.json
          maxItems: 7
        },
        
        // Goûts
        {
          key: 'reviewEvolution.tastes.intensity',
          label: 'Intensité gustative',
          type: 'slider',
          min: 0,
          max: 10,
          step: 0.5,
          unit: '/10'
        },
        {
          key: 'reviewEvolution.tastes.aggressiveness',
          label: 'Agressivité/Piquant',
          type: 'slider',
          min: 0,
          max: 10,
          step: 0.5,
          unit: '/10'
        },
        
        // Effets
        {
          key: 'reviewEvolution.effects.onset',
          label: 'Rapidité montée',
          type: 'slider',
          min: 0,
          max: 10,
          step: 0.5,
          unit: '/10'
        },
        {
          key: 'reviewEvolution.effects.intensity',
          label: 'Intensité effets',
          type: 'slider',
          min: 0,
          max: 10,
          step: 0.5,
          unit: '/10'
        },
        {
          key: 'reviewEvolution.effects.effects',
          label: 'Effets ressentis',
          type: 'multiselect',
          options: [], // Charger depuis effects.json
          maxItems: 8
        }
      ]
    },
    {
      id: 'notes',
      label: 'Notes & Observations',
      icon: '📝',
      collapsed: true,
      fields: [
        {
          key: 'notes',
          label: 'Notes libres',
          type: 'textarea',
          rows: 4,
          maxLength: 500,
          placeholder: 'Observations, événements, modifications...'
        }
      ]
    }
  ]
};
```

---

## 🔄 Migration ancien système

### Données actuelles (PipelineGitHubGrid)

```javascript
// Ancien format
{
  config: {
    intervalType: 'days',
    duration: 30
  },
  cells: {
    0: {
      temperature: 22,
      humidity: 65,
      containerType: 'verre',
      packaging: 'cellophane',
      notes: 'Début curing'
    }
  }
}
```

### Nouveau format (PipelineCell)

```javascript
// Nouveau format
{
  config: {
    intervalType: 'days',
    duration: 30
  },
  cells: {
    0: {
      index: 0,
      environment: {
        temperature: 22,
        humidity: 65
      },
      storage: {
        containerType: 'Verre',
        packaging: 'Cellophane'
      },
      reviewEvolution: {
        visual: {
          color: 7.5,
          density: 8,
          trichomes: 9
        },
        aromas: {
          intensity: 8,
          dominant: ['Citron', 'Pin', 'Terreux']
        }
      },
      notes: 'Début curing'
    }
  }
}
```

### Script de migration

```javascript
// utils/migratePipelineData.js

export function migratePipelineData(oldData) {
  if (!oldData || !oldData.cells) return oldData;

  const newCells = {};

  Object.entries(oldData.cells).forEach(([index, cellData]) => {
    newCells[index] = {
      index: parseInt(index),
      
      // Migration données environnement
      environment: {
        temperature: cellData.temperature,
        humidity: cellData.humidity
      },
      
      // Migration storage
      storage: {
        containerType: cellData.containerType,
        packaging: cellData.packaging
      },
      
      // Notes
      notes: cellData.notes
    };
  });

  return {
    ...oldData,
    cells: newCells
  };
}
```

---

## ✅ Tests & Validation

### Checklist tests manuels

**Pipeline Culture Fleurs:**
- [ ] Créer culture avec 12 phases
- [ ] Remplir données phase 0 (Graine): température, substrat
- [ ] Remplir données phase 4 (Milieu Croissance): engrais, lumière, morphologie
- [ ] Modifier notes visuelles phase 8 (Milieu Floraison): trichomes++
- [ ] Vérifier pourcentage complétion
- [ ] Exporter en JSON

**Pipeline Curing:**
- [ ] Créer curing 30 jours
- [ ] Case J+0: température 22°C, humidité 65%, contenant verre
- [ ] Case J+7: modifier odeurs (intensité 7→8)
- [ ] Case J+15: modifier goûts (agressivité 6→5)
- [ ] Case J+30: notes visuelles finales
- [ ] Vérifier évolution graphique
- [ ] Export GIF (voir évolution)

**Pipeline Extraction:**
- [ ] Sélectionner méthode BHO
- [ ] Étape 1: température -20°C, pression 800 PSI
- [ ] Étape 2: évaporation 30°C
- [ ] Rendement 15%
- [ ] Notes complètes

**Pipeline Recette:**
- [ ] Ajouter 10 ingrédients (5 standard + 5 cannabis)
- [ ] Créer 8 étapes protocole
- [ ] Lier ingrédients aux étapes
- [ ] Temps total calcul automatique

### Tests unitaires (Jest)

```javascript
// __tests__/PipelineCore.test.js

import { render, fireEvent } from '@testing-library/react';
import PipelineCore from '../PipelineCore';

describe('PipelineCore', () => {
  test('calcule bon nombre cases mode phases', () => {
    const config = { intervalType: 'phases', duration: 12 };
    const { container } = render(
      <PipelineCore config={config} cells={{}} onCellUpdate={() => {}} />
    );
    
    const cells = container.querySelectorAll('.cursor-pointer');
    expect(cells.length).toBe(12);
  });

  test('calcule bon nombre cases mode jours', () => {
    const config = {
      intervalType: 'days',
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    };
    const { container } = render(
      <PipelineCore config={config} cells={{}} onCellUpdate={() => {}} />
    );
    
    const cells = container.querySelectorAll('.cursor-pointer');
    expect(cells.length).toBe(30);
  });

  test('intensité cellule selon données', () => {
    const cells = {
      0: { environment: { temperature: 22 } } // Peu rempli
    };
    // Test intensité = 1
  });

  test('ouvre modal au clic cellule', () => {
    const onCellUpdate = jest.fn();
    const { container } = render(
      <PipelineCore
        config={{ intervalType: 'days', duration: 10 }}
        cells={{}}
        onCellUpdate={onCellUpdate}
      />
    );
    
    const cell = container.querySelector('.cursor-pointer');
    fireEvent.click(cell);
    
    // Vérifier modal ouvert
  });
});
```

---

## 📚 Ressources

### Documentation de référence
- [pipelineTypes.js](../client/src/types/pipelineTypes.js) - Interfaces TypeScript
- [PipelineCore.jsx](../client/src/components/pipeline/PipelineCore.jsx) - Timeline universelle
- [PIPELINES_REFONTE_COMPLETE.md](./PIPELINES_REFONTE_COMPLETE.md) - Specs complètes

### Prochaines étapes
1. ✅ Implémenter PipelineCellEditor (modal dynamique)
2. ⏳ Créer tous les fieldSchemas (cultureSchema, curingSchema, etc.)
3. ⏳ Implémenter CulturePipeline complet
4. ⏳ Implémenter CuringPipeline avec évolution notes
5. ⏳ Implémenter pipelines Hash (Separation + Purification)
6. ⏳ Implémenter pipelines Concentrés (Extraction + Purification)
7. ⏳ Implémenter RecipePipeline (structure différente)
8. ⏳ Export GIF avec évolution graphique

---

**Statut:** Architecture documentée ✅  
**Prochaine action:** Implémenter PipelineCellEditor + premier pipeline complet
