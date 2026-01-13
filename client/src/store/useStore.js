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

    // Cache pour éviter les requêtes répétées
    _reviewsCache: {},
    _cacheTimestamp: null,
    _cacheTTL: 5 * 60 * 1000, // 5 minutes

    // Actions - User
    setUser: (user) => set({ user, isAuthenticated: !!user }),

    logout: async () => {
        try {
            await authService.logout()
        } catch (error) {
            // Erreur silencieuse
        }
        set({ user: null, isAuthenticated: false, reviews: [], _reviewsCache: {} })
    },

    checkAuth: async () => {
        try {
            const user = await authService.getMe()
            set({ user, isAuthenticated: true })
            return user
        } catch (error) {
            set({ user: null, isAuthenticated: false })
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
    }
}))