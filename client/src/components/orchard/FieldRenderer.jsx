// Re-export canonical implementation
export { default } from './FieldRendererClean';
export { default } from './FieldRendererClean';

/*
// (Old/duplicate content removed) The FieldRenderer is now exported via FieldRendererClean


/**
 * FieldRenderer Component
 * Renders field values with styles depending on field type.
 */
// The rest of this file is intentionally removed — FieldRenderer is re-exported

// FieldRenderer is re-exported from FieldRendererClean
import PropTypes from 'prop-types';


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
}

        case 'wheel':
        case 'effects': {
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
}

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
*/

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

        case 'bubble': {
    // Bubble style: emoji + text
    const style = (value && value.style) || {};
    const emoji = style.emoji || '💬';
    const bg = style.bg || 'rgba(255,255,255,0.08)';
    const color = style.color || '#fff';
    const size = style.size || 16;
    return (
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full`} style={{ background: bg, color }}>
            <span style={{ fontSize: size }}>{emoji}</span>
            <span className="font-medium">{(value && value.text) || field.label}</span>
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
import PropTypes from 'prop-types';

/**
 * FieldRenderer Component
 * Renders field values with styles depending on field type.
 */
export default function FieldRenderer({ field, value, compact = false }) {
    // Show a placeholder when the value isn't set, except for rating (we still show 0)
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
        }

        case 'wheel':
        case 'effects': {
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
        }

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

        case 'bubble': {
            // Bubble style: emoji + text
            const style = (value && value.style) || {};
            const emoji = style.emoji || '💬';
            const bg = style.bg || 'rgba(255,255,255,0.08)';
            const color = style.color || '#fff';
            const size = style.size || 16;
            return (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full`} style={{ background: bg, color }}>
                    <span style={{ fontSize: size }}>{emoji}</span>
                    <span className="font-medium">{(value && value.text) || field.label}</span>
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

        // No custom bubble or zone in FieldRenderer: these elements are rendered by the CustomLayoutPane/CustomTemplate
                    <div className="flex items-center gap-2 mb-2"><span className="text-lg">{field.icon}</span><span className="font-semibold">{field.label}</span></div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700">
                        <pre className="text-xs text-gray-400 whitespace-pre-wrap">{typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</pre>
                    </div>
                </div >
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
    field: PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired, icon: PropTypes.string.isRequired, type: PropTypes.string.isRequired }).isRequired,
    value: PropTypes.any,
    compact: PropTypes.bool
};
import PropTypes from 'prop-types';

