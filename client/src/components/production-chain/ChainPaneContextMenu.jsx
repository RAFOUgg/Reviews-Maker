/**
 * ChainPaneContextMenu Component
 *
 * Menu contextuel (clic droit) sur le fond vide du canvas Chaîne de production.
 * Contrairement à PhenoHunt, un nœud référence toujours une review existante — pas
 * d'équivalent "individu inconnu" ici (l'ajout se fait via glisser-déposer depuis la
 * sidebar des produits). Les actions portent donc sur le canevas entier : recentrer la vue,
 * réarranger tous les éléments sur un quadrillage, importer une donnée vers plusieurs cibles.
 */

import React, { useEffect, useRef } from 'react';
import { useReactFlow } from 'reactflow';
import { RotateCcw, Download, LayoutGrid, ClipboardPaste } from 'lucide-react';
import useProductionChainStore from '../../store/useProductionChainStore';

const ChainPaneContextMenu = ({ x, y, onClose, readOnly, onRearrange, onPasteBubble }) => {
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

    const handleImportData = () => {
        // Aucune cible pré-sélectionnée — la modale laisse choisir librement parmi tous les
        // nœuds/liaisons de la chaîne (import groupé "vers plusieurs bulles/liaisons").
        store.openDataImport('node', []);
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
            {!readOnly && onRearrange && (
                <button
                    className="context-menu-item"
                    onClick={() => { onRearrange(); onClose(); }}
                    title="Aligne tous les produits, liaisons et bulles — liés comme isolés — sur un quadrillage carré"
                >
                    <LayoutGrid className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                    Réarranger
                </button>
            )}
            {!readOnly && onPasteBubble && (
                <button
                    className="context-menu-item"
                    // Les coordonnées du clic droit sont transmises telles quelles : la bulle doit
                    // apparaître à l'endroit visé, pas au centre du canevas.
                    onClick={() => { onPasteBubble(x, y); onClose(); }}
                    title="Crée une carte à partir du texte copié (une bulle copiée ailleurs, un bulletin d'analyse, un extrait de tableur...)"
                >
                    <ClipboardPaste className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                    Créer une bulle depuis le presse-papiers
                </button>
            )}
            {!readOnly && (
                <button className="context-menu-item" onClick={handleImportData}>
                    <Download className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                    Importer une donnée vers plusieurs bulles/liaisons...
                </button>
            )}
        </div>
    );
};

export default ChainPaneContextMenu;
