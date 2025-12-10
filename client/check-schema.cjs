const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkSchema() {
    try {
        // Test query - will fail if column doesn't exist
        const result = await prisma.$queryRawSELECT sql FROM sqlite_master WHERE type='table' AND name='subscriptions'
        console.log('Subscriptions table schema:')
        console.log(result)
    } catch (e) {
        console.error('Error:', e.message)
    } finally {
        await prisma.$disconnect()
    }
}

checkSchema()
