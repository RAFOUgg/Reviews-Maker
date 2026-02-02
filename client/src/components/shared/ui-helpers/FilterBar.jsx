/**
 * FilterBar Component
 * Barre de filtrage et recherche avancée pour les reviews
 * Liquid Glass UI Design System
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight, X, Search, SlidersHorizontal, RotateCcw } from 'lucide-react';
import { choiceCatalog } from '../../../utils/productStructures';
import { buildSearchIndex } from '../../../utils/filterHelpers';
import { LiquidSelect, LiquidBadge } from '@/components/ui/LiquidUI';
import AdvancedSearchBar from './AdvancedSearchBar';

export default function FilterBar({ reviews, onFilteredChange }) {
    const [filters, setFilters] = useState({
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
    });

    const [showAdvanced, setShowAdvanced] = useState(false);

    const productTypes = ['Fleur', 'Hash', 'Concentré', 'Comestible'];
    const dureeOptions = choiceCatalog.dureeEffet || ['5-15min', '15-30min', '30min-1h', '1h-2h', '2h-4h', '4h-8h', '8h+'];

    const applyFilters = (newFilters) => {
        setFilters(newFilters);

        let filtered = [...reviews];

        // Filtre par type
        if (newFilters.type !== 'all') {
            filtered = filtered.filter(r => r.type === newFilters.type);
        }

        // Filtre par note minimale
        if (newFilters.minRating > 0) {
            filtered = filtered.filter(r => (r.overallRating || r.note || 0) >= newFilters.minRating);
        }

        // Filtre par recherche texte
        if (newFilters.search.trim()) {
            const searchLower = newFilters.search.toLowerCase();
            filtered = filtered.filter(r => {
                const basicMatch =
                    r.holderName?.toLowerCase().includes(searchLower) ||
                    r.cultivars?.toLowerCase().includes(searchLower) ||
                    r.breeder?.toLowerCase().includes(searchLower) ||
                    r.farm?.toLowerCase().includes(searchLower) ||
                    r.description?.toLowerCase().includes(searchLower);

                const structuredMatch =
                    r.typeCulture?.toLowerCase().includes(searchLower) ||
                    r.substrat?.some?.(s => s.toLowerCase().includes(searchLower)) ||
                    r.extractionMethod?.toLowerCase().includes(searchLower) ||
                    r.texture?.toLowerCase().includes(searchLower) ||
                    r.ingredients?.some?.(i => i.toLowerCase().includes(searchLower)) ||
                    r.recette?.toLowerCase().includes(searchLower) ||
                    r.landrace?.toLowerCase().includes(searchLower);

                return basicMatch || structuredMatch;
            });
        }

        // Filtre par durée effets
        if (newFilters.dureeEffet !== 'all') {
            filtered = filtered.filter(r => r.dureeEffet === newFilters.dureeEffet);
        }

        // Filtres avancés
        if (newFilters.typeCulture !== 'all') {
            filtered = filtered.filter(r => r.typeCulture === newFilters.typeCulture);
        }

        if (newFilters.extraction !== 'all') {
            filtered = filtered.filter(r =>
                r.extractionMethod?.includes(newFilters.extraction) ||
                r.extractionSolvant === newFilters.extraction ||
                r.separationMethod?.includes(newFilters.extraction)
            );
        }

        if (newFilters.texture !== 'all') {
            filtered = filtered.filter(r => r.texture === newFilters.texture);
        }

        if (newFilters.landrace !== 'all') {
            filtered = filtered.filter(r => r.landrace === newFilters.landrace);
        }

        if (newFilters.substrat !== 'all') {
            filtered = filtered.filter(r =>
                r.substrat?.includes(newFilters.substrat) ||
                r.substratsSystemes?.includes(newFilters.substrat)
            );
        }

        if (newFilters.ingredient !== 'all') {
            filtered = filtered.filter(r =>
                r.ingredients?.includes(newFilters.ingredient)
            );
        }

        // Tri
        switch (newFilters.sortBy) {
            case 'date-desc':
                filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            case 'date-asc':
                filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                break;
            case 'rating-desc':
                filtered.sort((a, b) => (b.overallRating || b.note || 0) - (a.overallRating || a.note || 0));
                break;
            case 'rating-asc':
                filtered.sort((a, b) => (a.overallRating || a.note || 0) - (b.overallRating || b.note || 0));
                break;
            case 'name':
                filtered.sort((a, b) => a.holderName.localeCompare(b.holderName));
                break;
            default:
                break;
        }

        onFilteredChange(filtered);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        applyFilters(newFilters);
    };

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
        };
        applyFilters(defaultFilters);
    };

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
        (filters.ingredient !== 'all' ? 1 : 0);

    const getAdvancedFilterOptions = () => {
        const type = filters.type;
        const options = {
            typeCulture: choiceCatalog.typesCulture || [],
            extraction: [],
            texture: [],
            substrat: choiceCatalog.substratsSystemes || [],
            ingredient: choiceCatalog.ingredientsCuisine || [],
            landrace: choiceCatalog.landraceTypes || []
        };

        if (type === 'Hash' || type === 'Concentré' || type === 'all') {
            options.extraction = [
                ...(choiceCatalog.extractionSolvants || []),
                ...(choiceCatalog.extractionSansSolvants || []),
                ...(choiceCatalog.separationTypes || [])
            ];
        }

        if (type === 'Hash') {
            options.texture = choiceCatalog.textureHash || [];
        } else if (type === 'Concentré') {
            options.texture = choiceCatalog.textureConcentre || [];
        } else if (type === 'all') {
            options.texture = [
                ...(choiceCatalog.textureHash || []),
                ...(choiceCatalog.textureConcentre || [])
            ];
        }

        return options;
    };

    const advancedOptions = getAdvancedFilterOptions();
    const searchIndex = useMemo(() => buildSearchIndex(reviews), [reviews]);

    return (
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 mb-8">
            {/* Filtres de base */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                {/* Recherche avancée */}
                <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-white mb-2">
                        <Search className="inline w-4 h-4 mr-1" /> Recherche intelligente
                    </label>
                    <AdvancedSearchBar
                        searchIndex={searchIndex}
                        onSearch={(value) => handleFilterChange('search', value)}
                        placeholder="Nom, cultivar, breeder, ingrédient, méthode..."
                    />
                </div>

                {/* Type de produit */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        📦 Type
                    </label>
                    <LiquidSelect
                        value={filters.type}
                        onChange={(e) => handleFilterChange('type', e.target.value)}
                        options={[
                            { value: 'all', label: 'Tous les types' },
                            ...productTypes.map(t => ({ value: t, label: t }))
                        ]}
                    />
                </div>

                {/* Tri */}
                <div>
                    <label className="block text-sm font-medium text-white mb-2">
                        ↕️ Trier par
                    </label>
                    <LiquidSelect
                        value={filters.sortBy}
                        onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        options={[
                            { value: 'date-desc', label: 'Plus récent' },
                            { value: 'date-asc', label: 'Plus ancien' },
                            { value: 'rating-desc', label: 'Note (haut → bas)' },
                            { value: 'rating-asc', label: 'Note (bas → haut)' },
                            { value: 'name', label: 'Nom (A → Z)' }
                        ]}
                    />
                </div>
            </div>

            {/* Toggle filtres avancés */}
            <div className="flex items-center justify-between pt-4 border-t border-white/10">
                <motion.button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="text-sm flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                    {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    <SlidersHorizontal className="w-4 h-4" />
                    <span>Filtres avancés</span>
                    {activeFiltersCount > 0 && (
                        <LiquidBadge variant="primary" size="sm">
                            {activeFiltersCount}
                        </LiquidBadge>
                    )}
                </motion.button>

                {activeFiltersCount > 0 && (
                    <motion.button
                        onClick={resetFilters}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm flex items-center gap-1 text-red-400 hover:text-red-300 transition-colors"
                    >
                        <RotateCcw className="w-4 h-4" />
                        Réinitialiser
                    </motion.button>
                )}
            </div>

            {/* Filtres avancés */}
            <AnimatePresence>
                {showAdvanced && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-6 mt-4 pt-4 border-t border-white/10">
                            {/* Section 1: Filtres de base avancés */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Note minimale */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        ⭐ Note minimale: {filters.minRating}/10
                                    </label>
                                    <input
                                        type="range"
                                        min="0"
                                        max="10"
                                        step="0.5"
                                        value={filters.minRating}
                                        onChange={(e) => handleFilterChange('minRating', parseFloat(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-violet-500"
                                    />
                                    <div className="flex justify-between text-xs mt-1 text-white/40">
                                        <span>0</span>
                                        <span>5</span>
                                        <span>10</span>
                                    </div>
                                </div>

                                {/* Durée des effets */}
                                <div>
                                    <label className="block text-sm font-medium text-white mb-2">
                                        ⏱️ Durée des effets
                                    </label>
                                    <LiquidSelect
                                        value={filters.dureeEffet}
                                        onChange={(e) => handleFilterChange('dureeEffet', e.target.value)}
                                        options={[
                                            { value: 'all', label: 'Toutes durées' },
                                            ...dureeOptions.map(d => ({ value: d, label: d }))
                                        ]}
                                    />
                                </div>
                            </div>

                            {/* Section 2: Filtres culture & génétique (Fleur) */}
                            {(filters.type === 'Fleur' || filters.type === 'all') && (
                                <div className="pt-4 border-t border-white/10">
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-green-400">
                                        🌱 Filtres Culture & Génétique
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                🏠 Type de culture
                                            </label>
                                            <LiquidSelect
                                                value={filters.typeCulture}
                                                onChange={(e) => handleFilterChange('typeCulture', e.target.value)}
                                                options={[
                                                    { value: 'all', label: 'Tous types' },
                                                    ...advancedOptions.typeCulture.map(t => ({ value: t, label: t }))
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                🌾 Substrat
                                            </label>
                                            <LiquidSelect
                                                value={filters.substrat}
                                                onChange={(e) => handleFilterChange('substrat', e.target.value)}
                                                options={[
                                                    { value: 'all', label: 'Tous substrats' },
                                                    ...advancedOptions.substrat.map(s => ({ value: s, label: s }))
                                                ]}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                🧬 Lignée (Landrace)
                                            </label>
                                            <LiquidSelect
                                                value={filters.landrace}
                                                onChange={(e) => handleFilterChange('landrace', e.target.value)}
                                                options={[
                                                    { value: 'all', label: 'Toutes lignées' },
                                                    ...advancedOptions.landrace.map(l => ({ value: l, label: l }))
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Filtres extraction (Hash et Concentré) */}
                            {(filters.type === 'Hash' || filters.type === 'Concentré' || filters.type === 'all') && advancedOptions.extraction.length > 0 && (
                                <div className="pt-4 border-t border-white/10">
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-amber-400">
                                        ⚗️ Filtres Extraction & Texture
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                🧪 Méthode d'extraction
                                            </label>
                                            <LiquidSelect
                                                value={filters.extraction}
                                                onChange={(e) => handleFilterChange('extraction', e.target.value)}
                                                options={[
                                                    { value: 'all', label: 'Toutes méthodes' },
                                                    ...advancedOptions.extraction.map(e => ({ value: e, label: e }))
                                                ]}
                                            />
                                        </div>

                                        {advancedOptions.texture.length > 0 && (
                                            <div>
                                                <label className="block text-sm font-medium text-white mb-2">
                                                    ✨ Texture
                                                </label>
                                                <LiquidSelect
                                                    value={filters.texture}
                                                    onChange={(e) => handleFilterChange('texture', e.target.value)}
                                                    options={[
                                                        { value: 'all', label: 'Toutes textures' },
                                                        ...advancedOptions.texture.map(t => ({ value: t, label: t }))
                                                    ]}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Section 4: Filtres comestibles */}
                            {(filters.type === 'Comestible' || filters.type === 'all') && (
                                <div className="pt-4 border-t border-white/10">
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2 text-rose-400">
                                        🍰 Filtres Comestibles
                                    </h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-white mb-2">
                                                🥄 Ingrédient
                                            </label>
                                            <LiquidSelect
                                                value={filters.ingredient}
                                                onChange={(e) => handleFilterChange('ingredient', e.target.value)}
                                                options={[
                                                    { value: 'all', label: 'Tous ingrédients' },
                                                    ...advancedOptions.ingredient.map(i => ({ value: i, label: i }))
                                                ]}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Stats */}
            <div className="mt-4 pt-4 flex items-center gap-6 text-sm border-t border-white/10 text-white/60">
                <span>📊 {reviews.length} reviews au total</span>
                {activeFiltersCount > 0 && (
                    <span className="text-violet-400">
                        ✓ Filtres actifs
                    </span>
                )}
            </div>
        </div>
    );
}


