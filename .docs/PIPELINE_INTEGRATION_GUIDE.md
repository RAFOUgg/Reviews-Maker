# 📘 Guide d'Intégration - Nouveau Système PipeLine

## Date: 16 décembre 2025

## ✅ Composants créés

### 1. PipelineWithSidebar.jsx
**Rôle**: Composant principal orchestrateur
- Layout sidebar + grille
- Configuration de la trame (secondes, minutes, heures, jours, dates, semaines, phases)
- Gestion état des cases
- Pagination automatique (>100 cases)
- Multi-sélection
- Export/import de préréglages

**Props**:
```javascript
{
  pipelineType: 'culture' | 'separation' | 'extraction' | 'curing' | 'recette',
  productType: 'flower' | 'hash' | 'concentrate' | 'edible',
  value: { intervalType, duration, startDate, endDate, cells: {} },
  onChange: (newValue) => void,
  contentSchema: [], // Optionnel, utilise schéma par défaut si non fourni
  readonly: false
}
```

### 2. PipelineContentsSidebar.jsx
**Rôle**: Volet latéral avec contenus draggables
- Sections hiérarchisées pliables
- Recherche/filtrage
- Badges d'identification (Config, Évolutif, Fixe)
- Drag & drop natif HTML5

**Schémas intégrés**:
- `culture`: Environnement, Lumière, Irrigation, Engrais, Palissage, Morphologie, Récolte
- `curing`: Configuration curing, Paramètres environnement

### 3. PipelineGridView.jsx
**Rôle**: Grille de cases style GitHub
- Layout adaptatif selon type d'intervalle
- Visualisation intensité (0-4 niveaux de vert)
- Mini-icônes résumées dans les cases
- Multi-sélection (Ctrl+clic)
- Drop zones pour drag & drop
- Bouton + pour ajouter cases

### 4. PipelineCellModal.jsx
**Rôle**: Modal contextuel d'édition
- Formulaires adaptés par type de contenu
- Onglets pour chaque contenu assigné
- Sauvegarde instantanée
- Copier vers d'autres cases
- Suppression de contenu

## 🚀 Exemples d'utilisation

### Exemple 1: Pipeline Culture (Fleurs)

```jsx
import PipelineWithSidebar from '../components/pipeline/PipelineWithSidebar';
import { CONTENT_SCHEMAS } from '../components/pipeline/PipelineContentsSidebar';

function CreateFlowerReview() {
  const [formData, setFormData] = useState({
    culturePipeline: {
      intervalType: 'phases',
      duration: 12,
      cells: {}
    }
  });

  const handlePipelineChange = (newValue) => {
    setFormData({
      ...formData,
      culturePipeline: newValue
    });
  };

  return (
    <div>
      <h2>Pipeline de Culture</h2>
      <PipelineWithSidebar
        pipelineType="culture"
        productType="flower"
        value={formData.culturePipeline}
        onChange={handlePipelineChange}
        contentSchema={CONTENT_SCHEMAS.culture}
      />
    </div>
  );
}
```

### Exemple 2: Pipeline Curing (tous types)

```jsx
function CuringPipeline({ formData, onChange }) {
  return (
    <PipelineWithSidebar
      pipelineType="curing"
      productType="flower" // ou hash, concentrate, edible
      value={formData.curingPipeline || {
        intervalType: 'days',
        duration: 30,
        cells: {}
      }}
      onChange={(newValue) => onChange('curingPipeline', newValue)}
      contentSchema={CONTENT_SCHEMAS.curing}
    />
  );
}
```

### Exemple 3: Pipeline avec dates spécifiques

```jsx
function CultureWithDates() {
  const [pipeline, setPipeline] = useState({
    intervalType: 'dates',
    startDate: '2025-01-01',
    endDate: '2025-04-01', // 90 jours
    cells: {}
  });

  return (
    <PipelineWithSidebar
      pipelineType="culture"
      productType="flower"
      value={pipeline}
      onChange={setPipeline}
    />
  );
}
```

### Exemple 4: Mode lecture seule

```jsx
function ReadOnlyPipeline({ data }) {
  return (
    <PipelineWithSidebar
      pipelineType="culture"
      productType="flower"
      value={data.pipeline}
      onChange={() => {}} // Pas de modification
      readonly={true} // Désactive édition et drag & drop
    />
  );
}
```

## 📊 Structure des données

### Format de `value`:
```javascript
{
  intervalType: 'days' | 'weeks' | 'months' | 'phases' | 'dates' | 'hours' | 'minutes' | 'seconds',
  duration: 90, // Nombre d'unités (ignoré pour 'dates' et 'phases')
  startDate: '2025-01-01', // Pour 'dates' uniquement
  endDate: '2025-04-01', // Pour 'dates' uniquement
  customPhases: [...], // Optionnel, utilise CULTURE_PHASES par défaut
  cells: {
    0: { // Index de case
      contents: [
        {
          type: 'temperature',
          category: 'environment',
          label: 'Température',
          icon: '🌡️',
          data: {
            value: 24.5,
            notes: 'Température stable'
          }
        },
        {
          type: 'humidity',
          category: 'environment',
          label: 'Humidité relative',
          icon: '💧',
          data: {
            value: 65
          }
        }
      ]
    },
    1: { ... },
    // ... autres cases
  }
}
```

