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
import ConfirmModal from '../ui/ConfirmModal';
import { useToast } from '../ToastContainer';

// Emojis disponibles pour les groupes
const GROUP_EMOJIS = ['🌱', '🌿', '💧', '☀️', '🌡️', '📊', '⚗️', '🧪', '🔬', '💨', '🏠', '🌞', '🌙', '💡', '🔌', '📅', '⏱️', '📏', '🎯', '✨', '🚀', '💪', '🎨', '🔥', '❄️', '💎', '🌈', '🍃', '🌸', '🍀'];

// Grouped preset modal - COMPLETE with proper field types, edit mode, emoji
function GroupedPresetModal({ isOpen, onClose, onSave, groups, setGroups, sidebarContent }) {
    const [mode, setMode] = useState('list'); // 'list' | 'create' | 'edit'
    const [editingGroup, setEditingGroup] = useState(null);
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [groupEmoji, setGroupEmoji] = useState('🌱');
    const [selectedFields, setSelectedFields] = useState([]);
    const [fieldValues, setFieldValues] = useState({});
    const [searchTerm, setSearchTerm] = useState('');
    const [expandedSections, setExpandedSections] = useState({});
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);

    // Reset when opening
    useEffect(() => {
        if (isOpen) {
            setMode('list');
            setEditingGroup(null);
            resetForm();
        }
    }, [isOpen]);

    const resetForm = () => {
        setGroupName('');
        setGroupDescription('');
        setGroupEmoji('🌱');
        setSelectedFields([]);
        setFieldValues({});
        setSearchTerm('');
        // Expand all sections by default for better visibility
        const expanded = {};
        (sidebarContent || []).forEach(s => { expanded[s.id || s.label] = true; });
        setExpandedSections(expanded);
    };

    const startCreate = () => {
        resetForm();
        setMode('create');
    };

    const startEdit = (group) => {
        setEditingGroup(group);
        setGroupName(group.name || '');
        setGroupDescription(group.description || '');
        setGroupEmoji(group.emoji || '🌱');
        const fields = group.fields || [];
        setSelectedFields(fields.map(f => f.key));
        const vals = {};
        fields.forEach(f => { vals[f.key] = f.value; });
        setFieldValues(vals);
        setSearchTerm('');
        const expanded = {};
        (sidebarContent || []).forEach(s => { expanded[s.id || s.label] = true; });
        setExpandedSections(expanded);
        setMode('edit');
    };

    if (!isOpen) return null;

    // Group fields by section with full item data
    const sections = (sidebarContent || []).map(section => ({
        id: section.id || section.label,
        label: section.label,
        icon: section.icon,
        items: (section.items || []).map(item => ({
            id: item.id || item.key || item.type,
            key: item.id || item.key || item.type,
            label: item.label,
            icon: item.icon,
            type: item.type || 'text',
            options: item.options,
            unit: item.unit,
            min: item.min,
            max: item.max,
            step: item.step,
            defaultValue: item.defaultValue
        }))
    }));

    // Filter by search
    const filteredSections = sections.map(section => ({
        ...section,
        items: section.items.filter(item =>
            !searchTerm || item.label.toLowerCase().includes(searchTerm.toLowerCase())
        )
    })).filter(section => section.items.length > 0);

    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
    };

    const handleToggleField = (fieldId) => {
        setSelectedFields(prev =>
            prev.includes(fieldId)
                ? prev.filter(k => k !== fieldId)
                : [...prev, fieldId]
        );
    };

    const handleValueChange = (fieldId, value) => {
        setFieldValues(prev => ({ ...prev, [fieldId]: value }));
    };

    // Render the correct input type based on field definition
    const renderFieldInput = (field) => {
        const value = fieldValues[field.id] ?? '';
        const baseClass = "px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm";

        // SELECT
        if (field.type === 'select' && Array.isArray(field.options)) {
            return (
                <select
                    value={value}
                    onChange={(e) => handleValueChange(field.id, e.target.value)}
                    className={`${baseClass} min-w-[120px]`}
                >
                    <option value="">Sélectionner...</option>
                    {field.options.map((opt, idx) => {
                        const val = typeof opt === 'string' ? opt : (opt.value ?? opt);
                        const lab = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                        return <option key={idx} value={val}>{lab}</option>;
                    })}
                </select>
            );
        }

        // MULTISELECT
        if (field.type === 'multiselect' && Array.isArray(field.options)) {
            const selected = Array.isArray(value) ? value : [];
            return (
                <div className="flex flex-wrap gap-1 max-w-[200px]">
                    {field.options.slice(0, 6).map((opt, idx) => {
                        const val = typeof opt === 'string' ? opt : (opt.value ?? opt);
                        const lab = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                        const isChecked = selected.includes(val);
                        return (
                            <label key={idx} className={`text-xs px-1 py-0.5 rounded border cursor-pointer ${isChecked ? 'bg-purple-100 dark:bg-purple-900 border-purple-400' : 'border-gray-300'}`}>
                                <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={(e) => {
                                        const next = e.target.checked ? [...selected, val] : selected.filter(s => s !== val);
                                        handleValueChange(field.id, next);
                                    }}
                                    className="sr-only"
                                />
                                {lab}
                            </label>
                        );
                    })}
                </div>
            );
        }

        // NUMBER / SLIDER / STEPPER
        if (field.type === 'number' || field.type === 'slider' || field.type === 'stepper') {
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => handleValueChange(field.id, e.target.value === '' ? '' : parseFloat(e.target.value))}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    placeholder={field.defaultValue !== undefined ? String(field.defaultValue) : ''}
                    className={`${baseClass} w-20`}
                />
            );
        }

        // DATE
        if (field.type === 'date') {
            return (
                <input
                    type="date"
                    value={value}
                    onChange={(e) => handleValueChange(field.id, e.target.value)}
                    className={`${baseClass} w-32`}
                />
            );
        }

        // CHECKBOX
        if (field.type === 'checkbox') {
            return (
                <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => handleValueChange(field.id, e.target.checked)}
                    className="w-4 h-4"
                />
            );
        }

        // TEXT (default)
        return (
            <input
                type="text"
                value={value}
                onChange={(e) => handleValueChange(field.id, e.target.value)}
                placeholder="Valeur"
                className={`${baseClass} w-24`}
            />
        );
    };

    const handleSaveGroup = () => {
        if (!groupName.trim() || selectedFields.length === 0) return;
        const group = {
            id: editingGroup?.id || `group_${Date.now()}`,
            name: groupName.trim(),
            description: groupDescription.trim(),
            emoji: groupEmoji,
            fields: selectedFields.map(key => ({
                key,
                value: fieldValues[key] ?? ''
            })),
            createdAt: editingGroup?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        let newGroups;
        if (editingGroup) {
            // Update existing
            newGroups = groups.map(g => (g.id === editingGroup.id) ? group : g);
        } else {
            // Add new
            newGroups = [...groups, group];
        }
        setGroups(newGroups);
        localStorage.setItem('pipeline-grouped-presets', JSON.stringify(newGroups));
        onSave && onSave(newGroups);
        setMode('list');
        resetForm();
    };

    const handleDeleteGroup = (groupId) => {
        if (!confirm('Supprimer ce groupe ?')) return;
        const newGroups = groups.filter(g => g.id !== groupId && g.name !== groupId);
        setGroups(newGroups);
        localStorage.setItem('pipeline-grouped-presets', JSON.stringify(newGroups));
    };

    // Find field definition helper
    const findFieldDef = (key) => {
        for (const section of sections) {
            const found = section.items.find(i => i.id === key || i.key === key);
            if (found) return found;
        }
        return null;
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[1100px] max-w-[95vw] h-[75vh] border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                        <span>👥</span> Groupes de préréglages
                        {mode === 'create' && <span className="text-sm font-normal text-gray-500">— Nouveau</span>}
                        {mode === 'edit' && <span className="text-sm font-normal text-gray-500">— Modifier "{editingGroup?.name}"</span>}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg">
                        <span className="text-xl">×</span>
                    </button>
                </div>

                {/* LIST MODE */}
                {mode === 'list' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                {groups.length} groupe(s) enregistré(s)
                            </h4>
                            <button
                                onClick={startCreate}
                                className="group relative px-5 py-2.5 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-xl font-semibold shadow-lg hover:shadow-purple-500/25 transition-all duration-300 flex items-center gap-2 overflow-hidden"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <span className="text-lg font-bold">+</span> Nouveau groupe
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity" />
                            </button>
                        </div>

                        {groups.length === 0 ? (
                            <div className="text-center py-12 text-gray-500">
                                <div className="text-4xl mb-3">📦</div>
                                <p>Aucun groupe de préréglages</p>
                                <p className="text-sm mt-1">Créez un groupe pour sauvegarder plusieurs champs ensemble</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {groups.map((group, idx) => (
                                    <div key={group.id || idx} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-start gap-3">
                                            <span className="text-3xl">{group.emoji || '🌱'}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-gray-900 dark:text-white">{group.name}</div>
                                                {group.description && (
                                                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{group.description}</div>
                                                )}
                                                <div className="text-xs text-gray-400 mt-2">
                                                    {group.fields?.length || 0} champ(s)
                                                </div>
                                                {/* Preview des champs */}
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {(group.fields || []).slice(0, 4).map((f, i) => {
                                                        const def = findFieldDef(f.key);
                                                        return (
                                                            <span key={i} className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded">
                                                                {def?.icon || '📌'} {def?.label || f.key}: {String(f.value).substring(0, 15) || '—'}
                                                            </span>
                                                        );
                                                    })}
                                                    {(group.fields?.length || 0) > 4 && (
                                                        <span className="text-xs px-2 py-0.5 text-gray-500">+{group.fields.length - 4}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                            <button
                                                onClick={() => startEdit(group)}
                                                className="flex-1 px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
                                            >
                                                ✏️ Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGroup(group.id || group.name)}
                                                className="px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CREATE / EDIT MODE */}
                {(mode === 'create' || mode === 'edit') && (
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {/* Form header */}
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                {/* Emoji picker */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="w-12 h-12 text-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl border border-gray-300 dark:border-gray-600 flex items-center justify-center transition-colors"
                                    >
                                        {groupEmoji}
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute top-14 left-0 z-10 p-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 grid grid-cols-6 gap-1 w-[200px]">
                                            {GROUP_EMOJIS.map(e => (
                                                <button
                                                    key={e}
                                                    onClick={() => { setGroupEmoji(e); setShowEmojiPicker(false); }}
                                                    className={`w-7 h-7 text-lg rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${groupEmoji === e ? 'bg-purple-100 dark:bg-purple-900' : ''}`}
                                                >
                                                    {e}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="Nom du groupe *"
                                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                                    />
                                    <input
                                        type="text"
                                        value={groupDescription}
                                        onChange={(e) => setGroupDescription(e.target.value)}
                                        placeholder="Description (optionnel)"
                                        className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                                    />
                                </div>
                            </div>
                            {/* Search */}
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="🔍 Rechercher un champ..."
                                className="w-full mt-3 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                            />
                        </div>

                        {/* Fields grid - 2 columns on large screens */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {filteredSections.map(section => (
                                    <div key={section.id} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{section.icon}</span>
                                                <span className="text-sm font-medium">{section.label}</span>
                                                <span className="text-xs text-gray-500">({section.items.length})</span>
                                            </div>
                                            <span className="text-gray-400">{expandedSections[section.id] ? '▼' : '▶'}</span>
                                        </button>

                                        {expandedSections[section.id] && (
                                            <div className="p-2 space-y-1 max-h-[250px] overflow-y-auto">
                                                {section.items.map(field => {
                                                    const isSelected = selectedFields.includes(field.id);
                                                    return (
                                                        <div
                                                            key={field.id}
                                                            className={`flex items-center gap-2 p-2 rounded transition-colors ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={isSelected}
                                                                onChange={() => handleToggleField(field.id)}
                                                                className="w-4 h-4 accent-purple-600 flex-shrink-0"
                                                            />
                                                            <span className="text-base flex-shrink-0">{field.icon}</span>
                                                            <span className="text-sm flex-1 truncate">{field.label}</span>

                                                            {isSelected && (
                                                                <div className="flex items-center gap-1 flex-shrink-0">
                                                                    {renderFieldInput(field)}
                                                                    {field.unit && <span className="text-xs text-gray-500">{field.unit}</span>}
                                                                </div>
                                                            )}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between gap-3 p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0 bg-gray-50 dark:bg-gray-800/50">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                                {selectedFields.length} champ(s) sélectionné(s)
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setMode('list'); resetForm(); }}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveGroup}
                                    disabled={!groupName.trim() || selectedFields.length === 0}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                                >
                                    {editingGroup ? 'Enregistrer les modifications' : 'Créer le groupe'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer for list mode */}
                {mode === 'list' && (
                    <div className="flex gap-3 p-4 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-medium transition-colors"
                        >
                            Fermer
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// Save / Load entire pipeline presets
function SavePipelineModal({ isOpen, onClose, timelineConfig, timelineData, onSavePreset, onLoadPreset }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [includeData, setIncludeData] = useState(true);
    const [saved, setSaved] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('pipeline-presets') || '[]');
        } catch (e) { return []; }
    });

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) return alert('Veuillez donner un nom au préréglage');
        const preset = {
            id: Date.now(),
            name: name.trim(),
            description: description.trim(),
            createdAt: new Date().toISOString(),
            config: timelineConfig || {},
            data: includeData ? (timelineData || []) : []
        };
        const next = [...saved, preset];
        localStorage.setItem('pipeline-presets', JSON.stringify(next));
        setSaved(next);
        onSavePreset && onSavePreset(preset);
        onClose();
    };

    const handleLoad = (preset) => {
        if (!confirm(`Charger le préréglage "${preset.name}" et remplacer la configuration actuelle ?`)) return;
        onLoadPreset && onLoadPreset(preset);
        onClose();
    };

    const handleDelete = (id) => {
        if (!confirm('Supprimer ce préréglage ?')) return;
        const next = saved.filter(s => s.id !== id);
        localStorage.setItem('pipeline-presets', JSON.stringify(next));
        setSaved(next);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 min-w-[360px] max-w-[95vw] border border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-lg mb-3">Sauvegarder / Charger un préréglage de pipeline</h3>
                <div className="mb-2">
                    <input className="w-full px-3 py-2 border rounded mb-2" placeholder="Nom du préréglage" value={name} onChange={e => setName(e.target.value)} />
                    <input className="w-full px-3 py-2 border rounded mb-2" placeholder="Description (optionnel)" value={description} onChange={e => setDescription(e.target.value)} />
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={includeData} onChange={e => setIncludeData(e.target.checked)} /> Inclure les données des cases</label>
                </div>
                <div className="flex gap-2 mt-4">
                    <button className="liquid-btn liquid-btn--accent flex-1" onClick={handleSave}>Enregistrer</button>
                    <button className="liquid-btn flex-1" onClick={onClose}>Fermer</button>
                </div>

                {saved.length > 0 && (
                    <div className="mt-4 max-h-40 overflow-y-auto">
                        <div className="font-semibold mb-2">Préréglages enregistrés</div>
                        <div className="space-y-2">
                            {saved.map(p => (
                                <div key={p.id} className="flex items-center justify-between p-2 border rounded">
                                    <div>
                                        <div className="font-medium">{p.name}</div>
                                        <div className="text-xs text-gray-500">{p.description}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button className="liquid-btn" onClick={() => handleLoad(p)}>Charger</button>
                                        <button className="liquid-btn liquid-btn--danger" onClick={() => handleDelete(p.id)}>Suppr.</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
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
    // Marquee selection threshold in pixels
    marqueeThreshold = 6,
    presets = [],
    onSavePreset = () => { },
    // Préréglages retirés
}) => {
    // toast helper
    const toast = useToast();
    const showToast = (msg, type = 'success') => {
        try {
            if (!toast) return;
            if (type === 'error') return toast.error(msg);
            if (type === 'warning') return toast.warning ? toast.warning(msg) : toast.info(msg);
            return toast.success(msg);
        } catch (e) {
            console.warn('Toast error', e);
        }
    };
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
    const [hoveredCell, setHoveredCell] = useState(null); // Cellule survolée pendant drag
    const [showPresets, setShowPresets] = useState(false);
    const [showSavePipelineModal, setShowSavePipelineModal] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStartIdx, setSelectionStartIdx] = useState(null);

    // Préréglages individuels, section et global
    const [preConfiguredItems, setPreConfiguredItems] = useState(() => {
        const saved = localStorage.getItem('pipeline-preconfig-items');
        return saved ? JSON.parse(saved) : {};
    });
    // Handler pour configurer un item individuellement (doit être déclaré ici)
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
    // Grouped presets state
    const [groupedPresets, setGroupedPresets] = useState(() => {
        const saved = localStorage.getItem('pipeline-grouped-presets');
        return saved ? JSON.parse(saved) : [];
    });
    const [showGroupedPresetModal, setShowGroupedPresetModal] = useState(false);
    const [contextMenu, setContextMenu] = useState(null); // { item, position }
    // Multi-select sidebar state (global)
    const [multiSelectedItems, setMultiSelectedItems] = useState([]);

    // Action history for undo (simple stack)
    const [actionsHistory, setActionsHistory] = useState([]);

    const pushAction = (action) => {
        setActionsHistory(prev => {
            const next = [...prev, action];
            // limit history length
            if (next.length > 50) next.shift();
            return next;
        });
    };

    const undoLastAction = () => {
        setActionsHistory(prev => {
            if (!prev || prev.length === 0) return prev;
            const last = prev[prev.length - 1];
            // apply reverse changes
            if (last && last.changes) {
                last.changes.forEach(ch => {
                    // previousValue may be undefined -> clear
                    onDataChange(ch.timestamp, ch.field, ch.previousValue === undefined ? null : ch.previousValue);
                });
            }
            return prev.slice(0, -1);
        });
    };

    const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

    const handleClearSelectedData = () => {
        const targets = (selectedCells && selectedCells.length > 0) ? selectedCells : (currentCellTimestamp ? [currentCellTimestamp] : []);
        if (!targets || targets.length === 0) {
            alert('Aucune case sélectionnée à effacer');
            return;
        }

        setConfirmState({
            open: true,
            title: 'Effacer les données',
            message: `Effacer toutes les données de ${targets.length} case(s) ? Cette action est annulable.`,
            onConfirm: () => {
                const allChanges = [];
                targets.forEach(ts => {
                    const prev = getCellData(ts) || {};
                    const keys = Object.keys(prev).filter(k => !['timestamp', 'label', 'date', 'phase', '_meta'].includes(k));
                    keys.forEach(k => {
                        allChanges.push({ timestamp: ts, field: k, previousValue: prev[k] });
                        onDataChange(ts, k, null);
                    });
                    // Also clear _meta if needed
                    if (prev._meta) {
                        allChanges.push({ timestamp: ts, field: '_meta', previousValue: prev._meta });
                        onDataChange(ts, '_meta', null);
                    }
                });

                if (allChanges.length > 0) pushAction({ id: Date.now(), type: 'clear', changes: allChanges });
                setSelectedCells([]);
                setConfirmState(prev => ({ ...prev, open: false }));
            }
        });
    };

    // Suppression des handlers préréglages


    // Toggle section
    const toggleSection = (sectionId) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    // Ouvrir modal cellule
    const handleCellClick = (e, cellId) => {
        console.log('🖱️ Clic sur cellule:', cellId);
        console.log('📊 Ctrl/Cmd pressé:', e.ctrlKey || e.metaKey);
        console.log('📋 Cellules sélectionnées avant:', selectedCells);

        // Détecter Ctrl+click pour sélection multiple (au lieu de massAssignMode)
        const isMultiSelectClick = e.ctrlKey || e.metaKey;

        if (isMultiSelectClick) {
            setSelectedCell(null);
            // Mode sélection multiple - TOGGLE la cellule
            setSelectedCells(prev => {
                const isAlreadySelected = prev.includes(cellId);
                console.log('  → Cellule déjà sélectionnée:', isAlreadySelected);

                if (isAlreadySelected) {
                    // Retirer de la sélection
                    const newSelection = prev.filter(id => id !== cellId);
                    console.log('  → Retirée, nouvelle sélection:', newSelection);
                    selectedCellsRef.current = newSelection;
                    return newSelection;
                } else {
                    // Ajouter à la sélection
                    const newSelection = [...prev, cellId];
                    console.log('  → Ajoutée, nouvelle sélection:', newSelection);
                    selectedCellsRef.current = newSelection;
                    return newSelection;
                }
            });
        } else {
            // Mode normal: ouvrir modal
            console.log('📝 Ouverture modal pour:', cellId);
            const nextSelection = selectedCells.length > 1 ? selectedCells : [cellId];
            setSelectedCells(nextSelection);
            selectedCellsRef.current = nextSelection;
            setSelectedCell(cellId);
            setDroppedItem(null);
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

        // Build history of previous values
        const changes = [];
        const prevData = getCellData(data.timestamp) || {};

        // ✅ BUG FIX #4: Ne plus vérifier droppedItem.timestamp === data.timestamp
        // Car quand on applique à plusieurs cases, droppedItem.timestamp est différent
        // À la place, vérifier juste si droppedItem existe (mode drop) ou pas (mode edit)
        if (droppedItem) {
            // Mode DROP: sauvegarder uniquement le(s) champ(s) droppé(s)
            if (droppedItem.content.type === 'multi' && Array.isArray(droppedItem.content.items)) {
                // Multi-items drop: sauvegarder tous les items droppés
                console.log('✓ Sauvegarde multi-items:', droppedItem.content.items.length, 'champs');
                droppedItem.content.items.forEach(item => {
                    const fieldKey = item.id || item.key || item.type;
                    if (data.data && data.data[fieldKey] !== undefined) {
                        changes.push({ timestamp: data.timestamp, field: fieldKey, previousValue: prevData[fieldKey] });
                        console.log('  → Multi-drop:', fieldKey, '=', data.data[fieldKey]);
                        onDataChange(data.timestamp, fieldKey, data.data[fieldKey]);
                    }
                });
            } else {
                // Single item drop
                const fieldKey = droppedItem.content.id || droppedItem.content.key || droppedItem.content.type;
                console.log('🔑 fieldKey extrait de droppedItem:', fieldKey, 'droppedItem.content:', droppedItem.content);
                if (data.data && data.data[fieldKey] !== undefined) {
                    changes.push({ timestamp: data.timestamp, field: fieldKey, previousValue: prevData[fieldKey] });
                    console.log('✓ Sauvegarde champ droppé:', fieldKey, '=', data.data[fieldKey]);
                    onDataChange(data.timestamp, fieldKey, data.data[fieldKey]);
                }
            }
            // Ne pas setDroppedItem(null) ici car handleModalSave est appelé pour chaque timestamp
            // On le clear dans handleSubmit de PipelineDataModal
        } else {
            // Sauvegarder toutes les données (cas modal normale - édition)
            console.log('✓ Sauvegarde de tous les champs:', Object.keys(data.data || {}));
            Object.entries(data.data || {}).forEach(([key, value]) => {
                // Treat empty string/null/undefined as deletion
                if (value === undefined || value === null || value === '') {
                    changes.push({ timestamp: data.timestamp, field: key, previousValue: prevData[key] });
                    console.log('  → Suppression:', key);
                    onDataChange(data.timestamp, key, null);
                } else {
                    changes.push({ timestamp: data.timestamp, field: key, previousValue: prevData[key] });
                    console.log('  → Sauvegarde:', key, '=', value);
                    onDataChange(data.timestamp, key, value);
                }
            });
        }

        if (changes.length > 0) {
            pushAction({ id: Date.now(), type: 'edit', changes });
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
        const allChanges = [];
        selectedFields = selectedFields || [];
        selectedCells.forEach(timestamp => {
            selectedFields.forEach(fieldKey => {
                const prevCell = getCellData(timestamp) || {};
                const prevValue = prevCell && prevCell.data ? prevCell.data[fieldKey] : undefined;
                const value = sourceCellForMassAssign && sourceCellForMassAssign.data && sourceCellForMassAssign.data.data ? sourceCellForMassAssign.data.data[fieldKey] : undefined;
                allChanges.push({ timestamp, field: fieldKey, previousValue: prevValue });
                onDataChange(timestamp, fieldKey, value);
            });

            // Mettre à jour les métadonnées
            const totalFields = (sidebarContent || []).reduce((acc, section) => acc + (section.items?.length || 0), 0);
            const filledFields = selectedFields.length;
            const completionPercentage = Math.round((filledFields / (totalFields || 1)) * 100);

            const prevMeta = (getCellData(timestamp) || {})._meta;
            allChanges.push({ timestamp, field: '_meta', previousValue: prevMeta });
            onDataChange(timestamp, '_meta', {
                completionPercentage,
                lastModified: new Date().toISOString()
            });
        });

        if (allChanges.length > 0) pushAction({ id: Date.now(), type: 'mass-assign', changes: allChanges });

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

    // CDC CONFORME: handleDrop ouvre PipelineDataModal avec l'item droppé
    // OU applique directement un groupe de préréglages
    const handleDrop = (e, timestamp) => {
        e.preventDefault();
        e.stopPropagation();
        setHoveredCell(null);

        try {
            console.log('✅ handleDrop CDC: draggedContent=', draggedContent, 'timestamp=', timestamp);

            if (!draggedContent) {
                console.log('✅ handleDrop: Pas de draggedContent, sortir');
                return;
            }

            if (!timestamp) {
                console.warn('⚠️ handleDrop: timestamp invalide ou manquant');
                return;
            }

            // ✅ BUG FIX #5: Vérifier si données existantes avant d'ouvrir modal (sauf pour groupes)
            const existingData = getCellData(timestamp);
            const hasExistingData = existingData && Object.keys(existingData).some(k => 
                !['timestamp', '_meta', 'date', 'label', 'phase'].includes(k)
            );

            // ✅ BUG FIX #3: MULTI-ITEMS DROP - Ouvrir modal avec tous les items sélectionnés
            if (draggedContent.type === 'multi-items' && Array.isArray(draggedContent.items)) {
                console.log('✅ handleDrop: Multi-items drop avec', draggedContent.items.length, 'items');
                
                // Vérifier conflits pour chaque item
                if (hasExistingData) {
                    const conflictingItems = draggedContent.items.filter(item => {
                        const fieldKey = item.id || item.key || item.type;
                        return existingData[fieldKey] !== undefined;
                    });
                    
                    if (conflictingItems.length > 0) {
                        const conflictLabels = conflictingItems.map(i => i.label || i.key).join(', ');
                        setConfirmState({
                            open: true,
                            title: 'Écraser les données existantes ?',
                            message: `La cellule contient déjà des valeurs pour: ${conflictLabels}. Voulez-vous les remplacer ?`,
                            onConfirm: () => {
                                setCurrentCellTimestamp(timestamp);
                                setDroppedItem({
                                    timestamp,
                                    content: { type: 'multi', items: draggedContent.items }
                                });
                                setIsModalOpen(true);
                                setDraggedContent(null);
                                setConfirmState(prev => ({ ...prev, open: false }));
                            }
                        });
                        return;
                    }
                }
                
                // Pas de conflit ou pas de données existantes
                setCurrentCellTimestamp(timestamp);
                setDroppedItem({
                    timestamp,
                    content: { type: 'multi', items: draggedContent.items }
                });
                setIsModalOpen(true);
                setDraggedContent(null);
                return;
            }

            // GROUPED PRESET: Appliquer directement sans ouvrir le modal
            if (draggedContent.type === 'grouped' && draggedContent.group) {
                console.log('✅ handleDrop: Application groupe préréglage:', draggedContent.group);
                const group = draggedContent.group;
                const fields = group.fields || [];

                if (fields.length === 0) {
                    console.warn('⚠️ handleDrop: Groupe vide, rien à appliquer');
                    setDraggedContent(null);
                    return;
                }

                // Appliquer chaque champ du groupe à la cellule
                fields.forEach(f => {
                    if (f.key && f.value !== undefined && f.value !== '') {
                        console.log(`  → Applique ${f.key} = ${f.value}`);
                        onDataChange(timestamp, f.key, f.value);
                    }
                });

                // Feedback visuel
                toast && toast.success(`✓ Groupe "${group.name}" appliqué (${fields.length} champs)`);
                setDraggedContent(null);
                return;
            }

            // Sinon, ouvrir PipelineDataModal avec l'item droppé
            console.log('✅ handleDrop: Ouverture PipelineDataModal');
            
            // ✅ BUG FIX #5: Vérifier conflit pour item simple
            if (hasExistingData) {
                const fieldKey = draggedContent.id || draggedContent.key || draggedContent.type;
                const fieldExists = existingData[fieldKey] !== undefined;
                
                if (fieldExists) {
                    setConfirmState({
                        open: true,
                        title: 'Écraser la valeur existante ?',
                        message: `La cellule ${timestamp} contient déjà une valeur pour "${draggedContent.label}". Voulez-vous la remplacer ?`,
                        onConfirm: () => {
                            setCurrentCellTimestamp(timestamp);
                            setDroppedItem({ timestamp, content: draggedContent });
                            setIsModalOpen(true);
                            setDraggedContent(null);
                            setConfirmState(prev => ({ ...prev, open: false }));
                        }
                    });
                    return;
                }
            }
            
            setCurrentCellTimestamp(timestamp);
            setDroppedItem({
                timestamp,
                content: draggedContent
            });
            setIsModalOpen(true);
            setDraggedContent(null);

        } catch (error) {
            console.error('❌ Erreur handleDrop:', error);
        }
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
    const gridRef = useRef(null);
    const cellRefs = useRef({});
    const selectionStartClientRef = useRef({ x: 0, y: 0 });
    const selectionStartTimestampRef = useRef(null);

    const [selectionRect, setSelectionRect] = useState({ visible: false, x: 0, y: 0, width: 0, height: 0, startX: 0, startY: 0 });

    const startSelection = (e, startIdx, timestamp) => {
        // Begin potential drag-selection. We wait for small threshold movement
        if (e.button !== 0) return;
        e.preventDefault();
        const clientX = e.clientX;
        const clientY = e.clientY;
        // store client start for movement threshold calculations
        selectionStartClientRef.current = { x: clientX, y: clientY };

        // compute grid-relative start coordinates
        const gridBox = gridRef.current && gridRef.current.getBoundingClientRect();
        const relX = gridBox ? clientX - gridBox.left + gridRef.current.scrollLeft : clientX;
        const relY = gridBox ? clientY - gridBox.top + gridRef.current.scrollTop : clientY;

        setIsSelecting(true);
        setSelectionStartIdx(startIdx);
        selectionStartTimestampRef.current = timestamp;
        // initialize rect but keep it hidden until movement threshold
        setSelectionRect({ visible: false, x: relX, y: relY, width: 0, height: 0, startX: relX, startY: relY });
        setSelectedCells([]);
        selectedCellsRef.current = [];
    };

    const updateSelectionTo = (currentIdx) => {
        // kept for compatibility but not used for rectangle selection
        if (selectionStartIdx === null) return;
        const a = Math.min(selectionStartIdx, currentIdx);
        const b = Math.max(selectionStartIdx, currentIdx);
        const range = cells.slice(a, b + 1).map(c => c.timestamp);
        setSelectedCells(range);
        selectedCellsRef.current = range;
    };

    // Mouse move/up handlers for rectangle selection
    useEffect(() => {
        const MOVE_THRESHOLD = marqueeThreshold || 6; // px before showing rectangle (configurable prop)
        const onMove = (e) => {
            if (!isSelecting) return;
            const gridBox = gridRef.current && gridRef.current.getBoundingClientRect();
            const clientX = e.clientX;
            const clientY = e.clientY;

            const relX = gridBox ? clientX - gridBox.left + gridRef.current.scrollLeft : clientX;
            const relY = gridBox ? clientY - gridBox.top + gridRef.current.scrollTop : clientY;

            const { startX: relStartX, startY: relStartY, visible } = selectionRect;
            const dx = relX - relStartX;
            const dy = relY - relStartY;
            const absdx = Math.abs(dx);
            const absdy = Math.abs(dy);
            const x = Math.min(relStartX, relX);
            const y = Math.min(relStartY, relY);
            const width = Math.abs(dx);
            const height = Math.abs(dy);

            // Only show rectangle after threshold to avoid clicks turning into drags.
            // Use client distance for threshold to remain consistent even if grid is scrolled.
            const clientStart = selectionStartClientRef.current || { x: 0, y: 0 };
            const movedClient = Math.hypot(clientX - clientStart.x, clientY - clientStart.y);
            if (!visible && movedClient > MOVE_THRESHOLD) {
                setSelectionRect(prev => ({ ...prev, visible: true, x, y, width, height }));
            } else if (visible) {
                setSelectionRect(prev => ({ ...prev, x, y, width, height }));
            } else {
                // keep storing start if not visible yet
                setSelectionRect(prev => ({ ...prev, startX: relStartX, startY: relStartY }));
            }
        };

        const onUp = (e) => {
            if (!isSelecting) return;
            const gridBox = gridRef.current && gridRef.current.getBoundingClientRect();
            const clientX = e.clientX;
            const clientY = e.clientY;

            // compute current and start positions in grid-relative coordinates using stored client start
            const relCurrentX = gridBox ? clientX - gridBox.left + gridRef.current.scrollLeft : clientX;
            const relCurrentY = gridBox ? clientY - gridBox.top + gridRef.current.scrollTop : clientY;
            const clientStart = selectionStartClientRef.current || { x: clientX, y: clientY };
            const relStartX = gridBox ? clientStart.x - gridBox.left + gridRef.current.scrollLeft : clientStart.x;
            const relStartY = gridBox ? clientStart.y - gridBox.top + gridRef.current.scrollTop : clientStart.y;

            const x = Math.min(relStartX, relCurrentX);
            const y = Math.min(relStartY, relCurrentY);
            const width = Math.abs(relCurrentX - relStartX);
            const height = Math.abs(relCurrentY - relStartY);

            const rect = { left: x, top: y, right: x + width, bottom: y + height, width, height };
            const sel = [];

            if (rect.width > 0 && rect.height > 0) {
                // compute selected cells intersecting selectionRect using grid-relative coordinates
                Object.entries(cellRefs.current).forEach(([ts, el]) => {
                    if (!el) return;
                    const r = el.getBoundingClientRect();
                    const cellLeft = r.left - (gridBox ? gridBox.left : 0) + (gridRef.current ? gridRef.current.scrollLeft : 0);
                    const cellTop = r.top - (gridBox ? gridBox.top : 0) + (gridRef.current ? gridRef.current.scrollTop : 0);
                    const cellRect = { left: cellLeft, top: cellTop, right: cellLeft + r.width, bottom: cellTop + r.height };
                    const intersects = !(cellRect.right < rect.left || cellRect.left > rect.right || cellRect.bottom < rect.top || cellRect.top > rect.bottom);
                    if (intersects) sel.push(ts);
                });
                setSelectedCells(sel);
                selectedCellsRef.current = sel;
            } else {
                // treat as click (no significant drag) - select single start cell
                const ts = selectionStartTimestampRef.current;
                if (ts) {
                    setSelectedCells([ts]);
                    selectedCellsRef.current = [ts];
                }
            }

            // cleanup
            setIsSelecting(false);
            setSelectionStartIdx(null);
            selectionStartTimestampRef.current = null;
            setSelectionRect({ visible: false, x: 0, y: 0, width: 0, height: 0, startX: 0, startY: 0 });
            selectionStartClientRef.current = { x: 0, y: 0 };
        };

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        return () => {
            window.removeEventListener('mousemove', onMove);
            window.removeEventListener('mouseup', onUp);
        };
    }, [isSelecting, selectionRect]);

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
            const allChanges = [];
            selectedCells.forEach(ts => {
                const prev = getCellData(ts) || {};
                const prevValue = prev && prev.data ? prev.data[itemKey] : undefined;
                allChanges.push({ timestamp: ts, field: itemKey, previousValue: prevValue });
                onDataChange(ts, itemKey, sourceValue);
            });
            if (allChanges.length > 0) pushAction({ id: Date.now(), type: 'mass-assign-from-source', changes: allChanges });
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
        const allChanges = [];
        range.forEach(ts => {
            const prev = getCellData(ts) || {};
            const prevValue = prev && prev.data ? prev.data[itemKey] : undefined;
            allChanges.push({ timestamp: ts, field: itemKey, previousValue: prevValue });
            onDataChange(ts, itemKey, value);
        });
        if (allChanges.length > 0) pushAction({ id: Date.now(), type: 'assign-range', changes: allChanges });
        showToast(`✓ ${itemKey} assigné à ${range.length} case(s)`);
    };

    // Assigner la valeur à toutes les cases
    const handleAssignAll = (itemKey, value) => {
        if (!confirm(`Assigner ${itemKey} = ${value} à TOUTES les cases (${cells.length}) ?`)) return;
        const allChanges = [];
        cells.forEach(c => {
            const prev = getCellData(c.timestamp) || {};
            const prevValue = prev && prev.data ? prev.data[itemKey] : undefined;
            allChanges.push({ timestamp: c.timestamp, field: itemKey, previousValue: prevValue });
            onDataChange(c.timestamp, itemKey, value);
        });
        if (allChanges.length > 0) pushAction({ id: Date.now(), type: 'assign-all', changes: allChanges });
        showToast(`✓ ${itemKey} assigné à toutes les cases`);
    };

    // Appliquer un préréglage de pipeline (chargement) - remplace config et (optionnel) données
    const applyPipelinePreset = (preset) => {
        if (!preset) return;
        // Apply config keys
        try {
            const cfg = preset.config || {};
            Object.entries(cfg).forEach(([k, v]) => {
                try { onConfigChange(k, v); } catch (e) { console.warn('applyPipelinePreset config error', e); }
            });

            // Apply data (record previous values for undo)
            const allChanges = [];
            (preset.data || []).forEach(cell => {
                const ts = cell.timestamp;
                if (!ts) return;
                const prev = getCellData(ts) || {};
                Object.entries(cell).forEach(([field, value]) => {
                    if (field === 'timestamp') return;
                    const prevValue = prev && prev[field] !== undefined ? prev[field] : (prev.data ? prev.data[field] : undefined);
                    allChanges.push({ timestamp: ts, field, previousValue: prevValue });
                    onDataChange(ts, field, value);
                });
            });

            if (allChanges.length > 0) pushAction({ id: Date.now(), type: 'load-preset', changes: allChanges });
            showToast(`✓ Préréglage "${preset.name}" chargé`);
        } catch (e) {
            console.error('Erreur lors du chargement du préréglage', e);
        }
    };

    // Supprimer un champ d'une case (utilisé par PipelineDataModal)
    const handleFieldDelete = (ts, fieldKey) => {
        if (!ts || !fieldKey) return;
        const prev = getCellData(ts) || {};
        const prevValue = prev && prev[fieldKey] !== undefined ? prev[fieldKey] : (prev.data ? prev.data[fieldKey] : undefined);
        onDataChange(ts, fieldKey, null);
        pushAction({ id: Date.now(), type: 'field-delete', changes: [{ timestamp: ts, field: fieldKey, previousValue: prevValue }] });
        showToast('Champ effacé');
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
            // Validate parsed dates
            if (isNaN(startDate) || isNaN(endDate)) return [];
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

    // Normaliser et récupérer les champs utiles d'une case (supporte deux shapes: {timestamp, data:{...}} et {timestamp, field:...})
    const getCellEntry = (timestamp) => timelineData.find(d => d.timestamp === timestamp) || null;

    const getCellFields = (timestamp) => {
        const entry = getCellEntry(timestamp);
        if (!entry) return {};
        let fields = {};
        if (entry.data && typeof entry.data === 'object') {
            fields = { ...entry.data };
        }
        // copy root-level fields (excluding structural/meta keys)
        Object.keys(entry).forEach(k => {
            if (!['timestamp', 'date', 'label', 'phase', 'data', '_meta'].includes(k)) {
                fields[k] = entry[k];
            }
        });
        // attach meta/date/timestamp for display
        if (entry.timestamp) fields.timestamp = entry.timestamp;
        if (entry.date) fields.date = entry.date;
        if (entry._meta) fields._meta = entry._meta;
        return fields;
    };

    const hasCellData = (timestamp) => {
        const fields = getCellFields(timestamp);
        // Exclude only structural keys
        const dataKeys = Object.keys(fields).filter(k => !['_meta', 'timestamp', 'date'].includes(k));
        return dataKeys.length > 0;
    };

    // Backwards-compatible alias used throughout the file
    const getCellData = (timestamp) => getCellFields(timestamp);

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
        <div className="flex gap-6 h-[750px]">
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
                        <div className="font-semibold text-xs text-gray-400 dark:text-gray-300 mb-1">Pré-configuration</div>
                        <button
                            className="w-full mt-1 mb-2 group relative flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-md hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300 overflow-hidden"
                            onClick={() => setShowGroupedPresetModal(true)}
                        >
                            <Plus className="w-4 h-4" />
                            <span>Groupe de préréglages</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
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
                                        className="px-3 py-2 rounded-lg bg-purple-50 dark:bg-purple-900/30 border border-purple-300 dark:border-purple-700 text-xs font-bold cursor-grab hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-all"
                                        title={`${group.description || ''}\n${(group.fields || []).map(f => `${f.key}: ${f.value}`).join('\n')}`}
                                    >
                                        <span className="mr-1">{group.emoji || '🌱'}</span>{group.name}
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
                                        const itemKey = item.key || item.id;
                                        const isPreConfigured = preConfiguredItems[itemKey] !== undefined;
                                        const isSelected = multiSelectedItems.includes(itemKey);
                                        let isDragging = false;

                                        const handleSidebarItemClick = (e) => {
                                            // Ne rien faire si on est en train de drag
                                            if (isDragging) {
                                                isDragging = false;
                                                return;
                                            }

                                            if (e.ctrlKey || e.metaKey) {
                                                // Multi-sélection UNIQUEMENT avec Ctrl/Cmd
                                                setMultiSelectedItems(prev =>
                                                    prev.includes(itemKey)
                                                        ? prev.filter(k => k !== itemKey)
                                                        : [...prev, itemKey]
                                                );
                                            } else {
                                                // Clic simple : DÉSÉLECTIONNER TOUT (pas de sélection visuelle)
                                                // Seul le drag or drop peut utiliser l'item
                                                setMultiSelectedItems([]);
                                            }
                                        };

                                        return (
                                            <div
                                                key={itemKey}
                                                draggable="true"
                                                onDragStart={(e) => {
                                                    isDragging = true;
                                                    // Si l'item n'est pas dans la sélection multiple, drag uniquement cet item
                                                    if (!isSelected || multiSelectedItems.length === 1) {
                                                        handleDragStart(e, item);
                                                        setMultiSelectedItems([]); // Clear selection après drag
                                                    } else {
                                                        // Multi-items drag - Chercher dans TOUTES les sections
                                                        const selectedItems = multiSelectedItems
                                                            .map(k => {
                                                                // Chercher l'item dans toutes les sections
                                                                for (const sec of sidebarContent) {
                                                                    const found = sec.items?.find(i => (i.key || i.id) === k);
                                                                    if (found) return found;
                                                                }
                                                                return null;
                                                            })
                                                            .filter(Boolean);

                                                        console.log('🎯 Multi-drag:', selectedItems.length, 'items depuis', multiSelectedItems.length, 'keys');
                                                        e.dataTransfer.setData('application/multi-items', JSON.stringify(selectedItems));
                                                        setDraggedContent({ type: 'multi', items: selectedItems });
                                                    }
                                                }}
                                                onDragEnd={(e) => {
                                                    e.currentTarget.classList.remove('dragging');
                                                    setDraggedContent(null);
                                                    setMultiSelectedItems([]);
                                                }}
                                                onClick={handleSidebarItemClick}
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
                                                    : 'bg-gray-50 dark:bg-gray-800 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700'
                                                    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                                                style={{ touchAction: 'none' }}
                                                title={isPreConfigured ? `Pré-configuré: ${preConfiguredItems[itemKey]}${item.unit || ''}` : 'Clic droit pour pré-configurer'}
                                            >
                                                {/* Badge pré-configuré */}
                                                {isPreConfigured && (
                                                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded text-xs mr-1">{preConfiguredItems[itemKey]}{item.unit || ''}</span>
                                                )}
                                                <span className="text-base">{item.icon}</span>
                                                <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1">
                                                    {item.label}
                                                </span>
                                                <span className={`text-xs transition-colors ${isPreConfigured ? 'text-green-600 dark:text-green-400' : 'text-gray-400 group-hover:text-gray-600'}`}>
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
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-transparent dark:bg-transparent">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg flex items-center gap-2">
                            <span>📊</span>
                            Pipeline {type === 'culture' ? 'Culture' : 'Curing/Maturation'}
                        </h3>
                        <div className="flex items-center gap-2">
                            {/* Undo action only */}
                            <button
                                onClick={() => undoLastAction()}
                                className="group flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 rounded-xl text-gray-700 dark:text-gray-300 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm transition-all duration-200 shadow-sm hover:shadow"
                                title="Annuler la dernière action (Ctrl+Z)"
                            >
                                <svg className="w-4 h-4 transform group-hover:-rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                </svg>
                                <span>Annuler</span>
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
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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
                                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
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

                    </div>

                    {/* Progress bar - Full width spanning entire config area */}
                    <div className="mt-4">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Progression</div>
                            <div className="flex items-center gap-3">
                                <div className="text-xs text-gray-500 dark:text-gray-400" title={`${filledCells}/${cells.length} cases`}>{filledCells}/{cells.length}</div>
                                <div className="text-sm font-bold text-purple-600 dark:text-purple-400">{Math.round(completionPercent)}%</div>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden border border-gray-200 dark:border-gray-700 shadow-inner">
                            <div
                                className="h-3 rounded-full bg-gradient-to-r from-purple-400 via-purple-500 to-purple-600 transition-all duration-500 ease-out"
                                style={{ width: `${Math.max(0, Math.min(100, completionPercent))}%` }}
                                aria-valuenow={completionPercent}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            />
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

                {/* TIMELINE GRID - Inside Pipeline Culture container */}
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

                            <div ref={gridRef} className="grid grid-cols-7 gap-2 select-none relative">
                                {/* Visual selection frame overlay */}
                                {selectedCells.length > 1 && !isSelecting && (() => {
                                    // Compute aggregate bounding box of selected cells using DOM measurements
                                    const refs = selectedCells.map(ts => cellRefs.current[ts]).filter(Boolean);
                                    if (!refs || refs.length === 0) return null;
                                    const gridBox = gridRef.current && gridRef.current.getBoundingClientRect();
                                    if (!gridBox) return null;

                                    const boxes = refs.map(el => {
                                        const r = el.getBoundingClientRect();
                                        return {
                                            left: r.left,
                                            top: r.top,
                                            right: r.right,
                                            bottom: r.bottom
                                        };
                                    });

                                    const leftPx = Math.min(...boxes.map(b => b.left)) - gridBox.left + (gridRef.current ? gridRef.current.scrollLeft : 0);
                                    const topPx = Math.min(...boxes.map(b => b.top)) - gridBox.top + (gridRef.current ? gridRef.current.scrollTop : 0);
                                    const rightPx = Math.max(...boxes.map(b => b.right)) - gridBox.left + (gridRef.current ? gridRef.current.scrollLeft : 0);
                                    const bottomPx = Math.max(...boxes.map(b => b.bottom)) - gridBox.top + (gridRef.current ? gridRef.current.scrollTop : 0);

                                    const widthPx = rightPx - leftPx;
                                    const heightPx = bottomPx - topPx;

                                    return (
                                        <div
                                            className="absolute pointer-events-none z-40 border-4 rounded-2xl shadow-lg animate-fade-in"
                                            style={{
                                                top: `${topPx}px`,
                                                left: `${leftPx}px`,
                                                width: `${widthPx}px`,
                                                height: `${heightPx}px`,
                                                boxSizing: 'border-box',
                                                transition: 'all 0.08s',
                                                borderStyle: 'dashed',
                                                background: 'rgba(80,180,255,0.07)'
                                            }}
                                        />
                                    );
                                })()}
                                {/* Selection rectangle (live) */}
                                {/* Selection marquee (rendered always, animated via opacity/transform) */}
                                <div
                                    className="absolute z-50 pointer-events-none border-4 rounded-2xl shadow-lg"
                                    style={{
                                        top: selectionRect.y,
                                        left: selectionRect.x,
                                        width: selectionRect.width,
                                        height: selectionRect.height,
                                        boxSizing: 'border-box',
                                        borderStyle: 'dashed',
                                        background: 'rgba(80,180,255,0.06)',
                                        opacity: selectionRect.visible ? 1 : 0,
                                        transform: selectionRect.visible ? 'scale(1)' : 'scale(0.98)',
                                        transition: 'opacity 150ms ease-out, transform 150ms ease-out'
                                    }}
                                />

                                {cells.map((cell, idx) => {
                                    const hasData = hasCellData(cell.timestamp);
                                    const cellData = getCellData(cell.timestamp);
                                    const isFirst = idx === 0;
                                    const isSelected = selectedCells.includes(cell.timestamp);
                                    const isHovered = hoveredCell === cell.timestamp;

                                    // Construire classes CSS pour la cellule
                                    let cellClass = `relative p-3 rounded-lg border-2 transition-all cursor-pointer min-h-[80px]`;

                                    // Gradient d'intensité GitHub-style selon nombre de données
                                    if (hasData) {
                                        const dataCount = Object.keys(cellData).filter(k =>
                                            !['timestamp', 'date', 'label', 'phase', 'day', 'week', 'hours', 'seconds', 'note', '_meta'].includes(k)
                                        ).length;
                                        const intensity = Math.min(dataCount / 10, 1);
                                        const intensityIndex = Math.floor(intensity * 4); // 0-4

                                        // Palette verte progressive (GitHub-style)
                                        const gradients = [
                                            'border-green-400 bg-green-100/40 dark:border-green-600 dark:bg-green-950/30',
                                            'border-green-500 bg-green-200/50 dark:border-green-500 dark:bg-green-900/40',
                                            'border-green-600 bg-green-300/60 dark:border-green-400 dark:bg-green-800/50',
                                            'border-green-700 bg-green-400/70 dark:border-green-300 dark:bg-green-700/60',
                                            'border-green-800 bg-green-500/80 dark:border-green-200 dark:bg-green-600/70'
                                        ];
                                        cellClass += ' ' + gradients[intensityIndex];
                                    } else {
                                        cellClass += ' border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800';
                                    }

                                    // Selected par clic simple (modal)
                                    cellClass += selectedCell === cell.timestamp
                                        ? ' ring-2 ring-violet-500 shadow-lg'
                                        : ' hover:border-violet-400 hover:shadow-md';

                                    // Selected en mode masse (multi-sélection)
                                    cellClass += isSelected
                                        ? ' ring-4 ring-blue-500 dark:ring-blue-400 bg-blue-500/10'
                                        : '';

                                    // Hover pendant drag
                                    cellClass += isHovered && draggedContent
                                        ? ' ring-4 ring-violet-500 dark:ring-violet-400 scale-105 shadow-2xl animate-pulse'
                                        : '';

                                    // Span 2 colonnes pour première cellule
                                    if (isFirst) {
                                        cellClass += ' col-span-2';
                                    }

                                    return (
                                        <div
                                            key={cell.timestamp}
                                            onDragOver={(e) => handleDragOver(e, cell.timestamp)}
                                            onDragLeave={handleDragLeave}
                                            onDrop={(e) => handleDrop(e, cell.timestamp)}
                                            onClick={(e) => handleCellClick(e, cell.timestamp)}
                                            onMouseEnter={(e) => { handleCellHover(e, cell.timestamp); }}
                                            onMouseLeave={handleCellLeave}
                                            onMouseDown={(e) => { if (e.button === 0) startSelection(e, idx, cell.timestamp); }}
                                            onMouseUp={(e) => { /* handled globally to compute rectangle on mouseup */ }}
                                            ref={(el) => { cellRefs.current[cell.timestamp] = el; }}
                                            className={cellClass}
                                            style={{ userSelect: 'none' }}
                                        >
                                            {/* Indicateur visuel drop */}
                                            {isHovered && draggedContent && (
                                                <div className="absolute inset-0 rounded-lg flex items-center justify-center z-20 pointer-events-none">
                                                    <div className="text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                                        📌 Déposer ici
                                                    </div>
                                                </div>
                                            )}

                                            {/* Affichage 4 emojis superposables CDC-conforme */}
                                            {hasData && (
                                                <CellEmojiOverlay
                                                    cellData={cellData}
                                                    sidebarContent={sidebarContent}
                                                    onShowDetails={() => {
                                                        setCurrentCellTimestamp(cell.timestamp);
                                                        setIsModalOpen(true);
                                                    }}
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
                                                    <div className="mt-1 text-[10px] dark: font-semibold">
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
                                        className="p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 hover: hover: dark:hover: transition-all cursor-pointer flex items-center justify-center min-h-[80px]"
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
                                                if (isNaN(endDate)) return;
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

            {/* Modal save/load pipeline presets */}
            <SavePipelineModal
                isOpen={showSavePipelineModal}
                onClose={() => setShowSavePipelineModal(false)}
                timelineConfig={timelineConfig}
                timelineData={timelineData}
                onSavePreset={(p) => { /* noop - preserved for external hooks */ }}
                onLoadPreset={(p) => applyPipelinePreset(p)}
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
                droppedItem={droppedItem}
                pipelineType={type}
                onFieldDelete={handleFieldDelete}
                groupedPresets={groupedPresets}
                preConfiguredItems={preConfiguredItems}
                selectedCells={selectedCells}
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
            {
                contextMenu && (
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
                                    className="flex-1 px-4 py-2 hover: text-white rounded-xl font-medium transition-all"
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
                                        className="flex-1 px-3 py-2 hover: text-white rounded-lg text-xs font-semibold"
                                        onClick={() => {
                                            // Assignation à toutes les cases sélectionnées
                                            const val = document.getElementById('preconfig-value-input').value;
                                            const changes = [];
                                            selectedCells.forEach(ts => {
                                                const prev = getCellData(ts) || {};
                                                const prevValue = prev && prev.data ? prev.data[contextMenu.item.key] : undefined;
                                                changes.push({ timestamp: ts, field: contextMenu.item.key, previousValue: prevValue });
                                                onDataChange(ts, contextMenu.item.key, val);
                                            });
                                            if (changes.length > 0) pushAction({ id: Date.now(), type: 'preconfig-assign-selection', changes });
                                            setContextMenu(null);
                                        }}
                                        disabled={selectedCells.length === 0}
                                    >{selectedCells.length > 0 ? `Sélection (${selectedCells.length})` : 'Sélectionner des cases'}</button>
                                    <button
                                        className="flex-1 px-3 py-2 hover: text-white rounded-lg text-xs font-semibold"
                                        onClick={() => {
                                            // Assignation à toutes les cases
                                            const val = document.getElementById('preconfig-value-input').value;
                                            const changes = [];
                                            cells.forEach(cell => {
                                                const prev = getCellData(cell.timestamp) || {};
                                                const prevValue = prev && prev.data ? prev.data[contextMenu.item.key] : undefined;
                                                changes.push({ timestamp: cell.timestamp, field: contextMenu.item.key, previousValue: prevValue });
                                                onDataChange(cell.timestamp, contextMenu.item.key, val);
                                            });
                                            if (changes.length > 0) pushAction({ id: Date.now(), type: 'preconfig-assign-all', changes });
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
