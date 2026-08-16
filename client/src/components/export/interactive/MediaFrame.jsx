import PropTypes from 'prop-types';
import { resolveImageUrl } from '../../../utils/export-maker/resolveImageUrl';
import { isPlayableVideo, isVideoMedia } from '../../../utils/mediaFileHelpers';
import { useIsInteractive } from './InteractiveContext';

/**
 * Affichage d'UN média attaché (photo ou vidéo), au bon format selon la surface.
 *
 * Une vidéo attachée à une étape de pipeline n'apparaissait NULLE PART dans le rendu : la modale de
 * détail la passait à une balise `<img>` (image cassée), le fond de case l'excluait explicitement,
 * et les cinq templates ne contiennent aucune balise `<video>`. La donnée existait en base, était
 * proposée à l'envoi, et n'était visible que dans le formulaire — exactement le défaut que ce
 * chantier corrige ailleurs.
 *
 * Trois cas, et un seul endroit pour en décider :
 *
 *  • photo → `<img>`, quelle que soit la surface ;
 *  • vidéo sur une surface VIVANTE (aperçu, `/r/:id`, modale) → vrai lecteur `<video controls>` ;
 *  • vidéo sur une surface FIGÉE (export PNG/PDF, mesure de pagination) → vignette explicite.
 *
 * Le dernier cas n'est pas un repli paresseux : une capture est une rasterisation, et un élément
 * `<video>` n'est pas peint par `html-to-image` (il ressortirait en rectangle vide). La vignette dit
 * donc ce que le fichier ne peut pas montrer — « une vidéo est attachée ici » — plutôt que de
 * laisser un trou. C'est la même règle que le reste du rendu : rien ne doit exister uniquement à
 * l'écran, et rien ne doit disparaître en silence.
 */

// La liste des extensions vidéo (et de celles qu'un `<video>` sait réellement décoder) vit dans
// `utils/mediaFileHelpers.js`, source unique côté client miroir de `server-new/utils/uploadFormats.js`.
// Elle était recopiée ici ; les deux autres copies de l'app en divergeaient (cf. l'en-tête de ce
// module-là). Ré-exportées pour les appelants historiques de ce fichier.
export { isPlayableVideo, isVideoMedia };

export default function MediaFrame({ media, className = '', style, alt = '', posterLabel = 'Vidéo' }) {
    const interactive = useIsInteractive();
    const url = resolveImageUrl(media?.url || media);
    if (!url) return null;

    if (!isVideoMedia(media)) {
        return <img src={url} alt={alt || media?.caption || ''} className={className} style={style} />;
    }

    // Surface figée : vignette. Aucun élément média, donc rien qui puisse rendre un cadre vide à la
    // capture — uniquement du texte et des fonds, que la rasterisation sait peindre.
    if (!interactive) {
        return <VideoPlaceholder className={className} style={style} label={posterLabel} caption={media?.caption} />;
    }

    if (!isPlayableVideo(url)) {
        return (
            <div className={className} style={{ ...placeholderStyle, ...style }}>
                <span style={{ fontSize: 22, lineHeight: 1 }}>🎞️</span>
                <span style={{ fontSize: 12, opacity: 0.75, textAlign: 'center' }}>
                    Format non lisible par le navigateur
                </span>
                <a
                    href={url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: 12, color: '#a78bfa', textDecoration: 'underline' }}
                >
                    Télécharger la vidéo
                </a>
            </div>
        );
    }

    return (
        <video
            src={url}
            className={className}
            style={style}
            controls
            playsInline
            // `preload="metadata"` : la première image suffit à identifier l'étape, télécharger la
            // vidéo entière à l'ouverture d'une fiche qui en compte plusieurs ne se justifie pas.
            preload="metadata"
        />
    );
}

const placeholderStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    background: 'rgba(2, 6, 12, 0.82)',
    border: '1px solid rgba(255,255,255,0.12)',
    color: '#fff',
    padding: 12,
    minHeight: 90,
};

export function VideoPlaceholder({ className = '', style, label = 'Vidéo', caption }) {
    return (
        <div className={className} style={{ ...placeholderStyle, ...style }}>
            <span style={{ fontSize: 22, lineHeight: 1 }}>▶</span>
            <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4 }}>{label}</span>
            {caption && <span style={{ fontSize: 11, opacity: 0.7, textAlign: 'center' }}>{caption}</span>}
        </div>
    );
}

MediaFrame.propTypes = {
    media: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    className: PropTypes.string,
    style: PropTypes.object,
    alt: PropTypes.string,
    posterLabel: PropTypes.string,
};

VideoPlaceholder.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    label: PropTypes.string,
    caption: PropTypes.string,
};
