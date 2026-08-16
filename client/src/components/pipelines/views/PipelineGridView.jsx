import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Grid as RVGrid } from 'react-window';
import { CULTURE_PHASES } from '../../../config/pipelinePhases';
import './PipelineGridView.css';
import { getFieldIcon } from '../../../utils/fieldIcons';
import { summarizeCellFields } from '../../../utils/chainCellPipelines';
import { isVideoMedia } from '../../../utils/mediaFileHelpers';

/**
 * PipelineGridView - Grille de cases style GitHub commits
 * 
 * Fonctionnalités:
 * ✅ Cases cliquables
 * ✅ Drop zone pour drag & drop
 * ✅ Visualisation résumée (icônes, couleurs, intensité)
 * ✅ Multi-sélection (Ctrl+clic)
 * ✅ Tooltip au survol
 * ✅ Bouton + pour ajouter cases
 * ✅ Support pagination
 */

// Côté minimal d'une case en rendu FIGÉ (export/galerie). Mesuré sur le contenu réel d'une case
// documentée — libellé, rangée d'icônes, pied — qui demande ~78px de haut ; en dessous, la case
// coupe son propre contenu. Sert à la fois de largeur minimale de colonne (`auto-fit`) et de
// hauteur minimale, ce qui donne une case nominalement carrée mais libre de grandir.
const STATIC_CELL_MIN_PX = 78;

// Côté minimal d'une case de PHASE. Une phase ne porte pas un jeton court (« J12 », « S3 ») mais un
// NOM — « Début Croissance », « Maturation/Affinage ». Mesuré sur un export réel : à 78px de large,
// ces noms se brisaient en « Débu / t / Crois / sanc / e », une colonne d'une syllabe par ligne.
// 132px laissent le nom tenir en deux lignes et la rangée de pastilles rester horizontale.
// L'éditeur fait le même écart (`phaseBase` 96 contre 72, `rawBaseMin` 160 contre 140) : une trame
// à phases y a toujours eu des cases plus larges qu'une trame à jours.
const STATIC_PHASE_CELL_MIN_PX = 132;

// Nombre d'icônes de mesure affichées dans une case avant de basculer sur le compteur « +N ».
// 4 : c'est la valeur de `CellEmojiOverlay.jsx`, le composant qui rend ces mêmes pastilles dans
// l'éditeur de pipeline. Reprise telle quelle plutôt que rechoisie — la case de l'export doit
// s'arrêter de compter au même endroit que celle du formulaire.
const MAX_CELL_ICONS = 4;

// Clés TECHNIQUES posées sur une entrée de timeline, à ne jamais compter comme une mesure.
// Utilisée UNIQUEMENT dans le repli (appelant sans `pipelineType`) : dès qu'on connaît le
// pipeline, c'est `summarizeCellFields` qui filtre, avec sa propre liste `META_KEYS` — la seule
// qui fasse autorité. Cette liste-ci reprend celle de l'éditeur (`PipelineDragDropView.jsx`,
// exclusion du gradient d'intensité) augmentée de `cellLabel`/`media`/`photos`, absentes là-bas
// mais déjà identifiées ailleurs comme non-mesures.
const FALLBACK_META_KEYS = [
    'timestamp', 'date', 'label', 'cellLabel', 'phase', 'day', 'week', 'hours', 'seconds',
    '_meta', 'media', 'photos', 'contents',
];

