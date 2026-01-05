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
    pipelineType = 'culture' // Type de pipeline pour localStorage
    , onFieldDelete,
    onDragOver = null,  // Callback for drag over
    onDrop = null       // Callback for drop
}) => {
    const [formData, setFormData] = useState({});
    const [activeTab, setActiveTab] = useState('form'); // 'form' ou 'presets'
    const [fieldPresets, setFieldPresets] = useState([]); // Préréglages pour ce champ spécifique
    const [newPresetName, setNewPresetName] = useState('');
    const [confirmState, setConfirmState] = useState({ open: false, title: '', message: '', onConfirm: null });

    useEffect(() => {
        // Initialiser avec les données existantes
        const initialData = { ...cellData };
        delete initialData.timestamp;
        delete initialData._meta;
        setFormData(initialData);
        console.log('🟢 PipelineDataModal isOpen:', isOpen, 'droppedItem:', droppedItem, 'cellData:', cellData);

        // Charger les préréglages pour ce champ (si droppedItem)
        if (droppedItem && droppedItem.content && droppedItem.content.key) {
            const fieldKey = droppedItem.content.key;
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
            // Afficher tous les items qui ont des données
            const allItems = getAllItems();
            return allItems.filter(item => formData[item.key] !== undefined);
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

    const FieldWrapper = ({ item, children }) => (
        <div className="relative">
            {children}
            <button
                type="button"
                title="Supprimer ce champ"
                onClick={() => {
                    if (!item || !item.key) return;
                    setConfirmState({
                        open: true,
                        title: 'Effacer le champ',
                        message: 'Effacer ce champ de la cellule ?',
                        onConfirm: () => {
                            if (onFieldDelete) {
                                onFieldDelete(timestamp, item.key);
                            } else {
                                handleChange(item.key, null);
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

    // Sauvegarder un nouveau préréglage
    const handleSavePreset = () => {
        if (!newPresetName.trim()) {
            alert('Veuillez saisir un nom pour le préréglage');
            return;
        }

        if (!droppedItem || !droppedItem.content || !droppedItem.content.key) {
            alert('Impossible de sauvegarder un préréglage sans champ défini');
            return;
        }

        const fieldKey = droppedItem.content.key;
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
            setActiveTab('form'); // Retour au formulaire
        }
    };

    // Supprimer un préréglage
    const handleDeletePreset = (presetId) => {
        if (!droppedItem || !droppedItem.content) return;

        const fieldKey = droppedItem.content.key;
        const updatedPresets = fieldPresets.filter(p => p.id !== presetId);
        setFieldPresets(updatedPresets);
        localStorage.setItem(`${pipelineType}_field_${fieldKey}_presets`, JSON.stringify(updatedPresets));
    };

    // Rendu du champ selon le type
    const renderField = (item) => {
        if (!item || !item.key) return null;

        const value = formData[item.key] || '';
        const { key, label, icon, type = 'text' } = item;

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
                <FieldWrapper item={item} key={key}>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            {icon && <span className="mr-2">{icon}</span>}
                            {label}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleChange(key, e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
                            required={droppedItem !== null}
                        >
                            <option value="">Sélectionner...</option>
                            {item.options.map((opt, idx) => {
                                const val = typeof opt === 'string' ? opt : (opt.value ?? opt);
                                const labelOpt = typeof opt === 'string' ? opt : (opt.label ?? opt.value ?? opt);
                                return <option key={`${key}-${idx}-${val}`} value={val}>{labelOpt}</option>;
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
            const selected = Array.isArray(formData[key]) ? formData[key] : [];
            return (
                <FieldWrapper item={item} key={key}>
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
                                    <label key={`${key}-ms-${idx}`} className="flex items-center gap-2 p-2 border rounded-lg">
                                        <input
                                            type="checkbox"
                                            checked={checked}
                                            onChange={(e) => {
                                                const next = e.target.checked ? [...selected, val] : selected.filter(s => s !== val);
                                                handleChange(key, next);
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
                                                    handleChange(`${key}__percentages`, pctObj);
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
                <FieldWrapper item={item} key={key}>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            {icon && <span className="mr-2">{icon}</span>}
                            {label}
                        </label>
                        <input
                            type="date"
                            value={value || ''}
                            onChange={(e) => handleChange(key, e.target.value)}
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
                <FieldWrapper item={item} key={key}>
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
                                handleChange(key, val);
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
                <FieldWrapper item={item} key={key}>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={Boolean(value)}
                            onChange={(e) => handleChange(key, e.target.checked)}
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
                <FieldWrapper item={item} key={key}>
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                            {icon && <span className="mr-2">{icon}</span>}
                            {label}
                        </label>
                        <textarea
                            value={textValue}
                            onChange={(e) => handleChange(key, e.target.value)}
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
            <FieldWrapper item={item} key={key}>
                <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        {icon && <span className="mr-2">{icon}</span>}
                        {label}
                    </label>
                    <input
                        type="text"
                        value={value || ''}
                        onChange={(e) => handleChange(key, e.target.value)}
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

                        {/* Tabs (si droppedItem présent) */}
                        {droppedItem && (
                            <div className="flex border-b border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={() => setActiveTab('form')}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'form' ? 'border-b-2 dark:' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                >
                                    📝 Formulaire
                                </button>
                                <button
                                    onClick={() => setActiveTab('presets')}
                                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'presets' ? 'border-b-2 dark:' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                >
                                    <Bookmark className="w-4 h-4 inline mr-1" />
                                    Préréglages ({fieldPresets.length})
                                </button>
                            </div>
                        )}

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
                        {activeTab === 'form' && (
                            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                                {itemsToDisplay.length === 0 ? (
                                    <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                        <p className="text-lg mb-2">Aucun champ à afficher</p>
                                        <p className="text-sm">Glissez-déposez des éléments depuis le panneau latéral</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="bg-red-100/20 border border-red-300/50 p-3 rounded-lg mb-4">
                                            <p className="text-xs text-red-300">
                                                🔴 DEBUG: itemsToDisplay ({itemsToDisplay.length}): {JSON.stringify(itemsToDisplay.slice(0, 2), null, 2)}
                                            </p>
                                        </div>
                                        {itemsToDisplay.map((item, idx) => {
                                            const rendered = renderField(item);
                                            if (!rendered) {
                                                return <div key={idx} className="p-3 bg-yellow-900/30 border border-yellow-600 text-yellow-200 text-xs rounded">
                                                    ⚠️ Item {idx} ({item?.key}) n'a pas d'input compatible (type={item?.type})
                                                </div>;
                                            }
                                            return <div key={item?.key || idx}>{rendered}</div>;
                                        })}
                                    </>
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
                                {/* Section: Sauvegarder nouveau préréglage */}
                                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                                    <h3 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                                        <BookmarkPlus className="w-4 h-4" />
                                        Sauvegarder un nouveau préréglage
                                    </h3>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newPresetName}
                                            onChange={(e) => setNewPresetName(e.target.value)}
                                            placeholder="Nom du préréglage (ex: Config Standard)"
                                            className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm"
                                        />
                                        <button
                                            onClick={handleSavePreset}
                                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2"
                                        >
                                            <Save className="w-4 h-4" />
                                            Enregistrer
                                        </button>
                                    </div>
                                    <p className="text-xs text-green-700 dark:text-green-400 mt-2">
                                        Saisir une valeur dans le formulaire, puis donner un nom à votre configuration
                                    </p>
                                </div>

                                {/* Liste des préréglages */}
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                                        Préréglages disponibles
                                    </h3>
                                    {fieldPresets.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <Bookmark className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Aucun préréglage sauvegardé</p>
                                            <p className="text-xs mt-1">Créez-en un pour gagner du temps !</p>
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
                                                                onClick={() => handleLoadPreset(preset)}
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

                            {activeTab === 'form' && (
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
