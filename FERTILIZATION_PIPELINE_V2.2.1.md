# 🌱 Pipeline d'Engraissage - Améliorations v2.2.1

**Date**: 9 Novembre 2025  
**Composant**: `FertilizationPipeline.jsx`  
**Migration DB**: `20251109145633_add_fertilization_pipeline_and_gout_intensity`

---

## 🎯 Changements Implémentés

### **1. Champs de Dose Améliorés**

#### **Avant** (texte libre):
```jsx
<input type="text" placeholder="Ex: 2ml/L, 500g, ..." />
```

#### **Après** (numérique + unité):
```jsx
<input type="number" min="0" step="0.1" placeholder="Quantité" />
<select>
  <option value="ml/L">ml/L</option>
  <option value="g/L">g/L</option>
  <option value="g">g</option>
  <option value="oz">oz</option>
</select>
```

**Stockage**: `"2.5 ml/L"`, `"500 g"`, `"1 oz"`

---

### **2. Fréquence Structurée**

#### **Avant** (texte libre):
```jsx
<input type="text" placeholder="Ex: 1x/sem, tous les 3 jours, ..." />
```

#### **Après** (nombre + boutons temps):
```jsx
<input type="number" min="1" max="10" value="1" />
<span>fois par</span>
<button>sec</button>
<button>jours</button>
<button>sem</button>
<button>mois</button>
```

**Stockage**: `"1x/sem"`, `"3x/jours"`, `"2x/mois"`

**Limites**: 1-10 fois par période

---

### **3. Champs Spécifiques par Type d'Engrais**

#### **A. Solutions nutritives NPK**

**Déclencheur**: Sélection "Solutions nutritives NPK"

**Champs supplémentaires**:
```jsx
<input type="number" min="0" max="99" placeholder="N" />
<input type="number" min="0" max="99" placeholder="P" />
<input type="number" min="0" max="99" placeholder="K" />
```

**Aide contextuelle**: "Format: Azote (N) - Phosphore (P) - Potassium (K)"

**Stockage JSON**:
```json
{
  "id": "1699876543210",
  "name": "Solutions nutritives NPK",
  "npk": "10-5-5",
  "phase": "croissance",
  "dose": "2 ml/L",
  "frequency": "2x/sem"
}
```

**Affichage**: Badge violet `NPK 10-5-5` avec police monospace

---

#### **B. Engrais Commerciaux**

**Déclencheur**: Sélection d'un engrais nécessitant une marque commerciale

**Engrais concernés**:
- Tourteaux de ricin
- Tourteaux de neem
- Guano de chauve-souris
- Émulsion de poisson
- Farines d'os et de sang
- Nitrate de calcium
- Phosphate monopotassique
- Sulfate de magnésium
- Chélates de fer
- Solutions hydroponiques complètes
- Stimulateurs racinaires
- Enzymes digestives
- Trichoderma
- Mycorrhizes
- Acides humiques et fulviques
- Régulateurs de pH
- **+ tous engrais commerciaux ajoutés par l'utilisateur**

**Champ supplémentaire**:
```jsx
<input 
  type="text" 
  placeholder="Ex: BioBizz Grow, Advanced Nutrients..." 
  required 
/>
```

**Stockage JSON**:
```json
{
  "id": "1699876543211",
  "name": "Tourteaux de neem",
  "commercialName": "BioBizz Alg-A-Mic",
  "phase": "floraison",
  "dose": "5 ml/L",
  "frequency": "1x/sem"
}
```

**Affichage**: Badge bleu avec nom commercial

---

#### **C. Engrais Génériques**

**Exemples**:
- Fumiers compostés
- Compost végétal
- Algues marines (kelp)
- Mélasses

**Champs**: Uniquement dose et fréquence (pas de nom commercial ou NPK)

---

## 🎨 Interface Utilisateur

### **Formulaire d'Ajout**

```
┌─────────────────────────────────────────────────────┐
│ 🌱 Ajouter un engrais                               │
├─────────────────────────────────────────────────────┤
│ Phase: [🌿 Croissance ▼]  Type: [Sélectionner ▼]   │
│                                                      │
│ Nom commercial: [BioBizz Grow                    ]  │  (si commercial)
│                                                      │
│ Valeurs NPK:  [10] [5] [5]                          │  (si NPK)
│ Format: Azote (N) - Phosphore (P) - Potassium (K)  │
│                                                      │
│ Dose: [2.5  ] [ml/L ▼]                              │
│                                                      │
│ Fréquence: [2] fois par [sec][jours][sem][mois]    │
│                                                      │
│              [➕ Ajouter à la routine]               │
└─────────────────────────────────────────────────────┘
```

