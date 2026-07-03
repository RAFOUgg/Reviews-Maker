/**
 * EdgeContextMenu Component
 * 
 * Menu contextuel (clic droit) pour les opérations sur les arêtes
 */

import React, { useEffect, useRef, useState } from 'react';
import useGeneticsStore from '../../store/useGeneticsStore';

const EdgeContextMenu = ({ edgeId, x, y, onClose, readOnly, onRequestDelete }) => {
    const store = useGeneticsStore();
    const menuRef = useRef(null);
    // Cf. NodeContextMenu.jsx : recale le menu s'il déborde du viewport près des bords.
    const [pos, setPos] = useState({ left: x, top: y })

    useEffect(() => {
        const el = menuRef.current
        if (!el) return
        const rect = el.getBoundingClientRect()
        const margin = 8
        let left = x
        let top = y
        if (left + rect.width > window.innerWidth - margin) left = Math.max(margin, window.innerWidth - rect.width - margin)
        if (top + rect.height > window.innerHeight - margin) top = Math.max(margin, window.innerHeight - rect.height - margin)
        setPos({ left, top })
    }, [x, y])

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
        store.openEdgeForm(edge);
        onClose();
    };

    const handleDelete = () => {
        onRequestDelete({ type: 'edge', id: edgeId });
        onClose();
    };

    const relationshipLabel = {
        'parent': '👨‍👩‍👧 Parent',
        'pollen_donor': '🌼 Donateur de pollen',
        'sibling': '👯 Frère/Sœur',
        'clone': '🔄 Clone',
        'mutation': '⚡ Mutation',
        'pairing': '💑 Couple parental'
    };

    return (
        <div
            ref={menuRef}
            className="context-menu"
            style={{
                left: `${pos.left}px`,
                top: `${pos.top}px`
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




