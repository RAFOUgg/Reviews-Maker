import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanFailedMigration() {
    try {
        await prisma.$executeRaw`DELETE FROM _prisma_migrations WHERE migration_name = '20251109161437_add_substrat_mix'`;
        process.exit(0);
    } catch (error) {
        process.exit(1);
    }
}

cleanFailedMigration();
