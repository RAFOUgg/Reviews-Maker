import { useMemo } from 'react'
import PipelineDragDropView from './PipelineDragDropView'
import { CULTURE_SIDEBAR_CONTENT } from '../../config/cultureSidebarContent'
import { CULTURE_PHASES } from '../../config/pipelinePhases'

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

    return (
        <PipelineDragDropView
            type="culture"
            sidebarContent={sidebarArray}
            timelineConfig={configWithPhases}
            timelineData={timelineData}
            onConfigChange={onConfigChange}
            onDataChange={onDataChange}
        />
    )
}

export default CulturePipelineDragDrop