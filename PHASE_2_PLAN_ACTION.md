# 🚀 PHASE 2 - Plan d'Action Refactoring Frontend

**Date de début** : Après Phase 1  
**Priorité** : HAUTE  
**Temps estimé** : 4-6 heures

---

## 📋 OVERVIEW

La Phase 1 a refactorisé le backend et créé l'infrastructure frontend (services, store, composants). La Phase 2 se concentre sur la refactorisation des **pages** et l'amélioration de l'**UX globale**.

---

## 🎯 OBJECTIFS PHASE 2

1. ✅ Réduire la taille des pages (HomePage: 591L → ~300L)
2. ✅ Extraire composants réutilisables
3. ✅ Utiliser apiService et store partout
4. ✅ Remplacer alert() par toasts
5. ✅ Ajouter PropTypes
6. ✅ Améliorer accessibilité (ARIA labels)

---

## 📦 FICHIERS À REFACTORISER

### 1. HomePage.jsx (591 lignes) ⚠️ URGENT

**Problèmes** :
- Trop long (591 lignes)
- Logique like/dislike manuelle
- Fetch direct au lieu du store
- alert() au lieu de toasts
- Duplication de code (reviews grid)

**Action Plan** :

#### Étape 1.1 : Extraire HeroSection.jsx (50L)
```jsx
// client/src/components/HeroSection.jsx
export default function HeroSection({ user, isAuthenticated }) {
    return (
        <div className="text-center space-y-6 animate-fade-in">
            {/* Hero content */}
        </div>
    )
}
```

#### Étape 1.2 : Extraire ProductTypeCards.jsx (80L)
```jsx
// client/src/components/ProductTypeCards.jsx
export default function ProductTypeCards({ isAuthenticated, onSelect }) {
    const productTypes = [...]
    
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {productTypes.map(type => (...))}
        </div>
    )
}
```

#### Étape 1.3 : Extraire ReviewsGrid.jsx (150L)
```jsx
// client/src/components/ReviewsGrid.jsx
import ReviewCard from './ReviewCard'
import LoadingSpinner from './LoadingSpinner'
import EmptyState from './EmptyState'

export default function ReviewsGrid({ reviews, loading, onLike, onDislike }) {
    if (loading) return <LoadingSpinner size="lg" message="Chargement..." />
    if (reviews.length === 0) return <EmptyState ... />
    
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map(review => (
                <ReviewCard key={review.id} review={review} ... />
            ))}
        </div>
    )
}
```

#### Étape 1.4 : Refactoriser HomePage.jsx (~250L)
```jsx
// client/src/pages/HomePage.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import HeroSection from '../components/HeroSection'
import ProductTypeCards from '../components/ProductTypeCards'
import FilterBar from '../components/FilterBar'
import ReviewsGrid from '../components/ReviewsGrid'

export default function HomePage() {
    const navigate = useNavigate()
    const toast = useToast()
    const { user, isAuthenticated, reviews, loading, fetchReviews, likeReview, dislikeReview } = useStore()

    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])

    const handleCreateReview = (type) => {
        if (!isAuthenticated) {
            toast.warning('Connectez-vous pour créer une review')
            return
        }
        navigate(`/create?type=${type}`)
    }

    const handleLike = async (reviewId) => {
        if (!isAuthenticated) {
            toast.warning('Connectez-vous pour liker')
            return
        }
        try {
            await likeReview(reviewId)
            toast.success('Review likée !')
        } catch (error) {
            toast.error(error.message)
        }
    }

    // Similar for handleDislike

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
            <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
                <HeroSection user={user} isAuthenticated={isAuthenticated} />
                
                <div className="space-y-6">
                    <ProductTypeCards 
                        isAuthenticated={isAuthenticated} 
                        onSelect={handleCreateReview} 
                    />
                </div>

                <FilterBar reviews={reviews} />
                
                <ReviewsGrid 
                    reviews={reviews} 
                    loading={loading}
                    onLike={handleLike}
                    onDislike={handleDislike}
                />
            </div>
        </div>
    )
}
```

**Résultat attendu** : 591L → ~250L (-58%)

---

### 2. CreateReviewPage.jsx (207 lignes)

**Problèmes** :
- Logique de sections trop couplée
- Pas d'utilisation du store
- alert() au lieu de toasts

**Action Plan** :

#### Étape 2.1 : Extraire SectionNavigator.jsx (40L)
```jsx
// client/src/components/SectionNavigator.jsx
export default function SectionNavigator({ sections, currentIndex, onNavigate }) {
    return (
        <div className="flex gap-2 overflow-x-auto">
            {sections.map((section, idx) => (
                <button
                    key={idx}
                    onClick={() => onNavigate(idx)}
                    className={...}
                >
                    {section.title}
                </button>
            ))}
        </div>
    )
}
```

#### Étape 2.2 : Extraire CategoryRatingSummary.jsx (30L)
```jsx
// client/src/components/CategoryRatingSummary.jsx
export default function CategoryRatingSummary({ ratings }) {
    return (
        <div className="flex items-center gap-4">
            <span>👁️ {ratings.visual.toFixed(1)}</span>
            {/* Other categories */}
        </div>
    )
}
```

#### Étape 2.3 : Refactoriser CreateReviewPage.jsx (~150L)
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import SectionNavigator from '../components/SectionNavigator'
import CategoryRatingSummary from '../components/CategoryRatingSummary'

