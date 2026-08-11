import { useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * FitToFill — ajuste le contenu pour occuper la hauteur réelle du canevas.
 *
 * MESURE DE LA HAUTEUR NATURELLE — le point délicat, et la cause du premier échec.
 *
 * `scrollHeight` du conteneur interne ne convient PAS : ce conteneur porte `height: 100%` (les
 * enfants du template utilisent `h-full`/`flex-1` et ont besoin d'une hauteur définie pour se
 * disposer), donc son `scrollHeight` vaut la hauteur du canevas, jamais celle du contenu. Sonde
 * DOM du 2026-08-05 : `available = 768`, `natural = 768`, échelle 1 — le composant était inerte
 * pour cette seule raison.
 *
 * On mesure donc l'EXTENSION RÉELLE du contenu : le bas du dernier bloc `[data-module]` par
 * rapport au haut du conteneur. Les rectangles subissant la transformation, on divise par
 * l'échelle courante — la valeur obtenue est invariante, ce qui rend le calcul stable au lieu
 * de créer une boucle de rétroaction.
 *
 * POURQUOI. Le canevas d'un export a une taille fixe, le contenu d'une review non. Une Fleur dense
 * et un Hash « photo + nom » n'ont pas le même volume : aucun jeu de constantes (part d'image,
 * limites de tags, facteur d'échelle par ratio) ne peut faire tomber les deux au même remplissage.
 * Mesuré avant ce composant : de 53 % à 98 % selon la combinaison, en ayant déjà réglé toutes ces
 * constantes une par une. Il faut que le rendu s'adapte à SON contenu, pas qu'on le devine.
 *
 * COMMENT. Le `transform: scale` n'affecte pas le calcul de mise en page : `scrollHeight` reste la
 * hauteur NATURELLE du contenu quelle que soit l'échelle appliquée. On peut donc mesurer et
 * ajuster en une passe, sans boucle de rétroaction ni risque d'oscillation.
 *
 * ÉCHELLE BORNÉE. Remplir à tout prix impliquerait qu'une fiche pauvre s'affiche en très gros et
 * une fiche dense en minuscule — au mépris du plancher de lisibilité de 12px et de la cohérence
 * entre deux fiches d'un même producteur. Les bornes limitent l'écart ; ce qui reste est absorbé
 * par l'image, seul élément d'une carte qui peut grandir et se recadrer sans se déformer.
 */
const MAX_PASSES = 8;

export default function FitToFill({ min = 0.9, max = 1.3, enabled = true, children }) {
    const outerRef = useRef(null);
    const innerRef = useRef(null);
    const [scale, setScale] = useState(1);
    // Miroir synchrone de l'échelle : `compute` doit lire la valeur COURANTE, pas celle capturée
    // à la création de la closure, sinon la normalisation des rectangles est fausse.
    const scaleRef = useRef(1);
    // Garde-fous de la boucle de révision (cf. `compute`).
    const passesRef = useRef(0);
    const rafRef = useRef(null);
    const [availProbe, setAvailProbe] = useState(0);
    const [naturalProbe, setNaturalProbe] = useState(0);

    useLayoutEffect(() => {
        if (!enabled) { setScale(1); return undefined; }
        const outer = outerRef.current;
        const inner = innerRef.current;
        if (!outer || !inner) return undefined;

        const compute = () => {
            // MESURER LES DEUX GRANDEURS DANS LE MÊME ESPACE — la cause du second échec.
            //
            // `clientHeight` rend des pixels de MISE EN PAGE ; `getBoundingClientRect()` rend des
            // pixels ÉCRAN, donc déjà multipliés par les `transform: scale` des ANCÊTRES (l'aperçu
            // Studio et le mode Fichier réduisent tous deux le canevas pour le faire tenir). Comparer
            // les deux revient à diviser par l'échelle de l'aperçu : le contenu paraît d'autant plus
            // court que l'aperçu est réduit, et l'échelle part systématiquement à sa borne haute.
            // Mesuré le 2026-08-11 sur Article de Blog 16:9 : « contenu 943px dans 1032px » alors
            // que la page en portait 2052 — soit un rendu à 189 %, contenu coupé. Le même piège est
            // documenté dans la règle E4 de l'audit, qui s'y était heurtée avant.
            const available = outer.getBoundingClientRect().height;
            if (!available) return;
            const top = inner.getBoundingClientRect().top;
            let bottom = 0;
            // On mesure les blocs de CONTENU (`[data-module]`, plus tout élément marqué
            // `data-fit-tail` comme le pied de page de Story, qui vit hors des modules).
            //
            // Surtout PAS les enfants de premier niveau : ce sont des conteneurs flex étirés
            // (`flex: 1`, `height: 100%`), dont le bas vaut toujours celui du canevas. Mesuré le
            // 2026-08-05 : `contenu = avail` à l'unité près sur les 8 combinaisons de Story, y
            // compris celles remplies à 73 %. Le composant ne pouvait donc que RÉTRÉCIR — quand un
            // module dépasse du conteneur — et jamais agrandir, ce qui laissait tous les
            // sous-remplissages en l'état. C'est la cause des zones vides résiduelles.
            const candidates = [...inner.querySelectorAll('[data-module], [data-fit-tail]')];
            const scope = inner.firstElementChild || inner;
            (candidates.length ? candidates : [...scope.children]).forEach((el) => {
                bottom = Math.max(bottom, el.getBoundingClientRect().bottom - top);
            });
            if (bottom <= 0) return;
            // Les rectangles subissent la transformation : on ramène à l'échelle 1 pour obtenir
            // une hauteur naturelle invariante, seul moyen d'éviter une boucle.
            const natural = bottom / (scaleRef.current || 1);
            setAvailProbe(available); setNaturalProbe(natural);
            const next = Math.min(max, Math.max(min, available / natural));
            if (Math.abs(scaleRef.current - next) > 0.005) {
                scaleRef.current = next;
                setScale(next);
                // RÉVISION APRÈS APPLICATION — sans elle, l'échelle n'est calculée qu'UNE fois.
                //
                // `natural = bottom / scale` suppose que la hauteur du contenu varie exactement en
                // proportion de l'échelle. C'est faux dès que le contenu se recompose : le conteneur
                // interne est en `width: 100/scale%`, donc agrandir RÉTRÉCIT la largeur de mise en
                // page, le texte revient à la ligne plus tôt et le contenu grandit plus vite que
                // prévu. Le `ResizeObserver` ne rattrapait pas l'erreur : il observe deux boîtes
                // dont les dimensions ne bougent PAS lors d'une recomposition interne (l'une est le
                // canevas, l'autre un pourcentage de celui-ci) — il ne se déclenchait donc jamais.
                // Mesuré le 2026-08-11 : Article de Blog 16:9 rendu à 174 % (contenu coupé), Fiche
                // Technique 16:9 à 104 %. On repasse donc après le rendu ; la formule étant un
                // simple correcteur proportionnel, chaque passe divise l'erreur et la boucle
                // s'arrête d'elle-même sur la bande morte de 0,005.
                if (passesRef.current < MAX_PASSES) {
                    passesRef.current += 1;
                    rafRef.current = requestAnimationFrame(compute);
                }
            }
        };

        passesRef.current = 0;
        compute();
        const ro = new ResizeObserver(() => { passesRef.current = 0; compute(); });
        ro.observe(outer);
        ro.observe(inner);
        return () => {
            ro.disconnect();
            if (rafRef.current) cancelAnimationFrame(rafRef.current);
        };
    }, [enabled, min, max, children]);

    if (!enabled) return children;

    return (
        // `flex: 1` + `minHeight: 0` en plus de `height: 100%` : en tant qu'enfant d'un conteneur
        // flex, une hauteur en pourcentage ne se résout pas toujours, `clientHeight` vaut alors 0 et
        // le composant reste silencieusement à l'échelle 1 (constaté à la première mesure).
        <div
            ref={outerRef}
            data-fit-scale={scale.toFixed(3)}
            // Sonde : les valeurs RÉELLEMENT utilisées par le calcul, pas des approximations —
            // `scrollHeight` y figurait alors qu'il est inutilisable ici (cf. en-tête), ce qui a
            // fait perdre du temps en diagnostic.
            data-fit-avail={Math.round(availProbe)}
            data-fit-natural={Math.round(naturalProbe)}
            style={{ height: '100%', width: '100%', flex: 1, minHeight: 0, overflow: 'hidden' }}
        >
            <div
                ref={innerRef}
                style={{
                    transformOrigin: 'top left',
                    transform: `scale(${scale})`,
                    // Compense la largeur perdue/gagnée par l'échelle pour que le contenu occupe
                    // toujours toute la largeur du canevas.
                    width: `${100 / scale}%`,
                    height: `${100 / scale}%`,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {children}
            </div>
        </div>
    );
}

FitToFill.propTypes = {
    /** Échelle minimale — en dessous, le texte devient illisible ; l'image absorbe le reste. */
    min: PropTypes.number,
    /** Échelle maximale — au-delà, une fiche pauvre paraîtrait grossie artificiellement. */
    max: PropTypes.number,
    /** Désactivable : sans objet sur un template paginé, où c'est la pagination qui règle la hauteur. */
    enabled: PropTypes.bool,
    children: PropTypes.node,
};
