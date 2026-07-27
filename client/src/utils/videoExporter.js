/**
 * videoExporter — export "fiche animée" en vidéo (Phase 4 de la finalisation Export Maker),
 * pendant Chantier "GIF pleine carte". Approche retenue avec l'utilisateur : `MediaRecorder`
 * natif au navigateur plutôt qu'un encodeur type ffmpeg.wasm — aucune dépendance lourde
 * supplémentaire, cohérent avec le reste du pipeline de capture (canvas déjà rasterisés via
 * html-to-image dans ExportModal.jsx).
 *
 * Principe : les pages sont déjà rasterisées en canvases (mêmes canvases que ceux utilisés pour
 * le GIF pleine carte, cf. `exportCanvasesToGIF` dans TimelapseExporter.js) ; on les dessine l'un
 * après l'autre sur UN SEUL canvas d'enregistrement dont on capture le flux via
 * `HTMLCanvasElement.captureStream()`, enregistré par `MediaRecorder` en `.webm` (codec natif,
 * pas de conteneur .mp4 — conversion ultérieure possible si un besoin de compatibilité se
 * confirme, cf. CLAUDE.md).
 */

function pickSupportedMimeType() {
    const candidates = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
    ];
    return candidates.find((t) => window.MediaRecorder?.isTypeSupported?.(t)) || 'video/webm';
}

/**
 * Encode une liste de canvases déjà capturés en vidéo `.webm`, chaque canvas affiché pendant
 * `frameDuration` ms.
 * @param {HTMLCanvasElement[]} canvases
 * @param {Object} options - { width, height, frameDuration, fps, onProgress }
 * @returns {Promise<Blob>}
 */
export async function exportCanvasesToVideo(canvases, options = {}) {
    if (!canvases || canvases.length < 2) {
        throw new Error('Au moins 2 pages sont nécessaires pour une vidéo pleine carte');
    }
    if (typeof window.MediaRecorder === 'undefined') {
        throw new Error('Enregistrement vidéo non supporté par ce navigateur');
    }

    const { width = canvases[0].width, height = canvases[0].height, frameDuration = 1800, fps = 30, onProgress } = options;

    const recordCanvas = document.createElement('canvas');
    recordCanvas.width = width;
    recordCanvas.height = height;
    const ctx = recordCanvas.getContext('2d');

    const stream = recordCanvas.captureStream(fps);
    const mimeType = pickSupportedMimeType();
    const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 4_000_000 });
    const chunks = [];
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };

    const recordingStopped = new Promise((resolve, reject) => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: mimeType }));
        recorder.onerror = (e) => reject(e.error || new Error('Erreur MediaRecorder'));
    });

    // Première frame dessinée AVANT de démarrer l'enregistrement, sinon les premières millisecondes
    // capturent un canvas vide.
    ctx.drawImage(canvases[0], 0, 0, width, height);
    recorder.start();

    for (let i = 0; i < canvases.length; i++) {
        ctx.drawImage(canvases[i], 0, 0, width, height);
        onProgress?.(Math.round(((i + 1) / canvases.length) * 100));
        await new Promise((r) => setTimeout(r, frameDuration));
    }

    recorder.stop();
    return recordingStopped;
}

export function downloadVideo(blob, filename = 'fiche.webm') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}
