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

    const asObject = (v) => {
        const parsed = safeParse(v, {})
        if (typeof parsed === 'object' && !Array.isArray(parsed)) return parsed
        return {}
    }

    // Section helpers
    const renderSection = (title, children, icon = '') => {
        if (!children || (Array.isArray(children) && children.length === 0)) return null
        return (
            <div className="mb-6">
                <h3 style={{ fontSize: `${typography.titleSize - 12}px`, fontWeight: '600', color: colors.title, marginBottom: '12px' }}>
                    {icon && <span className="mr-2">{icon}</span>}{title}
                </h3>
                {children}
            </div>
        )
    }

    const renderInfoCard = (label, value, icon = '') => (
        <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.accent}15` }}>
            <div style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary, marginBottom: '4px' }}>
                {icon && <span className="mr-1">{icon}</span>}{label}
            </div>
            <div style={{ fontSize: `${typography.textSize}px`, fontWeight: '600', color: colors.accent }}>
                {value}
            </div>
        </div>
    )

    const renderTags = (items, colorIntensity = '20') => {
        if (!items || items.length === 0) return null
        return (
            <div className="flex flex-wrap gap-2">
                {items.map((item, i) => {
                    const label = typeof item === 'object' ? (item.name || item.label || item.cultivar || item.method || JSON.stringify(item)) : item
                    return (
                        <span
                            key={i}
                            style={{
                                fontSize: `${typography.textSize - 2}px`,
                                padding: '6px 12px',
                                borderRadius: '8px',
                                backgroundColor: `${colors.accent}${colorIntensity}`,
                                color: colors.accent,
                                fontWeight: '500'
                            }}
                        >
                            {label}
                        </span>
                    )
                })}
            </div>
        )
    }

    // Get category ratings
    const getCategoryRatings = () => {
        const ratings = asObject(reviewData.categoryRatings)
        const result = []
        if (ratings.visual !== undefined) result.push({ label: 'Visuel', value: ratings.visual, icon: '👁️' })
        if (ratings.smell !== undefined) result.push({ label: 'Odeur', value: ratings.smell, icon: '👃' })
        if (ratings.texture !== undefined) result.push({ label: 'Texture', value: ratings.texture, icon: '✋' })
        if (ratings.taste !== undefined) result.push({ label: 'Goût', value: ratings.taste, icon: '👅' })
        if (ratings.effects !== undefined) result.push({ label: 'Effets', value: ratings.effects, icon: '⚡' })
        return result
    }

    const renderRatingBars = (ratings) => {
        if (!ratings || ratings.length === 0) return null
        return (
            <div className="space-y-2">
                {ratings.map((r, i) => (
                    <div key={i} className="flex items-center gap-3">
                        <span style={{ width: '80px', fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary }}>
                            {r.icon} {r.label}
                        </span>
                        <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ backgroundColor: `${colors.accent}20` }}>
                            <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${(r.value / 10) * 100}%`, backgroundColor: colors.accent }}
                            />
                        </div>
                        <span style={{ fontSize: `${typography.textSize}px`, fontWeight: '600', color: colors.textPrimary, width: '40px' }}>
                            {parseFloat(r.value).toFixed(1)}
                        </span>
                    </div>
                ))}
            </div>
        )
    }

    // Get extra data fields
    const getExtraInfo = () => {
        const extra = asObject(reviewData.extraData)
        const displayableKeys = [
            { key: 'typeCulture', label: 'Culture', icon: '🌿' },
            { key: 'spectre', label: 'Spectre', icon: '🌈' },
            { key: 'techniquesPropagation', label: 'Propagation', icon: '🌱' },
            { key: 'densite', label: 'Densité', icon: '📊' },
            { key: 'trichome', label: 'Trichomes', icon: '✨' },
            { key: 'pistil', label: 'Pistils', icon: '🌺' },
            { key: 'manucure', label: 'Manucure', icon: '✂️' },
            { key: 'moisissure', label: 'Moisissure', icon: '🔬' },
            { key: 'graines', label: 'Graines', icon: '🫘' },
            { key: 'durete', label: 'Dureté', icon: '💎' },
            { key: 'elasticite', label: 'Élasticité', icon: '🔄' },
            { key: 'collant', label: 'Collant', icon: '🍯' },
            { key: 'intensiteFumee', label: 'Fumée', icon: '💨' },
            { key: 'agressivite', label: 'Agressivité', icon: '🔥' },
            { key: 'cendre', label: 'Cendre', icon: '⚪' },
            { key: 'montee', label: 'Montée', icon: '📈' },
            { key: 'intensiteEffet', label: 'Intensité effets', icon: '⚡' },
            { key: 'aromasIntensity', label: 'Intensité arômes', icon: '🌸' },
            { key: 'notesDominantesOdeur', label: 'Notes dominantes', icon: '🎵' },
            { key: 'notesSecondairesOdeur', label: 'Notes secondaires', icon: '🎶' },
            { key: 'purgevide', label: 'Purge vide', icon: '🫧' },
        ]
        return displayableKeys
            .filter(({ key }) => extra[key] !== undefined && extra[key] !== null && extra[key] !== '')
            .map(({ key, label, icon }) => ({ label, value: extra[key], icon }))
    }

    const categoryRatings = getCategoryRatings()
    const extraInfo = getExtraInfo()

    return (
        <div
            className="relative w-full h-full overflow-auto"
            style={{
                background: colors.background,
                fontFamily: typography.fontFamily,
                padding: '32px'
            }}
        >
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="max-w-5xl mx-auto space-y-6"
            >
                {/* En-tête avec image et infos principales */}
                <div className="flex gap-6 flex-wrap md:flex-nowrap">
                    {/* Image */}
                    {contentModules.image && (reviewData.mainImageUrl || reviewData.imageUrl || reviewData.images) && (
                        <div
                            className="flex-shrink-0 overflow-hidden"
                            style={{
                                borderRadius: `${image.borderRadius}px`,
                                width: '280px',
                                height: '280px'
                            }}
                        >
                            <img
                                src={reviewData.mainImageUrl || reviewData.imageUrl || (Array.isArray(reviewData.images) ? reviewData.images[0] : null)}
                                alt={reviewData.title || reviewData.holderName}
                                className="w-full h-full object-cover"
                            />
                        </div>
                    )}

                    {/* Informations principales */}
                    <div className="flex-1 space-y-4">
                        {contentModules.title && (reviewData.title || reviewData.holderName) && (
                            <h1 style={{ fontSize: `${typography.titleSize}px`, fontWeight: typography.titleWeight, color: colors.title, lineHeight: '1.2' }}>
                                {reviewData.title || reviewData.holderName}
                            </h1>
                        )}

                        {contentModules.rating && reviewData.rating !== undefined && (
                            <div className="flex items-center gap-3">
                                <div className="flex">
                                    {[...Array(5)].map((_, i) => (
                                        <svg key={i} width="28" height="28" viewBox="0 0 24 24" fill={i < Math.round(reviewData.rating / 2) ? colors.accent : 'none'} stroke={colors.accent} strokeWidth="2">
                                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                        </svg>
                                    ))}
                                </div>
                                <span style={{ fontSize: `${typography.titleSize - 8}px`, fontWeight: '700', color: colors.textPrimary }}>
                                    {parseFloat(reviewData.rating).toFixed(1)}/10
                                </span>
                            </div>
                        )}

                        {/* Notes par catégorie - inline */}
                        {contentModules.categoryRatings && categoryRatings.length > 0 && renderRatingBars(categoryRatings)}
                    </div>
                </div>

                {/* Description */}
                {contentModules.description && reviewData.description && (
                    <div className="p-4 rounded-xl" style={{ backgroundColor: `${colors.accent}08` }}>
                        <p style={{ fontSize: `${typography.textSize}px`, color: colors.textSecondary, lineHeight: '1.8' }}>
                            {reviewData.description}
                        </p>
                    </div>
                )}

                {/* Grille d'infos de base */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {contentModules.type && reviewData.type && renderInfoCard('Type', reviewData.type, '📦')}
                    {contentModules.category && reviewData.category && renderInfoCard('Catégorie', reviewData.category, '📂')}
                    {contentModules.strainType && reviewData.strainType && renderInfoCard('Strain', reviewData.strainType, '🧬')}
                    {contentModules.indicaRatio && reviewData.indicaRatio !== undefined && renderInfoCard('Indica', `${reviewData.indicaRatio}%`, '⚖️')}
                    {contentModules.thcLevel && reviewData.thcLevel && renderInfoCard('THC', `${reviewData.thcLevel}%`, '🔬')}
                    {contentModules.cbdLevel && reviewData.cbdLevel && renderInfoCard('CBD', `${reviewData.cbdLevel}%`, '💊')}
                    {contentModules.dureeEffet && reviewData.dureeEffet && renderInfoCard('Durée effets', reviewData.dureeEffet, '⏱️')}
                    {contentModules.cultivar && reviewData.cultivar && renderInfoCard('Cultivar', reviewData.cultivar, '🌱')}
                    {contentModules.breeder && reviewData.breeder && renderInfoCard('Breeder', reviewData.breeder, '🧬')}
                    {contentModules.farm && reviewData.farm && renderInfoCard('Farm', reviewData.farm, '🏡')}
                    {contentModules.hashmaker && reviewData.hashmaker && renderInfoCard('Hash Maker', reviewData.hashmaker, '👨‍🔬')}
                </div>

                {/* Cultivars list */}
                {contentModules.cultivarsList && asArray(reviewData.cultivarsList).length > 0 && 
                    renderSection('Cultivars', <CultivarCard data={reviewData.cultivarsList} />, '🌿')}

                {/* Sensory - Aromas, Tastes, Effects */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contentModules.aromas && asArray(reviewData.aromas).length > 0 && (
                        <div>{renderSection('Arômes', renderTags(asArray(reviewData.aromas)), '🌸')}</div>
                    )}
                    {contentModules.tastes && asArray(reviewData.tastes).length > 0 && (
                        <div>{renderSection('Goûts', renderTags(asArray(reviewData.tastes)), '👅')}</div>
                    )}
                </div>

                {contentModules.effects && asArray(reviewData.effects).length > 0 && 
                    renderSection('Effets', renderTags(asArray(reviewData.effects), '25'), '⚡')}

                {contentModules.terpenes && asArray(reviewData.terpenes).length > 0 && 
                    renderSection('Terpènes', renderTags(asArray(reviewData.terpenes), '15'), '🧪')}

                {/* Pipelines */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {contentModules.pipelineExtraction && reviewData.pipelineExtraction && (
                        <div>{renderSection('Extraction', <PipelineRenderer data={reviewData.pipelineExtraction} />, '⚗️')}</div>
                    )}
                    {contentModules.pipelineSeparation && reviewData.pipelineSeparation && (
                        <div>{renderSection('Séparation', <PipelineRenderer data={reviewData.pipelineSeparation} />, '🔬')}</div>
                    )}
                    {contentModules.pipelinePurification && reviewData.pipelinePurification && (
                        <div>{renderSection('Purification', <PipelineRenderer data={reviewData.pipelinePurification} />, '✨')}</div>
                    )}
                    {contentModules.fertilizationPipeline && reviewData.fertilizationPipeline && (
                        <div>{renderSection('Fertilisation', <PipelineRenderer data={reviewData.fertilizationPipeline} />, '🌱')}</div>
                    )}
                </div>

                {/* Substrat */}
                {contentModules.substratMix && reviewData.substratMix && 
                    renderSection('Substrat', <SubstratViewer data={reviewData.substratMix} />, '🪴')}

                {/* Category Ratings Grid (alternative display) */}
                {contentModules.categoryRatings && reviewData.categoryRatings && (
                    <div className="hidden">
                        <RatingsGrid data={reviewData.categoryRatings} />
                    </div>
                )}

                {/* Extra data fields */}
                {contentModules.extraData && extraInfo.length > 0 && (
                    <div>
                        <h3 style={{ fontSize: `${typography.titleSize - 12}px`, fontWeight: '600', color: colors.title, marginBottom: '12px' }}>
                            📊 Détails supplémentaires
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {extraInfo.map((info, i) => renderInfoCard(info.label, info.value, info.icon))}
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="flex justify-between items-center pt-4" style={{ borderTop: `2px solid ${colors.accent}30` }}>
                    {contentModules.author && (function() {
                        const authorName = reviewData.ownerName || (reviewData.author ? (typeof reviewData.author === 'string' ? reviewData.author : (reviewData.author.username || reviewData.author.id)) : null) || 'Anonyme'
                        return (
                            <div style={{ fontSize: `${typography.textSize}px`, color: colors.textSecondary }}>
                                Par <span style={{ fontWeight: '600', color: colors.textPrimary }}>{authorName}</span>
                            </div>
                        )
                    })()}
                    
                    {contentModules.date && reviewData.date && (
                        <div style={{ fontSize: `${typography.textSize - 2}px`, color: colors.textSecondary }}>
                            {new Date(reviewData.date).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Branding */}
            {branding.enabled && branding.logoUrl && (
                <div className="absolute" style={{ bottom: '24px', right: '24px', opacity: branding.opacity, width: '80px', height: '80px' }}>
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
