/**
 * useChainZoomTier
 *
 * Palier de niveau de détail (LOD) dérivé du zoom courant du canevas Chaîne de production —
 * 'far' (vue d'ensemble, cartes minimales), 'default' (rendu actuel, inchangé), 'near' (contenu
 * enrichi : vignette média réelle + résumé de la cellule la plus récente).
 *
 * S'appuie sur le store interne de React Flow (`transform: [x, y, zoom]`, même pattern que
 * `floatingEdgeUtils.js` qui lit déjà `store.nodeInternals` via ce hook) plutôt que `useViewport()`,
 * qui re-render à CHAQUE frame de pan/zoom. Ici, comme le sélecteur renvoie directement la chaîne
 * de palier ('far'|'default'|'near') et que zustand compare la valeur sélectionnée par égalité de
 * valeur (`Object.is`, trivialement vrai entre deux chaînes identiques), le composant appelant ne
 * re-render QUE lorsque le palier change réellement, jamais à chaque micro-variation de zoom.
 *
 * Seuils choisis en fonction des bornes de zoom RÉELLES du canevas (GraphCanvasShell ne fixe pas
 * minZoom/maxZoom, donc React Flow applique ses défauts : [0.5, 2]) — vérifié manuellement que la
 * molette ne descend jamais sous 0.5 ni au-dessus de 2. Un seuil 'far' à 0.5 serait donc
 * inatteignable (zoom peut valoir 0.5 mais jamais moins) ; 0.65/1.3 laissent une plage utile aux
 * deux extrémités dans les bornes réelles.
 */

import { useStore } from 'reactflow';

const FAR_THRESHOLD = 0.65;
const NEAR_THRESHOLD = 1.3;

function tierOf(zoom) {
    if (zoom <= FAR_THRESHOLD) return 'far';
    if (zoom >= NEAR_THRESHOLD) return 'near';
    return 'default';
}

export default function useChainZoomTier() {
    return useStore((state) => tierOf(state.transform[2]));
}
