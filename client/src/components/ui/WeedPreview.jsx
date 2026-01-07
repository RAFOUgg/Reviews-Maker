import React, { useMemo, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import {
    darkenColor,
    lightenColor,
    generateOrganicBractPath,
    generateBractVein,
    getDensityConfig,
    getTrichomeConfig,
    getPistilConfig,
    generateTrichome,
    calculateShadow
} from '../../utils/cannabisGeometry';

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
    // Smooth transitions pour les paramètres
    const [smoothParams, setSmoothParams] = useState({ densite, trichomes, pistils });
    const [targetParams, setTargetParams] = useState({ densite, trichomes, pistils });

    useEffect(() => {
        setTargetParams({ densite, trichomes, pistils });
    }, [densite, trichomes, pistils]);

    useEffect(() => {
        const interval = setInterval(() => {
            setSmoothParams(current => {
                const diff = {
                    densite: targetParams.densite - current.densite,
                    trichomes: targetParams.trichomes - current.trichomes,
                    pistils: targetParams.pistils - current.pistils
                };

                if (Math.abs(diff.densite) < 0.1 && Math.abs(diff.trichomes) < 0.1 && Math.abs(diff.pistils) < 0.1) {
                    return targetParams;
                }

                return {
                    densite: current.densite + diff.densite * 0.2,
                    trichomes: current.trichomes + diff.trichomes * 0.2,
                    pistils: current.pistils + diff.pistils * 0.2
                };
            });
        }, 16);

        return () => clearInterval(interval);
    }, [targetParams]);

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

    // Structure 3D de cola avec bractées organiques
    const bracts = useMemo(() => {
        const items = [];
        const densityConfig = getDensityConfig(smoothParams.densite);
        const layers = 8;

        let colorIndex = 0;
        for (let layer = 0; layer < layers; layer++) {
            const layerRadius = 50 - layer * 5;
            const layerY = 80 + layer * densityConfig.layerSpacing;
            const bractCount = densityConfig.bractCount[layer] || Math.max(3, Math.round(7 - layer * 0.5));

            for (let i = 0; i < bractCount; i++) {
                const angle = (i / bractCount) * Math.PI * 2 + layer * 0.4;
                const radiusVariation = 1 + (1 - densityConfig.compactness) * 0.8;
                const x = 120 + Math.cos(angle) * layerRadius * radiusVariation;
                const y = layerY + Math.sin(angle) * layerRadius * 0.4 * radiusVariation;

                const baseSize = 14 - layer * 0.8;
                const size = baseSize * densityConfig.sizeMultiplier;

                const scaleWidth = size * (1.2 + Math.sin(angle * 3) * 0.2);
                const scaleHeight = size * (0.9 + Math.cos(angle * 2) * 0.15);

                const bractColor = bractColors[colorIndex % bractColors.length];
                const rotation = (angle * 180 / Math.PI) + 90 + (Math.sin(layer * i) * 15);

                // Générer path organique
                const organicPath = generateOrganicBractPath(
                    x, y,
                    scaleWidth, scaleHeight,
                    rotation,
                    layer * 10 + i
                );

                // Générer nervures
                const veins = [];
                for (let v = 0; v < 3; v++) {
                    veins.push(generateBractVein(x, y, scaleWidth, scaleHeight, rotation, v));
                }

                // Calculer ombre
                const shadow = calculateShadow(x, y, layer);

                items.push({
                    x, y,
                    width: scaleWidth,
                    height: scaleHeight,
                    color: bractColor,
                    rotation,
                    depth: layer,
                    delay: layer * 0.05 + i * 0.02,
                    organicPath,
                    veins,
                    shadow
                });
                colorIndex++;
            }
        }
        return items;
    }, [smoothParams.densite, bractColors]);

    // Feuilles dentelées réalistes
    const leaves = useMemo(() => {
        const leafCount = Math.max(0, Math.round((1 - manucure / 10) * 7));
        const items = [];

        for (let i = 0; i < leafCount; i++) {
            // Positionnement en dessous des bractées, dirigées vers le bas
            const angle = 30 + (i / Math.max(1, leafCount - 1)) * 120;
            const rad = (angle * Math.PI) / 180;

            // Partent des bractées du milieu/bas
            const bractSource = bracts[Math.floor(bracts.length * 0.6) + i * 2];
            const baseX = bractSource ? bractSource.x : 120;
            const baseY = bractSource ? bractSource.y : 180;
            const length = 50 + Math.sin(i * 0.7) * 8;

            const points = [];
            for (let j = 0; j <= 7; j++) {
                const t = j / 7;
                const leafX = baseX + Math.cos(rad) * length * t;
                const leafY = baseY + Math.sin(rad) * length * t;
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
    }, [manucure, baseColor, bracts]);

    // Pistils organiques bouclés avec configuration adaptative
    const pistilStrands = useMemo(() => {
        const items = [];
        const pistilConfig = getPistilConfig(smoothParams.pistils);

        bracts.forEach((bract, bractIdx) => {
            const pistilCount = smoothParams.pistils === 0
                ? (bractIdx % 5 === 0 ? 1 : 0)
                : Math.floor(pistilConfig.perBract);

            for (let p = 0; p < pistilCount; p++) {
                const angle = Math.atan2(bract.y - 150, bract.x - 120) + (p * 0.4 - 0.4);
                const length = pistilConfig.length;
                const curl = Math.sin(bractIdx * 0.8 + p) * (8 * pistilConfig.curliness);

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
                    thickness: pistilConfig.thickness,
                    gradientId: `pistil-grad-${bractIdx}-${p}`,
                    colorStart: pistilConfig.colorStart,
                    colorMid: pistilConfig.colorMid,
                    colorEnd: pistilConfig.colorEnd,
                    opacity: pistilConfig.opacity,
                    delay: bract.delay + 0.3 + p * 0.05
                });
            }
        });
        return items;
    }, [smoothParams.pistils, bracts]);

    // Trichomes cristallins réalistes avec types variés
    const trichomeGlands = useMemo(() => {
        const items = [];
        const trichomeConfig = getTrichomeConfig(smoothParams.trichomes);

        bracts.forEach((bract, bractIdx) => {
            const trichomeCount = smoothParams.trichomes === 0
                ? (bractIdx % 3 === 0 ? 1 : 0)
                : Math.floor(trichomeConfig.perBract);

            for (let t = 0; t < trichomeCount; t++) {
                const offsetAngle = (bractIdx * 137.5 + t * 45) * Math.PI / 180;
                const offsetDist = 4 + (t * 3);

                const baseX = bract.x + Math.cos(offsetAngle) * offsetDist;
                const baseY = bract.y + Math.sin(offsetAngle) * offsetDist;

                // Sélectionner le type de trichome
                const rand = Math.random();
                let cumulativeWeight = 0;
                let selectedType = trichomeConfig.types[0].type;

                for (const typeConfig of trichomeConfig.types) {
                    cumulativeWeight += typeConfig.weight;
                    if (rand <= cumulativeWeight) {
                        selectedType = typeConfig.type;
                        break;
                    }
                }

                const size = trichomeConfig.minSize + Math.random() * (trichomeConfig.maxSize - trichomeConfig.minSize);
                const trichome = generateTrichome(selectedType, baseX, baseY, offsetAngle, size, trichomeConfig);

                items.push({
                    ...trichome,
                    opacity: trichomeConfig.opacity,
                    glow: trichomeConfig.glow,
                    delay: bract.delay + 0.4 + t * 0.05
                });
            }
        });
        return items;
    }, [smoothParams.trichomes, bracts]);

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

    // Système de particules pour trichomes élevés
    const [particles, setParticles] = useState([]);

    useEffect(() => {
        if (smoothParams.trichomes < 7) {
            setParticles([]);
            return;
        }

        const count = Math.round((smoothParams.trichomes - 7) * 15);
        const newParticles = Array.from({ length: count }, (_, i) => ({
            id: i,
            x: 60 + Math.random() * 120,
            y: 60 + Math.random() * 180,
            size: 0.5 + Math.random() * 1.5,
            duration: 1.5 + Math.random() * 2,
            delay: Math.random() * 3
        }));

        setParticles(newParticles);
    }, [smoothParams.trichomes]);

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
                        {/* Dégradés pour profondeur des bractées */}
                        {bracts.map((bract, i) => (
                            <radialGradient key={`bract-grad-${i}`} id={`bract-grad-${i}`}>
                                <stop offset="0%" stopColor={lightenColor(bract.color, 0.3)} />
                                <stop offset="40%" stopColor={bract.color} />
                                <stop offset="70%" stopColor={darkenColor(bract.color, 0.15)} />
                                <stop offset="100%" stopColor={darkenColor(bract.color, 0.35)} />
                            </radialGradient>
                        ))}

                        {/* Dégradés pour pistils */}
                        {pistilStrands.map((pistil, i) => (
                            <linearGradient key={pistil.gradientId} id={pistil.gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor={pistil.colorStart} />
                                <stop offset="50%" stopColor={pistil.colorMid} />
                                <stop offset="100%" stopColor={pistil.colorEnd} />
                            </linearGradient>
                        ))}

                        {/* Texture organique pour bractées */}
                        <pattern id="bract-texture" patternUnits="userSpaceOnUse" width="10" height="10">
                            <path d="M5,0 Q5,3 5,5 Q5,7 5,10" stroke="rgba(0,0,0,0.12)" strokeWidth="0.4" fill="none"/>
                            <circle cx="2" cy="3" r="0.25" fill="rgba(0,0,0,0.08)"/>
                            <circle cx="7" cy="6" r="0.25" fill="rgba(0,0,0,0.08)"/>
                            <circle cx="4" cy="8" r="0.25" fill="rgba(0,0,0,0.08)"/>
                        </pattern>

                        {/* Filtre noise organique */}
                        <filter id="organic-noise">
                            <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="4" seed="42" result="noise"/>
                            <feColorMatrix in="noise" type="matrix" 
                                values="0 0 0 0 0
                                        0 0 0 0 0
                                        0 0 0 0 0
                                        0 0 0 0.1 0"
                                result="darkerNoise"/>
                            <feComposite in="SourceGraphic" in2="darkerNoise" operator="arithmetic" k1="0" k2="1" k3="1" k4="0"/>
                        </filter>

                        {/* Ombres dynamiques */}
                        {bracts.map((bract, i) => (
                            <filter key={`shadow-${i}`} id={`shadow-${i}`} x="-50%" y="-50%" width="200%" height="200%">
                                <feGaussianBlur in="SourceAlpha" stdDeviation={bract.shadow.blur}/>
                                <feOffset dx={bract.shadow.offsetX} dy={bract.shadow.offsetY} result="offsetblur"/>
                                <feComponentTransfer>
                                    <feFuncA type="linear" slope={bract.shadow.opacity}/>
                                </feComponentTransfer>
                                <feMerge>
                                    <feMergeNode/>
                                    <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                            </filter>
                        ))}

                        <radialGradient id="trichomeGlow">
                            <stop offset="0%" stopColor="rgba(255,255,255,1)" />
                            <stop offset="30%" stopColor="rgba(245,250,255,0.95)" />
                            <stop offset="60%" stopColor="rgba(200,220,255,0.85)" />
                            <stop offset="100%" stopColor="rgba(150,180,220,0.6)" />
                        </radialGradient>

                        <filter id="crystal-glow">
                            <feGaussianBlur in="SourceGraphic" stdDeviation="0.8" result="blur"/>
                            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
                            <feComponentTransfer>
                                <feFuncA type="linear" slope="1.5"/>
                            </feComponentTransfer>
                        </filter>

                        <filter id="bloom-effect">
                            <feColorMatrix in="SourceGraphic" type="matrix"
                                values="1 0 0 0 0
                                        0 1 0 0 0
                                        0 0 1 0 0
                                        0 0 0 5 -3"
                                result="bright"/>
                            <feGaussianBlur in="bright" stdDeviation="3" result="blurred"/>
                            <feComposite in="SourceGraphic" in2="blurred" operator="over"/>
                        </filter>
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

                    {/* Bractées organiques avec texture 3D */}
                    {bracts.map((bract, i) => (
                        <motion.g
                            key={`bract-${i}`}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.45, delay: bract.delay, type: "spring", stiffness: 120 }}
                        >
                            {/* Ombre de la bractée */}
                            <motion.path
                                d={bract.organicPath}
                                fill="rgba(0,0,0,0.25)"
                                transform={`translate(${bract.shadow.offsetX}, ${bract.shadow.offsetY})`}
                                filter={`url(#shadow-${i})`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: bract.shadow.opacity }}
                                transition={{ duration: 0.3, delay: bract.delay }}
                            />

                            {/* Bractée principale avec dégradé */}
                            <motion.path
                                d={bract.organicPath}
                                fill={`url(#bract-grad-${i})`}
                                stroke={darkenColor(bract.color, 0.3)}
                                strokeWidth="0.8"
                                filter="url(#organic-noise)"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ duration: 0.45, delay: bract.delay, type: "spring", stiffness: 120 }}
                            />

                            {/* Texture pattern */}
                            <motion.path
                                d={bract.organicPath}
                                fill="url(#bract-texture)"
                                opacity="0.3"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.3 }}
                                transition={{ duration: 0.3, delay: bract.delay + 0.1 }}
                            />

                            {/* Nervures */}
                            {bract.veins.map((vein, v) => (
                                <motion.path
                                    key={`vein-${i}-${v}`}
                                    d={vein.path}
                                    stroke={darkenColor(bract.color, 0.4)}
                                    strokeWidth="0.5"
                                    fill="none"
                                    opacity={vein.opacity}
                                    initial={{ pathLength: 0, opacity: 0 }}
                                    animate={{ pathLength: 1, opacity: vein.opacity }}
                                    transition={{ duration: 0.4, delay: bract.delay + 0.15 + v * 0.05 }}
                                />
                            ))}

                            {/* Highlight */}
                            <motion.ellipse
                                cx={bract.x - bract.width * 0.25}
                                cy={bract.y - bract.height * 0.25}
                                rx={bract.width * 0.35}
                                ry={bract.height * 0.3}
                                fill="rgba(255,255,255,0.15)"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.15 }}
                                transition={{ duration: 0.3, delay: bract.delay + 0.2 }}
                            />
                        </motion.g>
                    ))}

                    {/* Pistils organiques avec dégradés */}
                    {pistilStrands.map((pistil, i) => (
                        <g key={`pistil-${i}`}>
                            {/* Pistil principal */}
                            <motion.path
                                d={`M ${pistil.baseX} ${pistil.baseY} C ${pistil.ctrl1X} ${pistil.ctrl1Y}, ${pistil.ctrl2X} ${pistil.ctrl2Y}, ${pistil.tipX} ${pistil.tipY}`}
                                stroke={`url(#${pistil.gradientId})`}
                                strokeWidth={pistil.thickness + 0.8}
                                strokeLinecap="round"
                                fill="none"
                                opacity={pistil.opacity}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: pistil.opacity }}
                                transition={{ duration: 0.6, delay: pistil.delay, ease: "easeOut" }}
                            />

                            {/* Highlight sur le pistil */}
                            <motion.path
                                d={`M ${pistil.baseX} ${pistil.baseY} C ${pistil.ctrl1X} ${pistil.ctrl1Y}, ${pistil.ctrl2X} ${pistil.ctrl2Y}, ${pistil.tipX} ${pistil.tipY}`}
                                stroke="#FBBF24"
                                strokeWidth={pistil.thickness * 0.5}
                                strokeLinecap="round"
                                fill="none"
                                opacity={pistil.opacity * 0.6}
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: pistil.opacity * 0.6 }}
                                transition={{ duration: 0.5, delay: pistil.delay + 0.05, ease: "easeOut" }}
                            />
                        </g>
                    ))}

                    {/* Trichomes cristallins variés */}
                    {trichomeGlands.map((trich, i) => (
                        <motion.g
                            key={`trichome-${i}`}
                            filter={trich.glow ? "url(#crystal-glow)" : undefined}
                            animate={trich.glow ? {
                                opacity: [trich.opacity * 0.9, trich.opacity, trich.opacity * 0.9],
                                scale: [1, 1.05, 1]
                            } : {}}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                                ease: "easeInOut"
                            }}
                        >
                            {/* Tige */}
                            <motion.path
                                d={trich.stemPath}
                                stroke="rgba(245,250,255,0.85)"
                                strokeWidth="0.6"
                                strokeLinecap="round"
                                fill="none"
                                initial={{ pathLength: 0, opacity: 0 }}
                                animate={{ pathLength: 1, opacity: 0.85 }}
                                transition={{ duration: 0.35, delay: trich.delay }}
                            />

                            {/* Tête du trichome */}
                            <motion.circle
                                cx={trich.headCx}
                                cy={trich.headCy}
                                r={trich.headRadius}
                                fill="url(#trichomeGlow)"
                                stroke="rgba(230,240,255,0.7)"
                                strokeWidth="0.3"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{
                                    scale: [0, 1.1, 1],
                                    opacity: [0, 1, trich.opacity]
                                }}
                                transition={{ duration: 0.4, delay: trich.delay + 0.1, times: [0, 0.6, 1] }}
                            />

                            {/* Highlight */}
                            <motion.circle
                                cx={trich.highlightCx}
                                cy={trich.highlightCy}
                                r={trich.highlightRadius}
                                fill="rgba(255,255,255,0.95)"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 0.25, delay: trich.delay + 0.15 }}
                            />
                        </motion.g>
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

                    {/* Effet de brillance globale pour trichomes élevés */}
                    {smoothParams.trichomes > 7 && (
                        <>
                            {/* Particules flottantes */}
                            {particles.map(p => (
                                <motion.circle
                                    key={`particle-${p.id}`}
                                    cx={p.x}
                                    cy={p.y}
                                    r={p.size}
                                    fill="white"
                                    filter="url(#bloom-effect)"
                                    animate={{
                                        opacity: [0, 1, 1, 0],
                                        scale: [0.5, 1, 1.2, 0.3],
                                        y: [p.y, p.y - 10, p.y - 20, p.y - 30]
                                    }}
                                    transition={{
                                        duration: p.duration,
                                        repeat: Infinity,
                                        delay: p.delay,
                                        ease: "easeOut"
                                    }}
                                />
                            ))}

                            {/* Sparkles fixes */}
                            {[...Array(12)].map((_, i) => {
                                const angle = (i / 12) * Math.PI * 2;
                                const radius = 35 + i * 7;
                                const x = 120 + Math.cos(angle) * radius;
                                const y = 140 + Math.sin(angle) * radius * 0.7;
                                return (
                                    <motion.circle
                                        key={`sparkle-${i}`}
                                        cx={x}
                                        cy={y}
                                        r="1.5"
                                        fill="white"
                                        filter="url(#bloom-effect)"
                                        opacity="0"
                                        animate={{
                                            opacity: [0, 0.95, 0],
                                            scale: [0.5, 1.4, 0.5],
                                            r: [1.2, 1.8, 1.2]
                                        }}
                                        transition={{
                                            duration: 2.5,
                                            repeat: Infinity,
                                            delay: i * 0.2,
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
