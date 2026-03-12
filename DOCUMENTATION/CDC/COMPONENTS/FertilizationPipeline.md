# 🌱 FertilizationPipeline Component Documentation

## 📋 Vue d'Ensemble

**Fichier:** `client/src/components/pipelines/legacy/FertilizationPipeline.jsx`

**Type:** React Functional Component (Legacy)

**Catégorie:** Pipeline Component - Fertilization Management

**Statut:** ✅ Production Ready (Legacy)

---

## 🎯 Objectif

Le composant `FertilizationPipeline` permet aux utilisateurs (producteurs) de construire et gérer une **routine d'engraissage complète** pour leurs cultures de cannabis. Il offre une interface structurée pour ajouter, modifier, organiser et supprimer des étapes d'engraissage avec des détails précis sur les produits, dosages et fréquences d'application.

### Cas d'Usage Principal

- **Qui:** Producteurs (tier PRODUCTEUR) documentant leurs cultures de fleurs
- **Quoi:** Création d'une routine d'engraissage détaillée avec multiples produits
- **Pourquoi:** Traçabilité complète du programme de fertilisation pour documentation et partage
- **Contexte:** Utilisé dans les formulaires de review de type FLOWER avec CultivationPipeline

---

## 🔧 Props & Types

### PropTypes Définis

```javascript
FertilizationPipeline.propTypes = {
  value: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,           // Identifiant unique
    name: PropTypes.string.isRequired,         // Type d'engrais
    commercialName: PropTypes.string,          // Nom commercial (optionnel)
    npk: PropTypes.string,                     // Valeurs NPK (optionnel)
    phase: PropTypes.oneOf(['croissance', 'floraison', 'tout']).isRequired,
    dose: PropTypes.string.isRequired,         // Format: "quantité unité"
    frequency: PropTypes.string.isRequired     // Format: "Nx/unité"
  })),
  onChange: PropTypes.func.isRequired,         // Callback de mise à jour
  availableFertilizers: PropTypes.arrayOf(PropTypes.string).isRequired
};
```

### Paramètres Détaillés

#### `value` (Array of Objects)
- **Type:** `Array<FertilizerStep>`
- **Défaut:** `[]`
- **Description:** Tableau contenant toutes les étapes d'engraissage déjà configurées
- **Safety:** Le composant garantit toujours un tableau valide via `Array.isArray()` check
- **Structure de Step:**
  ```javascript
  {
    id: "1642534567890",                    // timestamp unique
    name: "BioBizz Bio-Grow",               // Type d'engrais
    commercialName: "BioBizz Grow",         // Si engrais commercial
    npk: "8-2-6",                           // Si type NPK
    phase: "croissance",                    // croissance|floraison|tout
    dose: "2 ml/L",                         // Quantité + unité
    frequency: "3x/sem"                     // Nombre + unité temps
  }
  ```

#### `onChange` (Function)
- **Type:** `(updatedSteps: Array<FertilizerStep>) => void`
- **Description:** Callback appelée à chaque modification de la routine
- **Appelée lors de:**
  - Ajout d'une nouvelle étape (`addStep`)
  - Suppression d'une étape (`removeStep`)
  - Déplacement d'une étape (`moveStep`)
  - Mise à jour d'une étape (`updateStep`)

#### `availableFertilizers` (Array of Strings)
- **Type:** `string[]`
- **Description:** Liste des types d'engrais disponibles dans le sélecteur
- **Source:** Typiquement depuis `/data/fertilizers.json` ou hardcodé
- **Exemples:**
  ```javascript
  [
    "Solutions nutritives NPK",
    "BioBizz Bio-Grow",
    "Advanced Nutrients",
    "Fumiers compostés",
    "Compost végétal",
    "Algues marines (kelp)",
    "Mélasses"
  ]
  ```

---

## 🏗️ Structure Interne

### State Management (useState)

Le composant utilise plusieurs états locaux pour gérer le formulaire et la liste:

```javascript
// Données persistées
const [steps, setSteps] = useState(safeValue);

// Formulaire d'ajout
const [selectedFertilizer, setSelectedFertilizer] = useState('');
const [phase, setPhase] = useState('croissance');
const [commercialName, setCommercialName] = useState('');
const [npk, setNpk] = useState({ n: '', p: '', k: '' });
const [doseAmount, setDoseAmount] = useState('');
const [doseUnit, setDoseUnit] = useState('ml/L');
const [frequencyNumber, setFrequencyNumber] = useState('1');
const [frequencyUnit, setFrequencyUnit] = useState('sem');
```

