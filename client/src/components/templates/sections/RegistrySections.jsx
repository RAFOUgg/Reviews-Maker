import PropTypes from 'prop-types';
import { getFieldsByGroup, GROUP_LABELS } from '../../../utils/fieldRegistry';
import { CANNABINOIDS } from '../../../data/cannabinoids';
import { formatDate } from '../../../utils/orchardHelpers';

/**
 * RegistrySections — rend le "gisement" de données piloté par fieldRegistry, pour n'importe
 * quel type de produit. Complète les sections riches câblées à la main dans les templates
 * (cannabinoïdes majeurs, notes par catégorie, terpènes, pipelines, phénohunt, chaîne) en
 * couvrant automatiquement culture / récolte / usage / labo / séparation / extraction /
 * purification / recette — c.-à-d. tous les champs saisis mais jamais rendus jusqu'ici.
 *
 * Modèle "opt-out" : un module est affiché tant que contentModules[key] !== false. Ainsi une
 * présentation complète par défaut, l'utilisateur pouvant masquer via le panneau Contenu.
 */

export function isModuleOn(contentModules, key) {
    return !contentModules || contentModules[key] !== false;
}

function pickValue(reviewData, sources) {
    for (const s of sources) {
        const v = reviewData?.[s];
        if (v !== undefined && v !== null && v !== '') return v;
    }
    return undefined;
}

function isFilled(v) {
    if (v === undefined || v === null || v === '') return false;
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === 'object') return Object.keys(v).length > 0;
    return true;
}

// ── Grille cannabinoïdes complète (majeurs + acides + mineurs) via le référentiel ──────
const CANNABINOID_BY_ID = Object.fromEntries(CANNABINOIDS.map((c) => [c.id, c]));

export function getCannabinoidItems(reviewData, contentModules) {
    const fields = getFieldsByGroup('analytics', reviewData?.type)
        .filter((f) => f.ref && CANNABINOID_BY_ID[f.ref]); // uniquement les cannabinoïdes
    return fields
        .filter((f) => isModuleOn(contentModules, f.key))
        .map((f) => {
            const v = pickValue(reviewData, f.sources);
            if (!isFilled(v)) return null;
            const num = Number(v);
            if (!Number.isFinite(num)) return null;
            const ref = CANNABINOID_BY_ID[f.ref];
            return { key: f.key, label: ref.shortLabel, value: num, unit: f.unit || '%', color: ref.color };
        })
        .filter(Boolean);
}

