import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Dna, Leaf, Info, X } from 'lucide-react'
import { ReactFlowProvider } from 'reactflow'
import LiquidCard from '../../../components/LiquidCard'
import PhenoCodeGenerator from '../../../components/genetics/PhenoCodeGenerator'
import UnifiedGeneticsCanvas from '../../../components/genetics/UnifiedGeneticsCanvas'
import useGeneticsStore from '../../../store/useGeneticsStore'
import { useStore } from '../../../store/useStore'

export default function Genetiques({ formData, handleChange }) {
    const [showGeneticsCanvas, setShowGeneticsCanvas] = useState(false)
    const [selectedTreeId, setSelectedTreeId] = useState(null)
    const genetics = formData.genetics || {}
    const { user } = useStore()

    // Genetics store
    const geneticsStore = useGeneticsStore()

    // Synchroniser la sélection du canvas avec le formulaire
    const handleSyncGeneticsTree = () => {
        if (geneticsStore.selectedTreeId && geneticsStore.nodes.length > 0) {
            // Récupérer les données du tree
            const selectedTree = geneticsStore.trees.find(t => t.id === geneticsStore.selectedTreeId)
            if (selectedTree) {
                // Récupérer le cultivar principal (premier nœud)
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
                    // Récupérer le cultivar principal de l'arbre
                    variety: mainNode?.cultivarName || genetics.variety
                })
                setShowGeneticsCanvas(false)
            }
        }
    }

    const handleGeneticsChange = (field, value) => {
        const newGenetics = {
            ...genetics,
            [field]: value,
            // Auto-calcul ratio sativa si indica change
            ...(field === 'indicaRatio' && { sativaRatio: 100 - (value || 0) })
        }
        handleChange('genetics', newGenetics)
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
                        />
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
                        />
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
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-gray-500"
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

                {/* Arbre Généalogique / Genetics Canvas */}
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => setShowGeneticsCanvas(!showGeneticsCanvas)}
                        className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all flex items-center justify-between group"
                    >
                        <span className="flex items-center gap-2">
                            <span className="text-xl">🌳</span>
                            Arbre Généalogique - Bibliothèque Personnelle
                        </span>
                        <span className="transform transition-transform group-hover:translate-x-1">
                            {showGeneticsCanvas ? '▼' : '▶'}
                        </span>
                    </button>

                    {showGeneticsCanvas && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-6 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
                        >
                            {/* Canvas pour sélectionner un arbre */}
                            <div className="space-y-4">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    Sélectionnez un arbre généalogique de votre bibliothèque pour lier à cette review.
                                </div>

                                <ReactFlowProvider>
                                    <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden" style={{ height: '600px' }}>
                                        <UnifiedGeneticsCanvas treeId={selectedTreeId} readOnly={false} />
                                    </div>
                                </ReactFlowProvider>

                                {/* Boutons d'action */}
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
                                        onClick={() => setShowGeneticsCanvas(false)}
                                        className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
                                    >
                                        ✗ Fermer
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Affichage de l'arbre sélectionné */}
                {genetics.geneticsTreeData && (
                    <div className="mt-4 p-4 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-semibold text-purple-900 dark:text-purple-100">
                                    📌 Arbre lié: {genetics.geneticsTreeData.treeName}
                                </p>
                                <p className="text-xs text-purple-700 dark:text-purple-300 mt-1">
                                    Type: {genetics.geneticsTreeData.projectType} | Nœuds: {genetics.geneticsTreeData.nodes?.length || 0}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleChange('genetics', { ...genetics, geneticsTreeData: null })}
                                className="text-purple-600 hover:text-purple-900 dark:hover:text-purple-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </LiquidCard>
    )
}

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
        {(cultivars || []).map(c => (
            <option key={c.id} value={c.name} />
        ))}
    </datalist>
</div>

{/* Type génétique */ }
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

{/* Ratios Indica/Sativa si Hybride */ }
{
    genetics.type === 'hybrid' && (
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
    )
}

{/* Code phénotype */ }
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

