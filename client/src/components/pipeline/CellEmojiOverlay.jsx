/**
 * CellEmojiOverlay - CDC CONFORME
 * - Layout 2x2 superposé (max 4 emojis)
 * - Gradient d'intensité style GitHub (heatmap)
 * - Bouton "Détails ▼" pour accéder aux données complètes
 */
const CellEmojiOverlay = ({ cellData, sidebarContent, onShowDetails }) => {
    // Extraire les emojis des données assignées
    const getEmojis = () => {
        if (!cellData || !sidebarContent) return []

        const emojis = []
        const dataKeys = Object.keys(cellData).filter(key =>
            !['timestamp', 'date', 'label', 'phase', 'day', 'week', 'hours', 'seconds', 'note', '_meta'].includes(key)
        )

        // Parcourir toutes les sections et items pour trouver les emojis correspondants
        sidebarContent.forEach(section => {
            section.items?.forEach(item => {
                // Support id et key pour compatibilité
                const itemId = item.id || item.key
                if (dataKeys.includes(itemId) && cellData[itemId] !== undefined && cellData[itemId] !== null && cellData[itemId] !== '') {
                    if (item.icon) {
                        emojis.push({
                            emoji: item.icon,
                            label: item.label,
                            value: cellData[itemId]
                        })
                    }
                }
            })
        })

        // Limiter à 4 emojis max
        return emojis.slice(0, 4)
    }

    const emojis = getEmojis()

    // Compter le nombre de données pour gradient d'intensité GitHub-style
    const dataCount = Object.keys(cellData).filter(k =>
        !['timestamp', 'date', 'label', 'phase', 'day', 'week', 'hours', 'seconds', 'note', '_meta'].includes(k)
    ).length

    // Calculer l'intensité (0 à 1) basée sur le nombre de données
    // GitHub: max ~10 commits par jour = intensité max
    const intensity = Math.min(dataCount / 10, 1)

    // Palette gradient vert (style GitHub contributions)
    const gradientClasses = [
        'bg-green-50 dark:bg-green-950/30',
        'bg-green-100 dark:bg-green-900/40',
        'bg-green-200 dark:bg-green-800/50',
        'bg-green-300 dark:bg-green-700/60',
        'bg-green-400 dark:bg-green-600/70'
    ]
    const borderClasses = [
        'border-green-200 dark:border-green-800',
        'border-green-300 dark:border-green-700',
        'border-green-400 dark:border-green-600',
        'border-green-500 dark:border-green-500',
        'border-green-600 dark:border-green-400'
    ]

    const intensityIndex = Math.floor(intensity * (gradientClasses.length - 1))
    const bgClass = dataCount === 0 ? 'bg-gray-50 dark:bg-gray-900' : gradientClasses[intensityIndex]
    const borderClass = dataCount === 0 ? 'border-gray-300 dark:border-gray-700' : borderClasses[intensityIndex]

    if (emojis.length === 0) {
        return (
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-gray-300 dark:text-gray-600 text-xs">
                    Vide
                </div>
            </div>
        )
    }

    // Layout 2x2 superposé (max 4 emojis)
    // Position: top-left, top-right, bottom-left, bottom-right
    const positions = [
        { top: '2px', left: '2px' },     // Top-left
        { top: '2px', right: '2px' },    // Top-right
        { bottom: '2px', left: '2px' },  // Bottom-left
        { bottom: '2px', right: '2px' }  // Bottom-right
    ]

    return (
        <div className="absolute inset-0 flex flex-col justify-between p-1 group">
            {/* Grid 2x2 des emojis superposés */}
            <div className="relative w-full h-full">
                {emojis.map((item, idx) => (
                    <div
                        key={idx}
                        className="absolute text-lg transition-transform duration-200 group-hover:scale-125"
                        style={{
                            ...positions[idx],
                            zIndex: 10 - idx,
                            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))'
                        }}
                        title={`${item.label}: ${String(item.value).substring(0, 50)}`}
                    >
                        {item.emoji}
                    </div>
                ))}
            </div>

            {/* Badge compteur si plus de 4 données */}
            {dataCount > 4 && (
                <div
                    className="absolute -bottom-1 -right-1 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg bg-orange-500 dark:bg-orange-600"
                    title={`${dataCount - 4} données supplémentaires`}
                >
                    +{dataCount - 4}
                </div>
            )}

            {/* Tooltip au survol avec toutes les données (CDC: liste items avec emojis) */}
            <div className="absolute top-full left-0 mt-2 hidden group-hover:flex z-50 pointer-events-auto flex-col gap-1">
                <div className="bg-gray-900 text-white text-xs rounded-lg shadow-2xl p-3 whitespace-nowrap max-w-xs border border-gray-700">
                    <div className="font-bold mb-2 text-green-300">📊 {dataCount} donnée(s) assignée(s)</div>
                    {emojis.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2 py-1 text-gray-200">
                            <span className="text-base">{item.emoji}</span>
                            <span className="font-medium">{item.label}:</span>
                            <span className="text-gray-400">{String(item.value).substring(0, 35)}</span>
                        </div>
                    ))}
                    {dataCount > 4 && (
                        <div className="text-orange-300 mt-2 pt-2 border-t border-gray-700 text-[11px]">
                            +{dataCount - 4} supplémentaire(s) → clic pour éditer
                        </div>
                    )}
                </div>
            </div>

            {/* Bouton "Détails ▼" CDC - Cliquable pour ouvrir la modale d'édition */}
            {onShowDetails && (
                <button
                    onClick={() => onShowDetails()}
                    className="absolute bottom-1 left-1/2 -translate-x-1/2 text-xs text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded px-1 py-0.5 hover:bg-white dark:hover:bg-gray-800 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm"
                    title="Cliquer pour éditer les données"
                >
                    Détails ▼
                </button>
            )}
        </div>
    );
};

export default CellEmojiOverlay;
