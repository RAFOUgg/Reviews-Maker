/**
 * EdgeContextMenu Component
 * 
 * Menu contextuel (clic droit) pour les opérations sur les arêtes
 */

import React, { useEffect, useRef } from 'react';
import useGeneticsStore from '../store/useGeneticsStore';
import './ContextMenu.css';

const EdgeContextMenu = ({ edgeId, x, y, onClose, readOnly }) => {
    const store = useGeneticsStore();
    const menuRef = useRef(null);

    const edge = store.edges.find(e => e.id === edgeId);
    const parentNode = edge ? store.nodes.find(n => n.id === edge.parentNodeId) : null;
    const childNode = edge ? store.nodes.find(n => n.id === edge.childNodeId) : null;

    // Fermer le menu quand on clique ailleurs
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
        store.openEdgeForm(edge.parentNodeId, edge.childNodeId);
        onClose();
    };

    const handleDelete = async () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette relation ?')) {
            await store.deleteEdge(edgeId);
            onClose();
        }
    };

    const relationshipLabel = {
        'parent': '👨‍👩‍👧 Parent',
        'pollen_donor': '🌼 Donateur de pollen',
        'sibling': '👯 Frère/Sœur',
        'clone': '🔄 Clone',
        'mutation': '⚡ Mutation'
    };

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{
                left: `${x}px`,
                top: `${y}px`
            }}
        >
            {!readOnly && (
                <>
                    <button className="context-menu-item" onClick={handleEdit}>
                        ✏️ Éditer relation
                    </button>
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                </>
            )}

            {parentNode && childNode && (
                <>
                    <div style={{
                        padding: '8px 12px',
                        fontSize: '12px',
                        color: '#666',
                        cursor: 'default'
                    }}>
                        {parentNode.cultivarName}
                        <br />
                        → ({relationshipLabel[edge?.relationshipType] || 'Relation'})
                        <br />
                        → {childNode.cultivarName}
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

export default EdgeContextMenu;



