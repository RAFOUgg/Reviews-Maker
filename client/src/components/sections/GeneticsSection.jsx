import React from 'react';
import { motion } from 'framer-motion';
import { LiquidCard, LiquidInput, LiquidSelect, LiquidDivider } from '@/components/ui/LiquidUI';
import { Dna, Leaf, Info } from 'lucide-react';

/**
 * GeneticsSection - Section génétique complète pour reviews Fleurs
 * Conforme CDC : Breeder, Variété, Type, %, Généalogie, Phénotype
 * Liquid Glass UI Design System
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
        <LiquidCard glow="green" padding="lg" className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 pb-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-green-500/30">
                    <Dna className="w-5 h-5 text-white" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-white">🧬 Génétiques</h3>
                    <p className="text-sm text-white/50">Origine et lignée du cultivar</p>
                </div>
            </div>

            <LiquidDivider />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Breeder */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-400" />
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
                    <label className="text-sm font-medium text-white/80">
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
                    <label className="text-sm font-medium text-white/80">
                        Type génétique
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
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
                            Indica {genetics.indicaRatio || 50}% / Sativa {genetics.sativaRatio || 50}%
                        </label>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={genetics.indicaRatio || 50}
                            onChange={(e) => handleChange('indicaRatio', parseInt(e.target.value))}
                            className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-green-500"
                        />
                        <div className="flex justify-between text-xs text-white/40">
                            <span>🌙 Indica</span>
                            <span>☀️ Sativa</span>
                        </div>
                    </div>
                )}

                {/* Code phénotype */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">
                        Code Phénotype
                        <span className="text-xs text-white/40 ml-2">(ex: Pheno #3)</span>
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
                    <label className="text-sm font-medium text-white/80">
                        Code Clone
                        <span className="text-xs text-white/40 ml-2">(si applicable)</span>
                    </label>
                    <LiquidInput
                        type="text"
                        value={genetics.cloneCode || ''}
                        onChange={(e) => handleChange('cloneCode', e.target.value)}
                        placeholder="Ex: Clone-2024-001"
                    />
                </div>
            </div>

            <LiquidDivider />

            {/* Généalogie */}
            <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
            >
                <h4 className="text-sm font-semibold text-white/80 flex items-center gap-2">
                    🧬 Généalogie (Parents & Lignée)
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Parent Mère */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">
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
                        <label className="text-sm font-medium text-white/80">
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
                        <label className="text-sm font-medium text-white/80">
                            Lignée complète
                            <span className="text-xs text-white/40 ml-2">(optionnel)</span>
                        </label>
                        <textarea
                            value={genetics.parentage?.lineage || ''}
                            onChange={(e) => handleParentageChange('lineage', e.target.value)}
                            placeholder="Ex: (Purple Haze x OG Kush) F2..."
                            rows={2}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 text-white placeholder-white/30 resize-none transition-all"
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
            <div className="p-4 bg-green-500/10 rounded-xl border border-green-500/20 flex items-start gap-3">
                <Info className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-white/60">
                    Les informations génétiques permettent de tracer l'origine et l'évolution du cultivar.
                    Utilisez votre bibliothèque de cultivars pour l'auto-complétion.
                </p>
            </div>
        </LiquidCard>
    );
}



