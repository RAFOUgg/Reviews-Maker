import { useOrchardStore } from '../../../store/orchardStore';

const FONT_FAMILIES = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Poppins',
    'Lato',
    'Playfair Display',
    'Merriweather',
    'Raleway',
    'Source Sans Pro'
];

const FONT_WEIGHTS = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' }
];

export default function TypographyControls() {
    const config = useOrchardStore((state) => state.config);
    const updateTypography = useOrchardStore((state) => state.updateTypography);

    return (
        <div className="space-y-6">
            {/* Titre */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Typographie
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    Personnalisez les polices et leur apparence
                </p>
            </div>

            {/* Famille de police */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Police de caractères
                </label>
                <select
                    value={config.typography.fontFamily}
                    onChange={(e) => updateTypography({ fontFamily: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus: focus:border-transparent transition-all"
                    style={{ fontFamily: config.typography.fontFamily }}
                >
                    {FONT_FAMILIES.map((font) => (
                        <option key={font} value={font} style={{ fontFamily: font }}>
                            {font}
                        </option>
                    ))}
                </select>
            </div>

            {/* Taille du titre */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Taille du titre: {config.typography.titleSize}px
                </label>
                <input
                    type="range"
                    min="20"
                    max="72"
                    value={config.typography.titleSize}
                    onChange={(e) => updateTypography({ titleSize: parseInt(e.target.value) })}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r dark: dark: shadow-inner"
                />
            </div>

            {/* Graisse du titre */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Graisse du titre
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {FONT_WEIGHTS.map((weight) => (
                        <button
                            key={weight.value}
                            onClick={() => updateTypography({ titleWeight: weight.value })}
                            className={`px-3 py-2 rounded-lg text-sm transition-all ${config.typography.titleWeight === weight.value ? ' text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }`}
                            style={{ fontWeight: weight.value }}
                        >
                            {weight.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Taille du texte */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Taille du texte: {config.typography.textSize}px
                </label>
                <input
                    type="range"
                    min="12"
                    max="32"
                    value={config.typography.textSize}
                    onChange={(e) => updateTypography({ textSize: parseInt(e.target.value) })}
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer bg-gradient-to-r dark: dark: shadow-inner"
                />
            </div>

            {/* Graisse du texte */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Graisse du texte
                </label>
                <div className="grid grid-cols-3 gap-2">
                    {FONT_WEIGHTS.slice(0, 4).map((weight) => (
                        <button
                            key={weight.value}
                            onClick={() => updateTypography({ textWeight: weight.value })}
                            className={`px-3 py-2 rounded-lg text-sm transition-all ${config.typography.textWeight === weight.value ? ' text-white shadow-lg' : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700' }`}
                            style={{ fontWeight: weight.value }}
                        >
                            {weight.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Aperçu */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">Aperçu</p>
                <h4
                    className="mb-2"
                    style={{
                        fontFamily: config.typography.fontFamily,
                        fontSize: `${Math.min(config.typography.titleSize, 24)}px`,
                        fontWeight: config.typography.titleWeight,
                        color: '#1f2937'
                    }}
                >
                    Titre de la review
                </h4>
                <p
                    style={{
                        fontFamily: config.typography.fontFamily,
                        fontSize: `${Math.min(config.typography.textSize, 14)}px`,
                        fontWeight: config.typography.textWeight,
                        color: '#6b7280'
                    }}
                >
                    Ceci est un exemple de texte avec les paramètres sélectionnés.
                </p>
            </div>
        </div>
    );
}




