import { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
    colorWithOpacity,
    formatDate,
    getResponsiveAdjustments,
} from '../../utils/orchardHelpers';
import { resolveImageUrl } from '../../utils/orchard/resolveImageUrl';
import { getLotCode, getLotCodeUrl } from '../../utils/lotCode';
import { evaluateChainEventRules } from '../../utils/chainEventRules';
import ProductionChainMiniView from '../export/interactive/ProductionChainMiniView';
import GenealogyMiniView from '../export/interactive/GenealogyMiniView';
import PipelineMiniGrid from '../export/interactive/PipelineMiniGrid';

const BUSINESS_TYPE_LABELS = {
    farm: 'Ferme', laboratory: 'Laboratoire', extractor: 'Extracteur',
    manufacturer: 'Fabricant', distributor: 'Distributeur', other: 'Producteur',
};

const LAB_METHOD_LABELS = {
    hplc: 'HPLC', gc: 'GC', gcms: 'GC-MS', hplcms: 'HPLC-MS', other: 'Autre méthode',
};

const TIMELINE_PIPELINES = [
    { type: 'culture', name: 'Culture', icon: '🌱', dataKey: 'cultureTimelineData', configKey: 'cultureTimelineConfig' },
    { type: 'curing', name: 'Curing & Maturation', icon: '🔥', dataKey: 'curingTimelineData', configKey: 'curingTimelineConfig' },
    { type: 'extraction', name: 'Extraction', icon: '⚗️', dataKey: 'extractionTimelineData', configKey: 'extractionTimelineConfig' },
    { type: 'separation', name: 'Séparation', icon: '🔬', dataKey: 'separationTimelineData', configKey: 'separationTimelineConfig' },
];

function normalizeReviewType(type) {
    const t = (type || '').toLowerCase();
    if (t.includes('hash')) return 'hash';
    if (t.includes('concentr')) return 'concentrate';
    if (t.includes('edible') || t.includes('comestible')) return 'edible';
    return 'flower';
}

// Bilan matière (Chantier 3) : n'affiche QUE les champs réellement renseignés, jamais de valeur
// inventée — cohérent avec l'échappatoire libre déjà en place sur le reste du produit.
function getMassBalanceRows(reviewData) {
    const rows = [];
    if (reviewData.poidsBrut || reviewData.poidsNet) {
        rows.push({
            label: 'Récolte', icon: '🌾',
            detail: [
                reviewData.poidsBrut && `${reviewData.poidsBrut}g brut`,
                reviewData.poidsNet && `${reviewData.poidsNet}g net`,
                reviewData.poidsBrut && reviewData.poidsNet && `rendement ${((reviewData.poidsNet / reviewData.poidsBrut) * 100).toFixed(1)}%`,
            ].filter(Boolean).join(' · '),
        });
    }
    if (reviewData.finalWeight || reviewData.servings) {
        rows.push({
            label: 'Recette', icon: '🍽️',
            detail: [
                reviewData.finalWeight && `${reviewData.finalWeight}g au total`,
                reviewData.servings && `${reviewData.servings} portions`,
                reviewData.poidsParPortion && `${reviewData.poidsParPortion}g/portion`,
            ].filter(Boolean).join(' · '),
        });
    }
    return rows;
}

