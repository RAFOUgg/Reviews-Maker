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
 * POURQUOI LA VUE DÉTAILLÉE ET NON LES TEMPLATES À CANEVAS FIXE. Décision de l'utilisateur du
 * 2026-08-06, inscrite dans `PublicRenderPage.jsx` : « ce style de rendu doit être utilisé pour
 * Export Maker ». Un canevas de 1920×1080 rétréci au `transform: scale` donne une IMAGE réduite —
 * texte minuscule sur mobile au lieu de se recomposer, et rien de cliquable.
 *
 * J'ai basculé cet aperçu sur `SingleReviewCard` le 2026-08-11 pour répondre à « le rendu doit
 * suivre le template sélectionné », et ce faisant j'ai annulé la décision ci-dessus sans le voir.
 * Les deux demandes sont compatibles, mais pas ainsi : c'est la Vue Détaillée qui doit obéir au
 * template, en restant fluide et cliquable. Le template pilote donc les CONTENUS (via
 * `contentModules`, que `setTemplate` réécrit depuis `TEMPLATE_MODULE_PRESETS`), pas la mise à
 * l'échelle d'une image.
 *
 * Aucune mise à l'échelle ici, volontairement : la Vue Détaillée se recompose à la largeur
 * disponible. La borner à 1100px reproduit la largeur réelle de la page publique, pour que
 * l'aperçu ne mente pas sur la mise en page finale.
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
