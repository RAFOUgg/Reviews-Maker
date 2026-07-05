/**
 * SeparationPipelineAdapter - Adapter pour le pipeline séparation (Hash)
 * Accepte props data/onChange (API canonique des sections)
 */

import SeparationPipelineSection from '../sections/SeparationPipelineSection';

const SeparationPipelineAdapter = ({ data = {}, onChange, productType, reviewId, reviewLabel, reviewImage }) => {
    return (
        <SeparationPipelineSection
            data={data}
            onChange={onChange}
            productType={productType}
            reviewId={reviewId}
            reviewLabel={reviewLabel}
            reviewImage={reviewImage}
        />
    );
};

export default SeparationPipelineAdapter;