{/* Code clone */ }
<div className="space-y-2">
    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Code Clone
        <span className="text-xs text-gray-500 ml-2">(si applicable)</span>
    </label>
    <input
        type="text"
        value={genetics.cloneCode || ''}
        onChange={(e) => handleGeneticsChange('cloneCode', e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:"
        placeholder="Ex: Clone-2024-001"
    />
</div>
                </div >

    {/* Code Phénotype Auto-Incrémenté CDC */ }
    < div className = "pt-4 border-t border-gray-200 dark:border-gray-700" >
        <PhenoCodeGenerator
            value={genetics.codePheno || ''}
            onChange={(code) => handleGeneticsChange('codePheno', code)}
            userId={user?.id}
        />
                </div >

    {/* Arbre Généalogique / PhenoHunt Interactive */ }
    < div className = "pt-4 border-t border-gray-200 dark:border-gray-700" >
        <button
            type="button"
            onClick={() => setShowPhenoHunt(!showPhenoHunt)}
            className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all flex items-center justify-between group"
        >
            <span className="flex items-center gap-2">
                <span className="text-xl">🌳</span>
                PhenoHunt - Arbre Généalogique Interactive
            </span>
            <span className="transform transition-transform group-hover:translate-x-1">
                {showPhenoHunt ? '▼' : '▶'}
            </span>
        </button>

{
    showPhenoHunt && (
        <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 p-6 bg-gray-50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
        >
            {/* Layout: Sidebar + Canvas */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
                {/* Sidebar Cultivars & Projects (1/4) */}
                <div className="lg:col-span-1 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
                    <SidebarHierarchique />
                </div>

                {/* Canvas Principal (3/4) */}
                <div className="lg:col-span-3 flex flex-col gap-4">
                    <ReactFlowProvider>
                        <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                            <CanevasPhenoHunt />
                        </div>
                    </ReactFlowProvider>

                    {/* Boutons d'action */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={handleSyncPhenoHunt}
                            disabled={!activeTreeId}
                            className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all"
                        >
                            ✓ Valider la sélection
                        </button>
                        <button
                            type="button"
                            onClick={() => setShowPhenoHunt(false)}
                            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-all"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Info CDC */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-900 dark:text-blue-100">
                <p>💡 <strong>PhenoHunt:</strong> Créez et visualisez des arbres généalogiques complets de vos cultivars. Drag & drop pour ajouter, créez des relations parents/enfants, et synchronisez avec votre review.</p>
            </div>

            {/* Afficher le cultivar sélectionné */}
            {activeTreeId && (
                <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-xs text-green-900 dark:text-green-100">
                    <p>✓ <strong>Arbre sélectionné:</strong> {trees.find(t => t.id === activeTreeId)?.name || 'Sans titre'}</p>
                </div>
            )}
        </motion.div>
    )
}

{/* Afficher l'arbre sélectionné */ }
{
    genetics.phenoHuntTreeId && (
        <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg text-sm">
            <p className="text-purple-900 dark:text-purple-100">
                <strong>📊 Arbre sélectionné:</strong> {trees.find(t => t.id === genetics.phenoHuntTreeId)?.name || 'Personnalisé'}
                <button
                    type="button"
                    onClick={() => {
                        handleChange('genetics', {
                            ...genetics,
                            phenoHuntTreeId: undefined,
                            phenoHuntData: undefined
                        })
                    }}
                    className="ml-2 text-xs text-purple-600 hover:text-purple-800 dark:text-purple-400 dark:hover:text-purple-200 underline"
                >
                    Modifier
                </button>
            </p>
        </div>
    )
}
                </div >

    {/* Généalogie */ }
    < motion.div
initial = {{ opacity: 0, height: 0 }}
animate = {{ opacity: 1, height: 'auto' }}
className = "space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700"
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
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:"
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
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:"
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
                                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus: resize-none"
                                placeholder="Ex: (Purple Haze x OG Kush) F2..."
                                rows={2}
                            />
                        </div>

                        {/* Datalist partagé pour suggestions cultivars */}
                        <datalist id="cultivar-suggestions">
                            {(cultivars || []).map(c => (
                                <option key={c.id} value={c.name} />
                            ))}
                        </datalist>
                    </div>
                </motion.div >
            </div >
        </LiquidCard >
    )
}
