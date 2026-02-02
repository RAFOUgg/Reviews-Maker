/**
 * SectionNavigator Component
 * Barre de navigation entre les sections d'un formulaire multi-étapes
 * Liquid Glass UI Design System
 */

import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export default function SectionNavigator({
    sections,
    currentIndex,
    onSectionClick,
    glowColor = 'violet'
}) {
    const glowColors = {
        violet: 'border-violet-500/50 bg-violet-500/20 shadow-violet-500/30',
        green: 'border-green-500/50 bg-green-500/20 shadow-green-500/30',
        blue: 'border-blue-500/50 bg-blue-500/20 shadow-blue-500/30',
        amber: 'border-amber-500/50 bg-amber-500/20 shadow-amber-500/30',
    };

    return (
        <div className="bg-[#07070f]/80 backdrop-blur-xl border-t border-white/10 overflow-x-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex gap-2 py-3 justify-center flex-wrap">
                    {sections.map((section, idx) => (
                        <motion.button
                            key={idx}
                            onClick={() => onSectionClick(idx)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-all border ${idx === currentIndex
                                    ? `${glowColors[glowColor]} text-white shadow-lg`
                                    : 'border-white/10 bg-white/5 text-white/60 hover:text-white hover:bg-white/10 hover:border-white/20'
                                }`}
                        >
                            {/* Active indicator */}
                            {idx === currentIndex && (
                                <motion.div
                                    layoutId="section-indicator"
                                    className="absolute inset-0 rounded-xl"
                                    style={{
                                        boxShadow: `0 0 15px var(--glow-color, rgba(139, 92, 246, 0.3))`
                                    }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 400,
                                        damping: 30
                                    }}
                                />
                            )}
                            <span className="relative z-10">{section.title}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
}

SectionNavigator.propTypes = {
    sections: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired
    })).isRequired,
    currentIndex: PropTypes.number.isRequired,
    onSectionClick: PropTypes.func.isRequired,
    glowColor: PropTypes.oneOf(['violet', 'green', 'blue', 'amber'])
};


