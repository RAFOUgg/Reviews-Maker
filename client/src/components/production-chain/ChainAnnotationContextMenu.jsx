/**
 * ChainAnnotationContextMenu Component
 *
 * Menu contextuel (clic droit) pour une carte épinglée (ChainAnnotation) du canvas — accès
 * direct à la fiche technique d'origine, copie des données affichées, détachement de sa cible
 * (nodeId/edgeId) ou suppression. Même moule que ChainNodeContextMenu.jsx/ChainEdgeContextMenu.jsx
 * (positionnement recalé anti-débordement, fermeture au clic extérieur, classe `.context-menu`
 * partagée).
 */

import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, ExternalLink, Unlink, Trash2 } from 'lucide-react';
import useProductionChainStore from '../../store/useProductionChainStore';

const ChainAnnotationContextMenu = ({ annotationId, x, y, onClose }) => {
    const store = useProductionChainStore();
    const navigate = useNavigate();
    const menuRef = useRef(null);
    const [pos, setPos] = useState({ left: x, top: y });
    const [copied, setCopied] = useState(false);

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

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const annotation = store.annotations.find(a => a.id === annotationId);
    if (!annotation) return null;

    const body = Array.isArray(annotation.body) ? annotation.body : [];
    const hasTarget = !!(annotation.nodeId || annotation.edgeId);
    const hasSourceReview = !!(annotation.sourceReviewId && annotation.sourceReviewType);

    const handleCopy = async () => {
        const text = [annotation.title, ...body.map(l => `${l.label} : ${l.value}`)].join('\n');
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(onClose, 500);
        } catch {
            onClose();
        }
    };

    const handleGoToReview = () => {
        onClose();
        navigate(`/edit/${annotation.sourceReviewType}/${annotation.sourceReviewId}`);
    };

    const handleDetach = () => {
        store.updateAnnotation(annotationId, { nodeId: null, edgeId: null });
        onClose();
    };

    const handleDelete = () => {
        store.deleteAnnotation(annotationId);
        onClose();
    };

    return (
        <div ref={menuRef} className="context-menu" style={{ left: `${pos.left}px`, top: `${pos.top}px` }}>
            {hasSourceReview && (
                <button className="context-menu-item" onClick={handleGoToReview}>
                    <ExternalLink size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                    Aller à la fiche technique
                </button>
            )}
            <button className="context-menu-item" onClick={handleCopy}>
                <Copy size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                {copied ? 'Copié !' : 'Copier les données'}
            </button>
            {hasTarget && (
                <button className="context-menu-item" onClick={handleDetach}>
                    <Unlink size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                    Détacher (rendre libre)
                </button>
            )}
            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <button className="context-menu-item danger" onClick={handleDelete}>
                <Trash2 size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                Supprimer la carte
            </button>
        </div>
    );
};

export default ChainAnnotationContextMenu;
