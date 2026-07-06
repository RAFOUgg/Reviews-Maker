/**
 * RecipePipelineSection - Pipeline recette Comestibles
 * Phase 1.6 - Conforme CDC
 * Gestion ingrédients (standard/cannabinique) + étapes préparation
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChefHat, Plus, X, ChevronDown, Cannabis } from 'lucide-react';
import { LiquidCard, LiquidDivider } from '@/components/ui/LiquidUI';
import ChainSectionEmbed from '../../../../components/production-chain/ChainSectionEmbed';
import ChainToggleButton from '../../../../components/production-chain/ChainToggleButton';
import useProductionChainStore from '../../../../store/useProductionChainStore';

const UNITS = ['g', 'kg', 'ml', 'L', 'c. à soupe', 'c. à café', 'pincée', 'pcs', 'autre'];
const PREPARATION_ACTIONS = [
    'Mélanger', 'Chauffer', 'Refroidir', 'Cuire', 'Infuser',
    'Broyer', 'Tamiser', 'Laisser reposer', 'Décarboxyler', 'Extraire', 'Autre'
];

const RecipePipelineSection = ({ data = {}, onChange, reviewId, reviewLabel, reviewImage }) => {
    const linkOpen = useProductionChainStore(s => s.linkOpen);
    const [config, setConfig] = useState({
        ingredients: data.ingredients || [],
        steps: data.steps || [],
        ...data
    });

    const [showIngredients, setShowIngredients] = useState(true);
    const [showSteps, setShowSteps] = useState(true);

    // isFirstRunRef évite d'émettre {ingredients:[], steps:[]} au simple montage de la section
    // (ex: l'utilisateur clique sur cet onglet sans rien remplir) — sinon formData change de
    // référence et déclenche l'autosave d'un brouillon vide (même pattern que AnalyticsSection.jsx).
    const isFirstRunRef = useRef(true);
    useEffect(() => {
        if (isFirstRunRef.current) {
            isFirstRunRef.current = false;
            return;
        }
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

    if (linkOpen) {
        return (
            <div className="space-y-6">
                <ChainSectionEmbed
                    reviewId={reviewId}
                    reviewType="edible"
                    reviewLabel={reviewLabel}
                    reviewImage={reviewImage}
                />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Ingrédients */}
            <LiquidCard glow="amber" padding="lg">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                            <ChefHat className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">🥘 Ingrédients</h3>
                            <p className="text-sm text-white/50">Cannabiniques et standards</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ChainToggleButton reviewId={reviewId} reviewType="edible" />
                        <button onClick={() => setShowIngredients(!showIngredients)} className="p-2 rounded-lg hover:bg-white/10 border border-white/10">
                            <motion.div animate={{ rotate: showIngredients ? 180 : 0 }}>
                                <ChevronDown className="w-5 h-5 text-white" />
                            </motion.div>
                        </button>
                    </div>
                </div>

                <LiquidDivider />

                <AnimatePresence>
                    {showIngredients && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-6 overflow-hidden mt-6"
                        >
                            {/* Ingrédients cannabiniques */}
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <Cannabis className="w-4 h-4 text-green-400" />
                                    Ingrédients cannabiniques
                                </h4>
                                {cannabinicIngredients.length === 0 ? (
                                    <p className="text-sm text-white/60 mb-3">Aucun ingrédient cannabinique</p>
                                ) : (
                                    <div className="space-y-2 mb-3">
                                        {cannabinicIngredients.map((ing) => (
                                            <div key={ing.id} className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl grid grid-cols-12 gap-2">
                                                <select
                                                    value={ing.cannabinoidType || 'fleur'}
                                                    onChange={(e) => updateIngredient(ing.id, 'cannabinoidType', e.target.value)}
                                                    className="col-span-3 px-2 py-1 bg-[#1a1a2e] border border-white/20 rounded-lg text-sm text-white"
                                                >
                                                    <option value="fleur" className="bg-[#1a1a2e]">Fleur</option>
                                                    <option value="hash" className="bg-[#1a1a2e]">Hash</option>
                                                    <option value="concentre" className="bg-[#1a1a2e]">Concentré</option>
                                                    <option value="huile" className="bg-[#1a1a2e]">Huile</option>
                                                    <option value="beurre" className="bg-[#1a1a2e]">Beurre</option>
                                                </select>
                                                <input
                                                    type="text"
                                                    placeholder="Nom..."
                                                    value={ing.name}
                                                    onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                                                    className="col-span-4 px-2 py-1 bg-[#1a1a2e] border border-white/20 rounded-lg text-sm text-white placeholder-white/30"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Qté"
                                                    value={ing.quantity}
                                                    onChange={(e) => updateIngredient(ing.id, 'quantity', e.target.value)}
                                                    className="col-span-2 px-2 py-1 bg-[#1a1a2e] border border-white/20 rounded-lg text-sm text-white placeholder-white/30"
                                                />
                                                <select
                                                    value={ing.unit}
                                                    onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                                                    className="col-span-2 px-2 py-1 bg-[#1a1a2e] border border-white/20 rounded-lg text-sm text-white"
                                                >
                                                    {UNITS.map(u => <option key={u} value={u} className="bg-[#1a1a2e]">{u}</option>)}
                                                </select>
                                                <button
                                                    onClick={() => removeIngredient(ing.id)}
                                                    className="col-span-1 p-1 hover:bg-red-500/20 rounded-lg border border-white/10"
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
                                <h4 className="text-sm font-semibold text-white mb-3">Ingrédients standards</h4>
                                {standardIngredients.length === 0 ? (
                                    <p className="text-sm text-white/60 mb-3">Aucun ingrédient standard</p>
                                ) : (
                                    <div className="space-y-2 mb-3">
                                        {standardIngredients.map((ing) => (
                                            <div key={ing.id} className="p-3 bg-white/5 border border-white/10 rounded-xl grid grid-cols-12 gap-2">
                                                <input
                                                    type="text"
                                                    placeholder="Nom ingrédient..."
                                                    value={ing.name}
                                                    onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)}
                                                    className="col-span-7 px-2 py-1 bg-[#1a1a2e] border border-white/20 rounded-lg text-sm text-white placeholder-white/30"
                                                />
                                                <input
                                                    type="number"
                                                    placeholder="Qté"
                                                    value={ing.quantity}
                                                    onChange={(e) => updateIngredient(ing.id, 'quantity', e.target.value)}
                                                    className="col-span-2 px-2 py-1 bg-[#1a1a2e] border border-white/20 rounded-lg text-sm text-white placeholder-white/30"
                                                />
                                                <select
                                                    value={ing.unit}
                                                    onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}
                                                    className="col-span-2 px-2 py-1 bg-[#1a1a2e] border border-white/20 rounded-lg text-sm text-white"
                                                >
                                                    {UNITS.map(u => <option key={u} value={u} className="bg-[#1a1a2e]">{u}</option>)}
                                                </select>
                                                <button
                                                    onClick={() => removeIngredient(ing.id)}
                                                    className="col-span-1 p-1 hover:bg-red-500/20 rounded-lg border border-white/10"
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
            <LiquidCard glow="amber" padding="lg">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-white">📝 Étapes de préparation</h3>
                    <button onClick={() => setShowSteps(!showSteps)} className="p-2 rounded-lg hover:bg-white/10 border border-white/10">
                        <motion.div animate={{ rotate: showSteps ? 180 : 0 }}>
                            <ChevronDown className="w-5 h-5 text-white" />
                        </motion.div>
                    </button>
                </div>

                <LiquidDivider />

                <AnimatePresence>
                    {showSteps && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="space-y-4 overflow-hidden mt-6"
                        >
                            {config.steps.length === 0 ? (
                                <p className="text-sm text-white/60 text-center py-4">
                                    Aucune étape. Cliquez pour ajouter.
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    {config.steps.map((step, index) => (
                                        <div key={step.id} className="p-4 bg-white/5 border border-white/10 rounded-xl">
                                            <div className="flex items-center justify-between mb-3">
                                                <span className="text-sm font-semibold text-white">Étape {index + 1}</span>
                                                <button
                                                    onClick={() => removeStep(step.id)}
                                                    className="p-1 hover:bg-red-500/20 rounded-lg border border-white/10"
                                                >
                                                    <X className="w-4 h-4 text-red-400" />
                                                </button>
                                            </div>
                                            <div className="space-y-2">
                                                <select
                                                    value={step.action}
                                                    onChange={(e) => updateStep(step.id, 'action', e.target.value)}
                                                    className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/20 rounded-xl text-sm text-white"
                                                >
                                                    {PREPARATION_ACTIONS.map(a => (
                                                        <option key={a} value={a} className="bg-[#1a1a2e]">{a}</option>
                                                    ))}
                                                </select>
                                                <textarea
                                                    placeholder="Description détaillée..."
                                                    value={step.description}
                                                    onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                                    className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/20 rounded-xl text-sm text-white placeholder-white/30"
                                                    rows={2}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Durée (ex: 10 min, 2h...)"
                                                    value={step.duration}
                                                    onChange={(e) => updateStep(step.id, 'duration', e.target.value)}
                                                    className="w-full px-3 py-2 bg-[#1a1a2e] border border-white/20 rounded-xl text-sm text-white placeholder-white/30"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                onClick={addStep}
                                className="w-full py-3 border-2 border-dashed border-white/30 rounded-xl hover:border-orange-500 hover:bg-orange-500/10 transition-all flex items-center justify-center gap-2 text-white"
                            >
                                <Plus className="w-5 h-5" />
                                Ajouter étape
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </LiquidCard>

            {/* Résumé */}
            <div className="p-5 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-xl border-2 border-orange-500/30">
                <h4 className="text-sm font-bold text-white mb-3">📋 Résumé recette</h4>
                <div className="space-y-2 text-sm text-white/70">
                    <p><strong className="text-white">Ingrédients cannabiniques:</strong> {cannabinicIngredients.length}</p>
                    <p><strong className="text-white">Ingrédients standards:</strong> {standardIngredients.length}</p>
                    <p><strong className="text-white">Étapes de préparation:</strong> {config.steps.length}</p>
                </div>
            </div>
        </div>
    );
};

export default RecipePipelineSection;
