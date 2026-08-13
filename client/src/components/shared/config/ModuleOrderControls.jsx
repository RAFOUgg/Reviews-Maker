import { useMemo } from 'react';
import { ArrowDown, ArrowUp, Lock, RotateCcw } from 'lucide-react';
import { useExportMakerStore } from '../../../store/exportMakerStore';
import { useTemplateModuleIds } from '../../../hooks/useAdaptivePages';
import { getModuleMeta, baseModuleId } from '../../../utils/adaptivePagination';
import { LiquidButton } from '../../ui/LiquidUI';

// ═══════════════════════════════════════════════════════════════════════════════
// ORDRE DES BLOCS — pilote `config.moduleOrder`.
//
// La liste affichée n'est pas une nomenclature tenue à la main : elle vient de la MESURE du
// template (`useTemplateModuleIds` → `measureDetailedCardModules`), qui monte le rendu réel et
// relève ses `[data-module]` dans l'ordre du DOM. Elle montre donc exactement les blocs que cette
// review produit sur ce template, dans l'ordre où ils sortent aujourd'hui — pas une liste théorique
// qui divergerait du rendu à la première évolution des formulaires.
// ═══════════════════════════════════════════════════════════════════════════════

// Blocs de STRUCTURE, hors du flux réordonnable : la couverture (photo + titre + note) et l'image
// principale vivent, selon le template, dans le conteneur PARENT du flux — les déplacer n'aurait
// aucun effet. Ils restent affichés, verrouillés : mieux vaut montrer où se trouve la couverture
// qu'escamoter la ligne et laisser croire à un oubli. Un bouton qui ne fait rien est précisément
// le défaut que ce chantier corrige, on ne va pas en réintroduire un.
const PINNED_MODULE_IDS = new Set(['masthead', 'mainImage', 'heroImage']);

// Un pipeline découpé en tronçons (`pipeline:culture#0`, `#1`…) est UNE entrée : on ordonne un
// pipeline, pas ses tranches — le découpage est une décision de pagination, pas de mise en page.
const baseId = baseModuleId;

export default function ModuleOrderControls() {
    const config = useExportMakerStore((state) => state.config);
    const reviewData = useExportMakerStore((state) => state.reviewData);
    const reorderModules = useExportMakerStore((state) => state.reorderModules);

    const measuredIds = useTemplateModuleIds(reviewData, config);

    // Ordre EFFECTIF courant : le rendu mesuré applique déjà `config.moduleOrder`, donc l'ordre du
    // DOM est la vérité. Pas de recomposition à partir de la config — deux sources qui pourraient
    // diverger là où une seule suffit.
    const blocks = useMemo(() => {
        const seen = new Set();
        const out = [];
        for (const raw of measuredIds) {
            const id = baseId(raw);
            if (seen.has(id)) continue;
            seen.add(id);
            out.push({ id, pinned: PINNED_MODULE_IDS.has(id), ...getModuleMeta(id) });
        }
        return out;
    }, [measuredIds]);

    const firstMovable = blocks.findIndex((b) => !b.pinned);
    const lastMovable = blocks.length - 1;
    const isCustomized = Array.isArray(config.moduleOrder) && config.moduleOrder.length > 0;

    const move = (index, delta) => {
        const target = index + delta;
        if (target < firstMovable || target > lastMovable) return;
        const ids = blocks.map((b) => b.id);
        [ids[index], ids[target]] = [ids[target], ids[index]];
        // On enregistre la liste ENTIÈRE, blocs verrouillés compris, pas seulement les deux blocs
        // échangés : `orderRenderBlocks` ne connaît que les rangs qu'on lui donne, et une liste
        // partielle laisserait tous les autres blocs se replacer « à côté de leur prédécesseur » —
        // donc un ordre qui bouge tout seul.
        reorderModules(ids);
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold text-white/90 flex items-center gap-2">↕️ Ordre des blocs</h3>
                    <p className="text-xs text-white/50 mt-0.5">
                        {isCustomized ? 'Ordre personnalisé' : 'Ordre par défaut du template'}
                    </p>
                </div>
                {isCustomized && (
                    <LiquidButton size="sm" variant="ghost" icon={RotateCcw} onClick={() => reorderModules([])}>
                        Réinitialiser
                    </LiquidButton>
                )}
            </div>

            {blocks.length === 0 ? (
                // La mesure prend ~2 s (polices, images, canevas à stabiliser). Un message explicite
                // vaut mieux qu'une liste vide, qui se lirait comme « ce template n'a aucun bloc ».
                <div className="text-center py-6 text-white/40 text-sm">
                    Analyse du rendu en cours…
                </div>
            ) : (
                <div className="space-y-1.5">
                    {blocks.map((block, i) => (
                        <div
                            key={block.id}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${block.pinned ? 'bg-white/[0.02] border-white/5' : 'bg-white/[0.04] border-white/10'}`}
                        >
                            <span className="text-base flex-shrink-0">{block.icon}</span>
                            <span className={`text-xs font-medium truncate flex-1 ${block.pinned ? 'text-white/45' : 'text-white/85'}`}>
                                {block.label}
                            </span>
                            {block.pinned ? (
                                <span className="flex items-center gap-1.5 text-[11px] text-white/35 pr-2" title="Bloc de structure — toujours en tête du rendu">
                                    <Lock className="w-3 h-3" /> fixe
                                </span>
                            ) : (
                                <>
                                    {/* 44px de côté : cible tactile minimale (règle E12 de l'audit),
                                        pas une icône décorative — ces deux boutons SONT le mécanisme
                                        de réordonnancement. */}
                                    <button
                                        type="button"
                                        onClick={() => move(i, -1)}
                                        disabled={i === firstMovable}
                                        aria-label={`Monter ${block.label}`}
                                        className="w-11 h-11 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                                    >
                                        <ArrowUp className="w-4 h-4" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => move(i, 1)}
                                        disabled={i === lastMovable}
                                        aria-label={`Descendre ${block.label}`}
                                        className="w-11 h-11 flex items-center justify-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:hover:bg-transparent transition-colors"
                                    >
                                        <ArrowDown className="w-4 h-4" />
                                    </button>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <p className="text-[11px] text-white/35 leading-snug">
                Sur les formats paginés, changer l&apos;ordre change aussi la répartition en pages : le
                découpage est recalculé sur la hauteur réelle des blocs.
            </p>
        </div>
    );
}
