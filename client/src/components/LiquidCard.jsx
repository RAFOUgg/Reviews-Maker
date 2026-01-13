import React from 'react';
import { motion } from 'framer-motion';

/**
 * REVIEWS-MAKER V2 - Liquid Glass Card
 * Carte avec effet glassmorphism Apple-like
 */

const LiquidCard = ({
  children,
  className = '',
  hover = true,
  onClick,
  padding = 'md',
  ...props
}) => {
  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const cardClasses = `
    liquid-glass rounded-2xl
    ${paddings[padding]}
    ${hover ? 'hover:scale-[1.01] transition-smooth cursor-pointer' : ''}
    ${className}
  `;

  if (onClick || hover) {
    return (
      <motion.div
        className={cardClasses}
        onClick={onClick}
        whileHover={hover ? { y: -4 } : {}}
        transition={{ type: 'spring', stiffness: 300 }}
        {...props}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={cardClasses} {...props}>
      {children}
    </div>
  );
};

export default LiquidCard;

