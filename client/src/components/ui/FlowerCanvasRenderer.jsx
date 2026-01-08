import React, { useRef, useEffect } from 'react';

/**
 * FlowerCanvasRenderer - Rendu Canvas 2D d'une tête de cannabis
 * 
 * Structure botanique:
 * - TIGE PRINCIPALE (rachis) au centre
 * - BRANCHES SECONDAIRES qui partent de la tige
 * - CALICES (bractées) attachés aux branches - forme teardrop
 * - PISTILS qui émergent des calices
 * - TRICHOMES sur les calices
 */

const FlowerCanvasRenderer = ({
    densite = 7,
    trichomes = 5,
    pistils = 5,
    manucure = 8,
    moisissure = 10,
    graines = 10
}) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const W = canvas.width;
        const H = canvas.height;

        ctx.clearRect(0, 0, W, H);

        // Paramètres normalisés
        const pDensite = densite / 10;
        const pTrichomes = trichomes / 10;
        const pPistils = pistils / 10;
        const pManucure = manucure / 10;
        const pMoisissure = moisissure / 10;
        const pGraines = graines / 10;

        // Générateur pseudo-aléatoire
        const seededRandom = (seed) => {
            const x = Math.sin(seed * 9999) * 10000;
            return x - Math.floor(x);
        };

        // Dimensions - Fleur plus compacte et trapue
        const centerX = W / 2;
        const stemBottom = H * 0.88;
        const stemTop = H * 0.25;
        const stemHeight = stemBottom - stemTop;

        // Stocker les bractées pour y dessiner pistils/trichomes
        const bractPositions = [];
        // Stocker les branches pour y attacher les bractées
        const branches = [];

        // ===============================================
        // TIGE PRINCIPALE (courbe, organique)
        // ===============================================
        const drawMainStem = () => {
            const stemWidth = 5;

            // Courbe légère de la tige
            const curve = W * 0.05;

            const grad = ctx.createLinearGradient(centerX - stemWidth, stemTop, centerX + stemWidth, stemTop);
            grad.addColorStop(0, '#3a5f32');
            grad.addColorStop(0.5, '#4a7542');
            grad.addColorStop(1, '#3a5f32');

            ctx.strokeStyle = grad;
            ctx.lineWidth = stemWidth;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(centerX, stemBottom);

            // Courbe quadratique pour tige organique
            const midY = stemTop + stemHeight * 0.5;
            ctx.quadraticCurveTo(centerX + curve, midY, centerX, stemTop);
            ctx.stroke();

            // Stocker les points de la tige pour y attacher les branches
            const stemPoints = [];
            for (let t = 0; t <= 1; t += 0.05) {
                const y = stemBottom - t * stemHeight;
                const x = centerX + curve * Math.sin(Math.PI * t);
                stemPoints.push({ x, y, t });
            }
            return stemPoints;
        };

        // ===============================================
        // BRANCHES SECONDAIRES + BRACTÉES attachées
        // ===============================================
        const drawBranchesAndBracts = (stemPoints) => {
            // Nombre de branches selon densité
            const branchCount = Math.floor(5 + pDensite * 12); // 5-17 branches

            // Taille des bractées selon densité
            const bractSize = 14 + pDensite * 10; // 14-24px

            for (let i = 0; i < branchCount; i++) {
                const seed = i * 42.7;
                const r = seededRandom(seed);

                // Position sur la tige (0=bas, 1=haut)
                const t = i / branchCount;
                const stemIdx = Math.floor(t * (stemPoints.length - 1));
                const stemPoint = stemPoints[stemIdx];

                // Rayon de la cola (forme conique)
                let radiusFactor;
                if (t < 0.15) {
                    radiusFactor = t / 0.15; // Pointe haute
                } else if (t < 0.7) {
                    radiusFactor = 1.0;
                } else {
                    radiusFactor = 1.0 - (t - 0.7) * 0.5; // Rétrécissement bas
                }

                const maxRadius = W * 0.30 * radiusFactor;

                // Alternance gauche/droite
                const side = i % 2 === 0 ? 1 : -1;

                // Angle et longueur de la branche
                const branchAngle = side * (Math.PI / 2.5 + r * 0.3);
                const branchLength = maxRadius * (0.6 + r * 0.4);

                // Point de départ (sur la tige)
                const startX = stemPoint.x;
                const startY = stemPoint.y;

                // Point d'arrivée de la branche
                const endX = startX + Math.cos(branchAngle) * branchLength;
                const endY = startY + Math.sin(branchAngle) * branchLength * 0.4 - branchLength * 0.15;

                // Dessiner la branche (visible seulement si densité faible)
                const branchVisibility = Math.max(0, 1 - pDensite * 1.2);
                if (branchVisibility > 0.1) {
                    ctx.strokeStyle = `rgba(61, 101, 53, ${branchVisibility * 0.6})`;
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(startX, startY);
                    ctx.quadraticCurveTo(
                        startX + Math.cos(branchAngle) * branchLength * 0.5,
                        startY + Math.sin(branchAngle) * branchLength * 0.2,
                        endX,
                        endY
                    );
                    ctx.stroke();
                }

                // Stocker la branche
                branches.push({
                    startX, startY, endX, endY,
                    angle: branchAngle,
                    length: branchLength,
                    seed
                });

                // Bractées le long de la branche (plus dense = plus de bractées)
                const bractsPerBranch = Math.floor(2 + pDensite * 6); // 2-8 bractées

                for (let b = 0; b < bractsPerBranch; b++) {
                    const bractSeed = seed + b * 17;
                    const br = seededRandom(bractSeed);

                    // Position le long de la branche (0=départ, 1=fin)
                    const bractT = (b + 0.3 + br * 0.4) / bractsPerBranch;

                    // Interpolation le long de la courbe de branche
                    const bractX = startX + (endX - startX) * bractT;
                    const bractY = startY + (endY - startY) * bractT;

                    // Taille avec variation
                    const size = bractSize * (0.8 + br * 0.4);

                    // Gonflement si graine
                    const hasSeed = pGraines < 0.8 && br > 0.8;
                    const seedSwelling = hasSeed ? 1.5 : 1.0;

                    // Angle d'orientation (suit la branche)
                    const orientation = branchAngle;

                    drawBract(bractX, bractY, size * seedSwelling, bractSeed, orientation, hasSeed);
                    bractPositions.push({
                        x: bractX,
                        y: bractY,
                        size,
                        seed: bractSeed,
                        hasSeed
                    });
                }
            }
        };

        // ===============================================
        // BRACTÉE (boule/calice) - Forme arrondie
        // ===============================================
        const drawBract = (x, y, size, seed, angle, hasSeed) => {
            const r = seededRandom(seed);
            const r2 = seededRandom(seed + 1);

            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(angle);

            // Couleurs vertes variées
            const hue = 85 + (r - 0.5) * 30;
            const sat = 45 + r2 * 25;
            const light = 32 + r * 10;

            // Gradient pour volume 3D
            const grad = ctx.createRadialGradient(
                -size * 0.2, -size * 0.2, 0,
                0, 0, size * 0.8
            );
            grad.addColorStop(0, `hsl(${hue}, ${sat}%, ${light + 18}%)`);
            grad.addColorStop(0.6, `hsl(${hue}, ${sat}%, ${light + 5}%)`);
            grad.addColorStop(1, `hsl(${hue}, ${sat + 10}%, ${light - 5}%)`);

            ctx.fillStyle = grad;

            // Forme teardrop (goutte)
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.65); // Pointe

            // Côté droit
            ctx.bezierCurveTo(
                size * 0.45, -size * 0.35,
                size * 0.5, size * 0.15,
                size * 0.3, size * 0.5
            );

            // Base
            ctx.bezierCurveTo(
                size * 0.1, size * 0.6,
                -size * 0.1, size * 0.6,
                -size * 0.3, size * 0.5
            );

            // Côté gauche
            ctx.bezierCurveTo(
                -size * 0.5, size * 0.15,
                -size * 0.45, -size * 0.35,
                0, -size * 0.65
            );

            ctx.fill();

            // Si graine : marquer visuellement
            if (hasSeed) {
                ctx.fillStyle = `hsl(${hue - 10}, ${sat - 15}%, ${light + 10}%)`;
                ctx.beginPath();
                ctx.ellipse(0, size * 0.1, size * 0.2, size * 0.3, 0, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.restore();
        };

        // ===============================================
        // PISTILS (filaments orange) - UNIQUEMENT sur les bractées
        // ===============================================
        const drawPistils = () => {
            if (pPistils < 0.1) return;

            bractPositions.forEach((bract) => {
                const r = seededRandom(bract.seed + 2000);

                // Pas toutes les bractées ont des pistils visibles
                if (r > pPistils * 1.2) return;

                const { x, y, size, seed } = bract;
                const r2 = seededRandom(seed + 2001);
                const r3 = seededRandom(seed + 2002);

                // Couleur selon maturité
                let hue, sat, light;
                if (r2 < 0.25) {
                    hue = 50; sat = 15; light = 90; // Blanc
                } else if (r2 < 0.65) {
                    hue = 28 + r3 * 12; sat = 85; light = 55; // Orange
                } else {
                    hue = 18 + r3 * 8; sat = 65; light = 38; // Rouille
                }

                ctx.strokeStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
                ctx.lineWidth = 1.2;
                ctx.lineCap = 'round';

                // 2 pistils par bractée, émergent du sommet
                const pistilLength = size * 0.7 + r3 * size * 0.5;

                for (let p = 0; p < 2; p++) {
                    const angle = -Math.PI / 2 + (p === 0 ? -0.5 : 0.5) + (r2 - 0.5) * 0.4;
                    const endX = x + Math.cos(angle) * pistilLength;
                    const endY = y - size * 0.6 + Math.sin(angle) * pistilLength;

                    const ctrlX = x + Math.cos(angle) * pistilLength * 0.5 + (r3 - 0.5) * 5;
                    const ctrlY = y - size * 0.5 + Math.sin(angle) * pistilLength * 0.3;

                    ctx.beginPath();
                    ctx.moveTo(x, y - size * 0.6);
                    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
                    ctx.stroke();
                }
            });
        };

        // ===============================================
        // TRICHOMES (givre blanc) - UNIQUEMENT sur les bractées
        // ===============================================
        const drawTrichomes = () => {
            if (pTrichomes < 0.1) return;

            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            ctx.shadowBlur = 2;

            bractPositions.forEach((bract) => {
                const count = Math.floor(3 + pTrichomes * 12);

                for (let t = 0; t < count; t++) {
                    const ts = bract.seed + t * 7.89 + 3000;
                    const tr1 = seededRandom(ts);
                    const tr2 = seededRandom(ts + 1);
                    const tr3 = seededRandom(ts + 2);

                    // Position sur la bractée
                    const angle = tr1 * Math.PI * 2;
                    const dist = tr2 * bract.size * 0.45;
                    const tx = bract.x + Math.cos(angle) * dist;
                    const ty = bract.y + Math.sin(angle) * dist * 0.6;

                    const tSize = 1.2 + tr3 * 1.8;

                    ctx.fillStyle = `rgba(255, 255, 255, ${0.6 + tr3 * 0.35})`;
                    ctx.beginPath();
                    ctx.arc(tx, ty, tSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.shadowBlur = 0;
        };

        // ===============================================
        // MOISISSURE (taches grises/brunes)
        // ===============================================
        const drawMold = () => {
            if (pMoisissure > 0.75) return;

            const intensity = 1 - pMoisissure;

            bractPositions.forEach((bract, i) => {
                if (i % 5 !== 0) return;
                const r = seededRandom(bract.seed + 8000);
                if (r > intensity) return;

                const size = bract.size * 0.6 + r * bract.size * 0.5;

                const grad = ctx.createRadialGradient(bract.x, bract.y, 0, bract.x, bract.y, size);
                grad.addColorStop(0, 'rgba(90, 80, 70, 0.7)');
                grad.addColorStop(0.6, 'rgba(70, 60, 50, 0.4)');
                grad.addColorStop(1, 'rgba(50, 40, 30, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(bract.x, bract.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        // ===============================================
        // ORDRE DE RENDU (hiérarchie botanique stricte)
        // ===============================================
        const stemPoints = drawMainStem();          // 1. Tige principale courbe
        drawBranchesAndBracts(stemPoints);          // 2. Branches + Bractées attachées
        drawMold();                                  // 3. Moisissure (sur bractées)
        drawPistils();                               // 4. Pistils (depuis bractées)
        drawTrichomes();                             // 5. Trichomes (sur bractées)

    }, [densite, trichomes, pistils, manucure, moisissure, graines]);

    return (
        <canvas
            ref={canvasRef}
            width={300}
            height={400}
            style={{
                maxWidth: '100%',
                height: 'auto',
                display: 'block',
                margin: '0 auto'
            }}
        />
    );
};

export default FlowerCanvasRenderer;
