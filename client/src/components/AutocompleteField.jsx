import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LiquidInput } from './liquid'

/**
 * AutocompleteField - Champ avec auto-complétion
 * 
 * @param {string} value - Valeur actuelle
 * @param {Function} onChange - Callback onChange
 * @param {Array} suggestions - Liste de suggestions
 * @param {string} placeholder - Placeholder
 * @param {number} maxSuggestions - Nombre max de suggestions affichées
 */
const AutocompleteField = ({
    value,
    onChange,
    suggestions = [],
    placeholder = 'Tapez pour rechercher...',
    maxSuggestions = 5
}) => {
    const [inputValue, setInputValue] = useState(value || '')
    const [filteredSuggestions, setFilteredSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1)
    const inputRef = useRef(null)
    const dropdownRef = useRef(null)

    useEffect(() => {
        if (value !== undefined) setInputValue(value)
    }, [value])

    useEffect(() => {
        // Clic en dehors pour fermer
        const handleClickOutside = (event) => {
            if (
                inputRef.current &&
                !inputRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e) => {
        const userInput = e.target.value
        setInputValue(userInput)
        onChange?.(userInput)

        if (userInput.length > 0) {
            const filtered = suggestions
                .filter(suggestion =>
                    suggestion.toLowerCase().includes(userInput.toLowerCase())
                )
                .slice(0, maxSuggestions)

            setFilteredSuggestions(filtered)
            setShowSuggestions(true)
            setActiveSuggestionIndex(-1)
        } else {
            setFilteredSuggestions([])
            setShowSuggestions(false)
        }
    }

    const handleSuggestionClick = (suggestion) => {
        setInputValue(suggestion)
        onChange?.(suggestion)
        setFilteredSuggestions([])
        setShowSuggestions(false)
        setActiveSuggestionIndex(-1)
    }

    const handleKeyDown = (e) => {
        // Flèche bas
        if (e.key === 'ArrowDown') {
            e.preventDefault()
            setActiveSuggestionIndex(prev =>
                prev < filteredSuggestions.length - 1 ? prev + 1 : prev
            )
        }
        // Flèche haut
        else if (e.key === 'ArrowUp') {
            e.preventDefault()
            setActiveSuggestionIndex(prev => (prev > 0 ? prev - 1 : -1))
        }
        // Entrée
        else if (e.key === 'Enter') {
            e.preventDefault()
            if (activeSuggestionIndex >= 0 && filteredSuggestions[activeSuggestionIndex]) {
                handleSuggestionClick(filteredSuggestions[activeSuggestionIndex])
            }
        }
        // Échap
        else if (e.key === 'Escape') {
            setShowSuggestions(false)
            setActiveSuggestionIndex(-1)
        }
    }

    const handleFocus = () => {
        if (inputValue.length > 0 && filteredSuggestions.length > 0) {
            setShowSuggestions(true)
        }
    }

    return (
        <div className="relative w-full">
            <div ref={inputRef}>
                <LiquidInput
                    type="text"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={handleFocus}
                    placeholder={placeholder}
                    className="w-full"
                    autoComplete="off"
                />
            </div>

            {/* Suggestions dropdown */}
            <AnimatePresence>
                {showSuggestions && filteredSuggestions.length > 0 && (
                    <motion.div
                        ref={dropdownRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-1 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
                    >
                        <div className="max-h-48 overflow-y-auto">
                            {filteredSuggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={`
                                        w-full px-4 py-2.5 text-left text-sm transition
                                        ${index === activeSuggestionIndex
                                            ? 'bg-purple-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700'
                                        }
                                        ${index !== filteredSuggestions.length - 1 ? 'border-b border-gray-700' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="text-gray-500">🔍</span>
                                        <span className="font-medium">{suggestion}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="px-3 py-2 bg-gray-900 border-t border-gray-700 text-xs text-gray-400">
                            {filteredSuggestions.length} suggestion{filteredSuggestions.length > 1 ? 's' : ''}
                            {filteredSuggestions.length === maxSuggestions && ' (max)'}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Hint clavier */}
            {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="mt-1 text-xs text-gray-500">
                    ↑↓ Naviguer • ↵ Sélectionner • Esc Fermer
                </div>
            )}
        </div>
    )
}

export default AutocompleteField

