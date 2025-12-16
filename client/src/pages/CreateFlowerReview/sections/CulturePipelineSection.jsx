/**
 * CulturePipelineSection - Section Pipeline Culture pour Fleurs
 * Conforme CDC - Pipeline GLOBAL : Données de culture
 * 
 * Fonctionnalités:
 * - Configuration trame (phases, jours, semaines)
 * - Sélection phases prédéfinies (culturePhases.js)
 * - Saisie données modifiables par étape
 * - Drag & drop contenus depuis sidebar
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, Sprout, Droplets, Sun, Wind, Beaker, Ruler, ChevronDown, Plus, Settings } from 'lucide-react';
import LiquidCard from '../../../components/LiquidCard';
import CulturePipelineTimeline from '../../../components/forms/flower/CulturePipelineTimeline';
import { CULTURE_PHASES, getTotalPhaseDuration, getPhaseById } from '../../../data/culturePhases';
import { INTERVAL_TYPES } from '../../../types/pipelineTypes';

const CulturePipelineSection = ({ data = {}, onChange }) => {
    const [config, setConfig] = useState({
        intervalType: 'phases', // 'phases', 'days', 'weeks'
        startDate: data.startDate || '',
        endDate: data.endDate || '',
        duration: data.duration || 0,
        customPhases: data.customPhases || CULTURE_PHASES,
        mode: data.mode || 'indoor',
        ...data
    });

    const [selectedCell, setSelectedCell] = useState(null);
    const [showConfig, setShowConfig] = useState(false);

    // Modes de culture
    const CULTURE_MODES = [
        { id: 'indoor', label: 'Indoor', icon: '🏠' },
        { id: 'outdoor', label: 'Outdoor', icon: '🌞' },
        { id: 'greenhouse', label: 'Greenhouse', icon: '🏡' },
        { id: 'notill', label: 'No-till', icon: '🌱' },
        { id: 'other', label: 'Autre', icon: '❓' }
    ];

    // Types d'espace de culture
    const SPACE_TYPES = [
        { id: 'closet', label: 'Armoire' },
        { id: 'tent', label: 'Tente' },
        { id: 'greenhouse', label: 'Serre' },
        { id: 'outdoor', label: 'Extérieur' },
        { id: 'room', label: 'Pièce dédiée' },
        { id: 'other', label: 'Autre' }
    ];

    // Mettre à jour le parent quand config change
    useEffect(() => {
        onChange?.(config);
    }, [config]);

    // Calcul automatique durée si dates fournies
    useEffect(() => {
        if (config.startDate && config.endDate && config.intervalType === 'days') {
            const start = new Date(config.startDate);
            const end = new Date(config.endDate);
            const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
            setConfig(prev => ({ ...prev, duration: days }));
        }
    }, [config.startDate, config.endDate, config.intervalType]);

    // Calcul durée totale phases
    useEffect(() => {
        if (config.intervalType === 'phases') {
            const total = getTotalPhaseDuration(config.customPhases);
            setConfig(prev => ({ ...prev, duration: total }));
        }
    }, [config.intervalType, config.customPhases]);

    const updateConfig = (key, value) => {
        setConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleCellClick = (cellData) => {
        setSelectedCell(cellData);
    };

    return (
        <div className="space-y-6">
            {/* Configuration Pipeline */}
            <LiquidCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <Sprout className="w-5 h-5 text-green-500" />
                        Configuration Pipeline Culture
                    </h3>
                    <button
                        onClick={() => setShowConfig(!showConfig)}
                        className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                    >
                        <motion.div
                            animate={{ rotate: showConfig ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
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
                            {/* Choix trame temporelle */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Trame temporelle
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    <button
                                        onClick={() => updateConfig('intervalType', 'phases')}
                                        className={`p-3 rounded-lg border-2 transition-all ${config.intervalType === 'phases'
                                            ? 'border-green-500 bg-green-500/20'
                                            : 'border-white/20 hover:border-white/40'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🌱</div>
                                        <div className="text-sm font-medium">Phases</div>
                                        <div className="text-xs opacity-60">12 étapes</div>
                                    </button>

                                    <button
                                        onClick={() => updateConfig('intervalType', 'days')}
                                        className={`p-3 rounded-lg border-2 transition-all ${config.intervalType === 'days'
                                            ? 'border-blue-500 bg-blue-500/20'
                                            : 'border-white/20 hover:border-white/40'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">📅</div>
                                        <div className="text-sm font-medium">Jours</div>
                                        <div className="text-xs opacity-60">J+1, J+2...</div>
                                    </button>

                                    <button
                                        onClick={() => updateConfig('intervalType', 'weeks')}
                                        className={`p-3 rounded-lg border-2 transition-all ${config.intervalType === 'weeks'
                                            ? 'border-purple-500 bg-purple-500/20'
                                            : 'border-white/20 hover:border-white/40'
                                            }`}
                                    >
                                        <div className="text-2xl mb-1">🗓️</div>
                                        <div className="text-sm font-medium">Semaines</div>
                                        <div className="text-xs opacity-60">S1, S2...</div>
                                    </button>
                                </div>
                            </div>

                            {/* Dates (obligatoires pour mode jours) */}
                            {config.intervalType === 'days' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Date début *
                                        </label>
                                        <input
                                            type="date"
                                            value={config.startDate}
                                            onChange={(e) => updateConfig('startDate', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">
                                            <Calendar className="w-4 h-4 inline mr-1" />
                                            Date fin
                                        </label>
                                        <input
                                            type="date"
                                            value={config.endDate}
                                            onChange={(e) => updateConfig('endDate', e.target.value)}
                                            className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Mode de culture */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Mode de culture
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {CULTURE_MODES.map(mode => (
                                        <button
                                            key={mode.id}
                                            onClick={() => updateConfig('mode', mode.id)}
                                            className={`p-2 rounded-lg border-2 transition-all ${config.mode === mode.id
                                                ? 'border-green-500 bg-green-500/20'
                                                : 'border-white/20 hover:border-white/40'
                                                }`}
                                        >
                                            <div className="text-xl mb-1">{mode.icon}</div>
                                            <div className="text-xs">{mode.label}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Espace de culture */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Type d'espace
                                    </label>
                                    <select
                                        value={config.spaceType || ''}
                                        onChange={(e) => updateConfig('spaceType', e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                    >
                                        <option value="">Sélectionner...</option>
                                        {SPACE_TYPES.map(type => (
                                            <option key={type.id} value={type.id}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Dimensions (L×l×H en cm)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="120×60×180"
                                        value={config.dimensions || ''}
                                        onChange={(e) => updateConfig('dimensions', e.target.value)}
                                        className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg"
                                    />
                                </div>
                            </div>

                            {/* Durée calculée */}
                            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium">Durée totale calculée :</span>
                                    <span className="text-lg font-bold text-green-400">
                                        {config.duration} jours
                                        {config.intervalType === 'phases' && ' (~3 mois)'}
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </LiquidCard>

            {/* Pipeline Culture CDC - Sidebar + Timeline Drag & Drop */}
            <LiquidCard className="p-6">
                <CulturePipelineTimeline
                    data={{
                        cultureTimelineConfig: {
                            type: config.intervalType === 'phases' ? 'phase' : config.intervalType === 'days' ? 'jour' : 'semaine',
                            start: config.startDate,
                            end: config.endDate,
                            duration: config.duration,
                            phases: config.customPhases
                        },
                        cultureTimelineData: data.cultureTimelineData || []
                    }}
                    onChange={(field, value) => {
                        onChange({
                            ...data,
                            [field]: value
                        });
                    }}
                />
            </LiquidCard>

            {/* Indicateur : données modifiables listées */}
            <LiquidCard className="p-6">
                <h3 className="text-lg font-semibold mb-4">
                    Données modifiables par étape
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                        <Sprout className="w-4 h-4 text-green-400" />
                        <span>Substrat & composition</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                        <Droplets className="w-4 h-4 text-blue-400" />
                        <span>Irrigation & fréquence</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                        <Beaker className="w-4 h-4 text-purple-400" />
                        <span>Engrais & dosage</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                        <Sun className="w-4 h-4 text-yellow-400" />
                        <span>Lumière & spectre</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                        <Wind className="w-4 h-4 text-cyan-400" />
                        <span>Environnement (T°, HR, CO₂)</span>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-white/5 rounded-lg">
                        <Ruler className="w-4 h-4 text-orange-400" />
                        <span>Morphologie plante</span>
                    </div>
                </div>
                <p className="text-xs text-white/60 mt-3">
                    Chaque donnée peut être modifiée à n'importe quelle étape de la pipeline
                </p>
            </LiquidCard>
        </div>
    );
};

export default CulturePipelineSection;
