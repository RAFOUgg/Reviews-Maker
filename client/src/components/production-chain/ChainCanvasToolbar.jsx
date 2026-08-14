/**
 * ChainCanvasToolbar Component
 *
 * Barre d'outils du canevas Chaîne de Production — regroupe les actions déjà existantes
 * (Renommer/Zoom/Importer traçabilité/JSON/SVG/Photo-Vidéo, précédemment inline dans
 * ProductionChainCanvas.jsx) et les nouveaux contrôles de lisibilité à grande échelle :
 * recherche (nœud par label, liaison par technique) et filtres d'affichage (type de produit,
 * présence de médias/cellules). Extrait dans son propre fichier car ProductionChainCanvas.jsx
 * dépassait déjà 1100 lignes — cohérent avec la décomposition déjà en place dans ce dossier.
 */

import React, { useState } from 'react';
import { Panel } from 'reactflow';
import { Download, Upload, RotateCcw, FileImage, Edit2, Image as ImageIcon, Search, ChevronUp, ChevronDown, X, MoreHorizontal, SlidersHorizontal } from 'lucide-react';
import { TYPE_META, ALL_REVIEW_TYPES } from '../../utils/reviewTypeMeta';
import useResponsiveLayout from '../../hooks/useResponsiveLayout';
import CanvasSheet from '../graph-canvas/CanvasSheet';

function chipClass(active) {
    return `px-2 py-1 rounded-lg text-[11px] transition-colors ${
        active ? 'bg-emerald-500/20 text-emerald-300' : 'bg-white/5 text-white/50 hover:bg-white/10'
    }`;
}

