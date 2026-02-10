import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, Download, Upload, Info, FolderPlus } from 'lucide-react';
import PipelineContentsSidebar from '../../shared/orchard/PipelineContentsSidebar';
import PipelineGridView from './PipelineGridView';
import PipelineDataModal from '../core/PipelineDataModal';
import PresetGroupsManager from '../../shared/config/PresetGroupsManager';
import LiquidCard from '../../ui/LiquidCard'
import LiquidButton from '../../ui/LiquidButton';

/**
 * PipelineWithSidebar - Composant principal du système PipeLine CDC
 * 
 * Architecture:
 * - Volet latéral gauche: Contenus hiérarchisés (environnement, lumière, irrigation, etc.)
 * - Grille centrale: Cases temporelles (jours/semaines/phases)
 * - Modal contextuel: Édition détaillée par case
 * 
 * Fonctionnalités:
 * ✅ Drag & drop contenus → cases
 * ✅ Menu contextuel par case
 * ✅ Visualisation résumée (icônes, couleurs)
 * ✅ Multi-sélection et application en masse
 * ✅ Préréglages sauvegardés
 * ✅ Pagination (>365 jours)
 */

// Types d'intervalles CDC complets
export const INTERVAL_TYPES = {
    seconds: { label: 'Secondes', unit: 's', max: 900, defaultDuration: 60 },
    minutes: { label: 'Minutes', unit: 'min', max: 1440, defaultDuration: 60 },
    hours: { label: 'Heures', unit: 'h', max: 336, defaultDuration: 168 },
    days: { label: 'Jours', unit: 'j', max: 365, defaultDuration: 90 },
    dates: { label: 'Dates', unit: 'date', requiresStartEnd: true },
    weeks: { label: 'Semaines', unit: 'S', max: 52, defaultDuration: 12 },
    months: { label: 'Mois', unit: 'M', max: 12, defaultDuration: 6 },
    years: { label: 'Années', unit: 'Y', max: 100, defaultDuration: 1 },
    phases: { label: 'Phases', unit: 'P', max: 12, defaultDuration: 12, isPredefined: true }
};

// Allowed interval types per pipeline type (keys from INTERVAL_TYPES)
const ALLOWED_INTERVALS_BY_PIPELINE = {
    culture: ['phases', 'days', 'weeks', 'months', 'years'],
    curing: ['seconds', 'hours', 'days', 'weeks', 'phases'],
    separation: ['seconds', 'hours', 'days', 'weeks', 'phases'],
    extraction: ['seconds', 'hours', 'days', 'weeks', 'phases'],
    purification: ['seconds', 'hours', 'days', 'weeks'],
    recipe: ['minutes', 'hours']
};

import { CULTURE_PHASES, CURING_PHASES, SEPARATION_PHASES, EXTRACTION_PHASES, RECIPE_PHASES } from '../../../config/pipelinePhases';


