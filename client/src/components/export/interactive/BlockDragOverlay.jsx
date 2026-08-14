import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PropTypes from 'prop-types';
import { baseModuleId, getModuleMeta, sanitizeModuleOrder } from '../../../utils/adaptivePagination';

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
 * ── LA POIGNÉE DOIT ÊTRE ATTEIGNABLE (correctif 2026-08-14) ─────────────────────────────────────
 * « le bouton de drag and drop bug ? jpp déplacer les elements dans le rendu ». Mesuré : la poignée
 * était posée ENTIÈREMENT HORS du bloc, 34px à sa gauche — pour l'attraper il fallait sortir du
 * bloc, or sortir du bloc effaçait le survol, donc effaçait la poignée. Sonde : elle disparaissait
 * au pas 112 sur 118 du trajet, soit ~18px avant d'être atteinte, et le geste complet ne changeait
 * jamais l'ordre. Elle avait été déplacée là pour cesser de recouvrir le titre du bloc — ce qui
 * réglait la gêne visuelle en supprimant la fonction.
 *
 * Deux règles la rendent saisissable, et il faut les deux :
 *   1. elle est posée DANS les bornes du bloc (coin haut DROIT — les titres sont alignés à gauche
 *      sur les cinq templates, donc ce coin est le seul libre par construction) : le trajet vers
 *      elle ne quitte jamais le bloc ;
 *   2. le survol survit à une sortie de quelques pixels (`TOLERANCE_PX`) et ne se laisse pas
 *      voler par un bloc ANCÊTRE — sans quoi la poignée « fuit » vers le bloc parent dès que le
 *      curseur passe sur une marge intérieure.
 *
 * Le glissement lui-même résout sa cible par `elementFromPoint` plutôt que par `event.target` :
 * c'est ce qui permet de la recalculer sans événement, pendant le défilement automatique.
 *
 * Comme `BlockZoomOverlay`, tout est rendu par un portail sur `document.body` : hors du nœud cloné
 * par la capture, donc invisible de tout fichier exporté.
 */

// Un pipeline découpé en tranches (`pipeline:culture#0`, `#1`…) se déplace d'un bloc : le découpage
// est une décision de pagination, pas une composition. Même règle que `ModuleOrderControls`.
const PINNED = new Set(['masthead', 'mainImage', 'heroImage']);

// Marge de survie du survol autour du bloc. Couvre le passage sur une bordure/marge intérieure, pas
// un déplacement vers un autre bloc — au-delà, la poignée doit bien disparaître.
const TOLERANCE_PX = 12;

// Défilement automatique quand on glisse vers un bord du panneau d'aperçu. Sans lui, un bloc ne peut
// être déplacé que vers une destination DÉJÀ visible — sur une fiche de 13 blocs, l'essentiel des
// déplacements utiles est hors écran.
const BANDE_AUTOSCROLL_PX = 64;
const VITESSE_AUTOSCROLL_MAX = 20;

/** Conteneur défilant le plus proche — celui dont le glissement doit faire bouger le contenu. */
function trouverScroller(depuis) {
    let n = depuis?.parentElement;
    while (n && n !== document.body) {
        const ov = getComputedStyle(n).overflowY;
        if ((ov === 'auto' || ov === 'scroll') && n.scrollHeight > n.clientHeight + 1) return n;
        n = n.parentElement;
    }
    return null;
}

