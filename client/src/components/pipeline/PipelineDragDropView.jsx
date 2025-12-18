/**
 * PipelineDragDropView - Composant pipeline conforme CDC
 * 
 * Architecture:
 * - Panneau latéral gauche avec contenus drag & drop hiérarchisés
 * - Timeline à droite avec cases en drop zone
 * - Configuration intégrée dans header
 * - Préréglages et attribution en masse
 * 
 * Props:
 * - type: 'culture' | 'curing' | 'separation' | 'extraction'
 * - sidebarContent: Array des sections hiérarchisées
 * - timelineConfig: { type, start, end, duration }
 * - timelineData: Array des données par timestamp
 * - onConfigChange: (field, value) => void
 * - onDataChange: (timestamp, field, value) => void
 * - generalFields: Array des champs configuration générale
 * - generalData: Object des données générales
 * - onGeneralDataChange: (field, value) => void
 */

import { useState } from 'react';
import { ChevronDown, ChevronRight, Plus, Settings, Save, Upload, CheckSquare, Square } from 'lucide-react';
import PipelineDataModal from './PipelineDataModal';
import PresetConfigModal from './PresetConfigModal';
import PipelineCellBadge from './PipelineCellBadge';
import CellEmojiOverlay from './CellEmojiOverlay';
import PipelineCellTooltip from './PipelineCellTooltip';
import MassAssignModal from './MassAssignModal';
import PresetSelector from './PresetSelector';

