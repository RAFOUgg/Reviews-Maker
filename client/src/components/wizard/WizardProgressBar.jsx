import React from 'react'
import WizardModeToggle from '../ui/WizardModeToggle'

export default function WizardProgressBar({ currentIndex, total, sectionLabel, onExitToClassic }) {
    const percent = total > 0 ? ((currentIndex + 1) / total) * 100 : 0

    return (
        <div className="flex-shrink-0 bg-[#07070f]/95 backdrop-blur-xl border-b border-white/10 px-3 py-2 safe-area-inset-top">
            <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="text-xs font-medium text-white/50">{sectionLabel}</span>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-white/40">{currentIndex + 1}/{total}</span>
                    {onExitToClassic && (
                        <WizardModeToggle active onClick={onExitToClassic} compact />
                    )}
                </div>
            </div>
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                <div
                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-purple-600 transition-all duration-300 ease-out"
                    style={{ width: `${percent}%` }}
                />
            </div>
        </div>
    )
}
