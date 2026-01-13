/**
 * RecipePipelineSection - Pipeline recette Comestibles
 * Phase 1.6 - Conforme CDC
 * Gestion ingrédients (standard/cannabinique) + étapes préparation
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Plus, X, ChevronDown, Cannabis } from 'lucide-react';
import LiquidCard from '../../../../components/ui/LiquidCard';

const UNITS = ['g', 'kg', 'ml', 'L', 'c. à soupe', 'c. à café', 'pincée', 'pcs', 'autre'];
const PREPARATION_ACTIONS = [
    'Mélanger', 'Chauffer', 'Refroidir', 'Cuire', 'Infuser',
    'Broyer', 'Tamiser', 'Laisser reposer', 'Décarboyler', 'Extraire', 'Autre'
];

const RecipePipelineSection = ({ data = {}, onChange }) => {
    const [config, setConfig] = useState({
        ingredients: data.ingredients || [],
        steps: data.steps || [],
        ...data
    });

    const [showIngredients, setShowIngredients] = useState(true);
    const [showSteps, setShowSteps] = useState(true);

    useEffect(() => {
        onChange?.(config);
    }, [config]);

    const addIngredient = (type = 'standard') => {
        setConfig(prev => ({
            ...prev,
            ingredients: [
                ...prev.ingredients,
                {
                    id: Date.now(),
                    type,
                    name: '',
                    quantity: '',
                    unit: 'g',
                    cannabinoidType: type === 'cannabinique' ? 'fleur' : undefined
                }
            ]
        }));
    };

    const removeIngredient = (id) => {
        setConfig(prev => ({
            ...prev,
            ingredients: prev.ingredients.filter(i => i.id !== id)
        }));
    };

    const updateIngredient = (id, key, value) => {
        setConfig(prev => ({
            ...prev,
            ingredients: prev.ingredients.map(ing =>
                ing.id === id ? { ...ing, [key]: value } : ing
            )
        }));
    };

    const addStep = () => {
        setConfig(prev => ({
            ...prev,
            steps: [
                ...prev.steps,
                { id: Date.now(), action: 'Mélanger', description: '', ingredientIds: [], duration: '' }
            ]
        }));
    };

    const removeStep = (id) => {
        setConfig(prev => ({
            ...prev,
            steps: prev.steps.filter(s => s.id !== id)
        }));
    };

    const updateStep = (id, key, value) => {
        setConfig(prev => ({
            ...prev,
            steps: prev.steps.map(step =>
                step.id === id ? { ...step, [key]: value } : step
            )
        }));
    };

    const cannabinicIngredients = config.ingredients.filter(i => i.type === 'cannabinique');
    const standardIngredients = config.ingredients.filter(i => i.type === 'standard');

    return (
        <div className="space-y-6">
            {/* Ingrédients */}
            <LiquidCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <ChefHat className="w-5 h-5 text-orange-500" />
                        Ingrédients
                    </h3>
                    <button onClick={() => setShowIngredients(!showIngredients)} className="p-2 rounded-lg hover:bg-white/10">
                        <motion.div animate={{ rotate: showIngredients ? 180 : 0 }}>
                            <ChevronDown className="w-5 h-5" />
                        </motion.div>
                    </button>
                </div>

                <AnimatePresence>
                    {showIngredients && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-6 overflow-hidden"
                        >
                            {/* Ingrédients cannabiniques */}
                            <div>
                                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                    <Cannabis className="w-4 h-4 text-green-500" />
                                    Ingrédients cannabiniques
                                </h4>
                                {cannabinicIngredients.length === 0 ? (
                                    <p className="text-sm text-white/60 mb-3">Aucun ingrédient cannabinique</p>
                                ) : (
                                    <div className="space-y-2 mb-3">
                                        {cannabinicIngredients.map((ing) => (
                                            <div key={ing.id} className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg grid grid-cols-12 gap-2">
                                                <select
                                                    value={ing.cannabinoidType || 'fleur'}
                                                    onChange={(e) => updateIngredient(ing.id, 'cannabinoidType', e.target.value)}
                                                    className="col-span-3 px-2 py-1 bg-white/5 border border-white/20 rounded text-sm"
                                                >
                                                    <option value="fleur">Fleur</option>
                                                    <option value="hash">Hash</option>
                                                    <option value="concentre">Concentré</option>
                                                    <option value="huile">Huile</option>
                                                    <option value="beurre">Beurre</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Nom..."
                                                    value={ing.name}
                                                    onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                                                    className="col-span-4 px-2 py-1 bg-white/5 border border-white/20 rounded text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Qté"
                                                    value={ing.quantity}
                                                    onChange={(e) => updateIngredient(ing.id, 'quantity', e.target.value)}
                                                    className="col-span-2 px-2 py-1 bg-white/5 border border-white/20 rounded text-sm"
                                                />
                                                <select
                                                    value={ing.unit}
                                                    onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                                                    className="col-span-2 px-2 py-1 bg-white/5 border border-white/20 rounded text-sm"
                                                >
                                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                                <button
                                                    onClick={() => removeIngredient(ing.id)}
                                                    className="col-span-1 p-1 hover:bg-red-500/20 rounded"
                                                >
                                                    <X className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => addIngredient('cannabinique')}
                                    className="w-full py-2 border-2 border-dashed border-green-500/50 rounded-lg hover:bg-green-500/10 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter ingrédient cannabinique
                                </button>
                            </div>

                            {/* Ingrédients standards */}
                            <div>
                                <h4 className="text-sm font-semibold mb-3">Ingrédients standards</h4>
                                {standardIngredients.length === 0 ? (
                                    <p className="text-sm text-white/60 mb-3">Aucun ingrédient standard</p>
                                ) : (
                                    <div className="space-y-2 mb-3">
                                        {standardIngredients.map((ing) => (
                                            <div key={ing.id} className="p-3 bg-white/5 border border-white/10 rounded-lg grid grid-cols-12 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nom ingrédient..."
                                                    value={ing.name}
                                                    onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                                                    className="col-span-7 px-2 py-1 bg-white/5 border border-white/20 rounded text-sm"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Qté"
                                                    value={ing.quantity}
                                                    onChange={(e) => updateIngredient(ing.id, 'quantity', e.target.value)}
                                                    className="col-span-2 px-2 py-1 bg-white/5 border border-white/20 rounded text-sm"
                                                />
                                                <select
                                                    value={ing.unit}
                                                    onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                                                    className="col-span-2 px-2 py-1 bg-white/5 border border-white/20 rounded text-sm"
                                                >
                                                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                </select>
                                                <button
                                                    onClick={() => removeIngredient(ing.id)}
                                                    className="col-span-1 p-1 hover:bg-red-500/20 rounded"
                                                >
                                                    <X className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <button
                                    onClick={() => addIngredient('standard')}
                                    className="w-full py-2 border-2 border-dashed border-white/30 rounded-lg hover:border-orange-500 hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2 text-sm"
                                >
                                    <Plus className="w-4 h-4" />
                                    Ajouter ingrédient standard
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </LiquidCard>

            {/* Étapes de préparation */}
            <LiquidCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Étapes de préparation</h3>
                    <button onClick={() => setShowSteps(!showSteps)} className="p-2 rounded-lg hover:bg-white/10">
                        <motion.div animate={{ rotate: showSteps ? 180 : 0 }}>
                            <ChevronDown className="w-5 h-5" />
                        </motion.div>
                    </button>
                </div>

                <AnimatePresence>
                    {showSteps && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden"
                        >
                            {config.steps.length === 0 ? (
                                <p className="text-sm text-white/60 text-center py-4">
                                    Aucune étape. Cliquez pour ajouter.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {config.steps.map((step, index) => (
                                        <div key={step.id} className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold">Étape {index + 1}</span>
                                                <button
                                                    onClick={() => removeStep(step.id)}
                                                    className="p-1 hover:bg-red-500/20 rounded"
                                                >
                                                    <X className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <select
                                                    value={step.action}
                                                    onChange={(e) => updateStep(step.id, 'action', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm"
                                                >
                                                    {PREPARATION_ACTIONS.map(a => (
                                                        <option key={a} value={a}>{a}</option>
                                                    ))}
                                                </select>
                                                <textarea
                                                    placeholder="Description détaillée..."
                                                    value={step.description}
                                                    onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm"
                                                    rows={2}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Durée (ex: 10 min, 2h...)"
                                                    value={step.duration}
                                                    onChange={(e) => updateStep(step.id, 'duration', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white/5 border border-white/20 rounded-lg text-sm"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={addStep}
                                className="w-full py-3 border-2 border-dashed border-white/30 rounded-lg hover:border-orange-500 hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus className="w-5 h-5" />
                                Ajouter étape
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </LiquidCard>

            {/* Résumé */}
            <LiquidCard className="p-6 bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/30">
                <h4 className="text-sm font-bold mb-3">📋 Résumé recette</h4>
                <div className="space-y-2 text-sm">
                    <p><strong>Ingrédients cannabiniques:</strong> {cannabinicIngredients.length}</p>
                    <p><strong>Ingrédients standards:</strong> {standardIngredients.length}</p>
                    <p><strong>Étapes de préparation:</strong> {config.steps.length}</p>
                </div>
            </LiquidCard>
        </div>
    );
};

export default RecipePipelineSection;
