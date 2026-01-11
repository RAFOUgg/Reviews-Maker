import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Leaf, Info, Plus, Trash2 } from 'lucide-react'
import { ReactFlowProvider } from 'reactflow'
import LiquidCard from '../../../components/LiquidCard'
import PhenoCodeGenerator from '../../../components/genetics/PhenoCodeGenerator'
import UnifiedGeneticsCanvas from '../../../components/genetics/UnifiedGeneticsCanvas'
import useGeneticsStore from '../../../store/useGeneticsStore'
import { useStore } from '../../../store/useStore'

export default function Genetiques({ formData, handleChange }) {
    // Canvas is ALWAYS visible - no collapse state
    const [showPhenoForm, setShowPhenoForm] = useState(false)
    const genetics = formData.genetics || {}
    const { user } = useStore()
    const geneticsStore = useGeneticsStore()
    const hasTree = genetics.geneticsTreeData

    // Get currently selected node from tree (if any)
    const selectedNode = geneticsStore.selectedNodeId
        ? geneticsStore.nodes.find(n => n.id === geneticsStore.selectedNodeId)
        : null

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

    const handleNodeMetadata = (field, value) => {
        if (!selectedNode) return

        // Update selected node's metadata
        const updatedNodes = geneticsStore.nodes.map(n =>
            n.id === selectedNode.id
                ? { ...n, data: { ...n.data, [field]: value } }
                : n
        )

        handleChange('genetics', {
            ...genetics,
            geneticsTreeData: {
                ...genetics.geneticsTreeData,
                nodes: updatedNodes
            }
        })
    }

    const addGeneticRelation = (type) => {
        if (!selectedNode) return

        const relations = selectedNode.data?.relations || []
        const newRelations = [...relations, { type, date: new Date().toISOString() }]
        handleNodeMetadata('relations', newRelations)
    }

    const removeGeneticRelation = (index) => {
        if (!selectedNode) return

        const relations = selectedNode.data?.relations || []
        const newRelations = relations.filter((_, i) => i !== index)
        handleNodeMetadata('relations', newRelations)
    }

    return (
        <LiquidCard title="🧬 Génétiques & Arbre Généalogique" bordered>
            <div className="space-y-6">
                <div className="text-xs text-gray-600 dark:text-gray-300 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg p-3 flex items-start gap-2 border border-purple-200 dark:border-purple-700">
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-400" />
                    <p><strong>Système d'arbre généalogique</strong> : Construisez votre généalogie via le canvas. Sélectionnez un cultivar pour ajouter ses métadonnées généalogiques (relations, tags, codes phénotypes).</p>
                </div>

                {/* SECTION PRINCIPALE: CANVAS GENETIQUE (TOUJOURS VISIBLE) */}
                <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <Leaf className="w-4 h-4" />
                        Arbre Généalogique
                        {hasTree && <span className="text-xs bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 px-2 py-1 rounded-full">✓ Lié</span>}
                    </h3>

                    <ReactFlowProvider>
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm" style={{ height: '500px' }}>
                            <UnifiedGeneticsCanvas treeId={null} readOnly={false} />
                        </div>
                    </ReactFlowProvider>

                    {hasTree && (
                        <button
                            type="button"
                            onClick={() => {
                                handleChange('genetics', { ...genetics, geneticsTreeData: null })
                            }}
                            className="w-full text-sm px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 rounded-lg transition-all border border-red-200 dark:border-red-800"
                        >
                            ✗ Réinitialiser l'arbre
                        </button>
                    )}
                </div>

                {/* SECTION: METADONNEES GENEALOGIQUES DU CULTIVAR SELECTIONNE */}
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700 rounded-lg space-y-4"
                    >
                        <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                            Métadonnées : {selectedNode.data?.cultivarName || 'Cultivar'}
                        </h4>

                        {/* Breeder & Type */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Breeder</label>
                                <input
                                    type="text"
                                    value={selectedNode.data?.breeder || ''}
                                    onChange={(e) => handleNodeMetadata('breeder', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                    placeholder="DNA Genetics..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Type</label>
                                <select
                                    value={selectedNode.data?.type || ''}
                                    onChange={(e) => handleNodeMetadata('type', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Sélectionner...</option>
                                    <option value="indica">🌙 Indica</option>
                                    <option value="sativa">☀️ Sativa</option>
                                    <option value="hybrid">⚖️ Hybride</option>
                                </select>
                            </div>
                        </div>

                        {/* Genetic Relations Tags */}
                        <div className="space-y-2">
                            <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Relation Généalogique</label>
                            <div className="flex flex-wrap gap-2">
                                {['clone élite', 'seed run', 'selfed (S1)', 'BX1', 'BX2', 'polyhybride'].map(tag => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => addGeneticRelation(tag)}
                                        className={`px-3 py-1.5 text-xs rounded-full transition-all ${selectedNode.data?.relations?.some(r => r.type === tag)
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-blue-500 hover:text-white'
                                            }`}
                                    >
                                        {tag}
                                    </button>
                                ))}
                            </div>

                            {selectedNode.data?.relations && selectedNode.data.relations.length > 0 && (
                                <div className="mt-3 space-y-2">
                                    <p className="text-xs text-gray-600 dark:text-gray-400">Relations sélectionnées:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedNode.data.relations.map((rel, idx) => (
                                            <span
                                                key={idx}
                                                className="inline-flex items-center gap-2 px-2 py-1 bg-blue-100 dark:bg-blue-900/40 text-blue-900 dark:text-blue-100 text-xs rounded-full"
                                            >
                                                {rel.type}
                                                <button
                                                    type="button"
                                                    onClick={() => removeGeneticRelation(idx)}
                                                    className="hover:text-red-600"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Pheno Code */}
                        <div className="pt-3 border-t border-blue-200 dark:border-blue-700">
                            <PhenoCodeGenerator
                                value={selectedNode.data?.codePheno || ''}
                                onChange={(code) => handleNodeMetadata('codePheno', code)}
                                userId={user?.id}
                            />
                        </div>
                    </motion.div>
                )}

                {/* FALLBACK: Basic Genetics Fields (si pas d'arbre) */}
                {!hasTree && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/30 border border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                        <div className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Créez d'abord un arbre généalogique via le canvas ci-dessus pour ajouter des détails généalogiques.
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Breeder</label>
                                <input
                                    type="text"
                                    value={genetics.breeder || ''}
                                    onChange={(e) => handleGeneticsChange('breeder', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                    placeholder="DNA Genetics..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wide">Variété</label>
                                <input
                                    type="text"
                                    value={genetics.variety || ''}
                                    onChange={(e) => handleGeneticsChange('variety', e.target.value)}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-purple-500"
                                    placeholder="OG Kush..."
                                />
                            </div>

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
                    </div>
                )}
            </div>
        </LiquidCard>
    )
}
