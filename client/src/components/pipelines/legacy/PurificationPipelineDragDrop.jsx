import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2, BarChart3, Download } from 'lucide-react'
import PipelineDragDropView from '../views/PipelineDragDropView'
import { PURIFICATION_SIDEBAR_CONTENT } from '../../../config/purificationSidebarContent'
import { PurityComparisonGraph, PurityEvolutionLine, MethodComparisonGraph } from './PurityGraph'
import { PurificationMethodModal } from './PurificationMethodForm'
import { exportPurificationToCSV } from '../../../utils/PurificationCSVExporter'

/**
 * PurificationPipelineDragDrop - Pipeline Purification utilisant PipelineDragDropView
 * 
 * Particularités :
 * - Gestion multi-étapes (winterization, chromatography, distillation, etc.)
 * - Graphiques évolution pureté
 * - Export CSV détaillé
 */
export default function PurificationPipelineDragDrop({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange
}) {
    const [purificationSteps, setPurificationSteps] = useState([])
    const [showStepModal, setShowStepModal] = useState(false)
    const [editingStep, setEditingStep] = useState(null)
    const [showGraphs, setShowGraphs] = useState(false)

    // Convertir PURIFICATION_SIDEBAR_CONTENT (objet) vers format array
    const sidebarArray = useMemo(() => {
        return Object.entries(PURIFICATION_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            color: section.color || 'amber',
            collapsed: section.collapsed !== undefined ? section.collapsed : false,
            items: section.items || []
        }))
    }, [])

    // Handler export CSV
    const handleExportCSV = () => {
        try {
            const generalData = timelineData.find(d => d.data)?.data || {}
            const csvContent = exportPurificationToCSV(generalData, purificationSteps)
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `purification-${Date.now()}.csv`
            link.click()
            URL.revokeObjectURL(link.href)
        } catch (error) {
            console.error('Erreur export CSV:', error)
            alert('Erreur lors de l\'export CSV')
        }
    }

    return (
        <div className="space-y-4">
            {/* Header avec gestion des étapes */}
            <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>⚗️</span>
                        Pipeline Purification
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                            {purificationSteps.length} étape{purificationSteps.length > 1 ? 's' : ''}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowGraphs(!showGraphs)}
                        className="liquid-btn"
                        title="Afficher graphiques pureté"
                        disabled={purificationSteps.length === 0}
                    >
                        <BarChart3 className="w-4 h-4" />
                        {showGraphs ? 'Masquer' : 'Graphiques'}
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="liquid-btn"
                        title="Exporter en CSV"
                        disabled={purificationSteps.length === 0}
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                    <button
                        onClick={() => {
                            setEditingStep(null)
                            setShowStepModal(true)
                        }}
                        className="liquid-btn liquid-btn--primary"
                    >
                        <Plus className="w-4 h-4" />
                        Ajouter une étape
                    </button>
                </div>
            </div>

            {/* Graphiques pureté (conditionnel) */}
            {showGraphs && purificationSteps.length > 0 && (
                <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50 space-y-4">
                    {purificationSteps.length > 1 ? (
                        <>
                            <PurityEvolutionLine passes={purificationSteps} />
                            <MethodComparisonGraph methods={purificationSteps} />
                        </>
                    ) : (
                        <PurityComparisonGraph data={purificationSteps[0]} compact />
                    )}
                </div>
            )}

            {/* Liste des étapes */}
            {purificationSteps.length > 0 && (
                <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">
                        Étapes enregistrées ({purificationSteps.length})
                    </h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto">
                        {purificationSteps.map((step, index) => (
                            <motion.div
                                key={step.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition group"
                            >
                                <button
                                    onClick={() => {
                                        setEditingStep(step)
                                        setShowStepModal(true)
                                    }}
                                    className="flex-1 text-left"
                                >
                                    <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Étape {index + 1}
                                    </div>
                                    <div className="text-xs text-gray-600 dark:text-gray-400 space-y-0.5 mt-1">
                                        <div>Pureté: {step.purity_before}% → {step.purity_after}%</div>
                                        <div>Rendement: {step.weight_input > 0 ? ((step.weight_output / step.weight_input) * 100).toFixed(1) : 0}%</div>
                                    </div>
                                </button>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => {
                                            setEditingStep(step)
                                            setShowStepModal(true)
                                        }}
                                        className="p-2 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded text-blue-600 dark:text-blue-400"
                                        title="Éditer cette étape"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm('Supprimer cette étape ?')) {
                                                setPurificationSteps(prev => prev.filter(s => s.id !== step.id))
                                            }
                                        }}
                                        className="p-2 hover:bg-red-100 dark:hover:bg-red-900/20 rounded text-red-600 dark:text-red-400"
                                        title="Supprimer cette étape"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {/* Pipeline principal - PipelineDragDropView existant */}
            <PipelineDragDropView
                type="purification"
                sidebarContent={sidebarArray}
                timelineConfig={timelineConfig}
                timelineData={timelineData}
                onConfigChange={onConfigChange}
                onDataChange={onDataChange}
            />

            {/* Modal étape */}
            <PurificationMethodModal
                isOpen={showStepModal}
                onClose={() => {
                    setShowStepModal(false)
                    setEditingStep(null)
                }}
                onSave={(stepData) => {
                    if (editingStep) {
                        // Update existing
                        setPurificationSteps(prev =>
                            prev.map(s => s.id === editingStep.id ? { ...stepData, id: s.id } : s)
                        )
                    } else {
                        // Add new
                        setPurificationSteps(prev => [
                            ...prev,
                            { ...stepData, id: Date.now(), timestamp: new Date().toISOString() }
                        ])
                    }
                    setShowStepModal(false)
                    setEditingStep(null)
                }}
                initialData={editingStep || {}}
                allData={timelineData.find(d => d.data)?.data || {}}
            />
        </div>
    )
}