export default function FieldRenderer({ field, value, compact = false }) {
    if (!value && field.type !== 'rating') {
        return (
            <div className="text-gray-500 italic text-sm">
                {field.icon} {field.label} (non renseigné)
            </div>
        );
    }

    // Use simple returns in cases; avoid hoisting issues by using blocks when declaring
    if (field.type === 'text') {
        return <div className={compact ? 'text-sm' : 'text-base'}><span className="mr-2">{field.icon}</span><span className="font-medium">{value}</span></div>;
    }

    if (field.type === 'rating') {
        const ratingValue = typeof value === 'number' ? value : parseFloat(value) || 0;
        return (
            <div className={`flex items-center gap-2 ${compact ? 'text-sm' : 'text-base'}`}>
                <span className="text-xl">{field.icon}</span>
                <span className="font-bold text-2xl text-yellow-400">{ratingValue.toFixed(1)}</span>
                <span className="text-gray-400">/10</span>
            </div>
        );
    }

    if (field.type === 'image') {
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

    if (field.type === 'wheel' || field.type === 'effects') {
        const items = Array.isArray(value) ? value : [];
        return (
            <div className={compact ? 'text-xs' : 'text-sm'}>
                <div className="flex items-center gap-2 mb-2"><span className="text-lg">{field.icon}</span><span className="font-semibold">{field.label}</span></div>
                <div className="flex flex-wrap gap-2">{items.map((item, i) => <span key={i} className="px-2 py-1 bg-purple-500/30 border border-purple-500/50 rounded-full text-xs">{item.name || item}</span>)}</div>
            </div>
        );
    }

    if (field.type === 'textarea') {
        return (
            <div className={compact ? 'text-xs' : 'text-sm'}>
                <div className="flex items-center gap-2 mb-2"><span className="text-lg">{field.icon}</span><span className="font-semibold">{field.label}</span></div>
                <p className="text-gray-300 whitespace-pre-wrap">{value}</p>
            </div>
        );

        if (field.type === 'pipeline') {
            return (
                <div className={compact ? 'text-xs' : 'text-sm'}>
                    <div className="flex items-center gap-2 mb-2"><span className="text-lg">{field.icon}</span><span className="font-semibold">{field.label}</span></div>
                    <div className="bg-gray-800/50 p-3 rounded-lg border border-gray-700"><pre className="text-xs text-gray-400 whitespace-pre-wrap">{typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</pre></div>
                </div>
            );
        }

        if (field.type === 'bubble') {
            const style = (value && value.style) || {};
            const emoji = style.emoji || '💬';
            const bg = style.bg || 'rgba(255,255,255,0.08)';
            const color = style.color || '#fff';
            const size = style.size || 16;
            return <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: bg, color }}><span style={{ fontSize: size }}>{emoji}</span><span className="font-medium">{(value && value.text) || field.label}</span></div>;
        }

        if (field.type === 'zone') {
            return <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg text-sm text-white/60">{field.label}</div>;

            // Default
            return <div className={compact ? 'text-xs' : 'text-sm'}><span className="mr-2">{field.icon}</span><span>{String(value)}</span></div>;
        }
    }

    FieldRenderer.propTypes = {
        field: PropTypes.shape({ id: PropTypes.string.isRequired, label: PropTypes.string.isRequired, icon: PropTypes.string.isRequired, type: PropTypes.string.isRequired }).isRequired,
        value: PropTypes.any,
        compact: PropTypes.bool
    };
    /**
     * FieldRenderer Component
     * Renders a field according to type
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
        }

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
        }

        case 'wheel':
        case 'effects': {
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
        }

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
    }

        case 'pipeline': {
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

        case 'bubble': {
            // Bubble style: emoji + text
            const style = (value && value.style) || {};
            const emoji = style.emoji || '💬';
            const bg = style.bg || 'rgba(255,255,255,0.08)';
            const color = style.color || '#fff';
            const size = style.size || 16;
            return (
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full" style={{ background: bg, color }}>
                    <span style={{ fontSize: size }}>{emoji}</span>
                    <span className="font-medium">{(value && value.text) || field.label}</span>
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

        case 'bubble': {
            // Bubble style: emoji + text, stylable (using block to scope const)
            const style = (value && value.style) || {};
            const emoji = style.emoji || '💬';
            const bg = style.bg || 'rgba(255,255,255,0.1)';
            const color = style.color || '#fff';
            const size = style.size || 16;
            return (
                <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full`} style={{ background: bg, color }}>
                    <span style={{ fontSize: size }}>{emoji}</span>
                    <span className="font-medium">{value && value.text ? value.text : field.label}</span>
                </div>
            );
        }

        case 'zone': {
            // Placeholder zone for layout: render a subtle label
            return (
                <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg text-sm text-white/60">
                    {field.label}
                </div>
            );
        }

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
        case 'bubble':
// Bubble style: emoji + text, stylable
const { emoji = '💬', bg = '#ffffff22', color = '#ffffff', size = 14 } = value?.style || {};
return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full`} style={{ background: bg, color }}>
        <span style={{ fontSize: size }}>{emoji}</span>
        <span className="font-medium">{value?.text || field.label}</span>
    </div>
);

        case 'zone':
// Placeholder zone for layout: render a subtle label
return (
    <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-white/10 rounded-lg text-sm text-white/60">
        {field.label}
    </div>
);
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

// Prop types
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
