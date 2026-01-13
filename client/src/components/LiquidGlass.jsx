import React, { useRef, useEffect } from 'react';
import { useStore } from '../store/useStore';
import '../../assets/liquid-glass.css';

/**
 * LiquidGlass - Composant de base pour l'effet de verre liquide Apple-style
 * Supporte : flou, opacité, glow, variants (card, modal, sidebar, button)
 */
export const LiquidGlass = ({
  children,
  variant = 'default', // 'default', 'card', 'modal', 'sidebar', 'button'
  blur = 12,
  opacity = 0.7,
  borderRadius = 'xl',
  className = '',
  as: Component = 'div',
  hover = true,
  glow = false,
  ...props
}) => {
  const { theme } = useStore();
  
  // Styles dynamiques basés sur les props
  const baseStyles = {
    '--lg-blur': `${blur}px`,
    '--lg-opacity': opacity,
    '--lg-radius': `var(--radius-${borderRadius}, 1rem)`,
  };

  return (
    <Component
      className={`liquid-glass liquid-glass--${variant} ${hover ? 'liquid-glass--hover' : ''} ${glow ? 'liquid-glass--glow' : ''} ${className}`}
      style={baseStyles}
      data-variant={variant}
      {...props}
    >
      {children}
      
      {/* Effet de brillance au survol (optionnel) */}
      {hover && (
        <div className="liquid-glass-shimmer" aria-hidden="true" />
      )}
    </Component>
  );
};

export default LiquidGlass;



