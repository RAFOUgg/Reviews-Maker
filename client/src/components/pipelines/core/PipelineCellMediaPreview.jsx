/**
 * PipelineCellMediaPreview Component
 *
 * Aperçu média en fond d'une cellule de pipeline (cf. PipelineDragDropView.jsx) — jusqu'à 4
 * médias affichés simultanément en galerie scindée (1 = plein cadre, 2 = deux colonnes, 3-4 =
 * grille 2x2). Au-delà de 4 médias attachés, chaque case tourne indépendamment vers le média
 * suivant de la file une fois son temps d'affichage écoulé, jusqu'à ce que tous soient passés.
 *
 * Les vidéos sont lues en boucle (autoplay/muted/loop) plutôt que remplacées par une icône
 * statique — avant ce composant, une vidéo attachée à une cellule n'affichait qu'un pictogramme
 * "Film" fixe, jamais la vidéo elle-même.
 */

import React, { useEffect, useRef, useState } from 'react';

// Durée d'affichage d'un média avant de passer au suivant dans sa case — appliquée aux photos
// (valeur explicitement demandée) et réutilisée pour les vidéos faute d'une durée dédiée précisée :
// la vidéo boucle pendant cette fenêtre plutôt que de figer sur une seule lecture.
const SLOT_DISPLAY_MS = 15_000;

const MediaSlot = ({ item }) => {
    if (!item) return null;
    if (item.type === 'video') {
        return (
            <video
                src={item.url}
                className="w-full h-full object-cover"
                autoPlay
                loop
                muted
                playsInline
            />
        );
    }
    return <img src={item.url} alt={item.caption || ''} className="w-full h-full object-cover" />;
};

const GRID_CLASS_BY_SLOT_COUNT = {
    1: 'grid-cols-1 grid-rows-1',
    2: 'grid-cols-2 grid-rows-1',
    3: 'grid-cols-2 grid-rows-2',
    4: 'grid-cols-2 grid-rows-2'
};

const PipelineCellMediaPreview = ({ media }) => {
    const items = Array.isArray(media) ? media : [];
    const slotCount = Math.min(4, items.length);

    // visibleIndex[i] = index dans `items` actuellement affiché dans la case i. nextIndexRef suit
    // le prochain média à faire entrer en rotation (round-robin) une fois qu'une case a fini son
    // temps d'affichage — seulement utile quand il y a plus de médias que de cases visibles.
    const [visibleIndex, setVisibleIndex] = useState(() => Array.from({ length: slotCount }, (_, i) => i));
    const nextIndexRef = useRef(slotCount);
    const timersRef = useRef([]);

    useEffect(() => {
        setVisibleIndex(Array.from({ length: slotCount }, (_, i) => i));
        nextIndexRef.current = slotCount;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items.length, slotCount]);

    useEffect(() => {
        timersRef.current.forEach(t => clearTimeout(t));
        timersRef.current = [];

        // Pas de rotation nécessaire si tout tient déjà dans les cases visibles.
        if (items.length <= slotCount || slotCount === 0) return undefined;

        timersRef.current = visibleIndex.map((_, slotIdx) => setTimeout(function advance() {
            setVisibleIndex(prev => {
                const next = [...prev];
                next[slotIdx] = nextIndexRef.current % items.length;
                nextIndexRef.current += 1;
                return next;
            });
        }, SLOT_DISPLAY_MS));

        return () => timersRef.current.forEach(t => clearTimeout(t));
    }, [visibleIndex, items.length, slotCount]);

    if (slotCount === 0) return null;

    return (
        <div className={`grid gap-px w-full h-full ${GRID_CLASS_BY_SLOT_COUNT[slotCount]}`}>
            {visibleIndex.map((itemIdx, slotIdx) => (
                <div key={slotIdx} className="relative w-full h-full overflow-hidden bg-black/40">
                    <MediaSlot item={items[itemIdx]} />
                </div>
            ))}
        </div>
    );
};

export default PipelineCellMediaPreview;
