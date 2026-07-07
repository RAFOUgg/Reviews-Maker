/**
 * CellDropMenu Component
 *
 * Menu affiché quand une ou plusieurs cellules du panneau "Cellules attachées" sont glissées au
 * CLIC DROIT sur un autre produit/liaison du canvas — le clic gauche exécute directement l'action
 * par défaut (déplacer), le clic droit laisse choisir. Même moule que les autres menus contextuels
 * de production-chain (positionnement recalé anti-débordement, fermeture au clic extérieur).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Move, Copy, Pin, X } from 'lucide-react';

const CellDropMenu = ({ x, y, count = 1, onMove, onCopy, onPin, onClose }) => {
    const menuRef = useRef(null);
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

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const label = count > 1 ? `${count} cellules` : 'cette cellule';

    return (
        <div ref={menuRef} className="context-menu" style={{ left: `${pos.left}px`, top: `${pos.top}px` }}>
            <button className="context-menu-item" onClick={onMove}>
                <Move size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                Déplacer {label} ici
            </button>
            <button className="context-menu-item" onClick={onCopy}>
                <Copy size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                Copier {label} ici
            </button>
            <button className="context-menu-item" onClick={onPin}>
                <Pin size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                Épingler comme note ici
            </button>
            <hr style={{ margin: '4px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />
            <button className="context-menu-item" onClick={onClose}>
                <X size={13} style={{ marginRight: 6, verticalAlign: '-2px' }} />
                Annuler
            </button>
        </div>
    );
};

export default CellDropMenu;
