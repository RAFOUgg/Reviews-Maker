/**
 * Script de migration des types de comptes
 * Reviews-Maker 2025-12-12
 * 
 * Migration de l'ancien système (6 types) vers le nouveau (3 types) :
 * - Consumer → amateur
 * - Influencer Basic/Pro → influencer
 * - Producer/Merchant → producer
 * - Beta Tester → conservé (temporaire)
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Parse les rôles JSON
 */
function parseRoles(rolesJson) {
    try {
        if (!rolesJson || rolesJson === '') {
            return ['consumer'];
        }
        const parsed = JSON.parse(rolesJson);
        if (parsed && Array.isArray(parsed.roles) && parsed.roles.length > 0) {
            return parsed.roles;
        }
        return ['consumer'];
    } catch (error) {
        console.error('[parseRoles] Error:', rolesJson, error);
        return ['consumer'];
    }
}

/**
 * Détermine nouveau type de compte selon anciens rôles
 */
function getNewAccountType(roles) {
    if (roles.includes('beta_tester')) {
        return {
            newRoles: ['beta_tester'],
            subscriptionType: null,
            subscriptionStatus: 'inactive'
        };
    }

    if (roles.includes('producer') || roles.includes('merchant')) {
        return {
            newRoles: ['producer'],
            subscriptionType: 'producer',
            subscriptionStatus: 'active'
        };
    }

    if (roles.includes('influencer_pro') || roles.includes('influencer_basic')) {
        return {
            newRoles: ['influencer'],
            subscriptionType: 'influencer',
            subscriptionStatus: 'active'
        };
    }

    return {
        newRoles: ['amateur'],
        subscriptionType: null,
        subscriptionStatus: 'inactive'
    };
}

/**
 * Fonction principale de migration
 */
async function migrateAccountTypes() {
    console.log('\n🔄 Démarrage migration types de comptes...\n');

    // Récupérer tous les utilisateurs
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            roles: true,
            createdAt: true
        }
    });

    console.log(`📊 Total utilisateurs: ${users.length}\n`);

    const stats = {
        amateur: 0,
        influencer: 0,
        producer: 0,
        beta: 0,
        errors: 0
    };

    const errors = [];

    // Migrer chaque utilisateur
    for (const user of users) {
        try {
            const currentRoles = parseRoles(user.roles);
            const migration = getNewAccountType(currentRoles);

            // Mise à jour
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    roles: JSON.stringify({ roles: migration.newRoles }),
                    subscriptionType: migration.subscriptionType,
                    subscriptionStatus: migration.subscriptionStatus,
                    subscriptionStart: migration.subscriptionStatus === 'active' ? new Date() : null,
                    updatedAt: new Date()
                }
            });

            // Incrémenter stats
            const newType = migration.newRoles[0];
            if (newType === 'beta_tester') stats.beta++;
            else if (newType === 'producer') stats.producer++;
            else if (newType === 'influencer') stats.influencer++;
            else stats.amateur++;

            console.log(`✅ ${user.username}: ${currentRoles.join(',')} → ${migration.newRoles[0]}`);

        } catch (error) {
            stats.errors++;
            errors.push({ user: user.username, error: error.message });
            console.error(`❌ Erreur pour ${user.username}:`, error.message);
        }
    }

    // Afficher résultats
    console.log('\n' + '='.repeat(60));
    console.log('📈 RÉSUMÉ DE LA MIGRATION');
    console.log('='.repeat(60));
    console.log(`✅ Amateur (gratuit):        ${stats.amateur.toString().padStart(5)}`);
    console.log(`✅ Influencer (15.99€):      ${stats.influencer.toString().padStart(5)}`);
    console.log(`✅ Producer (29.99€):        ${stats.producer.toString().padStart(5)}`);
    console.log(`⚠️  Beta Tester (temporaire): ${stats.beta.toString().padStart(5)}`);
    console.log(`❌ Erreurs:                  ${stats.errors.toString().padStart(5)}`);
    console.log('-'.repeat(60));
    console.log(`📊 TOTAL:                    ${users.length.toString().padStart(5)}`);
    console.log('='.repeat(60) + '\n');

    if (errors.length > 0) {
        console.log('⚠️  ERREURS DÉTAILLÉES:');
        errors.forEach(err => {
            console.log(`   - ${err.user}: ${err.error}`);
        });
        console.log('');
    }

    // Vérification post-migration
    console.log('🔍 Vérification post-migration...\n');

    const verification = await prisma.user.groupBy({
        by: ['subscriptionType'],
        _count: true
    });

    console.log('Distribution subscriptionType:');
    verification.forEach(group => {
        const type = group.subscriptionType || 'amateur (null)';
        console.log(`   ${type}: ${group._count}`);
    });

    console.log('\n✅ Migration terminée avec succès!\n');

    return stats;
}

/**
 * Rollback de la migration (restauration anciens rôles)
 */
async function rollbackMigration() {
    console.log('\n⚠️  ROLLBACK: Restauration anciens types de comptes...\n');

    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            roles: true,
            subscriptionType: true
        }
    });

    for (const user of users) {
        try {
            const currentRoles = parseRoles(user.roles);
            let oldRoles = currentRoles;

            // Mapping inverse
            if (currentRoles.includes('beta_tester')) {
                oldRoles = ['beta_tester'];
            } else if (currentRoles.includes('producer')) {
                oldRoles = ['producer'];
            } else if (currentRoles.includes('influencer')) {
                // Impossible de différencier basic/pro, par défaut basic
                oldRoles = ['influencer_basic'];
            } else {
                oldRoles = ['consumer'];
            }

            await prisma.user.update({
                where: { id: user.id },
                data: {
                    roles: JSON.stringify({ roles: oldRoles }),
                    subscriptionType: null,
                    subscriptionStatus: 'inactive',
                    subscriptionStart: null,
                    subscriptionEnd: null,
                    dailyExportsUsed: 0,
                    updatedAt: new Date()
                }
            });

            console.log(`✅ ${user.username}: restauré vers ${oldRoles[0]}`);

        } catch (error) {
            console.error(`❌ Erreur rollback pour ${user.username}:`, error.message);
        }
    }

    console.log('\n✅ Rollback terminé\n');
}

// Exécution selon argument
const command = process.argv[2];

if (command === 'rollback') {
    rollbackMigration()
        .catch(error => {
            console.error('❌ Erreur rollback:', error);
            process.exit(1);
        })
        .finally(() => prisma.$disconnect());
} else {
    migrateAccountTypes()
        .catch(error => {
            console.error('❌ Erreur migration:', error);
            process.exit(1);
        })
        .finally(() => prisma.$disconnect());
}
