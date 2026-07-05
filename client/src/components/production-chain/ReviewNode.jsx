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
import { AlertTriangle } from 'lucide-react';
import { TYPE_META } from '../../utils/reviewTypeMeta';
import { getImageUrl } from '../../utils/imageUtils';

const ReviewNode = ({ data, selected }) => {
    const meta = TYPE_META[data.reviewType] || TYPE_META.flower;
    const Icon = meta.icon;
    const accentColor = data.color || '#10b981';
    const isSelected = data.selected ?? selected;

    return (
        <div
            className={`cultivar-node shape-rounded ${isSelected ? 'selected' : ''}`}
            style={{ '--accent-color': accentColor }}
        >
            <Handle type="target" position={Position.Top} className="node-handle top" />
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

            <div className="node-content">
                <div className="node-label" title={data.label}>{data.label}</div>
                <div className="node-genetics">
                    <span className="genetics-type">{meta.label}</span>
                </div>
            </div>

            {data.reviewOrphaned && (
                <div className="node-orphan-badge" title="La review liée à ce produit a été supprimée">
                    <AlertTriangle size={11} strokeWidth={2.5} />
                </div>
            )}

            <Handle type="source" position={Position.Bottom} className="node-handle bottom" />
        </div>
    );
};

export default ReviewNode;
