import GIF from 'gif.js'

/**
 * GIFExporter - Utilitaire pour créer des animations GIF depuis PipelineGitHubGrid
 * 
 * Fonctionnalités:
 * - Capture des frames depuis un composant React
 * - Encodage avec gif.js (Web Workers)
 * - Optimisation (max 50 frames, 200ms delay)
 * - Support de différents intervalTypes (days, weeks, phases)
 */

/**
 * Exporter un pipeline en GIF animé
 * @param {Object} pipelineData - Données du pipeline (config + cells)
 * @param {HTMLElement} containerElement - Élément DOM contenant le PipelineGitHubGrid
 * @param {Object} options - Options d'export
 * @param {number} options.delay - Délai entre frames (ms), default 200
 * @param {number} options.quality - Qualité GIF (1-20, 1=meilleur), default 10
 * @param {number} options.width - Largeur du GIF, default container width
 * @param {number} options.height - Hauteur du GIF, default container height
 * @param {boolean} options.showProgress - Afficher la progression, default true
 * @param {Function} options.onProgress - Callback de progression (percent)
 * @returns {Promise<Blob>} - Blob du GIF généré
 */
export async function exportPipelineToGIF(
    pipelineData,
    containerElement,
    options = {}
) {
    const {
        delay = 200,
        quality = 10,
        width = containerElement.offsetWidth,
        height = containerElement.offsetHeight,
        showProgress = true,
        onProgress
    } = options

    // Valider les données
    if (!pipelineData || !pipelineData.cells) {
        throw new Error('Invalid pipeline data: cells required')
    }

    if (!containerElement) {
        throw new Error('Container element is required')
    }

    // Initialiser gif.js avec Web Workers
    const gif = new GIF({
        workers: 4,
        quality,
        width,
        height,
        workerScript: '/gif.worker.js', // Copier depuis node_modules/gif.js/dist/
        transparent: null
    })

    // Récupérer les frames à capturer (cellules non vides)
    const frames = prepareFrames(pipelineData)

    // Limiter à 50 frames max pour performance
    const maxFrames = 50
    const frameStep = Math.max(1, Math.ceil(frames.length / maxFrames))
    const selectedFrames = frames.filter((_, idx) => idx % frameStep === 0).slice(0, maxFrames)
    // Capturer chaque frame
    for (let i = 0; i < selectedFrames.length; i++) {
        const frame = selectedFrames[i]

        // Mettre à jour l'état du pipeline pour cette frame
        await renderFrame(containerElement, pipelineData, frame.cellIndex)

        // Attendre le rendu
        await waitForRender()

        // Capturer l'image
        const canvas = await captureCanvas(containerElement, width, height)

        // Ajouter au GIF
        gif.addFrame(canvas, { delay })

        // Progression
        if (onProgress) {
            onProgress(Math.round((i + 1) / selectedFrames.length * 100))
        }
    const frames = []

    for (let i = 0; i < totalCells; i++) {
        const cellData = cells[i]

        // Inclure toutes les cellules (même vides) pour animation fluide
        frames.push({
            cellIndex: i,
            data: cellData || { intensity: 0 }
        })
    }

    return frames
}

/**
 * Obtenir le nombre total de cases selon la configuration
 * @param {Object} config - Configuration du pipeline
 * @returns {number} - Nombre total de cases
 */
function getTotalCells(config) {
    const { intervalType } = config

    const maxCells = {
        seconds: 60,
        minutes: 60,
        hours: 24,
        days: 365,
        weeks: 52,
        months: 12,
        phase: 12
    }

    return maxCells[intervalType] || 365
}

/**
 * Rendre une frame spécifique dans le container
 * @param {HTMLElement} container - Container element
 * @param {Object} pipelineData - Données du pipeline
 * @param {number} cellIndex - Index de la cellule à highlighter
 */
async function renderFrame(container, pipelineData, cellIndex) {
    // Trouver tous les cells dans le DOM
    const cells = container.querySelectorAll('[data-cell-index]')

    // Reset tous les cells
    cells.forEach(cell => {
        cell.classList.remove('pipeline-cell-active', 'pipeline-cell-highlight')
        cell.style.transform = 'scale(1)'
        cell.style.boxShadow = 'none'
    })

    // Highlighter la cellule active
    const activeCell = container.querySelector(`[data-cell-index="${cellIndex}"]`)
    if (activeCell) {
        activeCell.classList.add('pipeline-cell-active', 'pipeline-cell-highlight')
        activeCell.style.transform = 'scale(1.2)'
        activeCell.style.boxShadow = '0 0 20px rgba(124, 58, 237, 0.8)'
    }

    // Forcer un reflow pour que les animations CSS se déclenchent
    container.offsetHeight // eslint-disable-line no-unused-expressions
}

/**
 * Attendre que le rendu soit terminé
 * @param {number} ms - Temps d'attente en ms
 * @returns {Promise<void>}
 */
function waitForRender(ms = 50) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Capturer le container dans un canvas
 * @param {HTMLElement} container - Container element
 * @param {number} width - Largeur du canvas
 * @param {number} height - Hauteur du canvas
 * @returns {Promise<HTMLCanvasElement>} - Canvas capturé
 */
async function captureCanvas(container, width, height) {
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    // Option 1: Utiliser html2canvas si disponible
    if (window.html2canvas) {
        const capturedCanvas = await window.html2canvas(container, {
            width,
            height,
            backgroundColor: null,
            logging: false
        })
        ctx.drawImage(capturedCanvas, 0, 0)
        return canvas
    }

    // Option 2: Fallback avec drawImage (nécessite que le container soit un canvas)
    // Pour PipelineGitHubGrid, on utilisera html2canvas ou une capture SVG

    // Pour l'instant, créer un canvas simple avec le texte de debug
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = '#ffffff'
    ctx.font = '16px Inter, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('Frame capture', width / 2, height / 2)

    return canvas
}

/**
 * Télécharger le GIF généré
 * @param {Blob} blob - Blob du GIF
 * @param {string} filename - Nom du fichier
 */
export function downloadGIF(blob, filename = 'pipeline-animation.gif') {
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
 * Hook React pour l'export GIF avec état
 * @returns {Object} - { isExporting, progress, exportToGIF }
 */
export function useGIFExport() {
    const [isExporting, setIsExporting] = React.useState(false)
    const [progress, setProgress] = React.useState(0)

    const exportToGIF = async (pipelineData, containerElement, options = {}) => {
        setIsExporting(true)
        setProgress(0)

        try {
            const blob = await exportPipelineToGIF(pipelineData, containerElement, {
                ...options,
                onProgress: (percent) => {
                    setProgress(percent)
                    options.onProgress?.(percent)
                }
            })

            const filename = `pipeline-${pipelineData.config?.pipelineType || 'animation'}-${Date.now()}.gif`
            downloadGIF(blob, filename)

            return blob
        } catch (error) {
        }
    }

    return { isExporting, progress, exportToGIF }
}
