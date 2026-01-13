import React from 'react'
import UnifiedPipeline from '../../components/shared/orchard/UnifiedPipeline'

/**
 * Section Pipeline Culture pour CreateFlowerReview
 * Utilise le nouveau système UnifiedPipeline CDC générique
 * Configuration exhaustive : 85+ champs selon PIPELINE_DONNEE_CULTURES.md
 */
const PipelineCulture = ({ formData, handleChange }) => {
    // Handler pour mise à jour pipeline
    const handlePipelineChange = (pipelineData) => {
        handleChange('culturePipeline', pipelineData)
    }

    return (
        <UnifiedPipeline
            type="culture"
            data={formData.culturePipeline || {}}
            onChange={handlePipelineChange}
        />
    );
};

export default PipelineCulture;
