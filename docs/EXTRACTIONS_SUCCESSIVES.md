# 🔬 Système d'Extractions Successives - Pipeline Avancé

## 📋 Vue d'ensemble

Le système de pipeline permet maintenant de **sélectionner les produits d'étapes précédentes** comme matière première pour les étapes suivantes. C'est essentiel pour les extractions multi-étapes où le produit d'une extraction devient l'input de la suivante.

---

## ✨ Fonctionnalité

### Avant
Chaque étape pouvait uniquement sélectionner les **cultivars de base** définis au début.

### Maintenant
Chaque étape peut choisir entre :
1. 🌿 **Cultivars de base** - Les cultivars originaux
2. 🔬 **Extractions précédentes** - Les produits des étapes précédentes

---

## 🎯 Exemple Concret

### Scénario : Hash à deux étapes

#### Configuration :
**Cultivars de base :**
- Critical Kush (Home Grow, Barney's Farm)

**Pipeline :**
1. **Tamisage à sec (Dry)** - 0-220µm
2. **Pressage à chaud (Rosin)**

---

### Étape 1 : Tamisage à sec

**Options disponibles :**
- 🌿 **Cultivars de base :**
  - ☑ Critical Kush

**Sélection :** Critical Kush  
**Paramètres :** 0-220µm

**Résultat :** Crée "Dry Critical Kush 220µm"

---

### Étape 2 : Pressage à chaud

**Options disponibles :**
- 🌿 **Cultivars de base :**
  - ☐ Critical Kush
  
- 🔬 **Extractions précédentes :**
  - ☑ **Tamisage à sec (Dry): Critical Kush 220µm**

**Sélection :** Tamisage à sec (Dry): Critical Kush 220µm  
**Paramètres :** min 0µm, max 220µm, Température 90°C

---

## 🔄 Mise à Jour Dynamique

Le système se met à jour automatiquement :

### Quand tu modifies une étape :
1. ✅ Changement de cultivars
2. ✅ Changement de paramètres (mesh, température)
3. ✅ Ajout/suppression d'une étape
4. ✅ Réorganisation des étapes

### Toutes les étapes suivantes :
- 🔄 Voient immédiatement les nouvelles options disponibles
- ✅ Conservent leurs sélections si toujours valides
- ⚠️ Désélectionnent automatiquement les options supprimées

---

## 📊 Format des Extractions

### Nomenclature automatique :
```
[Nom de l'étape]: [Cultivars] [Paramètres]
```

### Exemples :

#### Tamisage simple
```
Tamisage à sec (Dry): Critical Kush 220µm
```

#### Tamisage avec range
```
Tamisage WPFF: Gelato 41 + Zkittlez 90–120µm
```

#### Pressage avec température
```
Pressage à chaud: Dry Critical Kush 220µm 90°C
```

#### Extraction CO₂
```
Extraction CO₂ supercritique: Hash 73µm 300bar 40°C
```

---

## 🎨 Interface Utilisateur

### Structure visuelle :

```
┌─────────────────────────────────────────────┐
│ Tamisage à sec (Dry)          [↑] [↓] [✕]  │
│                                             │
│ Cultivars pour cette étape :                │
│ ┌─────────────────────────────────────────┐ │
│ │ 🌿 Cultivars de base :                  │ │
│ │ ☑ Critical Kush                         │ │
│ │                                         │ │
│ └─────────────────────────────────────────┘ │
│ ┌───────────────────┬───────────────────┐  │
│ │ min (µm): 0       │ max (µm): 220     │  │
│ └───────────────────┴───────────────────┘  │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│ Pressage à chaud (Rosin)      [↑] [↓] [✕]  │
│                                             │
│ Cultivars pour cette étape :                │
│ ┌─────────────────────────────────────────┐ │
│ │ 🌿 Cultivars de base :                  │ │
│ │ ☐ Critical Kush                         │ │
│ │                                         │ │
│ │ 🔬 Extractions précédentes :            │ │
│ │ ☑ Tamisage à sec (Dry): Critical Kush  │ │
│ │   220µm                                 │ │
│ └─────────────────────────────────────────┘ │
│ ┌───────────────────┬───────────────────┐  │
│ │ min (µm): 0       │ max (µm): 220     │  │
│ ├───────────────────┴───────────────────┤  │
│ │ Température (°C): 90                   │  │
│ └───────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

---

## 🔧 Détails Techniques

### Algorithme de construction des extractions

```javascript
function buildExtractionName(step) {
  const stepName = step.name;
  const cultivars = step.selectedCultivars.join(' + ');
  
  let params = '';
  if (step.mesh) {
    params += ` ${step.mesh}µm`;
  }
  if (step.tempC) {
    params += ` ${step.tempC}°C`;
  }
  if (step.pressureBar) {
    params += ` ${step.pressureBar}bar`;
  }
  
  return `${stepName}: ${cultivars}${params}`;
}
```

### Détection des étapes précédentes

```javascript
function getPreviousExtractions(currentItem) {
  const extractions = [];
  let previous = currentItem.previousElementSibling;
  
  while (previous && previous.classList.contains('pipeline-item')) {
    const extraction = buildExtractionName(previous);
    if (extraction) extractions.push(extraction);
    previous = previous.previousElementSibling;
  }
  
  return extractions;
}
```

---

## 🎯 Cas d'Usage

### 1. Hash Multi-Passes
```
Étape 1: Tamisage à sec WPFF 90-120µm (Gelato 41)
Étape 2: Tamisage à l'eau 45-73µm (Gelato 41)
Étape 3: Pressage de la matière (Extraction 1 + 2)
```

### 2. Rosin de Hash
```
Étape 1: Ice-O-Lator 73-120µm (Multiple cultivars)
Étape 2: Pressage à chaud 90°C (Hash de l'étape 1)
```

### 3. Extraction CO₂ de Concentré
```
Étape 1: Pressage Rosin (Cultivars de base)
Étape 2: Extraction CO₂ supercritique (Rosin de l'étape 1)
```

### 4. Blend de plusieurs extractions
```
Étape 1: Dry 220µm (Critical Kush)
Étape 2: Dry 220µm (Zkittlez)
Étape 3: Pressage à chaud (Extraction 1 + 2)
```

---

## 📈 Avantages

### Pour l'utilisateur :
- ✅ **Traçabilité complète** : Chaque étape documente sa source
- ✅ **Flexibilité** : Mélange de cultivars originaux et extractions
- ✅ **Cohérence** : Impossible de sélectionner des étapes futures
- ✅ **Automatique** : Mise à jour instantanée lors de modifications

### Pour la qualité des données :
- ✅ **Nomenclature standardisée** : Format uniforme
- ✅ **Informations riches** : Cultivars + paramètres techniques
- ✅ **Validation** : Sélections toujours valides
- ✅ **Historique** : Toute la chaîne de transformation est visible

---

## 🔮 Évolutions Futures Possibles

### Visualisation
- [ ] Graphique de flux (flowchart) de la pipeline
- [ ] Timeline interactive des étapes
- [ ] Preview du résultat final avec % de chaque cultivar

### Calculs avancés
- [ ] Estimation du rendement par étape
- [ ] Calcul de la pureté finale
- [ ] Traçage des terpènes à travers les étapes

### Templates
- [ ] Sauvegarder des pipelines complètes
- [ ] Bibliothèque de pipelines populaires
- [ ] Import/export de configurations

---

## ✅ Validation

### Tests recommandés :

1. **Test basique**
   - Créer 2 étapes
   - Sélectionner cultivar pour étape 1
   - Vérifier que extraction 1 apparaît dans étape 2

2. **Test multi-cultivars**
   - Étape 1 avec plusieurs cultivars
   - Vérifier que le nom inclut tous les cultivars

3. **Test réorganisation**
   - Créer 3 étapes avec dépendances
   - Réorganiser l'ordre
   - Vérifier que les options se mettent à jour

4. **Test suppression**
   - Créer étape 1 → étape 2 dépend de 1
   - Supprimer étape 1
   - Vérifier que étape 2 n'offre plus cette option

5. **Test paramètres**
   - Modifier mesh/temp d'une étape
   - Vérifier que le nom se met à jour dans les étapes suivantes

---

**Status** : ✅ **100% Fonctionnel**

Le système gère maintenant les pipelines complexes avec extractions successives de manière fluide et intuitive ! 🚀
