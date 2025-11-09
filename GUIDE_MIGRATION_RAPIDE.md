# 🚀 Guide de Migration Rapide - Corrections Critiques

Ce guide vous permet d'appliquer les corrections de sécurité et robustesse **en 30 minutes**.

---

## ⚡ ÉTAPE 1 : Vérifier les nouveaux fichiers (2 min)

Les fichiers suivants ont été créés et sont prêts à l'emploi :

```bash
server-new/
  utils/
    ✅ validation.js       # Validation centralisée
    ✅ errorHandler.js     # Gestion d'erreurs
    ✅ reviewFormatter.js  # Formatage DRY
```

**Action** : Vérifier qu'ils sont présents et sans erreurs de syntaxe.

---

## ⚡ ÉTAPE 2 : Finaliser routes/reviews.js (15 min)

### 2.1 Remplacer la route PUT (Update Review)

**Fichier** : `server-new/routes/reviews.js` ligne ~220

**AVANT** (long et répétitif) :
```javascript
router.put('/:id', requireAuth, upload.array('images', 10), async (req, res) => {
    try {
        const review = await prisma.review.findUnique({ where: { id: req.params.id } })
        if (!review) {
            return res.status(404).json({ error: 'Review not found' })
        }
        if (review.authorId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' })
        }
        // ... 150 lignes de code ...
    } catch (error) {
        console.error('Error updating review:', error)
        res.status(500).json({ error: 'Failed to update review' })
    }
})
```

**APRÈS** (concis et robuste) :
```javascript
router.put('/:id', requireAuth, upload.array('images', 10), asyncHandler(async (req, res) => {
    // Valider l'ID
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }
    
    // Récupérer et vérifier ownership
    const review = await prisma.review.findUnique({ where: { id: req.params.id } })
    if (!review) throw Errors.REVIEW_NOT_FOUND()
    requireOwnershipOrThrow(review.authorId, req, 'review')
    
    // Valider les nouvelles données
    const validation = validateReviewData(req.body)
    if (!validation.valid) throw Errors.VALIDATION_ERROR(validation.errors)
    
    // Gérer les images
    const newImageFiles = req.files?.map(f => f.filename) || []
    const keepImages = extractImageFilenames(
        req.body.existingImages ? JSON.parse(req.body.existingImages) : []
    )
    const allImages = [...keepImages, ...newImageFiles]
    
    // Supprimer les images retirées
    const oldImages = review.images ? JSON.parse(review.images) : []
    const imagesToDelete = oldImages.filter(img => !allImages.includes(img))
    for (const image of imagesToDelete) {
        try {
            await fs.unlink(path.join(__dirname, '../../db/review_images', image))
        } catch (err) {
            console.error(`Failed to delete image ${image}:`, err)
        }
    }
    
    // Update en base
    const updated = await prisma.review.update({
        where: { id: req.params.id },
        data: prepareReviewData({
            ...validation.cleaned,
            images: allImages,
            mainImage: allImages[0] || null
        }),
        include: {
            author: {
                select: { id: true, username: true, avatar: true, discordId: true }
            }
        }
    })
    
    res.json(formatReview(updated, req.user))
}))
```

---

### 2.2 Remplacer la route DELETE

**AVANT** :
```javascript
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const review = await prisma.review.findUnique({ where: { id: req.params.id } })
        if (!review) return res.status(404).json({ error: 'Review not found' })
        if (review.authorId !== req.user.id) return res.status(403).json({ error: 'Access denied' })
        // ...
    } catch (error) {
        // ...
    }
})
```

**APRÈS** :
```javascript
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }
    
    const review = await prisma.review.findUnique({ where: { id: req.params.id } })
    if (!review) throw Errors.REVIEW_NOT_FOUND()
    requireOwnershipOrThrow(review.authorId, req, 'review')
    
    // Supprimer les images
    if (review.images) {
        const images = JSON.parse(review.images)
        for (const image of images) {
            try {
                await fs.unlink(path.join(__dirname, '../../db/review_images', image))
            } catch (err) {
                console.error(`Failed to delete image ${image}:`, err)
            }
        }
    }
    
    await prisma.review.delete({ where: { id: req.params.id } })
    
    res.json({ success: true, message: 'Review deleted successfully' })
}))
```

