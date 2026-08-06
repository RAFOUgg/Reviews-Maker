import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import TemplateRenderer from './TemplateRenderer'
import { resolveConfigForReview } from '../../store/exportMakerStore'

const RATIO_DIMS = {
    '1:1': { width: 800, height: 800 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1600, height: 1200 },
    'A4': { width: 1754, height: 2480 },
}

/**
 * Rendu lecture-seule d'UNE review, à l'échelle de son conteneur — extrait de
 * `PublicRenderPage.jsx` (2026-07-29) pour être réutilisé à la fois par la page `/r/:id` (1 seule
 * review) et par `ReviewLineagePage.jsx` (plusieurs reviews d'une chaîne `sourceLineage`
 * empilées). `reviewData` est déjà fetchée par l'appelant — ce composant ne fait que résoudre sa
 * config Export Maker et la mettre à l'échelle, il ne fetch rien lui-même.
 */
export default function SingleReviewCard({ reviewData, canvasId = 'public-render-canvas' }) {
    const containerRef = useRef(null)
    const scaledBoxRef = useRef(null)
    const [scale, setScale] = useState(1)
    const [contentHeight, setContentHeight] = useState(0)

    // Répare au passage un exportMakerConfig sauvegardé avant l'ajout de nouvelles clés à
    // DEFAULT_CONFIG.contentModules — sinon les sections "opt-in" (cultivarsList, aromas,
    // terpenes…) disparaissent silencieusement sur une review pourtant pleine.
    const config = resolveConfigForReview(reviewData, 'detailedCard')
    const dims = RATIO_DIMS[config?.ratio] || RATIO_DIMS['1:1']

    // Mise à l'échelle sur la LARGEUR uniquement — la fiche est un document vivant censé défiler
    // normalement, pas un export figé à ratio fixe. Caler aussi sur la hauteur du viewport forçait
    // un canevas à hauteur bloquée qui coupait silencieusement tout contenu dépassant un seul
    // écran (bug corrigé 2026-07-27, cf. `allowOverflow` sur TemplateRenderer).
    useEffect(() => {
        const el = containerRef.current
        if (!el || !reviewData) return
        const observer = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect
            if (width) {
                setScale(Math.min(width / dims.width, 1))
            }
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [reviewData, dims.width])

    // Mesure la hauteur RÉELLE (non affectée par `transform: scale`, qui ne change que le rendu
    // visuel, pas la boîte de mise en page) pour compenser l'espace réservé par le flux normal —
    // sans ça, sur mobile (scale ~0.2), ~80% de la page sous la fiche visible serait un vide
    // scrollable correspondant à l'espace non-réduit de la boîte.
    useEffect(() => {
        const el = scaledBoxRef.current
        if (!el) return
        const observer = new ResizeObserver((entries) => {
            const h = entries[0].contentRect.height
            if (h) setContentHeight(h)
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [reviewData])

    return (
        <div ref={containerRef} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* `allowOverflow` : la fiche défile normalement au lieu d'être coupée à la hauteur
                d'un seul écran — `height:'auto'` + `transform-origin` en haut pour que la mise à
                l'échelle ne recentre pas un document potentiellement plus haut que la fenêtre. */}
            <div
                ref={scaledBoxRef}
                style={{
                    width: dims.width, height: 'auto',
                    transform: `scale(${scale})`, transformOrigin: 'top center', flexShrink: 0,
                    borderRadius: 12, overflow: 'visible', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    marginBottom: (scale < 1 && contentHeight) ? `${-(1 - scale) * contentHeight}px` : 0,
                }}
            >
                <TemplateRenderer config={config} reviewData={reviewData} canvasId={canvasId} allowOverflow />
            </div>
        </div>
    )
}

SingleReviewCard.propTypes = {
    reviewData: PropTypes.object.isRequired,
    canvasId: PropTypes.string,
}
