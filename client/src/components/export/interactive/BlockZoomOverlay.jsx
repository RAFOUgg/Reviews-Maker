import { useEffect, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * ZOOM AU CLIC — cliquer un bloc du rendu l'agrandit en superposition.
 *
 * Demandé de longue date (« si on clique sur un element cela zoom dessus ») et reporté une fois
 * parce qu'il entrait en collision avec la sémantique du clic sur une cellule de pipeline, alors en
 * cours de modification. L'arbitrage acté est appliqué ici : **la cible la plus spécifique
 * l'emporte** — modale de données sur une cellule, zoom sur le bloc partout ailleurs.
 *
 * COMMENT. On CLONE le bloc déjà rendu plutôt que de le refabriquer. Un clone hérite des styles en
 * ligne (les templates ne peignent quasiment qu'en ligne) et reste dans le même document, donc les
 * classes utilitaires s'y appliquent aussi : le zoom montre exactement ce qui est à l'écran, sans
 * qu'aucun template ait à connaître ce mécanisme ni à exposer un second chemin de rendu — la source
 * de divergence qui a coûté le plus cher à ce module.
 *
 * Le clone est INERTE : ni handler ni état React ne le suivent (un canevas React Flow y devient une
 * image figée, ce qui est exactement ce qu'on veut d'un agrandissement). Rendu par un portail sur
 * `document.body`, donc hors du nœud cloné par la capture — un export n'en verra jamais rien.
 */
export default function BlockZoomOverlay({ containerRef, enabled }) {
    const [zoom, setZoom] = useState(null); // { html, width, height, label }

    const close = useCallback(() => setZoom(null), []);

    useEffect(() => {
        const root = containerRef.current;
        if (!enabled || !root) return undefined;

        const onClick = (event) => {
            // Une cible plus spécifique a la priorité : cellule de pipeline (modale de données),
            // nœud de canevas, lien, bouton. `[data-zoom-skip]` est le marqueur explicite posé par
            // les composants qui gèrent eux-mêmes le clic.
            if (event.target.closest('[data-zoom-skip], button, a, input, select, textarea, [role="button"], .react-flow')) return;
            // `[data-module]` = blocs des 5 templates à canevas fixe ; `[data-zoom-block]` = cartes de
            // la Vue Détaillée, qui est le rendu ÉCRAN réel depuis le 2026-08-06 (`/r/:id`).
            const block = event.target.closest('[data-module], [data-zoom-block]');
            if (!block || !root.contains(block)) return;
            const rect = block.getBoundingClientRect();
            if (rect.width < 40 || rect.height < 24) return; // rien d'exploitable à agrandir
            setZoom({
                html: block.outerHTML,
                width: Math.round(rect.width),
                height: Math.round(rect.height),
                label: block.getAttribute('data-module') || block.getAttribute('data-zoom-block') || 'bloc',
            });
        };

        root.addEventListener('click', onClick);
        return () => root.removeEventListener('click', onClick);
    }, [containerRef, enabled]);

    useEffect(() => {
        if (!zoom) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') close(); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [zoom, close]);

    if (!zoom || typeof document === 'undefined') return null;

    // Agrandit jusqu'à remplir la fenêtre, sans jamais RÉDUIRE : un « zoom » qui rapetisse le bloc
    // serait absurde. Un bloc plus grand que la fenêtre reste donc à sa taille et défile.
    const marge = 96;
    const dispoW = Math.max(240, window.innerWidth - marge);
    const dispoH = Math.max(240, window.innerHeight - marge);
    const echelle = Math.max(1, Math.min(dispoW / zoom.width, dispoH / zoom.height));

    return createPortal(
        <div
            role="dialog"
            aria-modal="true"
            aria-label={`Vue agrandie — ${zoom.label}`}
            onClick={close}
            style={{
                position: 'fixed', inset: 0, zIndex: 99999,
                background: 'rgba(6,8,14,0.82)',
                backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'auto', padding: marge / 2,
                cursor: 'zoom-out',
            }}
        >
            <div
                style={{
                    width: zoom.width, height: zoom.height,
                    transform: `scale(${echelle})`, transformOrigin: 'center center',
                    flexShrink: 0, borderRadius: 12, overflow: 'hidden',
                    boxShadow: '0 24px 80px -12px rgba(0,0,0,0.7)',
                }}
                // Contenu figé, produit par notre propre rendu et lu dans le DOM juste au-dessus :
                // aucune donnée extérieure ne transite par ici.
                dangerouslySetInnerHTML={{ __html: zoom.html }}
            />
            <span style={{
                position: 'fixed', bottom: 18, left: '50%', transform: 'translateX(-50%)',
                fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.55)', pointerEvents: 'none',
            }}>
                Cliquez ou appuyez sur Échap pour fermer
            </span>
        </div>,
        document.body,
    );
}

BlockZoomOverlay.propTypes = {
    /** Ref du canevas de rendu — le zoom n'écoute que les clics qui s'y produisent. */
    containerRef: PropTypes.shape({ current: PropTypes.any }).isRequired,
    /** Faux sur un arbre de capture ou de mesure : aucun handler n'est alors posé. */
    enabled: PropTypes.bool,
};