#### État `steps`
- **Type:** `Array<FertilizerStep>`
- **Initialisation:** Depuis `value` prop (avec safety check)
- **Synchronisation:** Via `useEffect` sur changement de `value`
- **Persistance:** Propagée au parent via `onChange`

#### États du Formulaire
Tous les champs du formulaire sont contrôlés (controlled components):
- **`selectedFertilizer`**: Type d'engrais sélectionné
- **`phase`**: Phase d'application (croissance/floraison/tout)
- **`commercialName`**: Nom commercial (si applicable)
- **`npk`**: Objet `{ n, p, k }` pour valeurs NPK (si applicable)
- **`doseAmount`**: Quantité numérique
- **`doseUnit`**: Unité de mesure (ml/L, g/L, g, oz)
- **`frequencyNumber`**: Nombre d'applications
- **`frequencyUnit`**: Unité de temps (sec, jours, sem, mois)

---

## 🔄 Logique Métier

### Validation Conditionnelle

Le composant adapte ses champs et validations selon le type d'engrais:

#### Type: Solutions nutritives NPK
```javascript
const isNPK = selectedFertilizer === 'Solutions nutritives NPK';

// Validation requise:
if (isNPK && (!npk.n || !npk.p || !npk.k)) return false;
```
- **Affiche:** 3 inputs numériques (N, P, K)
- **Validation:** Les 3 valeurs doivent être renseignées
- **Format stocké:** `"8-2-6"` (string)

#### Type: Engrais Commercial
```javascript
const isCommercial = selectedFertilizer && 
  !['Solutions nutritives NPK', 'Fumiers compostés', 'Compost végétal', 
    'Algues marines (kelp)', 'Mélasses'].includes(selectedFertilizer);

// Validation requise:
if (isCommercial && !commercialName) return false;
```
- **Affiche:** Input texte pour nom commercial
- **Validation:** Nom commercial obligatoire
- **Exemples:** "BioBizz Grow", "Advanced Nutrients Sensi Bloom"

#### Type: Engrais Organiques Génériques
- **Pas de champs additionnels**
- **Types concernés:** Fumiers, Compost, Algues, Mélasses
- **Validation:** Seulement dose et fréquence

### Fonction de Validation Globale

```javascript
const canAddStep = () => {
  // Vérifications basiques
  if (!selectedFertilizer || !doseAmount || !frequencyNumber) 
    return false;
  
  // Validation conditionnelle NPK
  if (isNPK && (!npk.n || !npk.p || !npk.k)) 
    return false;
  
  // Validation conditionnelle commercial
  if (isCommercial && !commercialName) 
    return false;
  
  return true;
};
```

**Utilisation:**
- Désactive le bouton "Ajouter à la routine" si invalide
- Empêche l'ajout via `addStep()` même si bouton cliqué

---

## 🎬 Fonctions Principales

### `addStep()`

**Objectif:** Ajoute une nouvelle étape à la routine d'engraissage

**Workflow:**
```javascript
const addStep = () => {
  // 1. Validation
  if (!canAddStep()) return;

  // 2. Construction de l'objet step
  const newStep = {
    id: Date.now().toString(),                  // ID unique timestamp
    name: selectedFertilizer,
    commercialName: isCommercial ? commercialName : undefined,
    npk: isNPK ? `${npk.n}-${npk.p}-${npk.k}` : undefined,
    phase,
    dose: `${doseAmount} ${doseUnit}`,
    frequency: `${frequencyNumber}x/${frequencyUnit}`
  };

  // 3. Mise à jour du state local
  const updatedSteps = [...steps, newStep];
  setSteps(updatedSteps);
  
  // 4. Propagation au parent
  onChange(updatedSteps);

  // 5. Reset du formulaire
  resetForm();
};
```

**Comportements Clés:**
- ✅ ID unique via timestamp (évite collisions)
- ✅ Champs conditionnels (`commercialName`, `npk`) seulement si applicables
- ✅ Format normalisé pour dose et fréquence
- ✅ Reset automatique du formulaire après ajout
- ✅ Synchronisation immédiate avec le parent

---

### `removeStep(id)`

**Objectif:** Supprime une étape de la routine

