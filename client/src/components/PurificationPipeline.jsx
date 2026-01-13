import { useState } from 'react';
import PropTypes from 'prop-types';

export default function PurificationPipeline({ value, onChange, availableMethods = [], extractionPipeline = [] }) {
    const pipeline = Array.isArray(value) ? value : [];
    const [showMenu, setShowMenu] = useState(false);

    // Vérifier si au moins une étape d'extraction/séparation existe
    const hasExtractionSteps = Array.isArray(extractionPipeline) && extractionPipeline.length > 0;

    const addStep = (method) => {
        const newStep = {
            id: Date.now(),
            name: method,
            details: '' // Champ optionnel pour ajouter des détails sur cette étape
        };
        onChange([...pipeline, newStep]);
        setShowMenu(false);
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

    return (
        <div className="space-y-4">
            {pipeline.length > 0 && (
                <div className="space-y-3">
                    {pipeline.map((step, idx) => (
                        <div key={step.id} className="bg-transparent border border-white/20 rounded-xl p-4 glow-container-subtle">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <span className="text-lg font-bold text-white glow-text-subtle">
                                        {idx + 1}.
                                    </span>
                                    <span className="font-semibold text-white">
                                        {step.name}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() => moveStep(step.id, 'up')}
                                        disabled={idx === 0}
                                        className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Monter"
                                    >
                                        ↑
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => moveStep(step.id, 'down')}
                                        disabled={idx === pipeline.length - 1}
                                        className="w-8 h-8 flex items-center justify-center text-white/70 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                                        title="Descendre"
                                    >
                                        ↓
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => removeStep(step.id)}
                                        className="w-8 h-8 flex items-center justify-center text-[rgb(var(--color-danger))] hover:text-[rgb(var(--color-danger))] hover:opacity-80 transition-colors"
                                        title="Supprimer"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </div>

                            <input
                                type="text"
                                placeholder="Détails optionnels (ex: paramètres, durée, conditions...)"
                                value={step.details || ''}
                                onChange={(e) => updateStep(step.id, 'details', e.target.value)}
                                className="w-full px-4 py-2 bg-transparent border border-white/20 rounded-lg text-white placeholder-white/40 text-sm focus:outline-none focus:border-white/40 glow-container-subtle"
                            />
                        </div>
                    ))}
                </div>
            )}

            {/* Message de blocage si pas d'extraction */}
            {!hasExtractionSteps && (
                <div className="bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-xl p-4 mb-4">
                    <div className="flex items-start gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="text-[rgb(var(--color-warning))] font-medium mb-1">
                                Étape d'extraction requise
                            </p>
                            <p className="text-[rgb(var(--text-secondary))] opacity-90 text-sm">
                                Vous devez définir les cultivars avant de définir les étapes du pipeline
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="relative">
                {!showMenu ? (
                    <button
                        type="button"
                        onClick={() => setShowMenu(true)}
                        disabled={!hasExtractionSteps}
                        className={`w-full py-3 border-2 border-dashed rounded-xl transition-all flex items-center justify-center gap-2 ${hasExtractionSteps
                            ? 'border-white/20 hover:border-white/40 text-white/70 hover:text-white glow-container-subtle cursor-pointer'
                            : 'border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
                            }`}
                    >
                        <span className="text-2xl">+</span>
                        <span>Ajouter une étape de purification</span>
                    </button>
                ) : (
                    <div className="bg-transparent border border-white/30 rounded-xl p-4 shadow-xl glow-container">
                        <div className="flex items-center justify-between mb-3">
                            <span className="font-semibold text-white">Choisir une méthode</span>
                            <button
                                type="button"
                                onClick={() => setShowMenu(false)}
                                className="text-white/70 hover:text-white"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto pr-2">
                            {availableMethods.map((method, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => addStep(method)}
                                    className="px-4 py-3 bg-transparent border border-white/20 hover:border-white/40 rounded-lg text-white text-sm text-left transition-all hover:glow-text-subtle"
                                >
                                    {method}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

PurificationPipeline.propTypes = {
    value: PropTypes.array,
    onChange: PropTypes.func.isRequired,
    availableMethods: PropTypes.arrayOf(PropTypes.string),
    extractionPipeline: PropTypes.array
};
