/**
 * CuringMaturationAdapter - Adapter pour le pipeline Curing & Maturation
 * Accepte props data/onChange (API canonique des sections)
 */

import CuringMaturationSection from '../../sections/CuringMaturationSection';

const CuringMaturationAdapter = ({ data = {}, onChange, productType }) => {
    return (
        <CuringMaturationSection
            data={data}
            onChange={onChange}
            productType={productType || 'hash'}
        />
    );
};

export default CuringMaturationAdapter;
