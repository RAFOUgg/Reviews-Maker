import { useState } from 'react'

export default function FilterBar({ reviews, onFilteredChange }) {
    const [filters, setFilters] = useState({
        type: 'all', // all, Fleur, Hash, Concentré, Comestible
        minRating: 0,
        search: '',
        dureeEffet: 'all',
        sortBy: 'date-desc' // date-desc, date-asc, rating-desc, rating-asc, name
    })

    const [showAdvanced, setShowAdvanced] = useState(false)

    const productTypes = ['Fleur', 'Hash', 'Concentré', 'Comestible']
    const dureeOptions = ['5-15min', '15-30min', '30min-1h', '1h-2h', '2h-4h', '4h-8h', '8h+']

    const applyFilters = (newFilters) => {
        setFilters(newFilters)

        let filtered = [...reviews]

        // Filtre par type
        if (newFilters.type !== 'all') {
            filtered = filtered.filter(r => r.type === newFilters.type)
        }

        // Filtre par note minimale
        if (newFilters.minRating > 0) {
            filtered = filtered.filter(r => (r.overallRating || r.note || 0) >= newFilters.minRating)
        }

        // Filtre par recherche texte
        if (newFilters.search.trim()) {
            const searchLower = newFilters.search.toLowerCase()
            filtered = filtered.filter(r =>
                r.holderName?.toLowerCase().includes(searchLower) ||
                r.cultivars?.toLowerCase().includes(searchLower) ||
                r.breeder?.toLowerCase().includes(searchLower) ||
                r.farm?.toLowerCase().includes(searchLower) ||
                r.description?.toLowerCase().includes(searchLower)
            )
        }

        // Filtre par durée effets
        if (newFilters.dureeEffet !== 'all') {
            filtered = filtered.filter(r => r.dureeEffet === newFilters.dureeEffet)
        }

        // Tri
        switch (newFilters.sortBy) {
            case 'date-desc':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                break
            case 'date-asc':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                break
            case 'rating-desc':
                filtered.sort((a, b) => (b.overallRating || b.note || 0) - (a.overallRating || a.note || 0))
                break
            case 'rating-asc':
                filtered.sort((a, b) => (a.overallRating || a.note || 0) - (b.overallRating || b.note || 0))
                break
            case 'name':
                filtered.sort((a, b) => a.holderName.localeCompare(b.holderName))
                break
            default:
                break
        }

        onFilteredChange(filtered)
    }

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        applyFilters(newFilters)
    }

    const resetFilters = () => {
        const defaultFilters = {
            type: 'all',
            minRating: 0,
            search: '',
            dureeEffet: 'all',
            sortBy: 'date-desc'
        }
        applyFilters(defaultFilters)
    }

    const activeFiltersCount =
        (filters.type !== 'all' ? 1 : 0) +
        (filters.minRating > 0 ? 1 : 0) +
        (filters.search.trim() ? 1 : 0) +
        (filters.dureeEffet !== 'all' ? 1 : 0)

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 mb-8">
            {/* Filtres de base */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Recherche */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        🔍 Rechercher
                    </label>
                    <input
                        type="text"
                        placeholder="Nom, cultivar, breeder, farm..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                    />
                </div>

                {/* Type de produit */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        📦 Type
                    </label>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                    >
                        <option value="all">Tous les types</option>
                        {productTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Tri */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        ↕️ Trier par
                    </label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                    >
                        <option value="date-desc">Plus récent</option>
                        <option value="date-asc">Plus ancien</option>
                        <option value="rating-desc">Note (haut → bas)</option>
                        <option value="rating-asc">Note (bas → haut)</option>
                        <option value="name">Nom (A → Z)</option>
                    </select>
                </div>
            </div>

            {/* Toggle filtres avancés */}
            <div className="flex items-center justify-between border-t border-gray-700 pt-4">
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm text-gray-400 hover:text-white flex items-center gap-2"
                >
                    <span>{showAdvanced ? '▼' : '▶'}</span>
                    <span>Filtres avancés</span>
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {activeFiltersCount > 0 && (
                    <button
                        onClick={resetFilters}
                        className="text-sm text-red-400 hover:text-red-300"
                    >
                        ✕ Réinitialiser
                    </button>
                )}
            </div>

            {/* Filtres avancés */}
            {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-700">
                    {/* Note minimale */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            ⭐ Note minimale: {filters.minRating}/10
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="10"
                            step="0.5"
                            value={filters.minRating}
                            onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-1">
                            <span>0</span>
                            <span>5</span>
                            <span>10</span>
                        </div>
                    </div>

                    {/* Durée des effets */}
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            ⏱️ Durée des effets
                        </label>
                        <select
                            value={filters.dureeEffet}
                            onChange={(e) => handleFilterChange('dureeEffet', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-green-500"
                        >
                            <option value="all">Toutes durées</option>
                            {dureeOptions.map(duree => (
                                <option key={duree} value={duree}>{duree}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="mt-4 pt-4 border-t border-gray-700 flex items-center gap-6 text-sm text-gray-400">
                <span>📊 {reviews.length} reviews au total</span>
                {activeFiltersCount > 0 && (
                    <span className="text-green-400">
                        ✓ Filtres actifs
                    </span>
                )}
            </div>
        </div>
    )
}
