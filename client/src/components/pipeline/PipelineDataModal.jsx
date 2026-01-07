import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, BookmarkPlus, Bookmark } from 'lucide-react';
import ConfirmModal from '../ui/ConfirmModal';

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
    preConfiguredItems = {}
}) => {
    const [formData, setFormData] = useState({});
    const [activeTab, setActiveTab] = useState('data');
    const [fieldPresets, setFieldPresets] = useState([]); // Préréglages pour ce champ spécifique
    const [newPresetName, setNewPresetName] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

    useEffect(() => {
        const initialData = { ...cellData };
        delete initialData.timestamp;
        delete initialData._meta;
        setFormData(initialData);
        setActiveTab('data');

        if (droppedItem && droppedItem.content) {
            const fieldKey = droppedItem.content.key || droppedItem.content.type;
            if (fieldKey) {
                const storedPresets = localStorage.getItem(`${pipelineType}_field_${fieldKey}_presets`);
                if (storedPresets) {
                    try {
                        setFieldPresets(JSON.parse(storedPresets));
                    } catch (e) {
                        setFieldPresets([]);
                    }
                } else {
                    setFieldPresets([]);
                }
            }
        }
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
            // Afficher uniquement l'item droppé
            return [{ ...droppedItem.content, sectionLabel: '' }];
        } else {
            // Afficher tous les items qui ont des données dans formData
            const allItems = getAllItems();
            console.log('🔍 getItemsToDisplay - allItems:', allItems.length, 'formData:', formData);

            return allItems.filter(item => {
                const itemKey = item.key || item.type;
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
        onSave({
            timestamp,
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
        setActiveTab('data');
    };

    const FieldWrapper = ({ item, children }) => {
        const itemKey = item.key || item.type;
        return (
            <div className="relative">
                {children}
                <button
                    type="button"
                    title="Supprimer ce champ"
                    onClick={() => {
                        if (!item || !itemKey) return;
                        setConfirmState({
                            open: true,
                            title: 'Effacer le champ',
                            message: 'Effacer ce champ de la cellule ?',
                            onConfirm: () => {
                                if (onFieldDelete) {
                                    onFieldDelete(timestamp, itemKey);
                                } else {
                                    handleChange(itemKey, null);
                                }
                                setConfirmState(prev => ({ ...prev, open: false }));
                            }
                        });
                    }}
                    className="absolute top-1 right-1 text-red-600 hover:text-red-700 p-1 rounded"
                >
                    ✖
                </button>
            </div>
        );
    };

    // Sauvegarder un nouveau préréglage
    const handleSavePreset = () => {
        if (!newPresetName.trim()) {
            alert('Veuillez saisir un nom pour le préréglage');
            return;
        }

        if (!droppedItem || !droppedItem.content) {
            alert('Impossible de sauvegarder un préréglage sans champ défini');
            return;
        }

        const fieldKey = droppedItem.content.key || droppedItem.content.type;
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

        const updatedPresets = [...fieldPresets, newPreset];
        setFieldPresets(updatedPresets);
        localStorage.setItem(`${pipelineType}_field_${fieldKey}_presets`, JSON.stringify(updatedPresets));
        setNewPresetName('');
        // Message de succès sans "Préréglage"
        alert(`✓ "${newPreset.name}" sauvegardé !`);
    };

    // Charger un préréglage
    const handleLoadPreset = (preset) => {
        if (preset && preset.fieldKey && preset.value !== undefined) {
            handleChange(preset.fieldKey, preset.value);
            setActiveTab('data');
        }
    };

    // Supprimer un préréglage
    const handleDeletePreset = (presetId) => {
        if (!droppedItem || !droppedItem.content) return;

        const fieldKey = droppedItem.content.key || droppedItem.content.type;
        if (!fieldKey) return;

        const updatedPresets = fieldPresets.filter(p => p.id !== presetId);
        setFieldPresets(updatedPresets);
        localStorage.setItem(`${pipelineType}_field_${fieldKey}_presets`, JSON.stringify(updatedPresets));
    };

    // Rendu du champ selon le type
    const renderField = (item) => {
        if (!item) return null;

        const itemKey = item.key || item.type;
        const value = formData[itemKey] || '';
        const { label, icon, type = 'text' } = item;

        console.log(`🎨 Rendering field "${label}" (key: ${itemKey}, type: ${type}), value:`, value);

        // SELECT avec options (options peuvent être des strings ou des objets {value,label})
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

                        {/* Zone drag & drop CDC pour ajouter plus de champs */}
                        {!droppedItem && (
                            <div
                                onDragOver={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.add('ring-2', 'ring-blue-400');
                                    onDragOver && onDragOver(e);
                                }}
                                onDragLeave={(e) => {
                                    e.currentTarget.classList.remove('ring-2', 'ring-blue-400');
                                }}
                                onDrop={(e) => {
                                    e.preventDefault();
                                    e.currentTarget.classList.remove('ring-2', 'ring-blue-400');
                                    onDrop && onDrop(e);
                                }}
                                className="p-4 m-4 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg bg-blue-50/30 dark:bg-blue-900/20 text-center transition-all"
                            >
                                <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                    ⤡ Déposez d'autres éléments ici pour ajouter des champs
                                </p>
                                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                                    Drag depuis le panneau latéral
                                </p>
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
                            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                                {/* Groupes de préréglages (multi-champs) */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Groupes enregistrés</h3>
                                    {(!groupedPresets || groupedPresets.length === 0) ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucun pré-groupe disponible.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {groupedPresets.map((group) => {
                                                const preview = (group.fields || []).map(f => `${f.key}: ${f.value}`).slice(0, 3).join(', ');
                                                return (
                                                    <div key={group.name} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/40">
                                                        <div className="flex items-center justify-between gap-3">
                                                            <div>
                                                                <p className="font-medium text-sm text-gray-900 dark:text-white">{group.name}</p>
                                                                <p className="text-xs text-gray-500 dark:text-gray-400">{group.fields?.length || 0} champ(s)</p>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                className="liquid-btn liquid-btn--primary text-xs"
                                                                onClick={() => {
                                                                    const merged = {};
                                                                    (group.fields || []).forEach(f => {
                                                                        const key = f.key || f.id;
                                                                        if (key) merged[key] = f.value;
                                                                    });
                                                                    applyPresetFields(merged);
                                                                }}
                                                            >
                                                                Charger dans la cellule
                                                            </button>
                                                        </div>
                                                        {preview && (
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{preview}</p>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Valeurs enregistrées par l'utilisateur */}
                                <div className="space-y-3">
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Réglages utilisateur</h3>
                                    {(!preConfiguredItems || Object.keys(preConfiguredItems).length === 0) ? (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">Aucun réglage sauvegardé.</p>
                                    ) : (
                                        <div className="space-y-2">
                                            {Object.entries(preConfiguredItems).map(([key, value]) => {
                                                const def = findSidebarFieldByKey(key);
                                                return (
                                                    <div key={key} className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-800/40 flex items-center justify-between gap-3">
                                                        <div>
                                                            <p className="font-medium text-sm text-gray-900 dark:text-white flex items-center gap-1">
                                                                {def?.icon && <span>{def.icon}</span>}
                                                                {def?.label || key}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400">{String(value)}</p>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            className="liquid-btn text-xs"
                                                            onClick={() => applyPresetFields({ [key]: value })}
                                                        >
                                                            Appliquer
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>

                                {/* Préréglages spécifiques au champ en cours */}
                                <div className="space-y-3">
                                    <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                        <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                                            <BookmarkPlus className="w-4 h-4" />
                                            Sauvegarder un préréglage de champ
                                        </h3>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={newPresetName}
                                                onChange={(e) => setNewPresetName(e.target.value)}
                                                placeholder="Nom du préréglage"
                                                className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                                            />
                                            <button
                                                onClick={handleSavePreset}
                                                disabled={!droppedItem}
                                                className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white rounded-lg text-sm flex items-center gap-2"
                                            >
                                                <Save className="w-4 h-4" />
                                                Enregistrer
                                            </button>
                                        </div>
                                        <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                                            {droppedItem ? 'Saisissez une valeur dans les données pour ce champ puis enregistrez.' : 'Déposez un champ pour activer les préréglages individuels.'}
                                        </p>
                                    </div>

                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Préréglages disponibles</h3>
                                        {fieldPresets.length === 0 ? (
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                                <p className="text-sm">Aucun préréglage sauvegardé</p>
                                                <p className="text-xs mt-1">Glissez un champ pour ajouter des préréglages ciblés.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {fieldPresets.map(preset => (
                                                    <div
                                                        key={preset.id}
                                                        className="p-3 bg-white/5 dark:bg-gray-800 border border-white/5 rounded-lg transition-colors"
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex-1">
                                                                <p className="font-medium text-sm text-gray-200">
                                                                    {preset.name}
                                                                </p>
                                                                <p className="text-xs text-gray-400 mt-1">
                                                                    {preset.fieldLabel}: <strong>{String(preset.value)}</strong>
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => {
                                                                        handleLoadPreset(preset);
                                                                        applyPresetFields({ [preset.fieldKey]: preset.value });
                                                                    }}
                                                                    className="liquid-btn liquid-btn--primary text-xs"
                                                                >
                                                                    Charger
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeletePreset(preset.id)}
                                                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs"
                                                                >
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
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
                                    Enregistrer
                                </button>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            )}
            <ConfirmModal open={confirmState.open} title={confirmState.title} message={confirmState.message} onCancel={() => setConfirmState(prev => ({ ...prev, open: false }))} onConfirm={() => setConfirmState(prev => { const cb = prev && prev.onConfirm; if (typeof cb === 'function') cb(); return { ...prev, open: false }; })} />
        </AnimatePresence>
    );
};

export default PipelineDataModal;
