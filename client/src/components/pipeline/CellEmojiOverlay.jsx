/**
 * CellEmojiOverlay - Composant pour afficher 4 emojis superposables
 * Remplace PipelineCellBadge pour une représentation visuelle CDC-conforme
 * Les emojis représentent les données assignées à la cellule
 */
export default function CellEmojiOverlay({ cellData, sidebarContent }) {
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
                if (dataKeys.includes(item.key) && cellData[item.key] !== undefined && cellData[item.key] !== null && cellData[item.key] !== '') {
                    if (item.icon) {
                        emojis.push({
                            emoji: item.icon,
                            label: item.label,
                            value: cellData[item.key]
                        })
                    }
                }
            })
        })

        // Limiter à 4 emojis max
        return emojis.slice(0, 4)
    }

    const emojis = getEmojis()

    if (emojis.length === 0) {
        return (
            <div className="absolute top-2 left-2 text-gray-300 dark:text-gray-600 text-xs">
                Vide
            </div>
        )
    }

    return (
        <div className="absolute top-2 left-2 w-12 h-12 relative group">
            {emojis.map((item, idx) => (
                <div
                    key={idx}
                    className="absolute transition-all duration-200"
                    style={{
                        top: `${idx * 4}px`,
                        left: `${idx * 4}px`,
                        zIndex: 4 - idx,
                        fontSize: '20px',
                        filter: `brightness(${1 - idx * 0.08})`,
                        transform: `scale(${1 - idx * 0.05})`,
                        textShadow: '0 1px 2px rgba(0,0,0,0.2)'
                    }}
                    title={`${item.label}: ${item.value}`}
                >
                    {item.emoji}
                </div>
            ))}

            {/* Badge compteur si plus de 4 données */}
            {Object.keys(cellData).filter(k => !['timestamp', 'date', 'label', 'phase', 'day', 'week', 'hours', 'seconds', 'note', '_meta'].includes(k)).length > 4 && (
                <div
                    className="absolute -bottom-1 -right-1 bg-blue-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg"
                    title={`${Object.keys(cellData).length - 4} données supplémentaires`}
                >
                    +{Object.keys(cellData).length - 4}
                </div>
            )}

            {/* Tooltip au survol avec toutes les données */}
            <div className="absolute bottom-full left-0 mb-2 hidden group-hover:block z-50 pointer-events-none">
                <div className="bg-gray-900 text-white text-xs rounded-lg shadow-xl p-2 whitespace-nowrap max-w-xs">
                    <div className="font-bold mb-1">📊 Données assignées:</div>
                    {emojis.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-1 py-0.5">
                            <span>{item.emoji}</span>
                            <span className="opacity-75">{item.label}:</span>
                            <span className="font-medium">{String(item.value).substring(0, 30)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
