/**
 * ChainHoverPreview Component
 *
 * Aperçu flottant affiché au survol (souris) d'un nœud ou d'une liaison de la chaîne de
 * production — donne un résumé du pipeline de la fiche technique concernée (technique, statut de
 * remplissage par étape) sans avoir à cliquer puis ouvrir une modale. Positionné en `fixed` près
 * du curseur (coordonnées écran, pas coordonnées du flow) et `pointer-events: none` : ne doit
 * jamais intercepter un clic destiné au canvas lui-même.
 *
 * `summary` provient de useProductionChainStore.reviewSummaryCache[reviewId] — voir
 * ProductionChainCanvas.jsx (déclenche ensureReviewSummary au survol) et
 * chainPipelineSummary.js/chainCellPipelines.js pour la forme de pipelineSummary/fillSummary.
 */

import React from 'react';
import { Layers, Image as ImageIcon, Loader2 } from 'lucide-react';
import GraphHoverPreview from '../graph-canvas/GraphHoverPreview';
import { TYPE_META } from '../../utils/reviewTypeMeta';

const ChainHoverPreview = ({ x, y, kind, title, subtitle, reviewType, technique, date, cellCount = 0, mediaCount = 0, summary }) => {
    const meta = reviewType ? (TYPE_META[reviewType] || null) : null;
    const Icon = meta?.icon;
    const resolvedSubtitle = subtitle ?? (kind === 'node' && meta ? meta.label : null);

    return (
        <GraphHoverPreview x={x} y={y}>
            <div className="graph-hover-preview-header">
                {Icon && <Icon size={13} className={meta.color} />}
                <span className="graph-hover-preview-title">{title}</span>
            </div>
            {resolvedSubtitle && <div className="graph-hover-preview-subtitle">{resolvedSubtitle}</div>}

            {(technique || date) && (
                <div className="graph-hover-preview-row">
                    {technique && <span>{technique}</span>}
                    {date && <span className="graph-hover-preview-date">{new Date(date).toLocaleDateString('fr-FR')}</span>}
                </div>
            )}

            {(cellCount > 0 || mediaCount > 0) && (
                <div className="graph-hover-preview-badges">
                    {cellCount > 0 && <span><Layers size={11} /> {cellCount}</span>}
                    {mediaCount > 0 && <span><ImageIcon size={11} /> {mediaCount}</span>}
                </div>
            )}

            {summary?.loading && (
                <div className="graph-hover-preview-loading"><Loader2 size={11} className="animate-spin" /> Chargement du pipeline...</div>
            )}

            {!summary?.loading && summary?.pipelineSummary && (
                <div className="graph-hover-preview-pipeline">
                    <p className="graph-hover-preview-pipeline-label">{summary.pipelineSummary.label}</p>
                    {summary.pipelineSummary.technique && <p>{summary.pipelineSummary.technique}</p>}
                </div>
            )}

            {!summary?.loading && Array.isArray(summary?.fillSummary) && summary.fillSummary.length > 0 && (
                <div className="graph-hover-preview-fill">
                    {summary.fillSummary.map(f => (
                        <div key={f.key} className="graph-hover-preview-fill-row">
                            <span>{f.label}</span>
                            <span>{f.filled}/{f.total}</span>
                        </div>
                    ))}
                </div>
            )}
        </GraphHoverPreview>
    );
};

export default ChainHoverPreview;