```javascript
const removeStep = (id) => {
  const updatedSteps = steps.filter(step => step.id !== id);
  setSteps(updatedSteps);
  onChange(updatedSteps);
};
```

**Utilisation:**
- Bouton de suppression (✕) sur chaque card d'étape
- Pas de confirmation (action immédiate)
- Propagation immédiate au parent

---

### `moveStep(index, direction)`

**Objectif:** Réorganise l'ordre des étapes (haut/bas)

```javascript
const moveStep = (index, direction) => {
  const newSteps = [...steps];
  const targetIndex = direction === 'up' ? index - 1 : index + 1;

  // Validation des bornes
  if (targetIndex < 0 || targetIndex >= newSteps.length) return;

  // Swap des éléments
  [newSteps[index], newSteps[targetIndex]] = 
    [newSteps[targetIndex], newSteps[index]];
  
  setSteps(newSteps);
  onChange(newSteps);
};
```

**Comportements:**
- ⬆️ `direction: 'up'` → déplace vers le haut (index - 1)
- ⬇️ `direction: 'down'` → déplace vers le bas (index + 1)
- 🚫 Désactivé si:
  - Premier élément + direction 'up'
  - Dernier élément + direction 'down'
- 🔄 Utilise destructuring pour swap atomique

---

### `updateStep(id, field, value)`

**Objectif:** Met à jour un champ spécifique d'une étape existante

```javascript
const updateStep = (id, field, value) => {
  const updatedSteps = steps.map(step =>
    step.id === id ? { ...step, [field]: value } : step
  );
  setSteps(updatedSteps);
  onChange(updatedSteps);
};
```

**Note:** Actuellement **non utilisée** dans le composant
- Fonction définie mais pas de UI pour édition in-place
- Potentiel futur: édition directe dans les cards
- Pattern immutable avec `.map()` préservé

---

## 🎨 Structure UI

### Architecture des Sections

```
FertilizationPipeline
│
├── [Formulaire d'ajout]
│   ├── Sélecteur Phase (croissance/floraison/tout)
│   ├── Sélecteur Type d'engrais
│   ├── [Conditionnel] Input Nom commercial
│   ├── [Conditionnel] Inputs NPK (N, P, K)
│   ├── Input Dose (quantité + unité)
│   ├── Input Fréquence (nombre + boutons unité)
│   └── Bouton "Ajouter à la routine"
│
└── [Liste des étapes]
    ├── Titre "📋 Routine d'engraissage (X engrais)"
    ├── Cards d'étapes (map sur steps)
    │   ├── Numéro + Icône phase
    │   ├── Nom + badges (phase, commercial, NPK)
    │   ├── Dose + Fréquence
    │   └── Contrôles (↑ ↓ ✕)
    └── [Si vide] Message placeholder
```

### Formulaire d'Ajout

**Container:**
```jsx
<div className="p-4 bg-theme-input rounded-xl border border-theme">
```

**Sections:**

1. **Grid 2 colonnes (Phase + Type)**
   ```jsx
   <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
   ```

2. **Input Nom Commercial** (conditionnel `isCommercial`)
   - Placeholder: "Ex: BioBizz Grow, Advanced Nutrients..."
   - Required si engrais commercial

3. **Inputs NPK** (conditionnel `isNPK`)
   - 3 colonnes égales
   - Type number, min=0, max=99
   - Placeholders: N, P, K
   - Helper text: "Format: Azote (N) - Phosphore (P) - Potassium (K)"

4. **Input Dose**
   - Flex layout: input (quantité) + select (unité)
   - Type number, min=0, step=0.1
   - Unités: ml/L, g/L, g, oz

5. **Input Fréquence**
   - Layout horizontal: 
     - Input number (1-10)
     - Text "fois par"
     - 4 boutons toggle (sec, jours, sem, mois)
   - Boutons avec highlight si sélectionné

### Liste des Étapes

**Card Structure:**
```jsx
<div className="flex items-start gap-3 p-4 bg-theme-surface hover:bg-theme-input 
               rounded-xl border border-theme transition group">
  
  {/* Colonne 1: Numéro + Phase icon */}
  <div className="flex flex-col items-center gap-1 min-w-[50px]">
    <span>{index + 1}</span>
    <span>{phaseIcon}</span>
  </div>

  {/* Colonne 2: Contenu principal */}
  <div className="flex-1 space-y-2">
    <h5>{step.name}</h5>
    <div className="badges">
      {/* Phase + commercialName + NPK badges */}
    </div>
    <div className="dose-frequency-display">
      {/* Lecture seule */}
    </div>
  </div>

  {/* Colonne 3: Contrôles (hover reveal) */}
  <div className="opacity-0 group-hover:opacity-100">
    <button>↑</button>
    <button>↓</button>
    <button>✕</button>
  </div>
</div>
```

