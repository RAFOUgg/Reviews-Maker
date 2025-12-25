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
            console.error('Erreur génération code:', error)
            // Fallback
            const fallbackCode = `${selectedPrefix}-01`
            setGeneratedCode(fallbackCode)
            onChange(fallbackCode)
        } finally {
            setLoading(false)
        }
    }

    // Regénérer un nouveau code
    const handleRegenerate = () => {
        generateCode(prefix)
    }

    // Passer en mode édition manuelle
    const handleToggleCustom = () => {
        setCustomMode(!customMode)
        if (!customMode) {
            onChange(generatedCode || value)
        }
    }

    return (
        <LiquidCard className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            🔢 Code Phénotype
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Génération automatique avec auto-incrémentation
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleToggleCustom}
                        className={`
                            px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                            ${customMode
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                            }
                        `}
                    >
                        <Edit2 className="w-3 h-3 inline mr-1" />
                        {customMode ? 'Mode manuel' : 'Mode auto'}
                    </button>
                </div>

                {!customMode ? (
                    <>
                        {/* Sélection préfixe */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Préfixe
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {PREFIXES.map(p => (
                                    <button
                                        key={p.value}
                                        type="button"
                                        onClick={() => setPrefix(p.value)}
                                        className={`
                                            px-3 py-2 rounded-lg text-sm font-medium transition-all
                                            ${prefix === p.value
                                                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-md'
                                                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:border-purple-400'
                                            }
                                        `}
                                        title={p.description}
                                    >
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Code généré */}
                        <div className="relative">
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Code généré
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 px-4 py-3 bg-white dark:bg-gray-800 border-2 border-purple-300 dark:border-purple-600 rounded-lg font-mono text-lg font-bold text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    {loading ? (
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                                            Génération...
                                        </div>
                                    ) : (
                                        <>
                                            <Check className="w-5 h-5 mr-2 text-green-500" />
                                            {generatedCode || value || `${prefix}-01`}
                                        </>
                                    )}
                                </div>

                                <button
                                    type="button"
                                    onClick={handleRegenerate}
                                    disabled={loading}
                                    className="px-4 py-3 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-400 text-white rounded-lg transition-all shadow-md hover:shadow-lg"
                                    title="Générer un nouveau code"
                                >
                                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            <p className="text-xs text-gray-500 mt-2">
                                💡 Le code s'incrémente automatiquement depuis votre dernier {prefix} utilisé
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Mode édition manuelle */}
                        <div>
                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Code personnalisé
                            </label>
                            <input
                                type="text"
                                value={value}
                                onChange={(e) => onChange(e.target.value)}
                                placeholder="Ex: PH-#3, MySelection-A, etc."
                                className="w-full px-4 py-3 border-2 border-orange-300 dark:border-orange-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500 font-mono"
                                maxLength={20}
                            />
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                ⚠️ Mode manuel : saisissez votre propre code
                            </p>
                        </div>
                    </>
                )}

                {/* Exemples */}
                <div className="bg-white/50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                        📋 Exemples de codes :
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                        <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 rounded text-purple-700 dark:text-purple-300 font-mono">PH-01</span>
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 rounded text-blue-700 dark:text-blue-300 font-mono">F2-03</span>
                        <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 rounded text-green-700 dark:text-green-300 font-mono">CUT-12</span>
                    </div>
                </div>
            </div>
        </LiquidCard>
    )
}
