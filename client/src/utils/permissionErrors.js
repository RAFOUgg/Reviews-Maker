/**
 * SPRINT 1 - Part 1.2: Standardized Permission Error Handling
 * 
 * Mirrors backend error responses exactly
 */

/**
 * Permission error types
 */
export const PERMISSION_ERRORS = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  ACCOUNT_UPGRADE_REQUIRED: 'ACCOUNT_UPGRADE_REQUIRED',
  SECTION_NOT_AVAILABLE: 'SECTION_NOT_AVAILABLE',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  EXPORT_FORMAT_NOT_AVAILABLE: 'EXPORT_FORMAT_NOT_AVAILABLE',
  TEMPLATE_NOT_AVAILABLE: 'TEMPLATE_NOT_AVAILABLE',
  PHENOHUNT_DISABLED: 'PHENOHUNT_DISABLED',
  INVALID_ACCOUNT_TYPE: 'INVALID_ACCOUNT_TYPE'
}

/**
 * Create standardized permission error response
 */
export function createPermissionError(type, details = {}) {
  const errorMap = {
    [PERMISSION_ERRORS.UNAUTHORIZED]: {
      statusCode: 401,
      message: 'Authentication required',
      userMessage: 'Veuillez vous connecter pour accéder à cette fonctionnalité',
      action: 'login'
    },
    [PERMISSION_ERRORS.FORBIDDEN]: {
      statusCode: 403,
      message: 'Access denied',
      userMessage: 'Vous n\'avez pas accès à cette fonctionnalité',
      action: 'contact_support'
    },
    [PERMISSION_ERRORS.SUBSCRIPTION_REQUIRED]: {
      statusCode: 403,
      message: 'Active subscription required',
      userMessage: 'Un abonnement actif est nécessaire pour accéder à cette fonctionnalité',
      action: 'upgrade_subscription',
      upgradeUrl: '/pricing'
    },
    [PERMISSION_ERRORS.ACCOUNT_UPGRADE_REQUIRED]: {
      statusCode: 403,
      message: 'Account type upgrade required',
      userMessage: `Vous devez passer au compte ${details.requiredTier}`,
      action: 'upgrade_account',
      upgradeUrl: `/pricing?tier=${details.requiredTier}`,
      requiredTier: details.requiredTier
    },
    [PERMISSION_ERRORS.SECTION_NOT_AVAILABLE]: {
      statusCode: 403,
      message: 'Section not available for your account',
      userMessage: `La section "${details.section}" n'est pas disponible pour votre compte`,
      action: 'upgrade_account',
      requiredTier: details.requiredTier || 'Producteur'
    },
    [PERMISSION_ERRORS.FEATURE_NOT_AVAILABLE]: {
      statusCode: 403,
      message: 'Feature not available for your account',
      userMessage: `La fonctionnalité "${details.feature}" n'est pas disponible pour votre compte`,
      action: 'upgrade_account',
      requiredTier: details.requiredTier || 'Producteur'
    },
    [PERMISSION_ERRORS.EXPORT_FORMAT_NOT_AVAILABLE]: {
      statusCode: 403,
      message: 'Export format not available',
      userMessage: `L'export en ${details.format} n'est pas disponible pour votre compte`,
      action: 'upgrade_account',
      requiredTier: details.requiredTier || 'Producteur'
    },
    [PERMISSION_ERRORS.TEMPLATE_NOT_AVAILABLE]: {
      statusCode: 403,
      message: 'Template not available',
      userMessage: `Le template "${details.template}" n'est pas disponible pour votre compte`,
      action: 'upgrade_account',
      requiredTier: details.requiredTier || 'Producteur'
    },
    [PERMISSION_ERRORS.PHENOHUNT_DISABLED]: {
      statusCode: 403,
      message: 'PhenoHunt feature disabled for this account',
      userMessage: 'La fonctionnalité PhenoHunt est réservée aux comptes Producteur',
      action: 'upgrade_account',
      requiredTier: 'Producteur'
    },
    [PERMISSION_ERRORS.INVALID_ACCOUNT_TYPE]: {
      statusCode: 400,
      message: 'Invalid account type',
      userMessage: 'Configuration du compte invalide',
      action: 'contact_support'
    }
  }

  const baseError = errorMap[type] || {
    statusCode: 403,
    message: 'Permission denied',
    userMessage: 'Vous n\'avez pas les permissions nécessaires',
    action: 'contact_support'
  }

  return {
    type,
    ...baseError,
    timestamp: new Date().toISOString(),
    ...details
  }
}

