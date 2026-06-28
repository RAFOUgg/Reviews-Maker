import { useRef, useState, useEffect, useMemo } from 'react';
import TemplateRenderer from '../export/TemplateRenderer';
import { RATIO_DIMENSIONS } from '../../utils/orchardHelpers';
import { DEFAULT_CONFIG } from '../../store/orchardStore';

// Même logique de mise à l'échelle que PreviewPane.jsx (aperçu Orchard Studio) — TemplateRenderer
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
 * Rend une review avec le même moteur que l'aperçu Orchard Studio (TemplateRenderer),
 * pour que la galerie publique affiche exactement le template/couleurs/modules choisis
 * par l'auteur, au lieu d'un layout générique fixe.
 */
export default function OrchardCardRenderer({ reviewData, orchardConfig }) {
    const config = useMemo(() => ({
        ...DEFAULT_CONFIG,
        ...(orchardConfig || {}),
        contentModules: { ...DEFAULT_CONFIG.contentModules, ...(orchardConfig?.contentModules || {}) },
        colors: { ...DEFAULT_CONFIG.colors, ...(orchardConfig?.colors || {}) },
        typography: { ...DEFAULT_CONFIG.typography, ...(orchardConfig?.typography || {}) },
    }), [orchardConfig]);

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
                <TemplateRenderer config={config} reviewData={reviewData} />
            </div>
        </div>
    );
}
