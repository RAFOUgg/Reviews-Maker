import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight } from 'lucide-react'
import PipelineDragDropView from './PipelineDragDropView'
import { CULTURE_SIDEBAR_CONTENT, getAllCultureFieldIds, getCultureFieldById, shouldShowField } from '../../config/cultureSidebarContent'
import FieldRenderer from './FieldRenderer'

/**
 * CulturePipelineDragDrop - Pipeline Culture avec sidebar hiérarchique CDC
 * 
 * Intègre les 84 champs de cultureSidebarContent.js dans PipelineDragDropView
 * avec support drag & drop et édition par phase
 */
const CulturePipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange,
    initialData = {}
}) => {
    const [expandedSections, setExpandedSections] = useState({
        GENERAL: true,
        ENVIRONNEMENT: false,
        NUTRITION: false,
        LUMIERE: false,
        CLIMAT: false,
        PALISSAGE: false,
        MORPHOLOGIE: false,
        RECOLTE: false
    })

    const [cultureData, setCultureData] = useState(initialData)

    useEffect(() => {
        if (initialData) {
            setCultureData(initialData)
        }
    }, [initialData])

    // Toggle section expand/collapse
    const toggleSection = (sectionKey) => {
        setExpandedSections(prev => ({
            ...prev,
            [sectionKey]: !prev[sectionKey]
        }))
    }

    // Convert CULTURE_SIDEBAR_CONTENT to sidebarContent format for PipelineDragDropView
    const sidebarSections = Object.entries(CULTURE_SIDEBAR_CONTENT).map(([key, section]) => ({
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
            presets: item.presets,
            zones: item.zones,
            suggestions: item.suggestions,
            autocomplete: item.autocomplete,
            maxLength: item.maxLength,
            phases: item.phases,
            components: item.components
        }))
    }))

    // Handle data change
    const handleDataChange = (newData) => {
        setCultureData(prev => ({ ...prev, ...newData }))
        onDataChange?.(newData)
    }

    return (
        <div className="h-full flex flex-col">
            {/* Header avec titre et stats */}
            <div className="px-6 py-4 border-b border-gray-700 bg-gray-900/50">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span>🌱</span>
                            Pipeline Culture
                        </h2>
                        <p className="text-sm text-gray-400 mt-1">
                            {getAllCultureFieldIds().length} champs disponibles • 8 sections
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Statistiques de remplissage */}
                        <div className="text-sm text-gray-400">
                            {Object.keys(cultureData).filter(k => cultureData[k] !== null && cultureData[k] !== undefined && cultureData[k] !== '').length} / {getAllCultureFieldIds().length} renseignés
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Sidebar avec sections hiérarchiques */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar gauche */}
                <div className="w-80 border-r border-gray-700 bg-gray-900/30 overflow-y-auto">
                    <div className="p-4 space-y-2">
                        <div className="text-xs font-semibold text-gray-400 mb-3 flex items-center gap-2">
                            <span>📋</span>
                            CHAMPS DE CULTURE
                        </div>

                        {Object.entries(CULTURE_SIDEBAR_CONTENT).map(([sectionKey, section]) => (
                            <div key={sectionKey} className="mb-2">
                                {/* Section header */}
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

                                {/* Section items */}
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
                                                    // Check si le champ doit être affiché (dépendances)
                                                    const shouldShow = shouldShowField(item, cultureData)

                                                    if (!shouldShow) return null

                                                    const hasValue = cultureData[item.id] !== null &&
                                                        cultureData[item.id] !== undefined &&
                                                        cultureData[item.id] !== ''

                                                    return (
                                                        <div
                                                            key={item.id}
                                                            draggable
                                                            onDragStart={(e) => {
                                                                e.dataTransfer.effectAllowed = 'copy'
                                                                e.dataTransfer.setData('application/json', JSON.stringify({
                                                                    type: 'field',
                                                                    field: item
                                                                }))
                                                            }}
                                                            className={`
                                                                flex items-center gap-2 px-3 py-2 rounded-md
                                                                cursor-move transition-all
                                                                ${hasValue
                                                                    ? 'bg-green-900/20 border border-green-700/50'
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
                    </div>
                </div>

                {/* Timeline Pipeline */}
                <div className="flex-1 overflow-hidden">
                    <PipelineDragDropView
                        type="culture"
                        sidebarContent={sidebarSections}
                        timelineConfig={timelineConfig}
                        timelineData={timelineData}
                        onConfigChange={onConfigChange}
                        onDataChange={handleDataChange}
                        generalData={cultureData}
                        onGeneralDataChange={handleDataChange}
                    />
                </div>
            </div>
        </div>
    )
}

export default CulturePipelineDragDrop
