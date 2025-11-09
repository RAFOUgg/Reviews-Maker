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
        <div className="sticky top-[88px] z-40 bg-transparent backdrop-blur-xl border-b border-white/10 glow-border overflow-x-auto">
            <div className="max-w-4xl mx-auto px-4">
                <div className="flex gap-2 py-3">
                    {sections.map((section, idx) => (
                        <button
                            key={idx}
                            onClick={() => onSectionClick(idx)}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-all ${idx === currentIndex
                                    ? 'bg-transparent text-white glow-text border border-white/30 glow-container-subtle'
                                    : 'bg-transparent text-white/60 hover:text-white border border-white/10 hover:border-white/20'
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
