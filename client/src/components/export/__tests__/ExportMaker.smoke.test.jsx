import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ExportMaker from '../ExportMaker'

// Mock des stores critiques
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
        return selector ? selector(mockStore) : mockStore.config
    })
}))

// Mock review data pour les tests
const mockFlowerReview = {
    id: 'test-review-123',
    name: 'Purple Haze Test',
    holderName: 'Purple Haze Test',
    visual: {
        couleur: 'Violet',
        structure: 'Dense'
    },
    effects: {
        euphoria: 8,
        relaxation: 6
    },
    genetics: {
        phenotype: 'Sativa',
        thc: 18.5
    },
    author: {
        username: 'testuser'
    }
}

describe('ExportMaker - Tests de Smoke', () => {
    it('devrait se monter sans crash', () => {
        expect(() => {
            render(
                <ExportMaker
                    reviewData={mockFlowerReview}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )
        }).not.toThrow()
    })

    it('devrait rendre les 4 onglets principaux', () => {
        render(
            <ExportMaker
                reviewData={mockFlowerReview}
                productType="flower"
                onClose={vi.fn()}
            />
        )

        // Vérifie que les 4 onglets sont présents (basé sur la ligne 1375-1378)
        expect(screen.getByText('Template')).toBeInTheDocument()
        expect(screen.getByText('Contenu')).toBeInTheDocument()
        expect(screen.getByText('Apparence')).toBeInTheDocument()
        expect(screen.getByText('Préréglages')).toBeInTheDocument()
    })

    it('devrait rendre les boutons d\'export', () => {
        render(
            <ExportMaker
                reviewData={mockFlowerReview}
                productType="flower"
                onClose={vi.fn()}
            />
        )

        // Vérifie que les boutons d'export existent
        expect(screen.getByText('Export PNG')).toBeInTheDocument()
        expect(screen.getByText('Export JPEG')).toBeInTheDocument()
        expect(screen.getByText('Export PDF')).toBeInTheDocument()
    })

    it('devrait gérer les données de review manquantes sans crash', () => {
        expect(() => {
            render(
                <ExportMaker
                    reviewData={null}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )
        }).not.toThrow()
    })

    it('devrait gérer différents types de produits', () => {
        const productTypes = ['flower', 'hash', 'concentrate', 'edible']

        productTypes.forEach(productType => {
            expect(() => {
                const { unmount } = render(
                    <ExportMaker
                        reviewData={mockFlowerReview}
                        productType={productType}
                        onClose={vi.fn()}
                    />
                )
                unmount() // Cleanup after each test
            }).not.toThrow()
        })
    })
})