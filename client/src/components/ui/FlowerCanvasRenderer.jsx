import React, { useEffect, useRef } from 'react';

/**
 * FlowerCanvasRenderer - Rendu réaliste d'une tête de cannabis
 * Visualisation organique et détaillée avec calices, pistils, trichomes
 */
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
        let W = 400, H = 500;

        const updateCanvasSize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            W = rect?.width || 400;
            H = rect?.height || 500;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        };

        updateCanvasSize();
        window.addEventListener('resize', updateCanvasSize);

        // ════════════════════════════════════════════════════════════════
        // NOISE FUNCTION - pour variation organique naturelle
        // ════════════════════════════════════════════════════════════════
        const noise = (x, y = 0, seed = 0) => {
            const n = Math.sin(x * 12.9898 + y * 78.233 + seed * 43758.5453) * 43758.5453;
            return (n - Math.floor(n)) * 2 - 1; // -1 to 1
        };

        const smoothNoise = (x, y, seed, octaves = 3) => {
            let val = 0, amp = 1, freq = 1, max = 0;
            for (let i = 0; i < octaves; i++) {
                val += noise(x * freq, y * freq, seed + i * 100) * amp;
                max += amp;
                amp *= 0.5;
                freq *= 2;
            }
            return val / max;
        };

        // ════════════════════════════════════════════════════════════════
        // DRAW ORGANIC BUD SHAPE (Calice réaliste)
        // ════════════════════════════════════════════════════════════════
        const drawCalyx = (cx, cy, size, rotation, colorIdx, highlight = false) => {
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rotation);

            // Forme de calice organique (goutte/larme)
            const baseGreen = [
                '#2d5a27', '#3d6b35', '#4a7c42', '#5a8d4f',
                '#6b9e5c', '#7caf69', '#8dc076', '#9ed183'
            ];

            const mainColor = baseGreen[Math.min(colorIdx, baseGreen.length - 1)];
            const darkColor = baseGreen[Math.max(0, colorIdx - 2)];
            const lightColor = baseGreen[Math.min(colorIdx + 2, baseGreen.length - 1)];

            // Gradient réaliste pour volume 3D
            const grad = ctx.createRadialGradient(
                -size * 0.2, -size * 0.3, 0,
                0, 0, size * 1.2
            );
            grad.addColorStop(0, lightColor);
            grad.addColorStop(0.4, mainColor);
            grad.addColorStop(0.8, darkColor);
            grad.addColorStop(1, '#1a3d1a');

            ctx.fillStyle = grad;

            // Forme organique de calice (pas une ellipse parfaite)
            ctx.beginPath();
            const points = 32;
            for (let i = 0; i <= points; i++) {
                const t = (i / points) * Math.PI * 2;
                // Forme de goutte avec variations
                const baseR = size * (0.8 + 0.4 * Math.sin(t * 0.5 + Math.PI / 2));
                const wobble = size * 0.15 * smoothNoise(t * 2, rotation, cx + cy);
                const r = baseR + wobble;
                const x = Math.cos(t) * r * 0.7;
                const y = Math.sin(t) * r;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();

            // Highlight subtil
            if (highlight) {
                ctx.globalAlpha = 0.15;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.ellipse(-size * 0.15, -size * 0.25, size * 0.25, size * 0.15, -0.3, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            ctx.restore();
        };

        // ════════════════════════════════════════════════════════════════
        // DRAW PISTIL (poils oranges/rouges caractéristiques)
        // ════════════════════════════════════════════════════════════════
        const drawPistil = (x, y, length, angle, colorIdx) => {
            const colors = ['#8B4513', '#CD853F', '#D2691E', '#FF8C00', '#FF6347', '#DC143C'];
            const color = colors[colorIdx % colors.length];

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Pistil courbe naturelle avec épaisseur variable
            ctx.strokeStyle = color;
            ctx.lineCap = 'round';

            // Courbe de Bézier pour forme naturelle
            const curve = smoothNoise(x * 0.1, y * 0.1, angle) * length * 0.4;

            ctx.beginPath();
            ctx.moveTo(0, 0);

            // Gradient d'épaisseur (plus épais à la base)
            const segments = 8;
            let prevX = 0, prevY = 0;

            for (let i = 1; i <= segments; i++) {
                const t = i / segments;
                const px = t * length;
                const py = Math.sin(t * Math.PI) * curve;

                ctx.lineWidth = 2.5 * (1 - t * 0.7);
                ctx.beginPath();
                ctx.moveTo(prevX, prevY);
                ctx.lineTo(px, py);
                ctx.stroke();

                prevX = px;
                prevY = py;
            }

            // Extrémité légèrement bouclée
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.arc(prevX, prevY, 2, 0, Math.PI * 1.5);
            ctx.stroke();

            ctx.restore();
        };

        // ════════════════════════════════════════════════════════════════
        // DRAW TRICHOME (cristaux de résine)
        // ════════════════════════════════════════════════════════════════
        const drawTrichome = (x, y, size, maturity) => {
            ctx.save();

            // Tige du trichome
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, y - size * 0.7);
            ctx.stroke();

            // Tête du trichome (bulbe)
            const headY = y - size * 0.7;
            const headSize = size * 0.4;

            // Couleur selon maturité (clair = jeune, ambré = mature)
            const alpha = 0.5 + maturity * 0.4;
            const tint = maturity > 0.7 ? 'rgba(255, 220, 150,' : 'rgba(255, 255, 255,';

            // Glow effect
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = 3;

            const trichGrad = ctx.createRadialGradient(
                x - headSize * 0.2, headY - headSize * 0.2, 0,
                x, headY, headSize
            );
            trichGrad.addColorStop(0, tint + '0.9)');
            trichGrad.addColorStop(0.5, tint + alpha + ')');
            trichGrad.addColorStop(1, tint + '0.2)');

            ctx.fillStyle = trichGrad;
            ctx.beginPath();
            ctx.arc(x, headY, headSize, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.restore();
        };

        // ════════════════════════════════════════════════════════════════
        // DRAW SUGAR LEAF (feuille résineuse)
        // ════════════════════════════════════════════════════════════════
        const drawSugarLeaf = (x, y, size, rotation) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);

            // Gradient vert foncé pour feuille
            const leafGrad = ctx.createLinearGradient(0, 0, size, 0);
            leafGrad.addColorStop(0, '#2d5a27');
            leafGrad.addColorStop(0.5, '#3d6b35');
            leafGrad.addColorStop(1, '#1a3d1a');

            ctx.fillStyle = leafGrad;
            ctx.strokeStyle = '#1a3d1a';
            ctx.lineWidth = 0.5;

            // Forme de feuille de cannabis simplifiée (5 pointes)
            ctx.beginPath();
            ctx.moveTo(0, 0);

            // Lobe central
            ctx.quadraticCurveTo(size * 0.1, -size * 0.3, size * 0.5, -size * 0.1);
            ctx.quadraticCurveTo(size * 0.8, -size * 0.05, size, 0);
            ctx.quadraticCurveTo(size * 0.8, size * 0.05, size * 0.5, size * 0.1);
            ctx.quadraticCurveTo(size * 0.1, size * 0.3, 0, 0);

            ctx.fill();
            ctx.stroke();

            // Nervure centrale
            ctx.strokeStyle = '#4a7c42';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(size * 0.9, 0);
            ctx.stroke();

            ctx.restore();
        };

        // ════════════════════════════════════════════════════════════════
        // DRAW COMPLETE BUD (structure complète)
        // ════════════════════════════════════════════════════════════════
        const drawBud = (params) => {
            const centerX = W / 2;
            const centerY = H * 0.42;
            const budHeight = H * 0.45;
            const budWidth = W * 0.35;

            const { densite, trichomes: trichLevel, pistils: pistilLevel, manucure, moisissure, graines } = params;

            // Facteurs de densité et qualité
            const densityFactor = densite / 10;
            const compactness = 0.5 + densityFactor * 0.5;

            // ─────────────────────────────────────────────────────────────
            // LAYER 1: SUGAR LEAVES (arrière-plan si manucure basse)
            // ─────────────────────────────────────────────────────────────
            const leafCount = Math.round((1 - manucure / 10) * 12);
            for (let i = 0; i < leafCount; i++) {
                const angle = (i / leafCount) * Math.PI * 2 + smoothNoise(i, 0, 42) * 0.5;
                const dist = budWidth * (0.9 + smoothNoise(i, 1, 42) * 0.3);
                const lx = centerX + Math.cos(angle) * dist;
                const ly = centerY + Math.sin(angle) * dist * 0.6;
                const leafSize = budWidth * (0.4 + smoothNoise(i, 2, 42) * 0.2);

                drawSugarLeaf(lx, ly, leafSize, angle + Math.PI / 2);
            }

            // ─────────────────────────────────────────────────────────────
            // LAYER 2: CALYX STRUCTURE (corps principal du bud)
            // ─────────────────────────────────────────────────────────────
            // Plusieurs couches de calices empilés
            const layers = 6 + Math.round(densityFactor * 4);

            for (let layer = layers - 1; layer >= 0; layer--) {
                const layerRatio = layer / layers;
                const layerY = centerY - budHeight * 0.4 + budHeight * layerRatio * 0.8;

                // Rayon de cette couche (forme de cône/torpille)
                const layerRadius = budWidth * Math.sin(layerRatio * Math.PI) * compactness;

                // Nombre de calices par couche
                const calyxCount = Math.round(6 + densityFactor * 8 - layer * 0.5);

                for (let i = 0; i < calyxCount; i++) {
                    const angle = (i / calyxCount) * Math.PI * 2 + layer * 0.3;
                    const wobble = smoothNoise(layer * 10 + i, layerRatio, 123) * 0.2;

                    const cx = centerX + Math.cos(angle + wobble) * layerRadius;
                    const cy = layerY + smoothNoise(i, layer, 456) * 8;

                    const calyxSize = 12 + densityFactor * 8 + smoothNoise(i, layer, 789) * 4;
                    const rotation = angle + Math.PI / 2 + smoothNoise(i * 2, layer, 321) * 0.4;
                    const colorIdx = Math.floor(2 + layerRatio * 4 + smoothNoise(i, layer, 654) * 2);

                    drawCalyx(cx, cy, calyxSize, rotation, colorIdx, layer < 2);
                }
            }

            // ─────────────────────────────────────────────────────────────
            // LAYER 3: PISTILS (poils orange/rouge)
            // ─────────────────────────────────────────────────────────────
            const pistilCount = Math.round(pistilLevel * 15);
            for (let i = 0; i < pistilCount; i++) {
                const angle = (i / pistilCount) * Math.PI * 2 + smoothNoise(i, 0, 111) * 0.8;
                const layerRatio = (i % layers) / layers;
                const dist = budWidth * Math.sin(layerRatio * Math.PI) * compactness * 0.8;

                const px = centerX + Math.cos(angle) * dist + smoothNoise(i, 1, 222) * 10;
                const py = centerY - budHeight * 0.4 + budHeight * layerRatio * 0.8 + smoothNoise(i, 2, 333) * 10;

                const pistilLength = 15 + pistilLevel * 2 + smoothNoise(i, 3, 444) * 8;
                const pistilAngle = angle + smoothNoise(i, 4, 555) * 0.8;
                const colorIdx = Math.floor(smoothNoise(i, 5, 666) * 3 + 3);

                drawPistil(px, py, pistilLength, pistilAngle, colorIdx);

                // Paires de pistils
                if (i % 2 === 0) {
                    drawPistil(px, py, pistilLength * 0.8, pistilAngle + 0.4, colorIdx);
                }
            }

            // ─────────────────────────────────────────────────────────────
            // LAYER 4: TRICHOMES (cristaux de résine)
            // ─────────────────────────────────────────────────────────────
            const trichCount = Math.round(trichLevel * 40);
            for (let i = 0; i < trichCount; i++) {
                const angle = smoothNoise(i, 0, 777) * Math.PI * 2;
                const layerRatio = smoothNoise(i, 1, 888);
                const dist = budWidth * Math.sin(layerRatio * Math.PI) * compactness * smoothNoise(i, 2, 999);

                const tx = centerX + Math.cos(angle) * dist;
                const ty = centerY - budHeight * 0.4 + budHeight * layerRatio * 0.8;

                const trichSize = 4 + trichLevel * 0.5 + smoothNoise(i, 3, 1111) * 2;
                const maturity = 0.3 + smoothNoise(i, 4, 2222) * 0.7;

                drawTrichome(tx, ty, trichSize, maturity);
            }

            // ─────────────────────────────────────────────────────────────
            // LAYER 5: MOLD (si présent - moisissure)
            // ─────────────────────────────────────────────────────────────
            const moldLevel = 1 - moisissure / 10;
            if (moldLevel > 0.05) {
                ctx.globalAlpha = moldLevel * 0.6;
                const moldCount = Math.round(moldLevel * 20);

                for (let i = 0; i < moldCount; i++) {
                    const mx = centerX + smoothNoise(i, 0, 3333) * budWidth * 0.8;
                    const my = centerY + smoothNoise(i, 1, 4444) * budHeight * 0.3;
                    const moldSize = 5 + smoothNoise(i, 2, 5555) * 10;

                    // Taches grises/blanches de moisissure
                    const moldGrad = ctx.createRadialGradient(mx, my, 0, mx, my, moldSize);
                    moldGrad.addColorStop(0, 'rgba(180, 180, 170, 0.8)');
                    moldGrad.addColorStop(0.5, 'rgba(150, 150, 140, 0.5)');
                    moldGrad.addColorStop(1, 'rgba(120, 120, 110, 0)');

                    ctx.fillStyle = moldGrad;
                    ctx.beginPath();
                    ctx.arc(mx, my, moldSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.globalAlpha = 1;
            }

            // ─────────────────────────────────────────────────────────────
            // LAYER 6: SEEDS (graines si présentes)
            // ─────────────────────────────────────────────────────────────
            const seedCount = Math.round((1 - graines / 10) * 8);
            for (let i = 0; i < seedCount; i++) {
                const sx = centerX + smoothNoise(i, 0, 6666) * budWidth * 0.5;
                const sy = centerY + smoothNoise(i, 1, 7777) * budHeight * 0.2;

                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(smoothNoise(i, 2, 8888) * Math.PI);

                // Graine ovale marron
                const seedGrad = ctx.createLinearGradient(-4, -6, 4, 6);
                seedGrad.addColorStop(0, '#8B7355');
                seedGrad.addColorStop(0.3, '#6B5344');
                seedGrad.addColorStop(0.7, '#5C4033');
                seedGrad.addColorStop(1, '#3D2817');

                ctx.fillStyle = seedGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, 4, 6, 0, 0, Math.PI * 2);
                ctx.fill();

                // Ligne caractéristique de la graine
                ctx.strokeStyle = '#2D1810';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -5);
                ctx.lineTo(0, 5);
                ctx.stroke();

                ctx.restore();
            }
        };

        // ════════════════════════════════════════════════════════════════
        // DRAW STEM (tige)
        // ════════════════════════════════════════════════════════════════
        const drawStem = () => {
            const centerX = W / 2;
            const startY = H * 0.65;
            const endY = H * 0.95;

            const stemGrad = ctx.createLinearGradient(centerX - 5, startY, centerX + 5, startY);
            stemGrad.addColorStop(0, '#2d5a27');
            stemGrad.addColorStop(0.3, '#4a7c42');
            stemGrad.addColorStop(0.7, '#3d6b35');
            stemGrad.addColorStop(1, '#2d5a27');

            ctx.fillStyle = stemGrad;
            ctx.beginPath();
            ctx.moveTo(centerX - 4, startY);
            ctx.quadraticCurveTo(centerX - 5, (startY + endY) / 2, centerX - 3, endY);
            ctx.lineTo(centerX + 3, endY);
            ctx.quadraticCurveTo(centerX + 5, (startY + endY) / 2, centerX + 4, startY);
            ctx.closePath();
            ctx.fill();
        };

        // ════════════════════════════════════════════════════════════════
        // MAIN DRAW FUNCTION
        // ════════════════════════════════════════════════════════════════
        const draw = (params) => {
            // Clear avec fond transparent/blanc
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, W, H);

            // Ombre sous le bud
            const shadowGrad = ctx.createRadialGradient(W / 2, H * 0.85, 0, W / 2, H * 0.85, W * 0.25);
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.15)');
            shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            ctx.ellipse(W / 2, H * 0.85, W * 0.25, H * 0.05, 0, 0, Math.PI * 2);
            ctx.fill();

            // Dessiner la tige
            drawStem();

            // Dessiner le bud complet
            drawBud(params);
        };

        // Animation loop
        const animate = () => {
            draw(paramsRef.current);
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', updateCanvasSize);
        };
    }, []);

    return (
        <div className="w-full h-full min-h-[400px] bg-slate-50 rounded-xl overflow-hidden shadow-inner">
            <canvas
                ref={canvasRef}
                className="w-full h-full block"
                style={{ display: 'block' }}
            />
        </div>
    );
};

export default FlowerCanvasRenderer;
