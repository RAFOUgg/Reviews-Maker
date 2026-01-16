/**
 * Fix account types - convert to lowercase and correct values
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAccountTypes() {
    console.log('\n🔧 Fixing account types (uppercase → lowercase)...\n');

    try {
        // Get all users
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                accountType: true
            }
        });

        let updated = 0;

        for (const user of users) {
            let newAccountType = user.accountType;

            // Convert to lowercase and normalize
            if (user.accountType) {
                const lower = user.accountType.toLowerCase();
                
                // Normalize variations
                if (lower.includes('consumer') || lower.includes('amateur')) {
                    newAccountType = 'amateur';
                } else if (lower.includes('producer') || lower.includes('producteur')) {
                    newAccountType = 'producteur';
                } else if (lower.includes('influencer') || lower.includes('influenceur')) {
                    newAccountType = 'influenceur';
                } else if (lower.includes('admin')) {
                    newAccountType = 'admin';
                }

                // Update if different
                if (newAccountType !== user.accountType) {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { accountType: newAccountType }
                    });
                    console.log(`✅ ${user.email}: "${user.accountType}" → "${newAccountType}"`);
                    updated++;
                }
            }
        }

        console.log(`\n✅ Fixed ${updated} user(s)\n`);
        process.exit(0);
    } catch (e) {
        console.error('\n❌ Error:', e.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

fixAccountTypes();
