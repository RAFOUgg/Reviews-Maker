import { useState, useEffect } from 'react';
import { 
  CANNABIS_COLORS, 
  getAllColorShades, 
  VISUAL_QUALITY_LEVELS,
  INVERTED_LABELS,
  TRANSPARENCY_LEVELS 
} from '../../../data/visualOptions';

/**
 * Section Visuel & Technique
 * Utilisée pour Hash, Concentrés et Fleurs
 * Champs adaptés selon le type de produit
 */
export default function VisualSection({ productType, data, onChange }) {
  const [selectedColor, setSelectedColor] = useState(data?.color || null);
  const [colorRating, setColorRating] = useState(data?.colorRating || 5);
  const [density, setDensity] = useState(data?.density || 5);
  const [trichomes, setTrichomes] = useState(data?.trichomes || 5);
  const [mold, setMold] = useState(data?.mold || 10);
  const [seeds, setSeeds] = useState(data?.seeds || 10);
  const [transparency, setTransparency] = useState(data?.transparency || 5);

  // Synchroniser avec parent
  useEffect(() => {
    const visualData = {
      color: selectedColor,
      colorRating,
      density,
      ...(productType === 'Fleur' && { trichomes }),
      ...(productType !== 'Fleur' && { transparency }),
      mold,
      seeds
    };
    onChange?.(visualData);
  }, [selectedColor, colorRating, density, trichomes, mold, seeds, transparency, productType, onChange]);

  const allColors = getAllColorShades();
  const isHashOrConcentrate = productType === 'Hash' || productType === 'Concentré';

  // Composant Slider personnalisé
  const CustomSlider = ({ value, onChange, label, invertedLabels = null, min = 1, max = 10 }) => {
    const displayLabel = invertedLabels ? invertedLabels[value] : VISUAL_QUALITY_LEVELS[value - 1]?.label;
    const colorClass = VISUAL_QUALITY_LEVELS[value - 1]?.color || 'text-gray-600';

    return (
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          <span className={`text-sm font-bold ${colorClass}`}>
            {value}/10 - {displayLabel}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer 
                     [&::-webkit-slider-thumb]:appearance-none 
                     [&::-webkit-slider-thumb]:w-4 
                     [&::-webkit-slider-thumb]:h-4 
                     [&::-webkit-slider-thumb]:rounded-full 
                     [&::-webkit-slider-thumb]:bg-violet-600 
                     [&::-webkit-slider-thumb]:cursor-pointer
                     [&::-webkit-slider-thumb]:shadow-md
                     [&::-webkit-slider-thumb]:hover:bg-violet-700
                     [&::-webkit-slider-thumb]:transition-colors"
        />
        <div className="flex justify-between text-xs text-gray-500 px-1">
          <span>1</span>
          <span>5</span>
          <span>10</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
          <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">👁️ Visuel & Technique</h3>
          <p className="text-sm text-gray-500">Caractéristiques visuelles et qualité</p>
        </div>
      </div>

      {/* Nuancier Couleurs */}
      <div className="space-y-3">
        <label className="block text-sm font-semibold text-gray-700">
          {isHashOrConcentrate ? 'Couleur / Transparence' : 'Couleur'}
        </label>
        <div className="space-y-2">
          {Object.entries(CANNABIS_COLORS).map(([key, colorFamily]) => (
            <div key={key} className="space-y-2">
              <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                {colorFamily.label}
              </p>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                {colorFamily.shades.map((shade) => (
                  <button
                    key={shade.id}
                    type="button"
                    onClick={() => {
                      setSelectedColor(shade.id);
                      setColorRating(Math.min(10, Math.ceil(shade.value / 2.3)));
                    }}
                    className={`
                      relative p-3 rounded-xl border-2 transition-all duration-200
                      hover:scale-105 hover:shadow-md
                      ${selectedColor === shade.id 
                        ? 'border-violet-600 ring-2 ring-violet-200 shadow-lg' 
                        : 'border-gray-200 hover:border-gray-300'}
                    `}
                    style={{ backgroundColor: shade.hex }}
                    title={shade.name}
                  >
                    {selectedColor === shade.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
        {selectedColor && (
          <div className="mt-3 p-3 bg-violet-50 rounded-lg">
            <p className="text-sm text-violet-800">
              <span className="font-semibold">Couleur sélectionnée :</span>{' '}
              {allColors.find(c => c.id === selectedColor)?.name}
            </p>
          </div>
        )}
      </div>

      {/* Transparence (Hash/Concentrés uniquement) */}
      {isHashOrConcentrate && (
        <div className="space-y-3">
          <CustomSlider
            value={transparency}
            onChange={setTransparency}
            label="Transparence"
            invertedLabels={null}
          />
          <p className="text-xs text-gray-500 italic">
            {TRANSPARENCY_LEVELS[transparency - 1]?.example}
          </p>
        </div>
      )}

      {/* Densité */}
      <CustomSlider
        value={density}
        onChange={setDensity}
        label="Densité"
      />

      {/* Trichomes (Fleurs uniquement) */}
      {productType === 'Fleur' && (
        <CustomSlider
          value={trichomes}
          onChange={setTrichomes}
          label="Trichomes (quantité/qualité)"
        />
      )}

      {/* Moisissures (inversé) */}
      <CustomSlider
        value={mold}
        onChange={setMold}
        label="Moisissures (10 = aucune)"
        invertedLabels={INVERTED_LABELS.moisissures}
      />

      {/* Graines (inversé) */}
      <CustomSlider
        value={seeds}
        onChange={setSeeds}
        label="Graines (10 = aucune)"
        invertedLabels={INVERTED_LABELS.graines}
      />

      {/* Résumé visuel */}
      <div className="mt-6 p-4 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl border border-violet-200">
        <h4 className="text-sm font-semibold text-violet-900 mb-3">📊 Résumé Visuel</h4>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-gray-600">Note couleur :</span>
            <span className="ml-2 font-bold text-violet-700">{colorRating}/10</span>
          </div>
          <div>
            <span className="text-gray-600">Densité :</span>
            <span className="ml-2 font-bold text-violet-700">{density}/10</span>
          </div>
          {productType === 'Fleur' && (
            <div>
              <span className="text-gray-600">Trichomes :</span>
              <span className="ml-2 font-bold text-violet-700">{trichomes}/10</span>
            </div>
          )}
          {isHashOrConcentrate && (
            <div>
              <span className="text-gray-600">Transparence :</span>
              <span className="ml-2 font-bold text-violet-700">{transparency}/10</span>
            </div>
          )}
          <div>
            <span className="text-gray-600">Pureté :</span>
            <span className="ml-2 font-bold text-green-700">{Math.round((mold + seeds) / 2)}/10</span>
          </div>
        </div>
      </div>
    </div>
  );
}
