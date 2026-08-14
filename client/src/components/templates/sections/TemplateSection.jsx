import React from 'react';
import PropTypes from 'prop-types';
import { colorWithOpacity, getGlassTokens } from '../../../utils/exportMakerHelpers';

/**
 * `children` n'a-t-il réellement rien à montrer ? Couvre les deux formes rencontrées dans les
 * templates : un tableau d'expressions conditionnelles toutes fausses (`[cond1 && <X/>, …]`), ou
 * zéro enfant du tout.
 *
 * PORTÉE, ET SA LIMITE : ce test ne voit que les enfants DÉCLARÉS. Un enfant qui est un composant
 * décidant lui-même de ne rien rendre (`return null`) compte ici comme présent — React ne permet
 * pas de le savoir sans le rendre. Pour ces cas-là, le titre doit être passé AU composant (qui le
 * rend après son propre garde-fou) ou la condition d'affichage doit venir d'un prédicat exporté par
 * lui ; c'est le principe « le titre suit l'élément » appliqué le 2026-08-14.
 *
 * Exporté pour que `DetailedCardTemplate` s'en serve au lieu d'en écrire une 2e copie.
 */
export function isEmptyChildren(children) {
    if (!children) return true;
    if (Array.isArray(children)) return children.every((c) => !c);
    return React.Children.count(children) === 0;
}

/**
 * Carte de section réutilisable (verre LiquidUI + icône + libellé + bordure accent + masquage
 * auto si vide) — extrait le 2026-07-29 de `DetailedCardTemplate.jsx` (qui le définissait en
 * local) pour être partagé avec `TraceabilityReportTemplate.jsx`, qui en dupliquait une copie
 * quasi identique ; converti en carte de verre le même jour (pilote refonte glassmorphism).
 * Les props `fontWeight`/`borderWidth`/`borderOpacity`/`gap` gardent le rendu du titre de chaque
 * appelant identique à l'existant.
 */
export default function TemplateSection({
    title, icon, children, className = '',
    fontSize, spacing, padding, colors,
    fontWeight = 600, borderWidth = 2, borderOpacity = 30, gap,
}) {
    if (isEmptyChildren(children)) return null;
    const glass = getGlassTokens(colors);
    const cardPadding = padding?.card ?? spacing.element;
    // Padding vertical volontairement plus serré que l'horizontal : les pages auto-paginées
    // (`shouldAutoLockPagination`) calculent leur budget de hauteur sur le contenu SANS cette
    // carte de verre — un padding symétrique généreux ajouté à chaque section (potentiellement
    // 5-6 par page) suffit à faire déborder une page 16:9 déjà dense. Un padding vertical minimal
    // garde l'effet carte sans réintroduire de débordement (cf. bug justify-center déjà documenté
    // dans CLAUDE.md pour ce même template).
    return (
        <div
            className={className}
            style={{
                marginBottom: `${spacing.section}px`,
                background: glass.background,
                border: `1px solid ${glass.border}`,
                borderRadius: 24,
                padding: `${cardPadding}px ${cardPadding * 1.5}px`,
                backdropFilter: 'blur(24px) saturate(150%)',
                WebkitBackdropFilter: 'blur(24px) saturate(150%)',
                boxShadow: [
                    `0 4px 24px -4px ${glass.shadow}`,
                    `0 12px 48px -12px ${glass.shadow}`,
                    `inset 0 1px 1px ${glass.borderHighlight}`,
                    'inset 0 -1px 1px rgba(0,0,0,0.15)',
                    `0 0 48px -20px ${colorWithOpacity(colors.accent, 35)}`,
                ].join(', '),
            }}
        >
            <h3
                style={{
                    fontSize: `${fontSize.section}px`,
                    fontWeight,
                    color: colors.title,
                    marginBottom: `${spacing.element}px`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: gap ?? spacing.gap,
                    borderBottom: `${borderWidth}px solid ${colorWithOpacity(colors.accent, borderOpacity)}`,
                    paddingBottom: `${spacing.gap}px`,
                }}
            >
                {icon && <span>{icon}</span>}
                {title}
            </h3>
            {children}
        </div>
    );
}

TemplateSection.propTypes = {
    title: PropTypes.node,
    icon: PropTypes.node,
    children: PropTypes.node,
    className: PropTypes.string,
    fontSize: PropTypes.object.isRequired,
    spacing: PropTypes.object.isRequired,
    padding: PropTypes.object,
    colors: PropTypes.object.isRequired,
    fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    borderWidth: PropTypes.number,
    borderOpacity: PropTypes.number,
    gap: PropTypes.number,
};
