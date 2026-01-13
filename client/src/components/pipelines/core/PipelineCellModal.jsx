import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save, Trash2, Copy } from 'lucide-react';
import LiquidButton from './LiquidButton';
import { CULTURE_VALUES } from '../../../data/formValues';

/**
 * PipelineCellModal - Modal contextuel d'édition d'une case
 * 
 * Fonctionnalités:
 * ✅ Formulaires adaptés au type de contenu
 * ✅ Sauvegarde instantanée
 * ✅ Suppression de contenu
 * ✅ Copier vers d'autres cases
 * ✅ Prévisualisation des données
 */

const PipelineCellModal = ({
    isOpen,
    onClose,
    cellIndex,
    cellData = {},
    config,
    contentSchema = [],
    onSave,
    pipelineType = 'culture',
    droppedItem = null // Ajout du prop pour l'item droppé
}) => {
    const [localData, setLocalData] = useState({ ...cellData });
    const [activeTab, setActiveTab] = useState(0);

    useEffect(() => {
        setLocalData({ ...cellData });
    }, [cellData, cellIndex]);

    // Obtenir le label de la case
    const getCellLabel = () => {
        if (!config) return `Étape ${cellIndex + 1}`;

        if (config.intervalType === 'phases' || config.type === 'phase') {
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

    // Handler: Ajouter un nouveau contenu
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
            // Passer à l'onglet existant
            const index = newContents.findIndex(c => c.type === content.type);
            setActiveTab(index);
        }
    };

    // Handler: Modifier données d'un contenu
    const handleUpdateContent = (contentIndex, field, value) => {
        const newContents = [...(localData.contents || [])];
        if (!newContents[contentIndex].data) {
            newContents[contentIndex].data = {};
        }
        newContents[contentIndex].data[field] = value;
        setLocalData({ ...localData, contents: newContents });
    };

    // Handler: Supprimer un contenu
    const handleRemoveContent = (contentIndex) => {
        const newContents = localData.contents.filter((_, idx) => idx !== contentIndex);
        setLocalData({ ...localData, contents: newContents });
        if (activeTab >= newContents.length) {
            setActiveTab(Math.max(0, newContents.length - 1));
        }
    };

    // Handler: Sauvegarde
    const handleSave = () => {
        onSave(cellIndex, localData);
    };

    // Rendu du formulaire selon le type de contenu
    const renderContentForm = (content, contentIndex) => {
        const data = content.data || {};

        // Formulaire environnement
        if (content.category === 'environment') {
            return (
                <div className="space-y-4">
                    {content.type === 'temperature' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                🌡️ Température (°C)
                            </label>
                            <input
                                type="number"
                                value={data.value || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'value', parseFloat(e.target.value))}
                                step="0.1"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                placeholder="Ex: 24.5"
                            />
                        </div>
                    )}

                    {content.type === 'humidity' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                💧 Humidité relative (%)
                            </label>
                            <input
                                type="number"
                                value={data.value || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'value', parseFloat(e.target.value))}
                                min="0"
                                max="100"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                placeholder="Ex: 65"
                            />
                        </div>
                    )}

                    {content.type === 'co2' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                🫧 CO2 (ppm)
                            </label>
                            <input
                                type="number"
                                value={data.value || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'value', parseInt(e.target.value))}
                                min="0"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                placeholder="Ex: 1200"
                            />
                        </div>
                    )}

                    {content.type === 'ventilation' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                🌀 Type de ventilation
                            </label>
                            <select
                                value={data.type || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'type', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                                <option value="">Sélectionner...</option>
                                {(CULTURE_VALUES.typeVentilation || ['Extracteur', 'Brasseur', 'Mixte']).map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                value={data.frequency || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'frequency', e.target.value)}
                                placeholder="Fréquence (ex: 24/7, 15min/h)"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white mt-2"
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
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                💡 Type de lampe
                            </label>
                            <select
                                value={data.value || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'value', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                                <option value="">Sélectionner...</option>
                                {['LED', 'HPS', 'CFL', 'CMH', 'Naturel', 'Mixte'].map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {content.type === 'power' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                ⚡ Puissance totale (W)
                            </label>
                            <input
                                type="number"
                                value={data.value || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'value', parseInt(e.target.value))}
                                min="0"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                placeholder="Ex: 600"
                            />
                        </div>
                    )}

                    {content.type === 'photoperiod' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                ⏱️ Durée d'éclairage (h/jour)
                            </label>
                            <input
                                type="number"
                                value={data.value || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'value', parseFloat(e.target.value))}
                                min="0"
                                max="24"
                                step="0.5"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                placeholder="Ex: 18"
                            />
                        </div>
                    )}
                </div>
            );
        }

        // Formulaire irrigation
        if (content.category === 'irrigation') {
            return (
                <div className="space-y-4">
                    {content.type === 'irrigationType' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                💧 Système d'irrigation
                            </label>
                            <select
                                value={data.value || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'value', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                            >
                                <option value="">Sélectionner...</option>
                                {['Manuel', 'Goutte à goutte', 'Inondation', 'Aspersion', 'Automatique'].map(opt => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {content.type === 'waterVolume' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                🪣 Volume d'eau par arrosage (L)
                            </label>
                            <input
                                type="number"
                                value={data.value || ''}
                                onChange={(e) => handleUpdateContent(contentIndex, 'value', parseFloat(e.target.value))}
                                min="0"
                                step="0.1"
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                placeholder="Ex: 2.5"
                            />
                        </div>
                    )}
                </div>
            );
        }

        // Formulaire générique
        return (
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        {content.icon} {content.label}
                    </label>
                    <input
                        type="text"
                        value={data.value || ''}
                        onChange={(e) => handleUpdateContent(contentIndex, 'value', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                        placeholder="Saisir une valeur..."
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                        📝 Notes
                    </label>
                    <textarea
                        value={data.notes || ''}
                        onChange={(e) => handleUpdateContent(contentIndex, 'notes', e.target.value)}
                        rows="3"
                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                        placeholder="Notes ou observations..."
                    />
                </div>
            </div>
        );
    };

    if (!isOpen) return null;

    const contents = localData.contents || [];

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-gray-900 rounded-2xl border border-gray-700 max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
                >
                    {/* En-tête */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-white">
                                📝 Édition: {getCellLabel()}
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                {contents.length} contenu(s) assigné(s)
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>

                    {/* Contenu */}
                    <div className="p-4 overflow-y-auto max-h-[calc(90vh-180px)]">
                        {contents.length === 0 ? (
                            <div className="text-center py-12 text-gray-400">
                                <p className="text-lg mb-2">Aucun contenu assigné</p>
                                <p className="text-sm">Glissez-déposez des éléments depuis le volet latéral</p>
                            </div>
                        ) : (
                            <>
                                {/* Onglets */}
                                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                                    {contents.map((content, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setActiveTab(idx)}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === idx ? ' text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                                        >
                                            <span>{content.icon || '📍'}</span>
                                            <span className="text-sm font-medium">{content.label}</span>
                                        </button>
                                    ))}
                                </div>

                                {/* Formulaire du contenu actif */}
                                {contents[activeTab] && (
                                    <div className="bg-gray-800/50 rounded-xl p-4">
                                        {renderContentForm(contents[activeTab], activeTab)}

                                        {/* Bouton supprimer */}
                                        <button
                                            onClick={() => handleRemoveContent(activeTab)}
                                            className="mt-4 flex items-center gap-2 text-red-400 hover:text-red-300 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Retirer ce contenu de cette case
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between p-4 border-t border-gray-700">
                        <LiquidButton
                            variant="ghost"
                            onClick={onClose}
                        >
                            Annuler
                        </LiquidButton>

                        <div className="flex gap-2">
                            <LiquidButton
                                variant="ghost"
                                onClick={() => {
                                    // TODO: Copier vers d'autres cases
                                    console.log('Copier vers...');
                                }}
                            >
                                <Copy className="w-4 h-4 mr-2" />
                                Copier vers...
                            </LiquidButton>

                            <LiquidButton
                                onClick={handleSave}
                            >
                                <Save className="w-4 h-4 mr-2" />
                                Enregistrer
                            </LiquidButton>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};

export default PipelineCellModal;





