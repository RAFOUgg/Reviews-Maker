import { create } from 'zustand'
import { reviewsService, authService, usersService } from '../services/apiService'

export const useStore = create((set, get) => ({
    // Reviews state
    reviews: [],
    loading: false,
    error: null,

    // Filters state
    filters: {
        search: '',
        type: 'all', // all, Indica, Sativa, Hybride
        sortBy: 'createdAt', // createdAt, note, holderName
        order: 'desc' // asc, desc
    },

    // User state
    user: null,
    isAuthenticated: false,
    accountType: 'consumer', // 'consumer' | 'producer' | 'influencer' | 'admin' (backend keys)

    // Cache pour éviter les requêtes répétées
    _reviewsCache: {},
    _cacheTimestamp: null,
    _cacheTTL: 5 * 60 * 1000, // 5 minutes

    // Actions - User
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    setAccountType: (accountType) => set({ accountType }),

    logout: async () => {
        try {
            await authService.logout()
        } catch (error) {
            // Erreur silencieuse
        }
        set({ user: null, isAuthenticated: false, accountType: 'consumer', reviews: [], _reviewsCache: {} })
    },

    checkAuth: async () => {
        try {
            const user = await authService.getMe()
            // Utiliser directement user.accountType fourni par le backend
            // Le backend calcule déjà le type correct via getUserAccountType()
            const accountType = user?.accountType || 'consumer'
            set({ user, isAuthenticated: true, accountType })
            return user
        } catch (error) {
            set({ user: null, isAuthenticated: false, accountType: 'consumer' })
            return null
        }
    },

    // Actions - Reviews
    setReviews: (reviews) => set({ reviews }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters },
        _reviewsCache: {} // Invalider le cache quand les filtres changent
    })),

    fetchReviews: async (forceRefresh = false) => {
        const state = get()
        const now = Date.now()

        // Vérifier le cache
        if (!forceRefresh && state._cacheTimestamp && (now - state._cacheTimestamp) < state._cacheTTL) {
            // Cache valide
            return state.reviews
        }

        set({ loading: true, error: null })
        try {
            const filters = state.filters
            const data = await reviewsService.getAll({
                type: filters.type !== 'all' ? filters.type : undefined,
                search: filters.search || undefined,
                sortBy: filters.sortBy,
                order: filters.order
            })

            set({
                reviews: data,
                loading: false,
                _cacheTimestamp: now
            })
            return data
        } catch (error) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    fetchMyReviews: async () => {
        set({ loading: true, error: null })
        try {
            const data = await reviewsService.getMy()
            set({ reviews: data, loading: false })
            return data
        } catch (error) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    getReviewById: async (id) => {
        const state = get()

        // Chercher dans le cache local d'abord
        const cached = state.reviews.find(r => r.id === id)
        if (cached) return cached

        try {
            const review = await reviewsService.getById(id)
            return review
        } catch (error) {
            console.error('Error fetching review:', error)
            throw error
        }
    },

    createReview: async (formData) => {
        set({ loading: true, error: null })
        try {
            const review = await reviewsService.create(formData)
            set((state) => ({
                reviews: [review, ...state.reviews],
                loading: false,
                _reviewsCache: {} // Invalider le cache
            }))
            return review
        } catch (error) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    updateReview: async (id, formData) => {
        set({ loading: true, error: null })
        try {
            const updated = await reviewsService.update(id, formData)
            set((state) => ({
                reviews: state.reviews.map(r => r.id === id ? updated : r),
                loading: false,
                _reviewsCache: {} // Invalider le cache
            }))
            return updated
        } catch (error) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    deleteReview: async (id) => {
        set({ loading: true, error: null })
        try {
            await reviewsService.delete(id)
            set((state) => ({
                reviews: state.reviews.filter(r => r.id !== id),
                loading: false,
                _reviewsCache: {} // Invalider le cache
            }))
        } catch (error) {
            set({ error: error.message, loading: false })
            throw error
        }
    },

    likeReview: async (id) => {
        try {
            const result = await reviewsService.like(id)
            set((state) => ({
                reviews: state.reviews.map(r => {
                    if (r.id !== id) return r
                    return {
                        ...r,
                        likesCount: result.action === 'removed'
                            ? r.likesCount - 1
                            : result.action === 'added'
                                ? r.likesCount + 1
                                : r.dislikesCount > 0 && result.action === 'updated'
                                    ? r.likesCount + 1
                                    : r.likesCount,
                        dislikesCount: result.action === 'updated' && r.dislikesCount > 0
                            ? r.dislikesCount - 1
                            : r.dislikesCount,
                        userLikeState: result.action === 'removed' ? null : 'like'
                    }
                })
            }))
            return result
        } catch (error) {
            console.error('Error liking review:', error)
            throw error
        }
    },

    dislikeReview: async (id) => {
        try {
            const result = await reviewsService.dislike(id)
            set((state) => ({
                reviews: state.reviews.map(r => {
                    if (r.id !== id) return r
                    return {
                        ...r,
                        dislikesCount: result.action === 'removed'
                            ? r.dislikesCount - 1
                            : result.action === 'added'
                                ? r.dislikesCount + 1
                                : r.likesCount > 0 && result.action === 'updated'
                                    ? r.dislikesCount + 1
                                    : r.dislikesCount,
                        likesCount: result.action === 'updated' && r.likesCount > 0
                            ? r.likesCount - 1
                            : r.likesCount,
                        userLikeState: result.action === 'removed' ? null : 'dislike'
                    }
                })
            }))
            return result
        } catch (error) {
            console.error('Error disliking review:', error)
            throw error
        }
    }
}))
