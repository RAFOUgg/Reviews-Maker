/**
 * ExtractionPipelineAdapter - Adapter pour le pipeline extraction (Concentré)
 * Accepte props data/onChange (API canonique des sections)
 */

import ExtractionPipelineSection from '../sections/ExtractionPipelineSection';

const ExtractionPipelineAdapter = ({ data = {}, onChange, productType, reviewId, reviewLabel, reviewImage }) => {
    return (
        <ExtractionPipelineSection
            data={data}
            onChange={onChange}
            productType={productType}
            reviewId={reviewId}
            reviewLabel={reviewLabel}
            reviewImage={reviewImage}
        />
    );
};

export default ExtractionPipelineAdapter;
