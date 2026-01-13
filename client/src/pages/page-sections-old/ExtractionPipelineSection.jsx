/**
 * ExtractionPipelineSection - Pipeline extraction/purification Concentrés
 * Phase 1.5 - Conforme CDC
 * 18 méthodes extraction + 16 méthodes purification
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Beaker, FlaskConical, ChevronDown, Plus, X } from 'lucide-react';
import LiquidCard from '../../components/ui/LiquidCard';
import { EXTRACTION_METHODS, getExtractionMethod } from '../../../data/extractionMethods';
import { PURIFICATION_METHODS, getPurificationMethodById } from '../../../data/purificationMethods';
import { INTERVAL_TYPES } from '../../../types/pipelineTypes';

const ExtractionPipelineSection = ({ data = {}, onChange }) => {
    const [config, setConfig] = useState({
        extractionMethod: data.extractionMethod || 'eho',
        intervalType: 'minutes',
        purificationSteps: data.purificationSteps || [],
        ...data
    });

    const [showConfig, setShowConfig] = useState(true);
    const [showPurification, setShowPurification] = useState(false);
    const currentExtractionMethod = getExtractionMethod(config.extractionMethod);

    useEffect(() => {
        onChange?.(config);
    }, [config]);

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const addPurificationStep = () => {
        setConfig(prev => ({
            ...prev,
            purificationSteps: [
                ...(prev.purificationSteps || []),
                { id: Date.now(), method: '', params: {} }
            ]
        }));
    };

    const removePurificationStep = (stepId) => {
        setConfig(prev => ({
            ...prev,
            purificationSteps: prev.purificationSteps.filter(s => s.id !== stepId)
        }));
    };

    const updatePurificationStep = (stepId, key, value) => {
        setConfig(prev => ({
            ...prev,
            purificationSteps: prev.purificationSteps.map(step =>
                step.id === stepId ? { ...step, [key]: value } : step
            )
        }));
    };

    return (
        <div className="space-y-6">
            {/* Méthode d'extraction */}
            <LiquidCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Beaker className="w-5 h-5" />
                        Méthode d'extraction
                    </h3>
                    <button onClick={() => setShowConfig(!showConfig)} className="p-2 rounded-lg hover:bg-white/10">
                        <motion.div animate={{ rotate: showConfig ? 180 : 0 }}>
                            <ChevronDown className="w-5 h-5" />
                        </motion.div>
                    </button>
                </div>

                <AnimatePresence>
                    {showConfig && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            {/* Choix méthode */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {Object.entries(EXTRACTION_METHODS).map(([id, method]) => (
                                    <button
                                        key={id}
                                        onClick={() => updateConfig('extractionMethod', id)}
                                        className={`p-3 rounded-lg border-2 transition-all ${config.extractionMethod === id ? ' ' : 'border-white/20 hover:border-white/40'}`}
                                    >
                                        <div className="text-2xl mb-1">{method.icon}</div>
                                        <div className="text-xs font-medium">{method.label}</div>
                                    </button>
                                ))}
                            </div>

                            <div className="p-4 border /30 rounded-lg text-sm">
                                {currentExtractionMethod?.description}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </LiquidCard>

            {/* Étapes de purification */}
            <LiquidCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FlaskConical className="w-5 h-5" />
                        Étapes de purification
                    </h3>
                    <button onClick={() => setShowPurification(!showPurification)} className="p-2 rounded-lg hover:bg-white/10">
                        <motion.div animate={{ rotate: showPurification ? 180 : 0 }}>
                            <ChevronDown className="w-5 h-5" />
                        </motion.div>
                    </button>
                </div>

                <AnimatePresence>
                    {showPurification && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            {config.purificationSteps.length === 0 ? (
                                <p className="text-sm text-white/60 text-center py-4">
                                    Aucune étape de purification. Cliquez sur "Ajouter étape" pour commencer.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {config.purificationSteps.map((step, index) => (
                                        <div key={step.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold">Étape {index + 1}</span>
                                                <button
                                                    onClick={() => removePurificationStep(step.id)}
                                                    className="p-1 hover:bg-red-500/20 rounded"
                                                >
                                                    <X className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                            <select
                                                value={step.method || ''}
                                                onChange={(e) => updatePurificationStep(step.id, 'method', e.target.value)}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                            >
                                                <option value="">Sélectionner méthode...</option>
                                                {Object.entries(PURIFICATION_METHODS).map(([id, method]) => (
                                                    <option key={id} value={id}>{method.name}</option>
                                                ))}
                                            </select>
                                            {step.method && (
                                                <p className="text-xs text-white/60 mt-2">
                                                    {getPurificationMethodById(step.method)?.description}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={addPurificationStep}
                                className="w-full py-3 border-2 border-dashed border-white/30 rounded-lg hover:border-cyan-500 hover:bg-cyan-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Ajouter étape de purification
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </LiquidCard>

            {/* Résumé */}
            <LiquidCard className="p-6 bg-gradient-to-br /10 /10 /30">
                <h4 className="text-sm font-bold mb-3">📋 Résumé process</h4>
                <div className="space-y-2 text-sm">
                    <p><strong>Extraction:</strong> {currentExtractionMethod?.label || 'Non définie'}</p>
                    {config.purificationSteps.length > 0 && (
                        <div>
                            <strong>Purification ({config.purificationSteps.length} étape{config.purificationSteps.length > 1 ? 's' : ''}):</strong>
                            <ol className="mt-1 ml-4 list-decimal space-y-1">
                                {config.purificationSteps.map((step, i) => (
                                    <li key={step.id} className="text-xs opacity-80">
                                        {getPurificationMethodById(step.method)?.name || 'Non définie'}
                                    </li>
                                ))}
                            </ol>
                        </div>
                    )}
                </div>
            </LiquidCard>
        </div>
    );
};

export default ExtractionPipelineSection;