---

### 2.3 Remplacer PATCH /visibility

**APRÈS** :
```javascript
router.patch('/:id/visibility', requireAuth, asyncHandler(async (req, res) => {
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }
    
    const { isPublic } = req.body
    if (typeof isPublic !== 'boolean') {
        throw Errors.INVALID_FIELD('isPublic', 'Must be a boolean')
    }
    
    const review = await prisma.review.findUnique({ where: { id: req.params.id } })
    if (!review) throw Errors.REVIEW_NOT_FOUND()
    requireOwnershipOrThrow(review.authorId, req, 'review')
    
    const updated = await prisma.review.update({
        where: { id: req.params.id },
        data: { isPublic }
    })
    
    res.json(formatReview(updated, req.user))
}))
```

---

### 2.4 Remplacer POST /like et /dislike

**APRÈS (like)** :
```javascript
router.post('/:id/like', requireAuth, asyncHandler(async (req, res) => {
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }
    
    const { id } = req.params
    const userId = req.user.id
    
    // Vérifier que la review existe
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw Errors.REVIEW_NOT_FOUND()
    
    // Gérer le like/unlike
    const existingLike = await prisma.reviewLike.findUnique({
        where: { reviewId_userId: { reviewId: id, userId } }
    })
    
    if (existingLike) {
        if (existingLike.isLike) {
            // Retirer le like
            await prisma.reviewLike.delete({
                where: { reviewId_userId: { reviewId: id, userId } }
            })
            return res.json({ action: 'removed', type: 'like' })
        } else {
            // Changer dislike en like
            await prisma.reviewLike.update({
                where: { reviewId_userId: { reviewId: id, userId } },
                data: { isLike: true }
            })
            return res.json({ action: 'updated', type: 'like' })
        }
    } else {
        // Nouveau like
        await prisma.reviewLike.create({
            data: { reviewId: id, userId, isLike: true }
        })
        return res.json({ action: 'added', type: 'like' })
    }
}))

// Dislike : même logique avec isLike: false
router.post('/:id/dislike', requireAuth, asyncHandler(async (req, res) => {
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }
    
    const { id } = req.params
    const userId = req.user.id
    
    const review = await prisma.review.findUnique({ where: { id } })
    if (!review) throw Errors.REVIEW_NOT_FOUND()
    
    const existingLike = await prisma.reviewLike.findUnique({
        where: { reviewId_userId: { reviewId: id, userId } }
    })
    
    if (existingLike) {
        if (!existingLike.isLike) {
            await prisma.reviewLike.delete({
                where: { reviewId_userId: { reviewId: id, userId } }
            })
            return res.json({ action: 'removed', type: 'dislike' })
        } else {
            await prisma.reviewLike.update({
                where: { reviewId_userId: { reviewId: id, userId } },
                data: { isLike: false }
            })
            return res.json({ action: 'updated', type: 'dislike' })
        }
    } else {
        await prisma.reviewLike.create({
            data: { reviewId: id, userId, isLike: false }
        })
        return res.json({ action: 'added', type: 'dislike' })
    }
}))
```

---

### 2.5 Remplacer GET /likes

**APRÈS** :
```javascript
router.get('/:id/likes', asyncHandler(async (req, res) => {
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid review ID format')
    }
    
    const { id } = req.params
    
    const [likes, dislikes, userLike] = await Promise.all([
        prisma.reviewLike.count({ where: { reviewId: id, isLike: true } }),
        prisma.reviewLike.count({ where: { reviewId: id, isLike: false } }),
        req.isAuthenticated()
            ? prisma.reviewLike.findUnique({
                where: { reviewId_userId: { reviewId: id, userId: req.user.id } }
            })
            : null
    ])
    
    const userLikeState = userLike ? (userLike.isLike ? 'like' : 'dislike') : null
    
    res.json({ likes, dislikes, userLikeState })
}))
```

