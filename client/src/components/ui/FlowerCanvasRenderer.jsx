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

        // Stocker les positions des calices pour y dessiner pistils/trichomes
        const calyxPositions = [];

        // ===============================================
        // TIGE PRINCIPALE
        // ===============================================
        const drawMainStem = () => {
            const stemWidth = 6;

            const grad = ctx.createLinearGradient(centerX - stemWidth, stemTop, centerX + stemWidth, stemTop);
            grad.addColorStop(0, '#3a5f32');
            grad.addColorStop(0.5, '#4a7542');
            grad.addColorStop(1, '#3a5f32');

            ctx.strokeStyle = grad;
            ctx.lineWidth = stemWidth;
            ctx.lineCap = 'round';

            ctx.beginPath();
            ctx.moveTo(centerX, stemBottom);
            ctx.lineTo(centerX, stemTop);
            ctx.stroke();
        };

        // ===============================================
        // STRUCTURE: Branches + Calices attachés
        // ===============================================
        const drawBranchesAndCalyces = () => {
            // Nombre de niveaux de branches selon densité - moins de niveaux pour éviter l'étirement
            const levels = Math.floor(6 + pDensite * 8); // 6-14 niveaux

            // Taille des calices - proportionnée
            const baseCalyxSize = 20 + pDensite * 10; // 20-30px

            for (let level = 0; level < levels; level++) {
                const seed = level * 123.456;
                const r = seededRandom(seed);

                // Position Y le long de la tige (du haut vers le bas)
                const t = level / (levels - 1); // 0 = haut, 1 = bas
                const y = stemTop + t * stemHeight * 0.85;

                // Largeur de la cola à cette hauteur (forme conique)
                // Plus large au milieu, étroit en haut et en bas
                let widthFactor;
                if (t < 0.2) {
                    widthFactor = t * 4.5; // Pointe haute plus progressive
                } else if (t < 0.7) {
                    widthFactor = 0.9 + (t - 0.2) * 0.3; // Élargissement jusqu'au max
                } else {
                    widthFactor = 1.2 - (t - 0.7) * 0.8; // Rétrécissement bas plus doux
                }

                const maxBranchLength = W * 0.38 * widthFactor;

                // Branches des deux côtés
                const branchesPerSide = Math.floor(1 + pDensite * 2); // 1-3 branches par côté

                for (let side = -1; side <= 1; side += 2) {
                    for (let b = 0; b < branchesPerSide; b++) {
                        const branchSeed = seed + side * 100 + b * 50;
                        const br = seededRandom(branchSeed);

                        // Longueur de branche variable
                        const branchLength = maxBranchLength * (0.5 + br * 0.5);

                        // Angle de la branche (vers le haut et l'extérieur)
                        const baseAngle = side * (Math.PI / 3 + br * 0.3);
                        const branchEndX = centerX + Math.cos(baseAngle) * branchLength;
                        const branchEndY = y + Math.sin(baseAngle) * branchLength * 0.3 - branchLength * 0.2;

                        // Dessiner la branche (fine tige verte)
                        ctx.strokeStyle = '#3d6535';
                        ctx.lineWidth = 2;
                        ctx.beginPath();
                        ctx.moveTo(centerX, y);
                        ctx.quadraticCurveTo(
                            centerX + side * branchLength * 0.3,
                            y - branchLength * 0.1,
                            branchEndX,
                            branchEndY
                        );
                        ctx.stroke();

                        // Calices le long de la branche
                        const calyxCount = Math.floor(2 + pDensite * 3); // 2-5 calices par branche

                        for (let c = 0; c < calyxCount; c++) {
                            const calyxT = (c + 0.5) / calyxCount; // Position le long de la branche
                            const calyxSeed = branchSeed + c * 17;
                            const cr = seededRandom(calyxSeed);

                            // Position interpolée le long de la branche
                            const calyxX = centerX + (branchEndX - centerX) * calyxT + (cr - 0.5) * 8;
                            const calyxY = y + (branchEndY - y) * calyxT + (cr - 0.5) * 5;

                            // Taille variable
                            const size = baseCalyxSize * (0.7 + cr * 0.5);

                            // Gonflement si graine
                            const seedSwelling = pGraines < 0.8 && cr > 0.7 ? 1.3 : 1.0;

                            drawCalyx(calyxX, calyxY, size * seedSwelling, calyxSeed, side);

                            calyxPositions.push({ x: calyxX, y: calyxY, size, seed: calyxSeed });
                        }
                    }
                }

                // Calices sur la tige principale aussi
                const mainCalyxCount = Math.floor(1 + pDensite * 2);
                for (let mc = 0; mc < mainCalyxCount; mc++) {
                    const mcSeed = seed + mc * 33 + 500;
                    const mcr = seededRandom(mcSeed);

                    const mcX = centerX + (mcr - 0.5) * 15;
                    const mcY = y + (mcr - 0.5) * 10;
                    const size = baseCalyxSize * (0.8 + mcr * 0.4);

                    drawCalyx(mcX, mcY, size, mcSeed, mcr > 0.5 ? 1 : -1);
                    calyxPositions.push({ x: mcX, y: mcY, size, seed: mcSeed });
                }
            }
        };

        // ===============================================
        // CALICE (Bractée) - Forme teardrop/goutte
        // ===============================================
        const drawCalyx = (x, y, size, seed, direction) => {
            const r = seededRandom(seed);
            const r2 = seededRandom(seed + 1);

            ctx.save();
            ctx.translate(x, y);

            // Rotation légère vers l'extérieur
            const rotation = direction * 0.2 + (r - 0.5) * 0.3;
            ctx.rotate(rotation);

            // Couleurs vertes variées
            const hue = 90 + (r - 0.5) * 25;
            const sat = 40 + r2 * 30;
            const light = 30 + r * 12;

            // Gradient pour volume 3D
            const grad = ctx.createRadialGradient(
                -size * 0.15, -size * 0.2, 0,
                0, 0, size * 0.9
            );
            grad.addColorStop(0, `hsl(${hue}, ${sat}%, ${light + 15}%)`);
            grad.addColorStop(0.5, `hsl(${hue}, ${sat}%, ${light + 5}%)`);
            grad.addColorStop(1, `hsl(${hue}, ${sat + 10}%, ${light - 5}%)`);

            ctx.fillStyle = grad;

            // Forme teardrop - pointue en haut, ronde en bas
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.7); // Pointe haute

            // Côté droit
            ctx.bezierCurveTo(
                size * 0.4, -size * 0.4,  // Control 1
                size * 0.5, size * 0.1,   // Control 2
                size * 0.35, size * 0.45  // End right
            );

            // Base arrondie
            ctx.bezierCurveTo(
                size * 0.15, size * 0.6,
                -size * 0.15, size * 0.6,
                -size * 0.35, size * 0.45
            );

            // Côté gauche
            ctx.bezierCurveTo(
                -size * 0.5, size * 0.1,
                -size * 0.4, -size * 0.4,
                0, -size * 0.7
            );

            ctx.fill();

            // Nervure centrale subtile
            ctx.strokeStyle = `hsl(${hue}, ${sat - 10}%, ${light - 10}%)`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(0, -size * 0.5);
            ctx.lineTo(0, size * 0.4);
            ctx.stroke();

            ctx.restore();
        };

        // ===============================================
        // PISTILS (filaments orange)
        // ===============================================
        const drawPistils = () => {
            if (pPistils < 0.1) return;

            calyxPositions.forEach((calyx, i) => {
                const r = seededRandom(calyx.seed + 2000);

                // Pas tous les calices ont des pistils visibles
                if (r > pPistils * 1.2) return;

                const { x, y, size, seed } = calyx;
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
                ctx.lineWidth = 1;
                ctx.lineCap = 'round';

                // 2 pistils par calice, émergent du sommet
                const pistilLength = size * 0.6 + r3 * size * 0.4;

                for (let p = 0; p < 2; p++) {
                    const angle = -Math.PI / 2 + (p === 0 ? -0.4 : 0.4) + (r2 - 0.5) * 0.3;
                    const endX = x + Math.cos(angle) * pistilLength;
                    const endY = y - size * 0.5 + Math.sin(angle) * pistilLength;

                    const ctrlX = x + Math.cos(angle) * pistilLength * 0.6 + (r3 - 0.5) * 4;
                    const ctrlY = y - size * 0.4 + Math.sin(angle) * pistilLength * 0.4;

                    ctx.beginPath();
                    ctx.moveTo(x, y - size * 0.5);
                    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
                    ctx.stroke();
                }
            });
        };

        // ===============================================
        // TRICHOMES (givre blanc)
        // ===============================================
        const drawTrichomes = () => {
            if (pTrichomes < 0.1) return;

            ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
            ctx.shadowBlur = 2;

            calyxPositions.forEach((calyx) => {
                const count = Math.floor(5 + pTrichomes * 15);

                for (let t = 0; t < count; t++) {
                    const ts = calyx.seed + t * 7.89 + 3000;
                    const tr1 = seededRandom(ts);
                    const tr2 = seededRandom(ts + 1);
                    const tr3 = seededRandom(ts + 2);

                    // Position sur le calice
                    const angle = tr1 * Math.PI * 2;
                    const dist = tr2 * calyx.size * 0.4;
                    const tx = calyx.x + Math.cos(angle) * dist;
                    const ty = calyx.y + Math.sin(angle) * dist * 0.7;

                    const tSize = 1 + tr3 * 1.5;

                    ctx.fillStyle = `rgba(255, 255, 255, ${0.5 + tr3 * 0.4})`;
                    ctx.beginPath();
                    ctx.arc(tx, ty, tSize, 0, Math.PI * 2);
                    ctx.fill();
                }
            });

            ctx.shadowBlur = 0;
        };

        // ===============================================
        // SUGAR LEAVES (si manucure basse)
        // ===============================================
        const drawSugarLeaves = () => {
            if (pManucure > 0.6) return;

            const count = Math.floor(12 * (1 - pManucure));

            for (let i = 0; i < count; i++) {
                const seed = i * 77.77 + 4000;
                const r1 = seededRandom(seed);
                const r2 = seededRandom(seed + 1);
                const r3 = seededRandom(seed + 2);

                // Position sur les bords
                const t = 0.1 + r2 * 0.75;
                const y = stemTop + t * stemHeight;

                // Largeur à cette hauteur
                let wf;
                if (t < 0.15) wf = t * 4;
                else if (t < 0.6) wf = 0.6 + (t - 0.15) * 0.9;
                else wf = 1.0 - (t - 0.6) * 0.5;

                const side = r1 > 0.5 ? 1 : -1;
                const x = centerX + side * W * 0.25 * wf;

                const leafLen = 20 + r3 * 25;
                const leafW = 6 + r3 * 8;
                const angle = side * (0.3 + r1 * 0.4);

                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(angle);

                ctx.fillStyle = `hsl(95, 50%, ${32 + r2 * 12}%)`;

                // Feuille pointue avec dentelures
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(leafLen * 0.25, -leafW * 0.4);
                ctx.lineTo(leafLen * 0.5, -leafW * 0.55);
                ctx.lineTo(leafLen * 0.75, -leafW * 0.35);
                ctx.lineTo(leafLen, 0);
                ctx.lineTo(leafLen * 0.75, leafW * 0.35);
                ctx.lineTo(leafLen * 0.5, leafW * 0.55);
                ctx.lineTo(leafLen * 0.25, leafW * 0.4);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }
        };

        // ===============================================
        // MOISISSURE
        // ===============================================
        const drawMold = () => {
            if (pMoisissure > 0.75) return;

            const intensity = 1 - pMoisissure;

            calyxPositions.forEach((calyx, i) => {
                if (i % 5 !== 0) return;
                const r = seededRandom(calyx.seed + 8000);
                if (r > intensity) return;

                const size = calyx.size * 0.6 + r * calyx.size * 0.5;

                const grad = ctx.createRadialGradient(calyx.x, calyx.y, 0, calyx.x, calyx.y, size);
                grad.addColorStop(0, 'rgba(90, 80, 70, 0.7)');
                grad.addColorStop(0.6, 'rgba(70, 60, 50, 0.4)');
                grad.addColorStop(1, 'rgba(50, 40, 30, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(calyx.x, calyx.y, size, 0, Math.PI * 2);
                ctx.fill();
            });
        };

        // ===============================================
        // GRAINES
        // ===============================================
        const drawSeeds = () => {
            if (pGraines > 0.75) return;

            const seedChance = 1 - pGraines;

            calyxPositions.forEach((calyx, i) => {
                if (i % 4 !== 0) return;
                const r = seededRandom(calyx.seed + 9000);
                if (r > seedChance * 0.8) return;

                ctx.save();
                ctx.translate(calyx.x, calyx.y);
                ctx.rotate(r * Math.PI);

                const sw = 4 + r * 2;
                const sh = 6 + r * 3;

                const grad = ctx.createLinearGradient(-sw, 0, sw, 0);
                grad.addColorStop(0, '#4a3c2e');
                grad.addColorStop(0.4, '#6b5a48');
                grad.addColorStop(0.6, '#5a4a3a');
                grad.addColorStop(1, '#4a3c2e');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, sw, sh, 0, 0, Math.PI * 2);
                ctx.fill();

                ctx.strokeStyle = '#3a2c1e';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -sh);
                ctx.lineTo(0, sh);
                ctx.stroke();

                ctx.restore();
            });
        };

        // ===============================================
        // ORDRE DE RENDU
        // ===============================================
        drawMainStem();
        drawSugarLeaves();
        drawBranchesAndCalyces();
        drawMold();
        drawSeeds();
        drawPistils();
        drawTrichomes();

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
