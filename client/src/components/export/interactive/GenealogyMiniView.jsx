import { useEffect, useState } from 'react';
import GenealogyTree2DInteractive from '../../shared/orchard/GenealogyTree2DInteractive';
import { safeParse } from '../../../utils/orchardHelpers';

/**
 * GenealogyMiniView - Vue interactive lecture seule de l'arbre généalogique (PhenoHunt)
 * lié à une review Fleur, pour affichage dans Export Maker (Fiche Détaillée) et la galerie.
 *
 * Ne fait rien de plus que charger le GeneticTree correspondant et le passer à
 * GenealogyTree2DInteractive, déjà conçu pour l'embedding en lecture seule
 * (pur HTML/SVG, pas de React Flow) — pas de nouvelle logique de rendu ici.
 */
export default function GenealogyMiniView({ reviewData, compact = true, sectionFontSize = 16, accentColor, titleColor }) {
    const treeId = reviewData?.geneticTreeId || reviewData?.flowerData?.geneticTreeId;
    const [tree, setTree] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!treeId) { setTree(null); return; }
        let cancelled = false;
        setLoading(true);
        fetch(`/api/genetics/trees/${treeId}`, { credentials: 'include' })
            .then(res => (res.ok ? res.json() : null))
            .then(data => { if (!cancelled) setTree(data); })
            .catch(() => { if (!cancelled) setTree(null); })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [treeId]);

    if (!treeId || loading) return null;
    if (!tree || !Array.isArray(tree.nodes) || tree.nodes.length === 0) return null;

    // node.genetics vient de l'API sous forme de chaîne JSON brute (colonne Prisma String?)
    const parsedNodes = tree.nodes.map(n => ({ ...n, genetics: safeParse(n.genetics, {}) }));

    return (
        <div>
            <h3 style={{
                fontSize: `${sectionFontSize}px`, fontWeight: 600, color: titleColor,
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6,
                borderBottom: `2px solid ${accentColor}33`, paddingBottom: 6,
            }}>
                <span>🧬</span> Généalogie (PhenoHunt)
            </h3>
            <GenealogyTree2DInteractive
                nodes={parsedNodes}
                edges={tree.edges || []}
                compact={compact}
                title={tree.name || 'Arbre Généalogique'}
            />
        </div>
    );
}
