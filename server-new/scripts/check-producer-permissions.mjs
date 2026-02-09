import { PrismaClient } from '@prisma/client'
import { getUserLimits, canAccessSection } from '../middleware/permissions.js'
import { getUserAccountType, ACCOUNT_TYPES } from '../services/account.js'
const prisma = new PrismaClient()

async function main(email){
  const user = await prisma.user.findFirst({ where: { email }, include: { producerProfile: true, subscription: true } })
  if(!user){
    console.error('User not found:', email)
    process.exit(1)
  }

  const accountType = getUserAccountType(user)
  console.log('Account:', { id: user.id, email: user.email, accountType, subscriptionStatus: user.subscriptionStatus })

  const limits = getUserLimits(user)
  console.log('\nLimits/features reported by getUserLimits:')
  console.log(JSON.stringify(limits, null, 2))

  // Check specific sections and features
  const checks = [
    { key: 'pipeline_culture', label: 'Pipeline Culture' },
    { key: 'pipeline_extraction', label: 'Pipeline Extraction' },
    { key: 'pipeline_curing', label: 'Pipeline Curing' },
    { key: 'phenohunt', label: 'PhenoHunt (Genetics)' },
    { key: 'genetic', label: 'Genetics Section' },
    { key: 'advanced_export', label: 'Advanced Export' },
  ]

  console.log('\nSection access checks (canAccessSection):')
  for(const c of checks){
    const allowed = canAccessSection(accountType, c.key)
    console.log(`- ${c.label}: ${allowed ? 'ALLOWED' : 'DENIED'}`)
  }

  // Check pipeline flags in features
  console.log('\nFeature flags from getUserLimits.features:')
  console.log(`- pipelines: ${limits.features.pipelines}`)
  console.log(`- genetics: ${limits.features.genetics}`)
  console.log(`- advancedStats: ${limits.features.advancedStats}`)
  console.log(`- customTemplates: ${limits.features.customTemplates}`)

  await prisma.$disconnect()
}

if(process.argv.length < 3){
  console.error('Usage: node check-producer-permissions.mjs <email>')
  process.exit(1)
}

main(process.argv[2]).catch(e=>{console.error('Error', e); process.exit(2)})