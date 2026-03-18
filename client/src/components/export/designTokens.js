/**
 * Design Tokens pour ExportMaker
 * Système centralisé de couleurs, typographie et spacing
 *
 * @version 1.0.0
 * @author Claude Code Audit
 */

// ═══════════════════════════════════════════════════════════════
// COULEURS — PALETTE SÉMANTIQUE
// ═══════════════════════════════════════════════════════════════

export const CANNABINOID_COLORS = {
    thc: {
        base: '#EF4444',
        light: '#F87171',
        bg: 'rgba(239, 68, 68, 0.10)',
        border: 'rgba(239, 68, 68, 0.20)',
    },
    cbd: {
        base: '#10B6D1',
        light: '#34D399',
        bg: 'rgba(16, 185, 129, 0.10)',
        border: 'rgba(16, 185, 129, 0.20)',
    },
    cbg: {
        base: '#FBBF24',
        light: '#FCD34D',
        bg: 'rgba(251, 191, 36, 0.10)',
        border: 'rgba(251, 191, 36, 0.20)',
    },
    cbc: {
        base: '#34D399',
        light: '#6EE7B7',
        bg: 'rgba(52, 211, 153, 0.10)',
        border: 'rgba(52, 211, 153, 0.20)',
    },
    thcv: {
        base: '#A78BFA',
        light: '#C4B5FD',
        bg: 'rgba(167, 139, 250, 0.10)',
        border: 'rgba(167, 139, 250, 0.20)',
    },
    cbn: {
        base: '#F472B6',
        light: '#F9A8D4',
        bg: 'rgba(244, 114, 182, 0.10)',
        border: 'rgba(244, 114, 182, 0.20)',
    },
}

export const CATEGORY_COLORS = {
    visual: {
        primary: '#A78BFA',
        shades: ['#F472B6', '#8B5CF6', '#A78BFA', '#C084FC', '#E879F9'],
    },
    odor: {
        primary: '#22C55E',
        shades: ['#22C55E', '#4ADE80', '#86EFAC'],
    },
    taste: {
        primary: '#F59E0B',
        shades: ['#F59E0B', '#FB923C'],
    },
    effects: {
        primary: '#06B6D4',
        shades: ['#06B6D4', '#34D399'],
    },
    texture: {
        primary: '#FB7185',
        shades: ['#FB7185', '#F43F5E', '#FDA4AF', '#FB923C', '#FBBF24'],
    },
}

export const ACCENT_COLORS = {
    primary: '#A78BFA',      // Violet — accent principal
    indica: '#8B5CF6',       // Violet foncé
    sativa: '#22C55E',       // Vert
    hybrid: '#F59E0B',       // Orange
    varietyType: {
        bg: 'rgba(139, 92, 246, 0.12)',
        color: '#A78BFA',
        border: 'rgba(139, 92, 246, 0.25)',
    },
}

// Opacités standardisées (design tokens alpha)
export const ALPHA = {
    subtle: 0.06,      // Backgrounds très discrets
    muted: 0.12,       // Pills, badges backgrounds
    soft: 0.20,        // Borders légers
    medium: 0.35,      // Texte tertiaire (⚠️ limite accessibilité)
    readable: 0.50,    // Texte secondaire (minimum WCAG AA)
    strong: 0.70,      // Texte lisible
    opaque: 0.90,      // Quasi-opaque
}

// Couleurs texte/UI génériques
export const UI_COLORS = {
    text: {
        primary: '#ffffff',
        secondary: `rgba(255, 255, 255, ${ALPHA.strong})`,      // 0.70
        tertiary: `rgba(255, 255, 255, ${ALPHA.readable})`,     // 0.50
        muted: `rgba(255, 255, 255, ${ALPHA.medium})`,          // 0.35
        hint: `rgba(255, 255, 255, ${ALPHA.soft})`,             // 0.20
    },
    bg: {
        overlay: `rgba(0, 0, 0, ${ALPHA.opaque})`,              // 0.90
        card: `rgba(255, 255, 255, ${ALPHA.subtle})`,           // 0.06
        hover: `rgba(255, 255, 255, ${ALPHA.muted})`,           // 0.12
        subtle: `rgba(0, 0, 0, ${ALPHA.soft})`,                 // 0.20
        dark: 'rgba(0, 0, 0, 0.65)',
    },
    border: {
        subtle: `rgba(255, 255, 255, ${ALPHA.subtle})`,         // 0.06
        light: `rgba(255, 255, 255, ${ALPHA.muted})`,           // 0.12
        medium: `rgba(255, 255, 255, ${ALPHA.soft})`,           // 0.20
    },
}

// ═══════════════════════════════════════════════════════════════
// TYPOGRAPHIE — ÉCHELLE & STYLES
// ═══════════════════════════════════════════════════════════════

