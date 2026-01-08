import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, BookmarkPlus, Bookmark, CheckSquare, Square } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';
import usePresets from '../../hooks/usePresets';

// Emojis disponibles pour les groupes préréglages
const GROUP_EMOJIS = ['🌱', '🌿', '💧', '☀️', '🌡️', '📊', '⚗️', '🧪', '🔬', '💨', '🏠', '🌞', '🌙', '💡', '🔌', '📅', '⏱️', '📏', '🎯', '✨', '🚀', '💪', '🎨', '🔥', '❄️', '💎', '🌈', '🍃', '🌸', '🍀'];

/**
 * Modal sophistiquée pour créer/gérer des préréglages groupés
 */
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
        const storageKey = `pipeline-grouped-presets-${type || 'unknown'}`;
        localStorage.setItem(storageKey, JSON.stringify(newGroups));
        onSave && onSave(newGroups);

        // Fermer la modal après enregistrement
        resetForm();
        onClose();
    };

    const handleDeleteGroup = (groupId) => {
        if (!confirm('Supprimer ce groupe ?')) return;
        const newGroups = groups.filter(g => g.id !== groupId && g.name !== groupId);
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-6 w-[600px] max-w-[95vw] max-h-[90vh] border border-gray-200 dark:border-gray-700 flex flex-col"
            >
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <CheckSquare className="w-5 h-5 text-purple-500" />
                        Créer un préréglage groupé
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Nom du groupe*
                        </label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Ex: Configuration Indoor Standard"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Description (optionnel)
                        </label>
                        <input
                            type="text"
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            placeholder="Ex: Config pour culture indoor LED 600W"
                            className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Champs à inclure ({selectedFields.size} sélectionné{selectedFields.size > 1 ? 's' : ''})
                    </label>
                </div>

                <div className="flex-1 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-3 space-y-2 mb-4">
                    {allFields.map(field => {
                        const isSelected = selectedFields.has(field.id);
                        return (
                            <div
                                key={field.id}
                                className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isSelected ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                                    }`}
                            >
                                <button
                                    onClick={() => handleToggleField(field.id)}
                                    className="flex items-center justify-center w-5 h-5 text-purple-600 dark:text-purple-400"
                                >
                                    {isSelected ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                </button>

                                <div className="flex items-center gap-2 flex-1">
                                    {field.icon && <span className="text-base">{field.icon}</span>}
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                                            {field.label}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                            {field.sectionLabel}
                                        </div>
                                    </div>
                                </div>

                                {isSelected && (
                                    <div className="flex items-center gap-2 flex-1">
                                        {getFieldInput(field)}
                                        {field.unit && (
                                            <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                {field.unit}
                                            </span>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={handleSave}
                        disabled={!groupName.trim() || selectedFields.size === 0}
                        className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"

                        return (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-[800px] max-w-[95vw] max-h-[85vh] border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden">
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                                    <span>👥</span> Groupes de préréglages
                                    {mode === 'create' && <span className="text-sm font-normal text-gray-500">— Nouveau</span>}
                                    {mode === 'edit' && <span className="text-sm font-normal text-gray-500">— Modifier "{editingGroup?.name}"</span>}
                                </h3>
                                <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                                    <span className="text-2xl leading-none">×</span>
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
                                                        <div className="p-2 space-y-1 max-h-[180px] overflow-y-auto">
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
                                                                            className="w-4 h-4 cursor-pointer"
                                                                        />
                                                                        <span className="text-xs">{field.icon} {field.label}</span>
                                                                        {isSelected && renderFieldInput(field) && (
                                                                            <div className="ml-auto">
                                                                                {renderFieldInput(field)}
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

                                    {/* Footer buttons */}
                                    <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex gap-2 flex-shrink-0">
                                        <button
                                            onClick={() => setMode('list')}
                                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            Retour
                                        </button>
                                        <button
                                            onClick={handleSaveGroup}
                                            disabled={!groupName.trim() || selectedFields.length === 0}
                                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Enregistrer
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    );
}

                    /**
                     * PipelineDataModal - Modal pour saisir les valeurs lors d'un drop
                     * 
                     * Comportement CDC:
                     * - Si droppedItem existe: affiche uniquement le champ correspondant
                     * - Sinon: affiche tous les champs assignés à cette cellule
                     * - Onglet préréglages pour sauvegarder/charger des configurations
                     */

                    const PipelineDataModal = ({
                        isOpen,
                        onClose,
                        cellData = {},
                        sidebarSections = [],
                        onSave,
                        timestamp,
                        intervalLabel = '',
                        droppedItem = null,
                        pipelineType = 'culture',
                        onFieldDelete,
                        onDragOver = null,
                        onDrop = null,
                        groupedPresets = [],
                        preConfiguredItems = {},
                        selectedCells = []  // Array of selected cell timestamps for apply-to-selection
                    }) => {
    const [formData, setFormData] = useState({ });
                    const [activeTab, setActiveTab] = useState('data');
                    const [newPresetName, setNewPresetName] = useState('');
                    const [confirmState, setConfirmState] = useState({open: false, title: '', message: '', onConfirm: null });
                    const [showCreateGroupedModal, setShowCreateGroupedModal] = useState(false);
                    const [createGroupedPrefill, setCreateGroupedPrefill] = useState(null);

                    // Hook pour gérer les préréglages (localStorage + serveur)
                    const {presets, createPreset, deletePreset, loadPresets} = usePresets(pipelineType);

    useEffect(() => {
        const initialData = {...cellData};
                    delete initialData.timestamp;
                    delete initialData._meta;

                    console.log('🟢 PipelineDataModal init - cellData:', cellData);
                    console.log('🟢 PipelineDataModal init - initialData:', initialData);

                    setFormData(initialData);
                    setActiveTab('data');
    }, [cellData, timestamp, droppedItem, pipelineType]);

    // Obtenir tous les items disponibles depuis les sections
    const getAllItems = () => {
        const items = [];
        sidebarSections.forEach(section => {
            if (section.items) {
                        section.items.forEach(item => {
                            items.push({ ...item, sectionLabel: section.label });
                        });
            }
        });
                    return items;
    };

    // Obtenir les items à afficher
    const getItemsToDisplay = () => {
        if (droppedItem) {
            // ✅ BUG FIX #3: Support multi-items drop
            if (droppedItem.content.type === 'multi' && Array.isArray(droppedItem.content.items)) {
                        console.log('🔍 getItemsToDisplay - Multi-items:', droppedItem.content.items.length);
                return droppedItem.content.items.map(item => ({...item, sectionLabel: '' }));
            }
                    // Afficher uniquement l'item droppé (single)
                    return [{...droppedItem.content, sectionLabel: '' }];
        } else {
            // Afficher tous les items qui ont des données dans formData
            const allItems = getAllItems();
                    console.log('🔍 getItemsToDisplay - allItems:', allItems.length, 'formData:', formData);

            return allItems.filter(item => {
                const itemKey = item.id || item.key || item.type;
                    const hasData = formData[itemKey] !== undefined && formData[itemKey] !== null && formData[itemKey] !== '';
                    if (hasData) {
                        console.log(`✅ Item "${item.label}" (key: ${itemKey}) has data:`, formData[itemKey]);
                }
                    return hasData;
            });
        }
    };

    // Handler pour modifier une valeur
    const handleChange = (key, value) => {
                        setFormData(prev => ({
                            ...prev,
                            [key]: value
                        }));
    };

    // Handler pour sauvegarder
    const handleSubmit = (e) => {
                        e.preventDefault();

                    // ✅ onSave sera appelé avec le timestamp courant
                    // handleModalSave dans PipelineDragDropView se charge d'appliquer aux selectedCells
                    console.log('💾 handleSubmit - timestamp:', timestamp, 'formData:', formData);
                    console.log('💾 handleSubmit - selectedCells:', selectedCells?.length || 0, 'cellules');

                    onSave({
                        timestamp: timestamp,
                    data: formData
        });

                    onClose();
    };

    const findSidebarFieldByKey = (key) => {
        for (const section of sidebarSections) {
            const match = section.items?.find(item => (item.key || item.id || item.type) === key);
                    if (match) {
                return {...match, sectionLabel: section.label };
            }
        }
                    return null;
    };

                    const applyPresetFields = (fields = { }) => {
        if (!fields || Object.keys(fields).length === 0) return;
                    console.log('✅ Appli cation préréglage groupe:', Object.keys(fields).length, 'champs');
        setFormData(prev => ({...prev, ...fields }));
                    setActiveTab('data');
    };

                    const FieldWrapper = ({item, children}) => {
        const itemKey = item.id || item.key || item.type;
                    return (
                    <div className="relative group">
                        {children}
                        <button
                            type="button"
                            title="Supprimer ce champ de la cellule"
                            onClick={() => {
                                if (!item || !itemKey) return;
                                // Suppression directe sans confirmation pour fluidité
                                if (onFieldDelete) {
                                    onFieldDelete(timestamp, itemKey);
                                }
                                // Supprimer également du formData local
                                setFormData(prev => {
                                    const updated = { ...prev };
                                    delete updated[itemKey];
                                    return updated;
                                });
                            }}
                            className="absolute -top-2 -right-2 w-6 h-6 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    );
    };

    // Sauvegarder un nouveau préréglage
    const handleSavePreset = async () => {
        if (!newPresetName.trim()) {
                        alert('Veuillez saisir un nom pour le préréglage');
                    return;
        }

                    if (!droppedItem || !droppedItem.content) {
                        alert('Impossible de sauvegarder un préréglage sans champ défini');
                    return;
        }

                    const fieldKey = droppedItem.content.id || droppedItem.content.key || droppedItem.content.type;
                    if (!fieldKey) {
                        alert('Impossible de déterminer la clé du champ');
                    return;
        }

                    const fieldValue = formData[fieldKey];

                    if (!fieldValue && fieldValue !== 0 && fieldValue !== false) {
                        alert('Veuillez saisir une valeur avant de sauvegarder le préréglage');
                    return;
        }

                    const newPreset = {
                        id: `preset_${Date.now()}`,
                    name: newPresetName.trim(),
                    value: fieldValue,
                    fieldKey: fieldKey,
                    fieldLabel: droppedItem.content.label,
                    createdAt: new Date().toISOString()
        };

                    try {
                        await createPreset('field', {
                            name: newPreset.name,
                            data: {
                                value: newPreset.value,
                                fieldKey: newPreset.fieldKey,
                                fieldLabel: newPreset.fieldLabel
                            }
                        });
                    setNewPresetName('');
                    alert(`✓ "${newPreset.name}" sauvegardé !`);
        } catch (err) {
                        console.error('❌ Erreur sauvegarde préréglage:', err);
                    alert('❌ Erreur lors de la sauvegarde');
        }
    };

    // Charger un préréglage
    const handleLoadPreset = (preset) => {
        if (preset && preset.data && preset.data.fieldKey && preset.data.value !== undefined) {
                        handleChange(preset.data.fieldKey, preset.data.value);
                    setActiveTab('data');
        }
    };

    // Supprimer un préréglage
    const handleDeletePreset = async (presetId) => {
        if (!confirm('Supprimer ce préréglage ?')) return;

                    try {
                        await deletePreset(presetId);
        } catch (err) {
                        console.error('❌ Erreur suppression préréglage:', err);
                    alert('❌ Erreur lors de la suppression');
        }
    };

    // Rendu du champ selon le type
    const renderField = (item) => {
        if (!item) return null;

                    const itemKey = item.id || item.key || item.type;
                    const value = formData[itemKey] || '';
                    const {label, icon, type = 'text'} = item;

                    console.log(`🎨 Rendering field "${label}" (key: ${itemKey}, type: ${type}), value:`, value, 'item:', item);

        // SELECT avec options (options peuvent être des strings ou des objets {value, label})
                    if (type === 'select') {
            if (!Array.isArray(item.options)) {
                return (
                    <div className="p-3 bg-red-900/30 border border-red-600 text-red-200 text-xs rounded">
                        ❌ Select "{label}" n'a pas d'options défini
                    </div>
                    );
            }
                    return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label}
                            </label>
                            <select
                                value={value}
                                onChange={(e) => handleChange(itemKey, e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
                                required={droppedItem !== null}
                            >
                                <option value="">Sélectionner...</option>
                                {item.options.map((opt, idx) => {
                                    const val = typeof opt === 'string' ? opt : (opt.value ?? opt);
                                    const labelOpt = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                                    return <option key={`${itemKey}-${idx}-${val}`} value={val}>{labelOpt}</option>;
                                })}
                            </select>
                        </div>
                    </FieldWrapper>
                    );
        }

                    // SLIDER - Afficher input range avec valeur affichée
                    if (type === 'slider' || type === 'stepper') {
            const min = item.min || 0;
                    const max = item.max || 100;
                    const step = item.step || 1;
                    const unit = item.unit || '';
                    return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label}
                            </label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="range"
                                    value={value || item.defaultValue || min}
                                    onChange={(e) => handleChange(itemKey, parseFloat(e.target.value))}
                                    min={min}
                                    max={max}
                                    step={step}
                                    className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                />
                                <input
                                    type="number"
                                    value={value || item.defaultValue || ''}
                                    onChange={(e) => handleChange(itemKey, e.target.value === '' ? '' : parseFloat(e.target.value))}
                                    min={min}
                                    max={max}
                                    step={step}
                                    className="w-24 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                                    placeholder={`${min}-${max}`}
                                />
                                {unit && <span className="text-sm text-gray-600 dark:text-gray-400">{unit}</span>}
                            </div>
                            {item.suggestions && item.suggestions.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {item.suggestions.map((sugg, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleChange(itemKey, sugg.value)}
                                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded border border-gray-300 dark:border-gray-600"
                                        >
                                            {sugg.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </FieldWrapper>
                    );
        }

                    // FREQUENCY - Valeur + période (ex: 2 fois par jour)
                    if (type === 'frequency') {
            const freqValue = value || item.defaultValue || {value: 1, period: 'day' };
                    return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label}
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={freqValue.value || 1}
                                    onChange={(e) => handleChange(itemKey, { ...freqValue, value: parseFloat(e.target.value) || 1 })}
                                    min="0.1"
                                    step="0.1"
                                    className="w-20 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                                />
                                <span className="flex items-center text-sm">fois par</span>
                                <select
                                    value={freqValue.period || 'day'}
                                    onChange={(e) => handleChange(itemKey, { ...freqValue, period: e.target.value })}
                                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                                >
                                    <option value="hour">heure</option>
                                    <option value="day">jour</option>
                                    <option value="week">semaine</option>
                                    <option value="month">mois</option>
                                </select>
                            </div>
                        </div>
                    </FieldWrapper>
                    );
        }

                    // DIMENSIONS - L × l × H
                    if (type === 'dimensions') {
            const dimValue = value || item.defaultValue || {length: 0, width: 0, height: 0 };
                    const unit = item.unit || 'cm';
                    return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label}
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                <div>
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Longueur</label>
                                    <input
                                        type="number"
                                        value={dimValue.length || ''}
                                        onChange={(e) => handleChange(itemKey, { ...dimValue, length: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
                                        placeholder="L"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Largeur</label>
                                    <input
                                        type="number"
                                        value={dimValue.width || ''}
                                        onChange={(e) => handleChange(itemKey, { ...dimValue, width: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
                                        placeholder="l"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-600 dark:text-gray-400">Hauteur</label>
                                    <input
                                        type="number"
                                        value={dimValue.height || ''}
                                        onChange={(e) => handleChange(itemKey, { ...dimValue, height: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm"
                                        placeholder="H"
                                    />
                                </div>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">
                                {unit} • {dimValue.length || 0} × {dimValue.width || 0} × {dimValue.height || 0}
                            </div>
                        </div>
                    </FieldWrapper>
                    );
        }

                    // COMPUTED - Champ calculé automatiquement (read-only)
                    if (type === 'computed') {
            const computedValue = item.computeFn ? item.computeFn(formData) : (value || 0);
                    const unit = item.unit || '';
                    return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label} {item.tooltip && <span className="text-xs">({item.tooltip})</span>}
                            </label>
                            <div className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                                {computedValue} {unit}
                            </div>
                        </div>
                    </FieldWrapper>
                    );
        }

                    // MULTISELECT - cases where options is an array of option objects
                    if (type === 'multiselect') {
            if (!Array.isArray(item.options)) {
                return (
                    <div className="p-3 bg-red-900/30 border border-red-600 text-red-200 text-xs rounded">
                        ❌ Multiselect "{label}" n'a pas d'options défini
                    </div>
                    );
            }
                    const selected = Array.isArray(formData[itemKey]) ? formData[itemKey] : [];
                    return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label}
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {item.options.map((opt, idx) => {
                                    const val = typeof opt === 'string' ? opt : (opt.value ?? opt);
                                    const lab = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                                    const checked = selected.includes(val);
                                    return (
                                        <label key={`${itemKey}-ms-${idx}`} className="flex items-center gap-2 p-2 border rounded-lg">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={(e) => {
                                                    const next = e.target.checked ? [...selected, val] : selected.filter(s => s !== val);
                                                    handleChange(itemKey, next);
                                                }}
                                                className="w-4 h-4"
                                            />
                                            <span className="text-sm">{lab}</span>
                                            {item.withPercentage && (
                                                <input
                                                    type="number"
                                                    value={item._percentages?.[val] ?? ''}
                                                    onChange={(e) => {
                                                        const percent = e.target.value === '' ? '' : parseFloat(e.target.value);
                                                        const pctObj = { ...item._percentages, [val]: percent };
                                                        // store companion percentages into formData under a dedicated key
                                                        handleChange(`${itemKey}__percentages`, pctObj);
                                                    }}
                                                    placeholder="%"
                                                    className="ml-auto w-20 px-2 py-1 border rounded text-sm"
                                                />
                                            )}
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </FieldWrapper>
                    );
        }

                    // continue - no early return here

                    // DATE
                    if (type === 'date') {
            return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label}
                            </label>
                            <input
                                type="date"
                                value={value || ''}
                                onChange={(e) => handleChange(itemKey, e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
                                required={droppedItem !== null}
                            />
                        </div>
                    </FieldWrapper>
                    );
        }

                    // NUMBER
                    if (type === 'number') {
            return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label}
                            </label>
                            <input
                                type="number"
                                value={value || ''}
                                onChange={(e) => {
                                    const val = e.target.value === '' ? '' : parseFloat(e.target.value);
                                    handleChange(itemKey, val);
                                }}
                                step={item.step || '0.1'}
                                min={item.min}
                                max={item.max}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
                                placeholder={item.placeholder || `Ex: ${item.defaultValue || ''}`}
                                required={droppedItem !== null}
                            />
                        </div>
                    </FieldWrapper>
                    );
        }

                    // CHECKBOX
                    if (type === 'checkbox') {
            return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={Boolean(value)}
                                onChange={(e) => handleChange(itemKey, e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:"
                            />
                            <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label}
                            </label>
                        </div>
                    </FieldWrapper>
                    );
        }

                    // TEXTAREA
                    if (type === 'textarea') {
            const textValue = String(value || '');
                    return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label}
                            </label>
                            <textarea
                                value={textValue}
                                onChange={(e) => handleChange(itemKey, e.target.value)}
                                rows={3}
                                maxLength={item.maxLength || 500}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus: resize-none"
                                placeholder={item.placeholder || ''}
                            />
                            {item.maxLength && (
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {textValue.length} / {item.maxLength} caractères
                                </p>
                            )}
                        </div>
                    </FieldWrapper>
                    );
        }

                    // TEXT par défaut
                    return (
                    <FieldWrapper item={item} key={itemKey}>
                        <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                                {icon && <span className="mr-2">{icon}</span>}
                                {label}
                            </label>
                            <input
                                type="text"
                                value={value || ''}
                                onChange={(e) => handleChange(itemKey, e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
                                placeholder={item.placeholder || ''}
                                required={droppedItem !== null}
                            />
                        </div>
                    </FieldWrapper>
                    );
    };

                    const itemsToDisplay = getItemsToDisplay();

                    return (
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md"
                                onClick={onClose}
                            >
                                <motion.div
                                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                    animate={{ scale: 1, opacity: 1, y: 0 }}
                                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                                        <div>
                                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                                {droppedItem ? `📝 Attribution pour ${intervalLabel}` : '✏️ Modifier les données'}
                                            </h2>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                                {droppedItem
                                                    ? `Définir les valeurs de "${droppedItem.content.label}"`
                                                    : `${intervalLabel} • ${itemsToDisplay.length} champ(s)`
                                                }
                                            </p>
                                        </div>
                                        <button
                                            onClick={onClose}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                                        </button>
                                    </div>

                                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                                        <button
                                            onClick={() => setActiveTab('data')}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'data'
                                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-300'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                        >
                                            📝 Données de la cellule
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('presets')}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'presets'
                                                ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-300'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                        >
                                            <Bookmark className="w-4 h-4 inline mr-1" />
                                            Pré-réglages
                                        </button>
                                    </div>

                                    {/* Zone drag & drop CDC pour ajouter plus de champs + Bouton pour cellules vides */}
                                    {!droppedItem && (
                                        <div className="p-4 m-4 space-y-3">
                                            {/* Bouton "Ajouter des données" si cellule vide */}
                                            {itemsToDisplay.length === 0 && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        // Ouvrir modal pour créer groupe préréglage si cellule vide
                                                        const filled = {};
                                                        Object.entries(formData).forEach(([k, v]) => {
                                                            if (v !== undefined && v !== null && v !== '') filled[k] = v;
                                                        });
                                                        setCreateGroupedPrefill(null);
                                                        setShowCreateGroupedModal(true);
                                                    }}
                                                    className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                                                >
                                                    <span className="text-xl">➕</span>
                                                    Ajouter des données à cette cellule
                                                </button>
                                            )}

                                            {/* Zone drag & drop pour ajouter plus de champs */}
                                            <div
                                                onDragOver={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.add('ring-2', 'ring-blue-400', 'bg-blue-100/50', 'dark:bg-blue-900/30');
                                                }}
                                                onDragLeave={(e) => {
                                                    e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-100/50', 'dark:bg-blue-900/30');
                                                }}
                                                onDrop={(e) => {
                                                    e.preventDefault();
                                                    e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'bg-blue-100/50', 'dark:bg-blue-900/30');

                                                    // Récupérer les données droppées depuis le sidebar
                                                    try {
                                                        const data = e.dataTransfer.getData('application/json');
                                                        if (data) {
                                                            const dropped = JSON.parse(data);
                                                            console.log('🎯 Drop dans modal:', dropped);

                                                            // Si c'est un groupe préréglage (multi-fields)
                                                            if (dropped.type === 'grouped-preset') {
                                                                const fields = dropped.data?.fields || dropped.fields || {};
                                                                applyPresetFields(fields);
                                                            }
                                                            // Si c'est un item simple
                                                            else if (dropped.content || dropped.key) {
                                                                const key = dropped.content?.key || dropped.key;
                                                                const value = dropped.defaultValue || '';
                                                                if (key) {
                                                                    handleChange(key, value);
                                                                }
                                                            }
                                                        }
                                                    } catch (err) {
                                                        console.error('Erreur drop:', err);
                                                    }
                                                    onDrop && onDrop(e);
                                                }}
                                                className="p-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50/30 dark:bg-blue-900/20 text-center transition-all"
                                            >
                                                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                                    ⤡ Déposez des éléments ou un groupe ici pour ajouter des champs
                                                </p>
                                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                                    Drag depuis le panneau latéral
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Contenu - TAB FORMULAIRE */}
                                    {activeTab === 'data' && (
                                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                                            {itemsToDisplay.length === 0 ? (
                                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                                    <p className="text-lg mb-2">Aucun champ à afficher</p>
                                                    <p className="text-sm">Glissez-déposez des éléments depuis le panneau latéral</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {itemsToDisplay.map((item, idx) => {
                                                        const rendered = renderField(item);
                                                        const itemKey = item?.key || item?.type;
                                                        if (!rendered) {
                                                            return (
                                                                <div key={idx} className="p-3 bg-yellow-900/30 border border-yellow-600 text-yellow-200 text-xs rounded">
                                                                    ⚠️ Item {idx} ({itemKey}) n'a pas d'input compatible (type={item?.type})
                                                                </div>
                                                            );
                                                        }
                                                        return <div key={itemKey || idx}>{rendered}</div>;
                                                    })}
                                                </div>
                                            )}

                                            {droppedItem && (
                                                <div className="mt-4 p-4 bg-white/5 dark:bg-gray-800/30 rounded-lg border border-white/5">
                                                    <p className="text-sm text-gray-200">
                                                        💡 <strong>Conformité CDC:</strong> Vous devez renseigner une valeur avant d'ajouter ce champ à la cellule.
                                                    </p>
                                                    <button
                                                        type="button"
                                                        onClick={() => setActiveTab('presets')}
                                                        className="mt-2 text-xs text-gray-300 hover:underline"
                                                    >
                                                        → Utiliser un préréglage sauvegardé
                                                    </button>
                                                </div>
                                            )}
                                        </form>
                                    )}

                                    {/* Contenu - TAB PRÉRÉGLAGES */}
                                    {activeTab === 'presets' && (
                                        <div className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">📦 Groupes de préréglages</h3>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setCreateGroupedPrefill(null);
                                                        setShowCreateGroupedModal(true);
                                                    }}
                                                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded flex items-center gap-1 font-medium transition-colors"
                                                >
                                                    ➕ Nouveau
                                                </button>
                                            </div>

                                            {/* Affichage des groupes préréglage */}
                                            {(!groupedPresets || groupedPresets.length === 0) && (!presets.grouped || presets.grouped.length === 0) ? (
                                                <div className="text-center py-12 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-6">
                                                    <p className="text-base font-medium">📦 Aucun groupe préréglage</p>
                                                    <p className="text-xs mt-2">Créez un groupe de préréglages pour réutiliser rapidement des configurations</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    {/* Groupes préréglage sauvegardés (serveur/localStorage) */}
                                                    {presets.grouped && presets.grouped.length > 0 && (
                                                        presets.grouped.map((group) => {
                                                            const fieldCount = group.data?.selectedFields?.length || Object.keys(group.data?.fields || {}).length || 0;
                                                            const preview = group.data?.selectedFields
                                                                ? group.data.selectedFields.slice(0, 3).join(', ')
                                                                : Object.keys(group.data?.fields || {}).slice(0, 3).join(', ');

                                                            return (
                                                                <div key={group.id} className="p-3 rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-900/20 hover:shadow-md transition-all">
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-sm text-gray-900 dark:text-white">{group.name}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{fieldCount} champ(s): {preview}</p>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors whitespace-nowrap flex-shrink-0"
                                                                            onClick={() => {
                                                                                const fields = {};
                                                                                Object.entries(group.data?.fields || {}).forEach(([k, v]) => {
                                                                                    fields[k] = v;
                                                                                });
                                                                                applyPresetFields(fields);
                                                                            }}
                                                                        >
                                                                            Charger
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}

                                                    {/* Groupes locaux (groupedPresets prop) */}
                                                    {groupedPresets && groupedPresets.length > 0 && (
                                                        groupedPresets.map((group) => {
                                                            const preview = (group.fields || []).slice(0, 3).map(f => f.key).join(', ');
                                                            return (
                                                                <div key={group.name} className="p-3 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/40 dark:bg-blue-900/20 hover:shadow-md transition-all">
                                                                    <div className="flex items-center justify-between gap-3">
                                                                        <div className="flex-1 min-w-0">
                                                                            <p className="font-medium text-sm text-gray-900 dark:text-white">{group.name}</p>
                                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{group.fields?.length || 0} champ(s): {preview}</p>
                                                                        </div>
                                                                        <button
                                                                            type="button"
                                                                            className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors whitespace-nowrap flex-shrink-0"
                                                                            onClick={() => {
                                                                                const merged = {};
                                                                                (group.fields || []).forEach(f => {
                                                                                    const key = f.key || f.id;
                                                                                    if (key) merged[key] = f.value;
                                                                                });
                                                                                applyPresetFields(merged);
                                                                            }}
                                                                        >
                                                                            Charger
                                                                        </button>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Footer */}
                                    <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                                        >
                                            Annuler
                                        </button>

                                        {activeTab === 'data' && (
                                            <button
                                                type="submit"
                                                onClick={handleSubmit}
                                                disabled={itemsToDisplay.length === 0}
                                                className="px-4 py-2 hover: disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                {selectedCells && selectedCells.length > 1
                                                    ? `Appliquer à ${selectedCells.length} cases`
                                                    : 'Enregistrer'}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                        <GroupedPresetModal
                            isOpen={showCreateGroupedModal}
                            onClose={() => { setShowCreateGroupedModal(false); setCreateGroupedPrefill(null); }}
                            onSave={(newGroups) => {
                                // Update the groupedPresets prop would require parent update
                                // For now, just close and refresh if needed
                                loadPresets && typeof loadPresets === 'function' && loadPresets();
                                setShowCreateGroupedModal(false);
                                setCreateGroupedPrefill(null);
                            }}
                            groups={groupedPresets}
                            setGroups={(newGroups) => {
                                // Would need callback to parent to update groupedPresets
                                // For now stored in localStorage via the modal itself
                            }}
                            sidebarContent={sidebarSections}
                            type={pipelineType}
                        />
                        <ConfirmModal open={confirmState.open} title={confirmState.title} message={confirmState.message} onCancel={() => setConfirmState(prev => ({ ...prev, open: false }))} onConfirm={() => setConfirmState(prev => { const cb = prev && prev.onConfirm; if (typeof cb === 'function') cb(); return { ...prev, open: false }; })} />
                    </AnimatePresence>
                    );
};

                    export default PipelineDataModal;