function useReviewEvents(reviewData) {
    const [events, setEvents] = useState([]);
    const reviewId = reviewData?.id;
    const reviewType = normalizeReviewType(reviewData?.type);

    useEffect(() => {
        if (!reviewId) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/production-chains/for-review/${reviewType}/${reviewId}/events`, { credentials: 'include' });
                if (!res.ok || cancelled) return;
                const data = await res.json();
                if (!cancelled) setEvents(Array.isArray(data) ? data : []);
            } catch {
                // pas d'événements — journal simplement vide
            }
        })();
        return () => { cancelled = true; };
    }, [reviewId, reviewType]);

    return events;
}

/**
 * TraceabilityReportTemplate — rapport de traçabilité complet (Chantier 6 de la roadmap
 * traçabilité). Assemble en une page A4 : identité + confiance producteur/labo (Chantier 5),
 * identifiant de lot + QR (Chantier 8), bilan matière (Chantier 3), pipelines et chaîne de
 * production (vues interactives déjà existantes), journal d'événements (Chantier 1/2/4).
 * Contrairement à `DetailedCardTemplate`, ce template n'affiche QUE les sections qui ont des
 * données réelles — un rapport de traçabilité vide de contenu n'a aucune valeur probante.
 */
export default function TraceabilityReportTemplate({ config, reviewData, dimensions }) {
    if (!config || !reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 p-8">
                <p className="text-gray-500 text-lg">📋 Données manquantes pour le rapport</p>
            </div>
        );
    }

    const { typography, colors } = config;
    const responsive = getResponsiveAdjustments(config.ratio, typography);
    const { fontSize, padding, spacing } = responsive;

    const mainImage = resolveImageUrl(
        (Array.isArray(reviewData.images) && reviewData.images.length > 0)
            ? reviewData.images[0]
            : (reviewData.mainImageUrl || reviewData.imageUrl || null)
    );

    const massBalanceRows = getMassBalanceRows(reviewData);
    const events = useReviewEvents(reviewData);
    const activeTimelines = TIMELINE_PIPELINES.filter(t => reviewData[t.dataKey] && reviewData[t.configKey]);

    const hasLabInfo = reviewData.labName || reviewData.labMethod || reviewData.labAccredited;
    const hasTrustInfo = reviewData.producerVerified || hasLabInfo;

    const Section = ({ title, icon, children }) => {
        if (!children || (Array.isArray(children) && children.every(c => !c))) return null;
        return (
            <div style={{ marginBottom: `${spacing.section}px` }}>
                <h3 style={{
                    fontSize: `${fontSize.section}px`, fontWeight: 700, color: colors.title,
                    marginBottom: `${spacing.element}px`, display: 'flex', alignItems: 'center', gap: 8,
                    borderBottom: `2px solid ${colorWithOpacity(colors.accent, 35)}`, paddingBottom: 6,
                }}>
                    <span>{icon}</span> {title}
                </h3>
                {children}
            </div>
        );
    };

    return (
        <div
            className="w-full h-full flex flex-col"
            style={{
                backgroundColor: colors.background,
                padding: `${padding.container}px`,
                fontFamily: typography.fontFamily,
                color: colors.textPrimary,
                overflowY: 'auto',
            }}
        >
            {/* En-tête : identité + identifiant de lot/QR (Chantier 8) */}
            <div style={{ display: 'flex', gap: spacing.section, marginBottom: `${spacing.section}px` }}>
                {mainImage && (
                    <img src={mainImage} alt="" style={{ width: 96, height: 96, objectFit: 'cover', borderRadius: 12, flexShrink: 0 }} />
                )}
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.accent, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                        Rapport de traçabilité — {reviewData.type || normalizeReviewType(reviewData.type)}
                    </div>
                    <h1 style={{ fontSize: `${fontSize.title}px`, fontWeight: 800, color: colors.title, margin: '4px 0' }}>
                        {reviewData.holderName || reviewData.title || 'Sans nom'}
                    </h1>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary }}>
                        Généré le {formatDate(new Date())} · Rédigé par {typeof reviewData.author === 'string' ? reviewData.author : (reviewData.author?.username || 'Anonyme')}
                    </div>
                </div>
                {reviewData.id && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                        <div style={{ background: '#fff', padding: 4, borderRadius: 6, lineHeight: 0 }}>
                            <QRCodeSVG value={getLotCodeUrl(reviewData.id)} size={56} level="M" />
                        </div>
                        <div style={{ fontSize: `${fontSize.small}px` }}>
                            <div style={{ fontFamily: 'monospace', fontWeight: 700 }}>{getLotCode(reviewData.id)}</div>
                            <div style={{ opacity: 0.6, fontSize: `${fontSize.small - 2}px` }}>Identifiant interne — non réglementaire</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Confiance producteur/labo (Chantier 5) */}
            {hasTrustInfo && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: `${spacing.section}px` }}>
                    {reviewData.producerVerified && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999,
                            background: colorWithOpacity('#22c55e', 15), border: `1px solid ${colorWithOpacity('#22c55e', 35)}`,
                            fontSize: `${fontSize.small}px`, color: '#22c55e', fontWeight: 700,
                        }}>
                            ✓ Producteur vérifié{BUSINESS_TYPE_LABELS[reviewData.producerBusinessType] ? ` · ${BUSINESS_TYPE_LABELS[reviewData.producerBusinessType]}` : ''}
                        </div>
                    )}
                    {hasLabInfo && (
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 10px', borderRadius: 999,
                            background: colorWithOpacity(colors.accent, 12), border: `1px solid ${colorWithOpacity(colors.accent, 30)}`,
                            fontSize: `${fontSize.small}px`, color: colors.accent, fontWeight: 700,
                        }}>
                            🔬 {[
                                reviewData.labName,
                                reviewData.labMethod && (LAB_METHOD_LABELS[reviewData.labMethod] || reviewData.labMethod),
                                reviewData.labAccredited && `accrédité${reviewData.labAccreditationStandard ? ` ${reviewData.labAccreditationStandard}` : ''}`,
                            ].filter(Boolean).join(' · ')}
                        </div>
                    )}
                </div>
            )}

            {/* Bilan matière (Chantier 3) */}
            {massBalanceRows.length > 0 && (
                <Section title="Bilan matière" icon="⚖️">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {massBalanceRows.map(row => (
                            <div key={row.label} style={{
                                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px',
                                background: colorWithOpacity(colors.accent, 6), borderRadius: 8,
                                fontSize: `${fontSize.text}px`,
                            }}>
                                <span>{row.icon}</span>
                                <strong>{row.label}</strong>
                                <span style={{ color: colors.textSecondary }}>{row.detail}</span>
                            </div>
                        ))}
                    </div>
                </Section>
            )}

            {/* Chaîne de production (vue interactive existante) */}
            <ProductionChainMiniView reviewData={reviewData} sectionFontSize={fontSize.section} accentColor={colors.accent} titleColor={colors.title} />

            {/* Généalogie / PhenoHunt */}
            <div style={{ marginTop: `${spacing.section}px` }}>
                <GenealogyMiniView reviewData={reviewData} compact sectionFontSize={fontSize.section} accentColor={colors.accent} titleColor={colors.title} />
            </div>

            {/* Pipelines documentés */}
            {activeTimelines.length > 0 && (
                <Section title="Pipelines documentés" icon="📅">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.section }}>
                        {activeTimelines.map(t => (
                            <PipelineMiniGrid
                                key={t.type} type={t.type} name={t.name} icon={t.icon}
                                timelineData={reviewData[t.dataKey]} timelineConfig={reviewData[t.configKey]}
                                accentColor={colors.accent}
                            />
                        ))}
                    </div>
                </Section>
            )}

            {/* Journal d'événements (Chantier 1/2/4) */}
            {events.length > 0 && (
                <Section title="Journal d'événements" icon="📜">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {events.slice(0, 30).map(event => {
                            const derivedBadges = evaluateChainEventRules(event);
                            const isManual = event.action === 'manual.event';
                            const label = isManual ? (event.metadata?.title || 'Événement') : event.action;
                            return (
                                <div key={event.id} style={{
                                    padding: '6px 10px', borderRadius: 8,
                                    background: colorWithOpacity(colors.accent, 5),
                                    borderLeft: `3px solid ${derivedBadges.length > 0 ? '#f59e0b' : colorWithOpacity(colors.accent, 40)}`,
                                    fontSize: `${fontSize.small}px`,
                                }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                        <strong>{label}</strong>
                                        <span style={{ opacity: 0.6 }}>{formatDate(event.createdAt)}</span>
                                    </div>
                                    {event.metadata?.description && (
                                        <div style={{ color: colors.textSecondary }}>{event.metadata.description}</div>
                                    )}
                                    {derivedBadges.map(badge => (
                                        <div key={badge} style={{ color: '#f59e0b', fontWeight: 600, marginTop: 2 }}>{badge}</div>
                                    ))}
                                </div>
                            );
                        })}
                    </div>
                </Section>
            )}
        </div>
    );
}
