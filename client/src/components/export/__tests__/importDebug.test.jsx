import { describe, it, expect, vi } from 'vitest'

describe('ExportMaker Imports Debug', () => {
    it('devrait pouvoir importer les hooks', async () => {
        // Test individual imports to identify the problem
        try {
            const { useAccountType } = await import('../../../hooks/useAccountType')
            expect(useAccountType).toBeDefined()
        } catch (error) {
            console.error('useAccountType import error:', error)
            throw error
        }
    })

    it('devrait pouvoir importer useAuth', async () => {
        try {
            const { useAuth } = await import('../../../hooks/useAuth')
            expect(useAuth).toBeDefined()
        } catch (error) {
            console.error('useAuth import error:', error)
            throw error
        }
    })

    it('devrait pouvoir importer exportMakerStore', async () => {
        try {
            const { useExportMakerStore } = await import('../../../store/exportMakerStore')
            expect(useExportMakerStore).toBeDefined()
        } catch (error) {
            console.error('exportMakerStore import error:', error)
            throw error
        }
    })

    it('devrait pouvoir importer LiquidGlass', async () => {
        try {
            const LiquidGlass = await import('../../ui/LiquidGlass')
            expect(LiquidGlass).toBeDefined()
        } catch (error) {
            console.error('LiquidGlass import error:', error)
            throw error
        }
    })
})