**Icônes de Phase:**
- 🌿 Croissance
- 🌸 Floraison
- 🔄 Tout au long

**Badges:**
- Phase: `bg-theme-secondary` (capitalize)
- Commercial: `bg-theme-accent text-accent`
- NPK: `bg-theme-tertiary font-mono` (ex: "NPK 8-2-6")

---

## 🔗 Intégration Système

### Contexte d'Utilisation

Le `FertilizationPipeline` est typiquement intégré dans:

**1. CultivationPipelineForm** (principal)
```jsx
import FertilizationPipeline from './legacy/FertilizationPipeline';

function CultivationPipelineForm({ data, onChange }) {
  return (
    <div>
      {/* Autres sections... */}
      
      <section>
        <h3>🌱 Routine d'Engraissage</h3>
        <FertilizationPipeline
          value={data.fertilizers || []}
          onChange={(fertilizers) => onChange({ ...data, fertilizers })}
          availableFertilizers={FERTILIZERS_LIST}
        />
      </section>
    </div>
  );
}
```

**2. ReviewForm (FLOWER type)**
```jsx
// Dans le formulaire de review de type FLOWER
const [cultivationData, setCultivationData] = useState({
  fertilizers: [],
  // ... autres champs
});

<FertilizationPipeline
  value={cultivationData.fertilizers}
  onChange={(fertilizers) => 
    setCultivationData(prev => ({ ...prev, fertilizers }))
  }
  availableFertilizers={fertilizersList}
/>
```

### Données Exportées

Les étapes d'engraissage sont sauvegardées dans:

**Structure DB (Prisma):**
```prisma
model Review {
  // ...
  cultivationPipeline Json? // Contient fertilizers array
}
```

**Format JSON:**
```json
{
  "cultivationPipeline": {
    "fertilizers": [
      {
        "id": "1642534567890",
        "name": "BioBizz Bio-Grow",
        "commercialName": "BioBizz Grow",
        "phase": "croissance",
        "dose": "2 ml/L",
        "frequency": "3x/sem"
      },
      {
        "id": "1642534599999",
        "name": "Solutions nutritives NPK",
        "npk": "8-2-6",
        "phase": "floraison",
        "dose": "1.5 g/L",
        "frequency": "2x/sem"
      }
    ]
  }
}
```

### Export Templates

Les données sont utilisées dans les templates d'export:

**Template DÉTAILLÉ:**
- Affiche jusqu'à 5 étapes principales
- Format: "Phase | Engrais | Dose | Fréquence"

**Template COMPLÈTE:**
- Liste complète de tous les engrais
- Timeline si intégré avec dates

---

## 🎨 Styling & Thèmes

### CSS Variables Utilisées

Le composant utilise le système de thèmes CSS variables:

```css
/* Backgrounds */
--bg-input        /* Formulaire container */
--bg-tertiary     /* Boutons fréquence non-actifs */
--bg-surface      /* Cards étapes (défaut) */

/* Text */
--text-primary    /* Texte principal */
--text-secondary  /* Labels, hints */

/* Colors */
--color-accent    /* Numéros étapes, badges commercial */
--color-danger    /* Bouton suppression */
--primary         /* Bouton "Ajouter", fréquence active */

/* Borders */
--border          /* Contours généraux */
```

### Classes Utilitaires TailwindCSS

**Spacing:**
- `space-y-4` : Espacement vertical sections
- `space-y-3` : Espacement formulaire
- `gap-3` : Gaps dans grids/flex

**Layout:**
- `grid grid-cols-1 md:grid-cols-2` : Responsive 2 colonnes
- `flex items-start gap-3` : Cards layout

**Responsive:**
- Mobile-first design
- Breakpoint `md:` pour desktop adaptations

---

## 🚀 Exemples d'Usage

### Exemple 1: Usage Basique

