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
        <div className="bg-theme-primary backdrop-blur-xl border-t border-theme overflow-x-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex gap-1.5 py-2 justify-center flex-wrap">
                    {sections.map((section, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSectionClick(idx)}
                            className={`flex-shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${idx === currentIndex
                                ? 'bg-theme-accent text-[rgb(var(--text-primary))] border border-theme-accent shadow-[0_0_10px_rgba(var(--color-accent),0.3)]'
                                : 'bg-transparent text-[rgba(var(--text-primary),0.7)] hover:text-[rgb(var(--text-primary))] border border-theme hover:border-theme-accent'
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
