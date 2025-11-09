# 🌱 Système de Mélange de Substrat Personnalisé - v2.2.2

**Date**: 9 Novembre 2025  
**Composant**: `SubstratMixer.jsx`  
**Migration DB**: `20251109161437_add_substrat_mix`  
**Champ DB**: `substratMix` (TEXT/JSON)

---

## 🎯 Fonctionnalité

Le **SubstratMixer** permet aux cultivateurs de composer leur propre mélange de substrat en spécifiant :
- **Composants** : Choix parmi 38+ types de substrats
- **Pourcentages** : Répartition précise (total = 100%)
- **Validation** : Vérification automatique du total
- **Réorganisation** : Ordre des composants modifiable

---

## 📊 Catalogue des Composants

### **Terres & Terreaux** (5)
- Terre naturelle
- Terreau enrichi
- Terre de jardin
- Terre argileuse
- Terre sableuse

### **Tourbes & Fibres** (4)
- Tourbe blonde
- Tourbe brune
- Fibre de coco
- Coco chips

### **Minéraux** (7)
- Perlite
- Vermiculite
- Laine de roche
- Pouzzolane
- Billes d'argile (hydroton)
- Ponce volcanique
- Zéolite

### **Organiques** (9)
- Biochar (charbon végétal)
- Compost végétal
- Compost de champignon
- Fumier composté
- Humus de lombric (vermicompost)
- Guano
- Sphaigne
- Écorces compostées
- Copeaux de bois

### **Végétaux** (5)
- Sciure de bois
- Paille
- Chanvre (chènevotte)
- Lin
- Riz (balle de riz)

### **Synthétiques** (2)
- Mousse de polyuréthane
- Laine de verre

### **Autres** (5)
- Sable horticole
- Gravier
- Pierre ponce
- Mica
- Autre (personnalisé)

**Total** : **38 composants disponibles**

---

## 🎨 Interface Utilisateur

### **Formulaire d'Ajout**

```
┌─────────────────────────────────────────────────────┐
│ 🌱 Composer votre substrat                          │
├─────────────────────────────────────────────────────┤
│ Composant: [Fibre de coco                       ▼] │
│                                                      │
│ Pourcentage (50% restant): [50] %                   │
│                                                      │
│              [➕ Ajouter au mélange]                 │
└─────────────────────────────────────────────────────┘
```

### **Affichage du Mélange**

```
┌─────────────────────────────────────────────────────┐
│ 📋 Composition du substrat (3 composants)           │
│ Total: 100% ✓                                       │
├─────────────────────────────────────────────────────┤
│  1   │ Fibre de coco                                │
│      │ [50] %     ██████████████████████▌           │
│      │                                         [↑↓✕] │
├─────────────────────────────────────────────────────┤
│  2   │ Perlite                                      │
│      │ [30] %     █████████████▌                    │
│      │                                         [↑↓✕] │
├─────────────────────────────────────────────────────┤
│  3   │ Humus de lombric                             │
│      │ [20] %     █████████                         │
│      │                                         [↑↓✕] │
└─────────────────────────────────────────────────────┘
│ Progression totale:  [████████████████████████] 100%│
└─────────────────────────────────────────────────────┘
```

---

## 💾 Structure de Données

### **Format JSON**

```json
{
  "substratMix": [
    {
      "id": "1699876543210",
      "substrat": "Fibre de coco",
      "percentage": 50
    },
    {
      "id": "1699876543211",
      "substrat": "Perlite",
      "percentage": 30
    },
    {
      "id": "1699876543212",
      "substrat": "Humus de lombric (vermicompost)",
      "percentage": 20
    }
  ]
}
```

### **Schéma TypeScript**

```typescript
interface SubstratComponent {
  id: string;              // Timestamp unique
  substrat: string;        // Nom du composant (du catalogue)
  percentage: number;      // Pourcentage (1-100)
}

type SubstratMix = SubstratComponent[];
```

---

## ✅ Validation des Données

### **Règles de Validation**

```javascript
const canAddComponent = () => {
  // Composant sélectionné obligatoire
  if (!selectedSubstrat) return false;
  
  // Pourcentage obligatoire et valide
  const pct = parseFloat(percentage);
  if (isNaN(pct) || pct <= 0 || pct > 100) return false;
  
  // Total ne doit pas dépasser 100%
  if (totalPercentage + pct > 100) return false;
  
  return true;
};
```

### **Limites**

| Paramètre | Min | Max | Contrainte |
|-----------|-----|-----|------------|
| Pourcentage (individuel) | 1 | 100 | Integer |
| Total | 0 | 100 | Somme exacte = 100% pour validation ✓ |
| Nombre de composants | 0 | ∞ | Recommandé : 2-5 composants |

---

## 🎯 Fonctionnalités Clés

### **1. Validation en Temps Réel**

