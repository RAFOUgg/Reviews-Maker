import React, { useEffect, useRef } from 'react';

const AnimatedMeshGradient = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const getThemeColors = () => {
      const style = getComputedStyle(document.body);
      
      const parseColor = (varName, defaultColor) => {
        const val = style.getPropertyValue(varName).trim();
        if (!val) return defaultColor;
        // Basic Hex detection
        if (val.startsWith('#')) {
          const bigint = parseInt(val.slice(1), 16);
          const r = (bigint >> 16) & 255;
          const g = (bigint >> 8) & 255;
          const b = bigint & 255;
          return { r, g, b };
        }
        // Basic RGB detection: 147, 51, 234
        if (val.includes(',')) {
             const parts = val.split(',');
             if (parts.length === 3) {
                 return { r: parseInt(parts[0]), g: parseInt(parts[1]), b: parseInt(parts[2]) };
             }
        }
        return defaultColor;
      };

      return {
        bg1: style.getPropertyValue('--bg-primary').trim() || '#4c1d95',
        bg2: style.getPropertyValue('--bg-secondary').trim() || '#be185d',
        orbs: [
          parseColor('--primary', { r: 147, g: 51, b: 234 }),
          parseColor('--accent', { r: 236, g: 72, b: 153 }),
          parseColor('--color-hash', { r: 168, g: 85, b: 247 }),
          parseColor('--primary-light', { r: 99, g: 102, b: 241 })
        ]
      };
    };

    let time = 0;
    
    // Initial fetch
    let colors = getThemeColors();

    // Observer for class changes on body to update colors
    const observer = new MutationObserver(() => {
        colors = getThemeColors();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // Base Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, colors.bg1); 
      gradient.addColorStop(1, colors.bg2);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Orbs animés "Blob"
      colors.orbs.forEach((color, i) => {
        const x = w * (0.5 + 0.4 * Math.sin(time + i * 1.2));
        const y = h * (0.5 + 0.4 * Math.cos(time * 0.8 + i * 1.5));
        const radius = Math.min(w, h) * 0.6;
        
        const grd = ctx.createRadialGradient(x, y, 0, x, y, radius);
        
        grd.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`);
        grd.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        
        ctx.fillStyle = grd;
        ctx.globalCompositeOperation = 'screen'; 
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset composite
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrameId);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none transition-opacity duration-1000"
      style={{ filter: 'blur(40px)' }} 
    />
  );
};

export default AnimatedMeshGradient;
