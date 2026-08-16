import PropTypes from 'prop-types'
import { Film } from 'lucide-react'
import { isPlayableVideo, isVideoUrl } from '../../utils/mediaFileHelpers'

/**
 * UNE vignette de média dans une carte de review (bibliothèque, accueil, compte, galerie).
 *
 * Mesuré le 2026-08-16 sur la review « Lamponi Frozen » en production, dont la 4ᵉ photo est un
 * `.mp4` : les cinq surfaces de carte de l'app rendaient CHAQUE média dans une balise `<img>`, sans
 * jamais tester son type. Une vidéo y apparaissait donc en vignette cassée — c'est le carreau vide
 * portant le texte de remplacement « Lamponi Frozen 4 » sur la capture. Seule la galerie publique
 * (`ReviewCoverMedia.jsx`) savait déjà distinguer les deux, parce qu'elle fait défiler les médias.
 *
 * Pourquoi ne pas réutiliser `MediaFrame.jsx`, qui décide déjà de la même chose : il est écrit pour
 * le RENDU (aperçu Export Maker, `/r/:id`, modale d'étape), où une vidéo mérite un vrai lecteur
 * `<video controls>` et où l'absence de contexte interactif signifie « capture PNG en cours ». Dans
 * une carte, la vignette n'est pas la destination du clic : la carte l'est. Des contrôles de lecture
 * y captureraient le clic au lieu d'ouvrir la review. Les deux composants partagent donc la
 * DÉTECTION (`utils/mediaFileHelpers.js`) et rien d'autre — c'est la présentation qui diffère.
 *
 * L'URL est utilisée telle qu'on la reçoit : les appelants l'ont déjà résolue (`parseImages()`,
 * `mainImageUrl`, `/api/images/…`). La repasser par `getImageUrl()` ici double-préfixerait les
 * chemins déjà absolus — le défaut exact déjà documenté dans `reviewFilesAggregator.js`.
 */
export default function ReviewMediaTile({ src, alt = '', className = '', badge = true }) {
    if (!src) return null

    if (!isVideoUrl(src)) {
        return <img src={src} alt={alt} loading="lazy" className={className} />
    }

    // Format qu'aucun navigateur ne décode (mkv, avi, 3gp…), mais que le serveur accepte
    // volontairement à l'envoi plutôt que de perdre le fichier : on annonce la vidéo au lieu
    // d'afficher un lecteur qui resterait noir.
    if (!isPlayableVideo(src)) {
        return (
            <div className={`${className} flex flex-col items-center justify-center gap-1 bg-black/50 text-white/70`}>
                <Film className="w-6 h-6" />
                <span className="text-[10px] font-medium">Vidéo</span>
            </div>
        )
    }

    return (
        <div className={`${className} relative`}>
            <video
                // `#t=0.1` demande au navigateur de se placer à la première image plutôt que de
                // laisser un cadre noir : sans `poster`, un `<video>` non lu ne peint rien.
                // `express.static` répond aux requêtes Range (vérifié), donc le saut est possible.
                src={`${src}#t=0.1`}
                muted
                playsInline
                preload="metadata"
                // La vignette ne doit pas intercepter le clic : c'est la carte qui navigue.
                className="w-full h-full object-cover pointer-events-none"
            />
            {badge && (
                <span className="absolute bottom-1.5 left-1.5 bg-black/60 text-white p-1 rounded-full pointer-events-none">
                    <Film className="w-3 h-3" />
                </span>
            )}
        </div>
    )
}

ReviewMediaTile.propTypes = {
    src: PropTypes.string,
    alt: PropTypes.string,
    className: PropTypes.string,
    badge: PropTypes.bool,
}
