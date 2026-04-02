# Pipeline Culture - Documentation Technique Complète

**Chemin** : `client/src/components/pipelines/sections/CulturePipelineSection.jsx`  
**Type de Compte** : **Producteur uniquement** 🔒  
**Dernière Mise à Jour** : 2026-04-01

---

## 📋 Vue d'Ensemble

Le **Pipeline Culture** est un système de saisie structurée permettant aux producteurs de documenter toutes les étapes de culture d'une plante de cannabis, de la graine à la récolte.

### Capture d'écran
![Pipeline Culture Interface](./assets/pipeline-culture-phases.png)

**Concept Clé** : Chaque "case" de la timeline représente un intervalle de temps (jour, semaine, phase) contenant des données environnementales et culturales modifiables.

---

## 🎯 Fonctionnalités

### 1. **Configuration de la Timeline**

#### Type d'Intervalle
Choix entre 3 modes :

| Mode | Description | Utilisation |
|------|-------------|-------------|
| **Jours** | Chaque case = 1 jour | Cultures courtes (8-12 semaines) |
| **Semaines** | Chaque case = 1 semaine (S1, S2, ...) | Cultures moyennes/longues |
| **Phases** | 12 phases prédéfinies | Approche technique structurée |

#### Phases Prédéfinies (Mode Phases)
```javascript
const PHASES = [
  { id: 'J0', label: 'Graine (J0)', days: 1 },
  { id: 'germination', label: 'Germination', days: 3-7 },
  { id: 'plantule', label: 'Plantule', days: 7-14 },
  { id: 'croissance-debut', label: 'Début Croissance', days: 7-14 },
  { id: 'croissance-milieu', label: 'Milieu Croissance', days: 7-14 },
  { id: 'croissance-fin', label: 'Fin Croissance', days: 7-14 },
  { id: 'stretch-debut', label: 'Début Stretch', days: 7-10 },
  { id: 'stretch-milieu', label: 'Milieu Stretch', days: 7-10 },
  { id: 'stretch-fin', label: 'Fin Stretch', days: 3-7 },
  { id: 'floraison-debut', label: 'Début Floraison', days: 14-21 },
  { id: 'floraison-milieu', label: 'Milieu Floraison', days: 14-21 },
  { id: 'floraison-fin', label: 'Fin Floraison', days: 7-14 }
]
```

#### Dates Début/Fin (Mode Jours uniquement)
- **Début** : Obligatoire
- **Fin** : Facultative (permet ajout progressif)
- Format : `YYYY-MM-DD`
- Max : 365 jours

---

### 2. **Données Modifiables par Étape**

#### [GENERAL] - Métadonnées Culture

**Début et fin de culture**
```javascript
{
  startDate: '2025-01-15',  // ISO date (mode jours uniquement)
  endDate: '2025-04-20'      // ISO date (mode jours uniquement)
}
```

**Mode de culture**
- Indoor
- Outdoor  
- Greenhouse
- No-till
- Autre (texte libre)

**Espace de culture**
```javascript
spaceType: 'tent' | 'cabinet' | 'greenhouse' | 'outdoor' | 'other'
dimensions: {
  length: 120,   // cm
  width: 120,    // cm
  height: 200    // cm
}
surfaceArea: 1.44  // m² (auto-calculé si dimensions fournies)
volume: 2.88       // m³ (auto-calculé)
```

---

#### [ENVIRONNEMENT] - Conditions de Culture

**Technique de propagation**
```javascript
propagation: 'seed' | 'clone' | 'cutting' | 'paper-towel' | 'cotton' | 'other'
```

**Substrat**
```javascript
substrate: {
  type: 'hydro' | 'bio' | 'organic',
  volume: 20,  // Litres
  composition: [
    { ingredient: 'Coco', percentage: 50, brand: 'Canna' },
    { ingredient: 'Perlite', percentage: 30, brand: 'Generic' },
    { ingredient: 'Vermiculite', percentage: 20, brand: 'Plagron' }
  ]
}
```

**Système d'irrigation**
```javascript
irrigation: {
  type: 'drip' | 'flood' | 'manual' | 'other',
  frequency: 2,        // par jour
  volumePerWatering: 1 // Litres
}
```

**Engrais utilisés**
```javascript
fertilizers: [
  {
    type: 'bio' | 'chemical' | 'mixed',
    brand: 'BioBizz',
    line: 'Grow',
    dosage: 2,          // g/L ou ml/L
    frequency: 'daily' | 'weekly' | 'bi-weekly',
    linkedToWatering: true  // Si couplé à arrosage
  }
]
```

