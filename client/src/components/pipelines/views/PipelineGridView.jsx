import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Grid as RVGrid } from 'react-window';
import { CULTURE_PHASES } from '../../../config/pipelinePhases';
import './PipelineGridView.css';
import { getFieldIcon, FIELD_ICONS } from '../../../utils/fieldIcons';

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
    // 'fit' (défaut, inchangé) ou 'fill' quand la grille est rendue en TRANCHES successives qui
    // doivent partager la même trame — cf. le commentaire sur `gridTemplateColumns`.
    fillMode = 'fit'
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


    // Obtenir le label d'une case selon la configuration
    const getCellLabel = (index) => {
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
        if (config.intervalType === 'phases') {
            const phase = config.customPhases?.[index] || (CULTURE_PHASES && CULTURE_PHASES.phases ? CULTURE_PHASES.phases[index] : CULTURE_PHASES?.[index]);
            return (phase && (phase.icon || phase.emoji)) || '📍';
        }
        return null;
    };

    // Calculer l'intensité/densité de données d'une case (0-4)
    const getCellIntensity = (cellData) => {
        if (!cellData) return 0;

        // Compter les données significatives (exclure timestamp, _meta)
        let count = 0;

        // Si ancien format avec contents
        if (cellData.contents && Array.isArray(cellData.contents)) {
            count = cellData.contents.length;
        }
        // Sinon, compter les propriétés non vides
        else {
            for (const key in cellData) {
                if (key !== 'timestamp' && key !== '_meta' && cellData[key]) {
                    count++;
                }
            }
        }

        if (count === 0) return 0;
        if (count <= 2) return 1;
        if (count <= 4) return 2;
        if (count <= 6) return 3;
        return 4;
    };

    // Obtenir la couleur selon l'intensité
    const getIntensityColor = (intensity, isSelected, isHovered, isDragOver) => {
        if (isSelected) return '  ring-2 ';
        if (isDragOver) return 'bg-green-500/30 border-green-400 ring-2 ring-green-400';
        if (isHovered) return 'bg-gray-600 border-gray-400 ring-2 ring-gray-400';

        if (intensity === 0) return 'bg-gray-800/30 border-gray-700/30';
        if (intensity === 1) return 'bg-green-900/40 border-green-700/50';
        if (intensity === 2) return 'bg-green-700/60 border-green-500/70';
        if (intensity === 3) return 'bg-green-500/80 border-green-400/90';
        return 'bg-green-400 border-green-300';
    };

    // Couleur du TEXTE de la case, dérivée de la même échelle d'intensité que son fond.
    // Aux intensités hautes le fond devient un vert clair (green-500/80, green-400) sur lequel du
    // texte blanc tombe à 3,5:1 — mesuré le 2026-08-06, 64 occurrences sur une seule fiche exportée.
    // Le seuil est à 3 parce que c'est là que le fond bascule du vert sombre au vert vif :
    // en dessous (green-900/40, green-700/60), c'est le blanc qui est lisible et l'encre sombre qui
    // ne le serait pas. Dérivé de `intensity` et non écrit case par case, pour que fond et texte ne
    // puissent pas diverger.
    const getIntensityTextClass = (intensity, isSelected, isHovered, isDragOver) => (
        (!isSelected && !isHovered && !isDragOver && intensity >= 3) ? 'text-gray-900' : 'text-white'
    );

    // Mini-icônes résumées dans la case
    const getMiniIcons = (cellData) => {
        if (!cellData) return [];

        // Nouveau format: cellData contient directement les données (temperature, humidity, etc.)
        // Ancien format: cellData.contents = [{type, label, value}]

        // Table d'icônes locale supprimée le 2026-08-06 : c'était la CINQUIÈME de l'app pour la
        // même chose. Elle vit désormais dans `utils/fieldIcons.js`, complétée des clés qui
        // n'existaient qu'ici (morphologie, palissage, substrat, propagation…).

        const icons = [];

        // Si ancien format avec contents
        if (cellData.contents && Array.isArray(cellData.contents)) {
            cellData.contents.slice(0, 3).forEach(c => {
                const icon = c.icon || FIELD_ICONS[c.type] || FIELD_ICONS[c.key] || '📍';
                icons.push(icon);
            });
        }
        // Sinon, scanner les propriétés
        else {
            for (const key in cellData) {
                if (key === 'timestamp' || key === '_meta' || !cellData[key]) continue;
                const icon = FIELD_ICONS[key];
                if (icon && icons.length < 3) {
                    icons.push(icon);
                }
            }
        }

        return icons;
    };

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
    const getTooltipContent = (cellIndex, cellData) => {
        const label = getCellLabel(cellIndex);

        if (!cellData) {
            return `${label} - Vide\nClic pour ajouter des données`;
        }

        // Compter les données
        let dataCount = 0;
        const dataLabels = [];

        // Si ancien format avec contents
        if (cellData.contents && Array.isArray(cellData.contents)) {
            dataCount = cellData.contents.length;
            cellData.contents.slice(0, 5).forEach(c => {
                dataLabels.push(c.label || c.type || c.key);
            });
        }
        // Sinon, lister les propriétés
        else {
            for (const key in cellData) {
                if (key !== 'timestamp' && key !== '_meta' && cellData[key]) {
                    dataCount++;
                    if (dataLabels.length < 5) {
                        const labelMap = {
                            temperature: 'Température',
                            humidity: 'Humidité',
                            co2: 'CO₂',
                            ventilation: 'Ventilation',
                            lightHours: 'Éclairage',
                            containerType: 'Contenant',
                            packaging: 'Emballage',
                            notes: 'Notes',
                            ph: 'pH',
                            curingType: 'Type de curing'
                        };
                        dataLabels.push(labelMap[key] || key);
                    }
                }
            }
        }

        if (dataCount === 0) {
            return `${label} - Vide\nClic pour ajouter`;
        }

        const summary = dataLabels.join(', ');
        const more = dataCount > 5 ? `... +${dataCount - 5}` : '';
        return `${label} - ${dataCount} donnée(s)\n${summary}${more}\nClic pour voir le détail`;
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

        return (
            <div style={{ ...style, padding: 4 }} key={cellIndex}>
                <motion.div
                    data-testid={`pipeline-cell-${cellIndex}`}
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
                    style={{ width: '100%', height: '100%' }}
                    className={`pipeline-cell relative cursor-pointer flex flex-col items-start justify-between rounded-sm border transition-all duration-200 box-border ${getIntensityColor(intensity, isSelected, isHovered, isDragOver)} ${!readonly ? 'hover:shadow-lg hover:shadow-blue-400/50' : 'opacity-75'}`}
                >
                    {/* Top: label / phase.
                        `max-w-[75%]` retiré : il réservait de la place à un voisin qui n'affiche
                        rien (le `div` de métadonnées ci-dessous est vide depuis toujours). Sur les
                        petites cases — mesuré sur le format 4:3 — cette réserve coupait les
                        libellés à deux chiffres : « 12 » s'exportait « 1 », 18 cases atteintes sur
                        une seule fiche. Un libellé qui MENT est pire qu'un libellé absent. */}
                    <div className="w-full flex items-start justify-between gap-2">
                        <div className={`text-sm font-semibold truncate ${getIntensityTextClass(intensity, isSelected, isHovered, isDragOver)}`}>{getCellLabel(cellIndex)}</div>
                    </div>

                    {/* Middle: icons / summary */}
                    <div className="w-full flex-1 flex items-start pt-2">
                        <div className="flex gap-1 flex-wrap">
                            {miniIcons.length > 0 ? miniIcons.map((icon, idx) => (
                                <span key={idx} className="text-xs leading-none" style={{ lineHeight: 1 }}>{icon}</span>
                            )) : (
                                <span className="text-xs text-gray-600 opacity-50">&nbsp;</span>
                            )}
                        </div>
                    </div>

                    {/* Bottom: small footer / config indicator */}
                    <div className="w-full flex items-center justify-between pt-2">
                        <div className="text-xs text-gray-400">{cellData && cellData._meta ? cellData._meta.count : ''}</div>
                        {isSelected && (
                            <div className="w-3 h-3 rounded-full border-2 border-white"></div>
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
                        gridTemplateColumns: `repeat(${fillMode === 'fill' ? 'auto-fill' : 'auto-fit'}, minmax(${STATIC_CELL_MIN_PX}px, 1fr))`,
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


