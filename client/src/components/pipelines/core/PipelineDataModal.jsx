import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, BookmarkPlus, Bookmark, CheckSquare, Square } from 'lucide-react';
import ConfirmModal from '../../shared/ConfirmModal';
import usePresets from '../../../hooks/usePresets';
import { GroupedPresetModal } from '../views/PipelineDragDropView';
import { useEscapeClose } from '../../ui/LiquidUI';

/**
 * PipelineDataModal - Modal pour saisir les valeurs lors d'un drop
 * 
 * Comportement CDC:
 * - Si droppedItem existe: affiche uniquement le champ correspondant
 * - Sinon: affiche tous les champs assignés à cette cellule
 * - Onglet préréglages pour sauvegarder/charger des configurations
 */

/**
 * PipelineDataModal - Modal pour saisir les valeurs lors d'un drop
 * 
 * Comportement CDC:
 * - Si droppedItem existe: affiche uniquement le champ correspondant
 * - Sinon: affiche tous les champs assignés à cette cellule
 * - Onglet préréglages pour sauvegarder/charger des configurations
 */

function PipelineDataModal({
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
    selectedCells = [],  // Array of selected cell timestamps for apply-to-selection
    // New: show a button to set the timeline start-month from within the data modal
    showSetStartMonthButton = false,
    onOpenStartMonth = null
}) {
    const [formData, setFormData] = useState({});
    const [newPresetName, setNewPresetName] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });
    const [showCreateGroupedModal, setShowCreateGroupedModal] = useState(false);
    const [createGroupedPrefill, setCreateGroupedPrefill] = useState(null);

    // Close on Escape (only when no child modal is open — GroupedPresetModal handles its own)
    useEscapeClose(isOpen && !showCreateGroupedModal && !confirmState.open, onClose);

    // Hook pour gérer les préréglages (localStorage + serveur)
    const { presets, createPreset, deletePreset, loadPresets } = usePresets(pipelineType);

    useEffect(() => {
        const initialData = { ...cellData };
        delete initialData.timestamp;
        delete initialData._meta;

        setFormData(initialData);
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
                return droppedItem.content.items.map(item => ({ ...item, sectionLabel: '' }));
            }
            // Afficher uniquement l'item droppé (single)
            return [{ ...droppedItem.content, sectionLabel: '' }];
        } else {
            // Afficher tous les items qui ont des données dans formData
            const allItems = getAllItems();

            return allItems.filter(item => {
                const itemKey = item.id || item.key || item.type;
                const hasData = formData[itemKey] !== undefined && formData[itemKey] !== null && formData[itemKey] !== '';
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
                return { ...match, sectionLabel: section.label };
            }
        }
        return null;
    };

    const applyPresetFields = (fields = {}) => {
        if (!fields || Object.keys(fields).length === 0) return;
        setFormData(prev => ({ ...prev, ...fields }));
    };

    const FieldWrapper = ({ item, children }) => {
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
            alert('❌ Erreur lors de la sauvegarde');
        }
    };

    // Charger un préréglage
    const handleLoadPreset = (preset) => {
        if (preset && preset.data && preset.data.fieldKey && preset.data.value !== undefined) {
            handleChange(preset.data.fieldKey, preset.data.value);
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
        const { label, icon, type = 'text' } = item;

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
                            <option value="" className="bg-white dark:bg-gray-800">Sélectionner...</option>
                            {item.options.map((opt, idx) => {
                                const val = typeof opt === 'string' ? opt : (opt.value ?? opt);
                                const labelOpt = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                                return <option key={`${itemKey}-${idx}-${val}`} value={val} className="bg-white dark:bg-gray-800">{labelOpt}</option>;
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
            const freqValue = value || item.defaultValue || { value: 1, period: 'day' };
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
                                <option value="hour" className="bg-white dark:bg-gray-800">heure</option>
                                <option value="day" className="bg-white dark:bg-gray-800">jour</option>
                                <option value="week" className="bg-white dark:bg-gray-800">semaine</option>
                                <option value="month" className="bg-white dark:bg-gray-800">mois</option>
                            </select>
                        </div>
                    </div>
                </FieldWrapper>
            );
        }

        // DIMENSIONS - L × l × H
        if (type === 'dimensions') {
            const dimValue = value || item.defaultValue || { length: 0, width: 0, height: 0 };
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

        // SUBSCORE-GROUP - plusieurs sous-notes /max liées (ex: évolution visuelle = couleur+densité+trichomes)
        if (type === 'subscore-group') {
            const subScores = Array.isArray(item.subScores) ? item.subScores : [];
            const groupValue = (value && typeof value === 'object') ? value : {};
            const filled = subScores.filter(s => groupValue[s.key] !== undefined && groupValue[s.key] !== null && groupValue[s.key] !== '');
            const overall = filled.length > 0
                ? (filled.reduce((sum, s) => sum + Number(groupValue[s.key] || 0), 0) / filled.length).toFixed(1)
                : null;
            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="space-y-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            {icon && <span className="mr-2">{icon}</span>}
                            {label}
                        </label>
                        {subScores.map((sub) => {
                            const max = sub.max || 10;
                            const subVal = groupValue[sub.key] ?? '';
                            return (
                                <div key={sub.key} className="flex items-center gap-3">
                                    <span className="text-xs text-gray-600 dark:text-gray-400 w-24 flex-shrink-0">{sub.label}</span>
                                    <input
                                        type="range"
                                        value={subVal === '' ? 0 : subVal}
                                        onChange={(e) => handleChange(itemKey, { ...groupValue, [sub.key]: parseFloat(e.target.value) })}
                                        min={0}
                                        max={max}
                                        step={sub.step || 0.5}
                                        className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <span className="w-12 text-right text-sm text-gray-700 dark:text-gray-300 flex-shrink-0">
                                        {subVal === '' ? '—' : subVal} /{max}
                                    </span>
                                </div>
                            );
                        })}
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Moyenne (overall)</span>
                            <span className="text-sm font-bold text-gray-900 dark:text-gray-100">{overall ?? '—'} /10</span>
                        </div>
                    </div>
                </FieldWrapper>
            );
        }

        // RECORDS-LIST - liste répétable d'enregistrements (ex: passes de séparation, washes)
        if (type === 'records-list') {
            const recordFields = Array.isArray(item.recordFields) ? item.recordFields : [];
            const records = Array.isArray(value) ? value : [];
            const recordLabel = item.recordLabel || 'Entrée';

            const updateRecord = (recordId, fieldKey, fieldValue) => {
                const updated = records.map(r => r.id === recordId ? { ...r, [fieldKey]: fieldValue } : r);
                handleChange(itemKey, updated);
            };
            const addRecord = () => {
                const blank = { id: Date.now() };
                recordFields.forEach(f => { blank[f.key] = f.defaultValue ?? ''; });
                handleChange(itemKey, [...records, blank]);
            };
            const removeRecord = (recordId) => {
                handleChange(itemKey, records.filter(r => r.id !== recordId));
            };

            const renderRecordInput = (record, field) => {
                const val = record[field.key] ?? '';
                if (field.type === 'select' && Array.isArray(field.options)) {
                    return (
                        <select
                            value={val}
                            onChange={(e) => updateRecord(record.id, field.key, e.target.value)}
                            className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-gray-100"
                        >
                            <option value="" className="bg-white dark:bg-gray-800">—</option>
                            {field.options.map((opt, idx) => {
                                const optVal = typeof opt === 'string' ? opt : (opt.value ?? opt);
                                const optLabel = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                                return <option key={idx} value={optVal} className="bg-white dark:bg-gray-800">{optLabel}</option>;
                            })}
                        </select>
                    );
                }
                if (field.type === 'slider' || field.type === 'number') {
                    return (
                        <input
                            type="number"
                            value={val}
                            onChange={(e) => updateRecord(record.id, field.key, e.target.value === '' ? '' : parseFloat(e.target.value))}
                            min={field.min}
                            max={field.max}
                            step={field.step || 1}
                            placeholder={field.unit || ''}
                            className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-gray-100"
                        />
                    );
                }
                return (
                    <input
                        type="text"
                        value={val}
                        onChange={(e) => updateRecord(record.id, field.key, e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-xs text-gray-900 dark:text-gray-100"
                    />
                );
            };

            return (
                <FieldWrapper item={item} key={itemKey}>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            {icon && <span className="mr-2">{icon}</span>}
                            {label}
                        </label>
                        {records.map((record, idx) => (
                            <div key={record.id} className="p-2 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">{recordLabel} {idx + 1}</span>
                                    <button
                                        type="button"
                                        onClick={() => removeRecord(record.id)}
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                                    >
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                                    {recordFields.map(field => (
                                        <div key={field.key}>
                                            <label className="block text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{field.label}{field.unit ? ` (${field.unit})` : ''}</label>
                                            {renderRecordInput(record, field)}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addRecord}
                            className="w-full py-1.5 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        >
                            ➕ Ajouter {recordLabel.toLowerCase()}
                        </button>
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
                            className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
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
                            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 resize-none"
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

    return createPortal(
        <>
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
                        className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50 flex flex-col"
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

                        {/* Contenu unifié : champs de la cellule + ajout (drag&drop) + groupes de préréglages */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-3 overflow-y-auto flex-1 min-h-0">
                            {itemsToDisplay.length === 0 ? (
                                <div className="text-center py-6 text-gray-500 dark:text-gray-400">
                                    <p className="text-base mb-1">Aucune donnée pour le moment</p>
                                    <p className="text-sm">Glissez un élément depuis le panneau latéral, ou chargez un groupe ci-dessous</p>
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
                                </div>
                            )}

                            {/* Zone drag & drop pour ajouter plus de champs */}
                            {!droppedItem && (
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
                            )}

                            {/* Groupes de préréglages - toujours visible, plus besoin d'onglet séparé */}
                            {!droppedItem && (
                                <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-1.5">
                                            <Bookmark className="w-4 h-4" /> Groupes de préréglages
                                        </h3>
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

                                    {(!groupedPresets || groupedPresets.length === 0) && (!presets.grouped || presets.grouped.length === 0) ? (
                                        <div className="text-center py-6 text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg p-4">
                                            <p className="text-sm font-medium">📦 Aucun groupe préréglage</p>
                                            <p className="text-xs mt-1">Créez un groupe pour réutiliser rapidement des configurations</p>
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
                        </form>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                            {/* Bouton pour définir le 1er mois (visible uniquement pour la 1re cellule en mode MOIS) */}
                            {showSetStartMonthButton && typeof onOpenStartMonth === 'function' && (
                                <button
                                    type="button"
                                    onClick={onOpenStartMonth}
                                    className="px-3 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg mr-2 text-sm"
                                >
                                    Définir 1er mois
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                Annuler
                            </button>

                            <button
                                type="submit"
                                onClick={handleSubmit}
                                disabled={itemsToDisplay.length === 0}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                {selectedCells && selectedCells.length > 1
                                    ? `Appliquer à ${selectedCells.length} cases`
                                    : 'Enregistrer'}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
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
        </>,
        document.body
    );
}

export default PipelineDataModal;



