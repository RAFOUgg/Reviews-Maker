import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Search, ChevronDown } from 'lucide-react'

/**
 * Section 2: Génétiques
 * - breeder (optional)
 * - variety (autocomplete depuis cultivars)
 * - type (indica/sativa/hybride)
 * - indicaRatio (slider 0-100%)
 * - parentage (optional)
 * - phenotype (optional)
 */
export default function Genetiques({ data, onChange, errors = {} }) {
    const { t } = useTranslation()
    const [varietySuggestions, setVarietySuggestions] = useState([])
    const [showSuggestions, setShowSuggestions] = useState(false)
    const [loadingSuggestions, setLoadingSuggestions] = useState(false)
    const debounceTimer = useRef(null)
    const suggestionsRef = useRef(null)

    const handleInputChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    // Autocomplete variety depuis API cultivars
    const searchCultivars = async (query) => {
        if (!query || query.length < 2) {
            setVarietySuggestions([])
            return
        }

        setLoadingSuggestions(true)
        try {
            const response = await fetch(`/api/cultivars/search?q=${encodeURIComponent(query)}`, {
                credentials: 'include'
            })
            if (response.ok) {
                const cultivars = await response.json()
                setVarietySuggestions(cultivars)
            }
        } catch (error) {
}
