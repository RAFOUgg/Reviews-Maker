import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function fixRoles() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            roles: true
        }
    });
    let fixed = 0;

    for (const user of users) {
        let needsUpdate = false;
        let newRoles = user.roles;

        try {
            if (!user.roles || user.roles === '' || user.roles === 'null') {
                newRoles = '{"roles":["consumer"]}';
                needsUpdate = true;
            } else {
                const parsed = JSON.parse(user.roles);
                if (!parsed.roles || !Array.isArray(parsed.roles) || parsed.roles.length === 0) {
                    newRoles = '{"roles":["consumer"]}';
                    needsUpdate = true;
                }
            }
        } catch (e) {
            newRoles = '{"roles":["consumer"]}';
            needsUpdate = true;
        }

        if (needsUpdate) {
            await prisma.user.update({
                where: { id: user.id },
                data: { roles: newRoles }
            });
            fixed++;
            console.log('✅ Fixed roles for user:', user.username || user.id);
        }
    }

    console.log('✅ Fixed', fixed, 'users total');
    await prisma.$disconnect();
}

fixRoles().catch(err => {
    console.error('❌ Error:', err);
    prisma.$disconnect();
    process.exit(1);
});
