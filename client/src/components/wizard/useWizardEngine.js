import { useMemo, useState } from 'react'
import { SENTINEL_BY_WIDGET } from './wizardFieldTypes'

/**
 * Moteur générique du wizard "une question à la fois". Ne connaît rien du type de
 * produit — il lit/écrit dans `formData` via `handleChange` en suivant `question.path`,
 * exactement comme le feraient les sections classiques. Ça garde l'autosave existant
 * (déclenché par le useEffect sur [formData] de chaque CreateXReview/index.jsx) intact.
 */
export function useWizardEngine({ questions, formData, handleChange, initialIndex = 0, onIndexChange }) {
    const [currentIndex, setCurrentIndexState] = useState(initialIndex)

    // Remonte chaque changement de position au parent (via onIndexChange) pour que la position
    // survive un aller-retour vers le formulaire classique (ex: handoff pipeline) — WizardFlow est
    // démonté/remonté à chaque bascule de mode, donc ce state interne seul serait perdu à chaque fois.
    const setCurrentIndex = (updater) => {
        setCurrentIndexState(prev => {
            const next = typeof updater === 'function' ? updater(prev) : updater
            const clamped = Math.max(0, Math.min(questions.length - 1, next))
            onIndexChange?.(clamped)
            return clamped
        })
    }

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
