/**
 * CategoryRatingSummary Component
 * Affiche un résumé des notes par catégorie (visuel, odeur, texture, goût, effets, global)
 * Adapte les catégories affichées selon le type de produit
 */

import PropTypes from 'prop-types'
import { CATEGORY_DISPLAY_ORDER, getCategoryIcon, getCategoryLabel } from '../../../utils/categoryMappings'

export default function CategoryRatingSummary({ ratings, productType = 'Fleur' }) {
    // Obtenir les catégories à afficher pour ce type de produit
    const categoriesToDisplay = CATEGORY_DISPLAY_ORDER[productType] || CATEGORY_DISPLAY_ORDER.Fleur;

    return (
        <div className="flex items-center justify-center gap-4 text-sm">
            {categoriesToDisplay.map((category, index) => (
                <span key={category}>
                    {index > 0 && <span className="text-white opacity-30 mx-2">•</span>}
                    <span className="flex items-center gap-1.5">
                        <span className="opacity-70">{getCategoryIcon(productType, category)}</span>
                        <span className="font-bold text-white glow-text-subtle">
                            {(ratings[category] || 0).toFixed(1)}
                        </span>
                    </span>
                </span>
            ))}
            <span className="text-white opacity-30">│</span>
            <span className="flex items-center gap-1.5">
                <span className="font-semibold text-white opacity-70">Global</span>
                <span className="font-bold text-base text-white glow-text-subtle">
                    {(ratings.overall || 0).toFixed(1)}
                </span>
                <span className="text-xs text-white opacity-50">/10</span>
            </span>
        </div>
    )
}

CategoryRatingSummary.propTypes = {
    ratings: PropTypes.shape({
        visual: PropTypes.number,
        texture: PropTypes.number,
        smell: PropTypes.number,
        taste: PropTypes.number,
        effects: PropTypes.number,
        overall: PropTypes.number
    }).isRequired,
    productType: PropTypes.oneOf(['Fleur', 'Hash', 'Concentré', 'Comestible'])
}


