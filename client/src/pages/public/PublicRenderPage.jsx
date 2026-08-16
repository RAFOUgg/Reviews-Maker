import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import SingleReviewCard from '../../components/export/SingleReviewCard'
import { resolveConfigForReview } from '../../store/exportMakerStore'

/**
 * Lien HTML vivant partageable (Chantier B de la finalisation Export Maker) — contrairement à un
 * export figé (PNG/PDF/…), cette page se contente de re-rendre TemplateRenderer avec les données
 * ACTUELLES de la review à chaque visite : pas de nouveau mécanisme de "live update" à construire,
 * juste une page qui ne fige rien. Réutilise exactement le même moteur que l'aperçu Export Maker
 * et le bouton "Exporter" (TemplateRenderer/exportDataAdapter/fieldRegistry) — aucune nouvelle
 * logique de champs. Respecte la visibilité existante : `GET /api/reviews/:id` ne sert déjà que les
 * reviews publiques à un visiteur non connecté (canReadFor côté serveur), pas de nouveau modèle de
 * permission à inventer ici.
 * Le rendu carte lui-même (résolution config + mise à l'échelle) est délégué à
 * `SingleReviewCard.jsx` (extrait le 2026-07-29), partagé avec `ReviewLineagePage.jsx`.
 */
export default function PublicRenderPage() {
    const { id } = useParams()
    const [review, setReview] = useState(null)
    const [notFound, setNotFound] = useState(false)
    // La config Export Maker enregistrée sur la review pilote le rendu écran exactement comme elle
    // pilote les templates de fichier (C10-3) : palette, police, et modules de contenu actifs.
    const config = useMemo(() => (review ? resolveConfigForReview(review, 'detailedCard') : null), [review])

    useEffect(() => {
        let active = true
        fetch(`/api/reviews/${id}`, { credentials: 'include' })
            .then((res) => { if (!res.ok) throw new Error('unavailable'); return res.json() })
            .then((data) => { if (active) setReview(data) })
            .catch(() => { if (active) setNotFound(true) })
        return () => { active = false }
    }, [id])

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
            style={{
                minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center',
                background: '#0a0a0f', padding: 16, boxSizing: 'border-box',
            }}
        >
            {/* RENDU ÉCRAN = le template choisi par l'auteur, en MODE ÉCRAN.
                « retire les vue détaillé, gardons uniquement les rendu export maker » (2026-08-16).

                Cette page a porté trois rendus successifs, et il faut savoir pourquoi celui-ci
                tient. Elle montait d'abord `SingleReviewCard` sur un canevas à taille FIXE
                (1920×1080…) rétréci au `transform: scale` — une image, dont le texte devenait
                minuscule sur téléphone au lieu de se recomposer. C'est ce qui avait motivé la
                bascule vers la Vue Détaillée le 2026-08-06.

                Ce motif a disparu : depuis le mode Écran (2026-08-14), `SingleReviewCard` mesure la
                largeur réellement disponible, la passe au canevas et laisse la mise en page se
                RECOMPOSER — deux colonnes sur ordinateur, une sur téléphone. On revient donc au
                template de l'auteur sans réintroduire le défaut qui l'avait fait abandonner, et
                choisir un template gouverne enfin ce que voient les visiteurs.

                Les 5 templates à canevas fixe restent le mode FICHIER (PNG/PDF/SVG), où la
                pagination et le calibrage gardent tout leur sens — c'est le ratio qui distingue les
                deux, pas un second moteur de rendu. */}
            <div style={{ width: '100%', maxWidth: 1400 }}>
                <SingleReviewCard
                    reviewData={review}
                    config={{ ...config, ratio: 'ecran-pc' }}
                    canvasId="public-render-canvas"
                />
            </div>
            <Link
                to={`/r/${id}/lineage`}
                style={{
                    marginTop: 16, color: 'rgba(255,255,255,0.6)', fontSize: 13, textDecoration: 'none',
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                }}
            >
                Voir la chaîne de traçabilité complète →
            </Link>
        </div>
    )
}
