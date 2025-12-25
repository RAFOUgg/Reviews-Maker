// Script de migration pour ajouter passwordHash
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrate() {
    try {
        console.log('Vérification de la colonne passwordHash...')

        // Vérifier si la colonne existe déjà
        const result = await prisma.$queryRaw`PRAGMA table_info(users);`
        const hasPasswordHash = result.some(col => col.name === 'passwordHash')

        if (hasPasswordHash) {
            console.log('✓ La colonne passwordHash existe déjà')
        } else {
            console.log('Ajout de la colonne passwordHash...')
            await prisma.$executeRawUnsafe(`ALTER TABLE users ADD COLUMN passwordHash TEXT`)
            console.log('✓ Colonne passwordHash ajoutée avec succès')
        }
    } catch (error) {
        console.error('Erreur lors de la migration:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

migrate()
