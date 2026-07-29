import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import SingleReviewCard from '../../components/export/SingleReviewCard'

const TYPE_ICONS = {
    Fleurs: '🌱', Fleur: '🌱',
    Hash: '🔬',
    Concentré: '⚗️',
    Comestible: '🍯',
}

/**
 * Traçabilité multi-review — remonte et affiche la chaîne `sourceLineage` d'une review (Fleur →
 * Hash → Concentré → Comestible) comme un "site" en une seule page : fil d'ariane cliquable en
 * haut, fiches Export Maker complètes empilées dans l'ordre de production (source la plus en
 * amont en premier, review demandée en dernier). Traversée ASCENDANTE uniquement — retrouve les
 * sources d'une review, pas ce qu'elle est devenue (cf. `GET /api/reviews/:id/lineage`, décision
 * de scope documentée dans CLAUDE.md sur le rapprochement cross-auteur).
 *
 * Chaque review de la chaîne est rendue via `SingleReviewCard.jsx` (même moteur que `/r/:id`) —
 * aucune nouvelle logique de champs/rendu, juste l'orchestration de plusieurs fiches + navigation.
 */
export default function ReviewLineagePage() {
    const { id } = useParams()
    const [data, setData] = useState(null)
    const [error, setError] = useState(null) // 'not_found' | 'forbidden' | 'network'
    const sectionRefs = useRef({})

    useEffect(() => {
        let active = true
        setData(null)
        setError(null)
        fetch(`/api/reviews/${id}/lineage`, { credentials: 'include' })
            .then((res) => {
                if (res.status === 404) throw new Error('not_found')
                if (res.status === 403) throw new Error('forbidden')
                if (!res.ok) throw new Error('network')
                return res.json()
            })
            .then((json) => { if (active) setData(json) })
            .catch((err) => { if (active) setError(err.message || 'network') })
        return () => { active = false }
    }, [id])

    // Regroupe les nœuds par profondeur, triés du plus profond (source la plus en amont) au moins
    // profond (0 = review demandée) — c'est l'ordre de production naturel : Fleur avant Hash avant
    // Concentré avant Comestible, quel que soit le nœud d'ancrage utilisé pour ouvrir la page.
    const levels = useMemo(() => {
        if (!data?.nodes) return []
        const byDepth = new Map()
        for (const node of data.nodes) {
            if (!byDepth.has(node.depth)) byDepth.set(node.depth, [])
            byDepth.get(node.depth).push(node)
        }
        return Array.from(byDepth.entries())
            .sort((a, b) => b[0] - a[0])
            .map(([depth, nodes]) => ({ depth, nodes }))
    }, [data])

    const scrollToNode = (nodeId) => {
        sectionRefs.current[nodeId]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    if (error === 'not_found') {
        return (
            <CenteredMessage>Cette fiche n'existe pas ou n'est plus publique.</CenteredMessage>
        )
    }
    if (error === 'forbidden') {
        return (
            <CenteredMessage>Cette fiche est privée.</CenteredMessage>
        )
    }
    if (error) {
        return (
            <CenteredMessage>Impossible de charger la chaîne de traçabilité.</CenteredMessage>
        )
    }
    if (!data) {
        return (
            <CenteredMessage opacity={0.5}>Chargement…</CenteredMessage>
        )
    }

    return (
        <div style={{ minHeight: '100vh', width: '100%', background: '#0a0a0f', color: '#fff', boxSizing: 'border-box' }}>
            {/* Fil d'ariane — une pastille par nœud, groupées par génération, cliquable pour
                scroller vers la fiche correspondante. Les nœuds inaccessibles sont désactivés. */}
            <div
                style={{
                    position: 'sticky', top: 0, zIndex: 10, background: 'rgba(10,10,15,0.92)',
                    backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(255,255,255,0.08)',
                    padding: '12px 16px', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8,
                }}
            >
                <span style={{ fontSize: 12, opacity: 0.5, marginRight: 4 }}>Traçabilité :</span>
                {levels.map((level, levelIdx) => (
                    <div key={level.depth} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {level.nodes.map((node) => (
                            <button
                                key={node.id}
                                onClick={() => node.accessible && scrollToNode(node.id)}
                                disabled={!node.accessible}
                                title={node.accessible ? (node.review?.holderName || node.review?.title || node.type) : 'Review non accessible'}
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600,
                                    border: node.id === id ? '1px solid rgba(167,139,250,0.6)' : '1px solid rgba(255,255,255,0.12)',
                                    background: node.id === id ? 'rgba(167,139,250,0.18)' : 'rgba(255,255,255,0.04)',
                                    color: node.accessible ? '#fff' : 'rgba(255,255,255,0.35)',
                                    cursor: node.accessible ? 'pointer' : 'not-allowed',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <span>{node.accessible ? (TYPE_ICONS[node.type] || '📄') : '🔒'}</span>
                                <span>{node.accessible ? (node.review?.holderName || node.review?.title || node.type) : 'Privé'}</span>
                            </button>
                        ))}
                        {levelIdx < levels.length - 1 && (
                            <span style={{ opacity: 0.4 }}>→</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Fiches empilées, une section par génération */}
            <div style={{ padding: '32px 16px', display: 'flex', flexDirection: 'column', gap: 48 }}>
                {levels.map((level) => (
                    <div key={level.depth} style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                        {level.nodes.map((node) => (
                            <div key={node.id} ref={(el) => { sectionRefs.current[node.id] = el }} style={{ scrollMarginTop: 72 }}>
                                {node.accessible ? (
                                    <>
                                        <div style={{ maxWidth: 900, margin: '0 auto 12px', display: 'flex', alignItems: 'center', gap: 8, opacity: 0.7, fontSize: 13 }}>
                                            <span>{TYPE_ICONS[node.type] || '📄'}</span>
                                            <span>{node.type}{node.id === id ? ' · review consultée' : ''}</span>
                                        </div>
                                        <SingleReviewCard reviewData={node.review} canvasId={`lineage-node-${node.id}`} />
                                    </>
                                ) : (
                                    <div style={{
                                        maxWidth: 900, margin: '0 auto', padding: 32, textAlign: 'center',
                                        border: '1px dashed rgba(255,255,255,0.15)', borderRadius: 12, opacity: 0.5,
                                    }}>
                                        🔒 Source non accessible (review privée ou supprimée)
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ))}
            </div>

            <div style={{ textAlign: 'center', paddingBottom: 32 }}>
                <Link to={`/r/${id}`} style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, textDecoration: 'none' }}>
                    ← Retour à la fiche
                </Link>
            </div>
        </div>
    )
}

function CenteredMessage({ children, opacity = 0.6 }) {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', color: '#fff' }}>
            <p style={{ opacity }}>{children}</p>
        </div>
    )
}
