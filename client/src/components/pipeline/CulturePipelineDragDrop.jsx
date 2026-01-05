import UnifiedPipelineDragDrop from './UnifiedPipelineDragDrop'
import { CULTURE_SIDEBAR_CONTENT } from '../../config/cultureSidebarContent'
import { CULTURE_PHASES } from '../../config/pipelinePhases'
import { CultureEvolutionGraph } from './CultureEvolutionGraph'
import { CultureCSVExporter } from './CultureCSVExporter'

/**
 * CulturePipelineDragDrop - Pipeline Culture wrapper utilisant le système unifié
 * 
 * Utilise UnifiedPipelineDragDrop avec configuration spécifique Culture :
 * - 84 champs (cultureSidebarContent.js)
 * - Mode phases (12 phases de croissance)
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
    const pipelineConfig = {
        pipelineType: 'culture',
        sidebarContent: CULTURE_SIDEBAR_CONTENT,
        availableIntervals: ['jours', 'phases'],
        phaseConfig: CULTURE_PHASES,
        GraphComponent: CultureEvolutionGraph,
        Exporter: CultureCSVExporter,
        validation: {
            required: ['mode', 'spaceType', 'substrat']
        }
    }

    return (
        <UnifiedPipelineDragDrop
            config={pipelineConfig}
            timelineConfig={timelineConfig}
            timelineData={timelineData}
            onConfigChange={onConfigChange}
            onDataChange={onDataChange}
            initialData={initialData}
        />
    )
}

export default CulturePipelineDragDrop