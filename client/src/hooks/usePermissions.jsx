/**
 * SPRINT 1 - Part 1.2: Frontend Permission Guards
 * 
 * Implement permission-based UI rendering and access control on the client side
 * Prevents users from seeing restricted features
 */

import React, { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { ACCOUNT_TIERS } from '../utils/permissions'

/**
 * Hook: usePermissions
 * 
 * Main hook for checking permissions in components
 * Returns permission checking functions
 */
export function usePermissions() {
    const { user } = useStore()
    const accountType = user?.accountType || 'consumer'

    // Feature matrix based on BACKEND permissions
    const permissions = useMemo(() => ({
        sections: {
            info: true,
            visual: true,
            genetic: accountType === 'producer',
            aromas: true,
            taste: true,
            texture: accountType === 'producer',
            effects: true,
            pipeline_curing: true,
            pipeline_culture: accountType === 'producer'
        },

        templates: {
            compact: true,
            detailed: true,
            complete: true,
            influencer: accountType !== 'consumer',
            custom: accountType === 'producer'
        },

        exports: {
            png: true,
            jpg: true,
            pdf: true,
            svg: accountType !== 'consumer',
            csv: accountType === 'producer',
            json: accountType === 'producer',
            html: accountType === 'producer'
        },

        features: {
            phenohunt: accountType === 'producer',
            presets_custom: accountType !== 'consumer',
            batch_export: accountType === 'producer',
            advanced_customization: accountType !== 'consumer'
        }
    }), [accountType])

    return {
        accountType,
        permissions,
        hasSection: (section) => permissions.sections[section] || false,
        hasTemplate: (template) => permissions.templates[template] || false,
        canExport: (format) => permissions.exports[format] || false,
        hasFeature: (feature) => permissions.features[feature] || false,
        isUpgrade: (feature) => !permissions[feature] // Check if feature is blocked
    }
}

/**
 * Component: SectionGuard
 * 
 * Conditionally renders section if user has permission
 * Shows "Upgrade Required" if blocked
 */
export function SectionGuard({ section, children, label = section }) {
    const { hasSection, accountType, isUpgrade } = usePermissions()

    if (!hasSection(section)) {
        return (
            <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-medium text-gray-900">{label}</h3>
                        <p className="text-sm text-gray-600">
                            {label} is available for Producteur members
                        </p>
                    </div>
                    <a
                        href="/pricing"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Upgrade
                    </a>
                </div>
            </div>
        )
    }

    return children
}

/**
 * Component: FeatureUpgradeModal
 * 
 * Modal shown when user tries to access restricted feature
 */
export function FeatureUpgradeModal({ feature, isOpen, onClose, featureName = feature }) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md">
                <h2 className="text-xl font-bold mb-4">Upgrade Required</h2>

                <p className="text-gray-600 mb-6">
                    <strong>{featureName}</strong> is only available for Producteur members.
                </p>

                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
                    <div className="font-medium text-blue-900 mb-2">Producteur - €29.99/month</div>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>✓ All export formats (CSV, JSON, HTML)</li>
                        <li>✓ Genetics management</li>
                        <li>✓ PhenoHunt genealogy</li>
                        <li>✓ Custom templates</li>
                        <li>✓ Batch exports</li>
                    </ul>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <a
                        href="/pricing"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
                    >
                        View Plans
                    </a>
                </div>
            </div>
        </div>
    )
}

/**
 * Component: ConditionalFeature
 * 
 * Renders feature or shows upgrade button
 */
export function ConditionalFeature({ feature, children, label, fallback }) {
    const { hasFeature } = usePermissions()
    const [showModal, setShowModal] = React.useState(false)

    if (hasFeature(feature)) {
        return (
            <>
                {children}
                <FeatureUpgradeModal
                    feature={feature}
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    featureName={label || feature}
                />
            </>
        )
    }

    return fallback || (
        <button
            onClick={() => setShowModal(true)}
            className="w-full p-4 border-2 border-dashed border-gray-300 rounded text-gray-600 hover:bg-gray-50"
        >
            🔒 {label || feature} (Upgrade to unlock)
        </button>
    )
}

/**
 * Example: Review Form Sections
 */
