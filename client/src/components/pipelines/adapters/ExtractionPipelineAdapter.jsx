/**
 * ExtractionPipelineAdapter - Adapter pour CreateReviewFormWrapper
 * Convertit formData/handleChange → data/onChange
 */

import ExtractionPipelineSection from '../sections/ExtractionPipelineSection';

const ExtractionPipelineAdapter = ({ formData, handleChange, productType }) => {
    return (
        <ExtractionPipelineSection
            data={formData.extraction || {}}
            onChange={(extractionData) => handleChange('extraction', extractionData)}
        />
    );
};

export default ExtractionPipelineAdapter;
