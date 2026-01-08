/**
 * Cannabis Geometry Utilities
 * Fonctions pour générer des formes organiques réalistes
 */

/**
 * Assombrir une couleur
 */
export const darkenColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) * (1 - percent));
    const g = Math.max(0, ((num >> 8) & 0xff) * (1 - percent));
    const b = Math.max(0, (num & 0xff) * (1 - percent));
    return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
};

/**
 * Éclaircir une couleur
 */
export const lightenColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * percent);
    const g = Math.min(255, ((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * percent);
    const b = Math.min(255, (num & 0xff) + (255 - (num & 0xff)) * percent);
    return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
};

/**
 * Générateur de bruit simplifié (Perlin-like)
 */
class SimplexNoise {
    constructor(seed = 42) {
        this.seed = seed;
        this.perm = [];
        for (let i = 0; i < 512; i++) {
            this.perm[i] = Math.floor(this.random(i) * 256);
        }
    }

    random(x) {
        const seed = this.seed + x;
        const n = Math.sin(seed * 12.9898 + x * 78.233) * 43758.5453;
        return n - Math.floor(n);
    }

    noise2D(x, y) {
        const X = Math.floor(x) & 255;
        const Y = Math.floor(y) & 255;
        x -= Math.floor(x);
        y -= Math.floor(y);
        const u = this.fade(x);
        const v = this.fade(y);
        const a = this.perm[X] + Y;
        const b = this.perm[X + 1] + Y;
        return this.lerp(v,
            this.lerp(u, this.grad(this.perm[a], x, y), this.grad(this.perm[b], x - 1, y)),
            this.lerp(u, this.grad(this.perm[a + 1], x, y - 1), this.grad(this.perm[b + 1], x - 1, y - 1))
        );
    }

    fade(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    }

    lerp(t, a, b) {
        return a + t * (b - a);
    }

    grad(hash, x, y) {
        const h = hash & 3;
        const u = h < 2 ? x : y;
        const v = h < 2 ? y : x;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    }
}

const noise = new SimplexNoise();

/**
 * Génère un path SVG pour une bractée organique
 * @param {number} centerX - Position X centrale
 * @param {number} centerY - Position Y centrale
 * @param {number} width - Largeur de base
 * @param {number} height - Hauteur de base
 * @param {number} rotation - Rotation en degrés
 * @param {number} seed - Seed pour variations
 * @returns {string} - Path SVG
 */
export const generateOrganicBractPath = (centerX, centerY, width, height, rotation, seed) => {
    const points = 8; // Nombre de points de contrôle
    const irregularity = 0.3; // Niveau d'irrégularité
    const path = [];

    for (let i = 0; i < points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const nextAngle = ((i + 1) / points) * Math.PI * 2;

        // Variation de rayon avec bruit
        const noiseValue = noise.noise2D(
            Math.cos(angle) * 5 + seed,
            Math.sin(angle) * 5 + seed
        );
        const radiusVariation = 1 + (noiseValue * irregularity);

        const x = centerX + Math.cos(angle + rotation * Math.PI / 180) * width * radiusVariation;
        const y = centerY + Math.sin(angle + rotation * Math.PI / 180) * height * radiusVariation;

        // Points de contrôle pour courbes Bézier
        const nextNoiseValue = noise.noise2D(
            Math.cos(nextAngle) * 5 + seed,
            Math.sin(nextAngle) * 5 + seed
        );
        const nextRadiusVariation = 1 + (nextNoiseValue * irregularity);

        const nextX = centerX + Math.cos(nextAngle + rotation * Math.PI / 180) * width * nextRadiusVariation;
        const nextY = centerY + Math.sin(nextAngle + rotation * Math.PI / 180) * height * nextRadiusVariation;

        const midAngle = (angle + nextAngle) / 2;
        const controlDist = Math.sqrt(width * width + height * height) * 0.3;
        const cpX = centerX + Math.cos(midAngle + rotation * Math.PI / 180) * controlDist;
        const cpY = centerY + Math.sin(midAngle + rotation * Math.PI / 180) * controlDist;

        if (i === 0) {
            path.push(`M ${x} ${y}`);
        } else {
            path.push(`Q ${cpX} ${cpY}, ${x} ${y}`);
        }
    }

    path.push('Z');
    return path.join(' ');
};

/**
 * Génère les coordonnées d'une nervure de bractée
 */
export const generateBractVein = (centerX, centerY, width, height, rotation, index) => {
    const angle = rotation * Math.PI / 180;
    const startX = centerX;
    const startY = centerY;
    const endX = centerX + Math.cos(angle + (index - 1) * 0.3 - 0.3) * width * 0.7;
    const endY = centerY + Math.sin(angle + (index - 1) * 0.3 - 0.3) * height * 0.7;

    return {
        path: `M ${startX} ${startY} Q ${(startX + endX) / 2 + noise.noise2D(index, 0) * 2} ${(startY + endY) / 2}, ${endX} ${endY}`,
        opacity: 0.15 + Math.abs(noise.noise2D(index, 1)) * 0.1
    };
};

/**
 * Calcule les paramètres de densité
 */
export const getDensityConfig = (densite) => {
    const configs = {
        0: {
            gap: 45,
            sizeMultiplier: 1.6,
            layerSpacing: 24,
            compactness: 0,
            bractCount: [3, 3, 4, 4, 5, 5, 6, 6]
        },
        5: {
            gap: 15,
            sizeMultiplier: 1,
            layerSpacing: 18,
            compactness: 0.5,
            bractCount: [5, 5, 6, 6, 7, 7, 6, 5]
        },
        10: {
            gap: 8,
            sizeMultiplier: 0.65,
            layerSpacing: 14,
            compactness: 1,
            bractCount: [7, 7, 8, 8, 9, 9, 8, 7]
        }
    };

    // Interpolation linéaire
    const low = Math.floor(densite / 5) * 5;
    const high = Math.min(10, Math.ceil(densite / 5) * 5);
    const t = (densite - low) / 5;

    const interpolate = (a, b, t) => a + (b - a) * t;
    const interpolateArray = (a, b, t) => a.map((val, i) => Math.round(interpolate(val, b[i], t)));

    return {
        gap: interpolate(configs[low].gap, configs[high].gap, t),
        sizeMultiplier: interpolate(configs[low].sizeMultiplier, configs[high].sizeMultiplier, t),
        layerSpacing: interpolate(configs[low].layerSpacing, configs[high].layerSpacing, t),
        compactness: interpolate(configs[low].compactness, configs[high].compactness, t),
        bractCount: interpolateArray(configs[low].bractCount, configs[high].bractCount, t)
    };
};

/**
 * Calcule les paramètres de trichomes
 */
export const getTrichomeConfig = (trichomes) => {
    if (trichomes === 0) {
        return {
            perBract: 0.2,
            types: [{ type: 'sessile', weight: 1 }],
            minSize: 0.8,
            maxSize: 1.1,
            opacity: 0.6,
            glow: false
        };
    }

    const configs = {
        0: {
            perBract: 0.2,
            types: [{ type: 'sessile', weight: 1 }],
            minSize: 0.8,
            maxSize: 1.1,
            opacity: 0.6,
            glow: false
        },
        5: {
            perBract: 3,
            types: [
                { type: 'sessile', weight: 0.3 },
                { type: 'capitatum', weight: 0.5 },
                { type: 'bulbous', weight: 0.2 }
            ],
            minSize: 1.0,
            maxSize: 1.5,
            opacity: 0.85,
            glow: false
        },
        10: {
            perBract: 7,
            types: [
                { type: 'sessile', weight: 0.2 },
                { type: 'capitatum', weight: 0.5 },
                { type: 'bulbous', weight: 0.3 }
            ],
            minSize: 1.3,
            maxSize: 2.2,
            opacity: 0.95,
            glow: true
        }
    };

    const low = Math.floor(trichomes / 5) * 5;
    const high = Math.min(10, Math.ceil(trichomes / 5) * 5);
    const t = (trichomes - low) / 5;

    const interpolate = (a, b, t) => a + (b - a) * t;

    return {
        perBract: interpolate(configs[low].perBract, configs[high].perBract, t),
        types: configs[high].types, // On prend les types du niveau supérieur
        minSize: interpolate(configs[low].minSize, configs[high].minSize, t),
        maxSize: interpolate(configs[low].maxSize, configs[high].maxSize, t),
        opacity: interpolate(configs[low].opacity, configs[high].opacity, t),
        glow: trichomes >= 7
    };
};

/**
 * Calcule les paramètres de pistils
 */
export const getPistilConfig = (pistils) => {
    if (pistils === 0) {
        return {
            perBract: 0.15,
            thickness: 1.5,
            length: 12,
            curliness: 0.5,
            colorStart: '#F97316',
            colorMid: '#FB923C',
            colorEnd: '#FCD34D',
            opacity: 0.6
        };
    }

    const configs = {
        0: {
            perBract: 0.15,
            thickness: 1.5,
            length: 12,
            curliness: 0.5,
            colorStart: '#F97316',
            colorMid: '#FB923C',
            colorEnd: '#FCD34D',
            opacity: 0.6
        },
        5: {
            perBract: 2.5,
            thickness: 2.2,
            length: 20,
            curliness: 1,
            colorStart: '#EA580C',
            colorMid: '#F97316',
            colorEnd: '#FBBF24',
            opacity: 0.85
        },
        10: {
            perBract: 4.5,
            thickness: 3.0,
            length: 28,
            curliness: 1.5,
            colorStart: '#C2410C',
            colorMid: '#EA580C',
            colorEnd: '#F59E0B',
            opacity: 0.95
        }
    };

    const low = Math.floor(pistils / 5) * 5;
    const high = Math.min(10, Math.ceil(pistils / 5) * 5);
    const t = (pistils - low) / 5;

    const interpolate = (a, b, t) => a + (b - a) * t;

    return {
        perBract: interpolate(configs[low].perBract, configs[high].perBract, t),
        thickness: interpolate(configs[low].thickness, configs[high].thickness, t),
        length: interpolate(configs[low].length, configs[high].length, t),
        curliness: interpolate(configs[low].curliness, configs[high].curliness, t),
        colorStart: configs[high].colorStart,
        colorMid: configs[high].colorMid,
        colorEnd: configs[high].colorEnd,
        opacity: interpolate(configs[low].opacity, configs[high].opacity, t)
    };
};

/**
 * Génère un trichome selon son type
 */
export const generateTrichome = (type, baseX, baseY, angle, size, config) => {
    const stemLength = 4 + size * 1.5;
    const tipX = baseX + Math.cos(angle) * stemLength;
    const tipY = baseY - stemLength * 0.8;

    switch (type) {
        case 'capitatum':
            return {
                type: 'capitatum',
                stemPath: `M ${baseX} ${baseY} L ${tipX} ${tipY}`,
                headCx: tipX,
                headCy: tipY,
                headRadius: 1.2 + size * 0.15,
                highlightCx: tipX - (0.3 + size * 0.05),
                highlightCy: tipY - (0.3 + size * 0.05),
                highlightRadius: (0.4 + size * 0.08)
            };

        case 'sessile':
            return {
                type: 'sessile',
                stemPath: `M ${baseX} ${baseY} L ${baseX} ${baseY - stemLength * 0.5}`,
                headCx: baseX,
                headCy: baseY - stemLength * 0.5,
                headRadius: 0.9 + size * 0.1,
                highlightCx: baseX - 0.2,
                highlightCy: baseY - stemLength * 0.5 - 0.2,
                highlightRadius: 0.3 + size * 0.05
            };

        case 'bulbous':
            return {
                type: 'bulbous',
                stemPath: `M ${baseX} ${baseY} Q ${baseX + Math.cos(angle) * stemLength * 0.5} ${baseY - stemLength * 0.4}, ${tipX} ${tipY}`,
                headCx: tipX,
                headCy: tipY,
                headRadius: 1.5 + size * 0.2,
                highlightCx: tipX - (0.4 + size * 0.08),
                highlightCy: tipY - (0.4 + size * 0.08),
                highlightRadius: (0.5 + size * 0.1)
            };

        default:
            return null;
    }
};

/**
 * Calcule la position et intensité d'une ombre
 */
export const calculateShadow = (x, y, depth, lightSource = { x: 60, y: 40 }) => {
    const dx = x - lightSource.x;
    const dy = y - lightSource.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    return {
        offsetX: (dx / distance) * (2 + depth * 0.3),
        offsetY: (dy / distance) * (2 + depth * 0.3),
        blur: 1.5 + depth * 0.4,
        opacity: Math.max(0.1, 0.35 - depth * 0.03)
    };
};