export function CreateFlowerReviewForm() {
    const { permissions } = usePermissions()

    return (
        <div className="space-y-6">
            {/* Section 1: Info (always visible) */}
            <SectionGuard section="info" label="General Information">
                <GeneralInfoSection />
            </SectionGuard>

            {/* Section 2: Genetics (producer only) */}
            {permissions.sections.genetic && (
                <SectionGuard section="genetic" label="Genetics">
                    <GeneticsSection />
                </SectionGuard>
            )}

            {/* Section 3: Visual (always visible) */}
            <SectionGuard section="visual" label="Visual & Appearance">
                <VisualSection />
            </SectionGuard>

            {/* Fallback for restricted sections */}
            {!permissions.sections.genetic && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                    <p className="font-medium text-yellow-900">🔒 Genetics Section</p>
                    <p className="text-sm text-yellow-700">
                        Manage cultivars and breeding data (Producteur only)
                    </p>
                    <a href="/pricing" className="text-sm font-medium text-yellow-600 hover:text-yellow-700">
                        Upgrade to access →
                    </a>
                </div>
            )}
        </div>
    )
}

/**
 * Example: Export Menu
 */
export function ExportMenu({ reviewId, onExport }) {
    const { canExport, accountType } = usePermissions()
    const [selectedFormat, setSelectedFormat] = React.useState('pdf')
    const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)
    const [blockedFormat, setBlockedFormat] = React.useState(null)

    const formats = [
        { id: 'png', label: 'PNG Image' },
        { id: 'jpg', label: 'JPEG Image' },
        { id: 'pdf', label: 'PDF Document' },
        { id: 'svg', label: 'SVG Vector', premium: true },
        { id: 'csv', label: 'CSV Data', producerOnly: true },
        { id: 'json', label: 'JSON Data', producerOnly: true },
        { id: 'html', label: 'HTML Page', producerOnly: true }
    ]

    const handleExport = (format) => {
        if (!canExport(format)) {
            setBlockedFormat(format)
            setShowUpgradeModal(true)
            return
        }
        onExport(format)
    }

    return (
        <>
            <div className="space-y-2">
                {formats.map(format => (
                    <button
                        key={format.id}
                        onClick={() => handleExport(format.id)}
                        disabled={!canExport(format.id)}
                        className={`w-full p-3 text-left rounded border transition-colors ${canExport(format.id)
                                ? 'border-gray-300 hover:bg-blue-50 cursor-pointer'
                                : 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        <div className="flex items-center justify-between">
                            <span className="font-medium">{format.label}</span>
                            {!canExport(format.id) && (
                                <span className="text-xs font-semibold text-gray-400">
                                    {format.producerOnly ? 'PRODUCTEUR' : 'PREMIUM'}
                                </span>
                            )}
                        </div>
                    </button>
                ))}
            </div>

            <FeatureUpgradeModal
                feature={blockedFormat}
                isOpen={showUpgradeModal}
                onClose={() => setShowUpgradeModal(false)}
                featureName={`${blockedFormat} export`}
            />
        </>
    )
}

/**
 * Example: Account Tier Display
 */
export function AccountTierBadge() {
    const { accountType } = usePermissions()

    const tierInfo = {
        consumer: {
            label: 'Amateur',
            color: 'bg-gray-100 text-gray-800',
            icon: '🎓'
        },
        influencer: {
            label: 'Influenceur',
            color: 'bg-purple-100 text-purple-800',
            icon: '⭐'
        },
        producer: {
            label: 'Producteur',
            color: 'bg-blue-100 text-blue-800',
            icon: '👑'
        }
    }

    const info = tierInfo[accountType] || tierInfo.consumer

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full ${info.color}`}>
            <span>{info.icon}</span>
            <span className="font-medium">{info.label}</span>
        </div>
    )
}

/**
 * Helper: Feature Matrix for Debugging
 */
export function PermissionMatrix() {
    const { permissions, accountType } = usePermissions()

    return (
        <div className="p-4 bg-gray-50 rounded-lg">
            <h3 className="font-bold mb-4">Permission Matrix - {accountType}</h3>

            <div className="space-y-3 text-sm">
                <div>
                    <strong>Sections:</strong>
                    <div className="ml-4">{Object.entries(permissions.sections)
                        .map(([k, v]) => `${k}: ${v ? '✓' : '✗'}`)
                        .join(', ')}
                    </div>
                </div>

                <div>
                    <strong>Export Formats:</strong>
                    <div className="ml-4">{Object.entries(permissions.exports)
                        .map(([k, v]) => `${k}: ${v ? '✓' : '✗'}`)
                        .join(', ')}
                    </div>
                </div>

                <div>
                    <strong>Templates:</strong>
                    <div className="ml-4">{Object.entries(permissions.templates)
                        .map(([k, v]) => `${k}: ${v ? '✓' : '✗'}`)
                        .join(', ')}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default {
    usePermissions,
    SectionGuard,
    ConditionalFeature,
    FeatureUpgradeModal,
    CreateFlowerReviewForm,
    ExportMenu,
    AccountTierBadge,
    PermissionMatrix
}
