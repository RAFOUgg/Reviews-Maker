import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { baseModuleId, sanitizeModuleOrder } from '../../../utils/adaptivePagination';

/**
 * GLISSER-DÉPOSER DES BLOCS, DIRECTEMENT SUR LE RENDU.
 *
 * « pour rendre export maker plus simple il faut faire en sorte que le rendu soit maléable, on
 * pourrait alors changer l'ordre des elements en glissant déposant les containers » (2026-08-12).
 *
 * L'ordre des blocs était déjà réglable — mais dans un panneau latéral, par des flèches ↑/↓, sur
 * une liste de noms. Il fallait donc traduire mentalement « Profil cannabinoïde » en un rectangle
 * de la page. Ici, on saisit le rectangle lui-même.
 *
 * ── Ce que ce composant ne fait PAS ─────────────────────────────────────────────────────────────
 * Il n'invente aucun modèle de mise en page. Il écrit dans `config.moduleOrder`, exactement la même
 * liste d'ids `data-module` que pilotent déjà `ModuleOrderControls` (les flèches) et
 * `orderRenderBlocks` (l'application au rendu). Les deux surfaces restent donc d'accord sans se
 * connaître, et rien ici n'a besoin d'être enseigné aux templates.
 *
 * ── Pourquoi une POIGNÉE et pas le bloc entier ──────────────────────────────────────────────────
 * Le clic sur un bloc est déjà pris : il agrandit (`BlockZoomOverlay`), et sur une cellule de
 * pipeline il ouvre le détail de l'étape. Rendre tout le bloc draggable rendrait chaque clic
 * ambigu. La poignée apparaît au survol, dans un coin, et elle seule initie le glissement — le
 * reste du rendu garde le comportement que l'utilisateur connaît.
 *
 * Comme `BlockZoomOverlay`, tout est rendu par un portail sur `document.body` : hors du nœud cloné
 * par la capture, donc invisible de tout fichier exporté.
 */

// Un pipeline découpé en tranches (`pipeline:culture#0`, `#1`…) se déplace d'un bloc : le découpage
// est une décision de pagination, pas une composition. Même règle que `ModuleOrderControls`.
const PINNED = new Set(['masthead', 'mainImage', 'heroImage']);

export default function BlockDragOverlay({ containerRef, enabled, onReorder }) {
    const [survol, setSurvol] = useState(null);   // { rect, id }
    const [cible, setCible] = useState(null);     // { rect, id, avant }
    // Le bloc saisi est un ÉTAT, pas une ref : la poignée et le trait d'insertion en dépendent, et
    // une ref ne provoque aucun rendu — la surcouche resterait figée pendant tout le glissement.
    const [pris, setPris] = useState(null);       // id

    useEffect(() => {
        const root = containerRef.current;
        if (!enabled || !root) return undefined;

        // Ordre EFFECTIF courant = ordre du DOM. Il tient déjà compte de `moduleOrder` (le rendu
        // l'applique) et de la page affichée, donc on n'a rien à reconstituer : on lit ce qui est
        // à l'écran, on déplace une entrée, on réécrit la liste entière.
        const blocsOrdonnes = () => {
            const vus = [];
            for (const el of root.querySelectorAll('[data-module]')) {
                const id = baseModuleId(el.getAttribute('data-module'));
                if (id && !vus.includes(id)) vus.push(id);
            }
            return vus;
        };

        const blocDe = (event) => {
            const el = event.target.closest?.('[data-module]');
            if (!el || !root.contains(el)) return null;
            const id = baseModuleId(el.getAttribute('data-module'));
            if (!id || PINNED.has(id)) return null;
            return { el, id };
        };

        const onMove = (event) => {
            const bloc = blocDe(event);
            if (pris) {
                // En cours de glissement : on marque le point d'insertion, moitié haute = avant.
                if (!bloc || bloc.id === pris) { setCible(null); return; }
                const r = bloc.el.getBoundingClientRect();
                setCible({ rect: r, id: bloc.id, avant: event.clientY < r.top + r.height / 2 });
                return;
            }
            setSurvol(bloc ? { rect: bloc.el.getBoundingClientRect(), id: bloc.id } : null);
        };

        const onUp = () => {
            const destination = cible;
            const saisi = pris;
            setPris(null);
            setCible(null);
            setSurvol(null);
            if (!saisi || !destination) return;

            const ordre = blocsOrdonnes().filter((id) => id !== saisi);
            const index = ordre.indexOf(destination.id);
            if (index === -1) return;
            ordre.splice(destination.avant ? index : index + 1, 0, saisi);
            onReorder(sanitizeModuleOrder(ordre));
        };

        root.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        return () => {
            root.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };
    }, [containerRef, enabled, onReorder, cible, pris]);

    if (!enabled || typeof document === 'undefined') return null;

    const enCours = Boolean(pris);

    return createPortal(
        <>
            {/* Poignée de saisie — au survol du bloc, coin haut gauche. `position: fixed` sur les
                coordonnées viewport : le rendu vit souvent sous un `transform: scale()`, une
                surcouche posée dans son repère se retrouverait décalée. */}
            {survol && !enCours && (
                <div
                    onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); setPris(survol.id); setSurvol(null); }}
                    title="Glisser pour déplacer ce bloc"
                    style={{
                        position: 'fixed', left: survol.rect.left + 6, top: survol.rect.top + 6,
                        zIndex: 99998, cursor: 'grab', width: 30, height: 30, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(139,92,246,0.92)', color: '#fff', fontSize: 15, lineHeight: 1,
                        border: '1px solid rgba(255,255,255,0.28)', boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
                        touchAction: 'none', userSelect: 'none',
                    }}
                >⠿</div>
            )}

            {/* Point d'insertion : un trait franc sur le bord visé, plutôt qu'un surlignage du bloc
                — c'est la POSITION qui se choisit, pas une cible à remplacer. */}
            {cible && (
                <div style={{
                    position: 'fixed', left: cible.rect.left, width: cible.rect.width,
                    top: cible.avant ? cible.rect.top - 2 : cible.rect.bottom - 2,
                    height: 4, borderRadius: 2, background: '#8B5CF6',
                    boxShadow: '0 0 12px rgba(139,92,246,0.9)', zIndex: 99999, pointerEvents: 'none',
                }} />
            )}
        </>,
        document.body,
    );
}

BlockDragOverlay.propTypes = {
    containerRef: PropTypes.object.isRequired,
    /** Faux sur les arbres montés pour la capture et la mesure — comme toute affordance. */
    enabled: PropTypes.bool,
    /** `(nouvelOrdre: string[]) => void` — reçoit la liste complète d'ids `data-module`. */
    onReorder: PropTypes.func.isRequired,
};
