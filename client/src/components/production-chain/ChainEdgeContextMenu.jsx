/**
 * ChainEdgeContextMenu Component
 *
 * Menu contextuel (clic droit) pour les liaisons de transformation d'une chaîne de production.
 */

import React, { useEffect, useRef } from 'react';
import useProductionChainStore from '../../store/useProductionChainStore';

const ChainEdgeContextMenu = ({ edgeId, x, y, onClose, readOnly, onRequestDelete }) => {
    const store = useProductionChainStore();
    const menuRef = useRef(null);

    const edge = store.edges.find(e => e.id === edgeId);
    const sourceNode = edge ? store.nodes.find(n => n.id === edge.sourceNodeId) : null;
    const targetNode = edge ? store.nodes.find(n => n.id === edge.targetNodeId) : null;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleEdit = () => {
        store.openEdgeForm(edge);
        onClose();
    };

    const handleDelete = () => {
        onRequestDelete({ type: 'edge', id: edgeId });
        onClose();
    };

    return (
        <div ref={menuRef} className="context-menu" style={{ left: `${x}px`, top: `${y}px` }}>
            {!readOnly && (
                <>
                    <button className="context-menu-item" onClick={handleEdit}>
                        ✏️ Éditer la transformation
                    </button>
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                </>
            )}

            {sourceNode && targetNode && (
                <>
                    <div style={{ padding: '8px 12px', fontSize: '12px', color: '#666', cursor: 'default' }}>
                        {sourceNode.label}
                        <br />
                        → ({edge?.technique || 'Transformation'})
                        <br />
                        → {targetNode.label}
                    </div>
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                </>
            )}

            {!readOnly && (
                <button className="context-menu-item danger" onClick={handleDelete}>
                    🗑️ Supprimer
                </button>
            )}

            {readOnly && (
                <button className="context-menu-item" disabled>
                    👁️ Lecture seule
                </button>
            )}
        </div>
    );
};

export default ChainEdgeContextMenu;
