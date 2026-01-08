import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

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

const darkenColor = (hex, percent) => {
    const num = parseInt(hex.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent * 100);
    const R = Math.max((num >> 16) - amt, 0);
    const G = Math.max((num >> 8 & 0x00FF) - amt, 0);
    const B = Math.max((num & 0x0000FF) - amt, 0);
    return '#' + ((R << 16) | (G << 8) | B).toString(16).padStart(6, '0');
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
    const baseColor = useMemo(() => {
        if (!selectedColors || selectedColors.length === 0) return '#22C55E';
        const firstColor = CANNABIS_COLORS.find(c => c.id === selectedColors[0].colorId);
        return firstColor?.hex || '#22C55E';
    }, [selectedColors]);

    const bracts = useMemo(() => {
        const items = [];
        const gap = Math.max(3, 12 - densite);
        const layers = 6;

        let colorIndex = 0;
        for (let layer = 0; layer < layers; layer++) {
            const layerRadius = 40 - layer * 4;
            const layerY = 100 + layer * gap;
            const bractCount = Math.max(4, Math.round(8 - layer * 0.8));

            for (let i = 0; i < bractCount; i++) {
                const angle = (i / bractCount) * Math.PI * 2 + layer * 0.3;
                const x = 120 + Math.cos(angle) * layerRadius;
                const y = layerY + Math.sin(angle) * layerRadius * 0.5;
                const rx = 12 - layer * 1;
                const ry = 18 - layer * 1.5;

                let bractColor = baseColor;
                if (selectedColors && selectedColors.length > 0) {
                    const selectedColor = selectedColors[colorIndex % selectedColors.length];
                    const colorData = CANNABIS_COLORS.find(c => c.id === selectedColor.colorId);
                    bractColor = colorData?.hex || baseColor;
                }

                items.push({
                    x, y, rx, ry,
                    color: bractColor,
                    rotation: (angle * 180 / Math.PI) + 90,
                    delay: layer * 0.05 + i * 0.01
                });
                colorIndex++;
            }
        }
        return items;
    }, [densite, selectedColors, baseColor]);

    const pistilStrands = useMemo(() => {
        const items = [];
        const pistilCount = Math.round((pistils / 10) * bracts.length * 0.5);

        for (let i = 0; i < pistilCount; i++) {
            const bract = bracts[i % bracts.length];
            const angle = Math.atan2(bract.y - 120, bract.x - 120);
            const length = 15 + Math.random() * 10;

            items.push({
                x1: bract.x,
                y1: bract.y,
                x2: bract.x + Math.cos(angle) * length,
                y2: bract.y + Math.sin(angle) * length * 0.7,
                delay: bract.delay + 0.2
            });
        }
        return items;
    }, [pistils, bracts]);

    const trichomeGlands = useMemo(() => {
        const items = [];
        const trichomeCount = Math.round((trichomes / 10) * bracts.length * 0.6);

        for (let i = 0; i < trichomeCount; i++) {
            const bract = bracts[i % bracts.length];
            const offsetAngle = (i * 45) * Math.PI / 180;
            const offsetDist = 3 + Math.random() * 5;

            items.push({
                cx: bract.x + Math.cos(offsetAngle) * offsetDist,
                cy: bract.y + Math.sin(offsetAngle) * offsetDist,
                r: 1.5 + Math.random() * 1,
                delay: bract.delay + 0.3
            });
        }
        return items;
    }, [trichomes, bracts]);

    const moldSpots = useMemo(() => {
        const count = Math.round((10 - moisissure) / 10 * 5);
        const items = [];
        for (let i = 0; i < count; i++) {
            const bract = bracts[i * 3 % bracts.length];
            items.push({
                x: bract.x,
                y: bract.y,
                size: 3 + Math.random() * 2,
                delay: 0.6 + i * 0.05
            });
        }
        return items;
    }, [moisissure, bracts]);

    const seedSpots = useMemo(() => {
        const count = Math.round((10 - graines) / 10 * 3);
        const items = [];
        for (let i = 0; i < count; i++) {
            const bract = bracts[i * 5 % bracts.length];
            items.push({
                x: bract.x,
                y: bract.y,
                delay: 0.7 + i * 0.05
            });
        }
        return items;
    }, [graines, bracts]);

    return (
        <div className="relative flex items-center justify-center w-full h-full min-h-[350px] bg-gradient-to-b from-gray-900 to-gray-800 rounded-lg">
            <svg
                viewBox="0 0 240 280"
                className="w-full h-full"
                style={{ maxWidth: '400px', maxHeight: '400px' }}
            >
                <defs>
                    {bracts.map((bract, i) => (
                        <radialGradient key={`bract-grad-${i}`} id={`bract-grad-${i}`}>
                            <stop offset="0%" stopColor={bract.color} stopOpacity="1" />
                            <stop offset="100%" stopColor={darkenColor(bract.color, 0.3)} stopOpacity="1" />
                        </radialGradient>
                    ))}
                </defs>

                {/* Tige */}
                <motion.rect
                    x="115"
                    y="200"
                    width="10"
                    height="60"
                    rx="5"
                    fill={darkenColor(baseColor, 0.3)}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                />

                {/* Bractées */}
                {bracts.map((bract, i) => (
                    <motion.ellipse
                        key={`bract-${i}`}
                        cx={bract.x}
                        cy={bract.y}
                        rx={bract.rx}
                        ry={bract.ry}
                        fill={`url(#bract-grad-${i})`}
                        stroke={darkenColor(bract.color, 0.2)}
                        strokeWidth="0.5"
                        transform={`rotate(${bract.rotation} ${bract.x} ${bract.y})`}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3, delay: bract.delay }}
                    />
                ))}

                {/* Pistils */}
                {pistilStrands.map((pistil, i) => (
                    <motion.line
                        key={`pistil-${i}`}
                        x1={pistil.x1}
                        y1={pistil.y1}
                        x2={pistil.x2}
                        y2={pistil.y2}
                        stroke="#EA580C"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 0.8 }}
                        transition={{ duration: 0.3, delay: pistil.delay }}
                    />
                ))}

                {/* Trichomes */}
                {trichomeGlands.map((trichome, i) => (
                    <motion.circle
                        key={`trichome-${i}`}
                        cx={trichome.cx}
                        cy={trichome.cy}
                        r={trichome.r}
                        fill="rgba(255,255,255,0.9)"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.8 }}
                        transition={{ duration: 0.2, delay: trichome.delay }}
                    />
                ))}

                {/* Moisissure */}
                {moldSpots.map((mold, i) => (
                    <motion.circle
                        key={`mold-${i}`}
                        cx={mold.x}
                        cy={mold.y}
                        r={mold.size}
                        fill="#6B7280"
                        opacity="0.6"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: mold.delay }}
                    />
                ))}

                {/* Graines */}
                {seedSpots.map((seed, i) => (
                    <motion.ellipse
                        key={`seed-${i}`}
                        cx={seed.x}
                        cy={seed.y}
                        rx="3"
                        ry="4"
                        fill="#78350F"
                        stroke="#451A03"
                        strokeWidth="0.5"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.3, delay: seed.delay }}
                    />
                ))}
            </svg>

            {/* Légende couleurs */}
            {selectedColors && selectedColors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute bottom-4 left-4 right-4 bg-gray-800/50 border border-gray-700 rounded-lg p-3"
                >
                    <div className="text-xs text-gray-400 mb-2">Couleurs</div>
                    <div className="flex gap-1 h-4 rounded overflow-hidden">
                        {selectedColors.map((selected, index) => {
                            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
                            return (
                                <div
                                    key={selected.colorId}
                                    style={{
                                        backgroundColor: colorData?.hex,
                                        width: `${selected.percentage}%`
                                    }}
                                    className="h-full"
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
