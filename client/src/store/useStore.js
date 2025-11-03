import { create } from 'zustand'

export const useStore = create((set) => ({
    // Reviews state
    reviews: [],
    loading: false,
    error: null,

    // Filters state
    filters: {
        search: '',
        type: 'all', // all, Indica, Sativa, Hybride
        sortBy: 'date', // date, rating, name
    },

    // User state
    user: null,
    isAuthenticated: false,

    // Actions
    setReviews: (reviews) => set({ reviews }),
    setLoading: (loading) => set({ loading }),
    setError: (error) => set({ error }),
    setFilters: (filters) => set((state) => ({ filters: { ...state.filters, ...filters } })),
    setUser: (user) => set({ user, isAuthenticated: !!user }),
    logout: () => set({ user: null, isAuthenticated: false }),

    // Fetch reviews
    fetchReviews: async () => {
        set({ loading: true, error: null })
        try {
            const response = await fetch('/api/reviews')
            if (!response.ok) throw new Error('Failed to fetch reviews')
            const data = await response.json()
            set({ reviews: data, loading: false })
        } catch (error) {
            set({ error: error.message, loading: false })
        }
    },
}))
