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

import { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ConfirmModal from '../../shared/ConfirmModal';
import { useToast } from '../../shared/ToastContainer';
import { LiquidModal, useEscapeClose } from '@/components/ui/LiquidUI';
import CellContextMenu from './CellContextMenu';
import { CULTURE_PHASES, CURING_PHASES, SEPARATION_PHASES, EXTRACTION_PHASES, RECIPE_PHASES } from '../../../config/pipelinePhases';
import { INTERVAL_TYPES_CONFIG, ALLOWED_INTERVALS_BY_PIPELINE, resolveIntervalKey, getOptionsForPipeline } from '../../../config/intervalTypes';

// Emojis disponibles pour les groupes
const GROUP_EMOJIS = ['🌱', '🌿', '💧', '☀️', '🌡️', '📊', '⚗️', '🧪', '🔬', '💨', '🏠', '🌞', '🌙', '💡', '🔌', '📅', '⏱️', '📏', '🎯', '✨', '🚀', '💪', '🎨', '🔥', '❄️', '💎', '🌈', '🍃', '🌸', '🍀'];

// Grouped preset modal - COMPLETE with proper field types, edit mode, emoji
function GroupedPresetModal({ isOpen, onClose, onSave, groups, setGroups, sidebarContent, type }) {
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

    // Close on Escape (topmost modal only)
    useEscapeClose(isOpen, onClose);

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
        const baseClass = "px-2 py-1 bg-white/5 border border-white/20 rounded text-sm text-white";

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
                            <label key={idx} className={`text-xs px-1 py-0.5 rounded border cursor-pointer ${isChecked ? 'bg-purple-500/20 border-purple-400' : 'border-white/20'}`}>
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

        // Mise à jour du state et localStorage
        setGroups(newGroups);
        const storageKey = `pipeline-grouped-presets-${type || 'unknown'}`;
        localStorage.setItem(storageKey, JSON.stringify(newGroups));

        // onSave est optionnel et ne devrait pas être setGroups pour éviter les doubles updates
        if (onSave && onSave !== setGroups) {
            onSave(newGroups);
        }

        // Fermer la modal après enregistrement
        resetForm();
        onClose();
    };

    const handleDeleteGroup = (groupId) => {
        if (!confirm('Supprimer ce groupe ?')) return;
        // Supprimer le groupe qui correspond à l'ID ou au nom
        const newGroups = groups.filter(g => !(g.id === groupId || g.name === groupId));
        setGroups(newGroups);
        const storageKey = `pipeline-grouped-presets-${type || 'unknown'}`;
        localStorage.setItem(storageKey, JSON.stringify(newGroups));
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
            <div className="bg-[#0a0a12] rounded-2xl shadow-2xl w-full sm:w-[90vw] md:w-[800px] max-w-[98vw] h-[95vh] sm:h-[88vh] border border-white/10 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-white/10 flex-shrink-0">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <span>👥</span> Groupes de préréglages
                        {mode === 'create' && <span className="text-sm font-normal text-white/50">— Nouveau</span>}
                        {mode === 'edit' && <span className="text-sm font-normal text-white/50">— Modifier "{editingGroup?.name}"</span>}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg transition-colors">
                        <span className="text-2xl leading-none">×</span>
                    </button>
                </div>

                {/* LIST MODE */}
                {mode === 'list' && (
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-white/70">
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
                            <div className="text-center py-12 text-white/50">
                                <div className="text-4xl mb-3">📦</div>
                                <p>Aucun groupe de préréglages</p>
                                <p className="text-sm mt-1">Créez un groupe pour sauvegarder plusieurs champs ensemble</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {groups.map((group, idx) => (
                                    <div key={group.id || idx} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <div className="flex items-start gap-3">
                                            <span className="text-3xl">{group.emoji || '🌱'}</span>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-semibold text-white">{group.name}</div>
                                                {group.description && (
                                                    <div className="text-sm text-white/50 mt-0.5">{group.description}</div>
                                                )}
                                                <div className="text-xs text-white/50 mt-2">
                                                    {group.fields?.length || 0} champ(s)
                                                </div>
                                                {/* Preview des champs */}
                                                <div className="flex flex-wrap gap-1 mt-2">
                                                    {(group.fields || []).slice(0, 4).map((f, i) => {
                                                        const def = findFieldDef(f.key);
                                                        return (
                                                            <span key={i} className="text-xs px-2 py-0.5 bg-white/10 rounded">
                                                                {def?.icon || '📌'} {def?.label || f.key}: {String(f.value).substring(0, 15) || '—'}
                                                            </span>
                                                        );
                                                    })}
                                                    {(group.fields?.length || 0) > 4 && (
                                                        <span className="text-xs px-2 py-0.5 text-white/50">+{group.fields.length - 4}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 mt-3 pt-3 border-t border-white/10">
                                            <button
                                                onClick={() => startEdit(group)}
                                                className="flex-1 px-3 py-1.5 text-sm bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 rounded-lg transition-colors"
                                            >
                                                ✏️ Modifier
                                            </button>
                                            <button
                                                onClick={() => handleDeleteGroup(group.id || group.name)}
                                                className="px-3 py-1.5 text-sm text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
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
                        <div className="p-4 border-b border-white/10 flex-shrink-0">
                            <div className="flex items-center gap-3">
                                {/* Emoji picker */}
                                <div className="relative">
                                    <button
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className="w-12 h-12 text-2xl bg-white/5 hover:bg-white/10 rounded-xl border border-white/20 flex items-center justify-center transition-colors"
                                    >
                                        {groupEmoji}
                                    </button>
                                    {showEmojiPicker && (
                                        <div className="absolute top-14 left-0 z-10 p-2 bg-[#0a0a12] rounded-xl shadow-xl border border-white/10 grid grid-cols-6 gap-1 w-[200px]">
                                            {GROUP_EMOJIS.map(e => (
                                                <button
                                                    key={e}
                                                    onClick={() => { setGroupEmoji(e); setShowEmojiPicker(false); }}
                                                    className={`w-7 h-7 text-lg rounded hover:bg-white/10 ${groupEmoji === e ? 'bg-purple-500/20' : ''}`}
                                                >
                                                    {e}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="Nom du groupe *"
                                        className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/40"
                                    />
                                    <input
                                        type="text"
                                        value={groupDescription}
                                        onChange={(e) => setGroupDescription(e.target.value)}
                                        placeholder="Description (optionnel)"
                                        className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/40"
                                    />
                                </div>
                            </div>
                            {/* Search */}
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="🔍 Rechercher un champ..."
                                className="w-full mt-3 px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm text-white placeholder:text-white/40"
                            />
                        </div>

                        {/* Fields grid - 2 columns on large screens */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                                {filteredSections.map(section => (
                                    <div key={section.id} className="border border-white/10 rounded-lg overflow-hidden">
                                        <button
                                            onClick={() => toggleSection(section.id)}
                                            className="w-full flex items-center justify-between p-2 bg-white/5 hover:bg-white/10"
                                        >
                                            <div className="flex items-center gap-2">
                                                <span>{section.icon}</span>
                                                <span className="text-sm font-medium">{section.label}</span>
                                                <span className="text-xs text-white/50">({section.items.length})</span>
                                            </div>
                                            <span className="text-white/50">{expandedSections[section.id] ? '▼' : '▶'}</span>
                                        </button>

                                        {expandedSections[section.id] && (
                                            <div className="p-2 space-y-1 max-h-[180px] overflow-y-auto">
                                                {section.items.map(field => {
                                                    const isSelected = selectedFields.includes(field.id);
                                                    return (
                                                        <div
                                                            key={field.id}
                                                            className={`flex items-center gap-2 p-2 rounded transition-colors ${isSelected ? 'bg-purple-500/10' : 'hover:bg-white/5'}`}
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
                        <div className="flex items-center justify-between gap-3 p-4 border-t border-white/10 flex-shrink-0 bg-white/5">
                            <div className="text-sm text-white/60">
                                {selectedFields.length} champ(s) sélectionné(s)
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => { setMode('list'); resetForm(); }}
                                    className="px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-colors"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleSaveGroup}
                                    disabled={!groupName.trim() || selectedFields.length === 0}
                                    className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-white/20 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
                                >
                                    {editingGroup ? 'Enregistrer les modifications' : 'Créer le groupe'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer for list mode */}
                {mode === 'list' && (
                    <div className="flex gap-3 p-4 border-t border-white/10 flex-shrink-0">
                        <button
                            onClick={onClose}
                            className="flex-1 px-4 py-2 bg-white/10 hover:bg-white/15 text-white rounded-lg font-medium transition-colors"
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
            <div className="bg-[#0a0a12] rounded-2xl shadow-2xl p-6 min-w-[360px] max-w-[95vw] border border-white/10">
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
import PipelineDataModal from '../core/PipelineDataModal';
import PipelineCellBadge from '../core/PipelineCellBadge';
import CellEmojiOverlay from './CellEmojiOverlay';
import PipelineCellTooltip from '../core/PipelineCellTooltip';
import MassAssignModal from './MassAssignModal';
import ItemContextMenu from './ItemContextMenu';

const PipelineDragDropView = ({
    type = 'culture',
    sidebarContent = [],
    timelineConfig = {},
    timelineData = [],
    onConfigChange = () => { },
    onDataChange = () => { },
    onClearTimeline = () => { },
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

    // Options d'intervalTypes selon le type de pipeline (centralisées)
    const getIntervalTypeOptions = () => {
        return getOptionsForPipeline(type).map(o => ({ label: o.label, value: o.key }));
    };

    const [expandedSections, setExpandedSections] = useState({});
    const [draggedContent, setDraggedContent] = useState(null);
    const [selectedCell, setSelectedCell] = useState(null);
    const [showResetConfirm, setShowResetConfirm] = useState(false);

    // Empêcher la sélection automatique de la première case
    useEffect(() => {
        setSelectedCells([]); // Clear selection on mount
    }, []);

    // Clear selection on timelineConfig change (reset)
    useEffect(() => {
        setSelectedCells([]);
    }, [timelineConfig]);

    // État pour détecter le mode mobile
    const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

    // Écouter les changements de taille d'écran
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 768);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentCellTimestamp, setCurrentCellTimestamp] = useState(null);
    const [tooltipData, setTooltipData] = useState({ visible: false, cellData: null, position: { x: 0, y: 0 }, section: '' });
    const [massAssignMode, setMassAssignMode] = useState(false);

    // --- Start-month picker for 'mois' mode ---
    const [showStartMonthPicker, setShowStartMonthPicker] = useState(false);
    const [proposedStartMonth, setProposedStartMonth] = useState(() => (timelineConfig && timelineConfig.startMonth) ? Number(timelineConfig.startMonth) : 1);

    useEffect(() => {
        // keep proposedStartMonth in sync when timelineConfig changes
        if (timelineConfig && timelineConfig.startMonth) setProposedStartMonth(Number(timelineConfig.startMonth));
    }, [timelineConfig]);

    // Guarded opener — only allow explicit sources to open the picker (prevents accidental auto-open)
    const openStartMonthPicker = (source = 'unknown') => {
        if (source === 'button' || source === 'editor') {
            setShowStartMonthPicker(true);
            return;
        }
        // reject/ignore other callers
        console.warn('[Pipeline] start-month picker open rejected — source:', source);
    };
    const [selectedCells, setSelectedCells] = useState([]);
    const [showMassAssignModal, setShowMassAssignModal] = useState(false);
    const [sourceCellForMassAssign, setSourceCellForMassAssign] = useState(null);
    const [droppedItem, setDroppedItem] = useState(null); // Item droppé en attente de saisie
    const [hoveredCell, setHoveredCell] = useState(null); // Cellule survolée pendant drag
    const [showPresets, setShowPresets] = useState(false);
    const [showSavePipelineModal, setShowSavePipelineModal] = useState(false);
    const [isSelecting, setIsSelecting] = useState(false);
    const [selectionStartIdx, setSelectionStartIdx] = useState(null);

    // Grouped presets state
    const [groupedPresets, setGroupedPresets] = useState(() => {
        const storageKey = `pipeline-grouped-presets-${type || 'unknown'}`;
        const saved = localStorage.getItem(storageKey);
        return saved ? JSON.parse(saved) : [];
    });

    // Recharger les préréglages quand le type change
    useEffect(() => {
        const storageKey = `pipeline-grouped-presets-${type || 'unknown'}`;
        const saved = localStorage.getItem(storageKey);
        setGroupedPresets(saved ? JSON.parse(saved) : []);

        // Nettoyer les anciennes clés si type est défini
        if (type && type !== 'unknown') {
            const oldKey = 'pipeline-grouped-presets-unknown';
            if (localStorage.getItem(oldKey) !== null) {
                console.log(`🧹 Nettoyage: suppression de ${oldKey}`);
                localStorage.removeItem(oldKey);
            }
        }
    }, [type]);

    const [showGroupedPresetModal, setShowGroupedPresetModal] = useState(false);
    const [contextMenu, setContextMenu] = useState(null); // { item, position }
    // Multi-select sidebar state (global)
    const [multiSelectedItems, setMultiSelectedItems] = useState([]);

    // Cell context menu state
    const [cellContextMenu, setCellContextMenu] = useState(null); // { position, timestamp, selectedCells }
    const [copiedCellData, setCopiedCellData] = useState(null); // Pour copier/coller

    // Appui long (touch) - refs pour les timers
    const longPressTimerRef = useRef(null);
    const longPressItemRef = useRef(null); // { type: 'cell' | 'item', id: string }
    const LONG_PRESS_DURATION = 500; // ms

    // Démarrer appui long (touch)
    const startLongPress = (type, id) => {
        longPressItemRef.current = { type, id };
        longPressTimerRef.current = setTimeout(() => {
            // Appui long déclenché - activer multi-sélection
            if (longPressItemRef.current?.type === 'cell') {
                setSelectedCells(prev =>
                    prev.includes(id) ? prev : [...prev, id]
                );
                // Vibration feedback si disponible
                if (navigator.vibrate) navigator.vibrate(50);
            } else if (longPressItemRef.current?.type === 'item') {
                setMultiSelectedItems(prev =>
                    prev.includes(id) ? prev : [...prev, id]
                );
                if (navigator.vibrate) navigator.vibrate(50);
            }
            longPressItemRef.current = null;
        }, LONG_PRESS_DURATION);
    };

    // Annuler appui long
    const cancelLongPress = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        longPressItemRef.current = null;
    };

    // Ancre de sélection pour Shift+clic (comme Windows Explorer)
    const selectionAnchorRef = useRef(null); // Index de la cellule d'ancrage

    // Action history for undo/redo (stack with pointer)
    const [actionsHistory, setActionsHistory] = useState([]);
    const [historyPointer, setHistoryPointer] = useState(-1); // -1 = vide, 0+ = index dans l'historique

    const pushAction = (action) => {
        setActionsHistory(prev => {
            const next = [...prev.slice(0, historyPointer + 1), action];
            // limit history length
            if (next.length > 100) next.shift();
            return next;
        });
        setHistoryPointer(prev => {
            const newPointer = Math.min(prev + 1, 99);
            return newPointer;
        });
    };

    const undoLastAction = () => {
        if (historyPointer < 0) return;
        const action = actionsHistory[historyPointer];
        if (action && action.changes) {
            action.changes.forEach(ch => {
                onDataChange(ch.timestamp, ch.field, ch.previousValue === undefined ? null : ch.previousValue);
            });
        }
        setHistoryPointer(prev => Math.max(prev - 1, -1));
    };

    const redoLastAction = () => {
        if (historyPointer >= actionsHistory.length - 1) return;
        const nextPointer = historyPointer + 1;
        const action = actionsHistory[nextPointer];
        if (action && action.changes) {
            action.changes.forEach(ch => {
                // Pour redo, on applique les changements en avant
                // En cherchant la valeur "actuelle" qui est la previousValue de l'action suivante
                // ou on utilise directement la valeur stockée si disponible
                let newValue = ch.newValue; // Si la valeur est stockée

                // Sinon, on cherche dans les prochaines actions
                if (newValue === undefined) {
                    for (let i = nextPointer + 1; i < actionsHistory.length; i++) {
                        const nextAction = actionsHistory[i];
                        for (const nextChange of nextAction.changes || []) {
                            if (nextChange.timestamp === ch.timestamp && nextChange.field === ch.field) {
                                newValue = nextChange.previousValue;
                                break;
                            }
                        }
                        if (newValue !== undefined) break;
                    }
                }

                // Si toujours pas trouvé, c'est qu'il n'y a pas eu de modification après
                // On reconstruit à partir des données actuelles
                if (newValue === undefined) {
                    const currentData = getCellData(ch.timestamp) || {};
                    newValue = currentData[ch.field];
                }

                onDataChange(ch.timestamp, ch.field, newValue);
            });
        }
        setHistoryPointer(prev => Math.min(prev + 1, actionsHistory.length - 1));
    };

    // Stocker les nouvelles valeurs dans chaque action pour le redo
    const pushActionWithNewValues = (action, newValuesMap) => {
        const enrichedAction = { ...action, _newValues: newValuesMap };
        pushAction(enrichedAction);
    };

    // Raccourcis clavier pour undo/redo
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Ctrl+Z ou Cmd+Z = Undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                undoLastAction();
            }
            // Ctrl+Shift+Z ou Ctrl+Y ou Cmd+Shift+Z = Redo
            else if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
                e.preventDefault();
                redoLastAction();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [historyPointer, actionsHistory]);

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

    // Gestionnaires menu contextuel cellule
    const handleCellContextMenu = (e, timestamp) => {
        e.preventDefault();
        e.stopPropagation();
        setCellContextMenu({
            position: { x: e.clientX, y: e.clientY },
            timestamp,
            selectedCells: selectedCells.length > 0 ? selectedCells : [timestamp]
        });
    };

    const handleCopyCellData = () => {
        const targets = cellContextMenu?.selectedCells || [];
        if (targets.length === 0) return;

        // Si une seule cellule, copier directement
        if (targets.length === 1) {
            const data = getCellData(targets[0]);
            setCopiedCellData({ single: data, timestamp: targets[0] });
            showToast(`Données copiées`, 'success');
        } else {
            // Multiple cellules: copier tableau
            const bulkData = targets.map(ts => ({ timestamp: ts, data: getCellData(ts) }));
            setCopiedCellData({ bulk: bulkData });
            showToast(`${targets.length} cellules copiées`, 'success');
        }
    };

    const handlePasteCellData = () => {
        if (!copiedCellData) return;
        const targets = cellContextMenu?.selectedCells || [];
        if (targets.length === 0) return;

        const allChanges = [];

        if (copiedCellData.single) {
            // Coller données simples sur toutes les cibles
            const sourceData = copiedCellData.single || {};
            const keys = Object.keys(sourceData).filter(k => !['timestamp', 'label', 'date', 'phase', '_meta'].includes(k));

            targets.forEach(ts => {
                const prev = getCellData(ts) || {};
                keys.forEach(k => {
                    allChanges.push({ timestamp: ts, field: k, previousValue: prev[k] });
                    onDataChange(ts, k, sourceData[k]);
                });
            });
        } else if (copiedCellData.bulk) {
            // Coller bulk data (si nombre match)
            const bulkData = copiedCellData.bulk;
            const copyCount = Math.min(bulkData.length, targets.length);

            for (let i = 0; i < copyCount; i++) {
                const sourceData = bulkData[i].data || {};
                const targetTs = targets[i];
                const keys = Object.keys(sourceData).filter(k => !['timestamp', 'label', 'date', 'phase', '_meta'].includes(k));

                const prev = getCellData(targetTs) || {};
                keys.forEach(k => {
                    allChanges.push({ timestamp: targetTs, field: k, previousValue: prev[k] });
                    onDataChange(targetTs, k, sourceData[k]);
                });
            }
        }

        if (allChanges.length > 0) {
            pushAction({ id: Date.now(), type: 'paste', changes: allChanges });
            showToast(`Données collées sur ${targets.length} cellule(s)`, 'success');
        }
    };

    const handleDeleteFieldsFromCells = (fieldsToDelete) => {
        const targets = cellContextMenu?.selectedCells || [];
        if (targets.length === 0 || fieldsToDelete.length === 0) return;

        console.log(`🗑️ handleDeleteFieldsFromCells: fields=${fieldsToDelete.join(',')}, targets=${targets.join(',')}`);

        setConfirmState({
            open: true,
            title: 'Effacer les champs sélectionnés',
            message: `Effacer ${fieldsToDelete.length} champ(s) de ${targets.length} cellule(s) ?`,
            onConfirm: () => {
                console.log(`  → Confirmation: début de suppression`);
                const allChanges = [];
                targets.forEach(ts => {
                    const prev = getCellData(ts) || {};
                    fieldsToDelete.forEach(field => {
                        if (prev[field] !== undefined) {
                            console.log(`    ✓ Supprime ${field} de ${ts} (valeur: ${prev[field]})`);
                            allChanges.push({ timestamp: ts, field, previousValue: prev[field] });
                            onDataChange(ts, field, null);
                        }
                    });
                });

                if (allChanges.length > 0) {
                    pushAction({ id: Date.now(), type: 'deleteFields', changes: allChanges });
                    showToast(`${fieldsToDelete.length} champ(s) effacé(s)`, 'success');
                    console.log(`  → Toast: ${fieldsToDelete.length} champ(s) effacé(s)`);
                }
                setCellContextMenu(null); // Fermer le menu contextuel
                setConfirmState(prev => ({ ...prev, open: false }));
                console.log(`✅ Suppression terminée`);
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

    // Ouvrir modal cellule - Sélection style Windows Explorer
    const handleCellClick = (e, cellId) => {
        // Trouver l'index de la cellule cliquée
        const clickedIdx = cells.findIndex(c => c.timestamp === cellId);
        if (clickedIdx === -1) return;

        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;

        console.log('🖱️ Clic sur cellule:', cellId, '(idx:', clickedIdx, ')');
        console.log('📊 Ctrl:', isCtrl, '| Shift:', isShift);
        console.log('📋 Sélection avant:', selectedCells);
        console.log('⚓ Ancre actuelle:', selectionAnchorRef.current);

        // === SHIFT + CLIC : Sélection de plage ===
        if (isShift && selectionAnchorRef.current !== null) {
            e.preventDefault();
            setSelectedCell(null);

            const anchorIdx = selectionAnchorRef.current;
            const startIdx = Math.min(anchorIdx, clickedIdx);
            const endIdx = Math.max(anchorIdx, clickedIdx);

            // Générer la plage de cellules
            const rangeIds = cells.slice(startIdx, endIdx + 1).map(c => c.timestamp);

            if (isCtrl) {
                // CTRL + SHIFT : Ajouter la plage à la sélection existante
                setSelectedCells(prev => {
                    const newSelection = [...new Set([...prev, ...rangeIds])];
                    selectedCellsRef.current = newSelection;
                    return newSelection;
                });
            } else {
                // SHIFT seul : Remplacer par la plage
                setSelectedCells(rangeIds);
                selectedCellsRef.current = rangeIds;
            }
            // Note: On ne change PAS l'ancre sur Shift+clic
            console.log('  → Plage sélectionnée:', rangeIds.length, 'cellules');
            return;
        }

        // === CTRL + CLIC : Toggle une cellule ===
        if (isCtrl) {
            setSelectedCell(null);
            setSelectedCells(prev => {
                const isAlreadySelected = prev.includes(cellId);
                let newSelection;

                if (isAlreadySelected) {
                    // Retirer de la sélection
                    newSelection = prev.filter(id => id !== cellId);
                } else {
                    // Ajouter à la sélection
                    newSelection = [...prev, cellId];
                }

                selectedCellsRef.current = newSelection;
                console.log('  → Toggle:', isAlreadySelected ? 'retiré' : 'ajouté');
                return newSelection;
            });
            // Mettre à jour l'ancre
            selectionAnchorRef.current = clickedIdx;
            return;
        }

        // Note: l'ouverture du picker "start-month" ne doit PLUS se faire automatiquement
        // en cliquant sur la première case — l'utilisateur doit cliquer sur le bouton "Définir"
        // (ou utiliser le bouton présent dans l'éditeur de la 1re case).

        // === CLIC SIMPLE : Ouvrir la modal ===
        console.log('📝 Ouverture modal pour:', cellId);

        // Si plusieurs cellules sont sélectionnées, les garder pour action groupée
        const nextSelection = selectedCells.length > 1 ? selectedCells : [cellId];
        setSelectedCells(nextSelection);
        selectedCellsRef.current = nextSelection;
        selectionAnchorRef.current = clickedIdx; // Nouvelle ancre

        setSelectedCell(cellId);
        setDroppedItem(null);
        setCurrentCellTimestamp(cellId);
        setIsModalOpen(true);
    };

    // Suppression logique préréglages


    // Sauvegarder données depuis modal
    const handleModalSave = (data) => {
        console.log('💾 Début sauvegarde - data reçue:', data);
        console.log('💾 selectedCells STATE:', selectedCells);
        console.log('💾 selectedCells REF:', selectedCellsRef.current);

        if (!data || !data.timestamp) {
            console.error('❌ Erreur: pas de timestamp dans les données');
            return;
        }

        // ✅ Déterminer quelles cellules doivent recevoir les données
        // Utiliser selectedCellsRef.current au lieu de selectedCells pour éviter problème de closure
        const currentSelection = selectedCellsRef.current || [];
        const hasSelection = currentSelection.length > 0;
        const timestampInSelection = currentSelection.includes(data.timestamp);

        console.log('💾 Debug sélection:');
        console.log('  → selectedCells STATE:', selectedCells);
        console.log('  → selectedCellsRef.current:', selectedCellsRef.current);
        console.log('  → currentSelection:', currentSelection);
        console.log('  → hasSelection:', hasSelection);
        console.log('  → data.timestamp:', data.timestamp);
        console.log('  → timestampInSelection:', timestampInSelection);

        const targetTimestamps = (hasSelection && timestampInSelection)
            ? currentSelection
            : [data.timestamp];

        console.log(`🎯 Application des données à ${targetTimestamps.length} cellule(s):`, targetTimestamps);

        const allChanges = [];

        // ✅ APPLIQUER LES DONNÉES À TOUTES LES CELLULES CIBLES
        targetTimestamps.forEach(targetTimestamp => {
            const prevData = getCellData(targetTimestamp) || {};
            const changes = [];

            // ✅ BUG FIX: Ne plus vérifier droppedItem.timestamp === data.timestamp
            // À la place, vérifier juste si droppedItem existe (mode drop) ou pas (mode edit)
            if (droppedItem) {
                // Mode DROP: sauvegarder uniquement le(s) champ(s) droppé(s)
                if (droppedItem.content.type === 'multi' && Array.isArray(droppedItem.content.items)) {
                    // Multi-items drop: sauvegarder tous les items droppés
                    console.log(`  ✓ Multi-items drop sur ${targetTimestamp}:`, droppedItem.content.items.length, 'champs');
                    droppedItem.content.items.forEach(item => {
                        const fieldKey = item.id || item.key || item.type;
                        if (data.data && data.data[fieldKey] !== undefined) {
                            changes.push({ timestamp: targetTimestamp, field: fieldKey, previousValue: prevData[fieldKey] });
                            console.log(`    → ${fieldKey} =`, data.data[fieldKey]);
                            onDataChange(targetTimestamp, fieldKey, data.data[fieldKey]);
                        }
                    });
                } else {
                    // Single item drop
                    const fieldKey = droppedItem.content.id || droppedItem.content.key || droppedItem.content.type;
                    if (data.data && data.data[fieldKey] !== undefined) {
                        changes.push({ timestamp: targetTimestamp, field: fieldKey, previousValue: prevData[fieldKey] });
                        console.log(`  ✓ Single drop sur ${targetTimestamp}: ${fieldKey} =`, data.data[fieldKey]);
                        onDataChange(targetTimestamp, fieldKey, data.data[fieldKey]);
                    }
                }
            } else {
                // Mode EDIT: sauvegarder toutes les données modifiées
                console.log(`  ✓ Édition sur ${targetTimestamp}:`, Object.keys(data.data || {}).length, 'champs');
                Object.entries(data.data || {}).forEach(([key, value]) => {
                    // Treat empty string/null/undefined as deletion
                    if (value === undefined || value === null || value === '') {
                        changes.push({ timestamp: targetTimestamp, field: key, previousValue: prevData[key] });
                        console.log(`    → Suppression: ${key}`);
                        onDataChange(targetTimestamp, key, null);
                    } else {
                        changes.push({ timestamp: targetTimestamp, field: key, previousValue: prevData[key] });
                        console.log(`    → ${key} =`, value);
                        onDataChange(targetTimestamp, key, value);
                    }
                });
            }

            allChanges.push(...changes);
        });

        if (allChanges.length > 0) {
            pushAction({ id: Date.now(), type: 'edit', changes: allChanges });
        }

        // Sauvegarder métadonnées si présentes (uniquement pour la cellule source)
        if (data.completionPercentage !== undefined) {
            onDataChange(data.timestamp, '_meta', {
                completionPercentage: data.completionPercentage,
                lastModified: data.lastModified || new Date().toISOString()
            });
        }

        console.log(`✅ Sauvegarde terminée: ${targetTimestamps.length} cellule(s) modifiée(s)`);
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

                // Déterminer les cellules cibles (celle droppée + sélectionnées)
                const targetCells = selectedCellsRef.current.length > 0
                    ? selectedCellsRef.current
                    : [timestamp];

                console.log(`✅ Application groupe sur ${targetCells.length} cellule(s)`);

                // Appliquer chaque champ du groupe à toutes les cellules cibles
                targetCells.forEach(ts => {
                    fields.forEach(f => {
                        if (f.key && f.value !== undefined && f.value !== '') {
                            console.log(`  → Applique ${f.key} = ${f.value} sur ${ts}`);
                            onDataChange(ts, f.key, f.value);
                        }
                    });
                });

                // Feedback visuel
                const message = targetCells.length > 1
                    ? `✓ Groupe "${group.name}" appliqué sur ${targetCells.length} cellules (${fields.length} champs chacune)`
                    : `✓ Groupe "${group.name}" appliqué (${fields.length} champs)`;
                toast && toast.success(message);
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
        // normalize interval type (accept aliases like 'phase' -> 'phases')
        const intervalType = resolveIntervalKey(timelineConfig.type) || timelineConfig.type;
        const { start, end, duration, totalSeconds, totalHours, totalDays, totalWeeks } = timelineConfig;

        // SECONDES (max 900s avec pagination)
        if (intervalType === 'seconde' && totalSeconds) {
            const count = Math.min(totalSeconds, 900); // Max     900s
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

        // MOIS (affichage par mois) — support startMonth (1..12)
        if ((intervalType === 'mois' || intervalType === 'months') && timelineConfig.totalMonths) {
            const count = Math.min(timelineConfig.totalMonths || 0, 120);
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            const startIdx = (Number(timelineConfig.startMonth) && timelineConfig.startMonth >= 1 && timelineConfig.startMonth <= 12) ? (Number(timelineConfig.startMonth) - 1) : 0;
            return Array.from({ length: count }, (_, i) => ({
                id: `month-${i + 1}`,
                timestamp: `month-${i + 1}`,
                label: months[(startIdx + i) % 12] || `M${i + 1}`,
                month: ((startIdx + i) % 12) + 1
            }));
        }

        // ANNÉES (affichage par année, compte en années)
        if ((intervalType === 'annee' || intervalType === 'years') && timelineConfig.totalYears) {
            const count = Math.min(timelineConfig.totalYears || 0, 100);
            return Array.from({ length: count }, (_, i) => ({
                id: `year-${i + 1}`,
                timestamp: `year-${i + 1}`,
                label: `Y${i + 1}`,
                year: i + 1
            }));
        }

        // PHASES prédéfinies selon type de pipeline
        if (intervalType === 'phases') {
            // Phases prédéfinies pour culture (CDC)
            let defaultPhases;
            switch (type) {
                case 'curing':
                    defaultPhases = (timelineConfig.phases && timelineConfig.phases.length) ? timelineConfig.phases : (CURING_PHASES?.phases || []);
                    break;
                case 'separation':
                    defaultPhases = (timelineConfig.phases && timelineConfig.phases.length) ? timelineConfig.phases : (SEPARATION_PHASES?.phases || []);
                    break;
                case 'extraction':
                    defaultPhases = (timelineConfig.phases && timelineConfig.phases.length) ? timelineConfig.phases : (EXTRACTION_PHASES?.phases || []);
                    break;
                case 'recipe':
                    defaultPhases = (timelineConfig.phases && timelineConfig.phases.length) ? timelineConfig.phases : (RECIPE_PHASES?.phases || []);
                    break;
                default:
                    // culture
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
                    defaultPhases = (timelineConfig.phases && timelineConfig.phases.length) ? timelineConfig.phases : culturePhases;
            }

            return defaultPhases.map((phase, i) => {
                const phaseId = phase.id || `phase-${i}`;
                return {
                    id: phaseId,
                    timestamp: phaseId,
                    label: phase.name || `Phase ${i + 1}`,
                    phase: phase,
                    phaseId: phaseId,
                    duration: phase.duration || 7,
                    emoji: phase.emoji || '🌿'
                };
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
        <div data-testid="pipeline-panel" className="bg-[#0a0a12]/90 backdrop-blur-xl rounded-2xl shadow-xl border border-white/10 p-4 h-[72vh] overflow-hidden flex flex-col overscroll-contain min-h-0">
            {/* LAYOUT FLEX-ROW : Sidebar gauche + Timeline droite */}
            <div className="flex-1 overflow-hidden flex flex-row gap-4 min-h-0">
                {/* PANNEAU LATÉRAL GAUCHE - MASQUÉ SUR MOBILE */}
                {!isMobile && (
                    <div className="w-80 flex-shrink-0 h-full flex flex-col bg-white/5 rounded-xl border border-white/10 overflow-hidden overflow-x-hidden min-h-0" data-testid="pipeline-sidebar" tabIndex={0}>
                        {/* Header Contenus */}
                        <div className="sticky top-0 bg-[#0a0a12]/95 backdrop-blur-sm p-4 border-b border-white/10 z-10 flex-shrink-0">
                            <h3 className="font-bold text-white text-lg">📦 Contenus</h3>
                            <p className="text-xs text-white/60 mt-1">
                                {multiSelectedItems.length > 0
                                    ? `${multiSelectedItems.length} item${multiSelectedItems.length > 1 ? 's' : ''} sélectionné${multiSelectedItems.length > 1 ? 's' : ''} (Ctrl+clic ou appui long)`
                                    : 'Glissez les éléments vers les cases →'
                                }
                            </p>
                            {/* Barre d'actions multi-sélection */}
                            {(multiSelectedItems.length > 0 || selectedCells.length > 1) && (
                                <div className="mt-2 flex items-center gap-2 flex-wrap">
                                    {multiSelectedItems.length > 0 && (
                                        <button
                                            onClick={() => setMultiSelectedItems([])}
                                            className="px-2 py-1 text-xs bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors"
                                        >
                                            ✕ Désélectionner items ({multiSelectedItems.length})
                                        </button>
                                    )}
                                    {selectedCells.length > 1 && (
                                        <button
                                            onClick={() => setSelectedCells([])}
                                            className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                                        >
                                            ✕ Désélectionner cases ({selectedCells.length})
                                        </button>
                                    )}
                                    {multiSelectedItems.length > 0 && selectedCells.length > 0 && (
                                        <button
                                            onClick={() => {
                                                // Assigner tous les items sélectionnés à toutes les cases sélectionnées
                                                const itemsToAssign = multiSelectedItems
                                                    .map(k => {
                                                        for (const sec of sidebarContent) {
                                                            const found = sec.items?.find(i => (i.key || i.id) === k);
                                                            if (found) return found;
                                                        }
                                                        return null;
                                                    })
                                                    .filter(Boolean);

                                                // Pour chaque cellule, ouvrir la modal ou assigner directement avec valeur par défaut
                                                selectedCells.forEach(ts => {
                                                    itemsToAssign.forEach(item => {
                                                        const defaultVal = item.defaultValue !== undefined
                                                            ? item.defaultValue
                                                            : (item.type === 'number' ? 0 : '');
                                                        onDataChange(ts, item.id || item.key, defaultVal);
                                                    });
                                                });

                                                showToast(`${itemsToAssign.length} champ(s) assigné(s) à ${selectedCells.length} case(s)`);
                                                setMultiSelectedItems([]);
                                                setSelectedCells([]);
                                            }}
                                            className="px-3 py-1 text-xs bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-all shadow-sm font-medium"
                                        >
                                            ✓ Assigner {multiSelectedItems.length} item(s) → {selectedCells.length} case(s)
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="p-3 space-y-2 overflow-y-auto flex-1">
                            {/* Pré-configuration section (was MODE PIPELINE) */}
                            <div className="mb-3">
                                <div className="font-semibold text-xs text-white/50 mb-1">Pré-configuration</div>
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
                                                className="px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30 text-xs font-bold cursor-grab hover:bg-purple-500/20 transition-all"
                                                title={`${group.description || ''}\n${(group.fields || []).map(f => `${f.key}: ${f.value}`).join('\n')}`}
                                            >
                                                <span className="mr-1">{group.emoji || '🌱'}</span>{group.name}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            {(sidebarContent || []).map((section) => (
                                <div key={section.id} className="rounded-lg overflow-hidden border border-white/10">
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{section.icon}</span>
                                            <span className="font-semibold text-sm text-white">
                                                {section.label === 'MODE PIPELINE' ? 'Pré-configuration' : section.label}
                                            </span>
                                        </div>
                                        {expandedSections[section.id] ? (
                                            <ChevronDown className="w-4 h-4 text-white/60" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-white/60" />
                                        )}
                                    </button>

                                    {expandedSections[section.id] && (
                                        <div className="p-2 bg-[#0a0a12] space-y-1">
                                            {section.items?.map((item) => {
                                                const itemKey = item.key || item.id;
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
                                                        onTouchStart={() => startLongPress('item', itemKey)}
                                                        onTouchEnd={cancelLongPress}
                                                        onTouchMove={cancelLongPress}
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
                                                        className={`relative flex items-center gap-2 p-2 rounded-lg cursor-grab active:cursor-grabbing border-2 transition-all group ${isSelected
                                                            ? 'bg-blue-500/20 border-blue-500 ring-2 ring-blue-500/50'
                                                            : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'
                                                            }`}
                                                        style={{ touchAction: 'none' }}
                                                    >
                                                        {/* Indicateur de sélection */}
                                                        {isSelected && (
                                                            <span className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg z-10">
                                                                ✓
                                                            </span>
                                                        )}
                                                        <span className="text-base">{item.icon}</span>
                                                        <span className={`text-xs font-medium flex-1 ${isSelected ? 'text-blue-300' : 'text-white/70'}`}>
                                                            {item.label}
                                                        </span>
                                                        <span className="text-xs transition-colors text-white/40 group-hover:text-white/60">
                                                            ⋮⋮
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
                )}

                {/* TIMELINE PRINCIPALE DROITE */}
                <div className="flex-1 min-w-0 bg-white/5 rounded-xl border border-white/10 overflow-hidden flex flex-col">
                    {/* HEADER CONFIGURATION */}
                    <div className="p-3 md:p-4 border-b border-white/10 bg-transparent flex-shrink-0 max-h-[280px] overflow-y-auto">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-3 md:mb-3">
                            <h3 className="font-bold text-white text-base md:text-lg flex items-center gap-2 truncate">
                                <span className="flex-shrink-0">📊</span>
                                <span className="truncate">Pipeline {({ culture: 'Culture', curing: 'Curing', separation: 'Séparation', extraction: 'Extraction', recipe: 'Recette' }[type] || 'Pipeline')}</span>
                            </h3>
                            <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
                                {/* Undo button */}
                                <button
                                    onClick={() => undoLastAction()}
                                    disabled={historyPointer < 0}
                                    className={`group flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-medium text-xs md:text-sm transition-all duration-200 ${historyPointer < 0
                                        ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                                        : 'bg-white/5 hover:bg-blue-500/20 border border-white/20 hover:border-blue-500/50 text-white/70 hover:text-blue-300 shadow-sm hover:shadow'
                                        }`}
                                    title="Annuler la dernière action (Ctrl+Z)"
                                >
                                    <svg className="w-3 h-3 md:w-4 md:h-4 transform group-hover:-rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                                    </svg>
                                    <span className="hidden md:inline">Annuler</span>
                                </button>

                                {/* Redo button */}
                                <button
                                    onClick={() => redoLastAction()}
                                    disabled={historyPointer >= actionsHistory.length - 1}
                                    className={`group flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg md:rounded-xl font-medium text-xs md:text-sm transition-all duration-200 ${historyPointer >= actionsHistory.length - 1
                                        ? 'bg-white/5 text-white/40 cursor-not-allowed border border-white/10'
                                        : 'bg-white/5 hover:bg-green-500/20 border border-white/20 hover:border-green-500/50 text-white/70 hover:text-green-300 shadow-sm hover:shadow'
                                        }`}
                                    title="Refaire la dernière action (Ctrl+Shift+Z / Ctrl+Y)"
                                >
                                    <svg className="w-3 h-3 md:w-4 md:h-4 transform group-hover:rotate-45 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10a8 8 0 01-8 8v2m0-2a8 8 0 100-16v2m0 0h10a8 8 0 018 8v2M21 10l-6-6m6 6l-6 6" />
                                    </svg>
                                    <span className="hidden md:inline">Refaire</span>
                                </button>
                            </div>
                        </div>

                        {/* Configuration inline - Dynamique selon type d'intervalle */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-3 md:mt-3">
                            <div>
                                <label className="text-xs font-medium text-white/70 mb-1 block truncate">
                                    Type intervalle
                                </label>
                                <select
                                    value={resolveIntervalKey(timelineConfig.type) || timelineConfig.type || 'jour'}
                                    onChange={(e) => onConfigChange('type', e.target.value)}
                                    disabled={timelineData.length > 0}
                                    className={`w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer ${timelineData.length > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={timelineData.length > 0 ? '⚠️ Impossible de changer la trame : des données sont déjà renseignées' : 'Choisir le type d\'intervalles'}
                                >
                                    {getIntervalTypeOptions().map(option => (
                                        <option key={option.value} value={option.value} className="bg-[#0f0f1a]">{option.label}</option>
                                    ))}
                                </select>
                                {timelineData.length > 0 && (
                                    <div className="mt-2 flex items-center gap-2">
                                        <p className="text-xs text-orange-400 flex items-center gap-1 line-clamp-2">
                                            <span className="flex-shrink-0">⚠️</span>
                                            <span className="truncate">Trame verrouillée ({timelineData.length} cell{timelineData.length > 1 ? 's' : ''})</span>
                                        </p>

                                        <button
                                            onClick={() => setShowResetConfirm(true)}
                                            className="ml-2 px-2 py-1 text-xs rounded-lg bg-transparent border border-orange-400 text-orange-300 hover:bg-orange-400/10"
                                            title="Réinitialiser la trame et supprimer les données"
                                        >
                                            Réinitialiser la trame
                                        </button>
                                    </div>
                                )}

                                {/* Confirm reset modal */}
                                {showResetConfirm && (
                                    <ConfirmModal
                                        title="Réinitialiser la trame?"
                                        message={`Voulez-vous vraiment supprimer les ${timelineData.length} point(s) de données et réinitialiser la trame ? Cette action est irréversible.`}
                                        onClose={() => setShowResetConfirm(false)}
                                        onConfirm={() => {
                                            setShowResetConfirm(false);
                                            if (typeof onClearTimeline === 'function') {
                                                onClearTimeline();
                                            } else {
                                                // Fallback: emit an onConfigChange sentinel and notify
                                                onConfigChange('resetTimeline', true);
                                                showToast('Trame réinitialisée (fallback)');
                                            }
                                        }}
                                        confirmLabel="Réinitialiser"
                                        cancelLabel="Annuler"
                                    />
                                )}
                            </div>

                            {/* SECONDES - Max 900s */}
                            {timelineConfig.type === 'seconde' && (
                                <div className="col-span-2 md:col-span-3">
                                    <label className="text-xs font-medium text-white/70 mb-1 block truncate">
                                        Secondes (max 900)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="900"
                                        value={timelineConfig.totalSeconds || ''}
                                        onChange={(e) => onConfigChange('totalSeconds', parseInt(e.target.value))}
                                        className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white/5 border border-white/20 rounded-lg text-xs md:text-sm text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="300"
                                    />
                                </div>
                            )}

                            {/* HEURES - Max 336h */}
                            {timelineConfig.type === 'heure' && (
                                <div className="col-span-2 md:col-span-3">
                                    <label className="text-xs font-medium text-white/70 mb-1 block truncate">
                                        Heures (max 336)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="336"
                                        value={timelineConfig.totalHours || ''}
                                        onChange={(e) => onConfigChange('totalHours', parseInt(e.target.value))}
                                        className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white/5 border border-white/20 rounded-lg text-xs md:text-sm text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="72"
                                    />
                                </div>
                            )}

                            {/* JOURS - Max 365 jours */}
                            {timelineConfig.type === 'jour' && (
                                <div className="col-span-2 md:col-span-3">
                                    <label className="text-xs font-medium text-white/70 mb-1 block truncate">
                                        Jours (max 365)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="365"
                                        value={timelineConfig.totalDays || ''}
                                        onChange={(e) => onConfigChange('totalDays', parseInt(e.target.value))}
                                        className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white/5 border border-white/20 rounded-lg text-xs md:text-sm text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="90"
                                    />
                                </div>
                            )}

                            {/* DATES - Date début + Date fin avec calcul automatique */}
                            {timelineConfig.type === 'date' && (
                                <>
                                    <div className="col-span-1">
                                        <label className="text-xs font-medium text-white/70 mb-1 block truncate">
                                            Début *
                                        </label>
                                        <input
                                            type="date"
                                            value={timelineConfig.start || ''}
                                            onChange={(e) => onConfigChange('start', e.target.value)}
                                            className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white/5 border border-white/20 rounded-lg text-xs md:text-sm text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="text-xs font-medium text-white/70 mb-1 block truncate">
                                            Fin *
                                        </label>
                                        <input
                                            type="date"
                                            value={timelineConfig.end || ''}
                                            onChange={(e) => onConfigChange('end', e.target.value)}
                                            className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white/5 border border-white/20 rounded-lg text-xs md:text-sm text-white focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    {timelineConfig.start && timelineConfig.end && (
                                        <div className="col-span-1">
                                            <label className="text-xs font-medium text-white/70 mb-1 block truncate">
                                                Durée
                                            </label>
                                            <div className="w-full px-2 md:px-3 py-1.5 md:py-2 bg-white/10 border border-white/20 rounded-lg text-xs md:text-sm font-medium text-white truncate">
                                                {Math.ceil((new Date(timelineConfig.end) - new Date(timelineConfig.start)) / (1000 * 60 * 60 * 24)) + 1}j
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* SEMAINES - Nombre de semaines */}
                            {timelineConfig.type === 'semaine' && (
                                <div className="col-span-2 md:col-span-3">
                                    <label className="text-xs font-medium text-white/70 mb-1 block truncate">
                                        Semaines (max 52)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="52"
                                        value={timelineConfig.totalWeeks || ''}
                                        onChange={(e) => onConfigChange('totalWeeks', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-xs md:text-sm text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="12"
                                    />
                                </div>
                            )}

                            {/* MOIS - Max 12 mois */}
                            {(timelineConfig.type === 'mois' || timelineConfig.type === 'months') && (
                                <div className="col-span-2 md:col-span-3">
                                    <label className="text-xs font-medium text-white/70 mb-1 block truncate">
                                        Mois (max 120)
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <input
                                            type="number"
                                            min="1"
                                            max="120"
                                            value={timelineConfig.totalMonths || ''}
                                            onChange={(e) => onConfigChange('totalMonths', parseInt(e.target.value))}
                                            onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }}
                                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-xs md:text-sm text-white focus:ring-2 focus:ring-blue-500"
                                            placeholder="6"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => openStartMonthPicker('button')}
                                            disabled={!timelineConfig.totalMonths}
                                            className={`px-3 py-2 rounded-md border border-white/20 text-sm bg-white/3 ${!timelineConfig.totalMonths ? 'opacity-40 cursor-not-allowed' : 'hover:bg-blue-600/20'}`}
                                            title={timelineConfig.totalMonths ? 'Définir le premier mois de la trame' : 'Définir un nombre de mois d\'abord'}
                                        >
                                            Définir
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ANNÉES - Max 100 ans (affiché en années) */}
                            {(timelineConfig.type === 'annee' || timelineConfig.type === 'years') && (
                                <div className="col-span-2 md:col-span-3">
                                    <label className="text-xs font-medium text-white/70 mb-1 block truncate">
                                        Années (max 100)
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="100"
                                        value={timelineConfig.totalYears || ''}
                                        onChange={(e) => onConfigChange('totalYears', parseInt(e.target.value))}
                                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-xs md:text-sm text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="1"
                                    />
                                </div>
                            )}

                            {/* PHASES - Prédéfinies selon type de pipeline */}
                            {(resolveIntervalKey(timelineConfig.type) === 'phases') && (
                                <div className="col-span-2 md:col-span-3">
                                    <label className="text-xs font-medium text-white/70 mb-1 block">
                                        Phases prédéfinies
                                    </label>
                                    <div className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm font-medium text-white">
                                        {type === 'culture' ? '12 phases (Graine → Récolte)' : '4 phases (Séchage → Affinage)'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Progress bar - Full width spanning entire config area */}
                        <div className="mt-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-white/70">Progression</div>
                                <div className="flex items-center gap-3">
                                    <div className="text-xs text-white/50" title={`${filledCells}/${cells.length} cases`}>{filledCells}/{cells.length}</div>
                                    <div className="text-sm font-bold text-purple-400">{Math.round(completionPercent)}%</div>
                                </div>
                            </div>
                            <div className="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10 shadow-inner">
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

                    {/* Warning Messages - Outside config */}
                    {(timelineConfig.type === 'date' && (!timelineConfig.start || !timelineConfig.end)) ||
                        (timelineConfig.type === 'seconde' && (!timelineConfig.totalSeconds || timelineConfig.totalSeconds > 900)) ||
                        (timelineConfig.type === 'heure' && (!timelineConfig.totalHours || timelineConfig.totalHours > 336)) ||
                        (timelineConfig.type === 'jour' && (!timelineConfig.totalDays || timelineConfig.totalDays > 365)) ||
                        ((timelineConfig.type === 'mois' || timelineConfig.type === 'months') && (!timelineConfig.totalMonths || timelineConfig.totalMonths > 120)) ||
                        ((timelineConfig.type === 'annee' || timelineConfig.type === 'years') && (!timelineConfig.totalYears || timelineConfig.totalYears > 100)) ? (
                        <div className="px-3 md:px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/30 flex-shrink-0">
                            {timelineConfig.type === 'date' && (!timelineConfig.start || !timelineConfig.end) && (
                                <p className="text-xs text-yellow-300 flex items-center gap-1">
                                    <span>⚠️</span> Dates début ET fin obligatoires
                                </p>
                            )}
                            {timelineConfig.type === 'seconde' && (!timelineConfig.totalSeconds || timelineConfig.totalSeconds > 900) && (
                                <p className="text-xs text-yellow-300 flex items-center gap-1">
                                    <span>⚠️</span> Max 900s
                                </p>
                            )}
                            {timelineConfig.type === 'heure' && (!timelineConfig.totalHours || timelineConfig.totalHours > 336) && (
                                <p className="text-xs text-yellow-300 flex items-center gap-1">
                                    <span>⚠️</span> Max 336h (14j)
                                </p>
                            )}
                            {timelineConfig.type === 'jour' && (!timelineConfig.totalDays || timelineConfig.totalDays > 365) && (
                                <p className="text-xs text-yellow-300 flex items-center gap-1">
                                    <span>⚠️</span> Max 365j
                                </p>
                            )}
                            {(timelineConfig.type === 'mois' || timelineConfig.type === 'months') && (!timelineConfig.totalMonths || timelineConfig.totalMonths > 120) && (
                                <p className="text-xs text-yellow-300 flex items-center gap-1">
                                    <span>⚠️</span> Mois requis (max 120)
                                </p>
                            )}
                            {(timelineConfig.type === 'annee' || timelineConfig.type === 'years') && (!timelineConfig.totalYears || timelineConfig.totalYears > 100) && (
                                <p className="text-xs text-yellow-300 flex items-center gap-1">
                                    <span>⚠️</span> Années requis (max 100)
                                </p>
                            )}
                        </div>
                    ) : null}

                    {/* TIMELINE GRID - Directement sous la configuration dans le même container */}
                    {cells.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-4 md:p-8">
                            <div className="text-center text-white/50">
                                <Settings className="w-8 md:w-12 h-8 md:h-12 mx-auto mb-2 opacity-50" />
                                <p className="text-xs md:text-sm">⚠️ Configurez la période pour voir la timeline</p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <p className="text-xs md:text-sm text-white/50 italic px-3 md:px-4 pt-3 md:pt-4 pb-2 md:pb-3 flex-shrink-0 line-clamp-2">
                                💡 <span className="hidden sm:inline"><strong>Première case</strong> : Config générale </span><span className="sm:hidden"><strong>1ère case</strong>: Config </span>|
                                <span className="hidden sm:inline"> 📊 <strong>Autres cases</strong> : Drag & drop paramètres</span><span className="sm:hidden"> 📊 Drag & drop</span>
                            </p>

                            <div className="flex-1 overflow-hidden">
                                <div ref={gridRef} className="grid gap-1 sm:gap-2 select-none relative auto-rows-min inline-grid px-3 md:px-4 pb-3 md:pb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', position: 'relative', minWidth: '100%' }}>
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
                                        let cellClass = `relative p-1.5 sm:p-2 md:p-3 rounded-lg border-2 transition-all cursor-pointer min-h-[60px] sm:min-h-[70px] md:min-h-[80px]`;

                                        // Gradient d'intensité GitHub-style selon nombre de données
                                        if (hasData) {
                                            const dataCount = Object.keys(cellData).filter(k =>
                                                !['timestamp', 'date', 'label', 'phase', 'day', 'week', 'hours', 'seconds', 'note', '_meta'].includes(k)
                                            ).length;
                                            const intensity = Math.min(dataCount / 10, 1);
                                            const intensityIndex = Math.floor(intensity * 4); // 0-4

                                            // Palette verte progressive (GitHub-style)
                                            const gradients = [
                                                'border-green-500/40 bg-green-500/10',
                                                'border-green-500/50 bg-green-500/20',
                                                'border-green-500/60 bg-green-500/30',
                                                'border-green-500/70 bg-green-500/40',
                                                'border-green-500/80 bg-green-500/50'
                                            ];
                                            cellClass += ' ' + gradients[intensityIndex];
                                        } else {
                                            cellClass += ' border-white/20 bg-white/5';
                                        }

                                        // Selected par clic simple (modal)
                                        cellClass += selectedCell === cell.timestamp
                                            ? ' ring-2 ring-violet-500 shadow-lg'
                                            : ' hover:border-violet-400 hover:shadow-md';

                                        // Selected en mode masse (multi-sélection)
                                        cellClass += isSelected
                                            ? ' ring-4 ring-blue-500 bg-blue-500/10'
                                            : '';

                                        // Hover pendant drag
                                        cellClass += isHovered && draggedContent
                                            ? ' ring-4 ring-violet-500 scale-105 shadow-2xl animate-pulse'
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
                                                onContextMenu={(e) => handleCellContextMenu(e, cell.timestamp)}
                                                onTouchStart={() => startLongPress('cell', cell.timestamp)}
                                                onTouchEnd={cancelLongPress}
                                                onTouchMove={cancelLongPress}
                                                onMouseEnter={(e) => { handleCellHover(e, cell.timestamp); }}
                                                onMouseLeave={handleCellLeave}
                                                onMouseDown={(e) => { if (e.button === 0) startSelection(e, idx, cell.timestamp); }}
                                                onMouseUp={(e) => { /* handled globally to compute rectangle on mouseup */ }}
                                                ref={(el) => { cellRefs.current[cell.timestamp] = el; }}
                                                className={cellClass}
                                                style={{ userSelect: 'none' }}
                                            >
                                                {/* Indicateur de sélection multiple */}
                                                {isSelected && selectedCells.length > 1 && (
                                                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg z-20 border-2 border-[#0a0a12]">
                                                        {selectedCells.indexOf(cell.timestamp) + 1}
                                                    </span>
                                                )}
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
                                                    <div className="text-[10px] sm:text-xs md:text-xs font-bold text-white mb-0.5 sm:mb-1 truncate">
                                                        {massAssignMode && isSelected && '✓ '}
                                                        {isFirst ? '⚙️ ' : ''}<span className="truncate inline-block max-w-full">{cell.label}</span>
                                                    </div>
                                                    <div className="text-[8px] sm:text-[9px] md:text-[10px] text-white/50 truncate">
                                                        {cell.date || cell.week || (cell.phase ? `(${cell.duration || 7}j)` : '')}
                                                    </div>
                                                    {isFirst && (
                                                        <div className="mt-0.5 sm:mt-1 text-[8px] sm:text-[9px] md:text-[10px] text-white/70 font-semibold truncate">
                                                            Config
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Bouton + pour ajouter des cellules */}
                                    {cells.length > 0 && (timelineConfig.type === 'seconde' || timelineConfig.type === 'heure' || timelineConfig.type === 'jour' || timelineConfig.type === 'semaine' || timelineConfig.type === 'date') && (
                                        <div
                                            className="p-1.5 sm:p-2 md:p-3 rounded-lg border-2 border-dashed border-white/20 bg-white/5 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center min-h-[60px] sm:min-h-[70px] md:min-h-[80px]"
                                            onClick={() => {
                                                // Ajouter une cellule selon le type
                                                if (timelineConfig.type === 'seconde' && timelineConfig.totalSeconds) {
                                                    const current = timelineConfig.totalSeconds || cells.length;
                                                    if (current < 900) {
                                                        onConfigChange('totalSeconds', current + 1);
                                                    }
                                                } else if (timelineConfig.type === 'heure' && timelineConfig.totalHours) {
                                                    const current = timelineConfig.totalHours || cells.length;
                                                    if (current < 336) {
                                                        onConfigChange('totalHours', current + 1);
                                                    }
                                                } else if (timelineConfig.type === 'jour') {
                                                    const currentDays = timelineConfig.totalDays || cells.length;
                                                    if (currentDays < 365) {
                                                        onConfigChange('totalDays', currentDays + 1);
                                                    }
                                                } else if (timelineConfig.type === 'semaine') {
                                                    const currentWeeks = timelineConfig.totalWeeks || cells.length;
                                                    if (currentWeeks < 52) {
                                                        onConfigChange('totalWeeks', currentWeeks + 1);
                                                    }
                                                } else if (timelineConfig.type === 'mois' || timelineConfig.type === 'months') {
                                                    const currentMonths = timelineConfig.totalMonths || cells.length;
                                                    if (currentMonths < 120) {
                                                        onConfigChange('totalMonths', currentMonths + 1);
                                                    }
                                                } else if (timelineConfig.type === 'annee' || timelineConfig.type === 'years') {
                                                    const currentYears = timelineConfig.totalYears || Math.ceil(cells.length / 12) || 1;
                                                    if (currentYears < 100) {
                                                        onConfigChange('totalYears', currentYears + 1);
                                                    }
                                                } else if (timelineConfig.type === 'date' && timelineConfig.end) {
                                                    // Ajouter 1 jour à la date de fin
                                                    const endDate = new Date(timelineConfig.end);
                                                    if (isNaN(endDate)) return;
                                                    endDate.setDate(endDate.getDate() + 1);
                                                    onConfigChange('end', endDate.toISOString().split('T')[0]);
                                                }
                                            }}
                                            title="Ajouter une cellule"
                                        >
                                            <Plus className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-white/50" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div> {/* Fin Timeline droite */}
            </div> {/* Fin flex-row layout */}

            {/* MODALS ET TOOLTIPS (dans liquid wrapper mais hors flex-row) */}
            {/* Modal grouped preset */}
            <GroupedPresetModal
                isOpen={showGroupedPresetModal}
                onClose={() => setShowGroupedPresetModal(false)}
                groups={groupedPresets}
                setGroups={setGroupedPresets}
                sidebarContent={sidebarContent}
                type={type}
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
                selectedCells={selectedCells}
                // enable "Définir le mois" button inside the cell editor when editing first month cell in months mode
                showSetStartMonthButton={resolveIntervalKey(timelineConfig.type) === 'mois' && cells.findIndex(c => c.timestamp === currentCellTimestamp) === 0}
                onOpenStartMonth={() => openStartMonthPicker('editor')} />

            {/* Modal configuration préréglage complet retirée (CDC) */}

            {/* Tooltip au survol */}
            <PipelineCellTooltip
                cellData={tooltipData.cellData}
                sectionLabel={tooltipData.section}
                visible={tooltipData.visible}
                position={tooltipData.position}
            />

            {/* --- Month picker modal (startMonth) - converted to LiquidModal for glass + liquid effect --- */}
            <LiquidModal isOpen={showStartMonthPicker} onClose={() => setShowStartMonthPicker(false)} size="md">
                <LiquidModal.Header>
                    <LiquidModal.Title>Choisir le 1er mois</LiquidModal.Title>
                </LiquidModal.Header>

                <LiquidModal.Body className="pt-2">
                    <p className="text-sm text-gray-300 mb-4">Sélectionnez le premier mois qui sera affiché dans la trame.</p>

                    <div className="grid grid-cols-4 gap-2">
                        {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'].map((m, i) => (
                            <button
                                key={m}
                                onClick={() => setProposedStartMonth(i + 1)}
                                className={`liquid-glass px-3 py-2 rounded-xl text-sm font-medium w-full text-center ${proposedStartMonth === i + 1 ? 'bg-purple-600 text-white shadow-glass-lg' : 'bg-white/5 text-gray-200 hover:bg-white/10'}`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>

                    <div className="mt-4 text-xs text-gray-400">Astuce: vous pouvez aussi ouvrir ce modal depuis l'éditeur de la première cellule.</div>
                </LiquidModal.Body>

                <LiquidModal.Footer>
                    <div className="flex gap-3 justify-end w-full">
                        <button className="liquid-glass px-4 py-2 rounded-lg text-sm text-gray-200" onClick={() => setShowStartMonthPicker(false)}>Annuler</button>
                        <button
                            className="liquid-glass px-4 py-2 rounded-lg text-sm bg-purple-600 text-white hover:brightness-105"
                            onClick={() => {
                                onConfigChange('startMonth', proposedStartMonth);
                                setShowStartMonthPicker(false);
                                showToast && showToast(`Premier mois défini : ${['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'][proposedStartMonth - 1]}`);
                            }}
                        >
                            Définir le mois
                        </button>
                    </div>
                </LiquidModal.Footer>
            </LiquidModal>

            {/* Menu contextuel stylé pour config individuelle et assignation rapide - Utilise ItemContextMenu */}
            {contextMenu && (
                <ItemContextMenu
                    item={contextMenu.item}
                    position={contextMenu.position}
                    anchorRect={contextMenu.anchorRect}
                    onClose={() => setContextMenu(null)}
                    isConfigured={false}
                    cells={cells}
                    onAssignNow={(key, val) => {
                        // Assignation à toutes les cases sélectionnées ou à toutes si aucune sélection
                        const targets = selectedCells.length > 0 ? selectedCells : cells.map(c => c.timestamp);
                        const changes = [];
                        targets.forEach(ts => {
                            const prev = getCellData(ts) || {};
                            const prevValue = prev[key];
                            changes.push({ timestamp: ts, field: key, previousValue: prevValue });
                            onDataChange(ts, key, val);
                        });
                        if (changes.length > 0) pushAction({ id: Date.now(), type: 'contextMenu-assign-now', changes });
                        showToast(`${contextMenu.item.label} assigné à ${targets.length} case(s)`, 'success');
                    }}
                    onAssignRange={(key, startTs, endTs, val) => {
                        // Assigner à une plage de cases
                        const startIdx = cells.findIndex(c => c.timestamp === startTs);
                        const endIdx = cells.findIndex(c => c.timestamp === endTs);
                        if (startIdx === -1 || endIdx === -1) return;
                        const minIdx = Math.min(startIdx, endIdx);
                        const maxIdx = Math.max(startIdx, endIdx);
                        const targets = cells.slice(minIdx, maxIdx + 1).map(c => c.timestamp);
                        const changes = [];
                        targets.forEach(ts => {
                            const prev = getCellData(ts) || {};
                            changes.push({ timestamp: ts, field: key, previousValue: prev[key] });
                            onDataChange(ts, key, val);
                        });
                        if (changes.length > 0) pushAction({ id: Date.now(), type: 'contextMenu-assign-range', changes });
                        showToast(`${contextMenu.item.label} assigné à ${targets.length} case(s)`, 'success');
                    }}
                    onAssignAll={(key, val) => {
                        // Assigner à toutes les cases
                        const changes = [];
                        cells.forEach(cell => {
                            const prev = getCellData(cell.timestamp) || {};
                            changes.push({ timestamp: cell.timestamp, field: key, previousValue: prev[key] });
                            onDataChange(cell.timestamp, key, val);
                        });
                        if (changes.length > 0) pushAction({ id: Date.now(), type: 'contextMenu-assign-all', changes });
                        showToast(`${contextMenu.item.label} assigné à toutes les cases`, 'success');
                    }}
                />
            )}

            {/* Menu contextuel cellule */}
            {cellContextMenu && (
                <CellContextMenu
                    isOpen={cellContextMenu !== null}
                    position={cellContextMenu?.position || { x: 0, y: 0 }}
                    cellTimestamp={cellContextMenu?.timestamp}
                    selectedCells={cellContextMenu?.selectedCells || []}
                    cellData={cellContextMenu?.timestamp ? getCellData(cellContextMenu.timestamp) : null}
                    sidebarContent={sidebarContent}
                    onClose={() => setCellContextMenu(null)}
                    onDeleteAll={() => {
                        const targets = cellContextMenu?.selectedCells || [];
                        console.log(`💥 handleDeleteAll: targets=${targets.join(',')}`);
                        setConfirmState({
                            open: true,
                            title: 'Effacer toutes les données',
                            message: `Effacer toutes les données de ${targets.length} cellule(s) ?`,
                            onConfirm: () => {
                                console.log(`  ✓ Confirmation: début de suppression complète`);
                                const allChanges = [];
                                targets.forEach(ts => {
                                    const prev = getCellData(ts) || {};
                                    const keys = Object.keys(prev).filter(k => !['timestamp', 'label', 'date', 'phase', '_meta'].includes(k));
                                    console.log(`    ✔️ Supprime ${keys.length} champs de ${ts}: ${keys.join(',')}`);
                                    keys.forEach(k => {
                                        allChanges.push({ timestamp: ts, field: k, previousValue: prev[k] });
                                        onDataChange(ts, k, null);
                                    });
                                });
                                if (allChanges.length > 0) {
                                    pushAction({ id: Date.now(), type: 'contextMenuDeleteAll', changes: allChanges });
                                    console.log(`  ✓ Toast: ${allChanges.length} donnée(s) effacée(s)`);
                                }
                                setConfirmState(prev => ({ ...prev, open: false }));
                                setCellContextMenu(null);
                                showToast('Données effacées', 'success');
                                console.log(`✅ Suppression complète terminée`);
                            }
                        });
                    }}
                    onDeleteFields={handleDeleteFieldsFromCells}
                    onCopy={handleCopyCellData}
                    onPaste={handlePasteCellData}
                    hasCopiedData={copiedCellData !== null}
                />
            )}

            {/* Fin du wrapper liquid */}
        </div>
    );
};

export { GroupedPresetModal };
export default PipelineDragDropView;



