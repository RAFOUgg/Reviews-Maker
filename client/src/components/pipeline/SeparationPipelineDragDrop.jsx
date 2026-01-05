import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Plus, Download, BarChart3, Trash2 } from 'lucide-react'
import PipelineDragDropView from './PipelineDragDropView'
import {
    SEPARATION_SIDEBAR_CONTENT,
    SEPARATION_PASS_STRUCTURE,
    getAllSeparationFieldIds,
    getSeparationFieldById,
    shouldShowField,
    getFieldsBySeparationType
} from '../../config/separationSidebarContent'
import SeparationPassGraph, { SeparationYieldComparison } from './SeparationPassGraph'

/**
 * SeparationPipelineDragDrop - Pipeline Séparation Hash
 * 
 * Features:
 * - Gestion multi-passes (1-10 washes)
 * - Support Ice-Water et Dry-Sift
 * - Graphiques rendement par passe
 * - Calculs automatiques rendement total
 * - Export PDF rapport
 */
const SeparationPipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange,
    initialData = {},
    onExportPDF
}) => {
    const [expandedSections, setExpandedSections] = useState({
        CONFIGURATION: true,
        MATIERE_PREMIERE: true,
        ICE_WATER: false,
        DRY_SIFT: false,
        RENDEMENT: true,
        NOTES: false
    })

    const [separationData, setSeparationData] = useState(initialData)
    const [passes, setPasses] = useState([])
    const [showPassModal, setShowPassModal] = useState(false)
    const [editingPass, setEditingPass] = useState(null)

    useEffect(() => {
        if (initialData) {
            setSeparationData(initialData)
            if (initialData.passes) {
                setPasses(initialData.passes)
            }
        }
    }, [initialData])

    // Auto-expand section selon type de séparation
    useEffect(() => {
        const sepType = separationData.separationType
        if (sepType === 'ice-water' || sepType === 'ice-o-lator') {
            setExpandedSections(prev => ({
                ...prev,
                ICE_WATER: true,
                DRY_SIFT: false
            }))
        } else if (sepType === 'dry-sift') {
            setExpandedSections(prev => ({
                ...prev,
                ICE_WATER: false,
                DRY_SIFT: true
            }))
        }
    }, [separationData.separationType])

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }))
    }

    const handleDataChange = (newData) => {
        const updated = { ...separationData, ...newData, passes }
        setSeparationData(updated)
        onDataChange?.(updated)
    }

    const handleAddPass = () => {
        const newPass = {
            ...SEPARATION_PASS_STRUCTURE,
            passNumber: passes.length + 1
        }
        setEditingPass(newPass)
        setShowPassModal(true)
    }

    const handleEditPass = (pass) => {
        setEditingPass(pass)
        setShowPassModal(true)
    }

    const handleSavePass = (passData) => {
        const updated = editingPass.passNumber <= passes.length
            ? passes.map(p => p.passNumber === passData.passNumber ? passData : p)
            : [...passes, passData]

        setPasses(updated)
        handleDataChange({ passes: updated })
        setShowPassModal(false)
        setEditingPass(null)
    }

    const handleDeletePass = (passNumber) => {
        if (confirm(`Supprimer la passe #${passNumber} ?`)) {
            const updated = passes
                .filter(p => p.passNumber !== passNumber)
                .map((p, idx) => ({ ...p, passNumber: idx + 1 }))

            setPasses(updated)
            handleDataChange({ passes: updated })
        }
    }

    // Convert SEPARATION_SIDEBAR_CONTENT to sidebarContent format
    const sidebarSections = Object.entries(SEPARATION_SIDEBAR_CONTENT).map(([key, section]) => ({
        id: key,
        icon: section.icon,
        label: section.label,
        color: section.color,
        collapsed: !expandedSections[key],
        items: section.items
            .filter(item => shouldShowField(item, separationData))
            .map(item => ({
                key: item.id,
                label: item.label,
                icon: item.icon,
                type: item.type,
                unit: item.unit,
                tooltip: item.tooltip,
                options: item.options,
                min: item.min,
                max: item.max,
                step: item.step,
                defaultValue: item.defaultValue,
                computeFrom: item.computeFrom,
                computeFn: item.computeFn,
                dependsOn: item.dependsOn,
                showIf: item.showIf,
                suggestions: item.suggestions,
                maxLength: item.maxLength
            }))
    }))

    return (
        <div className="h-full flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>🔬</span>
                            Pipeline Séparation (Hash)
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {getAllSeparationFieldIds().length} champs • {passes.length} passes
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Bouton add pass */}
                        <button
                            onClick={handleAddPass}
                            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition text-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Ajouter une passe
                        </button>

                        {/* Bouton graphiques */}
                        <button
                            onClick={() => setExpandedSections(prev => ({ ...prev, RENDEMENT: !prev.RENDEMENT }))}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Graphiques
                        </button>

                        {/* Bouton export PDF */}
                        {onExportPDF && (
                            <button
                                onClick={() => onExportPDF({ ...separationData, passes })}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm"
                                disabled={passes.length === 0}
                            >
                                <Download className="w-4 h-4" />
                                Export PDF
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar gauche */}
                <div className="w-80 border-r border-gray-700 bg-gray-900/30 overflow-y-auto">
                    <div className="p-4 space-y-2">
                        <div className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
                            <span>⚙️</span>
                            CONFIGURATION SÉPARATION
                        </div>

                        {Object.entries(SEPARATION_SIDEBAR_CONTENT).map(([sectionKey, section]) => {
                            const visibleItems = section.items.filter(item =>
                                shouldShowField(item, separationData)
                            )

                            if (visibleItems.length === 0) return null

                            return (
                                <div key={sectionKey} className="mb-2">
                                    <button
                                        onClick={() => toggleSection(sectionKey)}
                                        className={`
                                            w-full flex items-center justify-between px-3 py-2.5 rounded-lg
                                            transition-all duration-200
                                            ${expandedSections[sectionKey]
                                                ? 'bg-gray-800 border border-gray-700'
                                                : 'bg-gray-800/50 hover:bg-gray-800 border border-transparent'
                                            }
                                        `}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{section.icon}</span>
                                            <span className="text-sm font-semibold text-white">
                                                {section.label}
                                            </span>
                                            <span className="text-xs text-gray-500">
                                                ({visibleItems.length})
                                            </span>
                                        </div>
                                        {expandedSections[sectionKey] ? (
                                            <ChevronDown className="w-4 h-4 text-gray-400" />
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-gray-400" />
                                        )}
                                    </button>

                                    <AnimatePresence>
                                        {expandedSections[sectionKey] && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="mt-2 space-y-1 pl-2">
                                                    {visibleItems.map(item => {
                                                        const hasValue = separationData[item.id] !== null &&
                                                            separationData[item.id] !== undefined &&
                                                            separationData[item.id] !== ''

                                                        return (
                                                            <div
                                                                key={item.id}
                                                                draggable={item.type !== 'info' && item.type !== 'computed'}
                                                                onDragStart={(e) => {
                                                                    if (item.type === 'info' || item.type === 'computed') return
                                                                    e.dataTransfer.effectAllowed = 'copy'
                                                                    e.dataTransfer.setData('application/json', JSON.stringify({
                                                                        type: 'field',
                                                                        field: item
                                                                    }))
                                                                }}
                                                                className={`
                                                                    flex items-center gap-2 px-3 py-2 rounded-md
                                                                    transition-all
                                                                    ${item.type !== 'info' && item.type !== 'computed' ? 'cursor-move' : ''}
                                                                    ${hasValue
                                                                        ? 'bg-green-900/20 border border-green-700/50'
                                                                        : item.type === 'info' || item.type === 'computed'
                                                                            ? 'bg-blue-900/20 border border-blue-700/50'
                                                                            : 'bg-gray-800/50 hover:bg-gray-700 border border-transparent'
                                                                    }
                                                                `}
                                                                title={item.tooltip}
                                                            >
                                                                <span className="text-base">{item.icon}</span>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="text-xs font-medium text-gray-300 truncate">
                                                                        {item.label}
                                                                    </div>
                                                                    {hasValue && (
                                                                        <div className="text-xs text-green-400 truncate">
                                                                            ✓ Renseigné
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {item.unit && (
                                                                    <span className="text-xs text-gray-500">{item.unit}</span>
                                                                )}
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            )
                        })}

                        {/* Section graphiques rendement */}
                        {passes.length > 0 && (
                            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <h3 className="text-sm font-semibold text-white mb-3">Rendement</h3>
                                <SeparationPassGraph passes={passes} mode="compact" />
                                <div className="mt-4">
                                    <SeparationYieldComparison
                                        passes={passes}
                                        batchSize={separationData.batchSize || 0}
                                    />
                                </div>
                            </div>
                        )}

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
                                                onClick={() => handleEditPass(pass)}
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
                                                onClick={() => handleDeletePass(pass.passNumber)}
                                                className="p-1 hover:bg-red-600/20 rounded transition"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline Pipeline */}
                <div className="flex-1 overflow-hidden">
                    <PipelineDragDropView
                        type="separation"
                        sidebarContent={sidebarSections}
                        timelineConfig={timelineConfig}
                        timelineData={timelineData}
                        onConfigChange={onConfigChange}
                        onDataChange={handleDataChange}
                        generalData={separationData}
                        onGeneralDataChange={handleDataChange}
                    />
                </div>
            </div>

            {/* Modal ajout/édition passe */}
            {showPassModal && (
                <PassModal
                    pass={editingPass}
                    onSave={handleSavePass}
                    onClose={() => {
                        setShowPassModal(false)
                        setEditingPass(null)
                    }}
                />
            )}
        </div>
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
