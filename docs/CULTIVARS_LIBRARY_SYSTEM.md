# Système de Cultivars Liés et Bibliothèque - Documentation

## 📋 Vue d'ensemble

Implémentation complète d'un système de cultivars liés permettant de :
1. ✅ **Empêcher l'ajout d'étapes pipeline sans cultivars**
2. ✅ **Ajouter des cultivars depuis la bibliothèque personnelle** (reviews Fleur)
3. ✅ **Lier des reviews Fleur comme ingrédients** pour Hash, Concentré, Comestible
4. ✅ **Navigation vers la review d'origine** via bouton stylisé

## 🎯 Objectifs atteints

### 1. Validation Pipeline
- ❌ Impossible d'ajouter une étape si aucun cultivar n'est renseigné
- ⚠️ Message explicatif affiché si tentative d'ajout sans cultivar
- ✅ Bouton "Ajouter une étape" désactivé si liste vide

### 2. Bibliothèque de Cultivars
- 🌿 Modal dédié pour sélectionner des reviews Fleur existantes
- 🔍 Recherche en temps réel (nom, breeder, farm)
- 📊 Affichage des métadonnées (breeder, farm, note)
- ➕ Ajout automatique avec pré-remplissage des champs

### 3. Traçabilité
- 🔗 Lien vers la review d'origine (si ajouté depuis bibliothèque)
- 📝 Conservation de l'ID de review dans les données cultivar
- 🚀 Navigation rapide vers la fiche complète

## 🔧 Composants créés/modifiés

### 1. **CultivarLibraryModal.jsx** (NOUVEAU)

Modal de sélection des cultivars depuis la bibliothèque personnelle.

#### Props
```javascript
{
    isOpen: boolean,        // Contrôle visibilité modal
    onClose: () => void,    // Callback fermeture
    onSelect: (cultivarData) => void  // Callback sélection
}
```

#### Fonctionnalités
- Fetch des reviews type "Fleur" de l'utilisateur
- Recherche instantanée multi-champs
- Affichage stylisé avec badges (breeder, farm, note)
- État de chargement avec spinner
- Gestion des erreurs
- Message si aucune review disponible

#### API utilisée
```javascript
GET /api/reviews/my
// Retourne toutes les reviews de l'utilisateur
// Filtre côté client pour type === 'Fleur'
```

#### Structure de données retournée
```javascript
{
    name: string,        // Nom du cultivar
    farm: string,        // Farm d'origine
    breeder: string,     // Breeder de la graine
    reviewId: number,    // ID de la review liée
    reviewType: 'Fleur'  // Type de review
}
```

### 2. **CultivarList.jsx** (MODIFIÉ)

Liste des cultivars avec ajout manuel ou depuis bibliothèque.

#### Nouvelles fonctionnalités

##### a) Double mode d'ajout
```javascript
// Ajout manuel (existant, amélioré)
addCultivar() {
    const newCultivar = {
        id: Date.now(),
        name: '', farm: '', breeder: '',
        matiere: matiereChoices[0] || '',
        percentage: '',
        reviewId: null,    // Nouveau champ
        reviewType: null   // Nouveau champ
    };
    onChange([...cultivars, newCultivar]);
}

// Ajout depuis bibliothèque (nouveau)
addCultivarFromLibrary(cultivarData) {
    const newCultivar = {
        id: Date.now(),
        name: cultivarData.name,
        farm: cultivarData.farm,
        breeder: cultivarData.breeder,
        matiere: matiereChoices[0] || '',
        percentage: '',
        reviewId: cultivarData.reviewId,      // Pré-rempli
        reviewType: cultivarData.reviewType   // Pré-rempli
    };
    onChange([...cultivars, newCultivar]);
}
```

##### b) Bouton de liaison vers review
```jsx
{cultivar.reviewId && (
    <button
        type="button"
        onClick={() => navigate(`/review/${cultivar.reviewId}`)}
        className="px-3 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg"
        title="Voir la review d'origine"
    >
        <span>🔗</span>
    </button>
)}
```

##### c) Interface double bouton
```jsx
<div className="grid grid-cols-2 gap-3">
    <button onClick={addCultivar}>
        ✏️ Nouveau cultivar
    </button>
    <button onClick={() => setShowLibraryModal(true)}>
        🌿 Depuis bibliothèque
    </button>
</div>
```

#### Structure de données cultivar enrichie
```javascript
{
    id: number,           // Timestamp unique
    name: string,         // Nom du cultivar
    farm: string,         // Farm productrice
    breeder: string,      // Breeder de la graine
    matiere: string,      // Type de matière (Fleurs sèches, etc.)
    percentage: string,   // Pourcentage dans le mix (optionnel)
    reviewId: number | null,     // ID review liée (si depuis bibliothèque)
    reviewType: string | null    // Type de review ('Fleur', etc.)
}
```

### 3. **PipelineWithCultivars.jsx** (MODIFIÉ)

Gestion du pipeline d'extraction/séparation avec validation.

#### Validation des cultivars

