/**
 * Export Maker Pages Store — pages du rendu FICHIER.
 *
 * ── Ce que ce store n'est plus (2026-08-16) ────────────────────────────────────────────────────
 *
 * Il portait jusqu'ici un second système de pagination, entièrement STATIQUE : une table
 * `PAGE_TEMPLATES` de ~570 lignes qui décrivait, pour chaque type de produit et chaque format,
 * quelles pages existent et ce que chacune contient — plus l'UI pour les composer à la main
 * (`PageManager`, ajouter/supprimer/réordonner une page).
 *
 * Ce système a coûté HUIT bugs de disparition silencieuse, tous documentés au fil de l'eau dans son
 * propre en-tête : le pipeline Curing absent de toute pagination Fleur ; les canevas Généalogie et
 * Chaîne de production absents de tous les types et tous les ratios ; la photo principale
 * (`mainImage`) absente de tous les type×ratio des trois templates qui la rendent ; et ainsi de
 * suite. Toujours la même cause : ces gabarits nommaient leur contenu avec des clés
 * `contentModules` devinées, quand le rendu attend des ids de BLOCS (`masthead`, `pipeline:*`,
 * `gisement:*`). Une clé qui n'existe pas ne fait rien — pire, toute clé réelle ABSENTE de la liste
 * d'une page est explicitement mise à `false`, donc masquée. Un oubli ne produisait pas une erreur,
 * il produisait un trou.
 *
 * Et le pire n'était pas là : composer une trame à la main DÉSACTIVAIT la mesure. `ExportModal`
 * lisait `enabled: noSessionPages` — dès qu'une session de pages existait, la pagination mesurée
 * cédait la place à la trame devinée. L'utilisateur qui soignait sa mise en page dégradait donc son
 * export sans le savoir (mesuré le 2026-08-10 : 5 pages identiques remplies à 98,6 %, là où la
 * mesure en produit 2 à 80,2/76,7 %).
 *
 * ── Ce qu'il est ───────────────────────────────────────────────────────────────────────────────
 *
 * Le simple réceptacle du résultat de `computeAdaptivePages` (`utils/adaptivePagination.js`), qui
 * mesure la hauteur réellement rendue de chaque bloc et les répartit selon la place réelle. Une
 * seule source, et un seul réglage laissé à l'utilisateur : `paginationDisabled`, un REFUS de
 * paginer — « tout sur une page, quitte à ce que ça déborde ». C'est un choix légitime pour une
 * vignette ; répartir des blocs à la main ne l'était pas.
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const PAGES_STORAGE_KEY = 'export-maker-pages-storage';

export const useExportMakerPagesStore = create(
    persist(
        (set) => ({
            // Refus EXPLICITE de pagination. Distinct de « pas encore calculée » : sans cette
            // distinction, l'interrupteur était inopérant dès que la pagination s'appliquait d'
            // elle-même — il restait affiché éteint et le clic était annulé (« le bouton de
            // pagination n'est pas lié »).
            paginationDisabled: false,
            /** Pages issues de la MESURE, jamais composées à la main. */
            pages: [],
            currentPageIndex: 0,

            setPaginationDisabled: (v) => set({ paginationDisabled: !!v }),
            setPages: (pages) => set({ pages }),
            setCurrentPage: (index) => set({ currentPageIndex: index }),
            nextPage: () => set((state) => ({
                currentPageIndex: Math.min(state.currentPageIndex + 1, state.pages.length - 1),
            })),
            previousPage: () => set((state) => ({
                currentPageIndex: Math.max(state.currentPageIndex - 1, 0),
            })),
            reset: () => set({ currentPageIndex: 0, pages: [] }),
        }),
        {
            name: PAGES_STORAGE_KEY,
            // `pages` n'est PLUS persisté : c'est un résultat de mesure, valable pour une review,
            // un template, un format et une typographie donnés. Le restaurer d'une session à
            // l'autre, c'est réappliquer à une review la découpe calculée pour une AUTRE — le
            // défaut même qu'on vient de supprimer, sous une autre forme. Seul le refus de paginer
            // est une préférence, donc la seule chose qui survit à la session.
            partialize: (state) => ({ paginationDisabled: state.paginationDisabled }),
            onRehydrateStorage: () => (state, error) => {
                if (error) {
                    console.error('[ExportMakerPages] Error rehydrating storage:', error);
                    return;
                }
                if (state) {
                    if (!Array.isArray(state.pages)) state.pages = [];
                    if (typeof state.currentPageIndex !== 'number' || state.currentPageIndex < 0) {
                        state.currentPageIndex = 0;
                    }
                }
            },
        }
    )
);

// Normalisation du `type` d'une review vers un libellé de produit stable.
//
// Trois formes coexistent réellement dans l'app, et c'est la 6e occurrence documentée du bug de
// vocabulaire deviné : les hooks de formulaire écrivent l'anglais minuscule
// (`useHashForm.js`/`useConcentrateForm.js`/`useEdibleForm.js` → 'hash'/'concentrate'/'edible'), la
// review sauvegardée en API utilise le français PLURIEL pour les fleurs ('Fleurs'), et l'affichage
// attend le français capitalisé SINGULIER. Conservée après la suppression de `PAGE_TEMPLATES` parce
// qu'elle sert toujours d'étiquette de type dans la galerie (`ReviewCoverMedia.jsx`).
const TYPE_KEY_ALIASES = {
    flower: 'Fleur', fleur: 'Fleur', fleurs: 'Fleur',
    hash: 'Hash',
    concentrate: 'Concentré', concentré: 'Concentré', concentre: 'Concentré', concentres: 'Concentré',
    edible: 'Comestible', comestible: 'Comestible', comestibles: 'Comestible',
};

const TYPE_LABELS = new Set(Object.values(TYPE_KEY_ALIASES));

export function normalizePageTemplateType(reviewType) {
    if (reviewType && TYPE_LABELS.has(reviewType)) return reviewType;
    const lower = String(reviewType || '').toLowerCase();
    return TYPE_KEY_ALIASES[lower] || 'Fleur';
}

export default useExportMakerPagesStore;
