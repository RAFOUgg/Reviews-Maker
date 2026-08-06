import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';

/**
 * Socle d'interaction du rendu (phase 7.1, plan `export-maker-refonte/C8-plan-interactif.md`).
 *
 * L'interactivité n'est pas un mode de rendu séparé : ce sont les templates existants qui
 * deviennent interrogeables. Ce module fournit les deux briques communes à tous les composants
 * interactifs, pour ne pas réinventer un vocabulaire par composant (le projet a déjà payé sept
 * fois ce prix — cf. CLAUDE.md).
 *
 * ── La contrainte dure : un PNG ne se clique pas ────────────────────────────────────────────
 * Un export fichier est une rasterisation : ce qui n'est pas visible au moment de la capture est
 * définitivement perdu. Deux protections, complémentaires :
 *
 * 1. `interactive` est FAUX sur les arbres montés pour la capture et pour la mesure de
 *    pagination. `ExportModal` monte ses propres `TemplateRenderer` hors-écran (il ne
 *    photographie pas l'aperçu live quand il y a plusieurs pages), donc c'est un simple prop —
 *    ni bascule d'état, ni scintillement, ni attente asynchrone.
 * 2. Aucune affordance ne doit être la SEULE voie d'accès à une donnée. Les infobulles et les
 *    modales sont strictement ADDITIVES : elles précisent ce que le rendu montre déjà, elles ne
 *    le remplacent jamais. Un composant dont le clic révèle une donnée absente du rendu figé est
 *    un bug d'export, pas une fonctionnalité.
 *
 * ── Pourquoi un portail plutôt que `LiquidTooltip` ──────────────────────────────────────────
 * `LiquidTooltip` enveloppe son enfant dans un `<div class="relative inline-flex">`. À l'intérieur
 * d'un canevas d'export, ce wrapper change le flux (inline-flex) et donc la hauteur mesurée par
 * `measureDetailedCardModules` — c'est-à-dire la pagination elle-même. L'infobulle est donc rendue
 * dans un portail sur `document.body`, positionnée depuis le `getBoundingClientRect()` de la cible :
 * zéro impact de mise en page, et par construction hors du nœud cloné par `prepareCapture`.
 */

const InteractivityContext = createContext(true);

/** Vrai quand le rendu est affiché à l'écran, faux quand il est monté pour une capture/mesure. */
export function useIsInteractive() {
    return useContext(InteractivityContext);
}

export function InteractivityProvider({ interactive, children }) {
    return (
        <InteractivityContext.Provider value={interactive}>
            {children}
        </InteractivityContext.Provider>
    );
}

InteractivityProvider.propTypes = {
    interactive: PropTypes.bool,
    children: PropTypes.node,
};

/**
 * Infobulle de canevas.
 *
 * Renvoie `bind(content)` — à étaler sur l'élément CIBLE lui-même, sans l'envelopper — et le nœud
 * de portail à rendre quelque part dans l'arbre. Inerte (handlers vides, portail nul) dès que le
 * rendu n'est pas interactif : aucun coût, aucun risque, sur les arbres de capture.
 *
 * `content` peut être une chaîne ou du JSX court. Une infobulle est faite pour une PRÉCISION
 * (unité, libellé complet d'une abréviation, valeur exacte) — pour un détail structuré, utiliser
 * une modale (`LiquidModal`), pas une infobulle géante.
 */
export function useCanvasTooltip() {
    const interactive = useIsInteractive();
    const [tip, setTip] = useState(null);
    const frame = useRef(null);

    const show = useCallback((event, content) => {
        if (!content) return;
        const rect = event.currentTarget.getBoundingClientRect();
        // Coordonnées viewport : le portail vit sur document.body en `position: fixed`, il n'est
        // donc affecté ni par le `transform: scale` de l'aperçu ni par le défilement de la page.
        setTip({
            content,
            x: rect.left + rect.width / 2,
            y: rect.top,
            bottom: rect.bottom,
        });
    }, []);

    const hide = useCallback(() => {
        if (frame.current) cancelAnimationFrame(frame.current);
        frame.current = requestAnimationFrame(() => setTip(null));
    }, []);

    const bind = useCallback((content) => {
        if (!interactive || !content) return {};
        return {
            onMouseEnter: (e) => show(e, content),
            onMouseLeave: hide,
            // Le focus clavier ouvre l'infobulle au même titre que le survol : une information
            // qui n'existe qu'à la souris est inaccessible au clavier comme au lecteur d'écran.
            onFocus: (e) => show(e, content),
            onBlur: hide,
        };
    }, [interactive, show, hide]);

    let tooltipNode = null;
    if (interactive && tip && typeof document !== 'undefined') {
        // Au-dessus du bord haut de la cible, recentrée, bornée à la fenêtre.
        const placeAbove = tip.y > 120;
        tooltipNode = createPortal(
            <div
                role="tooltip"
                style={{
                    position: 'fixed',
                    left: Math.min(Math.max(tip.x, 90), (typeof window !== 'undefined' ? window.innerWidth : 1920) - 90),
                    top: placeAbove ? tip.y - 10 : tip.bottom + 10,
                    transform: placeAbove ? 'translate(-50%, -100%)' : 'translate(-50%, 0)',
                    zIndex: 100000,
                    pointerEvents: 'none',
                    maxWidth: 280,
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: 'rgba(17,17,26,0.97)',
                    border: '1px solid rgba(255,255,255,0.14)',
                    boxShadow: '0 8px 28px rgba(0,0,0,0.45)',
                    color: '#fff',
                    fontSize: 13,
                    lineHeight: 1.35,
                    fontFamily: 'system-ui, -apple-system, sans-serif',
                    whiteSpace: 'normal',
                    textAlign: 'left',
                }}
            >
                {tip.content}
            </div>,
            document.body
        );
    }

    return { bind, tooltipNode, interactive };
}

/**
 * Style d'affordance : ce qui SIGNALE qu'un élément est interrogeable.
 * Volontairement discret (curseur + soulignement pointillé) — le rendu reste une fiche
 * technique, pas une interface. Vide quand le rendu n'est pas interactif, pour que le PNG ne
 * porte aucune trace visuelle d'une interaction impossible.
 */
export function affordance(interactive, { kind = 'text' } = {}) {
    if (!interactive) return {};
    // 'click' : ouvre un détail structuré (modale). 'cell' : bloc entier interrogeable — pas de
    // soulignement, il barbouillerait tout le texte du bloc. 'text' : un libellé précis.
    if (kind === 'click') return { cursor: 'pointer' };
    if (kind === 'cell') return { cursor: 'help' };
    return { cursor: 'help', textDecoration: 'underline dotted', textUnderlineOffset: 3 };
}
