import { useExportMakerStore } from '../../../store/exportMakerStore';
import { getResponsiveAdjustments } from '../../../utils/exportMakerHelpers';
import { LiquidSelect, LiquidButton } from '../../ui/LiquidUI';
import LiquidSlider from '../../ui/LiquidSlider';

// 2026-08-04 — liste réduite aux polices RÉELLEMENT chargées (`client/index.html`).
//
// Cette liste en proposait 11 dont une seule était chargée : choisir 'Merriweather' ou 'Poppins'
// n'avait aucun effet visible, le navigateur retombait silencieusement sur une police système,
// sans aucun avertissement. Les 3 polices ci-dessous sont les 3 rôles du territoire visuel retenu
// (moodboard B2) : display, corps, données chiffrées.
const FONT_FAMILIES = [
    'Inter',          // défaut — équivalent web de la pile système du site (SF Pro / -apple-system)
    'Space Grotesk',  // display alternatif
    'JetBrains Mono', // données, chasse tabulaire
];

// Une review sauvegardée avant ce jour peut porter une police retirée de la liste (ex. 'Inter').
// On la conserve comme option — sinon le sélecteur s'afficherait vide et le premier changement
// non lié écraserait silencieusement son réglage — mais explicitement signalée comme non chargée.
function buildFontOptions(currentFamily) {
    const options = FONT_FAMILIES.map((font) => ({ value: font, label: font }));
    if (currentFamily && !FONT_FAMILIES.includes(currentFamily)) {
        options.push({ value: currentFamily, label: `${currentFamily} (non chargée)` });
    }
    return options;
}

const FONT_WEIGHTS = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' }
];


// Un curseur qui continue de coulisser sans plus rien changer se lit comme un réglage cassé. Le
// plafond dépend du FORMAT (un carré de 800px de haut ne tient pas la même typographie qu'un A4 de
// 2480px), donc il ne peut pas être écrit dans les bornes du curseur : on l'annonce ici.
function DepassementDomaine({ valeur, maximum, quoi }) {
    if (!maximum || valeur <= maximum) return null;
    return (
        <p className="text-[11px] text-amber-300/80 -mt-3 leading-snug">
            Au-delà de {maximum} px, {quoi} n&apos;augmente plus sur ce format : le contenu sortirait
            du cadre. Choisissez un format plus grand pour aller plus loin.
        </p>
    );
}

export default function TypographyControls() {
    const config = useExportMakerStore((state) => state.config);
    const updateTypography = useExportMakerStore((state) => state.updateTypography);

    // Même fonction que celle qui calcule réellement le rendu — pas une seconde table de seuils.
    const { typographyLimits } = getResponsiveAdjustments(config.ratio, config.typography);

    return (
        <div className="space-y-6">
            {/* Titre */}
            <div>
                <h3 className="text-lg font-semibold text-white/90 mb-2">
                    Typographie
                </h3>
                <p className="text-sm text-white/50">
                    Personnalisez les polices et leur apparence
                </p>
            </div>

            {/* Famille de police */}
            <LiquidSelect
                label="Police de caractères"
                options={buildFontOptions(config.typography.fontFamily)}
                value={config.typography.fontFamily}
                onChange={(val) => updateTypography({ fontFamily: val })}
            />

            {/* Taille du titre */}
            <LiquidSlider
                label="Taille du titre"
                value={config.typography.titleSize}
                onChange={(val) => updateTypography({ titleSize: Math.round(val) })}
                min={20}
                max={72}
                step={1}
                unit="px"
                color="purple"
            />
            <DepassementDomaine valeur={config.typography.titleSize} maximum={typographyLimits?.maxTitleSize} quoi="le titre" />

            {/* Graisse du titre */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                    Graisse du titre
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {FONT_WEIGHTS.map((weight) => (
                        <LiquidButton
                            key={weight.value}
                            size="sm"
                            variant={config.typography.titleWeight === weight.value ? 'primary' : 'ghost'}
                            onClick={() => updateTypography({ titleWeight: weight.value })}
                            style={{ fontWeight: weight.value }}
                        >
                            {weight.label}
                        </LiquidButton>
                    ))}
                </div>
            </div>

            {/* Taille du texte */}
            <LiquidSlider
                label="Taille du texte"
                value={config.typography.textSize}
                onChange={(val) => updateTypography({ textSize: Math.round(val) })}
                min={12}
                max={32}
                step={1}
                unit="px"
                color="purple"
            />
            <DepassementDomaine valeur={config.typography.textSize} maximum={typographyLimits?.maxTextSize} quoi="le texte" />

            {/* Graisse du texte */}
            <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                    Graisse du texte
                </label>
                <div className="grid grid-cols-2 gap-2">
                    {FONT_WEIGHTS.slice(0, 4).map((weight) => (
                        <LiquidButton
                            key={weight.value}
                            size="sm"
                            variant={config.typography.textWeight === weight.value ? 'primary' : 'ghost'}
                            onClick={() => updateTypography({ textWeight: weight.value })}
                            style={{ fontWeight: weight.value }}
                        >
                            {weight.label}
                        </LiquidButton>
                    ))}
                </div>
            </div>

            {/* Aperçu */}
            <div className="liquid-card p-4">
                <p className="text-xs text-white/50 mb-3">Aperçu</p>
                <h4
                    className="mb-2"
                    style={{
                        fontFamily: config.typography.fontFamily,
                        fontSize: `${Math.min(config.typography.titleSize, 24)}px`,
                        fontWeight: config.typography.titleWeight,
                        color: '#ffffff'
                    }}
                >
                    Titre de la review
                </h4>
                <p
                    style={{
                        fontFamily: config.typography.fontFamily,
                        fontSize: `${Math.min(config.typography.textSize, 14)}px`,
                        fontWeight: config.typography.textWeight,
                        color: 'rgba(255,255,255,0.6)'
                    }}
                >
                    Ceci est un exemple de texte avec les paramètres sélectionnés.
                </p>
            </div>
        </div>
    );
}
