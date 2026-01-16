/**
 * Migrate Account Types to French
 * ============================================================================
 * This script updates all account types from English to French
 * Usage: node migrate-account-types-to-french.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateAccountTypes() {
    console.log('\n🔄 Starting Account Types Migration (English → French)...\n');

    try {
        // 1. Migrate consumer → amateur
        const consumerResult = await prisma.user.updateMany({
            where: { accountType: 'consumer' },
            data: { accountType: 'amateur' }
        });
        console.log(`✅ Migrated ${consumerResult.count} consumer → amateur`);

        // 2. Migrate influencer → influenceur
        const influencerResult = await prisma.user.updateMany({
            where: { accountType: 'influencer' },
            data: { accountType: 'influenceur' }
        });
        console.log(`✅ Migrated ${influencerResult.count} influencer → influenceur`);

        // 3. Migrate producer → producteur
        const producerResult = await prisma.user.updateMany({
            where: { accountType: 'producer' },
            data: { accountType: 'producteur' }
        });
        console.log(`✅ Migrated ${producerResult.count} producer → producteur`);

        // 4. Also migrate roles in JSON format
        const allUsers = await prisma.user.findMany({
            select: { id: true, roles: true }
        });

        let rolesUpdated = 0;
        for (const user of allUsers) {
            try {
                let roles = JSON.parse(user.roles || '{"roles":["consumer"]}');
                let hasChanges = false;

                // Replace English role values with French
                if (roles.roles) {
                    roles.roles = roles.roles.map(role => {
                        if (role === 'consumer') {
                            hasChanges = true;
                            return 'amateur';
                        } else if (role === 'producer') {
                            hasChanges = true;
                            return 'producteur';
                        } else if (role === 'influencer') {
                            hasChanges = true;
                            return 'influenceur';
                        }
                        return role;
                    });
                }

                if (hasChanges) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { roles: JSON.stringify(roles) }
                    });
                    rolesUpdated++;
                }
            } catch (e) {
                console.warn(`⚠️ Skipping user ${user.id}: invalid roles JSON`);
            }
        }
        console.log(`✅ Migrated ${rolesUpdated} users roles to French`);

        // 5. Also migrate subscriptionType
        const subConsumerResult = await prisma.user.updateMany({
            where: { subscriptionType: 'consumer' },
            data: { subscriptionType: 'amateur' }
        });
        if (subConsumerResult.count > 0) {
            console.log(`✅ Migrated ${subConsumerResult.count} subscriptionType consumer → amateur`);
        }

        const subInfluencerResult = await prisma.user.updateMany({
            where: { subscriptionType: 'influencer' },
            data: { subscriptionType: 'influenceur' }
        });
        if (subInfluencerResult.count > 0) {
            console.log(`✅ Migrated ${subInfluencerResult.count} subscriptionType influencer → influenceur`);
        }

        const subProducerResult = await prisma.user.updateMany({
            where: { subscriptionType: 'producer' },
            data: { subscriptionType: 'producteur' }
        });
        if (subProducerResult.count > 0) {
            console.log(`✅ Migrated ${subProducerResult.count} subscriptionType producer → producteur`);
        }

        console.log('\n✅ Migration completed successfully!\n');
        process.exit(0);
    } catch (e) {
        console.error('\n❌ Migration failed:', e.message);
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Run migration
migrateAccountTypes();
