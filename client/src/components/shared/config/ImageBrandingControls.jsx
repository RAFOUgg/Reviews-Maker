import { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Folder } from 'lucide-react';
import { useExportMakerStore } from '../../../store/exportMakerStore';
import { LiquidButton, LiquidInput, LiquidToggle } from '../../ui/LiquidUI';
import LiquidSlider from '../../ui/LiquidSlider';
import { resolveImageUrl } from '../../../utils/export-maker/resolveImageUrl';

const IMAGE_FILTERS = [
    { id: 'none', name: 'Aucun', preview: '🎨' },
    { id: 'sepia', name: 'Sépia', preview: '🟤' },
    { id: 'grayscale', name: 'Noir & Blanc', preview: '⚫' },
    { id: 'blur', name: 'Flou', preview: '🌫️' }
];

const LOGO_POSITIONS = [
    { id: 'top-left', name: 'Haut Gauche', icon: '↖️' },
    { id: 'top-right', name: 'Haut Droite', icon: '↗️' },
    { id: 'bottom-left', name: 'Bas Gauche', icon: '↙️' },
    { id: 'bottom-right', name: 'Bas Droite', icon: '↘️' },
    { id: 'center', name: 'Centre', icon: '🎯' }
];

const LOGO_SIZES = [
    { id: 'small', name: 'Petit' },
    { id: 'medium', name: 'Moyen' },
    { id: 'large', name: 'Grand' }
];

