import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(email){
  const user = await prisma.user.findFirst({ where: { email } })
  if(!user){
    console.log('User not found', email); process.exit(1)
  }
  console.log('Found', { id: user.id, roles: user.roles, subscriptionStatus: user.subscriptionStatus })

  // Ensure subscription active
  await prisma.user.update({ where: { id: user.id }, data: { subscriptionStatus: 'active' } })
  console.log('Subscription status set to active')

  // Create producerProfile if missing
  const prod = await prisma.producerProfile.findFirst({ where: { userId: user.id } })
  if(!prod){
    await prisma.producerProfile.create({
      data: {
        user: { connect: { id: user.id } },
        companyName: user.username || `Producer ${user.id.slice(0,6)}`,
        country: user.country || 'ZZ',
        isVerified: false
      }
    })
    console.log('Producer profile created')
  } else {
    console.log('Producer profile exists')
  }

  // Ensure roles include producer
  try{
    const parsed = JSON.parse(user.roles || '{"roles":["consumer"]}')
    if(!parsed.roles.includes('producer')){
      parsed.roles.push('producer')
      await prisma.user.update({ where: { id: user.id }, data: { roles: JSON.stringify(parsed) } })
      console.log('Added producer role')
    } else console.log('Producer role already present')
  }catch(e){
    console.warn('Failed to parse roles', e.message)
  }

  console.log('Done')
  await prisma.$disconnect()
}

if(process.argv.length < 3){
  console.error('Usage: node ensure-producer-activation.mjs <email>')
  process.exit(1)
}

main(process.argv[2]).catch(e=>{console.error(e); process.exit(2)})