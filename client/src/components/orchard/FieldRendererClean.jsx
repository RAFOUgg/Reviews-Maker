import PropTypes from 'prop-types';

export default function FieldRendererClean({ field, value, compact = false }) {
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

        case 'rating': {
            const ratingValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            return (
                <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
                    <span className="text-xl">{field.icon}</span>
                    <span className="font-bold text-2xl text-yellow-400">{ratingValue.toFixed(1)}</span>
                    <span className="text-gray-400">/10</span>
                </div>
            );
        }

        case 'image': {
            const imageUrl = Array.isArray(value) ? value[0] : value;
            return (
                <div className="w-full">
                    {imageUrl ? (
                        <img src={imageUrl.startsWith('/') ? imageUrl : `/images/${imageUrl}`} alt={field.label} className="w-full h-auto rounded-lg shadow-lg" />
                    ) : (
                        <div className="w-full h-48 bg-gray-700 rounded-lg flex items-center justify-center"><span className="text-4xl">{field.icon}</span></div>
                    )}
                </div>
            );
        }

        case 'bubble': {
            const { emoji = '💬', bg = '#ffffff22', color = '#fff', size = 14 } = value?.style || {};
            return (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full`} style={{ background: bg, color }}>
                    <span style={{ fontSize: size }}>{emoji}</span>
                    <span className="font-medium">{value?.text || field.label}</span>
                </div>
            );
        }

        case 'zone':
            return (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg text-sm text-white/60">
                    {field.label}
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

FieldRendererClean.propTypes = {
    field: PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired, icon: PropTypes.string.isRequired, type: PropTypes.string.isRequired }).isRequired,
    value: PropTypes.any,
    compact: PropTypes.bool
};
