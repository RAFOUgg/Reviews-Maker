/**
 * useContextMenuPosition
 *
 * Position d'un menu contextuel RECALÉE dans la fenêtre : ouvert près d'un bord, un menu posé
 * bêtement au point du clic sort de l'écran, et ses dernières entrées deviennent inatteignables —
 * Playwright le constate en « element is outside of the viewport », l'utilisateur en cliquant
 * dans le vide.
 *
 * Les menus de nœud/liaison portaient déjà ce calcul, chacun recopié chez lui ; les menus du FOND
 * (ChainPaneContextMenu, PaneContextMenu) ne l'avaient pas du tout — sans conséquence tant qu'ils
 * ne comptaient que deux lignes, jusqu'à ce qu'ils s'allongent. Une seule implémentation ici,
 * plutôt qu'une cinquième copie.
 *
 * Retourne `[ref, style]` : la ref à poser sur l'élément du menu (sa taille réelle est mesurée
 * après le premier rendu), et le style de position à lui appliquer.
 */

import { useEffect, useRef, useState } from 'react';

const MARGIN = 8;

export default function useContextMenuPosition(x, y) {
    const ref = useRef(null);
    const [pos, setPos] = useState({ left: x, top: y });

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        let left = x;
        let top = y;
        if (left + rect.width > window.innerWidth - MARGIN) {
            left = Math.max(MARGIN, window.innerWidth - rect.width - MARGIN);
        }
        if (top + rect.height > window.innerHeight - MARGIN) {
            top = Math.max(MARGIN, window.innerHeight - rect.height - MARGIN);
        }
        setPos({ left, top });
    }, [x, y]);

    return [ref, { left: `${pos.left}px`, top: `${pos.top}px` }];
}
