# 🛠️ RECOMMANDATIONS IMPLÉMENTATION - SYSTÈME FLEURS

**Document d'Implémentation pour Q1 2024**  
**Basé sur**: AUDIT_FLEURS_Q1_2024.md

---

## 📋 PRIORITÉS IMPLÉMENTATION

### 🔴 CRITIQUE (Bloquants, 8-10 jours)

#### 1. GithubStylePipelineGrid Component

**Fichier**: `client/src/components/pipeline/GithubStylePipelineGrid.jsx`

**Contexte**:
- Backend: ✅ PipelineGithub modèle + routes existentes
- Frontend: ❌ UI grille manquante
- Impact: Sections 3 & 9 inutilisables sans cela

**Spécifications**:

```jsx
// Props
interface GithubStylePipelineGridProps {
  mode: 'days' | 'weeks' | 'phases',
  startDate: Date,
  endDate?: Date,
  pipelineData: PipelineStep[],
  onChange: (steps: PipelineStep[]) => void,
  readOnly?: boolean
}

// Modes de rendu:
// 1. JOURS: 365 carrés (style GitHub heatmap)
//    └─ X axis: 52 semaines, Y axis: 7 jours/semaine
//    └─ Clic: ouvre modal édition jour
//
// 2. SEMAINES: S1 à S52
//    └─ Grille 8 colonnes × 7 lignes
//    └─ Clic: ouvre modal édition semaine
//
// 3. PHASES: 12 phases (fixes)
//    └─ Grille 4 colonnes × 3 lignes
//    └─ Phases: Germination, Plantule, Croissance-début/milieu/fin,
//              Stretch-début/milieu/fin, Floraison-début/milieu/fin
//    └─ Clic: ouvre modal édition phase

// Chaque carreau:
// - Couleur: intensity gradient basé sur data présente (blanc→bleu→vert)
// - Tooltip: hover affiche résumé données
// - Click: modale édition avec 85+ champs par groupe
// - Badge: nombre événements (arrosage, engraissage, etc.)

// Modal édition jour/semaine/phase:
// - 9 groupes collapsibles (Espace, Substrat, Irrigation, etc.)
// - Champs du groupe avec hints
// - Save button: POST /api/pipeline-github/steps
// - Cancel button: close modal
```

**Composants connexes à modifier**:

1. `PipelineCulture.jsx`: Wrapper vers GithubStylePipelineGrid
2. `PipelineCuring.jsx`: Réutiliser même component pour curing
3. `UnifiedPipeline.jsx`: Appeler GithubStylePipelineGrid

**Effort estimé**: 4-5 jours

**Livrables**:
- [x] Component JSX complète
- [x] Modal édition jour/semaine/phase
- [x] Tooltips + hover states
- [x] Integration avec UnifiedPipeline
- [x] Tests manuels (3 modes)

---

#### 2. PhenoHunt Persistance

**Fichier**: `client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx`

**Contexte**:
- Backend: ✅ `/api/genetics/trees` routes implémentées
- Frontend: ⚠️ Interface existe mais données en state React (perdues après reload)
- Impact: Utilisateurs Producteur ne peuvent pas sauvegarder arbres généalogiques

**Spécifications**:

```jsx
// Current issue:
// const [treeData, setTreeData] = useState({...})  ← Perdu après reload

// Solution:
// 1. Charger depuis backend au mount:
useEffect(() => {
  if (reviewId) {
    // GET /api/genetics/trees?reviewId={reviewId}
    loadGeneticTree(reviewId)
  }
}, [reviewId])

// 2. Sauvegarder lors "Save as preset":
const saveAsPreset = async (treeData) => {
  // POST /api/genetics/trees
  // Body: { name, description, nodes, edges, cultivarIds }
  const saved = await api.post('/api/genetics/trees', {
    reviewId: formData.id,
    data: treeData,
    isPublic: false
  })
  return saved.id
}

// 3. Intégration Zustand store:
// store/flowerReviewStore.js:
export const useFlowerReviewStore = create((set) => ({
  geneticTree: null,
  setGeneticTree: (tree) => set({ geneticTree: tree }),
  
  saveTree: async (data) => {
    const saved = await api.post('/api/genetics/trees', data)
    set({ geneticTree: saved })
    return saved
  },
  
  loadTree: async (reviewId) => {
    const tree = await api.get(`/api/genetics/trees?reviewId=${reviewId}`)
    set({ geneticTree: tree })
    return tree
  }
}))
```

