/**
 * useDraggableEndpoint.js
 *
 * Poignée d'extrémité de liaison déplaçable à la main : glisser le point de départ/arrivée
 * d'une liaison au-dessus d'un AUTRE côté du même nœud (haut/bas/gauche/droite) pour forcer
 * l'accroche à cet endroit précis, plutôt que de laisser le calcul flottant automatique choisir
 * (voir floatingEdgeUtils.js). Relâcher au-dessus d'un nœud DIFFÉRENT reconnecte la liaison à ce
 * nœud (changement réel de parent/enfant) au lieu d'un simple changement de côté — surbrillance
 * du nœud survolé pendant le geste, même recette que la bulle de couple (PairingEdge).
 *
 * Partagé entre PhenoEdge et PairingEdge (mêmes gestes, même mécanique).
 */

import { useCallback, useState } from 'react';
import { useReactFlow, useStoreApi } from 'reactflow';
import { nearestHandleSide, findNodeAtPoint } from './floatingEdgeUtils';

export function useDraggableEndpoint({ onAssign, onReconnect }) {
    const { screenToFlowPosition } = useReactFlow();
    const store = useStoreApi();
    const [dragging, setDragging] = useState(null); // 'source' | 'target' | null
    const [dragPreviewPos, setDragPreviewPos] = useState(null);
    const [hoverNodeId, setHoverNodeId] = useState(null);

    // `otherNodeId` = l'extrémité FIXE de cette même liaison (exclue de la détection pour éviter
    // de "reconnecter" ce bout sur le nœud déjà attaché à l'autre bout).
    const startDrag = useCallback((end, nodeId, otherNodeId) => (event) => {
        event.stopPropagation();
        event.preventDefault();
        setDragging(end);

        const excludeIds = otherNodeId ? [otherNodeId] : [];

        const handleMove = (moveEvent) => {
            const pos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
            setDragPreviewPos(pos);
            const hit = findNodeAtPoint(store.getState().nodeInternals, pos, excludeIds);
            setHoverNodeId(hit?.id || null);
        };
        const handleUp = (upEvent) => {
            window.removeEventListener('pointermove', handleMove);
            window.removeEventListener('pointerup', handleUp);

            const dropPoint = screenToFlowPosition({ x: upEvent.clientX, y: upEvent.clientY });
            const hit = findNodeAtPoint(store.getState().nodeInternals, dropPoint, excludeIds);
            if (hit && hit.id === nodeId) {
                onAssign(end, nearestHandleSide(hit, dropPoint));
            } else if (hit) {
                onReconnect?.(end, hit.id, nearestHandleSide(hit, dropPoint));
            }
            setDragging(null);
            setDragPreviewPos(null);
            setHoverNodeId(null);
        };
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
    }, [screenToFlowPosition, store, onAssign, onReconnect]);

    return { dragging, dragPreviewPos, hoverNodeId, startDrag };
}
