import { useState, useEffect, useRef } from 'react';
import { CANNABIS_COLORS, getAllColorShades } from '../../data/visualOptions';
import { LiquidCard, LiquidDivider } from '@/components/ui/LiquidUI';
import LiquidSlider from '@/components/ui/LiquidSlider';
import { Eye } from 'lucide-react';
import PaintableColorSilhouette from '@/components/shared/charts/PaintableColorSilhouette';

const HASH_PALETTE = [
    { id: 'blonde',      name: 'Blonde',      hex: '#F5DEB3' },
    { id: 'blond-ambre', name: 'Blond ambré',  hex: '#D4A853' },
    { id: 'or',          name: 'Dorée',        hex: '#C89020' },
    { id: 'brun-clair',  name: 'Brun clair',   hex: '#A0522D' },
    { id: 'brun',        name: 'Brun',         hex: '#7B3B20' },
    { id: 'brun-fonce',  name: 'Brun foncé',   hex: '#4A2010' },
    { id: 'noir',        name: 'Noire',        hex: '#1A1A1A' },
    { id: 'vert-olive',  name: 'Verte',        hex: '#6B7A2A' },
    { id: 'gris',        name: 'Grisâtre',     hex: '#8A8A8A' },
    // Manquaient (retour utilisateur 2026-10-28) : hash de génétiques violettes, et ice/full melt
    // très clair tirant sur le blanc.
    { id: 'violet',      name: 'Violacée',     hex: '#5B3A6E' },
    { id: 'blanc',       name: 'Blanche',      hex: '#F2EEE6' },
];

const CONCENTRATE_PALETTE = [
    { id: 'transparent', name: 'Transparent',  hex: '#D8E8FF' },
    { id: 'jaune-pale',  name: 'Jaune pâle',   hex: '#FFFACD' },
    { id: 'or-pale',     name: 'Or pâle',      hex: '#FFE066' },
    { id: 'or',          name: 'Or',           hex: '#FFD700' },
    { id: 'ambre',       name: 'Ambre',        hex: '#FFBF00' },
    { id: 'ambre-fonce', name: 'Ambre foncé',  hex: '#C07000' },
    { id: 'brun',        name: 'Brun',         hex: '#8B4513' },
    { id: 'creme',       name: 'Crème/Wax',    hex: '#FFF0B0' },
    { id: 'vert',        name: 'Verte (live)', hex: '#7AAF50' },
    // Manquaient (retour utilisateur 2026-10-28) : rosin de génétiques violettes, et teinte rouge.
    { id: 'violet',      name: 'Violacé',      hex: '#6E3F7A' },
    { id: 'rouge',       name: 'Rougeâtre',    hex: '#A0302A' },
];

const parseColorArray = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    try { return JSON.parse(raw); } catch { return []; }
};

