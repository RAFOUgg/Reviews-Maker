import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Type, BarChart3, Gauge, Smile, Palette, Ruler, Hash, Eye, EyeOff, ChevronRight } from 'lucide-react';

/**
 * OrchardContextMenu — Right-click context menu for preview elements.
 * Shows config options: display style, unit, size, visualization type, etc.
 */

const DISPLAY_STYLES = [
    { id: 'bar', label: 'Barre', icon: BarChart3, desc: 'Barre de progression' },
    { id: 'gauge', label: 'Jauge', icon: Gauge, desc: 'Jauge circulaire' },
    { id: 'score', label: 'Score', icon: Hash, desc: 'Valeur numérique' },
    { id: 'stars', label: 'Étoiles', icon: '⭐', desc: 'Note en étoiles' },
    { id: 'emoji', label: 'Emojis', icon: Smile, desc: 'Indicateurs emojis' },
];

const FONT_SIZES = [
    { id: 'xs', label: 'Très petit', px: 10 },
    { id: 'sm', label: 'Petit', px: 12 },
    { id: 'md', label: 'Normal', px: 14 },
    { id: 'lg', label: 'Grand', px: 16 },
    { id: 'xl', label: 'Très grand', px: 20 },
];

export default function OrchardContextMenu({ onApplyStyle }) {
    const [menuPos, setMenuPos] = useState(null);
    const [targetInfo, setTargetInfo] = useState(null);
    const [subMenu, setSubMenu] = useState(null);
    const menuRef = useRef(null);

    // Close on click outside or Escape
    const closeMenu = useCallback(() => {
        setMenuPos(null);
        setTargetInfo(null);
        setSubMenu(null);
    }, []);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape') closeMenu();
        };
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) closeMenu();
        };
        document.addEventListener('keydown', handleEscape);
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [closeMenu]);

    // Intercept right-click on orchard preview elements
    useEffect(() => {
        const handler = (e) => {
            // Find closest orchard section or score element
            const sectionEl = e.target.closest('[data-orchard-section]');
            const scoreEl = e.target.closest('[data-orchard-score]');
            const moduleEl = sectionEl || scoreEl;

            if (!moduleEl) return;

            e.preventDefault();
            e.stopPropagation();

            const sectionKey = moduleEl.getAttribute('data-orchard-section') || moduleEl.getAttribute('data-orchard-score');
            const sectionLabel = moduleEl.getAttribute('data-orchard-label') || sectionKey;

            // Position so menu stays in viewport
            const x = Math.min(e.clientX, window.innerWidth - 260);
            const y = Math.min(e.clientY, window.innerHeight - 340);
            setMenuPos({ x, y });
            setTargetInfo({ key: sectionKey, label: sectionLabel, isScore: !!scoreEl });
            setSubMenu(null);
        };

        document.addEventListener('contextmenu', handler);
        return () => document.removeEventListener('contextmenu', handler);
    }, []);

    const applyAndClose = useCallback((styleKey, value) => {
        if (onApplyStyle && targetInfo) {
            onApplyStyle(targetInfo.key, styleKey, value);
        }
        closeMenu();
    }, [onApplyStyle, targetInfo, closeMenu]);

    if (!menuPos || !targetInfo) return null;

    const MenuItem = ({ icon: Icon, label, onClick, hasSubmenu, active }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm rounded-lg transition-all ${active ? 'bg-purple-500/15 text-purple-300' : 'text-white/80 hover:bg-white/8 hover:text-white'
                }`}
        >
            {typeof Icon === 'string' ? (
                <span className="text-sm w-4 text-center">{Icon}</span>
            ) : (
                <Icon size={15} className="text-white/50 flex-shrink-0" />
            )}
            <span className="flex-1 truncate">{label}</span>
            {hasSubmenu && <ChevronRight size={13} className="text-white/30" />}
        </button>
    );

    return (
        <AnimatePresence>
            <motion.div
                ref={menuRef}
                initial={{ opacity: 0, scale: 0.92, y: -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -4 }}
                transition={{ duration: 0.15 }}
                className="fixed z-[10000]"
                style={{ left: menuPos.x, top: menuPos.y }}
            >
                <div
                    className="w-56 rounded-2xl overflow-hidden py-1.5"
                    style={{
                        background: 'linear-gradient(135deg, rgba(25,25,55,0.95) 0%, rgba(18,18,40,0.98) 100%)',
                        backdropFilter: 'blur(40px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)',
                    }}
                >
                    {/* Section header */}
                    <div className="px-3 py-1.5 border-b border-white/8 mb-1">
                        <span className="text-[11px] text-white/40 font-medium truncate block">
                            {targetInfo.label}
                        </span>
                    </div>

                    <div className="px-1.5 space-y-0.5">
                        {/* Display style submenu */}
                        {targetInfo.isScore && (
                            <>
                                <MenuItem
                                    icon={BarChart3}
                                    label="Style d'affichage"
                                    hasSubmenu
                                    onClick={() => setSubMenu(subMenu === 'style' ? null : 'style')}
                                />
                                <AnimatePresence>
                                    {subMenu === 'style' && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden pl-4"
                                        >
                                            {DISPLAY_STYLES.map(ds => (
                                                <MenuItem
                                                    key={ds.id}
                                                    icon={typeof ds.icon === 'string' ? ds.icon : ds.icon}
                                                    label={ds.label}
                                                    onClick={() => applyAndClose('displayStyle', ds.id)}
                                                />
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="border-t border-white/6 my-1" />
                            </>
                        )}

                        {/* Font size submenu */}
                        <MenuItem
                            icon={Type}
                            label="Taille du texte"
                            hasSubmenu
                            onClick={() => setSubMenu(subMenu === 'size' ? null : 'size')}
                        />
                        <AnimatePresence>
                            {subMenu === 'size' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden pl-4"
                                >
                                    {FONT_SIZES.map(fs => (
                                        <MenuItem
                                            key={fs.id}
                                            icon={Ruler}
                                            label={fs.label}
                                            onClick={() => applyAndClose('fontSize', fs.id)}
                                        />
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Color accent */}
                        <MenuItem
                            icon={Palette}
                            label="Couleur d'accent"
                            hasSubmenu
                            onClick={() => setSubMenu(subMenu === 'color' ? null : 'color')}
                        />
                        <AnimatePresence>
                            {subMenu === 'color' && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="overflow-hidden pl-4"
                                >
                                    <div className="flex flex-wrap gap-1.5 py-2 px-1">
                                        {['#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444', '#8b5cf6', '#06b6d4'].map(c => (
                                            <button
                                                key={c}
                                                onClick={() => applyAndClose('accentColor', c)}
                                                className="w-6 h-6 rounded-full ring-1 ring-white/10 hover:ring-2 hover:ring-white/30 transition-all"
                                                style={{ background: c }}
                                            />
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="border-t border-white/6 my-1" />

                        {/* Visibility toggle */}
                        <MenuItem
                            icon={EyeOff}
                            label="Masquer cette section"
                            onClick={() => applyAndClose('visible', false)}
                        />
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