---

## ⚡ ÉTAPE 3 : Mettre à jour server.js (5 min)

**Fichier** : `server-new/server.js`

**Ajouter à la fin (avant `app.listen`)** :

```javascript
// Import du gestionnaire d'erreurs
import { errorHandler, notFoundHandler } from './utils/errorHandler.js'

// ... toutes les routes existantes ...

// ✅ AJOUTER ces 2 lignes AVANT app.listen()
app.use(notFoundHandler)  // Gère les routes non trouvées
app.use(errorHandler)     // Gère toutes les erreurs
```

**Résultat** :
```javascript
// Routes
app.use('/api/auth', authRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/users', userRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// ✅ NOUVEAU : Gestion d'erreurs centralisée
app.use(notFoundHandler)
app.use(errorHandler)

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Shutting down gracefully...')
    await prisma.$disconnect()
    process.exit(0)
})

app.listen(PORT, '0.0.0.0', () => {
    // ...
})
```

---

## ⚡ ÉTAPE 4 : Corriger routes/auth.js et routes/users.js (5 min)

### 4.1 auth.js

**Ajouter en haut** :
```javascript
import { asyncHandler, Errors } from '../utils/errorHandler.js'
```

**Remplacer GET /me** :
```javascript
router.get('/me', asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
        throw Errors.UNAUTHORIZED()
    }
    
    const user = {
        id: req.user.id,
        discordId: req.user.discordId,
        username: req.user.username,
        discriminator: req.user.discriminator,
        avatar: req.user.avatar
            ? `https://cdn.discordapp.com/avatars/${req.user.discordId}/${req.user.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${parseInt(req.user.discriminator || '0') % 5}.png`,
        email: req.user.email
    }
    
    res.json(user)
}))
```

**Remplacer POST /logout** :
```javascript
router.post('/logout', asyncHandler(async (req, res) => {
    if (!req.isAuthenticated()) {
        throw Errors.UNAUTHORIZED()
    }
    
    await new Promise((resolve, reject) => {
        req.logout((err) => {
            if (err) return reject(err)
            req.session.destroy((err) => {
                if (err) return reject(err)
                res.clearCookie('connect.sid')
                resolve()
            })
        })
    })
    
    res.json({ success: true, message: 'Logged out successfully' })
}))
```

---

### 4.2 users.js

**Ajouter en haut** :
```javascript
import { asyncHandler, Errors, requireAuthOrThrow } from '../utils/errorHandler.js'
import { formatReviews } from '../utils/reviewFormatter.js'
import { validateReviewId } from '../utils/validation.js'
```

**Remplacer toutes les routes** avec `asyncHandler` et validation :

```javascript
router.get('/me/reviews', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    
    const reviews = await prisma.review.findMany({
        where: { authorId: req.user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { id: true, username: true, avatar: true, discordId: true } }
        }
    })
    
    res.json(formatReviews(reviews, req.user))
}))

router.get('/me/stats', asyncHandler(async (req, res) => {
    requireAuthOrThrow(req)
    
    const [totalReviews, reviews] = await Promise.all([
        prisma.review.count({ where: { authorId: req.user.id } }),
        prisma.review.findMany({
            where: { authorId: req.user.id, note: { not: null } },
            select: { note: true, type: true }
        })
    ])
    
    const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + (r.note || 0), 0) / reviews.length
        : 0
    
    const typeBreakdown = reviews.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1
        return acc
    }, {})
    
    res.json({
        totalReviews,
        avgRating: Math.round(avgRating * 10) / 10,
        typeBreakdown,
        memberSince: req.user.createdAt
    })
}))

