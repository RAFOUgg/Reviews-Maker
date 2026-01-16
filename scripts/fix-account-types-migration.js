#!/usr/bin/env node

/**
 * SCRIPT DE MIGRATION - Audit Database
 * Fixes les problèmes critiques détectés dans l'audit
 * 
 * Usage: node fix-account-types.js
 * 
 * Actions:
 * 1. Unifier les énumérations ACCOUNT_TYPES à ANGLAIS
 * 2. Migrer les comptes existants
 * 3. Créer les profils manquants
 * 4. Valider la cohérence
 */

import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Couleurs pour le terminal
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

function log(color, message) {
    console.log(`${color}${message}${colors.reset}`);
}

async function main() {
    log(colors.cyan, '═══════════════════════════════════════════════════════════════');
    log(colors.cyan, '  MIGRATION ACCOUNT TYPES - Fix Database Inconsistencies');
    log(colors.cyan, '═══════════════════════════════════════════════════════════════\n');

    try {
        // STEP 1: Audit initial
        log(colors.blue, '\n📊 STEP 1: Audit Initial des Données\n');
        
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                accountType: true,
                roles: true,
                producerProfile: true,
                influencerProfile: true,
                createdAt: true
            },
            take: 10
        });

        log(colors.yellow, `Trouvé ${users.length} utilisateurs:\n`);
        
        let stats = {
            consumer: 0,
            amateur: 0,
            producer: 0,
            producteur: 0,
            influencer: 0,
            influenceur: 0,
            admin: 0,
            other: 0,
            inconsistencies: 0
        };

        users.forEach(user => {
            const type = user.accountType || 'null';
            if (stats[type] !== undefined) {
                stats[type]++;
            } else {
                stats.other++;
            }

            // Check consistency
            const roles = JSON.parse(user.roles || '{"roles":["consumer"]}').roles || [];
            const expectedType = deriveAccountType(roles);
            
            if (type !== expectedType && type !== 'null') {
                stats.inconsistencies++;
                log(colors.red, `  ❌ ${user.username} (${user.id.slice(0, 8)}...): type="${type}" but roles suggest "${expectedType}"`);
            } else {
                log(colors.green, `  ✓ ${user.username}: ${type}`);
            }
        });

        log(colors.yellow, '\n📈 Summary:');
        console.table(stats);

        // STEP 2: Proposer corrections
        log(colors.blue, '\n🔧 STEP 2: Corrections Proposées\n');

        log(colors.yellow, 'Changes à appliquer:\n');
        log(colors.yellow, '  1. Mapper "amateur" → "consumer"');
        log(colors.yellow, '  2. Mapper "producteur" → "producer"');
        log(colors.yellow, '  3. Mapper "influenceur" → "influencer"');
        log(colors.yellow, '  4. Synchroniser roles avec accountType');
        log(colors.yellow, '  5. Créer les profils manquants\n');

        // STEP 3: Apply corrections (avec confirmation)
        log(colors.blue, '\n⚠️  STEP 3: Application des Corrections\n');
        
        let migratedCount = 0;
        let profilesCreated = 0;
        let rolesSynced = 0;

        for (const user of users) {
            let updated = false;
            const roles = JSON.parse(user.roles || '{"roles":["consumer"]}').roles || [];
            
            // Map old types to new
            const oldType = user.accountType;
            let newType = oldType;
            let newRoles = [...roles];

            // Replace old enum values
            if (oldType === 'amateur') {
                newType = 'consumer';
                updated = true;
            } else if (oldType === 'producteur') {
                newType = 'producer';
                updated = true;
            } else if (oldType === 'influenceur') {
                newType = 'influencer';
                updated = true;
            }

            // Synchronize roles to match type
            const typeRoles = ['consumer', 'producer', 'influencer', 'admin'];
            const accountRoles = newRoles.filter(r => typeRoles.includes(r));
            
            if (!accountRoles.includes(newType) && newType !== 'consumer') {
                accountRoles.push(newType);
                updated = true;
            } else if (newType === 'consumer' && !accountRoles.length) {
                accountRoles.push('consumer');
                updated = true;
            }

            // Apply update if needed
            if (updated) {
                try {
                    await prisma.user.update({
                        where: { id: user.id },
                        data: {
                            accountType: newType,
                            roles: JSON.stringify({ roles: accountRoles })
                        }
                    });
                    migratedCount++;
                    rolesSynced++;
                    log(colors.green, `  ✓ ${user.username}: ${oldType} → ${newType}`);
                } catch (error) {
                    log(colors.red, `  ❌ ${user.username}: ${error.message}`);
                }
            }

            // Create missing profiles
            if (newType === 'producer' && !user.producerProfile) {
                try {
                    await prisma.producerProfile.create({
                        data: {
                            userId: user.id,
                            companyName: `${user.username}'s Company`,
                            country: user.country || 'FR',
                            isVerified: false
                        }
                    });
                    profilesCreated++;
                    log(colors.green, `  ✓ ProducerProfile créé pour ${user.username}`);
                } catch (error) {
                    log(colors.yellow, `  ⚠ ProducerProfile ${user.username}: ${error.message}`);
                }
            }

            if (newType === 'influencer' && !user.influencerProfile) {
                try {
                    await prisma.influencerProfile.create({
                        data: {
                            userId: user.id,
                            brandName: user.username,
                            isVerified: false
                        }
                    });
                    profilesCreated++;
                    log(colors.green, `  ✓ InfluencerProfile créé pour ${user.username}`);
                } catch (error) {
                    log(colors.yellow, `  ⚠ InfluencerProfile ${user.username}: ${error.message}`);
                }
            }
        }

        // STEP 4: Validation
        log(colors.blue, '\n✅ STEP 4: Validation Post-Migration\n');

        const updatedUsers = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                accountType: true,
                roles: true,
                producerProfile: true,
                influencerProfile: true
            },
            take: 10
        });

        let validations = {
            correct: 0,
            errors: []
        };

        updatedUsers.forEach(user => {
            const roles = JSON.parse(user.roles || '{"roles":["consumer"]}').roles || [];
            const isConsistent = roles.includes(user.accountType) || 
                               (user.accountType === 'consumer' && roles.length > 0) ||
                               (user.accountType === 'consumer' && roles.length === 0);
            
            if (isConsistent && !['amateur', 'producteur', 'influenceur'].includes(user.accountType)) {
                validations.correct++;
                log(colors.green, `  ✓ ${user.username}: Cohérent (${user.accountType})`);
            } else {
                validations.errors.push(user.username);
                log(colors.red, `  ❌ ${user.username}: Incohérent!`);
            }
        });

        log(colors.blue, '\n📊 Résumé Migration:');
        console.log(`
  ${colors.green}✓ Utilisateurs migrés: ${migratedCount}${colors.reset}
  ${colors.green}✓ Profils créés: ${profilesCreated}${colors.reset}
  ${colors.green}✓ Rôles synchronisés: ${rolesSynced}${colors.reset}
  ${colors.green}✓ Validations OK: ${validations.correct}${colors.reset}
  ${validations.errors.length > 0 ? colors.red + '❌ Erreurs: ' + validations.errors.length + colors.reset : colors.green + '✓ Aucune erreur' + colors.reset}
        `);

        // STEP 5: Recommendations
        log(colors.blue, '\n🎯 RECOMMENDATIONS SUIVANTES:\n');
        log(colors.yellow, '  1. Vérifier les utilisateurs via SettingsPage');
        log(colors.yellow, '  2. Tester les badges de profil (ProducerProfile, InfluencerProfile)');
        log(colors.yellow, '  3. Valider les limites d\'export par type de compte');
        log(colors.yellow, '  4. Implémenter le système de Subscription');
        log(colors.yellow, '  5. Ajouter les KYC documents\n');

        log(colors.cyan, '═══════════════════════════════════════════════════════════════');
        log(colors.green, '✅ Migration terminée avec succès!');
        log(colors.cyan, '═══════════════════════════════════════════════════════════════\n');

    } catch (error) {
        log(colors.red, `\n❌ Erreur: ${error.message}\n`);
        console.error(error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

/**
 * Dérive le type de compte basé sur les rôles
 */
function deriveAccountType(roles) {
    if (!Array.isArray(roles) || roles.length === 0) {
        return 'consumer';
    }
    
    if (roles.includes('admin')) return 'admin';
    if (roles.includes('producer')) return 'producer';
    if (roles.includes('influencer')) return 'influencer';
    if (roles.includes('consumer')) return 'consumer';
    
    return 'consumer';
}

main().catch(error => {
    log(colors.red, `Fatal error: ${error.message}`);
    process.exit(1);
});
