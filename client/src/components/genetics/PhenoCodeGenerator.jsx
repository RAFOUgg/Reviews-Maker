import { useState, useEffect } from 'react'
import { RefreshCw, Check, Edit2 } from 'lucide-react'
import LiquidCard from '../LiquidCard'

/**
 * PhenoCodeGenerator - Générateur automatique de codes phénotype CDC conforme
 * Formats : PH-01, F1-02, CUT-03, CLONE-04, S1-05, etc.
 * Auto-incrémentation depuis dernier code utilisateur
 */
export default function PhenoCodeGenerator({ value = '', onChange, userId }) {
    const [prefix, setPrefix] = useState('PH')
    const [customMode, setCustomMode] = useState(false)
    const [generatedCode, setGeneratedCode] = useState('')
    const [loading, setLoading] = useState(false)

    const PREFIXES = [
        { value: 'PH', label: 'PH', description: 'Pheno Hunt' },
        { value: 'F', label: 'F', description: 'Filial (F1, F2, F3...)' },
        { value: 'CUT', label: 'CUT', description: 'Cutting/Bouture' },
        { value: 'CLONE', label: 'CLONE', description: 'Clone élite' },
        { value: 'S', label: 'S', description: 'Selfed (S1, S2...)' },
        { value: 'BX', label: 'BX', description: 'Backcross' },
    ]

    // Générer code automatique au changement de préfixe
    useEffect(() => {
        if (!customMode && prefix) {
            generateCode(prefix)
        }
    }, [prefix])

    // Générer code depuis API
    const generateCode = async (selectedPrefix) => {
        setLoading(true)
        try {
            const res = await fetch(`/api/genetics/next-pheno-code/${selectedPrefix}`, {
                credentials: 'include'
            })

            if (res.ok) {
                const data = await res.json()
                const code = data.code
                setGeneratedCode(code)
                onChange(code)
            } else {
                // Fallback si API pas dispo : générer localement
                const fallbackCode = `${selectedPrefix}-01`
                setGeneratedCode(fallbackCode)
                onChange(fallbackCode)
            }
        } catch (error) {
}
