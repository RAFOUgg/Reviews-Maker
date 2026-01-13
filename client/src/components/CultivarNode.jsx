/**
 * CultivarNode Component
 * 
 * Nœud personnalisé pour React Flow représentant un cultivar dans l'arbre généalogique
 */

import React from 'react';
import { Handle, Position } from 'reactflow';
import './CultivarNode.css';

const CultivarNode = ({ data, selected }) => {
    return (
        <div className={`cultivar-node ${selected ? 'selected' : ''}`}>
            {data.image && (
                <div className="node-image">
                    <img
                        src={data.image}
                        alt={data.label}
                        onError={(e) => {
                            e.target.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <div className="node-content">
                <div className="node-label">{data.label}</div>

                {data.genetics && (
                    <div className="node-genetics">
                        {data.genetics.type && (
                            <span className="genetics-type">{data.genetics.type}</span>
                        )}
                        {data.genetics.breeder && (
                            <span className="genetics-breeder">{data.genetics.breeder}</span>
                        )}
                    </div>
                )}

                {data.notes && (
                    <div className="node-notes" title={data.notes}>
                        💬
                    </div>
                )}
            </div>

            {/* Handles pour React Flow connections */}
            <Handle
                type="target"
                position={Position.Top}
                className="node-handle top"
            />
            <Handle
                type="source"
                position={Position.Bottom}
                className="node-handle bottom"
            />
        </div>
    );
};

export default CultivarNode;


