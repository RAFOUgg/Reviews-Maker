import { useExportMakerStore } from '../../../store/exportMakerStore';
import { LiquidSelect, LiquidButton } from '../../ui/LiquidUI';
import LiquidSlider from '../../ui/LiquidSlider';

const FONT_FAMILIES = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Poppins',
    'Lato',
    'Playfair Display',
    'Merriweather',
    'Raleway',
    'Source Sans Pro',
    // Ajoutée 2026-07-30 pour la Fiche Technique Détaillée v2 (specs-direction-artistique.md) —
    // seule nouvelle police proposée au choix libre ; JetBrains Mono (données/chiffres) est câblée
    // en dur dans le template plutôt qu'exposée ici, cf. exportMakerHelpers.js.
    'Space Grotesk',
];

const FONT_WEIGHTS = [
    { value: '300', label: 'Light' },
    { value: '400', label: 'Regular' },
    { value: '500', label: 'Medium' },
    { value: '600', label: 'Semi Bold' },
    { value: '700', label: 'Bold' },
    { value: '800', label: 'Extra Bold' }
];

const FONT_FAMILY_OPTIONS = FONT_FAMILIES.map((font) => ({ value: font, label: font }));

export default function TypographyControls() {
    const config = useExportMakerStore((state) => state.config);
    const updateTypography = useExportMakerStore((state) => state.updateTypography);

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
                options={FONT_FAMILY_OPTIONS}
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
