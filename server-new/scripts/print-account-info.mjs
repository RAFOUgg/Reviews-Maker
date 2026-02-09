import { PrismaClient } from '@prisma/client'
import { getAccountInfo } from '../services/account.js'
const prisma = new PrismaClient()

async function main(email) {
    const user = await prisma.user.findFirst({ where: { email } })
    if (!user) {
        console.error('User not found', email)
        process.exit(1)
    }

    try {
        const info = await getAccountInfo(user.id)
        console.log('Account info for', email)
        console.log(JSON.stringify(info, null, 2))
    } catch (e) {
        console.error('Error fetching getAccountInfo:', e.message)
    } finally {
        await prisma.$disconnect()
    }
}

if (process.argv.length < 3) {
    console.error('Usage: node print-account-info.mjs <email>')
    process.exit(1)
}

main(process.argv[2]).catch(e => { console.error(e); process.exit(2) })