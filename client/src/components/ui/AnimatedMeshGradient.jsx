import React, { useEffect, useRef } from 'react';

const AnimatedMeshGradient = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let time = 0;
    
    // Configuration des couleurs selon le thème actuel (sera géré par CSS variables ou props)
    // Ici on part sur une base violette/rose "Vaporwave/Apple"
    const colors = [
      { r: 147, g: 51, b: 234 }, // Purple 600
      { r: 236, g: 72, b: 153 }, // Pink 500
      { r: 99, g: 102, b: 241 }, // Indigo 500
      { r: 168, g: 85, b: 247 }, // Purple 500
    ];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const draw = () => {
      time += 0.002;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Création du gradient mesh
      const w = canvas.width;
      const h = canvas.height;

      // Un fond de base
      const gradient = ctx.createLinearGradient(0, 0, w, h);
      gradient.addColorStop(0, '#4c1d95'); // Violet très foncé
      gradient.addColorStop(1, '#be185d'); // Rose foncé
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);

      // Orbs animés "Blob"
      for (let i = 0; i < 5; i++) {
        const x = w * (0.5 + 0.4 * Math.sin(time + i * 1.2));
        const y = h * (0.5 + 0.4 * Math.cos(time * 0.8 + i * 1.5));
        const radius = Math.min(w, h) * 0.6;
        
        const grd = ctx.createRadialGradient(x, y, 0, x, y, radius);
        const color = colors[i % colors.length];
        
        grd.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.4)`);
        grd.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
        
        ctx.fillStyle = grd;
        ctx.globalCompositeOperation = 'screen'; // Blend mode "Screen" pour effet lumineux
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Reset composite for next frame
      ctx.globalCompositeOperation = 'source-over';

      animationFrameId = window.requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none transition-opacity duration-1000"
      style={{ filter: 'blur(30px)' }} // Flou CSS pour lisser les gradients
    />
  );
};

export default AnimatedMeshGradient;
