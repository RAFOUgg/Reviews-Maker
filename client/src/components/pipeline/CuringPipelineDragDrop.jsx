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
}

export default CuringPipelineDragDrop
