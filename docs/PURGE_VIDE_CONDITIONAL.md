# Purge à vide conditionnelle - Documentation

## 📋 Vue d'ensemble

La checkbox "Purge à vide" n'apparaît désormais **uniquement** lorsque le pipeline d'extraction contient **au moins une étape utilisant un solvant autre que l'eau**.

## 🎯 Objectif

Éviter d'afficher des options non pertinentes pour les extractions sans solvants (rosin, pressage à froid, etc.), tout en gardant cette option visible pour les extractions à base de solvants (BHO, EHO, etc.).

## 🔧 Implémentation technique

### 1. **PipelineWithCultivars.jsx**

#### Détection des solvants

```javascript
const isSolventStep = (name) => {
    const n = (name || '').toLowerCase();
    return /éthanol|eth|eho|isopropyl|ipa|acétone|aho|butane|bho|isobutane|iho|propane|pho|hexane|hho|huile.*végétal|coco|olive/.test(n);
};
```

**Solvants détectés :**
- Éthanol (EHO)
- Alcool isopropylique (IPA)
- Acétone (AHO)
- Butane (BHO)
- Isobutane (IHO)
- Propane (PHO)
- Hexane (HHO)
- Huiles végétales (coco, olive)

**Non détectés (aqueux ou sans solvants) :**
- Extraction à l'eau (bubble hash, ice hash, etc.)
- Rosin / Pressage à chaud
- Pressage à froid
- CO₂ supercritique
- Ultrasons
- Micro-ondes
- Tensioactifs

#### Notification au parent

```javascript
const hasSolventSteps = (steps) => steps.some(step => isSolventStep(step.name));

useEffect(() => {
    if (onSolventDetected) {
        onSolventDetected(hasSolventSteps(pipeline));
    }
}, [pipeline, onSolventDetected]);
```

- Vérifie **au chargement initial** et **à chaque modification du pipeline**
- Notifie le composant parent via le callback `onSolventDetected`

### 2. **CreateReviewPage.jsx**

#### État local

```javascript
const [hasSolvents, setHasSolvents] = useState(false);
```

#### Passage du callback

```javascript
case 'pipeline-with-cultivars': 
    const cultivarsListData = formData[field.cultivarsSource] || []; 
    return <PipelineWithCultivars 
        value={value} 
        onChange={(v) => handleInputChange(field.key, v)} 
        choices={field.choices || []} 
        cultivarsList={cultivarsListData} 
        onSolventDetected={setHasSolvents} 
    />;
```

#### Affichage conditionnel

```javascript
case 'checkbox': 
    // Ne pas afficher "Purge à vide" si pas de solvants
    if (field.key === 'purgevide' && !hasSolvents) return null;
    return <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={!!value} ... />
        <span className="text-gray-300">{field.label}</span>
    </label>;
```

### 3. **productStructures.js**

La structure reste inchangée, la checkbox est toujours définie :

```javascript
{ key: "purgevide", label: "Purge à vide", type: "checkbox" }
```

Mais elle ne s'affiche que si `hasSolvents === true`.

## 🧪 Scénarios de test

### ✅ Cas où "Purge à vide" **DOIT apparaître**

1. **Extraction à l'éthanol (EHO)**
   - Ajouter étape : "Extraction à l'éthanol (EHO)"
   - → Checkbox visible ✅

2. **Extraction au butane (BHO)**
   - Ajouter étape : "Extraction au butane (BHO)"
   - → Checkbox visible ✅

3. **Mix : Rosin + Éthanol**
   - Ajouter étape : "Pressage à chaud (Rosin)"
   - Ajouter étape : "Extraction à l'éthanol (EHO)"
   - → Checkbox visible ✅ (car au moins 1 solvant)

### ❌ Cas où "Purge à vide" **NE DOIT PAS apparaître**

1. **Rosin uniquement**
   - Ajouter étape : "Pressage à chaud (Rosin)"
   - → Checkbox masquée ❌

2. **Ice Hash uniquement**
   - Ajouter étape : "Tamisage à l'eau glacée (Bubble Hash)"
   - → Checkbox masquée ❌

3. **CO₂ supercritique**
   - Ajouter étape : "Extraction au CO₂ supercritique"
   - → Checkbox masquée ❌

4. **Pipeline vide**
   - Aucune étape ajoutée
   - → Checkbox masquée ❌

### 🔄 Cas de suppression

1. **Ajouter BHO (checkbox visible) → Supprimer BHO**
   - Ajouter étape : "Extraction au butane (BHO)"
   - → Checkbox visible ✅
   - Supprimer l'étape BHO
   - → Checkbox disparaît ❌

## 📊 Flux de données

```
Pipeline modifié
    ↓
hasSolventSteps(pipeline) vérifie chaque étape
    ↓
onSolventDetected(true/false) appelé
    ↓
setHasSolvents(true/false) met à jour l'état
    ↓
renderField('checkbox') vérifie hasSolvents
    ↓
Affiche ou masque la checkbox
```

## 🎨 Comportement utilisateur

### Expérience fluide

1. **Au chargement** : checkbox masquée par défaut
2. **Ajout d'un solvant** : checkbox apparaît instantanément
3. **Suppression du dernier solvant** : checkbox disparaît instantanément
4. **Mix méthodes** : checkbox reste visible tant qu'il reste au moins 1 solvant

### Pas de perte de données

Si l'utilisateur :
1. Ajoute une étape BHO
2. Coche "Purge à vide"
3. Supprime l'étape BHO

→ La valeur `formData.purgevide` reste `true` dans l'état (mais n'est pas visible)
→ Si l'utilisateur ré-ajoute un solvant, la checkbox réapparaît avec la valeur précédente

## 🔍 Debug

Pour vérifier si la détection fonctionne :

```javascript
// Dans PipelineWithCultivars.jsx
console.log('Pipeline:', pipeline);
console.log('Has solvents:', hasSolventSteps(pipeline));

// Dans CreateReviewPage.jsx
console.log('hasSolvents state:', hasSolvents);
```

## 📝 Notes importantes

1. **CO₂ supercritique** n'est PAS considéré comme un solvant au sens de "purge à vide" car il s'évapore naturellement
2. **Huiles végétales** sont détectées comme solvants (extraction FECO, RSO, etc.)
3. **Eau** (bubble hash, ice hash) n'est PAS un solvant pour cette logique
4. La regex est **case-insensitive** pour éviter les problèmes de casse

## 🚀 Extensions futures possibles

- Ajouter d'autres solvants si nécessaire (DME, toluène, etc.)
- Ajouter un hint/tooltip expliquant pourquoi la purge à vide est nécessaire
- Validation : empêcher la soumission si purge à vide non cochée pour certains solvants critiques

---

**Date de création** : 6 novembre 2025  
**Dernière mise à jour** : 6 novembre 2025  
**Auteur** : GitHub Copilot  
**Version** : 1.0
