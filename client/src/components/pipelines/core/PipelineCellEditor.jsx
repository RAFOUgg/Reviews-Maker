import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Info, ChevronDown, ChevronUp } from 'lucide-react';
import LiquidCard from '../../ui/LiquidCard'
import LiquidButton from '../../ui/LiquidButton';

/**
 * PipelineCellEditor - Modal d'édition de cellule pipeline
 * 
 * Modal dynamique qui s'adapte au fieldSchema fourni
 * Rendu automatique des champs selon leur type
 * 
 * @param {boolean} isOpen - Visibilité modal
 * @param {function} onClose - Callback fermeture
 * @param {object} cellData - Données cellule à éditer
 * @param {number} cellIndex - Index cellule
 * @param {object} fieldSchema - Schéma champs (sections + fields)
 * @param {function} onSave - Callback sauvegarde
 * @param {function} onDelete - Callback suppression (optionnel)
 */
const PipelineCellEditor = ({
    isOpen,
    onClose,
    cellData = {},
    cellIndex,
    fieldSchema,
    onSave,
    onDelete,
    title = 'Éditer la cellule'
}) {
    const [editedData, setEditedData] = useState(cellData);
    const [collapsedSections, setCollapsedSections] = useState(
        fieldSchema?.sections?.reduce((acc, section) => {
            acc[section.id] = section.collapsed !== false; // Collapsed par défaut sauf si explicite false
            return acc;
        }, {}) || {}
    );

    useEffect(() => {
        if (isOpen) {
            setEditedData(cellData);
        }
    }, [isOpen, cellData]);

    const handleFieldChange = (fieldKey, value) => {
        // Navigation dans objet avec notation pointée (ex: "environment.temperature")
        const keys = fieldKey.split('.');
        const newData = { ...editedData };

        let current = newData;
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        setEditedData(newData);
    };

    const getFieldValue = (fieldKey) => {
        const keys = fieldKey.split('.');
        let value = editedData;

        for (const key of keys) {
            if (value === undefined || value === null) return '';
            value = value[key];
        }

        return value ?? '';
    };

    const toggleSection = (sectionId) => {
        setCollapsedSections(prev => ({
            ...prev,
            [sectionId]: !prev[sectionId]
        }));
    };

    const handleSave = () => {
        onSave?.({ ...editedData, index: cellIndex });
        onClose?.();
    };

    const handleDeleteCell = () => {
        if (window.confirm('Supprimer toutes les données de cette cellule ?')) {
            onDelete?.(cellIndex);
            onClose?.();
        }
    };

    const renderField = (field) => {
        const value = getFieldValue(field.key);

        switch (field.type) {
            case 'number':
                return (
                    <div key={field.key} className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            {field.label}
                            {field.unit && <span className="text-xs text-gray-500">({field.unit})</span>}
                            {field.tooltip && (
                                <Info className="w-3 h-3 text-gray-500" title={field.tooltip} />
                            )}
                        </label>
                        <input
                            type="number"
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value) || 0)}
                            min={field.min}
                            max={field.max}
                            step={field.step || 1}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg 
                                     focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 
                                     transition-all duration-200"
                        />
                    </div>
                );

            case 'text':
                return (
                    <div key={field.key} className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            {field.label}
                            {field.tooltip && (
                                <Info className="w-3 h-3 text-gray-500" title={field.tooltip} />
                            )}
                        </label>
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg 
                                     focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 
                                     transition-all duration-200"
                        />
                    </div>
                );

            case 'textarea':
                return (
                    <div key={field.key} className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            {field.label}
                            {field.tooltip && (
                                <Info className="w-3 h-3 text-gray-500" title={field.tooltip} />
                            )}
                        </label>
                        <textarea
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={field.rows || 4}
                            maxLength={field.maxLength}
                            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg 
                                     focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 
                                     transition-all duration-200 resize-vertical"
                        />
                    </div>
                );

            case 'select':
                return (
                    <div key={field.key} className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            {field.label}
                            {field.tooltip && (
                                <Info className="w-3 h-3 text-gray-500" title={field.tooltip} />
                            )}
                        </label>
                        <select
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg 
                                     focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 
                                     transition-all duration-200"
                        >
                            <option value="">{field.placeholder || 'Sélectionner...'}</option>
                            {field.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>
                );

            case 'multiselect':
                return (
                    <div key={field.key} className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            {field.label}
                            {field.maxItems && <span className="text-xs text-gray-500">(max {field.maxItems})</span>}
                            {field.tooltip && (
                                <Info className="w-3 h-3 text-gray-500" title={field.tooltip} />
                            )}
                        </label>
                        <select
                            multiple
                            value={Array.isArray(value) ? value : []}
                            onChange={(e) => {
                                const selected = Array.from(e.target.selectedOptions, opt => opt.value);
                                if (!field.maxItems || selected.length <= field.maxItems) {
                                    handleFieldChange(field.key, selected);
                                }
                            }}
                            className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-lg 
                                     focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 
                                     transition-all duration-200 min-h-[120px]"
                        >
                            {field.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                        {Array.isArray(value) && value.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                                {value.map(item => (
                                    <span
                                        key={item}
                                        className="px-2 py-1 bg-primary-500/20 text-primary-300 rounded-md text-xs"
                                    >
                                        {item}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'slider':
                return (
                    <div key={field.key} className="space-y-2">
                        <label className="flex items-center justify-between text-sm font-medium text-gray-300">
                            <span className="flex items-center gap-2">
                                {field.label}
                                {field.tooltip && (
                                    <Info className="w-3 h-3 text-gray-500" title={field.tooltip} />
                                )}
                            </span>
                            <span className="text-primary-400 font-semibold">
                                {value}{field.unit}
                            </span>
                        </label>
                        <input
                            type="range"
                            value={value}
                            onChange={(e) => handleFieldChange(field.key, parseFloat(e.target.value))}
                            min={field.min || 0}
                            max={field.max || 10}
                            step={field.step || 0.5}
                            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer 
                                     slider-thumb:appearance-none slider-thumb:w-4 slider-thumb:h-4 
                                     slider-thumb:rounded-full slider-thumb:bg-primary-500"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>{field.min || 0}</span>
                            <span>{field.max || 10}</span>
                        </div>
                    </div>
                );

            case 'toggle':
                return (
                    <div key={field.key} className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                            {field.label}
                            {field.tooltip && (
                                <Info className="w-3 h-3 text-gray-500" title={field.tooltip} />
                            )}
                        </label>
                        <button
                            type="button"
                            onClick={() => handleFieldChange(field.key, !value)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors
                                     ${value ? 'bg-primary-500' : 'bg-gray-600'}`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform
                                         ${value ? 'translate-x-6' : 'translate-x-1'}`}
                            />
                        </button>
                    </div>
                );

            default:
                return null;
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-3xl max-h-[85vh] overflow-hidden"
                >
                    <LiquidCard className="h-full flex flex-col">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-700/50">
                            <div>
                                <h3 className="text-xl font-bold text-white">{title}</h3>
                                <p className="text-sm text-gray-400 mt-1">
                                    Cellule #{cellIndex}
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-700/30 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Body - Scrollable */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {fieldSchema?.sections?.map(section => (
                                <div key={section.id} className="space-y-4">
                                    {/* Section Header */}
                                    <button
                                        onClick={() => toggleSection(section.id)}
                                        className="w-full flex items-center justify-between p-3 bg-gray-800/30 
                                                 rounded-lg hover:bg-gray-800/50 transition-all duration-200"
                                    >
                                        <div className="flex items-center gap-2">
                                            {section.icon && <span>{section.icon}</span>}
                                            <span className="font-semibold text-gray-200">{section.label}</span>
                                        </div>
                                        {collapsedSections[section.id] ? (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <ChevronUp className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>

                                    {/* Section Fields */}
                                    <AnimatePresence>
                                        {!collapsedSections[section.id] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="space-y-4 pl-4"
                                            >
                                                {section.fields?.map(field => renderField(field))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between p-6 border-t border-gray-700/50">
                            <div>
                                {onDelete && (
                                    <LiquidButton
                                        variant="danger"
                                        onClick={handleDeleteCell}
                                        className="flex items-center gap-2"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        Supprimer
                                    </LiquidButton>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <LiquidButton
                                    variant="secondary"
                                    onClick={onClose}
                                >
                                    Annuler
                                </LiquidButton>
                                <LiquidButton
                                    variant="primary"
                                    onClick={handleSave}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" />
                                    Sauvegarder
                                </LiquidButton>
                            </div>
                        </div>
                    </LiquidCard>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PipelineCellEditor;




