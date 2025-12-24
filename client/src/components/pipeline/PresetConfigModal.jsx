import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, BookmarkPlus, List } from 'lucide-react';

/**
 * PresetConfigModal - Modal complète pour créer un préréglage avec TOUTES les données
 * Conforme CDC: définit les valeurs de TOUTES les données dispo pour la pipeline
 */
const PresetConfigModal = ({
    isOpen,
    onClose,
    sidebarSections = [],
    onSavePreset,
    initialPreset = null
}) => {
    const [presetName, setPresetName] = useState('');
    const [presetDescription, setPresetDescription] = useState('');
    const [presetData, setPresetData] = useState({});
    const [activeSection, setActiveSection] = useState(0);

    useEffect(() => {
        if (initialPreset) {
            setPresetName(initialPreset.name || '');
            setPresetDescription(initialPreset.description || '');
            setPresetData(initialPreset.data || {});
        } else {
            setPresetName('');
            setPresetDescription('');
            setPresetData({});
        }
    }, [initialPreset, isOpen]);

    if (!isOpen) return null;

    // Obtenir tous les items de toutes les sections
    const getAllItems = () => {
        const items = [];
        sidebarSections.forEach(section => {
            if (section.items && Array.isArray(section.items)) {
                section.items.forEach(item => {
                    items.push({ ...item, sectionLabel: section.label, sectionId: section.id });
                });
            }
        });
        return items;
    };

    const allItems = getAllItems();

    const handleValueChange = (key, value) => {
        setPresetData(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSave = () => {
        if (!presetName.trim()) {
            alert('Veuillez saisir un nom pour le préréglage');
            return;
        }

        const preset = {
            id: initialPreset?.id || `preset_${Date.now()}`,
            name: presetName.trim(),
            description: presetDescription.trim(),
            data: presetData,
            dataCount: Object.keys(presetData).filter(k => presetData[k] !== '' && presetData[k] !== null && presetData[k] !== undefined).length,
            createdAt: initialPreset?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        onSavePreset(preset);
        onClose();
    };

    // Rendu d'un champ
    const renderField = (item) => {
        if (!item || !item.key) return null;

        const value = presetData[item.key] || '';
        const { key, label, icon, type = 'text' } = item;

        // SELECT
        if (type === 'select' && Array.isArray(item.options)) {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        {icon && <span className="mr-2">{icon}</span>}
                        {label}
                    </label>
                    <select
                        value={value}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                    >
                        <option value="">-- Non défini --</option>
                        {item.options.map((opt, idx) => (
                            <option key={`${key}-${idx}-${opt}`} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            );
        }

        // NUMBER
        if (type === 'number') {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        {icon && <span className="mr-2">{icon}</span>}
                        {label}
                    </label>
                    <input
                        type="number"
                        value={value || ''}
                        onChange={(e) => handleValueChange(key, e.target.value === '' ? '' : parseFloat(e.target.value))}
                        step={item.step || '0.1'}
                        min={item.min}
                        max={item.max}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                        placeholder={item.placeholder || ''}
                    />
                </div>
            );
        }

        // CHECKBOX
        if (type === 'checkbox') {
            return (
                <div key={key} className="flex items-center gap-3">
                    <input
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(e) => handleValueChange(key, e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300"
                    />
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {icon && <span className="mr-2">{icon}</span>}
                        {label}
                    </label>
                </div>
            );
        }

        // TEXTAREA
        if (type === 'textarea') {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        {icon && <span className="mr-2">{icon}</span>}
                        {label}
                    </label>
                    <textarea
                        value={value || ''}
                        onChange={(e) => handleValueChange(key, e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100 resize-none"
                        placeholder={item.placeholder || ''}
                    />
                </div>
            );
        }

        // TEXT
        return (
            <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    {icon && <span className="mr-2">{icon}</span>}
                    {label}
                </label>
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => handleValueChange(key, e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-gray-100"
                    placeholder={item.placeholder || ''}
                />
            </div>
        );
    };

    // Grouper par section
    const itemsBySection = {};
    allItems.forEach(item => {
        const sectionId = item.sectionId || 'other';
        if (!itemsBySection[sectionId]) {
            itemsBySection[sectionId] = {
                label: item.sectionLabel || 'Autres',
                items: []
            };
        }
        itemsBySection[sectionId].items.push(item);
    });

    const sections = Object.values(itemsBySection);
    const currentSection = sections[activeSection] || { label: '', items: [] };
    const definedCount = Object.keys(presetData).filter(k => presetData[k] !== '' && presetData[k] !== null && presetData[k] !== undefined).length;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center backdrop-blur-md p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.95, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-200/50 dark:border-gray-700/50"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r dark:from-gray-800 dark:to-gray-850">
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BookmarkPlus className="w-6 h-6" />
                                {initialPreset ? 'Modifier le préréglage' : 'Nouveau préréglage'}
                            </h2>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                Définissez les valeurs pour toutes les données de la pipeline
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500" />
                        </button>
                    </div>

                    {/* Info préréglage */}
                    <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Nom du préréglage *
                            </label>
                            <input
                                type="text"
                                value={presetName}
                                onChange={(e) => setPresetName(e.target.value)}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100"
                                placeholder="Ex: Configuration optimisée"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Description (optionnel)
                            </label>
                            <textarea
                                value={presetDescription}
                                onChange={(e) => setPresetDescription(e.target.value)}
                                rows={2}
                                className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 resize-none"
                                placeholder="Décrivez brièvement ce préréglage..."
                            />
                        </div>
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">
                                Données définies: <strong>{definedCount}</strong> / {allItems.length}
                            </span>
                            <span className="text-gray-600 dark:text-gray-400">
                                Progression: <strong>{Math.round((definedCount / allItems.length) * 100)}%</strong>
                            </span>
                        </div>
                    </div>

                    {/* Navigation sections */}
                    <div className="flex overflow-x-auto bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                        {sections.map((section, idx) => {
                            const sectionItemCount = section.items.filter(item =>
                                presetData[item.key] !== '' && presetData[item.key] !== null && presetData[item.key] !== undefined
                            ).length;

                            return (
                                <button
                                    key={idx}
                                    onClick={() => setActiveSection(idx)}
                                    className={`flex-shrink-0 px-6 py-3 text-sm font-medium transition-colors border-b-2 ${activeSection === idx ? ' dark: bg-white dark:bg-gray-900' : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}`}
                                >
                                    {section.label}
                                    <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded">
                                        {sectionItemCount}/{section.items.length}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Contenu section active */}
                    <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4">
                        {currentSection.items.length > 0 ? (
                            currentSection.items.map(item => renderField(item))
                        ) : (
                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                Aucun champ disponible dans cette section
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            Annuler
                        </button>

                        <div className="flex items-center gap-3">
                            {activeSection > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setActiveSection(prev => Math.max(0, prev - 1))}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    ← Précédent
                                </button>
                            )}

                            {activeSection < sections.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={() => setActiveSection(prev => Math.min(sections.length - 1, prev + 1))}
                                    className="px-4 py-2 hover: text-white rounded-lg transition-colors"
                                >
                                    Suivant →
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleSave}
                                    disabled={!presetName.trim()}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Enregistrer le préréglage
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PresetConfigModal;