**API Backend (à vérifier existant)**:

```javascript
// GET /api/genetics/trees?reviewId={reviewId}
// → { id, nodes: [...], edges: [...], metadata: {...} }

// POST /api/genetics/trees
// Body: { reviewId, data, isPublic }
// → { id, savedAt: ... }

// PUT /api/genetics/trees/:id
// → { updatedAt: ... }

// DELETE /api/genetics/trees/:id
```

**Modifications UI**:

1. Ajouter bouton "Save Tree" dans modal PhenoHunt
2. Afficher "Tree saved" notification
3. Ajouter bouton "Load preset tree" (dropdown)
4. Import/Export JSON:
   ```jsx
   <button onClick={() => exportTree(treeData)}>
     📥 Export arbre
   </button>
   <input 
     type="file" 
     onChange={(e) => importTree(e.target.files[0])}
   />
   ```

**Effort estimé**: 2-3 jours

**Livrables**:
- [x] Backend API verification + fixes si nécessaire
- [x] Zustand store integration
- [x] Frontend save/load UI
- [x] Import/Export JSON
- [x] Tests CRUD

---

### 🟠 MAJEUR (Important, 6-8 jours)

#### 3. Export Format Selector + Format Implementations

**Fichier**: `client/src/components/export/ExportMaker.jsx` (refactor)

**Étape 1: Format Selector UI** (1-2 jours)

```jsx
// Nouvelle section dans ExportMaker:
function ExportFormatSelector({ onFormatChange, selectedFormat }) {
  return (
    <div className="export-format-selector">
      <h3>Format d'export</h3>
      
      <div className="format-options">
        <label>
          <input 
            type="radio" 
            name="format" 
            value="png" 
            onChange={(e) => onFormatChange(e.target.value)}
          />
          <span>🖼️ PNG (Image)</span>
        </label>
        
        <label>
          <input 
            type="radio" 
            name="format" 
            value="pdf" 
            onChange={(e) => onFormatChange(e.target.value)}
          />
          <span>📄 PDF (Document)</span>
        </label>
        
        <label>
          <input 
            type="radio" 
            name="format" 
            value="csv" 
            onChange={(e) => onFormatChange(e.target.value)}
          />
          <span>📊 CSV (Données)</span>
        </label>
        
        <label>
          <input 
            type="radio" 
            name="format" 
            value="json" 
            onChange={(e) => onFormatChange(e.target.value)}
          />
          <span>⚙️ JSON (Structure)</span>
        </label>
        
        <label>
          <input 
            type="radio" 
            name="format" 
            value="html" 
            onChange={(e) => onFormatChange(e.target.value)}
          />
          <span>🌐 HTML (Web)</span>
        </label>
      </div>
      
      {selectedFormat === 'png' || selectedFormat === 'pdf' ? (
        <div className="image-options">
          <label>
            Qualité:
            <select defaultValue="standard">
              <option value="low">Basse (72 DPI)</option>
              <option value="standard">Standard (96 DPI)</option>
              <option value="high">Haute (150 DPI)</option>
              <option value="print">Impression (300 DPI)</option>
            </select>
          </label>
          
          {selectedFormat === 'pdf' && (
            <label>
              Format:
              <select defaultValue="a4">
                <option value="a4">A4 (210×297mm)</option>
                <option value="square">Carré 1:1 (200×200mm)</option>
                <option value="landscape">Paysage 16:9 (297×167mm)</option>
                <option value="story">Story 9:16 (167×297mm)</option>
              </select>
            </label>
          )}
        </div>
      ) : null}
      
      <button 
        onClick={() => handleExport(selectedFormat)}
        className="btn-primary"
      >
        ↓ Exporter en {selectedFormat.toUpperCase()}
      </button>
    </div>
  )
}
```

**Étape 2: Format Exporters** (2-3 jours par format)

**CSV Exporter**:

