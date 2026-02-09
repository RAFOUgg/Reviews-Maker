import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
    const email = process.argv[2]
    if (!email) {
        console.error('Usage: node find-user-by-email.mjs <email>')
        process.exit(1)
    }
    const user = await prisma.user.findFirst({ where: { email }, include: { subscription: true, producerProfile: true, influencerProfile: true } })
    if (!user) {
        console.log('User not found for email:', email)
        process.exit(0)
    }
    console.log('Found user:')
    console.log({ id: user.id, username: user.username, email: user.email, roles: user.roles, accountType: user.accountType, subscriptionType: user.subscriptionType, subscriptionStatus: user.subscriptionStatus, kycStatus: user.kycStatus, producerProfile: !!user.producerProfile, influencerProfile: !!user.influencerProfile })
    await prisma.$disconnect()
}

main().catch(e => { console.error(e); process.exit(2) })