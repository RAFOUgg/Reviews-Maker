import { motion } from 'framer-motion';
import { Check, Lock } from 'lucide-react';
import { useAccountFeatures } from '../../../hooks/useAccountFeatures';
import { useExportMakerStore } from '../../../store/exportMakerStore';
import { TEMPLATE_FAMILIES } from '../../../store/exportMakerConstants';

export default function TemplateSelector() {
    const config = useExportMakerStore((state) => state.config);
    const setTemplate = useExportMakerStore((state) => state.setTemplate);
    const templates = useExportMakerStore((state) => state.templates);

    // Gating par type de compte (2026-08-04) : amateur → Moderne Compact ; influenceur → +Blog
    // +Story ; producteur → les 5. Les templates non autorisés restent VISIBLES mais verrouillés —
    // les masquer priverait l'utilisateur de la raison de monter en offre.
    const { allowedTemplates, isAmateur, isInfluenceur } = useAccountFeatures();
    const requiredTierLabel = (templateId) => {
        if (templateId === 'traceabilityReport' || templateId === 'detailedCard') return 'Producteur';
        return isAmateur ? 'Influenceur' : 'Producteur';
    };

    return (
        <div className="space-y-4">
            {/* Titre */}
            <div>
                <h3 className="text-base font-semibold text-white/90 mb-1">
                    Choix du Template
                </h3>
                <p className="text-xs text-white/50">
                    Sélectionnez un style de présentation pour votre review
                </p>
            </div>

            {/* Galerie de templates, GROUPÉE PAR FAMILLE.
                Les cinq templates répondent à deux besoins opposés — un document qu'on classe et
                qu'on oppose, ou une carte qu'on partage. Les présenter à plat les faisait passer
                pour des variantes de goût : quelqu'un qui cherche une fiche à joindre à un lot n'a
                aucune raison de comparer « Story Réseau Social » à « Rapport de Traçabilité ».
                Un template non classé apparaît quand même, en fin de liste — il doit rester
                visible, pas disparaître parce qu'on a oublié de lui donner une famille. */}
            {Object.values(TEMPLATE_FAMILIES).map((family) => {
                const inFamily = Object.values(templates).filter((t) => t.family === family.id);
                if (inFamily.length === 0) return null;
                return (
                <div key={family.id} className="space-y-2">
                    <div className="flex items-baseline gap-2 pt-1">
                        <h4 className="text-sm font-semibold text-white/85">{family.label}</h4>
                        <p className="text-[11px] text-white/45">{family.hint}</p>
                    </div>
                    <div className="grid grid-cols-1 gap-2">
                {inFamily.map((template) => {
                    const isAllowed = allowedTemplates.includes(template.id);
                    return (
                    <motion.button
                        key={template.id}
                        whileHover={isAllowed ? { scale: 1.01 } : {}}
                        whileTap={isAllowed ? { scale: 0.99 } : {}}
                        onClick={() => isAllowed && setTemplate(template.id)}
                        disabled={!isAllowed}
                        aria-disabled={!isAllowed}
                        title={isAllowed ? undefined : `Réservé aux comptes ${requiredTierLabel(template.id)}`}
                        className={`liquid-card p-3 text-left ${config.template === template.id ? 'ring-2 ring-purple-500' : ''} ${isAllowed ? '' : 'opacity-45 cursor-not-allowed'}`}
                    >
                        <div className="flex items-start justify-between mb-1.5">
                            <div>
                                <h4 className="font-medium text-sm text-white/90">
                                    {template.name}
                                </h4>
                                <p className="text-[11px] text-white/50 mt-0.5">
                                    {template.description}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                                {config.template === template.id && isAllowed && (
                                    <Check className="w-5 h-5 text-purple-400" />
                                )}
                                {!isAllowed && (
                                    <span className="flex items-center gap-1 text-[10px] font-semibold text-amber-300/90 bg-amber-400/10 border border-amber-400/25 px-1.5 py-0.5 rounded-full whitespace-nowrap">
                                        <Lock className="w-3 h-3" />
                                        {requiredTierLabel(template.id)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-1 mt-1.5">
                            {template.supportedRatios.slice(0, 3).map((ratio) => (
                                <span
                                    key={ratio}
                                    className="text-[10px] px-1.5 py-0.5 rounded bg-white/10 text-white/60"
                                >
                                    {ratio}
                                </span>
                            ))}
                        </div>
                    </motion.button>
                    );
                })}
                    </div>
                </div>
                );
            })}

            {/* Templates sans famille déclarée — jamais masqués. */}
            {(() => {
                const known = new Set(Object.keys(TEMPLATE_FAMILIES));
                const orphans = Object.values(templates).filter((t) => !known.has(t.family));
                if (orphans.length === 0) return null;
                return (
                    <p className="text-[11px] text-amber-300/80">
                        {orphans.length} template(s) sans famille : {orphans.map((t) => t.name).join(', ')}
                    </p>
                );
            })()}

            {/* FORMAT ET PAGINATION SONT PARTIS À L'EXPORT.
                Ils ne concernent que le FICHIER, et cet éditeur montre le rendu ÉCRAN — un document
                continu. Les laisser ici, c'était offrir des boutons qui ne changeaient rien de
                visible : « c'est pas au format A4 », « c'est pas en 16:9 » (2026-08-13).

                L'interrupteur de pagination a suivi le 2026-08-16, pour une raison plus forte que
                l'absence d'effet visible : il était NUISIBLE. L'activer créait une « session de
                pages », et `ExportModal` désactivait alors toute mesure de hauteur au profit de
                cette trame statique — une pagination devinée remplaçait une pagination mesurée, au
                moment précis où l'utilisateur croyait soigner sa mise en page. La pagination est
                désormais calculée à l'export, à partir de la hauteur réelle du contenu. */}
            <p className="text-[11px] text-white/40 leading-snug">
                Le format du fichier (carré, paysage, A4…) et la répartition en pages se règlent au
                moment d&apos;exporter, où elles ont un sens. Ici, vous composez la fiche telle
                qu&apos;elle s&apos;affiche en ligne.
            </p>
        </div>
    );
}
