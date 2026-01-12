import html2canvas from 'html2canvas'
import GIF from 'gif.js'

/**
 * CuringGIFExporter - Export GIF spécifique pour évolution curing
 * 
 * Génère un GIF montrant l'évolution temporelle des notes /10
 * avec graphiques colorés pour Visuel, Odeurs, Goûts, Effets
 */

/**
 * Exporter l'évolution du curing en GIF animé
 * @param {Object} evolutionData - Données d'évolution
 * @param {Array} evolutionData.visual - Évolution visuel [{timestamp, value}]
 * @param {Array} evolutionData.odor - Évolution odeurs
 * @param {Array} evolutionData.taste - Évolution goûts
 * @param {Array} evolutionData.effects - Évolution effets
 * @param {Object} options - Options d'export
 * @param {number} options.delay - Délai entre frames (ms), default 300
 * @param {number} options.quality - Qualité GIF (1-20), default 10
 * @param {number} options.width - Largeur, default 800
 * @param {number} options.height - Hauteur, default 600
 * @param {Function} options.onProgress - Callback progression
 * @returns {Promise<Blob>}
 */
export async function exportCuringEvolutionToGIF(evolutionData, options = {}) {
    const {
        delay = 300,
        quality = 10,
        width = 800,
        height = 600,
        onProgress
    } = options

    // Valider les données
    if (!evolutionData || !evolutionData.visual) {
        throw new Error('Invalid evolution data: visual required')
    }

    // Créer un container temporaire pour le rendu
    const container = document.createElement('div')
    container.style.position = 'fixed'
    container.style.top = '-9999px'
    container.style.left = '-9999px'
    container.style.width = `${width}px`
    container.style.height = `${height}px`
    container.style.background = '#0f172a'
    document.body.appendChild(container)

    // Initialiser GIF
    const gif = new GIF({
        workers: 4,
        quality,
        width,
        height,
        workerScript: '/gif.worker.js'
    })

    try {
        // Déterminer le nombre total de points de données
        const maxLength = Math.max(
            evolutionData.visual?.length || 0,
            evolutionData.odor?.length || 0,
            evolutionData.taste?.length || 0,
            evolutionData.effects?.length || 0
        )

        if (maxLength === 0) {
            throw new Error('No evolution data to export')
        }
        // Générer chaque frame
        for (let i = 0; i < maxLength; i++) {
            // Créer le rendu pour cette frame
            container.innerHTML = renderEvolutionFrame(evolutionData, i, width, height)

            // Attendre le rendu
            await waitForRender(50)

            // Capturer le canvas
            const canvas = await html2canvas(container, {
                width,
                height,
                backgroundColor: '#0f172a',
                logging: false
            })

            // Ajouter au GIF
            gif.addFrame(canvas, { delay })

            // Progression
            if (onProgress) {
                onProgress(Math.round((i + 1) / maxLength * 100))
            }
    return `
        <div style="
            width: ${width}px;
            height: ${height}px;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 30px;
            font-family: Inter, sans-serif;
            color: white;
            box-sizing: border-box;
        ">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="font-size: 28px; font-weight: 700; margin: 0 0 10px 0;">
                    🌾 Évolution Curing
                </h1>
                <p style="font-size: 14px; color: #94a3b8; margin: 0;">
                    Frame ${frameIndex + 1} • ${new Date().toLocaleDateString('fr-FR')}
                </p>
            </div>

            <!-- Graphiques 2x2 -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                ${metrics.map((metric, idx) => `
                    <div style="
                        background: rgba(30, 41, 59, 0.6);
                        border: 1px solid rgba(148, 163, 184, 0.2);
                        border-radius: 12px;
                        padding: 15px;
                    ">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                            <span style="font-size: 14px; font-weight: 600; color: ${colors[metric]};">
                                ${labels[metric]}
                            </span>
                            <span style="font-size: 20px; font-weight: 700; color: ${colors[metric]};">
                                ${currentValues[metric] !== undefined ? currentValues[metric].toFixed(1) : '-'}/10
                            </span>
                        </div>
                        <svg width="${width / 2 - 70}" height="120" style="display: block;">
                            ${svgGraphs[idx]}
                            <!-- Grille -->
                            ${[0, 2, 4, 6, 8, 10].map(val => `
                                <line
                                    x1="0"
                                    y1="${120 - (val / 10) * 120}"
                                    x2="${width / 2 - 70}"
                                    y2="${120 - (val / 10) * 120}"
                                    stroke="rgba(148, 163, 184, 0.1)"
                                    stroke-width="1"
                                />
                            `).join('')}
                        </svg>
                    </div>
                `).join('')}
            </div>

            <!-- Progress bar -->
            <div style="
                margin-top: 20px;
                height: 4px;
                background: rgba(148, 163, 184, 0.2);
                border-radius: 2px;
                overflow: hidden;
            ">
                <div style="
                    height: 100%;
                    width: ${((frameIndex + 1) / Math.max(...metrics.map(m => (evolutionData[m] || []).length))) * 100}%;
                    background: linear-gradient(90deg, #3b82f6, #a855f7);
                    transition: width 0.3s ease;
                "></div>
            </div>
        </div>
    `
}

/**
 * Attendre que le rendu soit terminé
 */
function waitForRender(ms = 50) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Télécharger le GIF
 */
export function downloadCuringGIF(blob, filename = 'curing-evolution.gif') {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Hook React pour l'export GIF curing
 */
export function useCuringGIFExport() {
    const [isExporting, setIsExporting] = React.useState(false)
    const [progress, setProgress] = React.useState(0)

    const exportToGIF = async (evolutionData, options = {}) => {
        setIsExporting(true)
        setProgress(0)

        try {
            const blob = await exportCuringEvolutionToGIF(evolutionData, {
                ...options,
                onProgress: (percent) => {
                    setProgress(percent)
                    options.onProgress?.(percent)
                }
            })

            const filename = `curing-evolution-${Date.now()}.gif`
            downloadCuringGIF(blob, filename)

            return blob
        } catch (error) {
        }
    }

    return { isExporting, progress, exportToGIF }
}
