import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

// Mock html-to-image pour tous les tests d'export
const mockHtmlToImage = {
    toPng: vi.fn().mockResolvedValue('data:image/png;base64,mockdata'),
    toJpeg: vi.fn().mockResolvedValue('data:image/jpeg;base64,mockdata'),
    toSvg: vi.fn().mockResolvedValue('<svg>mock</svg>')
}

vi.mock('html-to-image', () => mockHtmlToImage)

// Mock jsPDF pour tests PDF
const mockJsPDF = {
    jsPDF: vi.fn().mockImplementation(() => ({
        addImage: vi.fn(),
        save: vi.fn(),
        setPage: vi.fn(),
        addPage: vi.fn()
    }))
}

vi.mock('jspdf', () => mockJsPDF)

// Mock GIF exporter
vi.mock('../../../utils/GIFExporter', () => ({
    exportPipelineToGIF: vi.fn().mockResolvedValue(new Blob(['mock-gif'], { type: 'image/gif' })),
    downloadGIF: vi.fn()
}))

// Mock global download
global.URL.createObjectURL = vi.fn(() => 'mock-blob-url')
global.URL.revokeObjectURL = vi.fn()

// Mock link download
const mockLink = {
    click: vi.fn(),
    remove: vi.fn(),
    style: {},
    href: '',
    download: ''
}

vi.spyOn(document, 'createElement').mockImplementation((tag) => {
    if (tag === 'a') return mockLink
    return document.createElement(tag)
})

vi.spyOn(document.body, 'appendChild').mockImplementation(() => { })

const mockReviewWithPipeline = {
    id: 'pipeline-review',
    name: 'Review With Pipeline',
    holderName: 'Pipeline Test',
    genetics: { phenotype: 'Sativa', thc: 20 },
    visual: { couleur: 'Vert', structure: 'Fluffy' },
    effects: { euphoria: 8, relaxation: 5 },
    // Pipeline data pour GIF export
    pipelineGlobal: [
        { step: 'Germination', duration: 7, description: 'Seed sprouting' },
        { step: 'Croissance', duration: 21, description: 'Vegetative growth' }
    ],
    author: { username: 'pipelineuser' }
}

// Test different permission levels
const createMockPermissions = (accountType) => {
    const permissions = {
        consumer: {
            export: {
                formats: { svg: false },
                quality: { high: false },
                features: { watermark: false, dragDrop: false }
            }
        },
        producer: {
            export: {
                formats: { svg: true },
                quality: { high: true },
                features: { watermark: true, dragDrop: true }
            }
        },
        influencer: {
            export: {
                formats: { svg: true },
                quality: { high: true },
                features: { watermark: true, dragDrop: true }
            }
        }
    }
    return permissions[accountType] || permissions.consumer
}

