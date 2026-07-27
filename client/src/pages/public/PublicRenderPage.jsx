import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import TemplateRenderer from '../../components/export/TemplateRenderer'
import { resolveOrchardConfig } from '../../store/orchardStore'
import { DEFAULT_TEMPLATES } from '../../store/orchardConstants'

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
 * juste une page qui ne fige rien. Réutilise exactement le même moteur que l'aperçu Orchard Studio
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
    const [scale, setScale] = useState(1)

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
        if (!review?.orchardConfig) return resolveOrchardConfig(fallback)
        try {
            const saved = typeof review.orchardConfig === 'string' ? JSON.parse(review.orchardConfig) : review.orchardConfig
            // Répare un orchardConfig sauvegardé avant l'ajout de nouvelles clés à
            // DEFAULT_CONFIG.contentModules — sinon les sections "opt-in" (cultivarsList,
            // aromas, terpenes…) disparaissent silencieusement sur une review pourtant pleine.
            return resolveOrchardConfig(saved)
        } catch {
            return resolveOrchardConfig(fallback)
        }
    })()
    const dims = RATIO_DIMS[config?.ratio] || RATIO_DIMS['1:1']

    useEffect(() => {
        const el = containerRef.current
        if (!el || !review) return
        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect
            if (width && height) {
                setScale(Math.min(width / dims.width, height / dims.height, 1))
            }
        })
        observer.observe(el)
        return () => observer.disconnect()
    }, [review, dims.width, dims.height])

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
                minHeight: '100vh', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: '#0a0a0f', padding: 16, boxSizing: 'border-box', overflow: 'hidden',
            }}
        >
            <div
                style={{
                    width: dims.width, height: dims.height,
                    transform: `scale(${scale})`, transformOrigin: 'center center', flexShrink: 0,
                    borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                }}
            >
                <TemplateRenderer config={config} reviewData={review} canvasId="public-render-canvas" />
            </div>
        </div>
    )
}
