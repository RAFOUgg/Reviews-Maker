import PropTypes from 'prop-types';
import SingleReviewCard from '../../export/SingleReviewCard';

/**
 * Aperçu du mode ÉCRAN d'Export Maker (C10-3) — la fiche telle qu'elle s'affiche en ligne,
 * pilotée en direct par la config du Studio.
 *
 * C'est l'exact pendant de `PreviewPane`/`PagedPreviewPane`, qui montrent eux le mode FICHIER :
 * un canevas à taille fixe (1920×1080, A4…), paginé, calibré pour une capture PNG/PDF. Les deux
 * surfaces ne se remplacent pas — elles répondent à deux questions différentes (« à quoi ressemble
 * ma fiche en ligne ? » vs « à quoi ressemblera le fichier exporté ? »).
 *
 * ── Pourquoi deux formats, et seulement deux ────────────────────────────────────────────────────
 * Le mode Écran proposait les ratios de FICHIER (1:1, 16:9, A4…), ce qui n'a pas de sens pour une
 * page web : « en mode écran il faut juste gérer le format PC et format téléphone » (2026-08-13).
 * Une fiche en ligne se lit sur un ordinateur ou sur un téléphone — le reste est du papier.
 *
 * Et ce n'est pas qu'un changement d'étiquette : les deux formats d'écran sont déclarés dans
 * `RATIO_DIMENSIONS`, la table dont `getResponsiveAdjustments` dérive typographie, colonnes et
 * marges. Choisir « Téléphone » ne rétrécit donc pas une maquette d'ordinateur : le rendu est
 * RECALCULÉ pour 420px de large — c'est le « tout les élément doivent s'auto recalibrer » demandé.
 *
 * CE PANNEAU MONTRE LE TEMPLATE SÉLECTIONNÉ, fluide (`allowOverflow` : il défile, il n'est pas
 * coupé à la hauteur d'un écran).
 *
 * Deux demandes de l'utilisateur se sont opposées, et il a fallu les départager :
 *   • 2026-08-06 : « ce style de rendu [la Vue Détaillée] doit être utilisé pour Export Maker » —
 *     motivé par un canevas fixe réduit au `transform: scale`, illisible sur mobile et non
 *     cliquable ;
 *   • 2026-08-11 : le rendu doit suivre le template sélectionné. Capture à l'appui : « Article de
 *     Blog » et « Fiche Technique » donnaient un écran STRICTEMENT identique.
 *
 * La seconde ne peut pas être satisfaite par la Vue Détaillée : c'est UNE mise en page, sur
 * laquelle le template ne change que des contenus (`contentModules`) — jamais la forme. Entre deux
 * templates aux contenus voisins, l'écran reste donc le même, et c'est ce que l'utilisateur voyait.
 *
 * Arbitrage tenu jusqu'au 2026-08-16 : cet APERÇU montrait le template, tandis que la page publique
 * `/r/:id` gardait la Vue Détaillée. Il n'y a plus lieu de départager — la Vue Détaillée a été
 * SUPPRIMÉE (« retire les vue détaillé, gardons uniquement les rendu export maker »), et toutes les
 * surfaces de lecture (`/r/:id`, `/review/:id`, modale de galerie) rendent désormais le template en
 * mode Écran, par ce même `SingleReviewCard`.
 *
 * Ce qui a rendu la bascule possible : l'objection de 2026-08-06 — un canevas fixe réduit au
 * `transform: scale`, illisible sur téléphone — ne tient plus depuis le mode Écran (2026-08-14), qui
 * mesure la largeur disponible et RECOMPOSE la mise en page au lieu de la rétrécir. Mesuré le
 * 2026-08-16 : 8 paires de blocs côte à côte à 1600px de large, aucune à 420px, sans mise à l'échelle.
 */

/*
 * 2026-10-28 : format AUTOMATIQUE, plus de choix « Ordinateur / Téléphone » ni de bandeau
 * explicatif (« mode téléphone / pc automatique (plus un choix utilisateur) (retire les boutons) »).
 * L'aperçu prend toute la largeur du panneau ; `SingleReviewCard` en déduit seul la mise en page
 * (seuil 760px), exactement comme sur un vrai appareil — réduire la fenêtre montre le rendu
 * téléphone.
 */
export default function ScreenPreviewPane({ reviewData, config, onReorderBlocks }) {
    if (!reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Aucune review à prévisualiser
            </div>
        );
    }

    // Le ratio de fichier enregistré sur la review n'a aucun sens ici : on lui substitue un format
    // d'écran (la largeur réelle tranche ensuite), sans toucher à la config sauvegardée.
    const configEcran = { ...config, ratio: 'ecran-pc' };

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0a0f]">
            {/* `fitHeight` n'est PAS passé — une fiche en ligne défile, l'écraser pour la faire tenir
                dans le panneau donnerait un aperçu qui ne ressemble à rien de réel. */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
                <SingleReviewCard
                    reviewData={reviewData}
                    config={configEcran}
                    canvasId="export-maker-screen-canvas"
                    onReorderBlocks={onReorderBlocks}
                />
            </div>
        </div>
    );
}

ScreenPreviewPane.propTypes = {
    reviewData: PropTypes.object,
    config: PropTypes.object,
    /** Réordonnancement par glisser-déposer sur le rendu — écrit `config.moduleOrder`. */
    onReorderBlocks: PropTypes.func,
};
