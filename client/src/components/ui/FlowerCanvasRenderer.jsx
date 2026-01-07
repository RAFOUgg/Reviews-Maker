import React, { useEffect, useRef } from 'react';

/**
 * FlowerCanvasRenderer - Rendu RÉALISTE d'une tête de cannabis
 * Masse dense et compacte comme une vraie fleur
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

        const resize = () => {
            const rect = canvas.parentElement?.getBoundingClientRect();
            W = rect?.width || 400;
            H = rect?.height || 500;
            canvas.width = W * dpr;
            canvas.height = H * dpr;
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
        };

        resize();
        window.addEventListener('resize', resize);

        // Hash function for deterministic randomness
        const hash = (x, y, seed) => {
            const n = Math.sin(x * 127.1 + y * 311.7 + seed * 758.5) * 43758.5453;
            return n - Math.floor(n);
        };

        // 2D noise
        const noise2D = (x, y, seed = 0) => {
            const ix = Math.floor(x), iy = Math.floor(y);
            const fx = x - ix, fy = y - iy;
            const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
            const a = hash(ix, iy, seed), b = hash(ix + 1, iy, seed);
            const c = hash(ix, iy + 1, seed), d = hash(ix + 1, iy + 1, seed);
            return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
        };

        // Fractal Brownian Motion
        const fbm = (x, y, seed = 0, octaves = 4) => {
            let val = 0, amp = 0.5, freq = 1;
            for (let i = 0; i < octaves; i++) {
                val += noise2D(x * freq, y * freq, seed + i * 100) * amp;
                amp *= 0.5;
                freq *= 2;
            }
            return val;
        };

        // Bud shape function
        const budShape = (x, y, centerX, centerY, budW, budH) => {
            const nx = (x - centerX) / budW;
            const ny = (y - centerY) / budH;
            const verticalFactor = 1 - ny * 0.6;
            const shape = (nx * nx) / (verticalFactor * verticalFactor) + ny * ny;
            return shape < 1 ? 1 - shape : 0;
        };

        // Draw the realistic bud
        const drawBud = (params) => {
            const centerX = W / 2;
            const centerY = H * 0.45;
            const budW = W * 0.32;
            const budH = H * 0.38;

            const { densite, trichomes: trichLevel, pistils: pistilLevel, manucure, moisissure, graines } = params;
            const densityFactor = densite / 10;
            const trichFactor = trichLevel / 10;
            const pistilFactor = pistilLevel / 10;

            // PASS 1: Base mass with pixel manipulation
            const imageData = ctx.createImageData(W, H);
            const data = imageData.data;

            for (let py = 0; py < H; py++) {
                for (let px = 0; px < W; px++) {
                    const idx = (py * W + px) * 4;
                    const shape = budShape(px, py, centerX, centerY, budW, budH);

                    if (shape > 0) {
                        const nx = px / W * 8;
                        const ny = py / H * 8;

                        const n1 = fbm(nx, ny, 42, 5);
                        const n2 = fbm(nx * 2, ny * 2, 123, 4);
                        const n3 = fbm(nx * 4, ny * 4, 456, 3);

                        let r = 45 + n1 * 40 + n2 * 20;
                        let g = 75 + n1 * 50 + n2 * 30 + n3 * 15;
                        let b = 35 + n1 * 25 + n2 * 15;

                        const depth = fbm(nx * 3, ny * 3, 789, 3);
                        if (depth < 0.4) { r *= 0.7; g *= 0.75; b *= 0.65; }
                        if (n3 > 0.6 && shape > 0.3) { r += 25; g += 35; b += 15; }

                        const compactNoise = fbm(nx * 6, ny * 6, 999, 2);
                        if (densityFactor < 0.5 && compactNoise > 0.7) {
                            r *= 0.85; g *= 0.85; b *= 0.8;
                        }

                        const alpha = Math.min(255, shape * 400);
                        data[idx] = Math.min(255, Math.max(0, r));
                        data[idx + 1] = Math.min(255, Math.max(0, g));
                        data[idx + 2] = Math.min(255, Math.max(0, b));
                        data[idx + 3] = alpha;
                    }
                }
            }
            ctx.putImageData(imageData, 0, 0);

            // PASS 2: Calyx bumps
            const calyxCount = 150 + Math.round(densityFactor * 200);
            for (let i = 0; i < calyxCount; i++) {
                const angle = hash(i, 0, 111) * Math.PI * 2;
                const radiusFactor = hash(i, 1, 222) * 0.9 + 0.1;
                const heightFactor = hash(i, 2, 333);
                const vertPos = heightFactor;
                const horizRadius = budW * (1 - vertPos * 0.5) * radiusFactor;

                const cx = centerX + Math.cos(angle) * horizRadius * (0.3 + hash(i, 3, 444) * 0.7);
                const cy = centerY - budH * 0.45 + budH * vertPos * 0.9;

                if (budShape(cx, cy, centerX, centerY, budW, budH) < 0.1) continue;

                const calyxSize = 4 + densityFactor * 6 + hash(i, 4, 555) * 8;
                const grad = ctx.createRadialGradient(cx - calyxSize * 0.3, cy - calyxSize * 0.3, 0, cx, cy, calyxSize);
                const baseG = 70 + hash(i, 5, 666) * 50;
                grad.addColorStop(0, `rgba(${55 + hash(i, 6, 777) * 30}, ${baseG + 40}, ${40 + hash(i, 7, 888) * 20}, 0.8)`);
                grad.addColorStop(0.5, `rgba(${45 + hash(i, 6, 777) * 25}, ${baseG + 20}, ${35 + hash(i, 7, 888) * 15}, 0.6)`);
                grad.addColorStop(1, `rgba(35, ${baseG - 10}, 30, 0)`);

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(cx, cy, calyxSize * 0.7, calyxSize, hash(i, 8, 999) * Math.PI, 0, Math.PI * 2);
                ctx.fill();
            }

            // PASS 3: Pistils
            const pistilCount = Math.round(pistilFactor * 250);
            ctx.lineCap = 'round';

            for (let i = 0; i < pistilCount; i++) {
                const angle = hash(i, 0, 1111) * Math.PI * 2;
                const radiusFactor = hash(i, 1, 2222);
                const heightFactor = hash(i, 2, 3333);
                const vertPos = heightFactor;
                const horizRadius = budW * (1 - vertPos * 0.5) * radiusFactor;

                const px = centerX + Math.cos(angle) * horizRadius * 0.8;
                const py = centerY - budH * 0.45 + budH * vertPos * 0.9;

                if (budShape(px, py, centerX, centerY, budW, budH) < 0.15) continue;

                const hue = 15 + hash(i, 3, 4444) * 25;
                const sat = 70 + hash(i, 4, 5555) * 30;
                const light = 35 + hash(i, 5, 6666) * 25;

                ctx.strokeStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
                ctx.lineWidth = 1 + hash(i, 6, 7777) * 1.5;

                const length = 8 + pistilFactor * 12 + hash(i, 7, 8888) * 10;
                const curl = (hash(i, 8, 9999) - 0.5) * 0.8;
                const outAngle = angle + (hash(i, 9, 1234) - 0.5) * 1.5;

                ctx.beginPath();
                ctx.moveTo(px, py);
                const cp1x = px + Math.cos(outAngle) * length * 0.4;
                const cp1y = py + Math.sin(outAngle) * length * 0.4 - length * 0.2;
                const endX = px + Math.cos(outAngle + curl) * length;
                const endY = py + Math.sin(outAngle + curl) * length - length * 0.3;
                ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
                ctx.stroke();

                if (hash(i, 10, 2345) > 0.4) {
                    const outAngle2 = outAngle + 0.3 + hash(i, 11, 3456) * 0.3;
                    const length2 = length * (0.6 + hash(i, 12, 4567) * 0.4);
                    ctx.beginPath();
                    ctx.moveTo(px, py);
                    ctx.quadraticCurveTo(
                        px + Math.cos(outAngle2) * length2 * 0.4,
                        py + Math.sin(outAngle2) * length2 * 0.4 - length2 * 0.15,
                        px + Math.cos(outAngle2 + curl * 0.8) * length2,
                        py + Math.sin(outAngle2 + curl * 0.8) * length2 - length2 * 0.2
                    );
                    ctx.stroke();
                }
            }

            // PASS 4: Trichomes (frost effect)
            if (trichFactor > 0.1) {
                const trichCount = Math.round(trichFactor * 800);
                ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
                ctx.shadowBlur = 2;

                for (let i = 0; i < trichCount; i++) {
                    const tx = centerX + (hash(i, 0, 5678) - 0.5) * budW * 2;
                    const ty = centerY + (hash(i, 1, 6789) - 0.5) * budH * 1.8;
                    if (budShape(tx, ty, centerX, centerY, budW, budH) < 0.2) continue;

                    const trichSize = 1 + trichFactor * 2 + hash(i, 2, 7890) * 1.5;
                    const alpha = 0.3 + trichFactor * 0.5 + hash(i, 3, 8901) * 0.2;
                    const amber = hash(i, 4, 9012) > 0.8 ? 20 : 0;

                    ctx.fillStyle = `rgba(${255 - amber}, ${255 - amber * 0.5}, ${255 - amber}, ${alpha})`;
                    ctx.beginPath();
                    ctx.arc(tx, ty, trichSize, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.shadowBlur = 0;
            }

            // PASS 5: Sugar leaves
            const leafCount = Math.round((1 - manucure / 10) * 8);
            for (let i = 0; i < leafCount; i++) {
                const angle = (i / leafCount) * Math.PI * 2 + hash(i, 0, 111) * 0.5;
                const dist = budW * (0.85 + hash(i, 1, 222) * 0.4);
                const lx = centerX + Math.cos(angle) * dist;
                const ly = centerY + Math.sin(angle) * dist * 0.5 + hash(i, 2, 333) * 30;

                ctx.save();
                ctx.translate(lx, ly);
                ctx.rotate(angle + Math.PI * 0.5 + (hash(i, 3, 444) - 0.5) * 0.5);

                const leafLen = 25 + hash(i, 4, 555) * 30;
                const leafW = 8 + hash(i, 5, 666) * 8;

                const leafGrad = ctx.createLinearGradient(0, 0, leafLen, 0);
                leafGrad.addColorStop(0, '#2a5428');
                leafGrad.addColorStop(0.5, '#3d6b35');
                leafGrad.addColorStop(1, '#1f3d1a');

                ctx.fillStyle = leafGrad;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.quadraticCurveTo(leafLen * 0.3, -leafW, leafLen, 0);
                ctx.quadraticCurveTo(leafLen * 0.3, leafW, 0, 0);
                ctx.fill();

                ctx.strokeStyle = '#4a7c42';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(2, 0);
                ctx.lineTo(leafLen - 2, 0);
                ctx.stroke();
                ctx.restore();
            }

            // PASS 6: Mold
            const moldLevel = 1 - moisissure / 10;
            if (moldLevel > 0.05) {
                for (let i = 0; i < Math.round(moldLevel * 15); i++) {
                    const mx = centerX + (hash(i, 0, 111) - 0.5) * budW * 1.5;
                    const my = centerY + (hash(i, 1, 222) - 0.5) * budH;
                    if (budShape(mx, my, centerX, centerY, budW, budH) < 0.2) continue;

                    const moldSize = 8 + hash(i, 2, 333) * 15;
                    const moldGrad = ctx.createRadialGradient(mx, my, 0, mx, my, moldSize);
                    moldGrad.addColorStop(0, `rgba(160, 155, 145, ${moldLevel * 0.7})`);
                    moldGrad.addColorStop(0.6, `rgba(140, 135, 125, ${moldLevel * 0.4})`);
                    moldGrad.addColorStop(1, 'rgba(120, 115, 105, 0)');
                    ctx.fillStyle = moldGrad;
                    ctx.beginPath();
                    ctx.arc(mx, my, moldSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            }

            // PASS 7: Seeds
            const seedCount = Math.round((1 - graines / 10) * 6);
            for (let i = 0; i < seedCount; i++) {
                const sx = centerX + (hash(i, 0, 444) - 0.5) * budW * 0.8;
                const sy = centerY + (hash(i, 1, 555) - 0.5) * budH * 0.5;
                if (budShape(sx, sy, centerX, centerY, budW, budH) < 0.3) continue;

                ctx.save();
                ctx.translate(sx, sy);
                ctx.rotate(hash(i, 2, 666) * Math.PI);

                const seedGrad = ctx.createLinearGradient(-3, -5, 3, 5);
                seedGrad.addColorStop(0, '#7a6b55');
                seedGrad.addColorStop(0.3, '#5c4d3a');
                seedGrad.addColorStop(1, '#3a2d1f');
                ctx.fillStyle = seedGrad;
                ctx.beginPath();
                ctx.ellipse(0, 0, 3.5, 5.5, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#2d2015';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -4);
                ctx.lineTo(0, 4);
                ctx.stroke();
                ctx.restore();
            }
        };

        // Draw stem
        const drawStem = () => {
            const cx = W / 2;
            const startY = H * 0.68;
            const endY = H * 0.92;

            const stemGrad = ctx.createLinearGradient(cx - 6, startY, cx + 6, startY);
            stemGrad.addColorStop(0, '#3d5a35');
            stemGrad.addColorStop(0.3, '#5a7a50');
            stemGrad.addColorStop(0.7, '#4a6a42');
            stemGrad.addColorStop(1, '#2d4a28');

            ctx.fillStyle = stemGrad;
            ctx.beginPath();
            ctx.moveTo(cx - 5, startY);
            ctx.quadraticCurveTo(cx - 6, (startY + endY) / 2, cx - 4, endY);
            ctx.lineTo(cx + 4, endY);
            ctx.quadraticCurveTo(cx + 6, (startY + endY) / 2, cx + 5, startY);
            ctx.closePath();
            ctx.fill();
        };

        // Main draw
        const draw = (params) => {
            ctx.fillStyle = '#f8fafc';
            ctx.fillRect(0, 0, W, H);

            const shadowGrad = ctx.createRadialGradient(W / 2, H * 0.88, 0, W / 2, H * 0.88, W * 0.22);
            shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
            shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = shadowGrad;
            ctx.beginPath();
            ctx.ellipse(W / 2, H * 0.88, W * 0.22, H * 0.04, 0, 0, Math.PI * 2);
            ctx.fill();

            drawStem();
            drawBud(params);
        };

        let lastParams = JSON.stringify(paramsRef.current);
        const animate = () => {
            const currentParams = JSON.stringify(paramsRef.current);
            if (currentParams !== lastParams) {
                lastParams = currentParams;
                draw(paramsRef.current);
            }
            animationRef.current = requestAnimationFrame(animate);
        };

        draw(paramsRef.current);
        animate();

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <div className="w-full h-full min-h-[400px] bg-slate-50 rounded-xl overflow-hidden shadow-inner">
            <canvas ref={canvasRef} className="w-full h-full block" style={{ display: 'block' }} />
        </div>
    );
};

export default FlowerCanvasRenderer;
