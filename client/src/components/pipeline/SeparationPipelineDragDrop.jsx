import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Trash2 } from 'lucide-react'
import UnifiedPipelineDragDrop from './UnifiedPipelineDragDrop'
import { SEPARATION_SIDEBAR_CONTENT, SEPARATION_PASS_STRUCTURE } from '../../config/separationSidebarContent'
import SeparationPassGraph, { SeparationYieldComparison } from './SeparationPassGraph'

/**
 * SeparationPipelineDragDrop - Wrapper pour pipeline Séparation Hash
 * 
 * Particularités :
 * - Gestion multi-passes (1-10 washes)
 * - Support Ice-Water et Dry-Sift
 * - Graphiques rendement par passe
 * - Modal édition passe incluse
 */
const SeparationPipelineDragDrop = (props) => {
    const [passes, setPasses] = useState([])
    const [showPassModal, setShowPassModal] = useState(false)
    const [editingPass, setEditingPass] = useState(null)

    // Configuration spécifique Séparation
    const pipelineConfig = {
        pipelineType: 'separation',
        sidebarContent: SEPARATION_SIDEBAR_CONTENT,
        availableIntervals: ['passes'], // Chaque cellule = une passe
        phaseConfig: null,
        GraphComponent: ({ config, data, sidebarContent }) => (
            passes.length > 0 ? (
                <div className="space-y-4">
                    <SeparationPassGraph passes={passes} mode="compact" />
                    <SeparationYieldComparison
                        passes={passes}
                        batchSize={data.find(d => d.data?.batchSize)?.data?.batchSize || 0}
                    />
                </div>
            ) : (
                <div className="text-center text-gray-400 py-8">
                    <p className="text-sm">Aucune passe enregistrée</p>
                </div>
            )
        ),
        Exporter: null, // TODO: Ajouter export PDF
        validation: {
            required: ['separationType', 'batchSize']
        },
        customHeader: (
            <div className="flex items-center gap-3">
                <button
                    onClick={() => {
                        setEditingPass({
                            ...SEPARATION_PASS_STRUCTURE,
                            passNumber: passes.length + 1
                        })
                        setShowPassModal(true)
                    }}
                    className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Ajouter une passe
                </button>
                {passes.length > 0 && (
                    <span className="text-sm text-gray-400">
                        {passes.length} passe{passes.length > 1 ? 's' : ''}
                    </span>
                )}
            </div>
        ),
        sidebarFooter: (
            <>
                {/* Liste des passes */}
                {passes.length > 0 && (
                    <div className="mt-6">
                        <h3 className="text-sm font-semibold text-white mb-2">Passes enregistrées</h3>
                        <div className="space-y-2">
                            {passes.map(pass => (
                                <div
                                    key={pass.passNumber}
                                    className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-700 hover:border-gray-600 transition"
                                >
                                    <button
                                        onClick={() => {
                                            setEditingPass(pass)
                                            setShowPassModal(true)
                                        }}
                                        className="flex-1 text-left"
                                    >
                                        <div className="text-sm font-semibold text-white">
                                            Passe #{pass.passNumber}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            {pass.weight}g • {pass.microns}µm • {pass.quality}/10
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (confirm(`Supprimer la passe #${pass.passNumber} ?`)) {
                                                const updated = passes
                                                    .filter(p => p.passNumber !== pass.passNumber)
                                                    .map((p, idx) => ({ ...p, passNumber: idx + 1 }))
                                                setPasses(updated)
                                            }
                                        }}
                                        className="p-1 hover:bg-red-600/20 rounded transition"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-400" />
                                    </button>
                                </div>
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

            {/* Modal ajout/édition passe */}
            {showPassModal && (
                <PassModal
                    pass={editingPass}
                    onSave={(passData) => {
                        const updated = editingPass.passNumber <= passes.length
                            ? passes.map(p => p.passNumber === passData.passNumber ? passData : p)
                            : [...passes, passData]
                        setPasses(updated)
                        setShowPassModal(false)
                        setEditingPass(null)
                    }}
                    onClose={() => {
                        setShowPassModal(false)
                        setEditingPass(null)
                    }}
                />
            )}
        </>
    )
}

/**
 * Modal d'édition de passe
 */
const PassModal = ({ pass, onSave, onClose }) => {
    const [formData, setFormData] = useState(pass || SEPARATION_PASS_STRUCTURE)

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleSubmit = (e) => {
        e.preventDefault()
        onSave(formData)
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-gray-900 rounded-lg border border-gray-700 p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
                <h2 className="text-xl font-bold text-white mb-4">
                    {pass.passNumber ? `Passe #${pass.passNumber}` : 'Nouvelle passe'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Durée (min)
                            </label>
                            <input
                                type="number"
                                value={formData.duration}
                                onChange={(e) => handleChange('duration', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                min="1"
                                max="120"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Microns
                            </label>
                            <input
                                type="text"
                                value={formData.microns}
                                onChange={(e) => handleChange('microns', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                placeholder="120"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Poids obtenu (g)
                            </label>
                            <input
                                type="number"
                                value={formData.weight}
                                onChange={(e) => handleChange('weight', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                min="0"
                                step="0.01"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Qualité (/10)
                            </label>
                            <input
                                type="number"
                                value={formData.quality}
                                onChange={(e) => handleChange('quality', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                min="0"
                                max="10"
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Melt (/10)
                            </label>
                            <input
                                type="number"
                                value={formData.melt}
                                onChange={(e) => handleChange('melt', Number(e.target.value))}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                min="0"
                                max="10"
                                step="0.1"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Couleur
                            </label>
                            <input
                                type="text"
                                value={formData.color}
                                onChange={(e) => handleChange('color', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                placeholder="Blonde, brune..."
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Texture
                            </label>
                            <input
                                type="text"
                                value={formData.texture}
                                onChange={(e) => handleChange('texture', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                placeholder="Sableuse, grasse..."
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-300 mb-1">
                                Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleChange('notes', e.target.value)}
                                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
                                rows="3"
                                placeholder="Observations..."
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition text-white"
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-white"
                        >
                            Enregistrer
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

export default SeparationPipelineDragDrop
