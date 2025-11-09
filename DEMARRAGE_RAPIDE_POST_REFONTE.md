# ⚡ DÉMARRAGE RAPIDE - Reviews-Maker (Post-Refonte)

## 🎯 TL;DR

✅ **Phase 1 TERMINÉE** (9 Nov 2025)
- Backend 100% refactorisé (-27% lignes, +100% validation)
- Service API centralisé créé
- Store Zustand optimisé (cache 5min)
- 5 composants réutilisables
- ErrorBoundary global

## 🚀 Démarrer l'app

```bash
# Terminal 1 : Backend
cd server-new
npm start
# → http://localhost:3000

# Terminal 2 : Frontend
cd client
npm run dev
# → http://localhost:5173
```

## 📁 Nouveaux fichiers (Phase 1)

### Backend
- `utils/validation.js` - Validation centralisée
- `utils/errorHandler.js` - asyncHandler + Errors
- `utils/reviewFormatter.js` - Formatage DRY

### Frontend
- `services/apiService.js` - API centralisée
- `components/LoadingSpinner.jsx`
- `components/ErrorBoundary.jsx`
- `components/ErrorMessage.jsx`
- `components/ConfirmDialog.jsx`
- `components/EmptyState.jsx`

## 🔧 Utilisation

### Backend (asyncHandler pattern)
```javascript
// routes/example.js
import { asyncHandler, Errors } from '../utils/errorHandler.js'
import { validateReviewId } from '../utils/validation.js'
import { formatReview } from '../utils/reviewFormatter.js'

router.get('/:id', asyncHandler(async (req, res) => {
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid format')
    }
    
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw Errors.REVIEW_NOT_FOUND()
    
    res.json(formatReview(review, req.user))
}))
```

### Frontend (apiService + store)
```javascript
// pages/ExamplePage.jsx
import { useStore } from '../store/useStore'
import { useToast } from '../components/ToastContainer'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorMessage from '../components/ErrorMessage'

export default function ExamplePage() {
    const toast = useToast()
    const { reviews, loading, error, fetchReviews, likeReview } = useStore()
    
    useEffect(() => {
        fetchReviews()
    }, [fetchReviews])
    
    const handleLike = async (id) => {
        try {
            await likeReview(id)
            toast.success('Liké !')
        } catch (error) {
            toast.error(error.message)
        }
    }
    
    if (loading) return <LoadingSpinner size="lg" message="Chargement..." />
    if (error) return <ErrorMessage error={error} onRetry={fetchReviews} />
    
    return <div>...</div>
}
```

## 📚 Documentation

- `REFONTE_STRUCTURELLE_2025-11-09.md` - Rapport technique complet
- `RESUME_EXECUTIF_REFONTE.md` - Résumé exécutif
- `PHASE_2_PLAN_ACTION.md` - Plan pour refactoriser les pages
- `CHANGELOG.md` - Toutes les modifications

## 📋 Prochaines étapes (Phase 2)

1. **HomePage** (591L → 250L) - Extraire HeroSection, ProductTypeCards, ReviewsGrid
2. **CreateReviewPage** (207L → 150L) - Extraire SectionNavigator, CategoryRatingSummary
3. **PropTypes** - Ajouter à tous les composants
4. **Tests** - Tests unitaires backend + composants React

## ✅ Checklist validation

- [x] Backend démarre sans erreur
- [x] 0 erreur compilation (backend + frontend)
- [x] Documentation à jour
- [ ] Frontend démarre et fonctionne
- [ ] Tests manuels CRUD
- [ ] Tests like/dislike

## 🐛 Troubleshooting

### Backend ne démarre pas
```bash
cd server-new
rm -rf node_modules
npm install
npm start
```

### Frontend erreurs de build
```bash
cd client
rm -rf node_modules dist
npm install
npm run dev
```

### Erreur "Cannot find module"
- Vérifier les imports (chemins absolus vs relatifs)
- Vérifier node_modules installé

### Cache problèmes
```bash
# Invalider cache store
localStorage.clear()
# ou dans le code :
useStore.getState()._cacheTimestamp = null
```

## 💡 Tips

- Toujours utiliser `asyncHandler` pour les routes
- Toujours valider les inputs avec `validation.js`
- Toujours formatter les reviews avec `reviewFormatter.js`
- Utiliser le store pour fetch, pas fetch direct
- Utiliser toast au lieu de alert()
- Utiliser LoadingSpinner/EmptyState/ErrorMessage

## 📞 Besoin d'aide ?

1. Lire la doc technique (`REFONTE_STRUCTURELLE_2025-11-09.md`)
2. Vérifier CHANGELOG.md
3. Consulter les exemples dans les fichiers créés
4. Regarder comment c'est fait dans routes/reviews.js

---

**Status** : ✅ PRODUCTION-READY (après tests)  
**Version** : Post-Refonte Phase 1  
**Date** : 9 novembre 2025
