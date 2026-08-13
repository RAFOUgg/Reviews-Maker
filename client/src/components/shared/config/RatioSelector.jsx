import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useExportMakerStore } from '../../../store/exportMakerStore';

/**
 * Choix du FORMAT du fichier exporté.
 *
 * Extrait de l'onglet Template (`TemplateSelector`) le 2026-08-13. Il y vivait à côté du choix de
 * template, dans un éditeur qui affiche un document continu — donc à un endroit où il ne changeait
 * rien de visible : « c'est pas au format A4 », « c'est pas en 16:9 », « 16:9 non respecté ». Le
 * format ne concerne que le FICHIER ; il se choisit donc au moment de l'exporter, là où il décide
 * réellement de quelque chose.
 */
const RATIOS = [
    { id: '1:1', name: 'Carré (1:1)', icon: '⬜' },
    { id: '16:9', name: 'Paysage (16:9)', icon: '🖥️' },
    { id: '9:16', name: 'Portrait (9:16)', icon: '📱' },
    { id: '4:3', name: 'Standard (4:3)', icon: '🖼️' },
    { id: 'A4', name: 'A4 (Document)', icon: '📄' },
];

export default function RatioSelector({ compact = false, value = null, onChange = null, template = null }) {
    const config = useExportMakerStore((state) => state.config);
    const templates = useExportMakerStore((state) => state.templates);
    const setRatio = useExportMakerStore((state) => state.setRatio);

    // CONTRÔLABLE. Dans la modale d'export, le format est un choix PROPRE À CET EXPORT : la modale
    // rend depuis la config enregistrée sur la review, pas depuis le store d'édition — un sélecteur
    // qui n'écrirait que dans le store n'y changerait rien (mesuré : chaque combinaison sortait au
    // format de la précédente). Sans `value`/`onChange`, on retombe sur le store, pour tout appelant
    // qui édite bien la session en cours.
    const ratioActif = value ?? config.ratio;
    const appliquer = onChange ?? setRatio;
    const courant = templates?.[template ?? config.template];

    return (
        <div>
            <h4 className={`font-semibold mb-2 ${compact ? 'text-xs text-gray-700 dark:text-gray-300' : 'text-sm text-white/90'}`}>
                Format du fichier
            </h4>
            <div className="grid grid-cols-2 gap-1.5">
                {RATIOS.map((ratio) => {
                    // Un template ne prend pas tous les formats (une story n'a pas de A4) : le
                    // bouton reste visible mais inerte, pour que l'absence s'explique d'elle-même.
                    // Si la liste des formats du template n'est pas résolue (modale ouverte hors
                    // session d'édition, compte sans droits chargés…), on n'INTERDIT rien : un
                    // sélecteur entièrement grisé est pire qu'un format proposé en trop. Mesuré :
                    // sans ce repli, l'audit ne trouvait plus un seul format cliquable.
                    const formats = courant?.supportedRatios;
                    const supporte = !formats || formats.includes(ratio.id);
                    const actif = ratioActif === ratio.id;
                    return (
                        <motion.button
                            key={ratio.id}
                            whileHover={supporte ? { scale: 1.01 } : {}}
                            whileTap={supporte ? { scale: 0.99 } : {}}
                            onClick={() => supporte && appliquer(ratio.id)}
                            disabled={!supporte}
                            title={supporte ? undefined : `${courant?.name || 'Ce template'} ne propose pas ce format`}
                            className={`p-2 rounded-lg text-xs font-medium transition-all ${actif
                                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                                : supporte
                                    ? 'bg-white/5 border border-white/10 text-white/70 hover:bg-white/10'
                                    : 'bg-white/[0.02] text-white/25 cursor-not-allowed'}`}
                        >
                            <div className="flex items-center justify-center gap-1.5">
                                <span className="text-sm">{ratio.icon}</span>
                                <span className="text-[11px]">{ratio.name}</span>
                            </div>
                        </motion.button>
                    );
                })}
            </div>
        </div>
    );
}

RatioSelector.propTypes = {
    /** Rend les libellés lisibles sur fond clair (modale d'export). */
    compact: PropTypes.bool,
    /** Format actif — si absent, celui de la session d'édition. */
    value: PropTypes.string,
    /** Appelé au choix d'un format — si absent, écrit dans la session d'édition. */
    onChange: PropTypes.func,
    /** Template dont on lit les formats supportés — si absent, celui de la session. */
    template: PropTypes.string,
};
