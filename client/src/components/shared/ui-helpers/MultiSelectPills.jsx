/**
 * MultiSelectPills - Composant CDC conforme
 * Sélection multiple avec pills, drag & drop pour réorganiser
 * Source : bibliothèque utilisateur + ajout nouveau
 * Liquid Glass UI Design System
 */

import { useState, useRef } from 'react';
import { X, Plus, GripVertical, Search, Loader2 } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { LiquidInput, LiquidButton, LiquidChip, LiquidCard } from '@/components/ui/LiquidUI';

export default function MultiSelectPills({
    value = [],
    onChange,
    source = 'user-library',
    placeholder = 'Sélectionner ou créer',
    addNewButton = true,
    addNewLabel = '+ Ajouter',
    glowColor = 'violet'
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    const glowColors = {
        violet: 'border-violet-500/50 bg-violet-500/10',
        green: 'border-green-500/50 bg-green-500/10',
        blue: 'border-blue-500/50 bg-blue-500/10',
        amber: 'border-amber-500/50 bg-amber-500/10',
    };

    // Charger items depuis API
    const fetchItems = async () => {
        if (loading || items.length > 0) return;

        setLoading(true);
        try {
            const endpoint = source === 'user-library' ? '/api/cultivars' : `/api/${source}`;
            const res = await fetch(endpoint, { credentials: 'include' });
            const data = await res.json();
            setItems(data);
        } catch (error) {
            console.error('Erreur chargement items:', error);
        } finally {
            setLoading(false);
        }
    };

    // Filtrer items selon recherche
    const filteredItems = items.filter(item => {
        const label = item.name || item.label || item;
        return label.toLowerCase().includes(searchTerm.toLowerCase());
    }).filter(item => {
        const itemId = item.id || item.name || item;
        return !value.some(v => (v.id || v) === itemId);
    });

    // Ajouter item sélectionné
    const handleSelect = (item) => {
        const newValue = [...value, item];
        onChange(newValue);
        setSearchTerm('');
        setShowDropdown(false);
        inputRef.current?.focus();
    };

    // Retirer item
    const handleRemove = (index) => {
        const newValue = value.filter((_, idx) => idx !== index);
        onChange(newValue);
    };

    // Drag & drop
    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const newValue = Array.from(value);
        const [removed] = newValue.splice(result.source.index, 1);
        newValue.splice(result.destination.index, 0, removed);

        onChange(newValue);
    };

    // Ajouter nouveau item
    const handleAddNew = () => {
        const newName = prompt('Nom du nouveau cultivar :');
        if (newName && newName.trim()) {
            const newItem = {
                id: `temp-${Date.now()}`,
                name: newName.trim(),
                isNew: true
            };
            handleSelect(newItem);
        }
    };

    // Afficher label d'un item
    const getItemLabel = (item) => {
        if (typeof item === 'string') return item;
        return item.name || item.label || item.id;
    };

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
                                        key={item.id || getItemLabel(item)}
                                        draggableId={String(item.id || getItemLabel(item))}
                                        index={index}
                                    >
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border backdrop-blur-sm transition-all ${snapshot.isDragging
                                                    ? `${glowColors[glowColor]} shadow-lg`
                                                    : 'border-white/20 bg-white/5 hover:bg-white/10'
                                                    }`}
                                            >
                                                <span
                                                    {...provided.dragHandleProps}
                                                    className="cursor-grab text-white/40 hover:text-white/60"
                                                >
                                                    <GripVertical className="w-3 h-3" />
                                                </span>
                                                <span className="text-sm text-white font-medium">
                                                    {getItemLabel(item)}
                                                </span>
                                                {item.isNew && (
                                                    <span className="text-xs px-1.5 py-0.5 rounded bg-green-500/20 text-green-400 border border-green-500/30">
                                                        Nouveau
                                                    </span>
                                                )}
                                                <button
                                                    onClick={() => handleRemove(index)}
                                                    className="text-white/40 hover:text-red-400 transition-colors"
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

            {/* Recherche / Dropdown */}
            <div className="relative">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 z-10" />
                        <input
                            ref={inputRef}
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onFocus={() => {
                                setShowDropdown(true);
                                fetchItems();
                            }}
                            placeholder={placeholder}
                            className="liquid-input w-full pl-10 pr-4"
                        />
                    </div>

                    {addNewButton && (
                        <LiquidButton
                            variant="ghost"
                            onClick={handleAddNew}
                            icon={Plus}
                            className="shrink-0"
                        >
                            {addNewLabel}
                        </LiquidButton>
                    )}
                </div>

                {/* Dropdown des résultats */}
                {showDropdown && (
                    <LiquidCard className="absolute z-50 w-full mt-2 max-h-60 overflow-y-auto p-2">
                        {loading ? (
                            <div className="flex items-center justify-center py-4">
                                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
                            </div>
                        ) : filteredItems.length > 0 ? (
                            filteredItems.slice(0, 10).map((item, index) => (
                                <button
                                    key={item.id || getItemLabel(item)}
                                    onClick={() => handleSelect(item)}
                                    className="w-full text-left px-3 py-2 rounded-lg text-white hover:bg-white/10 transition-colors"
                                >
                                    {getItemLabel(item)}
                                </button>
                            ))
                        ) : searchTerm ? (
                            <p className="text-center py-3 text-white/50 text-sm">
                                Aucun résultat pour "{searchTerm}"
                            </p>
                        ) : (
                            <p className="text-center py-3 text-white/50 text-sm">
                                Commencez à taper pour rechercher
                            </p>
                        )}
                    </LiquidCard>
                )}

                {/* Overlay pour fermer le dropdown */}
                {showDropdown && (
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowDropdown(false)}
                    />
                )}
            </div>
        </div>
    );
}