export default function ImageBrandingControls() {
    const config = useExportMakerStore((state) => state.config);
    const updateImage = useExportMakerStore((state) => state.updateImage);
    const updateBranding = useExportMakerStore((state) => state.updateBranding);
    const reviewData = useExportMakerStore((state) => state.reviewData);
    const [logoInput, setLogoInput] = useState(config.branding.logoUrl || '');

    // Collect all available images from reviewData
    const availableImages = Array.isArray(reviewData?.images) && reviewData.images.length > 0
        ? reviewData.images
        : (reviewData?.mainImageUrl ? [reviewData.mainImageUrl] : []);

    const selectedIdx = config.image?.selectedIndex ?? 0;

    // QUELLES photos apparaissent dans le rendu (`config.image.selected`, liste d'indices).
    // Distinct de `selectedIndex`, qui désigne la photo PRINCIPALE : on pouvait choisir laquelle
    // mettre en avant, jamais écarter les autres. Absente ou vide = toutes, pour qu'une review
    // ouverte sans rien cocher ne se retrouve pas sans image (même règle que `getSelectedImages`).
    const picked = config.image?.selected;
    const allShown = !Array.isArray(picked) || picked.length === 0;
    const isShown = (idx) => allShown || picked.includes(idx);
    const shownCount = allShown ? availableImages.length : picked.length;

    const toggleShown = (idx) => {
        const base = allShown ? availableImages.map((_, i) => i) : [...picked];
        const next = base.includes(idx) ? base.filter((i) => i !== idx) : [...base, idx].sort((a, b) => a - b);
        // Ne jamais tout retirer : une fiche sans aucune photo n'est pas un réglage, c'est un
        // accident. Le dernier clic est ignoré plutôt que de vider le rendu.
        if (next.length === 0) return;
        const updates = { selected: next };
        // La photo principale doit rester parmi les photos affichées, sinon le rendu retomberait
        // silencieusement sur une autre sans que rien ne l'indique.
        if (!next.includes(selectedIdx)) updates.selectedIndex = next[0];
        updateImage(updates);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const logoUrl = event.target?.result;
                setLogoInput(logoUrl);
                updateBranding({ logoUrl, enabled: true });
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            {/* Titre */}
            <div>
                <h3 className="text-lg font-semibold text-white/90 mb-2">
                    Image & Branding
                </h3>
                <p className="text-sm text-white/50">
                    Personnalisez l'image et ajoutez votre logo
                </p>
            </div>

            {/* Section Image */}
            <div className="space-y-4">
                <h4 className="text-sm font-semibold text-white/90">
                    Images du produit
                </h4>

                {availableImages.length === 0 && (
                    <p className="text-xs text-white/40 italic">
                        Aucune photo disponible — ajoutez des photos produit dans le formulaire.
                    </p>
                )}

                {/* Sélecteur de photo principale */}
                {availableImages.length > 0 && (
                    <div>
                        <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wide">
                            Photo principale affichée
                            {availableImages.length > 1 && (
                                <span className="ml-1 normal-case font-normal text-white/30">({selectedIdx + 1}/{availableImages.length})</span>
                            )}
                        </label>
                        {availableImages.length === 1 ? (
                            <div className="relative w-full h-24 rounded-xl overflow-hidden border-2 border-purple-500 shadow-lg shadow-purple-500/20">
                                <img src={availableImages[0]} alt="Photo produit" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-purple-500/10 flex items-end justify-end p-2">
                                    <span className="text-xs text-white/80 bg-black/40 px-2 py-0.5 rounded-full">Seule photo</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-2 flex-wrap">
                                {availableImages.map((imgUrl, idx) => (
                                    <motion.button
                                        key={idx}
                                        whileHover={{ scale: 1.06 }}
                                        whileTap={{ scale: 0.96 }}
                                        onClick={() => updateImage({ selectedIndex: idx })}
                                        className={`relative rounded-xl overflow-hidden border-2 transition-all ${selectedIdx === idx ? 'border-purple-500 shadow-lg shadow-purple-500/30' : 'border-white/15 opacity-60 hover:opacity-100 hover:border-purple-400'}`}
                                        style={{ width: '64px', height: '64px' }}
                                    >
                                        <img src={resolveImageUrl(imgUrl)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                        {selectedIdx === idx && (
                                            <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                                <Check className="w-5 h-5 text-white drop-shadow" strokeWidth={3} />
                                            </div>
                                        )}
                                        <span className="absolute bottom-0 right-0 text-[9px] font-bold text-white bg-black/50 px-1">{idx + 1}</span>
                                    </motion.button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Photos AFFICHÉES — distinct du choix de la photo principale ci-dessus. */}
                {availableImages.length > 1 && (
                    <div className="liquid-card p-3">
                        <div className="flex items-center justify-between mb-2">
                            <div>
                                <div className="text-sm font-medium text-white/90">Photos affichées</div>
                                <div className="text-xs text-white/50">{shownCount} sur {availableImages.length} apparaissent dans le rendu</div>
                            </div>
                            <button
                                onClick={() => updateImage({ selected: [] })}
                                className="text-xs px-2 py-1 rounded-lg bg-white/10 text-white/70 hover:text-white"
                            >
                                Toutes
                            </button>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            {availableImages.map((imgUrl, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => toggleShown(idx)}
                                    title={isShown(idx) ? 'Retirer du rendu' : 'Afficher dans le rendu'}
                                    className={`relative rounded-lg overflow-hidden border-2 transition-all ${isShown(idx) ? 'border-emerald-400' : 'border-white/15 opacity-35'}`}
                                    style={{ width: '52px', height: '52px' }}
                                >
                                    <img src={resolveImageUrl(imgUrl)} alt={`Photo ${idx + 1}`} className="w-full h-full object-cover" />
                                    {isShown(idx) && (
                                        <span className="absolute top-0.5 right-0.5 bg-emerald-500 rounded-full p-0.5">
                                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                        </span>
                                    )}
                                </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Toggle galerie multi-photos */}
                {availableImages.length > 1 && (
                    <div className="liquid-card flex items-center justify-between p-3">
                        <div>
                            <div className="text-sm font-medium text-white/90">Galerie photos</div>
                            <div className="text-xs text-white/50">Afficher toutes les {availableImages.length} photos dans le template</div>
                        </div>
                        <LiquidToggle checked={!!config.image?.showGallery} onChange={(v) => updateImage({ showGallery: v })} size="sm" />
                    </div>
                )}

                {/* Coins arrondis */}
                <LiquidSlider
                    label="Coins arrondis"
                    value={config.image.borderRadius}
                    onChange={(v) => updateImage({ borderRadius: Math.round(v) })}
                    min={0}
                    max={40}
                    step={1}
                    unit="px"
                    color="purple"
                />

                {/* Opacité */}
                <LiquidSlider
                    label="Opacité"
                    value={Math.round(config.image.opacity * 100)}
                    onChange={(v) => updateImage({ opacity: v / 100 })}
                    min={0}
                    max={100}
                    step={10}
                    unit="%"
                    color="purple"
                />

                {/* Filtres */}
                <div>
                    <label className="block text-sm font-medium text-white/70 mb-2">
                        Filtre
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {IMAGE_FILTERS.map((filter) => (
                            <LiquidButton
                                key={filter.id}
                                size="sm"
                                variant={config.image.filter === filter.id ? 'primary' : 'ghost'}
                                onClick={() => updateImage({ filter: filter.id })}
                            >
                                <span className="mr-1">{filter.preview}</span>
                                {filter.name}
                            </LiquidButton>
                        ))}
                    </div>
                </div>
            </div>

            {/* Séparateur */}
            <div className="border-t border-white/10" />

            {/* Section Branding */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-white/90">
                        Logo / Filigrane
                    </h4>
                    <LiquidToggle checked={!!config.branding.enabled} onChange={(v) => updateBranding({ enabled: v })} size="sm" />
                </div>

                {config.branding.enabled && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-4"
                    >
                        {/* Upload du logo */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Fichier du logo
                            </label>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                    id="logo-upload"
                                />
                                <label htmlFor="logo-upload" className="flex-1">
                                    <LiquidButton variant="ghost" icon={Folder} className="w-full cursor-pointer" onClick={() => document.getElementById('logo-upload')?.click()}>
                                        Choisir un fichier
                                    </LiquidButton>
                                </label>
                            </div>
                            {logoInput && (
                                <div className="mt-2 p-2 liquid-card">
                                    <img
                                        src={logoInput}
                                        alt="Logo preview"
                                        className="w-16 h-16 object-contain mx-auto"
                                    />
                                </div>
                            )}
                        </div>

                        {/* URL alternative */}
                        <LiquidInput
                            label="Ou URL du logo"
                            value={logoInput}
                            onChange={(e) => {
                                setLogoInput(e.target.value);
                                updateBranding({ logoUrl: e.target.value });
                            }}
                            placeholder="https://exemple.com/logo.png"
                        />

                        {/* Position */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Position
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                {LOGO_POSITIONS.map((position) => (
                                    <LiquidButton
                                        key={position.id}
                                        size="sm"
                                        variant={config.branding.position === position.id ? 'primary' : 'ghost'}
                                        onClick={() => updateBranding({ position: position.id })}
                                        className="h-auto py-2"
                                    >
                                        <div className="flex flex-col items-center">
                                            <span>{position.icon}</span>
                                            <span className="mt-1">{position.name}</span>
                                        </div>
                                    </LiquidButton>
                                ))}
                            </div>
                        </div>

                        {/* Taille */}
                        <div>
                            <label className="block text-sm font-medium text-white/70 mb-2">
                                Taille
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {LOGO_SIZES.map((size) => (
                                    <LiquidButton
                                        key={size.id}
                                        size="sm"
                                        variant={config.branding.size === size.id ? 'primary' : 'ghost'}
                                        onClick={() => updateBranding({ size: size.id })}
                                    >
                                        {size.name}
                                    </LiquidButton>
                                ))}
                            </div>
                        </div>

                        {/* Opacité du logo */}
                        <LiquidSlider
                            label="Opacité du logo"
                            value={Math.round(config.branding.opacity * 100)}
                            onChange={(v) => updateBranding({ opacity: v / 100 })}
                            min={0}
                            max={100}
                            step={10}
                            unit="%"
                            color="purple"
                        />
                    </motion.div>
                )}
            </div>
        </div>
    );
}
