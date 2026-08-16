/**
 * GeneticsAnnotationContextMenu Component
 *
 * Pendant PhenoHunt de ChainAnnotationContextMenu.jsx : branche le menu contextuel de carte
 * épinglée partagé (graph-canvas/AnnotationContextMenu.jsx) sur le store de l'arbre généalogique.
 *
 * `GenAnnotation` n'a pas de `sourceReviewId` (une bulle d'arbre documente un individu, pas une
 * fiche technique) — pas d'entrée « Aller à la fiche technique » ici.
 */

import React from 'react';
import AnnotationContextMenu from '../graph-canvas/AnnotationContextMenu';
import { useGeneticsCanvasStore } from '../../store/scopedCanvasStores';

const GeneticsAnnotationContextMenu = ({ annotationId, x, y, onClose }) => {
    const store = useGeneticsCanvasStore();

    const annotation = (store.annotations || []).find(a => a.id === annotationId);
    if (!annotation) return null;

    return (
        <AnnotationContextMenu
            annotation={annotation}
            x={x}
            y={y}
            onClose={onClose}
            onDetach={() => store.updateAnnotation(annotationId, { nodeId: null, edgeId: null })}
            onDelete={() => store.deleteAnnotation(annotationId)}
        />
    );
};

export default GeneticsAnnotationContextMenu;