```javascript
const hasValidCultivars = cultivarsList && 
                         cultivarsList.length > 0 && 
                         cultivarsList.some(c => c.name && c.name.trim());
```

- Vérifie qu'il y a au moins un cultivar
- Vérifie qu'au moins un cultivar a un nom non vide

#### Message d'avertissement
```jsx
{!hasValidCultivars && (
    <div className="bg-orange-500/10 border border-orange-500/50 rounded-xl p-4">
        <div className="text-3xl mb-2">⚠️</div>
        <p className="text-orange-400 font-medium">
            Veuillez d'abord ajouter au moins un cultivar
        </p>
        <p className="text-orange-300/70 text-sm mt-1">
            Vous devez spécifier les cultivars avant de définir les étapes du pipeline
        </p>
    </div>
)}
```

#### Bouton désactivé
```jsx
<button 
    disabled={!hasValidCultivars}
    className={hasValidCultivars 
        ? 'border-gray-600 hover:border-green-500 cursor-pointer' 
        : 'border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
    }
>
    + Ajouter une étape
</button>
```

## 🧪 Scénarios d'utilisation

### Scénario 1 : Création Hash à partir de Fleurs existantes

1. **Créer une review Fleur "Blue Dream"**
   - Breeder : Barney's Farm
   - Farm : Green Valley
   - Note : 9/10

2. **Créer une review Hash**
   - Section "Cultivars & Pipeline de Séparation"
   - Clic sur "🌿 Depuis bibliothèque"
   - Recherche "Blue Dream"
   - Sélection de la review
   - ✅ Cultivar ajouté avec lien 🔗

3. **Définir le pipeline**
   - Ajouter étape : "Tamisage à l'eau glacée (Bubble Hash)"
   - Sélection cultivar : Blue Dream ✅
   - Mesh : 73-120 µm

4. **Navigation**
   - Clic sur 🔗 à côté de "Blue Dream"
   - → Redirection vers la review Fleur d'origine
   - 📊 Consultation des détails complets

### Scénario 2 : Validation Pipeline sans Cultivar

1. **Créer une review Concentré**
   - Section "Cultivars & Pipeline d'Extraction"
   - Ne pas ajouter de cultivar

2. **Tentative d'ajout d'étape**
   - Bouton "Ajouter une étape" désactivé (grisé) ❌
   - Message d'avertissement affiché ⚠️
   - Impossible de cliquer

3. **Ajout de cultivar**
   - Clic "✏️ Nouveau cultivar"
   - Saisie "OG Kush"
   - ✅ Bouton "Ajouter une étape" activé

### Scénario 3 : Mix de cultivars existants et nouveaux

1. **Review Concentré "Full Spectrum"**
   - Ajouter depuis bibliothèque : "Blue Dream" (avec lien 🔗)
   - Ajouter depuis bibliothèque : "OG Kush" (avec lien 🔗)
   - Ajouter manuellement : "White Widow" (nouveau, sans lien)

2. **Pipeline**
   - Étape 1 : Extraction à l'éthanol (EHO)
     - Cultivars : Blue Dream 🔗, OG Kush 🔗
   - Étape 2 : Distillation
     - Cultivars : White Widow
   - ✅ Purge à vide visible (solvant détecté)

## 📊 Flux de données

### Flux d'ajout depuis bibliothèque

```
User clique "🌿 Depuis bibliothèque"
    ↓
CultivarLibraryModal s'ouvre
    ↓
Fetch /api/reviews/my
    ↓
Filtre type === 'Fleur'
    ↓
Affichage liste + recherche
    ↓
User sélectionne une review
    ↓
onSelect({ name, farm, breeder, reviewId, reviewType })
    ↓
addCultivarFromLibrary(cultivarData)
    ↓
Cultivar ajouté à la liste avec reviewId
    ↓
Bouton 🔗 affiché à côté du nom
```

### Flux de navigation vers review liée

```
User clique sur 🔗
    ↓
navigate(`/review/${cultivar.reviewId}`)
    ↓
ReviewDetailPage charge
    ↓
Fetch /api/reviews/${id}
    ↓
Affichage de la review Fleur complète
```

### Flux de validation pipeline

```
User dans section Pipeline
    ↓
hasValidCultivars calculé
    ↓
cultivarsList.length > 0 ET au moins 1 avec name non vide ?
    ↓ Non                    ↓ Oui
Message warning      Bouton activé
Bouton désactivé    Menu d'étapes accessible
```

## 🎨 Design & UX

### Couleurs et styles

#### Bouton "Nouveau cultivar"
- Icône : ✏️
- Border : `border-gray-600` → `border-green-500` (hover)
- Texte : `text-gray-400` → `text-green-400` (hover)

#### Bouton "Depuis bibliothèque"
- Icône : 🌿
- Border : `border-blue-600/50` → `border-blue-500` (hover)
- Texte : `text-blue-400` → `text-blue-300` (hover)
- Background : `bg-blue-500/5`

