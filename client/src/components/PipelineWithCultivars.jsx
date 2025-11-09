import { useState, useEffect } from 'react';

export default function PipelineWithCultivars({ value, onChange, choices = [], cultivarsList = [], onSolventDetected }) {
    const pipeline = Array.isArray(value) ? value : [];
    const [showMenu, setShowMenu] = useState(false);

    // Détecte si une étape utilise un solvant (autre que l'eau)
    const isSolventStep = (name) => {
        const n = (name || '').toLowerCase();
        return /éthanol|eth|eho|isopropyl|ipa|acétone|aho|butane|bho|isobutane|iho|propane|pho|hexane|hho|huile.*végétal|coco|olive/.test(n);
    };

    // Vérifie si le pipeline contient au moins une étape avec solvant
    const hasSolventSteps = (steps) => steps.some(step => isSolventStep(step.name));

    // Notifier au chargement initial et lors des changements de pipeline
    useEffect(() => {
        if (onSolventDetected) {
            onSolventDetected(hasSolventSteps(pipeline));
        }
    }, [pipeline, onSolventDetected]);

    const addStep = (method) => {
        const newStep = { id: Date.now(), name: method, cultivars: [], meshMin: '', meshMax: '', tempC: '', pressureBar: '' };
        const newPipeline = [...pipeline, newStep];
        onChange(newPipeline);
        setShowMenu(false);

        // Notifier si le pipeline contient des solvants
        if (onSolventDetected) {
            onSolventDetected(hasSolventSteps(newPipeline));
        }
    };

    const updateStep = (id, field, val) => onChange(pipeline.map(s => s.id === id ? { ...s, [field]: val } : s));

    const toggleCultivar = (stepId, cultivarName) => {
        onChange(pipeline.map(s => {
            if (s.id !== stepId) return s;
            const cultivars = s.cultivars || [];
            const newCultivars = cultivars.includes(cultivarName) ? cultivars.filter(c => c !== cultivarName) : [...cultivars, cultivarName];
            return { ...s, cultivars: newCultivars };
        }));
    };

    const removeStep = (id) => {
        const newPipeline = pipeline.filter(s => s.id !== id);
        onChange(newPipeline);

        // Notifier si le pipeline contient des solvants
        if (onSolventDetected) {
            onSolventDetected(hasSolventSteps(newPipeline));
        }
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

    const isSieveStep = (name) => /tamis|bubble|ice\s*hash|ice\s*dry|wpff|dry|tamisage/.test((name || '').toLowerCase());
    const isRosinStep = (name) => /rosin|pressage.*chaud/.test((name || '').toLowerCase());
    const isCO2Step = (name) => /(co2|co₂).*supercritique/.test((name || '').toLowerCase());

    const hasValidCultivars = cultivarsList && cultivarsList.length > 0 && cultivarsList.some(c => c.name && c.name.trim());

    return (
        <div className="space-y-4">
            {pipeline.length > 0 && (
                <ol className="space-y-3">
                    {pipeline.map((step, idx) => (
                        <li key={step.id} className="bg-gray-900/50 border border-gray-700 rounded-xl p-3">
                            <div className="flex items-center justify-between mb-3">
                                <span className="font-semibold text-green-400">{step.name}</span>
                                <div className="flex items-center gap-2">
                                    <button type="button" onClick={() => moveStep(step.id, 'up')} disabled={idx === 0} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed" title="Monter">↑</button>
                                    <button type="button" onClick={() => moveStep(step.id, 'down')} disabled={idx === pipeline.length - 1} className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-green-400 disabled:opacity-30 disabled:cursor-not-allowed" title="Descendre">↓</button>
                                    <button type="button" onClick={() => removeStep(step.id)} className="w-7 h-7 flex items-center justify-center text-red-400 hover:text-red-300" title="Supprimer">✕</button>
                                </div>
                            </div>
                            {cultivarsList.length > 0 && (
                                <div className="mb-3">
                                    <div className="text-xs text-gray-400 mb-2">Cultivars pour cette étape :</div>
                                    <div className="flex flex-wrap gap-2">
                                        {cultivarsList.map((cultivar, i) => {
                                            const isChecked = (step.cultivars || []).includes(cultivar.name);
                                            return <label key={i} className={`px-3 py-1.5 rounded-lg text-sm cursor-pointer transition-all border ${isChecked ? 'bg-transparent border-white/40 text-white glow-text-subtle' : 'bg-transparent border-white/20 text-white/70 hover:border-white/30'}`}><input type="checkbox" className="hidden" checked={isChecked} onChange={() => toggleCultivar(step.id, cultivar.name)} />{cultivar.name}</label>;
                                        })}
                                    </div>
                                </div>
                            )}
                            <div className="space-y-2">
                                {(isSieveStep(step.name) || isRosinStep(step.name)) && (<div className="flex gap-2"><input type="text" placeholder="min (µm)" value={step.meshMin || ''} onChange={(e) => updateStep(step.id, 'meshMin', e.target.value)} className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500" /><input type="text" placeholder="max (µm)" value={step.meshMax || ''} onChange={(e) => updateStep(step.id, 'meshMax', e.target.value)} className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500" /></div>)}
                                {isRosinStep(step.name) && (<input type="text" placeholder="Température (°C)" value={step.tempC || ''} onChange={(e) => updateStep(step.id, 'tempC', e.target.value)} className="w-full px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500" />)}
                                {isCO2Step(step.name) && (<div className="flex gap-2"><input type="text" placeholder="Pression (bar)" value={step.pressureBar || ''} onChange={(e) => updateStep(step.id, 'pressureBar', e.target.value)} className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500" /><input type="text" placeholder="Température (°C)" value={step.tempC || ''} onChange={(e) => updateStep(step.id, 'tempC', e.target.value)} className="flex-1 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:border-green-500" /></div>)}
                            </div>
                        </li>
                    ))}
                </ol>
            )}

            {!hasValidCultivars && (
                <div className="bg-orange-500/10 border border-orange-500/50 rounded-xl p-4 text-center">
                    <div className="text-3xl mb-2">⚠️</div>
                    <p className="text-orange-400 font-medium">Veuillez d'abord ajouter au moins un cultivar</p>
                    <p className="text-orange-300/70 text-sm mt-1">Vous devez spécifier les cultivars avant de définir les étapes du pipeline</p>
                </div>
            )}

            <div className="relative">
                <button
                    type="button"
                    onClick={() => hasValidCultivars && setShowMenu(!showMenu)}
                    disabled={!hasValidCultivars}
                    className={`w-full py-3 border-2 border-dashed rounded-xl transition-colors flex items-center justify-center gap-2 ${hasValidCultivars
                        ? 'border-gray-600 hover:border-green-500 text-gray-400 hover:text-green-400 cursor-pointer'
                        : 'border-gray-700 text-gray-600 cursor-not-allowed opacity-50'
                        }`}
                >
                    <span className="text-2xl">+</span>
                    <span>Ajouter une étape</span>
                </button>
                {showMenu && hasValidCultivars && (<><div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} /><div className="absolute top-full left-0 right-0 mt-2 bg-gray-800 border border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto z-20">{choices.map((choice, i) => (<button key={i} type="button" onClick={() => addStep(choice)} className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors border-b border-gray-700 last:border-b-0">{choice}</button>))}</div></>)}
            </div>
            {pipeline.length > 0 && (<div className="text-xs text-gray-500 text-center mt-2">💡 Les étapes sont exécutées dans l'ordre. Utilisez ↑↓ pour réorganiser.</div>)}
        </div>
    );
}
