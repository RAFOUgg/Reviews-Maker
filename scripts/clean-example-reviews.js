/**
 * Script pour nettoyer les reviews exemples de la base de données
 * Exécuter avec: node scripts/clean-example-reviews.js
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanExampleReviews() {
    console.log('🧹 Nettoyage des reviews exemples...\n');
    
    try {
        // 1. Lister les reviews actuelles
        const reviews = await prisma.review.findMany({
            select: {
                id: true,
                holderName: true,
                type: true,
                ownerId: true,
                owner: {
                    select: {
                        email: true
                    }
                }
            }
        });
        
        console.log('📋 Reviews trouvées:');
        reviews.forEach(r => {
            console.log(`  - ${r.holderName} (${r.type}) - Owner: ${r.owner?.email || 'N/A'}`);
        });
        
        if (reviews.length === 0) {
            console.log('\n✅ Aucune review à supprimer.');
            return;
        }
        
        // 2. Supprimer les likes/dislikes associés
        const deletedLikes = await prisma.reviewLike.deleteMany({
            where: {
                reviewId: {
                    in: reviews.map(r => r.id)
                }
            }
        });
        console.log(`\n🗑️ ${deletedLikes.count} likes/dislikes supprimés`);
        
        // 3. Supprimer les vues
        const deletedViews = await prisma.reviewView.deleteMany({
            where: {
                reviewId: {
                    in: reviews.map(r => r.id)
                }
            }
        });
        console.log(`🗑️ ${deletedViews.count} vues supprimées`);
        
        // 4. Supprimer les commentaires
        const deletedComments = await prisma.reviewComment.deleteMany({
            where: {
                reviewId: {
                    in: reviews.map(r => r.id)
                }
            }
        });
        console.log(`🗑️ ${deletedComments.count} commentaires supprimés`);
        
        // 5. Supprimer les reviews
        const deletedReviews = await prisma.review.deleteMany({
            where: {
                id: {
                    in: reviews.map(r => r.id)
                }
            }
        });
        console.log(`🗑️ ${deletedReviews.count} reviews supprimées`);
        
        console.log('\n✅ Nettoyage terminé!');
        
    } catch (error) {
        console.error('❌ Erreur:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

cleanExampleReviews();
