# 🚀 Guide Rapide - Système de Filtrage Avancé

## 📖 Pour les Utilisateurs

### Comment utiliser la recherche intelligente ?

#### 1. Recherche de Base
Tapez simplement ce que vous cherchez dans la barre de recherche :
- Un **nom** : "Blue Dream", "Gorilla Glue"
- Un **cultivar** : "OG Kush", "Jack Herer"
- Un **breeder** : "DNA Genetics", "Barney's Farm"
- Une **farm** : "La Fonce Dalle", "Green House"

#### 2. Autocomplétion
Après avoir tapé **2 caractères**, des suggestions apparaissent automatiquement :
- Utilisez les **flèches ↑↓** pour naviguer
- Appuyez sur **Enter** pour sélectionner
- **Escape** pour fermer les suggestions
- **Cliquez** sur une suggestion pour l'appliquer

#### 3. Filtres Avancés
Cliquez sur **"▶ Filtres avancés"** pour accéder à plus d'options :

**Pour les Fleurs 🌸**
- Type de culture (Indoor, Outdoor, etc.)
- Substrat (Terre, Coco, Hydro, etc.)
- Lignée génétique (Kush, Haze, Skunk, etc.)

**Pour Hash/Concentrés 🧊💎**
- Méthode d'extraction (BHO, Rosin, Ice Water, etc.)
- Texture (Shatter, Budder, Crumble, etc.)

**Pour Comestibles 🍪**
- Ingrédients (plus de 100 options !)
- Recherchez par beurre, chocolat, farine, etc.

#### 4. Combinaisons Puissantes
Combinez plusieurs filtres pour des résultats ultra-précis :

**Exemple 1** : Trouver des Fleurs Kush Indoor notées 8+
1. Recherche : `"kush"`
2. Type : `Fleur`
3. Note minimale : `8`
4. Filtres avancés → Type culture : `Indoor`

**Exemple 2** : Trouver des Rosins de qualité
1. Type : `Concentré`
2. Filtres avancés → Extraction : `Pressage à chaud (Rosin)`
3. Note minimale : `7`

**Exemple 3** : Brownies au chocolat
1. Recherche : `"brownie"` ou `"chocolat"`
2. Type : `Comestible`
3. Filtres avancés → Ingrédient : `Chocolat noir`

### 💡 Astuces Pro

#### Recherche Multi-Termes
Vous pouvez chercher plusieurs mots :
- `"og indoor"` → Trouve toutes les OG cultivées en indoor
- `"rosin hash"` → Trouve les hash extraits par pressage
- `"beurre cookies"` → Trouve les cookies au beurre

#### Compteur de Filtres Actifs
Un badge montre le nombre de filtres actifs :
- **1 filtre** = recherche simple
- **3+ filtres** = recherche très précise
- Cliquez sur **"✕ Réinitialiser"** pour tout effacer

#### Tri des Résultats
Organisez vos résultats par :
- **Plus récent** : dernières reviews d'abord
- **Plus ancien** : reviews historiques
- **Note (haut → bas)** : meilleures d'abord
- **Note (bas → haut)** : moins bonnes d'abord
- **Nom (A → Z)** : ordre alphabétique

---

## 👨‍💻 Pour les Développeurs

### Intégration Rapide

```jsx
import FilterBar from '../components/FilterBar'

function MyPage() {
  const [reviews, setReviews] = useState([])
  const [filtered, setFiltered] = useState([])

  return (
    <FilterBar 
      reviews={reviews}
      onFilteredChange={setFiltered}
    />
  )
}
```

### Utilisation Avancée

```jsx
import { 
  buildSearchIndex,
  fastSearch,
  applyMultipleFilters,
  sortReviews
} from '../utils/filterHelpers'

// Créer l'index
const searchIndex = useMemo(() => 
  buildSearchIndex(reviews), 
  [reviews]
)

// Recherche rapide
const results = fastSearch('kush', searchIndex, reviews)

// Filtrage multiple
const filtered = applyMultipleFilters(reviews, {
  type: 'Fleur',
  minRating: 8,
  typeCulture: 'Indoor'
})

// Tri
const sorted = sortReviews(filtered, 'rating-desc')
```

### Personnalisation

#### Ajouter un nouveau filtre

1. **Modifier l'état dans FilterBar.jsx** :
```jsx
const [filters, setFilters] = useState({
  // ... existants
  nouveauFiltre: 'all'
})
```

2. **Ajouter la logique de filtrage** :
```jsx
if (newFilters.nouveauFiltre !== 'all') {
  filtered = filtered.filter(r => 
    r.nouveauFiltre === newFilters.nouveauFiltre
  )
}
```

