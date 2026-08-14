/**
 * Contexte d'état d'interface du canevas — porté par GraphCanvasShell, lu par ce qui est rendu à
 * l'intérieur (panneau de détail, feuilles).
 *
 * Un seul état y transite aujourd'hui : `selectionMode`, la bascule tactile qui remplace Ctrl+clic
 * sur téléphone. Elle est décidée par le shell (c'est lui qui porte le bouton et qui lève le
 * drapeau de React Flow) mais elle DOIT être connue du panneau de détail : sans ça, le premier
 * appui sur un nœud ouvre la feuille de détail, dont le fond modal intercepte tous les appuis
 * suivants — il devenait donc impossible de sélectionner un deuxième élément (constaté en sonde,
 * pas supposé). Pendant qu'on sélectionne, on ne consulte pas.
 *
 * Un contexte plutôt qu'un prop traversant les deux canevas : le panneau est passé au shell en
 * `sidePanel`, donc rendu DANS son arbre — il peut lire le contexte sans que ProductionChainCanvas
 * ni UnifiedGeneticsCanvas aient à relayer un état qui ne les concerne pas.
 */

import { createContext, useContext } from 'react';

export const GraphCanvasUiContext = createContext({ selectionMode: false });

export function useGraphCanvasUi() {
    return useContext(GraphCanvasUiContext);
}
