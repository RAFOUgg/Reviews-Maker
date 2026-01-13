import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, Save, Download, Upload, Info, FolderPlus } from 'lucide-react';
import PipelineContentsSidebar from '../../shared/orchard/PipelineContentsSidebar';
import PipelineGridView from './PipelineGridView';
import PipelineDataModal from './PipelineDataModal';
import PresetGroupsManager from './PresetGroupsManager';
import LiquidCard from './LiquidCard'
import LiquidButton from './LiquidButton';

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
    phases: { label: 'Phases', unit: 'P', max: 12, defaultDuration: 12, isPredefined: true }
};

// Phases prédéfinies pour culture (12 phases CDC)
export const CULTURE_PHASES = [
    { id: 'seed', name: 'Graine', icon: '🌰', order: 0 },
    { id: 'germination', name: 'Germination', icon: '🌱', order: 1 },
    { id: 'seedling', name: 'Plantule', icon: '🌿', order: 2 },
    { id: 'early-veg', name: 'Début Croissance', icon: '🌳', order: 3 },
    { id: 'mid-veg', name: 'Milieu Croissance', icon: '🌲', order: 4 },
    { id: 'late-veg', name: 'Fin Croissance', icon: '🎋', order: 5 },
    { id: 'early-stretch', name: 'Début Stretch', icon: '📈', order: 6 },
    { id: 'mid-stretch', name: 'Milieu Stretch', icon: '📈', order: 7 },
    { id: 'late-stretch', name: 'Fin Stretch', icon: '📈', order: 8 },
    { id: 'early-flower', name: 'Début Floraison', icon: '🌸', order: 9 },
    { id: 'mid-flower', name: 'Milieu Floraison', icon: '🌺', order: 10 },
    { id: 'late-flower', name: 'Fin Floraison', icon: '💐', order: 11 }
];

const PipelineWithSidebar = ({
    pipelineType = 'culture', // culture | separation | extraction | curing | recette
    productType = 'flower', // flower | hash | concentrate | edible
    value = {},
    onChange,
    contentSchema = [], // Schéma des contenus disponibles dans le sidebar
    readonly = false
}) => {
    // État de configuration de la trame
    const [config, setConfig] = useState({
        intervalType: value.intervalType || 'days',
        duration: value.duration || INTERVAL_TYPES.days.defaultDuration,
        startDate: value.startDate || null,
        endDate: value.endDate || null,
        customPhases: value.customPhases || CULTURE_PHASES
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

            {/* Configuration de la trame */}
            <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        Type d'intervalle
                    </label>
                    <select
                        value={config.intervalType}
                        onChange={(e) => handleConfigChange('intervalType', e.target.value)}
                        disabled={readonly}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                    >
                        {Object.entries(INTERVAL_TYPES).map(([key, type]) => (
                            <option key={key} value={key}>{type.label}</option>
                        ))}
                    </select>
                </div>

                {config.intervalType === 'dates' ? (
                    <>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Date début *
                            </label>
                            <input
                                type="date"
                                value={config.startDate || ''}
                                onChange={(e) => handleConfigChange('startDate', e.target.value)}
                                disabled={readonly}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                Date fin *
                            </label>
                            <input
                                type="date"
                                value={config.endDate || ''}
                                onChange={(e) => handleConfigChange('endDate', e.target.value)}
                                disabled={readonly}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            />
                        </div>
                    </>
                ) : config.intervalType !== 'phases' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Durée ({INTERVAL_TYPES[config.intervalType].unit})
                        </label>
                        <input
                            type="number"
                            value={config.duration}
                            onChange={(e) => handleConfigChange('duration', parseInt(e.target.value) || 1)}
                            min="1"
                            max={INTERVAL_TYPES[config.intervalType].max}
                            disabled={readonly}
                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        />
                    </div>
                )}
            </div>

            {/* Info et pagination */}
            <div className="flex items-center justify-between text-sm text-gray-400">
                <div className="flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    <span>{totalCells} cases au total</span>
                    {selectedCells.length > 0 && (
                        <span className="ml-4">
                            {selectedCells.length} sélectionnée(s)
                        </span>
                    )}
                </div>

                {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                            disabled={currentPage === 0}
                            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
                        >
                            ←
                        </button>
                        <span>Page {currentPage + 1} / {totalPages}</span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))}
                            disabled={currentPage === totalPages - 1}
                            className="px-3 py-1 bg-gray-800 rounded disabled:opacity-50"
                        >
                            →
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Layout principal: Sidebar + Grille */}
        <div className="flex h-[600px]">
            {/* Sidebar gauche */}
            <PipelineContentsSidebar
                contentSchema={contentSchema}
                onDragStart={handleDragStart}
                pipelineType={pipelineType}
                readonly={readonly}
            />

            {/* Grille de cases */}
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
    </LiquidCard>
);
};

export default PipelineWithSidebar;




