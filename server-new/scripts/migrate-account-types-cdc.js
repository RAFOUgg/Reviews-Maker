// Migration Script - Types de Comptes CDC
// Migre les anciens types vers Amateur/Producteur/Influenceur

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Mapping ancien -> nouveau système
 */
const MIGRATION_MAP = {
    'consumer': 'amateur',
    'beta_tester': 'amateur', // Beta testeurs deviennent amateurs
    'influencer_basic': 'influenceur',
    'influencer_pro': 'influenceur',
    'producer': 'producteur',
    'merchant': 'producteur', // Marchands deviennent producteurs
};

/**
 * Prix d'abonnement selon nouveau type
 */
const SUBSCRIPTION_PRICES = {
    'amateur': 0,
    'influenceur': 15.99,
    'producteur': 29.99
};

async function migrateAccountTypes() {
    try {
        // 1. Récupérer tous les utilisateurs
        const users = await prisma.user.findMany();
        let migratedCount = 0;
        let errors = [];

        for (const user of users) {
            try {
                // Parse roles
                let roles = ['amateur'];
                try {
                    const parsed = JSON.parse(user.roles || '{"roles":["consumer"]}');
                    roles = parsed.roles || ['consumer'];
                } catch (e) {
                }

                // Migrer chaque rôle
                const newRoles = roles.map(role => MIGRATION_MAP[role] || 'amateur');

                // Dédupliquer et garder le plus élevé
                const uniqueRoles = [...new Set(newRoles)];
                let finalRole = 'amateur';

                if (uniqueRoles.includes('producteur')) {
                    finalRole = 'producteur';
                } else if (uniqueRoles.includes('influenceur')) {
                    finalRole = 'influenceur';
                }

                // Déterminer subscriptionType
                const subscriptionType = finalRole === 'amateur' ? null : finalRole;
                const subscriptionPrice = SUBSCRIPTION_PRICES[finalRole];

                // Update user
                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        roles: JSON.stringify({ roles: [finalRole] }),
                        subscriptionType,
                        // Conserver les dates d'abonnement existantes si présentes
                        subscriptionStart: user.subscriptionStart || (subscriptionType ? new Date() : null),
                        subscriptionStatus: subscriptionType
                            ? (user.subscriptionStatus || 'active')
                            : 'inactive'
                    }
                });
                migratedCount++;

            } catch (err) {
                const error = `❌ Erreur user ${user.id}: ${err.message}`;
                errors.push(error);
            }
        }
        if (errors.length > 0) {
            errors.forEach(e => console.log(e));
        }

        // 2. Afficher statistiques finales
        const stats = await prisma.user.groupBy({
            by: ['roles'],
            _count: true
        });
        for (const stat of stats) {
            try {
                const parsed = JSON.parse(stat.roles);
                const role = parsed.roles?.[0] || 'inconnu';
            } catch (e) {
            }
        }

    } catch (error) {
        throw error;
    } finally {
        await prisma.$disconnect();
    }
}

// Exécuter migration
migrateAccountTypes()
    .then(() => {
        process.exit(0);
    })
    .catch((error) => {
        process.exit(1);
    });
