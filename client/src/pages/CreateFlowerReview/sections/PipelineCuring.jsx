/**
 * Section Pipeline Curing/Maturation pour CreateFlowerReview
 * Utilise le système UnifiedPipeline CDC générique
 */

import React from 'react'
import UnifiedPipeline from '../../../components/UnifiedPipeline'

export default function PipelineCuring({ formData, handleChange }) {
    const handlePipelineChange = (pipelineData) => {
        handleChange('curingPipeline', pipelineData)
    }

    return (
        <UnifiedPipeline
            type="curing"
            data={formData.curingPipeline || {}}
            onChange={handlePipelineChange}
        />
    )
}
}
