import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * CHOIX D'UNE CATÉGORIE — carrousel horizontal sur téléphone, galerie sur grand écran.
 *
 * Pourquoi. Les trois sélecteurs CATA (arômes, goûts, effets) présentaient leurs catégories en
 * grille à deux colonnes. Sur un téléphone, dix à quinze catégories font donc cinq à huit rangées :
 * on défile longuement pour découvrir ce qui existe, et la question elle-même sort de l'écran.
 * Demande explicite (2026-08-14) : « sur téléphone par défaut fait en sorte que le choix des goûts,
 * odeur et effets soit un caroussel défilant de gauche à droite ». Un rail horizontal montre les
 * catégories voisines par un débord partiel — l'utilisateur SAIT qu'il y en a d'autres — et rend la
 * hauteur au contenu.
 *
 * La galerie n'est pas supprimée : elle reste le rendu sur grand écran (où la largeur permet de tout
 * voir d'un coup) et reste accessible partout via la préférence « Catégories en galerie »
 * (`useCategoryLayout`), demandée dans la foulée.
 *
 * DA : mêmes codes que le reste de LiquidUI — surface translucide, bordure fine, rayon généreux,
 * et un halo à la couleur de la catégorie quand elle porte une sélection. Le halo remplace la
 * bordure colorée seule, illisible sur fond sombre à cette taille.
 */

const CLE_PREFERENCE = 'terpologie:categories-en-galerie';

/** Préférence « revenir à l'affichage galerie ». Partagée par les trois sélecteurs. */
export function useCategoryLayout() {
    const [galerie, setGalerie] = useState(() => {
        if (typeof window === 'undefined') return false;
        return window.localStorage.getItem(CLE_PREFERENCE) === '1';
    });

    useEffect(() => {
        // Une préférence changée dans les Réglages doit s'appliquer aux sélecteurs déjà montés,
        // sans rechargement — d'où l'écoute, y compris dans le même onglet (`storage` ne s'y
        // déclenche pas, on double avec un évènement maison).
        const relire = () => setGalerie(window.localStorage.getItem(CLE_PREFERENCE) === '1');
        window.addEventListener('storage', relire);
        window.addEventListener('terpologie:preferences', relire);
        return () => {
            window.removeEventListener('storage', relire);
            window.removeEventListener('terpologie:preferences', relire);
        };
    }, []);

    return galerie;
}

export function setCategoryLayoutGallery(galerie) {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(CLE_PREFERENCE, galerie ? '1' : '0');
    window.dispatchEvent(new Event('terpologie:preferences'));
}

export function isCategoryLayoutGallery() {
    if (typeof window === 'undefined') return false;
    return window.localStorage.getItem(CLE_PREFERENCE) === '1';
}

export default function CategoryCarousel({ categories, onSelect, countOf, unitLabel }) {
    const railRef = useRef(null);
    const [peutGauche, setPeutGauche] = useState(false);
    const [peutDroite, setPeutDroite] = useState(false);

    const majFleches = () => {
        const el = railRef.current;
        if (!el) return;
        setPeutGauche(el.scrollLeft > 4);
        setPeutDroite(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    };

    useEffect(() => {
        majFleches();
        const el = railRef.current;
        if (!el) return undefined;
        el.addEventListener('scroll', majFleches, { passive: true });
        const ro = new ResizeObserver(majFleches);
        ro.observe(el);
        return () => { el.removeEventListener('scroll', majFleches); ro.disconnect(); };
    }, [categories]);

    const glisser = (sens) => {
        const el = railRef.current;
        if (!el) return;
        // Environ une carte et demie : assez pour avancer franchement, pas assez pour sauter
        // par-dessus une catégorie sans l'avoir vue.
        el.scrollBy({ left: sens * Math.max(180, el.clientWidth * 0.7), behavior: 'smooth' });
    };

    return (
        <div className="relative">
            {/* Fondus de bord : ils DISENT qu'il reste des catégories de ce côté. Une simple barre
                de défilement masquée ne le dit pas, et c'est ce qui fait manquer la moitié du choix. */}
            {peutGauche && <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-r from-[#0a0a12] to-transparent rounded-l-xl" />}
            {peutDroite && <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 z-10 bg-gradient-to-l from-[#0a0a12] to-transparent rounded-r-xl" />}

            {[['left', peutGauche, ChevronLeft, -1], ['right', peutDroite, ChevronRight, 1]].map(([cote, actif, Icone, sens]) => actif && (
                <button
                    key={cote}
                    type="button"
                    onClick={() => glisser(sens)}
                    aria-label={sens < 0 ? 'Catégories précédentes' : 'Catégories suivantes'}
                    // Confort de bureau ; au doigt on fait défiler le rail directement.
                    className={`hidden sm:flex absolute ${cote === 'left' ? 'left-1' : 'right-1'} top-1/2 -translate-y-1/2 z-20 w-9 h-9 items-center justify-center rounded-full bg-black/60 border border-white/15 text-white/80 backdrop-blur-sm hover:bg-black/80 hover:text-white transition-colors`}
                >
                    <Icone className="w-5 h-5" />
                </button>
            ))}

            <div
                ref={railRef}
                className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory scrollbar-hide"
                style={{ scrollbarWidth: 'none' }}
            >
                {categories.map((category) => {
                    const compte = countOf(category);
                    const selection = category.selectedCount || 0;
                    return (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => onSelect(category.id)}
                            // `snap-start` + largeur fixe : chaque carte s'aligne proprement, et la
                            // suivante déborde volontairement pour annoncer la suite.
                            className="snap-start flex-shrink-0 w-[150px] p-3 rounded-2xl text-left transition-all border backdrop-blur-md"
                            style={{
                                background: selection > 0
                                    ? `linear-gradient(160deg, ${category.color}22, rgba(255,255,255,0.03))`
                                    : 'rgba(255,255,255,0.04)',
                                borderColor: selection > 0 ? category.color : 'rgba(255,255,255,0.10)',
                                boxShadow: selection > 0 ? `0 6px 22px -8px ${category.color}` : 'none',
                                minHeight: 112,
                            }}
                        >
                            <div className="flex items-start justify-between mb-1.5">
                                <span className="text-3xl leading-none">{category.emoji}</span>
                                {selection > 0 && (
                                    <span
                                        className="text-[11px] font-bold px-2 py-0.5 rounded-full text-white flex-shrink-0"
                                        style={{ backgroundColor: category.color }}
                                    >
                                        {selection}
                                    </span>
                                )}
                            </div>
                            <div className="font-semibold text-gray-100 text-sm leading-tight">{category.label}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{compte} {unitLabel}</div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

CategoryCarousel.propTypes = {
    /** `{ id, label, emoji, color, selectedCount }` — `selectedCount` posé par l'appelant. */
    categories: PropTypes.array.isRequired,
    onSelect: PropTypes.func.isRequired,
    /** Nombre d'entrées de la catégorie (arômes, goûts, effets) — l'appelant sait les compter. */
    countOf: PropTypes.func.isRequired,
    /** « arômes », « goûts », « effets ». */
    unitLabel: PropTypes.string.isRequired,
};
