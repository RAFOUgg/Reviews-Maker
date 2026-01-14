/**
 * CuringMaturationAdapter - Adapter pour CreateReviewFormWrapper
 * Convertit formData/handleChange → data/onChange
 */

import CuringMaturationSection from '../../sections/CuringMaturationSection';

const CuringMaturationAdapter = ({ formData, handleChange, productType }) => {
    return (
        <CuringMaturationSection
            data={formData.curing || {}}
            onChange={(curingData) => handleChange('curing', curingData)}
            productType={productType || 'hash'}
        />
    );
};

export default CuringMaturationAdapter;
