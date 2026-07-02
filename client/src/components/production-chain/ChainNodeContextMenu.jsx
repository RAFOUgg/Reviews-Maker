/**
 * ChainNodeContextMenu Component
 *
 * Menu contextuel (clic droit) pour les nœuds d'une chaîne de production.
 * Un nœud référence toujours une review existante — pas d'édition de contenu ici
 * (le contenu vient de la review elle-même), juste le retrait du graphe.
 */

import React, { useEffect, useRef } from 'react';
import useProductionChainStore from '../../store/useProductionChainStore';

const ChainNodeContextMenu = ({ nodeId, x, y, onClose, readOnly, onRequestDelete }) => {
    const store = useProductionChainStore();
    const menuRef = useRef(null);

    const node = store.nodes.find(n => n.id === nodeId);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleRemove = () => {
        onRequestDelete({ type: 'node', id: nodeId, label: node?.label });
        onClose();
    };

    return (
        <div ref={menuRef} className="context-menu" style={{ left: `${x}px`, top: `${y}px` }}>
            {!readOnly && (
                <button className="context-menu-item danger" onClick={handleRemove}>
                    🗑️ Retirer du graphe
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

export default ChainNodeContextMenu;