```javascript
// client/src/utils/exporters/csvExporter.js
export function exportFlowerReviewAsCSV(review) {
  const data = flattenReview(review)
  
  const headers = Object.keys(data)
  const values = Object.values(data)
  
  const csv = [
    headers.join(','),
    values.map(v => escapeCSV(v)).join(',')
  ].join('\n')
  
  downloadFile(csv, 'review.csv', 'text/csv')
}

function flattenReview(review) {
  return {
    // SECTION 1
    'info.nomCommercial': review.flowerReview.nomCommercial,
    'info.farm': review.flowerReview.farm,
    'info.varietyType': review.flowerReview.varietyType,
    
    // SECTION 2
    'genetics.breeder': review.flowerReview.breeder,
    'genetics.variety': review.flowerReview.variety,
    'genetics.indicaPercent': review.flowerReview.indicaPercent,
    'genetics.sativaPercent': review.flowerReview.sativaPercent,
    
    // SECTION 3: Pipeline (flattened par groupe)
    'culture.spaceType': review.flowerReview.culturePipeline?.groups?.space?.type,
    'culture.dimensions': review.flowerReview.culturePipeline?.groups?.space?.dimensions,
    'culture.substrate': review.flowerReview.culturePipeline?.groups?.substrate?.type,
    // ... 85+ champs
    
    // SECTION 4-9: Toutes scores et observations
    'visuel.couleur': review.flowerReview.couleurScore,
    'visuel.densité': review.flowerReview.densiteVisuelle,
    // ...
    'effets.montee': review.flowerReview.monteeScore,
    'effets.profils': review.flowerReview.effetsChoisis,
  }
}
```

**JSON Exporter**:

```javascript
// client/src/utils/exporters/jsonExporter.js
export function exportFlowerReviewAsJSON(review) {
  const json = JSON.stringify({
    metadata: {
      exported: new Date().toISOString(),
      version: '1.0',
      type: 'FlowerReview'
    },
    review: {
      id: review.id,
      general: {
        nomCommercial: review.flowerReview.nomCommercial,
        farm: review.flowerReview.farm,
        photos: review.images,
      },
      genetics: {
        breeder: review.flowerReview.breeder,
        variety: review.flowerReview.variety,
        phenotype: review.flowerReview.phenotypeCode,
        geneticTree: review.flowerReview.geneticTree
      },
      culturePipeline: review.flowerReview.culturePipeline,
      evaluations: {
        visuel: { /* ... */ },
        odeurs: { /* ... */ },
        gouts: { /* ... */ },
        effets: { /* ... */ }
      },
      curingPipeline: review.flowerReview.curingPipeline
    }
  }, null, 2)
  
  downloadFile(json, 'review.json', 'application/json')
}

// Import JSON
export function importFlowerReviewFromJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        resolve(data.review)
      } catch (err) {
        reject(new Error('Invalid JSON format'))
      }
    }
    reader.readAsText(file)
  })
}
```

**HTML Exporter**:

