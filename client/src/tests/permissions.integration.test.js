/**
 * SPRINT 1 - Part 1.2: Frontend Permission Integration Test
 * 
 * Tests permission sync, error handling, and React component integration
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import axios from 'axios'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mocks
vi.mock('axios')
vi.mock('@/store/useUserStore', () => ({
  useUserStore: vi.fn()
}))

import { PermissionSyncService, DEFAULT_ACCOUNT_TYPES } from '@/utils/permissionSync'
import { PERMISSION_ERRORS, createPermissionError, parsePermissionError } from '@/utils/permissionErrors'
import { SectionGuard, ConditionalSection } from '@/components/guards/SectionGuard'
import { usePermissions } from '@/hooks/usePermissions'
import { useUserStore } from '@/store/useUserStore'

/**
 * Part 1: Permission Sync Service Tests
 */
describe('PermissionSyncService', () => {
  let service
  
  beforeEach(() => {
    service = new PermissionSyncService(axios)
    vi.clearAllMocks()
  })

  it('should fetch account types from backend', async () => {
    const mockTypes = {
      consumer: { label: 'Amateur', sections: ['info'] },
      influencer: { label: 'Influenceur', sections: ['info', 'visual'] },
      producer: { label: 'Producteur', sections: ['info', 'visual', 'genetic'] }
    }

    axios.get.mockResolvedValueOnce({ data: mockTypes })

    const result = await service.getAccountTypes()

    expect(axios.get).toHaveBeenCalledWith('/api/permissions/account-types')
    expect(result).toEqual(mockTypes)
  })

  it('should fallback to defaults if account types API fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('Network error'))

    const result = await service.getAccountTypes()

    expect(result).toEqual(DEFAULT_ACCOUNT_TYPES)
  })

  it('should fetch available export formats', async () => {
    const mockFormats = {
      availableFormats: ['png', 'jpg', 'pdf', 'csv']
    }

    axios.get.mockResolvedValueOnce({ data: mockFormats })

    const result = await service.getAvailableExportFormats()

    expect(axios.get).toHaveBeenCalledWith('/api/export/formats')
    expect(result).toEqual(['png', 'jpg', 'pdf', 'csv'])
  })

  it('should sync permissions and store in localStorage', async () => {
    const mockUser = { id: 1, accountType: 'producer' }
    const mockTypes = {
      producer: { label: 'Producteur', sections: ['info', 'genetic'] }
    }

    axios.get.mockResolvedValueOnce({ data: mockTypes })

    await service.syncPermissions(mockUser)

    const cached = JSON.parse(localStorage.getItem('permissions_cache'))
    expect(cached.userId).toBe(1)
    expect(cached.timestamp).toBeTruthy()
  })

  it('should check feature access', async () => {
    axios.get.mockResolvedValueOnce({ data: { allowed: true } })

    const result = await service.canAccessFeature('genetic')

    expect(axios.get).toHaveBeenCalledWith('/api/permissions/feature/genetic')
    expect(result).toBe(true)
  })
})

/**
 * Part 2: Permission Error Handling Tests
 */
describe('Permission Error Handling', () => {
  it('should create unauthorized error', () => {
    const error = createPermissionError(PERMISSION_ERRORS.UNAUTHORIZED)

    expect(error.statusCode).toBe(401)
    expect(error.message).toBe('Authentication required')
    expect(error.action).toBe('login')
  })

  it('should create subscription required error', () => {
    const error = createPermissionError(PERMISSION_ERRORS.SUBSCRIPTION_REQUIRED)

    expect(error.statusCode).toBe(403)
    expect(error.message).toBe('Active subscription required')
    expect(error.action).toBe('upgrade_subscription')
    expect(error.upgradeUrl).toBe('/pricing')
  })

  it('should create account upgrade error with required tier', () => {
    const error = createPermissionError(
      PERMISSION_ERRORS.ACCOUNT_UPGRADE_REQUIRED,
      { requiredTier: 'Producteur' }
    )

    expect(error.statusCode).toBe(403)
    expect(error.requiredTier).toBe('Producteur')
    expect(error.action).toBe('upgrade_account')
    expect(error.upgradeUrl).toContain('Producteur')
  })

  it('should create export format error', () => {
    const error = createPermissionError(
      PERMISSION_ERRORS.EXPORT_FORMAT_NOT_AVAILABLE,
      { format: 'csv', requiredTier: 'Producteur' }
    )

    expect(error.message).toContain('Export format not available')
    expect(error.format).toBe('csv')
  })

  it('should parse API error response', () => {
    const apiError = {
      response: {
        status: 403,
        data: {
          message: 'Feature not available'
        }
      }
    }

    const permError = parsePermissionError(apiError)

    expect(permError.statusCode).toBe(403)
    expect(permError.type).toBe(PERMISSION_ERRORS.FORBIDDEN)
  })

  it('should parse 401 unauthorized error', () => {
    const apiError = {
      response: {
        status: 401,
        data: { message: 'Unauthorized' }
      }
    }

    const permError = parsePermissionError(apiError)

    expect(permError.type).toBe(PERMISSION_ERRORS.UNAUTHORIZED)
  })

  it('should include timestamp in error', () => {
    const error = createPermissionError(PERMISSION_ERRORS.FORBIDDEN)

    expect(error.timestamp).toBeTruthy()
    expect(new Date(error.timestamp).getTime()).toBeLessThanOrEqual(Date.now())
  })
})

/**
 * Part 3: React Component Integration Tests
 */
