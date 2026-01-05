import { useState, useMemo } from 'react'
import PipelineDragDropView from './PipelineDragDropView'
import { CULTURE_SIDEBAR_CONTENT } from '../../config/cultureSidebarContent'
import { CULTURE_PHASES } from '../../config/pipelinePhases'
import { CultureEvolutionGraph } from './CultureEvolutionGraph'
import { CultureCSVExporter } from './CultureCSVExporter'
import { Download, TrendingUp, FileText } from 'lucide-react'

/**
 * CulturePipelineDragDrop - Pipeline Culture utilisant PipelineDragDropView
 * 
 * Wrapper qui configure PipelineDragDropView pour la culture :
 * - 84+ champs (cultureSidebarContent.js) convertis en format array
 * - Support des phases (12 phases de croissance)
 * - Graphiques d'évolution
 * - Export CSV détaillé
 */
const CulturePipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange,
    initialData = {}
}) => {
    const [showEvolutionGraph, setShowEvolutionGraph] = useState(false)

    // Convertir CULTURE_SIDEBAR_CONTENT (objet) vers format array pour PipelineDragDropView
    const sidebarArray = useMemo(() => {
        return Object.entries(CULTURE_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            color: section.color || 'blue',
            collapsed: section.collapsed !== undefined ? section.collapsed : false,
            items: section.items || []
        }))
    }, [])

    // Configurer les phases si type === 'phase'
    const configWithPhases = useMemo(() => {
        if (timelineConfig.type === 'phase') {
            return {
                ...timelineConfig,
                phases: CULTURE_PHASES
            }
        }
        return timelineConfig
    }, [timelineConfig])

    // Export CSV handler
    const handleExportCSV = () => {
        try {
            CultureCSVExporter.export(timelineData, timelineConfig)
        } catch (error) {
            console.error('Erreur export CSV:', error)
            alert('Erreur lors de l\'export CSV')
        }
    }

    return (
        <div className="space-y-4">
            {/* Header avec stats et actions */}
            <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>🌱</span>
                        Pipeline Culture
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            {timelineData.length} cases remplies
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowEvolutionGraph(!showEvolutionGraph)}
                        className="liquid-btn"
                        title="Afficher graphique d'évolution"
                    >
                        <TrendingUp className="w-4 h-4" />
                        {showEvolutionGraph ? 'Masquer' : 'Graphique'}
                    </button>
                    <button
                        onClick={handleExportCSV}
                        className="liquid-btn liquid-btn--primary"
                        title="Exporter en CSV"
                        disabled={timelineData.length === 0}
                    >
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Graphique d'évolution (conditionnel) */}
            {showEvolutionGraph && timelineData.length > 0 && (
                <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                    <CultureEvolutionGraph data={timelineData} config={timelineConfig} />
                </div>
            )}

            {/* Pipeline principal - PipelineDragDropView existant */}
            <PipelineDragDropView
                type="culture"
                sidebarContent={sidebarArray}
                timelineConfig={configWithPhases}
                timelineData={timelineData}
                onConfigChange={onConfigChange}
                onDataChange={onDataChange}
            />
        </div>
    )
}

export default CulturePipelineDragDrop