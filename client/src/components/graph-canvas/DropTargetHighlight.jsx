import React from 'react';

/**
 * DropTargetHighlight - Surbrillance ambre du nœud survolé pendant un glisser-déposer sur le
 * canvas (relier un enfant à un couple parental, reconnecter l'extrémité d'une liaison vers un
 * autre nœud...). Extrait du bloc jusqu'ici dupliqué dans PairingEdge.jsx pour être réutilisé
 * tel quel par PhenoEdge.jsx — même recette visuelle partout où un "glisser jusqu'à un nœud"
 * existe sur ce canvas, plutôt qu'un style différent par composant.
 *
 * `rect` = rectangle du nœud survolé en coordonnées flow (cf. useFloatingNodeRect), ou null/undefined
 * si aucun nœud n'est actuellement survolé (rend alors null).
 */
export default function DropTargetHighlight({ rect }) {
    if (!rect) return null;

    return (
        <div
            style={{
                position: 'absolute',
                transform: `translate(${rect.x - 4}px, ${rect.y - 4}px)`,
                width: rect.width + 8,
                height: rect.height + 8,
                border: '3px solid #fbbf24',
                borderRadius: 14,
                boxShadow: '0 0 16px 2px #fbbf24',
                pointerEvents: 'none',
                zIndex: 5,
            }}
        />
    );
}
