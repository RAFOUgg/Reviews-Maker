/**
 * test/components/CulturePipelineSection.test.jsx
 * Tests pour le composant SECTION 3 - Pipeline Culture
 * 
 * Suite: 5 tests components
 * Couvre: Rendering, State management, User interactions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CulturePipelineSection from '../../client/src/pages/review/CreateFlowerReview/sections/CulturePipelineSection'
import PipelineCalendarView from '../../client/src/components/forms/pipeline/PipelineCalendarView'
import '@testing-library/jest-dom'

/**
 * Test Suite 1: CulturePipelineSection Component
 */
describe('CulturePipelineSection Component', () => {
    const mockHandleChange = jest.fn()
    const defaultProps = {
        formData: {
            pipelineMode: 'jours',
            pipelineStartDate: '2025-01-18',
            pipelineEndDate: '2025-04-17',
            selectedPresets: {},
            pipelineStages: []
        },
        handleChange: mockHandleChange
    }

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('should render all main sections', () => {
        render(<CulturePipelineSection {...defaultProps} />)

        expect(screen.getByText(/Configuration Pipeline/i)).toBeInTheDocument()
        expect(screen.getByText(/Presets réutilisables/i)).toBeInTheDocument()
        expect(screen.getByText(/Données de Récolte/i)).toBeInTheDocument()
    })

    test('should toggle expansion of config section', async () => {
        const { container } = render(<CulturePipelineSection {...defaultProps} />)
        
        const configHeader = screen.getByText(/Configuration Pipeline/i).closest('div').parentElement
        
        fireEvent.click(configHeader)
        
        // Should collapse
        await waitFor(() => {
            expect(screen.queryByText(/Mode de suivi/i)).not.toBeInTheDocument()
        })

        // Should expand again
        fireEvent.click(configHeader)
        
        await waitFor(() => {
            expect(screen.getByText(/Mode de suivi/i)).toBeInTheDocument()
        })
    })

    test('should update pipeline mode on button click', async () => {
        const user = userEvent.setup()
        render(<CulturePipelineSection {...defaultProps} />)

        const weekButton = screen.getByRole('button', { name: /Semaines/i })
        await user.click(weekButton)

        expect(mockHandleChange).toHaveBeenCalledWith('pipelineMode', 'semaines')
    })

    test('should render harvest data inputs', () => {
        render(<CulturePipelineSection {...defaultProps} />)

        const harvestHeader = screen.getByText(/Données de Récolte/i).closest('div')
        fireEvent.click(harvestHeader)

        expect(screen.getByPlaceholderText(/Poids brut/i)).toBeInTheDocument()
        expect(screen.getByPlaceholderText(/Poids net/i)).toBeInTheDocument()
    })
})

/**
 * Test Suite 2: PipelineCalendarView Component
 */
describe('PipelineCalendarView Component', () => {
    const mockOnStageClick = jest.fn()
    const defaultProps = {
        startDate: '2025-01-18',
        endDate: '2025-04-17',
        mode: 'jours',
        stages: [
            {
                id: 'stage-1',
                date: '2025-01-18',
                notes: 'First day - Setup'
            }
        ],
        onStageClick: mockOnStageClick
    }

    test('should render calendar grid', () => {
        const { container } = render(<PipelineCalendarView {...defaultProps} />)

        // Should have 91 cells (13 weeks x 7 days)
        const cells = container.querySelectorAll('.calendar-cell')
        expect(cells.length).toBe(91)
    })

    test('should display legend', () => {
        render(<PipelineCalendarView {...defaultProps} />)

        expect(screen.getByText(/Pas de données/i)).toBeInTheDocument()
        expect(screen.getByText(/Données documentées/i)).toBeInTheDocument()
    })

    test('should show stats', () => {
        render(<PipelineCalendarView {...defaultProps} />)

        expect(screen.getByText(/Jours documentés/i)).toBeInTheDocument()
        expect(screen.getByText(/Couverture/i)).toBeInTheDocument()
    })

    test('should call onStageClick when cell is clicked', async () => {
        const user = userEvent.setup()
        const { container } = render(<PipelineCalendarView {...defaultProps} />)

        const firstCell = container.querySelector('.calendar-cell')
        await user.click(firstCell)

        expect(mockOnStageClick).toHaveBeenCalled()
    })

    test('should highlight cells with data', () => {
        const { container } = render(<PipelineCalendarView {...defaultProps} />)

        const cellsWithIndicator = container.querySelectorAll('.cell-indicator')
        expect(cellsWithIndicator.length).toBeGreaterThan(0)
    })
})

