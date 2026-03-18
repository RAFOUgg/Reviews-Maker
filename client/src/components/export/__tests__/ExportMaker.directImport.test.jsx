import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

// Mock all dependencies first before importing ExportMaker
vi.mock('../../../hooks/useAccountType', () => ({
    useAccountType: () => ({
        permissions: {
            export: {
                formats: { svg: false },
                quality: { high: false },
                features: {
                    watermark: false,
                    dragDrop: false
                }
            }
        }
    })
}))

vi.mock('../../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: {
            id: 'test-user',
            username: 'testuser',
            accountType: 'consumer'
        }
    })
}))

vi.mock('../../../store/orchardStore', () => ({
    useOrchardStore: vi.fn((selector) => {
        const mockStore = {
            config: {
                colors: {
                    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                    accent: '#ffd700',
                    textPrimary: '#ffffff'
                },
                typography: {
                    fontFamily: 'Inter'
                }
            },
            setReviewData: vi.fn()
        }
        return selector ? selector(mockStore) : mockStore
    })
}))

// Mock potentially heavy dependencies
vi.mock('../../../utils/GIFExporter', () => ({
    exportPipelineToGIF: vi.fn().mockResolvedValue(new Blob()),
    downloadGIF: vi.fn()
}))

// Mock orchard utilities
vi.mock('../../../utils/orchard/moduleMappings', () => ({
    getModulesByProductType: vi.fn(() => [])
}))

// Mock constants
vi.mock('../../../store/orchardConstants', () => ({
    DEFAULT_TEMPLATES: {
        modernCompact: {
            name: 'Modern Compact',
            description: 'Format compact moderne'
        },
        detailedCard: {
            name: 'Fiche Détaillée',
            description: 'Fiche technique complète'
        }
    }
}))

describe('ExportMaker Direct Import', () => {
    it('devrait pouvoir importer ExportMaker', async () => {
        try {
            const ExportMaker = (await import('../ExportMaker')).default
            expect(ExportMaker).toBeDefined()
            expect(typeof ExportMaker).toBe('function')
        } catch (error) {
            console.error('ExportMaker import error:', error)
            throw error
        }
    })

    it('devrait pouvoir rendre ExportMaker avec données minimales', async () => {
        const ExportMaker = (await import('../ExportMaker')).default

        const mockReview = {
            id: 'test-123',
            name: 'Test Review',
            author: { username: 'test' }
        }

        expect(() => {
            const { unmount } = render(
                <ExportMaker
                    reviewData={mockReview}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )
            unmount()
        }).not.toThrow()
    })
})