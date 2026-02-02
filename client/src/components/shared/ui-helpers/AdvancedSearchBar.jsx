/**
 * AdvancedSearchBar Component
 * Barre de recherche avec suggestions et auto-completion
 * Liquid Glass UI Design System
 */

import { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { suggestSearchTerms } from '../../../utils/filterHelpers';
import { LiquidCard } from '@/components/ui/LiquidUI';

export default function AdvancedSearchBar({
    searchIndex,
    onSearch,
    placeholder = "Nom, cultivar, breeder, ingrédient...",
    glowColor = 'violet'
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const suggestionsRef = useRef(null);

    const glowColors = {
        violet: 'focus:border-violet-500/50 focus:ring-violet-500/20',
        green: 'focus:border-green-500/50 focus:ring-green-500/20',
        blue: 'focus:border-blue-500/50 focus:ring-blue-500/20',
        amber: 'focus:border-amber-500/50 focus:ring-amber-500/20',
    };

    useEffect(() => {
        if (searchTerm.length >= 2 && searchIndex) {
            setLoading(true);
            const timer = setTimeout(() => {
                const newSuggestions = suggestSearchTerms(searchTerm, searchIndex, 8);
                setSuggestions(newSuggestions);
                setShowSuggestions(newSuggestions.length > 0);
                setLoading(false);
            }, 150);
            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    }, [searchTerm, searchIndex]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                inputRef.current && !inputRef.current.contains(event.target) &&
                suggestionsRef.current && !suggestionsRef.current.contains(event.target)
            ) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setSelectedIndex(-1);
        onSearch(value);
    };

    const handleSuggestionClick = (suggestion) => {
        setSearchTerm(suggestion);
        setShowSuggestions(false);
        onSearch(suggestion);
    };

    const handleKeyDown = (e) => {
        if (!showSuggestions) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => prev < suggestions.length - 1 ? prev + 1 : prev);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowSuggestions(false);
                break;
            default:
                break;
        }
    };

    const handleClear = () => {
        setSearchTerm('');
        onSearch('');
        setSuggestions([]);
        setShowSuggestions(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative">
            <div className="relative">
                {/* Search Icon */}
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                    placeholder={placeholder}
                    className={`w-full px-4 py-3 pl-12 pr-12 bg-white/5 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 ${glowColors[glowColor]} transition-all backdrop-blur-md`}
                />

                {/* Loading / Clear buttons */}
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {loading && (
                        <Loader2 className="w-4 h-4 text-white/40 animate-spin" />
                    )}
                    {searchTerm && !loading && (
                        <button
                            onClick={handleClear}
                            className="text-white/40 hover:text-white transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                    <motion.div
                        ref={suggestionsRef}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="absolute z-50 w-full mt-2"
                    >
                        <LiquidCard className="overflow-hidden p-1">
                            {suggestions.map((suggestion, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleSuggestionClick(suggestion)}
                                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors ${index === selectedIndex
                                            ? 'bg-violet-500/20 text-white'
                                            : 'text-white/80 hover:bg-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <Search className="w-3.5 h-3.5 text-white/40" />
                                        <span>{suggestion}</span>
                                    </div>
                                </button>
                            ))}
                        </LiquidCard>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

AdvancedSearchBar.propTypes = {
    searchIndex: PropTypes.object,
    onSearch: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
    glowColor: PropTypes.oneOf(['violet', 'green', 'blue', 'amber'])
};


