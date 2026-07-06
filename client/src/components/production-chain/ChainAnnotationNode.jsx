/**
 * ChainAnnotationNode Component
 *
 * Carte épinglée librement sur le fond du canvas — créée en glissant-déposant depuis le panneau
 * latéral d'un nœud/liaison (résumé pipeline ou cellule attachée, cf. ProductionChainCanvas.jsx).
 * Contrairement à ReviewNode, ce n'est pas un produit de la chaîne : pas de Handle (aucune liaison
 * ne s'y connecte), pas de sélection/panneau associé — juste une note visuelle libre, déplaçable
 * (drag React Flow natif du nœud) et supprimable indépendamment via son propre bouton.
 */

import React from 'react';
import { Pin, X } from 'lucide-react';

const ChainAnnotationNode = ({ data }) => {
    const body = Array.isArray(data.body) ? data.body : [];

    return (
        <div className="chain-annotation-card">
            <button
                type="button"
                className="chain-annotation-delete nodrag nopan"
                onClick={(e) => { e.stopPropagation(); data.onDelete?.(); }}
                title="Retirer cette carte"
            >
                <X size={11} />
            </button>
            <div className="chain-annotation-header">
                <Pin size={12} />
                <span className="chain-annotation-title">{data.title}</span>
            </div>
            {data.sourceLabel && <div className="chain-annotation-source">{data.sourceLabel}</div>}
            {body.length > 0 && (
                <div className="chain-annotation-body">
                    {body.map((line, i) => (
                        <div key={i} className="chain-annotation-line">
                            <span className="chain-annotation-line-label">{line.label}</span>
                            <span className="chain-annotation-line-value">{line.value}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ChainAnnotationNode;
