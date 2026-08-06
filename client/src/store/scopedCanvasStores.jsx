/**
 * Instances de store ISOLÉES par canevas.
 *
 * LE PROBLÈME. `useProductionChainStore` et `useGeneticsStore` sont des singletons. Un seul canevas
 * affiché à la fois — le cas de l'ÉDITION — et tout va bien. Mais un rendu peut en monter
 * plusieurs : la page de lignage empile N fiches portant chacune son canevas, et les chaînes
 * reliées entre produits (demande du 2026-08-06) en additionnent par construction. Ils écrivent
 * alors tous dans le même état et se mélangent.
 *
 * C'est ce blocage, et lui seul, qui avait imposé d'écrire des canevas en lecture seule séparés
 * (`ReadOnlyGenealogyCanvas`, `ReadOnlyProductionChainCanvas`) au lieu de réutiliser les vrais —
 * d'où l'écart visuel que l'utilisateur a relevé : « pourquoi avoir refait un UI alors qu'il en
 * existe déjà un ».
 *
 * LA SOLUTION, ADDITIVE. Sans `Provider`, ces hooks retournent le singleton : l'édition se comporte
 * exactement comme avant, aucun de ses 35 fichiers consommateurs ne change. Avec un `Provider`,
 * le sous-arbre travaille sur une instance à lui.
 *
 * Le repli sur le singleton est délibéré et non un raccourci : il garantit qu'oublier un `Provider`
 * dégrade en comportement actuel plutôt qu'en écran vide.
 */
import { createContext, useContext, useRef, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useStore } from 'zustand';
import globalChainStore, { createProductionChainStore } from './useProductionChainStore';
import globalGeneticsStore, { createGeneticsStore } from './useGeneticsStore';

const ChainStoreContext = createContext(null);
const GeneticsStoreContext = createContext(null);

/** Fournit une instance isolée du store de chaîne au sous-arbre. */
export function ScopedChainStoreProvider({ children }) {
    const ref = useRef(null);
    if (!ref.current) ref.current = createProductionChainStore();
    return <ChainStoreContext.Provider value={ref.current}>{children}</ChainStoreContext.Provider>;
}
ScopedChainStoreProvider.propTypes = { children: PropTypes.node };

/** Fournit une instance isolée du store de génétique au sous-arbre. */
export function ScopedGeneticsStoreProvider({ children }) {
    const ref = useRef(null);
    if (!ref.current) ref.current = createGeneticsStore();
    return <GeneticsStoreContext.Provider value={ref.current}>{children}</GeneticsStoreContext.Provider>;
}
ScopedGeneticsStoreProvider.propTypes = { children: PropTypes.node };

/**
 * Store de chaîne du contexte, ou le singleton global à défaut.
 *
 * Retourne l'objet d'état COMPLET, comme `useProductionChainStore()` sans sélecteur — les canevas
 * l'utilisent ainsi aujourd'hui (`const store = useProductionChainStore();`), on ne change donc pas
 * leur façon de consommer en même temps qu'on change la portée.
 */
export function useChainStore() {
    const scoped = useContext(ChainStoreContext);
    const globalState = globalChainStore();
    const scopedState = useStore(scoped || globalChainStore);
    return scoped ? scopedState : globalState;
}

/** Idem côté génétique. */
export function useGeneticsCanvasStore() {
    const scoped = useContext(GeneticsStoreContext);
    const globalState = globalGeneticsStore();
    const scopedState = useStore(scoped || globalGeneticsStore);
    return scoped ? scopedState : globalState;
}

/** Les deux fournisseurs à la fois — un canevas de rendu a besoin des deux stores. */
export function ScopedCanvasStores({ children }) {
    const inner = useMemo(() => children, [children]);
    return (
        <ScopedChainStoreProvider>
            <ScopedGeneticsStoreProvider>{inner}</ScopedGeneticsStoreProvider>
        </ScopedChainStoreProvider>
    );
}
ScopedCanvasStores.propTypes = { children: PropTypes.node };
