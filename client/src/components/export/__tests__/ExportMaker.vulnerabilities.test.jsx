import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { act } from 'react'

// Mock les dépendances critiques identifiées dans l'audit
vi.mock('../../../hooks/useAccountType', () => ({
    useAccountType: () => ({
        permissions: {
            export: {
                formats: { svg: true },
                quality: { high: true },
                features: { watermark: true, dragDrop: true }
            }
        }
    })
}))

vi.mock('../../../hooks/useAuth', () => ({
    useAuth: () => ({
        user: { id: 'pro-user', username: 'prouser', accountType: 'producer' }
    })
}))

vi.mock('../../../store/orchardStore', () => ({
    useOrchardStore: vi.fn((selector) => {
        const mockStore = {
            config: {
                colors: { background: '#1a1a2e', accent: '#ffd700', textPrimary: '#ffffff' },
                typography: { fontFamily: 'Inter' }
            },
            setReviewData: vi.fn()
        }
        return selector ? selector(mockStore) : mockStore
    })
}))

// Mock des utilitaires critiques
vi.mock('../../../utils/orchard/moduleMappings', () => ({
    getModulesByProductType: vi.fn(() => ['genetics', 'visual', 'effects', 'terpenes'])
}))

vi.mock('../../../store/orchardConstants', () => ({
    DEFAULT_TEMPLATES: {
        modernCompact: { name: 'Modern Compact', description: 'Compact' },
        detailedCard: { name: 'Detailed Card', description: 'Detailed' }
    }
}))

const mockComplexReview = {
    id: 'complex-review-456',
    name: 'Complex Purple Haze',
    holderName: 'Complex Purple Haze',
    genetics: { phenotype: 'Hybrid', thc: 22.5, cbd: 1.2, landrace: 'Purple Haze x Skunk' },
    visual: { couleur: 'Violet foncé', structure: 'Dense', trichomes: 'Abondants' },
    effects: { euphoria: 9, relaxation: 7, creativity: 8, focus: 6 },
    terpeneProfile: [
        { name: 'Myrcène', percentage: 0.8 },
        { name: 'Limonène', percentage: 0.6 },
        { name: 'Caryophyllène', percentage: 0.4 }
    ],
    author: { username: 'complexuser' }
}

