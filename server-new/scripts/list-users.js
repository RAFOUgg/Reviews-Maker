/**
 * Debug script to list all users
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function listUsers() {
    console.log('\n📋 All Users in Database:\n');

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                username: true,
                accountType: true,
                roles: true,
                subscriptionType: true
            },
            orderBy: { createdAt: 'desc' }
        });

        if (users.length === 0) {
            console.log('❌ No users found in database');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. Email: ${user.email}`);
                console.log(`   Username: ${user.username}`);
                console.log(`   Account Type: ${user.accountType}`);
                console.log(`   Subscription Type: ${user.subscriptionType}`);
                console.log(`   Roles: ${user.roles}`);
                console.log('');
            });
        }

        console.log(`✅ Total: ${users.length} user(s)\n`);
    } catch (e) {
        console.error('\n❌ Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

listUsers();
