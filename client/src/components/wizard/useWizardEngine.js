import { useMemo, useState } from 'react'
import { SENTINEL_BY_WIDGET } from './wizardFieldTypes'

/**
 * Moteur générique du wizard "une question à la fois". Ne connaît rien du type de
 * produit — il lit/écrit dans `formData` via `handleChange` en suivant `question.path`,
 * exactement comme le feraient les sections classiques. Ça garde l'autosave existant
 * (déclenché par le useEffect sur [formData] de chaque CreateXReview/index.jsx) intact.
 */
export function useWizardEngine({ questions, formData, handleChange }) {
    const [currentIndex, setCurrentIndex] = useState(0)

    const question = questions[currentIndex]
    const total = questions.length
    const isLast = currentIndex === total - 1
    const isFirst = currentIndex === 0

    const getValue = (q) => {
        if (!q || !q.path) return undefined
        if (q.path.kind === 'flat') return formData[q.path.field]
        if (q.path.kind === 'nested') return formData[q.path.section]?.[q.path.field]
        return undefined
    }

    const setValue = (q, value) => {
        if (!q || !q.path) return
        if (q.path.kind === 'flat') {
            handleChange(q.path.field, value)
            return
        }
        if (q.path.kind === 'nested') {
            handleChange(q.path.section, { ...(formData[q.path.section] || {}), [q.path.field]: value })
        }
    }

    const goNext = () => setCurrentIndex(i => Math.min(i + 1, total - 1))
    const goPrevious = () => setCurrentIndex(i => Math.max(i - 1, 0))
    const goToIndex = (index) => setCurrentIndex(Math.max(0, Math.min(total - 1, index)))

    const onChange = (value) => setValue(question, value)

    const onSkip = () => {
        const sentinel = question?.sentinel !== undefined ? question.sentinel : SENTINEL_BY_WIDGET[question?.widget]
        if (sentinel !== undefined && question?.path) setValue(question, sentinel)
        goNext()
    }

    const onAnswerAndNext = (value) => {
        setValue(question, value)
        goNext()
    }

    const currentValue = useMemo(() => getValue(question), [question, formData])

    return {
        question,
        currentIndex,
        total,
        isLast,
        isFirst,
        currentValue,
        onChange,
        onSkip,
        onAnswerAndNext,
        goNext,
        goPrevious,
        goToIndex,
    }
}

export default useWizardEngine
