import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

function parseRoles(rolesJson) {
    try {
        if (!rolesJson || rolesJson === '') return ['consumer']
        const parsed = JSON.parse(rolesJson)
        if (parsed && Array.isArray(parsed.roles) && parsed.roles.length > 0) return parsed.roles
        return ['consumer']
    } catch (e) {
        return ['consumer']
    }
}

function getUserAccountTypeLocal(user) {
    if (!user) return 'consumer'
    const roles = parseRoles(user.roles)
    if (!Array.isArray(roles) || roles.length === 0) return 'consumer'
    if (roles.includes('admin')) return 'admin'
    if (roles.includes('producer') || roles.includes('producteur')) return 'producer'
    if (roles.includes('influencer') || roles.includes('influenceur') || roles.includes('influencer_pro') || roles.includes('influencer_basic')) return 'influencer'
    if (roles.includes('consumer') || roles.includes('amateur')) return 'consumer'
    return 'consumer'
}

function getUserLimitsLocal(user) {
    const ACCOUNT_TYPES = { CONSUMER: 'consumer', INFLUENCER: 'influencer', PRODUCER: 'producer', MERCHANT: 'merchant', BETA_TESTER: 'beta_tester' }
    const EXPORT_LIMITS = {
        consumer: { daily: 3, templates: 3, watermarks: 0, reviews: 20, savedData: 10 },
        influencer: { daily: 50, templates: 20, watermarks: 10, reviews: -1, savedData: 100 },
        producer: { daily: -1, templates: -1, watermarks: -1, reviews: -1, savedData: -1 },
        merchant: { daily: -1, templates: -1, watermarks: -1, reviews: -1, savedData: -1 },
    }
    const EXPORT_FORMATS = { consumer: ['png', 'jpeg', 'pdf'], influencer: ['png', 'jpeg', 'pdf', 'svg', 'gif'], producer: ['png', 'jpeg', 'pdf', 'svg', 'csv', 'json', 'html', 'gif'], merchant: ['png', 'jpeg', 'pdf', 'svg', 'csv', 'json', 'html'] }
    const EXPORT_DPI = { consumer: 150, influencer: 300, producer: 300, merchant: 300 }

    const accountType = getUserAccountTypeLocal(user)
    const limits = EXPORT_LIMITS[accountType] || EXPORT_LIMITS.consumer
    const formats = EXPORT_FORMATS[accountType] || EXPORT_FORMATS.consumer
    const dpi = EXPORT_DPI[accountType] || EXPORT_DPI.consumer

    return {
        accountType,
        limits,
        formats,
        dpi,
        features: {
            customTemplates: ['producer', 'merchant'].includes(accountType),
            highQualityExport: ['influencer', 'producer', 'merchant'].includes(accountType),
            advancedStats: ['influencer', 'producer', 'merchant'].includes(accountType),
            pipelines: ['producer', 'merchant'].includes(accountType),
            genetics: ['producer', 'merchant'].includes(accountType),
            branding: ['producer', 'merchant'].includes(accountType),
        }
    }
}

function canAccessSectionLocal(accountType, section) {
    if (accountType === 'beta_tester') return true
    const sectionRestrictions = {
        genetic: ['producer', 'merchant'],
        pipeline_culture: ['producer', 'merchant'],
        pipeline_extraction: ['producer', 'merchant'],
        pipeline_curing: ['producer', 'merchant'],
        phenohunt: ['producer', 'merchant'],
        branding: ['producer', 'merchant'],
        advanced_export: ['influencer', 'producer', 'merchant']
    }
    const allowed = sectionRestrictions[section] || []
    return allowed.includes(accountType)
}

async function main(email) {
    const user = await prisma.user.findFirst({ where: { email }, include: { producerProfile: true, subscription: true } })
    if (!user) {
        console.error('User not found:', email)
        process.exit(1)
    }

    const accountType = getUserAccountTypeLocal(user)
    console.log('Account:', { id: user.id, email: user.email, accountType, subscriptionStatus: user.subscriptionStatus })

    const limits = getUserLimitsLocal(user)
    console.log('\nLimits/features reported by local getUserLimits:')
    console.log(JSON.stringify(limits, null, 2))

    const checks = [
        { key: 'pipeline_culture', label: 'Pipeline Culture' },
        { key: 'pipeline_extraction', label: 'Pipeline Extraction' },
        { key: 'pipeline_curing', label: 'Pipeline Curing' },
        { key: 'phenohunt', label: 'PhenoHunt (Genetics)' },
        { key: 'genetic', label: 'Genetics Section' },
        { key: 'advanced_export', label: 'Advanced Export' },
    ]

    console.log('\nSection access checks (local canAccessSection):')
    for (const c of checks) {
        const allowed = canAccessSectionLocal(accountType, c.key)
        console.log(`- ${c.label}: ${allowed ? 'ALLOWED' : 'DENIED'}`)
    }

    console.log('\nFeature flags from local getUserLimits.features:')
    console.log(`- pipelines: ${limits.features.pipelines}`)
    console.log(`- genetics: ${limits.features.genetics}`)
    console.log(`- advancedStats: ${limits.features.advancedStats}`)
    console.log(`- customTemplates: ${limits.features.customTemplates}`)

    await prisma.$disconnect()
}

if (process.argv.length < 3) {
    console.error('Usage: node check-producer-permissions.mjs <email>')
    process.exit(1)
}

main(process.argv[2]).catch(e => { console.error('Error', e); process.exit(2) })