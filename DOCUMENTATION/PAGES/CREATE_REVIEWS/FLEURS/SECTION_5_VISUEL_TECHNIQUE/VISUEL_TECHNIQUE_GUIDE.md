# Section Visuel & Technique - Documentation Technique

**Chemin** : `client/src/pages/review/CreateFlowerReview/sections/VisuelTechnique.jsx`  
**Type de Compte** : Tous  
**Dernière Mise à Jour** : 2026-04-01

---

## 📋 Vue d'Ensemble

Section permettant d'évaluer visuellement un produit via :
- **Roue colorimétrique** (sélection jusqu'à 5 couleurs)
- **Sliders de notation** (6 critères de 0 à 10)

### Capture d'écran
![Sélection Colorimétrique](./assets/visual-color-wheel.png)

---

## 🎯 Fonctionnalités

### 1. **Roue Colorimétrique Interactive**

#### Couleurs Disponibles
12 segments de couleur du cannabis :
- Vert clair, Vert foncé
- Jaune, Doré
- Orange, Rouille
- Brun, Marron
- Violet, Mauve
- Bleu, Gris

#### Interface
```jsx
<ColorWheel
  selectedColors={selectedColors}
  onColorSelect={handleColorSelect}
  maxSelection={5}
/>
```

**Affichage sélection** :
- Cases colorées sous la roue
- Badge "Aucune couleur sélectionnée" si vide
- Max 5 couleurs (désactive les autres après)

---

### 2. **Sliders de Notation** (0-10)

| Critère | Description | Échelle |
|---------|-------------|---------|
| **Densité visuelle** | Compacité des fleurs | 0 = Aéré → 10 = Très dense |
| **Trichomes** | Couverture résineuse | 0 = Aucun → 10 = Complètement couvert |
| **Pistils** | Présence/qualité pistils | 0 = Aucun → 10 = Abondants |
| **Manucure** | Qualité de la coupe | 0 = Non fait → 10 = Parfaite |
| **Moisissure** | Absence moisissure | 10 = Aucune → 0 = Complètement moisi |
| **Graines** | Absence graines | 10 = Aucune → 0 = Rempli de graines |

**Inversion logique** : Moisissure et Graines sont inversés (10 = bon état).

---

## 🔧 Implémentation Technique

### Props
```javascript
<VisuelTechnique
  formData={formData}
  handleChange={handleChange}
/>
```

### Structure formData
```javascript
{
  // Flat aliases (pour compatibilité)
  densite: 7,
  trichomes: 9,
  pistils: 6,
  manucure: 8,
  moisissure: 10,
  graines: 10,
  selectedColors: ['vert-fonce', 'violet', 'orange'],
  
  // Nested object (structure officielle)
  visual: {
    colors: ['vert-fonce', 'violet', 'orange'],
    colorRating: 8,
    density: 7,
    trichomes: 9,
    pistils: 6,
    manucure: 8,
    mold: 10,
    seeds: 10
  }
}
```

**Note** : Les deux structures coexistent pour compatibilité rétro-active.

---

### Sauvegarde Backend
```javascript
// Dans flattenFlowerFormData()
// Priority 1: flat keys (dernière saisie utilisateur)
if (data.selectedColors) flat.couleurNuancier = data.selectedColors
if (data.densite !== undefined) flat.densiteVisuelle = data.densite
if (data.trichomes !== undefined) flat.trichomesScore = data.trichomes
if (data.pistils !== undefined) flat.pistilsScore = data.pistils
if (data.manucure !== undefined) flat.manucureScore = data.manucure
if (data.moisissure !== undefined) flat.moisissureScore = data.moisissure
if (data.graines !== undefined) flat.grainesScore = data.graines

// Priority 2: nested visual (fallback)
if (data.visual) {
  if (!flat.couleurNuancier && data.visual.colors) flat.couleurNuancier = data.visual.colors
  if (data.visual.colorRating !== undefined) flat.couleurScore = data.visual.colorRating
  if (!flat.densiteVisuelle && data.visual.density !== undefined) flat.densiteVisuelle = data.visual.density
  // ... etc
}
```

**Colonnes DB** :
- `couleurNuancier` : TEXT (JSON array)
- `couleurScore` : INTEGER
- `densiteVisuelle` : INTEGER
- `trichomesScore` : INTEGER
- `pistilsScore` : INTEGER
- `manucureScore` : INTEGER
- `moisissureScore` : INTEGER
- `grainesScore` : INTEGER

---

## 🎨 UI/UX

### Design System
- **LiquidSlider** : Sliders avec animations fluides
- **ColorWheel** : SVG interactif avec hover effects

### États Visuels

| État | Affichage |
|------|-----------|
| **Couleur désactivée** | Opacité 30%, pointeur bloqué |
| **Couleur sélectionnée** | Border 3px, glow effect |
| **Slider 0** | Rouge (mauvais) |
| **Slider 10** | Vert (excellent) |

---

## 📤 Affichage dans ExportMaker

### Rendu Visual Section
```javascript
const renderVisualSection = (layout) => {
  const visual = templateData.visual || {};
  
  return (
    <div className="visual-section">
      {/* Couleurs */}
      {visual.colors && visual.colors.length > 0 && (
        <div className="color-badges">
          {visual.colors.map(color => (
            <span key={color} style={{ background: getColorHex(color) }} />
          ))}
        </div>
      )}
      
      {/* Scores */}
      <ScoreGauge label="Densité" value={visual.density} max={10} />
      <ScoreGauge label="Trichomes" value={visual.trichomes} max={10} />
      <ScoreGauge label="Pistils" value={visual.pistils} max={10} />
      {/* ... */}
    </div>
  );
};
```

---

## ⚠️ Problèmes Connus & Solutions

### 🐛 Bug #1 : Couleurs perdues au reload
**Cause** : `selectedColors` non synchronisé avec `visual.colors`.

**Solution** : Synchronisation bidirectionnelle dans useEffect.

---

## 🧪 Tests

### Test 1 : Roue colorimétrique
1. Cliquer 3 couleurs → Vérifier badges sous roue
2. Cliquer 5ème couleur → Autres désactivées
3. Re-cliquer couleur sélectionnée → Désélection

### Test 2 : Sliders
1. Déplacer slider Trichomes à 8 → Vérifier valeur
2. Sauvegarder → Recharger
3. Vérifier valeur 8 conservée

---

## 📚 Références

- **Component** : `client/src/pages/review/CreateFlowerReview/sections/VisuelTechnique.jsx`
- **ColorWheel** : `client/src/components/ui/ColorWheel.jsx`
- **Flattener** : `client/src/utils/formDataFlattener.js` (lignes 164-184)

---

**Version** : 1.0.0