export default function BlockDragOverlay({ containerRef, enabled, onReorder }) {
    const [survol, setSurvol] = useState(null);   // { el, id, rect }
    const [cible, setCible] = useState(null);     // { rect, id, avant }
    // Le bloc saisi est un ÉTAT, pas une ref : la poignée et le trait d'insertion en dépendent, et
    // une ref ne provoque aucun rendu — la surcouche resterait figée pendant tout le glissement.
    const [pris, setPris] = useState(null);       // id
    const [curseur, setCurseur] = useState(null); // { x, y } — position du témoin de glissement

    // Miroirs : les gestionnaires d'événements sont posés UNE fois (l'effet ne dépend plus ni du
    // survol ni de la cible). Sans ces refs, chaque mouvement de souris désabonnait et réabonnait
    // les écouteurs, et `onUp` pouvait lire une cible périmée.
    const survolRef = useRef(null);
    const prisRef = useRef(null);
    const cibleRef = useRef(null);
    const posRef = useRef({ x: 0, y: 0 });
    const scrollerRef = useRef(null);

    useEffect(() => { survolRef.current = survol; }, [survol]);
    useEffect(() => { prisRef.current = pris; }, [pris]);
    useEffect(() => { cibleRef.current = cible; }, [cible]);

    /** Bloc déplaçable sous un point de l'écran, ou null. */
    const blocSousLePoint = useCallback((x, y) => {
        const root = containerRef.current;
        if (!root) return null;
        const el = document.elementFromPoint(x, y)?.closest?.('[data-module]');
        if (!el || !root.contains(el)) return null;
        const id = baseModuleId(el.getAttribute('data-module'));
        if (!id || PINNED.has(id)) return null;
        return { el, id };
    }, [containerRef]);

    /** Hors glissement : quel bloc porte la poignée ? */
    const resoudreSurvol = useCallback((x, y) => {
        const candidat = blocSousLePoint(x, y);
        const courant = survolRef.current;
        if (candidat) {
            // Un ANCÊTRE ne prend pas la main sur le bloc déjà survolé : passer sur la marge
            // intérieure d'une section ferait autrement sauter la poignée au bloc parent, juste
            // au moment où l'utilisateur va la saisir.
            const usurpation = courant && candidat.id !== courant.id && candidat.el.contains(courant.el);
            if (!usurpation) {
                setSurvol({ el: candidat.el, id: candidat.id, rect: candidat.el.getBoundingClientRect() });
                return;
            }
        }
        // Rien d'exploitable sous le curseur : on garde la poignée vivante tant qu'on reste au bord
        // du bloc courant. C'est très exactement le trajet vers elle.
        if (courant && courant.el.isConnected) {
            const r = courant.el.getBoundingClientRect();
            const dedans = x >= r.left - TOLERANCE_PX && x <= r.right + TOLERANCE_PX
                && y >= r.top - TOLERANCE_PX && y <= r.bottom + TOLERANCE_PX;
            if (dedans) { setSurvol({ el: courant.el, id: courant.id, rect: r }); return; }
        }
        setSurvol(null);
    }, [blocSousLePoint]);

    /** Pendant le glissement : où s'insérerait le bloc saisi ? */
    const resoudreCible = useCallback((x, y) => {
        const saisi = prisRef.current;
        if (!saisi) return;
        const candidat = blocSousLePoint(x, y);
        if (!candidat || candidat.id === saisi) { setCible(null); return; }
        const r = candidat.el.getBoundingClientRect();
        // Moitié haute = avant.
        setCible({ rect: r, id: candidat.id, avant: y < r.top + r.height / 2 });
    }, [blocSousLePoint]);

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

        const onMove = (event) => {
            posRef.current = { x: event.clientX, y: event.clientY };
            if (prisRef.current) {
                setCurseur({ x: event.clientX, y: event.clientY });
                resoudreCible(event.clientX, event.clientY);
                return;
            }
            resoudreSurvol(event.clientX, event.clientY);
        };

        // Le défilement déplace les blocs sous un curseur immobile : sans ré-résolution, la poignée
        // resterait affichée à l'ancienne position, sur un bloc qui n'y est plus.
        const onScroll = () => {
            const { x, y } = posRef.current;
            if (!x && !y) return;
            if (prisRef.current) resoudreCible(x, y); else resoudreSurvol(x, y);
        };

        const onUp = () => {
            const destination = cibleRef.current;
            const saisi = prisRef.current;
            setPris(null);
            setCible(null);
            setCurseur(null);
            setSurvol(null);
            scrollerRef.current = null;
            if (!saisi || !destination) return;

            const ordre = blocsOrdonnes().filter((id) => id !== saisi);
            const index = ordre.indexOf(destination.id);
            if (index === -1) return;
            ordre.splice(destination.avant ? index : index + 1, 0, saisi);
            onReorder(sanitizeModuleOrder(ordre));
        };

        root.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
        window.addEventListener('pointercancel', onUp);
        window.addEventListener('scroll', onScroll, true);
        return () => {
            root.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            window.removeEventListener('pointercancel', onUp);
            window.removeEventListener('scroll', onScroll, true);
        };
    }, [containerRef, enabled, onReorder, resoudreSurvol, resoudreCible]);

    // Défilement automatique aux bords, tant qu'un bloc est saisi. La cible est recalculée à chaque
    // pas : le contenu bouge sous un curseur qui, lui, ne produit aucun événement.
    useEffect(() => {
        if (!pris) return undefined;
        let actif = true;
        let frame = 0;
        const pas = () => {
            if (!actif) return;
            const sc = scrollerRef.current;
            const { x, y } = posRef.current;
            if (sc) {
                const r = sc.getBoundingClientRect();
                let d = 0;
                if (y < r.top + BANDE_AUTOSCROLL_PX) {
                    d = -Math.ceil(((r.top + BANDE_AUTOSCROLL_PX - y) / BANDE_AUTOSCROLL_PX) * VITESSE_AUTOSCROLL_MAX);
                } else if (y > r.bottom - BANDE_AUTOSCROLL_PX) {
                    d = Math.ceil(((y - (r.bottom - BANDE_AUTOSCROLL_PX)) / BANDE_AUTOSCROLL_PX) * VITESSE_AUTOSCROLL_MAX);
                }
                if (d) {
                    const avant = sc.scrollTop;
                    sc.scrollTop += d;
                    if (sc.scrollTop !== avant) resoudreCible(x, y);
                }
            }
            frame = requestAnimationFrame(pas);
        };
        frame = requestAnimationFrame(pas);
        return () => { actif = false; cancelAnimationFrame(frame); };
    }, [pris, resoudreCible]);

    if (!enabled || typeof document === 'undefined') return null;

    const enCours = Boolean(pris);

    // Poignée posée DANS le bloc, coin haut droit : les titres des cinq templates sont alignés à
    // gauche, donc c'est le seul coin libre par construction — et surtout le curseur n'a pas à
    // sortir du bloc pour l'atteindre. Repli à gauche sur un bloc trop étroit pour l'accueillir.
    const TAILLE = 30;
    const poignee = survol && !enCours
        ? {
            left: survol.rect.width >= TAILLE * 2
                ? survol.rect.right - TAILLE - 6
                : Math.max(4, survol.rect.left + 4),
            top: survol.rect.top + 6,
        }
        : null;

    return createPortal(
        <>
            {/* Poignée de saisie — au survol du bloc. `position: fixed` sur les coordonnées
                viewport : le rendu vit souvent sous un `transform: scale()`, une surcouche posée
                dans son repère se retrouverait décalée. */}
            {poignee && (
                <div
                    onPointerDown={(e) => {
                        e.preventDefault(); e.stopPropagation();
                        scrollerRef.current = trouverScroller(containerRef.current);
                        posRef.current = { x: e.clientX, y: e.clientY };
                        setCurseur({ x: e.clientX, y: e.clientY });
                        setPris(survol.id);
                    }}
                    title="Glisser pour déplacer ce bloc"
                    aria-label={`Déplacer le bloc ${getModuleMeta(survol.id).label}`}
                    style={{
                        position: 'fixed', left: poignee.left, top: poignee.top,
                        zIndex: 99998, cursor: 'grab', width: TAILLE, height: TAILLE, borderRadius: 8,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(139,92,246,0.92)', color: '#fff', fontSize: 15, lineHeight: 1,
                        border: '1px solid rgba(255,255,255,0.28)', boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
                        touchAction: 'none', userSelect: 'none',
                    }}
                >⠿</div>
            )}

            {/* Témoin de glissement : il nomme le bloc saisi. Sans lui, la poignée disparaissant au
                `pointerdown`, plus rien à l'écran ne dit qu'un glissement est en cours ni sur quoi
                il porte. `pointerEvents: none` — il suit le curseur, il ne doit jamais l'intercepter
                ni masquer le bloc visé à `elementFromPoint`. */}
            {enCours && curseur && (
                <div style={{
                    position: 'fixed', left: curseur.x + 14, top: curseur.y + 14, zIndex: 99999,
                    pointerEvents: 'none', padding: '5px 10px', borderRadius: 8,
                    background: 'rgba(139,92,246,0.95)', color: '#fff', fontSize: 12, fontWeight: 600,
                    border: '1px solid rgba(255,255,255,0.28)', boxShadow: '0 6px 20px rgba(0,0,0,0.5)',
                    whiteSpace: 'nowrap', userSelect: 'none',
                }}>⠿ {getModuleMeta(pris).label}</div>
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
