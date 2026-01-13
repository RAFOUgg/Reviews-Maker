/**
 * CuringMaturationSection - Pipeline universel Curing/Maturation
 * Phase 1.7 - Conforme CDC
 * Compatible tous types de produits (Fleurs, Hash, Concentrés, Comestibles)
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Timer, Thermometer, Droplets, Package, ChevronDown, AlertCircle } from 'lucide-react';
import LiquidCard from '../ui/LiquidCard';
import { INTERVAL_TYPES } from '../types/pipelineTypes';
import CuringPipelineDragDrop from '../pipelines/legacy/CuringPipelineDragDrop';

const CONTAINER_TYPES = [
    { id: 'air_libre', label: 'Air libre', icon: '🌬️' },
    { id: 'verre', label: 'Verre', icon: '🫙' },
    { id: 'plastique', label: 'Plastique', icon: '🥡' },
    { id: 'metal', label: 'Métal', icon: '🥫' },
    { id: 'papier', label: 'Papier', icon: '📄' },
    { id: 'autre', label: 'Autre', icon: '📦' }
];

const PACKAGING_TYPES = [
    { id: 'cellophane', label: 'Cellophane', icon: '📦' },
    { id: 'papier_cuisson', label: 'Papier cuisson', icon: '📄' },
    { id: 'aluminium', label: 'Aluminium', icon: '✨' },
    { id: 'paper_hash', label: 'Paper hash', icon: '📜' },
    { id: 'sac_vide', label: 'Sac à vide', icon: '🗜️' },
    { id: 'sous_vide_complet', label: 'Sous vide (machine)', icon: '🔒' },
    { id: 'sous_vide_partiel', label: 'Sous vide (manuel)', icon: '✋' },
    { id: 'congelation', label: 'Congélation', icon: '❄️' },
    { id: 'autre', label: 'Autre', icon: '📦' }
];

const OPACITY_LEVELS = [
    { id: 'opaque', label: 'Opaque', icon: '⬛' },
    { id: 'semi_opaque', label: 'Semi-opaque', icon: '🔲' },
    { id: 'transparent', label: 'Transparent', icon: '⬜' },
    { id: 'ambre', label: 'Ambré', icon: '🟧' }
];

const CuringMaturationSection = ({ data = {}, onChange, productType = 'flower' }) => {
    // State local pour les config de curing (environnement)
    const [config, setConfig] = useState({
        curingType: 'cold',
        temperature: '',
        humidity: '',
        containerType: 'verre',
        packagingType: 'cellophane',
        opacity: 'opaque',
        volumeOccupied: '',
        notes: '',
        ...data
    });

    // State local pour la config timeline - SÉPARÉ ET CONTRÔLÉ
    const [timelineConfig, setTimelineConfig] = useState({
        type: data.curingTimelineConfig?.type || 'phase',
        totalDays: data.curingTimelineConfig?.totalDays || 30,
        totalHours: data.curingTimelineConfig?.totalHours,
        totalWeeks: data.curingTimelineConfig?.totalWeeks,
        startDate: data.curingTimelineConfig?.startDate || '',
        endDate: data.curingTimelineConfig?.endDate || ''
    });

    const [showConfig, setShowConfig] = useState(true);
    const [showTracking, setShowTracking] = useState(false);

    useEffect(() => {
        onChange?.(config);
    }, [config]);

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const calculateDuration = () => {
        if (!config.startDate || !config.endDate) return null;
        const start = new Date(config.startDate);
        const end = new Date(config.endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const duration = calculateDuration();

    return (
        <div className="space-y-6">
            {/* Affiche la configuration complète uniquement pour les fleurs. Pour Hash/Concentrate
                la pipeline temporelle reste affichée plus bas (section 9). */}
            {!(productType === 'hash' || productType === 'concentrate') && (
                <>
                    {/* Configuration de base */}
                    <LiquidCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Timer className="w-5 h-5 text-amber-500" />
                                Configuration Curing/Maturation
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
                                    {/* NOTE: La configuration de la trame (type d'intervalle, nombre de jours, etc.) 
                                 se fait directement dans le composant PipelineDragDropView ci-dessous */}

                                    {/* Type de curing */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Type de maturation</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => updateConfig('curingType', 'cold')}
                                                className={`p-3 rounded-lg border-2 transition-all ${config.curingType === 'cold' ? ' ' : 'border-white/20 hover:border-white/40'}`}
                                            >
                                                <div className="text-2xl mb-1">❄️</div>
                                                <div className="text-sm font-medium">Froid (&lt;5°C)</div>
                                            </button>
                                            <button
                                                onClick={() => updateConfig('curingType', 'warm')}
                                                className={`p-3 rounded-lg border-2 transition-all ${config.curingType === 'warm' ? 'border-orange-500 bg-orange-500/20' : 'border-white/20 hover:border-white/40'}`}
                                            >
                                                <div className="text-2xl mb-1">🔥</div>
                                                <div className="text-sm font-medium">Chaud (&gt;5°C)</div>
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </LiquidCard>

                    {/* Conditions environnementales */}
                    <LiquidCard className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Thermometer className="w-5 h-5 text-red-500" />
                                Conditions environnementales
                            </h3>
                            <button onClick={() => setShowTracking(!showTracking)} className="p-2 rounded-lg hover:bg-white/10">
                                <motion.div animate={{ rotate: showTracking ? 180 : 0 }}>
                                    <ChevronDown className="w-5 h-5" />
                                </motion.div>
                            </button>
                        </div>

                        <AnimatePresence>
                            {showTracking && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="space-y-4 overflow-hidden"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                                <Thermometer className="w-4 h-4" />
                                                Température (°C)
                                            </label>
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder="Ex: 18.5"
                                                value={config.temperature}
                                                onChange={(e) => updateConfig('temperature', e.target.value)}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                                <Droplets className="w-4 h-4" />
                                                Humidité relative (%)
                                            </label>
                                            <input
                                                type="number"
                                                step="1"
                                                placeholder="Ex: 62"
                                                value={config.humidity}
                                                onChange={(e) => updateConfig('humidity', e.target.value)}
                                                className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                            />
                                        </div>
                                    </div>

                                    {/* Type de récipient */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                                            <Package className="w-4 h-4" />
                                            Type de récipient
                                        </label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {CONTAINER_TYPES.map(type => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => updateConfig('containerType', type.id)}
                                                    className={`p-2 rounded-lg border-2 text-sm transition-all ${config.containerType === type.id ? 'border-amber-500 bg-amber-500/20' : 'border-white/20 hover:border-white/40'}`}
                                                >
                                                    <div className="text-xl mb-1">{type.icon}</div>
                                                    <div className="text-xs">{type.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Emballage */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Emballage/Ballotage primaire</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            {PACKAGING_TYPES.map(type => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => updateConfig('packagingType', type.id)}
                                                    className={`p-2 rounded-lg border-2 text-sm transition-all ${config.packagingType === type.id ? ' ' : 'border-white/20 hover:border-white/40'}`}
                                                >
                                                    <div className="text-xl mb-1">{type.icon}</div>
                                                    <div className="text-xs">{type.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Opacité */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Opacité du récipient</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {OPACITY_LEVELS.map(level => (
                                                <button
                                                    key={level.id}
                                                    onClick={() => updateConfig('opacity', level.id)}
                                                    className={`p-2 rounded-lg border-2 text-sm transition-all ${config.opacity === level.id ? 'border-cyan-500 ' : 'border-white/20 hover:border-white/40'}`}
                                                >
                                                    <div className="text-xl mb-1">{level.icon}</div>
                                                    <div className="text-xs">{level.label}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Volume occupé */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Volume occupé par le produit</label>
                                        <div className="flex gap-2">
                                            <input
                                                type="number"
                                                step="0.1"
                                                placeholder="Volume"
                                                value={config.volumeOccupied}
                                                onChange={(e) => updateConfig('volumeOccupied', e.target.value)}
                                                className="flex-1 px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                            />
                                            <select
                                                value={config.volumeUnit || 'mL'}
                                                onChange={(e) => updateConfig('volumeUnit', e.target.value)}
                                                className="px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                            >
                                                <option value="mL">mL</option>
                                                <option value="L">L</option>
                                                <option value="cm³">cm³</option>
                                            </select>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Notes additionnelles</label>
                                        <textarea
                                            placeholder="Observations, modifications au cours du temps..."
                                            value={config.notes}
                                            onChange={(e) => updateConfig('notes', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                            rows={3}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </LiquidCard>

                    {/* Résumé */}
                    <LiquidCard className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/30">
                        <h4 className="text-sm font-bold mb-3">📋 Résumé Curing/Maturation</h4>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div><strong>Type:</strong> {config.curingType === 'cold' ? 'Froid (<5°C)' : 'Chaud (>5°C)'}</div>
                            <div><strong>Intervalle:</strong> {INTERVAL_TYPES[timelineConfig.type] || 'Jours'}</div>
                            <div><strong>Température:</strong> {config.temperature || 'N/A'}°C</div>
                            <div><strong>Humidité:</strong> {config.humidity || 'N/A'}%</div>
                            <div><strong>Récipient:</strong> {CONTAINER_TYPES.find(t => t.id === config.containerType)?.label}</div>
                            <div><strong>Emballage:</strong> {PACKAGING_TYPES.find(t => t.id === config.packagingType)?.label}</div>
                        </div>
                    </LiquidCard>
                </>
            )}

            {/* Pipeline Curing avec évolution temporelle - TOUJOURS AFFICHÉ */}
            <LiquidCard className="p-6">
                <h4 className="text-sm font-bold mb-4 flex items-center gap-2">
                    <Timer className="w-4 h-4" />
                    Pipeline Évolution Curing
                </h4>
                <CuringPipelineDragDrop
                    timelineConfig={timelineConfig}
                    timelineData={data.curingTimeline || []}
                    onConfigChange={(key, value) => {
                        console.log('🔧 CuringMaturation onConfigChange:', key, value);

                        // Mettre à jour le state local IMMÉDIATEMENT
                        setTimelineConfig(prev => ({
                            ...prev,
                            [key]: value
                        }));

                        // Propager au parent pour sauvegarde
                        const updatedConfig = { ...timelineConfig, [key]: value };
                        onChange({ ...data, curingTimelineConfig: updatedConfig });
                    }}
                    onDataChange={(timestamp, field, value) => {
                        // Adapter handler pour PipelineDragDropView
                        const currentData = data.curingTimeline || [];
                        const existingIndex = currentData.findIndex(cell => cell.timestamp === timestamp);

                        let updatedData;
                        if (existingIndex >= 0) {
                            updatedData = [...currentData];
                            if (value === null || value === undefined) {
                                // Supprimer le champ mais GARDER les métadonnées (timestamp, date, label, phase)
                                const { [field]: removed, ...rest } = updatedData[existingIndex];
                                // Restaurer les champs structurels essentiels
                                updatedData[existingIndex] = {
                                    timestamp: updatedData[existingIndex].timestamp,
                                    ...(updatedData[existingIndex].date && { date: updatedData[existingIndex].date }),
                                    ...(updatedData[existingIndex].label && { label: updatedData[existingIndex].label }),
                                    ...(updatedData[existingIndex].phase && { phase: updatedData[existingIndex].phase }),
                                    ...rest
                                };
                            } else {
                                updatedData[existingIndex] = { ...updatedData[existingIndex], [field]: value };
                            }
                        } else {
                            updatedData = [...currentData, { timestamp, [field]: value }];
                        }

                        onChange({ ...data, curingTimeline: updatedData });
                    }}
                    initialData={{
                        temperature: config.temperature,
                        humidity: config.humidity,
                        containerType: config.containerType,
                        packagingType: config.packagingType,
                        opacity: config.opacity,
                        volumeOccupied: config.volumeOccupied
                    }}
                />
            </LiquidCard>
        </div>
    );
};

export default CuringMaturationSection;