export default function VisualSection({ productType = 'flower', data: directData, onChange, formData = {}, handleChange }) {
    const data = directData || formData.visual || {};
    const safeUpdate = (payload) => {
        if (typeof onChange === 'function') return onChange(payload);
        if (typeof handleChange === 'function') return handleChange('visual', payload);
    };

    const type = (productType || 'flower').toLowerCase();
    const isHash = type === 'hash';
    const isConcentrate = type === 'concentrate';
    const isFlower = !isHash && !isConcentrate;

    // ── HASH / CONCENTRATE fields ──────────────────────────────────────────────
    const HASH_FIELDS = [
        { key: 'couleurTransparence', label: 'Couleur / Transparence', color: 'amber', hint: 'Aspect colorimétrique et transparence' },
        { key: 'pureteVisuelle',      label: 'Pureté visuelle',         color: 'purple', hint: 'Absence de contaminants visibles' },
        { key: 'densiteVisuelle',     label: 'Densité visuelle',        color: 'blue',   hint: 'Compacité apparente' },
    ];
    const CONCENTRATE_FIELDS = [
        { key: 'couleurTransparence', label: 'Couleur / Transparence', color: 'amber',  hint: 'Clarté et teinte du concentré' },
        { key: 'pureteVisuelle',      label: 'Pureté visuelle',         color: 'purple', hint: 'Absence de résidus et contaminants' },
        { key: 'viscosite',           label: 'Viscosité',               color: 'cyan',   hint: 'Fluidité / consistance' },
        { key: 'melting',             label: 'Melting',                 color: 'orange', hint: 'Qualité de fusion (10 = melting parfait)' },
        { key: 'residus',             label: 'Résidus (10=aucun)',      color: 'green',  hint: '10 = aucun résidu après consumption' },
    ];
    const activeFields = isHash ? HASH_FIELDS : isConcentrate ? CONCENTRATE_FIELDS : [];
    const palette = isHash ? HASH_PALETTE : isConcentrate ? CONCENTRATE_PALETTE : [];

    const [sliders, setSliders] = useState(() => {
        const init = {};
        activeFields.forEach(f => { init[f.key] = data[f.key] ?? 0; });
        return init;
    });

    // productColors stores [{ id, percentage }] — same pattern as flower selectedColors
    const [productColors, setProductColors] = useState(() => parseColorArray(data.couleurNuancier));

    useEffect(() => {
        if (isFlower) return;
        const next = {};
        activeFields.forEach(f => { next[f.key] = data[f.key] ?? 0; });
        setSliders(next);
        setProductColors(parseColorArray(data.couleurNuancier));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data.couleurTransparence, data.pureteVisuelle, data.densiteVisuelle, data.viscosite, data.melting, data.residus, data.couleurNuancier]);

    const handleSliderChange = (key, val) => {
        const next = { ...sliders, [key]: val };
        setSliders(next);
        safeUpdate({ ...next, couleurNuancier: productColors });
    };

    // Silhouette peinte : la valeur arrive complète (total = 100 % par construction).
    const handleSetProductColors = (next) => {
        setProductColors(next);
        safeUpdate({ ...sliders, couleurNuancier: next });
    };

    // ── FLOWER ────────────────────────────────────────────────────────────────
    const allColors = getAllColorShades();
    const [selectedColors, setSelectedColors] = useState(data?.colors || []);
    const [colorRating, setColorRating] = useState(data?.colorRating || 5);
    const [density, setDensity] = useState(data?.density || 5);
    const [trichomes, setTrichomes] = useState(data?.trichomes || 5);
    const [mold, setMold] = useState(data?.mold || 10);
    const [seeds, setSeeds] = useState(data?.seeds || 10);
    // Évite d'émettre les valeurs par défaut (5/5/5/10/10) au simple montage de la section
    // sans interaction réelle de l'utilisateur (cf. AnalyticsSection.jsx)
    const isFirstRunRef = useRef(true);

    useEffect(() => {
        if (!isFlower) return;
        if (isFirstRunRef.current) {
            isFirstRunRef.current = false;
            const hasIncoming = !!(data && Object.keys(data).length > 0);
            if (!hasIncoming) return;
        }
        safeUpdate({ colors: selectedColors, colorRating, density, trichomes, mold, seeds });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedColors, colorRating, density, trichomes, mold, seeds]);

    return (
        <LiquidCard glow="purple" padding="sm" className="space-y-3">
            <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                    <Eye className="w-4 h-4 text-white" />
                </div>
                <div>
                    <h3 className="text-base font-bold text-white">👁️ Visuel & Technique</h3>
                    <p className="text-xs text-white/50">Caractéristiques visuelles et qualité</p>
                </div>
            </div>

            <LiquidDivider />

            {/* ── Hash / Concentrate ─────────────────────────────────────────── */}
            {!isFlower && (
                <div className="space-y-4">
                    <PaintableColorSilhouette
                        shape={isHash ? 'hash' : 'jar'}
                        label={isHash ? '🎨 Couleur du hash' : '🎨 Couleur du concentré'}
                        palette={palette}
                        value={productColors}
                        onChange={handleSetProductColors}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {activeFields.map(field => (
                            <div key={field.key} className="p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                                <LiquidSlider
                                    label={field.label}
                                    value={sliders[field.key] ?? 0}
                                    min={0} max={10} step={1}
                                    color={field.color}
                                    onChange={(val) => handleSliderChange(field.key, val)}
                                />
                                {field.hint && <p className="text-xs text-white/35 mt-1">{field.hint}</p>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Flower ─────────────────────────────────────────────────────── */}
            {isFlower && (
                <div className="space-y-3">
                    <PaintableColorSilhouette
                        shape="bud"
                        label="🎨 Couleurs de la fleur"
                        palette={allColors}
                        groups={Object.values(CANNABIS_COLORS).map((family) => ({ label: family.label, ids: family.shades.map((s) => s.id) }))}
                        value={selectedColors}
                        onChange={setSelectedColors}
                    />

                    {/* Sliders fleur */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                            <LiquidSlider label="Couleur / Nuancier" value={colorRating} min={1} max={10} step={1} color="purple" onChange={setColorRating} />
                        </div>
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                            <LiquidSlider label="Densité" value={density} min={1} max={10} step={1} color="purple" onChange={setDensity} />
                        </div>
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                            <LiquidSlider label="Trichomes" value={trichomes} min={1} max={10} step={1} color="purple" onChange={setTrichomes} />
                            <p className="text-xs text-white/35 mt-1">Quantité et qualité des cristaux</p>
                        </div>
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                            <LiquidSlider label="Moisissures (10=aucune)" value={mold} min={1} max={10} step={1} color="green" onChange={setMold} />
                        </div>
                        <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                            <LiquidSlider label="Graines (10=aucune)" value={seeds} min={1} max={10} step={1} color="green" onChange={setSeeds} />
                        </div>
                    </div>
                </div>
            )}
        </LiquidCard>
    );
}