```jsx
import FertilizationPipeline from '@/components/pipelines/legacy/FertilizationPipeline';

const FERTILIZERS = [
  'Solutions nutritives NPK',
  'BioBizz Bio-Grow',
  'BioBizz Bio-Bloom',
  'Advanced Nutrients Grow',
  'Fumiers compostés'
];

function MyCultureForm() {
  const [fertilizers, setFertilizers] = useState([]);

  return (
    <FertilizationPipeline
      value={fertilizers}
      onChange={setFertilizers}
      availableFertilizers={FERTILIZERS}
    />
  );
}
```

### Exemple 2: Avec Données Pré-remplies

```jsx
const initialData = [
  {
    id: '1',
    name: 'BioBizz Bio-Grow',
    commercialName: 'BioBizz Grow',
    phase: 'croissance',
    dose: '2 ml/L',
    frequency: '3x/sem'
  },
  {
    id: '2',
    name: 'Solutions nutritives NPK',
    npk: '5-10-5',
    phase: 'floraison',
    dose: '1.5 g/L',
    frequency: '2x/sem'
  }
];

<FertilizationPipeline
  value={initialData}
  onChange={handleChange}
  availableFertilizers={FERTILIZERS}
/>
```

### Exemple 3: Intégration Formulaire Complexe

```jsx
function CompleteReviewForm() {
  const [reviewData, setReviewData] = useState({
    generalInfo: {},
    cultivationPipeline: {
      fertilizers: [],
      lighting: {},
      environment: {}
    }
  });

  const handleFertilizersChange = (newFertilizers) => {
    setReviewData(prev => ({
      ...prev,
      cultivationPipeline: {
        ...prev.cultivationPipeline,
        fertilizers: newFertilizers
      }
    }));
  };

  return (
    <form>
      {/* Autres sections... */}
      
      <FertilizationPipeline
        value={reviewData.cultivationPipeline.fertilizers}
        onChange={handleFertilizersChange}
        availableFertilizers={FERTILIZERS_LIST}
      />
    </form>
  );
}
```

---

## ⚠️ Limitations & Considérations

### Limitations Techniques

1. **Pas d'édition in-place**
   - Fonction `updateStep()` existe mais pas de UI
   - Pour modifier: supprimer + re-ajouter
   - **Impact:** UX moins fluide

2. **Validation côté client uniquement**
   - Pas de validation backend documentée ici
   - Formats stockés comme strings
   - **Risque:** Données incohérentes si bypass

3. **IDs basés sur timestamp**
   - Collision possible si ajouts ultra-rapides (<1ms)
   - Pas d'UUID
   - **Mitigation:** Acceptable pour usage normal

4. **Pas de limite d'étapes**
   - Possible d'ajouter infiniment
   - Pas de max définit
   - **Impact:** Potentiel UI overload

### Considérations UX

1. **Reset automatique après ajout**
   - ✅ Avantage: Prêt pour nouvelle saisie
   - ⚠️ Inconvénient: Perte de données si ajout raté

2. **Pas de confirmation suppression**
   - Suppression immédiate
   - Pas d'undo
   - **Recommandation:** Ajouter confirmation pour sécurité

3. **Hover-only controls**
   - Boutons ↑ ↓ ✕ visibles seulement au hover
   - **Mobile:** Problématique (pas de hover)
   - **Solution:** Toujours visible sur mobile ou tap-to-reveal

### Performance

**Optimisations Possibles:**
- [ ] Memoization avec `useMemo` pour `canAddStep()`
- [ ] `useCallback` pour handlers de changement
- [ ] Virtualisation si >50 steps

**État Actuel:**
- ✅ Performant pour 10-20 étapes (cas normal)
- ⚠️ Re-renders sur chaque saisie formulaire

---

## 🐛 Dépannage

### Problème: Les steps ne s'affichent pas

**Causes possibles:**
1. `value` prop n'est pas un array
   - **Solution:** Composant a safety check, mais vérifier parent
2. `value` contient objets mal formés
   - **Solution:** Valider structure dans parent

```javascript
// Vérification parent
const isValidStep = (step) => {
  return step.id && step.name && step.phase && 
         step.dose && step.frequency;
};

const validSteps = steps.filter(isValidStep);
```

### Problème: onChange ne se déclenche pas

**Diagnostic:**
```javascript
// Tester avec console.log
<FertilizationPipeline
  onChange={(steps) => {
    console.log('Fertilizers updated:', steps);
    handleChange(steps);
  }}
/>
```

**Causes:**
- Parent ne met pas à jour `value` prop
- Reference onChange change à chaque render

