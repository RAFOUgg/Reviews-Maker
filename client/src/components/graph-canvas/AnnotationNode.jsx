/**
 * AnnotationNode Component
 *
 * Carte épinglée librement sur le fond du canvas — partagée par les deux domaines (Chaîne de
 * production ET PhenoHunt, cf. GraphCanvasShell.jsx pour le principe de mutualisation du
 * mécanique commun). Contrairement à un nœud produit/cultivar, ce n'est pas relié par des
 * arêtes : pas de Handle, pas de sélection/panneau associé — juste une note visuelle libre,
 * déplaçable (drag React Flow natif du nœud) et supprimable indépendamment via son propre bouton.
 *
 * Deux usages qui ne se ressemblent volontairement PAS : une note texte (glissée-déposée depuis
 * un résumé pipeline/cellule attachée, `data.body` rempli — habillage carte compacte historique)
 * ou une "bulle média" (photo/vidéo importée directement sur le canvas, `data.mediaUrl` rempli) —
 * cette dernière reprend le même gabarit visuel qu'un vrai nœud produit/cultivar (.cultivar-node,
 * 140x140 arrondi) pour se lire comme un phéno/produit du graphe, pas comme une simple annotation.
 */

import React from 'react';
import { Pin, X, Image as ImageIcon, Film } from 'lucide-react';

const AnnotationNode = ({ data }) => {
    const body = Array.isArray(data.body) ? data.body : [];

    if (data.mediaUrl) {
        return (
            <div className="cultivar-node shape-rounded media-bubble-node" style={{ '--accent-color': '#f59e0b' }}>
                <button
                    type="button"
                    className="chain-annotation-delete nodrag nopan"
                    onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }}
                    title="Retirer cette bulle"
                >
                    <X size={11} />
                </button>
                <div className="media-bubble-fill nodrag nopan">
                    {data.mediaType === 'video' ? (
                        <video src={data.mediaUrl} autoPlay loop muted playsInline />
                    ) : (
                        <img src={data.mediaUrl} alt={data.title || ''} />
                    )}
                </div>
                <span className="node-sex-badge" title={data.mediaType === 'video' ? 'Vidéo' : 'Photo'}>
                    {data.mediaType === 'video' ? <Film size={10} /> : <ImageIcon size={10} />}
                </span>
                {data.title && <div className="media-bubble-caption" title={data.title}>{data.title}</div>}
            </div>
        );
    }

    return (
        <div className="chain-annotation-card">
            <button
                type="button"
                className="chain-annotation-delete nodrag nopan"
                onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }}
                title="Retirer cette carte"
            >
                <X size={11} />
            </button>

            <div className="chain-annotation-header">
                <Pin size={12} />
                <span className="chain-annotation-title">{data.title}</span>
            </div>
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
