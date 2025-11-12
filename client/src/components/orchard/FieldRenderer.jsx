/**
 * FieldRenderer Component
 * Rend un champ de données avec le style approprié
 */

import PropTypes from 'prop-types';

export default function FieldRenderer({ field, value, compact = false }) {
    if (!value && field.type !== 'rating') {
        return (
            <div className="text-gray-500 italic text-sm">
                {field.icon} {field.label} (non renseigné)
            </div>
        );
    }

    switch (field.type) {
        case 'text':
            return (
                <div className={compact ? 'text-sm' : 'text-base'}>
                    <span className="mr-2">{field.icon}</span>
                    <span className="font-medium">{value}</span>
                </div>
            );

        case 'rating':
            const ratingValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            return (
                <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
                    <span className="text-xl">{field.icon}</span>
                    <span className="font-bold text-2xl text-yellow-400">{ratingValue.toFixed(1)}</span>
                    <span className="text-gray-400">/10</span>
                </div>
            );

        case 'image':
            const imageUrl = Array.isArray(value) ? value[0] : value;
            return (
                <div className="w-full">
                    {imageUrl ? (
                        <img
                            src={imageUrl.startsWith('/') ? imageUrl : `/images/${imageUrl}`}
                            alt={field.label}
                            className="w-full h-auto rounded-lg shadow-lg"
                        />
                    ) : (
                        <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-4xl">{field.icon}</span>
                        </div>
                    )}
                </div>
            );

        case 'wheel':
        case 'effects':
            const items = Array.isArray(value) ? value : [];
            return (
                <div className={compact ? 'text-xs' : 'text-sm'}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{field.icon}</span>
                        <span className="font-semibold">{field.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {items.map((item, index) => (
                            <span
                                key={index}
                                className="px-2 py-1 bg-purple-500/30 border border-purple-500/50 rounded-full text-xs"
                            >
                                {item.name || item}
                            </span>
                        ))}
                    </div>
                </div>
            );

        case 'textarea':
            return (
                <div className={compact ? 'text-xs' : 'text-sm'}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{field.icon}</span>
                        <span className="font-semibold">{field.label}</span>
                    </div>
                    <p className="text-gray-300 whitespace-pre-wrap">{value}</p>
                </div>
            );

        case 'pipeline':
            return (
                <div className={compact ? 'text-xs' : 'text-sm'}>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg">{field.icon}</span>
                        <span className="font-semibold">{field.label}</span>
                    </div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                            {typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
                        </pre>
                    </div>
                </div>
            );

        default:
            return (
                <div className={compact ? 'text-xs' : 'text-sm'}>
                    <span className="mr-2">{field.icon}</span>
                    <span>{String(value)}</span>
                </div>
            );
    }
}

FieldRenderer.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        icon: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired
    }).isRequired,
    value: PropTypes.any,
    compact: PropTypes.bool
};
