import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import TemplateRenderer from '../../components/export/TemplateRenderer'
import { resolveExportMakerConfig } from '../../store/exportMakerStore'
import { DEFAULT_TEMPLATES } from '../../store/exportMakerConstants'

const RATIO_DIMS = {
    '1:1': { width: 800, height: 800 },
    '16:9': { width: 1920, height: 1080 },
    '9:16': { width: 1080, height: 1920 },
    '4:3': { width: 1600, height: 1200 },
    'A4': { width: 1754, height: 2480 },
}

/**
 * Lien HTML vivant partageable (Chantier B de la finalisation Export Maker) — contrairement à un
 * export figé (PNG/PDF/…), cette page se contente de re-rendre TemplateRenderer avec les données
 * ACTUELLES de la review à chaque visite : pas de nouveau mécanisme de "live update" à construire,
 * juste une page qui ne fige rien. Réutilise exactement le même moteur que l'aperçu Export Maker
 * et le bouton "Exporter" (TemplateRenderer/exportDataAdapter/fieldRegistry) — aucune nouvelle
 * logique de champs. Respecte la visibilité existante : `GET /api/reviews/:id` ne sert déjà que les
 * reviews publiques à un visiteur non connecté (canReadFor côté serveur), pas de nouveau modèle de
 * permission à inventer ici.
 */
export default function PublicRenderPage() {
    const { id } = useParams()
    const [review, setReview] = useState(null)
    const [notFound, setNotFound] = useState(false)
    const containerRef = useRef(null)
    const scaledBoxRef = useRef(null)
    const [scale, setScale] = useState(1)
    const [contentHeight, setContentHeight] = useState(0)

    useEffect(() => {
        let active = true
        fetch(`/api/reviews/${id}`, { credentials: 'include' })
            .then((res) => { if (!res.ok) throw new Error('unavailable'); return res.json() })
            .then((data) => { if (active) setReview(data) })
            .catch(() => { if (active) setNotFound(true) })
        return () => { active = false }
    }, [id])

    const config = (() => {
        const fallback = { template: 'detailedCard', ratio: DEFAULT_TEMPLATES.detailedCard.defaultRatio }
        if (!review?.exportMakerConfig) return resolveExportMakerConfig(fallback)
        try {
            const saved = typeof review.exportMakerConfig === 'string' ? JSON.parse(review.exportMakerConfig) : review.exportMakerConfig
            // Répare un exportMakerConfig sauvegardé avant l'ajout de nouvelles clés à
            // DEFAULT_CONFIG.contentModules — sinon les sections "opt-in" (cultivarsList,
            // aromas, terpenes…) disparaissent silencieusement sur une review pourtant pleine.
            return resolveExportMakerConfig(saved)
        } catch {
            return resolveExportMakerConfig(fallback)
        }
    })()
    const dims = RATIO_DIMS[config?.ratio] || RATIO_DIMS['1:1']

    // Mise à l'échelle sur la LARGEUR uniquement — contrairement à l'aperçu Export Maker (qui
    // capture une image à ratio fixe), cette page est un document vivant censé défiler
    // normalement (cf. commentaire du composant). Caler aussi sur la hauteur du viewport forçait
    // un canevas à hauteur bloquée qui coupait silencieusement tout contenu dépassant un seul
    // écran (bug corrigé 2026-07-27, cf. `allowOverflow` sur TemplateRenderer).
    useEffect(() => {
        const el = containerRef.current
        if (!el || !review) return
        const observer = new ResizeObserver((entries) => {
            const { width } = entries[0].contentRect
            if (width) {
                setScale(Math.min(width / dims.width, 1))
            }
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [review, dims.width])

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
    }, [review])

    if (notFound) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#fff' }}>
                <p style={{ opacity: 0.6 }}>Cette fiche n'existe pas ou n'est plus publique.</p>
            </div>
        )
    }

    if (!review) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#fff' }}>
                <p style={{ opacity: 0.5 }}>Chargement…</p>
            </div>
        )
    }

    return (
        <div
            ref={containerRef}
            style={{
                minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: '#0a0a0f', padding: 16, boxSizing: 'border-box',
            }}
        >
            {/* `allowOverflow` : la fiche défile normalement au lieu d'être coupée à la hauteur
                d'un seul écran (bug corrigé 2026-07-27) — `height:'auto'` + `transform-origin` en
                haut pour que la mise à l'échelle ne recentre pas un document potentiellement plus
                haut que la fenêtre. */}
            <div
                ref={scaledBoxRef}
                style={{
                    width: dims.width, height: 'auto',
                    transform: `scale(${scale})`, transformOrigin: 'top center', flexShrink: 0,
                    borderRadius: 12, overflow: 'visible', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    marginBottom: (scale < 1 && contentHeight) ? `${-(1 - scale) * contentHeight}px` : 0,
                }}
            >
                <TemplateRenderer config={config} reviewData={review} canvasId="public-render-canvas" allowOverflow />
            </div>
        </div>
    )
}
