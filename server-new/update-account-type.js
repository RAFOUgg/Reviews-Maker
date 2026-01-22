/**
 * Script pour mettre à jour le type de compte de l'utilisateur RAFOU
 * le rendre Producteur + Admin
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateUserAccount() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'bgmgaming09@gmail.com' }
    })

    if (!user) {
      console.log('❌ Utilisateur non trouvé')
      process.exit(1)
    }

    console.log('📋 Utilisateur actuel:')
    console.log(`  Email: ${user.email}`)
    console.log(`  Type: ${user.accountType}`)
    console.log(`  Rôle: ${user.role}`)

    // Mettre à jour le compte
    const updated = await prisma.user.update({
      where: { email: 'bgmgaming09@gmail.com' },
      data: {
        accountType: 'producteur', // Producteur
        role: 'admin' // + Admin pour dev/test
      }
    })

    console.log('\n✅ Utilisateur mis à jour:')
    console.log(`  Type: ${updated.accountType}`)
    console.log(`  Rôle: ${updated.role}`)

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

updateUserAccount()