const PipelineDragDropView = ({
    type = 'culture',
    sidebarContent = [],
    timelineConfig = {},
    timelineData = [],
    onConfigChange = () => { },
    onDataChange = () => { },
    generalFields = [],
    generalData = {},
    onGeneralDataChange = () => { },
    presets = [],
    onSavePreset = () => { },
    onLoadPreset = () => { }
}) => {
    const [expandedSections, setExpandedSections] = useState({});
    const [draggedContent, setDraggedContent] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [showPresets, setShowPresets] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCellTimestamp, setCurrentCellTimestamp] = useState(null);
    const [tooltipData, setTooltipData] = useState({ visible: false, cellData: null, position: { x: 0, y: 0 }, section: '' });
    const [massAssignMode, setMassAssignMode] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);
    const [showMassAssignModal, setShowMassAssignModal] = useState(false);
    const [sourceCellForMassAssign, setSourceCellForMassAssign] = useState(null);
    const [selectedPresets, setSelectedPresets] = useState([]);
    const [droppedItem, setDroppedItem] = useState(null); // Item droppé en attente de saisie
    const [showPresetConfigModal, setShowPresetConfigModal] = useState(false);
    const [editingPreset, setEditingPreset] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null); // Cellule survolée pendant drag

    // Handlers pour préréglages
    const handleTogglePreset = (presetId) => {
        setSelectedPresets(prev =>
            prev.includes(presetId)
                ? prev.filter(id => id !== presetId)
                : [...prev, presetId]
        );
    };

    const handleOpenPresetConfig = (initialData = null) => {
        setEditingPreset(initialData);
        setShowPresetConfigModal(true);
    };

    const handleSavePresetConfig = (preset) => {
        // Sauvegarder le préréglage via le handler parent UNIQUEMENT
        // Ne pas sauvegarder directement dans localStorage pour éviter duplications
        if (onSavePreset) {
            onSavePreset(preset);
        }

        setShowPresetConfigModal(false);
        setEditingPreset(null);
    };

    const handleDeletePreset = (presetId) => {
        // Créer un preset avec action delete pour que le parent le gère
        if (onSavePreset) {
            onSavePreset({ id: presetId, _action: 'delete' });
        }
        setSelectedPresets(prev => prev.filter(id => id !== presetId));
    };

    // Toggle section
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Ouvrir modal cellule
    const handleCellClick = (cellId) => {
        console.log('🖱️ Clic sur cellule:', cellId);
        console.log('📊 Mode masse actif:', massAssignMode);
        console.log('📋 Cellules sélectionnées avant:', selectedCells);

        if (massAssignMode) {
            // Mode sélection multiple - TOGGLE la cellule
            setSelectedCells(prev => {
                const isAlreadySelected = prev.includes(cellId);
                console.log('  → Cellule déjà sélectionnée:', isAlreadySelected);

                if (isAlreadySelected) {
                    // Retirer de la sélection
                    const newSelection = prev.filter(id => id !== cellId);
                    console.log('  → Retirée, nouvelle sélection:', newSelection);
                    return newSelection;
                } else {
                    // Ajouter à la sélection
                    const newSelection = [...prev, cellId];
                    console.log('  → Ajoutée, nouvelle sélection:', newSelection);
                    return newSelection;
                }
            });
        } else {
            // Mode normal: ouvrir modal
            console.log('📝 Ouverture modal pour:', cellId);
            setCurrentCellTimestamp(cellId);
            setIsModalOpen(true);

            // Si des préréglages sont sélectionnés, proposer de les appliquer
            if (selectedPresets.length > 0) {
                const shouldApply = window.confirm(
                    `Voulez-vous appliquer les ${selectedPresets.length} préréglage(s) sélectionné(s) à cette cellule ?`
                );
                if (shouldApply) {
                    applyPresetsToCell(cellId, selectedPresets);
                }
            }
        }
    };

    // Appliquer des préréglages à une cellule
    const applyPresetsToCell = (timestamp, presetIds) => {
        presetIds.forEach(presetId => {
            const preset = presets.find(p => p.id === presetId);
            if (preset && preset.data) {
                // Appliquer toutes les données du préréglage
                Object.entries(preset.data).forEach(([key, value]) => {
                    onDataChange(timestamp, key, value);
                });
            }
        });
    };

    // Sauvegarder données depuis modal
    const handleModalSave = (data) => {
        console.log('💾 Début sauvegarde - data reçue:', data);

        if (!data || !data.timestamp) {
            console.error('❌ Erreur: pas de timestamp dans les données');
            return;
        }

        // Si c'est un drop, sauvegarder uniquement le champ droppé
        if (droppedItem && droppedItem.timestamp === data.timestamp) {
            const fieldKey = droppedItem.content.key;
            if (data.data && data.data[fieldKey] !== undefined) {
                console.log('✓ Sauvegarde champ droppé:', fieldKey, '=', data.data[fieldKey]);
                onDataChange(data.timestamp, fieldKey, data.data[fieldKey]);
            }
            setDroppedItem(null);
        } else {
            // Sauvegarder toutes les données (cas modal normale)
            console.log('✓ Sauvegarde de tous les champs:', Object.keys(data.data || {}));
            Object.entries(data.data || {}).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    console.log('  → Sauvegarde:', key, '=', value);
                    onDataChange(data.timestamp, key, value);
                }
            });
        }

        // Sauvegarder métadonnées si présentes
        if (data.completionPercentage !== undefined) {
            onDataChange(data.timestamp, '_meta', {
                completionPercentage: data.completionPercentage,
                lastModified: data.lastModified || new Date().toISOString()
            });
        }

        console.log('✅ Sauvegarde terminée avec succès');
        setIsModalOpen(false);
        setDroppedItem(null);
    };

    // Tooltip handlers
    const handleCellHover = (e, timestamp) => {
        const cellData = getCellData(timestamp);
        if (!cellData || Object.keys(cellData).length === 0) return;

        const rect = e.currentTarget.getBoundingClientRect();
        setTooltipData({
            visible: true,
            cellData: cellData._meta || cellData,
            position: { x: rect.right, y: rect.top + rect.height / 2 },
            section: 'Données'
        });
    };

    const handleCellLeave = () => {
        setTooltipData({ visible: false, cellData: null, position: { x: 0, y: 0 }, section: '' });
    };

    // Mass assign handlers
    const handleMassAssign = () => {
        if (selectedCells.length === 0) return;

        // Trouver une cellule remplie pour servir de source
        let sourceCell = null;
        for (const timestamp of selectedCells) {
            const cellData = getCellData(timestamp);
            if (cellData && cellData.data && Object.keys(cellData.data).length > 0) {
                sourceCell = { timestamp, data: cellData };
                break;
            }
        }

        // Si aucune cellule sélectionnée n'a de données, chercher dans toutes les cellules
        if (!sourceCell) {
            for (const cell of cells) {
                const cellData = getCellData(cell.timestamp);
                if (cellData && cellData.data && Object.keys(cellData.data).length > 0) {
                    sourceCell = { timestamp: cell.timestamp, data: cellData };
                    break;
                }
            }
        }

        if (!sourceCell) {
            alert('Aucune cellule avec des données à copier. Veuillez d\'abord remplir une cellule.');
            return;
        }

        setSourceCellForMassAssign(sourceCell);
        setShowMassAssignModal(true);
    };

    const handleMassAssignApply = (selectedFields) => {
        if (!sourceCellForMassAssign || selectedCells.length === 0) return;

        // Copier les champs sélectionnés vers toutes les cellules sélectionnées
        selectedCells.forEach(timestamp => {
            selectedFields.forEach(fieldKey => {
                const value = sourceCellForMassAssign.data.data[fieldKey];
                onDataChange(timestamp, fieldKey, value);
            });

            // Mettre à jour les métadonnées
            const totalFields = sidebarContent.reduce((acc, section) => acc + (section.items?.length || 0), 0);
            const filledFields = selectedFields.length;
            const completionPercentage = Math.round((filledFields / totalFields) * 100);

            onDataChange(timestamp, '_meta', {
                completionPercentage,
                lastModified: new Date().toISOString()
            });
        });

        // Réinitialiser
        setShowMassAssignModal(false);
        setMassAssignMode(false);
        setSelectedCells([]);
        setSourceCellForMassAssign(null);
    };

    const toggleMassAssignMode = () => {
        setMassAssignMode(!massAssignMode);
        setSelectedCells([]);
    };

    // Handlers drag & drop
    const handleDragStart = (e, content) => {
        console.log('🎯 Début du drag:', content);
        setDraggedContent(content);
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.dropEffect = 'copy';
        e.dataTransfer.setData('text/plain', JSON.stringify(content));
        // Ajouter une classe CSS pour indiquer que le drag est actif
        e.currentTarget.classList.add('dragging');
    };

    const handleDragOver = (e, timestamp) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setHoveredCell(timestamp); // Mettre à jour la cellule survolée
    };

    const handleDragLeave = () => {
        setHoveredCell(null);
    };

    const handleDrop = (e, timestamp) => {
        e.preventDefault();
        e.stopPropagation();
        setHoveredCell(null);

        console.log('💧 Drop détecté sur timestamp:', timestamp);
        console.log('📦 draggedContent:', draggedContent);

        if (!draggedContent) {
            console.warn('⚠️ Pas de draggedContent disponible');
            return;
        }

        console.log('✓ Ouverture de la modal pour', draggedContent.label);

        // Stocker l'item droppé et ouvrir la modal pour saisir les valeurs
        setDroppedItem({ content: draggedContent, timestamp });
        setCurrentCellTimestamp(timestamp);
        setIsModalOpen(true);
        setDraggedContent(null);
    };

    // Générer les cases de la timeline selon le type d'intervalle
    // IMPORTANT: Utiliser des IDs stables, pas Date.now() qui change à chaque render!
    const generateCells = () => {
        const { type: intervalType, start, end, duration, totalSeconds, totalHours, totalDays, totalWeeks } = timelineConfig;

        // SECONDES (max 900s avec pagination)
        if (intervalType === 'seconde' && totalSeconds) {
            const count = Math.min(totalSeconds, 900); // Max 900s
            return Array.from({ length: count }, (_, i) => ({
                id: `sec-${i}`, // ID stable
                timestamp: `sec-${i}`,
                label: `${i}s`,
                seconds: i
            }));
        }

        // HEURES (max 336h = 14 jours)
        if (intervalType === 'heure' && totalHours) {
            const count = Math.min(totalHours, 336); // Max 336h
            return Array.from({ length: count }, (_, i) => ({
                id: `hour-${i}`,
                timestamp: `hour-${i}`,
                label: `${i}h`,
                hours: i
            }));
        }

        // JOURS avec nombre total (max 365 jours)
        if (intervalType === 'jour' && totalDays) {
            const count = Math.min(totalDays, 365); // Max 365 jours
            return Array.from({ length: count }, (_, i) => ({
                id: `day-${i + 1}`,
                timestamp: `day-${i + 1}`,
                label: `J${i + 1}`,
                day: i + 1
            }));
        }

        // DATES avec début et fin (calcul automatique + pagination si > 365 jours)
        if (intervalType === 'date' && start && end) {
            const startDate = new Date(start);
            const endDate = new Date(end);
            const days = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
            const count = Math.min(days, 365); // Pagination si > 365 jours

            return Array.from({ length: count }, (_, i) => {
                const date = new Date(startDate);
                date.setDate(date.getDate() + i);
                const dateStr = date.toISOString().split('T')[0];
                return {
                    id: `date-${dateStr}`,
                    timestamp: `date-${dateStr}`,
                    label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                    date: dateStr,
                    day: i + 1
                };
            });
        }

        // SEMAINES avec nombre total
        if (intervalType === 'semaine' && totalWeeks) {
            return Array.from({ length: totalWeeks }, (_, i) => ({
                id: `week-${i + 1}`,
                timestamp: `week-${i + 1}`,
                label: `S${i + 1}`,
                week: i + 1
            }));
        }

        // PHASES prédéfinies selon type de pipeline
        if (intervalType === 'phase') {
            // Phases prédéfinies pour culture (CDC)
            const culturePhases = [
                { id: 'phase-0', name: 'Graine (J0)', duration: 0, emoji: '🌰' },
                { id: 'phase-1', name: 'Germination', duration: 3, emoji: '🌱' },
                { id: 'phase-2', name: 'Plantule', duration: 7, emoji: '🌿' },
                { id: 'phase-3', name: 'Début Croissance', duration: 14, emoji: '🌳' },
                { id: 'phase-4', name: 'Milieu Croissance', duration: 14, emoji: '🌳' },
                { id: 'phase-5', name: 'Fin Croissance', duration: 7, emoji: '🌳' },
                { id: 'phase-6', name: 'Début Stretch', duration: 7, emoji: '🌲' },
                { id: 'phase-7', name: 'Milieu Stretch', duration: 7, emoji: '🌲' },
                { id: 'phase-8', name: 'Fin Stretch', duration: 7, emoji: '🌲' },
                { id: 'phase-9', name: 'Début Floraison', duration: 21, emoji: '🌸' },
                { id: 'phase-10', name: 'Milieu Floraison', duration: 21, emoji: '🌺' },
                { id: 'phase-11', name: 'Fin Floraison', duration: 14, emoji: '🏵️' }
            ];

            const phases = timelineConfig.phases?.length ? timelineConfig.phases : culturePhases;
            let cumulativeDays = 0;

            return phases.map((phase, i) => {
                const phaseId = phase.id || `phase-${i}`;
                const cell = {
                    id: phaseId,
                    timestamp: phaseId, // ID stable au lieu de Date.now()
                    label: phase.name || `Phase ${i + 1}`,
                    phase: phase,
                    phaseId: phaseId,
                    duration: phase.duration || 7,
                    emoji: phase.emoji || '🌿'
                };
                cumulativeDays += phase.duration || 7;
                return cell;
            });
        }

        return [];
    };

    const cells = generateCells();

    // Vérifier si une case a des données (définir AVANT utilisation)
    const getCellData = (timestamp) => {
        return timelineData.find(d => d.timestamp === timestamp) || {};
    };

    const hasCellData = (timestamp) => {
        const data = getCellData(timestamp);
        return Object.keys(data).length > 1; // Plus que juste timestamp
    };

    // Compter les cases avec au moins une donnée (hors timestamp, date, label, etc.)
    const filledCells = cells.filter(cell => {
        const data = getCellData(cell.timestamp);
        if (!data) return false;
        // Compter uniquement les champs de données (pas les méta-champs)
        const dataKeys = Object.keys(data).filter(k =>
            !['timestamp', 'date', 'label', 'phase', 'day', 'week', 'hours', 'seconds', '_meta'].includes(k)
        );
        return dataKeys.length > 0;
    }).length;

    const completionPercent = cells.length > 0 ? Math.round((filledCells / cells.length) * 100) : 0;

    return (
        <div className="flex gap-6 h-[600px]">
            {/* PANNEAU LATÉRAL HIÉRARCHISÉ */}
            <div className="w-80 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-y-auto">
                {/* Section Préréglages en haut */}
                <PresetSelector
                    presets={presets}
                    selectedPresets={selectedPresets}
                    onTogglePreset={handleTogglePreset}
                    onSaveNew={onSavePreset}
                    onDelete={handleDeletePreset}
                    onOpenConfigModal={handleOpenPresetConfig}
                />

                {/* Header Contenus */}
                <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-700 z-10">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">📦 Contenus</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Glissez les éléments vers les cases →
                    </p>

                    {/* Bouton créer préréglage global */}
                    <button
                        onClick={() => handleOpenPresetConfig()}
                        className="mt-3 w-full px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <Plus className="w-4 h-4" />
                        Créer un préréglage global
                    </button>
                </div>

                <div className="p-3 space-y-2">
                    {sidebarContent.map((section) => (
                        <div key={section.id} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{section.icon}</span>
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                        {section.label}
                                    </span>
                                </div>
                                {expandedSections[section.id] ? (
                                    <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                )}
                            </button>

                            {expandedSections[section.id] && (
                                <div className="p-2 bg-white dark:bg-gray-900 space-y-1">
                                    {section.items.map((item) => (
                                        <div
                                            key={item.key}
                                            draggable="true"
                                            onDragStart={(e) => handleDragStart(e, item)}
                                            onDragEnd={(e) => {
                                                e.currentTarget.classList.remove('dragging');
                                            }}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-grab active:cursor-grabbing border border-transparent hover:border-blue-500 transition-all group"
                                            style={{ touchAction: 'none' }}
                                        >
                                            <span className="text-base">{item.icon}</span>
                                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1">
                                                {item.label}
                                            </span>
                                            <span className="text-xs text-gray-400 group-hover:text-blue-500">⋮⋮</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* TIMELINE PRINCIPALE */}
            <div className="flex-1 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden flex flex-col">
                {/* HEADER CONFIGURATION */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                            <span>📊</span>
                            Pipeline {type === 'culture' ? 'Culture' : 'Curing/Maturation'}
                        </h3>
                        <div className="flex items-center gap-2">
                            {/* Mode sélection multiple */}
                            {massAssignMode && (
                                <div className="flex items-center gap-2 mr-2 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                    <span className="text-xs font-medium text-purple-800 dark:text-purple-300">
                                        {selectedCells.length} cellule(s) sélectionnée(s)
                                    </span>
                                    {selectedCells.length > 0 && selectedPresets.length > 0 && (
                                        <button
                                            onClick={() => {
                                                selectedCells.forEach(timestamp => {
                                                    applyPresetsToCell(timestamp, selectedPresets);
                                                });
                                                setMassAssignMode(false);
                                                setSelectedCells([]);
                                                alert(`✓ Préréglage(s) appliqué(s) à ${selectedCells.length} cellule(s) !`);
                                            }}
                                            className="px-2 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
                                            title="Appliquer les préréglages sélectionnés"
                                        >
                                            ✓ Appliquer
                                        </button>
                                    )}
                                </div>
                            )}

                            <button
                                onClick={toggleMassAssignMode}
                                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1 ${massAssignMode
                                    ? 'bg-purple-600 hover:bg-purple-700 text-white'
                                    : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100'
                                    }`}
                                title="Mode sélection multiple pour assigner en masse"
                            >
                                <CheckSquare className="w-4 h-4" />
                                {massAssignMode ? 'Mode masse ON' : 'Assignation masse'}
                            </button>

                            <button
                                onClick={() => setShowPresets(!showPresets)}
                                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            >
                                <Settings className="w-4 h-4" />
                                Préréglages
                            </button>
                        </div>
                    </div>

                    {/* Configuration inline - Dynamique selon type d'intervalle */}
                    <div className="grid grid-cols-4 gap-3">
                        <div>
                            <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                Type d'intervalles
                            </label>
                            <select
                                value={timelineConfig.type || 'jour'}
                                onChange={(e) => onConfigChange('type', e.target.value)}
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="seconde">⏱️ Secondes</option>
                                <option value="heure">🕐 Heures</option>
                                <option value="jour">🗓️ Jours</option>
                                <option value="date">📅 Dates</option>
                                <option value="semaine">📆 Semaines</option>
                                <option value="phase">🌱 Phases</option>
                            </select>
                        </div>

                        {/* SECONDES - Max 900s */}
                        {timelineConfig.type === 'seconde' && (
                            <div className="col-span-3">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Nombre de secondes (max 900s)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="900"
                                    value={timelineConfig.totalSeconds || ''}
                                    onChange={(e) => onConfigChange('totalSeconds', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: 300"
                                />
                            </div>
                        )}

                        {/* HEURES - Max 336h */}
                        {timelineConfig.type === 'heure' && (
                            <div className="col-span-3">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Nombre d'heures (max 336h)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="336"
                                    value={timelineConfig.totalHours || ''}
                                    onChange={(e) => onConfigChange('totalHours', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: 72"
                                />
                            </div>
                        )}

                        {/* JOURS - Max 365 jours */}
                        {timelineConfig.type === 'jour' && (
                            <div className="col-span-3">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Nombre de jours (max 365)
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="365"
                                    value={timelineConfig.totalDays || ''}
                                    onChange={(e) => onConfigChange('totalDays', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: 90"
                                />
                            </div>
                        )}

                        {/* DATES - Date début + Date fin avec calcul automatique */}
                        {timelineConfig.type === 'date' && (
                            <>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                        Date début *
                                    </label>
                                    <input
                                        type="date"
                                        value={timelineConfig.start || ''}
                                        onChange={(e) => onConfigChange('start', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                        Date fin *
                                    </label>
                                    <input
                                        type="date"
                                        value={timelineConfig.end || ''}
                                        onChange={(e) => onConfigChange('end', e.target.value)}
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                                {timelineConfig.start && timelineConfig.end && (
                                    <div>
                                        <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                            Durée calculée
                                        </label>
                                        <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white">
                                            {Math.ceil((new Date(timelineConfig.end) - new Date(timelineConfig.start)) / (1000 * 60 * 60 * 24)) + 1} jours
                                        </div>
                                    </div>
                                )}
                            </>
                        )}

                        {/* SEMAINES - Nombre de semaines */}
                        {timelineConfig.type === 'semaine' && (
                            <div className="col-span-3">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Nombre de semaines
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="52"
                                    value={timelineConfig.totalWeeks || ''}
                                    onChange={(e) => onConfigChange('totalWeeks', parseInt(e.target.value))}
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    placeholder="Ex: 12"
                                />
                            </div>
                        )}

                        {/* PHASES - Prédéfinies selon type de pipeline */}
                        {timelineConfig.type === 'phase' && (
                            <div className="col-span-3">
                                <label className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1 block">
                                    Phases prédéfinies
                                </label>
                                <div className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-900 dark:text-white">
                                    {type === 'culture' ? '12 phases (Graine → Récolte)' : '4 phases (Séchage → Affinage)'}
                                </div>
                            </div>
                        )}

                        <div className="flex items-end">
                            <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg text-center flex-1">
                                <div className="text-2xl font-bold">{completionPercent}%</div>
                                <div className="text-xs opacity-90">{filledCells}/{cells.length} cases</div>
                            </div>
                        </div>
                    </div>

                    {/* Messages d'aide selon type d'intervalle */}
                    {timelineConfig.type === 'date' && (!timelineConfig.start || !timelineConfig.end) && (
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-center gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                            <p className="text-xs text-yellow-800 dark:text-yellow-300">
                                Mode Dates : Date début ET date fin sont obligatoires
                            </p>
                        </div>
                    )}

                    {timelineConfig.type === 'seconde' && (!timelineConfig.totalSeconds || timelineConfig.totalSeconds > 900) && (
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-center gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                            <p className="text-xs text-yellow-800 dark:text-yellow-300">
                                Maximum 900 secondes (pagination automatique si dépassement)
                            </p>
                        </div>
                    )}

                    {timelineConfig.type === 'heure' && (!timelineConfig.totalHours || timelineConfig.totalHours > 336) && (
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-center gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                            <p className="text-xs text-yellow-800 dark:text-yellow-300">
                                Maximum 336 heures (14 jours)
                            </p>
                        </div>
                    )}

                    {timelineConfig.type === 'jour' && (!timelineConfig.totalDays || timelineConfig.totalDays > 365) && (
                        <div className="mt-3 p-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg flex items-center gap-2">
                            <span className="text-yellow-600 dark:text-yellow-400">⚠️</span>
                            <p className="text-xs text-yellow-800 dark:text-yellow-300">
                                Maximum 365 jours (pagination automatique si dépassement)
                            </p>
                        </div>
                    )}
                </div>

                {/* TIMELINE GRID */}
                <div className="flex-1 overflow-auto p-4">
                    {cells.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-500 dark:text-gray-400">
                                <Settings className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">⚠️ Configurez la période pour voir la timeline</p>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                                💡 <strong>Première case</strong> : Configuration générale (mode, espace, etc.)
                                <br />
                                📊 <strong>Autres cases</strong> : Drag & drop des paramètres depuis le panneau latéral
                            </p>

                            <div className="grid grid-cols-7 gap-2">
                                {cells.map((cell, idx) => {
                                    const hasData = hasCellData(cell.timestamp);
                                    const cellData = getCellData(cell.timestamp);
                                    const isFirst = idx === 0;
                                    const isSelected = selectedCells.includes(cell.timestamp);
                                    const isHovered = hoveredCell === cell.timestamp;

                                    return (
                                        <div
                                            key={cell.timestamp}
                                            onDragOver={(e) => handleDragOver(e, cell.timestamp)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, cell.timestamp)}
                                            onClick={() => handleCellClick(cell.timestamp)}
                                            onMouseEnter={(e) => handleCellHover(e, cell.timestamp)}
                                            onMouseLeave={handleCellLeave}
                                            className={`
                                                relative p-3 rounded-lg border-2 transition-all cursor-pointer min-h-[80px]
                                                ${hasData
                                                    ? 'border-green-500 bg-green-500/10'
                                                    : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
                                                }
                                                ${selectedCell === cell.timestamp
                                                    ? 'ring-2 ring-blue-500 shadow-lg'
                                                    : 'hover:border-blue-400 hover:shadow-md'
                                                }
                                                ${isSelected
                                                    ? 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                                    : ''
                                                }
                                                ${isHovered && draggedContent
                                                    ? 'ring-4 ring-blue-500 bg-blue-100 dark:bg-blue-900/30 scale-105 shadow-2xl border-blue-500 animate-pulse'
                                                    : ''
                                                }
                                                ${isFirst ? 'col-span-2 bg-purple-500/10 border-purple-500' : ''}
                                            `}
                                        >
                                            {/* Indicateur visuel drop */}
                                            {isHovered && draggedContent && (
                                                <div className="absolute inset-0 bg-blue-500/20 rounded-lg flex items-center justify-center z-20 pointer-events-none">
                                                    <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                        📌 Déposer ici
                                                    </div>
                                                </div>
                                            )}

                                            {/* Affichage 4 emojis superposables CDC-conforme */}
                                            {hasData && (
                                                <CellEmojiOverlay
                                                    cellData={cellData}
                                                    sidebarContent={sidebarContent}
                                                />
                                            )}

                                            {/* Label cellule */}
                                            <div className="relative z-10">
                                                <div className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                                                    {massAssignMode && isSelected && '✓ '}
                                                    {isFirst ? '⚙️ ' : ''}{cell.label}
                                                </div>
                                                <div className="text-[10px] text-gray-600 dark:text-gray-400">
                                                    {cell.date || cell.week || (cell.phase ? `(${cell.duration || 7}j)` : '')}
                                                </div>
                                                {isFirst && (
                                                    <div className="mt-1 text-[10px] text-purple-700 dark:text-purple-300 font-semibold">
                                                        Config générale
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}

                                {/* Bouton + pour ajouter des cellules */}
                                {cells.length > 0 && (timelineConfig.type === 'jour' || timelineConfig.type === 'date') && (
                                    <div
                                        className="p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer flex items-center justify-center min-h-[80px]"
                                        onClick={() => {
                                            // Ajouter un jour à la timeline
                                            if (timelineConfig.type === 'jour') {
                                                const currentDays = timelineConfig.totalDays || cells.length;
                                                if (currentDays < 365) {
                                                    onConfigChange('totalDays', currentDays + 1);
                                                }
                                            } else if (timelineConfig.type === 'date' && timelineConfig.end) {
                                                // Ajouter 1 jour à la date de fin
                                                const endDate = new Date(timelineConfig.end);
                                                endDate.setDate(endDate.getDate() + 1);
                                                onConfigChange('end', endDate.toISOString().split('T')[0]);
                                            }
                                        }}
                                        title="Ajouter un jour"
                                    >
                                        <Plus className="w-6 h-6 text-gray-400" />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal préréglages (simplifié) */}
            {showPresets && (
                <div className="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50" onClick={() => setShowPresets(false)}>
                    <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-200/50 dark:border-gray-700/50" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">📦 Préréglages</h3>
                        {presets.length === 0 ? (
                            <p className="text-sm text-gray-600 dark:text-gray-400">Aucun préréglage sauvegardé</p>
                        ) : (
                            <div className="space-y-2">
                                {presets.map((preset, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            onLoadPreset(preset);
                                            setShowPresets(false);
                                        }}
                                        className="w-full p-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg text-left transition-colors"
                                    >
                                        <div className="font-medium text-gray-900 dark:text-white">{preset.name}</div>
                                        <div className="text-xs text-gray-600 dark:text-gray-400">
                                            {Object.keys(preset.data || {}).length} paramètres
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                        <button
                            onClick={() => setShowPresets(false)}
                            className="mt-4 w-full px-4 py-2 bg-gray-200/80 dark:bg-gray-700/80 hover:bg-gray-300/80 dark:hover:bg-gray-600/80 rounded-xl font-medium transition-all hover:scale-[1.02]"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {/* Modal d'édition de cellule */}
            <PipelineDataModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setDroppedItem(null);
                }}
                cellData={getCellData(currentCellTimestamp)}
                sidebarSections={sidebarContent}
                onSave={handleModalSave}
                timestamp={currentCellTimestamp}
                intervalLabel={cells.find(c => c.timestamp === currentCellTimestamp)?.label || ''}
                droppedItem={droppedItem} // Passer l'item droppé à la modal
                pipelineType={type} // Passer le type de pipeline pour localStorage
            />

            {/* Modal attribution en masse */}
            <MassAssignModal
                isOpen={showMassAssignModal}
                onClose={() => setShowMassAssignModal(false)}
                sourceCellData={sourceCellForMassAssign?.data}
                selectedCellsCount={selectedCells.length}
                sidebarSections={sidebarContent}
                onApply={handleMassAssignApply}
            />

            {/* Modal configuration préréglage complet CDC */}
            <PresetConfigModal
                isOpen={showPresetConfigModal}
                onClose={() => {
                    setShowPresetConfigModal(false);
                    setEditingPreset(null);
                }}
                sidebarSections={sidebarContent}
                onSavePreset={handleSavePresetConfig}
                initialPreset={editingPreset}
            />

            {/* Tooltip au survol */}
            <PipelineCellTooltip
                cellData={tooltipData.cellData}
                sectionLabel={tooltipData.section}
                visible={tooltipData.visible}
                position={tooltipData.position}
            />
        </div>
    );
};

export default PipelineDragDropView;
