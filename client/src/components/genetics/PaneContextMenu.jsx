/**
 * PaneContextMenu Component
 *
 * Menu contextuel (clic droit) sur le fond vide du canvas — pas sur un nœud ou une arête.
 * Sert principalement à ajouter un "individu inconnu" (nœud sans fiche technique liée, ex: un
 * parent externe/landrace/ruderalis dont on ne documente que la génétique à la main), même
 * action que le bouton "Individu inconnu" de la toolbar ou le double-clic sur le canvas — juste
 * un point d'entrée supplémentaire, plus découvrable via le clic droit.
 */

import React, { useEffect, useRef } from 'react';
import { Sprout } from 'lucide-react';

const PaneContextMenu = ({ x, y, onClose, onAddUnknownIndividual }) => {
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={menuRef} className="context-menu" style={{ left: `${x}px`, top: `${y}px` }}>
            <button
                className="context-menu-item"
                onClick={() => { onAddUnknownIndividual(); onClose(); }}
            >
                <Sprout className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                Ajouter un individu inconnu
            </button>
        </div>
    );
};

export default PaneContextMenu;
