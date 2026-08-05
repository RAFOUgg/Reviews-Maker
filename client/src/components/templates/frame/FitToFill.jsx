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
export default function FitToFill({ min = 0.9, max = 1.3, enabled = true, children }) {
    const outerRef = useRef(null);
    const innerRef = useRef(null);
    const [scale, setScale] = useState(1);
    // Miroir synchrone de l'échelle : `compute` doit lire la valeur COURANTE, pas celle capturée
    // à la création de la closure, sinon la normalisation des rectangles est fausse.
    const scaleRef = useRef(1);

    useLayoutEffect(() => {
        if (!enabled) { setScale(1); return undefined; }
        const outer = outerRef.current;
        const inner = innerRef.current;
        if (!outer || !inner) return undefined;

        const compute = () => {
            const available = outer.clientHeight;
            if (!available) return;
            const top = inner.getBoundingClientRect().top;
            let bottom = 0;
            // On mesure TOUS les blocs de premier niveau du template, pas seulement les
            // `[data-module]` : Story place son pied de page (auteur, terpologie.eu) hors de ces
            // blocs, il échappait donc à la mesure. Résultat : hauteur naturelle sous-estimée,
            // échelle surestimée, et un débordement à 114 % sur une review dense.
            const scope = inner.firstElementChild || inner;
            const candidates = [...scope.children, ...inner.querySelectorAll('[data-module]')];
            candidates.forEach((el) => {
                bottom = Math.max(bottom, el.getBoundingClientRect().bottom - top);
            });
            if (bottom <= 0) return;
            // Les rectangles subissent la transformation : on ramène à l'échelle 1 pour obtenir
            // une hauteur naturelle invariante, seul moyen d'éviter une boucle.
            const natural = bottom / (scaleRef.current || 1);
            const next = Math.min(max, Math.max(min, available / natural));
            if (Math.abs(scaleRef.current - next) > 0.005) {
                scaleRef.current = next;
                setScale(next);
            }
        };

        compute();
        const ro = new ResizeObserver(compute);
        ro.observe(outer);
        ro.observe(inner);
        return () => ro.disconnect();
    }, [enabled, min, max, children]);

    if (!enabled) return children;

    return (
        // `flex: 1` + `minHeight: 0` en plus de `height: 100%` : en tant qu'enfant d'un conteneur
        // flex, une hauteur en pourcentage ne se résout pas toujours, `clientHeight` vaut alors 0 et
        // le composant reste silencieusement à l'échelle 1 (constaté à la première mesure).
        <div
            ref={outerRef}
            data-fit-scale={scale.toFixed(3)}
            data-fit-avail={outerRef.current ? outerRef.current.clientHeight : 'n/a'}
            data-fit-natural={innerRef.current ? innerRef.current.scrollHeight : 'n/a'}
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