export const FONT_SIZES = {
    h1: {
        portrait: 22,
        base: 24,
        landscape: 26,
    },
    h2: 18,
    h3: 14,
    body: 13,
    small: 10,
    tiny: 9,
    micro: 8,
}

export const FONT_WEIGHTS = {
    black: 900,       // Titres H1
    extraBold: 800,   // Scores numériques
    bold: 700,        // Pills, badges, labels importants
    semiBold: 600,    // Labels standards, metadata
    medium: 500,      // Rarement utilisé
    regular: 400,     // Paragraphes (non utilisé actuellement)
}

export const LINE_HEIGHTS = {
    tight: 1,         // Scores compacts
    snug: 1.1,        // Titres
    normal: 1.5,      // Body text
    relaxed: 1.75,    // Paragraphes longs
}

export const LETTER_SPACING = {
    tight: '0.02em',      // Pills, terpenes
    normal: '0.05em',     // Categories
    wide: '0.08em',       // Footer
    wider: '0.1em',       // Type labels
    widest: '0.15em',     // BrandMark, all-caps emphasis
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS — STYLES TYPOGRAPHIQUES
// ═══════════════════════════════════════════════════════════════

export function getTypographyStyle(level, options = {}) {
    const { isPortrait, isLandscape, isA4, scaleFont = 1 } = options
    const fs = isA4 ? 1.15 * scaleFont : scaleFont

    const styles = {
        h1: {
            fontSize: `${FONT_SIZES.h1[isPortrait ? 'portrait' : isLandscape ? 'landscape' : 'base'] * fs}px`,
            fontWeight: FONT_WEIGHTS.black,
            color: UI_COLORS.text.primary,
            lineHeight: LINE_HEIGHTS.snug,
            margin: 0,
        },
        h2: {
            fontSize: `${FONT_SIZES.h2 * fs}px`,
            fontWeight: FONT_WEIGHTS.bold,
            color: UI_COLORS.text.primary,
            lineHeight: LINE_HEIGHTS.snug,
        },
        body: {
            fontSize: `${FONT_SIZES.body * fs}px`,
            fontWeight: FONT_WEIGHTS.semiBold,
            color: UI_COLORS.text.secondary,
            lineHeight: LINE_HEIGHTS.normal,
        },
        small: {
            fontSize: `${FONT_SIZES.small * fs}px`,
            fontWeight: FONT_WEIGHTS.semiBold,
            color: UI_COLORS.text.muted,
            letterSpacing: LETTER_SPACING.wider,
            textTransform: 'uppercase',
        },
        tiny: {
            fontSize: `${FONT_SIZES.tiny * fs}px`,
            fontWeight: FONT_WEIGHTS.semiBold,
            color: UI_COLORS.text.tertiary,
        },
        pill: {
            fontSize: `${FONT_SIZES.tiny * fs}px`,
            fontWeight: FONT_WEIGHTS.semiBold,
            letterSpacing: LETTER_SPACING.tight,
            padding: '2px 8px',
            borderRadius: '20px',
        },
    }

    return styles[level] || styles.body
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS — PILLS/BADGES
// ═══════════════════════════════════════════════════════════════

export function getCannabinoidPillStyle(type, scaleFont = 1) {
    const colors = CANNABINOID_COLORS[type.toLowerCase()] || CANNABINOID_COLORS.thc
    return {
        padding: '2px 8px',
        borderRadius: '20px',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        fontSize: `${9 * scaleFont}px`,
        fontWeight: FONT_WEIGHTS.semiBold,
        color: colors.light,
        letterSpacing: LETTER_SPACING.tight,
    }
}

export function getVarietyTypePillStyle(scaleFont = 1) {
    return {
        padding: '2px 8px',
        borderRadius: '20px',
        background: ACCENT_COLORS.varietyType.bg,
        border: `1px solid ${ACCENT_COLORS.varietyType.border}`,
        fontSize: `${9 * scaleFont}px`,
        fontWeight: FONT_WEIGHTS.semiBold,
        color: ACCENT_COLORS.varietyType.color,
        letterSpacing: LETTER_SPACING.tight,
    }
}

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS — BACKGROUNDS & BORDERS
// ═══════════════════════════════════════════════════════════════

export function getCardStyle() {
    return {
        background: UI_COLORS.bg.card,
        border: `1px solid ${UI_COLORS.border.subtle}`,
        borderRadius: '12px',
        padding: '8px',
    }
}

export function getScoreContainerStyle(accent) {
    return {
        background: UI_COLORS.bg.dark,
        borderRadius: '12px',
        padding: '6px 10px',
        border: `1px solid ${accent || ACCENT_COLORS.varietyType.border}`,
    }
}