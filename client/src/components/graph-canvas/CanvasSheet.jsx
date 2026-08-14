/**
 * CanvasSheet Component
 *
 * Feuille modale ancrée en bas de l'écran — l'enveloppe standard de TOUT ce qui n'est pas le graphe
 * sur téléphone : détail d'un élément (CanvasInfoPanel), outils, recherche et filtres.
 *
 * Principe posé au plan UI téléphone : sur un écran de 390px, le canevas EST l'écran. Rien ne doit
 * y rester en permanence. Une feuille s'invoque, plafonne à 85vh, se ferme d'un appui en dehors —
 * et laisse voir le graphe derrière. C'est la différence entre consulter et perdre sa place, que le
 * volet latéral à 80vw (mesuré le 2026-08-14) ne permettait pas.
 *
 * Portalée vers <body> : le canevas est parfois embarqué dans une carte à `backdrop-filter`, qui
 * devient alors le bloc conteneur de tout `position: fixed` descendant (spec CSS) — c'est la même
 * raison qui fait portaler les menus contextuels dans GraphCanvasShell.jsx.
 */

import React from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function CanvasSheet({ title, onClose, children, bodyClassName = '' }) {
    return createPortal(
        <div className="canvas-sheet-backdrop" onClick={onClose}>
            <div
                className="canvas-sheet"
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="canvas-sheet-handle" />
                <div className="canvas-sheet-header">
                    <span className="canvas-sheet-title">{title}</span>
                    <button type="button" className="canvas-sheet-close" onClick={onClose} aria-label="Fermer">
                        <X size={16} />
                    </button>
                </div>
                <div className={`canvas-sheet-body ${bodyClassName}`}>{children}</div>
            </div>
        </div>,
        document.body
    );
}
