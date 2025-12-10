const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
    const user = await prisma.user.findFirst({
        where: { username: 'rafouactif' }
    })
    console.log('User data:', JSON.stringify(user, null, 2))
    await prisma.$disconnect()
}

checkUser().catch(e => {
    console.error(e)
    process.exit(1)
})
