import { useState, useEffect, useRef } from 'react'
import PropTypes from 'prop-types'
import { suggestSearchTerms } from '../../../utils/filterHelpers'

export default function AdvancedSearchBar({ searchIndex, onSearch, placeholder = "Nom, cultivar, breeder, ingrédient..." }) {
    const [searchTerm, setSearchTerm] = useState('')
    const [suggestions, setSuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(-1)
    const inputRef = useRef(null)
    const suggestionsRef = useRef(null)

    useEffect(() => {
        if (searchTerm.length >= 2 && searchIndex) {
            const newSuggestions = suggestSearchTerms(searchTerm, searchIndex, 8)
            setSuggestions(newSuggestions)
            setShowSuggestions(newSuggestions.length > 0)
        } else {
            setSuggestions([])
            setShowSuggestions(false)
        }
    }, [searchTerm, searchIndex])

    // Fermer les suggestions si on clique ailleurs
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                inputRef.current && !inputRef.current.contains(event.target) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target)
            ) {
                setShowSuggestions(false)
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleInputChange = (e) => {
        const value = e.target.value
        setSearchTerm(value)
        setSelectedIndex(-1)
        onSearch(value)
    }

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion)
        setShowSuggestions(false)
        onSearch(suggestion)
    }

    const handleKeyDown = (e) => {
        if (!showSuggestions) return

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault()
                setSelectedIndex(prev =>
                    prev < suggestions.length - 1 ? prev + 1 : prev
                )
                break
            case 'ArrowUp':
                e.preventDefault()
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
                break
            case 'Enter':
                e.preventDefault()
                if (selectedIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedIndex])
                }
                break
            case 'Escape':
                setShowSuggestions(false)
                break
            default:
                break
        }
    }

    const handleClear = () => {
        setSearchTerm('')
        onSearch('')
        setSuggestions([])
        setShowSuggestions(false)
        inputRef.current?.focus()
    }

    return (
        <div className="relative">
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pl-11 pr-10 bg-gray-900 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all"
                />

                {/* Icône de recherche */}
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>

                {/* Bouton clear */}
                {searchTerm && (
                    <button
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        title="Effacer"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Suggestions dropdown */}
            {showSuggestions && suggestions.length > 0 && (
                <div
                    ref={suggestionsRef}
                    className="absolute z-50 w-full mt-2 bg-gray-800 border border-gray-600 rounded-lg shadow-2xl max-h-64 overflow-y-auto"
                >
                    <div className="p-2 space-y-1">
                        {suggestions.map((suggestion, index) => (
                            <button
                                key={suggestion}
                                onClick={() => handleSuggestionClick(suggestion)}
                                className={`w-full text-left px-4 py-2 rounded-md transition-colors ${index === selectedIndex
                                        ? 'bg-green-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-700'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <span className="capitalize">{suggestion}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Indicateur de résultats */}
            {searchTerm && (
                <div className="mt-2 text-xs text-gray-400">
                    <span>💡 Astuce: Recherchez par nom, cultivar, breeder, ingrédient, méthode d&apos;extraction...</span>
                </div>
            )}
        </div>
    )
}

AdvancedSearchBar.propTypes = {
    searchIndex: PropTypes.instanceOf(Map),
    onSearch: PropTypes.func.isRequired,
    placeholder: PropTypes.string
}


