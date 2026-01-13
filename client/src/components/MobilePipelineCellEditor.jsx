import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { useResponsiveLayout } from '../hooks/useResponsiveLayout';

/**
 * MobilePipelineCellEditor - Éditeur de cellule pipeline optimisé mobile
 * 
 * Remplace le modal complexe par une interface progressive:
 * 1. Affichage compact des données actuelles
 * 2. Boutons de raccourci pour ajouter des types de données courants
 * 3. Accès aux formulaires détaillés en cliquant
 * 4. Menu contextuel pour options avancées
 */

const MobilePipelineCellEditor = ({
    isOpen,
    onClose,
    cellIndex,
    cellLabel,
    cellData = {},
    onSave,
    onDelete,
    type = 'culture', // culture, curing, separation, purification
    readonly = false,
    config = {},
}) => {
    const { isMobile } = useResponsiveLayout();
    const [selectedField, setSelectedField] = useState(null);
    const [isEditingField, setIsEditingField] = useState(false);
    const [fieldValue, setFieldValue] = useState('');
    const [expandedCategory, setExpandedCategory] = useState(null);

    // Données par type
    const dataTemplate = {
        culture: {
            'Environnement': ['temperature', 'humidity', 'co2', 'light'],
            'Irrigation': ['frequency', 'volume', 'ph', 'ec'],
            'Nutrition': ['fertilizer_type', 'dosage', 'brand'],
            'Lumière': ['lamp_type', 'ppfd', 'kelvin', 'distance'],
            'Notes': ['observations', 'issues', 'actions'],
        },
        curing: {
            'Température': ['temperature', 'humidity', 'packaging'],
            'Observations': ['color', 'smell', 'texture', 'notes'],
        },
        separation: {
            'Processus': ['method', 'temperature', 'mesh_size', 'duration'],
            'Résultats': ['yield_percentage', 'purity', 'quality_score'],
        },
        purification: {
            'Méthode': ['method_type', 'temperature', 'solvent', 'duration'],
            'Résultats': ['purity_score', 'recovery_percentage', 'color'],
        },
    };

    const template = dataTemplate[type] || dataTemplate.culture;

    // Ajouter un champ
    const handleAddField = useCallback((fieldName) => {
        setSelectedField(fieldName);
        setFieldValue(cellData[fieldName] || '');
        setIsEditingField(true);
    }, [cellData]);

    // Sauvegarder un champ
    const handleSaveField = useCallback(() => {
        if (selectedField && fieldValue !== undefined) {
            const newData = {
                ...cellData,
                [selectedField]: fieldValue,
                timestamp: new Date().toISOString(),
            };
            onSave(newData);
            setIsEditingField(false);
            setSelectedField(null);
        }
    }, [selectedField, fieldValue, cellData, onSave]);

    // Supprimer un champ
    const handleDeleteField = useCallback((fieldName) => {
        const newData = { ...cellData };
        delete newData[fieldName];
        onSave(newData);
    }, [cellData, onSave]);

    if (!isOpen) return null;

    const hasData = Object.keys(cellData).filter(k => k !== 'timestamp').length > 0;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: '100%', opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className={`
                        w-full sm:w-full sm:max-w-md bg-slate-800 rounded-t-2xl sm:rounded-xl
                        border border-slate-700 overflow-hidden
                        ${isMobile ? 'max-h-[85vh]' : 'max-h-[90vh]'}
                        flex flex-col
                    `}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between gap-2 px-4 py-3 bg-slate-800/80 border-b border-slate-700/50 flex-shrink-0">
                        <div className="flex-1">
                            <h3 className="text-base sm:text-lg font-semibold text-white">
                                {cellLabel}
                            </h3>
                            <p className="text-xs text-slate-400">
                                {hasData ? `${Object.keys(cellData).length - 1} donnée(s)` : 'Vide'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-white transition"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content - Scrollable */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4 space-y-4">
                            {/* Données actuelles */}
                            {hasData && (
                                <div className="p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
                                    <h4 className="text-xs font-semibold text-slate-300 mb-2">Données actuelles:</h4>
                                    <div className="space-y-2">
                                        {Object.entries(cellData).map(([key, value]) => (
                                            key !== 'timestamp' && (
                                                <div
                                                    key={key}
                                                    className="flex items-center justify-between gap-2 p-2 bg-slate-800/50 rounded text-xs"
                                                >
                                                    <div>
                                                        <span className="font-medium text-slate-300">{key}:</span>
                                                        <span className="text-slate-400 ml-1">{String(value).slice(0, 20)}</span>
                                                    </div>
                                                    {!readonly && (
                                                        <button
                                                            onClick={() => handleDeleteField(key)}
                                                            className="p-1 text-red-400 hover:text-red-300 transition"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Catégories de champs rapides */}
                            {!readonly && (
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold text-slate-300 px-1">Ajouter des données:</p>
                                    {Object.entries(template).map(([category, fields]) => (
                                        <div key={category} className="space-y-2">
                                            <button
                                                onClick={() => setExpandedCategory(
                                                    expandedCategory === category ? null : category
                                                )}
                                                className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700/70 rounded-lg transition text-sm text-left"
                                            >
                                                <span className="text-slate-200">{category}</span>
                                                <motion.svg
                                                    animate={{ rotate: expandedCategory === category ? 180 : 0 }}
                                                    transition={{ duration: 0.2 }}
                                                    className="w-4 h-4 text-slate-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                </motion.svg>
                                            </button>

                                            <AnimatePresence>
                                                {expandedCategory === category && (
                                                    <motion.div
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                        className="pl-3 space-y-1.5"
                                                    >
                                                        {fields.map((field) => (
                                                            <button
                                                                key={field}
                                                                onClick={() => handleAddField(field)}
                                                                disabled={cellData[field] !== undefined}
                                                                className={`
                                                                    w-full text-left px-3 py-2 text-xs rounded-lg transition
                                                                    ${cellData[field] !== undefined
                                                                        ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed'
                                                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                                                    }
                                                                `}
                                                            >
                                                                <Plus size={12} className="inline mr-1" />
                                                                {field.replace(/_/g, ' ')}
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Editor de champ (en bas) */}
                    {isEditingField && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="border-t border-slate-700/50 bg-slate-800/80 p-3 space-y-3 flex-shrink-0"
                        >
                            <div>
                                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                                    {selectedField?.replace(/_/g, ' ')}
                                </label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={fieldValue}
                                    onChange={(e) => setFieldValue(e.target.value)}
                                    placeholder="Valeur..."
                                    className="w-full px-3 py-2 text-sm bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500"
                                />
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveField}
                                    className="flex-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition"
                                >
                                    Sauvegarder
                                </button>
                                <button
                                    onClick={() => setIsEditingField(false)}
                                    className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition"
                                >
                                    Annuler
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* Actions footer */}
                    {!isEditingField && !readonly && (
                        <div className="border-t border-slate-700/50 bg-slate-800/80 px-4 py-3 flex gap-2 flex-shrink-0">
                            {hasData && (
                                <button
                                    onClick={onDelete}
                                    className="flex-1 px-3 py-2 bg-red-600/20 hover:bg-red-600/40 text-red-400 text-sm rounded-lg transition"
                                >
                                    Supprimer tout
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="flex-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition"
                            >
                                Fermer
                            </button>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default MobilePipelineCellEditor;