**Solution:**
```javascript
// Utiliser useCallback dans parent
const handleFertilizersChange = useCallback((newSteps) => {
  setData(prev => ({ ...prev, fertilizers: newSteps }));
}, []);
```

### Problème: Boutons désactivés en permanence

**Cause:** Validation `canAddStep()` échoue

**Checklist:**
- ✅ `selectedFertilizer` sélectionné?
- ✅ `doseAmount` renseigné?
- ✅ `frequencyNumber` renseigné?
- ✅ Si NPK: n, p, k renseignés?
- ✅ Si commercial: commercialName renseigné?

**Debug:**
```javascript
// Ajouter console dans canAddStep
const canAddStep = () => {
  console.log({
    selectedFertilizer,
    doseAmount,
    frequencyNumber,
    isNPK,
    npk,
    isCommercial,
    commercialName
  });
  // ... reste de la fonction
};
```

### Problème: Styles cassés

**Causes:**
1. CSS variables manquantes
2. TailwindCSS non compilé
3. Thème non initialisé

**Vérifications:**
```javascript
// Dans browser console
getComputedStyle(document.documentElement)
  .getPropertyValue('--primary');
```

**Solutions:**
- Vérifier `index.css` importe les variables
- Rebuild Tailwind: `npm run build`
- Vérifier initialisation thème dans App.jsx

---

## 🔄 Évolution & Roadmap

### Version Actuelle (Legacy)

**Statut:** ✅ Stable et fonctionnel
**Utilisation:** Production
**Maintenance:** Fixes bugs uniquement

### Évolution Prévue (v2)

**Objectifs:**
1. **Édition in-place** des steps existants
2. **Drag & drop** pour réorganisation
3. **Sauvegarde automatique** (debounced)
4. **Historique** avec undo/redo
5. **Validation backend**
6. **Suggestions** basées sur phase culture

**Architecture cible:**
```
FertilizationPipeline v2
├── FertilizerForm (séparé)
├── FertilizerStepCard (éditable)
├── DragDropContainer
└── ValidationEngine
```

### Migration Path

**Phase 1:** Créer v2 en parallèle
**Phase 2:** Feature flag pour A/B testing
**Phase 3:** Migration progressive
**Phase 4:** Dépréciation legacy

---

## 📚 Références

### Documentation Connexe

- **[PIPELINES_SYSTEM.md](../../PIPELINES_SYSTEM.md)** - Vue d'ensemble systèmes pipelines
- **[FRONTEND_REACT.md](../../FRONTEND_REACT.md)** - Architecture React général
- **[DATA_MODELS.md](../../DATA_MODELS.md)** - Structure données Review

### Fichiers Reliés

**Components:**
- `CultivationPipelineForm.jsx` - Parent principal
- `PipelineGitHubGrid.jsx` - Timeline visualization
- `TimelineGrid.jsx` - Alternative timeline

**Data:**
- `/data/fertilizers.json` - Liste engrais (si existe)

**Types:**
- `/types/pipeline.ts` - TypeScript types

### Ressources Externes

- [React Controlled Components](https://react.dev/learn/sharing-state-between-components)
- [PropTypes Documentation](https://github.com/facebook/prop-types)
- [TailwindCSS Theming](https://tailwindcss.com/docs/theme)

---

## 📝 Notes de Développement

### Historique

**Création:** 2025 (date exacte inconnue)
**Version:** Legacy v1
**Auteur:** Équipe Reviews-Maker
**Statut:** Production

### Décisions de Design

1. **Pourquoi pas de validation backend inline?**
   - Complexité évitée pour v1
   - Validation globale au submit du formulaire parent

2. **Pourquoi timestamp comme ID?**
   - Simplicité
   - Pas de dépendance externe (uuid)
   - Acceptable pour usage limité

3. **Pourquoi pas de drag & drop?**
   - MVP mindset
   - Boutons ↑ ↓ suffisants
   - Prévu pour v2

### Conventions Code

- **Naming:** camelCase pour variables/fonctions
- **Components:** PascalCase
- **Props destructuring:** Dans signature fonction
- **Conditionals:** Early returns dans validations
- **State updates:** Immutable patterns (spread operator)

---

**Dernière Mise à Jour:** 2026-01-14
**Maintenu par:** Documentation Team Reviews-Maker
**Version Documentation:** 1.0.0
