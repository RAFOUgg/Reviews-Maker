import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

const CANNABIS_COLORS = [
    { id: 'green-lime', hex: '#84CC16' },
    { id: 'green', hex: '#22C55E' },
    { id: 'green-forest', hex: '#166534' },
    { id: 'green-dark', hex: '#14532D' },
    { id: 'blue-green', hex: '#0D9488' },
    { id: 'purple', hex: '#7C3AED' },
    { id: 'purple-dark', hex: '#4C1D95' },
    { id: 'orange', hex: '#EA580C' },
    { id: 'yellow', hex: '#CA8A04' },
    { id: 'brown', hex: '#78350F' }
];

// Fonction pour assombrir une couleur
const darkenColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(0, ((num >> 16) & 0xff) * (1 - percent));
    const g = Math.max(0, ((num >> 8) & 0xff) * (1 - percent));
    const b = Math.max(0, (num & 0xff) * (1 - percent));
    return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
};

// Fonction pour éclaircir une couleur
const lightenColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, ((num >> 16) & 0xff) + (255 - ((num >> 16) & 0xff)) * percent);
    const g = Math.min(255, ((num >> 8) & 0xff) + (255 - ((num >> 8) & 0xff)) * percent);
    const b = Math.min(255, (num & 0xff) + (255 - (num & 0xff)) * percent);
    return `#${((1 << 24) + (Math.round(r) << 16) + (Math.round(g) << 8) + Math.round(b)).toString(16).slice(1)}`;
};

const WeedPreview = ({
    selectedColors = [],
    densite = 5,
    trichomes = 5,
    pistils = 5,
    manucure = 5,
    moisissure = 10,
    graines = 10
}) => {
    // Couleur de base
    const baseColor = useMemo(() => {
        if (!selectedColors || selectedColors.length === 0) return '#22C55E';
        const greenColor = selectedColors.find(s => s.colorId.includes('green'));
        if (greenColor) {
            const colorData = CANNABIS_COLORS.find(c => c.id === greenColor.colorId);
            return colorData?.hex || '#22C55E';
        }
        return CANNABIS_COLORS.find(c => c.id === selectedColors[0].colorId)?.hex || '#22C55E';
    }, [selectedColors]);

    // Répartition des couleurs sur 45 bractées
    const bractColors = useMemo(() => {
        if (!selectedColors || selectedColors.length === 0) {
            return Array(45).fill('#22C55E');
        }

        const colors = [];
        selectedColors.forEach(selected => {
            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
            const count = Math.round((selected.percentage / 100) * 45);
            for (let i = 0; i < count; i++) {
                colors.push(colorData?.hex || '#22C55E');
            }
        });

        while (colors.length < 45) colors.push(baseColor);
        if (colors.length > 45) colors.length = 45;

        return colors;
    }, [selectedColors, baseColor]);

    // Structure 3D de cola avec bractées en forme d'écailles
    const bracts = useMemo(() => {
        const items = [];
        const layers = 8;

        const compactness = densite / 10;

        let colorIndex = 0;
        for (let layer = 0; layer < layers; layer++) {
            const layerRadius = 50 - layer * 5;
            const layerY = 80 + layer * 18;
            const bractCount = Math.max(3, Math.round(7 - layer * 0.5));

            for (let i = 0; i < bractCount; i++) {
                const angle = (i / bractCount) * Math.PI * 2 + layer * 0.4;
                const radiusVariation = 1 - (1 - compactness) * 0.3;
                const x = 120 + Math.cos(angle) * layerRadius * radiusVariation;
                const y = layerY + Math.sin(angle) * layerRadius * 0.4 * radiusVariation;

                const baseSize = 14 - layer * 0.8;
                const size = baseSize * (1.2 - compactness * 0.4);

                const scaleWidth = size * (1.2 + Math.sin(angle * 3) * 0.2);
                const scaleHeight = size * (0.9 + Math.cos(angle * 2) * 0.15);

                items.push({
                    x, y,
                    width: scaleWidth,
                    height: scaleHeight,
                    color: bractColors[colorIndex % bractColors.length],
                    rotation: (angle * 180 / Math.PI) + 90 + (Math.sin(layer * i) * 15),
                    depth: layer,
                    delay: layer * 0.05 + i * 0.02
                });
                colorIndex++;
            }
        }
        return items;
    }, [densite, bractColors]);

    // Feuilles dentelées réalistes
    const leaves = useMemo(() => {
        const leafCount = Math.max(0, Math.round((1 - manucure / 10) * 7));
        const items = [];

        for (let i = 0; i < leafCount; i++) {
            const angle = -60 + (i / Math.max(1, leafCount - 1)) * 120;
            const rad = (angle * Math.PI) / 180;

            const baseX = 120;
            const baseY = 200;
            const length = 50 + Math.sin(i * 0.7) * 8;
            const dentelureSize = (j === 0 || j === 7) ? 0 : 12 * (1 - Math.abs(t - 0.5) * 2);
            const perpX = leafX + Math.cos(rad + Math.PI / 2) * dentelureSize * (j % 2 === 0 ? 1 : -1);
            const perpY = leafY + Math.sin(rad + Math.PI / 2) * dentelureSize * (j % 2 === 0 ? 1 : -1);
            points.push(`${perpX},${perpY}`);
        }

        items.push({
            points: points.join(' '),
            color: darkenColor(baseColor, 0.2),
            delay: i * 0.04,
            opacity: 1 - manucure / 10
        });
    }
        return items;
}, [manucure, baseColor]);