- **Pourcentage restant** : Affiché en direct (`100% - total`)
- **Alerte dépassement** : Message rouge si tentative > reste
- **Total visuel** : Couleur badge (vert=100%, jaune<100%, rouge>100%)

### **2. Édition des Composants**

- **Pourcentage modifiable** : Input inline dans la liste
- **Validation automatique** : Refuse valeurs > 100% - autres
- **Recalcul instantané** : Total mis à jour en temps réel

### **3. Réorganisation**

- **Monter (↑)** : Déplace le composant vers le haut
- **Descendre (↓)** : Déplace le composant vers le bas
- **Supprimer (✕)** : Retire le composant du mélange

### **4. Indicateurs Visuels**

#### **Badge Total**

```jsx
{totalPercentage === 100 && ' ✓'}               // Vert si complet
{totalPercentage < 100 && ` (${remain}% restant)`}  // Jaune si incomplet
```

#### **Barres de Progression**

- **Par composant** : Barre verte proportionnelle au %
- **Globale** : Barre en pied de section
  - Verte si 100%
  - Jaune si < 100%
  - Rouge si > 100% (ne devrait jamais arriver)

---

## 📝 Exemples d'Utilisation

### **Exemple 1 : Mélange Bio Classique**

```json
[
  {"id": "1", "substrat": "Terreau enrichi", "percentage": 60},
  {"id": "2", "substrat": "Fibre de coco", "percentage": 20},
  {"id": "3", "substrat": "Perlite", "percentage": 10},
  {"id": "4", "substrat": "Humus de lombric (vermicompost)", "percentage": 10}
]
```

**Total** : 100% ✓  
**Caractéristiques** : Rétention eau (coco), drainage (perlite), nutrition (lombric)

---

### **Exemple 2 : Super Soil (Living Soil)**

```json
[
  {"id": "1", "substrat": "Terre naturelle", "percentage": 40},
  {"id": "2", "substrat": "Compost végétal", "percentage": 30},
  {"id": "3", "substrat": "Humus de lombric (vermicompost)", "percentage": 15},
  {"id": "4", "substrat": "Biochar (charbon végétal)", "percentage": 10},
  {"id": "5", "substrat": "Perlite", "percentage": 5}
]
```

**Total** : 100% ✓  
**Caractéristiques** : Vie microbienne (compost), structure (biochar), aération (perlite)

---

### **Exemple 3 : Hydro-Substrat**

```json
[
  {"id": "1", "substrat": "Fibre de coco", "percentage": 70},
  {"id": "2", "substrat": "Perlite", "percentage": 20},
  {"id": "3", "substrat": "Vermiculite", "percentage": 10}
]
```

**Total** : 100% ✓  
**Caractéristiques** : Inerte (hydro), drainage (perlite), rétention (vermiculite)

---

### **Exemple 4 : Substrat Aérien (Épiphytes)**

```json
[
  {"id": "1", "substrat": "Écorces compostées", "percentage": 50},
  {"id": "2", "substrat": "Sphaigne", "percentage": 30},
  {"id": "3", "substrat": "Charbon végétal", "percentage": 15},
  {"id": "4", "substrat": "Perlite", "percentage": 5}
]
```

**Total** : 100% ✓  
**Caractéristiques** : Très aéré (écorces), rétention (sphaigne), assainissant (charbon)

---

### **Exemple 5 : Sol Minéral (Cactées)**

```json
[
  {"id": "1", "substrat": "Terre sableuse", "percentage": 40},
  {"id": "2", "substrat": "Sable horticole", "percentage": 30},
  {"id": "3", "substrat": "Pouzzolane", "percentage": 20},
  {"id": "4", "substrat": "Perlite", "percentage": 10}
]
```

**Total** : 100% ✓  
**Caractéristiques** : Drainage extrême (sable), minéral (pouzzolane), aération (perlite)

---

## 🔧 Intégration Technique

### **Fichiers Modifiés**

| Fichier | Lignes | Changements |
|---------|--------|-------------|
| `SubstratMixer.jsx` | 312 | **CRÉÉ** - Composant complet avec validation |
| `productStructures.js` | 530 | Catalogue 38 composants + field substrat-mixer |
| `CreateReviewPage.jsx` | 191 | Import SubstratMixer + case handler |
| `EditReviewPage.jsx` | 638 | Import SubstratMixer + case handler |
| `schema.prisma` | 205 | Champ substratMix (TEXT/JSON) |

### **Migration Prisma**

**Fichier** : `20251109161437_add_substrat_mix/migration.sql`

```sql
-- AlterTable
ALTER TABLE "Review" ADD COLUMN "substratMix" TEXT;
```

**Statut** : ✅ Appliquée avec `prisma db push`

### **Dépendances**

- **React** : useState (gestion état formulaire)
- **PropTypes** : Validation types (value, onChange, availableSubstrats)
- **TailwindCSS** : Styling (badges, barres, inputs)

