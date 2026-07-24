import html2canvas from 'html2canvas'
import GIF from 'gif.js'
import { getAllCellsForPipeline, REVIEW_TYPE_PIPELINES } from './chainCellPipelines'
import { normalizeProductType } from './fieldRegistry'

/**
 * TimelapseExporter — export "évolutif" (Chantier C de la finalisation Export Maker) : anime dans
 * un GIF les cellules d'une timeline de pipeline (Culture/Séparation/Extraction/Curing), dans
 * l'ordre chronologique où elles ont été remplies.
 *
 * Généralisé depuis `CuringGIFExporter.js` (prototype fonctionnel mais scopé au seul curing, avec
 * des libellés/couleurs codés en dur et un bug réel : `useCuringGIFExport` utilisait `React.useState`
 * sans jamais importer React — n'a jamais pu être appelé sans planter). Ce fichier corrige ce bug en
 * n'exposant que des fonctions pures (pas de hook), et généralise le rendu à N'IMPORTE QUEL pipeline
 * en introspectant les champs numériques de chaque cellule plutôt que des clés visual/odor/taste/
 * effects codées en dur — fonctionne donc pour Culture/Séparation/Extraction, pas seulement Curing,
 * sans avoir à connaître à l'avance le schéma exact de chaque type de pipeline.
 *
 * Réutilise `getAllCellsForPipeline` (chainCellPipelines.js), déjà la logique de référence pour lire
 * une cellule de pipeline — utilisée par le canevas Chaîne de production — plutôt que d'en écrire
 * une seconde.
 */

/**
 * Convertit les champs déjà résumés d'une cellule (`cell.fields`, produits par
 * `summarizeCellFields` — même logique que le panneau latéral du canevas Chaîne de production,
 * pas une réinvention) en métriques affichables : une barre de progression si la valeur est
 * purement numérique (ex: "7.5" ou "42 %"), sinon une ligne de texte brute (ex: listes de notes
 * dominantes). Une frame reste lisible avec 6 champs maximum.
 */
function toDisplayMetrics(fields) {
    return (fields || []).slice(0, 6).map((f) => {
        const match = String(f.value).match(/^(-?\d+(?:\.\d+)?)\s*(%)?/)
        if (match) {
            const num = parseFloat(match[1])
            const max = match[2] === '%' ? 100 : 10
            return { label: f.label, kind: 'bar', value: num, max, display: f.value }
        }
        return { label: f.label, kind: 'text', display: f.value }
    })
}

