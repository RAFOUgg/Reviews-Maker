import React, { useEffect, useRef, useState } from 'react';

const FlowerCanvasRenderer = ({
    densite = 5,
    trichomes = 5,
    pistils = 5,
    manucure = 5,
    moisissure = 10,
    graines = 10
}) => {
    const canvasRef = useRef(null);
    const [size, setSize] = useState({ width: 600, height: 500 });
    const animationRef = useRef(null);
    const paramsRef = useRef({ densite, trichomes, pistils, manucure, moisissure, graines });

    // Mise à jour des paramètres
    useEffect(() => {
        paramsRef.current = { densite, trichomes, pistils, manucure, moisissure, graines };
    }, [densite, trichomes, pistils, manucure, moisissure, graines]);

    // Initialisation du canvas et animation loop
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Setup canvas resolution
        const updateCanvasSize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            const w = rect?.width || 600;
            const h = rect?.height || 500;

            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);

            setSize({ width: w, height: h });
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        // === FLOWER RENDERER ===
        const renderer = {
            // Couleurs
            colors: {
                light_green: '#A3E635',
                green: '#22C55E',
                dark_green: '#16A34A',
                darker_green: '#15803D',
                pistil_orange: '#EA580C',
                pistil_red: '#DC2626',
                trichome_white: '#FFFFFF',
                shadow: 'rgba(0,0,0,0.15)',
                mold_gray: '#8B8680',
                seed_green: '#6B7280'
            },

            // Seeds aléatoires mais déterministes
            seededRandom: (seed) => {
                const x = Math.sin(seed) * 10000;
                return x - Math.floor(x);
            },

            // Interpolation linéaire
            lerp: (a, b, t) => a + (b - a) * Math.max(0, Math.min(1, t)),

            // Dessiner un calice (sepal) avec gradient
            drawSepal: (cx, cy, rx, ry, rotation, params) => {
                ctx.save();
                ctx.translate(cx, cy);
                ctx.rotate(rotation);

                // Gradient radial pour donner du volume
                const grad = ctx.createRadialGradient(-rx * 0.3, -ry * 0.3, 0, 0, 0, rx * 1.2);
                grad.addColorStop(0, renderer.colors.light_green);
                grad.addColorStop(0.6, renderer.colors.green);
                grad.addColorStop(1, renderer.colors.dark_green);

                // Dessiner l'ellipse
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
                ctx.fill();

                // Stroke subtle
                ctx.strokeStyle = renderer.colors.darker_green;
                ctx.lineWidth = 0.5;
                ctx.stroke();

                ctx.restore();
            },

            // Dessiner les pistils
            drawPistils: (cx, cy, density, params) => {
                const count = Math.round(density * 20);
                ctx.strokeStyle = renderer.colors.pistil_orange;
                ctx.globalAlpha = 0.6 + (density / 10) * 0.4;
                ctx.lineWidth = 0.8 + (density / 10) * 1.5;
                ctx.lineCap = 'round';

                for (let i = 0; i < count; i++) {
                    const angle = (i / count) * Math.PI * 2 + Math.sin(i * 0.5) * 0.3;
                    const length = 15 + Math.random() * 20;
                    const curve = Math.sin(i * 0.7) * 8;

                    ctx.beginPath();
                    ctx.moveTo(cx, cy);

                    // Point de contrôle pour Bézier
                    const cpx = cx + Math.cos(angle) * length * 0.4 + curve;
                    const cpy = cy + Math.sin(angle) * length * 0.4;
                    const endX = cx + Math.cos(angle) * length;
                    const endY = cy + Math.sin(angle) * length * 0.6;

                    ctx.quadraticCurveTo(cpx, cpy, endX, endY);
                    ctx.stroke();
                }

                ctx.globalAlpha = 1;
            },

            // Dessiner les trichomes (points brillants)
            drawTrichomes: (params) => {
                const density = params.trichomes;
                if (density === 0) return;

                const count = Math.round(density * 80);
                ctx.globalAlpha = 0.6 + (density / 10) * 0.4;
                ctx.fillStyle = renderer.colors.trichome_white;

                // Bloom/glow effect via shadow
                ctx.shadowColor = 'rgba(255,255,255,0.8)';
                ctx.shadowBlur = 2 + density * 0.5;

                for (let i = 0; i < count; i++) {
                    const seed = i * 137.5;
                    const angle = seed * 0.1;
                    const radius = 30 + Math.sin(seed * 0.01) * 50;
                    const x = 300 + Math.cos(angle) * radius;
                    const y = 200 + Math.sin(angle) * radius * 0.7;

                    const r = 0.5 + renderer.seededRandom(seed) * 1.5;
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.shadowColor = 'transparent';
                ctx.globalAlpha = 1;
            },

            // Dessiner les feuilles
            drawLeaves: (params) => {
                const leafCount = Math.max(0, Math.round((1 - params.manucure / 10) * 6));
                ctx.fillStyle = renderer.colors.light_green;
                ctx.strokeStyle = renderer.colors.green;
                ctx.lineWidth = 0.7;
                ctx.globalAlpha = 0.7;

                for (let i = 0; i < leafCount; i++) {
                    const angle = (i / Math.max(1, leafCount - 1)) * 120 - 60 + Math.PI;
                    const length = 60 + Math.sin(i * 0.5) * 15;

                    ctx.save();
                    ctx.translate(300, 200);
                    ctx.rotate(angle);

                    // Feuille polylobée simple
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    for (let j = 0; j <= 5; j++) {
                        const t = j / 5;
                        const x = length * t;
                        const y = Math.sin(t * Math.PI) * (8 + i * 2) * (j % 2 === 0 ? 1 : -1);
                        if (j === 0) ctx.moveTo(x, y);
                        else ctx.lineTo(x, y);
                    }
                    ctx.fill();
                    ctx.stroke();

                    ctx.restore();
                }

                ctx.globalAlpha = 1;
            },

            // Dessiner la moisissure
            drawMold: (params) => {
                const moldIntensity = 1 - (params.moisissure / 10);
                if (moldIntensity < 0.01) return;

                ctx.globalAlpha = moldIntensity * 0.5;
                ctx.fillStyle = renderer.colors.mold_gray;

                for (let i = 0; i < 20; i++) {
                    const angle = i * Math.PI * 2 / 20;
                    const radius = 20 + Math.sin(i * 0.5) * 25;
                    const x = 300 + Math.cos(angle) * radius;
                    const y = 200 + Math.sin(angle) * radius * 0.6;

                    ctx.beginPath();
                    ctx.arc(x, y, 2 + Math.random() * 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
            },

            // Dessiner les graines
            drawSeeds: (params) => {
                const seedCount = Math.max(0, Math.round((1 - params.graines / 10) * 8));
                ctx.fillStyle = renderer.colors.seed_green;
                ctx.globalAlpha = 0.6;

                for (let i = 0; i < seedCount; i++) {
                    const angle = i * Math.PI * 2 / seedCount;
                    const radius = 35 + Math.sin(i * 0.8) * 15;
                    const x = 300 + Math.cos(angle) * radius;
                    const y = 200 + Math.sin(angle) * radius * 0.7;

                    ctx.beginPath();
                    ctx.ellipse(x, y, 4, 6, angle, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
            },

            // Dessiner la structure principale (calices)
            drawStructure: (params) => {
                const density = params.densite / 10;
                const gap = 1 + (1 - density) * 3;
                const layers = 7;

                let colorIdx = 0;
                for (let layer = 0; layer < layers; layer++) {
                    const layerRadius = 50 - layer * (4 + gap * 1.5);
                    const layerY = 200 + layer * (8 + gap * 2);
                    const sepsCount = Math.max(3, Math.round(10 - layer * 1.2));
                    const sizeMultiplier = 1 - layer * 0.12;

                    for (let i = 0; i < sepsCount; i++) {
                        const angle = (i / sepsCount) * Math.PI * 2 + layer * 0.3;
                        const x = 300 + Math.cos(angle) * layerRadius;
                        const y = layerY + Math.sin(angle) * layerRadius * 0.5;

                        const rx = 10 * sizeMultiplier * (1 + Math.sin(angle * 3) * 0.15);
                        const ry = 15 * sizeMultiplier * (1 + Math.cos(angle * 2) * 0.12);
                        const rotation = angle + Math.PI / 2;

                        renderer.drawSepal(x, y, rx, ry, rotation, params);
                        colorIdx++;
                    }
                }
            },

            // Ombre sous la fleur
            drawShadow: (params) => {
                ctx.fillStyle = renderer.colors.shadow;
                ctx.globalAlpha = 0.3;
                ctx.beginPath();
                ctx.ellipse(300, 350, 80, 15, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            },

            // Tige
            drawStem: (params) => {
                ctx.fillStyle = renderer.colors.darker_green;
                ctx.globalAlpha = 0.6;
                ctx.fillRect(295, 300, 10, 80);
                ctx.globalAlpha = 1;
            },

            // Draw complet
            draw: (params) => {
                // Clear
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, size.width, size.height);

                // Render layers
                renderer.drawShadow(params);
                renderer.drawStem(params);
                renderer.drawStructure(params);
                renderer.drawLeaves(params);
                renderer.drawMold(params);
                renderer.drawSeeds(params);
                renderer.drawPistils(300, 200, params.pistils / 10, params);
                renderer.drawTrichomes(params);
            }
        };

        // Animation loop
        const animate = () => {
            renderer.draw(paramsRef.current);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, [size]);

    return (
        <div className="w-full h-full min-h-[400px] bg-white rounded-lg flex items-center justify-center">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ display: 'block' }}
            />
        </div>
    );
};

export default FlowerCanvasRenderer;
