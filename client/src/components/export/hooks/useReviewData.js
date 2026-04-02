import { useMemo, useRef } from 'react';

/**
 * useReviewData
 * Centralise la normalisation des données de review et fournit des helpers réutilisables
 */
export default function useReviewData(reviewData) {
    const reviewFieldCacheRef = useRef({ reviewId: null, data: {} });

    const safeParse = (maybeString) => {
        if (maybeString == null) return null;
        if (typeof maybeString === 'string') {
            try { return JSON.parse(maybeString); } catch (e) { return null; }
        }
        return maybeString;
    };

    const resolveReviewField = (fieldKey) => {
        if (!reviewData || !fieldKey) return null;

        if (reviewFieldCacheRef.current.reviewId !== reviewData.id) {
            reviewFieldCacheRef.current = { reviewId: reviewData.id, data: {} };
        }

        if (Object.prototype.hasOwnProperty.call(reviewFieldCacheRef.current.data, fieldKey)) {
            return reviewFieldCacheRef.current.data[fieldKey];
        }

        let result = null;

        try {
            if (reviewData[fieldKey] !== undefined) {
                result = reviewData[fieldKey];
            } else if (fieldKey === 'genetics') {
                result = reviewData.genetics || reviewData.strain || safeParse(reviewData.infosProduit) || null;
            } else if (fieldKey === 'odor') {
                // Try French key 'odeurs' first (from formData), then nested keys
                result = reviewData.odeurs || reviewData.odor;
                if (!result) {
                    const checkFields = ['sensoryData', 'sensorielle', 'evaluation', 'infosProduit', 'productInfo', 'data'];
                    for (const field of checkFields) {
                        if (reviewData[field]) {
                            const parsed = safeParse(reviewData[field]);
                            if (parsed && parsed.odor) {
                                result = parsed.odor;
                                break;
                            }
                        }
                    }
                }
            } else if (fieldKey === 'taste') {
                // Try French key 'gouts' first (from formData), then nested keys
                result = reviewData.gouts || reviewData.taste;
                if (!result) {
                    const checkFields = ['sensoryData', 'sensorielle', 'evaluation', 'infosProduit', 'productInfo', 'data'];
                    for (const field of checkFields) {
                        if (reviewData[field]) {
                            const parsed = safeParse(reviewData[field]);
                            if (parsed && parsed.taste) {
                                result = parsed.taste;
                                break;
                            }
                        }
                    }
                }
            } else if (fieldKey === 'effects') {
                // Try French key 'effets' first (from formData), then nested keys
                result = reviewData.effets || reviewData.effects;
                if (!result) {
                    const checkFields = ['sensoryData', 'sensorielle', 'evaluation', 'infosProduit', 'productInfo', 'data'];
                    for (const field of checkFields) {
                        if (reviewData[field]) {
                            const parsed = safeParse(reviewData[field]);
                            if (parsed && parsed.effects) {
                                result = parsed.effects;
                                break;
                            }
                        }
                    }
                }
            } else if (['visual', 'texture', 'terpenes', 'terpeneProfile'].includes(fieldKey)) {
                // Standard sensory data lookup
                const checkFields = ['sensoryData', 'sensorielle', 'evaluation', 'infosProduit', 'productInfo', 'data'];
                for (const field of checkFields) {
                    if (reviewData[field]) {
                        const parsed = safeParse(reviewData[field]);
                        if (parsed && parsed[fieldKey]) {
                            result = parsed[fieldKey];
                            break;
                        }
                    }
                }
            } else if (['thc', 'cbd', 'cbg', 'cbc', 'cbn', 'thcv', 'labReport', 'labReportUrl'].includes(fieldKey)) {
                const analyticsFields = ['analytics', 'analytiques', 'dosages', 'infosProduit'];
                for (const field of analyticsFields) {
                    if (reviewData[field]) {
                        const parsed = safeParse(reviewData[field]);
                        if (parsed && parsed[fieldKey] !== undefined) {
                            result = parsed[fieldKey];
                            break;
                        }
                    }
                }
            } else if (fieldKey === 'overallRating') {
                result = reviewData.overallRating ?? reviewData.rating ?? reviewData.score;
            }
        } catch (err) {
            // swallow parse errors and return null
            console.warn('[useReviewData] resolveReviewField error', err);
            result = null;
        }

        reviewFieldCacheRef.current.data[fieldKey] = result;
        return result;
    };

    const templateData = useMemo(() => {
        if (!reviewData) return {};

        // Helper pour normaliser les objets odeur/goût/effets
        const normalizeOdor = (odor) => {
            if (!odor) return null;
            return {
                dominant: odor.dominant || odor.dominantNotes || [],
                secondary: odor.secondary || odor.secondaryNotes || [],
                intensity: odor.intensity ?? odor.intensite ?? null,
                complexity: odor.complexity ?? odor.complexite ?? null,
                fidelity: odor.fidelity ?? odor.fidelite ?? null
            };
        };

        const normalizeTaste = (taste) => {
            if (!taste) return null;
            return {
                intensity: taste.intensity ?? taste.intensite ?? null,
                aggressiveness: taste.aggressiveness ?? taste.agressiveness ?? taste.agressivite ?? null,
                dryPuff: taste.dryPuff || taste.dryPuffNotes || [],
                inhalation: taste.inhalation || taste.inhalationNotes || [],
                exhalation: taste.exhalation || taste.exhalationNotes || taste.expirationNotes || []
            };
        };

        const normalizeEffects = (effects) => {
            if (!effects) return null;
            return {
                onset: effects.onset ?? effects.montee ?? null,
                intensity: effects.intensity ?? effects.intensite ?? null,
                duration: effects.duration ?? effects.duree ?? null,
                effects: effects.effects || effects.effetsChoisis || []
            };
        };

        const rawOdor = resolveReviewField('odor');
        const rawTaste = resolveReviewField('taste');
        const rawEffects = resolveReviewField('effects');

        return {
            genetics: resolveReviewField('genetics'),
            analytics: {
                thc: resolveReviewField('thc'),
                cbd: resolveReviewField('cbd'),
                cbg: resolveReviewField('cbg'),
                cbc: resolveReviewField('cbc'),
                cbn: resolveReviewField('cbn'),
                thcv: resolveReviewField('thcv')
            },
            visual: resolveReviewField('visual'),
            texture: resolveReviewField('texture'),
            odor: normalizeOdor(rawOdor),
            taste: normalizeTaste(rawTaste),
            effects: normalizeEffects(rawEffects),
            terpenes: resolveReviewField('terpenes') || resolveReviewField('terpeneProfile'),
            rating: resolveReviewField('overallRating') || reviewData?.rating || reviewData?.overallRating
        };
    }, [reviewData]);

    const avgScore = (obj) => {
        if (!obj || typeof obj !== 'object') return null;
        const vals = Object.values(obj).filter(v => typeof v === 'number' && !isNaN(v) && v >= 0);
        if (!vals.length) return null;
        return parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1));
    };

    const getCategoryScores = () => {
        const visual = resolveReviewField('visual') || {};
        const odor = resolveReviewField('odor') || {};
        const taste = resolveReviewField('taste') || {};
        const effects = resolveReviewField('effects') || {};
        const texture = resolveReviewField('texture') || {};
        return [
            { key: 'visual', label: 'Visuel', score: avgScore(visual), color: '#A78BFA' },
            { key: 'odor', label: 'Odeur', score: avgScore(odor), color: '#22C55E' },
            { key: 'taste', label: 'Goût', score: avgScore(taste), color: '#F59E0B' },
            { key: 'effects', label: 'Effets', score: avgScore(effects), color: '#06B6D4' },
            { key: 'texture', label: 'Texture', score: avgScore(texture), color: '#FB7185' }
        ].filter(c => c.score != null);
    };

    const getMainImage = () => {
        if (!reviewData) return null;
        return reviewData.mainImage || reviewData.image || reviewData.photo || (Array.isArray(reviewData.gallery) && reviewData.gallery.length > 0 && reviewData.gallery[0]) || null;
    };

    return { templateData, resolveReviewField, getCategoryScores, getMainImage };
}
