const { PrismaClient } = require('@prisma/client')
const { Prisma } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSchema() {
    try {
        // Test query - will fail if column doesn't exist
        const result = await prisma.$queryRaw(Prisma.sql`SELECT sql FROM sqlite_master WHERE type='table' AND name='subscriptions'`)
        console.log('Subscriptions table schema:')
        console.log(JSON.stringify(result, null, 2))
    } catch (e) {
        console.error('Error:', e.message)
    } finally {
        await prisma.$disconnect()
    }
}

checkSchema()
