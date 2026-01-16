/**
 * Sprint 1: Frontend Permission System Validation
 * ===============================================
 * 
 * Validates frontend permission hooks and guards render correctly
 * Run with: npm test -- permissions.frontend.test.js
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { usePermissions, SectionGuard, FeatureUpgradeModal } from '@/hooks/usePermissions'
import { useUserStore } from '@/store/user'
import { BrowserRouter } from 'react-router-dom'

// ============================================================================
// MOCK SETUP
// ============================================================================

jest.mock('@/store/user')

const mockConsumerUser = {
    id: 'user_consumer',
    email: 'consumer@test.com',
    accountType: 'consumer',
    subscription: null
}

const mockInfluencerUser = {
    id: 'user_influencer',
    email: 'influencer@test.com',
    accountType: 'influencer',
    subscription: { status: 'active', tier: 'influencer' }
}

const mockProducerUser = {
    id: 'user_producer',
    email: 'producer@test.com',
    accountType: 'producer',
    subscription: { status: 'active', tier: 'producer' }
}

// ============================================================================
// TEST SUITE 1: usePermissions Hook
// ============================================================================

describe('Frontend: usePermissions Hook', () => {
    
    describe('1.0: Permission Matrix for Consumer', () => {
        beforeEach(() => {
            useUserStore.mockReturnValue({
                user: mockConsumerUser
            })
        })

        test('1.1: Consumer can access basic sections', () => {
            const TestComponent = () => {
                const { hasSection } = usePermissions()
                return (
                    <div>
                        <div data-testid="info">{hasSection('info') ? 'visible' : 'hidden'}</div>
                        <div data-testid="visual">{hasSection('visual') ? 'visible' : 'hidden'}</div>
                        <div data-testid="effects">{hasSection('effects') ? 'visible' : 'hidden'}</div>
                    </div>
                )
            }

            render(
                <BrowserRouter>
                    <TestComponent />
                </BrowserRouter>
            )

            expect(screen.getByTestId('info')).toHaveTextContent('visible')
            expect(screen.getByTestId('visual')).toHaveTextContent('visible')
            expect(screen.getByTestId('effects')).toHaveTextContent('visible')
        })

        test('1.2: Consumer cannot access producer sections (genetic, texture, culture_pipeline)', () => {
            const TestComponent = () => {
                const { hasSection } = usePermissions()
                return (
                    <div>
                        <div data-testid="genetic">{hasSection('genetic') ? 'visible' : 'hidden'}</div>
                        <div data-testid="texture">{hasSection('texture') ? 'visible' : 'hidden'}</div>
                        <div data-testid="pipeline_culture">{hasSection('pipeline_culture') ? 'visible' : 'hidden'}</div>
                    </div>
                )
            }

            render(
                <BrowserRouter>
                    <TestComponent />
                </BrowserRouter>
            )

            expect(screen.getByTestId('genetic')).toHaveTextContent('hidden')
            expect(screen.getByTestId('texture')).toHaveTextContent('hidden')
            expect(screen.getByTestId('pipeline_culture')).toHaveTextContent('hidden')
        })

        test('1.3: Consumer can export PNG/JPG/PDF only', () => {
            const TestComponent = () => {
                const { canExport } = usePermissions()
                return (
                    <div>
                        <div data-testid="png">{canExport('png') ? 'enabled' : 'disabled'}</div>
                        <div data-testid="jpg">{canExport('jpg') ? 'enabled' : 'disabled'}</div>
                        <div data-testid="pdf">{canExport('pdf') ? 'enabled' : 'disabled'}</div>
                        <div data-testid="csv">{canExport('csv') ? 'enabled' : 'disabled'}</div>
                        <div data-testid="json">{canExport('json') ? 'enabled' : 'disabled'}</div>
                    </div>
                )
            }

            render(
                <BrowserRouter>
                    <TestComponent />
                </BrowserRouter>
            )

            expect(screen.getByTestId('png')).toHaveTextContent('enabled')
            expect(screen.getByTestId('jpg')).toHaveTextContent('enabled')
            expect(screen.getByTestId('pdf')).toHaveTextContent('enabled')
            expect(screen.getByTestId('csv')).toHaveTextContent('disabled')
            expect(screen.getByTestId('json')).toHaveTextContent('disabled')
        })

        test('1.4: Consumer cannot use custom templates or batch export', () => {
            const TestComponent = () => {
                const { hasTemplate, hasFeature } = usePermissions()
                return (
                    <div>
                        <div data-testid="custom">{hasTemplate('custom') ? 'available' : 'unavailable'}</div>
                        <div data-testid="batch">{hasFeature('batch_export') ? 'available' : 'unavailable'}</div>
                        <div data-testid="phenohunt">{hasFeature('phenohunt') ? 'available' : 'unavailable'}</div>
                    </div>
                )
            }

            render(
                <BrowserRouter>
                    <TestComponent />
                </BrowserRouter>
            )

            expect(screen.getByTestId('custom')).toHaveTextContent('unavailable')
            expect(screen.getByTestId('batch')).toHaveTextContent('unavailable')
            expect(screen.getByTestId('phenohunt')).toHaveTextContent('unavailable')
        })
    })

    // ========================================================================

    describe('1.1: Permission Matrix for Influencer', () => {
        beforeEach(() => {
            useUserStore.mockReturnValue({
                user: mockInfluencerUser
            })
        })

        test('1.5: Influencer cannot access producer sections', () => {
            const TestComponent = () => {
                const { hasSection } = usePermissions()
                return (
                    <div>
                        <div data-testid="genetic">{hasSection('genetic') ? 'visible' : 'hidden'}</div>
                        <div data-testid="texture">{hasSection('texture') ? 'visible' : 'hidden'}</div>
                    </div>
                )
            }

            render(
                <BrowserRouter>
                    <TestComponent />
                </BrowserRouter>
            )

            expect(screen.getByTestId('genetic')).toHaveTextContent('hidden')
            expect(screen.getByTestId('texture')).toHaveTextContent('hidden')
        })

        test('1.6: Influencer can export SVG and GIF', () => {
            const TestComponent = () => {
                const { canExport } = usePermissions()
                return (
                    <div>
                        <div data-testid="svg">{canExport('svg') ? 'enabled' : 'disabled'}</div>
                        <div data-testid="gif">{canExport('gif') ? 'enabled' : 'disabled'}</div>
                        <div data-testid="csv">{canExport('csv') ? 'enabled' : 'disabled'}</div>
                    </div>
                )
            }

            render(
                <BrowserRouter>
                    <TestComponent />
                </BrowserRouter>
            )

            expect(screen.getByTestId('svg')).toHaveTextContent('enabled')
            expect(screen.getByTestId('gif')).toHaveTextContent('enabled')
            expect(screen.getByTestId('csv')).toHaveTextContent('disabled') // Still producer-only
        })

        test('1.7: Influencer has advanced customization but not phenohunt', () => {
            const TestComponent = () => {
                const { hasFeature } = usePermissions()
                return (
                    <div>
                        <div data-testid="custom_presets">{hasFeature('presets_custom') ? 'available' : 'unavailable'}</div>
                        <div data-testid="phenohunt">{hasFeature('phenohunt') ? 'available' : 'unavailable'}</div>
                    </div>
                )
            }

            render(
                <BrowserRouter>
                    <TestComponent />
                </BrowserRouter>
            )

            expect(screen.getByTestId('custom_presets')).toHaveTextContent('available')
            expect(screen.getByTestId('phenohunt')).toHaveTextContent('unavailable')
        })
    })

    // ========================================================================

    describe('1.2: Permission Matrix for Producer', () => {
        beforeEach(() => {
            useUserStore.mockReturnValue({
                user: mockProducerUser
            })
        })

        test('1.8: Producer can access all sections', () => {
            const TestComponent = () => {
                const { hasSection } = usePermissions()
                return (
                    <div>
                        <div data-testid="info">{hasSection('info') ? 'visible' : 'hidden'}</div>
                        <div data-testid="genetic">{hasSection('genetic') ? 'visible' : 'hidden'}</div>
                        <div data-testid="texture">{hasSection('texture') ? 'visible' : 'hidden'}</div>
                        <div data-testid="pipeline_culture">{hasSection('pipeline_culture') ? 'visible' : 'hidden'}</div>
                    </div>
                )
            }

            render(
                <BrowserRouter>
                    <TestComponent />
                </BrowserRouter>
            )

            expect(screen.getByTestId('info')).toHaveTextContent('visible')
            expect(screen.getByTestId('genetic')).toHaveTextContent('visible')
            expect(screen.getByTestId('texture')).toHaveTextContent('visible')
            expect(screen.getByTestId('pipeline_culture')).toHaveTextContent('visible')
        })

        test('1.9: Producer can export all formats', () => {
            const TestComponent = () => {
                const { canExport } = usePermissions()
                return (
                    <div>
                        <div data-testid="png">{canExport('png') ? 'enabled' : 'disabled'}</div>
                        <div data-testid="csv">{canExport('csv') ? 'enabled' : 'disabled'}</div>
                        <div data-testid="json">{canExport('json') ? 'enabled' : 'disabled'}</div>
                        <div data-testid="html">{canExport('html') ? 'enabled' : 'disabled'}</div>
                    </div>
                )
            }

            render(
                <BrowserRouter>
                    <TestComponent />
                </BrowserRouter>
            )

            expect(screen.getByTestId('png')).toHaveTextContent('enabled')
            expect(screen.getByTestId('csv')).toHaveTextContent('enabled')
            expect(screen.getByTestId('json')).toHaveTextContent('enabled')
            expect(screen.getByTestId('html')).toHaveTextContent('enabled')
        })

        test('1.10: Producer has all features including phenohunt', () => {
            const TestComponent = () => {
                const { hasFeature } = usePermissions()
                return (
                    <div>
                        <div data-testid="phenohunt">{hasFeature('phenohunt') ? 'available' : 'unavailable'}</div>
                        <div data-testid="batch">{hasFeature('batch_export') ? 'available' : 'unavailable'}</div>
                        <div data-testid="custom_template">{hasFeature('custom_template') ? 'available' : 'unavailable'}</div>
                    </div>
                )
            }

            render(
                <BrowserRouter>
                    <TestComponent />
                </BrowserRouter>
            )

            expect(screen.getByTestId('phenohunt')).toHaveTextContent('available')
            expect(screen.getByTestId('batch')).toHaveTextContent('available')
            expect(screen.getByTestId('custom_template')).toHaveTextContent('available')
        })
    })
})

// ============================================================================
// TEST SUITE 2: SectionGuard Component
// ============================================================================

describe('Frontend: SectionGuard Component', () => {
    
    test('2.1: SectionGuard renders children when section is allowed', () => {
        useUserStore.mockReturnValue({
            user: mockConsumerUser
        })

        const TestComponent = () => (
            <BrowserRouter>
                <SectionGuard section="info" label="Information">
                    <div data-testid="content">Protected content</div>
                </SectionGuard>
            </BrowserRouter>
        )

        render(<TestComponent />)
        expect(screen.getByTestId('content')).toBeInTheDocument()
        expect(screen.getByTestId('content')).toHaveTextContent('Protected content')
    })

    test('2.2: SectionGuard shows upgrade message when section is blocked', () => {
        useUserStore.mockReturnValue({
            user: mockConsumerUser
        })

        const TestComponent = () => (
            <BrowserRouter>
                <SectionGuard section="genetic" label="Genetics Canvas">
                    <div>This should not appear</div>
                </SectionGuard>
            </BrowserRouter>
        )

        render(<TestComponent />)
        expect(screen.queryByText('This should not appear')).not.toBeInTheDocument()
        expect(screen.getByText(/Genetics Canvas/i)).toBeInTheDocument()
        expect(screen.getByText(/Producteur/i)).toBeInTheDocument()
    })

    test('2.3: SectionGuard upgrade button links to pricing', () => {
        useUserStore.mockReturnValue({
            user: mockConsumerUser
        })

        const TestComponent = () => (
            <BrowserRouter>
                <SectionGuard section="texture" label="Texture Evaluation">
                    <div>Content</div>
                </SectionGuard>
            </BrowserRouter>
        )

        render(<TestComponent />)
        const upgradeButton = screen.getByText(/Upgrade/i)
        expect(upgradeButton).toHaveAttribute('href', '/pricing')
    })

    test('2.4: SectionGuard shows content for producer with restricted section', () => {
        useUserStore.mockReturnValue({
            user: mockProducerUser
        })

        const TestComponent = () => (
            <BrowserRouter>
                <SectionGuard section="genetic" label="Genetics Canvas">
                    <div data-testid="genetics-content">Genetics editor</div>
                </SectionGuard>
            </BrowserRouter>
        )

        render(<TestComponent />)
        expect(screen.getByTestId('genetics-content')).toBeInTheDocument()
    })
})

// ============================================================================
// TEST SUITE 3: Feature Access Buttons
// ============================================================================

describe('Frontend: Feature Access Buttons', () => {
    
    test('3.1: Export button is enabled for allowed formats', () => {
        useUserStore.mockReturnValue({
            user: mockConsumerUser
        })

        const TestComponent = () => {
            const { canExport } = usePermissions()
            return (
                <button 
                    disabled={!canExport('png')}
                    data-testid="export-png"
                >
                    Export PNG
                </button>
            )
        }

        const { getByTestId } = render(
            <BrowserRouter>
                <TestComponent />
            </BrowserRouter>
        )

        expect(getByTestId('export-png')).not.toBeDisabled()
    })

    test('3.2: Export button is disabled for blocked formats', () => {
        useUserStore.mockReturnValue({
            user: mockConsumerUser
        })

        const TestComponent = () => {
            const { canExport } = usePermissions()
            return (
                <button 
                    disabled={!canExport('csv')}
                    data-testid="export-csv"
                >
                    Export CSV
                </button>
            )
        }

        const { getByTestId } = render(
            <BrowserRouter>
                <TestComponent />
            </BrowserRouter>
        )

        expect(getByTestId('export-csv')).toBeDisabled()
    })

    test('3.3: Button styling reflects enabled/disabled state', () => {
        useUserStore.mockReturnValue({
            user: mockConsumerUser
        })

        const TestComponent = () => {
            const { canExport } = usePermissions()
            return (
                <div>
                    <button 
                        disabled={!canExport('png')}
                        className={!canExport('png') ? 'opacity-50' : 'opacity-100'}
                        data-testid="png-btn"
                    >
                        PNG
                    </button>
                    <button 
                        disabled={!canExport('csv')}
                        className={!canExport('csv') ? 'opacity-50' : 'opacity-100'}
                        data-testid="csv-btn"
                    >
                        CSV
                    </button>
                </div>
            )
        }

        const { getByTestId } = render(
            <BrowserRouter>
                <TestComponent />
            </BrowserRouter>
        )

        expect(getByTestId('png-btn')).toHaveClass('opacity-100')
        expect(getByTestId('csv-btn')).toHaveClass('opacity-50')
    })
})

// ============================================================================
// TEST SUITE 4: Account Type Changes
// ============================================================================

describe('Frontend: Permission Updates on Account Change', () => {
    
    test('4.1: Permissions update when user account type changes', () => {
        const { rerender } = render(
            <BrowserRouter>
                <TestPermissionComponent />
            </BrowserRouter>
        )

        // Start as consumer
        useUserStore.mockReturnValue({
            user: mockConsumerUser
        })

        let csvButton = screen.getByTestId('csv-btn')
        expect(csvButton).toBeDisabled()

        // Upgrade to producer
        useUserStore.mockReturnValue({
            user: mockProducerUser
        })

        rerender(
            <BrowserRouter>
                <TestPermissionComponent />
            </BrowserRouter>
        )

        csvButton = screen.getByTestId('csv-btn')
        expect(csvButton).not.toBeDisabled()
    })
})

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function TestPermissionComponent() {
    const { canExport } = usePermissions()
    return (
        <button disabled={!canExport('csv')} data-testid="csv-btn">
            Export CSV
        </button>
    )
}

// ============================================================================
// EXPORT FOR INTEGRATION
// ============================================================================

export {
    mockConsumerUser,
    mockInfluencerUser,
    mockProducerUser
}
