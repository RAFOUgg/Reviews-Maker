import { describe, it, expect } from 'vitest';
import { orderRenderBlocks } from '../exportMakerHelpers';
import { sanitizeModuleOrder, isKnownModuleId } from '../adaptivePagination';

const bloc = (id) => ({ id, node: id });
const ids = (list) => list.map((b) => b.id);

describe('orderRenderBlocks', () => {
    it('rend la main au template quand aucun ordre n\'est défini', () => {
        const blocs = ['masthead', 'labData', 'extraData'].map(bloc);
        expect(ids(orderRenderBlocks(blocs, []))).toEqual(['masthead', 'labData', 'extraData']);
        expect(ids(orderRenderBlocks(blocs, undefined))).toEqual(['masthead', 'labData', 'extraData']);
    });

    it('applique l\'ordre demandé', () => {
        const blocs = ['masthead', 'labData', 'extraData'].map(bloc);
        const ordre = ['masthead', 'extraData', 'labData'];
        expect(ids(orderRenderBlocks(blocs, ordre))).toEqual(ordre);
    });

    // La règle qui protège du mode de défaillance « le contenu se déplace tout seul » : un bloc
    // apparu APRÈS que l'utilisateur a figé son ordre ne doit pas être relégué en fin de fiche.
    it('laisse un bloc inconnu collé à son prédécesseur, jamais à la fin', () => {
        const blocs = ['masthead', 'nouveauBloc', 'labData', 'extraData'].map(bloc);
        const ordre = ['masthead', 'labData', 'extraData'];
        expect(ids(orderRenderBlocks(blocs, ordre))).toEqual(['masthead', 'nouveauBloc', 'labData', 'extraData']);
    });

    it('garde plusieurs inconnus consécutifs dans leur ordre d\'origine', () => {
        const blocs = ['masthead', 'aaa', 'bbb', 'labData'].map(bloc);
        expect(ids(orderRenderBlocks(blocs, ['masthead', 'labData']))).toEqual(['masthead', 'aaa', 'bbb', 'labData']);
    });

    it('place en tête un inconnu qui précède tout bloc connu', () => {
        const blocs = ['inconnu', 'masthead'].map(bloc);
        expect(ids(orderRenderBlocks(blocs, ['masthead']))).toEqual(['inconnu', 'masthead']);
    });

    // Un pipeline se déplace entier : ses tronçons `#N` ne sont pas des blocs à ordonner
    // séparément, c'est un découpage décidé par la pagination.
    it('fait suivre les tronçons de pipeline au rang de leur pipeline', () => {
        const blocs = ['pipeline:culture#0', 'pipeline:culture#1', 'labData'].map(bloc);
        const out = ids(orderRenderBlocks(blocs, ['labData', 'pipeline:culture']));
        expect(out).toEqual(['labData', 'pipeline:culture#0', 'pipeline:culture#1']);
    });

    it('garde stable l\'ordre relatif de deux blocs de même id', () => {
        const blocs = [
            { id: 'sensoryEvaluation', node: 'premier' },
            { id: 'labData', node: 'labo' },
            { id: 'sensoryEvaluation', node: 'second' },
        ];
        const out = orderRenderBlocks(blocs, ['sensoryEvaluation', 'labData']);
        expect(out.map((b) => b.node)).toEqual(['premier', 'second', 'labo']);
    });
});

describe('sanitizeModuleOrder', () => {
    it('purge le vocabulaire hérité (clés de champ) au lieu de le filtrer partiellement', () => {
        // `description` et `extraData` existent dans les DEUX vocabulaires : un filtrage naïf en
        // garderait deux et déplacerait réellement ces blocs au nom d'un ordre jamais choisi.
        // La liste héritée compte ~100 clés de champ ; il ne doit en rester que ce qui est
        // réellement un bloc — et sur cet échantillon, rien d'autre.
        const herite = ['image', 'title', 'holderName', 'rating', 'densite', 'tastes', 'thcLevel'];
        expect(sanitizeModuleOrder(herite)).toEqual([]);
    });

    it('conserve les ids de bloc réels, y compris pipelines et gisements', () => {
        const ordre = ['masthead', 'pipeline:cultureTimeline', 'gisement:harvest', 'labData'];
        expect(sanitizeModuleOrder(ordre)).toEqual(ordre);
    });

    it('écarte les doublons et les valeurs non exploitables', () => {
        expect(sanitizeModuleOrder(['labData', 'labData', '', null, 42, 'labData'])).toEqual(['labData']);
        expect(sanitizeModuleOrder(null)).toEqual([]);
        expect(sanitizeModuleOrder('labData')).toEqual([]);
    });
});

describe('isKnownModuleId', () => {
    it('reconnaît un bloc, un pipeline, un gisement — et rien d\'autre', () => {
        expect(isKnownModuleId('cannabinoidGrid')).toBe(true);
        expect(isKnownModuleId('pipeline:nimporte')).toBe(true);
        expect(isKnownModuleId('gisement:recipe')).toBe(true);
        expect(isKnownModuleId('densite')).toBe(false);
        expect(isKnownModuleId(undefined)).toBe(false);
    });
});
