# Section Génétiques & PhenoHunt - Documentation Technique

**Chemin** : `client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx`  
**Type de Compte** : **Producteur uniquement** 🔒  
**Dernière Mise à Jour** : 2026-04-01

---

## 📋 Vue d'Ensemble

Section permettant de documenter les génétiques d'un cultivar et de gérer des projets PhenoHunt (sélection phénotypique).

### Capture d'écran
![Génétiques & PhenoHunt](./assets/genetics-phenohunt-modal.png)

---

## 🎯 Fonctionnalités

### 1. **Arbre Généalogique**

#### Interface Canvas
- **Drag & drop** de cultivars depuis bibliothèque
- **Création de relations** parent → enfant
- **Visualisation graphique** de la lignée
- **Export PNG** de l'arbre

#### Modal "Gestion de l'Arbre Généalogique"
3 options proposées :

| Option | Description | Action |
|--------|-------------|--------|
| **Créer un arbre vide** | Nouvel arbre depuis zéro | Ouvre canvas vide |
| **Créer à partir de cette fleur** | Utilise cultivar actuel | Pré-remplit canvas |
| **Importer à un arbre** | Ajoute à arbre existant | Ouvre sélecteur |

---

### 2. **Informations Génétiques**

```javascript
genetics: {
  breeder: 'Cookies Fam',
  variety: 'Gelato 41',
  geneticType: 'hybrid-indica',
  indicaPercent: 60,
  sativaPercent: 40,
  parentage: 'Sunset Sherbet x Thin Mint Cookies',
  phenotypeCode: 'G41-PHENO-A',
  treeId: 'uuid-arbre-genealogique'
}
```

**Champs** :
- Breeder (sélecteur)
- Variety (texte)
- Type génétique (indica/sativa/hybrid)
- Pourcentages Indica/Sativa (sliders liés, total=100%)
- Généalogie (texte libre)
- Code phénotype (pour PhenoHunt)
- ID arbre généalogique (lien vers canvas)

---

### 3. **Projets PhenoHunt**

#### Canvas de Sélection
Interface permettant de :
- **Créer projet PhenoHunt** avec X graines
- **Nominer cultivars** (A, B, C...)
- **Tracker évolution** de chaque phéno
- **Sélectionner gagnant** → Créer cultivar final

#### Structure Projet
```javascript
phenohuntProject: {
  id: 'uuid-project',
  name: 'Gelato Hunt 2025',
  seedCount: 10,
  phenotypes: [
    { id: 'A', name: 'Pheno A', selected: false, notes: '...' },
    { id: 'B', name: 'Pheno B', selected: true, notes: 'Vainqueur' },
    // ...
  ],
  finalCultivar: 'Gelato 41 - Pheno B'
}
```

---

## 🔧 Implémentation Technique

### Props
```javascript
<Genetiques
  formData={formData}
  handleChange={handleChange}
  canAccessGeneticsCanvas={canAccessGeneticsCanvas}
/>
```

### Structure formData
```javascript
{
  genetics: {
    breeder: 'Cookies Fam',
    variety: 'Gelato 41',
    geneticType: 'hybrid-indica',
    indicaPercent: 60,
    sativaPercent: 40,
    parentage: 'Sunset Sherbet x Thin Mint Cookies',
    phenotypeCode: 'G41-PHENO-A',
    treeId: 'uuid-tree-123'
  },
  geneticTreeId: 'uuid-tree-123'  // Top-level aussi
}
```

---