router.get('/:id/profile', asyncHandler(async (req, res) => {
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid user ID format')
    }
    
    const user = await prisma.user.findUnique({
        where: { id: req.params.id },
        select: {
            id: true,
            username: true,
            avatar: true,
            discordId: true,
            createdAt: true
        }
    })
    
    if (!user) throw Errors.USER_NOT_FOUND()
    
    const publicReviews = await prisma.review.count({
        where: { authorId: req.params.id, isPublic: true }
    })
    
    res.json({
        id: user.id,
        username: user.username,
        avatar: user.avatar
            ? `https://cdn.discordapp.com/avatars/${user.discordId}/${user.avatar}.png`
            : `https://cdn.discordapp.com/embed/avatars/${Math.floor(Math.random() * 5)}.png`,
        memberSince: user.createdAt,
        totalReviews: publicReviews
    })
}))

router.get('/:id/reviews', asyncHandler(async (req, res) => {
    if (!validateReviewId(req.params.id)) {
        throw Errors.INVALID_FIELD('id', 'Invalid user ID format')
    }
    
    const reviews = await prisma.review.findMany({
        where: { authorId: req.params.id, isPublic: true },
        orderBy: { createdAt: 'desc' },
        include: {
            author: { select: { id: true, username: true, avatar: true, discordId: true } }
        }
    })
    
    res.json(formatReviews(reviews, req.user))
}))
```

---

## ⚡ ÉTAPE 5 : Tester (3 min)

### 5.1 Redémarrer le serveur

```powershell
cd server-new
npm start
```

**Vérifier les logs** :
- ✅ Pas d'erreur de syntaxe
- ✅ Serveur démarre sur le port 3000

---

### 5.2 Tester les endpoints

```powershell
# Health check
curl http://localhost:3000/api/health

# Liste des reviews (devrait marcher)
curl http://localhost:3000/api/reviews

# Review inexistante (devrait retourner erreur formatée)
curl http://localhost:3000/api/reviews/invalid-id

# Me (sans auth, devrait retourner 401 propre)
curl http://localhost:3000/api/auth/me
```

**Réponses attendues** :
```json
// Invalid ID
{
  "error": "invalid_field",
  "message": "Invalid field 'id': Invalid review ID format"
}

// Not authenticated
{
  "error": "unauthorized",
  "message": "Authentication required"
}

// Not found
{
  "error": "review_not_found",
  "message": "Review not found"
}
```

---

## ✅ VALIDATION FINALE

Checklist rapide :

- [ ] Serveur démarre sans erreur
- [ ] GET `/api/reviews` fonctionne
- [ ] GET `/api/reviews/:id` invalide retourne erreur formatée
- [ ] POST `/api/reviews` sans auth retourne 401
- [ ] DELETE review d'un autre user retourne 403
- [ ] Erreurs ont un format cohérent `{ error: 'code', message: '...' }`

---

## 🎉 TERMINÉ !

Vous avez maintenant :
- ✅ Validation centralisée des données
- ✅ Gestion d'erreurs robuste et cohérente
- ✅ Code DRY (moins de duplication)
- ✅ Messages d'erreur clairs
- ✅ Meilleure sécurité (validation des IDs, ownership, etc.)

**Prochaine étape** : Implémenter le reste de la checklist (tests, rate limiting, logging) selon le rapport d'audit complet.

---

## 🆘 ROLLBACK SI PROBLÈME

Si quelque chose ne fonctionne pas :

1. **Annuler les modifications** :
```bash
git checkout server-new/routes/reviews.js
git checkout server-new/routes/auth.js
git checkout server-new/routes/users.js
git checkout server-new/server.js
```

2. **Garder les nouveaux utilitaires** :
```bash
# Ne PAS supprimer ces fichiers, ils sont sûrs
server-new/utils/validation.js
server-new/utils/errorHandler.js
server-new/utils/reviewFormatter.js
```

3. **Appliquer les corrections une par une** en testant entre chaque.
