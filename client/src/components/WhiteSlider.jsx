import PropTypes from 'prop-types'

/**
 * WhiteSlider - Slider blanc neutre conforme CDC
 * Pas de couleurs pour éviter confusion avec les scores
 */
export default function WhiteSlider({
    label,
    value,
    onChange,
    min = 0,
    max = 10,
    step = 1,
    unit = '/10',
    helper,
    inverted = false,
    className = ''
}) {
    const displayValue = value ?? min

    return (
        <div className={`space-y-3 ${className}`}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                    {label}
                </label>
                <span className="text-lg font-bold text-white">
                    {displayValue}{unit}
                </span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={displayValue}
                onChange={(e) => onChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-gray-700/50 rounded-lg appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-4
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-white
                    [&::-webkit-slider-thumb]:border-2
                    [&::-webkit-slider-thumb]:border-gray-400
                    [&::-webkit-slider-thumb]:cursor-pointer
                    [&::-webkit-slider-thumb]:shadow-lg
                    [&::-webkit-slider-thumb]:hover:shadow-xl
                    [&::-webkit-slider-thumb]:hover:scale-110
                    [&::-webkit-slider-thumb]:transition-all
                    [&::-moz-range-thumb]:w-4
                    [&::-moz-range-thumb]:h-4
                    [&::-moz-range-thumb]:rounded-full
                    [&::-moz-range-thumb]:bg-white
                    [&::-moz-range-thumb]:border-2
                    [&::-moz-range-thumb]:border-gray-400
                    [&::-moz-range-thumb]:cursor-pointer
                    [&::-moz-range-thumb]:shadow-lg
                    hover:bg-gray-600/50
                    transition-all"
            />
            {helper && (
                <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                    {helper}
                </p>
            )}
        </div>
    )
}

WhiteSlider.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.number,
    onChange: PropTypes.func.isRequired,
    min: PropTypes.number,
    max: PropTypes.number,
    step: PropTypes.number,
    unit: PropTypes.string,
    helper: PropTypes.string,
    inverted: PropTypes.bool,
    className: PropTypes.string
}

