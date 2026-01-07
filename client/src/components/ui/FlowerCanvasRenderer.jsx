/**
 * FlowerCanvasRenderer - Placeholder component
 * TODO: Implement full canvas visualization for flower visual ratings
 */
import React from 'react';

const FlowerCanvasRenderer = ({
    color = 5,
    density = 5,
    trichomes = 5,
    pistils = 5,
    seeds = 10,
    mold = 10,
    manicure = 5,
    size = 200,
    className = ''
}) => {
    // Simple placeholder showing ratings as colored bars
    const ratings = [
        { label: 'Couleur', value: color, color: '#22c55e' },
        { label: 'Densité', value: density, color: '#3b82f6' },
        { label: 'Trichomes', value: trichomes, color: '#f59e0b' },
        { label: 'Pistils', value: pistils, color: '#ef4444' },
        { label: 'Manucure', value: manicure, color: '#8b5cf6' },
    ];

    return (
        <div
            className={`flex flex-col gap-1 p-2 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg ${className}`}
            style={{ width: size, minHeight: size * 0.6 }}
        >
            <div className="text-xs text-center text-gray-400 mb-1">🌸 Visualisation</div>
            {ratings.map(r => (
                <div key={r.label} className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 w-16 truncate">{r.label}</span>
                    <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                                width: `${(r.value / 10) * 100}%`,
                                backgroundColor: r.color
                            }}
                        />
                    </div>
                    <span className="text-xs text-gray-300 w-4">{r.value}</span>
                </div>
            ))}
            {seeds < 10 && (
                <div className="text-xs text-yellow-500 mt-1">⚠ Graines: {10 - seeds}/10</div>
            )}
            {mold < 10 && (
                <div className="text-xs text-red-500">⚠ Moisissure: {10 - mold}/10</div>
            )}
        </div>
    );
};

export default FlowerCanvasRenderer;
