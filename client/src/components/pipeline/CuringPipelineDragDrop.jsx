import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, TrendingUp, Download } from 'lucide-react'
import PipelineDragDropView from './PipelineDragDropView'
import {
    CURING_SIDEBAR_CONTENT,
    getAllCuringFieldIds,
    getCuringFieldById,
    shouldShowField,
    CURING_CELL_DATA_STRUCTURE
} from '../../config/curingSidebarContent'
import CuringEvolutionGraph, { CuringMultiGraph } from './CuringEvolutionGraph'
import { exportCuringEvolutionToGIF, downloadCuringGIF } from '../../utils/CuringGIFExporter'

/**
 * CuringPipelineDragDrop - Pipeline Curing avec évolution temporelle notes /10
 * 
 * Particularités :
 * - Chaque cellule stocke notes Visuel/Odeurs/Goûts/Effets
 * - Affichage mini-graphiques évolution dans cellules
 * - Export GIF animation évolution
 */
const CuringPipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange,
    initialData = {},
    onExportGIF
}) => {
    const [expandedSections, setExpandedSections] = useState({
        CONFIGURATION: true,
        CONTAINER: false,
        ENVIRONMENT: false,
        EVOLUTION: true,
        NOTES: false
    })

    const [curingData, setCuringData] = useState(initialData)
    const [selectedCell, setSelectedCell] = useState(null)
    const [evolutionData, setEvolutionData] = useState({
        visual: [],
        odor: [],
        taste: [],
        effects: [],
        moisture: [],
        weight: []
    })
    const [isExportingGIF, setIsExportingGIF] = useState(false)
    const [exportProgress, setExportProgress] = useState(0)

    useEffect(() => {
        if (initialData) {
            setCuringData(initialData)
        }
    }, [initialData])

    // Extraire données d'évolution depuis timeline
    useEffect(() => {
        if (timelineData && timelineData.length > 0) {
            const evolution = {
                visual: [],
                odor: [],
                taste: [],
                effects: [],
                moisture: [],
                weight: []
            }

            timelineData.forEach((cell, index) => {
                if (cell && cell.data) {
                    const timestamp = cell.timestamp || new Date(Date.now() + index * 86400000).toISOString()

                    if (cell.data.visual?.overall) {
                        evolution.visual.push({
                            timestamp,
                            value: cell.data.visual.overall
                        })
                    }
                    if (cell.data.odor?.overall) {
                        evolution.odor.push({
                            timestamp,
                            value: cell.data.odor.overall
                        })
                    }
                    if (cell.data.taste?.overall) {
                        evolution.taste.push({
                            timestamp,
                            value: cell.data.taste.overall
                        })
                    }
                    if (cell.data.effects?.overall) {
                        evolution.effects.push({
                            timestamp,
                            value: cell.data.effects.overall
                        })
                    }
                    if (cell.data.moisture) {
                        evolution.moisture.push({
                            timestamp,
                            value: cell.data.moisture
                        })
                    }
                    if (cell.data.weight) {
                        evolution.weight.push({
                            timestamp,
                            value: cell.data.weight
                        })
                    }
                }
            })

            setEvolutionData(evolution)
        }
    }, [timelineData])

    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }))
    }

    // Convert CURING_SIDEBAR_CONTENT to sidebarContent format
    const sidebarSections = Object.entries(CURING_SIDEBAR_CONTENT).map(([key, section]) => ({
        id: key,
        icon: section.icon,
        label: section.label,
        color: section.color,
        collapsed: !expandedSections[key],
        items: section.items.map(item => ({
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
            zones: item.zones,
            maxLength: item.maxLength
        }))
    }))

    const handleDataChange = (newData) => {
        setCuringData(prev => ({ ...prev, ...newData }))
        onDataChange?.(newData)
    }

    // Obtenir valeurs actuelles pour graphiques
    const getCurrentValues = () => {
        if (!selectedCell || !timelineData[selectedCell]) return {}

        const cellData = timelineData[selectedCell]?.data || {}
        return {
            visual: cellData.visual?.overall || 0,
            odor: cellData.odor?.overall || 0,
            taste: cellData.taste?.overall || 0,
            effects: cellData.effects?.overall || 0
        }
    }

    // Handler export GIF
    const handleExportGIF = async () => {
        if (timelineData.length === 0) {
            alert('❌ Aucune donnée à exporter')
            return
        }

        setIsExportingGIF(true)
        setExportProgress(0)

        try {
            const blob = await exportCuringEvolutionToGIF(evolutionData, {
                delay: 300,
                quality: 10,
                width: 1200,
                height: 800,
                onProgress: (percent) => {
                    setExportProgress(percent)
                }
            })

            const filename = `curing-evolution-${Date.now()}.gif`
            downloadCuringGIF(blob, filename)

            alert('✅ Export GIF réussi !')
        } catch (error) {
            console.error('Export GIF error:', error)
            alert('❌ Erreur lors de l\'export GIF')
        } finally {
            setIsExportingGIF(false)
            setExportProgress(0)
        }
    }

    return (
        <PipelineDragDropView
            sidebarSections={sidebarSections}
            timelineConfig={timelineConfig}
            timelineData={timelineData}
            onConfigChange={onConfigChange}
            onDataChange={handleDataChange}
            emptyMessage="Configurez une période de curing/maturation pour commencer"
        >
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>🌾</span>
                            Pipeline Curing / Maturation
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {getAllCuringFieldIds().length} champs • Évolution temporelle des notes
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                        {/* Bouton évolution */}
                        <button
                            onClick={() => setSelectedCell(null)}
                            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition text-sm"
                        >
                            <TrendingUp className="w-4 h-4" />
                            Voir évolution
                        </button>

                        {/* Bouton export GIF */}
                        {onExportGIF && (
                            <button
                                onClick={() => onExportGIF(evolutionData)}
                                className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition text-sm"
                                disabled={timelineData.length === 0}
                            >
                                <Download className="w-4 h-4" />
                                Export GIF
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
                            CONFIGURATION CURING
                        </div>

                        {Object.entries(CURING_SIDEBAR_CONTENT).map(([sectionKey, section]) => (
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
                                            ({section.items.length})
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
                                                {section.items.map(item => {
                                                    const shouldShow = shouldShowField(item, curingData)
                                                    if (!shouldShow) return null

                                                    const hasValue = curingData[item.id] !== null && 
                                                                   curingData[item.id] !== undefined && 
                                                                   curingData[item.id] !== ''

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            draggable={item.type !== 'info'}
                                                            onDragStart={(e) => {
                                                                if (item.type === 'info') return
                                                                e.dataTransfer.effectAllowed = 'copy'
                                                                e.dataTransfer.setData('application/json', JSON.stringify({
                                                                    type: 'field',
                                                                    field: item
                                                                }))
                                                            }}
                                                            className={`
                                                                flex items-center gap-2 px-3 py-2 rounded-md
                                                                transition-all
                                                                ${item.type !== 'info' ? 'cursor-move' : ''}
                                                                ${hasValue 
                                                                    ? 'bg-green-900/20 border border-green-700/50' 
                                                                    : item.type === 'info'
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
                        ))}

                        {/* Section graphiques évolution */}
                        {timelineData.length > 0 && (
                            <div className="mt-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4" />
                                    Évolution globale
                                </h3>
                                <CuringMultiGraph
                                    evolutionData={evolutionData}
                                    currentValues={getCurrentValues()}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Timeline Pipeline */}
                <div className="flex-1 overflow-hidden">
                    <PipelineDragDropView
                        type="curing"
                        sidebarContent={sidebarSections}
                        timelineConfig={timelineConfig}
                        timelineData={timelineData}
                        onConfigChange={onConfigChange}
                        onDataChange={handleDataChange}
                        generalData={curingData}
                        onGeneralDataChange={handleDataChange}
                    />
                </div>
            </div>
        </PipelineDragDropView>
    )
}

export default CuringPipelineDragDrop