---

## 🧪 Tests Manuels à Effectuer

### **Checklist de Validation**

- [ ] Ajouter composant simple (50%)
- [ ] Vérifier pourcentage restant affiché (50%)
- [ ] Ajouter 2ème composant (30%)
- [ ] Vérifier pourcentage restant mis à jour (20%)
- [ ] Tenter ajouter composant > reste (refus)
- [ ] Compléter à 100% (3ème composant 20%)
- [ ] Vérifier badge vert "100% ✓"
- [ ] Modifier pourcentage existant (input inline)
- [ ] Réorganiser composants (↑↓)
- [ ] Supprimer composant (✕)
- [ ] Vérifier recalcul total après suppression
- [ ] Sauvegarder review Fleur avec substratMix
- [ ] Vérifier JSON en DB (substratMix)
- [ ] Éditer review existante avec substratMix
- [ ] Vérifier barres de progression proportionnelles

---

## 🚀 Prochaines Améliorations

### **Phase 3 - Fonctionnalités Avancées**

1. **Templates de mélanges**
   - Mélange "Bio débutant" (60% terreau, 20% coco, 10% perlite, 10% lombric)
   - Mélange "Hydro pro" (70% coco, 20% perlite, 10% vermiculite)
   - Mélange "Living Soil" (40% terre, 30% compost, 15% lombric, 10% biochar, 5% perlite)
   - Sauvegarde mélanges personnalisés

2. **Calculateur de volumes**
   - Entrée : volume pot (L), nombre de pots
   - Sortie : quantités exactes par composant (L ou kg)
   - Export liste de courses

3. **Propriétés du mélange**
   - Calcul automatique :
     - Rétention d'eau (%)
     - Capacité de drainage (%)
     - Aération (%)
     - pH estimé
     - EC estimé
   - Affichage graphique (radar chart)

4. **Recommandations intelligentes**
   - Suggestions basées sur :
     - Type de culture (Indoor/Outdoor/Hydro)
     - Stade (germination/croissance/floraison)
     - Cultivar (indica/sativa/auto)
   - Alertes (ex: "Mélange trop dense pour hydro")

5. **Historique et comparaison**
   - Mélanges sauvegardés par review
   - Comparaison side-by-side
   - Classement par résultats (notes globales)

6. **Import/Export**
   - Partage mélanges entre utilisateurs
   - Export PDF fiche technique
   - Import depuis tableur Excel/CSV

---

## 📚 Ressources Techniques

### **PropTypes**

```jsx
SubstratMixer.propTypes = {
  value: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      substrat: PropTypes.string.isRequired,
      percentage: PropTypes.number.isRequired
    })
  ),
  onChange: PropTypes.func.isRequired,
  availableSubstrats: PropTypes.arrayOf(PropTypes.string)
};
```

### **Gestion d'État**

```jsx
const [selectedSubstrat, setSelectedSubstrat] = useState('');
const [percentage, setPercentage] = useState('');

const totalPercentage = value.reduce((sum, item) => 
  sum + parseFloat(item.percentage || 0), 0
);

const remainingPercentage = 100 - totalPercentage;
```

### **Handlers**

```javascript
handleAddComponent()       // Ajoute composant à la liste
handleRemove(id)           // Supprime composant par ID
handlePercentageChange()   // Modifie % avec validation
handleMoveUp(index)        // Déplace vers le haut
handleMoveDown(index)      // Déplace vers le bas
canAddComponent()          // Validation avant ajout
```

---

## 🎓 Guide de Dépannage

### **Problème : "Total dépasse 100%"**

**Cause** : Plusieurs composants avec % trop élevés  
**Solution** : Réduire les % existants ou supprimer un composant

### **Problème : "Ne peut pas ajouter composant"**

**Causes possibles** :
1. Composant non sélectionné → Sélectionner dans dropdown
2. Pourcentage vide → Entrer une valeur
3. Pourcentage > reste → Réduire la valeur
4. Pourcentage ≤ 0 → Entrer valeur positive

### **Problème : "Badge ne devient pas vert"**

**Cause** : Total ≠ 100% exactement  
**Solution** : Ajuster % pour atteindre exactement 100.0%

### **Problème : "Modification % refusée"**

**Cause** : Nouveau total dépasserait 100%  
**Solution** : Réduire d'abord les autres composants

---

## 📊 Statistiques

- **Composant** : 312 lignes de code
- **Catalogue** : 38 composants disponibles
- **Validation** : 4 règles automatiques
- **Fonctionnalités** : 7 actions utilisateur
- **Indicateurs visuels** : 5 types (badges, barres, alertes)

---

*Document généré automatiquement - 9 Novembre 2025 16:15 UTC*  
*Version: v2.2.2*  
*Auteur: GitHub Copilot*
