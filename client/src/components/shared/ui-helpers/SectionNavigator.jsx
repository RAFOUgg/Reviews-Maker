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

    const glowShadows = {
        violet: 'rgba(139,92,246,0.18)',
        green: 'rgba(34,197,94,0.14)',
        blue: 'rgba(59,130,246,0.14)',
        amber: 'rgba(251,191,36,0.14)'
    };

    const containerRef = React.useRef(null);

    // Keep active tab visible and centered if possible
    React.useEffect(() => {
        const el = containerRef.current?.querySelectorAll('button')?.[currentIndex];
        if (el && containerRef.current) {
            el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    }, [currentIndex]);

    return (
        <nav ref={containerRef} className="bg-[#07070f]/80 backdrop-blur-xl border-t border-white/10 overflow-x-auto no-scrollbar" role="tablist" aria-label="Navigation des sections">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Horizontal scroller - apple like feel */}
                <div className="flex gap-3 py-3 items-center" style={{ scrollSnapType: 'x mandatory' }}>
                    {sections.map((section, idx) => (
                        <motion.button
                            key={idx}
                            role="tab"
                            aria-selected={idx === currentIndex}
                            onClick={() => onSectionClick(idx)}
                            whileHover={{ scale: 1.03 }}
                            whileTap={{ scale: 0.98 }}
                            className={`relative flex-shrink-0 px-4 py-3 rounded-2xl text-sm font-medium transition-all ${idx === currentIndex
                                ? `text-white ${glowColors[glowColor]} shadow-xl` // glassy active
                                : 'text-white/70 bg-white/2 hover:bg-white/5'
                                }`}
                            style={{ scrollSnapAlign: 'center', backdropFilter: idx === currentIndex ? 'blur(6px) saturate(120%)' : 'none' }}
                        >
                            {/* Animated glass highlight */}
                            {idx === currentIndex && (
                                <motion.div
                                    layoutId="section-indicator"
                                    className="absolute inset-0 rounded-2xl pointer-events-none"
                                    style={{
                                        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                                        border: '1px solid rgba(255,255,255,0.06)'
                                    }}
                                    transition={{ type: 'spring', stiffness: 320, damping: 30 }}
                                />
                            )}

                            <span className="relative z-10 px-1">{section.title}</span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </nav>
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


