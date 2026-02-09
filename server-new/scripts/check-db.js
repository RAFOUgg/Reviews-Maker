import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    try {
        console.log('database url:', process.env.DATABASE_URL || 'unset')
        const users = await prisma.user.count()
        const reviews = await prisma.review.count()
        const templates = await prisma.template.count()
        const tables = await prisma.$queryRaw`SELECT name FROM sqlite_master WHERE type='table'`
        const migrationsTables = tables.map(t => t.name)
        console.log({ users, reviews, templates, tables: migrationsTables.slice(0, 30) })
    } catch (e) {
        console.error('DB CHECK ERROR', e)
        process.exitCode = 2
    } finally {
        await prisma.$disconnect()
    }
}

main()