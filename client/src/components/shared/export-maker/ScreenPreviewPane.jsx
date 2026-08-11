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
        <div className="w-full h-full flex flex-col bg-[#0a0a0f]">
            {/* Ce que ce mode est, écrit noir sur blanc. « Je n'ai pas accès aux différentes pages
                en mode écran ? c'est normal ? » (2026-08-11) : oui, et rien ne le disait. Le
                bandeau est HORS de la zone défilante pour ne pas rogner la hauteur sur laquelle
                l'aperçu se met à l'échelle. */}
            <div className="flex-shrink-0 px-4 py-2 text-[11px] leading-snug text-white/45 border-b border-white/10">
                <span className="text-white/70 font-semibold">Mode Écran</span> — la fiche telle qu'elle
                s'affiche en ligne : un document continu, sans pages ni marges d'impression.
                Pagination, canevas fixe et export de fichiers se règlent dans le mode <span className="text-white/70 font-semibold">Fichier</span>.
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
            <div className="mx-auto" style={{ maxWidth: 1100 }}>
                {/* `fitHeight` : l'aperçu se dézoome jusqu'à tenir dans la zone plutôt que d'obliger
                    à faire défiler pour voir le rendu (mesuré à 1046px de débordement en 9:16 avant
                    cette option). La page publique `/r/:id`, elle, ne le passe pas : un document en
                    ligne DOIT défiler, l'y écraser le rendrait illisible sur mobile. */}
                <SingleReviewCard reviewData={reviewData} config={config} canvasId="export-maker-screen-canvas" fitHeight />
            </div>
            </div>
        </div>
    );
}

ScreenPreviewPane.propTypes = {
    reviewData: PropTypes.object,
    config: PropTypes.object,
};
