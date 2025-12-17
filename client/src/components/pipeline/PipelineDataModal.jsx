import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import { LiquidButton } from '../liquid';
import { CULTURE_VALUES } from '../../data/formValues';

/**
 * PipelineDataModal - Modal pour saisir les valeurs lors d'un drop
 * 
 * Comportement CDC:
 * - Si droppedItem existe: affiche uniquement le champ correspondant
 * - Sinon: affiche tous les champs assignés à cette cellule
 */

export default function PipelineDataModal({
    isOpen,
    onClose,
    cellData = {},
    sidebarSections = [],
    onSave,
    timestamp,
    intervalLabel = '',
    droppedItem = null
}) {
    const [formData, setFormData] = useState({});

    useEffect(() => {
        // Initialiser avec les données existantes
        const initialData = { ...cellData };
        delete initialData.timestamp;
        delete initialData._meta;
        setFormData(initialData);
    }, [cellData, timestamp]);

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

    // Rendu du champ selon le type
    const renderField = (item) => {
        const value = formData[item.key] || '';
        const { key, label, icon, type = 'text' } = item;

        // SELECT avec options
        if (type === 'select' && item.options) {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        {icon} {label}
                    </label>
                    <select
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                        required={droppedItem !== null} // Obligatoire si c'est un drop
                    >
                        <option value="">Sélectionner...</option>
                        {item.options.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
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
                        {icon} {label}
                    </label>
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => handleChange(key, parseFloat(e.target.value) || 0)}
                        step={item.step || '0.1'}
                        min={item.min}
                        max={item.max}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                        placeholder={item.placeholder || `Ex: ${item.defaultValue || ''}`}
                        required={droppedItem !== null}
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
                        checked={value === true || value === 'true'}
                        onChange={(e) => handleChange(key, e.target.checked)}
                        className="w-5 h-5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-2 focus:ring-blue-500"
                    />
                    <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {icon} {label}
                    </label>
                </div>
            );
        }

        // TEXTAREA
        if (type === 'textarea') {
            return (
                <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                        {icon} {label}
                    </label>
                    <textarea
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        rows={3}
                        maxLength={item.maxLength || 500}
                        className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder={item.placeholder}
                    />
                    {item.maxLength && (
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {value.length || 0} / {item.maxLength} caractères
                        </p>
                    )}
                </div>
            );
        }

        // TEXT par défaut
        return (
            <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-900 dark:text-gray-100">
                    {icon} {label}
                </label>
                <input
                    type="text"
                    value={value}
                    onChange={(e) => handleChange(key, e.target.value)}
                    className="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                    placeholder={item.placeholder}
                    required={droppedItem !== null}
                />
            </div>
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
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-gray-200 dark:border-gray-700"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                    {droppedItem ? '📝 Saisir les valeurs' : '✏️ Modifier les données'}
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                    {intervalLabel} • {droppedItem ? 'Nouveau champ' : `${itemsToDisplay.length} champ(s)`}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                            </button>
                        </div>

                        {/* Contenu */}
                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {itemsToDisplay.length === 0 ? (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    <p className="text-lg mb-2">Aucun champ à afficher</p>
                                    <p className="text-sm">Glissez-déposez des éléments depuis le panneau latéral</p>
                                </div>
                            ) : (
                                itemsToDisplay.map(item => renderField(item))
                            )}

                            {droppedItem && (
                                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                    <p className="text-sm text-blue-800 dark:text-blue-300">
                                        💡 <strong>Conformité CDC:</strong> Vous devez renseigner une valeur avant d'ajouter ce champ à la cellule.
                                    </p>
                                </div>
                            )}
                        </form>

                        {/* Footer */}
                        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-gray-700">
                            <LiquidButton
                                variant="ghost"
                                onClick={onClose}
                                type="button"
                            >
                                Annuler
                            </LiquidButton>

                            <LiquidButton
                                onClick={handleSubmit}
                                disabled={itemsToDisplay.length === 0}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer
                            </LiquidButton>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
