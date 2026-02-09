import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(){
  try{
    console.log('Checking PRAGMA for Subscription...')
    const res1 = await prisma.$queryRaw`PRAGMA table_info('Subscription')`
    console.log('Subscription:', res1)
    console.log('\nChecking PRAGMA for subscriptions...')
    const res2 = await prisma.$queryRaw`PRAGMA table_info('subscriptions')`
    console.log('subscriptions:', res2)
  }catch(e){
    console.error('Error running PRAGMA', e.message)
  }finally{
    await prisma.$disconnect()
  }
}

main()