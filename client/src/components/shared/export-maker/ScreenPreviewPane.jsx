import { useState } from 'react';
import PropTypes from 'prop-types';
import SingleReviewCard from '../../export/SingleReviewCard';
import { RATIO_DIMENSIONS, SCREEN_RATIOS } from '../../../utils/exportMakerHelpers';

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
 * Arbitrage : cet APERÇU montre le template (sinon choisir un template ne montrerait rien), tandis
 * que la PAGE PUBLIQUE `/r/:id` garde la Vue Détaillée fluide et cliquable — la décision du
 * 2026-08-06 portait sur ce que voient les visiteurs, pas sur l'aperçu de l'éditeur.
 */

const ICONES = { 'ecran-pc': '🖥️', 'ecran-mobile': '📱' };

export default function ScreenPreviewPane({ reviewData, config, onReorderBlocks }) {
    const [format, setFormat] = useState('ecran-pc');

    if (!reviewData) {
        return (
            <div className="w-full h-full flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                Aucune review à prévisualiser
            </div>
        );
    }

    // Le ratio de fichier enregistré sur la review n'a aucun sens ici : on lui substitue un format
    // d'écran, sans toucher à la config sauvegardée (l'export continue de lire la sienne).
    //
    // Le sélecteur ne fait que CONTRAINDRE LA LARGEUR du cadre : c'est ensuite `SingleReviewCard`
    // qui déduit de la largeur réelle s'il faut une mise en page d'ordinateur ou de téléphone, et
    // qui recompose. On emprunte donc exactement le chemin d'un vrai appareil de cette largeur,
    // plutôt qu'un mode d'aperçu parallèle qui pourrait mentir.
    const configEcran = { ...config, ratio: format };
    const dims = RATIO_DIMENSIONS[format];

    return (
        <div className="w-full h-full flex flex-col bg-[#0a0a0f]">
            {/* Ce que ce mode est, écrit noir sur blanc. « Je n'ai pas accès aux différentes pages
                en mode écran ? c'est normal ? » (2026-08-11) : oui, et rien ne le disait. Le
                bandeau est HORS de la zone défilante pour ne pas rogner la hauteur sur laquelle
                l'aperçu se met à l'échelle. */}
            <div className="flex-shrink-0 px-4 py-2 border-b border-white/10 flex items-center gap-3 flex-wrap">
                <div className="text-[11px] leading-snug text-white/45 flex-1 min-w-[220px]">
                    <span className="text-white/70 font-semibold">Mode Écran</span> — la fiche telle qu'elle
                    s'affiche en ligne : un document continu, sans pages ni marges d'impression.
                    Pagination et formats de fichier se règlent à l'<span className="text-white/70 font-semibold">exportation</span>.
                    {onReorderBlocks && <> Survolez un bloc et saisissez sa poignée <span className="text-white/70">⠿</span> pour le déplacer.</>}
                </div>
                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                    {SCREEN_RATIOS.map((r) => (
                        <button
                            key={r}
                            onClick={() => setFormat(r)}
                            aria-pressed={format === r}
                            // 44px de haut : même cible tactile que le reste des contrôles du Studio.
                            className={`px-3 h-[44px] rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                format === r ? 'bg-violet-600 text-white' : 'text-white/60 hover:bg-white/10 hover:text-white/90'
                            }`}
                        >
                            <span>{ICONES[r]}</span>
                            <span>{RATIO_DIMENSIONS[r].label}</span>
                        </button>
                    ))}
                </div>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto p-4">
                {/* La zone est bornée à la largeur du format choisi : un téléphone doit se voir
                    étroit, sinon le sélecteur ne montrerait aucune différence de mise en page.
                    `fitHeight` n'est PAS passé — une fiche en ligne défile, l'écraser pour la faire
                    tenir dans le panneau donnerait un aperçu qui ne ressemble à rien de réel. */}
                <div className="mx-auto" style={{ maxWidth: dims.width }}>
                    <SingleReviewCard
                        key={format}
                        reviewData={reviewData}
                        config={configEcran}
                        canvasId="export-maker-screen-canvas"
                        onReorderBlocks={onReorderBlocks}
                    />
                </div>
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
