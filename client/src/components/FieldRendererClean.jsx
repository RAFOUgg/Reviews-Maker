import PropTypes from 'prop-types';

/**
 * FieldRendererClean - Rendu des champs dans le mode Custom
 * Gère tous les types de données de reviews avec un affichage adapté
 */

// Helper pour extraire le label d'un objet ou string
const extractLabel = (item) => {
    if (typeof item === 'string') return item;
    if (typeof item === 'object' && item !== null) {
        return item.label || item.name || item.text || item.value || JSON.stringify(item);
    }
    return String(item);
};

// Helper pour parser JSON en toute sécurité
const safeParse = (val) => {
    if (!val) return null;
    if (typeof val === 'object') return val;
    try {
        return JSON.parse(val);
    } catch {
        return val;
    }
};

// Convertir en tableau
const asArray = (val) => {
    if (!val) return [];
    const parsed = safeParse(val);
    if (Array.isArray(parsed)) return parsed;
    if (typeof parsed === 'object') return Object.entries(parsed).map(([k, v]) => ({ label: k, value: v }));
    if (typeof parsed === 'string') return parsed.split(',').map(s => s.trim()).filter(Boolean);
    return [parsed];
};

export default function FieldRendererClean({ field, value, compact = false }) {
    // Vérification si la valeur est vide
    const isEmpty = () => {
        if (value === undefined || value === null) return true;
        if (typeof value === 'string' && value.trim() === '') return true;
        if (Array.isArray(value) && value.length === 0) return true;
        if (typeof value === 'object' && Object.keys(value).length === 0) return true;
        return false;
    };

    if (isEmpty() && field.type !== 'rating' && field.type !== 'zone') {
        return (
            <div className="text-gray-500 italic text-sm flex items-center gap-2">
                <span>{field.icon}</span>
                <span>{field.label}</span>
                <span className="text-xs">(non renseigné)</span>
            </div>
        );
    }

    // Styles de base
    const baseClass = compact ? 'text-sm' : 'text-base';
    const headerClass = compact ? 'text-xs font-semibold text-gray-400 mb-1' : 'text-sm font-semibold text-gray-400 mb-2';
    const tagClass = 'px-2 py-1 rounded-full text-xs font-medium   border /30';

    switch (field.type) {
        case 'text':
        case 'textarea':
            return (
                <div className={baseClass}>
                    <div className={headerClass}>{field.icon} {field.label}</div>
                    <div className="font-medium text-white whitespace-pre-wrap">{String(value)}</div>
                </div>
            );

        case 'rating': {
            const ratingValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            const maxRating = 10;
            const percentage = (ratingValue / maxRating) * 100;

            return (
                <div className={baseClass}>
                    <div className={headerClass}>{field.icon} {field.label}</div>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <span className="font-bold text-xl text-yellow-400">{ratingValue.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">/10</span>
                    </div>
                </div>
            );
        }

        case 'image':
        case 'gallery': {
            const images = asArray(value);
            const imageUrl = images[0];

            if (!imageUrl) {
                return (
                    <div className="w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                        <span className="text-4xl opacity-50">{field.icon}</span>
                    </div>
                );
            }

            const getImageSrc = (url) => {
                if (!url) return '';
                if (typeof url === 'object') url = url.url || url.src || url.path || '';
                if (url.startsWith('http') || url.startsWith('data:')) return url;
                if (url.startsWith('/')) return url;
                return `/images/${url}`;
            };

            return (
                <div className="w-full">
                    <div className={headerClass}>{field.icon} {field.label}</div>
                    <div className="relative rounded-lg overflow-hidden">
                        <img
                            src={getImageSrc(imageUrl)}
                            alt={field.label}
                            className="w-full h-auto rounded-lg shadow-lg object-cover"
                            style={{ maxHeight: compact ? '120px' : '200px' }}
                        />
                        {images.length > 1 && (
                            <div className="absolute bottom-2 right-2 bg-black/70 px-2 py-1 rounded text-xs text-white">
                                +{images.length - 1} images
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        case 'tags': {
            const items = asArray(value);
            if (items.length === 0) return null;

            return (
                <div className={baseClass}>
                    <div className={headerClass}>{field.icon} {field.label}</div>
                    <div className="flex flex-wrap gap-1">
                        {items.slice(0, compact ? 4 : 8).map((item, i) => (
                            <span key={i} className={tagClass}>{extractLabel(item)}</span>
                        ))}
                        {items.length > (compact ? 4 : 8) && (
                            <span className="px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">
                                +{items.length - (compact ? 4 : 8)}
                            </span>
                        )}
                    </div>
                </div>
            );
        }

        case 'pipeline': {
            const steps = asArray(value);
            if (steps.length === 0) {
                return (
                    <div className={baseClass}>
                        <div className={headerClass}>{field.icon} {field.label}</div>
                        <div className="text-gray-500 text-sm italic">Non configuré</div>
                    </div>
                );
            }

            return (
                <div className={baseClass}>
                    <div className={headerClass}>{field.icon} {field.label}</div>
                    <div className="flex items-center flex-wrap gap-1">
                        {steps.map((step, i) => (
                            <div key={i} className="flex items-center">
                                <span className="px-2 py-1 rounded text-xs border /30">
                                    {extractLabel(step)}
                                </span>
                                {i < steps.length - 1 && (
                                    <span className="mx-1">→</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            );
        }

        case 'json': {
            const parsed = safeParse(value);
            if (!parsed || (typeof parsed === 'object' && Object.keys(parsed).length === 0)) {
                return null;
            }

            return (
                <div className={baseClass}>
                    <div className={headerClass}>{field.icon} {field.label}</div>
                    <div className="bg-gray-800/50 rounded p-2 text-xs font-mono overflow-auto max-h-32">
                        {typeof parsed === 'object'
                            ? Object.entries(parsed).map(([k, v]) => (
                                <div key={k} className="flex justify-between py-0.5">
                                    <span className="text-gray-400">{k}:</span>
                                    <span className="text-white">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                                </div>
                            ))
                            : <span>{String(parsed)}</span>
                        }
                    </div>
                </div>
            );
        }

        case 'boolean': {
            const boolVal = value === true || value === 'true' || value === 1 || value === '1';
            return (
                <div className={`${baseClass} flex items-center gap-2`}>
                    <span>{field.icon}</span>
                    <span className="font-medium">{field.label}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${boolVal ? 'bg-green-500/20 text-green-400' : 'bg-gray-600/30 text-gray-400'}`}>
                        {boolVal ? '✓ Oui' : '✗ Non'}
                    </span>
                </div>
            );
        }

        case 'cultivar-list': {
            const cultivars = asArray(value);
            if (cultivars.length === 0) return null;

            return (
                <div className={baseClass}>
                    <div className={headerClass}>{field.icon} {field.label}</div>
                    <div className="space-y-1">
                        {cultivars.slice(0, compact ? 3 : 6).map((c, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                                <span className="text-green-400">🌱</span>
                                <span className="text-white">{extractLabel(c)}</span>
                            </div>
                        ))}
                        {cultivars.length > (compact ? 3 : 6) && (
                            <div className="text-xs text-gray-400">+{cultivars.length - (compact ? 3 : 6)} autres</div>
                        )}
                    </div>
                </div>
            );
        }

        case 'substrat-mix': {
            const substrats = asArray(value);
            if (substrats.length === 0) return null;

            return (
                <div className={baseClass}>
                    <div className={headerClass}>{field.icon} {field.label}</div>
                    <div className="flex flex-wrap gap-2">
                        {substrats.map((s, i) => {
                            const item = typeof s === 'object' ? s : { label: s };
                            return (
                                <div key={i} className="px-2 py-1 bg-amber-500/20 rounded text-xs text-amber-300 border border-amber-500/30">
                                    {item.label || item.name || extractLabel(s)}
                                    {item.ratio && <span className="ml-1 text-amber-400">{item.ratio}%</span>}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }

        case 'bubble': {
            const bubbleData = typeof value === 'object' ? value : { text: String(value) };
            const { emoji = '💬', bg = 'rgba(255,255,255,0.1)', color = '#fff' } = bubbleData.style || {};

            return (
                <div
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-lg"
                    style={{ background: bg, color }}
                >
                    <span className="text-lg">{emoji}</span>
                    <span className="font-medium">{bubbleData.text || field.label}</span>
                </div>
            );
        }

        case 'zone':
            return (
                <div className="w-full h-full min-h-[60px] flex items-center justify-center border-2 border-dashed /30 rounded-lg text-sm">
                    <span className="mr-2">📦</span>
                    {field.label || 'Zone personnalisée'}
                </div>
            );

        default:
            // Type générique - affiche la valeur de manière intelligente
            const displayValue = typeof value === 'object'
                ? JSON.stringify(value, null, 2)
                : String(value);

            return (
                <div className={baseClass}>
                    <div className={headerClass}>{field.icon} {field.label}</div>
                    <div className="text-white">{displayValue}</div>
                </div>
            );
    }
}

FieldRendererClean.propTypes = {
    field: PropTypes.shape({
        id: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        icon: PropTypes.string,
        type: PropTypes.string.isRequired
    }).isRequired,
    value: PropTypes.any,
    compact: PropTypes.bool
};