const PipelineWithSidebar = ({
    pipelineType = 'culture', // culture | separation | extraction | curing | recette
    productType = 'flower', // flower | hash | concentrate | edible
    value = {},
    onChange,
    contentSchema = [], // Schéma des contenus disponibles dans le sidebar
    readonly = false
}) => {
    // État de configuration de la trame
    const defaultPhasesByType = (type) => {
        switch (type) {
            case 'curing': return CURING_PHASES?.phases || [];
            case 'separation': return SEPARATION_PHASES?.phases || [];
            case 'extraction': return EXTRACTION_PHASES?.phases || [];
            case 'recipe': return RECIPE_PHASES?.phases || [];
            case 'culture':
            default:
                return CULTURE_PHASES?.phases || [];
        }
    };

    const [config, setConfig] = useState({
        intervalType: value.intervalType || 'days',
        duration: value.duration || INTERVAL_TYPES.days.defaultDuration,
        startDate: value.startDate || null,
        endDate: value.endDate || null,
        customPhases: value.customPhases || defaultPhasesByType(pipelineType)
    });

    // Données des cases (cellules) indexées par position
    const [cells, setCells] = useState(value.cells || {});

    // État UI
    const [selectedCell, setSelectedCell] = useState(null);
    const [selectedCells, setSelectedCells] = useState([]); // Multi-sélection
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [draggedContent, setDraggedContent] = useState(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [showPresetsManager, setShowPresetsManager] = useState(false);
    const [droppedItemForModal, setDroppedItemForModal] = useState(null); // Item qui vient d'être droppé

    // Dynamic height measurement to make sidebar scroll reliable
    const pipelineAreaRef = useRef(null);
    const [availableHeight, setAvailableHeight] = useState(null);

    useLayoutEffect(() => {
        if (!pipelineAreaRef.current) return;
        const measure = () => {
            const rect = pipelineAreaRef.current.getBoundingClientRect();
            const top = rect.top;

            // Detect footer height if present
            const footer = document.querySelector('footer');
            const footerHeight = footer ? footer.getBoundingClientRect().height : 0;

            // Sum visible fixed bottom elements (e.g., floating action bars)
            let fixedBottomHeight = 0;
            document.querySelectorAll('[class*="fixed"]').forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.position === 'fixed') {
                    const bounds = el.getBoundingClientRect();
                    // consider elements that touch or are near the bottom
                    if (bounds.bottom >= window.innerHeight - 4) {
                        fixedBottomHeight += bounds.height;
                    }
                }
            });

            const padding = 24; // small safety spacing
            const available = Math.max(200, window.innerHeight - top - footerHeight - fixedBottomHeight - padding);
            setAvailableHeight(Math.round(available));
        };

        measure();
        window.addEventListener('resize', measure);
        const ro = new ResizeObserver(measure);
        const header = document.querySelector('header');
        if (header) ro.observe(header);
        const footerEl = document.querySelector('footer');
        if (footerEl) ro.observe(footerEl);

        return () => {
            window.removeEventListener('resize', measure);
            ro.disconnect();
        };
    }, [pipelineAreaRef.current]);

    // Pagination: 100 cases par page max
    const CELLS_PER_PAGE = 100;
    const totalCells = calculateTotalCells(config);
    const totalPages = Math.ceil(totalCells / CELLS_PER_PAGE);

    // Synchroniser avec value externe
    useEffect(() => {
        if (value.cells) setCells(value.cells);
        if (value.intervalType || value.duration) {
            setConfig(prev => ({
                ...prev,
                intervalType: value.intervalType || prev.intervalType,
                duration: value.duration || prev.duration,
                startDate: value.startDate || prev.startDate,
                endDate: value.endDate || prev.endDate
            }));
        }
    }, [value]);

    // Calculer le nombre total de cases selon la configuration
    function calculateTotalCells(cfg) {
        const type = INTERVAL_TYPES[cfg.intervalType];

        if (cfg.intervalType === 'dates' && cfg.startDate && cfg.endDate) {
            const start = new Date(cfg.startDate);
            const end = new Date(cfg.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
            return days;
        }

        if (cfg.intervalType === 'phases') {
            return cfg.customPhases?.length || 12;
        }

        return Math.min(cfg.duration || type.defaultDuration, type.max || 365);
    }

    // Handler: Modification de configuration
    const handleConfigChange = (field, newValue) => {
        const newConfig = { ...config, [field]: newValue };
        setConfig(newConfig);

        // Réinitialiser la page si changement de trame
        if (field === 'intervalType' || field === 'duration') {
            setCurrentPage(0);
        }

        // Propager aux parents
        onChange({
            ...value,
            intervalType: newConfig.intervalType,
            duration: newConfig.duration,
            startDate: newConfig.startDate,
            endDate: newConfig.endDate,
            cells
        });
    };

    // Handler: Clic sur une case
    const handleCellClick = (cellIndex) => {
        if (readonly) return;

        // Si mode multi-sélection actif (Ctrl/Cmd)
        if (selectedCells.length > 0) {
            if (selectedCells.includes(cellIndex)) {
                setSelectedCells(selectedCells.filter(i => i !== cellIndex));
            } else {
                setSelectedCells([...selectedCells, cellIndex]);
            }
        } else {
            // Ouvrir modal d'édition
            setSelectedCell(cellIndex);
            setIsModalOpen(true);
        }
    };

    // Handler: Drag start depuis sidebar
    const handleDragStart = (content) => {
        setDraggedContent(content);
    };

    // Handler: Drop sur une case
    const handleDropOnCell = (cellIndex) => {
        if (!draggedContent || readonly) return;

        const newCells = { ...cells };

        // Initialiser la cellule si elle n'existe pas
        if (!newCells[cellIndex]) {
            newCells[cellIndex] = {};
        }

        // Ajouter une valeur vide pour le champ droppé
        // (sera remplie via le modal qui s'ouvre juste après)
        const fieldKey = draggedContent.key || draggedContent.type;

        // Ne pas écraser si la donnée existe déjà
        if (newCells[cellIndex][fieldKey] === undefined) {
            newCells[cellIndex][fieldKey] = ''; // Valeur vide à remplir
        }

        setCells(newCells);

        // Conserver l'item droppé pour le modal
        setDroppedItemForModal({ content: draggedContent });
        setDraggedContent(null);

        // Ouvrir modal pour éditer avec l'item droppé
        setSelectedCell(cellIndex);
        setIsModalOpen(true);

        // Propager
        onChange({ ...value, cells: newCells });
    };

    // Handler: Application en masse (sélection multiple)
    const handleApplyToSelection = (data) => {
        if (selectedCells.length === 0) return;

        const newCells = { ...cells };
        selectedCells.forEach(cellIndex => {
            newCells[cellIndex] = { ...(newCells[cellIndex] || {}), ...data };
        });

        setCells(newCells);
        setSelectedCells([]);
        onChange({ ...value, cells: newCells });
    };

    // Handler: Ajouter des cases (bouton +)
    const handleAddCells = (count = 10) => {
        const newDuration = config.duration + count;
        const type = INTERVAL_TYPES[config.intervalType];

        if (newDuration <= (type.max || 365)) {
            handleConfigChange('duration', newDuration);
        }
    };

    // Obtenir les cases de la page courante
    const getPageCells = () => {
        const start = currentPage * CELLS_PER_PAGE;
        const end = start + CELLS_PER_PAGE;
        const allCellIndices = Array.from({ length: totalCells }, (_, i) => i);
        return allCellIndices.slice(start, end);
    };

    // Handler: Exporter les données
    const handleExport = () => {
        const exportData = {
            pipelineType,
            productType,
            config,
            cells,
            exportedAt: new Date().toISOString()
        };

        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pipeline-${pipelineType}-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
    };

    // Handler: Importer les données
    const handleImport = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                try {
                    const importData = JSON.parse(event.target.result);
                    if (importData.config && importData.cells) {
                        setConfig(importData.config);
                        setCells(importData.cells);
                        onChange({
                            ...value,
                            ...importData
                        });
                    }
                } catch (err) {
                    console.error('Erreur lors de l\'import:', err);
                    alert('Erreur lors de l\'import du fichier');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    return (
        <LiquidCard className="w-full">
            {/* En-tête */}
            <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            🧬 PipeLine {pipelineType.charAt(0).toUpperCase() + pipelineType.slice(1)}
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            Glissez-déposez les contenus sur les cases, cliquez pour éditer
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <LiquidButton
                            size="sm"
                            variant="primary"
                            onClick={() => setShowPresetsManager(true)}
                            title="Gérer les groupes de pré-réglages"
                        >
                            <FolderPlus className="w-4 h-4 mr-1" />
                            Groupes
                        </LiquidButton>
                        <LiquidButton size="sm" variant="ghost">
                            <Upload className="w-4 h-4" />
                        </LiquidButton>
                        <LiquidButton size="sm" variant="ghost">
                            <Download className="w-4 h-4" />
                        </LiquidButton>
                        <LiquidButton size="sm" variant="ghost">
                            <Save className="w-4 h-4" />
                        </LiquidButton>
                    </div>
                </div>
            </div>

            {/* Layout principal: Configuration + Grille (vertical stack) */}
            <div className="flex flex-col gap-4 h-full min-h-0">
                {/* Configuration section avec scrollable container */}
                <div className="flex-shrink-0 max-h-[200px] sm:max-h-[250px] md:max-h-[280px] overflow-y-auto bg-white/50 rounded-lg p-3 sm:p-4">
                    <div className="space-y-3">
                        {/* Interval type + Duration */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700">Type</label>
                                <select
                                    value={config.intervalType}
                                    onChange={(e) => handleConfigChange('intervalType', e.target.value)}
                                    className="w-full mt-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded"
                                >
                                    {(ALLOWED_INTERVALS_BY_PIPELINE[pipelineType] || Object.keys(INTERVAL_TYPES)).map((key) => {
                                        const val = INTERVAL_TYPES[key];
                                        if (!val) return null;
                                        return <option key={key} value={key}>{val.label}</option>;
                                    })}
                                </select>
                            </div>
                            <div>
                                <label className="text-xs sm:text-sm font-medium text-gray-700">Durée</label>
                                <input
                                    type="number"
                                    value={config.duration}
                                    onChange={(e) => handleConfigChange('duration', parseInt(e.target.value) || 1)}
                                    max={INTERVAL_TYPES[config.intervalType].max}
                                    className="w-full mt-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded"
                                />
                            </div>
                            {config.intervalType === 'dates' && (
                                <>
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-700">Début</label>
                                        <input
                                            type="date"
                                            value={config.startDate || ''}
                                            onChange={(e) => handleConfigChange('startDate', e.target.value)}
                                            className="w-full mt-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs sm:text-sm font-medium text-gray-700">Fin</label>
                                        <input
                                            type="date"
                                            value={config.endDate || ''}
                                            onChange={(e) => handleConfigChange('endDate', e.target.value)}
                                            className="w-full mt-1 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm border rounded"
                                        />
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Action buttons (compact on mobile) */}
                        <div className="flex flex-wrap gap-2 pt-2 border-t">
                            <button
                                onClick={() => setShowPresetsManager(true)}
                                className="flex-1 min-w-[100px] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                            >
                                Préréglages
                            </button>
                            <button
                                onClick={handleExport}
                                className="flex-1 min-w-[100px] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-green-500 text-white rounded hover:bg-green-600"
                            >
                                Exporter
                            </button>
                            <button
                                onClick={handleImport}
                                className="flex-1 min-w-[100px] px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm bg-purple-500 text-white rounded hover:bg-purple-600"
                            >
                                Importer
                            </button>
                        </div>

                        {/* Info et pagination */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t text-xs sm:text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                                <Info className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span>{totalCells} cases</span>
                                {selectedCells.length > 0 && (
                                    <span className="ml-2 text-blue-600">
                                        {selectedCells.length} sélect.
                                    </span>
                                )}
                            </div>

                            {totalPages > 1 && (
                                <div className="flex items-center gap-1 text-xs">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                                        disabled={currentPage === 0}
                                        className="px-1.5 py-0.5 bg-gray-300 rounded disabled:opacity-50"
                                    >
                                        ←
                                    </button>
                                    <span className="px-1">{currentPage + 1}/{totalPages}</span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                                        disabled={currentPage === totalPages - 1}
                                        className="px-1.5 py-0.5 bg-gray-300 rounded disabled:opacity-50"
                                    >
                                        →
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Layout responsive: Sidebar left on desktop, stacked on mobile */}
                    <div ref={pipelineAreaRef} className="flex flex-col md:flex-row gap-4 flex-1 min-h-0" style={availableHeight ? { height: `${availableHeight}px` } : undefined}>
                        {/* Sidebar: full-width on mobile (stacked), fixed width on md+ */}
                        <div className="w-full md:w-80 md:flex-shrink-0 bg-gray-50 rounded-lg p-2 sm:p-3 overflow-y-auto min-h-0 h-full">
                            <PipelineContentsSidebar
                                contentSchema={contentSchema}
                                onDragStart={handleDragStart}
                                pipelineType={pipelineType}
                                readonly={readonly}
                            />
                        </div>

                        {/* Right area: config + grid */}
                        <div className="flex-1 flex flex-col gap-3 min-h-0 h-full">
                            {/* Config kept compact */}
                            <div className="flex-shrink-0 max-h-[160px] sm:max-h-[220px] overflow-y-auto">
                                {/* existing config content is above, so nothing to duplicate here */}
                            </div>

                            {/* Grid - takes remaining space and scrolls internally */}
                            <div className="flex-1 min-h-0 overflow-auto">
                                <PipelineGridView
                                    cells={cells}
                                    config={config}
                                    cellIndices={getPageCells()}
                                    onCellClick={handleCellClick}
                                    onDropOnCell={handleDropOnCell}
                                    draggedContent={draggedContent}
                                    selectedCells={selectedCells}
                                    readonly={readonly}
                                    onAddCells={handleAddCells}
                                    canAddMore={config.duration < (INTERVAL_TYPES[config.intervalType].max || 365)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal d'édition */}
                <AnimatePresence>
                    {isModalOpen && selectedCell !== null && (
                        <PipelineDataModal
                            isOpen={isModalOpen}
                            onClose={() => {
                                setIsModalOpen(false);
                                setSelectedCell(null);
                                setDroppedItemForModal(null);
                            }}
                            cellData={cells[selectedCell] || {}}
                            sidebarSections={contentSchema}
                            onSave={(payload) => {
                                const cellIndex = payload.timestamp || selectedCell;
                                const cellData = payload.data || payload;
                                handleSaveCell(cellIndex, cellData);
                            }}
                            timestamp={selectedCell}
                            intervalLabel={`Jour ${selectedCell + 1}`}
                            droppedItem={droppedItemForModal}
                            pipelineType={pipelineType}
                        />
                    )}

                    {/* Gestionnaire de groupes de pré-réglages */}
                    <PresetGroupsManager
                        isOpen={showPresetsManager}
                        onClose={() => setShowPresetsManager(false)}
                        pipelineType={pipelineType}
                        sidebarSections={contentSchema}
                        onApplyGroup={(groupFields) => {
                            // Appliquer le groupe à la case sélectionnée ou aux cases multi-sélectionnées
                            if (selectedCells.length > 0) {
                                handleApplyToSelection(groupFields);
                            } else if (selectedCell !== null) {
                                handleSaveCell(selectedCell, { ...cells[selectedCell], ...groupFields });
                            }
                            setShowPresetsManager(false);
                        }}
                    />
                </AnimatePresence>

                {/* Boutons d'action si multi-sélection */}
                {selectedCells.length > 0 && (
                    <div className="fixed bottom-6 right-6 bg-gray-800 border border-gray-700 rounded-xl p-4 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <span className="text-white font-medium">
                                {selectedCells.length} case(s) sélectionnée(s)
                            </span>
                            <LiquidButton
                                size="sm"
                                onClick={() => {
                                    // Ouvrir modal pour données à appliquer
                                    setSelectedCell(selectedCells[0]);
                                    setIsModalOpen(true);
                                }}
                            >
                                Appliquer des données
                            </LiquidButton>
                            <LiquidButton
                                size="sm"
                                variant="ghost"
                                onClick={() => setSelectedCells([])}
                            >
                                Annuler
                            </LiquidButton>
                        </div>
                    </div>
                )}
            </div>
        </LiquidCard>
    );
};

export default PipelineWithSidebar;




