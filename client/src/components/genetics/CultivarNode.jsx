/**
 * CultivarNode Component
 *
 * Nœud personnalisé pour React Flow représentant un cultivar dans l'arbre généalogique.
 * Forme par sexe (convention génétique) : rond = femelle, carré = mâle, losange = inconnu.
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import { Leaf } from 'lucide-react';

const SEX_CONFIG = {
    female: { shapeClass: 'shape-circle', icon: '♀', label: 'Femelle' },
    male: { shapeClass: 'shape-square', icon: '♂', label: 'Mâle' },
    unknown: { shapeClass: 'shape-rounded', icon: '?', label: 'Sexe inconnu' }
};

const CultivarNode = ({ data, selected }) => {
    const genetics = data.genetics || {};
    const sex = SEX_CONFIG[genetics.sex] ? genetics.sex : 'unknown';
    const { shapeClass, icon: sexIcon, label: sexLabel } = SEX_CONFIG[sex];
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

            <div className="node-photo">
                {data.image ? (
                    <img
                        src={data.image}
                        alt={data.label}
                        onError={(e) => { e.target.style.display = 'none'; }}
                    />
                ) : (
                    <Leaf className="node-photo-placeholder" />
                )}
                <span className="node-sex-badge" title={sexLabel}>{sexIcon}</span>
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
                <div className="node-notes" title={data.notes}>💬</div>
            )}

            <Handle type="source" position={Position.Bottom} className="node-handle bottom" />
        </div>
    );
};

export default CultivarNode;
