/**
 * Section Pipeline Séparation (Hash)
 * Phase 2.1 - Pipeline Séparation avec trame temporelle
 */

import React, { useState, useEffect } from 'react';
import { Clock, Droplets, Thermometer, Grid3x3, Package, TrendingUp, Plus, Trash2 } from 'lucide-react';
import {
    SEPARATION_METHODS,
    MESH_SIZES,
    SOURCE_MATERIAL_TYPES,
    TIMELINE_INTERVALS,
    getAllMethods,
    estimateYield
} from '../../../data/separationMethods';

const SeparationPipelineSection = ({ data = {}, onChange }) => {
    const [config, setConfig] = useState({
        timelineInterval: data.timelineInterval || 'minutes',
        duration: data.duration || 60,
        method: data.method || 'iceWater',
        ...data
    });

    const [steps, setSteps] = useState(data.steps || []);
    const [sourceMaterial, setSourceMaterial] = useState({
        type: data.sourceMaterial?.type || 'fresh-buds',
        quality: data.sourceMaterial?.quality || 8,
        quantity: data.sourceMaterial?.quantity || 100,
        ...data.sourceMaterial
    });

    const [processData, setProcessData] = useState({
        passes: data.processData?.passes || 3,
        waterTemp: data.processData?.waterTemp || 2,
        meshSizes: data.processData?.meshSizes || [25, 73, 120, 190],
        iceRatio: data.processData?.iceRatio || 50,
        ...data.processData
    });

    const selectedMethod = SEPARATION_METHODS[config.method];
    const selectedInterval = TIMELINE_INTERVALS.find(i => i.id === config.timelineInterval);

    useEffect(() => {
        onChange?.({
            timelineInterval: config.timelineInterval,
            duration: config.duration,
            method: config.method,
            sourceMaterial,
            processData,
            steps,
            estimatedYield: estimateYield(sourceMaterial.quality, config.method)
        });
    }, [config, sourceMaterial, processData, steps]);

    const handleAddStep = () => {
        const newStep = {
            id: Date.now(),
            timestamp: steps.length > 0 ? steps[steps.length - 1].timestamp + 5 : 5,
            action: '',
            notes: '',
            data: {}
        };
        setSteps([...steps, newStep]);
    };

    const handleRemoveStep = (stepId) => {
        setSteps(steps.filter(s => s.id !== stepId));
    };

    const handleStepChange = (stepId, field, value) => {
        setSteps(steps.map(s =>
            s.id === stepId ? { ...s, [field]: value } : s
        ));
    };

    const toggleMeshSize = (size) => {
        const currentSizes = processData.meshSizes || [];
        const newSizes = currentSizes.includes(size)
            ? currentSizes.filter(s => s !== size)
            : [...currentSizes, size].sort((a, b) => a - b);

        setProcessData({ ...processData, meshSizes: newSizes });
    };

    return (
        <div className="space-y-8">
            {/* En-tête */}
            <div className="text-center space-y-2">
                <h3 className="text-2xl font-bold text-gray-900">Pipeline Séparation</h3>
                <p className="text-gray-600">Configurez la trame temporelle et les étapes de séparation</p>
            </div>

            {/* Configuration Timeline */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <Clock className="w-5 h-5 text-purple-500" />
                    <h4 className="font-semibold text-gray-900">Configuration de la trame</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Intervalle */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Intervalle temporel
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {TIMELINE_INTERVALS.map(interval => (
                                <button
                                    key={interval.id}
                                    onClick={() => setConfig({ ...config, timelineInterval: interval.id })}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${config.timelineInterval === interval.id
                                            ? 'bg-purple-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {interval.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Durée */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Durée totale ({selectedInterval?.unit})
                        </label>
                        <input
                            type="number"
                            min="1"
                            max={selectedInterval?.max || 1440}
                            value={config.duration}
                            onChange={(e) => setConfig({ ...config, duration: parseInt(e.target.value) })}
                            className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        />
                    </div>
                </div>
            </div>

            {/* Méthode de séparation */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <Grid3x3 className="w-5 h-5 text-blue-500" />
                    <h4 className="font-semibold text-gray-900">Méthode de séparation</h4>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {getAllMethods().map(method => (
                        <button
                            key={method.id}
                            onClick={() => setConfig({ ...config, method: method.id })}
                            className={`p-4 rounded-xl text-center transition-all ${config.method === method.id
                                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <div className="text-3xl mb-2">{method.icon}</div>
                            <div className="font-medium text-sm">{method.label}</div>
                        </button>
                    ))}
                </div>

                {selectedMethod && (
                    <p className="mt-4 text-sm text-gray-600 text-center">
                        {selectedMethod.description}
                    </p>
                )}
            </div>

            {/* Matière première */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center gap-2 mb-4">
                    <Package className="w-5 h-5 text-green-500" />
                    <h4 className="font-semibold text-gray-900">Matière première</h4>
                </div>

                <div className="space-y-4">
                    {/* Type */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type de matière</label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                            {SOURCE_MATERIAL_TYPES.map(type => (
                                <button
                                    key={type.id}
                                    onClick={() => setSourceMaterial({ ...sourceMaterial, type: type.id, quality: type.quality })}
                                    className={`p-3 rounded-xl transition-all ${sourceMaterial.type === type.id
                                            ? 'bg-green-500 text-white shadow-lg'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{type.icon}</div>
                                    <div className="text-xs font-medium">{type.label}</div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Qualité et Quantité */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Qualité: {sourceMaterial.quality}/10
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={sourceMaterial.quality}
                                onChange={(e) => setSourceMaterial({ ...sourceMaterial, quality: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Quantité (g)</label>
                            <input
                                type="number"
                                min="1"
                                value={sourceMaterial.quantity}
                                onChange={(e) => setSourceMaterial({ ...sourceMaterial, quantity: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Paramètres spécifiques méthode */}
            {config.method === 'iceWater' && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Droplets className="w-5 h-5 text-cyan-500" />
                        <h4 className="font-semibold text-gray-900">Paramètres Ice-O-Lator</h4>
                    </div>

                    <div className="space-y-4">
                        {/* Nombre de passes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de passes: {processData.passes}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={processData.passes}
                                onChange={(e) => setProcessData({ ...processData, passes: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>

                        {/* Température eau */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                <Thermometer className="w-4 h-4 inline mr-2" />
                                Température eau: {processData.waterTemp}°C
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={processData.waterTemp}
                                onChange={(e) => setProcessData({ ...processData, waterTemp: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>

                        {/* Ratio glace */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ratio glace/eau: {processData.iceRatio}%
                            </label>
                            <input
                                type="range"
                                min="20"
                                max="80"
                                value={processData.iceRatio}
                                onChange={(e) => setProcessData({ ...processData, iceRatio: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                            />
                        </div>

                        {/* Tailles de mailles */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tailles de mailles utilisées</label>
                            <div className="grid grid-cols-4 gap-2">
                                {MESH_SIZES.map(mesh => (
                                    <button
                                        key={mesh.value}
                                        onClick={() => toggleMeshSize(mesh.value)}
                                        className={`p-3 rounded-xl text-center transition-all ${processData.meshSizes?.includes(mesh.value)
                                                ? 'bg-cyan-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <div className="font-bold">{mesh.label}</div>
                                        <div className="text-xs mt-1">{mesh.quality}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {config.method === 'drySift' && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                    <div className="flex items-center gap-2 mb-4">
                        <Grid3x3 className="w-5 h-5 text-amber-500" />
                        <h4 className="font-semibold text-gray-900">Paramètres Dry-Sift</h4>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nombre de passes: {processData.passes || 1}
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="5"
                                value={processData.passes || 1}
                                onChange={(e) => setProcessData({ ...processData, passes: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tailles de mailles utilisées</label>
                            <div className="grid grid-cols-4 gap-2">
                                {MESH_SIZES.slice(0, 5).map(mesh => (
                                    <button
                                        key={mesh.value}
                                        onClick={() => toggleMeshSize(mesh.value)}
                                        className={`p-3 rounded-xl text-center transition-all ${processData.meshSizes?.includes(mesh.value)
                                                ? 'bg-amber-500 text-white shadow-lg'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        <div className="font-bold">{mesh.label}</div>
                                        <div className="text-xs mt-1">{mesh.quality}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rendement estimé */}
            <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl p-6 text-white shadow-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <TrendingUp className="w-6 h-6" />
                        <div>
                            <div className="text-sm opacity-90">Rendement estimé</div>
                            <div className="text-3xl font-bold">
                                {estimateYield(sourceMaterial.quality, config.method)}%
                            </div>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm opacity-90">Quantité estimée</div>
                        <div className="text-2xl font-bold">
                            {(sourceMaterial.quantity * estimateYield(sourceMaterial.quality, config.method) / 100).toFixed(2)}g
                        </div>
                    </div>
                </div>
            </div>

            {/* Étapes personnalisées */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900">Étapes personnalisées</h4>
                    <button
                        onClick={handleAddStep}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-500 text-white rounded-xl hover:bg-purple-600 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter une étape
                    </button>
                </div>

                {steps.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                        Aucune étape personnalisée. Cliquez sur "Ajouter une étape" pour commencer.
                    </p>
                ) : (
                    <div className="space-y-3">
                        {steps.map((step, index) => (
                            <div key={step.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-purple-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                                            {index + 1}
                                        </div>
                                        <input
                                            type="number"
                                            value={step.timestamp}
                                            onChange={(e) => handleStepChange(step.id, 'timestamp', parseInt(e.target.value))}
                                            className="w-20 px-2 py-1 rounded-lg border border-gray-300 text-sm"
                                            placeholder="Temps"
                                        />
                                        <span className="text-sm text-gray-600">{selectedInterval?.unit}</span>
                                    </div>
                                    <button
                                        onClick={() => handleRemoveStep(step.id)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={step.action}
                                    onChange={(e) => handleStepChange(step.id, 'action', e.target.value)}
                                    placeholder="Action effectuée..."
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 mb-2 text-sm"
                                />
                                <textarea
                                    value={step.notes}
                                    onChange={(e) => handleStepChange(step.id, 'notes', e.target.value)}
                                    placeholder="Notes (optionnel, max 500 caractères)..."
                                    maxLength={500}
                                    rows={2}
                                    className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm resize-none"
                                />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SeparationPipelineSection;