export default function ChainCanvasToolbar({
    readOnly,
    onRename,
    onFitView,
    onImportLineage,
    importing,
    onExportJSON,
    onExportSVG,
    exportingSvg,
    onShowMediaBubbleImport,
    typeFilter,
    onToggleType,
    attributeFilter,
    onToggleAttribute,
    searchTerm,
    onSearchChange,
    matchCount,
    activeMatchIndex,
    onNextMatch,
    onPrevMatch,
}) {
    const { isMobile } = useResponsiveLayout();
    const [mobileSheet, setMobileSheet] = useState(null); // null | 'tools' | 'search'
    // En LECTURE SEULE, aucune barre : ni outils, ni recherche, ni filtres. Seul le premier bloc
    // était gardé — le champ « Rechercher un produit ou une technique… » et ses filtres
    // s'affichaient donc PAR-DESSUS la chaîne dans les rendus, la masquant en partie (constaté sur
    // captures utilisateur le 2026-08-06, sur Article de Blog, Story et Traçabilité).
    //
    // Une barre de recherche dans une fiche exportée n'a aucun sens : elle serait figée dans le PNG.
    if (readOnly) return null;

    // Les MÊMES boutons et le MÊME bloc de recherche servent aux deux présentations — rangée en
    // haut à gauche sur desktop, feuille modale sur téléphone. Rien n'est réécrit pour mobile :
    // deux fabrications parallèles de la même barre, c'est la garantie qu'une action ajoutée d'un
    // côté manquera de l'autre.
    const actionButtons = (
        <>
            <button className="toolbar-btn secondary" onClick={onRename} title="Renommer la chaîne">
                <Edit2 size={14} /> Renommer
            </button>
            <button className="toolbar-btn secondary" onClick={onFitView} title="Réinitialiser le zoom">
                <RotateCcw size={14} /> Zoom
            </button>
            <button
                className="toolbar-btn secondary"
                onClick={onImportLineage}
                disabled={importing}
                title="Importer depuis la traçabilité existante (sourceLineage)"
            >
                <Upload size={14} /> {importing ? 'Import...' : 'Importer traçabilité'}
            </button>
            <button className="toolbar-btn secondary" onClick={onExportJSON} title="Exporter en JSON">
                <Download size={14} /> JSON
            </button>
            <button className="toolbar-btn secondary" onClick={onExportSVG} disabled={exportingSvg} title="Exporter en SVG">
                <FileImage size={14} /> {exportingSvg ? 'Export...' : 'SVG'}
            </button>
            <button className="toolbar-btn secondary" onClick={onShowMediaBubbleImport} title="Importer une photo/vidéo comme bulle sur le canvas">
                <ImageIcon size={14} /> Photo/Vidéo
            </button>
        </>
    );

    const searchBlock = (
        <div className="chain-filter-search">
            <Search size={13} />
            <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Rechercher un produit ou une technique..."
            />
            {searchTerm && (
                <>
                    {matchCount > 0 && (
                        <span className="chain-filter-search-count">{activeMatchIndex + 1}/{matchCount}</span>
                    )}
                    {matchCount > 1 && (
                        <>
                            <button type="button" onClick={onPrevMatch} title="Résultat précédent"><ChevronUp size={13} /></button>
                            <button type="button" onClick={onNextMatch} title="Résultat suivant"><ChevronDown size={13} /></button>
                        </>
                    )}
                    <button type="button" onClick={() => onSearchChange('')} title="Effacer la recherche"><X size={13} /></button>
                </>
            )}
        </div>
    );

    const filterChips = (
        <div className="chain-filter-chips">
            {ALL_REVIEW_TYPES.map(type => (
                <button
                    key={type}
                    type="button"
                    onClick={() => onToggleType(type)}
                    className={chipClass(typeFilter.has(type))}
                    title={`Afficher/masquer les produits "${TYPE_META[type].label}"`}
                >
                    {TYPE_META[type].label}
                </button>
            ))}
            <span className="chain-filter-sep" />
            <button
                type="button"
                onClick={() => onToggleAttribute('hasMedia')}
                className={chipClass(attributeFilter.hasMedia)}
                title="N'afficher que les produits/liaisons avec des médias attachés"
            >
                Avec médias
            </button>
            <button
                type="button"
                onClick={() => onToggleAttribute('hasCells')}
                className={chipClass(attributeFilter.hasCells)}
                title="N'afficher que les produits/liaisons avec des cellules de pipeline attachées"
            >
                Avec cellules
            </button>
        </div>
    );

    // TÉLÉPHONE : deux affordances, pas davantage. La rangée d'actions mesurait 627px de large sur
    // un écran de 390px (mesuré le 2026-08-14) — elle sortait donc de l'écran par la droite, ses
    // dernières actions étant purement inatteignables. Elle vit désormais dans une feuille.
    if (isMobile) {
        return (
            <>
                <Panel position="top-left" className="canvas-toolbar">
                    <div className="flex items-center gap-2">
                        <button className="toolbar-btn" onClick={() => setMobileSheet('tools')} title="Outils de la chaîne">
                            <MoreHorizontal size={14} /> Outils
                        </button>
                        <button className="toolbar-btn" onClick={() => setMobileSheet('search')} title="Rechercher et filtrer">
                            <SlidersHorizontal size={14} />
                            {searchTerm ? `« ${searchTerm.slice(0, 10)} »` : 'Filtrer'}
                        </button>
                    </div>
                </Panel>

                {mobileSheet === 'tools' && (
                    <CanvasSheet title="Outils de la chaîne" onClose={() => setMobileSheet(null)}>
                        <div className="canvas-sheet-actions">{actionButtons}</div>
                    </CanvasSheet>
                )}

                {mobileSheet === 'search' && (
                    <CanvasSheet title="Rechercher et filtrer" onClose={() => setMobileSheet(null)}>
                        <div className="flex flex-col gap-3">
                            {searchBlock}
                            {filterChips}
                        </div>
                    </CanvasSheet>
                )}
            </>
        );
    }

    return (
        <>
            {!readOnly && (
                <Panel position="top-left" className="canvas-toolbar">
                    <div className="flex items-center gap-2">
                        {actionButtons}
                    </div>
                </Panel>
            )}

            <Panel position="top-center" className="chain-filter-bar">
                {searchBlock}
                {filterChips}
            </Panel>
        </>
    );
}
