import React, { useRef, useEffect } from 'react';

/**
 * FlowerCanvasRenderer - Rendu Canvas 2D d'une tête de cannabis
 * 
 * Anatomie respectée (voir CDC/PLAN/Fleurs_Section_5_canva):
 * - SILHOUETTE: Forme de cône/torpille (pointu en haut, large au milieu, tige en bas)
 * - CALICES: Petites formes teardrop (3-8mm) empilées très densément
 * - PISTILS: Filaments fins orange/roux qui émergent des calices par paires
 * - TRICHOMES: Effet "givre" blanc sur la surface
 * - SUGAR LEAVES: Petites feuilles autour si manucure basse
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

        // Clear
        ctx.clearRect(0, 0, W, H);

        // Paramètres normalisés (0-1)
        const pDensite = densite / 10;
        const pTrichomes = trichomes / 10;
        const pPistils = pistils / 10;
        const pManucure = manucure / 10;
        const pMoisissure = moisissure / 10;
        const pGraines = graines / 10;

        // Générateur pseudo-aléatoire déterministe
        const seededRandom = (seed) => {
            const x = Math.sin(seed * 9999) * 10000;
            return x - Math.floor(x);
        };

        // Centre et dimensions de la tête
        const centerX = W / 2;
        const stemTopY = H * 0.85;
        const budTopY = H * 0.08;
        const budWidth = W * 0.35;
        const budHeight = stemTopY - budTopY;

        // ===============================================
        // FONCTION: Vérifie si un point est dans la silhouette de la tête
        // Forme de cône/torpille - pointu en haut, large au milieu, rétréci à la base
        // ===============================================
        const isInsideBud = (x, y) => {
            // Normaliser Y dans la zone du bud (0 = haut, 1 = bas/tige)
            const normalY = (y - budTopY) / budHeight;
            if (normalY < 0 || normalY > 1) return false;

            // Profil de largeur: pointu en haut, max vers 0.4-0.5, puis rétrécit vers tige
            // Courbe de Bézier simplifiée
            let widthRatio;
            if (normalY < 0.1) {
                // Pointe supérieure
                widthRatio = normalY * 3;
            } else if (normalY < 0.5) {
                // Élargissement vers le milieu
                widthRatio = 0.3 + (normalY - 0.1) * 1.75;
            } else if (normalY < 0.85) {
                // Zone la plus large puis rétrécissement
                widthRatio = 1.0 - (normalY - 0.5) * 0.6;
            } else {
                // Base étroite vers la tige
                widthRatio = 0.79 - (normalY - 0.85) * 3;
            }

            // Ajouter légère asymétrie organique
            const wobble = Math.sin(normalY * 12) * 0.03 + Math.cos(normalY * 7) * 0.02;
            widthRatio += wobble;

            const halfWidth = budWidth * Math.max(0.05, widthRatio);
            return Math.abs(x - centerX) < halfWidth;
        };

        // ===============================================
        // DESSIN DE LA TIGE
        // ===============================================
        const drawStem = () => {
            const stemWidth = 8;
            const stemHeight = H - stemTopY + 10;

            // Gradient tige
            const grad = ctx.createLinearGradient(centerX - stemWidth / 2, stemTopY, centerX + stemWidth / 2, stemTopY);
            grad.addColorStop(0, '#3d6b35');
            grad.addColorStop(0.5, '#4a7a42');
            grad.addColorStop(1, '#3d6b35');

            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(centerX - stemWidth / 2, stemTopY);
            ctx.lineTo(centerX + stemWidth / 2, stemTopY);
            ctx.lineTo(centerX + stemWidth / 2 - 1, H);
            ctx.lineTo(centerX - stemWidth / 2 + 1, H);
            ctx.closePath();
            ctx.fill();
        };

        // ===============================================
        // DESSIN DES CALICES (masse dense de petites gouttes)
        // ===============================================
        const drawCalyces = () => {
            // Nombre de calices basé sur la densité
            const baseCount = 150;
            const count = Math.floor(baseCount * (0.5 + pDensite * 0.6));

            // Taille des calices inversement proportionnelle à la densité (plus dense = plus petit = plus serré)
            const calyxSize = 12 - pDensite * 4; // 8-12px

            for (let i = 0; i < count; i++) {
                const seed = i * 137.508;
                const r1 = seededRandom(seed);
                const r2 = seededRandom(seed + 1);
                const r3 = seededRandom(seed + 2);

                // Position aléatoire dans le bounding box
                const x = centerX + (r1 - 0.5) * budWidth * 2.2;
                const y = budTopY + r2 * budHeight;

                // Vérifier si dans la silhouette
                if (!isInsideBud(x, y)) continue;

                // Variation de taille
                const size = calyxSize * (0.7 + r3 * 0.6);

                // Couleur verte avec variations
                const hue = 95 + (r3 - 0.5) * 20; // 85-105 (vert)
                const sat = 45 + r1 * 25;
                const light = 28 + r2 * 15;

                // Dessin du calice (forme teardrop/goutte)
                ctx.save();
                ctx.translate(x, y);
                // Légère rotation aléatoire pour aspect organique
                ctx.rotate((r1 - 0.5) * 0.4);

                // Gradient pour profondeur
                const grad = ctx.createRadialGradient(0, -size * 0.2, 0, 0, 0, size);
                grad.addColorStop(0, `hsl(${hue}, ${sat}%, ${light + 10}%)`);
                grad.addColorStop(0.7, `hsl(${hue}, ${sat}%, ${light}%)`);
                grad.addColorStop(1, `hsl(${hue}, ${sat + 10}%, ${light - 8}%)`);

                ctx.fillStyle = grad;
                ctx.beginPath();
                // Forme teardrop: arrondi en bas, pointu en haut
                ctx.moveTo(0, -size * 0.8); // Pointe haute
                ctx.bezierCurveTo(
                    size * 0.5, -size * 0.3,
                    size * 0.6, size * 0.3,
                    0, size * 0.5
                );
                ctx.bezierCurveTo(
                    -size * 0.6, size * 0.3,
                    -size * 0.5, -size * 0.3,
                    0, -size * 0.8
                );
                ctx.fill();

                ctx.restore();
            }
        };

        // ===============================================
        // DESSIN DES PISTILS (filaments orange)
        // ===============================================
        const drawPistils = () => {
            if (pPistils < 0.1) return;

            const count = Math.floor(80 * pPistils);

            for (let i = 0; i < count; i++) {
                const seed = i * 47.123 + 1000;
                const r1 = seededRandom(seed);
                const r2 = seededRandom(seed + 1);
                const r3 = seededRandom(seed + 2);

                // Position
                const x = centerX + (r1 - 0.5) * budWidth * 1.8;
                const y = budTopY + r2 * budHeight * 0.9;

                if (!isInsideBud(x, y)) continue;

                // Couleur pistil (blanc → orange → brun selon position/seed)
                const maturity = r3;
                let hue, sat, light;
                if (maturity < 0.3) {
                    // Blanc/crème (jeunes)
                    hue = 45;
                    sat = 20;
                    light = 85;
                } else if (maturity < 0.7) {
                    // Orange vif (matures)
                    hue = 25 + r1 * 15;
                    sat = 80;
                    light = 55;
                } else {
                    // Rouille/brun (très matures)
                    hue = 15 + r1 * 10;
                    sat = 60;
                    light = 40;
                }

                // Longueur et direction
                const length = 8 + r3 * 12;
                const angle = -Math.PI / 2 + (r1 - 0.5) * Math.PI * 0.8; // Vers le haut avec variance

                ctx.strokeStyle = `hsl(${hue}, ${sat}%, ${light}%)`;
                ctx.lineWidth = 0.8 + r2 * 0.4;
                ctx.lineCap = 'round';

                // Pistil courbé (2 par calice)
                for (let p = 0; p < 2; p++) {
                    const offsetAngle = angle + (p === 0 ? -0.2 : 0.2);
                    const endX = x + Math.cos(offsetAngle) * length;
                    const endY = y + Math.sin(offsetAngle) * length;

                    // Courbure naturelle
                    const ctrlX = x + Math.cos(offsetAngle) * length * 0.5 + (r2 - 0.5) * 5;
                    const ctrlY = y + Math.sin(offsetAngle) * length * 0.6;

                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    ctx.quadraticCurveTo(ctrlX, ctrlY, endX, endY);
                    ctx.stroke();
                }
            }
        };

        // ===============================================
        // DESSIN DES TRICHOMES (effet givre blanc)
        // ===============================================
        const drawTrichomes = () => {
            if (pTrichomes < 0.1) return;

            const count = Math.floor(300 * pTrichomes);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.5)';
            ctx.shadowBlur = 2;

            for (let i = 0; i < count; i++) {
                const seed = i * 23.456 + 5000;
                const r1 = seededRandom(seed);
                const r2 = seededRandom(seed + 1);
                const r3 = seededRandom(seed + 2);

                const x = centerX + (r1 - 0.5) * budWidth * 2;
                const y = budTopY + r2 * budHeight;

                if (!isInsideBud(x, y)) continue;

                // Taille du trichome (petit point brillant)
                const size = 1 + r3 * 2;

                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.shadowBlur = 0;
        };

        // ===============================================
        // DESSIN DES SUGAR LEAVES (si manucure basse)
        // ===============================================
        const drawSugarLeaves = () => {
            if (pManucure > 0.7) return; // Pas de feuilles si bien manucuré

            const count = Math.floor(15 * (1 - pManucure));

            for (let i = 0; i < count; i++) {
                const seed = i * 89.123 + 3000;
                const r1 = seededRandom(seed);
                const r2 = seededRandom(seed + 1);
                const r3 = seededRandom(seed + 2);

                // Position sur les bords de la silhouette
                const normalY = 0.15 + r2 * 0.7;
                const y = budTopY + normalY * budHeight;

                // Calculer la largeur à cette hauteur
                let widthRatio;
                if (normalY < 0.1) widthRatio = normalY * 3;
                else if (normalY < 0.5) widthRatio = 0.3 + (normalY - 0.1) * 1.75;
                else if (normalY < 0.85) widthRatio = 1.0 - (normalY - 0.5) * 0.6;
                else widthRatio = 0.79 - (normalY - 0.85) * 3;

                const edgeX = centerX + (r1 > 0.5 ? 1 : -1) * budWidth * widthRatio;
                const side = r1 > 0.5 ? 1 : -1;

                // Feuille triangulaire dentelée
                const leafLength = 15 + r3 * 20;
                const leafWidth = 5 + r3 * 8;
                const angle = side * (Math.PI / 4 + r1 * 0.3);

                ctx.save();
                ctx.translate(edgeX, y);
                ctx.rotate(angle);

                // Couleur feuille
                ctx.fillStyle = `hsl(100, 50%, ${30 + r2 * 15}%)`;

                ctx.beginPath();
                ctx.moveTo(0, 0);
                // Feuille avec dentelures
                ctx.lineTo(leafLength * 0.3, -leafWidth * 0.3);
                ctx.lineTo(leafLength * 0.5, -leafWidth * 0.5);
                ctx.lineTo(leafLength * 0.7, -leafWidth * 0.3);
                ctx.lineTo(leafLength, 0);
                ctx.lineTo(leafLength * 0.7, leafWidth * 0.3);
                ctx.lineTo(leafLength * 0.5, leafWidth * 0.5);
                ctx.lineTo(leafLength * 0.3, leafWidth * 0.3);
                ctx.closePath();
                ctx.fill();

                ctx.restore();
            }
        };

        // ===============================================
        // DESSIN DE LA MOISISSURE (si présente)
        // ===============================================
        const drawMold = () => {
            if (pMoisissure > 0.8) return; // Pas de moisissure si score élevé

            const moldIntensity = 1 - pMoisissure;
            const count = Math.floor(20 * moldIntensity);

            for (let i = 0; i < count; i++) {
                const seed = i * 67.89 + 7000;
                const r1 = seededRandom(seed);
                const r2 = seededRandom(seed + 1);
                const r3 = seededRandom(seed + 2);

                const x = centerX + (r1 - 0.5) * budWidth * 1.5;
                const y = budTopY + r2 * budHeight;

                if (!isInsideBud(x, y)) continue;

                const size = 8 + r3 * 15 * moldIntensity;

                // Tache grise/brune
                const grad = ctx.createRadialGradient(x, y, 0, x, y, size);
                grad.addColorStop(0, 'rgba(100, 90, 80, 0.6)');
                grad.addColorStop(0.5, 'rgba(80, 70, 60, 0.4)');
                grad.addColorStop(1, 'rgba(60, 50, 40, 0)');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        // ===============================================
        // DESSIN DES GRAINES (si présentes)
        // ===============================================
        const drawSeeds = () => {
            if (pGraines > 0.8) return; // Pas de graines si score élevé

            const seedIntensity = 1 - pGraines;
            const count = Math.floor(8 * seedIntensity);

            for (let i = 0; i < count; i++) {
                const seed = i * 33.33 + 9000;
                const r1 = seededRandom(seed);
                const r2 = seededRandom(seed + 1);
                const r3 = seededRandom(seed + 2);

                const x = centerX + (r1 - 0.5) * budWidth * 1.2;
                const y = budTopY + 0.2 * budHeight + r2 * budHeight * 0.6;

                if (!isInsideBud(x, y)) continue;

                // Graine ovale
                ctx.save();
                ctx.translate(x, y);
                ctx.rotate(r3 * Math.PI);

                const seedW = 4 + r3 * 2;
                const seedH = 6 + r3 * 3;

                // Couleur graine (brun avec marbrures)
                const grad = ctx.createLinearGradient(-seedW, 0, seedW, 0);
                grad.addColorStop(0, '#4a3c2e');
                grad.addColorStop(0.3, '#6b5a48');
                grad.addColorStop(0.5, '#5a4a3a');
                grad.addColorStop(0.7, '#6b5a48');
                grad.addColorStop(1, '#4a3c2e');

                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.ellipse(0, 0, seedW, seedH, 0, 0, Math.PI * 2);
                ctx.fill();

                // Ligne centrale
                ctx.strokeStyle = '#3a2c1e';
                ctx.lineWidth = 0.5;
                ctx.beginPath();
                ctx.moveTo(0, -seedH);
                ctx.lineTo(0, seedH);
                ctx.stroke();

                ctx.restore();
            }
        };

        // ===============================================
        // ORDRE DE RENDU (back to front)
        // ===============================================
        drawStem();
        drawSugarLeaves();
        drawCalyces();
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
