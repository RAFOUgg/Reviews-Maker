/**
 * SeparationPipelineSection - Pipeline séparation pour Hash
 * Phase 1.4 - Conforme CDC
 * 
 * Méthodes: Ice-O-Lator, Dry-Sift, Manuel, Autre
 * Config: passes, température, mailles, rendement
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Waves, Snowflake, Hand, Settings, ChevronDown } from 'lucide-react';
import LiquidCard from '../../../../components/ui/LiquidCard';
import { SEPARATION_METHODS, MESH_SIZES, getMethodById } from '../../../data/separationMethods';
import { INTERVAL_TYPES } from '../../../types/pipelineTypes';

const SeparationPipelineSection = ({ data = {}, onChange }) => {
    const [config, setConfig] = useState({
        method: data.method || 'ice_water',
        intervalType: 'minutes',
        duration: data.duration || 30,
        ...data
    });

    const [showConfig, setShowConfig] = useState(true);
    const currentMethod = getMethodById(config.method);

    useEffect(() => {
        onChange?.(config);
    }, [config]);

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const updateField = (fieldKey, value) => {
        setConfig(prev => ({
            ...prev,
            fields: { ...prev.fields, [fieldKey]: value }
        }));
    };

    const toggleMeshSize = (size) => {
        const meshSizes = config.meshSizes || [];
        const newMeshSizes = meshSizes.includes(size)
            ? meshSizes.filter(s => s !== size)
            : [...meshSizes, size].sort((a, b) => b - a); // Tri décroissant

        updateConfig('meshSizes', newMeshSizes);
    };

    return (
        <div className="space-y-6">
            {/* Configuration méthode */}
            <LiquidCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Waves className="w-5 h-5" />
                        Méthode de séparation
                    </h3>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
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
                                {Object.entries(SEPARATION_METHODS).map(([id, method]) => (
                                    <button
                                        key={id}
                                        onClick={() => updateConfig('method', id)}
                                        className={`p-4 rounded-lg border-2 transition-all ${config.method === id ? ' shadow-lg' : 'border-gray-600 hover: bg-gray-800/50' }`}
                                    >
                                        <div className="text-4xl mb-2">{method.icon}</div>
                                        <div className="text-base font-bold text-white">{method.name}</div>
                                        <div className="text-sm text-gray-300 mt-1">{method.description}</div>
                                    </button>
                                ))}
                            </div>

                            {/* Champs dynamiques selon méthode */}
                            {currentMethod && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                                    {currentMethod.fields.map((field) => (
                                        <div key={field.key}>
                                            <label className="block text-sm font-medium mb-2">
                                                {field.label} {field.required && <span className="text-red-400">*</span>}
                                                {field.unit && <span className="text-white/60"> ({field.unit})</span>}
                                            </label>

                                            {field.type === 'select' ? (
                                                <select
                                                    value={config.fields?.[field.key] || ''}
                                                    onChange={(e) => updateField(field.key, e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                                    required={field.required}
                                                >
                                                    <option value="">Sélectionner...</option>
                                                    {field.options?.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            ) : field.type === 'boolean' ? (
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={config.fields?.[field.key] || false}
                                                        onChange={(e) => updateField(field.key, e.target.checked)}
                                                        className="w-4 h-4"
                                                    />
                                                    <span className="text-sm">Oui</span>
                                                </label>
                                            ) : field.type === 'textarea' ? (
                                                <textarea
                                                    value={config.fields?.[field.key] || ''}
                                                    onChange={(e) => updateField(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    rows={3}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                                    required={field.required}
                                                />
                                            ) : field.type === 'text' ? (
                                                <input
                                                    type="text"
                                                    value={config.fields?.[field.key] || ''}
                                                    onChange={(e) => updateField(field.key, e.target.value)}
                                                    placeholder={field.placeholder}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                                    required={field.required}
                                                />
                                            ) : (
                                                <input
                                                    type="number"
                                                    value={config.fields?.[field.key] || ''}
                                                    onChange={(e) => updateField(field.key, parseFloat(e.target.value) || '')}
                                                    placeholder={field.placeholder}
                                                    min={field.min}
                                                    max={field.max}
                                                    step="0.1"
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                                    required={field.required}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Sélection tailles de mailles (si applicable) */}
                            {currentMethod?.meshSizes && (
                                <div className="mt-6">
                                    <label className="block text-sm font-medium mb-3">
                                        Tailles de mailles utilisées *
                                    </label>
                                    <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                                        {MESH_SIZES.map((mesh) => (
                                            <button
                                                key={mesh.size}
                                                onClick={() => toggleMeshSize(mesh.size)}
                                                className={`p-3 rounded-lg border-2 transition-all ${(config.meshSizes || []).includes(mesh.size) ? 'border-green-500 bg-green-500/20' : 'border-white/20 hover:border-white/40' }`}
                                            >
                                                <div className="text-sm font-bold">{mesh.label}</div>
                                                <div className="text-xs opacity-60 mt-1">{mesh.grade}</div>
                                            </button>
                                        ))}
                                    </div>
                                    <p className="text-xs text-white/60 mt-2">
                                        Sélectionnez les mailles utilisées dans votre configuration
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </LiquidCard>

            {/* Résumé configuration */}
            {currentMethod && (
                <LiquidCard className="p-6 /30">
                    <h4 className="text-sm font-bold mb-3">📋 Résumé configuration</h4>
                    <div className="space-y-2 text-sm">
                        <p><strong>Méthode:</strong> {currentMethod.name}</p>
                        {config.meshSizes && config.meshSizes.length > 0 && (
                            <p><strong>Mailles:</strong> {config.meshSizes.join('µm, ')}µm</p>
                        )}
                        {config.fields && Object.keys(config.fields).length > 0 && (
                            <div>
                                <strong>Paramètres:</strong>
                                <ul className="mt-1 ml-4 space-y-1">
                                    {Object.entries(config.fields).map(([key, value]) => (
                                        <li key={key} className="text-xs opacity-80">
                                            {currentMethod.fields.find(f => f.key === key)?.label}: {value}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </LiquidCard>
            )}
        </div>
    );
};

export default SeparationPipelineSection;
