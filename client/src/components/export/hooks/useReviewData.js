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
            } else if (['visual', 'texture'].includes(fieldKey)) {
                // Check French key aliases first (visuel, texture already covered by early check)
                if (fieldKey === 'visual') {
                    result = reviewData.visuel || reviewData.visual || null;
                } else {
                    result = reviewData.texture || null;
                }
                // Fallback: search nested JSON fields
                if (!result) {
                    const checkFields = ['sensoryData', 'sensorielle', 'evaluation', 'infosProduit', 'productInfo', 'data'];
                    for (const field of checkFields) {
                        if (reviewData[field]) {
                            const parsed = safeParse(reviewData[field]);
                            if (parsed && parsed[fieldKey]) { result = parsed[fieldKey]; break; }
                        }
                    }
                }
            } else if (['thc', 'cbd', 'cbg', 'cbc', 'cbn', 'thcv', 'labReport', 'labReportUrl'].includes(fieldKey)) {
                // Check for thcPercent/cbdPercent etc. variants first (new form structure)
                const percentKey = fieldKey + 'Percent';
                if (reviewData[percentKey] !== undefined && reviewData[percentKey] !== null) {
                    result = reviewData[percentKey];
                } else if (reviewData.analytics?.[percentKey] !== undefined && reviewData.analytics[percentKey] !== null) {
                    result = reviewData.analytics[percentKey];
                } else if (reviewData.analytics?.[fieldKey] !== undefined && reviewData.analytics[fieldKey] !== null) {
                    result = reviewData.analytics[fieldKey];
                }
                // Fallback: search nested JSON fields
                if (result == null) {
                    const analyticsFields = ['analytics', 'analytiques', 'dosages', 'infosProduit'];
                    for (const field of analyticsFields) {
                        if (reviewData[field]) {
                            const parsed = safeParse(reviewData[field]);
                            if (parsed) {
                                const v = parsed[fieldKey] ?? parsed[percentKey];
                                if (v !== undefined && v !== null) { result = v; break; }
                            }
                        }
                    }
                }
                // labReportUrl also accessible via top-level
                if (result == null && (fieldKey === 'labReport' || fieldKey === 'labReportUrl')) {
                    result = reviewData.labReportUrl ?? null;
                }
            } else if (['terpenes', 'terpeneProfile'].includes(fieldKey)) {
                // Terpenes can be in analytics.terpeneProfile (array) or top-level
                const tp = reviewData.analytics?.terpeneProfile ?? reviewData.terpeneProfile ?? reviewData.terpenes;
                if (tp != null) {
                    result = Array.isArray(tp) ? tp : safeParse(tp);
                }
            } else if (['cultivar', 'cultivarsList', 'cultivars'].includes(fieldKey)) {
                // Cultivar list: check multiple key variants (flower vs hash/concentrate naming)
                const list = reviewData.cultivarsList || reviewData.cultivars || reviewData.cultivarsUtilises;
                if (Array.isArray(list)) {
                    result = list;
                } else if (typeof list === 'string' && list) {
                    result = list.split(',').map(s => s.trim()).filter(Boolean);
                } else {
                    result = null;
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
                intensity: odor.intensity ?? odor.intensite ?? odor.intensiteAromatique ?? null,
                complexity: odor.complexity ?? odor.complexite ?? null,
                fidelity: odor.fidelity ?? odor.fidelite ?? odor.fideliteCultivars ?? null
            };
        };

        const normalizeTaste = (taste) => {
            if (!taste) return null;
            return {
                intensity: taste.intensity ?? taste.intensite ?? null,
                aggressiveness: taste.aggressiveness ?? taste.agressiveness ?? taste.agressivite ?? taste.agressivitePiquant ?? null,
                dryPuff: taste.dryPuff || taste.dryPuffNotes || [],
                inhalation: taste.inhalation || taste.inhalationNotes || [],
                exhalation: taste.exhalation || taste.exhalationNotes || taste.expirationNotes || []
            };
        };

        const normalizeEffects = (effects) => {
            if (!effects) return null;
            return {
                onset: effects.onset ?? effects.montee ?? effects.monteeRapidite ?? null,
                intensity: effects.intensity ?? effects.intensite ?? effects.intensiteEffets ?? null,
                duration: effects.duration ?? effects.duree ?? null,
                effects: effects.effects || effects.effetsChoisis || []
            };
        };

        const rawOdor = resolveReviewField('odor');
        const rawTaste = resolveReviewField('taste');
        const rawEffects = resolveReviewField('effects');

        const geneticsObj = resolveReviewField('genetics');
        const cultivarsList = resolveReviewField('cultivars');

        return {
            genetics: geneticsObj,
            geneticsInfo: {
                breeder: geneticsObj?.breeder ?? reviewData.genetics?.breeder ?? null,
                geneticType: geneticsObj?.geneticType ?? reviewData.genetics?.geneticType ?? null,
                indicaPercent: geneticsObj?.indicaPercent ?? reviewData.genetics?.indicaPercent ?? null,
                sativaPercent: geneticsObj?.sativaPercent ?? reviewData.genetics?.sativaPercent ?? null,
            },
            cultivars: cultivarsList,
            analytics: {
                thc: resolveReviewField('thc'),
                cbd: resolveReviewField('cbd'),
                cbg: resolveReviewField('cbg'),
                cbc: resolveReviewField('cbc'),
                cbn: resolveReviewField('cbn'),
                thcv: resolveReviewField('thcv'),
                labReportUrl: resolveReviewField('labReportUrl'),
            },
            visual: resolveReviewField('visual'),
            texture: resolveReviewField('texture'),
            odor: normalizeOdor(rawOdor),
            taste: normalizeTaste(rawTaste),
            effects: normalizeEffects(rawEffects),
            terpenes: resolveReviewField('terpenes'),
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
        // Direct URL fields
        if (reviewData.mainImage) return reviewData.mainImage;
        if (reviewData.image) return reviewData.image;
        if (reviewData.photo) return reviewData.photo;
        // photos array (FlowerReview/HashReview/ConcentrateReview form state)
        if (Array.isArray(reviewData.photos) && reviewData.photos.length > 0) {
            const p = reviewData.photos[0];
            return typeof p === 'string' ? p : (p?.url || p?.preview || null);
        }
        // gallery array
        if (Array.isArray(reviewData.gallery) && reviewData.gallery.length > 0) {
            const g = reviewData.gallery[0];
            return typeof g === 'string' ? g : (g?.url || g?.preview || null);
        }
        // images JSON string or array (FlowerReview DB field)
        const imgs = reviewData.images;
        if (imgs) {
            const arr = Array.isArray(imgs) ? imgs : (typeof imgs === 'string' ? (() => { try { return JSON.parse(imgs); } catch { return []; } })() : []);
            if (arr.length > 0) {
                const img = arr[0];
                return typeof img === 'string' ? img : (img?.url || img?.preview || null);
            }
        }
        return null;
    };

    return { templateData, resolveReviewField, getCategoryScores, getMainImage };
}
