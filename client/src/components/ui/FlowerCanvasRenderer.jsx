import React, { useEffect, useRef } from 'react';

const FlowerCanvasRenderer = ({
    densite = 5,
    trichomes = 5,
    pistils = 5,
    manucure = 5,
    moisissure = 10,
    graines = 10
}) => {
    const canvasRef = useRef(null);
    const animationRef = useRef(null);
    const paramsRef = useRef({ densite, trichomes, pistils, manucure, moisissure, graines });

    useEffect(() => {
        paramsRef.current = { densite, trichomes, pistils, manucure, moisissure, graines };
    }, [densite, trichomes, pistils, manucure, moisissure, graines]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d', { alpha: true });
        const dpr = window.devicePixelRatio || 1;

        const updateCanvasSize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            const w = rect?.width || 800;
            const h = rect?.height || 600;

            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.scale(dpr, dpr);
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        // ═══════════════════════════════════════════════════════════
        // COLOR PALETTES
        // ═══════════════════════════════════════════════════════════
        const greenPalette = ['#E8F5E9', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'];
        const pistilColors = ['#FF6B35', '#F7931E', '#FFA500', '#FFB84D', '#FFD700'];

        // ═══════════════════════════════════════════════════════════
        // UTILITY FUNCTIONS
        // ═══════════════════════════════════════════════════════════
        const perlin = (x, y, seed = 0) => {
            const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
            return n - Math.floor(n);
        };

        // ═══════════════════════════════════════════════════════════
        // DRAWING FUNCTIONS
        // ═══════════════════════════════════════════════════════════

        const drawSepal = (cx, cy, rx, ry, rotation, layerIdx) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation);

            const glow = ctx.createRadialGradient(-rx * 0.4, -ry * 0.4, 0, 0, 0, rx * 1.3);
            glow.addColorStop(0, greenPalette[2]);
            glow.addColorStop(0.5, greenPalette[4]);
            glow.addColorStop(1, greenPalette[6 + layerIdx % 3]);

            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = greenPalette[8];
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = 0.4;
            ctx.stroke();

            ctx.globalAlpha = 0.15;
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.ellipse(-rx * 0.3, -ry * 0.3, rx * 0.4, ry * 0.3, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
            ctx.globalAlpha = 1;
        };

        const drawPistils = (cx, cy, density) => {
            if (density < 0.1) return;

            const count = Math.round(density * 60);
            ctx.globalAlpha = 0.5 + (density / 10) * 0.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            for (let i = 0; i < count; i++) {
                const angle = (i / count) * Math.PI * 2 + perlin(i, density) * 0.5;
                const length = 25 + perlin(i * 1.5, density) * 20;
                const variation = perlin(i * 2, density * 5);

                ctx.lineWidth = 0.7 + variation * 1.5;
                ctx.strokeStyle = pistilColors[Math.floor(variation * pistilColors.length)];

                ctx.beginPath();
                ctx.moveTo(cx, cy);

                const curve1 = Math.sin(i * 0.5) * 12;
                const curve2 = Math.cos(i * 0.7) * 8;
                const cpx = cx + Math.cos(angle) * length * 0.4 + curve1;
                const cpy = cy + Math.sin(angle) * length * 0.4 + curve2 * 0.5;
                const endX = cx + Math.cos(angle) * length;
                const endY = cy + Math.sin(angle) * length * 0.65;

                ctx.quadraticCurveTo(cpx, cpy, endX, endY);
                ctx.stroke();

                ctx.globalAlpha = (0.5 + density / 10 * 0.5) * 0.4;
                ctx.lineWidth = ctx.lineWidth * 0.4;
                ctx.strokeStyle = '#FFD700';
                ctx.beginPath();
                ctx.moveTo(cx, cy);
                ctx.quadraticCurveTo(cpx, cpy, endX, endY);
                ctx.stroke();
                ctx.globalAlpha = 0.5 + (density / 10) * 0.5;
            }

            ctx.globalAlpha = 1;
        };

        const drawTrichomes = (density) => {
            if (density < 0.1) return;

            const count = Math.round(density * 120);
            ctx.globalAlpha = 0.4 + (density / 10) * 0.6;

            ctx.shadowColor = `rgba(255, 255, 255, ${0.3 + density * 0.07})`;
            ctx.shadowBlur = 3 + density * 1.5;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            ctx.fillStyle = '#FFFFFF';

            for (let i = 0; i < count; i++) {
                const seed = i * 137.508;
                const angle = perlin(seed * 0.01, density) * Math.PI * 2;
                const radius = 35 + perlin(seed * 0.05, density * 10) * 55;

                const x = 400 + Math.cos(angle) * radius;
                const y = 280 + Math.sin(angle) * radius * 0.75;

                const sizeVar = perlin(seed * 0.1, density * 2);
                const r = 0.8 + sizeVar * 2;

                ctx.beginPath();
                ctx.arc(x, y, r, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.shadowColor = 'transparent';
            ctx.globalAlpha = 1;
        };

        const drawLeaves = (density) => {
            const leafCount = Math.max(0, Math.round((1 - density / 10) * 8));
            if (leafCount === 0) return;

            ctx.globalAlpha = 0.75;
            ctx.lineJoin = 'round';

            for (let i = 0; i < leafCount; i++) {
                const angle = (i / leafCount) * Math.PI * 1.4 - 0.7 + Math.PI * 0.8;
                const distance = 85 + i * 8;
                const baseX = 400 + Math.cos(angle) * distance;
                const baseY = 280 + Math.sin(angle) * distance;

                ctx.save();
                ctx.translate(baseX, baseY);
                ctx.rotate(angle + Math.PI / 2);

                const leafLength = 70 + i * 5;
                const leafWidth = 25 + i * 3;

                const leafGrad = ctx.createLinearGradient(0, 0, leafLength, 0);
                leafGrad.addColorStop(0, greenPalette[2]);
                leafGrad.addColorStop(0.5, greenPalette[3]);
                leafGrad.addColorStop(1, greenPalette[5]);

                ctx.fillStyle = leafGrad;
                ctx.strokeStyle = greenPalette[7];
                ctx.lineWidth = 1.2;

                ctx.beginPath();
                ctx.moveTo(0, 0);

                for (let j = 1; j <= 6; j++) {
                    const t = j / 6;
                    const x = leafLength * t;
                    const curve = Math.sin(t * Math.PI) * leafWidth * (j % 2 === 0 ? 1 : -1);
                    ctx.lineTo(x, curve);
                }

                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                ctx.strokeStyle = greenPalette[7];
                ctx.lineWidth = 0.5;
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(leafLength, 0);
                ctx.stroke();

                ctx.restore();
            }

            ctx.globalAlpha = 1;
        };

        const drawMold = (intensity) => {
            const moldPower = 1 - (intensity / 10);
            if (moldPower < 0.05) return;

            ctx.globalAlpha = moldPower * 0.45;
            ctx.fillStyle = '#7A6E66';

            for (let i = 0; i < 35; i++) {
                const seed = i * 73.3;
                const angle = perlin(seed, moldPower) * Math.PI * 2;
                const radius = 20 + perlin(seed * 1.5, moldPower * 5) * 40;

                const x = 400 + Math.cos(angle) * radius;
                const y = 280 + Math.sin(angle) * radius * 0.75;
                const size = 3 + perlin(seed * 2, moldPower) * 4;

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.globalAlpha = 1;
        };

        const drawSeeds = (intensity) => {
            const seedCount = Math.max(0, Math.round((1 - intensity / 10) * 12));
            if (seedCount === 0) return;

            ctx.globalAlpha = 0.65;
            ctx.fillStyle = '#6B7280';

            for (let i = 0; i < seedCount; i++) {
                const angle = (i / seedCount) * Math.PI * 2;
                const radius = 30 + perlin(i * 2.5, intensity) * 25;

                const x = 400 + Math.cos(angle) * radius;
                const y = 280 + Math.sin(angle) * radius * 0.75;

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle + Math.PI / 4);

                const seedGrad = ctx.createLinearGradient(-4, -6, 4, 6);
                seedGrad.addColorStop(0, '#5A5F66');
                seedGrad.addColorStop(1, '#3D4048');

                ctx.fillStyle = seedGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, 5, 7, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#2A2E35';
                ctx.lineWidth = 0.8;
                ctx.stroke();

                ctx.restore();
            }

            ctx.globalAlpha = 1;
        };

        const drawStructure = (density) => {
            const densityFactor = density / 10;
            const baseGap = 1 + (1 - densityFactor) * 4;
            const layers = 8;

            for (let layer = 0; layer < layers; layer++) {
                const layerRadius = 55 - layer * (5 + baseGap * 1.2);
                const layerY = 280 + layer * (10 + baseGap * 1.5);
                const sepsCount = Math.max(4, Math.round(12 - layer * 1.3 - (1 - densityFactor) * 2));
                const sizeMultiplier = 1.1 - layer * 0.14;

                for (let i = 0; i < sepsCount; i++) {
                    const angle = (i / sepsCount) * Math.PI * 2 + layer * 0.35;
                    const radiusVar = layerRadius * (1 + perlin(layer * 10 + i, densityFactor) * 0.2);

                    const x = 400 + Math.cos(angle) * radiusVar;
                    const y = layerY + Math.sin(angle) * radiusVar * 0.55;

                    const rx = 11 * sizeMultiplier * (1 + Math.sin(angle * 4) * 0.18);
                    const ry = 16 * sizeMultiplier * (1 + Math.cos(angle * 3) * 0.15);
                    const rotation = angle + Math.PI / 2 + perlin(layer + i * 0.1, 0) * 0.3;

                    drawSepal(x, y, rx, ry, rotation, layer);
                }
            }
        };

        const drawStem = () => {
            const stemGrad = ctx.createLinearGradient(0, 280, 0, 450);
            stemGrad.addColorStop(0, greenPalette[6]);
            stemGrad.addColorStop(0.5, greenPalette[7]);
            stemGrad.addColorStop(1, greenPalette[8]);

            ctx.fillStyle = stemGrad;
            ctx.globalAlpha = 0.8;

            ctx.beginPath();
            ctx.moveTo(395, 350);
            ctx.quadraticCurveTo(398, 380, 397, 450);
            ctx.lineTo(403, 450);
            ctx.quadraticCurveTo(404, 380, 405, 350);
            ctx.closePath();
            ctx.fill();

            ctx.globalAlpha = 1;
        };

        const drawShadow = () => {
            const shadowGrad = ctx.createRadialGradient(400, 450, 0, 400, 450, 100);
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
            shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            ctx.ellipse(400, 450, 120, 25, 0, 0, Math.PI * 2);
            ctx.fill();
        };

        const draw = (params) => {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, 800, 600);

            drawShadow();
            drawStem();
            drawStructure(params.densite);
            drawLeaves(params.manucure);
            drawMold(params.moisissure);
            drawSeeds(params.graines);
            drawPistils(400, 280, params.pistils / 10);
            drawTrichomes(params.trichomes / 10);
        };

        // Animation loop
        const animate = () => {
            draw(paramsRef.current);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    return (
        <div className="w-full h-full min-h-[600px] bg-white rounded-lg overflow-hidden shadow-sm">
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
                style={{ display: 'block', backgroundColor: '#FFFFFF' }}
            />
        </div>
    );
};

export default FlowerCanvasRenderer;
