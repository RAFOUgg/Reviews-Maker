import { useState } from 'react';

export default function PipelineWithCultivars({ value, onChange, choices = [], cultivarsList = [] }) {
    const pipeline = Array.isArray(value) ? value : [];

    const addStep = () => {
        const newStep = {
            id: Date.now(),
            method: choices[0] || '',
            cultivar: '',
            microns: '',
            temperature: '',
            duration: '',
            notes: ''
        };
        onChange([...pipeline, newStep]);
    };

    const updateStep = (id, field, val) => {
        onChange(pipeline.map(s => s.id === id ? { ...s, [field]: val } : s));
    };

    const removeStep = (id) => {
        onChange(pipeline.filter(s => s.id !== id));
    };

    const moveStep = (id, direction) => {
        const index = pipeline.findIndex(s => s.id === id);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= pipeline.length) return;

        const newPipeline = [...pipeline];
        [newPipeline[index], newPipeline[newIndex]] = [newPipeline[newIndex], newPipeline[index]];
        onChange(newPipeline);
    };

    // Méthodes qui utilisent des mailles/microns
    const methodsWithMicrons = [
        'Tamisage WPFF',
        'Tamisage à l\'eau glacée',
        'Tamisage à la glace carbonique',
        'Tamisage à sec',
        'Tamisage à sec congelé',
        'Bubble Hash',
        'Ice Hash',
        'Dry'
    ];

    const showMicrons = (method) => {
        return methodsWithMicrons.some(m => method.toLowerCase().includes(m.toLowerCase()));
    };

    return (
        <div className="space-y-4">
            {pipeline.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    <p className="mb-4">Aucune étape dans le pipeline</p>
                    <p className="text-sm">Ajoutez des étapes pour définir votre processus d'extraction/séparation</p>
                </div>
            ) : (
                pipeline.map((step, idx) => (
                    <div key={step.id} className="bg-gray-900/70 border border-gray-700 rounded-xl p-4 space-y-3 relative">
                        {/* Header avec numéro et contrôles */}
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => moveStep(step.id, 'up')}
                                        disabled={idx === 0}
                                        className="p-1 text-gray-400 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Monter"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveStep(step.id, 'down')}
                                        disabled={idx === pipeline.length - 1}
                                        className="p-1 text-gray-400 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed"
                                        title="Descendre"
                                    >
                                        ↓
                                    </button>
                                </div>
                                <span className="text-lg font-bold text-green-400">Étape {idx + 1}</span>
                            </div>
                            <button
                                type="button"
                                onClick={() => removeStep(step.id)}
                                className="text-red-400 hover:text-red-300 text-sm"
                            >
                                ✕ Supprimer
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {/* Méthode */}
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-400 mb-1">
                                    Méthode d'extraction/séparation *
                                </label>
                                <select
                                    value={step.method || ''}
                                    onChange={(e) => updateStep(step.id, 'method', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                                >
                                    <option value="">-- Sélectionner --</option>
                                    {choices.map((choice, i) => (
                                        <option key={i} value={choice}>{choice}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Cultivar */}
                            {cultivarsList.length > 0 && (
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                        Cultivar utilisé (optionnel)
                                    </label>
                                    <select
                                        value={step.cultivar || ''}
                                        onChange={(e) => updateStep(step.id, 'cultivar', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                                    >
                                        <option value="">-- Tous / Mélange --</option>
                                        {cultivarsList.map((cultivar, i) => (
                                            <option key={i} value={cultivar.name}>
                                                {cultivar.name} {cultivar.farm && `(${cultivar.farm})`}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {/* Maille/Microns (si applicable) */}
                            {showMicrons(step.method) && (
                                <div>
                                    <label className="block text-xs text-gray-400 mb-1">
                                        Maille (microns)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ex: 73-120µ, 45µ, 160µ"
                                        value={step.microns || ''}
                                        onChange={(e) => updateStep(step.id, 'microns', e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                                    />
                                </div>
                            )}

                            {/* Température */}
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                    Température (optionnel)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: -20°C, 80°C"
                                    value={step.temperature || ''}
                                    onChange={(e) => updateStep(step.id, 'temperature', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>

                            {/* Durée */}
                            <div>
                                <label className="block text-xs text-gray-400 mb-1">
                                    Durée (optionnel)
                                </label>
                                <input
                                    type="text"
                                    placeholder="Ex: 15min, 2h, 24h"
                                    value={step.duration || ''}
                                    onChange={(e) => updateStep(step.id, 'duration', e.target.value)}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500"
                                />
                            </div>

                            {/* Notes */}
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-400 mb-1">
                                    Notes spécifiques (optionnel)
                                </label>
                                <textarea
                                    value={step.notes || ''}
                                    onChange={(e) => updateStep(step.id, 'notes', e.target.value)}
                                    rows="2"
                                    placeholder="Détails supplémentaires sur cette étape..."
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                ))
            )}

            <button
                type="button"
                onClick={addStep}
                className="w-full py-3 border-2 border-dashed border-gray-600 hover:border-green-500 rounded-xl text-gray-400 hover:text-green-400 transition-colors flex items-center justify-center gap-2"
            >
                <span className="text-2xl">+</span>
                <span>Ajouter une étape au pipeline</span>
            </button>

            {pipeline.length > 0 && (
                <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-xl">
                    <p className="text-xs text-blue-300">
                        💡 <strong>Ordre du pipeline:</strong> Les étapes sont exécutées dans l'ordre affiché.
                        Utilisez les flèches ↑↓ pour réorganiser.
                    </p>
                </div>
            )}
        </div>
    );
}
