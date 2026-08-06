import PropTypes from 'prop-types';
import ReviewFullDisplay from '../../gallery/ReviewFullDisplay';

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
 * Aucune mise à l'échelle ici, volontairement : la Vue Détaillée est fluide, elle se recompose à
 * la largeur disponible. La borner à 1100px reproduit la largeur réelle de la page publique, pour
 * que l'aperçu ne mente pas sur la mise en page finale.
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
                <ReviewFullDisplay review={reviewData} config={config} />
            </div>
        </div>
    );
}

ScreenPreviewPane.propTypes = {
    reviewData: PropTypes.object,
    config: PropTypes.object,
};
