/**
 * Script pour mettre à jour un utilisateur en admin/producteur
 * Usage: node update-user-admin.js
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Fetching all users...');

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            email: true,
            accountType: true,
            subscriptionType: true,
            roles: true
        }
    });

    console.log('Users found:', JSON.stringify(users, null, 2));

    if (users.length > 0) {
        // Mettre à jour le premier utilisateur (ou celui avec un email spécifique)
        const targetUser = users[0]; // Modifier si besoin

        console.log(`\nUpdating user ${targetUser.username} to admin/producer...`);

        const updated = await prisma.user.update({
            where: { id: targetUser.id },
            data: {
                accountType: 'producer',
                subscriptionType: 'producer',
                subscriptionStatus: 'active',
                roles: JSON.stringify({ roles: ['producer', 'admin', 'consumer'] })
            }
        });

        console.log('Updated user:', {
            id: updated.id,
            username: updated.username,
            accountType: updated.accountType,
            subscriptionType: updated.subscriptionType,
            roles: updated.roles
        });
    }

    await prisma.$disconnect();
}

main().catch(console.error);
