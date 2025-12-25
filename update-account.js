import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    // Trouver l'utilisateur par email
    const existingUser = await prisma.user.findFirst({
        where: { username: 'RAFOU.' }
    });

    if (!existingUser) {
        console.log('❌ User not found');
        return;
    }

    console.log('Found user:', existingUser.username, existingUser.email);

    // Mettre à jour
    const user = await prisma.user.update({
        where: { id: existingUser.id },
        data: { accountType: 'Producteur' }
    });
    console.log('✅ User updated:', user.username, '->', user.accountType);
    .finally(() => prisma.$disconnect());