/**
 * Test Suite 3: Preset Selection Integration
 */
describe('PipelinePresetSelector Integration', () => {
    test('should display preset options', () => {
        render(
            <PipelinePresetSelector
                onSelect={jest.fn()}
                onClose={jest.fn()}
            />
        )

        expect(screen.getByText(/Espace de Culture/i)).toBeInTheDocument()
        expect(screen.getByText(/Substrat/i)).toBeInTheDocument()
        expect(screen.getByText(/Éclairage/i)).toBeInTheDocument()
    })

    test('should handle preset selection', async () => {
        const mockOnSelect = jest.fn()
        const user = userEvent.setup()

        render(
            <PipelinePresetSelector
                onSelect={mockOnSelect}
                onClose={jest.fn()}
            />
        )

        const presetOption = screen.getByText(/Tente Indoor 120x120cm/i)
        await user.click(presetOption)

        // Click apply button
        const applyButton = screen.getByText(/Appliquer Presets/i)
        await user.click(applyButton)

        expect(mockOnSelect).toHaveBeenCalled()
    })
})

/**
 * Test Suite 4: Config Modal Integration
 */
describe('PipelineConfigModal Integration', () => {
    test('should render configuration options', () => {
        render(
            <PipelineConfigModal
                mode="jours"
                selectedPresets={{}}
                onSave={jest.fn()}
                onClose={jest.fn()}
            />
        )

        expect(screen.getByText(/Environnement/i)).toBeInTheDocument()
        expect(screen.getByText(/Nutriments/i)).toBeInTheDocument()
        expect(screen.getByText(/Morphologie/i)).toBeInTheDocument()
    })

    test('should allow adding custom fields', async () => {
        const user = userEvent.setup()
        render(
            <PipelineConfigModal
                mode="jours"
                selectedPresets={{}}
                onSave={jest.fn()}
                onClose={jest.fn()}
            />
        )

        const addButton = screen.getByText(/Ajouter/i)
        await user.click(addButton)

        const inputs = screen.getAllByPlaceholderText(/Nom du champ/i)
        expect(inputs.length).toBeGreaterThan(0)
    })
})

/**
 * Test Suite 5: Form Data Synchronization
 */
describe('Form Data Synchronization', () => {
    test('should sync form data when state changes', async () => {
        const user = userEvent.setup()
        const mockHandleChange = jest.fn()

        const { rerender } = render(
            <CulturePipelineSection
                formData={{
                    pipelineMode: 'jours',
                    pipelineStartDate: '',
                    pipelineEndDate: '',
                    selectedPresets: {},
                    pipelineStages: []
                }}
                handleChange={mockHandleChange}
            />
        )

        // Update start date
        const dateInputs = screen.getAllByDisplayValue('')
        if (dateInputs.length > 0) {
            await user.type(dateInputs[0], '2025-01-18')
            expect(mockHandleChange).toHaveBeenCalled()
        }
    })

    test('should maintain stage list through updates', async () => {
        const mockHandleChange = jest.fn()
        const initialStages = [
            { id: '1', date: '2025-01-18', notes: 'Setup' }
        ]

        const { rerender } = render(
            <CulturePipelineSection
                formData={{
                    pipelineMode: 'jours',
                    pipelineStartDate: '2025-01-18',
                    pipelineEndDate: '2025-04-17',
                    selectedPresets: {},
                    pipelineStages: initialStages
                }}
                handleChange={mockHandleChange}
            />
        )

        // Stages should be preserved
        expect(mockHandleChange).toHaveBeenCalledWith('pipelineStages', initialStages)
    })
})

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
    ChevronDown: () => <div>ChevronDown</div>,
    Plus: () => <div>Plus</div>,
    Trash2: () => <div>Trash2</div>,
    Calendar: () => <div>Calendar</div>,
    Settings: () => <div>Settings</div>,
    X: () => <div>X</div>
}))

// Mock framer-motion
jest.mock('framer-motion', () => ({
    motion: {
        div: ({ children, ...props }) => <div {...props}>{children}</div>
    },
    AnimatePresence: ({ children }) => <>{children}</>
}))
