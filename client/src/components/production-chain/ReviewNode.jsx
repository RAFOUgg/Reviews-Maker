/**
 * ReviewNode Component
 *
 * Nœud personnalisé pour React Flow représentant une fiche technique (review) dans
 * une chaîne de production. Modelé sur CultivarNode.jsx (même recette visuelle,
 * réutilise les classes de UnifiedGeneticsCanvas.css) mais affiche le type de produit
 * au lieu du sexe/génétique d'un cultivar.
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import { AlertTriangle, Layers, Image as ImageIcon } from 'lucide-react';
import { TYPE_META } from '../../utils/reviewTypeMeta';
import { getImageUrl } from '../../utils/imageUtils';
import useChainZoomTier from './useChainZoomTier';

const ReviewNode = ({ data, selected }) => {
    const meta = TYPE_META[data.reviewType] || TYPE_META.flower;
    const Icon = meta.icon;
    const accentColor = data.color || '#10b981';
    const isSelected = data.selected ?? selected;
    // Niveau de détail selon le zoom (Lot 4) — 'far' (carte minimale), 'default' (rendu actuel,
    // inchangé), 'near' (vignette média réelle + résumé de la cellule la plus récente). La carte
    // garde une hauteur FIXE (.shape-rounded, cf. son commentaire) quel que soit le palier — on ne
    // fait qu'ajouter/masquer du contenu à l'intérieur, jamais varier la taille du nœud lui-même,
    // pour ne jamais déplacer la poignée Bottom mesurée par React Flow.
    const zoomTier = useChainZoomTier();
    const isFar = zoomTier === 'far';
    const isNear = zoomTier === 'near';

    return (
        <div
            className={`cultivar-node shape-rounded ${isSelected ? 'selected' : ''} ${data.dimmed ? 'chain-node-dimmed' : ''} ${data.searchActive ? 'chain-node-search-active' : ''} chain-node-zoom-${zoomTier}`}
            style={{ '--accent-color': accentColor }}
        >
            {/* Top/Bottom ont besoin d'un id explicite comme Left/Right — sinon React Flow leur
                assigne `null`, et la ligne de connexion tirée EN LIVE (avant de lâcher) retombe sur
                le premier handle du bon type dans l'ordre du DOM au lieu de celui réellement saisi
                (cf. CultivarNode.jsx, même correctif). */}
            <Handle type="target" id="top-target" position={Position.Top} className="node-handle top" />
            {/* Handles gauche/droite : mêmes conventions que CultivarNode.jsx, pour permettre une
                disposition libre des chaînes larges (plusieurs entrées convergeant vers une étape) */}
            <Handle type="target" id="left-target" position={Position.Left} className="node-handle left" />
            <Handle type="source" id="left-source" position={Position.Left} className="node-handle left" />
            <Handle type="target" id="right-target" position={Position.Right} className="node-handle right" />
            <Handle type="source" id="right-source" position={Position.Right} className="node-handle right" />

            <div className="node-photo">
                {data.image ? (
                    <img
                        src={getImageUrl(data.image)}
                        alt={data.label}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <Icon className={`node-photo-placeholder ${meta.color}`} />
                )}
                <span className="node-sex-badge" title={meta.label}>
                    <Icon size={10} />
                </span>
            </div>

            {/* Palier 'far' : pas de texte (juste photo/icône + pastille couleur portée par
                --accent-color sur la bordure) — illisible et encombrant sur une vue d'ensemble
                dense, cf. décision Lot 4. */}
            {!isFar && (
                <div className="node-content">
                    <div className="node-label" title={data.label}>{data.label}</div>
                    <div className="node-genetics">
                        <span className="genetics-type">{meta.label}</span>
                    </div>
                    {/* Palier 'near' uniquement : résumé de la cellule pipeline la plus récente —
                        remplace le besoin de cliquer pour voir ne serait-ce que le premier champ. */}
                    {isNear && data.latestCellSummary && (
                        <div className="node-latest-cell" title={data.latestCellSummary}>
                            {data.latestCellSummary}
                        </div>
                    )}
                </div>
            )}

            {data.reviewOrphaned && (
                <div className="node-orphan-badge" title="La review liée à ce produit a été supprimée">
                    <AlertTriangle size={11} strokeWidth={2.5} />
                </div>
            )}

            {data.cellCount > 0 && (
                isFar ? (
                    <div className="node-dot-badge node-dot-badge-cell" title={`${data.cellCount} cellule(s) de pipeline attachée(s)`} />
                ) : (
                    <div
                        className="node-cell-badge"
                        title={`${data.cellCount} cellule${data.cellCount > 1 ? 's' : ''} de pipeline attachée${data.cellCount > 1 ? 's' : ''}`}
                        style={{
                            position: 'absolute',
                            bottom: -4,
                            right: -4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '1px 5px',
                            borderRadius: 999,
                            background: 'rgba(16, 185, 129, 0.9)',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 600,
                            lineHeight: '14px',
                            border: '1px solid rgba(255,255,255,0.6)'
                        }}
                    >
                        <Layers size={9} strokeWidth={2.5} />
                        {data.cellCount}
                    </div>
                )
            )}

            {data.mediaCount > 0 && (
                isFar ? (
                    <div className="node-dot-badge node-dot-badge-media" title={`${data.mediaCount} photo(s)/vidéo(s) attachée(s)`} />
                ) : isNear && data.previewMediaUrl ? (
                    // Palier 'near' : vraie vignette (première photo/vidéo attachée) plutôt qu'un
                    // simple chiffre — même position/gabarit que le badge de comptage pour ne rien
                    // faire varier dans la mise en page du nœud.
                    <div
                        className="node-media-thumb"
                        title={`${data.mediaCount} photo${data.mediaCount > 1 ? 's' : ''}/vidéo${data.mediaCount > 1 ? 's' : ''} attachée${data.mediaCount > 1 ? 's' : ''}`}
                    >
                        {data.previewMediaType === 'video' ? (
                            <video src={data.previewMediaUrl} muted />
                        ) : (
                            <img src={getImageUrl(data.previewMediaUrl)} alt="" onError={(e) => { e.target.style.display = 'none'; }} />
                        )}
                    </div>
                ) : (
                    <div
                        className="node-media-badge"
                        title={`${data.mediaCount} photo${data.mediaCount > 1 ? 's' : ''}/vidéo${data.mediaCount > 1 ? 's' : ''} attachée${data.mediaCount > 1 ? 's' : ''}`}
                        style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            padding: '1px 5px',
                            borderRadius: 999,
                            background: 'rgba(245, 158, 11, 0.9)',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 600,
                            lineHeight: '14px',
                            border: '1px solid rgba(255,255,255,0.6)'
                        }}
                    >
                        <ImageIcon size={9} strokeWidth={2.5} />
                        {data.mediaCount}
                    </div>
                )
            )}

            <Handle type="source" id="bottom-source" position={Position.Bottom} className="node-handle bottom" />
        </div>
    );
};

export default ReviewNode;
