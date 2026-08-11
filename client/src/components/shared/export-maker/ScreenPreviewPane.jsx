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
 * OBÉIT AU TEMPLATE SÉLECTIONNÉ (2026-08-11). Cet aperçu rendait auparavant `ReviewFullDisplay`,
 * un composant unique qui ignore `config.template` et `config.ratio` : choisir « Story Social
 * Media » dans le Studio n'y changeait rien, on voyait toujours une fiche détaillée qui défile.
 * Signalé par l'utilisateur, capture à l'appui — et c'était exact.
 *
 * Il rend désormais le MÊME composant que la page publique (`SingleReviewCard`), donc le template
 * et le format réellement choisis. La différence avec l'onglet FICHIER reste entière et assumée :
 * ici le document est fluide (`allowOverflow`, il défile), là il est enfermé dans un canevas à
 * hauteur fixe et paginé pour la capture. Deux questions distinctes, un seul moteur de rendu.
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
