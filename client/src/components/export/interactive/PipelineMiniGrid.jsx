import { useState } from 'react';
import { generatePipelineCells } from '../../../utils/pipelineCellUtils';
import { safeParse, colorWithOpacity } from '../../../utils/exportMakerHelpers';
import { getFieldLabel, humanizeKey } from '../../../utils/fieldRegistry';
import { LiquidModal } from '@/components/ui/LiquidUI';
import { useCanvasTooltip, affordance } from './InteractiveContext';
import PipelineGridView from '../../pipelines/views/PipelineGridView';

// Au-delà de ce nombre de mesures, le panneau en ligne sous la grille devient un pavé qui
// déborde la page : le détail part alors dans une modale (vocabulaire d'interaction du plan C8,
// §3 — « modale : un détail structuré »). En deçà, le panneau en ligne reste plus direct.
const INLINE_FIELD_LIMIT = 6;

// Nombre de cases par TRANCHE paginable.
//
// La grille était un bloc unique insécable, et c'était la cause dominante des pages à moitié vides :
// mesuré le 2026-08-10 sur la Fiche Technique 16:9, le budget vaut 949px par colonne alors que le
// pipeline Culture pèse 556px et le Curing 446px — deux blocs ne peuvent donc JAMAIS partager une
// colonne (1002 > 949). Résultat : 3988px de contenu étalés sur 4 pages là où le budget en
// autoriserait 2,1.
//
// La valeur doit rester INFÉRIEURE OU ÉGALE au nombre de colonnes, sinon chaque tranche se termine
// par une rangée partielle et le gâchis se répète autant de fois qu'il y a de tranches. Mesuré avec
// 12 : dans une grille d'environ 10 colonnes, une tranche occupait 2 rangées dont la seconde ne
// portait que 2 cases, et le pipeline Culture passait de 548px à 856px — l'A4 y perdait une page
// entière. Avec 10, le total de rangées redevient celui de la grille non découpée pour toutes les
// largeurs rencontrées (6, 10, 11 ou 12 colonnes : 5, 3, 3 et 3 rangées dans les deux cas), la
// tranche ne coûtant alors rien de plus que la grille d'un seul tenant.
//
// Même principe que les tranches de 6 étapes de `PipelineTimeline`, qui gère depuis 2026-08-04 la
// variante LISTE du même pipeline.
const CELLS_PER_CHUNK = 10;

/**
 * PipelineMiniGrid - Grille interactive lecture seule d'une timeline de pipeline
 * (culture/curing/extraction/séparation), pour affichage dans Export Maker
 * (Fiche Détaillée) et la galerie.
 *
 * Réutilise generatePipelineCells() (même logique de génération de cases que
 * l'éditeur PipelineDragDropView.jsx) — pas de drag-drop, juste un survol/clic
 * pour voir le détail d'une case.
 */