```javascript
// client/src/utils/exporters/htmlExporter.js
export function exportFlowerReviewAsHTML(review) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <title>${review.flowerReview.nomCommercial}</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 900px; margin: 0 auto; }
          .section { page-break-inside: avoid; margin: 20px 0; }
          .section h2 { border-bottom: 2px solid #333; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
        </style>
      </head>
      <body>
        <h1>${review.flowerReview.nomCommercial}</h1>
        
        <div class="section">
          <h2>Informations Générales</h2>
          <table>
            <tr><td>Farm</td><td>${review.flowerReview.farm}</td></tr>
            <tr><td>Type</td><td>${review.flowerReview.varietyType}</td></tr>
          </table>
        </div>
        
        <div class="section">
          <h2>Génétiques</h2>
          <table>
            <tr><td>Breeder</td><td>${review.flowerReview.breeder}</td></tr>
            <tr><td>Variété</td><td>${review.flowerReview.variety}</td></tr>
            <tr><td>Indica %</td><td>${review.flowerReview.indicaPercent}%</td></tr>
          </table>
        </div>
        
        <!-- Toutes sections HTML -->
      </body>
    </html>
  `
  
  downloadFile(html, 'review.html', 'text/html')
}
```

**Effort estimé par format**:
- PNG/PDF: ✅ Déjà existants
- CSV: 1-2 jours
- JSON: 1-2 jours
- HTML: 1-2 jours

**Total Phase 3**: 4-6 jours

---

#### 4. Template Selector + Customization

**Fichier**: `client/src/components/export/TemplateSelector.jsx` (nouveau)

```jsx
// Sélecteur de template:
function TemplateSelector({ selectedTemplate, onSelect, userRole }) {
  const templates = [
    {
      id: 'compact',
      name: 'Compact',
      description: 'Format 1:1 minimaliste',
      sections: ['infos', 'cultivar', 'visuel', 'odeurs', 'gouts', 'effets'],
      available: userRole === 'any'
    },
    {
      id: 'detailed',
      name: 'Détaillé',
      description: 'Format complet multi-sections',
      sections: ['infos', 'genetics', 'culture-preview', 'visuel', 'odeurs', 'gouts', 'effets'],
      available: userRole === 'any'
    },
    {
      id: 'complete',
      name: 'Complète',
      description: 'Toutes données + pipelines',
      sections: ['all'],
      available: userRole === 'producer'
    },
    {
      id: 'influencer',
      name: 'Influenceur',
      description: 'Format 9:16 réseaux sociaux',
      sections: ['visuel', 'odeurs', 'gouts', 'effets'],
      format: '9:16',
      available: userRole === 'influencer'
    }
  ]
  
  return (
    <div className="template-selector">
      <h3>Sélectionner un template</h3>
      
      <div className="template-grid">
        {templates.map(template => (
          !template.available ? (
            <div key={template.id} className="template-card disabled">
              <p>{template.name} (Accès {template.available ? 'Producteur' : 'Premium'})</p>
            </div>
          ) : (
            <div 
              key={template.id}
              className={`template-card ${selectedTemplate === template.id ? 'active' : ''}`}
              onClick={() => onSelect(template.id)}
            >
              <h4>{template.name}</h4>
              <p>{template.description}</p>
              <small>{template.sections.length} sections</small>
            </div>
          )
        ))}
      </div>
      
      {selectedTemplate === 'complete' && userRole === 'producer' && (
        <CustomizationPanel />
      )}
    </div>
  )
}
```

---

#### 5. Galerie Modifications In-Gallery

**Fichier**: Modifications dans `client/src/pages/public/GalleryPage.jsx`

```jsx
// Ajouter actions par review:
function ReviewCard({ review, currentUser }) {
  const isOwner = review.userId === currentUser?.id
  
  return (
    <div className="review-card">
      {/* Contenu review... */}
      
      {isOwner && (
        <div className="owner-actions">
          <button 
            className="btn-sm"
            onClick={() => openEditModal(review, 'technicals')}
          >
            ✏️ Éditer fiches
          </button>
          
          <button 
            className="btn-sm"
            onClick={() => openEditModal(review, 'phenohunt')}
          >
            🧬 Éditer PhenoHunt
          </button>
          
          <button 
            className="btn-sm"
            onClick={() => openEditModal(review, 'pipeline')}
          >
            ⚙️ Éditer pipeline
          </button>
        </div>
      )}
    </div>
  )
}

// Modal édition rapide:
function QuickEditModal({ review, editType, onSave, onClose }) {
  const [data, setData] = useState(review)
  
  return (
    <Modal isOpen={!!editType} onClose={onClose}>
      <h2>Éditer {editType === 'technicals' ? 'fiches' : editType === 'phenohunt' ? 'PhenoHunt' : 'pipeline'}</h2>
      
      {editType === 'technicals' && (
        <TechnicalFieldsEditor value={data.flowerReview} onChange={setData} />
      )}
      
      {editType === 'phenohunt' && (
        <GeneticTreeEditor value={data.geneticTree} onChange={setData} />
      )}
      
      {editType === 'pipeline' && (
        <PipelineQuickEditor value={data.culturePipeline} onChange={setData} />
      )}
      
      <button onClick={() => handleSave(data)}>Sauvegarder</button>
    </Modal>
  )
}
```

**Effort estimé**: 2-3 jours

---

### 🟡 IMPORTANT (Non-bloquants, 3-4 jours)

#### 6. Frontend Validations

**Fichier**: `client/src/utils/validation/flowerReviewValidation.js`

```javascript
import { z } from 'zod'