// Pistils organiques bouclés
const pistilStrands = useMemo(() => {
    const count = Math.round((pistils / 10) * 35);
    const items = [];

    bracts.forEach((bract, i) => {
        if (i >= count) return;

        const angle = Math.atan2(bract.y - 150, bract.x - 120);
        const length = 18 + pistils * 2.5;
        const curl = Math.sin(i * 0.8) * 10;

        const baseX = bract.x;
        const baseY = bract.y;
        const ctrl1X = baseX + Math.cos(angle) * length * 0.4 + curl;
        const ctrl1Y = baseY + Math.sin(angle) * length * 0.4;
        const ctrl2X = baseX + Math.cos(angle) * length * 0.7 - curl * 0.5;
        const ctrl2Y = baseY + Math.sin(angle) * length * 0.7;
        const tipX = baseX + Math.cos(angle) * length;
        const tipY = baseY + Math.sin(angle) * length * 0.6;

        items.push({
            baseX, baseY,
            ctrl1X, ctrl1Y,
            ctrl2X, ctrl2Y,
            tipX, tipY,
            delay: bract.delay + 0.3
        });
    });
    return items;
}, [pistils, bracts]);

// Trichomes cristallins réalistes
const trichomeGlands = useMemo(() => {
    const count = Math.round((trichomes / 10) * 60);
    const items = [];

    bracts.forEach((bract, i) => {
        if (i >= count) return;

        const trichomesPerBract = Math.ceil(trichomes / 3);
        for (let t = 0; t < trichomesPerBract; t++) {
            const offsetAngle = (i * 137.5 + t * 45) * Math.PI / 180;
            const offsetDist = 4 + (t * 3);

            const baseX = bract.x + Math.cos(offsetAngle) * offsetDist;
            const baseY = bract.y + Math.sin(offsetAngle) * offsetDist;
            const stemLength = 5 + trichomes * 0.35;
            const bulbSize = 1.1 + trichomes * 0.12;

            items.push({
                baseX,
                baseY,
                tipX: baseX + Math.cos(offsetAngle - 0.3) * stemLength,
                tipY: baseY - stemLength * 0.9,
                bulbSize,
                delay: bract.delay + 0.4 + t * 0.05
            });
        }
    });
    return items;
}, [trichomes, bracts]);

// Moisissure
const moldSpots = useMemo(() => {
    const count = Math.round((moisissure / 10) * 8);
    const items = [];
    for (let i = 0; i < 8 - count; i++) {
        const bract = bracts[i * 3 % bracts.length];
        items.push({
            x: bract.x + (Math.sin(i * 2.3) * 8),
            y: bract.y + (Math.cos(i * 1.7) * 8),
            size: 4 + Math.abs(Math.sin(i)) * 3,
            delay: 0.8 + i * 0.06
        });
    }
    return items;
}, [moisissure, bracts]);

