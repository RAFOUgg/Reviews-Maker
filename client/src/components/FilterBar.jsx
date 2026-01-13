import { useState, useMemo } from 'react'
import { choiceCatalog } from '../utils/productStructures'
import { buildSearchIndex } from '../utils/filterHelpers'
import AdvancedSearchBar from './AdvancedSearchBar'

export default function FilterBar({ reviews, onFilteredChange }) {
    const [filters, setFilters] = useState({
        type: 'all', // all, Fleur, Hash, Concentré, Comestible
        minRating: 0,
        search: '',
        dureeEffet: 'all',
        sortBy: 'date-desc', // date-desc, date-asc, rating-desc, rating-asc, name
        // Filtres avancés
        typeCulture: 'all',
        extraction: 'all',
        texture: 'all',
        landrace: 'all',
        substrat: 'all',
        ingredient: 'all'
    })

    const [showAdvanced, setShowAdvanced] = useState(false)

    const productTypes = ['Fleur', 'Hash', 'Concentré', 'Comestible']
    const dureeOptions = choiceCatalog.dureeEffet || ['5-15min', '15-30min', '30min-1h', '1h-2h', '2h-4h', '4h-8h', '8h+']

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

        // Filtre par recherche texte (recherche avancée sur tous les champs)
        if (newFilters.search.trim()) {
            const searchLower = newFilters.search.toLowerCase()
            filtered = filtered.filter(r => {
                // Recherche de base
                const basicMatch =
                    r.holderName?.toLowerCase().includes(searchLower) ||
                    r.cultivars?.toLowerCase().includes(searchLower) ||
                    r.breeder?.toLowerCase().includes(searchLower) ||
                    r.farm?.toLowerCase().includes(searchLower) ||
                    r.description?.toLowerCase().includes(searchLower)

                // Recherche dans les données structurées
                const structuredMatch =
                    // Culture
                    r.typeCulture?.toLowerCase().includes(searchLower) ||
                    r.substrat?.some?.(s => s.toLowerCase().includes(searchLower)) ||
                    r.breeder?.toLowerCase().includes(searchLower) ||
                    // Extraction
                    r.extractionMethod?.toLowerCase().includes(searchLower) ||
                    r.texture?.toLowerCase().includes(searchLower) ||
                    // Comestibles
                    r.ingredients?.some?.(i => i.toLowerCase().includes(searchLower)) ||
                    r.recette?.toLowerCase().includes(searchLower) ||
                    // Génétique
                    r.landrace?.toLowerCase().includes(searchLower)

                return basicMatch || structuredMatch
            })
        }

        // Filtre par durée effets
        if (newFilters.dureeEffet !== 'all') {
            filtered = filtered.filter(r => r.dureeEffet === newFilters.dureeEffet)
        }

        // Filtres avancés - Type de culture
        if (newFilters.typeCulture !== 'all') {
            filtered = filtered.filter(r => r.typeCulture === newFilters.typeCulture)
        }

        // Filtres avancés - Extraction
        if (newFilters.extraction !== 'all') {
            filtered = filtered.filter(r =>
                r.extractionMethod?.includes(newFilters.extraction) ||
                r.extractionSolvant === newFilters.extraction ||
                r.separationMethod?.includes(newFilters.extraction)
            )
        }

        // Filtres avancés - Texture
        if (newFilters.texture !== 'all') {
            filtered = filtered.filter(r => r.texture === newFilters.texture)
        }

        // Filtres avancés - Landrace
        if (newFilters.landrace !== 'all') {
            filtered = filtered.filter(r => r.landrace === newFilters.landrace)
        }

        // Filtres avancés - Substrat
        if (newFilters.substrat !== 'all') {
            filtered = filtered.filter(r =>
                r.substrat?.includes(newFilters.substrat) ||
                r.substratsSystemes?.includes(newFilters.substrat)
            )
        }

        // Filtres avancés - Ingrédient (pour comestibles)
        if (newFilters.ingredient !== 'all') {
            filtered = filtered.filter(r =>
                r.ingredients?.includes(newFilters.ingredient)
            )
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
            sortBy: 'date-desc',
            typeCulture: 'all',
            extraction: 'all',
            texture: 'all',
            landrace: 'all',
            substrat: 'all',
            ingredient: 'all'
        }
        applyFilters(defaultFilters)
    }

    const activeFiltersCount =
        (filters.type !== 'all' ? 1 : 0) +
        (filters.minRating > 0 ? 1 : 0) +
        (filters.search.trim() ? 1 : 0) +
        (filters.dureeEffet !== 'all' ? 1 : 0) +
        (filters.typeCulture !== 'all' ? 1 : 0) +
        (filters.extraction !== 'all' ? 1 : 0) +
        (filters.texture !== 'all' ? 1 : 0) +
        (filters.landrace !== 'all' ? 1 : 0) +
        (filters.substrat !== 'all' ? 1 : 0) +
        (filters.ingredient !== 'all' ? 1 : 0)

    // Obtenir les options dynamiques basées sur le type sélectionné
    const getAdvancedFilterOptions = () => {
        const type = filters.type
        const options = {
            typeCulture: choiceCatalog.typesCulture || [],
            extraction: [],
            texture: [],
            substrat: choiceCatalog.substratsSystemes || [],
            ingredient: choiceCatalog.ingredientsCuisine || [],
            landrace: choiceCatalog.landraceTypes || []
        }

        // Méthodes d'extraction (toutes combinées)
        if (type === 'Hash' || type === 'Concentré' || type === 'all') {
            options.extraction = [
                ...(choiceCatalog.extractionSolvants || []),
                ...(choiceCatalog.extractionSansSolvants || []),
                ...(choiceCatalog.separationTypes || [])
            ]
        }

        // Textures basées sur le type
        if (type === 'Hash') {
            options.texture = choiceCatalog.textureHash || []
        } else if (type === 'Concentré') {
            options.texture = choiceCatalog.textureConcentre || []
        } else if (type === 'all') {
            options.texture = [
                ...(choiceCatalog.textureHash || []),
                ...(choiceCatalog.textureConcentre || [])
            ]
        }

        return options
    }

    const advancedOptions = getAdvancedFilterOptions()

    // Créer l'index de recherche une seule fois
    const searchIndex = useMemo(() => buildSearchIndex(reviews), [reviews])

    return (
        <div className="bg-gray-800/50 backdrop-blur-xl rounded-2xl p-6 border border-gray-700 mb-8">
            {/* Filtres de base */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Recherche avancée avec autocomplétion */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        🔍 Recherche intelligente
                    </label>
                    <AdvancedSearchBar
                        searchIndex={searchIndex}
                        onSearch={(value) => handleFilterChange('search', value)}
                        placeholder="Nom, cultivar, breeder, ingrédient, méthode..."
                    />
                </div>

                {/* Type de produit */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        📦 Type
                    </label>
                    <select
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none select-themed"
                    >
                        <option value="all">Tous les types</option>
                        {productTypes.map(type => (
                            <option key={type} value={type}>{type}</option>
                        ))}
                    </select>
                </div>

                {/* Tri */}
                <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        ↕️ Trier par
                    </label>
                    <select
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        className="w-full px-4 py-2 rounded-lg focus:outline-none select-themed"
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
            <div className="flex items-center justify-between pt-4" style={{ borderTop: '1px solid', borderColor: 'var(--border)' }}>
                <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="text-sm flex items-center gap-2 transition-colors"
                    style={{ color: 'var(--text-secondary)' }}
                >
                    <span>{showAdvanced ? '▼' : '▶'}</span>
                    <span>Filtres avancés</span>
                    {activeFiltersCount > 0 && (
                        <span className="px-2 py-1 bg-transparent text-xs rounded-full glow-text-subtle" style={{ border: '1px solid', borderColor: 'var(--primary)', color: 'var(--text-primary)' }}>
                            {activeFiltersCount}
                        </span>
                    )}
                </button>

                {activeFiltersCount > 0 && (
                    <button
                        onClick={resetFilters}
                        className="text-sm hover:opacity-80"
                        style={{ color: 'var(--accent)' }}
                    >
                        ✕ Réinitialiser
                    </button>
                )}
            </div>

            {/* Filtres avancés */}
            {showAdvanced && (
                <div className="space-y-6 mt-4 pt-4 border-t border-gray-700">
                    {/* Section 1: Filtres de base avancés */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Note minimale */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
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
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <div className="flex justify-between text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>
                                <span>0</span>
                                <span>5</span>
                                <span>10</span>
                            </div>
                        </div>

                        {/* Durée des effets */}
                        <div>
                            <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                ⏱️ Durée des effets
                            </label>
                            <select
                                value={filters.dureeEffet}
                                onChange={(e) => handleFilterChange('dureeEffet', e.target.value)}
                                className="w-full px-4 py-2 rounded-lg focus:outline-none select-themed"
                            >
                                <option value="all">Toutes durées</option>
                                {dureeOptions.map(duree => (
                                    <option key={duree} value={duree}>{duree}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Section 2: Filtres spécifiques à la culture (Fleur principalement) */}
                    {(filters.type === 'Fleur' || filters.type === 'all') && (
                        <div className="pt-4" style={{ borderTop: '1px solid', borderColor: 'var(--border)' }}>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                                🌱 Filtres Culture & Génétique
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {/* Type de culture */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        🏠 Type de culture
                                    </label>
                                    <select
                                        value={filters.typeCulture}
                                        onChange={(e) => handleFilterChange('typeCulture', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg focus:outline-none select-themed"
                                    >
                                        <option value="all">Tous types</option>
                                        {advancedOptions.typeCulture.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Substrat */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        🌾 Substrat
                                    </label>
                                    <select
                                        value={filters.substrat}
                                        onChange={(e) => handleFilterChange('substrat', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg focus:outline-none select-themed"
                                    >
                                        <option value="all">Tous substrats</option>
                                        {advancedOptions.substrat.map(sub => (
                                            <option key={sub} value={sub}>{sub}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Landrace */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        🧬 Lignée (Landrace)
                                    </label>
                                    <select
                                        value={filters.landrace}
                                        onChange={(e) => handleFilterChange('landrace', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg focus:outline-none select-themed"
                                    >
                                        <option value="all">Toutes lignées</option>
                                        {advancedOptions.landrace.map(land => (
                                            <option key={land} value={land}>{land}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Section 3: Filtres extraction (Hash et Concentré) */}
                    {(filters.type === 'Hash' || filters.type === 'Concentré' || filters.type === 'all') && advancedOptions.extraction.length > 0 && (
                        <div className="pt-4" style={{ borderTop: '1px solid', borderColor: 'var(--border)' }}>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                                ⚗️ Filtres Extraction & Texture
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Méthode d'extraction */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        🧪 Méthode d'extraction
                                    </label>
                                    <select
                                        value={filters.extraction}
                                        onChange={(e) => handleFilterChange('extraction', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg focus:outline-none select-themed"
                                    >
                                        <option value="all">Toutes méthodes</option>
                                        {advancedOptions.extraction.map(ext => (
                                            <option key={ext} value={ext}>{ext}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Texture */}
                                {advancedOptions.texture.length > 0 && (
                                    <div>
                                        <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                            ✨ Texture
                                        </label>
                                        <select
                                            value={filters.texture}
                                            onChange={(e) => handleFilterChange('texture', e.target.value)}
                                            className="w-full px-4 py-2 rounded-lg focus:outline-none select-themed"
                                        >
                                            <option value="all">Toutes textures</option>
                                            {advancedOptions.texture.map(tex => (
                                                <option key={tex} value={tex}>{tex}</option>
                                            ))}
                                        </select>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Section 4: Filtres comestibles */}
                    {(filters.type === 'Comestible' || filters.type === 'all') && (
                        <div className="pt-4" style={{ borderTop: '1px solid', borderColor: 'var(--border)' }}>
                            <h3 className="text-sm font-semibold mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                                🍰 Filtres Comestibles
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                {/* Ingrédient principal */}
                                <div>
                                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                                        🥄 Ingrédient
                                    </label>
                                    <select
                                        value={filters.ingredient}
                                        onChange={(e) => handleFilterChange('ingredient', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg focus:outline-none select-themed"
                                    >
                                        <option value="all">Tous ingrédients</option>
                                        {advancedOptions.ingredient.map(ing => (
                                            <option key={ing} value={ing}>{ing}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Stats */}
            <div className="mt-4 pt-4 flex items-center gap-6 text-sm" style={{ borderTop: '1px solid', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <span>📊 {reviews.length} reviews au total</span>
                {activeFiltersCount > 0 && (
                    <span style={{ color: 'var(--accent)' }}>
                        ✓ Filtres actifs
                    </span>
                )}
            </div>
        </div>
    )
}