export default function CreateReviewPage() {
    const navigate = useNavigate()
    const toast = useToast()
    const { isAuthenticated, createReview } = useStore()
    // ... rest of logic

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (images.length === 0) {
            toast.error('Au moins une image est requise')
            return
        }

        const loadingToast = toast.loading('Création...')
        
        try {
            const formData = new FormData()
            // Build formData...
            
            await createReview(formData)
            toast.remove(loadingToast)
            toast.success('Review créée ! ✅')
            navigate('/')
        } catch (error) {
            toast.remove(loadingToast)
            toast.error(error.message)
        }
    }

    // Simplified JSX
}
```

**Résultat attendu** : 207L → ~150L (-28%)

---

### 3. EditReviewPage.jsx

**Action** : Partager la logique avec CreateReviewPage

#### Étape 3.1 : Créer useReviewForm.js hook
```jsx
// client/src/hooks/useReviewForm.js
export function useReviewForm(initialData = null) {
    const [formData, setFormData] = useState(initialData || {})
    const [images, setImages] = useState([])
    
    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }
    
    const handleImageChange = (files) => {
        setImages(prev => [...prev, ...files])
    }
    
    return { formData, images, handleInputChange, handleImageChange }
}
```

#### Étape 3.2 : Utiliser dans CreateReview & EditReview
```jsx
const { formData, images, handleInputChange } = useReviewForm()
```

---

### 4. ReviewCard.jsx

**Action** : Ajouter PropTypes + extraire LikeButton

#### Étape 4.1 : Créer LikeButton.jsx
```jsx
// client/src/components/LikeButton.jsx
export default function LikeButton({ 
    liked, 
    likeCount, 
    dislikeCount, 
    onLike, 
    onDislike 
}) {
    return (
        <div className="flex items-center gap-4">
            <button onClick={onLike} {...}>
                👍 {likeCount}
            </button>
            <button onClick={onDislike} {...}>
                👎 {dislikeCount}
            </button>
        </div>
    )
}
```

#### Étape 4.2 : Ajouter PropTypes
```jsx
import PropTypes from 'prop-types'

ReviewCard.propTypes = {
    review: PropTypes.shape({
        id: PropTypes.string.isRequired,
        holderName: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired,
        note: PropTypes.number,
        mainImageUrl: PropTypes.string,
        // ... other fields
    }).isRequired,
    onLike: PropTypes.func,
    onDislike: PropTypes.func
}
```

---

## 🧪 TESTS À EFFECTUER

### Après chaque refactor
- [ ] Page s'affiche sans erreur
- [ ] Fonctionnalités marchent (create, like, etc.)
- [ ] Pas d'erreurs console
- [ ] PropTypes valident correctement

### Tests globaux
- [ ] npm run build (0 erreurs)
- [ ] Test manuel de toutes les pages
- [ ] Test responsive (mobile/tablet/desktop)
- [ ] Test accessibilité (ARIA labels)

---

## 📊 MÉTRIQUES ATTENDUES

| Page | Avant | Après | Gain |
|------|-------|-------|------|
| HomePage | 591L | ~250L | **-58%** |
| CreateReviewPage | 207L | ~150L | **-28%** |
| EditReviewPage | ~200L | ~100L | **-50%** |
| **Total** | ~1000L | ~500L | **-50%** |

### Composants extraits (nouveaux) :
1. HeroSection.jsx (50L)
2. ProductTypeCards.jsx (80L)
3. ReviewsGrid.jsx (150L)
4. SectionNavigator.jsx (40L)
5. CategoryRatingSummary.jsx (30L)
6. LikeButton.jsx (30L)

**Total nouveaux composants** : ~380L (mais réutilisables !)

---

## ⏱️ TIMELINE

### Jour 1 (2-3h)
- HomePage refactor complet
- Tests HomePage

### Jour 2 (2-3h)
- CreateReviewPage refactor
- EditReviewPage refactor
- Tests CRUD

### Jour 3 (1-2h)
- PropTypes ajout
- Tests accessibilité
- Documentation

**Total** : 5-8 heures

---

## ✅ CHECKLIST AVANT DE COMMENCER

- [x] Phase 1 terminée
- [x] Backend fonctionne
- [x] Store Zustand prêt
- [x] apiService créé
- [x] Composants réutilisables créés
- [ ] Branches git créées (feature/refactor-homepage, etc.)

---

## 🚀 COMMANDES

```bash
# Créer une branche
git checkout -b feature/refactor-homepage

# Démarrer frontend
cd client
npm run dev

# Tester
npm run build

# Commit
git add .
git commit -m "refactor: HomePage extraction components"
git push origin feature/refactor-homepage
```

---

## 📝 NOTES

### Priorités
1. HomePage (plus utilisé, plus gros)
2. CreateReviewPage (critique pour fonctionnalité)
3. EditReviewPage (similaire à Create)
4. PropTypes (dev experience)

### Risques
- ⚠️ Breaking changes possibles → TESTS OBLIGATOIRES
- ⚠️ Props drilling → Utiliser Context si nécessaire
- ⚠️ Performance → React.memo si problème

### Tips
- Un composant = une responsabilité
- Props naming cohérent
- PropTypes systématiques
- Tests après chaque extraction

---

**Prêt à démarrer Phase 2 ?** 🚀  
Commence par HomePage.jsx !
