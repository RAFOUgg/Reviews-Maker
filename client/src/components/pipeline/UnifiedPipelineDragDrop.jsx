/**
 * UnifiedPipelineDragDrop - Composant générique de pipeline unifié
 * 
 * Architecture conforme au CDC :
 * - Un seul composant pour tous les types de pipelines
 * - Seuls les contenus et données changent selon le type
 * - Configuration flexible des intervalles (jours, semaines, heures, phases)
 * - Support drag & drop universel
 * - Graphiques et exports personnalisables par type
 * 
 * @param {Object} config - Configuration de la pipeline
 * @param {string} config.pipelineType - Type : 'culture', 'curing', 'separation', 'purification', 'extraction', 'recipe'
 * @param {Object} config.sidebarContent - Structure {SECTION_NAME: {icon, label, color, items: [{id, label, type, ...}]}}
 * @param {Array} config.availableIntervals - Types disponibles ex: ['jours', 'semaines', 'phases']
 * @param {Object} config.phaseConfig - Si intervalType='phases': {phases: [{id, label, order}]}
 * @param {Function} config.GraphComponent - Composant graphique optionnel
 * @param {Function} config.Exporter - Classe exporter optionnelle (CSV, PDF, GIF)
 * @param {Object} config.validation - Règles validation optionnelles
 * 
 * @param {Object} timelineConfig - {intervalType, startDate, endDate, startPhase, endPhase, ...}
 * @param {Array} timelineData - [{cellIndex, data: {field_id: value}}]
 * @param {Function} onConfigChange - Callback config modifiée
 * @param {Function} onDataChange - Callback données modifiées
 */

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    ChevronDown, ChevronRight, Calendar, Clock, Layers,
    Download, Upload, Trash2, Copy, Settings, X, Check,
    Plus, Minus, Eye, EyeOff, BarChart3, FileText
} from 'lucide-react'
import FieldRenderer from './FieldRenderer'
import { LiquidCard, LiquidButton, LiquidAlert } from '../liquid'

