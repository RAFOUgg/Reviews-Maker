/**
 * ChainPaneContextMenu Component
 *
 * Menu contextuel (clic droit) sur le fond vide du canvas Chaîne de production.
 * Contrairement à PhenoHunt, un nœud référence toujours une review existante — pas
 * d'équivalent "individu inconnu" ici (l'ajout se fait via glisser-déposer depuis la
 * sidebar des produits). Seule action pertinente : recentrer la vue.
 */

import React, { useEffect, useRef } from 'react';
import { useReactFlow } from 'reactflow';
import { RotateCcw, Download, Image as ImageIcon } from 'lucide-react';
import useProductionChainStore from '../../store/useProductionChainStore';

const ChainPaneContextMenu = ({ x, y, onClose, readOnly }) => {
    const { fitView } = useReactFlow();
    const store = useProductionChainStore();
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

    const handleImportBulk = () => {
        // Aucune cible pré-sélectionnée — la modale laisse choisir librement parmi tous les
        // nœuds/liaisons de la chaîne (import groupé "vers plusieurs bulles/liaisons").
        store.openCellPicker('node', []);
        onClose();
    };

    const handleImportMedia = () => {
        store.openMediaPicker('node', []);
        onClose();
    };

    return (
        <div ref={menuRef} className="context-menu" style={{ left: `${x}px`, top: `${y}px` }}>
            <button
                className="context-menu-item"
                onClick={() => { fitView(); onClose(); }}
            >
                <RotateCcw className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                Centrer / Réinitialiser le zoom
            </button>
            {!readOnly && (
                <button className="context-menu-item" onClick={handleImportBulk}>
                    <Download className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                    Importer des cellules vers plusieurs bulles/liaisons...
                </button>
            )}
            {!readOnly && (
                <button className="context-menu-item" onClick={handleImportMedia}>
                    <ImageIcon className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                    Importer des photos/vidéos des reviews de la chaîne...
                </button>
            )}
        </div>
    );
};

export default ChainPaneContextMenu;
