// Script pour forcer le workflow légal sur tous les utilisateurs existants
// Met legalAge et consentRDR à false (au lieu de null) pour déclencher les modals

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function resetLegalFields() {
    console.log('🔄 Reset des champs légaux pour forcer le workflow...\n')

    try {
        // Compter tous les utilisateurs
        const totalUsers = await prisma.user.count()
        console.log(`📊 ${totalUsers} utilisateur(s) dans la base`)

        // Mettre à jour TOUS les champs légaux à false pour forcer le workflow
        const result = await prisma.user.updateMany({
            data: {
                legalAge: false,
                consentRDR: false,
                birthdate: null,
                country: null,
                region: null
            }
        })

        console.log(`\n✅ ${result.count} utilisateur(s) mis à jour`)
        console.log('\n📋 Actions effectuées:')
        console.log('  • legalAge: → false')
        console.log('  • consentRDR: → false')
        console.log('  • birthdate: reset à null (pour resaisie)')
        console.log('  • country: reset à null')
        console.log('  • region: reset à null')

        // Vérification finale
        const verification = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                legalAge: true,
                consentRDR: true,
                accountType: true
            }
        })

        console.log('\n📊 État final des utilisateurs:')
        verification.forEach((user, index) => {
            console.log(`\nUser ${index + 1}: ${user.username || user.id}`)
            console.log(`  • Account Type: ${user.accountType}`)
            console.log(`  • Legal Age: ${user.legalAge}`)
            console.log(`  • Consent RDR: ${user.consentRDR}`)
        })

        console.log('\n✅ Reset terminé avec succès!')
        console.log('🎯 Les utilisateurs verront maintenant les modals légales au login')

    } catch (error) {
        console.error('❌ Erreur lors du reset:', error)
        throw error
    } finally {
        await prisma.$disconnect()
    }
}

// Exécution
resetLegalFields()
    .catch((error) => {
        console.error('❌ Erreur fatale:', error)
        process.exit(1)
    })
