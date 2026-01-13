import React, { useMemo } from 'react';
import PipelineCell from './PipelineCell';

/**
 * PipelineTimeline - Visualisation style GitHub contributions
 * Affiche l'évolution des paramètres (température, humidité, etc.) sur le temps
 */
const PipelineTimeline = ({
  data = [],
  mode = 'weeks', // 'days', 'weeks', 'phases'
  startDate,
  endDate,
  phases = [],
  onCellClick,
  onCellHover,
  editable = true,
  colorScale = 'intensity', // 'intensity', 'status', 'custom'
  label = 'Pipeline',
  unit = ''
}) => {

  // Générer la grille de temps
  const grid = useMemo(() => {
    // Logique simplifiée pour l'exemple : génère 12 semaines ou 30 jours
    const count = mode === 'weeks' ? 12 : 30;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      label: mode === 'weeks' ? `S${i + 1}` : `J${i + 1}`,
      value: data[i] || null,
      phase: phases.find(p => i >= p.start && i <= p.end)
    }));
  }, [data, mode, phases]);

  // Calculer l'intensité pour la couleur (0-4 comme GitHub)
  const getIntensity = (value) => {
    if (value === null || value === undefined) return 0;
    // Logique d'intensité basée sur la valeur max attendue (ex: 100%)
    const max = 100;
    const normalized = Math.min(Math.max(value / max, 0), 1);

    if (normalized === 0) return 0;
    if (normalized < 0.25) return 1;
    if (normalized < 0.5) return 2;
    if (normalized < 0.75) return 3;
    return 4;
  };

  return (
    <div className="pipeline-timeline select-none">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-xs text-gray-400">{unit}</span>
      </div>

      <div className="flex gap-1 overflow-x-auto pb-2">
        {grid.map((cell, index) => (
          <PipelineCell
            key={cell.id}
            data={cell}
            intensity={getIntensity(cell.value)}
            onClick={() => onCellClick?.(cell, index)}
            onHover={() => onCellHover?.(cell, index)}
            editable={editable}
            colorScale={colorScale}
          />
        ))}
      </div>

      {/* Légende rapide */}
      <div className="flex items-center gap-1 mt-1 justify-end text-[10px] text-gray-400">
        <span>Moins</span>
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-2 h-2 rounded-sm bg-green-200 dark:bg-green-900/30" />
          <div className="w-2 h-2 rounded-sm bg-green-300 dark:bg-green-800" />
          <div className="w-2 h-2 rounded-sm bg-green-500 dark:bg-green-600" />
          <div className="w-2 h-2 rounded-sm bg-green-700 dark:bg-green-500" />
        </div>
        <span>Plus</span>
      </div>
    </div>
  );
};

export default PipelineTimeline;
