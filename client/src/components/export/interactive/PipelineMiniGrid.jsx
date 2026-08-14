import { useState } from 'react';
import { generatePipelineCells, inferTimelineConfig } from '../../../utils/pipelineCellUtils';
import { safeParse, colorWithOpacity } from '../../../utils/exportMakerHelpers';
import { getFieldLabel, humanizeKey } from '../../../utils/fieldRegistry';
import { summarizeCellFields } from '../../../utils/chainCellPipelines';
import { LiquidModal } from '@/components/ui/LiquidUI';
import { useCanvasTooltip, affordance } from './InteractiveContext';
import PipelineGridView from '../../pipelines/views/PipelineGridView';
import MediaFrame from './MediaFrame';

// LE DÉTAIL D'UNE ÉTAPE PART TOUJOURS EN MODALE — plus de panneau en ligne sous la grille.
//
// Le panneau en ligne était réservé aux étapes peu documentées (≤ 6 mesures), la modale au reste.
// Deux défauts, et le second est structurel : (1) il déplaçait le contenu sous lui à chaque clic,
// donc la fiche « bougeait » pendant qu'on la consultait ; (2) sa hauteur n'entre dans aucune
// mesure de pagination — sur un canevas à page fixe, il poussait littéralement du contenu hors de
// la page. Une modale vit dans un portail sur `document.body` : elle ne déplace rien, et la capture
// ne la voit jamais. Demande explicite : « les contenus doivent s'afficher en modale pop-up »
// (2026-08-13).

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
    // Le template hôte est-il en mode PAPIER (A4) ? Il est le seul à le savoir — la grille ne
    // connaît ni le ratio ni la palette. Transmis tel quel jusqu'aux cases, qui choisissent alors
    // l'échelle claire plutôt que les verts sombres de l'éditeur.
    paper = false,
    // Titre de section à rendre AU-DESSUS du bloc, et seulement si le bloc existe (cf. plus bas).
    heading = null,
}) {
    const [modalCell, setModalCell] = useState(null);
    const { bind, tooltipNode, interactive } = useCanvasTooltip();

    const savedConfig = safeParse(timelineConfig, null);
    const data = safeParse(timelineData, []);
    if (!Array.isArray(data) || data.length === 0) return null;

    // Une config absente ou vide ne doit PAS faire disparaître des relevés réels : on reconstitue
    // alors la trame depuis les données elles-mêmes (cf. `inferTimelineConfig`). Le repli ne
    // s'applique que s'il ne reste rien à afficher autrement — une config valide prime toujours.
    let config = savedConfig;
    let cells = config ? generatePipelineCells(config, type) : [];
    if (cells.length === 0) {
        const deduite = inferTimelineConfig(data);
        if (deduite) { config = { ...(savedConfig || {}), ...deduite }; cells = generatePipelineCells(config, type); }
    }
    if (!config || cells.length === 0) return null;

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
                // `media`/`photos` : pièces jointes, jamais des mesures — cf. `META_KEYS` (chainCellPipelines).
                if (!['timestamp', 'date', 'label', 'phase', 'data', '_meta', 'media', 'photos'].includes(k)) fields[k] = entry[k];
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

    // Médias attachés à une étape, indexés comme les cases. Séparés des mesures pour la raison
    // dite dans `getCellFields` : une photo n'est pas une grandeur. Elle doit pourtant se voir dans
    // le fichier — mesuré le 2026-08-13 : 39 cases exportées, 0 photo, alors que le formulaire
    // permet de l'attacher.
    const gridMedia = cells.reduce((acc, c, i) => {
        const entree = data.find(d => d && (String(d.timestamp) === String(c.timestamp) || String(d.phase) === String(c.timestamp)));
        const media = entree && Array.isArray(entree.media) ? entree.media : null;
        if (media && media.length > 0) acc[i] = media;
        return acc;
    }, {});

    // Détail d'une étape, écrit comme le formulaire l'écrit — `summarizeCellFields()` est la
    // résolution libellé+unité déjà utilisée par le canevas Chaîne de production et par les
    // templates. Le détail révélé au clic passait, lui, par `getFieldLabel`/`humanizeKey` : il
    // affichait « Temperature », « Co2 ppm », « Ph » et jusqu'à « Cell label » (une clé de
    // bookkeeping) là où le formulaire montre « Température 24 °C », « CO₂ 888 ppm », « pH 6.2 ».
    // C'est précisément l'écart signalé — « les pipelines rendus ne sont pas les mêmes que ceux des
    // formulaires ». Le repli sur le registre reste, pour les clés qu'aucun pipeline ne déclare.
    const detailerEtape = (timestamp) => {
        const fields = getCellFields(timestamp) || {};
        const resolus = summarizeCellFields(type, fields);
        if (resolus.length > 0) return resolus;
        return Object.entries(fields)
            .filter(([k]) => !['timestamp', 'date', 'label', 'cellLabel', 'media', 'photos'].includes(k))
            .map(([k, v]) => ({ key: k, label: getFieldLabel(k) || humanizeKey(k), value: typeof v === 'object' ? JSON.stringify(v) : String(v) }));
    };

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
            {/* `heading` — le titre de section du bloc, rendu ICI et pas par l'appelant.
                Il est passé au composant précisément parce que c'est LUI qui sait s'il y a quelque
                chose à montrer : les quatre `return null` ci-dessus (pas de données, pas de config,
                aucune tranche visible sur cette page) laissaient sinon un titre « Processus de
                production » seul au milieu de la fiche. « les titres devraient suivre les elements
                pas les templates » (2026-08-14). */}
            {heading}
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
                cellsMedia={gridMedia}
                paper={paper}
                config={config}
                // Description des cases DÉJÀ calculée ici par `generatePipelineCells` — la grille
                // la dérivait de son côté, avec un vocabulaire de config qui n'existe nulle part
                // (`config.intervalType === 'weeks'` contre le `config.type: 'semaine'` réellement
                // enregistré) : aucune branche ne matchait, chaque case retombait sur son numéro
                // d'ordre. Nom, emoji et durée de phase viennent maintenant du même générateur que
                // le formulaire, puisqu'il est ici même.
                cellsMeta={cells}
                // Laisse la grille résoudre libellés et unités des mesures via
                // `summarizeCellFields()`, comme le canevas Chaîne de production et les templates.
                pipelineType={type}
                cellIndices={chunk.indices}
                readonly
                staticRender
                // Un PNG ne se clique pas : sur l'arbre de capture/mesure, la case ne doit annoncer
                // aucune cliquabilité (cf. `interactiveCells`).
                interactiveCells={interactive}
                fillMode={moduleId ? 'fill' : 'fit'}
                canAddMore={false}
                onCellClick={(index) => {
                    if (!interactive) return;
                    const cell = cells[index];
                    if (!cell) return;
                    // Une étape sans donnée n'a rien à montrer : ouvrir une modale vide serait pire
                    // que de ne rien faire.
                    if (detailerEtape(cell.timestamp).length === 0) return;
                    setModalCell(cell.timestamp);
                }}
            />
            </div>
            ))}
            {/* `LiquidModal` est rendue par un portail sur `document.body` — donc hors du nœud cloné
                par `prepareCapture`, jamais capturée par accident, et sans effet sur la hauteur
                mesurée par la pagination. */}
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
                    const entries = detailerEtape(modalCell);
                    // Les PHOTOS de l'étape font partie de son contenu au même titre que ses mesures.
                    // Dans la grille elles ne tiennent qu'en fond de case, à quelques dizaines de
                    // pixels ; c'est ici qu'on peut enfin les regarder.
                    const index = cells.findIndex((c) => String(c.timestamp) === String(modalCell));
                    const medias = gridMedia[index] || [];
                    if (entries.length === 0 && medias.length === 0) {
                        return <p className="text-white/50 text-sm">Aucune donnée pour cette étape.</p>;
                    }
                    return (
                        <div className="space-y-3">
                            {entries.length > 0 && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {entries.map((f) => (
                                        <div key={f.key} className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-2">
                                            <div className="text-[11px] uppercase tracking-wide text-white/40">{f.label}</div>
                                            <div className="text-sm text-white font-medium break-words">{f.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {medias.length > 0 && (
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {medias.map((m, i) => (
                                        <figure key={i} className="rounded-xl overflow-hidden border border-white/10 bg-black/30">
                                            {/* `MediaFrame` plutôt qu'un `<img>` : une vidéo d'étape
                                                passait ici dans une balise image, donc s'affichait
                                                cassée. C'est la seule surface où elle peut vraiment
                                                se regarder — la case fait ~80px. */}
                                            <MediaFrame
                                                media={m}
                                                className="w-full object-cover"
                                                style={{ aspectRatio: '4 / 3' }}
                                            />
                                            {m?.caption && (
                                                <figcaption className="px-2 py-1 text-[11px] text-white/50 truncate">{m.caption}</figcaption>
                                            )}
                                        </figure>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })()}
            </LiquidModal>
            {tooltipNode}
        </div>
    );
}
