import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * REVIEWS-MAKER V3 - Liquid Glass Slider
 * Slider avec effet glassmorphism pour notes /10
 */

const LiquidSlider = ({
    label,
    // default to 0 so a missing value doesn't show as 5
    value = 0,
    onChange,
    min = 0,
    max = 10,
    step = 0.5,
    showValue = true,
    unit = '/10',
    gradient = false,
    color = 'purple',
    size = 'sm', // 'sm' | 'md' | 'lg' — cf. .liquid-slider-track[data-size] dans apple-liquid-glass.css
    // Sens des bornes, affiché sous la jauge (« 1 · Très mou ··· 10 · Béton »). Sans lui, une note
    // chiffrée se lit comme une quantité et on ne sait pas de quel côté est « plus ». Soit
    // minLabel/maxLabel, soit scaleLabels (table valeur → libellé, bornes = 1 et max).
    minLabel,
    maxLabel,
    scaleLabels,
    className = '',
    ...props
}) => {
    const colorClasses = {
        purple: 'from-violet-500 to-purple-600',
        cyan: 'from-cyan-500 to-blue-600',
        green: 'from-green-500 to-emerald-600',
        orange: 'from-orange-500 to-red-600',
        amber: 'from-amber-500 to-orange-600',
        pink: 'from-pink-500 to-rose-600',
    };

    const [hover, setHover] = useState(false)
    const [dragging, setDragging] = useState(false)
    const trackRef = useRef(null)

    const percentage = ((value - min) / (max - min)) * 100;
    // 0 = « non évalué » sur les jauges notées : la première vraie graduation est 1.
    const lowBound = min === 0 && (scaleLabels?.[1] || minLabel) ? 1 : min;
    const lowText = minLabel ?? scaleLabels?.[lowBound];
    const highText = maxLabel ?? scaleLabels?.[max];

    // Doit rester synchronisé avec l'inset `left` de .liquid-slider-fill par taille dans
    // apple-liquid-glass.css (sm=2px, md=4px, lg=5px). Fill et thumb doivent être calculés
    // relativement à cette largeur utile (100% - 2*pad), sinon le bord droit du fill et le
    // centre du thumb divergent près des bornes.
    const trackPad = size === 'sm' ? 2 : size === 'lg' ? 5 : 4;
    const fillWidth = percentage <= 0 ? '0%' : `calc((100% - ${trackPad * 2}px) * ${percentage / 100})`;
    const thumbLeft = `calc(${trackPad}px + (100% - ${trackPad * 2}px) * ${percentage / 100})`;

    function setFromPointer(clientX) {
        const track = trackRef.current
        if (!track) return
        const rect = track.getBoundingClientRect()
        const x = Math.min(Math.max(clientX - rect.left, 0), rect.width)
        const ratio = x / rect.width
        const raw = min + ratio * (max - min)
        const stepped = Math.round(raw / step) * step
        const clamped = Math.min(max, Math.max(min, stepped))
        onChange(clamped)
    }

    return (
        <div className={`w-full liquid-slider ${className}`}>
            {label && (
                <div className="flex justify-between items-center mb-1">
                    <label className="text-sm font-medium text-[var(--text-primary)]">
                        {label}
                    </label>
                    {showValue && (
                        <motion.span
                            key={value}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="liquid-glass px-2.5 py-0.5 rounded-lg text-xs font-semibold"
                        >
                            {value}{unit}
                        </motion.span>
                    )}
                </div>
            )}

            <div
                className="relative"
                ref={trackRef}
                onPointerDown={(e) => { setDragging(true); setFromPointer(e.clientX) }}
                onPointerUp={() => setDragging(false)}
                onPointerMove={(e) => dragging && setFromPointer(e.clientX)}
                onMouseEnter={() => setHover(true)}
                onMouseLeave={() => { setHover(false); setDragging(false) }}
            >
                {/* Track (glass) */}
                <div data-size={size} className="liquid-slider-track liquid-glass rounded-full overflow-hidden">
                    <motion.div
                        className={`liquid-slider-fill bg-gradient-to-r ${colorClasses[color]} rounded-full`}
                        initial={{ width: '0%' }}
                        animate={{ width: fillWidth }}
                        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
                    />
                </div>

                {/* native input (for accessibility/keyboard) */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    onPointerDown={(e) => { setDragging(true); setFromPointer(e.clientX) }}
                    onPointerUp={() => setDragging(false)}
                    onPointerMove={(e) => dragging && setFromPointer(e.clientX)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    style={{ zIndex: 40 }}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                    {...props}
                />

                {/* Thumb */}
                <motion.div
                    className={`liquid-slider-thumb`}
                    style={{ left: thumbLeft }}
                    animate={{ left: thumbLeft }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="liquid-slider-thumb-inner">
                        <div className={`liquid-slider-thumb-core bg-white`} />
                    </div>

                    {/* Value bubble */}
                    <motion.div
                        className="liquid-slider-value-bubble"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: hover || dragging ? 1 : 0.8, opacity: hover || dragging ? 1 : 0 }}
                        transition={{ duration: 0.18 }}
                    >
                        {value}{unit}
                    </motion.div>
                </motion.div>
            </div>

            {(lowText || highText) && (
                <div className="flex justify-between gap-2 mt-1 text-[11px] leading-tight text-white/45" data-slider-bounds>
                    <span>{lowBound} · {lowText}</span>
                    <span className="text-right">{max} · {highText}</span>
                </div>
            )}

            {/* Scale indicators */}
            <div className="flex justify-between mt-0.5 text-[10px] text-[var(--text-tertiary)]">
                <span>{min}</span>
                <span>{Math.floor((max - min) / 2)}</span>
                <span>{max}</span>
            </div>
        </div>
    );
};

export default LiquidSlider;


