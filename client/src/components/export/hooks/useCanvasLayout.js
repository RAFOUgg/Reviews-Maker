import { useEffect, useState } from 'react';

export default function useCanvasLayout(previewAreaRef, format) {
    const DESIGN_SIZES = {
        '1:1': { w: 540, h: 540 },
        '16:9': { w: 720, h: 405 },
        '9:16': { w: 405, h: 720 },
        'A4': { w: 530, h: 750 }
    };

    const designSize = DESIGN_SIZES[format] || DESIGN_SIZES['1:1'];
    const [canvasScale, setCanvasScale] = useState(1);

    useEffect(() => {
        const el = previewAreaRef?.current;
        if (!el) return;

        const compute = () => {
            const rect = el.getBoundingClientRect();
            const availW = rect.width - 32;
            const availH = rect.height - 32;
            if (availW <= 0 || availH <= 0) return;
            const scaleW = availW / designSize.w;
            const scaleH = availH / designSize.h;
            setCanvasScale(Math.min(scaleW, scaleH, 1));
        };

        compute();
        const observer = new ResizeObserver(compute);
        observer.observe(el);
        return () => observer.disconnect();
    }, [previewAreaRef, format, designSize.w, designSize.h]);

    return { designSize, canvasScale };
}