export default function PipelineMiniGrid({
    type, name, icon, timelineData, timelineConfig, accentColor = '#a78bfa',
    // Découpage paginable — mêmes props et même contrat que `PipelineTimeline` (variante LISTE) :
    // `moduleId` sert de préfixe aux `data-module` des tranches (`<moduleId>#N`), `isPageOn` filtre
    // celles de la page courante. Sans `moduleId` (galerie), la grille reste un bloc unique, comme
    // avant — ce chemin n'est pas paginé.
    moduleId = null, isPageOn = null,
}) {
    const [selected, setSelected] = useState(null);
    const [modalCell, setModalCell] = useState(null);
    const { bind, tooltipNode, interactive } = useCanvasTooltip();

    const config = safeParse(timelineConfig, null);
    const data = safeParse(timelineData, []);
    if (!config || !Array.isArray(data) || data.length === 0) return null;

    const cells = generatePipelineCells(config, type);
    if (cells.length === 0) return null;

    // Trouve la ou les entrées réelles correspondant à une case générée par `generatePipelineCells`.
    // Bug trouvé 2026-08-02 : pour les pipelines à intervalle 'phases' (culture/curing/séparation/
    // extraction — voir `generatePipelineCells`), la case générée a `timestamp` = l'id de phase
    // (`'phase-1'`...) MAIS les entrées réellement enregistrées par `PipelineDragDropView.jsx`
    // portent cet id de phase dans leur propre champ `phase`, pas dans `timestamp` — `timestamp`
    // y est un compteur d'occurrence (une phase peut avoir plusieurs entrées, ex. "Semaine 1" et
    // "Semaine 2" toutes deux `phase: 'phase-1'`) ou un ancien identifiant `'legacy-phase-X'` sur
    // les entrées créées avant une restructuration de formulaire. En ne comparant que sur
    // `timestamp`, AUCUNE entrée ne matchait jamais une case de phase — "0/13 documentées" même
    // avec des données réelles. Les pipelines à intervalle non-phase (jour/semaine/date/heure/...)
    // continuent, eux, à écrire `timestamp` au même format que la case (`'day-3'`...), donc le
    // matching par `timestamp` reste tenté en premier ; `phase` est un repli, pas un remplacement.
    // Plusieurs entrées peuvent matcher la même case de phase (plusieurs semaines dans une même
    // phase) — leurs champs sont fusionnés (dernière entrée prioritaire en cas de collision de clé)
    // plutôt que de n'en montrer arbitrairement qu'une seule.
    const getCellFields = (timestamp) => {
        const matches = data.filter(d => d && (String(d.timestamp) === String(timestamp) || String(d.phase) === String(timestamp)));
        if (matches.length === 0) return null;
        const fields = {};
        matches.forEach(entry => {
            if (entry.data && typeof entry.data === 'object') Object.assign(fields, entry.data);
            Object.keys(entry).forEach(k => {
                if (!['timestamp', 'date', 'label', 'phase', 'data', '_meta'].includes(k)) fields[k] = entry[k];
            });
        });
        return fields;
    };

    // `PipelineGridView` attend ses cases indexées par POSITION ; nos données sont indexées par
    // `timestamp`. Adaptation ici plutôt que dans la grille : c'est notre format qui est
    // particulier, pas le sien.
    const gridCells = cells.reduce((acc, c, i) => {
        const f = getCellFields(c.timestamp);
        if (f && Object.keys(f).length > 0) acc[i] = f;
        return acc;
    }, {});

    const filledCount = cells.filter(c => {
        const f = getCellFields(c.timestamp);
        return f && Object.keys(f).length > 0;
    }).length;

    // ── Découpage en tranches paginables ────────────────────────────────────────────────────────
    // Chaque tranche est une unité que le paginateur répartit comme n'importe quel autre module ;
    // toutes partagent la même trame de colonnes (cf. `fillMode="fill"`), donc l'ensemble se lit
    // comme une grille unique même réparti sur plusieurs pages.
    const allIndices = cells.map((_, i) => i);
    const chunks = moduleId
        ? Array.from({ length: Math.ceil(allIndices.length / CELLS_PER_CHUNK) }, (_, n) => ({
            id: `${moduleId}#${n}`,
            indices: allIndices.slice(n * CELLS_PER_CHUNK, (n + 1) * CELLS_PER_CHUNK),
        }))
        : [{ id: null, indices: allIndices }];
    const visibleChunks = isPageOn ? chunks.filter((c) => isPageOn(c.id)) : chunks;
    if (visibleChunks.length === 0) return null;
    // L'en-tête est reporté sur chaque page portant une tranche (pratique attendue d'un document
    // paginé), avec un rappel « (suite) » à partir de la deuxième — et il porte son propre
    // `data-module` pour que sa hauteur entre dans le budget, sans quoi elle échapperait à la mesure
    // (même correctif que `PipelineTimeline`, où l'écart atteignait 12 points de remplissage).
    const isContinuation = moduleId && visibleChunks[0].id !== chunks[0].id;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div data-module={moduleId ? `${moduleId}#hdr` : undefined}
                style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                <span>{icon}</span>
                <span style={{ flex: 1 }}>{name}{isContinuation ? ' (suite)' : ''}</span>
                <span style={{ fontSize: 12, opacity: 0.7 }}>{filledCount}/{cells.length} documentées</span>
            </div>
            {/* LA grille des formulaires, en lecture seule et rendu statique — plus une imitation.
                `staticRender` court-circuite la virtualisation `react-window`, qui ne monte que les
                lignes visibles et ferait perdre les cases hors écran à la capture PNG. */}
            {visibleChunks.map((chunk) => (
            <div key={chunk.id || 'all'} data-module={chunk.id || undefined}>
            <PipelineGridView
                cells={gridCells}
                config={config}
                cellIndices={chunk.indices}
                readonly
                staticRender
                fillMode={moduleId ? 'fill' : 'fit'}
                canAddMore={false}
                onCellClick={(index) => {
                    if (!interactive) return;
                    const cell = cells[index];
                    if (!cell) return;
                    const fields = getCellFields(cell.timestamp);
                    const count = fields ? Object.keys(fields).filter((k) => !['timestamp', 'date'].includes(k)).length : 0;
                    if (count === 0) return;
                    if (count > INLINE_FIELD_LIMIT) setModalCell(cell.timestamp);
                    else setSelected(selected === cell.timestamp ? null : cell.timestamp);
                }}
            />
            </div>
            ))}
            {selected && (() => {
                const cell = cells.find(c => c.timestamp === selected);
                const fields = getCellFields(selected) || {};
                const entries = Object.entries(fields).filter(([k]) => !['timestamp', 'date'].includes(k));
                return (
                    <div style={{
                        padding: '6px 10px', borderRadius: 8,
                        backgroundColor: colorWithOpacity(accentColor, 10),
                        border: `1px solid ${colorWithOpacity(accentColor, 25)}`,
                        fontSize: 13,
                    }}>
                        <div style={{ fontWeight: 700, marginBottom: 4 }}>{cell?.label}</div>
                        {entries.length === 0 && <div style={{ opacity: 0.6 }}>Aucune donnée pour cette étape</div>}
                        {entries.map(([k, v]) => (
                            <div key={k}>{getFieldLabel(k) || humanizeKey(k)} : {typeof v === 'object' ? JSON.stringify(v) : String(v)}</div>
                        ))}
                    </div>
                );
            })()}

            {/* Étape dense : le détail part en modale plutôt que de pousser un pavé sous la grille,
                qui déborderait la page. `LiquidModal` est rendue par un portail sur document.body —
                donc hors du nœud cloné par `prepareCapture`, jamais capturée par accident. */}
            <LiquidModal
                isOpen={Boolean(modalCell)}
                onClose={() => setModalCell(null)}
                size="lg"
                title={(() => {
                    const cell = cells.find((c) => String(c.timestamp) === String(modalCell));
                    return `${icon || ''} ${name} — ${cell?.label || ''}`.trim();
                })()}
            >
                {(() => {
                    if (!modalCell) return null;
                    const fields = getCellFields(modalCell) || {};
                    const entries = Object.entries(fields).filter(([k]) => !['timestamp', 'date'].includes(k));
                    if (entries.length === 0) return <p className="text-white/50 text-sm">Aucune donnée pour cette étape.</p>;
                    return (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {entries.map(([k, v]) => (
                                <div key={k} className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2">
                                    <div className="text-[11px] uppercase tracking-wide text-white/40">
                                        {getFieldLabel(k) || humanizeKey(k)}
                                    </div>
                                    <div className="text-sm text-white font-medium break-words">
                                        {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    );
                })()}
            </LiquidModal>
            {tooltipNode}
        </div>
    );
}
