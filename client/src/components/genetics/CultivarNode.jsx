/**
 * CultivarNode Component
 *
 * Nœud personnalisé pour React Flow représentant un cultivar dans l'arbre généalogique.
 * Forme par sexe (convention génétique) : rond = femelle, carré = mâle, losange = inconnu.
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import { Leaf, Venus, Mars, CircleHelp, MessageSquare, AlertTriangle, Image as ImageIcon } from 'lucide-react';
import { getImageUrl } from '../../utils/imageUtils';

const SEX_CONFIG = {
    female: { shapeClass: 'shape-circle', Icon: Venus, label: 'Femelle' },
    male: { shapeClass: 'shape-square', Icon: Mars, label: 'Mâle' },
    unknown: { shapeClass: 'shape-rounded', Icon: CircleHelp, label: 'Sexe inconnu' }
};

const CultivarNode = ({ data, selected }) => {
    const genetics = data.genetics || {};
    const sex = SEX_CONFIG[genetics.sex] ? genetics.sex : 'unknown';
    const { shapeClass, Icon: SexIcon, label: sexLabel } = SEX_CONFIG[sex];
    const accentColor = data.color || '#FF6B9D';
    // data.selected reflète store.selectedNodeId (pilote le panneau métadonnées dans
    // Genetiques.jsx) — prioritaire sur le `selected` natif de React Flow pour que le
    // nœud surligné corresponde toujours à celui dont les métadonnées sont affichées
    const isSelected = data.selected ?? selected;

    return (
        <div
            className={`cultivar-node ${shapeClass} ${isSelected ? 'selected' : ''}`}
            style={{ '--accent-color': accentColor }}
        >
            <Handle type="target" position={Position.Top} className="node-handle top" />
            {/* Handles gauche/droite : liens horizontaux entre nœuds (ex: frères/sœurs, croisement
                entre deux lignées) en plus du lien vertical parent→enfant haut/bas. Deux handles
                superposés par côté (source + target) pour pouvoir tirer un lien DEPUIS ce point ou
                en recevoir un — React Flow n'autorise à tirer un lien que depuis un handle "source".
                Un point React Flow accepte nativement plusieurs connexions simultanées. */}
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
                    <Leaf className="node-photo-placeholder" />
                )}
                <span className="node-sex-badge" title={sexLabel}>
                    <SexIcon size={11} strokeWidth={2.5} />
                </span>
            </div>

            <div className="node-content">
                <div className="node-label" title={data.label}>{data.label}</div>

                {(genetics.type || genetics.breeder) && (
                    <div className="node-genetics">
                        {genetics.type && <span className="genetics-type">{genetics.type}</span>}
                        {genetics.breeder && <span className="genetics-breeder">{genetics.breeder}</span>}
                    </div>
                )}
            </div>

            {data.notes && (
                <div className="node-notes" title={data.notes}>
                    <MessageSquare size={11} strokeWidth={2.5} />
                </div>
            )}

            {data.sourceReviewOrphaned && (
                <div className="node-orphan-badge" title="La review liée à ce nœud a été supprimée">
                    <AlertTriangle size={11} strokeWidth={2.5} />
                </div>
            )}

            {data.mediaCount > 0 && (
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
            )}

            <Handle type="source" position={Position.Bottom} className="node-handle bottom" />
        </div>
    );
};

export default CultivarNode;
