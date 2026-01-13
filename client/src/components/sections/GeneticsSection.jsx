import React from 'react';
import { motion } from 'framer-motion';
import LiquidCard from './LiquidCard';
import LiquidInput from './LiquidInput';
import LiquidSelect from './LiquidSelect';
import { Dna, Leaf, Info } from 'lucide-react';

/**
 * GeneticsSection - Section génétique complète pour reviews Fleurs
 * Conforme CDC : Breeder, Variété, Type, %, Généalogie, Phénotype
 */
export default function GeneticsSection({
    formData,
    onChange,
    cultivarLibrary = [] // Liste cultivars depuis bibliothèque utilisateur
}) {
    const { genetics = {} } = formData;

    const handleChange = (field, value) => {
        onChange('genetics', {
            ...genetics,
            [field]: value,
            // Auto-calcul ratio sativa si indica change
            ...(field === 'indicaRatio' && { sativaRatio: 100 - (value || 0) })
        });
    };

    const handleParentageChange = (field, value) => {
        onChange('genetics', {
            ...genetics,
            parentage: {
                ...(genetics.parentage || {}),
                [field]: value
            }
        });
    };

    return (
        <LiquidCard variant="section" className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <Dna className="w-6 h-6" />
                <h3 className="text-xl font-bold text-white">Génétiques</h3>
                <Info className="w-4 h-4 text-gray-400 cursor-help"
                    title="Informations sur l'origine génétique du cultivar" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Breeder */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Breeder / Sélectionneur
                    </label>
                    <LiquidInput
                        type="text"
                        value={genetics.breeder || ''}
                        onChange={(e) => handleChange('breeder', e.target.value)}
                        placeholder="Ex: DNA Genetics, Barney's Farm..."
                        list="breeder-suggestions"
                    />
                    <datalist id="breeder-suggestions">
                        {cultivarLibrary
                            .map(c => c.breeder)
                            .filter((v, i, a) => v && a.indexOf(v) === i)
                            .map(breeder => (
                                <option key={breeder} value={breeder} />
                            ))
                        }
                    </datalist>
                </div>

                {/* Variété */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                        Variété / Cultivar
                    </label>
                    <LiquidInput
                        type="text"
                        value={genetics.variety || ''}
                        onChange={(e) => handleChange('variety', e.target.value)}
                        placeholder="Ex: OG Kush, Girl Scout Cookies..."
                        list="variety-suggestions"
                    />
                    <datalist id="variety-suggestions">
                        {cultivarLibrary.map(c => (
                            <option key={c.id} value={c.name} />
                        ))}
                    </datalist>
                </div>

                {/* Type génétique */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                        Type
                    </label>
                    <LiquidSelect
                        value={genetics.type || ''}
                        onChange={(e) => handleChange('type', e.target.value)}
                    >
                        <option value="">Sélectionner...</option>
                        <option value="indica">🌙 Indica</option>
                        <option value="sativa">☀️ Sativa</option>
                        <option value="hybrid">⚖️ Hybride</option>
                        <option value="cbd-dominant">💊 CBD-dominant</option>
                    </LiquidSelect>
                </div>

                {/* Ratios Indica/Sativa */}
                {genetics.type === 'hybrid' && (
                    <>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-300">
                                Indica {genetics.indicaRatio || 0}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={genetics.indicaRatio || 50}
                                onChange={(e) => handleChange('indicaRatio', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Sativa {genetics.sativaRatio || 50}%</span>
                            </div>
                        </div>
                    </>
                )}

                {/* Code phénotype */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                        Code Phénotype
                        <span className="text-xs text-gray-500 ml-2">(ex: Pheno #3, Clone A)</span>
                    </label>
                    <LiquidInput
                        type="text"
                        value={genetics.phenotype || ''}
                        onChange={(e) => handleChange('phenotype', e.target.value)}
                        placeholder="Ex: Pheno #3"
                    />
                </div>

                {/* Code clone */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">
                        Code Clone
                        <span className="text-xs text-gray-500 ml-2">(si applicable)</span>
                    </label>
                    <LiquidInput
                        type="text"
                        value={genetics.cloneCode || ''}
                        onChange={(e) => handleChange('cloneCode', e.target.value)}
                        placeholder="Ex: Clone-2024-001"
                    />
                </div>
            </div>

            {/* Généalogie */}
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-4 border-t border-white/10"
            >
                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                    🧬 Généalogie (Parents & Lignée)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Parent Mère */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Parent Mère ♀
                        </label>
                        <LiquidInput
                            type="text"
                            value={genetics.parentage?.mother || ''}
                            onChange={(e) => handleParentageChange('mother', e.target.value)}
                            placeholder="Ex: Purple Haze"
                            list="cultivar-suggestions"
                        />
                    </div>

                    {/* Parent Père */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">
                            Parent Père ♂
                        </label>
                        <LiquidInput
                            type="text"
                            value={genetics.parentage?.father || ''}
                            onChange={(e) => handleParentageChange('father', e.target.value)}
                            placeholder="Ex: OG Kush"
                            list="cultivar-suggestions"
                        />
                    </div>

                    {/* Lignée complète */}
                    <div className="space-y-2 md:col-span-2">
                        <label className="text-sm font-medium text-gray-300">
                            Lignée complète
                            <span className="text-xs text-gray-500 ml-2">(optionnel)</span>
                        </label>
                        <textarea
                            value={genetics.parentage?.lineage || ''}
                            onChange={(e) => handleParentageChange('lineage', e.target.value)}
                            placeholder="Ex: (Purple Haze x OG Kush) F2..."
                            rows={2}
                            className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg focus:ring-2 focus: focus:border-transparent text-white placeholder-gray-500 resize-none"
                        />
                    </div>
                </div>

                {/* Datalist partagé pour suggestions cultivars */}
                <datalist id="cultivar-suggestions">
                    {cultivarLibrary.map(c => (
                        <option key={c.id} value={c.name} />
                    ))}
                </datalist>
            </motion.div>

            {/* Info tooltip */}
            <div className="text-xs text-gray-500 bg-white/5 rounded-lg p-3 flex items-start gap-2">
                <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <p>
                    Les informations génétiques permettent de tracer l'origine et l'évolution du cultivar.
                    Utilisez votre bibliothèque de cultivars pour l'auto-complétion.
                </p>
            </div>
        </LiquidCard>
    );
}



