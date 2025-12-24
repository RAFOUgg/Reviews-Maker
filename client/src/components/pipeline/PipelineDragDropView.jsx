// Modal d'attribution multi-données avec onglets
import { useState as useModalState } from 'react';
function MultiAssignModal({ isOpen, onClose, droppedContent, sidebarSections, onApply, selectedCells }) {
    const [activeTab, setActiveTab] = useModalState('data');
    const [values, setValues] = useModalState({});
    if (!isOpen || !droppedContent) return null;
    // Regroupement par section
    let items = [];
    if (droppedContent.type === 'multi' && Array.isArray(droppedContent.items)) {
        items = droppedContent.items.filter(Boolean);
    } else if (droppedContent.type === 'grouped' && droppedContent.group && Array.isArray(droppedContent.group.fields)) {
        items = droppedContent.group.fields.filter(Boolean).map(f => ({ ...f }));
    } else if (droppedContent.content) {
        items = [droppedContent.content];
    }
    // Regroup by section
    const sectionMap = {};
    sidebarSections.forEach(section => {
        sectionMap[section.id] = [];
    });
    items.forEach(item => {
        const section = sidebarSections.find(sec => Array.isArray(sec.items) && sec.items.some(i => i.key === item.key));
        if (section) sectionMap[section.id].push(item);
    });
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 min-w-[340px] max-w-[95vw] border border-gray-200 dark:border-gray-700">
                <div className="flex gap-4 mb-4">
                    <button className={`liquid-btn ${activeTab === 'data' ? 'liquid-btn--primary' : ''}`} onClick={() => setActiveTab('data')}>Toutes les données</button>
                    <button className={`liquid-btn ${activeTab === 'group' ? 'liquid-btn--primary' : ''}`} onClick={() => setActiveTab('group')}>Groupes</button>
                </div>
                {activeTab === 'data' && (
                    <div className="max-h-80 overflow-y-auto">
                        {Object.entries(sectionMap).map(([sectionId, sectionItems]) => {
                            if (sectionItems.length === 0) return null;
                            const section = sidebarSections.find(sec => sec.id === sectionId);
                            return (
                                <div key={sectionId} className="mb-4">
                                    <div className="font-semibold text-sm mb-2">{section.label}</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {sectionItems.map(item => (
                                            item && (
                                                <div key={item.key} className="flex flex-col gap-1">
                                                    <label className="text-xs font-medium">{item.label}</label>
                                                    <input
                                                        className="px-2 py-1 border rounded text-xs"
                                                        value={values[item.key] || ''}
                                                        onChange={e => setValues(v => ({ ...v, [item.key]: e.target.value }))}
                                                        placeholder={item.unit || ''}
                                                    />
                                                </div>)
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
                {activeTab === 'group' && (
                    <div className="p-4 text-sm text-gray-600">Gestion des groupes à venir…</div>
                )}
                <div className="flex gap-2 mt-6">
                    <button className="flex-1 liquid-btn liquid-btn--accent" onClick={() => onApply(values)}>Appliquer à {selectedCells.length > 0 ? `${selectedCells.length} cases` : 'la case'}</button>
                    <button className="flex-1 liquid-btn" onClick={onClose}>Annuler</button>
                </div>
            </div>
        </div>
    );
}
// Handler pour configurer un item individuellement
const handleConfigureItem = (itemKey, value) => {
    const newConfig = { ...preConfiguredItems };
    if (value === null || value === '') {
        delete newConfig[itemKey];
    } else {
        newConfig[itemKey] = value;
    }
    setPreConfiguredItems(newConfig);
    localStorage.setItem('pipeline-preconfig-items', JSON.stringify(newConfig));
};
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

import { useState, useEffect, useRef } from 'react';

// Grouped preset modal (inline for now)
function GroupedPresetModal({ isOpen, onClose, onSave, groups, setGroups, sidebarContent }) {
    const [groupName, setGroupName] = useState('');
    const [selectedFields, setSelectedFields] = useState([]);
    const [fieldValues, setFieldValues] = useState({});

    if (!isOpen) return null;
    const allFields = sidebarContent.flatMap(section => section.items.map(item => ({
        key: item.key,
        label: item.label,
        icon: item.icon,
        unit: item.unit
    })));

    const handleToggleField = (key) => {
        setSelectedFields(f => f.includes(key) ? f.filter(k => k !== key) : [...f, key]);
    };
    const handleValueChange = (key, value) => {
        setFieldValues(fv => ({ ...fv, [key]: value }));
    };
    const handleSave = () => {
        if (!groupName.trim() || selectedFields.length === 0) return;
        const group = {
            name: groupName.trim(),
            fields: selectedFields.map(key => ({ key, value: fieldValues[key] || '' }))
        };
        const newGroups = [...groups, group];
        setGroups(newGroups);
        localStorage.setItem('pipeline-grouped-presets', JSON.stringify(newGroups));
        setGroupName(''); setSelectedFields([]); setFieldValues({});
        onSave && onSave(newGroups);
        onClose();
    };
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 min-w-[340px] max-w-[95vw] border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-4">Créer un préréglage groupé</h3>
                <input className="w-full mb-3 px-3 py-2 border rounded-lg" placeholder="Nom du groupe" value={groupName} onChange={e => setGroupName(e.target.value)} />
                <div className="max-h-40 overflow-y-auto mb-3">
                    {allFields.map(f => (
                        <div key={f.key} className="flex items-center gap-2 mb-1">
                            <input type="checkbox" checked={selectedFields.includes(f.key)} onChange={() => handleToggleField(f.key)} />
                            <span className="text-base">{f.icon}</span>
                            <span className="text-xs">{f.label}</span>
                            {selectedFields.includes(f.key) && (
                                <input className="ml-2 px-2 py-1 border rounded w-24 text-xs" placeholder="Valeur" value={fieldValues[f.key] || ''} onChange={e => handleValueChange(f.key, e.target.value)} />
                            )}
                            {f.unit && <span className="text-xs text-gray-400 ml-1">{f.unit}</span>}
                        </div>
                    ))}
                </div>
                <div className="flex gap-2 mt-4">
                    <button className="flex-1 liquid-btn liquid-btn--accent" onClick={handleSave} disabled={!groupName.trim() || selectedFields.length === 0}>Enregistrer</button>
                    <button className="flex-1 liquid-btn" onClick={onClose}>Annuler</button>
                </div>
            </div>
        </div>
    );
}
import { ChevronDown, ChevronRight, Plus, Settings, Save, Upload, CheckSquare, Square, Check } from 'lucide-react';
import PipelineDataModal from './PipelineDataModal';
import PipelineCellBadge from './PipelineCellBadge';
import CellEmojiOverlay from './CellEmojiOverlay';
import PipelineCellTooltip from './PipelineCellTooltip';
import MassAssignModal from './MassAssignModal';
import ItemContextMenu from './ItemContextMenu';
import PreConfigBadge from './PreConfigBadge';

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
    // Préréglages retirés
}) => {
    const [expandedSections, setExpandedSections] = useState({});
    const [draggedContent, setDraggedContent] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);

    // Empêcher la sélection automatique de la première case
    useEffect(() => {
        setSelectedCells([]); // Clear selection on mount
    }, []);

    // Clear selection on timelineConfig change (reset)
    useEffect(() => {
        setSelectedCells([]);
    }, [timelineConfig]);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCellTimestamp, setCurrentCellTimestamp] = useState(null);
    const [tooltipData, setTooltipData] = useState({ visible: false, cellData: null, position: { x: 0, y: 0 }, section: '' });
    const [massAssignMode, setMassAssignMode] = useState(false);
    const [selectedCells, setSelectedCells] = useState([]);
    const [showMassAssignModal, setShowMassAssignModal] = useState(false);
    const [sourceCellForMassAssign, setSourceCellForMassAssign] = useState(null);
    const [droppedItem, setDroppedItem] = useState(null); // Item droppé en attente de saisie
    const [showMultiAssignModal, setShowMultiAssignModal] = useState(false);
    const [multiAssignContent, setMultiAssignContent] = useState(null);
    const [hoveredCell, setHoveredCell] = useState(null); // Cellule survolée pendant drag
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStartIdx, setSelectionStartIdx] = useState(null);

    // Préréglages individuels, section et global
    const [preConfiguredItems, setPreConfiguredItems] = useState(() => {
        const saved = localStorage.getItem('pipeline-preconfig-items');
        return saved ? JSON.parse(saved) : {};
    });
    // Grouped presets state
    const [groupedPresets, setGroupedPresets] = useState(() => {
        const saved = localStorage.getItem('pipeline-grouped-presets');
        return saved ? JSON.parse(saved) : [];
    });
    const [showGroupedPresetModal, setShowGroupedPresetModal] = useState(false);
    const [contextMenu, setContextMenu] = useState(null); // { item, position }
    // Multi-select sidebar state (global)
    const [multiSelectedItems, setMultiSelectedItems] = useState([]);

    // Suppression des handlers préréglages


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

            // Aucun système de préréglages dans cette vue (désactivé pour CDC)
        }
    };

    // Suppression logique préréglages


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

    // Nouvelle version CDC : handleDrop sans préréglages
    const handleDrop = (e, timestamp) => {
        e.preventDefault();
        e.stopPropagation();
        setHoveredCell(null);
        if (!draggedContent) return;
        const sel = selectedCellsRef.current || [];
        const appliesToSelection = (sel && sel.length > 0) && (sel.includes(timestamp) || massAssignMode);
        // Grouped preset or multi-data drop: open multi-assign modal
        if ((draggedContent.type === 'grouped' && draggedContent.group && Array.isArray(draggedContent.group.fields)) || (draggedContent.type === 'multi' && Array.isArray(draggedContent.items))) {
            setMultiAssignContent(draggedContent);
            setShowMultiAssignModal(true);
            setDraggedContent(null);
            return;
        }
        // For single data field, open modal for value definition
        if (appliesToSelection) {
            setCurrentCellTimestamp(sel[0]);
            setDroppedItem({ timestamp: sel[0], content: draggedContent });
            setIsModalOpen(true);
        } else {
            setCurrentCellTimestamp(timestamp);
            setDroppedItem({ timestamp, content: draggedContent });
            setIsModalOpen(true);
        }
        setDraggedContent(null);
    };

    // Toast feedback retiré (préréglages supprimés)

    // Handler context menu simplifié (centré, CDC)
    const handleItemContextMenu = (e, item) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({
            item,
            position: {
                x: window.innerWidth / 2,
                y: window.innerHeight / 2
            },
            anchorRect: null
        });
    };

    // Sélection par glissé (mousedown + mouseenter + mouseup)
    const selectedCellsRef = useRef([]);

    const startSelection = (e, startIdx, timestamp) => {
        e.preventDefault();
        setIsSelecting(true);
        setSelectionStartIdx(startIdx);
        setSelectedCells([timestamp]);
        selectedCellsRef.current = [timestamp];
    };

    const updateSelectionTo = (currentIdx) => {
        if (selectionStartIdx === null) return;
        const a = Math.min(selectionStartIdx, currentIdx);
        const b = Math.max(selectionStartIdx, currentIdx);
        const range = cells.slice(a, b + 1).map(c => c.timestamp);
        setSelectedCells(range);
        selectedCellsRef.current = range;
    };

    // Stop selection on mouseup anywhere
    useEffect(() => {
        const onUp = () => {
            if (isSelecting) {
                setIsSelecting(false);
                setSelectionStartIdx(null);
                setSelectedCells([]); // Clear selection when mouse released
            }
        };
        window.addEventListener('mouseup', onUp);
        return () => window.removeEventListener('mouseup', onUp);
    }, [isSelecting]);

    // Keep ref in sync
    useEffect(() => {
        selectedCellsRef.current = selectedCells;
    }, [selectedCells]);

    // Handlers configuration retirés (préréglages supprimés)

    // Copier la valeur depuis une case source vers la sélection / case courante
    const handleAssignFromSource = (itemKey, sourceTimestamp) => {
        if (!sourceTimestamp) { alert('Cas source invalide'); return; }
        const sourceData = getCellData(sourceTimestamp);
        const sourceValue = sourceData ? (sourceData[itemKey] ?? (sourceData.data ? sourceData.data[itemKey] : undefined)) : undefined;

        if (sourceValue === undefined) {
            alert('Aucune valeur trouvée dans la case source pour ce paramètre.');
            return;
        }

        if (massAssignMode && selectedCells.length > 0) {
            if (!confirm(`Copier la valeur depuis ${sourceTimestamp} vers ${selectedCells.length} case(s) ?`)) return;
            selectedCells.forEach(ts => onDataChange(ts, itemKey, sourceValue));
            setMassAssignMode(false);
            setSelectedCells([]);
            showToast(`✓ Copié depuis ${sourceTimestamp} vers ${selectedCells.length} case(s)`);
            return;
        }

        if (currentCellTimestamp) {
            onDataChange(currentCellTimestamp, itemKey, sourceValue);
            showToast(`✓ Copié depuis ${sourceTimestamp} vers ${currentCellTimestamp}`);
            return;
        }

        if (cells.length > 0) {
            onDataChange(cells[0].timestamp, itemKey, sourceValue);
            showToast(`✓ Copié depuis ${sourceTimestamp} vers ${cells[0].timestamp}`);
            return;
        }

        alert('Aucune case disponible pour copier la valeur.');
    };

    // Assigner une valeur à une plage (de startTimestamp à endTimestamp inclus)
    const handleAssignRange = (itemKey, startTimestamp, endTimestamp, value) => {
        if (!startTimestamp || !endTimestamp) { alert('Plage invalide'); return; }
        const startIdx = cells.findIndex(c => c.timestamp === startTimestamp);
        const endIdx = cells.findIndex(c => c.timestamp === endTimestamp);
        if (startIdx === -1 || endIdx === -1) { alert('Cases introuvables'); return; }
        const a = Math.min(startIdx, endIdx);
        const b = Math.max(startIdx, endIdx);
        const range = cells.slice(a, b + 1).map(c => c.timestamp);

        if (!confirm(`Assigner ${itemKey} = ${value} à ${range.length} case(s) ?`)) return;
        range.forEach(ts => onDataChange(ts, itemKey, value));
        showToast(`✓ ${itemKey} assigné à ${range.length} case(s)`);
    };

    // Assigner la valeur à toutes les cases
    const handleAssignAll = (itemKey, value) => {
        if (!confirm(`Assigner ${itemKey} = ${value} à TOUTES les cases (${cells.length}) ?`)) return;
        cells.forEach(c => onDataChange(c.timestamp, itemKey, value));
        showToast(`✓ ${itemKey} assigné à toutes les cases`);
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
                {/* Préréglages retirés pour conformité CDC */}

                {/* Header Contenus */}
                <div className="sticky top-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm p-4 border-b border-gray-200 dark:border-gray-700 z-10">
                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">📦 Contenus</h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Glissez les éléments vers les cases →
                    </p>
                </div>

                <div className="p-3 space-y-2">
                    {/* Pré-configuration section (was MODE PIPELINE) */}
                    <div className="mb-3">
                        <div className="font-semibold text-xs text-purple-700 dark:text-purple-300 mb-1">Pré-configuration</div>
                        <button
                            className="mt-1 mb-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                            onClick={() => setShowGroupedPresetModal(true)}
                        >
                            <Plus className="w-4 h-4" /> Groupe de préréglages
                        </button>
                        {groupedPresets.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {groupedPresets.map((group, idx) => (
                                    <div
                                        key={group.name + idx}
                                        draggable="true"
                                        onDragStart={e => {
                                            e.dataTransfer.setData('application/grouped-preset', JSON.stringify(group));
                                            e.dataTransfer.effectAllowed = 'copy';
                                            setDraggedContent({ type: 'grouped', group });
                                        }}
                                        onDragEnd={() => setDraggedContent(null)}
                                        className="px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 text-xs font-bold cursor-grab hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-all"
                                        title={group.fields.map(f => `${f.key}: ${f.value}`).join(', ')}
                                    >
                                        <span className="mr-1">👥</span>{group.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    {(sidebarContent || []).map((section) => (
                        <div key={section.id} className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-700 dark:hover:to-gray-700/50 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{section.icon}</span>
                                    <span className="font-semibold text-sm text-gray-900 dark:text-white">
                                        {section.label === 'MODE PIPELINE' ? 'Pré-configuration' : section.label}
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
                                    {section.items?.map((item) => {
                                        const isPreConfigured = preConfiguredItems[item.key] !== undefined;
                                        const handleSidebarItemClick = (e, item) => {
                                            if (e.ctrlKey || e.metaKey) {
                                                setMultiSelectedItems(prev => prev.includes(item.key)
                                                    ? prev.filter(k => k !== item.key)
                                                    : [...prev, item.key]);
                                            } else {
                                                setMultiSelectedItems([item.key]);
                                            }
                                        };
                                        return (
                                            <div
                                                key={item.key}
                                                draggable="true"
                                                onDragStart={(e) => {
                                                    if (multiSelectedItems.length > 1) {
                                                        e.dataTransfer.setData('application/multi-items', JSON.stringify(multiSelectedItems.map(k => section.items.find(i => i.key === k))));
                                                        setDraggedContent({ type: 'multi', items: multiSelectedItems.map(k => section.items.find(i => i.key === k)) });
                                                    } else {
                                                        handleDragStart(e, item);
                                                    }
                                                }}
                                                onDragEnd={(e) => {
                                                    e.currentTarget.classList.remove('dragging');
                                                    setMultiSelectedItems([]);
                                                }}
                                                onClick={(e) => handleSidebarItemClick(e, item)}
                                                onContextMenu={(e) => {
                                                    e.preventDefault();
                                                    setContextMenu({
                                                        item,
                                                        position: {
                                                            x: e.clientX,
                                                            y: e.clientY
                                                        },
                                                        anchorRect: e.currentTarget.getBoundingClientRect()
                                                    });
                                                }}
                                                className={`relative flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing border transition-all group ${isPreConfigured
                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                    : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:border-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    } ${multiSelectedItems.includes(item.key) ? 'ring-2 ring-blue-500' : ''}`}
                                                style={{ touchAction: 'none' }}
                                                title={isPreConfigured ? `Pré-configuré: ${preConfiguredItems[item.key]}${item.unit || ''}` : 'Clic droit pour pré-configurer'}
                                            >
                                                {/* Badge pré-configuré */}
                                                {isPreConfigured && (
                                                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs mr-1">{preConfiguredItems[item.key]}{item.unit || ''}</span>
                                                )}
                                                <span className="text-base">{item.icon}</span>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1">
                                                    {item.label}
                                                </span>
                                                <span className={`text-xs transition-colors ${isPreConfigured
                                                    ? 'text-green-600 dark:text-green-400'
                                                    : 'text-gray-400 group-hover:text-blue-500'
                                                    }`}>
                                                    {isPreConfigured ? '✓' : '⋮⋮'}
                                                </span>
                                            </div>
                                        );
                                    })}
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
                            {/* Multi-selection via click-drag is enabled; explicit "Assignation masse" button removed for CDC-compliance */}

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
                            <label className="text-xs font-medium text-gray-900 mb-1 block">
                                Type d'intervalles
                            </label>
                            <select
                                value={timelineConfig.type || 'jour'}
                                onChange={(e) => onConfigChange('type', e.target.value)}
                                className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
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
                            <div className="px-6 py-4 bg-white rounded-lg text-gray-900 shadow-md flex-1">
                                <div className="text-3xl font-extrabold">{completionPercent}%</div>
                                <div className="text-sm text-gray-600 mt-1">{filledCells}/{cells.length} cases</div>
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

                            <div className="grid grid-cols-7 gap-2 select-none relative">
                                {/* Visual selection frame overlay */}
                                {selectedCells.length > 1 && !isSelecting && (() => {
                                    // Find all selected cell indices
                                    const indices = selectedCells.map(ts => cells.findIndex(c => c.timestamp === ts)).filter(i => i !== -1);
                                    if (indices.length === 0) return null;
                                    const minIdx = Math.min(...indices);
                                    const maxIdx = Math.max(...indices);
                                    // Compute bounding box for all selected cells
                                    let minRow = 99, minCol = 99, maxRow = 0, maxCol = 0;
                                    indices.forEach(idx => {
                                        const row = Math.floor(idx / 7);
                                        const col = idx % 7;
                                        if (row < minRow) minRow = row;
                                        if (col < minCol) minCol = col;
                                        if (row > maxRow) maxRow = row;
                                        if (col > maxCol) maxCol = col;
                                    });
                                    const top = `${minRow * 90}px`;
                                    const left = `${minCol * 90}px`;
                                    const width = `${((maxCol - minCol + 1) * 90)}px`;
                                    const height = `${((maxRow - minRow + 1) * 90)}px`;
                                    return (
                                        <div
                                            className="absolute pointer-events-none z-40 border-4 border-blue-500 rounded-2xl shadow-lg animate-fade-in"
                                            style={{
                                                top,
                                                left,
                                                width,
                                                height,
                                                boxSizing: 'border-box',
                                                transition: 'all 0.1s',
                                                borderStyle: 'dashed',
                                                background: 'rgba(80,180,255,0.07)'
                                            }}
                                        />
                                    );
                                })()}
                                {cells.map((cell, idx) => {
                                    const hasData = hasCellData(cell.timestamp);
                                    const cellData = getCellData(cell.timestamp);
                                    const isFirst = idx === 0;
                                    const isSelected = selectedCells.includes(cell.timestamp);
                                    const isHovered = hoveredCell === cell.timestamp;

                                    // Only apply purple border to first cell if selected
                                    let cellClass = `relative p-3 rounded-lg border-2 transition-all cursor-pointer min-h-[80px]`;
                                    cellClass += hasData ? ' border-green-500 bg-green-500/10' : ' border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';
                                    cellClass += selectedCell === cell.timestamp ? ' ring-2 ring-blue-500 shadow-lg' : ' hover:border-blue-400 hover:shadow-md';
                                    cellClass += isSelected ? ' ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-900/20' : '';
                                    cellClass += isHovered && draggedContent ? ' ring-4 ring-blue-500 bg-blue-100 dark:bg-blue-900/30 scale-105 shadow-2xl border-blue-500 animate-pulse' : '';
                                    if (isFirst) cellClass += ' col-span-2 bg-purple-500/10 border-purple-500';
                                    // Remove purple border if not selected
                                    if (isFirst && !isSelected) cellClass = cellClass.replace('ring-2 ring-purple-500', '');

                                    return (
                                        <div
                                            key={cell.timestamp}
                                            onDragOver={(e) => handleDragOver(e, cell.timestamp)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, cell.timestamp)}
                                            onClick={() => handleCellClick(cell.timestamp)}
                                            onMouseEnter={(e) => { handleCellHover(e, cell.timestamp); if (isSelecting) updateSelectionTo(idx); }}
                                            onMouseLeave={handleCellLeave}
                                            onMouseDown={(e) => { if (e.button === 0) startSelection(e, idx, cell.timestamp); }}
                                            onMouseUp={(e) => { if (isSelecting) { setIsSelecting(false); setSelectionStartIdx(null); } }}
                                            className={cellClass}
                                            style={{ userSelect: 'none' }}
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


            {/* Modal grouped preset */}
            <GroupedPresetModal
                isOpen={showGroupedPresetModal}
                onClose={() => setShowGroupedPresetModal(false)}
                onSave={setGroupedPresets}
                groups={groupedPresets}
                setGroups={setGroupedPresets}
                sidebarContent={sidebarContent}
            />

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

            {/* Modal multi-assign (onglets) */}
            <MultiAssignModal
                isOpen={showMultiAssignModal}
                onClose={() => { setShowMultiAssignModal(false); setMultiAssignContent(null); setSelectedCells([]); }}
                droppedContent={multiAssignContent}
                sidebarSections={sidebarContent}
                selectedCells={selectedCells}
                onApply={(values) => {
                    const targets = selectedCells.length > 0 ? selectedCells : [currentCellTimestamp];
                    targets.forEach(ts => {
                        Object.entries(values).forEach(([key, value]) => {
                            onDataChange(ts, key, value);
                        });
                    });
                    setShowMultiAssignModal(false);
                    setMultiAssignContent(null);
                    setSelectedCells([]); // Clear selection frame after assignment
                }}
            />

            {/* Modal configuration préréglage complet retirée (CDC) */}

            {/* Tooltip au survol */}
            <PipelineCellTooltip
                cellData={tooltipData.cellData}
                sectionLabel={tooltipData.section}
                visible={tooltipData.visible}
                position={tooltipData.position}
            />

            {/* Menu contextuel stylisé pour config individuelle et assignation rapide */}
            {contextMenu && (
                <div className="fixed inset-0 z-50" onClick={() => setContextMenu(null)}>
                    <div
                        className="absolute bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 min-w-[320px] max-w-[90vw] border border-gray-200 dark:border-gray-700"
                        style={{ left: contextMenu.position.x, top: contextMenu.position.y, transform: 'translate(-10%, 0)', zIndex: 10000 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <h4 className="font-bold text-lg mb-2 flex items-center gap-2">
                            <span className="text-base">{contextMenu.item.icon}</span>
                            {contextMenu.item.label}
                        </h4>
                        <div className="mb-4">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Valeur par défaut</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border rounded-lg text-sm bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                                defaultValue={preConfiguredItems[contextMenu.item.key] || ''}
                                id="preconfig-value-input"
                            />
                        </div>
                        <div className="flex gap-2 mb-2">
                            <button
                                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-all"
                                onClick={() => {
                                    const val = document.getElementById('preconfig-value-input').value;
                                    handleConfigureItem(contextMenu.item.key, val);
                                    setContextMenu(null);
                                }}
                            >Enregistrer</button>
                            <button
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-medium transition-all"
                                onClick={() => setContextMenu(null)}
                            >Annuler</button>
                        </div>
                        <div className="mt-4">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Assigner à&nbsp;:</label>
                            <div className="flex gap-2">
                                <button
                                    className="flex-1 px-3 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-lg text-xs font-semibold"
                                    onClick={() => {
                                        // Assignation à toutes les cases sélectionnées
                                        selectedCells.forEach(ts => onDataChange(ts, contextMenu.item.key, document.getElementById('preconfig-value-input').value));
                                        setContextMenu(null);
                                    }}
                                    disabled={selectedCells.length === 0}
                                >{selectedCells.length > 0 ? `Sélection (${selectedCells.length})` : 'Sélectionner des cases'}</button>
                                <button
                                    className="flex-1 px-3 py-2 bg-blue-400 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold"
                                    onClick={() => {
                                        // Assignation à toutes les cases
                                        cells.forEach(cell => onDataChange(cell.timestamp, contextMenu.item.key, document.getElementById('preconfig-value-input').value));
                                        setContextMenu(null);
                                    }}
                                >Toutes les cases</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Toast succès retiré (CDC) */}
        </div>
    );
};

export default PipelineDragDropView;