const UnifiedPipelineDragDrop = ({
    config = {},
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange,
    initialData = {}
}) => {
    const {
        pipelineType = 'generic',
        sidebarContent = {},
        availableIntervals = ['jours'],
        phaseConfig = null,
        GraphComponent = null,
        Exporter = null,
        validation = {}
    } = config

    // États
    const [expandedSections, setExpandedSections] = useState(() => {
        const initial = {}
        Object.keys(sidebarContent).forEach((key, index) => {
            initial[key] = index === 0 // Premier ouvert par défaut
        })
        return initial
    })

    const [selectedCells, setSelectedCells] = useState([])
    const [showModal, setShowModal] = useState(false)
    const [modalData, setModalData] = useState(null)
    const [showConfig, setShowConfig] = useState(true)
    const [showGraphs, setShowGraphs] = useState(false)

    // Configuration timeline
    const [localConfig, setLocalConfig] = useState({
        intervalType: timelineConfig.intervalType || availableIntervals[0],
        startDate: timelineConfig.startDate || '',
        endDate: timelineConfig.endDate || '',
        startPhase: timelineConfig.startPhase || null,
        endPhase: timelineConfig.endPhase || null,
        ...timelineConfig
    })

    // Données timeline
    const [localData, setLocalData] = useState(timelineData || [])

    useEffect(() => {
        if (timelineConfig) setLocalConfig(prev => ({ ...prev, ...timelineConfig }))
    }, [timelineConfig])

    useEffect(() => {
        if (timelineData) setLocalData(timelineData)
    }, [timelineData])

    // Calcul du nombre de cases selon config
    const cellsCount = useMemo(() => {
        const { intervalType, startDate, endDate, startPhase, endPhase } = localConfig

        if (intervalType === 'phases' && phaseConfig && startPhase && endPhase) {
            const phases = phaseConfig.phases || []
            const startIdx = phases.findIndex(p => p.id === startPhase)
            const endIdx = phases.findIndex(p => p.id === endPhase)
            if (startIdx >= 0 && endIdx >= 0) {
                return endIdx - startIdx + 1
            }
        }

        if (intervalType === 'jours' && startDate && endDate) {
            const start = new Date(startDate)
            const end = new Date(endDate)
            const diffTime = Math.abs(end - start)
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
            return diffDays + 1
        }

        if (intervalType === 'semaines') {
            // Compter les semaines saisies
            const weeksInData = localData.map(d => d.weekNumber).filter(Boolean)
            return weeksInData.length > 0 ? Math.max(...weeksInData) : 0
        }

        return 0
    }, [localConfig, localData, phaseConfig])

    // Labels des cases
    const getCellLabel = (index) => {
        const { intervalType, startDate, startPhase } = localConfig

        if (intervalType === 'phases' && phaseConfig) {
            const phases = phaseConfig.phases || []
            const startIdx = phases.findIndex(p => p.id === startPhase)
            const phase = phases[startIdx + index]
            return phase ? phase.label : `Phase ${index + 1}`
        }

        if (intervalType === 'jours' && startDate) {
            const start = new Date(startDate)
            const current = new Date(start)
            current.setDate(current.getDate() + index)
            return `J${index + 1}`
        }

        if (intervalType === 'semaines') {
            return `S${index + 1}`
        }

        return `#${index + 1}`
    }

    // Sidebar sections formatées
    const sidebarSections = useMemo(() => {
        return Object.entries(sidebarContent).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            color: section.color,
            collapsed: !expandedSections[key],
            items: (section.items || []).map(item => ({
                ...item,
                key: item.id
            }))
        }))
    }, [sidebarContent, expandedSections])

    // Toggle section
    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }))
    }

    // Gestion config
    const handleConfigChange = (key, value) => {
        const newConfig = { ...localConfig, [key]: value }
        setLocalConfig(newConfig)
        onConfigChange?.(newConfig)
    }

    // Drag & Drop handlers
    const handleDragStart = (e, item, section) => {
        e.dataTransfer.effectAllowed = 'copy'
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'field',
            content: item,
            section: section
        }))
    }

    const handleDrop = (e, cellIndex) => {
        e.preventDefault()
        const data = JSON.parse(e.dataTransfer.getData('application/json'))

        // Ouvrir modal pour saisir valeur
        setModalData({ ...data, cellIndex })
        setShowModal(true)
    }

    const handleDragOver = (e) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'copy'
    }

    // Application données
    const applyData = (cellIndex, values) => {
        const newData = [...localData]
        const cellData = newData[cellIndex] || { cellIndex, data: {} }
        cellData.data = { ...cellData.data, ...values }
        newData[cellIndex] = cellData

        setLocalData(newData)
        onDataChange?.(newData)
        setShowModal(false)
    }

    // Sélection multiple
    const toggleCellSelection = (cellIndex) => {
        setSelectedCells(prev => {
            if (prev.includes(cellIndex)) {
                return prev.filter(i => i !== cellIndex)
            }
            return [...prev, cellIndex]
        })
    }

    // Copier données vers sélection
    const copyToSelection = (sourceCellIndex) => {
        if (selectedCells.length === 0) return

        const sourceData = localData[sourceCellIndex]?.data || {}
        const newData = [...localData]

        selectedCells.forEach(cellIndex => {
            if (!newData[cellIndex]) {
                newData[cellIndex] = { cellIndex, data: {} }
            }
            newData[cellIndex].data = { ...newData[cellIndex].data, ...sourceData }
        })

        setLocalData(newData)
        onDataChange?.(newData)
        setSelectedCells([])
    }

    // Export
    const handleExport = async () => {
        if (!Exporter) {
            alert('Aucun exporteur configuré pour cette pipeline')
            return
        }

        try {
            await Exporter.export(localConfig, localData, sidebarContent)
            alert('✅ Export réussi')
        } catch (error) {
            console.error('Export error:', error)
            alert('❌ Erreur lors de l\'export')
        }
    }

    // Validation timeline complète
    const isTimelineValid = useMemo(() => {
        if (localConfig.intervalType === 'phases') {
            return localConfig.startPhase && localConfig.endPhase
        }
        if (localConfig.intervalType === 'jours') {
            return localConfig.startDate && localConfig.endDate
        }
        return true
    }, [localConfig])

    return (
        <div className="h-full flex flex-col bg-gray-900 text-white">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold flex items-center gap-2 capitalize">
                            <span>Pipeline {pipelineType}</span>
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {Object.values(sidebarContent).reduce((acc, s) => acc + (s.items?.length || 0), 0)} champs •
                            {Object.keys(sidebarContent).length} sections
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {GraphComponent && (
                            <LiquidButton
                                variant="ghost"
                                leftIcon={<BarChart3 className="w-4 h-4" />}
                                onClick={() => setShowGraphs(!showGraphs)}
                            >
                                {showGraphs ? 'Masquer' : 'Graphiques'}
                            </LiquidButton>
                        )}

                        {Exporter && (
                            <LiquidButton
                                variant="secondary"
                                leftIcon={<Download className="w-4 h-4" />}
                                onClick={handleExport}
                                disabled={localData.length === 0}
                            >
                                Export
                            </LiquidButton>
                        )}
                    </div>
                </div>
            </div>

            {/* Configuration */}
            <LiquidCard className="m-4">
                <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowConfig(!showConfig)}
                >
                    <h3 className="font-semibold flex items-center gap-2">
                        <Settings className="w-5 h-5" />
                        Configuration de la période
                    </h3>
                    <motion.div animate={{ rotate: showConfig ? 180 : 0 }}>
                        <ChevronDown className="w-5 h-5" />
                    </motion.div>
                </div>

                <AnimatePresence>
                    {showConfig && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 space-y-4"
                        >
                            {/* Type d'intervalle */}
                            <div>
                                <label className="block text-sm font-medium mb-2">Type d'intervalle</label>
                                <div className="flex gap-2">
                                    {availableIntervals.map(interval => (
                                        <button
                                            key={interval}
                                            onClick={() => handleConfigChange('intervalType', interval)}
                                            className={`px-4 py-2 rounded-lg capitalize ${localConfig.intervalType === interval
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                                }`}
                                        >
                                            {interval}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Configuration selon type */}
                            {localConfig.intervalType === 'jours' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Date de début *</label>
                                        <input
                                            type="date"
                                            value={localConfig.startDate}
                                            onChange={(e) => handleConfigChange('startDate', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Date de fin *</label>
                                        <input
                                            type="date"
                                            value={localConfig.endDate}
                                            onChange={(e) => handleConfigChange('endDate', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                                        />
                                    </div>
                                </div>
                            )}

                            {localConfig.intervalType === 'phases' && phaseConfig && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phase de début *</label>
                                        <select
                                            value={localConfig.startPhase || ''}
                                            onChange={(e) => handleConfigChange('startPhase', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {phaseConfig.phases.map(phase => (
                                                <option key={phase.id} value={phase.id}>
                                                    {phase.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-2">Phase de fin *</label>
                                        <select
                                            value={localConfig.endPhase || ''}
                                            onChange={(e) => handleConfigChange('endPhase', e.target.value)}
                                            className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700"
                                        >
                                            <option value="">Sélectionner...</option>
                                            {phaseConfig.phases.map(phase => (
                                                <option key={phase.id} value={phase.id}>
                                                    {phase.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {cellsCount > 0 && (
                                <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                    <p className="text-sm text-green-400">
                                        ✓ Timeline configurée : {cellsCount} cases ({localConfig.intervalType})
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </LiquidCard>

            {/* Graphiques */}
            {showGraphs && GraphComponent && (
                <LiquidCard className="mx-4 mb-4">
                    <GraphComponent data={localData} config={localConfig} />
                </LiquidCard>
            )}

            {/* Zone principale */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar */}
                <div className="w-80 border-r border-gray-700 overflow-y-auto bg-gray-900/30">
                    <div className="p-4 space-y-2">
                        {sidebarSections.map(section => (
                            <div key={section.id} className="border border-gray-700 rounded-lg overflow-hidden">
                                <div
                                    className="p-3 flex items-center justify-between cursor-pointer hover:bg-gray-800/50"
                                    style={{ backgroundColor: section.collapsed ? 'transparent' : `${section.color}20` }}
                                    onClick={() => toggleSection(section.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{section.icon}</span>
                                        <span className="font-medium">{section.label}</span>
                                        <span className="text-xs text-gray-400">({section.items.length})</span>
                                    </div>
                                    <motion.div animate={{ rotate: section.collapsed ? 0 : 90 }}>
                                        <ChevronRight className="w-4 h-4" />
                                    </motion.div>
                                </div>

                                <AnimatePresence>
                                    {!section.collapsed && (
                                        <motion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: 'auto' }}
                                            exit={{ height: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="p-2 space-y-1">
                                                {section.items.map(item => (
                                                    <div
                                                        key={item.key}
                                                        draggable
                                                        onDragStart={(e) => handleDragStart(e, item, section)}
                                                        className="p-2 rounded cursor-move hover:bg-gray-700/50 border border-transparent hover:border-gray-600"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {item.icon && <span className="text-xs">{item.icon}</span>}
                                                            <span className="text-sm">{item.label}</span>
                                                        </div>
                                                        {item.tooltip && (
                                                            <p className="text-xs text-gray-400 mt-1">{item.tooltip}</p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 overflow-auto p-4">
                    {!isTimelineValid ? (
                        <div className="h-full flex items-center justify-center">
                            <LiquidAlert variant="warning">
                                ⚠️ Configurez la période pour voir la timeline
                            </LiquidAlert>
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {Array.from({ length: cellsCount }, (_, i) => {
                                const cellData = localData[i]?.data || {}
                                const fieldsCount = Object.keys(cellData).length
                                const isSelected = selectedCells.includes(i)

                                return (
                                    <div
                                        key={i}
                                        onDrop={(e) => handleDrop(e, i)}
                                        onDragOver={handleDragOver}
                                        onClick={() => toggleCellSelection(i)}
                                        className={`
                                            relative p-3 rounded-lg border-2 min-h-[100px] cursor-pointer
                                            ${isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-gray-600'}
                                            ${fieldsCount > 0 ? 'bg-green-500/10' : 'bg-gray-800/30'}
                                        `}
                                    >
                                        <div className="text-xs font-bold mb-2">{getCellLabel(i)}</div>
                                        <div className="text-xs text-gray-400">
                                            {fieldsCount > 0 ? `${fieldsCount} champ${fieldsCount > 1 ? 's' : ''}` : 'Vide'}
                                        </div>

                                        {fieldsCount > 0 && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    copyToSelection(i)
                                                }}
                                                className="absolute top-1 right-1 p-1 bg-gray-700 rounded hover:bg-gray-600"
                                                title="Copier vers sélection"
                                            >
                                                <Copy className="w-3 h-3" />
                                            </button>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal saisie valeur */}
            {showModal && modalData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <LiquidCard className="min-w-[400px] max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold">
                                Configuration - {getCellLabel(modalData.cellIndex)}
                            </h3>
                            <button onClick={() => setShowModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <FieldRenderer
                                field={modalData.content}
                                value={localData[modalData.cellIndex]?.data?.[modalData.content.key]}
                                onChange={(value) => {
                                    applyData(modalData.cellIndex, { [modalData.content.key]: value })
                                }}
                            />
                        </div>

                        <div className="flex gap-2 mt-4">
                            <LiquidButton variant="ghost" onClick={() => setShowModal(false)} className="flex-1">
                                Fermer
                            </LiquidButton>
                        </div>
                    </LiquidCard>
                </div>
            )}
        </div>
    )
}

export default UnifiedPipelineDragDrop
