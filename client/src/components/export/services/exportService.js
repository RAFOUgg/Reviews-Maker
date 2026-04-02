// exportService - helper functions to export a DOM node to various formats

export async function exportToPng(node, { pixelRatio = 2, backgroundColor = 'transparent', quality = 1, filter } = {}) {
    const { toPng } = await import('html-to-image');
    return toPng(node, { pixelRatio, backgroundColor, quality, filter });
}

export async function exportToJpeg(node, { pixelRatio = 2, backgroundColor = '#ffffff', quality = 0.95, filter } = {}) {
    const { toJpeg } = await import('html-to-image');
    return toJpeg(node, { pixelRatio, backgroundColor, quality, filter });
}

export async function exportToSvg(node, { pixelRatio = 2, backgroundColor = 'transparent', filter } = {}) {
    try {
        const mod = await import('html-to-image');
        if (mod.toSvg) {
            return mod.toSvg(node, { filter });
        }
    } catch (err) {
        // fallthrough to png wrapper
    }

    // Fallback: render PNG and wrap into an SVG image tag
    const png = await exportToPng(node, { pixelRatio, backgroundColor, filter });
    const img = new Image();
    return new Promise((resolve, reject) => {
        img.onload = () => {
            const svg = `<?xml version="1.0" encoding="utf-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${img.width}" height="${img.height}">\n  <image href="${png}" width="${img.width}" height="${img.height}"/>\n</svg>`;
            resolve(svg);
        };
        img.onerror = (e) => reject(e);
        img.src = png;
    });
}

export async function exportToPdf(node, { pixelRatio = 2, backgroundColor = '#ffffff', format = 'a4', orientation = 'portrait', designSize } = {}) {
    const dataUrl = await exportToPng(node, { pixelRatio, backgroundColor });
    const jsPDFMod = await import('jspdf');
    const jsPDF = jsPDFMod.default;

    const pdf = new jsPDF({ orientation: orientation || 'portrait', unit: 'mm', format });

    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (designSize?.h / designSize?.w) * imgWidth || imgWidth;

    pdf.addImage(dataUrl, 'PNG', 0, 0, imgWidth, imgHeight);
    return pdf.output('blob');
}

export function downloadDataUrl(dataUrlOrSvg, filename, { asBlob = false } = {}) {
    // If dataUrlOrSvg is SVG content (starts with '<'), convert to blob
    if (typeof dataUrlOrSvg === 'string' && dataUrlOrSvg.trim().startsWith('<')) {
        const blob = new Blob([dataUrlOrSvg], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
        return;
    }

    const link = document.createElement('a');
    link.href = dataUrlOrSvg;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
}

export async function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
}
