import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dna, Leaf, Info, Construction } from 'lucide-react'
import LiquidCard from '../../../components/LiquidCard'
import PhenoCodeGenerator from '../../../components/genetics/PhenoCodeGenerator'
import { useStore } from '../../../store/useStore'

export default function Genetiques({ formData, handleChange }) {
    const [cultivarLibrary, setCultivarLibrary] = useState([])
    const genetics = formData.genetics || {}
    const { user } = useStore()

    // Charger la bibliothèque de cultivars
    useEffect(() => {
        fetch('/api/cultivars', { credentials: 'include' })
            .then(res => res.json())
            .then(data => setCultivarLibrary(data))
            .catch(console.error)
    }, [])

    const handleGeneticsChange = (field, value) => {
        const newGenetics = {
            ...genetics,
            [field]: value,
            // Auto-calcul ratio sativa si indica change
            ...(field === 'indicaRatio' && { sativaRatio: 100 - (value || 0) })
        }
        handleChange('genetics', newGenetics)
    }

    const handleParentageChange = (field, value) => {
        handleChange('genetics', {
            ...genetics,
            parentage: {
                ...(genetics.parentage || {}),
                [field]: value
            }
        })
    }

    return (
        <LiquidCard title="🧬 Génétiques" bordered>
            <div className="space-y-6">
                {/* Info CDC */}
                <div className="text-xs text-gray-500 bg-white/5 rounded-lg p-3 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>
                        Informations sur l'origine génétique du cultivar. Utilisez votre bibliothèque pour l'auto-complétion.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Breeder */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <Leaf className="w-4 h-4" />
                            Breeder / Sélectionneur
                        </label>
                        <input
                            type="text"
                            value={genetics.breeder || ''}
                            onChange={(e) => handleGeneticsChange('breeder', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
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
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Variété / Cultivar
                        </label>
                        <input
                            type="text"
                            value={genetics.variety || ''}
                            onChange={(e) => handleGeneticsChange('variety', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
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
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Type
                        </label>
                        <select
                            value={genetics.type || ''}
                            onChange={(e) => handleGeneticsChange('type', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
                        >
                            <option value="">Sélectionner...</option>
                            <option value="indica">🌙 Indica</option>
                            <option value="sativa">☀️ Sativa</option>
                            <option value="hybrid">⚖️ Hybride</option>
                            <option value="cbd-dominant">💊 CBD-dominant</option>
                        </select>
                    </div>

                    {/* Ratios Indica/Sativa si Hybride */}
                    {genetics.type === 'hybrid' && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Indica {genetics.indicaRatio || 50}% / Sativa {genetics.sativaRatio || 50}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                step="5"
                                value={genetics.indicaRatio || 50}
                                onChange={(e) => handleGeneticsChange('indicaRatio', parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-300 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                            />
                        </div>
                    )}

                    {/* Code phénotype */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Code Phénotype
                            <span className="text-xs text-gray-500 ml-2">(ex: Pheno #3)</span>
                        </label>
                        <input
                            type="text"
                            value={genetics.phenotype || ''}
                            onChange={(e) => handleGeneticsChange('phenotype', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
                            placeholder="Ex: Pheno #3, Selection A"
                        />
                    </div>

                    {/* Code clone */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Code Clone
                            <span className="text-xs text-gray-500 ml-2">(si applicable)</span>
                        </label>
                        <input
                            type="text"
                            value={genetics.cloneCode || ''}
                            onChange={(e) => handleGeneticsChange('cloneCode', e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                            placeholder="Ex: Clone-2024-001"
                        />
                    </div>
                </div>

                {/* Code Phénotype Auto-Incrémenté CDC */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <PhenoCodeGenerator
                        value={genetics.codePheno || ''}
                        onChange={(code) => handleGeneticsChange('codePheno', code)}
                        userId={user?.id}
                    />
                </div>

                {/* Arbre Généalogique / Canva - COMING SOON */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <LiquidCard className="bg-transparent dark:bg-transparent border-2 border-dashed border-gray-600">
                        <div className="text-center py-12">
                            <Construction className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-300 mb-4 animate-bounce" />
                            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                🌳 Arbre Généalogique Interactive
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-4">
                                Fonctionnalité en cours de développement
                            </p>
                            <div className="max-w-md mx-auto space-y-2 text-sm text-gray-500 dark:text-gray-400">
                                <p>✨ Canva drag & drop pour créer l'arbre</p>
                                <p>🔗 Visualisation des relations parents/enfants</p>
                                <p>📊 Export graphique de l'arbre</p>
                                <p>📚 Intégration avec votre bibliothèque de cultivars</p>
                            </div>
                            <div className="mt-6 inline-block px-6 py-2 liquid-btn liquid-btn--primary">
                                Coming Soon 🚀
                            </div>
                        </div>
                    </LiquidCard>
                </div>

                {/* Généalogie */}
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
                >
                    <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        🧬 Généalogie (Parents & Lignée)
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Parent Mère */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Parent Mère ♀
                            </label>
                            <input
                                type="text"
                                value={genetics.parentage?.mother || ''}
                                onChange={(e) => handleParentageChange('mother', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                placeholder="Ex: Purple Haze"
                                list="cultivar-suggestions"
                            />
                        </div>

                        {/* Parent Père */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Parent Père ♂
                            </label>
                            <input
                                type="text"
                                value={genetics.parentage?.father || ''}
                                onChange={(e) => handleParentageChange('father', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                placeholder="Ex: OG Kush"
                                list="cultivar-suggestions"
                            />
                        </div>

                        {/* Lignée complète */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Lignée complète
                                <span className="text-xs text-gray-500 ml-2">(optionnel)</span>
                            </label>
                            <textarea
                                value={genetics.parentage?.lineage || ''}
                                onChange={(e) => handleParentageChange('lineage', e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 resize-none"
                                placeholder="Ex: (Purple Haze x OG Kush) F2..."
                                rows={2}
                            />
                        </div>

                        {/* Datalist partagé pour suggestions cultivars */}
                        <datalist id="cultivar-suggestions">
                            {cultivarLibrary.map(c => (
                                <option key={c.id} value={c.name} />
                            ))}
                        </datalist>
                    </div>
                </motion.div>
            </div>
        </LiquidCard>
    )
}
