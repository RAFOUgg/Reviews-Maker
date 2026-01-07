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

const WeedPreview = ({
    selectedColors = [],
    densite = 5,
    trichomes = 5,
    pistils = 5,
    manucure = 5,
    moisissure = 10,
    graines = 10
}) => {
    // Couleur de base (prend la première couleur verte ou la première couleur sélectionnée)
    const baseColor = useMemo(() => {
        if (!selectedColors || selectedColors.length === 0) return '#22C55E';
        const greenColor = selectedColors.find(s => s.colorId.includes('green'));
        if (greenColor) {
            const colorData = CANNABIS_COLORS.find(c => c.id === greenColor.colorId);
            return colorData?.hex || '#22C55E';
        }
        return CANNABIS_COLORS.find(c => c.id === selectedColors[0].colorId)?.hex || '#22C55E';
    }, [selectedColors]);

    // Répartition des couleurs sur 30 bractées selon les pourcentages
    const bractColors = useMemo(() => {
        if (!selectedColors || selectedColors.length === 0) {
            return Array(30).fill('#22C55E');
        }

        const colors = [];
        selectedColors.forEach(selected => {
            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
            const count = Math.round((selected.percentage / 100) * 30);
            for (let i = 0; i < count; i++) {
                colors.push(colorData?.hex || '#22C55E');
            }
        });

        while (colors.length < 30) colors.push(baseColor);
        if (colors.length > 30) colors.length = 30;

        return colors;
    }, [selectedColors, baseColor]);

    // Bractées organisées en spirale (5 anneaux)
    const bracts = useMemo(() => {
        const items = [];
        const rings = [
            { count: 1, radius: 0, size: 8 },      // Sommet
            { count: 5, radius: 15, size: 10 },    // Anneau 1
            { count: 7, radius: 28, size: 12 },    // Anneau 2
            { count: 9, radius: 42, size: 13 },    // Anneau 3
            { count: 8, radius: 56, size: 12 }     // Anneau 4 (base)
        ];

        let colorIndex = 0;
        rings.forEach((ring, ringIdx) => {
            for (let i = 0; i < ring.count; i++) {
                const angle = (i / ring.count) * Math.PI * 2 + ringIdx * 0.3;
                const x = 120 + Math.cos(angle) * ring.radius * (1 - (10 - densite) * 0.02);
                const y = 150 - ringIdx * 20 + Math.sin(angle) * ring.radius * 0.6;
                const size = ring.size * (1 + densite * 0.03);

                items.push({
                    x, y,
                    size,
                    color: bractColors[colorIndex % bractColors.length],
                    delay: ringIdx * 0.08 + i * 0.02
                });
                colorIndex++;
            }
        });
        return items;
    }, [densite, bractColors]);

    // Feuilles résineuses (disparaissent avec manucure)
    const leaves = useMemo(() => {
        const leafCount = Math.max(0, Math.round((1 - manucure / 10) * 6));
        const items = [];
        for (let i = 0; i < leafCount; i++) {
            const angle = -30 + (i / Math.max(1, leafCount - 1)) * 60;
            const rad = (angle * Math.PI) / 180;
            const length = 55;
            const width = 18;

            const baseX = 120 + Math.cos(rad) * 25;
            const baseY = 200;
            const tipX = baseX + Math.cos(rad) * length;
            const tipY = baseY + Math.sin(rad) * length;

            items.push({
                x: baseX,
                y: baseY,
                tipX,
                tipY,
                width,
                delay: i * 0.04
            });
        }
        return items;
    }, [manucure]);

    // Pistils (fils orangés sortant des bractées)
    const pistilStrands = useMemo(() => {
        const count = Math.round((pistils / 10) * 20);
        const items = [];
        bracts.forEach((bract, i) => {
            if (i >= count) return;
            const angle = Math.atan2(bract.y - 150, bract.x - 120);
            const length = 15 + pistils * 1.5;

            items.push({
                baseX: bract.x,
                baseY: bract.y,
                tipX: bract.x + Math.cos(angle) * length,
                tipY: bract.y + Math.sin(angle) * length * 0.7,
                delay: bract.delay + 0.3
            });
        });
        return items;
    }, [pistils, bracts]);

    // Trichomes (tige fine + bulbe transparent)
    const trichomeGlands = useMemo(() => {
        const count = Math.round((trichomes / 10) * 40);
        const items = [];
        bracts.forEach((bract, i) => {
            if (i >= count) return;
            const offsetAngle = (i * 137.5) * Math.PI / 180;
            const offsetDist = 3 + (i % 5);

            const baseX = bract.x + Math.cos(offsetAngle) * offsetDist;
            const baseY = bract.y + Math.sin(offsetAngle) * offsetDist;
            const stemLength = 4 + trichomes * 0.2;
            const bulbSize = 0.9 + trichomes * 0.08;

            items.push({
                baseX,
                baseY,
                tipX: baseX + Math.cos(offsetAngle - 0.5) * stemLength,
                tipY: baseY - stemLength,
                bulbSize,
                delay: bract.delay + 0.4
            });
        });
        return items;
    }, [trichomes, bracts]);

    // Moisissure (taches sombres avec centre clair)
    const moldSpots = useMemo(() => {
        const count = Math.round(((10 - moisissure) / 10) * 8);
        const items = [];
        for (let i = 0; i < count; i++) {
            const bract = bracts[i % bracts.length];
            items.push({
                x: bract.x + (Math.sin(i * 2.3) * 6),
                y: bract.y + (Math.cos(i * 1.7) * 6),
                size: 3 + Math.abs(Math.sin(i)) * 2.5,
                delay: 0.8 + i * 0.06
            });
        }
        return items;
    }, [moisissure, bracts]);

    // Graines (dans les bractées)
    const seeds = useMemo(() => {
        const count = Math.round(((10 - graines) / 10) * 5);
        const items = [];
        for (let i = 0; i < count; i++) {
            const bract = bracts[Math.floor(i * 6) % bracts.length];
            items.push({
                x: bract.x,
                y: bract.y,
                rotation: i * 30,
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
                    width="280"
                    height="360"
                    viewBox="0 0 240 300"
                    className="relative z-10 drop-shadow-2xl"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Feuilles résineuses */}
                    {leaves.map((leaf, i) => (
                        <motion.ellipse
                            key={`leaf-${i}`}
                            cx={(leaf.x + leaf.tipX) / 2}
                            cy={(leaf.y + leaf.tipY) / 2}
                            rx={leaf.width}
                            ry={Math.abs(leaf.tipY - leaf.y) / 2}
                            fill={baseColor}
                            fillOpacity="0.6"
                            stroke={baseColor}
                            strokeWidth="1.5"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 0.8 * (1 - manucure / 10) }}
                            transition={{ duration: 0.4, delay: leaf.delay }}
                        />
                    ))}

                    {/* Bractées */}
                    {bracts.map((bract, i) => (
                        <motion.circle
                            key={`bract-${i}`}
                            cx={bract.x}
                            cy={bract.y}
                            r={bract.size}
                            fill={bract.color}
                            stroke="#1a1a1a"
                            strokeWidth="0.8"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.35, delay: bract.delay }}
                        />
                    ))}

                    {/* Pistils */}
                    {pistilStrands.map((pistil, i) => (
                        <motion.line
                            key={`pistil-${i}`}
                            x1={pistil.baseX}
                            y1={pistil.baseY}
                            x2={pistil.tipX}
                            y2={pistil.tipY}
                            stroke="#D97706"
                            strokeWidth="2"
                            strokeLinecap="round"
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: 0.9 }}
                            transition={{ duration: 0.4, delay: pistil.delay }}
                        />
                    ))}

                    {/* Trichomes */}
                    {trichomeGlands.map((trich, i) => (
                        <g key={`trichome-${i}`}>
                            {/* Tige */}
                            <motion.line
                                x1={trich.baseX}
                                y1={trich.baseY}
                                x2={trich.tipX}
                                y2={trich.tipY}
                                stroke="rgba(240,240,240,0.7)"
                                strokeWidth="0.5"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 1 }}
                                transition={{ duration: 0.3, delay: trich.delay }}
                            />
                            {/* Bulbe */}
                            <motion.circle
                                cx={trich.tipX}
                                cy={trich.tipY}
                                r={trich.bulbSize}
                                fill="rgba(255,255,255,0.9)"
                                stroke="rgba(230,230,230,0.5)"
                                strokeWidth="0.3"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.25, delay: trich.delay + 0.1 }}
                            />
                        </g>
                    ))}

                    {/* Moisissure */}
                    {moldSpots.map((mold, i) => (
                        <g key={`mold-${i}`}>
                            <motion.circle
                                cx={mold.x}
                                cy={mold.y}
                                r={mold.size}
                                fill="#1a1410"
                                opacity="0.6"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: mold.delay }}
                            />
                            <motion.circle
                                cx={mold.x}
                                cy={mold.y}
                                r={mold.size * 0.4}
                                fill="#e8e4d8"
                                opacity="0.7"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.25, delay: mold.delay + 0.05 }}
                            />
                        </g>
                    ))}

                    {/* Graines */}
                    {seeds.map((seed, i) => (
                        <g key={`seed-${i}`} transform={`rotate(${seed.rotation} ${seed.x} ${seed.y})`}>
                            <motion.ellipse
                                cx={seed.x}
                                cy={seed.y}
                                rx="4"
                                ry="6"
                                fill="#B7A07D"
                                stroke="#5C4933"
                                strokeWidth="0.7"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.3, delay: seed.delay }}
                            />
                            <motion.line
                                x1={seed.x - 2}
                                y1={seed.y}
                                x2={seed.x + 2}
                                y2={seed.y}
                                stroke="#6B5842"
                                strokeWidth="0.4"
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 0.2, delay: seed.delay + 0.1 }}
                            />
                        </g>
                    ))}
                </motion.svg>
            </div>

            {/* Légende couleurs */}
            {selectedColors && selectedColors.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mt-6 bg-gray-800/30 border border-gray-700 rounded-xl p-4"
                >
                    <div className="text-xs text-gray-400 mb-3 font-medium">Couleurs appliquées :</div>
                    <div className="flex items-center gap-2 h-8 rounded-lg overflow-hidden border border-gray-600">
                        {selectedColors.map((selected, index) => {
                            const colorData = CANNABIS_COLORS.find(c => c.id === selected.colorId);
                            return (
                                <div
                                    key={selected.colorId}
                                    style={{
                                        width: `${selected.percentage}%`,
                                        backgroundColor: colorData?.hex
                                    }}
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