### Sauvegarde Backend
```javascript
// Dans flattenFlowerFormData()
if (data.genetics) {
  if (data.genetics.breeder) flat.breeder = data.genetics.breeder
  if (data.genetics.variety) flat.variety = data.genetics.variety
  if (data.genetics.geneticType) flat.geneticType = data.genetics.geneticType
  if (data.genetics.indicaPercent !== undefined) flat.indicaPercent = data.genetics.indicaPercent
  if (data.genetics.sativaPercent !== undefined) flat.sativaPercent = data.genetics.sativaPercent
  if (data.genetics.parentage) flat.parentage = data.genetics.parentage
  if (data.genetics.phenotypeCode) flat.phenotypeCode = data.genetics.phenotypeCode
  if (data.genetics.treeId) flat.geneticTreeId = data.genetics.treeId
}
// Top-level geneticTreeId (set directly via Genetiques section handleChange)
if (data.geneticTreeId !== undefined && !flat.geneticTreeId) {
  flat.geneticTreeId = data.geneticTreeId || null
}
```

**Colonnes DB** :
- `breeder` : TEXT
- `variety` : TEXT
- `geneticType` : TEXT
- `indicaPercent` : INTEGER
- `sativaPercent` : INTEGER
- `parentage` : TEXT
- `phenotypeCode` : TEXT
- `geneticTreeId` : TEXT (UUID)

---

## 🎨 UI/UX

### Modal Layout
```
┌──────────────────────────────────────────────┐
│ 🧬 Gestion de l'Arbre Généalogique           │
├──────────────────────────────────────────────┤
│ Comment souhaitez-vous procéder ?            │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ ➕ Créer un arbre vide                   │ │
│ │ Commencez un nouvel arbre depuis zéro    │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ 🔗 Créer à partir de cette fleur         │ │
│ │ Utilisez cette fiche comme point départ  │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│ ┌──────────────────────────────────────────┐ │
│ │ ⬆️ Importer cette fleur à un arbre       │ │
│ │ Ajoutez cette fiche à un arbre existant  │ │
│ └──────────────────────────────────────────┘ │
│                                              │
│              [Annuler]                       │
└──────────────────────────────────────────────┘
```

---

## 📤 Affichage dans ExportMaker

### Rendu Genetics Section
```javascript
const renderGeneticsSection = () => {
  const genetics = templateData.genetics || {};
  
  if (!genetics.variety) return null;
  
  return (
    <div className="genetics-section">
      <h3>🧬 Génétiques</h3>
      <p><strong>Variety:</strong> {genetics.variety}</p>
      {genetics.breeder && <p><strong>Breeder:</strong> {genetics.breeder}</p>}
      {genetics.geneticType && (
        <p><strong>Type:</strong> 
          {genetics.indicaPercent}% Indica / {genetics.sativaPercent}% Sativa
        </p>
      )}
      {genetics.parentage && <p><strong>Parentage:</strong> {genetics.parentage}</p>}
    </div>
  );
};
```

---

## ⚠️ Limitations

### Accès Réservé
- **Amateur** : Section masquée ❌
- **Influenceur** : Section masquée ❌
- **Producteur** : Accès complet ✅

### Permissions
```javascript
const { canAccessGeneticsCanvas } = useAccountFeatures();

{canAccessGeneticsCanvas && (
  <Genetiques formData={formData} handleChange={handleChange} />
)}
```

---

## 🧪 Tests

### Test 1 : Modal arbre généalogique
1. Cliquer bouton "Gérer Arbre Généalogique"
2. Vérifier modal s'ouvre avec 3 options
3. Cliquer "Créer arbre vide" → Canvas s'ouvre

### Test 2 : Sliders Indica/Sativa
1. Déplacer slider Indica à 70%
2. Vérifier slider Sativa passe à 30% automatiquement
3. Total = 100% toujours

### Test 3 : Sauvegarde
1. Remplir breeder, variety, parentage
2. Sauvegarder brouillon
3. Recharger → Vérifier données présentes

---

## 📚 Références

- **Component** : `client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx`
- **Genetics Canvas** : `client/src/components/genetics/UnifiedGeneticsCanvas.jsx`
- **PhenoHunt** : `client/src/pages/PhenoHuntPage.jsx`
- **Flattener** : `client/src/utils/formDataFlattener.js` (lignes 109-120)

---

**Version** : 1.0.0
