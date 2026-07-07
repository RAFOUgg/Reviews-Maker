/**
 * AnnotationNode Component
 *
 * Carte épinglée librement sur le fond du canvas — partagée par les deux domaines (Chaîne de
 * production ET PhenoHunt, cf. GraphCanvasShell.jsx pour le principe de mutualisation du
 * mécanique commun). Contrairement à un nœud produit/cultivar, ce n'est pas relié par des
 * arêtes : pas de Handle, pas de sélection/panneau associé — juste une note visuelle libre,
 * déplaçable (drag React Flow natif du nœud) et supprimable indépendamment via son propre bouton.
 *
 * Deux usages : une note texte (glissée-déposée depuis un résumé pipeline/cellule attachée,
 * `data.body` rempli) ou une "bulle média" (photo/vidéo importée directement sur le canvas,
 * `data.mediaUrl` rempli) — les deux se partagent le même habillage carte/titre/suppression,
 * seul le contenu central change.
 */

import React from 'react';
import { Pin, X } from 'lucide-react';

const AnnotationNode = ({ data }) => {
    const body = Array.isArray(data.body) ? data.body : [];

    return (
        <div className={`chain-annotation-card ${data.mediaUrl ? 'chain-annotation-card--media' : ''}`}>
            <button
                type="button"
                className="chain-annotation-delete nodrag nopan"
                onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }}
                title="Retirer cette carte"
            >
                <X size={11} />
            </button>

            {data.mediaUrl && (
                <div className="chain-annotation-media nodrag">
                    {data.mediaType === 'video' ? (
                        <video src={data.mediaUrl} controls className="chain-annotation-media-el" />
                    ) : (
                        <img src={data.mediaUrl} alt={data.title || ''} className="chain-annotation-media-el" />
                    )}
                </div>
            )}

            {(data.title || data.sourceLabel) && (
                <div className="chain-annotation-header">
                    <Pin size={12} />
                    <span className="chain-annotation-title">{data.title}</span>
                </div>
            )}
            {data.sourceLabel && <div className="chain-annotation-source">{data.sourceLabel}</div>}
            {body.length > 0 && (
                <div className="chain-annotation-body">
                    {body.map((line, i) => (
                        <div key={i} className="chain-annotation-line">
                            <span className="chain-annotation-line-label">{line.label}</span>
                            <span className="chain-annotation-line-value">{line.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AnnotationNode;