const FlowerReviewSchema = z.object({
  // SECTION 1
  nomCommercial: z.string().min(1, 'Nom requis'),
  farm: z.string().optional(),
  varietyType: z.enum(['indica', 'sativa', 'hybride']),
  
  // SECTION 2
  breeder: z.string().optional(),
  variety: z.string().optional(),
  
  // SECTION 3: Pipeline Culture
  culturePipeline: z.object({
    mode: z.enum(['days', 'weeks', 'phases']),
    startDate: z.date(),
    endDate: z.date().optional(),
    groups: z.object({
      space: z.object({
        type: z.string(),
        dimensions: z.object({
          length: z.number().positive(),
          width: z.number().positive(),
          height: z.number().positive()
        })
      }),
      substrate: z.object({
        type: z.enum(['solide', 'hydro', 'aero']),
        volume: z.number().positive()
      }),
      // ... 9 groupes avec validations
    })
  }).optional(),
  
  // SECTION 4-8
  couleurScore: z.number().min(0).max(10),
  // ... tous scores
  
  // SECTION 9
  curingPipeline: z.object({
    // Validation identique à culturePipeline
  }).optional()
})

export function validateFlowerReview(data) {
  try {
    return FlowerReviewSchema.parse(data)
  } catch (error) {
    return { errors: error.errors }
  }
}
```

**Intégration dans formulaire**:

```jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  
  const validation = validateFlowerReview(formData)
  if (validation.errors) {
    setErrors(validation.errors)
    return
  }
  
  // Submit si valid
  await submitReview(formData)
}
```

**Effort estimé**: 1-2 jours

---

#### 7. Presets UI Improvements

**Ajouts rapides**:

1. Rating stars (1-5 ⭐)
2. Notes textarea (max 500 chars)
3. "Presets similaires" suggestion
4. Versionning (v1, v2, etc.)

**Effort estimé**: 1-2 jours

---

## 📝 CHECKLIST D'IMPLÉMENTATION

### Semaine 1

- [ ] GithubStylePipelineGrid component
  - [ ] Grille jours (365)
  - [ ] Grille semaines (52)
  - [ ] Grille phases (12)
  - [ ] Modal édition
  - [ ] Integration UnifiedPipeline
  
- [ ] PhenoHunt persistance
  - [ ] Backend API verification
  - [ ] Zustand store setup
  - [ ] Save/Load UI
  - [ ] Import/Export JSON

### Semaine 2

- [ ] Export format selector UI
- [ ] CSV exporter
- [ ] JSON exporter
- [ ] HTML exporter
- [ ] Template selector
- [ ] Template customization

### Semaine 3

- [ ] Galerie modifications
- [ ] Frontend validations
- [ ] Presets UI improvements
- [ ] Testing exhaustive

---

## 🧪 PLAN DE TEST

### Tests Critiques

```
1. SECTION 3 Pipeline Culture:
   ✓ Créer review
   ✓ Sélectionner mode JOURS
   ✓ Remplir données jour 1
   ✓ Click jour 1 → modale
   ✓ Sauvegarder jour 1
   ✓ Recharger page
   ✓ Données jour 1 encore là
   
2. PhenoHunt:
   ✓ Créer arbre généalogique
   ✓ Click "Save Tree"
   ✓ Sauvegarder review
   ✓ Recharger page
   ✓ Arbre toujours présent
   ✓ Export JSON
   ✓ Import JSON
   
3. Export:
   ✓ Sélectionner format CSV
   ✓ Click Export
   ✓ Fichier CSV téléchargé
   ✓ Ouvrir CSV dans Excel
   ✓ Toutes colonnes présentes
   
4. Galerie:
   ✓ Afficher review
   ✓ Click "Edit technicals"
   ✓ Modale édition
   ✓ Modifier données
   ✓ Sauvegarder
   ✓ Données modifiées reflétées
```

---

## 🚀 RÉSUMÉ D'EXÉCUTION

| Phase | Tâche | Effort | Priority | Status |
|-------|-------|--------|----------|--------|
| 1 | GithubStylePipelineGrid | 4-5j | 🔴 | ❌ TODO |
| 1 | PhenoHunt persistance | 2-3j | 🔴 | ❌ TODO |
| 2 | Export selector + formats | 4-6j | 🟠 | ❌ TODO |
| 2 | Galerie modifications | 2-3j | 🟠 | ❌ TODO |
| 3 | Frontend validations | 1-2j | 🟡 | ❌ TODO |
| 3 | Presets UI | 1-2j | 🟡 | ❌ TODO |
| 3 | Testing | 2-3j | 🟡 | ❌ TODO |
| **TOTAL** | | **16-24j** | | |

**Timeline**: 3-4 semaines (2-3 devs)

---

**Document préparé par**: GitHub Copilot  
**Date**: 15 janvier 2026  
**Statut**: Ready for Implementation
