/**
 * CompletionBar - Barre de progression de completion de formulaire
 * Liquid Glass UI Design System
 */

import { LiquidCard } from '@/components/ui/LiquidUI';
import { CheckCircle, AlertTriangle } from 'lucide-react';

export default function CompletionBar({ formData, currentSection, productStructure }) {
    const calculateCompletion = () => {
        if (!currentSection || !productStructure) return 0;

        const allFields = productStructure.sections.flatMap(section => section.fields || []);
        const filledFields = allFields.filter(field => {
            const value = formData[field.key];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== null && v !== '' && v !== 0);
            }
            return value !== null && value !== '' && value !== undefined;
        });

        return Math.round((filledFields.length / allFields.length) * 100);
    };

    const calculateSectionCompletion = (section) => {
        if (!section || !section.fields) return 0;

        const totalFields = section.fields.length;
        const filledFields = section.fields.filter(field => {
            const value = formData[field.key];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== null && v !== '' && v !== 0);
            }
            return value !== null && value !== '' && value !== undefined;
        }).length;

        return Math.round((filledFields / totalFields) * 100);
    };

    const completionPercent = calculateCompletion();
    const sectionPercent = calculateSectionCompletion(currentSection);

    const getCompletionColor = (percent) => {
        if (percent >= 80) return { bg: 'bg-green-500', glow: 'shadow-green-500/50' };
        if (percent >= 50) return { bg: 'bg-amber-500', glow: 'shadow-amber-500/50' };
        return { bg: 'bg-red-500', glow: 'shadow-red-500/50' };
    };

    const getRequiredFieldsCount = () => {
        if (!productStructure) return { total: 0, filled: 0, missing: [] };

        const requiredFields = productStructure.sections
            .flatMap(section => section.fields || [])
            .filter(field => field.required);

        const filledRequired = requiredFields.filter(field => {
            const value = formData[field.key];
            if (Array.isArray(value)) return value.length > 0;
            if (typeof value === 'object' && value !== null) {
                return Object.values(value).some(v => v !== null && v !== '' && v !== 0);
            }
            return value !== null && value !== '' && value !== undefined;
        });

        return {
            total: requiredFields.length,
            filled: filledRequired.length,
            missing: requiredFields.filter(field => {
                const value = formData[field.key];
                if (Array.isArray(value)) return value.length === 0;
                if (typeof value === 'object' && value !== null) {
                    return !Object.values(value).some(v => v !== null && v !== '' && v !== 0);
                }
                return !value || value === '';
            }).map(f => f.label)
        };
    };

    const required = getRequiredFieldsCount();
    const canSubmit = required.filled === required.total && completionPercent >= 80;
    const globalColor = getCompletionColor(completionPercent);
    const sectionColor = getCompletionColor(sectionPercent);

    return (
        <div className="sticky top-0 z-20 bg-[#07070f]/95 backdrop-blur-xl border-b border-white/10 p-4 space-y-3">
            {/* Completion globale */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold text-white/60">
                        Completion globale
                    </span>
                    <span className={`text-lg font-bold ${completionPercent >= 80 ? 'text-green-400' : 'text-amber-400'}`}>
                        {completionPercent}%
                    </span>
                    {canSubmit && (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
                            <CheckCircle className="w-3 h-3" />
                            Prêt
                        </span>
                    )}
                </div>

                <div className="flex items-center gap-2 text-sm text-white/40">
                    <span>Champs requis:</span>
                    <span className={`font-bold ${required.filled === required.total ? 'text-green-400' : 'text-amber-400'}`}>
                        {required.filled}/{required.total}
                    </span>
                </div>
            </div>

            {/* Barre de progression globale */}
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-500 ${globalColor.bg} ${globalColor.glow} shadow-lg`}
                    style={{ width: `${completionPercent}%` }}
                />
            </div>

            {/* Section actuelle */}
            {currentSection && (
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-white/40">Section actuelle:</span>
                    <span className="font-semibold text-white">{currentSection.title}</span>
                    <span className={`text-xs font-bold ${sectionPercent >= 80 ? 'text-green-400' : 'text-white/40'}`}>
                        ({sectionPercent}%)
                    </span>
                    <div className="flex-1 bg-white/10 h-2 rounded-full overflow-hidden">
                        <div
                            className={`h-full transition-all duration-300 ${sectionColor.bg}`}
                            style={{ width: `${sectionPercent}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Warning si champs requis manquants */}
            {required.missing.length > 0 && (
                <LiquidCard className="flex items-start gap-2 px-3 py-2" style={{
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderColor: 'rgba(245, 158, 11, 0.3)'
                }}>
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1 text-xs">
                        <p className="font-semibold text-amber-300 mb-1">
                            {required.missing.length} champ(s) requis manquant(s):
                        </p>
                        <p className="text-amber-200/80">
                            {required.missing.join(', ')}
                        </p>
                    </div>
                </LiquidCard>
            )}
        </div>
    );
}


