import React, { useState } from 'react';
import { X, CheckSquare, Square, AlertCircle, Copy } from 'lucide-react';

/**
 * Modal pour attribution en masse de données aux cellules sélectionnées
 * Permet de choisir quels champs copier depuis la cellule source
 */
const MassAssignModal = ({
    isOpen,
    onClose,
    sourceCellData,
    selectedCellsCount,
    sidebarSections = [],
    onApply
}) => {
    const [selectedFields, setSelectedFields] = useState({});
    const [selectAll, setSelectAll] = useState(false);

    if (!isOpen) return null;

    // Extraire tous les champs disponibles depuis sourceCellData
    const availableFields = [];
    if (sourceCellData && sourceCellData.data) {
        Object.entries(sourceCellData.data).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
                // Trouver le label du champ dans les sections
                let fieldLabel = key;
                let sectionLabel = '';

                for (const section of sidebarSections) {
                    const item = section.items?.find(i => i.id === key);
                    if (item) {
                        fieldLabel = item.label;
                        sectionLabel = section.label;
                        break;
                    }
                }

                availableFields.push({
                    key,
                    label: fieldLabel,
                    section: sectionLabel,
                    value: formatValue(value)
                });
            }
        });
    }

    const formatValue = (value) => {
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return String(value);
    };

    const handleToggleField = (key) => {
        setSelectedFields(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedFields({});
        } else {
            const allSelected = {};
            availableFields.forEach(field => {
                allSelected[field.key] = true;
            });
            setSelectedFields(allSelected);
        }
        setSelectAll(!selectAll);
    };

    const handleApply = () => {
        const fieldsToApply = Object.keys(selectedFields).filter(key => selectedFields[key]);

        if (fieldsToApply.length === 0) {
            alert('Veuillez sélectionner au moins un champ à copier');
            return;
        }

        // Confirmation
        const confirmed = window.confirm(
            `Appliquer ${fieldsToApply.length} champ(s) à ${selectedCellsCount} cellule(s) ?\n\nCette action écrasera les données existantes dans ces cellules.`
        );

        if (confirmed) {
            onApply(fieldsToApply);
            onClose();
        }
    };

    const selectedCount = Object.values(selectedFields).filter(v => v).length;

    // Grouper par section
    const fieldsBySection = {};
    availableFields.forEach(field => {
        if (!fieldsBySection[field.section]) {
            fieldsBySection[field.section] = [];
        }
        fieldsBySection[field.section].push(field);
    });

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md">
            <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-gray-200/50 dark:border-gray-700/50">
                {/* Header */}
                <div className="px-6 py-4 border-b bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Copy className="w-5 h-5" />
                                Attribution en masse
                            </h2>
                            <p className="text-sm text-purple-100 mt-1">
                                {selectedCellsCount} cellule{selectedCellsCount > 1 ? 's' : ''} sélectionnée{selectedCellsCount > 1 ? 's' : ''}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Info */}
                <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800">
                    <div className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>
                            Sélectionnez les champs à copier depuis la cellule source vers toutes les cellules sélectionnées.
                            Les données existantes seront écrasées.
                        </p>
                    </div>
                </div>

                {/* Select All */}
                <div className="px-6 py-3 border-b bg-gray-50 dark:bg-gray-800/50">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <div
                            onClick={handleSelectAll}
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectAll
                                ? 'bg-purple-500 border-purple-500'
                                : 'border-gray-300 dark:border-gray-600'
                                }`}
                        >
                            {selectAll && <CheckSquare className="w-4 h-4 text-white" />}
                        </div>
                        <span className="font-semibold text-gray-900 dark:text-white">
                            Tout sélectionner ({availableFields.length} champs)
                        </span>
                    </label>
                </div>

                {/* Fields list */}
                <div className="flex-1 overflow-y-auto p-6">
                    {availableFields.length === 0 ? (
                        <div className="text-center text-gray-500 py-12">
                            <p>Aucune donnée dans la cellule source</p>
                            <p className="text-sm mt-2">Veuillez d'abord remplir une cellule</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(fieldsBySection).map(([section, fields]) => (
                                <div key={section}>
                                    <h3 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 pb-2 border-b">
                                        {section || 'Autres'}
                                    </h3>
                                    <div className="space-y-2">
                                        {fields.map(field => (
                                            <label
                                                key={field.key}
                                                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                                            >
                                                <div
                                                    onClick={() => handleToggleField(field.key)}
                                                    className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedFields[field.key]
                                                        ? 'bg-purple-500 border-purple-500'
                                                        : 'border-gray-300 dark:border-gray-600'
                                                        }`}
                                                >
                                                    {selectedFields[field.key] && (
                                                        <CheckSquare className="w-4 h-4 text-white" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-gray-900 dark:text-white">
                                                        {field.label}
                                                    </div>
                                                    <div className="text-sm text-gray-600 dark:text-gray-400 truncate mt-0.5">
                                                        {field.value}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedCount} champ{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleApply}
                            disabled={selectedCount === 0}
                            className={`px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all ${selectedCount === 0
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600'
                                }`}
                        >
                            <Copy className="w-4 h-4" />
                            Appliquer à {selectedCellsCount} cellule{selectedCellsCount > 1 ? 's' : ''}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MassAssignModal;
