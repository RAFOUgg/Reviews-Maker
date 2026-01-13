import { useState, useEffect } from 'react'
import LiquidInput from './LiquidInput'

/**
 * DimensionsField - Champ pour saisir dimensions L×l×H
 * 
 * @param {Object} value - { length, width, height }
 * @param {Function} onChange - Callback onChange
 * @param {string} unit - Unité (cm, m, etc.)
 */
const DimensionsField = ({ value, onChange, unit = 'cm' }) => {
    const [dimensions, setDimensions] = useState(value || { length: 0, width: 0, height: 0 })

    useEffect(() => {
        if (value) setDimensions(value)
    }, [value])

    const handleChange = (field, val) => {
        const newDims = { ...dimensions, [field]: parseFloat(val) || 0 }
        setDimensions(newDims)
        onChange?.(newDims)
    }

    return (
        <div className="grid grid-cols-3 gap-2">
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                    L ({unit})
                </label>
                <LiquidInput
                    type="number"
                    min="0"
                    step="1"
                    value={dimensions.length}
                    onChange={(e) => handleChange('length', e.target.value)}
                    className="w-full"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                    l ({unit})
                </label>
                <LiquidInput
                    type="number"
                    min="0"
                    step="1"
                    value={dimensions.width}
                    onChange={(e) => handleChange('width', e.target.value)}
                    className="w-full"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-300 mb-1">
                    H ({unit})
                </label>
                <LiquidInput
                    type="number"
                    min="0"
                    step="1"
                    value={dimensions.height}
                    onChange={(e) => handleChange('height', e.target.value)}
                    className="w-full"
                />
            </div>
            {dimensions.length > 0 && dimensions.width > 0 && dimensions.height > 0 && (
                <div className="col-span-3 mt-2 text-xs text-gray-400">
                    📦 Volume: {((dimensions.length / 100) * (dimensions.width / 100) * (dimensions.height / 100)).toFixed(2)} m³
                </div>
            )}
        </div>
    )
}

export default DimensionsField


