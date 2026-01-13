import React from 'react';

/**
 * Tooltip affichant le résumé des données d'une cellule au survol
 */
const PipelineCellTooltip = ({ cellData, sectionLabel, visible, position }) => {
    if (!visible || !cellData || !cellData.data) return null;

    const data = cellData.data;
    const entries = Object.entries(data).filter(([_, value]) =>
        value !== '' && value !== null && value !== undefined
    );

    if (entries.length === 0) return null;

    // Formatter les valeurs
    const formatValue = (key, value) => {
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        if (typeof value === 'object' && value !== null) {
            return JSON.stringify(value);
        }
        return String(value);
    };

    // Formatter les labels
    const formatLabel = (key) => {
        return key
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    return (
        <div
            className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-2xl p-4 max-w-md pointer-events-none"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                transform: 'translate(10px, -50%)'
            }}
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-700">
                <span className="font-bold text-sm">{sectionLabel}</span>
                <span className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-gray-200">
                    {cellData.completionPercentage}%
                </span>
            </div>

            {/* Data entries */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
                {entries.map(([key, value], idx) => (
                    <div key={idx} className="flex justify-between gap-4 text-xs">
                        <span className="text-gray-400 font-medium">
                            {formatLabel(key)}:
                        </span>
                        <span className="text-white font-semibold text-right flex-1 truncate">
                            {formatValue(key, value)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Footer */}
            {cellData.lastModified && (
                <div className="mt-3 pt-2 border-t border-gray-700 text-[10px] text-gray-400">
                    Modifié: {new Date(cellData.lastModified).toLocaleString('fr-FR')}
                </div>
            )}

            {/* Triangle pointer */}
            <div
                className="absolute top-1/2 left-0 transform -translate-x-full -translate-y-1/2"
                style={{
                    width: 0,
                    height: 0,
                    borderTop: '6px solid transparent',
                    borderBottom: '6px solid transparent',
                    borderRight: '6px solid rgb(17, 24, 39)'
                }}
            />
        </div>
    );
};

export default PipelineCellTooltip;


