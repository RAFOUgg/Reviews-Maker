import { describe, it, expect } from 'vitest'

describe('Infrastructure Test', () => {
    it('devrait passer un test basique', () => {
        expect(true).toBe(true)
    })

    it('devrait pouvoir utiliser les mocks', () => {
        const mock = { test: 'value' }
        expect(mock.test).toBe('value')
    })
})