import React from 'react';
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
        purple: 'from-purple-500 to-violet-600',
        cyan: 'from-cyan-500 to-blue-600',
        green: 'from-green-500 to-emerald-600',
        orange: 'from-orange-500 to-red-600',
    };

    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={`w-full ${className}`}>
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

            <div className="relative">
                {/* Track */}
                <div className="liquid-glass h-3 rounded-full overflow-hidden">
                    {/* Fill */}
                    <motion.div
                        className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    />
                </div>

                {/* Input (invisible but functional) */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    {...props}
                />

                {/* Thumb indicator */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white rounded-full shadow-lg pointer-events-none"
                    style={{ left: `calc(${percentage}% - 10px)` }}
                    animate={{ left: `calc(${percentage}% - 10px)` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                />
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
