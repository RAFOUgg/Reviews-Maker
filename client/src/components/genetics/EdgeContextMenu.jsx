/**
 * EdgeContextMenu Component
 * 
 * Menu contextuel (clic droit) pour les opérations sur les arêtes
 */

import React, { useEffect, useRef, useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import useGeneticsStore from '../../store/useGeneticsStore';

const EdgeContextMenu = ({ edgeId, x, y, onClose, readOnly, onRequestDelete, isFamily, underlyingEdges }) => {
    const store = useGeneticsStore();
    const menuRef = useRef(null);
    // Cf. NodeContextMenu.jsx : recale le menu s'il déborde du viewport près des bords.
    const [pos, setPos] = useState({ left: x, top: y })
    const [showTypeMenu, setShowTypeMenu] = useState(false);

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

    const handleDetachParent = (underlyingEdge) => {
        onRequestDelete({ type: 'edge', id: underlyingEdge.id, label: `le lien avec ${underlyingEdge.parentName}` });
        onClose();
    };

    // Couple parental (pairing) : crée un nœud enfant relié aux DEUX individus du couple d'un
    // coup, plutôt que de devoir ajouter manuellement 2 relations séparées. _pendingParentIds
    // (tableau) est traité par NodeFormModal.jsx après la création du nœud.
    const handleAddChildToPairing = () => {
        if (!parentNode || !childNode) { onClose(); return; }
        const midX = ((parentNode.position?.x || 0) + (childNode.position?.x || 0)) / 2;
        const midY = Math.max(parentNode.position?.y || 0, childNode.position?.y || 0) + 180;
        store.openNodeForm({
            cultivarName: '',
            position: { x: midX, y: midY },
            color: '#FF6B9D',
            genetics: null,
            notes: '',
            _pendingParentIds: [edge.parentNodeId, edge.childNodeId]
        });
        onClose();
    };

    // Alternative rapide à l'ouverture de la modale complète pour le cas courant "je veux juste
    // corriger le type" — réutilise relationshipLabel (défini plus bas) comme unique source des
    // libellés/emojis, pas de duplication.
    const handleChangeType = (value) => {
        store.updateEdge(edgeId, { relationshipType: value });
        onClose();
    };

    // Échange parentNodeId/childNodeId (et les côtés d'accroche manuels s'ils existent) — corrige
    // une relation créée dans le mauvais sens sans avoir à la supprimer et la recréer.
    const handleReverseDirection = () => {
        store.updateEdge(edgeId, {
            parentNodeId: edge.childNodeId,
            childNodeId: edge.parentNodeId,
            sourceHandle: edge.targetHandle || null,
            targetHandle: edge.sourceHandle || null
        });
        onClose();
    };

    const mediaCount = Array.isArray(edge?.media) ? edge.media.length : 0;

    const handleOpenMedia = () => {
        store.openMediaModal('edge', edgeId);
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

    // Arête "family" : ligne visuelle fusionnant les 2 vrais liens de filiation d'un couple —
    // son id n'existe pas en base (voir UnifiedGeneticsCanvas.jsx), donc pas d'édition/suppression
    // directe possible. On propose plutôt de détacher un parent en particulier (agit sur le vrai
    // GenEdge sous-jacent).
    if (isFamily) {
        return (
            <div
                ref={menuRef}
                className="context-menu"
                style={{ left: `${pos.left}px`, top: `${pos.top}px` }}
            >
                <div style={{ padding: '8px 12px', fontSize: '12px', color: '#94a3b8', cursor: 'default' }}>
                    💜 Liaison combinée (couple → enfant)
                </div>
                <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                {!readOnly && (underlyingEdges || []).map(ue => (
                    <button key={ue.id} className="context-menu-item danger" onClick={() => handleDetachParent(ue)}>
                        🗑️ Retirer {ue.parentName} comme parent
                    </button>
                ))}
                {readOnly && (
                    <button className="context-menu-item" disabled>
                        👁️ Lecture seule
                    </button>
                )}
            </div>
        );
    }

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
                    {edge?.relationshipType !== 'pairing' && !showTypeMenu && (
                        <button className="context-menu-item" onClick={() => setShowTypeMenu(true)}>
                            🏷️ Changer le type de relation
                        </button>
                    )}
                    {showTypeMenu && Object.entries(relationshipLabel)
                        .filter(([value]) => value !== 'pairing' && value !== edge?.relationshipType)
                        .map(([value, label]) => (
                            <button key={value} className="context-menu-item" onClick={() => handleChangeType(value)}>
                                {label}
                            </button>
                        ))}
                    {edge?.relationshipType === 'pairing' && (
                        <button className="context-menu-item" onClick={handleAddChildToPairing}>
                            👶 Ajouter un enfant à ce couple
                        </button>
                    )}
                    {edge?.relationshipType !== 'pairing' && (
                        <button className="context-menu-item" onClick={handleReverseDirection}>
                            🔀 Inverser la direction
                        </button>
                    )}
                    <button className="context-menu-item" onClick={handleOpenMedia}>
                        <ImageIcon size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                        Photos / Vidéos{mediaCount > 0 ? ` (${mediaCount})` : '...'}
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