## 🔄 Migration depuis anciens composants

### Remplacer PipelineGitHubGrid:
**Avant**:
```jsx
<PipelineGitHubGrid
  value={data.pipelineGithub}
  onChange={handleChange}
  type="culture"
  productType="flower"
/>
```

**Après**:
```jsx
<PipelineWithSidebar
  pipelineType="culture"
  productType="flower"
  value={data.culturePipeline}
  onChange={(newVal) => handleChange('culturePipeline', newVal)}
/>
```

### Remplacer CulturePipelineTimeline:
**Avant**:
```jsx
<CulturePipelineTimeline
  data={formData}
  onChange={handleChange}
/>
```

**Après**:
```jsx
<PipelineWithSidebar
  pipelineType="culture"
  productType="flower"
  value={formData.culturePipeline}
  onChange={(newVal) => handleChange('culturePipeline', newVal)}
  contentSchema={CONTENT_SCHEMAS.culture}
/>
```

## 🎨 Personnalisation du schéma de contenus

### Créer un schéma custom:
```javascript
const customSchema = [
  {
    category: 'myCategory',
    label: 'Ma Catégorie',
    icon: <MyIcon className="w-4 h-4" />,
    expanded: true,
    items: [
      {
        type: 'myType',
        label: 'Mon Champ',
        icon: '🎯',
        badge: 'Évolutif'
      }
    ]
  }
];

<PipelineWithSidebar
  contentSchema={customSchema}
  // ... autres props
/>
```

## ⚙️ Configuration avancée

### Limites par type d'intervalle:
- **seconds**: max 900s (15 min)
- **minutes**: max 1440min (24h)
- **hours**: max 336h (14 jours)
- **days**: max 365 jours
- **weeks**: max 52 semaines
- **months**: max 12 mois
- **phases**: 12 phases prédéfinies
- **dates**: calculé automatiquement entre startDate et endDate

### Pagination automatique:
- 100 cases par page maximum
- Navigation automatique si > 100 cases
- Boutons ← → pour changer de page

### Multi-sélection:
- Ctrl+clic (Windows) ou Cmd+clic (Mac) pour sélectionner plusieurs cases
- Bouton d'action flottant apparaît en bas à droite
- "Appliquer des données" pour assigner en masse

## 🧪 Tests recommandés

### Test 1: Vérifier tous les intervalles
```javascript
['seconds', 'minutes', 'hours', 'days', 'weeks', 'months', 'phases', 'dates'].forEach(type => {
  // Tester création pipeline avec ce type
  // Vérifier nombre de cases
  // Vérifier labels
});
```

### Test 2: Drag & drop
```javascript
// Glisser un contenu depuis sidebar
// Vérifier qu'il apparaît dans la case
// Ouvrir modal
// Remplir données
// Sauvegarder
// Vérifier persistance
```

### Test 3: Multi-sélection
```javascript
// Ctrl+clic sur plusieurs cases
// Vérifier indicateur sélection
// Appliquer données
// Vérifier que toutes les cases reçoivent les données
```

### Test 4: Pagination
```javascript
// Créer pipeline > 365 jours
// Vérifier pagination automatique
// Naviguer entre pages
// Vérifier cohérence des données
```

## 🐛 Problèmes connus et solutions

### Problème 1: Modal ne s'ouvre pas
**Cause**: Conflit avec selectedCells (multi-sélection active)
**Solution**: Désélectionner toutes les cases avant d'ouvrir modal sur une case unique

### Problème 2: Drag & drop ne fonctionne pas
**Cause**: `readonly={true}` ou navigateur sans support HTML5 drag
**Solution**: Vérifier prop readonly et compatibilité navigateur

### Problème 3: Cases ne s'affichent pas
**Cause**: Configuration incomplète (ex: dates sans startDate/endDate)
**Solution**: Vérifier que tous les champs requis sont remplis selon le type d'intervalle

## 📝 TODOs restants

- [ ] Implémenter préréglages sauvegardés (localStorage + backend)
- [ ] Fonction "Copier vers..." depuis modal
- [ ] Export GIF pour animation évolution
- [ ] Graphiques miniatures (courbes température, etc.)
- [ ] Schémas pour `separation`, `extraction`, `recette`
- [ ] Tests unitaires
- [ ] Tests e2e

## 🔗 Fichiers modifiés/créés

### Nouveaux composants:
- `client/src/components/pipeline/PipelineWithSidebar.jsx`
- `client/src/components/pipeline/PipelineContentsSidebar.jsx`
- `client/src/components/pipeline/PipelineGridView.jsx`
- `client/src/components/pipeline/PipelineCellModal.jsx`

### À modifier pour intégration:
- `client/src/pages/CreateFlowerReview/sections/PipelineCulture.jsx`
- `client/src/components/forms/flower/CulturePipelineTimeline.jsx` (à remplacer)
- `client/src/components/reviews/sections/CulturePipelineSection.jsx`

### Documentation:
- `.docs/PIPELINE_ANALYSIS_REPORT.md`
- `.docs/PIPELINE_INTEGRATION_GUIDE.md` (ce fichier)

---

**Prêt pour intégration** ✅

Pour toute question: voir rapport d'analyse ou contacter l'équipe dev.
