import React from 'react'
import UnifiedPipelineDragDrop from './UnifiedPipelineDragDrop'
import { CURING_SIDEBAR_CONTENT } from '../../config/curingSidebarContent'
import CuringEvolutionGraph from './CuringEvolutionGraph'
import { exportCuringEvolutionToGIF } from '../../utils/CuringGIFExporter'

/**
 * CuringPipelineDragDrop - Wrapper pour pipeline Curing/Maturation
 * 
 * Utilise UnifiedPipelineDragDrop avec configuration spécifique Curing
 * - Intervalles : jours, semaines
 * - Phases : null (basé sur le temps)
 * - Graphique : évolution notes Visuel/Odeurs/Goûts/Effets
 * - Export : GIF animation évolution
 */
const CuringPipelineDragDrop = (props) => {
    // Configuration spécifique Curing
    const pipelineConfig = {
        pipelineType: 'curing',
        sidebarContent: CURING_SIDEBAR_CONTENT,
        availableIntervals: ['jours', 'semaines'],
        phaseConfig: null, // Curing n'utilise pas de phases prédéfinies
        GraphComponent: CuringEvolutionGraph,
        Exporter: {
            export: async (config, data, sidebarContent) => {
                // Conversion données pour export GIF
                const evolutionData = extractEvolutionData(data)
                const blob = await exportCuringEvolutionToGIF(evolutionData, {
                    delay: 300,
                    quality: 10,
                    width: 1200,
                    height: 800
                })
                return blob
            },
            download: (blob, filename = 'curing-evolution.gif') => {
                const link = document.createElement('a')
                link.href = URL.createObjectURL(blob)
                link.download = filename
                link.click()
            }
        },
        validation: {
            required: ['curingType', 'temperature']
        }
    }

    return <UnifiedPipelineDragDrop config={pipelineConfig} {...props} />
}

// Fonction auxiliaire pour extraire données d'évolution
function extractEvolutionData(timelineData) {
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
                evolution.visual.push({ timestamp, value: cell.data.visual.overall })
            }
            if (cell.data.odor?.overall) {
                evolution.odor.push({ timestamp, value: cell.data.odor.overall })
            }
            if (cell.data.taste?.overall) {
                evolution.taste.push({ timestamp, value: cell.data.taste.overall })
            }
            if (cell.data.effects?.overall) {
                evolution.effects.push({ timestamp, value: cell.data.effects.overall })
            }
            if (cell.data.moisture) {
                evolution.moisture.push({ timestamp, value: cell.data.moisture })
            }
            if (cell.data.weight) {
                evolution.weight.push({ timestamp, value: cell.data.weight })
            }
        }
    })

    return evolution
}

export default CuringPipelineDragDrop
