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
import PipelineCellModal from './PipelineCellModal';
import PipelineCellBadge from './PipelineCellBadge';
import PipelineCellTooltip from './PipelineCellTooltip';

export default function PipelineDragDropView({
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
}) {
    const [expandedSections, setExpandedSections] = useState({});
    const [draggedContent, setDraggedContent] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [showPresets, setShowPresets] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCellTimestamp, setCurrentCellTimestamp] = useState(null);
    const [tooltipData, setTooltipData] = useState({ visible: false, cellData: null, position: { x: 0, y: 0 }, section: '' });
    const [massAssignMode, setMassAssignMode] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);

    // Toggle section
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Ouvrir modal cellule
    const handleCellClick = (timestamp) => {
        if (massAssignMode) {
            // Mode sélection multiple
            setSelectedCells(prev => 
                prev.includes(timestamp) 
                    ? prev.filter(t => t !== timestamp)
                    : [...prev, timestamp]
            );
        } else {
            // Mode normal: ouvrir modal
            setCurrentCellTimestamp(timestamp);
            setIsModalOpen(true);
        }
    };

    // Sauvegarder données depuis modal
    const handleModalSave = (data) => {
        if (!data || !data.timestamp) return;
        
        // Sauvegarder toutes les données
        Object.entries(data.data).forEach(([key, value]) => {
            onDataChange(data.timestamp, key, value);
        });
        
        // Sauvegarder métadonnées
        onDataChange(data.timestamp, '_meta', {
            completionPercentage: data.completionPercentage,
            lastModified: data.lastModified
        });
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
        
        // TODO: Ouvrir modal pour choisir quelles données copier
        alert(`Attribution en masse à ${selectedCells.length} cellules`);
    };

    const toggleMassAssignMode = () => {
        setMassAssignMode(!massAssignMode);
        setSelectedCells([]);
    };

    // Handlers drag & drop
    const handleDragStart = (e, content) => {
        setDraggedContent(content);
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('text/plain', JSON.stringify(content));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e, timestamp) => {
        e.preventDefault();
        if (!draggedContent) return;

        // Appliquer la donnée à la case
        onDataChange(timestamp, draggedContent.key, draggedContent.defaultValue || '');
        setDraggedContent(null);
    };

    // Générer les cases de la timeline selon le type d'intervalle
    const generateCells = () => {
        const { type: intervalType, start, end, duration, totalSeconds, totalHours, totalDays, totalWeeks } = timelineConfig;

        // SECONDES (max 900s avec pagination)
        if (intervalType === 'seconde' && totalSeconds) {
            const count = Math.min(totalSeconds, 900); // Max 900s
            return Array.from({ length: count }, (_, i) => ({
                timestamp: Date.now() + (i * 1000),
                label: `${i}s`,
                seconds: i
            }));
        }

        // HEURES (max 336h = 14 jours)
        if (intervalType === 'heure' && totalHours) {
            const count = Math.min(totalHours, 336); // Max 336h
            return Array.from({ length: count }, (_, i) => ({
                timestamp: Date.now() + (i * 60 * 60 * 1000),
                label: `${i}h`,
                hours: i
            }));
        }

        // JOURS avec nombre total (max 365 jours)
        if (intervalType === 'jour' && totalDays) {
            const count = Math.min(totalDays, 365); // Max 365 jours
            return Array.from({ length: count }, (_, i) => ({
                timestamp: Date.now() + (i * 24 * 60 * 60 * 1000),
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
                return {
                    timestamp: date.getTime(),
                    label: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                    date: date.toISOString().split('T')[0],
                    day: i + 1
                };
            });
        }

        // SEMAINES avec nombre total
        if (intervalType === 'semaine' && totalWeeks) {
            return Array.from({ length: totalWeeks }, (_, i) => ({
                timestamp: Date.now() + (i * 7 * 24 * 60 * 60 * 1000),
                label: `S${i + 1}`,
                week: i + 1
            }));
        }

        // PHASES prédéfinies selon type de pipeline
        if (intervalType === 'phase' && timelineConfig.phases?.length) {
            return timelineConfig.phases.map((phase, i) => ({
                timestamp: Date.now() + (i * 24 * 60 * 60 * 1000),
                label: phase.name || `Phase ${i + 1}`,
                phase: phase
            }));
        }

        return [];
    };

    const cells = generateCells();
    const filledCells = timelineData.length;
    const completionPercent = cells.length > 0 ? Math.round((filledCells / cells.length) * 100) : 0;

    // Vérifier si une case a des données
    const getCellData = (timestamp) => {
        return timelineData.find(d => d.timestamp === timestamp) || {};
    };

    const hasCellData = (timestamp) => {
        const data = getCellData(timestamp);
        return Object.keys(data).length > 1; // Plus que juste timestamp
    };

    return (
        <div className="flex gap-6 h-[600px]">
            {/* PANNEAU LATÉRAL HIÉRARCHISÉ */}
            <div className="w-80 flex-shrink-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 overflow-y-auto">
                <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-700 z-10">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">📦 Contenus</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Glissez les éléments vers les cases →
                    </p>
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
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, item)}
                                            className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-move border border-transparent hover:border-blue-500 transition-all group"
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
                                className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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

                                    return (
                                        <div
                                            key={cell.timestamp}
                                            onDragOver={handleDragOver}
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
                                                    ? 'ring-2 ring-purple-500 bg-purple-50'
                                                    : ''
                                                }
                                                ${isFirst ? 'col-span-2 bg-purple-500/10 border-purple-500' : ''}
                                            `}
                                        >
                                            {/* Badge visuel si données présentes */}
                                            {hasData && cellData._meta && (
                                                <PipelineCellBadge 
                                                    cellData={cellData._meta}
                                                    sectionId={Object.keys(cellData).find(k => k !== 'timestamp' && k !== '_meta')}
                                                />
                                            )}
                                            
                                            {/* Label cellule */}
                                            <div className="relative z-10">
                                                <div className="text-xs font-bold text-gray-900 dark:text-white mb-1">
                                                    {massAssignMode && isSelected && '✓ '}
                                                    {isFirst ? '⚙️ ' : ''}{cell.label}
                                                </div>
                                                <div className="text-[10px] text-gray-600 dark:text-gray-400">
                                                    {cell.date || cell.week || cell.phase?.name || ''}
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
                                {cells.length > 0 && (
                                    <div
                                        className="p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all cursor-pointer flex items-center justify-center min-h-[80px]"
                                        onClick={() => {
                                            // TODO: Ajouter une cellule dynamiquement
                                            alert('Ajout de cellule à implémenter');
                                        }}
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowPresets(false)}>
                    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
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
                            className="mt-4 w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                </div>
            )}

            {/* Modal d'édition de cellule */}
            <PipelineCellModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                cellData={getCellData(currentCellTimestamp)}
                sidebarSections={sidebarContent}
                onSave={handleModalSave}
                timestamp={currentCellTimestamp}
                intervalLabel={cells.find(c => c.timestamp === currentCellTimestamp)?.label || ''}
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
}
