/**
 * GeneticsCanvasToolbar Component
 *
 * Barre d'outils du canevas PhenoHunt — pendant exact de ChainCanvasToolbar.jsx pour la Chaîne de
 * production, dont elle reprend la structure (bloc d'actions en haut à gauche, bloc
 * recherche + filtres en haut au centre), les classes CSS (`canvas-toolbar`, `chain-filter-*`,
 * partagées dans graphCanvas.css) et le comportement de navigation entre résultats.
 *
 * L'arbre généalogique n'avait jusqu'ici qu'un seul bouton (« Photo/Vidéo ») : aucun moyen de
 * retrouver un individu dans un arbre dense, de recadrer la vue, ni de filtrer sur quoi que ce
 * soit — alors que la Chaîne de production offrait tout cela sur des graphes comparables.
 *
 * Les AXES de filtre sont, eux, propres au domaine et jamais devinés :
 *   - le sexe (`genetics.sex`) reprend valeurs et libellés du select de NodeFormModal.jsx, déjà la
 *     source de la forme du nœud (rond/carré/losange, cf. CultivarNode.jsx) ;
 *   - les attributs (médias attachés, fiche technique liée) sont les deux rattachements réels d'un
 *     GenNode, ceux-là mêmes que signalent déjà les badges du nœud.
 */

import React from 'react';
import { Panel } from 'reactflow';
import { Download, RotateCcw, FileImage, Image as ImageIcon, Search, ChevronUp, ChevronDown, X } from 'lucide-react';

// Mêmes valeurs que le select « Sexe » de NodeFormModal.jsx (clé historique `sex`, documentée
// comme non renommable dans phenoNodeFields.js). Libellés raccourcis pour tenir en pastille.
export const SEX_FILTER_OPTIONS = [
    { value: 'female', label: '♀ Femelles' },
    { value: 'male', label: '♂ Mâles' },
    { value: 'unknown', label: '❓ Non sexés' }
];

function chipClass(active) {
    return `px-2 py-1 rounded-lg text-[11px] transition-colors ${
        active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/50 hover:bg-white/10'
    }`;
}

export default function GeneticsCanvasToolbar({
    readOnly,
    onFitView,
    onExportJSON,
    onExportSVG,
    exportingSvg,
    onShowMediaBubbleImport,
    sexFilter,
    onToggleSex,
    attributeFilter,
    onToggleAttribute,
    searchTerm,
    onSearchChange,
    matchCount,
    activeMatchIndex,
    onNextMatch,
    onPrevMatch,
}) {
    // Même règle que ChainCanvasToolbar : en lecture seule (fiche exportée, page publique, aperçu
    // du Studio), ni outils ni recherche — une barre de recherche figée dans un PNG n'a aucun sens.
    if (readOnly) return null;

    return (
        <>
            <Panel position="top-left" className="canvas-toolbar">
                <div className="flex items-center gap-2">
                    <button className="toolbar-btn secondary" onClick={onFitView} title="Recadrer sur tout l'arbre">
                        <RotateCcw size={14} /> Zoom
                    </button>
                    <button className="toolbar-btn secondary" onClick={onExportJSON} title="Exporter l'arbre en JSON">
                        <Download size={14} /> JSON
                    </button>
                    <button className="toolbar-btn secondary" onClick={onExportSVG} disabled={exportingSvg} title="Exporter l'arbre en SVG">
                        <FileImage size={14} /> {exportingSvg ? 'Export...' : 'SVG'}
                    </button>
                    <button
                        className="toolbar-btn secondary"
                        onClick={onShowMediaBubbleImport}
                        title="Importer une photo/vidéo comme bulle sur l'arbre"
                    >
                        <ImageIcon size={14} /> Photo/Vidéo
                    </button>
                </div>
            </Panel>

            <Panel position="top-center" className="chain-filter-bar">
                <div className="chain-filter-search">
                    <Search size={13} />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Rechercher un cultivar, un breeder, une relation..."
                    />
                    {searchTerm && (
                        <>
                            {matchCount > 0 && (
                                <span className="chain-filter-search-count">
                                    {activeMatchIndex + 1}/{matchCount}
                                </span>
                            )}
                            {matchCount > 1 && (
                                <>
                                    <button type="button" onClick={onPrevMatch} title="Résultat précédent">
                                        <ChevronUp size={13} />
                                    </button>
                                    <button type="button" onClick={onNextMatch} title="Résultat suivant">
                                        <ChevronDown size={13} />
                                    </button>
                                </>
                            )}
                            <button type="button" onClick={() => onSearchChange('')} title="Effacer la recherche">
                                <X size={13} />
                            </button>
                        </>
                    )}
                </div>

                <div className="chain-filter-chips">
                    {SEX_FILTER_OPTIONS.map(option => (
                        <button
                            key={option.value}
                            type="button"
                            onClick={() => onToggleSex(option.value)}
                            className={chipClass(sexFilter.has(option.value))}
                            title={`Afficher/masquer les individus « ${option.label} »`}
                        >
                            {option.label}
                        </button>
                    ))}
                    <span className="chain-filter-sep" />
                    <button
                        type="button"
                        onClick={() => onToggleAttribute('hasMedia')}
                        className={chipClass(attributeFilter.hasMedia)}
                        title="N'afficher que les individus/liaisons avec des médias attachés"
                    >
                        Avec médias
                    </button>
                    <button
                        type="button"
                        onClick={() => onToggleAttribute('hasReview')}
                        className={chipClass(attributeFilter.hasReview)}
                        title="N'afficher que les individus liés à une fiche technique"
                    >
                        Avec fiche
                    </button>
                </div>
            </Panel>
        </>
    );
}
