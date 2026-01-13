import React, { useState, useMemo } from 'react'
import { Search, Filter } from 'lucide-react'

/**
 * CultivarLibraryPanel - Panneau latéral avec bibliothèque de cultivars
 * Drag & drop vers le canva généalogique
 */
export default function CultivarLibraryPanel({ 
    cultivarLibrary = [],
    selectedInCanvas = [],
    onSelectProject = () => {}
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [filterType, setFilterType] = useState('all')

    // Filtrer les cultivars disponibles (non encore ajoutés au canva)
    const availableCultivars = useMemo(() => {
        return cultivarLibrary
            .filter(c => !selectedInCanvas.includes(c.id))
            .filter(c => {
                const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (c.breeder && c.breeder.toLowerCase().includes(searchTerm.toLowerCase()))
                
                if (filterType === 'all') return matchSearch
                return matchSearch && c.type === filterType
            })
    }, [cultivarLibrary, selectedInCanvas, searchTerm, filterType])

    const handleDragStart = (e, cultivar) => {
        e.dataTransfer.effectAllowed = 'copy'
        e.dataTransfer.setData('cultivar-id', cultivar.id)
        e.dataTransfer.setData('cultivar-name', cultivar.name)
    }

    return (
        <div className="h-full flex flex-col bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 rounded-lg">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <span>📚</span> Bibliothèque
                </h3>

                {/* Recherche */}
                <div className="relative mb-3">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Chercher cultivar..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {/* Filtre type */}
                <div className="flex gap-2">
                    {['all', 'indica', 'sativa', 'hybrid'].map(type => (
                        <button
                            key={type}
                            onClick={() => setFilterType(type)}
                            className={`px-2 py-1 text-xs rounded-lg font-medium transition-colors ${
                                filterType === type
                                    ? 'bg-purple-500 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }`}
                        >
                            {type === 'all' ? '🌐 Tous' : 
                             type === 'indica' ? '🌿 Indica' :
                             type === 'sativa' ? '🌾 Sativa' : '⚖️ Hybrid'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Liste */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {availableCultivars.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                        <p className="text-sm">
                            {cultivarLibrary.length === 0
                                ? '📭 Aucun cultivar dans votre bibliothèque'
                                : '✅ Tous les cultivars sont déjà ajoutés'}
                        </p>
                    </div>
                ) : (
                    availableCultivars.map(cultivar => (
                        <div
                            key={cultivar.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, cultivar)}
                            className="p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg cursor-move hover:shadow-md hover:border-purple-400 dark:hover:border-purple-500 transition-all group"
                        >
                            <div className="flex gap-3">
                                {cultivar.image ? (
                                    <img
                                        src={cultivar.image}
                                        alt={cultivar.name}
                                        className="w-12 h-12 rounded object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 rounded bg-gradient-to-b from-green-100 to-green-50 dark:from-green-900 dark:to-green-800 flex items-center justify-center text-xl">
                                        🌱
                                    </div>
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                                        {cultivar.name}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                        {cultivar.breeder || 'Inconnu'} • {cultivar.type || 'N/A'}
                                    </p>
                                    {cultivar.thc && (
                                        <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                                            THC: {cultivar.thc}%
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Footer info */}
            <div className="p-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-400 rounded-b-lg">
                <p>💡 Glissez un cultivar vers le canva pour l'ajouter à l'arbre</p>
            </div>
        </div>
    )
}

