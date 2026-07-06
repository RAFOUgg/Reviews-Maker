/**
 * NodeContextMenu Component
 * 
 * Menu contextuel (clic droit) pour les opérations sur les nœuds
 */

import React, { useEffect, useRef, useState } from 'react';
import { useReactFlow } from 'reactflow';
import { Image as ImageIcon } from 'lucide-react';
import useGeneticsStore from '../../store/useGeneticsStore';
import { useToast } from '../shared/ToastContainer';

const NodeContextMenu = ({ nodeId, x, y, onClose, readOnly, onRequestDelete }) => {
    const store = useGeneticsStore();
    const { fitView } = useReactFlow();
    const toast = useToast();
    const menuRef = useRef(null);
    // x/y sont le point de clic brut (clientX/clientY) — sans correction, le menu peut déborder
    // hors du viewport (coupé/inaccessible) près des bords droit/bas de l'écran ou de la fenêtre
    // de review incrustée. On mesure sa taille réelle après montage et on le recale si besoin.
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

    // node.sourceReviewId n'est renseigné que si ce nœud a déjà été lié à une fiche technique
    // Fleur (glisser-déposer, "Créer un arbre à partir de cette fleur", "Importer cette fleur à
    // un arbre", ou ce bouton lui-même après une première sauvegarde). Sans lien existant, on
    // ouvre un formulaire de création pré-rempli (nom + génétique du nœud) et on relie
    // automatiquement ce nœud à la review une fois qu'elle est sauvegardée (voir
    // CreateFlowerReview/index.jsx:handleSave, params `prefillName`/`linkNodeId`).
    const handleEditReview = () => {
        if (node?.sourceReviewId) {
            window.open(`/edit/flower/${node.sourceReviewId}`, '_blank', 'noopener');
            onClose();
            return;
        }
        const params = new URLSearchParams();
        if (node?.cultivarName) params.set('prefillName', node.cultivarName);
        if (node?.genetics?.breeder) params.set('prefillBreeder', node.genetics.breeder);
        if (node?.genetics?.type) params.set('prefillType', node.genetics.type);
        if (node?.genetics?.indicaRatio != null) params.set('prefillIndica', String(node.genetics.indicaRatio));
        params.set('linkNodeId', nodeId);
        window.open(`/create/flower?${params.toString()}`, '_blank', 'noopener');
        onClose();
    };

    const handleDelete = () => {
        onRequestDelete({ type: 'node', id: nodeId, label: node?.cultivarName });
        onClose();
    };

    const handleCreateChild = () => {
        store.openNodeForm({
            cultivarName: '',
            position: { x: (node?.position?.x || 0) + 150, y: (node?.position?.y || 0) + 100 },
            color: '#FF6B9D',
            genetics: null,
            notes: '',
            _pendingParentId: nodeId
        });
        onClose();
    };

    // Symétrique de "Ajouter enfant" — le nœud créé devient PARENT de celui-ci (cf.
    // NodeFormModal._pendingChildId, crée l'edge retour une fois le nouveau nœud sauvegardé).
    const handleCreateParent = () => {
        store.openNodeForm({
            cultivarName: '',
            position: { x: (node?.position?.x || 0) - 150, y: (node?.position?.y || 0) - 100 },
            color: '#FF6B9D',
            genetics: null,
            notes: '',
            _pendingChildId: nodeId
        });
        onClose();
    };

    const handleDetachReview = () => {
        store.updateNode(nodeId, { sourceReviewId: null });
        onClose();
    };

    const handleLinkExistingReview = () => {
        store.openLinkReviewPicker(nodeId);
        onClose();
    };

    const handleCenterView = () => {
        fitView({ nodes: [{ id: nodeId }], duration: 300 });
        onClose();
    };

    // Réutilise la route de recherche inverse déjà existante côté Chaîne de production
    // (aucune review → aucune chaîne possible, donc masqué si sourceReviewId absent).
    const handleGoToProductionChain = async () => {
        onClose();
        try {
            const res = await fetch(`/api/production-chains/for-review/flower/${node.sourceReviewId}`, {
                credentials: 'include'
            });
            if (!res.ok) throw new Error('request failed');
            const chains = await res.json();
            if (chains.length === 0) {
                toast.info('Aucune chaîne de production ne contient cette review');
                return;
            }
            window.open(`/library/production-chains/${chains[0].id}`, '_blank', 'noopener');
        } catch {
            toast.error('Erreur lors de la recherche de la chaîne de production');
        }
    };

    const mediaCount = Array.isArray(node?.media) ? node.media.length : 0;

    const handleOpenMedia = () => {
        store.openMediaModal('node', nodeId);
        onClose();
    };

    const handleDuplicate = async () => {
        // Duplique vraiment le nœud — pas juste son nom : la review liée, la photo et les
        // médias doivent suivre, sinon le "duplicata" perd sa traçabilité (c'est le même
        // phénotype, pas une fiche vierge repartant de zéro).
        const duplicatedNode = await store.addNode({
            cultivarName: `${node.cultivarName} (copie)`,
            cultivarId: node.cultivarId,
            position: { x: node.position.x + 100, y: node.position.y + 100 },
            color: node.color,
            image: node.image,
            genetics: node.genetics,
            notes: node.notes,
            sourceReviewId: node.sourceReviewId
        });

        if (duplicatedNode.data) {
            const newNodeId = duplicatedNode.data.id;
            // La route de création ne persiste pas `media` (toujours "[]" à la création côté
            // schéma) — un second appel en update est nécessaire pour reporter les photos/vidéos.
            if (Array.isArray(node.media) && node.media.length > 0) {
                await store.updateNode(newNodeId, { media: node.media });
            }
            store.selectNode(newNodeId);
        }
        onClose();
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
                        ✏️ Éditer
                    </button>
                    {node?.sourceReviewOrphaned ? (
                        <button className="context-menu-item" disabled>
                            ⚠️ Review introuvable (supprimée)
                        </button>
                    ) : (
                        <button className="context-menu-item" onClick={handleEditReview}>
                            📝 {node?.sourceReviewId ? 'Éditer la review' : 'Créer la review liée'}
                        </button>
                    )}
                    {node?.sourceReviewId && (
                        <button className="context-menu-item" onClick={handleDetachReview}>
                            ✂️ Détacher la review liée
                        </button>
                    )}
                    {!node?.sourceReviewId && (
                        <button className="context-menu-item" onClick={handleLinkExistingReview}>
                            🔗 Lier à une review existante
                        </button>
                    )}
                    {node?.sourceReviewId && !node?.sourceReviewOrphaned && (
                        <button className="context-menu-item" onClick={handleGoToProductionChain}>
                            🏭 Accéder à la chaîne de production
                        </button>
                    )}
                    <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
                    <button className="context-menu-item" onClick={handleCreateParent}>
                        ⬆️ Ajouter un parent
                    </button>
                    <button className="context-menu-item" onClick={handleCreateChild}>
                        ➕ Ajouter enfant
                    </button>
                    <button className="context-menu-item" onClick={handleDuplicate}>
                        📋 Dupliquer
                    </button>
                    <button className="context-menu-item" onClick={handleOpenMedia}>
                        <ImageIcon size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                        Photos / Vidéos{mediaCount > 0 ? ` (${mediaCount})` : '...'}
                    </button>
                    <button className="context-menu-item" onClick={handleCenterView}>
                        🎯 Centrer la vue sur ce nœud
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




