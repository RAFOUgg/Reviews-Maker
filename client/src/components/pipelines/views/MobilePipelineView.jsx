import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import PipelineCellModal from '../core/PipelineCellModal';
import { CULTURE_PHASES } from './PipelineWithSidebar';

/**
 * MobilePipelineView - Vue timeline optimisée pour mobile
 * COMPLÈTEMENT REVU POUR MOBILE FIRST
 * 
 * Caractéristiques:
 * ✅ Pas de drag-drop (inutilisable sur mobile)
 * ✅ Ajout via cellule (click → modal)
 * ✅ Timeline horizontale scrollable compacte
 * ✅ Cellules visuelles avec densité
 * ✅ 100% responsive
 * ✅ Aucun overflow horizontal
 * ✅ Boutons accessibles au pouce
 * ✅ Pagination fluide
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
    const [currentPage, setCurrentPage] = useState(0);

    // Pagination optimisée mobile: 12 cellules par page (taille petite)
    const CELLS_PER_PAGE = 12;
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

    // Couleurs selon intensité - Optimisé pour petites tailles
    const getIntensityColor = (intensity) => {
        const baseClasses = 'w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 flex items-center justify-center cursor-pointer transition-all active:scale-95';
        if (intensity === 0) return `${baseClasses} bg-gray-700/40 border-gray-600/40`;
        if (intensity === 1) return `${baseClasses} bg-green-900/50 border-green-700/60`;
        if (intensity === 2) return `${baseClasses} bg-green-700/70 border-green-500/80`;
        if (intensity === 3) return `${baseClasses} bg-green-500/80 border-green-400/90`;
        return `${baseClasses} bg-green-400/90 border-green-300`;
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

        return icons.slice(0, 1); // Max 1 icône sur mobile
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
        <div className="w-full space-y-3">
            {/* Configuration Summary - Compact */}
            <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/50 space-y-1">
                <div className="text-xs font-semibold text-purple-400">
                    ⚙️ Configuration
                </div>
                <div className="text-xs text-gray-300">
                    Trame: <span className="text-purple-300 font-medium">
                        {config.intervalType === 'phases' ? '12 Phases' : `${config.duration} ${config.intervalType}`}
                    </span>
                </div>
                {config.startDate && (
                    <div className="text-xs text-gray-400">
                        Début: {new Date(config.startDate).toLocaleDateString('fr-FR')}
                    </div>
                )}
            </div>

            {/* Timeline - Horizontal Scroll Optimisé */}
            <div className="relative">
                {/* Timeline container - Full width, no overflow */}
                <div className="overflow-x-auto -mx-3 px-3 pb-2 scrollbar-hide">
                    <div className="flex gap-1.5 min-w-min">
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
                                    className={`${getIntensityColor(intensity)} flex-shrink-0 relative group ${
                                        isSelected ? 'ring-2 ring-purple-500' : ''
                                    }`}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {/* Contenu de la cellule */}
                                    <div className="flex flex-col items-center justify-center gap-0.5 w-full h-full p-1">
                                        {icon && (
                                            <span className="text-lg leading-none">{icon}</span>
                                        )}
                                        {!icon && (
                                            <div className="text-xs font-bold text-gray-100 leading-none">
                                                {label}
                                            </div>
                                        )}
                                        {miniIcons.length > 0 && (
                                            <div className="text-xs leading-none">
                                                {miniIcons[0]}
                                            </div>
                                        )}
                                    </div>

                                    {/* Indicateur "données présentes" */}
                                    {intensity > 0 && (
                                        <motion.div
                                            className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border border-green-300"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                        />
                                    )}
                                </motion.button>
                            );
                        })}

                        {/* Bouton "Ajouter plus de cellules" */}
                        {canAddMore && (
                            <motion.button
                                onClick={handleAddCells}
                                className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center flex-shrink-0 transition-all active:scale-95"
                                whileTap={{ scale: 0.9 }}
                            >
                                <Plus className="w-4 h-4 text-gray-400" />
                            </motion.button>
                        )}
                    </div>
                </div>

                {/* Pagination - Compact */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-2">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 0}
                            className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 disabled:opacity-30 transition-all active:scale-90"
                        >
                            <ChevronLeft className="w-4 h-4 text-gray-300" />
                        </button>

                        <span className="text-xs text-gray-400 min-w-[50px] text-center">
                            {currentPage + 1}/{totalPages}
                        </span>

                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages - 1}
                            className="p-1.5 rounded-lg bg-gray-700/50 hover:bg-gray-700 disabled:opacity-30 transition-all active:scale-90"
                        >
                            <ChevronRight className="w-4 h-4 text-gray-300" />
                        </button>
                    </div>
                )}
            </div>

            {/* Hint: Click to Add Data */}
            {!readonly && (
                <div className="bg-blue-900/20 border border-blue-700/40 rounded-lg p-2 text-xs text-blue-300 text-center">
                    👇 Cliquez sur une cellule pour ajouter des données
                </div>
            )}

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


