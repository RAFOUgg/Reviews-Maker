import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { CULTURE_PHASES } from './PipelineWithSidebar';

/**
 * MobilePipelineViewV2 - Timeline optimisée mobile V2
 * 
 * Improvements:
 * ✅ Timeline fullwidth sans sidebar
 * ✅ Click sur cellule → Modal data
 * ✅ Pas de drag-drop (trop fastidieux)
 * ✅ Configuration visible en haut
 * ✅ Pagination simple
 * ✅ Design épuré et intuitif
 */

const MobilePipelineViewV2 = ({
    cells = {},
    config = {},
    cellIndices = [],
    onCellChange,
    readonly = false,
    title = 'Pipeline'
}) => {
    const [selectedCellIndex, setSelectedCellIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [expandedCell, setExpandedCell] = useState(null);

    const CELLS_PER_PAGE = 20;
    const totalPages = Math.ceil(cellIndices.length / CELLS_PER_PAGE);
    const startIdx = currentPage * CELLS_PER_PAGE;
    const visibleCells = cellIndices.slice(startIdx, startIdx + CELLS_PER_PAGE);

    // Get label pour une cellule
    const getCellLabel = (index) => {
        if (config.intervalType === 'phases') {
            const phase = config.customPhases?.[index] || CULTURE_PHASES[index];
            return phase?.shortName || `P${index + 1}`;
        }
        if (config.intervalType === 'weeks') {
            return `S${index + 1}`;
        }
        if (config.intervalType === 'months') {
            const months = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
            return months[index % 12];
        }
        return `J${index + 1}`;
    };

    // Get data density color
    const getDataDensityColor = (cellData) => {
        if (!cellData || Object.keys(cellData).length === 0) {
            return 'bg-gray-700/40 border-gray-600/40';
        }

        let count = 0;
        if (cellData.contents && Array.isArray(cellData.contents)) {
            count = cellData.contents.length;
        } else {
            for (const key in cellData) {
                if (cellData[key] && key !== 'timestamp') count++;
            }
        }

        if (count === 0) return 'bg-gray-700/40 border-gray-600/40';
        if (count === 1) return 'bg-green-900/50 border-green-700/60';
        if (count === 2) return 'bg-green-700/70 border-green-500/80';
        if (count <= 4) return 'bg-green-600/80 border-green-400/90';
        return 'bg-green-500/90 border-green-300';
    };

    // Get data summary icon
    const getDataSummary = (cellData) => {
        if (!cellData) return null;

        const icons = [];
        const iconMap = {
            temperature: '🌡️',
            humidity: '💧',
            light: '💡',
            irrigation: '💧',
            fertilizer: '🧪',
            notes: '📝',
            ph: '⚗️',
            ec: '⚡',
            morphology: '📏',
            harvest: '⚖️',
            curingType: '🔄',
            packaging: '📦',
        };

        for (const key in cellData) {
            if (cellData[key] && iconMap[key] && icons.length < 1) {
                icons.push(iconMap[key]);
            }
        }

        return icons[0] || null;
    };

    const handleCellClick = (index) => {
        if (readonly) return;
        setSelectedCellIndex(index);
        setIsModalOpen(true);
    };

    const handleSaveCell = (data) => {
        if (onCellChange) {
            const updated = { ...cells };
            updated[selectedCellIndex] = { ...updated[selectedCellIndex], ...data };
            onCellChange(updated);
        }
        setIsModalOpen(false);
    };

    return (
        <div className="w-full space-y-4">
            {/* Title */}
            <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold text-gray-100">{title}</h3>
                <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                    {cellIndices.length} étapes
                </span>
            </div>

            {/* Configuration Summary */}
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50 space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Trame:</span>
                    <span className="text-gray-100 font-semibold">
                        {config.intervalType === 'phases' && '12 Phases'}
                        {config.intervalType === 'weeks' && `${config.duration} semaines`}
                        {config.intervalType === 'months' && `${config.duration} mois`}
                        {config.intervalType === 'days' && `${config.duration} jours`}
                    </span>
                </div>
                {config.startDate && (
                    <div className="text-xs text-gray-500">
                        Début: {new Date(config.startDate).toLocaleDateString('fr-FR')}
                    </div>
                )}
            </div>

            {/* Timeline - Horizontal Scroll */}
            <div className="relative">
                <div className="overflow-x-auto pb-3 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-700">
                    <div className="flex gap-2 px-1 min-w-min">
                        {visibleCells.map((index) => {
                            const cellData = cells[index];
                            const hasData = cellData && Object.keys(cellData).length > 0;

                            return (
                                <motion.button
                                    key={index}
                                    onClick={() => handleCellClick(index)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`relative flex flex-col items-center gap-1 flex-shrink-0 transition-all ${selectedCellIndex === index ? 'ring-2 ring-purple-400' : ''
                                        }`}
                                    disabled={readonly}
                                >
                                    {/* Cell */}
                                    <div
                                        className={`w-14 h-14 rounded-lg border-2 flex items-center justify-center text-xs font-bold 
                                        ${getDataDensityColor(cellData)} hover:scale-105 transition-all cursor-pointer`}
                                    >
                                        {getDataSummary(cellData) && (
                                            <span className="text-base">{getDataSummary(cellData)}</span>
                                        )}
                                        {!hasData && (
                                            <span className="text-gray-500 text-xs">{getCellLabel(index)}</span>
                                        )}
                                    </div>

                                    {/* Label */}
                                    <span className="text-xs text-gray-400 font-medium">
                                        {getCellLabel(index)}
                                    </span>

                                    {/* Data indicator dot */}
                                    {hasData && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-1.5 h-1.5 bg-purple-400 rounded-full"
                                        />
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {/* Pagination Info */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                        <button
                            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                            disabled={currentPage === 0}
                            className={`p-1 rounded transition ${currentPage === 0
                                    ? 'text-gray-600 cursor-not-allowed'
                                    : 'text-purple-400 hover:bg-purple-400/10'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <span className="text-xs text-gray-400">
                            Page {currentPage + 1}/{totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                            disabled={currentPage === totalPages - 1}
                            className={`p-1 rounded transition ${currentPage === totalPages - 1
                                    ? 'text-gray-600 cursor-not-allowed'
                                    : 'text-purple-400 hover:bg-purple-400/10'
                                }`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Quick Add Button */}
            {!readonly && (
                <button className="w-full py-2.5 rounded-lg bg-purple-600/20 border border-purple-500/50 text-purple-300 text-sm font-medium hover:bg-purple-600/30 transition-all flex items-center justify-center gap-2">
                    <Plus className="w-4 h-4" />
                    Ajouter des données
                </button>
            )}

            {/* Cell Editor Modal */}
            <AnimatePresence>
                {isModalOpen && selectedCellIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end"
                    >
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            className="w-full bg-gray-800 rounded-t-2xl p-6 max-h-[80vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-100">
                                    {getCellLabel(selectedCellIndex)}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-700 rounded-lg transition"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-4 text-sm text-gray-300">
                                <p>Éditeur de données pour {getCellLabel(selectedCellIndex)}</p>
                                <p className="text-xs text-gray-500">
                                    (Interface complète à implémenter selon structure PipelineCellModal)
                                </p>

                                {cells[selectedCellIndex] && (
                                    <pre className="bg-gray-900 p-3 rounded text-xs overflow-auto text-gray-400">
                                        {JSON.stringify(cells[selectedCellIndex], null, 2)}
                                    </pre>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-100 transition"
                                >
                                    Fermer
                                </button>
                                <button
                                    onClick={() => {
                                        handleSaveCell(cells[selectedCellIndex] || {});
                                    }}
                                    className="flex-1 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition font-medium"
                                >
                                    Enregistrer
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobilePipelineViewV2;
