import tastes from '../data/tastes.json'
import smells from '../data/smells.json'
import effects from '../data/effects.json'

const LEXICON = {
    tastes: tastes,
    smells: smells,
    effects: effects
}

export const getLexicon = (category) => {
    if (!category) return LEXICON
    return LEXICON[category] || []
}

const HISTORY_PREFIX = 'rm_history:'

export const saveHistoryForField = (fieldKey, value) => {
    try {
        const key = HISTORY_PREFIX + fieldKey
        const raw = localStorage.getItem(key)
        const arr = raw ? JSON.parse(raw) : []
        arr.push(value)
        // keep only last 20
        const truncated = arr.slice(-20)
        localStorage.setItem(key, JSON.stringify(truncated))
    } catch (e) {
        console.warn('saveHistoryForField failed', e)
    }
}

export const getHistoryForField = (fieldKey) => {
    try {
        const key = HISTORY_PREFIX + fieldKey
        const raw = localStorage.getItem(key)
        return raw ? JSON.parse(raw) : []
    } catch (e) {
        return []
    }
}

export default {
    getLexicon,
    saveHistoryForField,
    getHistoryForField
}