/**
 * Parse API error response and extract permission error
 */
export function parsePermissionError(apiError) {
  if (!apiError?.response?.data) {
    return createPermissionError(
      PERMISSION_ERRORS.FORBIDDEN,
      { originalError: apiError }
    )
  }

  const { data } = apiError.response
  
  // If backend sent permission error directly
  if (data.type && data.type in PERMISSION_ERRORS) {
    return data
  }

  // If 403 status, likely permission error
  if (apiError.response.status === 403) {
    return createPermissionError(
      PERMISSION_ERRORS.FORBIDDEN,
      { message: data.message }
    )
  }

  // If 401 status, unauthorized
  if (apiError.response.status === 401) {
    return createPermissionError(PERMISSION_ERRORS.UNAUTHORIZED)
  }

  return createPermissionError(
    PERMISSION_ERRORS.FORBIDDEN,
    { originalError: data }
  )
}

/**
 * React Hook: usePermissionError
 * 
 * Handles permission errors with standard UI pattern
 */
export function usePermissionError() {
  const [error, setError] = React.useState(null)
  const navigate = useNavigate()

  const handleError = (apiError) => {
    const permError = parsePermissionError(apiError)
    setError(permError)
    
    // Log permission denial
    logPermissionDenial(permError.feature || 'unknown', permError.requiredTier)
    
    // Auto-redirect based on action
    if (permError.action === 'login') {
      navigate('/auth/login')
    } else if (permError.action === 'upgrade_account') {
      navigate(permError.upgradeUrl || '/pricing')
    }
    
    return permError
  }

  const clearError = () => setError(null)

  return { error, handleError, clearError }
}

/**
 * Component: PermissionErrorDisplay
 * 
 * Render permission error with action buttons
 */
export function PermissionErrorDisplay({ error, onDismiss }) {
  if (!error) return null

  const getActionLabel = () => {
    const labels = {
      upgrade_account: 'Passer à un compte supérieur',
      upgrade_subscription: 'Renouveler abonnement',
      login: 'Se connecter',
      contact_support: 'Contacter le support'
    }
    return labels[error.action] || 'Fermer'
  }

  const getActionPath = () => {
    const paths = {
      upgrade_account: error.upgradeUrl || '/pricing',
      upgrade_subscription: '/pricing',
      login: '/auth/login',
      contact_support: 'mailto:support@reviews-maker.com'
    }
    return paths[error.action]
  }

  return (
    <div className="permission-error-display bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex gap-3">
        <LockIcon className="w-5 h-5 text-red-600 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-red-900">{error.userMessage}</h3>
          {error.message && (
            <p className="text-sm text-red-700 mt-1">{error.message}</p>
          )}
          
          {error.requiredTier && (
            <p className="text-sm text-red-600 mt-2">
              ✨ Disponible avec le compte <strong>{error.requiredTier}</strong>
            </p>
          )}
        </div>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            const path = getActionPath()
            if (path.startsWith('mailto:')) {
              window.location.href = path
            } else {
              navigate(path)
            }
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {getActionLabel()}
        </button>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            Fermer
          </button>
        )}
      </div>
    </div>
  )
}

/**
 * Helper: Log permission denial for analytics
 */
async function logPermissionDenial(feature, requiredTier) {
  try {
    await axios.post('/api/logs/permission-denial', {
      feature,
      requiredTier,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    // Fail silently - don't break UX if logging fails
    console.debug('Failed to log permission denial:', error)
  }
}

export default {
  PERMISSION_ERRORS,
  createPermissionError,
  parsePermissionError,
  usePermissionError,
  PermissionErrorDisplay,
  logPermissionDenial
}
