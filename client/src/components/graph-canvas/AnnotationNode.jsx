/**
 * AnnotationNode Component
 *
 * Carte épinglée librement sur le fond du canvas — partagée par les deux domaines (Chaîne de
 * production ET PhenoHunt, cf. GraphCanvasShell.jsx pour le principe de mutualisation du
 * mécanique commun). Déplaçable (drag React Flow natif du nœud) et supprimable indépendamment
 * via son propre bouton, dans les deux domaines.
 *
 * Connectable par liaison (Handles) uniquement si `data.connectable` est vrai — pour l'instant
 * seule ProductionChainCanvas.jsx pose ce flag (ChainEdge sait référencer une bulle comme
 * extrémité depuis l'ajout de sourceAnnotationId/targetAnnotationId). PhenoHunt réutilise le même
 * composant mais son modèle GenEdge ne référence que des GenNode : ne jamais rendre les Handles
 * par défaut, sous peine d'exposer une action de connexion qui casserait côté PhenoHunt.
 *
 * Deux usages qui ne se ressemblent volontairement PAS : une note texte (glissée-déposée depuis
 * un résumé pipeline/cellule attachée, `data.body` rempli — habillage carte compacte historique)
 * ou une "bulle média" (photo/vidéo importée directement sur le canvas, `data.mediaUrl` rempli) —
 * cette dernière reprend le même gabarit visuel qu'un vrai nœud produit/cultivar (.cultivar-node,
 * 140x140 arrondi) pour se lire comme un phéno/produit du graphe, pas comme une simple annotation.
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import { Pin, X, Image as ImageIcon, Film } from 'lucide-react';

// Mêmes Handles (ids/positions) que ReviewNode.jsx — condition sur `connectable` pour que seule
// ProductionChainCanvas (qui pose ce flag) puisse initier une liaison depuis une bulle.
const ConnectHandles = () => (
    <>
        <Handle type="target" id="top-target" position={Position.Top} className="node-handle top" />
        <Handle type="target" id="left-target" position={Position.Left} className="node-handle left" />
        <Handle type="source" id="left-source" position={Position.Left} className="node-handle left" />
        <Handle type="target" id="right-target" position={Position.Right} className="node-handle right" />
        <Handle type="source" id="right-source" position={Position.Right} className="node-handle right" />
        <Handle type="source" id="bottom-source" position={Position.Bottom} className="node-handle bottom" />
    </>
);

const AnnotationNode = ({ data }) => {
    const body = Array.isArray(data.body) ? data.body : [];

    if (data.mediaUrl) {
        return (
            <div className="cultivar-node shape-rounded media-bubble-node" style={{ '--accent-color': '#f59e0b' }}>
                {data.connectable && <ConnectHandles />}
                <button
                    type="button"
                    className="chain-annotation-delete nodrag nopan"
                    onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }}
                    title="Retirer cette bulle"
                >
                    <X size={11} />
                </button>
                {/* Pas de nodrag ici : contrairement au bouton de suppression, cette zone couvre
                    la quasi-totalité de la bulle — la marquer nodrag revenait à rendre la bulle
                    quasi impossible à déplacer (seule une mince bordure restait draggable). Le
                    drag natif du navigateur sur l'image (ghost image au clic-glissé) est coupé
                    via draggable={false} sur <img>, pas via la classe React Flow. */}
                <div className="media-bubble-fill">
                    {data.mediaType === 'video' ? (
                        <video src={data.mediaUrl} autoPlay loop muted playsInline />
                    ) : (
                        <img src={data.mediaUrl} alt={data.title || ''} draggable={false} />
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
            {data.connectable && <ConnectHandles />}
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