const PipelineGridView = ({
    cells = {},
    config,
    cellIndices = [],
    onCellClick,
    onDropOnCell,
    draggedContent = null,
    selectedCells = [],
    readonly = false,
    onAddCells,
    canAddMore = true,
    // Rendu STATIQUE : toutes les cellules posées d'un coup, sans virtualisation ni défilement
    // interne. `react-window` ne monte que les lignes visibles — indispensable pour éditer une
    // culture de 90 jours sans ramer, mais fatal à l'export : la capture ne verrait que les
    // premières lignes et perdrait le reste sans aucun signal. Les deux chemins partagent le même
    // `renderCell`, donc la grille de l'export est celle des formulaires, pas une imitation.
    staticRender = false,
    // Le clic sur une case fait-il RÉELLEMENT quelque chose ?
    //
    // `cursor-pointer` était posé sans condition, y compris sur l'arbre monté pour la CAPTURE :
    // 285 éléments annonçaient une cliquabilité qu'un PNG n'a pas, et l'auditeur les comptait à
    // juste titre comme cibles tactiles hors norme (1908 avertissements E12, ~14px de haut). Une
    // affordance doit être additive et ne jamais survivre à l'export — c'est la règle qui a déjà
    // évité une régression de capture sur ce module. Vrai par défaut : le formulaire, lui, est
    // toujours cliquable.
    interactiveCells = true,
    // MÉDIAS par index de case, canal SÉPARÉ des mesures.
    //
    // `cells` ne porte que des MESURES : l'appelant en exclut délibérément `media`/`photos`, qui
    // sont des pièces jointes et non des grandeurs (cf. `getCellFields`). Les y remettre les
    // ferait compter comme des données de cellule — dans les pastilles, dans le « N/N documentées »
    // et dans la modale. D'où ce second canal, lu par le seul fond de case.
    cellsMedia = {},
    // MODE PAPIER — le rendu vit dans un document imprimé (A4), pas dans l'éditeur sombre.
    //
    // Les surfaces ci-dessous sont OPAQUES par décision mesurée (voir `EDITOR_SURFACES`) : une case
    // translucide laisse passer le fond de page et, sur l'A4 crème, les libellés blancs y étaient
    // tombés à 2,09:1 (39 violations). Mais figer la teinte de l'ÉDITEUR revient à poser des tuiles
    // vert sombre sur une page crème — c'est ce que l'utilisateur a signalé le 2026-08-13.
    // D'où une seconde échelle, claire, tout aussi opaque donc tout aussi déterministe : même
    // gradation de remplissage, encre sombre au lieu de blanche.
    paper = false,
    // 'fit' (défaut, inchangé) ou 'fill' quand la grille est rendue en TRANCHES successives qui
    // doivent partager la même trame — cf. le commentaire sur `gridTemplateColumns`.
    fillMode = 'fit',
    // DESCRIPTION DES CASES telle que l'éditeur la calcule — sortie de `generatePipelineCells()`,
    // c'est-à-dire la MÊME liste d'objets que `PipelineDragDropView.jsx` rend dans le formulaire
    // (`{ label, emoji, duration, phase, date, week, day }`).
    //
    // POURQUOI CE PROP EXISTE. Cette grille dérivait jusqu'ici son libellé toute seule
    // (`getCellLabel`), à partir d'un vocabulaire qui n'existe nulle part ailleurs :
    // `config.intervalType` valant `'phases'`/`'weeks'`/`'days'`/`'dates'`, alors que la config
    // réellement enregistrée porte `config.type` en FRANÇAIS (`'jour'`/`'semaine'`/`'date'`/
    // `'phases'`/`'mois'`…). Aucune branche ne matchait donc jamais : toute case retombait sur le
    // dernier `return`, le numéro d'ordre nu. Mesuré sur un export réel le 2026-08-12 — une culture
    // de 25 jours s'affichait « 11, 12, 13… » au lieu de « J11, J12, J13… », et un curing de phases
    // aurait affiché les phases de CULTURE (`CULTURE_PHASES` codé en dur pour tous les pipelines).
    // C'est la 7e occurrence documentée du même défaut sur ce dépôt : un nom de champ deviné au
    // lieu d'être repris. La réponse est ici la même que les six fois précédentes — ne plus dériver,
    // recevoir ce que le générateur commun a déjà produit.
    cellsMeta = null,
    // 'culture' | 'curing' | 'separation' | 'extraction' — permet de lire les mesures d'une case
    // avec `summarizeCellFields()`, le lecteur canonique (libellés et unités des
    // `*SidebarContent.js`, donc ceux du formulaire). Absent, on retombe sur un balayage de clés.
    pipelineType = null,
}) => {
    const [hoveredCell, setHoveredCell] = useState(null);
    const [dragOverCell, setDragOverCell] = useState(null);

    // Responsive grid control
    const gridRef = React.useRef(null);
    const scrollRef = React.useRef(null);
    const [columns, setColumns] = useState(7);
    const [cellSize, setCellSize] = useState(56);
    const [columnWidthState, setColumnWidth] = useState(56);
    const [gridWidth, setGridWidth] = useState(0);
    const [gridHeight, setGridHeight] = useState(0);
    const [zoom, setZoom] = useState(1);

    // ResizeObserver : calcule nombre de colonnes, taille des cellules et dimensions du grid pour virtualisation

    React.useEffect(() => {
        // RENDU STATIQUE : cet observateur ne sert à RIEN ici. Ses sorties (`columns`, `cellSize`,
        // `gridWidth`, `gridHeight`) ne sont lues que par la branche virtualisée `react-window` ; la
        // branche statique passe par une grille CSS `auto-fit`, qui se dimensionne seule.
        //
        // Le laisser tourner coûtait cher, et pas seulement en calcul : ses `setState` provoquaient
        // des re-rendus PENDANT la mesure de pagination, si bien que la même review donnait 5 pages
        // à 91 % en rendu isolé et 2 pages à 59 % dans la matrice complète — même code, deux
        // résultats, au gré de l'ordonnancement. Et son callback pouvait s'exécuter sur un nœud déjà
        // détaché pendant une capture (85 erreurs « Cannot read properties of null » sur un seul
        // rendu). La garde plus bas reste en place pour le mode ÉDITION, où l'observateur est utile.
        if (staticRender) return;
        if (!gridRef.current || !scrollRef.current) return;

        const gap = 8; // gap en px, doit correspondre au gap Tailwind (gap-2 ~= 8px)
        const minColumns = 4;
        const maxColumns = 8; // safeguard: cap columns to 8 to keep cells legible on wide screens

        const baseMin = config && config.intervalType === 'phases' ? 80 : 56; // base min size

        const ro = new ResizeObserver(() => {
            // Le nœud peut avoir été DÉTACHÉ entre la notification et l'exécution du callback :
            // `ResizeObserver` n'annule pas les notifications en vol, et le pipeline d'export clone
            // puis retire des sous-arbres en permanence. Sans cette garde, chaque grille montée
            // pendant une capture levait « Cannot read properties of null » — 85 erreurs sur un seul
            // rendu du Rapport de Traçabilité, qui en monte plusieurs.
            if (!scrollRef.current) return;
            const available = Math.max(120, scrollRef.current.clientWidth);

            // taille minimale souhaitée pour garantir au moins 4 colonnes
            const minCols = 4;
            // prefer larger base for phases (visually bigger)
            const phaseBase = config && config.intervalType === 'phases' ? 96 : 72;
            const minCellBase = Math.max(48, Math.floor((available - (minCols - 1) * gap) / minCols));
            // compute min cell respecting zoom and preferred base
            const minCell = Math.max(48, Math.floor(Math.max(minCellBase, phaseBase) * zoom));

            // Determine optimal number of columns (choose k between minColumns..maxColumns that maximizes cell size)
            const totalCells = (cellIndices && cellIndices.length) || 0;
            const maxCandidateCols = Math.min(maxColumns, Math.max(minColumns, totalCells || maxColumns));
            let bestCols = Math.max(minColumns, Math.min(maxCandidateCols, Math.floor((available + gap) / (minCell + gap))));
            let bestSize = Math.floor((available - (bestCols - 1) * gap) / bestCols);

            // Try all candidate column counts to find the one that gives largest cell size
            for (let k = minColumns; k <= Math.min(maxCandidateCols, totalCells || maxCandidateCols); k++) {
                const sizeK = Math.floor((available - (k - 1) * gap) / k);
                if (sizeK > bestSize) {
                    bestSize = sizeK;
                    bestCols = k;
                }
            }

            // If there are fewer cells than bestCols, shrink columns to number of cells
            if (totalCells > 0) bestCols = Math.min(bestCols, totalCells);

            // --- NEW: limit columns using available vertical space so cells wrap into more rows
            // Desired minimum cell height we want to preserve when wrapping
            const desiredMinRow = config && config.intervalType === 'phases' ? 120 : 80;
            const reservedForControls = 120; // same reserve used below
            const availableHeight = Math.max(200, (scrollRef.current.clientHeight || gridHeight) - reservedForControls);
            // Calculate the maximum number of rows that can comfortably fit at desiredMinRow height
            const maxComfortRows = Math.max(1, Math.floor((availableHeight + gap) / (desiredMinRow + gap)));
            // If we can show more than one row, prefer fewer columns so items wrap vertically instead of creating a single long row
            if (totalCells > 0 && maxComfortRows > 1) {
                const colsForComfort = Math.ceil(totalCells / maxComfortRows);
                // never increase columns beyond bestCols, only reduce when it helps vertical layout
                bestCols = Math.min(bestCols, Math.max(1, colsForComfort));
            }

            // compute a base size from width, then refine to fit vertical constraints as well
            const baseByWidth = Math.max(32, bestSize);

            // Measure padding of the scroll container to get inner available width
            const scStyle = getComputedStyle(scrollRef.current);
            const padLeft = parseFloat(scStyle.paddingLeft || '0') || 0;
            const padRight = parseFloat(scStyle.paddingRight || '0') || 0;
            const innerWidth = Math.max(0, scrollRef.current.clientWidth - padLeft - padRight);

            // Compute columnWidth strictly from inner width and gap
            const colWidth = Math.floor((innerWidth - (bestCols - 1) * gap) / Math.max(1, bestCols));

            // Compute vertical constraint: how tall can each row be without overflowing container height
            const rowsCount = Math.max(1, Math.ceil((totalCells) / Math.max(1, bestCols)));
            const maxByHeight = Math.floor((Math.max(200, (scrollRef.current.clientHeight || gridHeight) - (rowsCount - 1) * gap)) / rowsCount);

            // Final desired cell size is the maximum that fits both width and height constraints
            const finalCell = Math.max(32, Math.min(colWidth, maxByHeight));

            setColumns(bestCols);
            setCellSize(finalCell);
            // also store the computed columnWidth separately to pass to react-window
            setColumnWidth(finalCell);
            setGridWidth(innerWidth);
            setGridHeight(Math.max(200, scrollRef.current.clientHeight || gridHeight));

            // compute a robust min cell width depending on mode and zoom
            // allow the 'base min' to shrink when user zooms out so the container doesn't grow
            const rawBaseMin = config && config.intervalType === 'phases' ? 160 : 140;
            const baseMinForMode = Math.max(48, Math.round(rawBaseMin * Math.min(1, zoom)));
            // prefer the computed minCell but never go below a sane floor
            let minCellFinal = Math.max(48, Math.min(baseMinForMode, minCell));

            // Mobile scale: make cells smaller on narrow viewports for better fit
            const isMobileView = (scrollRef.current && scrollRef.current.clientWidth) ? scrollRef.current.clientWidth < 640 : (window.innerWidth < 640);
            const mobileScale = isMobileView ? 0.6 : 1;
            minCellFinal = Math.max(32, Math.round(minCellFinal * mobileScale));

            // Ensure we prefer fewer columns if that increases the cell size (avoid many tiny cells)
            // If computed size is smaller than desired base, attempt to reduce columns until acceptable or reach minColumns
            if (finalCell < baseMinForMode * mobileScale) {
                let k = bestCols;
                while (k > minColumns) {
                    k--;
                    const sizeK = Math.floor((available - (k - 1) * gap) / k);
                    if (sizeK >= baseMinForMode * mobileScale) {
                        bestCols = k;
                        minCellFinal = Math.max(Math.round(baseMinForMode * mobileScale), sizeK);
                        break;
                    }
                }
            }

            // publish CSS variables used by the grid (auto-fit minmax)
            scrollRef.current.style.setProperty('--min-cell', `${Math.round(minCellFinal)}px`);
            scrollRef.current.style.setProperty('--computed-cell', `${finalCell}px`);
            // Also set on the grid element itself to ensure CSS fallback works even if outer styles are overridden
            if (gridRef.current) {
                gridRef.current.style.setProperty('--min-cell', `${Math.round(minCellFinal)}px`);
                gridRef.current.style.setProperty('--computed-cell', `${finalCell}px`);
            }
            // ensure a minimum rows height (visible rows) but make it adaptive to available rows and zoom
            const minRows = Math.max(3, Math.min(5, rowsCount));
            const minRowsHeight = (minCellFinal * minRows) + (minRows - 1) * gap;
            // Clamp the computed minRowsHeight to avoid extreme growth on zoom-out; reduce max viewport fraction
            const clamped = Math.max(200, Math.min(minRowsHeight, Math.round(window.innerHeight * 0.6)));
            scrollRef.current.style.setProperty('--min-rows-height', `${clamped}px`);
            // Do NOT set scrollRef.current.style.minHeight directly (letting CSS handle the cap/prevent layout forcing)


            // ensure no horizontal scroll on wrapper and protect parents
            scrollRef.current.style.overflowX = 'hidden';
            scrollRef.current.style.boxSizing = 'border-box';
            scrollRef.current.style.maxWidth = '100%';
            if (scrollRef.current.parentElement) {
                const p = scrollRef.current.parentElement;
                p.style.overflowX = 'hidden';
                p.style.boxSizing = 'border-box';
                p.style.minWidth = '0';
            }

            // Publish measured grid width/height for react-window
            setGridWidth(scrollRef.current.clientWidth);
            // reserve space for zoom controls + labels + info box (approx 120px)
            const reserved = 120 + ((config.intervalType === 'days' || config.intervalType === 'dates') ? 28 : 0);
            setGridHeight(Math.max(200, scrollRef.current.clientHeight - reserved));
        });

        ro.observe(scrollRef.current);
        window.addEventListener('resize', () => ro.takeRecords());

        // initial trigger
        ro.observe(scrollRef.current);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', () => ro.takeRecords());
        };
    }, [config, zoom, cellIndices]);

    const debugMode = typeof window !== 'undefined' && window.location.search.includes('pipeline-debug=1');

    // Largeur minimale de colonne du rendu figé. Dérivée du CONTENU (une case porte-t-elle un nom
    // de phase ?) et non d'un drapeau de config : `config.intervalType === 'phases'` est
    // précisément le test qui n'a jamais été vrai (cf. le prop `cellsMeta`).
    const hasPhaseCells = Array.isArray(cellsMeta) && cellsMeta.some((c) => c && c.phase);
    const staticMinCellPx = hasPhaseCells ? STATIC_PHASE_CELL_MIN_PX : STATIC_CELL_MIN_PX;


    // Description de la case telle que l'éditeur l'a calculée, quand l'appelant nous la fournit.
    const getCellMeta = (index) => (Array.isArray(cellsMeta) ? cellsMeta[index] : null) || null;

    // Obtenir le label d'une case selon la configuration
    const getCellLabel = (index) => {
        // Le libellé du GÉNÉRATEUR COMMUN prime toujours : c'est celui que le formulaire affiche.
        // Le calcul local ci-dessous n'est plus qu'un repli pour les appelants qui ne passent pas
        // `cellsMeta` (cf. le commentaire du prop).
        const meta = getCellMeta(index);
        if (meta && meta.label) return meta.label;

        if (config.intervalType === 'phases') {
            const phase = config.customPhases?.[index] || (CULTURE_PHASES && CULTURE_PHASES.phases ? CULTURE_PHASES.phases[index] : CULTURE_PHASES?.[index]);
            return (phase && (phase.name || phase.label)) || `Phase ${index + 1}`;
        }

        if (config.intervalType === 'dates' && config.startDate) {
            const start = new Date(config.startDate);
            const cellDate = new Date(start);
            cellDate.setDate(cellDate.getDate() + index);
            return `J+${index}`;
        }

        if (config.intervalType === 'weeks') {
            return `S${index + 1}`;
        }

        if (config.intervalType === 'months' || config.intervalType === 'mois') {
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            const startIdx = (config && config.startMonth && Number(config.startMonth) >= 1 && Number(config.startMonth) <= 12) ? (Number(config.startMonth) - 1) : 0;
            return months[(startIdx + index) % 12] || `M${index + 1}`;
        }

        return `${index + 1}`;
    };

    // Obtenir l'icône d'une phase
    const getPhaseIcon = (index) => {
        // `generatePipelineCells()` pose déjà l'emoji de la phase sur la case (`emoji`) — même
        // source que le formulaire. On le lit avant de retomber sur le calcul local, qui supposait
        // en plus que TOUT pipeline à phases soit une culture.
        const meta = getCellMeta(index);
        if (meta && (meta.emoji || meta.phase?.emoji || meta.phase?.icon)) {
            return meta.emoji || meta.phase.emoji || meta.phase.icon;
        }
        if (config.intervalType === 'phases') {
            const phase = config.customPhases?.[index] || (CULTURE_PHASES && CULTURE_PHASES.phases ? CULTURE_PHASES.phases[index] : CULTURE_PHASES?.[index]);
            return (phase && (phase.icon || phase.emoji)) || '📍';
        }
        return null;
    };

    /**
     * Info SECONDAIRE d'une case — durée de phase, date ou numéro de semaine.
     *
     * Reprise à l'identique de l'éditeur (`PipelineDragDropView.jsx` : `cell.date || cell.week ||
     * (cell.phase ? '(Nj)' : '')`), sur les mêmes champs, produits par le même générateur. C'est ce
     * qui fait dire « Début Floraison / (21j) » là où l'export ne montrait qu'un numéro.
     */
    const getCellSubLabel = (index) => {
        const meta = getCellMeta(index);
        if (!meta) return '';
        if (meta.date) return String(meta.date);
        if (meta.week) return String(meta.week);
        if (meta.phase) return `(${meta.duration || 7}j)`;
        return '';
    };

    /**
     * Mesures réellement renseignées sur une case, sous forme `[{ key, label, value }]`.
     *
     * Avec `pipelineType`, c'est `summarizeCellFields()` qui répond — le lecteur de cellule déjà
     * utilisé par le canevas Chaîne de production et par les templates d'export, qui résout
     * libellés et unités depuis les `*SidebarContent.js` (les configs du formulaire). Sans lui, on
     * balaye les clés en écartant les métadonnées connues.
     */
    const getCellFieldList = (cellData) => {
        if (!cellData) return [];
        if (pipelineType) return summarizeCellFields(pipelineType, cellData);

        // Ancien format : les données étaient une liste `contents` d'items déjà décrits.
        if (Array.isArray(cellData.contents)) {
            return cellData.contents.map((c, i) => ({
                key: c.key || c.type || `content-${i}`,
                label: c.label || c.type || c.key || '',
                value: c.value != null ? String(c.value) : '',
                icon: c.icon,
            }));
        }

        return Object.keys(cellData)
            .filter((k) => !FALLBACK_META_KEYS.includes(k)
                && cellData[k] !== null && cellData[k] !== undefined && cellData[k] !== '')
            .map((k) => ({ key: k, label: k, value: String(cellData[k]) }));
    };

    /**
     * Intensité de couleur d'une case (0-4).
     *
     * Formule de l'éditeur reprise telle quelle : `floor(min(nbDonnées / 10, 1) * 4)`. Elle
     * différait ici (paliers 2/4/6), si bien qu'une même case ne portait pas la même couleur dans
     * le formulaire et dans l'export.
     */
    const getCellIntensity = (cellData) => {
        const count = getCellFieldList(cellData).length;
        if (count === 0) return 0;
        return Math.floor(Math.min(count / 10, 1) * 4);
    };

    // ÉCHELLE DE REMPLISSAGE de l'éditeur (`PipelineDragDropView.jsx` : `bg-green-500/10` →
    // `/50`), mais FIGÉE EN COULEURS OPAQUES — c'est-à-dire ces mêmes teintes déjà composées sur le
    // fond sombre du panneau d'édition. Le rendu est donc identique à celui du formulaire là où le
    // formulaire existe, et il ne CHANGE PLUS selon la surface qui l'accueille.
    //
    // Pourquoi opaque et pas translucide. Une case à 10 % d'alpha laisse passer le fond de la page,
    // et la Fiche Technique bascule en mode PAPIER sur le format A4 (fond crème). Mesuré sur un
    // export A4 réel : les libellés blancs y tombaient à 2,09:1 sur un fond composé à
    // rgb(164,184,179) — 39 violations E1, et à l'œil des « J1 » quasi invisibles sur une bande
    // pâle. Une couleur opaque rend le contraste déterministe : le blanc y tient de 16:1 (palier
    // bas) à 6,5:1 (palier haut), quels que soient la palette et le ratio.
    // Échelle CLAIRE, pendant exact de l'échelle sombre : cinq paliers de la même progression de
    // remplissage, en aplats opaques posés pour une page crème. L'encre passe en slate-900, qui y
    // tient de 17:1 (palier bas) à 11:1 (palier haut) — l'inverse exact de l'échelle sombre.
    const PAPER_SURFACES = [
        'rgb(236, 250, 241)', 'rgb(214, 242, 226)', 'rgb(187, 232, 209)', 'rgb(158, 220, 190)', 'rgb(129, 207, 171)',
    ];
    const PAPER_EMPTY_SURFACE = 'rgb(241, 245, 249)';
    // Bordures plus soutenues qu'en sombre : un vert à 40 % d'opacité disparaît sur un aplat clair.
    const PAPER_BORDERS = [
        'border-green-700/30', 'border-green-700/40', 'border-green-700/50',
        'border-green-700/60', 'border-green-700/70',
    ];

    const EDITOR_SURFACES = [
        'rgb(18, 37, 30)', 'rgb(20, 55, 37)', 'rgb(21, 72, 44)', 'rgb(23, 90, 51)', 'rgb(25, 108, 59)',
    ];
    const EDITOR_EMPTY_SURFACE = 'rgb(28, 31, 35)';
    // Les BORDURES restent translucides : elles ne portent pas de texte, donc aucune règle de
    // contraste ne s'y applique, et elles gardent la finesse de l'éditeur.
    const EDITOR_BORDERS = [
        'border-green-500/40', 'border-green-500/50', 'border-green-500/60',
        'border-green-500/70', 'border-green-500/80',
    ];

    const clampIntensity = (i) => Math.max(0, Math.min(EDITOR_SURFACES.length - 1, i));

    // Obtenir la couleur selon l'intensité
    const getIntensityColor = (intensity, isSelected, isHovered, isDragOver, hasData) => {
        if (isSelected) return '  ring-2 ';
        if (isDragOver) return 'bg-green-500/30 border-green-400 ring-2 ring-green-400';
        if (isHovered) return 'bg-gray-600 border-gray-400 ring-2 ring-gray-400';
        if (!hasData) return paper ? 'border-slate-300' : 'border-white/20';
        return (paper ? PAPER_BORDERS : EDITOR_BORDERS)[clampIntensity(intensity)];
    };

    /** Fond opaque de la case, ou `undefined` quand un état (survol, sélection) impose le sien. */
    const getIntensitySurface = (intensity, isSelected, isHovered, isDragOver, hasData) => {
        if (isSelected || isHovered || isDragOver) return undefined;
        if (paper) return hasData ? PAPER_SURFACES[clampIntensity(intensity)] : PAPER_EMPTY_SURFACE;
        return hasData ? EDITOR_SURFACES[clampIntensity(intensity)] : EDITOR_EMPTY_SURFACE;
    };

    // Couleur du TEXTE de la case.
    //
    // La bascule vers une encre sombre aux intensités hautes (ajoutée le 2026-08-06 : 64 textes
    // blancs à 3,5:1) répondait à l'ancienne palette, dont les deux derniers paliers étaient des
    // aplats de vert CLAIR (`bg-green-500/80`, `bg-green-400`). Aucun palier de l'échelle
    // ci-dessus n'atteint ce vert-là — le plus fort, rgb(25,108,59), laisse le blanc à 6,5:1. La
    // condition n'a donc plus d'objet, et la conserver produirait l'erreur symétrique : de l'encre
    // sombre sur un fond sombre.
    // L'encre suit la SURFACE RÉELLEMENT SOUS LE TEXTE, pas seulement le mode.
    //
    // En mode papier les aplats sont clairs, donc l'encre est sombre. Sauf sur une case portant une
    // PHOTO : son fond est alors l'image sous un voile sombre (cf. `mediaBackground`), et l'encre
    // sombre y devient illisible — constaté sur un export A4 réel dès la première passe papier.
    // La photo impose donc sa propre règle, dans les deux modes.
    const getIntensityTextClass = (aUnePhoto) => ((paper && !aUnePhoto) ? 'text-slate-900' : 'text-white');

    /** L'étape ne porte-t-elle QUE de la vidéo (aucune photo utilisable en fond) ? */
    //
    // `isVideoMedia` et non `m.type !== 'video'` : le champ `type` n'existe QUE sur un upload encore
    // en mémoire (cf. `usePhotoUpload.js`). Une entrée rechargée depuis la base n'a que son `url` —
    // une vidéo y passait donc pour une photo, partait en `background-image` d'un `.mp4` (fond
    // vide), et ne recevait même pas le repère ▶ puisque `videoSeule` la comptait comme photo.
    // Autrement dit : une vidéo d'étape était visible jusqu'au premier rechargement de page, puis
    // plus jamais. `mediaFileHelpers.js` est la source unique qui règle exactement ce cas.
    const videoSeule = (index) => {
        const media = Array.isArray(cellsMedia[index]) ? cellsMedia[index] : [];
        if (media.length === 0) return false;
        return !media.some((m) => m && m.url && !isVideoMedia(m));
    };

    /** Fond photo d'une case, voile de lisibilité compris. `{}` si l'étape n'a pas de média. */
    const mediaBackground = (index) => {
        const media = Array.isArray(cellsMedia[index]) ? cellsMedia[index] : [];
        // Les vidéos ne sont pas des fonds : une balise `<video>` ne se met pas en
        // `background-image`, et un export est de toute façon une image fixe.
        const premiere = media.find((m) => m && m.url && !isVideoMedia(m));
        // Une étape qui ne porte QUE de la vidéo n'avait, elle, strictement aucun signe distinctif :
        // rien ne disait qu'un média y était attaché, ni à l'écran ni dans le fichier exporté. Elle
        // reçoit donc le même fond sombre que les cases à photo — ce qui garde aussi l'encre blanche
        // de `getIntensityTextClass` cohérente — et le repère ▶ posé dans `renderCell`.
        if (!premiere) return videoSeule(index) ? { backgroundColor: 'rgb(9, 14, 21)' } : {};
        return {
            // Couleur de fond SOMBRE en plus de l'image, pour deux raisons qui vont ensemble :
            //   • si l'image ne charge pas (URL périmée, capture hors ligne), la case reste sombre
            //     et son libellé blanc lisible, au lieu de virer au blanc sur vert clair ;
            //   • l'auditeur de contraste ne lit que `background-color` — il ne peut pas savoir
            //     qu'une image et un voile passent par-dessus. Mesuré : sans cette couleur, il
            //     relevait 1,35:1 sur la case à photo du mode papier, à juste titre.
            // Le fond déclaré dit donc la vérité de ce qui est SOUS le texte.
            backgroundColor: 'rgb(9, 14, 21)',
            backgroundImage: `linear-gradient(rgba(2, 6, 12, 0.62), rgba(2, 6, 12, 0.80)), url("${String(premiere.url).replace(/"/g, '\\"')}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
        };
    };

    // PASTILLES DE MESURE de la case — les 🌡️ 💧 ⚡ du formulaire.
    //
    // Table d'icônes locale supprimée le 2026-08-06 : c'était la CINQUIÈME de l'app pour la
    // même chose. Elle vit désormais dans `utils/fieldIcons.js`, complétée des clés qui
    // n'existaient qu'ici (morphologie, palissage, substrat, propagation…).
    //
    // `getFieldIcon()` plutôt qu'un accès direct à `FIELD_ICONS` : un champ sans entrée dédiée
    // retombe sur l'icône de son groupe puis sur une puce neutre, au lieu d'être silencieusement
    // omis. L'omission était visible à l'export — une case portant quatre mesures n'en montrait
    // que celles dont la clé figurait nommément dans la table.
    const getMiniIcons = (cellData) => getCellFieldList(cellData)
        .slice(0, MAX_CELL_ICONS)
        .map((f, i) => ({
            key: f.key || `f-${i}`,
            icon: f.icon || getFieldIcon(f.key),
            title: f.value ? `${f.label} : ${f.value}` : f.label,
        }));

    // Handler drag over
    const handleDragOver = (e, cellIndex) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setDragOverCell(cellIndex);
    };

    const handleDragLeave = () => {
        setDragOverCell(null);
    };

    const handleDrop = (e, cellIndex) => {
        e.preventDefault();
        setDragOverCell(null);
        if (onDropOnCell && !readonly) {
            onDropOnCell(cellIndex);
        }
    };

    // Tooltip content
    //
    // La table de libellés qui vivait ici (`temperature: 'Température'`…) était une SIXIÈME copie
    // partielle du vocabulaire des `*SidebarContent.js` : dix entrées pour ~85 champs de culture,
    // donc l'immense majorité des mesures s'affichait sous sa clé brute. `getCellFieldList()`
    // délègue à `summarizeCellFields()`, qui résout les libellés depuis ces mêmes configs.
    const getTooltipContent = (cellIndex, cellData) => {
        const label = getCellLabel(cellIndex);
        const fields = getCellFieldList(cellData);

        if (fields.length === 0) {
            return readonly || staticRender
                ? `${label} — aucune donnée`
                : `${label} - Vide\nClic pour ajouter des données`;
        }

        const summary = fields.slice(0, 5).map((f) => f.label).join(', ');
        const more = fields.length > 5 ? `... +${fields.length - 5}` : '';
        const action = readonly || staticRender ? '' : '\nClic pour voir le détail';
        return `${label} - ${fields.length} donnée(s)\n${summary}${more}${action}`;
    };

    // Layout de la grille selon le type d'intervalle
    const gridLayout = () => {
        // Phases: larger square tiles that wrap
        if (config.intervalType === 'phases') {
            return 'grid grid-cols-[repeat(auto-fill,minmax(5rem,1fr))] gap-2 auto-rows-[minmax(5rem,auto)]';
        }

        // Weeks / Days / Dates: medium tiles that wrap responsively
        if (config.intervalType === 'weeks' || config.intervalType === 'days' || config.intervalType === 'dates') {
            return 'grid grid-cols-[repeat(auto-fill,minmax(4rem,1fr))] gap-2 auto-rows-[minmax(4rem,auto)]';
        }

        // Other modes: compact tiles
        return 'grid grid-cols-[repeat(auto-fill,minmax(3.5rem,1fr))] gap-2 auto-rows-[minmax(3.5rem,auto)]';
    };

    // Rendu d'UNE cellule, partagé par les deux chemins d'affichage (grille virtualisée en
    // édition, grille CSS complète en export). Extrait le 2026-08-06 : sans ce partage, la
    // grille de l'export serait une imitation de celle des formulaires — c'est justement ce
    // qu'il fallait supprimer.
    const renderCell = (cellIndex, style) => {
                        const cellData = cells[cellIndex];
        const intensity = getCellIntensity(cellData);
        const isSelected = selectedCells.includes(cellIndex);
        const isHovered = hoveredCell === cellIndex;
        const isDragOver = dragOverCell === cellIndex && draggedContent;
        const miniIcons = getMiniIcons(cellData);
        const phaseIcon = getPhaseIcon(cellIndex);
        const fieldCount = getCellFieldList(cellData).length;
        const hasData = fieldCount > 0;
        const subLabel = getCellSubLabel(cellIndex);
        const textClass = getIntensityTextClass((cellsMedia[cellIndex]?.length || 0) > 0);
        const porteUneVideo = (cellsMedia[cellIndex] || []).some((m) => m && isVideoMedia(m));

        return (
            <div style={{ ...style, padding: 4 }} key={cellIndex}>
                <motion.div
                    data-testid={`pipeline-cell-${cellIndex}`}
                    // Une cellule gère elle-même son clic (détail de l'étape) : elle est donc
                    // exclue du zoom au bloc, qui s'applique partout ailleurs dans le rendu.
                    // Arbitrage acté : la cible la plus spécifique l'emporte.
                    data-zoom-skip=""
                    whileHover={{ scale: config.intervalType === 'phases' ? 1.05 : 1.12, zIndex: 10 }}
                    whileTap={{ scale: 0.98 }}
                    onPointerDown={(e) => {
                        // pointerdown is more reliable than click for detecting modifier keys
                        if ((e.ctrlKey || e.metaKey) && e.button === 0) {
                            e.preventDefault();
                            const newSelection = isSelected
                                ? selectedCells.filter(i => i !== cellIndex)
                                : [...selectedCells, cellIndex];
                            onCellClick(cellIndex, { multi: true, selected: newSelection });
                        }
                    }}
                    onClick={(e) => {
                        // keep existing click behaviour (open modal / single select)
                        if (e.ctrlKey || e.metaKey) {
                            const newSelection = isSelected
                                ? selectedCells.filter(i => i !== cellIndex)
                                : [...selectedCells, cellIndex];
                            onCellClick(cellIndex, { multi: true, selected: newSelection });
                        } else {
                            onCellClick(cellIndex);
                        }
                    }}
                    onMouseEnter={() => setHoveredCell(cellIndex)}
                    onMouseLeave={() => setHoveredCell(null)}
                    onDragOver={(e) => handleDragOver(e, cellIndex)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, cellIndex)}
                    title={getTooltipContent(cellIndex, cellData)}
                    // `contain: layout size paint` (feuille `.pipeline-cell`) neutralisé en rendu
                    // FIGÉ. La containment de TAILLE dimensionne la case « comme si elle n'avait
                    // aucun contenu » : elle retombe alors sur `min-height: var(--min-cell, 96px)`
                    // — et `--min-cell` n'est jamais publiée en rendu figé, puisque c'est le
                    // ResizeObserver qui l'écrit et qu'il est court-circuité ici. Combinée à
                    // l'`overflow: hidden` de la même règle, toute ligne au-delà de ces 96px est
                    // découpée sans aucun signal. Inoffensif tant que la case n'affichait qu'un
                    // numéro ; fatal dès qu'elle porte un nom de phase sur deux lignes. En édition
                    // la containment reste en place : elle y sert la fluidité du défilement
                    // virtualisé, où les cases ont de toute façon une hauteur imposée.
                    // `minHeight: 0` neutralise le plancher de 96px de la même règle : la hauteur
                    // du rendu figé est déjà donnée par le conteneur de case (`STATIC_CELL_MIN_PX`),
                    // et la laisser en double faisait une carte de 96px pour ~50px de contenu.
                    // `height: 100%` est conservé pour que toutes les cases d'une même rangée
                    // s'alignent sur la plus haute, plutôt que de flotter à leur hauteur propre.
                    style={{
                        width: '100%', height: '100%',
                        backgroundColor: getIntensitySurface(intensity, isSelected, isHovered, isDragOver, hasData),
                        // PHOTO D'ÉTAPE. Une image attachée à une cellule n'apparaissait dans AUCUN
                        // export : mesuré le 2026-08-13, 39 cases rendues, 0 portant son média —
                        // alors que le formulaire propose de l'attacher et que l'éditeur l'affiche
                        // en fond (`PipelineCellMediaPreview`). Une donnée réelle qui n'existe que
                        // dans le formulaire contredit le contrat de ce chantier : rien ne doit
                        // n'exister qu'à l'écran.
                        //
                        // Rendue en FOND plutôt qu'en nœud ajouté : pas de nouvel élément à empiler
                        // (un enfant positionné passerait au-dessus du libellé), pas de hauteur en
                        // plus, donc aucun effet sur la pagination déjà mesurée. Le voile sombre
                        // fait partie de la même pile de fonds : il s'applique forcément PAR-DESSUS
                        // la photo, ce qui garde le libellé (toujours blanc, cf.
                        // `getIntensityTextClass`) au-dessus du seuil de contraste quelle que soit
                        // l'image. Première image seulement : la case fait ~80px, une galerie n'y
                        // serait pas lisible — le détail complet reste dans la modale de cellule.
                        ...mediaBackground(cellIndex),
                        ...(staticRender ? { contain: 'layout paint', minHeight: 0 } : {}),
                    }}
                    // `opacity-75` retiré du mode lecture seule. Il ne signalait rien — le rendu est
                    // ENTIÈREMENT en lecture seule, il n'y a donc aucune case « active » à côté de
                    // laquelle se démarquer — et il délavait uniformément le libellé et les
                    // pastilles. Il échappait en prime à la règle de contraste : `effectiveBackground`
                    // empile les fonds translucides mais ne connaît pas l'`opacity` d'un ancêtre, si
                    // bien que la perte de lisibilité qu'il causait n'était mesurée nulle part.
                    // `border-2` comme le formulaire (`PipelineDragDropView` : `rounded-lg border-2`) : la
                    // grille de l'export s'en tenait à 1px, et à taille de case égale ce seul trait
                    // suffit à faire lire deux composants différents là où il n'y en a qu'un.
                    className={`pipeline-cell relative ${interactiveCells ? 'cursor-pointer' : ''} flex flex-col items-start justify-between rounded-lg border-2 transition-all duration-200 box-border ${getIntensityColor(intensity, isSelected, isHovered, isDragOver, hasData)} ${!readonly ? 'hover:shadow-lg hover:shadow-blue-400/50' : ''}`}
                >
                    {/* Compteur de médias — l'éditeur le pose dès qu'une étape en porte plusieurs.
                        Le fond de case n'en montre qu'UN : sans ce badge, rien ne dit que l'étape
                        en compte d'autres, et l'information n'existerait que dans le formulaire. */}
                    {(cellsMedia[cellIndex]?.length || 0) > 1 && (
                        <span
                            className="absolute -top-1.5 -left-1.5 z-20 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white shadow-lg"
                            style={{ background: 'rgb(124, 58, 237)', border: '1px solid rgba(10,10,18,0.9)' }}
                        >
                            {cellsMedia[cellIndex].length}
                        </span>
                    )}
                    {/* Repère VIDÉO. Une balise `<video>` n'est pas peinte par la rasterisation
                        (`html-to-image`) : elle ressortirait en rectangle vide dans le PNG. Un
                        glyphe est, lui, du texte — il survit à la capture et dit ce que le fichier
                        ne peut pas montrer. Le film lui-même se regarde dans la modale d'étape. */}
                    {porteUneVideo && (
                        <span
                            className="absolute bottom-0.5 right-0.5 z-20 px-1 rounded text-[9px] leading-[1.4] font-bold text-white"
                            style={{ background: 'rgba(2,6,12,0.72)', border: '1px solid rgba(255,255,255,0.18)' }}
                            title="Vidéo attachée à cette étape"
                        >
                            ▶
                        </span>
                    )}
                    {/* CARTE DE PHASE — même contenu, dans le même ordre, que la case de l'éditeur
                        (`PipelineDragDropView.jsx`) : emoji de phase, nom, information secondaire,
                        puis les pastilles des mesures documentées et leur compteur « +N ».
                        L'export n'en montrait aucun de ces éléments : un numéro d'ordre et deux ou
                        trois icônes dans un carré vert, d'où « les pipelines ne sont pas avec la
                        même UI graphique que dans les forms ».

                        `truncate` retiré du libellé : « Début Floraison » ne tient pas sur une
                        ligne dans une case de ~85px, et couper un nom de phase est exactement la
                        dégradation que ce projet a déjà retirée deux fois sur demande explicite
                        (badges à 3-6 caractères, mode compact sans texte). La case grandit, le nom
                        reste entier — et le retour à la ligne évite au passage la règle E3
                        (troncature silencieuse), qu'un `truncate` sur un vrai nom déclencherait. */}
                    <div className="w-full flex items-start gap-1">
                        {phaseIcon && (
                            <span className="leading-none flex-shrink-0" style={{ fontSize: 14, lineHeight: 1.2 }}>{phaseIcon}</span>
                        )}
                        <div
                            className={`font-semibold ${textClass}`}
                            // `break-word` et non `anywhere` : on ne coupe un mot que s'il ne peut
                            // PAS tenir, au lieu de le couper dès que ça arrange le remplissage.
                            // Avec `anywhere`, « Croissance » se rendait « Crois / sanc / e ».
                            style={{ fontSize: 12, lineHeight: 1.2, overflowWrap: 'break-word' }}
                        >
                            {getCellLabel(cellIndex)}
                        </div>
                    </div>

                    {/* Information secondaire : durée de phase « (21j) », date, ou n° de semaine.
                        Rendue seulement si elle existe — une trame en jours n'en a pas, et une
                        ligne vide ne ferait que grandir la case pour rien. */}
                    {subLabel && (
                        <div className={`${textClass}`} style={{ fontSize: 12, lineHeight: 1.2, opacity: 0.75 }}>
                            {subLabel}
                        </div>
                    )}

                    {/* Pastilles de mesure + compteur. Les emoji sont des pictogrammes, pas du
                        texte : ils échappent au plancher de 12px (règle E2, qui exclut le contenu
                        purement pictographique). Le « +N », lui, est du texte — il est donc à 12px,
                        comme le même badge de la Vue Détaillée. */}
                    <div className="w-full flex items-end justify-between gap-1" style={{ marginTop: 4 }}>
                        {/* Disposition 2×2, reprise de `CellEmojiOverlay.jsx`. Ce n'est pas une
                            préférence esthétique : une rangée horizontale de 4 emoji ne tient pas
                            dans une case étroite, et la laisser se replier rend la hauteur du bloc
                            dépendante du calcul de retour à la ligne. Or ce calcul DIFFÈRE entre le
                            DOM et la rasterisation `html-to-image` — mesuré : la case annonçait
                            `scrollHeight === clientHeight` (donc aucun débordement) alors que le PNG
                            téléchargé montrait la 4e pastille coupée en deux. Une grille 2×2 a une
                            hauteur déterministe, quelle que soit la largeur disponible. */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, max-content)', gap: 4 }}>
                            {miniIcons.map((m) => (
                                <span key={m.key} title={m.title} style={{ fontSize: 14, lineHeight: 1 }}>{m.icon}</span>
                            ))}
                        </div>
                        {fieldCount > MAX_CELL_ICONS && (
                            <span
                                className="flex-shrink-0"
                                title={`${fieldCount - MAX_CELL_ICONS} mesure(s) supplémentaire(s)`}
                                style={{
                                    fontSize: 12, fontWeight: 700, color: '#fff', lineHeight: 1,
                                    background: 'rgba(194,65,12,0.98)', borderRadius: 999,
                                    padding: '2px 4px',
                                }}
                            >
                                +{fieldCount - MAX_CELL_ICONS}
                            </span>
                        )}
                        {isSelected && (
                            <div className="w-3 h-3 rounded-full border-2 border-white flex-shrink-0"></div>
                        )}
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        // Rendu figé : AUCUN défilement. Le conteneur d'édition est une zone qui scrolle dans une
        // hauteur contrainte ; conservé tel quel à l'export, il coupait la grille et rasterisait sa
        // barre de défilement DANS le PNG — vu sur un export réel en 4:3, la seconde rangée de la
        // culture (étapes 15 à 25) tronquée à mi-hauteur, ascenseur compris. Aucune règle d'audit ne
        // pouvait le voir : E4 compare la hauteur de la PAGE, pas celle d'un conteneur interne.
        // En rendu figé le bloc prend sa hauteur naturelle, que la pagination mesure ensuite.
        <div className={`flex-1 p-4 bg-gray-900/30 overscroll-contain ${staticRender ? 'overflow-visible' : 'overflow-y-auto overflow-x-hidden min-h-0'}`} data-testid="pipeline-scroll" ref={scrollRef} style={{ minWidth: 0 }}>
            {/* Zoom controls — masqués en lecture seule : un curseur de zoom n'a pas de sens dans
                un rendu figé, et il serait capturé tel quel dans le PNG exporté. */}
            <div className={`items-center justify-end gap-2 mb-2 ${readonly || staticRender ? 'hidden' : 'flex'}`}>
                <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.1).toFixed(2)))} className="px-2 py-1 bg-white/5 rounded">-</button>
                <input
                    type="range"
                    min="0.5"
                    max="1.6"
                    step="0.05"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-36"
                />
                <button onClick={() => setZoom(z => Math.min(2, +(z + 0.1).toFixed(2)))} className="px-2 py-1 bg-white/5 rounded">+</button>
            </div>

            {/* Grid - controlled via computed columns/cellSize */}
            <div ref={gridRef} data-testid="pipeline-grid-wrapper" className="w-full" style={{ width: '100%', boxSizing: 'border-box' }}>
                {/* Virtualized grid using react-window */}
                {staticRender ? (
                    <div style={{
                        display: 'grid',
                        // Plus de colonnes qu'en édition. Là-bas une case est une CIBLE À CLIQUER,
                        // donc large ; dans un rendu figé elle n'est qu'un repère de lecture. En
                        // gardant les 7 colonnes de l'édition, 25 étapes occupaient quatre grandes
                        // rangées et faisaient passer la Fiche Technique 16:9 de 2 à 5 pages, dont
                        // deux quasi vides. Même apparence, densité adaptée au support.
                        //
                        // Le nombre de colonnes est DÉRIVÉ de la largeur disponible, plus fixé à 14.
                        // Fixé, il ne tenait plus dès que la grille s'est retrouvée dans une colonne
                        // de demi-page (flux à deux colonnes du 2026-08-05) : des cases de ~47px pour
                        // un contenu qui en demande ~78, donc coupées — et comme la feuille de style
                        // pose `overflow-x: hidden !important` sur ce conteneur, CSS en déduit
                        // `overflow-y: auto` et une barre de défilement partait dans le PNG.
                        // `auto-fit` s'adapte seul à la largeur réelle, sans mesure ni constante.
                        // `auto-fill` quand la grille est DÉCOUPÉE en tranches paginables, `auto-fit`
                        // sinon. La différence compte ici : `auto-fit` REPLIE les pistes vides, donc
                        // une tranche de 3 cases dans un conteneur qui en accueille 11 verrait ses 3
                        // cases s'étirer au tiers de la largeur — chaque tranche aurait des cases de
                        // taille différente, et l'ensemble ne se lirait plus comme une grille unique.
                        // `auto-fill` conserve les pistes, donc toutes les tranches partagent la même
                        // trame et une tranche incomplète se termine par un simple vide à droite,
                        // exactement comme la dernière rangée d'une grille ordinaire.
                        gridTemplateColumns: `repeat(${fillMode === 'fill' ? 'auto-fill' : 'auto-fit'}, minmax(${staticMinCellPx}px, 1fr))`,
                    }}>
                        {/* On lit la VALEUR de `cellIndices`, plus sa position. Les appelants
                            historiques passent un tableau identité (`cells.map((_, i) => i)`), donc
                            rien ne change pour eux ; mais une TRANCHE ([12…23], découpage paginable)
                            doit rendre les cases 12 à 23, pas les cases 0 à 11 comme le faisait
                            l'index positionnel. */}
                        {(cellIndices || []).map((cellIndex) => (
                            // `minHeight` plutôt qu'`aspectRatio: 1/1` : une case carrée impose sa
                            // hauteur depuis sa largeur et coupe donc son propre contenu dès que la
                            // colonne se resserre. Le carré reste la forme NOMINALE (la largeur
                            // minimale vaut la hauteur minimale), mais la case peut grandir.
                            <div key={cellIndex} style={{ minHeight: STATIC_CELL_MIN_PX, padding: 2 }}>
                                {renderCell(cellIndex, { position: 'relative', width: '100%', height: '100%', minHeight: STATIC_CELL_MIN_PX - 4 })}
                            </div>
                        ))}
                    </div>
                ) : gridWidth > 0 && gridHeight > 0 ? (
                    <RVGrid
                        columnCount={columns}
                        columnWidth={columnWidthState}
                        height={Math.max(200, gridHeight)}
                        rowCount={Math.ceil((cellIndices && cellIndices.length) / Math.max(1, columns))}
                        rowHeight={columnWidthState}
                        width={gridWidth}
                        itemKey={({ columnIndex, rowIndex }) => rowIndex * columns + columnIndex}
                    >
                        {({ columnIndex, rowIndex, style }) => {
                            const cellIndex = rowIndex * columns + columnIndex;
                            if (cellIndex >= (cellIndices ? cellIndices.length : 0)) return null;
                            return renderCell(cellIndex, style);
                        }}
                    </RVGrid>
                ) : (
                    <div className="w-full h-48 flex items-center justify-center text-sm text-gray-400">Chargement...</div>
                )}

                {/* Bouton + pour ajouter des cases (sous la grille) */}
                {canAddMore && onAddCells && !readonly && (
                    <div className="mt-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => onAddCells(10)}
                            className={`px-3 py-2 rounded-md border-2 border-dashed border-gray-600 transition-all duration-200 bg-white/2 text-gray-200`}
                            title="Ajouter 10 étapes"
                        >
                            <Plus className={'w-5 h-5 inline mr-2'} /> Ajouter 10 étapes
                        </motion.button>
                    </div>
                )}
            </div>

            {debugMode && (
                <div style={{ position: 'absolute', right: 20, top: 80, zIndex: 60, background: 'rgba(0,0,0,0.6)', color: 'white', padding: '6px 8px', borderRadius: 8, fontSize: 12 }}>
                    <div>cols: {columns}</div>
                    <div>cell: {cellSize}px</div>
                    <div>min: {scrollRef.current ? (getComputedStyle(scrollRef.current).getPropertyValue('--min-cell') || 'n/a') : 'n/a'}</div>
                </div>
            )}

            {/* Labels de jours de la semaine (pour mode jours/dates) */}
            {(config.intervalType === 'days' || config.intervalType === 'dates') && (
                <div className="grid grid-cols-7 gap-1 mt-2 text-xs text-gray-400 text-center">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
                        <div key={idx}>{day}</div>
                    ))}
                </div>
            )}

            {/* Aide à la SAISIE — même raison que les contrôles de zoom ci-dessus : « Maintenez
                Ctrl/Cmd et cliquez » n'a aucun sens dans un document figé, et partait tel quel dans
                le PNG/PDF exporté. Resté invisible tant que la grille elle-même ne se rendait pas
                sur les pages paginées (bug du filtre de pipeline, corrigé le 2026-08-06) ; apparu
                à la mesure dès que le contenu est revenu. */}
            {!(readonly || staticRender) && (
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-400">
                    <p>💡 <strong>Astuce</strong>: Maintenez Ctrl/Cmd et cliquez pour sélectionner plusieurs cases</p>
                    <p className="mt-1">🎨 La couleur indique la densité de données: gris = vide, vert clair → vert foncé = peu → beaucoup</p>
                </div>
            )}
        </div>
    );
};

export default PipelineGridView;


