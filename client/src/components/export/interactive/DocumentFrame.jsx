import PropTypes from 'prop-types';
import { QRCodeSVG } from 'qrcode.react';
import { resolveImageUrl } from '../../../utils/export-maker/resolveImageUrl';
import { useIsInteractive } from './InteractiveContext';

/**
 * Affichage d'UN document joint à une review (certificat d'analyse, profil terpénique).
 *
 * Ces fichiers sont RÉELLEMENT téléversés depuis le formulaire (`AnalyticsSection.jsx`, champs
 * `certificateFile`/`terpeneFile`, stockés en `/images/<fichier>`) et n'apparaissaient nulle part
 * dans le rendu : les templates se contentaient d'écrire « Disponible » ou « Non disponible » dans
 * une cellule de tableau. Un certificat d'analyse est la pièce la plus opposable d'une fiche de
 * traçabilité — le mentionner sans jamais permettre de l'atteindre, c'est exactement le défaut
 * corrigé partout ailleurs dans ce module : une donnée saisie qui n'existe que dans le formulaire.
 *
 * Trois cas, une seule décision ici (même découpage que `MediaFrame` pour les vidéos) :
 *
 *  • document IMAGE (un COA scanné en jpg/png — le formulaire les accepte) → on l'AFFICHE. C'est
 *    une page de certificat : la montrer vaut mieux que la décrire ;
 *  • document PDF sur une surface VIVANTE → carte cliquable qui l'ouvre dans un nouvel onglet ;
 *  • document PDF sur une surface FIGÉE (export PNG/PDF, mesure de pagination) → même carte, sans
 *    lien, PLUS un QR code vers le fichier.
 *
 * Le QR n'est pas une décoration : un PNG ne se clique pas, et un certificat imprimé qu'on ne peut
 * pas vérifier ne vaut pas mieux qu'une affirmation. C'est le même raisonnement que le QR de lot
 * déjà porté par `DetailedCardTemplate`/`TraceabilityReportTemplate` (`getLotCodeUrl`), appliqué
 * cette fois à la pièce jointe elle-même.
 */

const IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'avif'];

/** Extension en minuscules, sans le point, insensible à une chaîne de requête ou à un fragment. */
export function documentExtension(url) {
    return String(url || '')
        .split(/[?#]/)[0]
        .split('.')
        .pop()
        .toLowerCase();
}

/** Le document est-il une image qu'on peut afficher telle quelle plutôt que décrire ? */
export function isImageDocument(url) {
    return IMAGE_EXTENSIONS.includes(documentExtension(url));
}

/** URL absolue — indispensable au QR, qui sera scanné depuis un autre appareil que celui-ci. */
function absoluteUrl(url) {
    if (!url) return null;
    if (/^https?:/i.test(url)) return url;
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    return `${origin}${url.startsWith('/') ? '' : '/'}${url}`;
}

export default function DocumentFrame({
    doc,
    accent = '#a78bfa',
    textPrimary = '#ffffff',
    textSecondary = 'rgba(255,255,255,0.6)',
    surface = 'rgba(255,255,255,0.04)',
    border = 'rgba(255,255,255,0.12)',
    fontSize = 12,
}) {
    const interactive = useIsInteractive();
    const url = resolveImageUrl(doc?.url || doc);
    if (!url) return null;

    const label = doc?.label || 'Document';
    const extension = documentExtension(url);

    // Un certificat scanné en image : on le montre. Le cadre reste, pour qu'il se lise comme une
    // pièce jointe et non comme une photo de produit.
    if (isImageDocument(url)) {
        const vignette = (
            <img
                src={url}
                alt={label}
                style={{ width: '100%', height: 'auto', display: 'block', borderRadius: 6 }}
            />
        );
        return (
            <figure style={{ ...cardStyle(surface, border), padding: 8, gap: 6 }}>
                {interactive ? (
                    <a href={url} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                        {vignette}
                    </a>
                ) : vignette}
                <figcaption style={{ fontSize: fontSize - 1, color: textSecondary, letterSpacing: 0.2 }}>
                    {label}
                </figcaption>
            </figure>
        );
    }

    const corps = (
        <>
            <div style={{
                width: 34, height: 42, flexShrink: 0, borderRadius: 4,
                border: `1.5px solid ${accent}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 1,
            }}>
                <span style={{ fontSize: 15, lineHeight: 1 }}>📄</span>
                <span style={{ fontSize: 7, fontWeight: 700, letterSpacing: 0.5, color: accent }}>
                    {extension.toUpperCase().slice(0, 4)}
                </span>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
                <div style={{ fontSize, fontWeight: 600, color: textPrimary, lineHeight: 1.3 }}>
                    {label}
                </div>
                <div style={{ fontSize: fontSize - 2, color: textSecondary, marginTop: 2 }}>
                    {interactive ? 'Ouvrir le document' : 'Scannez pour ouvrir'}
                </div>
            </div>
            {/* Sur surface figée seulement : le lien est mort dans un PNG, le QR le remplace. */}
            {!interactive && (
                <div style={{ background: '#ffffff', padding: 3, borderRadius: 4, flexShrink: 0, lineHeight: 0 }}>
                    <QRCodeSVG value={absoluteUrl(url)} size={38} level="M" />
                </div>
            )}
        </>
    );

    if (!interactive) {
        return <div style={cardStyle(surface, border)}>{corps}</div>;
    }

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            style={{ ...cardStyle(surface, border), textDecoration: 'none', cursor: 'pointer' }}
        >
            {corps}
        </a>
    );
}

function cardStyle(surface, border) {
    return {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: 10,
        borderRadius: 10,
        background: surface,
        border: `1px solid ${border}`,
    };
}

DocumentFrame.propTypes = {
    doc: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    accent: PropTypes.string,
    textPrimary: PropTypes.string,
    textSecondary: PropTypes.string,
    surface: PropTypes.string,
    border: PropTypes.string,
    fontSize: PropTypes.number,
};
