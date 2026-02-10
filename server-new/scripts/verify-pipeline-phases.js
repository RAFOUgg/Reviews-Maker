import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function run() {
  console.log('Vérification de la persistance des phases pour pipelines');

  // Chercher une review existante
  const review = await prisma.review.findFirst();
  if (!review) {
    console.error('Aucune review trouvée dans la base. Créer une review manuellement avant d exécuter ce script.');
    process.exit(1);
  }

  console.log('Utilisation de la review id=', review.id);

  const phases = [
    { id: 'v-test-1', name: 'Phase test 1', duration: 1 },
    { id: 'v-test-2', name: 'Phase test 2', duration: 2 }
  ];

  // Créer pipeline
  const pipeline = await prisma.pipeline.create({
    data: {
      reviewId: review.id,
      mode: 'phases',
      startDate: new Date(),
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      activeSetups: JSON.stringify([]),
      phases: JSON.stringify(phases)
    }
  });

  console.log('Pipeline créé id=', pipeline.id);

  const fetched = await prisma.pipeline.findUnique({ where: { id: pipeline.id } });
  console.log('Pipeline récupéré (raw):', fetched);

  console.log('Parsed phases:', fetched.phases ? JSON.parse(fetched.phases) : null);

  // Cleanup
  await prisma.pipeline.delete({ where: { id: pipeline.id } });
  console.log('Test pipeline supprimé. Test OK si phases stockées et parsées correctement.');

  await prisma.$disconnect();
}

run().catch(e => { console.error('Erreur', e); prisma.$disconnect(); process.exit(1); });