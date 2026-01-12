import { useState, useRef } from 'react'
import { X, Plus, GripVertical, Search } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'

/**
 * MultiSelectPills - Composant CDC conforme
 * Sélection multiple avec pills, drag & drop pour réorganiser
 * Source : bibliothèque utilisateur + ajout nouveau
 */
export default function MultiSelectPills({
    value = [],
    onChange,
    source = 'user-library',
    placeholder = 'Sélectionner ou créer',
    addNewButton = true,
    addNewLabel = '+ Ajouter'
}) {
    const [searchTerm, setSearchTerm] = useState('')
    const [showDropdown, setShowDropdown] = useState(false)
    const [items, setItems] = useState([]) // Items from library
    const [loading, setLoading] = useState(false)
    const inputRef = useRef(null)

    // Charger items depuis API
    const fetchItems = async () => {
        if (loading || items.length > 0) return

        setLoading(true)
        try {
            const endpoint = source === 'user-library' ? '/api/cultivars' : `/api/${source}`
            const res = await fetch(endpoint, { credentials: 'include' })
            const data = await res.json()
            setItems(data)
        } catch (error) {
}