#### Bouton lien review (🔗)
- Background : `bg-green-600` → `bg-green-500` (hover)
- Icône : 🔗
- Tooltip : "Voir la review d'origine"

#### Warning pipeline
- Background : `bg-orange-500/10`
- Border : `border-orange-500/50`
- Icône : ⚠️
- Texte : `text-orange-400` (titre), `text-orange-300/70` (détail)

#### Bouton pipeline désactivé
- Border : `border-gray-700` (fixe)
- Texte : `text-gray-600`
- Opacity : `0.5`
- Cursor : `not-allowed`

### Responsive

- Grid 2 colonnes pour boutons ajout : `grid-cols-2`
- Adaptatif cultivar inputs : `grid-cols-1 md:grid-cols-2`
- Modal full viewport mobile : `max-w-3xl` desktop
- Overflow scroll modal : `max-h-[80vh]`

## 🔍 Tests suggérés

### Test 1 : Validation pipeline
- [ ] Créer review Concentré
- [ ] Vérifier bouton pipeline désactivé
- [ ] Vérifier message warning affiché
- [ ] Ajouter cultivar
- [ ] Vérifier bouton pipeline activé
- [ ] Vérifier message warning disparu

### Test 2 : Bibliothèque vide
- [ ] Créer nouveau compte (aucune review)
- [ ] Ouvrir modal bibliothèque
- [ ] Vérifier message "Aucune review de fleur trouvée"

### Test 3 : Navigation lien review
- [ ] Créer review Fleur "Test"
- [ ] Créer review Hash avec cultivar depuis bibliothèque
- [ ] Cliquer sur 🔗
- [ ] Vérifier redirection vers review Fleur

### Test 4 : Recherche bibliothèque
- [ ] Créer 5+ reviews Fleur variées
- [ ] Ouvrir modal bibliothèque
- [ ] Tester recherche par nom
- [ ] Tester recherche par breeder
- [ ] Tester recherche par farm
- [ ] Vérifier filtrage en temps réel

### Test 5 : Mix cultivars
- [ ] Ajouter 2 cultivars depuis bibliothèque
- [ ] Ajouter 1 cultivar manuel
- [ ] Vérifier 2 boutons 🔗 visibles
- [ ] Vérifier 1 cultivar sans bouton
- [ ] Créer pipeline avec les 3

## 📝 Notes techniques

### Persistance des données

Les cultivars sont stockés dans `formData.cultivarsList` avec structure :

```javascript
formData.cultivarsList = [
    {
        id: 1699876543210,
        name: "Blue Dream",
        farm: "Green Valley",
        breeder: "Barney's Farm",
        matiere: "Fleurs sèches",
        percentage: "60%",
        reviewId: 42,          // Lien vers review Fleur
        reviewType: "Fleur"
    },
    {
        id: 1699876543211,
        name: "New Strain",
        farm: "",
        breeder: "",
        matiere: "Fleurs fraîches",
        percentage: "40%",
        reviewId: null,        // Cultivar manuel
        reviewType: null
    }
]
```

### API Reviews

Endpoint utilisé :
```javascript
GET /api/reviews/my
Authorization: Bearer {token}
```

Retourne :
```javascript
[
    {
        id: 42,
        type: "Fleur",
        holderName: "Blue Dream",
        cultivars: "Blue Dream",
        breeder: "Barney's Farm",
        farm: "Green Valley",
        overallRating: 9,
        // ... autres champs
    }
]
```

### Détection cultivar valide

```javascript
const hasValidCultivars = cultivarsList && 
    cultivarsList.length > 0 && 
    cultivarsList.some(c => c.name && c.name.trim());
```

Conditions :
1. `cultivarsList` existe (pas null/undefined)
2. Au moins 1 élément dans le tableau
3. Au moins 1 cultivar avec `name` non vide

## 🚀 Extensions futures possibles

### Court terme
- [ ] Badge visuel "Depuis bibliothèque" sur cultivar lié
- [ ] Tooltip détails au survol du bouton 🔗
- [ ] Prévisualisation image review dans modal bibliothèque
- [ ] Tri bibliothèque (date, note, nom)

### Moyen terme
- [ ] Historique d'utilisation des cultivars
- [ ] Statistiques par cultivar (nb utilisations, notes moyennes)
- [ ] Graph relations cultivar → hash → concentré
- [ ] Export liste cultivars en CSV

### Long terme
- [ ] Système de tags cultivars
- [ ] Comparaison multi-cultivars
- [ ] Recommandations basées sur cultivars utilisés
- [ ] API publique cultivars (avec permissions)

---

**Date de création** : 6 novembre 2025  
**Dernière mise à jour** : 6 novembre 2025  
**Auteur** : GitHub Copilot  
**Version** : 1.0  
**Fichiers concernés** :
- `client/src/components/CultivarLibraryModal.jsx` (NOUVEAU)
- `client/src/components/CultivarList.jsx` (MODIFIÉ)
- `client/src/components/PipelineWithCultivars.jsx` (MODIFIÉ)
