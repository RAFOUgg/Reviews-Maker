import React, { useState, useMemo } from 'react';
import { usePhenoHuntStore } from '../../store/index';
import { Plus, Trash2, Copy, ChevronDown, ChevronRight, Leaf, FolderOpen } from 'lucide-react';

/**
 * SidebarHierarchique - Gestion de la bibliothèque de cultivars
 * Affiche: Projets > Groupes > Cultivars
 * Features: Drag-drop, Add, Duplicate, Delete
 */
export default function SidebarHierarchique() {
    const {
        phenoTrees,
        activeTreeId,
        setActiveTree,
        cultivarLibrary,
        addNode,
        deleteNode,
        duplicateNode
    } = usePhenoHuntStore();

    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [draggedItem, setDraggedItem] = useState(null);

    // Organiser les cultivars par groupe
    const groupedCultivars = useMemo(() => {
        const groups = {};
        cultivarLibrary.forEach(cultivar => {
            const group = cultivar.group || 'Non classé';
            if (!groups[group]) groups[group] = [];
            groups[group].push(cultivar);
        });
        return groups;
    }, [cultivarLibrary]);

    const toggleGroup = (groupName) => {
        const newExpanded = new Set(expandedGroups);
        if (newExpanded.has(groupName)) {
            newExpanded.delete(groupName);
        } else {
            newExpanded.add(groupName);
        }
        setExpandedGroups(newExpanded);
    };

    const handleDragStart = (e, cultivar) => {
        setDraggedItem(cultivar);
        // Envoyer les données du cultivar en JSON
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify(cultivar));
    };

    const handleAddCultivarToCanvas = (cultivar) => {
        if (!activeTreeId) {
            alert('Créez ou sélectionnez un arbre d\'abord');
            return;
        }
        addNode({
            cultivarId: cultivar.id,
            cultivarName: cultivar.name,
            position: { x: Math.random() * 400, y: Math.random() * 400 },
            genetics: cultivar.genetics || {}
        });
    };

    return (
        <aside className="h-full w-full md:w-80 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-r border-emerald-500/20 flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-emerald-500/20 bg-gradient-to-r from-emerald-950/40 to-transparent">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <Leaf className="w-6 h-6 text-emerald-400" />
                    PhénoHunt
                </h2>
                <p className="text-xs text-slate-400 mt-1">Gestion généalogique</p>
            </div>

            {/* Active Tree Info */}
            {activeTreeId && phenoTrees[activeTreeId] && (
                <div className="px-6 py-3 bg-emerald-500/10 border-b border-emerald-500/20">
                    <h3 className="text-sm font-semibold text-emerald-400">
                        {phenoTrees[activeTreeId].metadata?.name || 'Arbre sans nom'}
                    </h3>
                </div>
            )}

            {/* Cultivar Groups */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
                <div className="p-4 space-y-3">
                    {Object.keys(groupedCultivars).map(groupName => (
                        <div key={groupName} className="space-y-2">
                            {/* Group Header */}
                            <button
                                onClick={() => toggleGroup(groupName)}
                                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-slate-700/50 transition-colors text-slate-300 text-sm font-medium"
                            >
                                {expandedGroups.has(groupName) ? (
                                    <ChevronDown className="w-4 h-4" />
                                ) : (
                                    <ChevronRight className="w-4 h-4" />
                                )}
                                <FolderOpen className="w-4 h-4 text-emerald-400/70" />
                                <span>{groupName}</span>
                                <span className="ml-auto text-xs bg-slate-700/50 px-2 py-1 rounded text-slate-400">
                                    {groupedCultivars[groupName].length}
                                </span>
                            </button>

                            {/* Cultivars */}
                            {expandedGroups.has(groupName) && (
                                <div className="ml-4 space-y-2">
                                    {groupedCultivars[groupName].map(cultivar => (
                                        <CultivarItem
                                            key={cultivar.id}
                                            cultivar={cultivar}
                                            onDragStart={handleDragStart}
                                            onAddToCanvas={handleAddCultivarToCanvas}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}

                    {cultivarLibrary.length === 0 && (
                        <div className="text-center py-8 text-slate-500">
                            <p className="text-sm">Aucun cultivar disponible</p>
                            <p className="text-xs mt-1">Créez des reviews pour les ajouter</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 border-t border-emerald-500/20 space-y-2 bg-slate-900/80">
                <button className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg">
                    <Plus className="w-4 h-4" />
                    Nouveau groupe
                </button>
            </div>
        </aside>
    );
}

/**
 * CultivarItem - Item de cultivar avec actions
 */
function CultivarItem({ cultivar, onDragStart, onAddToCanvas }) {
    const { duplicateNode } = usePhenoHuntStore();
    const [showActions, setShowActions] = useState(false);

    return (
        <div
            draggable
            onDragStart={(e) => onDragStart(e, cultivar)}
            onMouseEnter={() => setShowActions(true)}
            onMouseLeave={() => setShowActions(false)}
            className="p-3 bg-slate-700/40 border border-slate-600/50 rounded-lg hover:bg-slate-700/60 transition-all cursor-move group"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-white">
                        {cultivar.name}
                    </h4>
                    {cultivar.genetics?.type && (
                        <p className="text-xs text-slate-400 mt-1 capitalize">
                            {cultivar.genetics.type}
                        </p>
                    )}
                    {cultivar.phenoCode && (
                        <p className="text-xs text-emerald-400/70 font-mono mt-0.5">
                            {cultivar.phenoCode}
                        </p>
                    )}
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="flex gap-1 flex-shrink-0">
                        <ActionButton
                            icon={Plus}
                            title="Ajouter au canevas"
                            onClick={() => onAddToCanvas(cultivar)}
                            className="bg-emerald-600 hover:bg-emerald-700"
                        />
                        <ActionButton
                            icon={Copy}
                            title="Dupliquer"
                            onClick={() => alert('Duplication - feature coming soon')}
                            className="bg-blue-600 hover:bg-blue-700"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function ActionButton({ icon: Icon, title, onClick, className }) {
    return (
        <button
            onClick={onClick}
            title={title}
            className={`p-1.5 rounded text-white transition-colors ${className}`}
        >
            <Icon className="w-3.5 h-3.5" />
        </button>
    );
}

