#!/bin/bash
#
# Set User as Producer
# ============================================================================
# This script promotes a user to PRODUCTEUR (Producer) account type
# Usage: node set-user-as-producer.js user@email.com
#

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setUserAsProducer(email) {
    console.log('\n🔧 Setting user as PRODUCTEUR (Producer)...\n');

    if (!email) {
        console.error('❌ Error: Please provide user email');
        console.log('Usage: node set-user-as-producer.js user@email.com');
        process.exit(1);
    }

    try {
        // 1. Find user
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error(`❌ User not found: ${email}`);
            process.exit(1);
        }

        console.log(`📋 Found user: ${user.username} (${user.email})`);
        console.log(`Current type: ${user.accountType}\n`);

        // 2. Update user to PRODUCTEUR
        const updated = await prisma.user.update({
            where: { id: user.id },
            data: {
                // Account type
                accountType: 'producteur',
                
                // Roles (JSON array)
                roles: JSON.stringify({ roles: ['producteur', 'admin'] }),
                
                // Subscription
                subscriptionType: 'producteur',
                subscriptionStatus: 'active',
                subscriptionStart: new Date(),
                subscriptionEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                
                // KYC verification
                kycStatus: 'verified',
                kycVerifiedAt: new Date(),
                
                // Updated timestamp
                updatedAt: new Date()
            },
            select: {
                id: true,
                username: true,
                email: true,
                accountType: true,
                roles: true,
                subscriptionType: true,
                subscriptionStatus: true,
                kycStatus: true
            }
        });

        console.log('✅ User updated successfully!\n');
        console.log('New configuration:');
        console.log(`  accountType:      ${updated.accountType}`);
        console.log(`  roles:            ${updated.roles}`);
        console.log(`  subscriptionType: ${updated.subscriptionType}`);
        console.log(`  subscriptionStatus: ${updated.subscriptionStatus}`);
        console.log(`  kycStatus:        ${updated.kycStatus}\n`);

        console.log('Next steps:');
        console.log('1. Restart backend: pm2 restart ecosystem.config.cjs');
        console.log('2. Clear browser cache: Ctrl+Shift+R');
        console.log('3. Reload page and verify SettingsPage shows "Producteur"');
        console.log('4. Check ProfilePage for 🌱 badge\n');

        process.exit(0);
    } catch (e) {
        console.error('\n❌ Error:', e.message);
        console.error(e);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Get email from command line argument
const email = process.argv[2];
setUserAsProducer(email);
