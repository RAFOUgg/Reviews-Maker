import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrchardStore } from '../../../store/orchardStore';
import {
    Type, BarChart3, Gauge, Smile, Palette, Ruler, Hash, Eye, EyeOff,
    ChevronRight, Square, Circle, Columns, Rows, Maximize2, Minimize2,
    Bold, RotateCcw, Layers, Sliders, Paintbrush
} from 'lucide-react';

/**
 * OrchardContextMenu — Enhanced right-click context menu for preview elements.
 * Configures: display style, font size/weight, accent color, layout, padding,
 * border radius, opacity, background, columns, visibility.
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

const FONT_WEIGHTS = [
    { id: '300', label: 'Light' },
    { id: '400', label: 'Regular' },
    { id: '600', label: 'Semi Bold' },
    { id: '700', label: 'Bold' },
    { id: '800', label: 'Extra Bold' },
];

const BORDER_RADIUS_OPTS = [
    { id: '0', label: 'Aucun', px: 0 },
    { id: 'sm', label: 'Petit', px: 6 },
    { id: 'md', label: 'Moyen', px: 12 },
    { id: 'lg', label: 'Grand', px: 20 },
    { id: 'full', label: 'Pill', px: 999 },
];

const PADDING_OPTIONS = [
    { id: 'none', label: 'Aucun', value: '0' },
    { id: 'sm', label: 'Petit', value: '8px' },
    { id: 'md', label: 'Moyen', value: '12px' },
    { id: 'lg', label: 'Grand', value: '16px' },
    { id: 'xl', label: 'Très grand', value: '24px' },
];

const LAYOUT_OPTIONS = [
    { id: 'default', label: 'Par défaut', icon: Rows },
    { id: 'compact', label: 'Compact', icon: Minimize2 },
    { id: 'expanded', label: 'Expanded', icon: Maximize2 },
    { id: 'grid-2', label: '2 colonnes', icon: Columns },
    { id: 'grid-3', label: '3 colonnes', icon: Layers },
];

const BG_OPTIONS = [
    { id: 'none', label: 'Aucun', value: 'transparent' },
    { id: 'subtle', label: 'Subtil', value: 'rgba(255,255,255,0.04)' },
    { id: 'medium', label: 'Moyen', value: 'rgba(255,255,255,0.08)' },
    { id: 'accent', label: 'Accent', value: 'rgba(168,85,247,0.1)' },
    { id: 'dark', label: 'Sombre', value: 'rgba(0,0,0,0.3)' },
];

const ACCENT_COLORS = [
    '#a855f7', '#ec4899', '#f59e0b', '#10b981', '#3b82f6',
    '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
    '#e879f9', '#22d3ee',
];

const OPACITY_VALUES = [
    { id: '100', label: '100%', value: 1 },
    { id: '80', label: '80%', value: 0.8 },
    { id: '60', label: '60%', value: 0.6 },
    { id: '40', label: '40%', value: 0.4 },
    { id: '20', label: '20%', value: 0.2 },
];

export default function OrchardContextMenu() {
    const [menuPos, setMenuPos] = useState(null);
    const [targetInfo, setTargetInfo] = useState(null);
    const [subMenu, setSubMenu] = useState(null);
    const menuRef = useRef(null);

    const updateSectionStyle = useOrchardStore((s) => s.updateSectionStyle);
    const resetSectionStyle = useOrchardStore((s) => s.resetSectionStyle);
    const toggleContentModule = useOrchardStore((s) => s.toggleContentModule);
    const sectionStyles = useOrchardStore((s) => s.config?.sectionStyles || {});

    const closeMenu = useCallback(() => {
        setMenuPos(null);
        setTargetInfo(null);
        setSubMenu(null);
    }, []);

    useEffect(() => {
        const handleEscape = (e) => { if (e.key === 'Escape') closeMenu(); };
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

    useEffect(() => {
        const handler = (e) => {
            const sectionEl = e.target.closest('[data-orchard-section]');
            const scoreEl = e.target.closest('[data-orchard-score]');
            const moduleEl = sectionEl || scoreEl;
            if (!moduleEl) return;

            e.preventDefault();
            e.stopPropagation();

            const sectionKey = moduleEl.getAttribute('data-orchard-section') || moduleEl.getAttribute('data-orchard-score');
            const sectionLabel = moduleEl.getAttribute('data-orchard-label') || sectionKey;

            const x = Math.min(e.clientX, window.innerWidth - 280);
            const y = Math.min(e.clientY, window.innerHeight - 400);
            setMenuPos({ x, y });
            setTargetInfo({ key: sectionKey, label: sectionLabel, isScore: !!scoreEl });
            setSubMenu(null);
        };
        document.addEventListener('contextmenu', handler);
        return () => document.removeEventListener('contextmenu', handler);
    }, []);

    const applySectionStyle = useCallback((styleKey, value) => {
        if (!targetInfo) return;
        updateSectionStyle(targetInfo.key, { [styleKey]: value });
        closeMenu();
    }, [targetInfo, updateSectionStyle, closeMenu]);

    const handleToggleVisibility = useCallback(() => {
        if (!targetInfo) return;
        toggleContentModule(targetInfo.key);
        closeMenu();
    }, [targetInfo, toggleContentModule, closeMenu]);

    const handleResetStyles = useCallback(() => {
        if (!targetInfo) return;
        resetSectionStyle(targetInfo.key);
        closeMenu();
    }, [targetInfo, resetSectionStyle, closeMenu]);

    if (!menuPos || !targetInfo) return null;

    const currentStyle = sectionStyles[targetInfo.key] || {};

    const MenuItem = ({ icon: Icon, label, onClick, hasSubmenu, active, description }) => (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm rounded-lg transition-all ${active ? 'bg-purple-500/15 text-purple-300' : 'text-white/80 hover:bg-white/8 hover:text-white'}`}
        >
            {typeof Icon === 'string' ? (
                <span className="text-sm w-4 text-center">{Icon}</span>
            ) : Icon ? (
                <Icon size={15} className="text-white/50 flex-shrink-0" />
            ) : null}
            <div className="flex-1 min-w-0">
                <span className="block truncate">{label}</span>
                {description && <span className="block text-[10px] text-white/30 truncate">{description}</span>}
            </div>
            {hasSubmenu && <ChevronRight size={13} className="text-white/30" />}
        </button>
    );

    const SubMenuContainer = ({ id, children }) => (
        <AnimatePresence>
            {subMenu === id && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden pl-4"
                >
                    {children}
                </motion.div>
            )}
        </AnimatePresence>
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
                    className="w-64 rounded-2xl overflow-hidden py-1.5 max-h-[70vh] overflow-y-auto custom-scrollbar"
                    style={{
                        background: 'linear-gradient(135deg, rgba(25,25,55,0.97) 0%, rgba(18,18,40,0.99) 100%)',
                        backdropFilter: 'blur(40px) saturate(1.4)',
                        WebkitBackdropFilter: 'blur(40px) saturate(1.4)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
                    }}
                >
                    {/* Header */}
                    <div className="px-3 py-2 border-b border-white/8 mb-1">
                        <span className="text-[11px] text-white/40 font-medium truncate block">
                            ✏️ {targetInfo.label}
                        </span>
                        {Object.keys(currentStyle).length > 0 && (
                            <span className="text-[9px] text-purple-400/60 block mt-0.5">
                                {Object.keys(currentStyle).length} personnalisation(s)
                            </span>
                        )}
                    </div>

                    <div className="px-1.5 space-y-0.5">

                        {/* ── Display style (scores only) ── */}
                        {targetInfo.isScore && (
                            <>
                                <MenuItem icon={BarChart3} label="Style d'affichage" hasSubmenu
                                    onClick={() => setSubMenu(subMenu === 'style' ? null : 'style')}
                                    active={!!currentStyle.displayStyle} />
                                <SubMenuContainer id="style">
                                    {DISPLAY_STYLES.map(ds => (
                                        <MenuItem key={ds.id} icon={typeof ds.icon === 'string' ? ds.icon : ds.icon}
                                            label={ds.label} active={currentStyle.displayStyle === ds.id}
                                            onClick={() => applySectionStyle('displayStyle', ds.id)} />
                                    ))}
                                </SubMenuContainer>
                                <div className="border-t border-white/6 my-1" />
                            </>
                        )}

                        {/* ── Font size ── */}
                        <MenuItem icon={Type} label="Taille du texte" hasSubmenu
                            onClick={() => setSubMenu(subMenu === 'size' ? null : 'size')}
                            active={!!currentStyle.fontSize} />
                        <SubMenuContainer id="size">
                            {FONT_SIZES.map(fs => (
                                <MenuItem key={fs.id} icon={Ruler} label={`${fs.label} (${fs.px}px)`}
                                    active={currentStyle.fontSize === fs.id}
                                    onClick={() => applySectionStyle('fontSize', fs.id)} />
                            ))}
                        </SubMenuContainer>

                        {/* ── Font weight ── */}
                        <MenuItem icon={Bold} label="Graisse du texte" hasSubmenu
                            onClick={() => setSubMenu(subMenu === 'weight' ? null : 'weight')}
                            active={!!currentStyle.fontWeight} />
                        <SubMenuContainer id="weight">
                            {FONT_WEIGHTS.map(fw => (
                                <MenuItem key={fw.id} icon={Bold} label={fw.label}
                                    active={currentStyle.fontWeight === fw.id}
                                    onClick={() => applySectionStyle('fontWeight', fw.id)} />
                            ))}
                        </SubMenuContainer>

                        <div className="border-t border-white/6 my-1" />

                        {/* ── Accent color ── */}
                        <MenuItem icon={Palette} label="Couleur d'accent" hasSubmenu
                            onClick={() => setSubMenu(subMenu === 'color' ? null : 'color')}
                            active={!!currentStyle.accentColor} />
                        <SubMenuContainer id="color">
                            <div className="flex flex-wrap gap-1.5 py-2 px-1">
                                {ACCENT_COLORS.map(c => (
                                    <button key={c} onClick={() => applySectionStyle('accentColor', c)}
                                        className={`w-6 h-6 rounded-full transition-all ${currentStyle.accentColor === c ? 'ring-2 ring-white/50 scale-110' : 'ring-1 ring-white/10 hover:ring-2 hover:ring-white/30'}`}
                                        style={{ background: c }} />
                                ))}
                            </div>
                        </SubMenuContainer>

                        {/* ── Background ── */}
                        <MenuItem icon={Paintbrush} label="Fond de section" hasSubmenu
                            onClick={() => setSubMenu(subMenu === 'bg' ? null : 'bg')}
                            active={!!currentStyle.background} />
                        <SubMenuContainer id="bg">
                            {BG_OPTIONS.map(bg => (
                                <MenuItem key={bg.id} icon={Square} label={bg.label}
                                    active={currentStyle.background === bg.value}
                                    onClick={() => applySectionStyle('background', bg.value)} />
                            ))}
                        </SubMenuContainer>

                        <div className="border-t border-white/6 my-1" />

                        {/* ── Border radius ── */}
                        <MenuItem icon={Square} label="Coins arrondis" hasSubmenu
                            onClick={() => setSubMenu(subMenu === 'radius' ? null : 'radius')}
                            active={currentStyle.borderRadius !== undefined} />
                        <SubMenuContainer id="radius">
                            {BORDER_RADIUS_OPTS.map(br => (
                                <MenuItem key={br.id} icon={br.px >= 999 ? Circle : Square} label={br.label}
                                    active={currentStyle.borderRadius === br.px}
                                    onClick={() => applySectionStyle('borderRadius', br.px)} />
                            ))}
                        </SubMenuContainer>

                        {/* ── Padding ── */}
                        <MenuItem icon={Maximize2} label="Espacement interne" hasSubmenu
                            onClick={() => setSubMenu(subMenu === 'padding' ? null : 'padding')}
                            active={!!currentStyle.padding} />
                        <SubMenuContainer id="padding">
                            {PADDING_OPTIONS.map(p => (
                                <MenuItem key={p.id} icon={Maximize2} label={p.label}
                                    active={currentStyle.padding === p.value}
                                    onClick={() => applySectionStyle('padding', p.value)} />
                            ))}
                        </SubMenuContainer>

                        {/* ── Layout ── */}
                        <MenuItem icon={Columns} label="Disposition" hasSubmenu
                            onClick={() => setSubMenu(subMenu === 'layout' ? null : 'layout')}
                            active={!!currentStyle.layout} />
                        <SubMenuContainer id="layout">
                            {LAYOUT_OPTIONS.map(lo => (
                                <MenuItem key={lo.id} icon={lo.icon} label={lo.label}
                                    active={currentStyle.layout === lo.id}
                                    onClick={() => applySectionStyle('layout', lo.id)} />
                            ))}
                        </SubMenuContainer>

                        {/* ── Opacity ── */}
                        <MenuItem icon={Sliders} label="Opacité" hasSubmenu
                            onClick={() => setSubMenu(subMenu === 'opacity' ? null : 'opacity')}
                            active={currentStyle.opacity !== undefined} />
                        <SubMenuContainer id="opacity">
                            {OPACITY_VALUES.map(op => (
                                <MenuItem key={op.id} icon={Sliders} label={op.label}
                                    active={currentStyle.opacity === op.value}
                                    onClick={() => applySectionStyle('opacity', op.value)} />
                            ))}
                        </SubMenuContainer>

                        <div className="border-t border-white/6 my-1" />

                        {/* ── Visibility ── */}
                        <MenuItem icon={EyeOff} label="Masquer cette section" onClick={handleToggleVisibility} />

                        {/* ── Reset ── */}
                        {Object.keys(currentStyle).length > 0 && (
                            <MenuItem icon={RotateCcw} label="Réinitialiser les styles"
                                description="Supprimer toutes les personnalisations"
                                onClick={handleResetStyles} />
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