**Lumière**
```javascript
lighting: {
  type: 'LED' | 'HPS' | 'CFL' | 'natural' | 'mixed',
  spectrum: 'full' | 'blue' | 'red' | 'white',
  distance: 30,        // cm du sommet
  power: 600,          // Watts total
  hoursPerDay: 18,     // Heures
  dli: 45,             // mol/m²/jour (optionnel)
  ppfd: 800,           // µmol/m²/s (optionnel)
  kelvin: 3000         // Température couleur (optionnel)
}
```

**Environnement**
```javascript
environment: {
  temperature: 24,     // °C
  humidity: 65,        // %
  co2: 1200,           // ppm (optionnel)
  ventilation: {
    type: 'passive' | 'active' | 'extraction',
    frequency: 'continuous' | 'intermittent'
  }
}
```

**Palissage LST/HST**
```javascript
training: {
  method: 'SCROG' | 'SOG' | 'Main-Lining' | 'Topping' | 'FIM' | 'LST' | 'HST',
  comment: 'Taillage au-dessus du 4e noeud, conservation de 2 branches principales'
}
```

**Morphologie de la plante**
```javascript
morphology: {
  height: 80,              // cm
  volume: 0.5,             // L (estimation)
  weight: 450,             // g (poids végétal frais)
  mainBranches: 6,
  leaves: 120,             // estimation
  buds: 24
}
```

**Récolte**
```javascript
harvest: {
  trichomes: {
    translucent: 10,   // %
    milky: 70,         // %
    amber: 20          // %
  },
  date: '2025-04-20',  // ISO date
  rawWeight: 850,      // g (poids brut avec feuilles)
  netWeight: 620,      // g (après defoliation)
  yield: 1.44          // g/m² OU g/plante
}
```

---

### 3. **Progression & Ajout d'Étapes**

#### Mode Jours
- **Ajout automatique** : Si `endDate` définie, toutes les cases sont créées d'avance
- **Ajout progressif** : Si pas de `endDate`, l'utilisateur ajoute manuellement chaque jour

#### Mode Semaines
- **Ajout manuel uniquement** : Bouton "+ Ajouter Semaine Suivante" (S1, S2, S3...)
- Permet journal de bord en temps réel

#### Mode Phases
- **Toutes les phases affichées d'avance** (12 cases fixes)
- L'utilisateur remplit au fur et à mesure

---

## 🔧 Implémentation Technique

### Props du Composant
```javascript
<CulturePipelineSection
  formData={formData}
  handleChange={handleChange}
  isProducteur={isProducteur}  // Permission check
/>
```

### Structure de Données (formData.culturePipeline)
```javascript
{
  timelineConfig: {
    intervalType: 'days' | 'weeks' | 'phases',
    startDate: '2025-01-15',   // Mode jours uniquement
    endDate: '2025-04-20',     // Mode jours (optionnel)
    currentWeek: 8             // Mode semaines
  },
  timelineData: [
    {
      id: 'J0' | 'S1' | 'germination',  // Identifiant unique
      label: 'Jour 0' | 'Semaine 1' | 'Germination',
      date: '2025-01-15',       // ISO date (mode jours/semaines)
      // TOUTES LES DONNÉES MODIFIABLES (voir section 2)
      mode: 'indoor',
      spaceType: 'tent',
      substrate: { ... },
      lighting: { ... },
      environment: { ... },
      // etc.
    },
    // ... autres étapes
  ]
}
```

### Sauvegarde Backend
```javascript
// Dans flattenFlowerFormData()
if (data.culturePipeline) {
  if (data.culturePipeline.timelineConfig) {
    flat.cultureTimelineConfig = data.culturePipeline.timelineConfig
  }
  if (data.culturePipeline.timelineData) {
    flat.cultureTimelineData = data.culturePipeline.timelineData
  }
}

// Compatibilité ancienne structure (data.culture)
if (data.culture) {
  if (!flat.cultureTimelineConfig && data.culture.cultureTimelineConfig) {
    flat.cultureTimelineConfig = data.culture.cultureTimelineConfig
  }
  if (!flat.cultureTimelineData && data.culture.cultureTimeline) {
    flat.cultureTimelineData = data.culture.cultureTimeline
  }
}
```

**Stockage DB** :
- `cultureTimelineConfig` : TEXT (JSON)
- `cultureTimelineData` : TEXT (JSON array)

---

## 🎨 UI/UX

### Layout Général
```
┌─────────────────────────────────────────────────┐
│ 🧬 Pipeline Culture                             │
├─────────────────────────────────────────────────┤
│ Type intervalle: [📅 Jours ▼]                   │
│ Phases prédéfinies: 12 phases (Graine → Récolte)│
├─────────────────────────────────────────────────┤
│ Progression: 0/12  0%  [░░░░░░░░░░░░░░░░░░░░]  │
├─────────────────────────────────────────────────┤
│ 💡 Première case : Config générale              │
│ 🎨 Autres cases : Drag & drop paramètres        │
├─────────────────────────────────────────────────┤
│ [Graine (J0) ] [Germination] [Plantule] ...     │
│   (7)            (33)          (7)               │
│   Config                                         │
└─────────────────────────────────────────────────┘
```