### **Affichage des Étapes**

```
┌─────────────────────────────────────────────────────┐
│ 📋 Routine d'engraissage (3 engrais)               │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1   │ Solutions nutritives NPK                     │
│  🌿  │ [croissance] [NPK 10-5-5]                    │
│      │ 💧 Dose: 2 ml/L    📅 Fréquence: 2x/sem      │
│      │                                         [↑↓✕] │
├─────────────────────────────────────────────────────┤
│  2   │ Tourteaux de neem                            │
│  🌸  │ [floraison] [BioBizz Alg-A-Mic]              │
│      │ 💧 Dose: 5 ml/L    📅 Fréquence: 1x/sem      │
│      │                                         [↑↓✕] │
├─────────────────────────────────────────────────────┤
│  3   │ Mycorrhizes                                  │
│  🔄  │ [tout au long] [Great White Premium]         │
│      │ 💧 Dose: 1 g      📅 Fréquence: 1x/mois     │
│      │                                         [↑↓✕] │
└─────────────────────────────────────────────────────┘
```

**Badges de couleur**:
- **Gris foncé**: Phase (croissance/floraison/tout)
- **Bleu**: Nom commercial
- **Violet**: NPK (police monospace)

---

## 📊 Validation des Données

### **Règles de Validation**

```javascript
const canAddStep = () => {
  // Champs obligatoires de base
  if (!selectedFertilizer || !doseAmount || !frequencyNumber) return false;
  
  // NPK obligatoire si Solutions nutritives NPK
  if (isNPK && (!npk.n || !npk.p || !npk.k)) return false;
  
  // Nom commercial obligatoire si engrais commercial
  if (isCommercial && !commercialName) return false;
  
  return true;
};
```

### **Limites**

| Champ | Min | Max | Type |
|-------|-----|-----|------|
| Dose (quantité) | 0 | ∞ | Float (0.1 step) |
| NPK (N/P/K) | 0 | 99 | Integer |
| Fréquence (nombre) | 1 | 10 | Integer |

---

## 💾 Structure JSON Finale

### **Exemple Complet**

```json
{
  "fertilizationPipeline": [
    {
      "id": "1699876543210",
      "name": "Solutions nutritives NPK",
      "npk": "10-5-5",
      "phase": "croissance",
      "dose": "2 ml/L",
      "frequency": "2x/sem"
    },
    {
      "id": "1699876543211",
      "name": "Tourteaux de neem",
      "commercialName": "BioBizz Alg-A-Mic",
      "phase": "floraison",
      "dose": "5 ml/L",
      "frequency": "1x/sem"
    },
    {
      "id": "1699876543212",
      "name": "Fumiers compostés",
      "phase": "tout",
      "dose": "500 g",
      "frequency": "1x/mois"
    }
  ]
}
```

### **Schéma TypeScript**

```typescript
interface FertilizationStep {
  id: string;                           // Timestamp unique
  name: string;                         // Type d'engrais (du catalogue)
  commercialName?: string;              // Si engrais commercial
  npk?: string;                         // Si Solutions NPK (format "N-P-K")
  phase: 'croissance' | 'floraison' | 'tout';
  dose: string;                         // "X unit" (ex: "2 ml/L")
  frequency: string;                    // "Nx/unit" (ex: "2x/sem")
}
```

---

## 🗄️ Base de Données

### **Migration Prisma**

**Fichier**: `20251109145633_add_fertilization_pipeline_and_gout_intensity`

```sql
-- AlterTable
ALTER TABLE "Review" ADD COLUMN "fertilizationPipeline" TEXT;
ALTER TABLE "Review" ADD COLUMN "goutIntensity" REAL;
```

### **Schéma Prisma**

```prisma
model Review {
  // ... existing fields
  
  // Pipelines
  purificationPipeline  String? // JSON: [{id, name, details}, ...] (Hash & Concentré)
  fertilizationPipeline String? // JSON: [{id, name, phase, dose, frequency, npk?, commercialName?}, ...] (Fleur)
  
  // Comestible
  goutIntensity        Float?  // Intensité gustative (Comestible) /10
  
  // ... rest
}
```

---

## 📝 Exemples d'Utilisation

### **Exemple 1: Culture Bio**

