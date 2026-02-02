/**
 * MassAssignModal Component
 * Modal pour attribution en masse de données aux cellules sélectionnées
 * Permet de choisir quels champs copier depuis la cellule source
 * Liquid Glass UI Design System
 */

import React, { useState } from 'react';
import { LiquidModal, LiquidButton, LiquidCard, LiquidChip } from '@/components/ui/LiquidUI';
import { X, CheckSquare, Square, AlertCircle, Copy, Check } from 'lucide-react';

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

    const formatValue = (value) => {
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return String(value);
    };

    // Extraire tous les champs disponibles depuis sourceCellData
    const availableFields = [];
    if (sourceCellData && sourceCellData.data) {
        Object.entries(sourceCellData.data).forEach(([key, value]) => {
            if (value !== '' && value !== null && value !== undefined) {
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
        <LiquidModal
            isOpen={true}
            onClose={onClose}
            title={
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-500/30">
                        <Copy className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <span className="text-lg font-bold text-white">Attribution en masse</span>
                        <p className="text-sm text-white/60">
                            {selectedCellsCount} cellule{selectedCellsCount > 1 ? 's' : ''} sélectionnée{selectedCellsCount > 1 ? 's' : ''}
                        </p>
                    </div>
                </div>
            }
            size="lg"
            glowColor="blue"
            footer={
                <div className="flex items-center justify-between w-full">
                    <span className="text-sm text-white/60">
                        {selectedCount} champ{selectedCount > 1 ? 's' : ''} sélectionné{selectedCount > 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-3">
                        <LiquidButton variant="ghost" onClick={onClose}>
                            Annuler
                        </LiquidButton>
                        <LiquidButton
                            variant="primary"
                            onClick={handleApply}
                            disabled={selectedCount === 0}
                            icon={Copy}
                        >
                            Appliquer à {selectedCellsCount} cellule{selectedCellsCount > 1 ? 's' : ''}
                        </LiquidButton>
                    </div>
                </div>
            }
        >
            <div className="space-y-4">
                {/* Info */}
                <LiquidCard className="p-3" style={{
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderColor: 'rgba(59, 130, 246, 0.3)'
                }}>
                    <div className="flex items-start gap-2 text-sm text-blue-300">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <p>
                            Sélectionnez les champs à copier depuis la cellule source vers toutes les cellules sélectionnées.
                            Les données existantes seront écrasées.
                        </p>
                    </div>
                </LiquidCard>

                {/* Select All */}
                <label
                    className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/8 transition-colors"
                    onClick={handleSelectAll}
                >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${selectAll
                            ? 'bg-blue-500/30 border-blue-500'
                            : 'border-white/30 bg-white/5'
                        }`}>
                        {selectAll && <Check className="w-3 h-3 text-blue-400" />}
                    </div>
                    <span className="font-semibold text-white">
                        Tout sélectionner ({availableFields.length} champs)
                    </span>
                </label>

                {/* Fields list */}
                <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2">
                    {availableFields.length === 0 ? (
                        <div className="text-center text-white/50 py-12">
                            <Copy className="w-10 h-10 mx-auto mb-3 opacity-50" />
                            <p>Aucune donnée dans la cellule source</p>
                            <p className="text-sm mt-2">Veuillez d'abord remplir une cellule</p>
                        </div>
                    ) : (
                        Object.entries(fieldsBySection).map(([section, fields]) => (
                            <div key={section}>
                                <h3 className="text-sm font-bold text-white/60 mb-3 pb-2 border-b border-white/10">
                                    {section || 'Autres'}
                                </h3>
                                <div className="space-y-2">
                                    {fields.map(field => (
                                        <label
                                            key={field.key}
                                            className="flex items-start gap-3 p-3 rounded-xl border border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                                            onClick={() => handleToggleField(field.key)}
                                        >
                                            <div className={`w-5 h-5 mt-0.5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all ${selectedFields[field.key]
                                                    ? 'bg-blue-500/30 border-blue-500'
                                                    : 'border-white/30 bg-white/5'
                                                }`}>
                                                {selectedFields[field.key] && (
                                                    <Check className="w-3 h-3 text-blue-400" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-white">
                                                    {field.label}
                                                </div>
                                                <div className="text-sm text-white/50 truncate mt-0.5">
                                                    {field.value}
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </LiquidModal>
    );
};

export default MassAssignModal;