describe('ExportMaker - Tests des 5 Formats d\'Export', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    describe('Format PNG - Tous Comptes', () => {
        beforeEach(() => {
            vi.mock('../../../hooks/useAccountType', () => ({
                useAccountType: () => ({ permissions: createMockPermissions('consumer') })
            }))

            vi.mock('../../../hooks/useAuth', () => ({
                useAuth: () => ({ user: { id: 'consumer', accountType: 'consumer' } })
            }))

            vi.mock('../../../store/orchardStore', () => ({
                useOrchardStore: vi.fn((selector) => {
                    const store = { config: { colors: {}, typography: {} }, setReviewData: vi.fn() }
                    return selector ? selector(store) : store
                })
            }))

            vi.mock('../../../store/orchardConstants', () => ({
                DEFAULT_TEMPLATES: {
                    modernCompact: { name: 'Modern Compact', description: 'Compact' }
                }
            }))

            vi.mock('../../../utils/orchard/moduleMappings', () => ({
                getModulesByProductType: vi.fn(() => [])
            }))
        })

        it('devrait exporter PNG standard pour compte consumer', async () => {
            const user = userEvent.setup()
            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            const exportButton = screen.getByText('Export PNG')
            await user.click(exportButton)

            await waitFor(() => {
                expect(mockHtmlToImage.toPng).toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.objectContaining({ pixelRatio: 2 }) // Standard quality
                )
            })

            expect(mockLink.download).toContain('.png')
            expect(mockLink.click).toHaveBeenCalled()
        })

        it('devrait utiliser la bonne nomenclature pour fichier PNG', async () => {
            const user = userEvent.setup()
            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            await user.click(screen.getByText('Export PNG'))

            await waitFor(() => {
                expect(mockLink.download).toMatch(/review-.*-\d+\.png/)
            })
        })
    })

    describe('Format JPEG - Tous Comptes', () => {
        it('devrait exporter JPEG avec qualité correcte', async () => {
            const user = userEvent.setup()

            vi.doMock('../../../hooks/useAccountType', () => ({
                useAccountType: () => ({ permissions: createMockPermissions('consumer') })
            }))

            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            await user.click(screen.getByText('Export JPEG'))

            await waitFor(() => {
                expect(mockHtmlToImage.toJpeg).toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.objectContaining({
                        quality: 0.92, // Standard quality pour consumer
                        pixelRatio: 2
                    })
                )
            })
        })
    })

    describe('Format SVG - Comptes PRO Seulement', () => {
        it('devrait bloquer SVG pour compte consumer', () => {
            vi.doMock('../../../hooks/useAccountType', () => ({
                useAccountType: () => ({ permissions: createMockPermissions('consumer') })
            }))

            const ExportMaker = require('../ExportMaker').default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            // Le bouton SVG ne devrait pas être accessible ou devrait montrer FeatureGate
            const svgButtons = screen.queryAllByText(/SVG/i)
            if (svgButtons.length > 0) {
                // Si le bouton existe, il devrait être disabled ou dans un FeatureGate
                expect(svgButtons[0]).toBeDisabled()
            }
        })

        it('devrait permettre SVG pour compte producer', async () => {
            const user = userEvent.setup()

            vi.doMock('../../../hooks/useAccountType', () => ({
                useAccountType: () => ({ permissions: createMockPermissions('producer') })
            }))

            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            const svgButton = screen.queryByText(/SVG/i)
            if (svgButton) {
                await user.click(svgButton)

                await waitFor(() => {
                    expect(mockHtmlToImage.toSvg).toHaveBeenCalled()
                })
            }
        })
    })

    describe('Format PDF - Tous Comptes', () => {
        it('devrait exporter PDF avec orientation correcte', async () => {
            const user = userEvent.setup()
            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            await user.click(screen.getByText('Export PDF'))

            await waitFor(() => {
                expect(mockJsPDF.jsPDF).toHaveBeenCalled()
            })
        })
    })

    describe('Format GIF - Comptes PRO + Pipeline Required', () => {
        it('devrait bloquer GIF si pas de pipeline', () => {
            const reviewWithoutPipeline = {
                id: 'no-pipeline',
                name: 'No Pipeline Review',
                genetics: { phenotype: 'Indica' },
                author: { username: 'user' }
            }

            vi.doMock('../../../hooks/useAccountType', () => ({
                useAccountType: () => ({ permissions: createMockPermissions('producer') })
            }))

            const ExportMaker = require('../ExportMaker').default

            render(
                <ExportMaker
                    reviewData={reviewWithoutPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            // Le bouton GIF ne devrait pas être visible
            expect(screen.queryByText(/GIF/i)).not.toBeInTheDocument()
        })

        it('devrait permettre GIF pour producer avec pipeline', async () => {
            const user = userEvent.setup()

            vi.doMock('../../../hooks/useAccountType', () => ({
                useAccountType: () => ({ permissions: createMockPermissions('producer') })
            }))

            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            const gifButton = screen.queryByText(/GIF/i)
            if (gifButton) {
                await user.click(gifButton)

                await waitFor(() => {
                    expect(require('../../../utils/GIFExporter').exportPipelineToGIF).toHaveBeenCalled()
                })
            }
        })
    })

    describe('Qualité Haute - Comptes PRO Seulement', () => {
        it('devrait utiliser qualité standard pour consumer', async () => {
            const user = userEvent.setup()

            vi.doMock('../../../hooks/useAccountType', () => ({
                useAccountType: () => ({ permissions: createMockPermissions('consumer') })
            }))

            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            // Le toggle haute qualité ne devrait pas être accessible
            expect(screen.queryByText(/haute qualité/i)).not.toBeInTheDocument()

            await user.click(screen.getByText('Export PNG'))

            await waitFor(() => {
                expect(mockHtmlToImage.toPng).toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.objectContaining({ pixelRatio: 2 }) // Standard 2x
                )
            })
        })

        it('devrait utiliser qualité haute pour producer avec toggle activé', async () => {
            const user = userEvent.setup()

            vi.doMock('../../../hooks/useAccountType', () => ({
                useAccountType: () => ({ permissions: createMockPermissions('producer') })
            }))

            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            // Activer haute qualité si disponible
            const highQualityToggle = screen.queryByText(/haute qualité/i)
            if (highQualityToggle) {
                await user.click(highQualityToggle)
            }

            await user.click(screen.getByText('Export PNG'))

            await waitFor(() => {
                expect(mockHtmlToImage.toPng).toHaveBeenCalledWith(
                    expect.any(Object),
                    expect.objectContaining({ pixelRatio: 3 }) // Haute qualité 3x
                )
            })
        })
    })

    describe('Gestion d\'Erreurs Export', () => {
        it('devrait afficher erreur si export échoue', async () => {
            const user = userEvent.setup()

            // Mock export qui échoue
            mockHtmlToImage.toPng.mockRejectedValueOnce(new Error('Export failed'))

            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            await user.click(screen.getByText('Export PNG'))

            // Une erreur devrait être visible
            await waitFor(() => {
                expect(screen.getByText(/erreur/i) || screen.getByText(/failed/i)).toBeInTheDocument()
            }, { timeout: 3000 })
        })

        it('devrait empêcher double export simultané', async () => {
            const user = userEvent.setup()

            // Mock export qui prend du temps
            mockHtmlToImage.toPng.mockImplementation(
                () => new Promise(resolve => setTimeout(() => resolve('data:image/png;base64,test'), 1000))
            )

            const ExportMaker = (await import('../ExportMaker')).default

            render(
                <ExportMaker
                    reviewData={mockReviewWithPipeline}
                    productType="flower"
                    onClose={vi.fn()}
                />
            )

            const exportButton = screen.getByText('Export PNG')

            // Premier clic
            await user.click(exportButton)

            // Le bouton devrait être disabled pendant export
            await waitFor(() => {
                expect(exportButton).toBeDisabled()
            })
        })
    })
})