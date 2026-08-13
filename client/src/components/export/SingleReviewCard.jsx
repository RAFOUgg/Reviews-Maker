import { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import TemplateRenderer from './TemplateRenderer'
import { isTemplatePaginable } from '../../store/exportMakerConstants'
import { resolveConfigForReview } from '../../store/exportMakerStore'
// Table partagée : ce fichier en gardait une troisième copie littérale, donc tout format ajouté
// ailleurs y restait inconnu (les formats d'écran, notamment).
import { RATIO_DIMENSIONS as RATIO_DIMS, isScreenRatio } from '../../utils/exportMakerHelpers'

/**
 * Rendu lecture-seule d'UNE review, à l'échelle de son conteneur — extrait de
 * `PublicRenderPage.jsx` (2026-07-29) pour être réutilisé à la fois par la page `/r/:id` (1 seule
 * review) et par `ReviewLineagePage.jsx` (plusieurs reviews d'une chaîne `sourceLineage`
 * empilées). `reviewData` est déjà fetchée par l'appelant — ce composant ne fait que résoudre sa
 * config Export Maker et la mettre à l'échelle, il ne fetch rien lui-même.
 */
export default function SingleReviewCard({ reviewData, canvasId = 'public-render-canvas', config: configOverride = null, fitHeight = false, onReorderBlocks = null }) {
    const containerRef = useRef(null)
    const scaledBoxRef = useRef(null)
    const [scale, setScale] = useState(1)
    const [contentHeight, setContentHeight] = useState(0)
    const [frameHeight, setFrameHeight] = useState(0)

    // Répare au passage un exportMakerConfig sauvegardé avant l'ajout de nouvelles clés à
    // DEFAULT_CONFIG.contentModules — sinon les sections "opt-in" (cultivarsList, aromas,
    // terpenes…) disparaissent silencieusement sur une review pourtant pleine.
    // `configOverride` : l'aperçu ÉCRAN du Studio pilote ce rendu avec la config EN COURS D'ÉDITION,
    // pas celle sauvegardée sur la review. Sans lui, changer de template dans le Studio ne changeait
    // rien à l'écran — le défaut signalé par l'utilisateur (« Story Social Media » coché, une fiche
    // détaillée affichée). Les autres appelants (`/r/:id`, page de lignée) ne passent rien et
    // continuent de lire la config de la review.
    const config = configOverride || resolveConfigForReview(reviewData, 'detailedCard')
    const dims = RATIO_DIMS[config?.ratio] || RATIO_DIMS['1:1']

    // CARTE ou DOCUMENT ? Les deux ne se rendent pas de la même façon, et les confondre casse
    // visiblement les cartes.
    //
    // Moderne Compact et Story sont bâtis sur un canevas FIXE : racine en `h-full`, composition
    // calée par `FitToFill`. Rendus en hauteur libre (`allowOverflow`), leur `h-full` n'a plus de
    // référence, la hauteur retombe sur celle du contenu — et une Story demandée en CARRÉ sort plus
    // large que haute. Signalé par l'utilisateur, capture à l'appui : « formats carré du template
    // social media = problème rendu horizontal pas carré ». Le fichier exporté, lui, était bien
    // carré (canevas 800×800, PNG 1600×1600) : le défaut était propre à l'aperçu écran.
    //
    // La distinction n'est pas réinventée ici : `TEMPLATE_PAGINATION` la porte déjà — un template
    // non paginable EST une carte (« ce sont des CARTES, elles ne se paginent pas »), les trois
    // autres sont des documents qui coulent.
    // Un format d'ÉCRAN n'est jamais une carte : une fiche en ligne coule sur la hauteur qu'il lui
    // faut, quel que soit le template. Sans cette exception, Moderne Compact et Story se seraient
    // fait couper à 900px de haut sur un téléphone.
    const estCarte = !isTemplatePaginable(config?.template) && !isScreenRatio(config?.ratio)

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

    // `fitHeight` — hauteur de la ZONE d'aperçu, pour caler aussi sur la hauteur.
    //
    // Mesuré le 2026-08-11 : en mode Écran/9:16, le canevas se rendait en 1081×1923 dans une zone
    // d'aperçu haute de ~880px, soit 1046px de débordement à faire défiler. Sur `/r/:id` c'est le
    // comportement voulu (un document en ligne défile), mais dans le Studio l'aperçu doit MONTRER
    // le rendu, pas obliger à le parcourir — d'où cette option, activée par le seul aperçu.
    useEffect(() => {
        if (!fitHeight) return
        const el = containerRef.current
        if (!el) return
        let cadre = el.parentElement
        while (cadre && cadre !== document.body) {
            const ov = getComputedStyle(cadre).overflowY
            if (ov === 'auto' || ov === 'scroll') break
            cadre = cadre.parentElement
        }
        if (!cadre || cadre === document.body) return
        // `clientHeight` inclut le padding du cadre : le déduire, sinon il reste exactement autant
        // de débordement que de padding (mesuré : 32px pour un `p-4`).
        const dispo = () => {
            const cs = getComputedStyle(cadre)
            return cadre.clientHeight - parseFloat(cs.paddingTop || 0) - parseFloat(cs.paddingBottom || 0)
        }
        const observer = new ResizeObserver(() => setFrameHeight(dispo()))
        observer.observe(cadre)
        setFrameHeight(dispo())
        return () => observer.disconnect()
    }, [fitHeight, reviewData])

    // La hauteur naturelle est celle de la boîte NON transformée (`transform` ne change pas la boîte
    // de mise en page) : le facteur se calcule donc sans boucler sur lui-même.
    const fitScale = (fitHeight && frameHeight && contentHeight)
        ? Math.min(scale, frameHeight / contentHeight)
        : scale

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
                    width: dims.width,
                    // Une carte garde la hauteur EXACTE de son ratio ; un document grandit.
                    height: estCarte ? dims.height : 'auto',
                    transform: `scale(${fitScale})`, transformOrigin: 'top center', flexShrink: 0,
                    borderRadius: 12, overflow: 'visible', boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                    marginBottom: (fitScale < 1 && contentHeight) ? `${-(1 - fitScale) * contentHeight}px` : 0,
                }}
            >
                <TemplateRenderer config={config} reviewData={reviewData} canvasId={canvasId} allowOverflow={!estCarte} onReorderBlocks={onReorderBlocks} />
            </div>
        </div>
    )
}

SingleReviewCard.propTypes = {
    reviewData: PropTypes.object.isRequired,
    canvasId: PropTypes.string,
    config: PropTypes.object,
    fitHeight: PropTypes.bool,
    /** Transmis à `TemplateRenderer` : active le glisser-déposer des blocs (Studio seulement). */
    onReorderBlocks: PropTypes.func,
}
