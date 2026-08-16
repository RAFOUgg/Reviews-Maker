/**
 * PaneContextMenu Component
 *
 * Menu contextuel (clic droit) sur le fond vide du canvas — pas sur un nœud ou une arête.
 * Sert principalement à ajouter un "individu inconnu" (nœud sans fiche technique liée, ex: un
 * parent externe/landrace/ruderalis dont on ne documente que la génétique à la main), même
 * action que le bouton "Individu inconnu" de la toolbar ou le double-clic sur le canvas — juste
 * un point d'entrée supplémentaire, plus découvrable via le clic droit.
 */

import React, { useEffect } from 'react';
import { useReactFlow } from 'reactflow';
import { Sprout, RotateCcw, LayoutGrid, ClipboardPaste } from 'lucide-react';
import useContextMenuPosition from '../graph-canvas/useContextMenuPosition';

const PaneContextMenu = ({ x, y, onClose, onAddUnknownIndividual, readOnly, onRearrange, onPasteBubble }) => {
    const { fitView } = useReactFlow();
    // Recalage dans la fenêtre : sans lui, un clic droit près du bas du canevas ouvrait un menu
    // dont les dernières entrées tombaient hors de l'écran, donc littéralement incliquables
    // (constaté en sonde dès que ce menu est passé de 2 à 4 entrées).
    const [menuRef, style] = useContextMenuPosition(x, y);

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
        <div ref={menuRef} className="context-menu" style={style}>
            <button
                className="context-menu-item"
                onClick={() => { onAddUnknownIndividual(); onClose(); }}
            >
                <Sprout className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                Ajouter un individu inconnu
            </button>
            {!readOnly && onRearrange && (
                <button
                    className="context-menu-item"
                    onClick={() => { onRearrange(); onClose(); }}
                    title="Range tous les individus et bulles — liés comme isolés — sur un quadrillage, par génération"
                >
                    <LayoutGrid className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                    Réarranger
                </button>
            )}
            {!readOnly && onPasteBubble && (
                <button
                    className="context-menu-item"
                    // Coordonnées du clic droit transmises telles quelles : la bulle apparaît à
                    // l'endroit visé, pas au centre du canevas.
                    onClick={() => { onPasteBubble(x, y); onClose(); }}
                    title="Crée une carte à partir du texte copié (une bulle copiée ailleurs, un bulletin d'analyse, un extrait de tableur...)"
                >
                    <ClipboardPaste className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                    Créer une bulle depuis le presse-papiers
                </button>
            )}
            <button
                className="context-menu-item"
                onClick={() => { fitView(); onClose(); }}
            >
                <RotateCcw className="inline w-3.5 h-3.5 mr-1.5" style={{ verticalAlign: '-2px' }} />
                Centrer / Réinitialiser le zoom
            </button>
        </div>
    );
};

export default PaneContextMenu;
