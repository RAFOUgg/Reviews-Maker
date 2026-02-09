import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(email, actor='system'){
  const user = await prisma.user.findFirst({ where: { email }, include: { producerProfile: true } })
  if(!user){
    console.error('User not found:', email)
    process.exit(1)
  }

  if(!user.producerProfile){
    console.log('Producer profile missing, creating one...')
    await prisma.producerProfile.create({ data: { userId: user.id, companyName: user.username || `Producer ${user.id.slice(0,6)}`, country: user.country || 'ZZ', isVerified: true, verifiedAt: new Date() } })
    await prisma.auditLog.create({ data: { userId: null, action: 'producer.verification.forced', entityType: 'producerProfile', entityId: user.id, metadata: JSON.stringify({ by: actor, note: 'created profile and forced verification' }), createdAt: new Date() } })
    console.log('Created and verified producerProfile for', email)
  } else {
    if(user.producerProfile.isVerified){
      console.log('Producer profile already verified for', email)
    } else {
      await prisma.producerProfile.update({ where: { userId: user.id }, data: { isVerified: true, verifiedAt: new Date() } })
      await prisma.auditLog.create({ data: { userId: null, action: 'producer.verification.forced', entityType: 'producerProfile', entityId: user.producerProfile.id, metadata: JSON.stringify({ by: actor, note: 'forced verification' }), createdAt: new Date() } })
      console.log('Producer profile verified for', email)
    }
  }

  // Return updated user minimal info
  const refreshed = await prisma.user.findUnique({ where: { id: user.id }, include: { producerProfile: true } })
  console.log('Result:', {
    id: refreshed.id,
    email: refreshed.email,
    accountType: refreshed.accountType,
    subscriptionStatus: refreshed.subscriptionStatus,
    producerProfile: refreshed.producerProfile ? { isVerified: refreshed.producerProfile.isVerified, verifiedAt: refreshed.producerProfile.verifiedAt } : null
  })

  await prisma.$disconnect()
}

if(process.argv.length < 3){
  console.error('Usage: node force-verify-producer.mjs <email> [actor]')
  process.exit(1)
}

main(process.argv[2], process.argv[3] || 'system').catch(e=>{console.error(e); process.exit(2)})