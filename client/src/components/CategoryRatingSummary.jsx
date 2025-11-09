/**
 * CategoryRatingSummary Component
 * Affiche un résumé des notes par catégorie (visuel, odeur, goût, effets, global)
 */

import PropTypes from 'prop-types'

export default function CategoryRatingSummary({ ratings }) {
    return (
        <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-1.5">
                <span className="opacity-70">👁️</span>
                <span className="font-bold text-white glow-text-subtle">
                    {(ratings.visual || 0).toFixed(1)}
                </span>
            </span>
            <span className="text-white opacity-30">•</span>
            <span className="flex items-center gap-1.5">
                <span className="opacity-70">🤚</span>
                <span className="font-bold text-white glow-text-subtle">
                    {(ratings.touche || 0).toFixed(1)}
                </span>
            </span>
            <span className="text-white opacity-30">•</span>
            <span className="flex items-center gap-1.5">
                <span className="opacity-70">👃</span>
                <span className="font-bold text-white glow-text-subtle">
                    {(ratings.smell || 0).toFixed(1)}
                </span>
            </span>
            <span className="text-white opacity-30">•</span>
            <span className="flex items-center gap-1.5">
                <span className="opacity-70">👅</span>
                <span className="font-bold text-white glow-text-subtle">
                    {(ratings.taste || 0).toFixed(1)}
                </span>
            </span>
            <span className="text-white opacity-30">•</span>
            <span className="flex items-center gap-1.5">
                <span className="opacity-70">⚡</span>
                <span className="font-bold text-white glow-text-subtle">
                    {(ratings.effects || 0).toFixed(1)}
                </span>
            </span>
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
        touche: PropTypes.number,
        smell: PropTypes.number,
        taste: PropTypes.number,
        effects: PropTypes.number,
        overall: PropTypes.number
    }).isRequired
}
