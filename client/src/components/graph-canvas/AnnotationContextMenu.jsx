/**
 * AnnotationContextMenu Component
 *
 * Menu contextuel (clic droit) d'une carte épinglée — PARTAGÉ par les deux canevas, comme l'est
 * déjà la carte elle-même (AnnotationNode.jsx). Purement présentationnel : il ne connaît aucun
 * store, l'appelant fournit les actions (détacher, supprimer, aller à la fiche).
 *
 * Il vivait uniquement côté Chaîne de production (ChainAnnotationContextMenu.jsx, désormais un
 * mince adaptateur au-dessus de ce composant) — sur PhenoHunt, le clic droit sur une bulle
 * tombait dans le menu des NŒUDS, qui cherchait un individu portant cet id, n'en trouvait aucun et
 * n'affichait donc rien du tout : impossible de copier ni de détacher une bulle sur l'arbre.
 */

import React, { useEffect, useState } from 'react';
import { Copy, ExternalLink, Unlink, Trash2 } from 'lucide-react';
import { bubbleToText } from '../../utils/graphDataBubble';
import useContextMenuPosition from './useContextMenuPosition';

const AnnotationContextMenu = ({ annotation, x, y, onClose, onDetach, onDelete, onGoToReview }) => {
    const [menuRef, style] = useContextMenuPosition(x, y);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) onClose();
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    if (!annotation) return null;

    const body = Array.isArray(annotation.body) ? annotation.body : [];
    const hasTarget = !!(annotation.nodeId || annotation.edgeId);

    const handleCopy = async () => {
        // Mise en forme partagée avec `parsePastedBubble` (graphDataBubble.js) : ce texte n'est pas
        // seulement lisible, il est RECOLLABLE en bulle — sur ce canevas comme sur l'autre.
        const text = bubbleToText({ title: annotation.title, body });
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(onClose, 500);
        } catch {
            onClose();
        }
    };

    return (
        <div ref={menuRef} className="context-menu" style={style}>
            {onGoToReview && (
                <button className="context-menu-item" onClick={() => { onClose(); onGoToReview(); }}>
                    <ExternalLink size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                    Aller à la fiche technique
                </button>
            )}
            <button className="context-menu-item" onClick={handleCopy}>
                <Copy size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                {copied ? 'Copié !' : 'Copier les données'}
            </button>
            {hasTarget && onDetach && (
                <button className="context-menu-item" onClick={() => { onDetach(); onClose(); }}>
                    <Unlink size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                    Détacher (rendre libre)
                </button>
            )}
            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <button className="context-menu-item danger" onClick={() => { onDelete(); onClose(); }}>
                <Trash2 size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                Supprimer la carte
            </button>
        </div>
    );
};

export default AnnotationContextMenu;
