/**
 * PurificationPipelineDragDrop.jsx
 * 
 * Pipeline principal pour gestion de purification
 * - Sidebar hiérarchique avec sections conditionnelles
 * - Sélection méthode de purification
 * - Gestion multi-passes
 * - Graphiques intégrés
 * - Export CSV
 * 
 * Conforme CDC - Phase 4
 */

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, BarChart3, Download, Edit2, Trash2, ChevronDown, ChevronRight, Beaker, AlertCircle } from 'lucide-react'
import PipelineDragDropView from './PipelineDragDropView'
import { PURIFICATION_SIDEBAR_CONTENT, shouldShowField, getFieldsByPurificationMethod } from '../../config/purificationSidebarContent'
import { PurityComparisonGraph, PurityEvolutionLine, MethodComparisonGraph } from './PurityGraph'
import { PurificationMethodModal } from './PurificationMethodForm'
import { exportPurificationToCSV } from '../../utils/PurificationCSVExporter'

export default function PurificationPipelineDragDrop({
    data = {},
    onChange,
    intervalType = 'days',
    startDate,
    endDate
}) {
    // États sidebar
    const [expandedSections, setExpandedSections] = useState({
        CONFIGURATION: true,
        SOLVANTS: false,
        WINTERIZATION: false,
        CHROMATOGRAPHY: false,
        DISTILLATION: false,
        DECARBOXYLATION: false,
        FILTRATION: false,
        QUALITE: true,
        RENDEMENT: true,
        NOTES: false
    })

    // États purification
    const [purificationSteps, setPurificationSteps] = useState([])
    const [showStepModal, setShowStepModal] = useState(false)
    const [editingStep, setEditingStep] = useState(null)
    const [showGraphs, setShowGraphs] = useState(false)

    // Auto-expand sections selon méthode
    useEffect(() => {
        if (data.purificationMethod) {
            const method = data.purificationMethod

            setExpandedSections(prev => {
                const newState = { ...prev }

                // Reset method-specific sections
                newState.WINTERIZATION = false
                newState.CHROMATOGRAPHY = false
                newState.DISTILLATION = false
                newState.DECARBOXYLATION = false
                newState.FILTRATION = false
                newState.SOLVANTS = false

                // Expand relevant sections
                if (method === 'winterization') {
                    newState.WINTERIZATION = true
                    newState.SOLVANTS = true
                } else if (['chromatography', 'flash-chromatography', 'hplc'].includes(method)) {
                    newState.CHROMATOGRAPHY = true
                    newState.SOLVANTS = true
                } else if (['fractional-distillation', 'short-path-distillation', 'molecular-distillation'].includes(method)) {
                    newState.DISTILLATION = true
                } else if (method === 'decarboxylation') {
                    newState.DECARBOXYLATION = true
                } else if (method === 'filtration') {
                    newState.FILTRATION = true
                }

                return newState
            })
        }
    }, [data.purificationMethod])

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }))
    }

    const handleAddStep = () => {
        setEditingStep(null)
        setShowStepModal(true)
    }

    const handleEditStep = (step) => {
        setEditingStep(step)
        setShowStepModal(true)
    }

    const handleSaveStep = (stepData) => {
        if (editingStep) {
            // Update existing step
            setPurificationSteps(prev =>
                prev.map(s => s.id === editingStep.id ? { ...stepData, id: s.id } : s)
            )
        } else {
            // Add new step
            setPurificationSteps(prev => [
                ...prev,
                { ...stepData, id: Date.now(), timestamp: new Date().toISOString() }
            ])
        }
    }

    const handleDeleteStep = (stepId) => {
        if (confirm('Supprimer cette étape de purification ?')) {
            setPurificationSteps(prev => prev.filter(s => s.id !== stepId))
        }
    }

    const handleExportCSV = () => {
        exportPurificationToCSV(data, purificationSteps)
    }

    const renderSidebar = () => {
        return (
            <div className="space-y-3">
                {/* Configuration rapide */}
                <div className="glass-panel p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Beaker className="w-4 h-4 text-purple-400" />
                            Pipeline Purification
                        </h3>
                    </div>

                    <div className="text-xs text-gray-400">
                        Méthode: <span className="text-white font-medium">
                            {PURIFICATION_SIDEBAR_CONTENT.CONFIGURATION.items[0].options.find(
                                opt => opt.value === data.purificationMethod
                            )?.label || 'Non définie'}
                        </span>
                    </div>

                    {purificationSteps.length > 0 && (
                        <div className="text-xs text-gray-400">
                            Étapes: <span className="text-purple-400 font-medium">{purificationSteps.length}</span>
                        </div>
                    )}
                </div>

                {/* Graphiques compacts */}
                {data.purity_before && data.purity_after && (
                    <div className="glass-panel p-3">
                        <PurityComparisonGraph data={data} compact />
                    </div>
                )}

                {/* Liste des étapes */}
                {purificationSteps.length > 0 && (
                    <div className="glass-panel p-3 space-y-2">
                        <div className="text-xs font-semibold text-white mb-2">
                            Étapes enregistrées ({purificationSteps.length})
                        </div>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                            {purificationSteps.map((step, index) => (
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="glass-panel p-2 hover:bg-white/5 transition-colors group"
                                >
                                    <div className="flex items-center justify-between mb-1">
                                        <div className="text-xs font-medium text-white">
                                            Étape {index + 1}
                                        </div>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEditStep(step)}
                                                className="p-1 hover:bg-blue-500/20 rounded text-blue-400"
                                            >
                                                <Edit2 className="w-3 h-3" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteStep(step.id)}
                                                className="p-1 hover:bg-red-500/20 rounded text-red-400"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 space-y-0.5">
                                        <div>Pureté: {step.purity_before}% → {step.purity_after}%</div>
                                        <div>Rendement: {step.weight_input > 0 ? ((step.weight_output / step.weight_input) * 100).toFixed(1) : 0}%</div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Sections configurables */}
                {Object.entries(PURIFICATION_SIDEBAR_CONTENT).map(([sectionKey, section]) => {
                    // Vérifier si la section doit être affichée
                    if (sectionKey === 'WINTERIZATION' && data.purificationMethod !== 'winterization') return null
                    if (sectionKey === 'CHROMATOGRAPHY' && !['chromatography', 'flash-chromatography', 'hplc'].includes(data.purificationMethod)) return null
                    if (sectionKey === 'DISTILLATION' && !['fractional-distillation', 'short-path-distillation', 'molecular-distillation'].includes(data.purificationMethod)) return null
                    if (sectionKey === 'DECARBOXYLATION' && data.purificationMethod !== 'decarboxylation') return null
                    if (sectionKey === 'FILTRATION' && data.purificationMethod !== 'filtration') return null
                    if (sectionKey === 'SOLVANTS' && !['winterization', 'chromatography', 'flash-chromatography', 'hplc', 'liquid-liquid-extraction', 'recrystallization'].includes(data.purificationMethod)) return null

                    const visibleFields = section.items.filter(field => shouldShowField(field, data))
                    if (visibleFields.length === 0) return null

                    const isExpanded = expandedSections[sectionKey]

                    return (
                        <div key={sectionKey} className="glass-panel overflow-hidden">
                            <button
                                onClick={() => toggleSection(sectionKey)}
                                className="w-full p-3 flex items-center justify-between hover:bg-white/5 transition-colors"
                                style={{ borderLeftColor: section.color, borderLeftWidth: '3px' }}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{section.icon}</span>
                                    <span className="text-sm font-semibold text-white">{section.label}</span>
                                    <span className="text-xs text-gray-400">({visibleFields.length})</span>
                                </div>
                                {isExpanded ? (
                                    <ChevronDown className="w-4 h-4 text-gray-400" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-gray-400" />
                                )}
                            </button>

                            <AnimatePresence>
                                {isExpanded && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="p-3 pt-0 space-y-2 text-xs">
                                            {visibleFields.map(field => (
                                                <div key={field.id} className="text-gray-400">
                                                    <span className="text-white">{field.icon}</span> {field.label}
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )
                })}
            </div>
        )
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header actions */}
            <div className="flex items-center gap-3 mb-4">
                <button
                    onClick={handleAddStep}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-blue-500/30"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter une étape
                </button>

                {purificationSteps.length > 0 && (
                    <>
                        <button
                            onClick={() => setShowGraphs(!showGraphs)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30"
                        >
                            <BarChart3 className="w-4 h-4" />
                            {showGraphs ? 'Masquer' : 'Afficher'} Graphiques
                        </button>

                        <button
                            onClick={handleExportCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-green-500/30"
                        >
                            <Download className="w-4 h-4" />
                            Export CSV
                        </button>
                    </>
                )}
            </div>

            {/* Graphiques détaillés */}
            <AnimatePresence>
                {showGraphs && purificationSteps.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-4 space-y-4"
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <PurityEvolutionLine passes={purificationSteps} />
                            <MethodComparisonGraph methods={purificationSteps} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pipeline principal */}
            <div className="flex-1 min-h-0">
                <PipelineDragDropView
                    data={data}
                    onChange={onChange}
                    sidebarContent={renderSidebar()}
                    intervalType={intervalType}
                    startDate={startDate}
                    endDate={endDate}
                    emptyState={
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <Beaker className="w-16 h-16 text-purple-400/50 mb-4" />
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Pipeline Purification
                            </h3>
                            <p className="text-gray-400 mb-6 max-w-md">
                                Documentez vos processus de purification : winterisation, chromatographie, distillation, etc.
                                Ajoutez des étapes pour suivre l'évolution de la pureté.
                            </p>
                            <button
                                onClick={handleAddStep}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30"
                            >
                                <Plus className="w-5 h-5" />
                                Créer la première étape
                            </button>
                        </div>
                    }
                />
            </div>

            {/* Modal étape */}
            <PurificationMethodModal
                isOpen={showStepModal}
                onClose={() => {
                    setShowStepModal(false)
                    setEditingStep(null)
                }}
                onSave={handleSaveStep}
                initialData={editingStep || {}}
                allData={data}
            />
        </div>
    )
}
