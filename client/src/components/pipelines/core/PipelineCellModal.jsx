/**
 * PipelineCellModal - Modal d'édition d'une cellule de pipeline
 * Liquid Glass UI Design System
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Copy } from 'lucide-react';
import { LiquidModal, LiquidButton, LiquidInput, LiquidSelect, LiquidTextarea } from '@/components/ui/LiquidUI';
import { CULTURE_VALUES } from '../../../data/formValues';
import { resolveIntervalKey } from '../../../config/intervalTypes';

const PipelineCellModal = ({
    isOpen,
    onClose,
    cellIndex,
    cellData = {},
    config,
    contentSchema = [],
    onSave,
    pipelineType = 'culture',
    droppedItem = null
}) => {
    const [localData, setLocalData] = useState({ ...cellData });
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        setLocalData({ ...cellData });
    }, [cellData, cellIndex]);

    const getCellLabel = () => {
        if (!config) return `Étape ${cellIndex + 1}`;

        if (config.intervalType === 'phases' || resolveIntervalKey(config.type) === 'phases' || config.type === 'phase') {
            const phase = config.customPhases?.[cellIndex] || config.phases?.[cellIndex];
            return `${phase?.icon || '📍'} ${phase?.name}` || `Phase ${cellIndex + 1}`;
        }

        if ((config.intervalType === 'dates' || config.type === 'date') && (config.startDate || config.start)) {
            const start = new Date(config.startDate || config.start);
            const cellDate = new Date(start);
            cellDate.setDate(cellDate.getDate() + cellIndex);
            return `Jour ${cellIndex + 1} (${cellDate.toLocaleDateString('fr-FR')})`;
        }

        if (config.intervalType === 'weeks' || config.type === 'semaine') {
            return `Semaine ${cellIndex + 1}`;
        }

        if (config.type === 'jour') {
            return `Jour ${cellIndex + 1}`;
        }

        return `Étape ${cellIndex + 1}`;
    };

    const handleAddContent = (content) => {
        const newContents = [...(localData.contents || [])];
        const exists = newContents.find(c => c.type === content.type);

        if (!exists) {
            newContents.push({
                type: content.type,
                category: content.category,
                label: content.label,
                data: {}
            });
            setLocalData({ ...localData, contents: newContents });
            setActiveTab(newContents.length - 1);
        } else {
            const index = newContents.findIndex(c => c.type === content.type);
            setActiveTab(index);
        }
    };

    const handleUpdateContent = (contentIndex, field, value) => {
        const newContents = [...(localData.contents || [])];
        if (!newContents[contentIndex].data) {
            newContents[contentIndex].data = {};
        }
        newContents[contentIndex].data[field] = value;
        setLocalData({ ...localData, contents: newContents });
    };

    const handleRemoveContent = (contentIndex) => {
        const newContents = localData.contents.filter((_, idx) => idx !== contentIndex);
        setLocalData({ ...localData, contents: newContents });
        if (activeTab >= newContents.length) {
            setActiveTab(Math.max(0, newContents.length - 1));
        }
    };

    const handleSave = () => {
        onSave(cellIndex, localData);
    };

    const renderContentForm = (content, contentIndex) => {
        const data = content.data || {};

        // Formulaire environnement
        if (content.category === 'environment') {
            return (
                <div className="space-y-4">
                    {content.type === 'temperature' && (
                        <LiquidInput
                            label="🌡️ Température (°C)"
                            type="number"
                            value={data.value || ''}
                            onChange={(e) => handleUpdateContent(contentIndex, 'value', parseFloat(e.target.value))}
                            step="0.1"
                            placeholder="Ex: 24.5"
                        />
                    )}

                    {content.type === 'humidity' && (
                        <LiquidInput
                            label="💧 Humidité relative (%)"
                            type="number"
                            value={data.value || ''}
                            onChange={(e) => handleUpdateContent(contentIndex, 'value', parseFloat(e.target.value))}
                            min="0"
                            max="100"
                            placeholder="Ex: 65"
                        />
                    )}

                    {content.type === 'co2' && (
                        <LiquidInput
                            label="🫧 CO2 (ppm)"
                            type="number"
                            value={data.value || ''}
                            onChange={(e) => handleUpdateContent(contentIndex, 'value', parseInt(e.target.value))}
                            min="0"
                            placeholder="Ex: 1200"
                        />
                    )}

                    {content.type === 'ventilation' && (
                        <div className="space-y-3">
                            <LiquidSelect
                                label="🌀 Type de ventilation"
                                value={data.type || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'type', e.target.value)}
                                options={[
                                    { value: '', label: 'Sélectionner...' },
                                    ...(CULTURE_VALUES.typeVentilation || ['Extracteur', 'Brasseur', 'Mixte']).map(opt => ({ value: opt, label: opt }))
                                ]}
                            />
                            <LiquidInput
                                value={data.frequency || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'frequency', e.target.value)}
                                placeholder="Fréquence (ex: 24/7, 15min/h)"
                            />
                        </div>
                    )}
                </div>
            );
        }

        // Formulaire lumière
        if (content.category === 'light') {
            return (
                <div className="space-y-4">
                    {content.type === 'lightType' && (
                        <LiquidSelect
                            label="💡 Type de lampe"
                            value={data.value || ''}
                            onChange={(e) => handleUpdateContent(contentIndex, 'value', e.target.value)}
                            options={[
                                { value: '', label: 'Sélectionner...' },
                                ...['LED', 'HPS', 'CFL', 'CMH', 'Naturel', 'Mixte'].map(opt => ({ value: opt, label: opt }))
                            ]}
                        />
                    )}

                    {content.type === 'power' && (
                        <LiquidInput
                            label="⚡ Puissance totale (W)"
                            type="number"
                            value={data.value || ''}
                            onChange={(e) => handleUpdateContent(contentIndex, 'value', parseInt(e.target.value))}
                            min="0"
                            placeholder="Ex: 600"
                        />
                    )}

                    {content.type === 'photoperiod' && (
                        <LiquidInput
                            label="⏱️ Durée d'éclairage (h/jour)"
                            type="number"
                            value={data.value || ''}
                            onChange={(e) => handleUpdateContent(contentIndex, 'value', parseFloat(e.target.value))}
                            min="0"
                            max="24"
                            step="0.5"
                            placeholder="Ex: 18"
                        />
                    )}
                </div>
            );
        }

        // Formulaire irrigation
        if (content.category === 'irrigation') {
            return (
                <div className="space-y-4">
                    {content.type === 'irrigationType' && (
                        <LiquidSelect
                            label="💧 Système d'irrigation"
                            value={data.value || ''}
                            onChange={(e) => handleUpdateContent(contentIndex, 'value', e.target.value)}
                            options={[
                                { value: '', label: 'Sélectionner...' },
                                ...['Manuel', 'Goutte à goutte', 'Inondation', 'Aspersion', 'Automatique'].map(opt => ({ value: opt, label: opt }))
                            ]}
                        />
                    )}

                    {content.type === 'waterVolume' && (
                        <LiquidInput
                            label="🪣 Volume d'eau par arrosage (L)"
                            type="number"
                            value={data.value || ''}
                            onChange={(e) => handleUpdateContent(contentIndex, 'value', parseFloat(e.target.value))}
                            min="0"
                            step="0.1"
                            placeholder="Ex: 2.5"
                        />
                    )}
                </div>
            );
        }

        // Formulaire générique
        return (
            <div className="space-y-4">
                <LiquidInput
                    label={`${content.icon || '📍'} ${content.label}`}
                    value={data.value || ''}
                    onChange={(e) => handleUpdateContent(contentIndex, 'value', e.target.value)}
                    placeholder="Saisir une valeur..."
                />
                <LiquidTextarea
                    label="📝 Notes"
                    value={data.notes || ''}
                    onChange={(e) => handleUpdateContent(contentIndex, 'notes', e.target.value)}
                    rows={3}
                    placeholder="Notes ou observations..."
                />
            </div>
        );
    };

    const contents = localData.contents || [];

    return (
        <LiquidModal
            isOpen={isOpen}
            onClose={onClose}
            title={`📝 Édition: ${getCellLabel()}`}
            subtitle={`${contents.length} contenu(s) assigné(s)`}
            size="lg"
            glowColor="green"
            footer={
                <div className="flex items-center justify-between w-full">
                    <LiquidButton variant="ghost" onClick={onClose}>
                        Annuler
                    </LiquidButton>
                    <div className="flex gap-2">
                        <LiquidButton
                            variant="ghost"
                            onClick={() => console.log('Copier vers...')}
                        >
                            <Copy className="w-4 h-4 mr-2" />
                            Copier vers...
                        </LiquidButton>
                        <LiquidButton onClick={handleSave}>
                            <Save className="w-4 h-4 mr-2" />
                            Enregistrer
                        </LiquidButton>
                    </div>
                </div>
            }
        >
            {contents.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg text-white/60 mb-2">Aucun contenu assigné</p>
                    <p className="text-sm text-white/40">Glissez-déposez des éléments depuis le volet latéral</p>
                </div>
            ) : (
                <>
                    {/* Onglets */}
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                        {contents.map((content, idx) => (
                            <motion.button
                                key={idx}
                                onClick={() => setActiveTab(idx)}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-all border ${activeTab === idx
                                    ? 'bg-green-500/20 border-green-500/50 text-white shadow-lg shadow-green-500/20'
                                    : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <span>{content.icon || '📍'}</span>
                                <span className="text-sm font-medium">{content.label}</span>
                            </motion.button>
                        ))}
                    </div>

                    {/* Formulaire du contenu actif */}
                    {contents[activeTab] && (
                        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                            {renderContentForm(contents[activeTab], activeTab)}

                            <button
                                onClick={() => handleRemoveContent(activeTab)}
                                className="mt-4 flex items-center gap-2 text-red-400 hover:text-red-300 text-sm transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Retirer ce contenu de cette case
                            </button>
                        </div>
                    )}
                </>
            )}
        </LiquidModal>
    );
};

export default PipelineCellModal;





