/**
 * ChainNodeContextMenu Component
 *
 * Menu contextuel (clic droit) pour les nœuds d'une chaîne de production.
 * Un nœud référence toujours une review existante — pas d'édition de contenu ici
 * (le contenu vient de la review elle-même), mais dupliquer/centrer/détacher/retirer.
 */

import React, { useEffect, useRef, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { useNavigate } from 'react-router-dom';
import { Download, Clipboard, Copy, Image as ImageIcon } from 'lucide-react';
import useProductionChainStore from '../../store/useProductionChainStore';

const ChainNodeContextMenu = ({ nodeId, x, y, onClose, readOnly, onRequestDelete }) => {
    const store = useProductionChainStore();
    const { fitView } = useReactFlow();
    const navigate = useNavigate();
    const menuRef = useRef(null);
    // Cf. NodeContextMenu.jsx (genetics) : recale le menu s'il déborde du viewport près des bords.
    const [pos, setPos] = useState({ left: x, top: y });

    useEffect(() => {
        const el = menuRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const margin = 8;
        let left = x;
        let top = y;
        if (left + rect.width > window.innerWidth - margin) left = Math.max(margin, window.innerWidth - rect.width - margin);
        if (top + rect.height > window.innerHeight - margin) top = Math.max(margin, window.innerHeight - rect.height - margin);
        setPos({ left, top });
    }, [x, y]);

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

    const handleDetach = () => {
        store.updateNode(nodeId, { reviewId: null });
        onClose();
    };

    const handleEditReview = () => {
        onClose();
        navigate(`/edit/${node.reviewType}/${node.reviewId}`);
    };

    const handleCenterView = () => {
        fitView({ nodes: [{ id: nodeId }], duration: 300 });
        onClose();
    };

    const handleDuplicate = async () => {
        const duplicated = await store.addNode({
            reviewType: node.reviewType,
            reviewId: node.reviewId,
            position: { x: (node.position?.x || 0) + 100, y: (node.position?.y || 0) + 100 },
            color: node.color
        });
        if (duplicated?.data) {
            store.selectNode(duplicated.data.id);
        }
        onClose();
    };

    const attachedCells = Array.isArray(node?.cellData) ? node.cellData : [];

    const handleImportCells = () => {
        store.openCellPicker('node', [nodeId]);
        onClose();
    };

    const handleCopyAllCells = () => {
        store.copyCells(attachedCells);
        onClose();
    };

    const handlePasteCells = () => {
        store.pasteCells('node', [nodeId]);
        onClose();
    };

    const handleEditCell = (cell) => {
        store.openCellEditor('node', nodeId, cell);
        onClose();
    };

    const mediaCount = Array.isArray(node?.media) ? node.media.length : 0;

    const handleOpenMedia = () => {
        store.openMediaModal('node', nodeId);
        onClose();
    };

    return (
        <div ref={menuRef} className="context-menu" style={{ left: `${pos.left}px`, top: `${pos.top}px` }}>
            {!readOnly && (
                <>
                    {node?.reviewOrphaned ? (
                        <button className="context-menu-item" disabled>
                            ⚠️ Review introuvable (supprimée)
                        </button>
                    ) : node?.reviewId && (
                        <button className="context-menu-item" onClick={handleEditReview}>
                            ✏️ Éditer la review
                        </button>
                    )}
                    {node?.reviewId && (
                        <button className="context-menu-item" onClick={handleDetach}>
                            ✂️ Détacher la review liée
                        </button>
                    )}
                    <button className="context-menu-item" onClick={handleDuplicate}>
                        📋 Dupliquer
                    </button>
                    <button className="context-menu-item" onClick={handleCenterView}>
                        🎯 Centrer la vue sur ce nœud
                    </button>
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <button className="context-menu-item" onClick={handleImportCells}>
                        <Download size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                        Importer des cellules de pipeline...
                    </button>
                    <button className="context-menu-item" onClick={handleOpenMedia}>
                        <ImageIcon size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                        Photos / Vidéos{mediaCount > 0 ? ` (${mediaCount})` : '...'}
                    </button>
                    {attachedCells.length > 0 && (
                        <button className="context-menu-item" onClick={handleCopyAllCells}>
                            <Copy size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                            Copier les {attachedCells.length} cellule{attachedCells.length > 1 ? 's' : ''} attachée{attachedCells.length > 1 ? 's' : ''}
                        </button>
                    )}
                    {store.cellClipboard.length > 0 && (
                        <button className="context-menu-item" onClick={handlePasteCells}>
                            <Clipboard size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                            Coller {store.cellClipboard.length} cellule{store.cellClipboard.length > 1 ? 's' : ''} ici
                        </button>
                    )}
                    {attachedCells.length > 0 && (
                        <>
                            <div style={{ padding: '4px 12px', fontSize: '11px', color: '#888' }}>Cellules attachées</div>
                            {attachedCells.map(cell => (
                                <button key={cell.id} className="context-menu-item" onClick={() => handleEditCell(cell)} title="Éditer / retirer cette cellule">
                                    ✏️ {cell.pipelineLabel} — {cell.cellLabel}
                                </button>
                            ))}
                        </>
                    )}
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <button className="context-menu-item danger" onClick={handleRemove}>
                        🗑️ Retirer du graphe
                    </button>
                </>
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
