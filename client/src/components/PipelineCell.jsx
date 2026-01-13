import React from 'react';
import { motion } from 'framer-motion';

const PipelineCell = ({
  data,
  intensity = 0, // 0-4
  onClick,
  onHover,
  editable = true,
  colorScale = 'intensity',
  index // Ajout index pour transmettre au parent
}) => {
  // Couleurs basées sur l'intensité (style GitHub)
  // 0 = gris/vide, 4 = très intense (vert ou violet selon thème)
  const getBackgroundColor = (level) => {
    // Si on veut customiser, on peut passer un objet de couleurs
    if (colorScale === 'status') {
      // Logique de statut (ex: vert=ok, rouge=prob)
      return level > 0 ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-800';
    }

    // Default intensity scale (green/neutral for dark mode)
    switch (level) {
      case 1: return 'bg-green-200 dark:bg-green-900/30';
      case 2: return 'bg-green-300 dark:bg-green-800';
      case 3: return 'bg-green-500 dark:bg-green-600';
      case 4: return 'bg-green-700 dark:bg-green-500';
      default: return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={(e) => onClick?.(e, index, data)}
      onMouseEnter={onHover}
      className={`
        w-3 h-3 md:w-4 md:h-4 rounded-sm cursor-pointer transition-colors duration-200
        ${getBackgroundColor(intensity)}
        ${editable ? 'hover:ring-2 hover:ring-green-300 dark:hover:ring-green-600' : ''}
      `}
      title={`${data?.label || 'Cell'}: ${data?.value || 'Pas de donnée'}`}
    />
  );
};

export default PipelineCell;


