import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { CULTURE_PHASES } from './PipelineWithSidebar';

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
    canAddMore = true
}) => {
    const [hoveredCell, setHoveredCell] = useState(null);
    const [dragOverCell, setDragOverCell] = useState(null);

    // Obtenir le label d'une case selon la configuration
    const getCellLabel = (index) => {
        if (config.intervalType === 'phases') {
            const phase = config.customPhases?.[index] || CULTURE_PHASES[index];
            return phase?.name || `Phase ${index + 1}`;
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

        if (config.intervalType === 'months') {
            const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
            return months[index % 12] || `M${index + 1}`;
        }

        return `${index + 1}`;
    };

    // Obtenir l'icône d'une phase
    const getPhaseIcon = (index) => {
        if (config.intervalType === 'phases') {
            const phase = config.customPhases?.[index] || CULTURE_PHASES[index];
            return phase?.icon || '📍';
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

    // Mini-icônes résumées dans la case
    const getMiniIcons = (cellData) => {
        if (!cellData) return [];

        // Nouveau format: cellData contient directement les données (temperature, humidity, etc.)
        // Ancien format: cellData.contents = [{type, label, value}]

        const iconMap = {
            temperature: '🌡️',
            humidity: '💧',
            co2: '🫧',
            ventilation: '🌀',
            light: '💡',
            lightType: '💡',
            lightHours: '💡',
            irrigation: '💧',
            irrigationType: '💧',
            waterVolume: '💧',
            fertilizer: '🧪',
            fertilizerType: '🧪',
            training: '✂️',
            trainingMethod: '✂️',
            trainingLST: '✂️',
            trainingHST: '✂️',
            morphology: '📏',
            plantHeight: '📏',
            plantVolume: '📊',
            harvest: '⚖️',
            harvestDate: '📅',
            containerType: '📦',
            packaging: '📦',
            curingType: '🌡️',
            notes: '📝',
            ph: '⚗️',
            ec: '⚡',
            propagationMethod: '🌱',
            substrateType: '🏔️',
            substrateVolume: '🏔️',
            potVolume: '🪴',
            lightPower: '⚡',
            lightDistance: '📏',
            fertilizationFrequency: '🧪'
        };

        const icons = [];

        // Si ancien format avec contents
        if (cellData.contents && Array.isArray(cellData.contents)) {
            cellData.contents.slice(0, 3).forEach(c => {
                const icon = c.icon || iconMap[c.type] || iconMap[c.key] || '📍';
                icons.push(icon);
            });
        }
        // Sinon, scanner les propriétés
        else {
            for (const key in cellData) {
                if (key === 'timestamp' || key === '_meta' || !cellData[key]) continue;
                const icon = iconMap[key];
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
        if (config.intervalType === 'phases') {
            // Mode phases: disposition horizontale ou grille 4x3
            return cellIndices.length <= 12 ? 'grid grid-cols-12 gap-2' : 'grid grid-cols-4 gap-2';
        }

        // Mode jours/semaines: style GitHub (7 colonnes = 7 jours de la semaine)
        if (config.intervalType === 'days' || config.intervalType === 'dates') {
            return 'grid grid-cols-7 gap-1';
        }

        // Autres: grille adaptative
        return 'grid gap-1' + (cellIndices.length <= 12 ? ' grid-cols-12' : ' grid-cols-10');
    };

    return (
        <div className="flex-1 p-4 overflow-y-auto bg-gray-900/30">
            <div className={gridLayout()}>
                {cellIndices.map((cellIndex) => {
                    const cellData = cells[cellIndex];
                    const intensity = getCellIntensity(cellData);
                    const isSelected = selectedCells.includes(cellIndex);
                    const isHovered = hoveredCell === cellIndex;
                    const isDragOver = dragOverCell === cellIndex && draggedContent;
                    const miniIcons = getMiniIcons(cellData);
                    const phaseIcon = getPhaseIcon(cellIndex);

                    return (
                        <motion.div
                            key={cellIndex}
                            whileHover={{ scale: config.intervalType === 'phases' ? 1.05 : 1.15, zIndex: 10 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={(e) => {
                                if (e.ctrlKey || e.metaKey) {
                                    // Multi-sélection
                                    const newSelection = isSelected
                                        ? selectedCells.filter(i => i !== cellIndex)
                                        : [...selectedCells, cellIndex];
                                    // Notifier parent via onCellClick avec flag multi
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
                            className={`relative cursor-pointer ${config.intervalType === 'phases' ? 'w-16 h-16 md:w-20 md:h-20' : 'w-3 h-3 md:w-4 md:h-4'} rounded-sm border transition-all duration-200 ${getIntensityColor(intensity, isSelected, isHovered, isDragOver)} ${!readonly ? 'hover:shadow-lg hover:shadow-blue-400/50' : 'opacity-75'}`}
                            title={getTooltipContent(cellIndex, cellData)}
                        >
                            {/* Mode phases: afficher icône de phase + mini-icônes */}
                            {config.intervalType === 'phases' && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <span className="text-2xl">{phaseIcon}</span>
                                    {miniIcons.length > 0 && (
                                        <div className="flex gap-0.5 mt-1">
                                            {miniIcons.map((icon, idx) => (
                                                <span key={idx} className="text-xs opacity-90">{icon}</span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Autres modes (jours/semaines): afficher mini-icônes toujours visibles si données présentes */}
                            {config.intervalType !== 'phases' && (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    {miniIcons.length > 0 ? (
                                        <div className="flex flex-col gap-0.5 items-center justify-center">
                                            {miniIcons.map((icon, idx) => (
                                                <span key={idx} className="text-[8px] leading-none">{icon}</span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="text-[6px] text-gray-600 opacity-50">
                                            {/* Indicateur vide au hover seulement */}
                                            <span className="opacity-0 hover:opacity-100 transition-opacity">+</span>
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Indicateur de sélection */}
                            {isSelected && (
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"></div>
                            )}
                        </motion.div>
                    );
                })}

                {/* Bouton + pour ajouter des cases */}
                {canAddMore && onAddCells && !readonly && (
                    <motion.button
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onAddCells(10)}
                        className={`${config.intervalType === 'phases' ? 'w-16 h-16 md:w-20 md:h-20' : 'w-3 h-3 md:w-4 md:h-4'} rounded-sm border-2 border-dashed border-gray-600 hover: hover: flex items-center justify-center transition-all duration-200`}
                        title="Ajouter 10 étapes"
                    >
                        <Plus className={config.intervalType === 'phases' ? 'w-8 h-8' : 'w-2 h-2'} />
                    </motion.button>
                )}
            </div>

            {/* Labels de jours de la semaine (pour mode jours/dates) */}
            {(config.intervalType === 'days' || config.intervalType === 'dates') && (
                <div className="grid grid-cols-7 gap-1 mt-2 text-xs text-gray-400 text-center">
                    {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((day, idx) => (
                        <div key={idx}>{day}</div>
                    ))}
                </div>
            )}

            {/* Info */}
            <div className="mt-4 p-3 bg-gray-800/50 rounded-lg text-sm text-gray-400">
                <p>💡 <strong>Astuce</strong>: Maintenez Ctrl/Cmd et cliquez pour sélectionner plusieurs cases</p>
                <p className="mt-1">🎨 La couleur indique la densité de données: gris = vide, vert clair → vert foncé = peu → beaucoup</p>
            </div>
        </div>
    );
};

export default PipelineGridView;

