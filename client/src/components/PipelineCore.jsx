import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Info, TrendingUp, Download } from 'lucide-react';
import { LiquidCard } from './liquid';
import PipelineCellEditor from './PipelineCellEditor';
import { INTERVAL_TYPES } from '../../types/pipelineTypes';

/**
 * PipelineCore - Timeline universelle GitHub-style
 * 
 * Composant réutilisable pour tous les types de pipelines
 * Gère l'affichage de la grille, les interactions, les tooltips
 * Délègue le contenu spécifique à chaque pipeline via props
 * 
 * @param {string} type - Type de pipeline (culture, curing, separation, extraction, purification)
 * @param {string} productType - Type de produit (flower, hash, concentrate, edible)
 * @param {object} config - Configuration intervalle (intervalType, startDate, endDate, duration, phases)
 * @param {object} cells - Données des cellules { [index]: PipelineCell }
 * @param {function} onCellUpdate - Callback mise à jour cellule
 * @param {object} fieldSchema - Schéma des champs éditables (sections + fields)
 * @param {function} renderCell - Fonction custom rendu cellule (optionnel)
 * @param {boolean} showEvolutionTracking - Afficher graphiques évolution notes
 */
const PipelineCore = ({
    type = 'curing',
    productType = 'flower',
    config = {},
    cells = {},
    onCellUpdate,
    fieldSchema,
    renderCell,
    showEvolutionTracking = false,
    title = 'Pipeline',
    description = ''
}) {
    const [editingCell, setEditingCell] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // Calcul nombre total de cases
    const totalCells = useMemo(() => {
        if (config.intervalType === INTERVAL_TYPES.PHASES) {
            return config.customPhases?.length || 12; // 12 phases par défaut
        }

        if (config.endDate && config.startDate &&
            (config.intervalType === INTERVAL_TYPES.DAYS || config.intervalType === INTERVAL_TYPES.WEEKS)) {
            const start = new Date(config.startDate);
            const end = new Date(config.endDate);
            const diffTime = Math.abs(end - start);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (config.intervalType === INTERVAL_TYPES.DAYS) return diffDays || 1;
            if (config.intervalType === INTERVAL_TYPES.WEEKS) return Math.ceil(diffDays / 7) || 1;
        }

        return config.duration || 30;
    }, [config]);

    // Grid layout adaptatif
    const gridCols = useMemo(() => {
        switch (config.intervalType) {
            case INTERVAL_TYPES.DAYS:
                return 53; // Style GitHub (53 semaines)
            case INTERVAL_TYPES.WEEKS:
                return 52;
            case INTERVAL_TYPES.MONTHS:
                return 12;
            case INTERVAL_TYPES.PHASES:
                return 4; // 4 colonnes pour 12 phases (3 lignes)
            case INTERVAL_TYPES.HOURS:
                return 24;
            case INTERVAL_TYPES.MINUTES:
            case INTERVAL_TYPES.SECONDS:
                return 60;
            default:
                return Math.min(totalCells, 30);
        }
    }, [config.intervalType, totalCells]);

    // Calcul intensité cellule (0-4) selon données remplies
    const getCellIntensity = (cellData) => {
        if (!cellData) return 0;

        let filledFields = 0;
        let totalFields = 0;

        // Compter champs remplis
        const countFields = (obj, depth = 0) => {
            if (!obj || depth > 3) return;

            Object.values(obj).forEach(value => {
                totalFields++;
                if (value !== null && value !== undefined && value !== '') {
                    if (Array.isArray(value)) {
                        if (value.length > 0) filledFields++;
                    } else if (typeof value === 'object') {
                        countFields(value, depth + 1);
                    } else {
                        filledFields++;
                    }
                }
            });
        };

        countFields(cellData);

        if (filledFields === 0) return 0;
        const ratio = filledFields / totalFields;
        if (ratio < 0.25) return 1;
        if (ratio < 0.5) return 2;
        if (ratio < 0.75) return 3;
        return 4;
    };

    // Rendu cellule par défaut
    const defaultRenderCell = (index, cellData, intensity) => {
        const isPhaseMode = config.intervalType === INTERVAL_TYPES.PHASES;
        const phase = isPhaseMode ? config.customPhases?.[index] : null;

        return (
            <motion.div
                key={index}
                whileHover={{ scale: 1.15, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCellClick(index, cellData)}
                className={`relative group cursor-pointer ${isPhaseMode ? 'w-10 h-10 md:w-12 md:h-12' : 'w-3 h-3 md:w-3.5 md:h-3.5'} rounded-sm border transition-all duration-200 hover: hover:shadow-lg hover:shadow-blue-400/50 hover:ring-2 hover:/50 ${getIntensityColor(intensity)}`}
                style={isPhaseMode && phase ? {
                    backgroundColor: phase.color + '80',
                    borderColor: phase.color
                } : {}}
                title={getCellTooltip(index, cellData, phase)}
            >
                {isPhaseMode && phase && (
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                        {phase.icon}
                    </div>
                )}
            </motion.div>
        );
    };

    const getIntensityColor = (level) => {
        if (level === 0) return 'bg-gray-800/30 border-gray-700/30';
        if (level === 1) return 'bg-green-900/40 border-green-700/50';
        if (level === 2) return 'bg-green-700/60 border-green-500/70';
        if (level === 3) return 'bg-green-500/80 border-green-400/90';
        return 'bg-green-400 border-green-300';
    };

    const getCellTooltip = (index, cellData, phase) => {
        if (!cellData || Object.keys(cellData).length === 0) {
            return phase ? `${phase.name} - Non renseigné` : `Case ${index + 1} - Non renseigné`;
        }

        const parts = [];
        if (phase) parts.push(phase.name);
        if (cellData.environment?.temperature) parts.push(`${cellData.environment.temperature}°C`);
        if (cellData.environment?.humidity) parts.push(`${cellData.environment.humidity}%`);
        if (cellData.notes) parts.push('📝 Notes');

        return parts.join(' • ') || `Case ${index + 1}`;
    };

    const handleCellClick = (index, cellData) => {
        setEditingCell({ index, data: cellData || {} });
        setShowModal(true);
    };

    const handleCellSave = (updatedData) => {
        if (onCellUpdate && editingCell !== null) {
            onCellUpdate(editingCell.index, updatedData);
        }
        setShowModal(false);
        setEditingCell(null);
    };

    const handleCellClose = () => {
        setShowModal(false);
        setEditingCell(null);
    };

    // Statistiques
    const filledCellsCount = Object.keys(cells).length;
    const completionPercent = Math.round((filledCellsCount / totalCells) * 100);

    return (
        <LiquidCard variant="default" className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar className="w-6 h-6" />
                        <h3 className="text-2xl font-bold text-white">{title}</h3>
                    </div>
                    {description && (
                        <p className="text-sm text-gray-400">{description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                        Style GitHub Commits - Tracabilité évolutive 3D
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    {/* Statistiques */}
                    <div className="text-right">
                        <div className="text-2xl font-bold">{completionPercent}%</div>
                        <div className="text-xs text-gray-400">{filledCellsCount}/{totalCells} cases</div>
                    </div>
                </div>
            </div>

            {/* Info */}
            <div className="flex items-center gap-2 text-xs text-gray-400 rounded-lg p-3 border /30">
                <Info className="w-4 h-4 flex-shrink-0" />
                <span>Cliquez sur une case pour éditer les données de cette période</span>
            </div>

            {/* Grille */}
            <div className="space-y-4">
                {config.intervalType === INTERVAL_TYPES.PHASES ? (
                    // Mode phases: Grille 4 colonnes
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Array.from({ length: totalCells }, (_, idx) => {
                            const cellData = cells[idx];
                            const intensity = getCellIntensity(cellData);
                            return renderCell
                                ? renderCell(idx, cellData, intensity)
                                : defaultRenderCell(idx, cellData, intensity);
                        })}
                    </div>
                ) : (
                    // Mode timeline: Grille dense style GitHub
                    <div
                        className="grid gap-1"
                        style={{
                            gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
                            maxWidth: '100%',
                            overflowX: 'auto'
                        }}
                    >
                        {Array.from({ length: totalCells }, (_, idx) => {
                            const cellData = cells[idx];
                            const intensity = getCellIntensity(cellData);
                            return renderCell
                                ? renderCell(idx, cellData, intensity)
                                : defaultRenderCell(idx, cellData, intensity);
                        })}
                    </div>
                )}
            </div>

            {/* Légende intensité */}
            <div className="flex items-center gap-4 text-xs text-gray-400">
                <span>Moins</span>
                <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map(level => (
                        <div
                            key={level}
                            className={`w-4 h-4 rounded-sm ${getIntensityColor(level)}`}
                            title={`Niveau ${level}`}
                        />
                    ))}
                </div>
                <span>Plus</span>
            </div>

            {/* Evolution tracking (si activé) */}
            {showEvolutionTracking && filledCellsCount > 0 && (
                <div className="mt-6 p-4 rounded-lg border /30">
                    <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="w-5 h-5" />
                        <h4 className="text-sm font-semibold text-white">Évolution des données</h4>
                    </div>
                    <p className="text-xs text-gray-400">
                        Graphiques d'évolution disponibles à l'export GIF
                    </p>
                </div>
            )}

            {/* Modal édition cellule */}
            <AnimatePresence>
                {showModal && editingCell && (
                    <PipelineCellEditor
                        cellIndex={editingCell.index}
                        cellData={editingCell.data}
                        fieldSchema={fieldSchema}
                        onSave={handleCellSave}
                        onClose={handleCellClose}
                        productType={productType}
                        pipelineType={type}
                        config={config}
                    />
                )}
            </AnimatePresence>
        </LiquidCard>
    );
};

export default PipelineCore;

