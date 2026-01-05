import { useState, useEffect } from 'react';

/**
 * Composant TrichomeGradientSlider
 * Une seule jauge avec gradient de couleur représentant la maturité des trichomes
 * Gradient : blanc transparent → beige → violet/pourpre → bordeaux → brun foncé
 * Le curseur change de couleur selon sa position
 */

const TRICHOME_STAGES = [
    { value: 1, label: 'Transparent', color: '#FFFFFF', bgColor: 'rgba(255,255,255,0.3)', description: 'Trichomes immatures' },
    { value: 2, label: 'Blanc laiteux (début)', color: '#F5F5F5', bgColor: 'rgba(245,245,245,0.5)', description: 'Début de maturité' },
    { value: 3, label: 'Blanc laiteux', color: '#EFEFEF', bgColor: 'rgba(239,239,239,0.7)', description: 'Maturité optimale (THC max)' },
    { value: 4, label: 'Beige clair', color: '#F5E6D3', bgColor: '#F5E6D3', description: 'Début de dégradation THC' },
    { value: 5, label: 'Beige', color: '#E8D5B7', bgColor: '#E8D5B7', description: 'Équilibre THC/CBN' },
    { value: 6, label: 'Ambre clair', color: '#FFBF66', bgColor: '#FFBF66', description: 'Plus CBN que THC' },
    { value: 7, label: 'Ambre', color: '#FF8C42', bgColor: '#FF8C42', description: 'Effet relaxant accru' },
    { value: 8, label: 'Violet/Pourpre', color: '#9B5DE5', bgColor: '#9B5DE5', description: 'Effet sédatif fort' },
    { value: 9, label: 'Bordeaux', color: '#8B1538', bgColor: '#8B1538', description: 'Très mature (CBN dominant)' },
    { value: 10, label: 'Brun foncé', color: '#5D4037', bgColor: '#5D4037', description: 'Surmaturité' }
];

export default function TrichomeGradientSlider({ value = 5, onChange }) {
    const [currentStage, setCurrentStage] = useState(TRICHOME_STAGES.find(s => s.value === value) || TRICHOME_STAGES[4]);

    useEffect(() => {
        const stage = TRICHOME_STAGES.find(s => s.value === value);
        if (stage) setCurrentStage(stage);
    }, [value]);

    const handleChange = (e) => {
        const newValue = parseInt(e.target.value);
        const stage = TRICHOME_STAGES.find(s => s.value === newValue);
        setCurrentStage(stage);
        onChange?.(newValue);
    };

    // Construire le gradient CSS
    const gradientStops = TRICHOME_STAGES.map((stage, index) => {
        const position = (index / (TRICHOME_STAGES.length - 1)) * 100;
        return `${stage.bgColor} ${position}%`;
    }).join(', ');

    return (
        <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/10">
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-200">
                    🔬 Couleur des Trichomes (Maturité)
                </label>
                <div className="flex items-center gap-2">
                    <div
                        className="w-6 h-6 rounded-full border-2 border-white/50 shadow-lg"
                        style={{ backgroundColor: currentStage.color }}
                    />
                    <span className="text-lg font-bold text-violet-400">{value}/10</span>
                </div>
            </div>

            {/* Slider avec gradient */}
            <div className="relative">
                <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={value}
                    onChange={handleChange}
                    className="w-full h-3 rounded-lg appearance-none cursor-pointer trichome-slider"
                    style={{
                        background: `linear-gradient(to right, ${gradientStops})`
                    }}
                />

                {/* Étiquettes de position */}
                <div className="flex justify-between mt-2 px-1">
                    <span className="text-xs text-gray-500">1</span>
                    <span className="text-xs text-gray-500">2</span>
                    <span className="text-xs text-gray-500">3</span>
                    <span className="text-xs text-gray-500">4</span>
                    <span className="text-xs text-gray-500">5</span>
                    <span className="text-xs text-gray-500">6</span>
                    <span className="text-xs text-gray-500">7</span>
                    <span className="text-xs text-gray-500">8</span>
                    <span className="text-xs text-gray-500">9</span>
                    <span className="text-xs text-gray-500">10</span>
                </div>
            </div>

            {/* Description du stade actuel */}
            <div className="p-3 bg-black/20 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg border-2 border-white/30 shadow-lg"
                        style={{ backgroundColor: currentStage.color }}
                    />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-white">{currentStage.label}</p>
                        <p className="text-xs text-gray-400">{currentStage.description}</p>
                    </div>
                </div>
            </div>

            {/* Légende rapide */}
            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-gray-400">1-3</p>
                    <p className="font-medium text-white">Immature</p>
                </div>
                <div className="text-center p-2 bg-violet-500/20 rounded-lg border border-violet-500/30">
                    <p className="text-gray-400">4-6</p>
                    <p className="font-medium text-violet-300">Optimal</p>
                </div>
                <div className="text-center p-2 bg-white/5 rounded-lg">
                    <p className="text-gray-400">7-10</p>
                    <p className="font-medium text-white">Mature+</p>
                </div>
            </div>

            <style jsx>{`
                .trichome-slider::-webkit-slider-thumb {
                    appearance: none;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: ${currentStage.color};
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 4px rgba(139,92,246,0.2);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .trichome-slider::-webkit-slider-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 6px rgba(139,92,246,0.3);
                }

                .trichome-slider::-moz-range-thumb {
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    background: ${currentStage.color};
                    border: 3px solid white;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.3), 0 0 0 4px rgba(139,92,246,0.2);
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .trichome-slider::-moz-range-thumb:hover {
                    transform: scale(1.2);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 6px rgba(139,92,246,0.3);
                }
            `}</style>
        </div>
    );
}
