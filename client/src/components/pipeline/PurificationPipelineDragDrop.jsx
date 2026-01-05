import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Edit2, Trash2 } from 'lucide-react'
import UnifiedPipelineDragDrop from './UnifiedPipelineDragDrop'
import { PURIFICATION_SIDEBAR_CONTENT } from '../../config/purificationSidebarContent'
import { PurityComparisonGraph, PurityEvolutionLine, MethodComparisonGraph } from './PurityGraph'
import { PurificationMethodModal } from './PurificationMethodForm'
import { exportPurificationToCSV } from '../../utils/PurificationCSVExporter'

/**
 * PurificationPipelineDragDrop - Wrapper pour pipeline Purification
 * 
 * Particularités :
 * - Gestion multi-étapes (winterization, chromatography, distillation, etc.)
 * - Graphiques évolution pureté
 * - Export CSV
 */
export default function PurificationPipelineDragDrop(props) {
    const [purificationSteps, setPurificationSteps] = useState([])
    const [showStepModal, setShowStepModal] = useState(false)
    const [editingStep, setEditingStep] = useState(null)

    // Configuration spécifique Purification
    const pipelineConfig = {
        pipelineType: 'purification',
        sidebarContent: PURIFICATION_SIDEBAR_CONTENT,
        availableIntervals: ['etapes'], // Chaque cellule = une étape
        phaseConfig: null,
        GraphComponent: ({ config, data }) => (
            purificationSteps.length > 1 ? (
                <div className="space-y-4">
                    <PurityEvolutionLine passes={purificationSteps} />
                    <MethodComparisonGraph methods={purificationSteps} />
                </div>
            ) : purificationSteps.length === 1 ? (
                <PurityComparisonGraph data={purificationSteps[0]} compact />
            ) : (
                <div className="text-center text-gray-400 py-8">
                    <p className="text-sm">Aucune étape enregistrée</p>
                </div>
            )
        ),
        Exporter: {
            export: (config, data, sidebarContent) => {
                return exportPurificationToCSV(
                    data.find(d => d.data)?.data || {},
                    purificationSteps
                )
            },
            download: (csvContent, filename = 'purification.csv') => {
                const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = filename
                link.click()
            }
        },
        validation: {
            required: ['purificationMethod']
        },
        customHeader: (
            <div className="flex items-center gap-3">
                <button
                    onClick={() => {
                        setEditingStep(null)
                        setShowStepModal(true)
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter une étape
                </button>
                {purificationSteps.length > 0 && (
                    <span className="text-sm text-gray-400">
                        {purificationSteps.length} étape{purificationSteps.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>
        ),
        sidebarFooter: (
            <>
                {/* Liste des étapes */}
                {purificationSteps.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-white mb-2">
                            Étapes enregistrées ({purificationSteps.length})
                        </h3>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {purificationSteps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition group"
                                >
                                    <button
                                        onClick={() => {
                                            setEditingStep(step)
                                            setShowStepModal(true)
                                        }}
                                        className="flex-1 text-left"
                                    >
                                        <div className="text-sm font-semibold text-white">
                                            Étape {index + 1}
                                        </div>
                                        <div className="text-xs text-gray-400 space-y-0.5">
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
                                            className="p-1 hover:bg-blue-600/20 rounded text-blue-400"
                                        >
                                            <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Supprimer cette étape ?')) {
                                                    setPurificationSteps(prev => prev.filter(s => s.id !== step.id))
                                                }
                                            }}
                                            className="p-1 hover:bg-red-600/20 rounded text-red-400"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </>
        )
    }

    return (
        <>
            <UnifiedPipelineDragDrop config={pipelineConfig} {...props} />

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
                allData={props.data || {}}
            />
        </>
    )
}
