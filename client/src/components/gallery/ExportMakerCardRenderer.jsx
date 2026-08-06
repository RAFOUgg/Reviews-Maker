import { useRef, useState, useEffect, useMemo } from 'react';
import TemplateRenderer from '../export/TemplateRenderer';
import { RATIO_DIMENSIONS } from '../../utils/exportMakerHelpers';
import { DEFAULT_CONFIG } from '../../store/exportMakerStore';

// Même logique de mise à l'échelle que PreviewPane.jsx (aperçu Export Maker) — TemplateRenderer
// rend toujours à la résolution native fixe (ex: 800x800), donc on le scale via transform pour
// qu'il rentre dans la cellule de grille de la galerie, au lieu de déborder ou d'être rogné.
function useScaleToFit(canvasW, canvasH) {
    const ref = useRef(null);
    const [scale, setScale] = useState(1);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const ro = new ResizeObserver(() => {
            const { width, height } = el.getBoundingClientRect();
            if (width > 0 && height > 0) {
                setScale(Math.min(width / canvasW, height / canvasH));
            }
        });
        ro.observe(el);
        return () => ro.disconnect();
    }, [canvasW, canvasH]);
    return { ref, scale };
}

/**
 * Rend une review avec le même moteur que l'aperçu Export Maker (TemplateRenderer),
 * pour que la galerie publique affiche exactement le template/couleurs/modules choisis
 * par l'auteur, au lieu d'un layout générique fixe.
 */
export default function ExportMakerCardRenderer({ reviewData, exportMakerConfig }) {
    const config = useMemo(() => ({
        ...DEFAULT_CONFIG,
        ...(exportMakerConfig || {}),
        contentModules: { ...DEFAULT_CONFIG.contentModules, ...(exportMakerConfig?.contentModules || {}) },
        colors: { ...DEFAULT_CONFIG.colors, ...(exportMakerConfig?.colors || {}) },
        typography: { ...DEFAULT_CONFIG.typography, ...(exportMakerConfig?.typography || {}) },
    }), [exportMakerConfig]);

    const dims = RATIO_DIMENSIONS[config.ratio] || RATIO_DIMENSIONS['1:1'];
    const { ref, scale } = useScaleToFit(dims.width, dims.height);

    if (!reviewData) return null;

    return (
        <div ref={ref} className="relative w-full h-full overflow-hidden">
            <div
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    width: dims.width,
                    height: dims.height,
                    transform: `translate(-50%, -50%) scale(${scale})`,
                }}
            >
                {/* Vignette de galerie : fortement réduite et elle-même cliquable pour ouvrir la
                    review. Une infobulle par champ y serait du bruit et entrerait en conflit avec
                    ce clic — l'interactivité appartient aux surfaces de lecture (/r/:id, Studio,
                    page de détail), pas à une vignette. */}
                <TemplateRenderer config={config} reviewData={reviewData} interactive={false} />
            </div>
        </div>
    );
}
