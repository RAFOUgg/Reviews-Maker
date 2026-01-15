import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedTestUser() {
    try {
        console.log('🌱 Seeding test user...')

        // Check if test user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: 'test@example.com' }
        })

        if (existingUser) {
            console.log('✅ Test user already exists')
            return
        }

        // Hash password
        const hashedPassword = await bcrypt.hash('test123456', 10)

        // Create test user
        const user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                username: 'TestUser',
                passwordHash: hashedPassword,
                accountTier: 'Amateur',
                emailVerified: true,
                kycStatus: 'pending',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        })

        console.log('✅ Test user créé:')
        console.log(`   Email: test@example.com`)
        console.log(`   Mot de passe: test123456`)
        console.log(`   ID: ${user.id}`)

    } catch (error) {
        console.error('❌ Erreur lors du seed:', error.message)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

seedTestUser()
