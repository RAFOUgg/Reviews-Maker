import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main(email) {
    const user = await prisma.user.findFirst({
        where: { email },
        include: {
            subscription: true,
            producerProfile: true,
            influencerProfile: true,
        }
    })
    if (!user) {
        console.error('User not found:', email)
        process.exit(1)
    }

    console.log('USER:', {
        id: user.id,
        email: user.email,
        username: user.username,
        roles: user.roles,
        accountType: user.accountType,
        subscriptionType: user.subscriptionType,
        subscriptionStatus: user.subscriptionStatus,
        producerProfile: user.producerProfile ? { isVerified: user.producerProfile.isVerified, companyName: user.producerProfile.companyName } : null,
        influencerProfile: user.influencerProfile ? { isVerified: user.influencerProfile.isVerified } : null,
        kycStatus: user.kycStatus,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
    })

    // List some related counts for limits
    const [templateCount, watermarkCount, reviewCount, dataCount] = await Promise.all([
        prisma.savedTemplate.count({ where: { ownerId: user.id } }).catch(() => 0),
        prisma.watermark.count({ where: { userId: user.id } }).catch(() => 0),
        prisma.review.count({ where: { authorId: user.id } }).catch(() => 0),
        prisma.savedData.count({ where: { userId: user.id } }).catch(() => 0),
    ])

    console.log('COUNTS:', { templateCount, watermarkCount, reviewCount, dataCount })
    await prisma.$disconnect()
}

if (process.argv.length < 3) {
    console.error('Usage: node dump-user-full.mjs <email>')
    process.exit(1)
}

main(process.argv[2]).catch(e => { console.error(e); process.exit(2) })