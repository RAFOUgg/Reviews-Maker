/**
 * ChainAnnotationContextMenu Component
 *
 * Adaptateur : branche le menu contextuel de carte épinglée PARTAGÉ
 * (graph-canvas/AnnotationContextMenu.jsx — positionnement anti-débordement, fermeture au clic
 * extérieur, copie recollable) sur le store de la Chaîne de production.
 *
 * Le rendu vivait ici en entier ; il a été sorti pour que PhenoHunt en dispose aussi — le clic
 * droit sur une bulle n'y ouvrait rien du tout.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AnnotationContextMenu from '../graph-canvas/AnnotationContextMenu';
import useProductionChainStore from '../../store/useProductionChainStore';

const ChainAnnotationContextMenu = ({ annotationId, x, y, onClose }) => {
    const store = useProductionChainStore();
    const navigate = useNavigate();

    const annotation = store.annotations.find(a => a.id === annotationId);
    if (!annotation) return null;

    const hasSourceReview = !!(annotation.sourceReviewId && annotation.sourceReviewType);

    return (
        <AnnotationContextMenu
            annotation={annotation}
            x={x}
            y={y}
            onClose={onClose}
            onGoToReview={hasSourceReview
                ? () => navigate(`/edit/${annotation.sourceReviewType}/${annotation.sourceReviewId}`)
                : null}
            onDetach={() => store.updateAnnotation(annotationId, { nodeId: null, edgeId: null })}
            onDelete={() => store.deleteAnnotation(annotationId)}
        />
    );
};

export default ChainAnnotationContextMenu;