const METRIC_COLORS = ['#3b82f6', '#a855f7', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

/**
 * Construit les frames d'un pipeline donné pour une review — ne retient que les cellules ayant
 * réellement des données saisies (pas les cases vides de la grille temporelle).
 *
 * @param {Object} reviewData - review telle que renvoyée par l'API (déjà aplatie par formatReview)
 * @param {string} [pipelineKey] - 'culture'|'curing'|'separation'|'extraction', défaut : le premier
 *   pipeline "de fabrication" du type (culture/séparation/extraction selon le type de produit)
 * @returns {Array<{cellLabel: string, metrics: Array}>}
 */
export function getTimelapseFrames(reviewData, pipelineKey) {
    if (!reviewData) return []
    const productType = normalizeProductType(reviewData.type)
    const pipelines = REVIEW_TYPE_PIPELINES[productType] || []
    const def = pipelineKey
        ? pipelines.find((p) => p.key === pipelineKey)
        : pipelines.find((p) => p.key !== 'general')

    if (!def || !def.dataKey) return []

    const cells = getAllCellsForPipeline(reviewData, def)
    // `hasData`/`fields` viennent de getAllCellsForPipeline (même logique que le panneau latéral du
    // canevas Chaîne de production) — ne garder que les cellules réellement remplies, pas la grille
    // vide générée pour l'affichage/complétion.
    return cells
        .filter((cell) => cell.hasData)
        .map((cell) => ({ cellLabel: cell.cellLabel, metrics: toDisplayMetrics(cell.fields) }))
}

/** Les pipelines disponibles (avec au moins 2 frames exploitables) pour une review donnée. */
export function getAvailableTimelapsePipelines(reviewData) {
    if (!reviewData) return []
    const productType = normalizeProductType(reviewData.type)
    const pipelines = (REVIEW_TYPE_PIPELINES[productType] || []).filter((p) => p.key !== 'general')
    return pipelines
        .map((def) => ({ key: def.key, label: def.label, frameCount: getTimelapseFrames(reviewData, def.key).length }))
        .filter((p) => p.frameCount >= 2)
}

function renderFrame(frame, index, total, title) {
    const bars = frame.metrics.map((m, i) => {
        const color = METRIC_COLORS[i % METRIC_COLORS.length]
        if (m.kind === 'bar') {
            const pct = Math.max(0, Math.min(100, (m.value / m.max) * 100))
            return `
                <div style="margin-bottom: 14px;">
                    <div style="display:flex; justify-content:space-between; font-size:13px; color:#cbd5e1; margin-bottom:4px;">
                        <span>${m.label}</span>
                        <span style="font-weight:700; color:${color};">${m.display}</span>
                    </div>
                    <div style="height:8px; border-radius:4px; background:rgba(148,163,184,0.15); overflow:hidden;">
                        <div style="height:100%; width:${pct}%; background:${color}; border-radius:4px;"></div>
                    </div>
                </div>
            `
        }
        return `
            <div style="margin-bottom: 14px; display:flex; justify-content:space-between; font-size:13px;">
                <span style="color:#cbd5e1;">${m.label}</span>
                <span style="font-weight:600; color:${color}; text-align:right; max-width:60%;">${m.display}</span>
            </div>
        `
    }).join('')

    return `
        <div style="width:100%; height:100%; background:linear-gradient(135deg,#0f172a 0%,#1e293b 100%); padding:32px; font-family:Inter,sans-serif; color:#fff; box-sizing:border-box;">
            <div style="text-align:center; margin-bottom:24px;">
                <h1 style="font-size:24px; font-weight:700; margin:0 0 6px;">${title}</h1>
                <p style="font-size:14px; color:#94a3b8; margin:0;">${frame.cellLabel} · ${index + 1}/${total}</p>
            </div>
            <div>${bars}</div>
            <div style="margin-top:20px; height:4px; border-radius:2px; background:rgba(148,163,184,0.2); overflow:hidden;">
                <div style="height:100%; width:${((index + 1) / total) * 100}%; background:linear-gradient(90deg,#3b82f6,#a855f7);"></div>
            </div>
        </div>
    `
}

/**
 * Encode les frames d'un pipeline en GIF animé.
 * @param {Array} frames - cf. getTimelapseFrames
 * @param {Object} options - { title, delay, quality, width, height, onProgress }
 * @returns {Promise<Blob>}
 */
export async function exportTimelapseToGIF(frames, options = {}) {
    const { title = 'Évolution', delay = 400, quality = 10, width = 800, height = 600, onProgress } = options

    if (!frames || frames.length < 2) {
        throw new Error('Au moins 2 points de données sont nécessaires pour un timelapse')
    }

    const container = document.createElement('div')
    Object.assign(container.style, { position: 'fixed', top: '-9999px', left: '-9999px', width: `${width}px`, height: `${height}px` })
    document.body.appendChild(container)

    const gif = new GIF({ workers: 4, quality, width, height, workerScript: '/gif.worker.js' })

    try {
        for (let i = 0; i < frames.length; i++) {
            container.innerHTML = renderFrame(frames[i], i, frames.length, title)
            await new Promise((r) => setTimeout(r, 50))
            const canvas = await html2canvas(container, { width, height, backgroundColor: '#0f172a', logging: false })
            gif.addFrame(canvas, { delay })
            onProgress?.(Math.round(((i + 1) / frames.length) * 50))
        }

        return await new Promise((resolve, reject) => {
            gif.on('finished', (blob) => { document.body.removeChild(container); resolve(blob) })
            gif.on('error', (error) => { document.body.removeChild(container); reject(error) })
            if (onProgress) gif.on('progress', (p) => onProgress(Math.round(50 + p * 50)))
            gif.render()
        })
    } catch (error) {
        if (container.parentNode) document.body.removeChild(container)
        throw error
    }
}

export function downloadTimelapseGIF(blob, filename = 'evolution.gif') {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
}
