import { useState, useMemo, useEffect } from 'react'
import PipelineDragDropView from './PipelineDragDropView'
import { CURING_SIDEBAR_CONTENT } from '../../config/curingSidebarContent'
import CuringEvolutionGraph from './CuringEvolutionGraph'
import { exportCuringEvolutionToGIF } from '../../utils/CuringGIFExporter'
import { Download, TrendingUp, Film } from 'lucide-react'

/**
 * CuringPipelineDragDrop - Pipeline Curing/Maturation utilisant PipelineDragDropView
 * 
 * Wrapper avec fonctionnalités spécifiques Curing :
 * - Intervalles : jours, semaines (pas de phases)
 * - Tracking évolution : Visuel/Odeurs/Goûts/Effets/Humidité/Poids
 * - Graphique : évolution dans le temps
 * - Export : GIF animation évolution
 */
const CuringPipelineDragDrop = ({
    timelineConfig = {},
    timelineData = [],
    onConfigChange,
    onDataChange
}) => {
    const [showEvolutionGraph, setShowEvolutionGraph] = useState(false)
    const [isExportingGIF, setIsExportingGIF] = useState(false)
    const [evolutionData, setEvolutionData] = useState({
        visual: [],
        odor: [],
        taste: [],
        effects: [],
        moisture: [],
        weight: []
    })

    // Définir type par défaut
    const configWithDefaults = useMemo(() => ({
        type: 'phase',
        ...timelineConfig
    }), [timelineConfig]);

    // Convertir CURING_SIDEBAR_CONTENT (objet) vers format array
    const sidebarArray = useMemo(() => {
        return Object.entries(CURING_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            icon: section.icon,
            label: section.label,
            color: section.color || 'purple',
            collapsed: section.collapsed !== undefined ? section.collapsed : false,
            items: section.items || []
        }))
    }, [])

    // Extraire données d'évolution depuis timelineData
    useEffect(() => {
        const evolution = {
            visual: [],
            odor: [],
            taste: [],
            effects: [],
            moisture: [],
            weight: []
        }

        timelineData.forEach((cell, index) => {
            if (cell) {
                // Support both {data: {...}} and flat structure
                const cellData = cell.data || cell
                const timestamp = cell.timestamp || `day-${index + 1}`

                if (cellData.visualOverall) {
                    evolution.visual.push({ timestamp, value: cellData.visualOverall })
                }
                if (cellData.odorOverall) {
                    evolution.odor.push({ timestamp, value: cellData.odorOverall })
                }
                if (cellData.tasteOverall) {
                    evolution.taste.push({ timestamp, value: cellData.tasteOverall })
                }
                if (cellData.effectsOverall) {
                    evolution.effects.push({ timestamp, value: cellData.effectsOverall })
                }
                if (cellData.moisture !== undefined) {
                    evolution.moisture.push({ timestamp, value: cellData.moisture })
                }
                if (cellData.weight !== undefined) {
                    evolution.weight.push({ timestamp, value: cellData.weight })
                }
            }
        })

        setEvolutionData(evolution)
    }, [timelineData])

    // Handler export GIF
    const handleExportGIF = async () => {
        setIsExportingGIF(true)
        try {
            const blob = await exportCuringEvolutionToGIF(evolutionData, {
                delay: 300,
                quality: 10,
                width: 1200,
                height: 800
            })

            const link = document.createElement('a')
            link.href = URL.createObjectURL(blob)
            link.download = `curing-evolution-${Date.now()}.gif`
            link.click()
            URL.revokeObjectURL(link.href)
        } catch (error) {
            console.error('Erreur export GIF:', error)
            alert('Erreur lors de l\'export GIF')
        } finally {
            setIsExportingGIF(false)
        }
    }

    // Compter les points d'évolution
    const hasEvolutionData = Object.values(evolutionData).some(arr => arr.length > 0)

    return (
        <div className="space-y-4">
            {/* Header avec stats et actions */}
            <div className="flex items-center justify-between p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <span>🔥</span>
                        Pipeline Curing/Maturation
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                        <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            {timelineData.length} cases
                        </span>
                        {hasEvolutionData && (
                            <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                {evolutionData.visual.length + evolutionData.odor.length + evolutionData.taste.length + evolutionData.effects.length} points d'évolution
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowEvolutionGraph(!showEvolutionGraph)}
                        className="liquid-btn"
                        title="Afficher graphique d'évolution"
                        disabled={!hasEvolutionData}
                    >
                        <TrendingUp className="w-4 h-4" />
                        {showEvolutionGraph ? 'Masquer' : 'Graphique'}
                    </button>
                    <button
                        onClick={handleExportGIF}
                        className="liquid-btn liquid-btn--primary"
                        title="Exporter évolution en GIF animé"
                        disabled={!hasEvolutionData || isExportingGIF}
                    >
                        <Film className="w-4 h-4" />
                        {isExportingGIF ? 'Export...' : 'Export GIF'}
                    </button>
                </div>
            </div>

            {/* Graphique d'évolution (conditionnel) */}
            {showEvolutionGraph && hasEvolutionData && (
                <div className="p-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200/50 dark:border-gray-700/50">
                    <CuringEvolutionGraph evolutionData={evolutionData} />
                </div>
            )}

            {/* Pipeline principal - PipelineDragDropView existant */}
            <PipelineDragDropView
                type="curing"
                sidebarContent={sidebarArray}
                timelineConfig={configWithDefaults}
                timelineData={timelineData}
                onConfigChange={onConfigChange}
                onDataChange={onDataChange}
            />
        </div>
    )
}

export default CuringPipelineDragDrop