```json
[
  {
    "id": "1",
    "name": "Compost végétal",
    "phase": "tout",
    "dose": "1000 g",
    "frequency": "1x/mois"
  },
  {
    "id": "2",
    "name": "Algues marines (kelp)",
    "phase": "croissance",
    "dose": "2 ml/L",
    "frequency": "2x/sem"
  },
  {
    "id": "3",
    "name": "Guano de chauve-souris",
    "commercialName": "Guanokalong",
    "phase": "floraison",
    "dose": "5 ml/L",
    "frequency": "1x/sem"
  }
]
```

### **Exemple 2: Culture Hydroponique**

```json
[
  {
    "id": "1",
    "name": "Solutions nutritives NPK",
    "npk": "20-10-20",
    "phase": "croissance",
    "dose": "3 ml/L",
    "frequency": "7x/jours"
  },
  {
    "id": "2",
    "name": "Solutions nutritives NPK",
    "npk": "5-15-10",
    "phase": "floraison",
    "dose": "4 ml/L",
    "frequency": "7x/jours"
  },
  {
    "id": "3",
    "name": "Chélates de fer",
    "commercialName": "General Hydroponics Flora Series",
    "phase": "tout",
    "dose": "1 ml/L",
    "frequency": "2x/sem"
  }
]
```

### **Exemple 3: Culture Sol Vivant**

```json
[
  {
    "id": "1",
    "name": "Mycorrhizes",
    "commercialName": "Great White Premium",
    "phase": "tout",
    "dose": "1 g",
    "frequency": "1x/mois"
  },
  {
    "id": "2",
    "name": "Trichoderma",
    "commercialName": "Biotabs Mycotrex",
    "phase": "tout",
    "dose": "0.5 g",
    "frequency": "2x/mois"
  },
  {
    "id": "3",
    "name": "Enzymes digestives",
    "commercialName": "Sensizym",
    "phase": "tout",
    "dose": "2 ml/L",
    "frequency": "1x/sem"
  }
]
```

---

## ✅ Checklist de Validation

### **Tests Manuels à Effectuer**

- [ ] Ajouter engrais organique simple (Compost) sans nom commercial
- [ ] Ajouter Solutions NPK avec valeurs 10-5-5
- [ ] Ajouter engrais commercial (Tourteaux de neem) avec nom "BioBizz"
- [ ] Tester toutes les unités de dose (ml/L, g/L, g, oz)
- [ ] Tester toutes les unités de fréquence (sec, jours, sem, mois)
- [ ] Tester limites min/max (dose ≥0, fréquence 1-10)
- [ ] Réorganiser étapes (↑↓)
- [ ] Supprimer étapes (✕)
- [ ] Sauvegarder review Fleur avec pipeline
- [ ] Vérifier JSON en DB (fertilizationPipeline)
- [ ] Éditer review existante avec pipeline
- [ ] Afficher review sur ReviewDetailPage

---

## 🚀 Prochaines Améliorations Possibles

### **Phase 3 - Fonctionnalités Avancées**

1. **Templates de routine**:
   - Routine "Bio débutant"
   - Routine "Hydro pro"
   - Routine "Sol vivant"
   - Sauvegarde routines personnalisées

2. **Calculateur automatique**:
   - Entrée: volume réservoir (L), nombre de plantes
   - Sortie: quantités exactes par arrosage

3. **Historique et graphiques**:
   - Timeline engraissage par phase
   - Graphique NPK cumulé
   - Coût total routine

4. **Import/Export**:
   - Partage routines entre utilisateurs
   - Export PDF plan d'engraissage
   - Import depuis tableur Excel

5. **Intégration avec bibliothèque**:
   - Lier routine à cultivar spécifique
   - Suggestions basées sur retours communauté
   - Classement routines par résultats

---

## 📚 Documentation Technique

### **Composants Modifiés**

| Fichier | Lignes | Changements |
|---------|--------|-------------|
| `FertilizationPipeline.jsx` | 362 | Refonte complète formulaire + affichage |
| `CreateReviewPage.jsx` | 189 | Import + case 'fertilization-pipeline' |
| `EditReviewPage.jsx` | 628 | Import + case 'fertilization-pipeline' |
| `productStructures.js` | 484 | Section "Plan cultural & Engraissage" |
| `schema.prisma` | 204 | fertilizationPipeline + goutIntensity |

### **Fichiers Créés**

- Migration: `20251109145633_add_fertilization_pipeline_and_gout_intensity/migration.sql`

### **Dépendances**

- **React**: useState, useEffect
- **PropTypes**: Validation types
- **Styling**: TailwindCSS

---

*Document généré automatiquement - 9 Novembre 2025 16:00 UTC*  
*Version: v2.2.1*  
*Auteur: GitHub Copilot*
