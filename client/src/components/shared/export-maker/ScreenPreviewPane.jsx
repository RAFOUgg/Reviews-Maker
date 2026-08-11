import PropTypes from 'prop-types';
import SingleReviewCard from '../../export/SingleReviewCard';

/**
 * Aperçu du mode ÉCRAN d'Export Maker (C10-3) — la Vue Détaillée, telle qu'elle est servie sur
 * `/r/:id`, pilotée en direct par la config du Studio.
 *
 * C'est l'exact pendant de `PreviewPane`/`PagedPreviewPane`, qui montrent eux le mode FICHIER :
 * un canevas à taille fixe (1920×1080, A4…) rétréci au `transform: scale`, paginé, calibré pour
 * une capture PNG/PDF. Les deux surfaces ne se remplacent pas — elles répondent à deux questions
 * différentes (« à quoi ressemble ma fiche en ligne ? » vs « à quoi ressemblera le fichier
 * exporté ? »), et le Studio laisse désormais basculer de l'une à l'autre.
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
 * Arbitrage : cet APERÇU montre le template (sinon choisir un template ne montrerait rien), tandis
 * que la PAGE PUBLIQUE `/r/:id` garde la Vue Détaillée fluide et cliquable — la décision du
 * 2026-08-06 portait sur ce que voient les visiteurs, pas sur l'aperçu de l'éditeur. Les deux
 * surfaces restent donc chacune fidèle à son intention.
 */
export default function ScreenPreviewPane({ reviewData, config }) {
    if (!reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Aucune review à prévisualiser
            </div>
        );
    }

    return (
        <div className="w-full h-full overflow-y-auto bg-[#0a0a0f] p-4">
            <div className="mx-auto" style={{ maxWidth: 1100 }}>
                <SingleReviewCard reviewData={reviewData} config={config} canvasId="export-maker-screen-canvas" />
            </div>
        </div>
    );
}

ScreenPreviewPane.propTypes = {
    reviewData: PropTypes.object,
    config: PropTypes.object,
};