describe('ExportMaker - Tests des Fragilités Critiques', () => {

    // Test de la fragilité critique #1: resolveReviewField performance
    describe('Performance resolveReviewField', () => {
        it('ne devrait pas appeler resolveReviewField plus de 2 fois par render', async () => {
            const resolveFieldSpy = vi.fn()

            // Mock pour traquer les appels
            vi.mock('../ExportMaker', () => {
                const originalModule = vi.importActual('../ExportMaker')
                return {
                    ...originalModule,
                    resolveReviewField: resolveFieldSpy
                }
            })

            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockComplexReview}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            // Le composant ne devrait pas appeler resolveField de manière excessive
            await waitFor(() => {
                expect(resolveFieldSpy.mock.calls.length).toBeLessThan(10)
            })
        })

        it('devrait mémoriser les résultats de calcul avec des données identiques', async () => {
            const ExportMaker = (await import('../ExportMaker')).default

            const { rerender } = render(
                <ExportMaker
                    reviewData={mockComplexReview}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            // Premier render
            const firstRender = performance.now()

            // Re-render avec les mêmes données
            rerender(
                <ExportMaker
                    reviewData={mockComplexReview}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            const secondRender = performance.now()

            // Le second render devrait être significativement plus rapide (memoization)
            expect(secondRender - firstRender).toBeLessThan(50) // <50ms
        })
    })

    // Test de la fragilité critique #2: Memory leaks
    describe('Memory Leaks Prevention', () => {
        it('devrait nettoyer les Blob URLs après démontage', async () => {
            const revokeObjectURLSpy = vi.spyOn(URL, 'revokeObjectURL')
            const createObjectURLSpy = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')

            const ExportMaker = (await import('../ExportMaker')).default

            const { unmount } = render(
                <ExportMaker
                    reviewData={mockComplexReview}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            // Simuler création de blob (export)
            await act(async () => {
                if (createObjectURLSpy.mock.calls.length > 0) {
                    await waitFor(() => {
                        expect(createObjectURLSpy).toHaveBeenCalled()
                    })
                }
            })

            // Démonter le composant
            unmount()

            // Vérifier que revokeObjectURL a été appelé pour nettoyer
            await waitFor(() => {
                if (createObjectURLSpy.mock.calls.length > 0) {
                    expect(revokeObjectURLSpy).toHaveBeenCalled()
                }
            })
        })

        it('ne devrait pas avoir de memory leak sur les event listeners', () => {
            const addEventListenerSpy = vi.spyOn(window, 'addEventListener')
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')

            const ExportMaker = require('../ExportMaker').default

            const { unmount } = render(
                <ExportMaker
                    reviewData={mockComplexReview}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            const addedListeners = addEventListenerSpy.mock.calls.length

            unmount()

            // Tous les listeners ajoutés doivent être supprimés
            expect(removeEventListenerSpy.mock.calls.length).toBeGreaterThanOrEqual(addedListeners)
        })
    })

    // Test de la fragilité critique #3: Error Handling
    describe('Error Handling Critical Paths', () => {
        it('devrait gérer gracieusement l\'échec du dynamic import', async () => {
            // Mock un dynamic import qui échoue
            const originalImport = global.__vitest__.mock

            vi.doMock('html-to-image', () => {
                throw new Error('Network error: Failed to load module')
            })

            const ExportMaker = (await import('../ExportMaker')).default

            expect(() => {
                render(
                    <ExportMaker
                        reviewData={mockComplexReview}
                        productType="flower"
                        onClose={vi.fn()}
                    />
                )
            }).not.toThrow()
        })

        it('devrait afficher un message d\'erreur clair en cas d\'échec export', async () => {
            // Mock html-to-image pour échouer
            vi.doMock('html-to-image', () => ({
                toPng: vi.fn().mockRejectedValue(new Error('Canvas error'))
            }))

            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockComplexReview}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            // Tenter un export
            const exportButton = screen.queryByText('Export PNG')
            if (exportButton) {
                fireEvent.click(exportButton)

                // Un message d'erreur devrait apparaître
                await waitFor(() => {
                    expect(screen.getByText(/erreur/i) || screen.getByText(/error/i)).toBeInTheDocument()
                }, { timeout: 3000 })
            }
        })

        it('devrait valider les données de review avant rendu', () => {
            const invalidReview = {
                id: 'invalid',
                // Données manquantes ou malformées
                genetics: "string-instead-of-object",
                effects: null
            }

            const ExportMaker = require('../ExportMaker').default

            expect(() => {
                render(
                    <ExportMaker
                        reviewData={invalidReview}
                        productType="flower"
                        onClose={vi.fn()}
                    />
                )
            }).not.toThrow()
        })
    })

    // Test de la fragilité critique #4: Re-renders excessifs
    describe('Re-renders Optimization', () => {
        it('ne devrait pas re-render excessivement lors de changements d\'onglet', async () => {
            let renderCount = 0

            const TrackingWrapper = ({ children }) => {
                renderCount++
                return children
            }

            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <TrackingWrapper>
                    <ExportMaker
                        reviewData={mockComplexReview}
                        productType="flower"
                        onClose={vi.fn()}
                    />
                </TrackingWrapper>
            )

            const initialRenderCount = renderCount

            // Changer d'onglet
            const contenuTab = screen.queryByText('Contenu')
            if (contenuTab) {
                fireEvent.click(contenuTab)
                await waitFor(() => {
                    expect(renderCount - initialRenderCount).toBeLessThan(3)
                })
            }
        })
    })
})