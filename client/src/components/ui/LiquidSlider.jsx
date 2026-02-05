import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

/**
 * REVIEWS-MAKER V3 - Liquid Glass Slider
 * Slider avec effet glassmorphism pour notes /10
 */

const LiquidSlider = ({
    label,
    value = 5,
    onChange,
    min = 0,
    max = 10,
    step = 0.5,
    showValue = true,
    unit = '/10',
    gradient = false,
    color = 'purple',
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

    // compute fill width so the fill's right edge aligns with the thumb center
    const fillWidth = percentage <= 0 ? '0%' : `calc(${percentage}% - 4px)`;

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
                <div className="flex justify-between items-center mb-3">
                    <label className="text-sm font-medium text-[var(--text-primary)]">
                        {label}
                    </label>
                    {showValue && (
                        <motion.span
                            key={value}
                            initial={{ scale: 1.2 }}
                            animate={{ scale: 1 }}
                            className="liquid-glass px-3 py-1 rounded-lg text-sm font-semibold"
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
                <div className="liquid-slider-track liquid-glass h-3 rounded-full overflow-hidden">
                    <motion.div
                        className={`liquid-slider-fill h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
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
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                    {...props}
                />

                {/* Thumb */}
                <motion.div
                    className={`liquid-slider-thumb`}
                    style={{ left: `${percentage}%` }}
                    animate={{ left: `${percentage}%` }}
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

            {/* Scale indicators */}
            <div className="flex justify-between mt-2 text-xs text-[var(--text-tertiary)]">
                <span>{min}</span>
                <span>{Math.floor((max - min) / 2)}</span>
                <span>{max}</span>
            </div>
        </div>
    );
};

export default LiquidSlider;


