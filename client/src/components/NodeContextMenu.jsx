/**
 * NodeContextMenu Component
 * 
 * Menu contextuel (clic droit) pour les opérations sur les nœuds
 */

import React, { useEffect, useRef } from 'react';
import useGeneticsStore from '../store/useGeneticsStore';

const NodeContextMenu = ({ nodeId, x, y, onClose, readOnly }) => {
    const store = useGeneticsStore();
    const menuRef = useRef(null);

    const node = store.nodes.find(n => n.id === nodeId);

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
        store.openNodeForm(node);
        onClose();
    };

    const handleDelete = async () => {
        if (confirm(`Êtes-vous sûr de vouloir supprimer "${node.cultivarName}" ?`)) {
            await store.deleteNode(nodeId);
            onClose();
        }
    };

    const handleCreateChild = () => {
        store.openNodeForm({
            cultivarName: '',
            position: { x: 0, y: 0 },
            color: '#FF6B9D',
            genetics: null,
            notes: ''
        });
        // Le formulaire devrait avoir une option "parent sélectionné"
        onClose();
    };

    const handleDuplicate = async () => {
        const duplicatedNode = await store.addNode({
            cultivarName: `${node.cultivarName} (copie)`,
            cultivarId: node.cultivarId,
            position: { x: node.position.x + 100, y: node.position.y + 100 },
            color: node.color,
            genetics: node.genetics,
            notes: node.notes
        });

        if (duplicatedNode.data) {
            store.selectNode(duplicatedNode.data.id);
        }
        onClose();
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
                        ✏️ Éditer
                    </button>
                    <button className="context-menu-item" onClick={handleCreateChild}>
                        ➕ Ajouter enfant
                    </button>
                    <button className="context-menu-item" onClick={handleDuplicate}>
                        📋 Dupliquer
                    </button>
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <button className="context-menu-item danger" onClick={handleDelete}>
                        🗑️ Supprimer
                    </button>
                </>
            )}
            {readOnly && (
                <>
                    <button className="context-menu-item" disabled>
                        👁️ Lecture seule
                    </button>
                </>
            )}
        </div>
    );
};

export default NodeContextMenu;




