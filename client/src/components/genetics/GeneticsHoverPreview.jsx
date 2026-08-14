/**
 * GeneticsHoverPreview Component
 *
 * Aperçu au survol d'un individu ou d'un lien de filiation de l'arbre PhenoHunt — pendant de
 * ChainHoverPreview.jsx, dont il partage l'enveloppe (GraphHoverPreview) et les classes CSS.
 *
 * Un nœud n'affiche que nom, type et breeder : tout le reste (génération, code de phénotype,
 * objectif de sélection, profil cannabinoïde…) exigeait d'ouvrir le formulaire d'édition, alors que
 * la Chaîne de production donnait un résumé au simple survol. Le contenu est celui de
 * `buildGeneticsNodeBubble`/`buildGeneticsEdgeBubble` (utils/graphDataBubble.js), déjà la source des
 * bulles épinglables — donc les mêmes libellés, tirés de PHENO_NODE_SECTIONS, jamais une seconde
 * liste de champs écrite à la main.
 *
 * Contrairement à la bulle épinglée (qui est un objet persisté sur l'arbre), l'aperçu est éphémère :
 * il est borné à quelques lignes pour rester lisible au vol, le reste se lit dans le panneau latéral.
 */

import React from 'react';
import GraphHoverPreview from '../graph-canvas/GraphHoverPreview';

// Au-delà, l'aperçu deviendrait plus haut que la fenêtre sur un individu très documenté — le
// panneau latéral (ou une bulle épinglée) est là pour la lecture complète.
const MAX_LINES = 8;

const GeneticsHoverPreview = ({ x, y, bubble }) => {
    if (!bubble) return null;

    const lines = (bubble.body || []).filter(line => !line.group).slice(0, MAX_LINES);
    const hiddenCount = (bubble.body || []).filter(line => !line.group).length - lines.length;

    return (
        <GraphHoverPreview x={x} y={y}>
            <div className="graph-hover-preview-header">
                <span className="graph-hover-preview-title">{bubble.title}</span>
            </div>
            {bubble.sourceLabel && (
                <div className="graph-hover-preview-subtitle">{bubble.sourceLabel}</div>
            )}

            {lines.length > 0 && (
                <div className="graph-hover-preview-fill">
                    {lines.map((line, index) => (
                        <div key={`${line.label}-${index}`} className="graph-hover-preview-fill-row">
                            <span>{line.label}</span>
                            <span>{line.value}</span>
                        </div>
                    ))}
                    {hiddenCount > 0 && (
                        <div className="graph-hover-preview-fill-row">
                            <span>…</span>
                            <span>+{hiddenCount}</span>
                        </div>
                    )}
                </div>
            )}
        </GraphHoverPreview>
    );
};

export default GeneticsHoverPreview;