export function CannabinoidGrid({ reviewData, contentModules, colors, fontSize, spacing }) {
    const items = getCannabinoidItems(reviewData, contentModules);
    if (items.length === 0) return null;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(72px, 1fr))`, gap: `${spacing.gap}px`, marginBottom: `${spacing.element}px` }}>
            {items.map((it) => (
                <div key={it.key} style={{
                    background: `linear-gradient(135deg, ${it.color}22, ${it.color}0d)`,
                    border: `1px solid ${it.color}55`,
                    borderRadius: '10px',
                    padding: `${spacing.gap}px`,
                    textAlign: 'center',
                }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, fontWeight: 600 }}>{it.label}</div>
                    <div style={{ fontSize: `${fontSize.text + 2}px`, color: it.color, fontWeight: 800 }}>{it.value}{it.unit}</div>
                </div>
            ))}
        </div>
    );
}

// ── Rendu d'une valeur selon son type de registre ──────────────────────────────────────
function renderFieldValue(field, value, { colors, fontSize, spacing }) {
    const t = field.type;
    if (t === 'list') {
        const arr = Array.isArray(value) ? value : [value];
        return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: `${Math.max(3, spacing.gap - 2)}px` }}>
                {arr.map((item, i) => {
                    const label = typeof item === 'object' ? (item.name || item.label || item.nom || JSON.stringify(item)) : String(item);
                    return (
                        <span key={i} style={{
                            fontSize: `${fontSize.small}px`,
                            padding: '2px 8px',
                            borderRadius: '999px',
                            background: `${colors.accent}1f`,
                            color: colors.textPrimary,
                            border: `1px solid ${colors.accent}33`,
                        }}>{label}</span>
                    );
                })}
            </div>
        );
    }
    if (t === 'bool') {
        return <span style={{ fontSize: `${fontSize.text}px`, color: colors.textPrimary, fontWeight: 600 }}>{value ? 'Oui' : 'Non'}</span>;
    }
    if (t === 'date') {
        return <span style={{ fontSize: `${fontSize.text}px`, color: colors.textPrimary }}>{formatDate(value)}</span>;
    }
    if (t === 'url') {
        return <span style={{ fontSize: `${fontSize.small}px`, color: colors.accent }}>Document disponible</span>;
    }
    // number | percent | text
    const suffix = field.unit ? ` ${field.unit}` : '';
    return <span style={{ fontSize: `${fontSize.text}px`, color: colors.textPrimary, fontWeight: 600 }}>{String(value)}{suffix}</span>;
}

// ── Rendu spécial recette (ingrédients + étapes) ────────────────────────────────────────
function RecipeBlock({ reviewData, fontSize, colors, spacing }) {
    const ingredients = reviewData.ingredients;
    const etapes = reviewData.etapesPreparation;
    const ing = Array.isArray(ingredients) ? ingredients : [];
    const steps = Array.isArray(etapes) ? etapes : [];
    if (ing.length === 0 && steps.length === 0) return null;
    return (
        <div style={{ marginBottom: `${spacing.element}px` }}>
            {ing.length > 0 && (
                <div style={{ marginBottom: `${spacing.gap}px` }}>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, fontWeight: 700, marginBottom: 4 }}>Ingrédients</div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                        {ing.map((it, i) => (
                            <li key={i} style={{ fontSize: `${fontSize.text}px`, color: colors.textPrimary }}>
                                {it.nom || it.name || 'Ingrédient'}{(it.quantite || it.quantity) ? ` — ${it.quantite || it.quantity}${it.unite || it.unit || ''}` : ''}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {steps.length > 0 && (
                <div>
                    <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, fontWeight: 700, marginBottom: 4 }}>Préparation</div>
                    <ol style={{ margin: 0, paddingLeft: 16 }}>
                        {steps.map((st, i) => (
                            <li key={i} style={{ fontSize: `${fontSize.text}px`, color: colors.textPrimary }}>
                                {st.action || st.description || st.nom || `Étape ${i + 1}`}{st.duree ? ` (${st.duree})` : ''}
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
}

/**
 * Rend les groupes "gisement" du registre présents dans reviewData.
 * @param {string[]} groups - groupes du registre à couvrir
 * @param {Function} Section - composant Section du template hôte (titre + enfants)
 */
export function GisementSections({ reviewData, contentModules, groups, Section, colors, fontSize, spacing, groupIcons = {} }) {
    if (!reviewData) return null;
    return groups.map((group) => {
        // Recette : rendu dédié
        if (group === 'recipe') {
            const on = isModuleOn(contentModules, 'ingredients') || isModuleOn(contentModules, 'etapesPreparation');
            const hasRecipe = (Array.isArray(reviewData.ingredients) && reviewData.ingredients.length) || (Array.isArray(reviewData.etapesPreparation) && reviewData.etapesPreparation.length);
            if (!on || !hasRecipe) return null;
            return (
                <Section key={group} title={GROUP_LABELS[group]} icon={groupIcons[group] || '🍯'}>
                    <RecipeBlock reviewData={reviewData} fontSize={fontSize} colors={colors} spacing={spacing} />
                </Section>
            );
        }

        const fields = getFieldsByGroup(group, reviewData.type)
            .filter((f) => f.type !== 'score') // les scores vont dans les notes par catégorie
            .filter((f) => f.ref == null || group !== 'analytics') // cannabinoïdes gérés par CannabinoidGrid
            .filter((f) => isModuleOn(contentModules, f.key));

        const rows = fields
            .map((f) => ({ field: f, value: pickValue(reviewData, f.sources) }))
            .filter((r) => isFilled(r.value));

        if (rows.length === 0) return null;

        return (
            <Section key={group} title={GROUP_LABELS[group]} icon={groupIcons[group] || '📊'}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: `${spacing.gap}px` }}>
                    {rows.map(({ field, value }) => (
                        <div key={field.key} style={{
                            background: `${colors.accent}0f`,
                            border: `1px solid ${colors.accent}22`,
                            borderRadius: '8px',
                            padding: `${spacing.gap}px`,
                        }}>
                            <div style={{ fontSize: `${fontSize.small}px`, color: colors.textSecondary, fontWeight: 600, marginBottom: 2 }}>{field.label}</div>
                            {renderFieldValue(field, value, { colors, fontSize, spacing })}
                        </div>
                    ))}
                </div>
            </Section>
        );
    });
}

CannabinoidGrid.propTypes = {
    reviewData: PropTypes.object,
    contentModules: PropTypes.object,
    colors: PropTypes.object.isRequired,
    fontSize: PropTypes.object.isRequired,
    spacing: PropTypes.object.isRequired,
};

GisementSections.propTypes = {
    reviewData: PropTypes.object,
    contentModules: PropTypes.object,
    groups: PropTypes.arrayOf(PropTypes.string).isRequired,
    Section: PropTypes.elementType.isRequired,
    colors: PropTypes.object.isRequired,
    fontSize: PropTypes.object.isRequired,
    spacing: PropTypes.object.isRequired,
    groupIcons: PropTypes.object,
};

export default GisementSections;
