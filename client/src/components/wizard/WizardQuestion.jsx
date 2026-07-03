import React from 'react'
import { Camera, X, ArrowRight } from 'lucide-react'
import LiquidInput from '../ui/LiquidInput'
import LiquidSelect from '../ui/LiquidSelect'
import LiquidSlider from '../ui/LiquidSlider'
import LiquidTextarea from '../ui/LiquidTextarea'
import LiquidMultiSelect from '../ui/LiquidMultiSelect'
import UnknownValueButton from '../ui/UnknownValueButton'
import FillMyselfButton from '../forms/helpers/FillMyselfButton'
import { WIZARD_WIDGETS } from './wizardFieldTypes'

function QuestionShell({ label, hint, children, onSkip, skipLabel }) {
    return (
        <div className="space-y-4">
            <h2 className="text-lg font-semibold text-white">{label}</h2>
            {hint && <p className="text-xs text-white/40 -mt-3">{hint}</p>}
            {children}
            {onSkip && (
                <div>
                    <UnknownValueButton onClick={onSkip} label={skipLabel} />
                </div>
            )}
        </div>
    )
}

function PhotoQuestion({ question, photos, onUpload, onRemove, onSkip }) {
    return (
        <QuestionShell label={question.label} hint={question.hint} onSkip={onSkip} skipLabel="Pas de photo pour l'instant">
            <div className="grid grid-cols-2 gap-3">
                {(photos || []).map((photo, index) => (
                    <div key={index} className="relative group">
                        <img
                            src={photo.preview || photo.url}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-28 object-cover rounded-lg border border-white/10 shadow-md"
                        />
                        <button
                            type="button"
                            onClick={() => onRemove(index)}
                            className="absolute top-1.5 right-1.5 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full shadow-lg"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                ))}
            </div>
            {(!photos || photos.length < 4) && (
                <label className="flex items-center justify-center gap-2 px-4 py-4 border-2 border-dashed border-white/20 rounded-xl cursor-pointer hover:border-violet-500/50 bg-white/5 hover:bg-violet-500/10 transition-all">
                    <Camera className="w-5 h-5 text-white/40" />
                    <span className="text-sm font-medium text-white/60">
                        Ajouter une photo ({(photos || []).length}/4)
                    </span>
                    <input type="file" accept="image/*" onChange={onUpload} className="hidden" multiple={(photos || []).length < 3} />
                </label>
            )}
        </QuestionShell>
    )
}

function HandoffQuestion({ question, onOpenHandoff, onSkip }) {
    return (
        <QuestionShell label={question.label} hint={question.hint} onSkip={onSkip} skipLabel="Passer, je configurerai plus tard">
            <button
                type="button"
                onClick={() => onOpenHandoff?.(question.handoffTarget)}
                className="w-full flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl bg-violet-500/15 hover:bg-violet-500/25 border border-violet-500/40 text-violet-200 font-medium transition-colors"
            >
                <span>{question.ctaLabel || 'Configurer'}</span>
                <ArrowRight className="w-4 h-4" />
            </button>
        </QuestionShell>
    )
}

/**
 * Rend UNE question du wizard selon son widget. Ne connaît jamais `formData` — reçoit
 * `value`/`onChange`/`onSkip` déjà résolus par useWizardEngine (voir WizardFlow.jsx).
 */
export default function WizardQuestion({ question, value, onChange, onSkip, onOpenHandoff, photos, handlePhotoUpload, removePhoto }) {
    if (!question) return null

    switch (question.widget) {
        case WIZARD_WIDGETS.TEXT:
            return (
                <QuestionShell label={question.label} hint={question.hint} onSkip={!question.required ? onSkip : null}>
                    <LiquidInput
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                        type={question.inputType || 'text'}
                        maxLength={question.maxLength}
                        placeholder={question.placeholder}
                        autoFocus
                    />
                    {question.allowFillMyself && (
                        <FillMyselfButton onFill={onChange} />
                    )}
                </QuestionShell>
            )

        case WIZARD_WIDGETS.TEXTAREA:
            return (
                <QuestionShell label={question.label} hint={question.hint} onSkip={onSkip}>
                    <LiquidTextarea
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={question.placeholder}
                    />
                </QuestionShell>
            )

        case WIZARD_WIDGETS.SELECT:
            return (
                <QuestionShell label={question.label} hint={question.hint} onSkip={onSkip}>
                    <LiquidSelect
                        options={question.options}
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                </QuestionShell>
            )

        case WIZARD_WIDGETS.CHIPS:
            return (
                <QuestionShell label={question.label} hint={question.hint} onSkip={onSkip}>
                    <LiquidMultiSelect
                        options={question.options}
                        value={value ?? []}
                        onChange={onChange}
                        maxSelections={question.maxSelections}
                    />
                </QuestionShell>
            )

        case WIZARD_WIDGETS.SLIDER:
            return (
                <QuestionShell label={question.label} hint={question.hint} onSkip={onSkip} skipLabel={question.unknownLabel || 'Non évalué'}>
                    <LiquidSlider
                        value={value ?? 0}
                        min={question.min ?? 0}
                        max={question.max ?? 10}
                        step={question.step ?? 1}
                        onChange={onChange}
                    />
                    {question.unknownLabel && (value ?? 0) === 0 && (
                        <p className="text-xs text-white/40">{question.unknownLabel}</p>
                    )}
                </QuestionShell>
            )

        case WIZARD_WIDGETS.PHOTO:
            return (
                <PhotoQuestion
                    question={question}
                    photos={photos}
                    onUpload={handlePhotoUpload}
                    onRemove={removePhoto}
                    onSkip={onSkip}
                />
            )

        case WIZARD_WIDGETS.HANDOFF:
            return <HandoffQuestion question={question} onOpenHandoff={onOpenHandoff} onSkip={onSkip} />

        default:
            return null
    }
}
