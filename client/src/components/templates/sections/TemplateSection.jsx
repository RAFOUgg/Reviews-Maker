import React from 'react';
import PropTypes from 'prop-types';
import { colorWithOpacity } from '../../../utils/exportMakerHelpers';

// Se masque si `children` n'a réellement rien à montrer — couvre les deux formes rencontrées dans
// les templates d'origine : un tableau d'expressions conditionnelles toutes fausses
// (`[cond1 && <X/>, cond2 && <Y/>]`), ou zéro enfant du tout.
function isEmpty(children) {
    if (!children) return true;
    if (Array.isArray(children)) return children.every((c) => !c);
    return React.Children.count(children) === 0;
}

/**
 * Titre de section réutilisable (icône + libellé + bordure accent + masquage auto si vide) —
 * extrait le 2026-07-29 de `DetailedCardTemplate.jsx` (qui le définissait en local) pour être
 * partagé avec `TraceabilityReportTemplate.jsx`, qui en dupliquait une copie quasi identique.
 * Les props `fontWeight`/`borderWidth`/`borderOpacity`/`gap` gardent le rendu de chaque appelant
 * identique à l'existant (pas de changement visuel, juste une dé-duplication).
 */
export default function TemplateSection({
    title, icon, children, className = '',
    fontSize, spacing, colors,
    fontWeight = 600, borderWidth = 2, borderOpacity = 30, gap,
}) {
    if (isEmpty(children)) return null;
    return (
        <div style={{ marginBottom: `${spacing.section}px` }} className={className}>
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
    colors: PropTypes.object.isRequired,
    fontWeight: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    borderWidth: PropTypes.number,
    borderOpacity: PropTypes.number,
    gap: PropTypes.number,
};
