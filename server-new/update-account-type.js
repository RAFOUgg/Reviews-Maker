/**
 * Script pour mettre à jour le type de compte de l'utilisateur RAFOU
 * le rendre Producteur + Admin
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserAccount() {
    try {
        // D'abord, chercher l'utilisateur par email
        const user = await prisma.user.findFirst({
            where: { email: 'bgmgaming09@gmail.com' }
        })

        if (!user) {
            console.log('❌ Utilisateur non trouvé')
            process.exit(1)
        }

        console.log('📋 Utilisateur actuel:')
        console.log(`  ID: ${user.id}`)
        console.log(`  Email: ${user.email}`)
        console.log(`  Type: ${user.accountType}`)
        console.log(`  Rôles: ${user.roles}`)

        // Mettre à jour le compte
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                accountType: 'producteur',
                roles: 'admin' // Producteur + Admin
            }
        })

        console.log('\n✅ Utilisateur mis à jour:')
        console.log(`  Type: ${updated.accountType}`)
        console.log(`  Rôles: ${updated.roles}`)

    } catch (error) {
        console.error('❌ Erreur:', error.message)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

updateUserAccount()
