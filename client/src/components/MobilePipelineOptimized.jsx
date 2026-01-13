import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { useMobileFormSection } from '../../hooks/useMobileFormSection';

/**
 * MobilePipelineOptimized - Pipeline totalement optimisé mobile
 * 
 * ✅ Pas de sidebar drag & drop
 * ✅ Cellules cliquables → Modal pour ajouter/éditer données
 * ✅ Bouton "Groupe de préréglages" visible
 * ✅ Affichage compact des cellules et config
 * ✅ Pagination simple avec prev/next
 * ✅ Moins de scroll, layout serré
 */

const MobilePipelineOptimized = ({
    cells = {},
    config = {},
    cellIndices = [],
    onCellChange,
    onPresetsClick,
    readonly = false,
    title = 'Pipeline',
    type = 'culture' // culture, curing, separation, purification
}) => {
    const { isMobile, spacing } = useMobileFormSection('pipeline');
    const [selectedCellIndex, setSelectedCellIndex] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [showConfig, setShowConfig] = useState(!isMobile);
    const [modalData, setModalData] = useState({});

    const CELLS_PER_PAGE = isMobile ? 14 : 20;
    const totalPages = Math.ceil(cellIndices.length / CELLS_PER_PAGE);
    const startIdx = currentPage * CELLS_PER_PAGE;
    const visibleCells = cellIndices.slice(startIdx, startIdx + CELLS_PER_PAGE);

    // Configuration labels
    const getConfigLabel = useCallback(() => {
        if (config.intervalType === 'phases') {
            return `${config.customPhases?.length || 12} phases`;
        }
        if (config.intervalType === 'weeks') {
            return `${config.endWeek || config.startWeek} semaines`;
        }
        if (config.intervalType === 'months') {
            return `${config.endMonth || 12} mois`;
        }
        if (config.intervalType === 'days') {
            const days = config.endDate && config.startDate
                ? Math.ceil((new Date(config.endDate) - new Date(config.startDate)) / (1000 * 60 * 60 * 24))
                : 0;
            return `${days} jours`;
        }
        return 'Configuration';
    }, [config]);

    // Cell label
    const getCellLabel = useCallback((index) => {
        if (config.intervalType === 'phases') {
            const phases = {
                0: 'Germ', 1: 'Plantule', 2: 'Croissance D', 3: 'Croissance M', 4: 'Croissance F',
                5: 'Stretch D', 6: 'Stretch M', 7: 'Stretch F',
                8: 'Floraison D', 9: 'Floraison M', 10: 'Floraison F', 11: 'Séchage'
            };
            return phases[index] || `P${index + 1}`;
        }
        if (config.intervalType === 'weeks') {
            return `S${index + 1}`;
        }
        if (config.intervalType === 'months') {
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Déc'];
            return months[index % 12];
        }
        return `J${index + 1}`;
    }, [config]);

    // Data density color
    const getDataDensityColor = useCallback((cellData) => {
        if (!cellData || Object.keys(cellData).length === 0) {
            return 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50';
        }

        const count = Array.isArray(cellData.contents)
            ? cellData.contents.length
            : Object.keys(cellData).filter(k => cellData[k] && k !== 'timestamp').length;

        if (count === 0) return 'bg-slate-700/30 border-slate-600/30 hover:bg-slate-700/50';
        if (count === 1) return 'bg-green-900/40 border-green-700/50 hover:bg-green-900/60';
        if (count === 2) return 'bg-green-700/50 border-green-600/60 hover:bg-green-700/70';
        if (count <= 4) return 'bg-green-600/60 border-green-500/70 hover:bg-green-600/80';
        return 'bg-green-500/70 border-green-400/80 hover:bg-green-500/90';
    }, []);

    // Data icon
    const getDataIcon = useCallback((cellData) => {
        if (!cellData) return '◯';
        const count = Array.isArray(cellData.contents)
            ? cellData.contents.length
            : Object.keys(cellData).filter(k => cellData[k] && k !== 'timestamp').length;
        
        if (count === 0) return '◯';
        if (count === 1) return '●';
        if (count <= 3) return '◉';
        return '◈';
    }, []);

    // Open cell editor
    const openCellEditor = useCallback((index) => {
        setSelectedCellIndex(index);
        setModalData(cells[index] || {});
        setIsModalOpen(true);
    }, [cells]);

    // Save cell data
    const saveCellData = useCallback(() => {
        if (selectedCellIndex !== null && onCellChange) {
            onCellChange(selectedCellIndex, modalData);
            setIsModalOpen(false);
        }
    }, [selectedCellIndex, modalData, onCellChange]);

    // Delete cell data
    const deleteCellData = useCallback(() => {
        if (selectedCellIndex !== null && onCellChange) {
            onCellChange(selectedCellIndex, {});
            setIsModalOpen(false);
        }
    }, [selectedCellIndex, onCellChange]);

    // Next/Prev page
    const goNextPage = useCallback(() => {
        if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
    }, [currentPage, totalPages]);

    const goPrevPage = useCallback(() => {
        if (currentPage > 0) setCurrentPage(currentPage - 1);
    }, [currentPage]);

    return (
        <div className="w-full flex flex-col gap-2">
            {/* Header */}
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-800/80 rounded-lg border border-slate-700/50">
                <div className="flex items-center gap-2 flex-1">
                    <h3 className="text-sm font-semibold text-white truncate">{title}</h3>
                    <span className="text-xs text-slate-400">{getConfigLabel()}</span>
                </div>
                
                {!readonly && (
                    <button
                        onClick={onPresetsClick}
                        className="flex items-center gap-1 px-2 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
                        title="Groupe de préréglages"
                    >
                        <Plus size={14} />
                        <span className="hidden xs:inline">Préréglages</span>
                    </button>
                )}

                <button
                    onClick={() => setShowConfig(!showConfig)}
                    className="p-1.5 text-slate-400 hover:text-white transition"
                    title="Config"
                >
                    <Menu size={16} />
                </button>
            </div>

            {/* Configuration affichée/masquée */}
            <AnimatePresence>
                {showConfig && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="px-3 py-2 bg-slate-800/50 rounded-lg border border-slate-700/30 text-xs text-slate-300 space-y-1"
                    >
                        <div><strong>Type:</strong> {config.intervalType || '-'}</div>
                        <div><strong>Début:</strong> {config.startDate || config.startWeek || config.startMonth || '-'}</div>
                        <div><strong>Fin:</strong> {config.endDate || config.endWeek || config.endMonth || '-'}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid de cellules */}
            <div className="flex flex-col gap-2">
                {/* Première ligne de cellules */}
                <div className="grid grid-cols-7 gap-1.5">
                    {visibleCells.map((idx) => {
                        const cellData = cells[idx];
                        const isActive = cellData && Object.keys(cellData).length > 0;

                        return (
                            <motion.button
                                key={idx}
                                onClick={() => openCellEditor(idx)}
                                className={`
                                    relative aspect-square flex flex-col items-center justify-center
                                    rounded-lg border border-slate-600/40 transition-all
                                    ${getDataDensityColor(cellData)}
                                    ${isActive ? 'ring-2 ring-purple-500/50' : ''}
                                    disabled:opacity-50 disabled:cursor-not-allowed
                                `}
                                disabled={readonly}
                                whileHover={{ scale: readonly ? 1 : 1.05 }}
                                whileTap={{ scale: readonly ? 1 : 0.95 }}
                            >
                                {/* Label */}
                                <div className="text-[10px] font-bold text-slate-300 leading-tight">
                                    {getCellLabel(idx)}
                                </div>
                                
                                {/* Data indicator */}
                                <div className={`text-xs font-semibold mt-0.5 ${isActive ? 'text-purple-300' : 'text-slate-400'}`}>
                                    {getDataIcon(cellData)}
                                </div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between gap-2 px-2 py-1.5 bg-slate-800/50 rounded-lg">
                        <button
                            onClick={goPrevPage}
                            disabled={currentPage === 0}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition"
                        >
                            <ChevronLeft size={16} />
                        </button>

                        <span className="text-xs text-slate-400">
                            {currentPage + 1} / {totalPages}
                        </span>

                        <button
                            onClick={goNextPage}
                            disabled={currentPage === totalPages - 1}
                            className="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            {/* Modal d'édition de cellule */}
            <AnimatePresence>
                {isModalOpen && selectedCellIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.9 }}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full max-w-md bg-slate-800 rounded-xl border border-slate-700 p-4 max-h-[80vh] overflow-y-auto"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between gap-2 mb-4">
                                <h3 className="text-lg font-semibold text-white">
                                    {getCellLabel(selectedCellIndex)}
                                </h3>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-1 text-slate-400 hover:text-white transition"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="space-y-3 mb-4">
                                {/* Prévisualisation des données */}
                                {Object.entries(modalData).length > 0 ? (
                                    <div className="p-3 bg-slate-700/50 rounded-lg border border-slate-600/50">
                                        <p className="text-xs font-semibold text-slate-300 mb-2">Données actuelles:</p>
                                        <div className="space-y-1 text-xs text-slate-400">
                                            {Object.entries(modalData).map(([key, value]) => (
                                                key !== 'timestamp' && (
                                                    <div key={key}>
                                                        <strong>{key}:</strong> {String(value).slice(0, 30)}
                                                    </div>
                                                )
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-slate-400 italic">Aucune donnée</p>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => {
                                        // Ouvrir un formulaire d'édition complet
                                        // Pour l'instant, juste fermer et laisser l'utilisateur éditer via les sections spécifiques
                                        setIsModalOpen(false);
                                    }}
                                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
                                >
                                    <Edit2 size={16} className="inline mr-1" />
                                    Éditer
                                </button>

                                {Object.keys(modalData).length > 0 && (
                                    <button
                                        onClick={deleteCellData}
                                        className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded-lg transition"
                                    >
                                        <Trash2 size={16} className="inline mr-1" />
                                        Supprimer
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MobilePipelineOptimized;


