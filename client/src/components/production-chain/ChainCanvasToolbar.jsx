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

import React from 'react';
import { Panel } from 'reactflow';
import { Download, Upload, RotateCcw, FileImage, Edit2, Image as ImageIcon, Search, ChevronUp, ChevronDown, X } from 'lucide-react';
import { TYPE_META, ALL_REVIEW_TYPES } from '../../utils/reviewTypeMeta';

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
    return (
        <>
            {!readOnly && (
                <Panel position="top-left" className="canvas-toolbar">
                    <div className="flex items-center gap-2">
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
                    </div>
                </Panel>
            )}

            <Panel position="top-center" className="chain-filter-bar">
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
            </Panel>
        </>
    );
}
