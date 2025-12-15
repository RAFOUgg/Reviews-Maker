const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function cleanFailedMigration() {
    try {
        await prisma.$executeRaw`DELETE FROM _prisma_migrations WHERE migration_name = '20251109161437_add_substrat_mix'`;
        console.log('✅ Migration failed supprimée du registre');
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error.message);
        process.exit(1);
    }
}

cleanFailedMigration();
