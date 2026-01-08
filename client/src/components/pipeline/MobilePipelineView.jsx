import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import PipelineCellModal from './PipelineCellModal';
import { CULTURE_PHASES } from './PipelineWithSidebar';

/**
 * MobilePipelineView - Vue timeline optimisée pour mobile
 * 
 * Replaces drag & drop avec:
 * ✅ Timeline compacte en pleine largeur
 * ✅ Clique sur cellule → Modal d'édition
 * ✅ Ajout de groupe/données via la modal
 * ✅ Suppression de données dans la modal
 * ✅ Swipe pour navigation (optionnel)
 * 
 * Design:
 * - Timeline horizontale scrollable
 * - Cellules carrées colorées (intensité)
 * - Mini-icônes de résumé
 * - "+" pour ajouter cellules
 */

const MobilePipelineView = ({
    cells = {},
    config = {},
    cellIndices = [],
    onCellClick,
    onDropOnCell,
    selectedCells = [],
    readonly = false,
    onAddCells,
    canAddMore = true,
    onChange
}) => {
    const [selectedCell, setSelectedCell] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draggedContent, setDraggedContent] = useState(null);
    const [editingContent, setEditingContent] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);

    // Pagination: 20 cellules par page sur mobile
    const CELLS_PER_PAGE = 20;
    const totalCells = cellIndices.length;
    const totalPages = Math.ceil(totalCells / CELLS_PER_PAGE);
    
    const visibleCells = useMemo(() => {
        const start = currentPage * CELLS_PER_PAGE;
        const end = start + CELLS_PER_PAGE;
        return cellIndices.slice(start, end);
    }, [currentPage, cellIndices]);

    // Obtenir le label d'une cellule
    const getCellLabel = (index) => {
        if (config.intervalType === 'phases') {
            const phase = config.customPhases?.[index] || CULTURE_PHASES[index];
            return phase?.name?.substring(0, 8) || `P${index + 1}`;
        }
        if (config.intervalType === 'weeks') {
            return `S${index + 1}`;
        }
        if (config.intervalType === 'months') {
            const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
            return months[index % 12];
        }
        return `${index + 1}`;
    };

    // Obtenir l'icône de phase
    const getPhaseIcon = (index) => {
        if (config.intervalType === 'phases') {
            const phase = config.customPhases?.[index] || CULTURE_PHASES[index];
            return phase?.icon || '📍';
        }
        return null;
    };

    // Calculer l'intensité/densité de données d'une case
    const getCellIntensity = (cellData) => {
        if (!cellData) return 0;

        let count = 0;
        if (cellData.contents && Array.isArray(cellData.contents)) {
            count = cellData.contents.length;
        } else {
            for (const key in cellData) {
                if (key !== 'timestamp' && key !== '_meta' && cellData[key]) {
                    count++;
                }
            }
        }

        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return 4;
    };

    // Couleurs selon intensité
    const getIntensityColor = (intensity) => {
        const baseClasses = 'w-14 h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all';
        if (intensity === 0) return `${baseClasses} bg-gray-700/40 border-gray-600/40 hover:bg-gray-700/60`;
        if (intensity === 1) return `${baseClasses} bg-green-900/50 border-green-700/60 hover:bg-green-900/70`;
        if (intensity === 2) return `${baseClasses} bg-green-700/70 border-green-500/80 hover:bg-green-700/90`;
        if (intensity === 3) return `${baseClasses} bg-green-500/80 border-green-400/90 hover:bg-green-500/100`;
        return `${baseClasses} bg-green-400/90 border-green-300 hover:bg-green-400`;
    };

    // Mini-icônes résumées
    const getMiniIcons = (cellData) => {
        if (!cellData) return [];
        
        const iconMap = {
            temperature: '🌡️',
            humidity: '💧',
            co2: '🫧',
            ventilation: '🌀',
            light: '💡',
            lightType: '💡',
            lightHours: '💡',
            irrigation: '💧',
            waterVolume: '💧',
            fertilizer: '🧪',
            training: '✂️',
            morphology: '📏',
            harvest: '⚖️',
            containerType: '📦',
            packaging: '📦',
            curingType: '🌡️',
            notes: '📝',
            ph: '⚗️',
            ec: '⚡',
            propagationMethod: '🌱',
            substrateType: '🏔️',
            potVolume: '🪴',
            lightPower: '⚡',
            lightDistance: '📏'
        };

        const icons = [];
        for (const key in cellData) {
            if (cellData[key] && iconMap[key]) {
                icons.push(iconMap[key]);
            }
        }

        return icons.slice(0, 2); // Max 2 icônes
    };

    const handleCellClick = (index) => {
        if (readonly) return;
        setSelectedCell(index);
        setIsModalOpen(true);
    };

    const handleModalSave = (newData) => {
        if (onChange) {
            const updated = { ...cells };
            updated[selectedCell] = newData;
            onChange(updated);
        }
        setIsModalOpen(false);
    };

    const handleAddCells = () => {
        if (canAddMore && onAddCells) {
            onAddCells();
        }
    };

    const goToPreviousPage = () => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    };

    const goToNextPage = () => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl p-4 space-y-4">
            {/* Configuration Summary */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="text-sm text-gray-400">
                    <span className="font-semibold text-gray-300">Trame:</span>
                    <span className="ml-2">{config.intervalType === 'phases' ? '12 Phases' : `${config.duration} ${config.intervalType}`}</span>
                </div>
                {config.startDate && (
                    <div className="text-xs text-gray-500 mt-1">
                        Début: {new Date(config.startDate).toLocaleDateString('fr-FR')}
                    </div>
                )}
            </div>

            {/* Timeline - Horizontal Scroll */}
            <div className="relative">
                <div className="overflow-x-auto pb-2 scrollbar-thin">
                    <div className="flex gap-2 px-2 min-w-min">
                        {visibleCells.map((index) => {
                            const cellData = cells[index];
                            const intensity = getCellIntensity(cellData);
                            const label = getCellLabel(index);
                            const icon = getPhaseIcon(index);
                            const miniIcons = getMiniIcons(cellData);
                            const isSelected = selectedCells.includes(index);

                            return (
                                <motion.button
                                    key={index}
                                    onClick={() => handleCellClick(index)}
                                    disabled={readonly}
                                    className={`${getIntensityColor(intensity)} relative group flex-shrink-0 ${
                                        isSelected ? 'ring-2 ring-purple-500 scale-105' : ''
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {/* Contenu de la cellule */}
                                    <div className="flex flex-col items-center justify-center gap-1">
                                        {icon && <span className="text-xl">{icon}</span>}
                                        {!icon && (
                                            <div className="text-xs font-bold text-gray-100 opacity-70">
                                                {label}
                                            </div>
                                        )}
                                        {miniIcons.length > 0 && (
                                            <div className="flex gap-0.5 flex-wrap justify-center max-w-xs">
                                                {miniIcons.map((emoji, i) => (
                                                    <span key={i} className="text-xs">
                                                        {emoji}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tooltip au survol - Label complet */}
                                    <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 px-3 py-1 rounded text-xs text-gray-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 border border-gray-700">
                                        {getCellLabel(index)}
                                        {intensity > 0 && ` (${intensity} données)`}
                                    </div>

                                    {/* Indicateur "données présentes" */}
                                    {intensity > 0 && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border border-green-300" />
                                    )}
                                </motion.button>
                            );
                        })}

                        {/* Bouton "Ajouter plus de cellules" */}
                        {canAddMore && (
                            <motion.button
                                onClick={handleAddCells}
                                className="w-14 h-14 rounded-lg border-2 border-dashed border-gray-600 hover:border-gray-400 flex items-center justify-center flex-shrink-0 transition-all hover:bg-gray-700/30"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Plus className="w-5 h-5 text-gray-400" />
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Pagination - Si beaucoup de cellules */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between mt-3 px-2">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 0}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 transition-all"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-300" />
                        </button>

                        <span className="text-xs text-gray-400">
                            Page {currentPage + 1} / {totalPages}
                        </span>

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages - 1}
                            className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-700 disabled:opacity-50 transition-all"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>
                    </div>
                )}
            </div>

            {/* Info: Mode Click-to-Edit */}
            <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-2 text-xs text-blue-300 text-center">
                💡 Cliquez sur une cellule pour ajouter ou modifier les données
            </div>

            {/* Modal d'édition de cellule */}
            <AnimatePresence>
                {isModalOpen && selectedCell !== null && (
                    <PipelineCellModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onSave={handleModalSave}
                        cellIndex={selectedCell}
                        cellData={cells[selectedCell] || {}}
                        config={config}
                        isMobileMode={true}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobilePipelineView;
