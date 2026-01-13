import { useState, useRef } from 'react'
import { X, Plus, GripVertical, Search } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

/**
 * MultiSelectPills - Composant CDC conforme
 * Sélection multiple avec pills, drag & drop pour réorganiser
 * Source : bibliothèque utilisateur + ajout nouveau
 */
export default function MultiSelectPills({
    value = [],
    onChange,
    source = 'user-library',
    placeholder = 'Sélectionner ou créer',
    addNewButton = true,
    addNewLabel = '+ Ajouter'
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [items, setItems] = useState([]) // Items from library
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)

    // Charger items depuis API
    const fetchItems = async () => {
        if (loading || items.length > 0) return

        setLoading(true)
        try {
            const endpoint = source === 'user-library' ? '/api/cultivars' : `/api/${source}`
            const res = await fetch(endpoint, { credentials: 'include' })
            const data = await res.json()
            setItems(data)
        } catch (error) {
            console.error('Erreur chargement items:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filtrer items selon recherche
    const filteredItems = items.filter(item => {
        const label = item.name || item.label || item
        return label.toLowerCase().includes(searchTerm.toLowerCase())
    }).filter(item => {
        const itemId = item.id || item.name || item
        return !value.some(v => (v.id || v) === itemId)
    })

    // Ajouter item sélectionné
    const handleSelect = (item) => {
        const newValue = [...value, item]
        onChange(newValue)
        setSearchTerm('')
        setShowDropdown(false)
        inputRef.current?.focus()
    }

    // Retirer item
    const handleRemove = (index) => {
        const newValue = value.filter((_, idx) => idx !== index)
        onChange(newValue)
    }

    // Drag & drop
    const handleDragEnd = (result) => {
        if (!result.destination) return

        const newValue = Array.from(value)
        const [removed] = newValue.splice(result.source.index, 1)
        newValue.splice(result.destination.index, 0, removed)

        onChange(newValue)
    }

    // Ajouter nouveau item (modal ou inline)
    const handleAddNew = () => {
        const newName = prompt('Nom du nouveau cultivar :')
        if (newName && newName.trim()) {
            const newItem = {
                id: `temp-${Date.now()}`,
                name: newName.trim(),
                isNew: true
            }
            handleSelect(newItem)
        }
    }

    // Afficher label d'un item
    const getItemLabel = (item) => {
        if (typeof item === 'string') return item
        return item.name || item.label || item.id
    }

    return (
        <div className="space-y-3">
            {/* Pills sélectionnés (drag & drop) */}
            {value.length > 0 && (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="pills" direction="horizontal">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex flex-wrap gap-2"
                            >
                                {value.map((item, index) => (
                                    <Draggable
                                        key={`${getItemLabel(item)}-${index}`}
                                        draggableId={`pill-${index}`}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`flex items-center gap-2 px-3 py-2 bg-gradient-to-r text-white rounded-full text-sm font-medium shadow-md hover:shadow-lg transition-all ${snapshot.isDragging ? 'opacity-70 rotate-2' : ''}`}
                                            >
                                                <div
                                                    {...provided.dragHandleProps}
                                                    className="cursor-grab active:cursor-grabbing"
                                                >
                                                    <GripVertical className="w-4 h-4" />
                                                </div>
                                                <span>{getItemLabel(item)}</span>
                                                <button
                                                    onClick={() => handleRemove(index)}
                                                    className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            {/* Champ de recherche / sélection */}
            <div className="relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onFocus={() => {
                            fetchItems()
                            setShowDropdown(true)
                        }}
                        onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                        placeholder={placeholder}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus: focus:border-transparent transition-all"
                    />
                </div>

                {/* Dropdown suggestions */}
                {showDropdown && (
                    <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl max-h-64 overflow-y-auto">
                        {loading && (
                            <div className="px-4 py-3 text-center text-gray-500">
                                Chargement...
                            </div>
                        )}

                        {!loading && filteredItems.length === 0 && (
                            <div className="px-4 py-3 text-center text-gray-500">
                                Aucun résultat
                            </div>
                        )}

                        {!loading && filteredItems.map((item, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(item)}
                                className="w-full px-4 py-3 text-left hover: dark:hover: transition-colors text-gray-900 dark:text-gray-100"
                            >
                                {getItemLabel(item)}
                            </button>
                        ))}

                        {/* Bouton ajouter nouveau */}
                        {addNewButton && (
                            <button
                                onClick={handleAddNew}
                                className="w-full px-4 py-3 text-left border-t border-gray-200 dark:border-gray-700 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors flex items-center gap-2 text-green-600 dark:text-green-400 font-medium"
                            >
                                <Plus className="w-4 h-4" />
                                {addNewLabel}
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* Helper text */}
            <p className="text-xs text-gray-500 dark:text-gray-400">
                💡 Drag & drop pour réorganiser l'ordre
            </p>
        </div>
    )
}