// Graines
const seeds = useMemo(() => {
    const count = Math.round((graines / 10) * 6);
    const items = [];
    for (let i = 0; i < 6 - count; i++) {
        const bract = bracts[Math.floor(i * 7) % bracts.length];
        items.push({
            x: bract.x,
            y: bract.y,
            rotation: i * 35,
            delay: 0.9 + i * 0.08
        });
    }
    return items;
}, [graines, bracts]);

return (
    <div className="relative">
        <div className="flex items-center justify-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <h4 className="text-lg font-semibold text-white">Aperçu colorimétrique</h4>
        </div>

        <div className="relative flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-700 p-8">
            <motion.svg
                width="300"
                height="380"
                viewBox="0 0 240 300"
                className="relative z-10 drop-shadow-2xl"
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            >
                <defs>
                    <radialGradient id="bractDepth">
                        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
                        <stop offset="60%" stopColor="rgba(255,255,255,0)" />
                        <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
                    </radialGradient>

                    <filter id="softShadow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="1" dy="2" result="offsetblur" />
                        <feComponentTransfer>
                            <feFuncA type="linear" slope="0.3" />
                        </feComponentTransfer>
                        <feMerge>
                            <feMergeNode />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>

                    <radialGradient id="trichomeGlow">
                        <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                        <stop offset="60%" stopColor="rgba(240,248,255,0.9)" />
                        <stop offset="100%" stopColor="rgba(200,220,240,0.7)" />
                    </radialGradient>
                </defs>

                {/* Forme de base du cola (structure compacte) */}
                <motion.path
                    d="M 120 50 C 108 52, 98 65, 95 85 C 92 105, 90 130, 88 155 C 87 175, 88 195, 95 210 C 100 220, 110 228, 120 230 C 130 228, 140 220, 145 210 C 152 195, 153 175, 152 155 C 150 130, 148 105, 145 85 C 142 65, 132 52, 120 50 Z"
                    fill={baseColor}
                    fillOpacity="0.4"
                    stroke={darkenColor(baseColor, 0.2)}
                    strokeWidth="1.5"
                    initial={{ scaleY: 0, opacity: 0 }}
                    animate={{ scaleY: 1, opacity: 0.4 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                />

                {/* Masses vertes pour remplir le cola */}
                <motion.ellipse
                    cx="120"
                    cy="100"
                    rx="28"
                    ry="45"
                    fill={darkenColor(baseColor, 0.1)}
                    fillOpacity="0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.15 }}
                />
                <motion.ellipse
                    cx="120"
                    cy="140"
                    rx="32"
                    ry="50"
                    fill={darkenColor(baseColor, 0.15)}
                    fillOpacity="0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.18 }}
                />
                <motion.ellipse
                    cx="120"
                    cy="180"
                    rx="30"
                    ry="40"
                    fill={darkenColor(baseColor, 0.2)}
                    fillOpacity="0.5"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                />

                {/* Feuilles dentelées réalistes */}
                {leaves.map((leaf, i) => (
                    <motion.polygon
                        key={`leaf-${i}`}
                        points={leaf.points}
                        fill={leaf.color}
                        fillOpacity={leaf.opacity * 0.85}
                        stroke={darkenColor(leaf.color, 0.4)}
                        strokeWidth="1.2"
                        strokeLinejoin="round"
                        filter="url(#softShadow)"
                        initial={{ scale: 0, opacity: 0, rotate: -15 }}
                        animate={{ scale: 1, opacity: leaf.opacity * 0.85, rotate: 0 }}
                        transition={{ duration: 0.5, delay: leaf.delay, type: "spring" }}
                    />
                ))}

                {/* Tige principale */}
                <motion.rect
                    x="115"
                    y="220"
                    width="10"
                    height="45"
                    rx="5"
                    fill={darkenColor(baseColor, 0.3)}
                    stroke={darkenColor(baseColor, 0.5)}
                    strokeWidth="1"
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, delay: 0.2 }}
                />

                {/* Bractées en forme d'écailles avec texture 3D */}
                {bracts.map((bract, i) => (
                    <g key={`bract-${i}`} transform={`rotate(${bract.rotation} ${bract.x} ${bract.y})`}>
                        <motion.ellipse
                            cx={bract.x + 1}
                            cy={bract.y + 2}
                            rx={bract.width}
                            ry={bract.height}
                            fill="rgba(0,0,0,0.25)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.25 }}
                            transition={{ duration: 0.4, delay: bract.delay }}
                        />

                        <motion.ellipse
                            cx={bract.x}
                            cy={bract.y}
                            rx={bract.width}
                            ry={bract.height}
                            fill={bract.color}
                            stroke={darkenColor(bract.color, 0.3)}
                            strokeWidth="1"
                            filter="url(#softShadow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.45, delay: bract.delay, type: "spring", stiffness: 120 }}
                        />

                        <motion.ellipse
                            cx={bract.x - bract.width * 0.25}
                            cy={bract.y - bract.height * 0.25}
                            rx={bract.width * 0.4}
                            ry={bract.height * 0.35}
                            fill="url(#bractDepth)"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            transition={{ duration: 0.3, delay: bract.delay + 0.1 }}
                        />

                        <motion.line
                            x1={bract.x}
                            y1={bract.y - bract.height * 0.8}
                            x2={bract.x}
                            y2={bract.y + bract.height * 0.8}
                            stroke={lightenColor(bract.color, 0.2)}
                            strokeWidth="0.6"
                            opacity="0.4"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3, delay: bract.delay + 0.15 }}
                        />
                    </g>
                ))}

                {/* Pistils organiques */}
                {pistilStrands.map((pistil, i) => (
                    <g key={`pistil-${i}`}>
                        <motion.path
                            d={`M ${pistil.baseX} ${pistil.baseY} C ${pistil.ctrl1X} ${pistil.ctrl1Y}, ${pistil.ctrl2X} ${pistil.ctrl2Y}, ${pistil.tipX} ${pistil.tipY}`}
                            stroke="#EA580C"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            fill="none"
                            opacity="0.95"
                            filter="url(#softShadow)"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.95 }}
                            transition={{ duration: 0.6, delay: pistil.delay, ease: "easeOut" }}
                        />

                        <motion.path
                            d={`M ${pistil.baseX} ${pistil.baseY} C ${pistil.ctrl1X} ${pistil.ctrl1Y}, ${pistil.ctrl2X} ${pistil.ctrl2Y}, ${pistil.tipX} ${pistil.tipY}`}
                            stroke="#FBBF24"
                            strokeWidth="1.2"
                            strokeLinecap="round"
                            fill="none"
                            opacity="0.6"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.6 }}
                            transition={{ duration: 0.5, delay: pistil.delay + 0.05, ease: "easeOut" }}
                        />
                    </g>
                ))}

                {/* Trichomes cristallins */}
                {trichomeGlands.map((trich, i) => (
                    <g key={`trichome-${i}`}>
                        <motion.line
                            x1={trich.baseX}
                            y1={trich.baseY}
                            x2={trich.tipX}
                            y2={trich.tipY}
                            stroke="rgba(245,250,255,0.85)"
                            strokeWidth="0.6"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.85 }}
                            transition={{ duration: 0.35, delay: trich.delay }}
                        />

                        <motion.circle
                            cx={trich.tipX}
                            cy={trich.tipY}
                            r={trich.bulbSize}
                            fill="url(#trichomeGlow)"
                            stroke="rgba(230,240,255,0.7)"
                            strokeWidth="0.4"
                            filter="url(#softShadow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{
                                scale: [0, 1.1, 1],
                                opacity: [0, 1, 0.95]
                            }}
                            transition={{ duration: 0.4, delay: trich.delay + 0.1, times: [0, 0.6, 1] }}
                        />

                        <motion.circle
                            cx={trich.tipX - trich.bulbSize * 0.3}
                            cy={trich.tipY - trich.bulbSize * 0.3}
                            r={trich.bulbSize * 0.35}
                            fill="rgba(255,255,255,0.9)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.25, delay: trich.delay + 0.15 }}
                        />
                    </g>
                ))}

                {/* Moisissure */}
                {moldSpots.map((mold, i) => (
                    <g key={`mold-${i}`}>
                        <motion.ellipse
                            cx={mold.x}
                            cy={mold.y}
                            rx={mold.size * 1.2}
                            ry={mold.size}
                            fill="#1a1410"
                            opacity="0.7"
                            filter="url(#softShadow)"
                            initial={{ scale: 0, rotate: 0 }}
                            animate={{ scale: 1, rotate: 360 }}
                            transition={{ duration: 0.5, delay: mold.delay }}
                        />

                        <motion.ellipse
                            cx={mold.x + Math.sin(i) * 0.8}
                            cy={mold.y + Math.cos(i) * 0.8}
                            rx={mold.size * 0.45}
                            ry={mold.size * 0.35}
                            fill="#e8e4d8"
                            opacity="0.8"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.3, delay: mold.delay + 0.1 }}
                        />
                    </g>
                ))}

                {/* Graines */}
                {seeds.map((seed, i) => (
                    <g key={`seed-${i}`} transform={`rotate(${seed.rotation} ${seed.x} ${seed.y})`}>
                        <motion.ellipse
                            cx={seed.x}
                            cy={seed.y}
                            rx="4.5"
                            ry="6.5"
                            fill="#B7A07D"
                            stroke="#5C4933"
                            strokeWidth="0.8"
                            filter="url(#softShadow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: seed.delay }}
                        />

                        <motion.path
                            d={`M ${seed.x - 2.5} ${seed.y - 2} Q ${seed.x} ${seed.y} ${seed.x - 1.5} ${seed.y + 3}`}
                            stroke="#6B5842"
                            strokeWidth="0.5"
                            fill="none"
                            opacity="0.8"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ duration: 0.3, delay: seed.delay + 0.1 }}
                        />

                        <motion.circle
                            cx={seed.x - 0.8}
                            cy={seed.y - 1.2}
                            r="0.6"
                            fill="#3B2F25"
                            opacity="0.7"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.2, delay: seed.delay + 0.15 }}
                        />
                    </g>
                ))}

                {/* Effet de brillance globale */}
                {trichomes > 5 && (
                    <>
                        {[...Array(8)].map((_, i) => {
                            const angle = (i / 8) * Math.PI * 2;
                            const radius = 40 + i * 8;
                            const x = 120 + Math.cos(angle) * radius;
                            const y = 140 + Math.sin(angle) * radius * 0.7;
                            return (
                                <motion.circle
                                    key={`sparkle-${i}`}
                                    cx={x}
                                    cy={y}
                                    r="1.2"
                                    fill="white"
                                    opacity="0"
                                    animate={{
                                        opacity: [0, 0.9, 0],
                                        scale: [0.5, 1.3, 0.5]
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.25,
                                        ease: "easeInOut"
                                    }}
                                />
                            );
                        })}
                    </>
                )}
            </motion.svg>
        </div>

        {/* Légende couleurs */}
        {selectedColors && selectedColors.length > 0 && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-4"
            >
                <div className="text-xs text-gray-400 mb-3 font-medium">Couleurs appliquées :</div>
                <div className="flex items-center gap-2 h-8 rounded-lg overflow-hidden border border-gray-600 shadow-inner">
                    {selectedColors.map((selected, index) => {
                        const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
                        return (
                            <motion.div
                                key={selected.colorId}
                                initial={{ width: 0 }}
                                animate={{ width: `${selected.percentage}%` }}
                                transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                                style={{ backgroundColor: colorData?.hex }}
                                className="h-full"
                                title={`${colorData?.id} - ${selected.percentage}%`}
                            />
                        );
                    })}
                </div>
            </motion.div>
        )}
    </div>
);
};

export default WeedPreview;
