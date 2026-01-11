import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Info, X } from 'lucide-react'
import { ReactFlowProvider } from 'reactflow'
import LiquidCard from '../../../components/LiquidCard'
import PhenoCodeGenerator from '../../../components/genetics/PhenoCodeGenerator'
import UnifiedGeneticsCanvas from '../../../components/genetics/UnifiedGeneticsCanvas'
import useGeneticsStore from '../../../store/useGeneticsStore'
import { useStore } from '../../../store/useStore'

export default function Genetiques({ formData, handleChange }) {
    const [showCanvasEditor, setShowCanvasEditor] = useState(!formData.genetics?.geneticsTreeData)
    const [showAdvancedFields, setShowAdvancedFields] = useState(false)
    const [selectedTreeId, setSelectedTreeId] = useState(null)
    const genetics = formData.genetics || {}
    const { user } = useStore()
    const geneticsStore = useGeneticsStore()
    const hasTree = genetics.geneticsTreeData

    const handleSyncGeneticsTree = () => {
        if (geneticsStore.selectedTreeId && geneticsStore.nodes.length > 0) {
            const selectedTree = geneticsStore.trees.find(t => t.id === geneticsStore.selectedTreeId)
            if (selectedTree) {
                const mainNode = geneticsStore.nodes[0]
                handleChange('genetics', {
                    ...genetics,
                    geneticsTreeId: geneticsStore.selectedTreeId,
                    geneticsTreeData: {
                        treeId: selectedTree.id,
                        treeName: selectedTree.name,
                        projectType: selectedTree.projectType,
                        nodes: geneticsStore.nodes,
                        edges: geneticsStore.edges
                    },
                    variety: mainNode?.cultivarName || genetics.variety
                })
                setShowCanvasEditor(false)
            }
        }
    }

    const handleGeneticsChange = (field, value) => {
        const newGenetics = {
            ...genetics,
            [field]: value,
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
        <LiquidCard title="🧬 Génétiques & Généalogie" bordered>
            <div className="space-y-6">
                <div className="text-xs text-gray-500 bg-white/5 rounded-lg p-3 flex items-start gap-2">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <p>Gérez votre généalogie via l'arbre généalogique de votre bibliothèque personnelle. Les formulaires classiques sont optionnels pour les détails supplémentaires.</p>
                </div>

                {/* SECTION PRINCIPALE: ARBRE GÉNÉALOGIQUE */}
                {hasTree ? (
                    <div className="p-5 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-2 border-purple-300 dark:border-purple-700 rounded-lg">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <p className="text-sm font-bold text-purple-900 dark:text-purple-100 flex items-center gap-2">
                                    <span className="text-lg">✓</span> Arbre lié: {genetics.geneticsTreeData.treeName}
                                </p>
                                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                    {genetics.geneticsTreeData.projectType} • {genetics.geneticsTreeData.nodes?.length || 0} nœuds
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    handleChange('genetics', { ...genetics, geneticsTreeData: null })
                                    setShowCanvasEditor(true)
                                }}
                                className="text-sm px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-all"
                            >
                                Modifier
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="p-6 bg-gray-50 dark:bg-gray-900/30 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-center">
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                            Aucun arbre généalogique sélectionné
                        </p>
                        <button
                            type="button"
                            onClick={() => setShowCanvasEditor(!showCanvasEditor)}
                            className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all inline-flex items-center gap-2"
                        >
                            <span>🌳</span>
                            {showCanvasEditor ? 'Fermer' : 'Ouvrir'} l'Arbre Généalogique
                        </button>
                    </div>
                )}

                {/* CANVAS EDITOR */}
                {showCanvasEditor && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                    >
                        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Sélectionner un arbre généalogique</h3>
                        <ReactFlowProvider>
                            <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-4" style={{ height: '600px' }}>
                                <UnifiedGeneticsCanvas treeId={selectedTreeId} readOnly={false} />
                            </div>
                        </ReactFlowProvider>

                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={handleSyncGeneticsTree}
                                disabled={!geneticsStore.selectedTreeId}
                                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                            >
                                ✓ Valider la sélection
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowCanvasEditor(false)}
                                className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
                            >
                                ✗ Fermer
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* SECTION OPTIONNELLE: CHAMPS COMPLÉMENTAIRES */}
                <motion.div
                    initial={false}
                    animate={{ height: showAdvancedFields ? 'auto' : 0, opacity: showAdvancedFields ? 1 : 0 }}
                    className="overflow-hidden"
                >
                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-6">
                        {/* Quick info fields */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Breeder</label>
                                <input
                                    type="text"
                                    value={genetics.breeder || ''}
                                    onChange={(e) => handleGeneticsChange('breeder', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                    placeholder="DNA Genetics, Barney's Farm..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Variété</label>
                                <input
                                    type="text"
                                    value={genetics.variety || ''}
                                    onChange={(e) => handleGeneticsChange('variety', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                    placeholder="OG Kush, GSC..."
                                />
                            </div>
                        </div>

                        {/* Type & Ratio */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Type</label>
                                <select
                                    value={genetics.type || ''}
                                    onChange={(e) => handleGeneticsChange('type', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="indica">🌙 Indica</option>
                                    <option value="sativa">☀️ Sativa</option>
                                    <option value="hybrid">⚖️ Hybride</option>
                                    <option value="cbd-dominant">💊 CBD-dominant</option>
                                </select>
                            </div>

                            {genetics.type === 'hybrid' && (
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                        Ratio Indica {genetics.indicaRatio || 50}%
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
                        </div>

                        {/* Pheno & Clone codes */}
                        <PhenoCodeGenerator
                            value={genetics.codePheno || ''}
                            onChange={(code) => handleGeneticsChange('codePheno', code)}
                            userId={user?.id}
                        />

                        {/* Genealogy */}
                        <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                            <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                                🧬 Généalogie (Parents & Lignée)
                            </h4>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <input
                                    type="text"
                                    value={genetics.parentage?.mother || ''}
                                    onChange={(e) => handleParentageChange('mother', e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                    placeholder="Parent Mère ♀"
                                />

                                <input
                                    type="text"
                                    value={genetics.parentage?.father || ''}
                                    onChange={(e) => handleParentageChange('father', e.target.value)}
                                    className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                    placeholder="Parent Père ♂"
                                />

                                <textarea
                                    value={genetics.parentage?.lineage || ''}
                                    onChange={(e) => handleParentageChange('lineage', e.target.value)}
                                    className="md:col-span-2 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500 resize-none"
                                    placeholder="Lignée complète (ex: Purple Haze x OG Kush F2)"
                                    rows={2}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Toggle Advanced */}
                <button
                    type="button"
                    onClick={() => setShowAdvancedFields(!showAdvancedFields)}
                    className="w-full py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <span>{showAdvancedFields ? '▼' : '▶'}</span>
                    {showAdvancedFields ? 'Masquer' : 'Afficher'} les détails supplémentaires
                </button>
            </div>
        </LiquidCard>
    )
}