### Carte Phase/Jour/Semaine
```jsx
<div className="culture-step-card">
  <div className="card-header">
    <span className="step-icon">🌱</span>
    <span className="step-label">Germination</span>
    <span className="data-count">(14)</span>
  </div>
  
  {step.id === 'J0' || step.id === steps[0].id && (
    <div className="config-badge">Config</div>
  )}
  
  <div className="card-content">
    {/* Affichage résumé des données si renseignées */}
    {step.lighting && <span>💡 {step.lighting.type} - {step.lighting.power}W</span>}
    {step.environment && <span>🌡️ {step.environment.temperature}°C</span>}
  </div>
</div>
```

### Drag & Drop
**Principe** : Après avoir configuré la première case, l'utilisateur peut drag & drop des paramètres vers d'autres cases pour dupliquer.

**Exemple** : 
1. Config lumière J0 : LED 600W 18h
2. Drag icône 💡 depuis J0 → J1 à J30
3. Toutes les cases reçoivent la même config

---

## 📤 Export vers ExportMaker

### GIF d'Évolution
**Fonctionnalité** : Export des étapes en GIF animé montrant l'évolution.

```javascript
// Dans ExportMaker
const handleExportGIF = async () => {
  const timelineData = reviewData.culturePipeline?.timelineData || [];
  
  const frames = timelineData.map(step => ({
    label: step.label,
    temperature: step.environment?.temperature,
    humidity: step.environment?.humidity,
    height: step.morphology?.height,
    // ... autres données visuelles
  }));

  const gifBlob = await exportPipelineToGIF(frames, {
    width: 800,
    height: 600,
    fps: 2,  // 2 frames/sec
    duration: timelineData.length * 500  // 500ms par frame
  });

  downloadGIF(gifBlob, `culture-${reviewData.nomCommercial}.gif`);
};
```

### Affichage Statique
Dans les templates Détaillé et Complet, affichage des 5 étapes clés :
- J0 / Germination
- Début Croissance
- Début Floraison
- Milieu Floraison
- Récolte

---

## ⚠️ Problèmes Connus & Solutions

### 🐛 Bug #1 : Timeline non sauvegardée après changement de mode
**Symptôme** : Passer de "jours" à "semaines" réinitialise toutes les données.

**Solution** : Avertissement modal avant changement + option "Convertir les données".

---

### ⚠️ Attention : Taille des Données
Un pipeline de 100 jours avec toutes les données peut atteindre **50-100 KB** JSON.

**Optimisation** :
- Ne stocker que les champs non-null
- Compresser le JSON côté serveur (gzip)
- Limiter à 365 jours max

---

## 🧪 Tests

### Test 1 : Mode Phases
1. Sélectionner "Phases" dans Type intervalle
2. Vérifier 12 cartes affichées
3. Cliquer "Graine (J0)" → Config
4. Remplir mode, espace, lumière
5. Vérifier badge "Config" sur la carte
6. Cliquer "Germination" → Config (doit hériter de J0)

### Test 2 : Mode Jours avec dates
1. Sélectionner "Jours"
2. Saisir date début : 15/01/2025
3. Saisir date fin : 15/04/2025 (90 jours)
4. Vérifier 90 cartes créées
5. Remplir J0 → Config
6. Drag icône 💡 de J0 à J15
7. Vérifier J15 a la même config lumière

### Test 3 : Sauvegarde/Rechargement
1. Créer timeline avec données
2. Sauvegarder brouillon
3. Recharger page
4. Vérifier toutes les données présentes

---

## 📚 Références

### Fichiers Liés
- **Component** : `client/src/components/pipelines/sections/CulturePipelineSection.jsx`
- **Unified Pipeline** : `client/src/components/pipelines/UnifiedPipeline.jsx`
- **Flattener** : `client/src/utils/formDataFlattener.js` (lignes 122-138)
- **Hook** : `client/src/pages/review/CreateFlowerReview/hooks/useFlowerForm.js`
- **GIF Exporter** : `client/src/utils/GIFExporter.js`

### Documentation Connexe
- [Section 9 - Pipeline Curing](../SECTION_9_PIPELINE_MATURATION/README.md)
- [UnifiedPipeline System](../../../PIPELINE_SYSTEME/sys.md)
- [ExportMaker GIF Export](../../EXPORT_MAKER/GIF_EXPORT.md)

---

**Dernière révision** : 2026-04-01  
**Auteur** : Copilot AI  
**Version** : 2.0.0
