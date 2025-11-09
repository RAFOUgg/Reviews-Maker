/**
 * SectionNavigator Component
 * Barre de navigation entre les sections d'un formulaire multi-étapes
 */

import PropTypes from 'prop-types'

export default function SectionNavigator({
    sections,
    currentIndex,
    onSectionClick
}) {
    return (
        <div className="bg-[rgba(var(--color-primary),0.85)] backdrop-blur-xl border-t border-[rgba(var(--color-primary),0.3)] overflow-x-auto">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex gap-1.5 py-2 justify-center flex-wrap">
                    {sections.map((section, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSectionClick(idx)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${idx === currentIndex
                                ? 'bg-[rgba(var(--color-accent),0.3)] text-[rgb(var(--text-primary))] border border-[rgba(var(--color-accent),0.5)] shadow-[0_0_10px_rgba(var(--color-accent),0.3)]'
                                : 'bg-transparent text-[rgba(var(--text-primary),0.7)] hover:text-[rgb(var(--text-primary))] border border-[rgba(var(--color-primary),0.3)] hover:border-[rgba(var(--color-accent),0.4)]'
                                }`}
                        >
                            {section.title}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}

SectionNavigator.propTypes = {
    sections: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired
    })).isRequired,
    currentIndex: PropTypes.number.isRequired,
    onSectionClick: PropTypes.func.isRequired
}
