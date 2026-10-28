import { describe, it, expect } from 'vitest'
import { buildExportReviewData } from '../exportDataAdapter'
import { getOverflowFields } from '../fieldRegistry'

// Puissance des effets (effetsPuissance { id: 1-10 }) : rendue comme une liste lisible, triée du
// plus fort au plus faible, limitée aux effets encore cochés — et jamais exposée en JSON brut.
describe('puissance des effets', () => {
    const review = {
        type: 'Hash',
        holderName: 'Test',
        effetsChoisis: JSON.stringify(['relaxant', 'euphorique']),
        effetsPuissance: JSON.stringify({ relaxant: 3, euphorique: 8, orphelin: 9 }),
    }

    it('produit une liste triée, sans effet décoché', () => {
        const out = buildExportReviewData(review)
        expect(out.effectsPower).toHaveLength(2)
        expect(out.effectsPower[0]).toMatch(/8\/10$/)
        expect(out.effectsPower[1]).toMatch(/3\/10$/)
        expect(out.effectsPower.join(' ')).not.toMatch(/orphelin/)
    })

    it("n'ajoute rien sans puissance renseignée", () => {
        const out = buildExportReviewData({ ...review, effetsPuissance: undefined })
        expect(out.effectsPower).toBeUndefined()
    })

    it('ne remonte pas la clé brute dans « Données supplémentaires »', () => {
        const keys = getOverflowFields(review).map((f) => f.key)
        expect(keys).not.toContain('effetsPuissance')
    })
})
