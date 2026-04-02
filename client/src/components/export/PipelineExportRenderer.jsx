/**
 * PipelineExportRenderer
 * Rend les pipelines (Culture, Curing, Extraction, etc.) pour export
 * Version simplifiée pour les templates d'export
 */

import React from 'react';

/**
 * Rend un pipeline en format grid compact pour export
 */
export function PipelineExportRenderer({ pipeline, type = 'culture', maxItems = 10, compact = true }) {
    if (!pipeline || !pipeline.stages || pipeline.stages.length === 0) {
        return null;
    }

    const stages = Array.isArray(pipeline.stages) 
        ? pipeline.stages.slice(0, maxItems)
        : [];

    if (stages.length === 0) return null;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: compact ? 'repeat(5, 1fr)' : 'repeat(3, 1fr)',
            gap: '8px',
            marginTop: '12px'
        }}>
            {stages.map((stage, idx) => (
                <div
                    key={`stage-${idx}`}
                    style={{
                        padding: '8px 6px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        borderRadius: '6px',
                        textAlign: 'center',
                        fontSize: '11px',
                        color: '#10b981',
                        fontWeight: 600
                    }}
                >
                    <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {stage.phaseName || stage.name || `Day ${idx + 1}`}
                    </div>
                    {stage.value && (
                        <div style={{ fontSize: '9px', opacity: 0.7, marginTop: '2px' }}>
                            {stage.value}
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

/**
 * Rend les données d'environnement (température, humidité, etc.)
 */
export function EnvironmentDataRenderer({ environment, compact = true }) {
    if (!environment) return null;

    const entries = Object.entries(environment)
        .filter(([, value]) => value !== null && value !== undefined)
        .slice(0, 6);

    if (entries.length === 0) return null;

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: compact ? 'repeat(3, 1fr)' : 'repeat(2, 1fr)',
            gap: '8px',
            marginTop: '12px'
        }}>
            {entries.map(([key, value]) => (
                <div
                    key={key}
                    style={{
                        padding: '6px 4px',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid rgba(59, 130, 246, 0.3)',
                        borderRadius: '4px',
                        fontSize: '10px',
                        color: '#3b82f6'
                    }}
                >
                    <div style={{ fontWeight: 600, textTransform: 'capitalize' }}>
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                    </div>
                    <div style={{ fontSize: '9px', opacity: 0.8 }}>
                        {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                    </div>
                </div>
            ))}
        </div>
    );
}

/**
 * Rend le profil terpénique simplifié
 */
export function TerpeneProfileRenderer({ terpenes, maxItems = 5 }) {
    if (!terpenes || terpenes.length === 0) return null;

    const list = Array.isArray(terpenes) 
        ? terpenes.slice(0, maxItems)
        : [];

    return (
        <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            marginTop: '8px'
        }}>
            {list.map((terpene, idx) => (
                <div
                    key={idx}
                    style={{
                        padding: '3px 8px',
                        backgroundColor: 'rgba(139, 92, 246, 0.15)',
                        border: '1px solid rgba(139, 92, 246, 0.4)',
                        borderRadius: '12px',
                        fontSize: '9px',
                        color: '#8b5cf6',
                        fontWeight: 500,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {terpene}
                </div>
            ))}
        </div>
    );
}

/**
 * Rend les cannabinoids  analytiques
 */
export function CannabinoidsRenderer({ cannabinoids, maxItems = 4 }) {
    if (!cannabinoids) return null;

    const thc = cannabinoids.thc || cannabinoids.THC;
    const cbd = cannabinoids.cbd || cannabinoids.CBD;
    const cbg = cannabinoids.cbg || cannabinoids.CBG;

    if (!thc && !cbd && !cbg) return null;

    const items = [];
    if (thc) items.push({ label: 'THC', value: thc });
    if (cbd) items.push({ label: 'CBD', value: cbd });
    if (cbg) items.push({ label: 'CBG', value: cbg });

    return (
        <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${Math.min(items.length, maxItems)}, 1fr)`,
            gap: '6px',
            marginTop: '8px'
        }}>
            {items.map((item, idx) => (
                <div
                    key={idx}
                    style={{
                        padding: '6px',
                        backgroundColor: 'rgba(251, 146, 60, 0.1)',
                        border: '1px solid rgba(251, 146, 60, 0.3)',
                        borderRadius: '4px',
                        textAlign: 'center',
                        fontSize: '10px',
                        color: '#fb923c'
                    }}
                >
                    <div style={{ fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '9px', opacity: 0.8 }}>{item.value}%</div>
                </div>
            ))}
        </div>
    );
}

/**
 * Section complète de pipelines + environnement + analytics
 */
export function CompleteDataSection({ reviewData, theme = 'dark' }) {
    return (
        <div style={{ marginTop: '16px', padding: '0 12px' }}>
            {/* Culture Pipeline */}
            {reviewData.culturePipeline && (
                <div style={{ marginBottom: '12px' }}>
                    <h4 style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#10b981',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Culture
                    </h4>
                    <PipelineExportRenderer 
                        pipeline={reviewData.culturePipeline}
                        type="culture"
                    />
                </div>
            )}

            {/* Curing Pipeline */}
            {reviewData.curingPipeline && (
                <div style={{ marginBottom: '12px' }}>
                    <h4 style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#8b5cf6',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Curing / Maturation
                    </h4>
                    <PipelineExportRenderer 
                        pipeline={reviewData.curingPipeline}
                        type="curing"
                    />
                </div>
            )}

            {/* Environment Data */}
            {reviewData.environmentData && (
                <div style={{ marginBottom: '12px' }}>
                    <h4 style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#3b82f6',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Environnement
                    </h4>
                    <EnvironmentDataRenderer environment={reviewData.environmentData} />
                </div>
            )}

            {/* Terpene Profile */}
            {(reviewData.terpeneAnalysis || reviewData.terpenes) && (
                <div style={{ marginBottom: '12px' }}>
                    <h4 style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#8b5cf6',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Terphénol
                    </h4>
                    <TerpeneProfileRenderer 
                        terpenes={reviewData.terpeneAnalysis || reviewData.terpenes}
                    />
                </div>
            )}

            {/* Cannabinoids */}
            {reviewData.cannabinoidAnalysis && (
                <div style={{ marginBottom: '12px' }}>
                    <h4 style={{
                        fontSize: '11px',
                        fontWeight: 600,
                        color: '#fb923c',
                        marginBottom: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}>
                        Cannabinoids
                    </h4>
                    <CannabinoidsRenderer cannabinoids={reviewData.cannabinoidAnalysis} />
                </div>
            )}
        </div>
    );
}

export default {
    PipelineExportRenderer,
    EnvironmentDataRenderer,
    TerpeneProfileRenderer,
    CannabinoidsRenderer,
    CompleteDataSection
};
