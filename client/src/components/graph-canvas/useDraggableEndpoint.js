/**
 * useDraggableEndpoint.js
 *
 * Poignée d'extrémité de liaison déplaçable à la main : glisser le point de départ/arrivée
 * d'une liaison au-dessus d'un AUTRE côté du même nœud (haut/bas/gauche/droite) pour forcer
 * l'accroche à cet endroit précis, plutôt que de laisser le calcul flottant automatique choisir
 * (voir floatingEdgeUtils.js). Relâcher en dehors du nœud d'origine annule le geste (pas de
 * reconnexion vers un autre nœud — juste un changement de côté sur le même nœud, cf. demande
 * "déplacer l'accroche sur l'un des 3 autres points qu'elle possède").
 *
 * Partagé entre PhenoEdge et PairingEdge (mêmes gestes, même mécanique).
 */

import { useCallback, useState } from 'react';
import { useReactFlow, useStoreApi } from 'reactflow';
import { nearestHandleSide, isPointInNode } from './floatingEdgeUtils';

export function useDraggableEndpoint(onAssign) {
    const { screenToFlowPosition } = useReactFlow();
    const store = useStoreApi();
    const [dragging, setDragging] = useState(null); // 'source' | 'target' | null
    const [dragPreviewPos, setDragPreviewPos] = useState(null);

    const startDrag = useCallback((end, nodeId) => (event) => {
        event.stopPropagation();
        event.preventDefault();
        setDragging(end);

        const handleMove = (moveEvent) => {
            setDragPreviewPos(screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY }));
        };
        const handleUp = (upEvent) => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);

            const dropPoint = screenToFlowPosition({ x: upEvent.clientX, y: upEvent.clientY });
            const node = store.getState().nodeInternals.get(nodeId);
            if (node && isPointInNode(node, dropPoint)) {
                onAssign(end, nearestHandleSide(node, dropPoint));
            }
            setDragging(null);
            setDragPreviewPos(null);
        };
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
    }, [screenToFlowPosition, store, onAssign]);

    return { dragging, dragPreviewPos, startDrag };
}