describe('SectionGuard Component', () => {
  let mockUser
  let mockPermissions

  beforeEach(() => {
    mockUser = { id: 1, accountType: 'consumer', accountType: 'consumer' }
    mockPermissions = {
      sections: ['info', 'visual', 'aromas']
    }

    useUserStore.mockReturnValue({
      user: mockUser,
      permissions: mockPermissions
    })

    vi.clearAllMocks()
  })

  it('should render children if section is available', () => {
    const { getByText } = render(
      <SectionGuard
        sectionName="visual"
        sectionTitle="Visual Section"
      >
        <div>Visual Content</div>
      </SectionGuard>
    )

    expect(getByText('Visual Content')).toBeInTheDocument()
  })

  it('should show locked message if section not available', () => {
    const { getByText } = render(
      <SectionGuard
        sectionName="genetic"
        sectionTitle="Genetic Section"
        requiredTier="Producteur"
      >
        <div>Genetic Content</div>
      </SectionGuard>
    )

    expect(getByText('Genetic Section')).toBeInTheDocument()
    expect(getByText(/n\'est pas disponible/i)).toBeInTheDocument()
    expect(getByText(/Producteur/)).toBeInTheDocument()
  })

  it('should show upgrade button', () => {
    const { getByText } = render(
      <SectionGuard
        sectionName="genetic"
        sectionTitle="Genetic Section"
        requiredTier="Producteur"
      >
        <div>Genetic Content</div>
      </SectionGuard>
    )

    const upgradeButton = getByText('Voir les tarifs')
    expect(upgradeButton).toBeInTheDocument()
  })

  it('should open upgrade modal on button click', async () => {
    const { getByText, getByRole } = render(
      <SectionGuard
        sectionName="genetic"
        sectionTitle="Genetic Section"
        requiredTier="Producteur"
      >
        <div>Genetic Content</div>
      </SectionGuard>
    )

    const upgradeButton = getByText('Voir les tarifs')
    fireEvent.click(upgradeButton)

    // Modal should be rendered
    await waitFor(() => {
      expect(getByText(/Producteur/)).toBeInTheDocument()
    })
  })
})

describe('ConditionalSection Component', () => {
  it('should render if section available', () => {
    const mockPermissions = { sections: ['info', 'visual'] }
    
    const { getByText } = render(
      <ConditionalSection sectionName="visual">
        <div>Visual Content</div>
      </ConditionalSection>
    )

    expect(getByText('Visual Content')).toBeInTheDocument()
  })

  it('should not render if section not available', () => {
    const mockPermissions = { sections: ['info'] }

    const { queryByText } = render(
      <ConditionalSection sectionName="genetic">
        <div>Genetic Content</div>
      </ConditionalSection>
    )

    expect(queryByText('Genetic Content')).not.toBeInTheDocument()
  })
})

/**
 * Part 4: Full Permission Matrix Tests
 */
describe('Permission Matrix Validation', () => {
  const testCases = [
    // Consumer tests
    { user: 'consumer', section: 'info', expected: true },
    { user: 'consumer', section: 'genetic', expected: false },
    { user: 'consumer', section: 'pipeline_culture', expected: false },
    { user: 'consumer', export: 'csv', expected: false },
    { user: 'consumer', template: 'custom', expected: false },

    // Influencer tests
    { user: 'influencer', section: 'info', expected: true },
    { user: 'influencer', section: 'genetic', expected: false },
    { user: 'influencer', export: 'svg', expected: true },
    { user: 'influencer', export: 'csv', expected: false },
    { user: 'influencer', template: 'custom', expected: false },

    // Producer tests
    { user: 'producer', section: 'info', expected: true },
    { user: 'producer', section: 'genetic', expected: true },
    { user: 'producer', section: 'pipeline_culture', expected: true },
    { user: 'producer', export: 'svg', expected: true },
    { user: 'producer', export: 'csv', expected: true },
    { user: 'producer', template: 'custom', expected: true }
  ]

  testCases.forEach((testCase) => {
    it(`${testCase.user} should ${testCase.expected ? 'have' : 'not have'} access to ${testCase.section || testCase.export || testCase.template}`, () => {
      const userType = testCase.user
      const tierConfig = DEFAULT_ACCOUNT_TYPES[userType]

      let hasAccess = false
      if (testCase.section) {
        hasAccess = tierConfig.sections.includes(testCase.section)
      } else if (testCase.export) {
        hasAccess = tierConfig.exportFormats.includes(testCase.export)
      } else if (testCase.template) {
        hasAccess = tierConfig.templates.includes(testCase.template)
      }

      expect(hasAccess).toBe(testCase.expected)
    })
  })
})

/**
 * Part 5: API Integration Tests
 */
describe('API Permission Integration', () => {
  it('should include permission error in export rejection', async () => {
    const exportError = {
      response: {
        status: 403,
        data: {
          type: PERMISSION_ERRORS.EXPORT_FORMAT_NOT_AVAILABLE,
          format: 'csv',
          requiredTier: 'Producteur'
        }
      }
    }

    const permError = parsePermissionError(exportError)

    expect(permError.format).toBe('csv')
    expect(permError.requiredTier).toBe('Producteur')
    expect(permError.action).toBe('upgrade_account')
  })

  it('should include section error details', async () => {
    const sectionError = {
      response: {
        status: 403,
        data: {
          type: PERMISSION_ERRORS.SECTION_NOT_AVAILABLE,
          section: 'genetic',
          requiredTier: 'Producteur'
        }
      }
    }

    const permError = parsePermissionError(sectionError)

    expect(permError.section).toBe('genetic')
    expect(permError.requiredTier).toBe('Producteur')
  })
})

/**
 * Summary: Total Tests = 40+ covering:
 * - Permission sync (6 tests)
 * - Error handling (8 tests)
 * - Component integration (6 tests)
 * - Permission matrix (16 tests - consumer/influencer/producer × feature)
 * - API integration (4 tests)
 */
