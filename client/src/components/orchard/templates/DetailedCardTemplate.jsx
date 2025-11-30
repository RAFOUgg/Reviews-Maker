import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import React from 'react';
import PipelineRenderer from '../renderers/PipelineRenderer';
import CultivarCard from '../renderers/CultivarCard';
import SubstratViewer from '../renderers/SubstratViewer';
import RatingsGrid from '../renderers/RatingsGrid';

export default function DetailedCardTemplate({ config, reviewData, dimensions }) {
    // Validation des props
    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 p-8">
                <p className="text-red-600 dark:text-red-400">Données manquantes</p>
            </div>
        );
    }

    const { typography, colors, contentModules, image, branding } = config;
    
    // Helpers
    const safeParse = (v, fallback = null) => {
        if (v === undefined || v === null) return fallback
        if (typeof v === 'string') {
            try { return JSON.parse(v) } catch { return v }
        }
        return v
    }

    const asArray = (v) => {
        const parsed = safeParse(v, [])
        if (Array.isArray(parsed)) return parsed
        if (parsed === null || parsed === undefined) return []
        if (typeof parsed === 'string') return parsed.split(',').map(s => s.trim()).filter(Boolean)
        if (typeof parsed === 'object') return Object.values(parsed)
        return [parsed]
    }

    const renderKeyValue = (k, val) => (
        <div key={k} className="p-3 rounded-lg bg-white/5">
            <div className="text-xs text-gray-400">{k}</div>
            <div className="text-sm text-white">{typeof val === 'object' ? JSON.stringify(val) : String(val)}</div>
        </div>
    )

    return (
        <div
            className="relative w-full h-full overflow-auto"
            style={{
                background: colors.background,
                fontFamily: typography.fontFamily,
                padding: '48px'
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* En-tête avec image et infos principales */}
                <div className="grid grid-cols-2 gap-8">
                    {/* Image */}
                    {contentModules.image && (reviewData.imageUrl || reviewData.images) && (
                        <div
                            className="overflow-hidden"
                            style={{
                                borderRadius: `${image.borderRadius}px`,
                                aspectRatio: '1/1'
                            }}
                        >
                            {/* prefer imageUrl then first of images */}
                            <img
                                src={reviewData.imageUrl || (Array.isArray(reviewData.images) ? reviewData.images[0] : null)}
                                alt={reviewData.title || reviewData.holderName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Informations principales */}
                    <div className="space-y-6">
                        {contentModules.title && (reviewData.title || reviewData.holderName) && (
                            <h1
                                style={{
                                    fontSize: `${typography.titleSize}px`,
                                    fontWeight: typography.titleWeight,
                                    color: colors.title,
                                    lineHeight: '1.2'
                                }}
                            >
                                {reviewData.title || reviewData.holderName}
                            </h1>
                        )}

                        {contentModules.rating && reviewData.rating && (
                            <div className="flex items-center gap-3">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg
                                            key={i}
                                            width="28"
                                            height="28"
                                            viewBox="0 0 24 24"
                                            fill={i < Math.floor(reviewData.rating) ? colors.accent : 'none'}
                                            stroke={colors.accent}
                                            strokeWidth="2"
                                        >
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                <span
                                    style={{
                                        fontSize: `${typography.titleSize - 8}px`,
                                        fontWeight: '700',
                                        color: colors.textPrimary
                                    }}
                                >
                                    {parseFloat(reviewData.rating).toFixed(1)}/5
                                </span>
                            </div>
                        )}

                        {/* Grille d'infos */}
                        <div className="grid grid-cols-2 gap-4">
                            {contentModules.category && reviewData.category && (
                                <div
                                    className="p-4 rounded-lg"
                                    style={{ backgroundColor: `${colors.accent}15` }}
                                >
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            color: colors.textSecondary,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        Catégorie
                                    </div>
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize}px`,
                                            fontWeight: '600',
                                            color: colors.accent
                                        }}
                                    >
                                        {reviewData.category}
                                    </div>
                                </div>
                            )}

                            {contentModules.thcLevel && reviewData.thcLevel && (
                                <div
                                    className="p-4 rounded-lg"
                                    style={{ backgroundColor: `${colors.accent}15` }}
                                >
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            color: colors.textSecondary,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        THC
                                    </div>
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize}px`,
                                            fontWeight: '600',
                                            color: colors.accent
                                        }}
                                    >
                                        {reviewData.thcLevel}%
                                    </div>
                                </div>
                            )}

                            {contentModules.cbdLevel && reviewData.cbdLevel && (
                                <div
                                    className="p-4 rounded-lg"
                                    style={{ backgroundColor: `${colors.accent}15` }}
                                >
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            color: colors.textSecondary,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        CBD
                                    </div>
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize}px`,
                                            fontWeight: '600',
                                            color: colors.accent
                                        }}
                                    >
                                        {reviewData.cbdLevel}%
                                    </div>
                                </div>
                            )}

                            {contentModules.cultivar && reviewData.cultivar && (
                                <div
                                    className="p-4 rounded-lg"
                                    style={{ backgroundColor: `${colors.accent}15` }}
                                >
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            color: colors.textSecondary,
                                            marginBottom: '4px'
                                        }}
                                    >
                                        Cultivar
                                    </div>
                                    <div
                                        style={{
                                            fontSize: `${typography.textSize}px`,
                                            fontWeight: '600',
                                            color: colors.accent
                                        }}
                                    >
                                        {reviewData.cultivar}
                                    </div>
                                </div>
                            )}

                            {/* Cultivars list */}
                            {contentModules.cultivarsList && asArray(reviewData.cultivarsList).length > 0 && (
                                <div className="p-4 rounded-lg" style={{ backgroundColor: `${colors.accent}15` }}>
                                    <div style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary, marginBottom: '4px' }}>Cultivars</div>
                                    <div style={{ fontSize: `${typography.textSize}px`, fontWeight: '600', color: colors.accent }}>
                                        {asArray(reviewData.cultivarsList).map((c,i) => typeof c === 'object' ? (c.cultivar || c.name || JSON.stringify(c)) : c).join(', ')}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Description détaillée */}
                {contentModules.description && reviewData.description && (
                    <div>
                        <h2
                            style={{
                                fontSize: `${typography.titleSize - 8}px`,
                                fontWeight: '700',
                                color: colors.title,
                                marginBottom: '16px'
                            }}
                        >
                            Description
                        </h2>
                        <p
                            style={{
                                fontSize: `${typography.textSize}px`,
                                color: colors.textSecondary,
                                lineHeight: '1.8'
                            }}
                        >
                            {reviewData.description}
                        </p>
                    </div>
                )}

                {/* Effets et Arômes */}
                <div className="grid grid-cols-2 gap-8">
                    {contentModules.effects && reviewData.effects && reviewData.effects.length > 0 && (
                        <div>
                            <h3
                                style={{
                                    fontSize: `${typography.titleSize - 12}px`,
                                    fontWeight: '600',
                                    color: colors.title,
                                    marginBottom: '12px'
                                }}
                            >
                                Effets
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {reviewData.effects.map((effect, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: `${colors.accent}20`,
                                            color: colors.accent,
                                            fontWeight: '500'
                                        }}
                                    >
                                        {effect}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {contentModules.aromas && reviewData.aromas && reviewData.aromas.length > 0 && (
                        <div>
                            <h3
                                style={{
                                    fontSize: `${typography.titleSize - 12}px`,
                                    fontWeight: '600',
                                    color: colors.title,
                                    marginBottom: '12px'
                                }}
                            >
                                Arômes
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {reviewData.aromas.map((aroma, i) => (
                                    <span
                                        key={i}
                                        style={{
                                            fontSize: `${typography.textSize - 2}px`,
                                            padding: '6px 12px',
                                            borderRadius: '8px',
                                            backgroundColor: `${colors.accent}20`,
                                            color: colors.accent,
                                            fontWeight: '500'
                                        }}
                                    >
                                        {aroma}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div
                    className="flex justify-between items-center pt-6"
                    style={{
                        borderTop: `2px solid ${colors.accent}30`
                    }}
                >
                    {contentModules.author && (function() {
                        const authorName = reviewData.ownerName || (reviewData.author ? (typeof reviewData.author === 'string' ? reviewData.author : (reviewData.author.username || reviewData.author.id)) : null) || 'Anonyme'
                        return (
                            <div
                                style={{
                                    fontSize: `${typography.textSize}px`,
                                    color: colors.textSecondary
                                }}
                            >
                                Par <span style={{ fontWeight: '600', color: colors.textPrimary }}>{authorName}</span>
                            </div>
                        )
                    })()}
                    
                    {contentModules.date && reviewData.date && (
                        <div
                            style={{
                                fontSize: `${typography.textSize - 2}px`,
                                color: colors.textSecondary
                            }}
                        >
                            {new Date(reviewData.date).toLocaleDateString('fr-FR', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Branding */}
            {branding.enabled && branding.logoUrl && (
                <div
                    className="absolute"
                    style={{
                        bottom: '24px',
                        right: '24px',
                        opacity: branding.opacity,
                        width: '80px',
                        height: '80px'
                    }}
                >
                    <img src={branding.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                </div>
            )}
        </div>
    );
}

DetailedCardTemplate.propTypes = {
    config: PropTypes.object.isRequired,
    reviewData: PropTypes.object.isRequired,
    dimensions: PropTypes.object.isRequired
};