3. **Ajouter l'interface utilisateur** :
```jsx
<select
  value={filters.nouveauFiltre}
  onChange={(e) => handleFilterChange('nouveauFiltre', e.target.value)}
  className="..."
>
  <option value="all">Tous</option>
  {options.map(opt => (
    <option key={opt} value={opt}>{opt}</option>
  ))}
</select>
```

#### Ajouter un champ à l'index de recherche

Modifier `extractSearchableTerms()` dans `filterHelpers.js` :

```javascript
export const extractSearchableTerms = (review) => {
  const terms = new Set()
  
  // Champs existants...
  
  // Nouveau champ
  if (review.nouveauChamp) {
    terms.add(review.nouveauChamp.toLowerCase())
  }
  
  return terms
}
```

### Performance

#### Optimisation de l'index
```jsx
// ✅ BON - useMemo évite recalcul inutile
const searchIndex = useMemo(() => 
  buildSearchIndex(reviews), 
  [reviews]
)

// ❌ MAUVAIS - recalcul à chaque render
const searchIndex = buildSearchIndex(reviews)
```

#### Debouncing de la recherche (optionnel)
```jsx
const [searchTerm, setSearchTerm] = useState('')
const debouncedSearch = useDebounce(searchTerm, 300)

useEffect(() => {
  const results = fastSearch(debouncedSearch, index, reviews)
  setFiltered(results)
}, [debouncedSearch])
```

---

## 🧪 Tests

### Test Manuel

1. **Ouvrir la démo** : `demo-filtrage-avance.html`
2. **Tester l'autocomplétion** :
   - Taper "ku" → doit suggérer "kush"
   - Taper "in" → doit suggérer "indoor", "ingredients", etc.
3. **Tester les filtres** :
   - Sélectionner type "Fleur" → les filtres culture apparaissent
   - Sélectionner type "Hash" → les filtres extraction apparaissent
4. **Tester les combinaisons** :
   - Recherche + Type + Note minimale + Filtre avancé

### Test avec données réelles

```javascript
// Créer des reviews de test
const testReviews = [
  {
    id: '1',
    holderName: 'OG Kush',
    type: 'Fleur',
    typeCulture: 'Indoor',
    substrat: ['Living Soil'],
    landrace: 'OG',
    overallRating: 9,
    cultivars: 'OG Kush',
    breeder: 'DNA Genetics'
  },
  {
    id: '2',
    holderName: 'Rosin Premium',
    type: 'Concentré',
    extractionMethod: 'Pressage à chaud (Rosin)',
    texture: 'Budder',
    overallRating: 8.5
  },
  // ... plus de reviews
]

// Tester l'index
const index = buildSearchIndex(testReviews)
console.log('Termes indexés:', Array.from(index.keys()))

// Tester la recherche
const results = fastSearch('og', index, testReviews)
console.log('Résultats pour "og":', results.length)
```

---

## 🐛 Dépannage

### Problème : L'autocomplétion ne s'affiche pas

**Solutions** :
1. Vérifier que `searchIndex` est bien construit
2. Taper au moins 2 caractères
3. Vérifier que les reviews ont des données

### Problème : Les filtres avancés ne s'affichent pas

**Solutions** :
1. Cliquer sur "▶ Filtres avancés"
2. Vérifier que le composant `FilterBar` a `reviews` en props
3. Vérifier l'import de `productStructures.js`

### Problème : La recherche est lente

**Solutions** :
1. Vérifier l'utilisation de `useMemo` pour l'index
2. Limiter le nombre de suggestions (déjà limité à 8)
3. Implémenter un debouncing (voir section Performance)

### Problème : Certains termes ne sont pas trouvés

**Solutions** :
1. Vérifier que le champ est dans `extractSearchableTerms()`
2. Vérifier que les données de la review contiennent le champ
3. Tester avec `console.log(extractSearchableTerms(review))`

---

## 📚 Ressources

### Fichiers Principaux
- `client/src/components/FilterBar.jsx` - Composant principal
- `client/src/components/AdvancedSearchBar.jsx` - Barre de recherche
- `client/src/utils/filterHelpers.js` - Fonctions utilitaires
- `client/src/utils/productStructures.js` - Catalogues de données

### Documentation
- `SYSTEME_FILTRAGE_AVANCE.md` - Documentation complète
- `demo-filtrage-avance.html` - Démonstration visuelle
- Ce fichier - Guide rapide

### Support
Pour toute question ou problème :
1. Consulter la documentation complète
2. Vérifier les exemples dans la démo
3. Tester avec les données de test

---

## 🎉 Conclusion

Le système de filtrage avancé rend Reviews Maker **ultra-puissant** pour :
- 🔍 **Trouver rapidement** n'importe quelle review
- 🎯 **Filtrer précisément** par 10+ critères
- ⚡ **Performance optimale** même avec des milliers de reviews
- 🎨 **UX moderne** avec autocomplétion et feedback visuel

**Bon usage !** 🌿

---

*Guide créé le 9 novembre 2025*
