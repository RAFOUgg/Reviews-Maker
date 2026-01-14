/**
 * SeparationPipelineAdapter - Adapter pour CreateReviewFormWrapper
 * Convertit formData/handleChange → data/onChange
 */

import SeparationPipelineSection from '../sections/SeparationPipelineSection';

const SeparationPipelineAdapter = ({ formData, handleChange, productType }) => {
    return (
        <SeparationPipelineSection
            data={formData.separation || {}}
            onChange={(separationData) => handleChange('separation', separationData)}
        />
    );
};

export default SeparationPipelineAdapter;
