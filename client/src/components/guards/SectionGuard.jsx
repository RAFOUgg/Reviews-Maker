/**
 * SPRINT 1 - Part 1.2: Section Guard Component
 * 
 * Reusable component for protecting form sections based on account tier
 * Used in ReviewForm for genetic, pipeline_culture, and other producer-only sections
 */

import React, { useState } from 'react'
import { useUserStore } from '@/store/useUserStore'
import { usePermissions, FeatureUpgradeModal } from '@/hooks/usePermissions'
import { LockIcon, UpgradeIcon } from '@/components/icons'

/**
 * SectionGuard: Wrap sections that require specific account tier
 */
export function SectionGuard({
    children,
    sectionName,
    feature,
    requiredTier = 'Producteur',
    sectionTitle,
    sectionDescription,
    fallbackUI = null
}) {
    const { user } = useUserStore()
    const { permissions, hasSection } = usePermissions()
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    // Check if current user has access to this section
    const hasAccess = hasSection(sectionName)

    if (hasAccess) {
        // User has access - render normally
        return <>{children}</>
    }

    // User doesn't have access - show locked state
    return (
        <>
            <div className="section-guard-locked">
                <div className="section-guard-container bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 my-4">
                    {/* Header with lock icon */}
                    <div className="flex items-start gap-4 mb-4">
                        <div className="p-3 bg-gray-200 rounded-full">
                            <LockIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-gray-800">
                                {sectionTitle || `Section: ${sectionName}`}
                            </h3>
                            <p className="text-gray-600 mt-1">
                                {sectionDescription || 'Cette section n\'est pas disponible pour votre type de compte'}
                            </p>
                        </div>
                    </div>

                    {/* Upgrade reason */}
                    <div className="bg-white border border-gray-200 rounded p-4 mb-4">
                        <div className="flex items-center gap-2 text-blue-700 font-semibold">
                            <UpgradeIcon className="w-4 h-4" />
                            Disponible avec le compte <span className="font-bold">{requiredTier}</span>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                            Accédez à plus de fonctionnalités avancées en upgrading your account.
                        </p>
                    </div>

                    {/* Feature list */}
                    {getTierFeatures(requiredTier).length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-semibold text-gray-700 mb-2">
                                {requiredTier} includes:
                            </p>
                            <ul className="space-y-1">
                                {getTierFeatures(requiredTier).map((feature) => (
                                    <li key={feature} className="text-sm text-gray-600 flex items-center gap-2">
                                        <span className="text-green-600">✓</span>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Call to action */}
                    <div className="flex gap-3">
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="flex-1 px-4 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                        >
                            <UpgradeIcon className="w-4 h-4" />
                            Voir les tarifs
                        </button>
                        <button
                            onClick={() => {/* Redirect to help */ }}
                            className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            En savoir plus
                        </button>
                    </div>
                </div>
            </div>

            {/* Upgrade modal */}
            {showUpgradeModal && (
                <FeatureUpgradeModal
                    requiredTier={requiredTier}
                    feature={sectionTitle}
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                />
            )}
        </>
    )
}

/**
 * ConditionalSection: Show section only if user has permission
 * Hides completely instead of showing locked state
 */
export function ConditionalSection({
    children,
    sectionName,
    feature,
    requiredTier = 'Producteur'
}) {
    const { permissions, hasSection } = usePermissions()

    if (!hasSection(sectionName)) {
        return null // Don't render anything
    }

    return <>{children}</>
}

/**
 * FeatureLockedBanner: Show inline locked message for specific features
 */
export function FeatureLockedBanner({
    feature,
    title = 'Fonctionnalité verrouillée',
    requiredTier = 'Producteur',
    compact = false
}) {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    if (compact) {
        return (
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded text-sm text-yellow-800">
                <LockIcon className="w-4 h-4" />
                <span>{requiredTier}</span>
                <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="text-yellow-700 hover:text-yellow-900 font-semibold"
                >
                    →
                </button>
                {showUpgradeModal && (
                    <FeatureUpgradeModal
                        requiredTier={requiredTier}
                        feature={sectionTitle}
                        isOpen={showUpgradeModal}
                        onClose={() => setShowUpgradeModal(false)}
                    />
                )}
            </div>
        )
    }

    return (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
            <div className="flex items-center gap-3">
                <LockIcon className="w-5 h-5 text-yellow-600" />
                <div className="flex-1">
                    <p className="font-semibold text-yellow-900">{title}</p>
                    <p className="text-sm text-yellow-800 mt-0.5">
                        Disponible avec {requiredTier}
                    </p>
                </div>
                <button
                    onClick={() => setShowUpgradeModal(true)}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                >
                    Upgrade
                </button>
            </div>

            {showUpgradeModal && (
                <FeatureUpgradeModal
                    requiredTier={requiredTier}
                    feature={title}
                    isOpen={showUpgradeModal}
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                />
            )}
        </div>
    )
}

/**
 * FrostedGlassLockedSection: Premium locked section visual
 * Shows a frosted glass effect overlay
 */
export function FrostedGlassLockedSection({
    children,
    sectionName,
    feature,
    requiredTier = 'Producteur',
    showLocked = false
}) {
    const { permissions, hasSection } = usePermissions()
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)

    const hasAccess = hasSection(sectionName)

    return (
        <div className="relative group">
            <div
                className={`
          ${!hasAccess ? 'opacity-50 pointer-events-none blur-sm' : ''}
          transition-all duration-300
        `}
            >
                {children}
            </div>

            {!hasAccess && showLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg backdrop-blur-sm">
                    <div className="text-center">
                        <LockIcon className="w-12 h-12 text-white mx-auto mb-2" />
                        <p className="text-white font-semibold mb-3">
                            {requiredTier} Feature
                        </p>
                        <button
                            onClick={() => setShowUpgradeModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Upgrade Now
                        </button>
                    </div>
                </div>
            )}

            {showUpgradeModal && (
                <UpgradeModal
                    requiredTier={requiredTier}
                    feature={sectionName}
                    onClose={() => setShowUpgradeModal(false)}
                />
            )}
        </div>
    )
}

/**
 * Helper: Get features available in tier
 */
function getTierFeatures(tier) {
    const tierFeatures = {
        'Producteur': [
            'Sections génétiques complètes',
            'Pipeline de culture personnalisée',
            'Exports en CSV, JSON, HTML',
            'Templates personnalisées',
            'PhenoHunt - Gestion génétique',
            'Exports en haute qualité (300dpi)',
            'Batch exports'
        ],
        'Influenceur': [
            'Tous les formats de base',
            'Exports SVG',
            'Exports HD (300dpi)',
            'Templates avancés',
            'Analytics détaillées',
            'Sharing personnalisé'
        ],
        'Producteur': [
            'Tout du Producteur'
        ]
    }
    return tierFeatures[tier] || []
}

export default {
    SectionGuard,
    ConditionalSection,
    FeatureLockedBanner,
    FrostedGlassLockedSection
}
