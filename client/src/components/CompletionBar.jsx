export default function CompletionBar({ formData, currentSection, productStructure }) {
    const calculateCompletion = () => {
        if (!currentSection || !productStructure) return 0

        const allFields = productStructure.sections.flatMap(section => section.fields || [])
        const filledFields = allFields.filter(field => {
            const value = formData[field.key]
            if (Array.isArray(value)) return value.length > 0
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== null && v !== '' && v !== 0)
            }
            return value !== null && value !== '' && value !== undefined
        })

        return Math.round((filledFields.length / allFields.length) * 100)
    }

    const calculateSectionCompletion = (section) => {
        if (!section || !section.fields) return 0

        const totalFields = section.fields.length
        const filledFields = section.fields.filter(field => {
            const value = formData[field.key]
            if (Array.isArray(value)) return value.length > 0
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== null && v !== '' && v !== 0)
            }
            return value !== null && value !== '' && value !== undefined
        }).length

        return Math.round((filledFields / totalFields) * 100)
    }

    const completionPercent = calculateCompletion()
    const sectionPercent = calculateSectionCompletion(currentSection)

    const getCompletionColor = (percent) => {
        if (percent >= 80) return 'bg-green-500'
        if (percent >= 50) return 'bg-amber-500'
        return 'bg-red-500'
    }

    const getRequiredFieldsCount = () => {
        if (!productStructure) return { total: 0, filled: 0 }

        const requiredFields = productStructure.sections
            .flatMap(section => section.fields || [])
            .filter(field => field.required)

        const filledRequired = requiredFields.filter(field => {
            const value = formData[field.key]
            if (Array.isArray(value)) return value.length > 0
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== null && v !== '' && v !== 0)
            }
            return value !== null && value !== '' && value !== undefined
        })

        return {
            total: requiredFields.length,
            filled: filledRequired.length,
            missing: requiredFields.filter(field => {
                const value = formData[field.key]
                if (Array.isArray(value)) return value.length === 0
                if (typeof value === 'object' && value !== null) {
                    return !Object.values(value).some(v => v !== null && v !== '' && v !== 0)
                }
                return !value || value === ''
            }).map(f => f.label)
        }
    }

    const required = getRequiredFieldsCount()
    const canSubmit = required.filled === required.total && completionPercent >= 80

    return (
        <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-xl border-b border-gray-700 p-4 space-y-3">
            {/* Completion globale */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-gray-300">
                        Completion globale
                    </span>
                    <span className={`text-lg font-bold ${completionPercent >= 80 ? 'text-green-400' : 'text-amber-400'}`}>
                        {completionPercent}%
                    </span>
                    {canSubmit && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            Prêt
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>Champs requis:</span>
                    <span className={`font-bold ${required.filled === required.total ? 'text-green-400' : 'text-amber-400'}`}>
                        {required.filled}/{required.total}
                    </span>
                </div>
            </div>

            {/* Barre de progression globale */}
            <div className="w-full bg-gray-700 h-3 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${getCompletionColor(completionPercent)} shadow-lg`}
                    style={{ width: `${completionPercent}%` }}
                />
            </div>

            {/* Section actuelle */}
            {currentSection && (
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">Section actuelle:</span>
                    <span className="font-semibold text-white">{currentSection.title}</span>
                    <span className={`text-xs font-bold ${sectionPercent >= 80 ? 'text-green-400' : 'text-gray-400'}`}>
                        ({sectionPercent}%)
                    </span>
                    <div className="flex-1 bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${getCompletionColor(sectionPercent)}`}
                            style={{ width: `${sectionPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Warning si champs requis manquants */}
            {required.missing.length > 0 && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30">
                    <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="flex-1 text-xs">
                        <p className="font-semibold text-amber-300 mb-1">
                            {required.missing.length} champ(s) requis manquant(s):
                        </p>
                        <p className="text-amber-200">
                            {required.missing.join(', ')}
                        </p>
                    </div>
                </div>
            )}
        </div>
    )
}


