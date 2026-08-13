import { Children } from 'react';
import PropTypes from 'prop-types';
import { orderRenderBlocks } from '../../../utils/exportMakerHelpers';

/**
 * Rend ses enfants dans l'ordre décidé par `config.moduleOrder` au lieu de l'ordre du JSX.
 *
 * POURQUOI CE MÉCANISME plutôt que reconstruire chaque template autour d'un tableau de blocs :
 * les blocs déclarent DÉJÀ leur identité, soit via la prop `moduleId` du `Section` local du
 * template, soit via `data-module` posé directement sur un `<div>` (masthead, canevas, pipelines).
 * C'est le même contrat que celui déjà exploité par la mesure de pagination et par la règle
 * d'étirement de `TemplateRenderer.jsx` : un enfant sait qui il est, il n'y a donc rien à
 * réinventer ni aucun vocabulaire supplémentaire à tenir à jour — le défaut récurrent de ce module.
 *
 * Ce que ça implique, et qui est voulu :
 * - un enfant SANS identité (le pied de page, un séparateur, un bloc conditionnel anonyme) n'est
 *   jamais déplacé : il reste collé à son prédécesseur (cf. `orderRenderBlocks`) ;
 * - l'ordre du DOM change réellement, donc la mesure de pagination (qui lit les `[data-module]`
 *   dans l'ordre du DOM) et le packing séquentiel suivent d'eux-mêmes. Aucun second endroit à
 *   synchroniser — c'est la raison de faire porter l'ordre par le DOM et non par du CSS `order`,
 *   qui, en plus, ne s'appliquerait pas au flux multi-colonnes des formats larges.
 */
export default function OrderedFlow({ moduleOrder, children, columns = 1 }) {
    const list = Children.toArray(children);
    const ordonnes = (!Array.isArray(moduleOrder) || moduleOrder.length === 0)
        ? list
        : null;
    if (ordonnes) return enveloppe(ordonnes, columns);

    // `data-order-id` : identité de bloc pour les enveloppes qui ne PEUVENT pas porter
    // `data-module` — l'enveloppe d'un pipeline en grille, par exemple, contient des sous-blocs
    // mesurés et ne doit surtout pas être mesurée elle aussi (double comptage → page blanche,
    // cf. le commentaire de `renderPipeline`). Elle a néanmoins une place dans l'ordre de lecture.
    const blocks = list.map((child) => ({
        id: (child && child.props && (child.props.moduleId || child.props['data-module'] || child.props['data-order-id'])) || '',
        node: child,
    }));
    return enveloppe(orderRenderBlocks(blocks, moduleOrder).map((b) => b.node), columns);
}

/**
 * FLUX EN COLONNES — c'est ici que « horizontal sur ordinateur, vertical sur téléphone » se joue.
 *
 * Les cinq templates enveloppent déjà leur contenu dans ce composant : lui confier le nombre de
 * colonnes évite de réinventer une mise en page par template (et `DetailedCardTemplate`, qui coulait
 * seul en colonnes, le faisait par un style local dupliqué). `breakInside: avoid` est déjà posé par
 * les `Section` des templates, donc aucun bloc n'est coupé en deux entre les colonnes.
 *
 * Une seule colonne = aucun conteneur ajouté : les templates qui ne coulent pas (Story, et tous les
 * rendus sur téléphone) gardent exactement le DOM d'avant, donc la mesure de pagination et la
 * capture ne changent pas d'un pixel.
 */
function enveloppe(noeuds, columns) {
    if (!(columns > 1)) return <>{noeuds}</>;
    return <div style={{ columnCount: columns, columnFill: 'balance', columnGap: 20 }}>{noeuds}</div>;
}

OrderedFlow.propTypes = {
    /** `config.moduleOrder` — vide = ordre naturel du template. */
    moduleOrder: PropTypes.arrayOf(PropTypes.string),
    children: PropTypes.node,
    /** Colonnes du flux. 1 = empilement strict (téléphone, Story) — aucun conteneur ajouté. */
    columns: PropTypes.number,
};
