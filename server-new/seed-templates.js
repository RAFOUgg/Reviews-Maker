import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const templates = [
    {
        id: 'tpl-compact-1x1',
        name: 'Compact (1:1)',
        description: 'Template compact pour réseaux sociaux - Format carré',
        ownerId: 'system',
        isPublic: true,
        isPremium: false,
        category: 'predefined',
        templateType: 'compact',
        format: '1:1',
        maxPages: 1,
        config: JSON.stringify({ "pages": [{ "zones": [{ "source": "holderName", "x": 20, "y": 20, "w": 360, "h": 40, "style": "font-size:24px;font-weight:bold" }, { "source": "images[0]", "x": 20, "y": 80, "w": 360, "h": 360 }] }], "theme": "violet-lean" }),
        allowedAccountTypes: JSON.stringify({ "consumer": true, "influencer_basic": true, "influencer_pro": true, "producer": true }),
        exportOptions: JSON.stringify({ "png": true, "jpeg": true, "pdf": true, "svg": false, "maxQuality": 150 })
    },
    {
        id: 'tpl-detailed-16x9',
        name: 'Détaillé (16:9)',
        description: 'Template détaillé paysage pour présentations',
        ownerId: 'system',
        isPublic: true,
        isPremium: false,
        category: 'predefined',
        templateType: 'detailed',
        format: '16:9',
        maxPages: 1,
        config: JSON.stringify({ "pages": [{ "zones": [{ "source": "holderName", "x": 40, "y": 40, "w": 600, "h": 60, "style": "font-size:32px;font-weight:bold" }, { "source": "images[0]", "x": 40, "y": 120, "w": 500, "h": 500 }, { "source": "description", "x": 560, "y": 120, "w": 400, "h": 500 }] }], "theme": "violet-lean" }),
        allowedAccountTypes: JSON.stringify({ "consumer": true, "influencer_basic": true, "influencer_pro": true, "producer": true }),
        exportOptions: JSON.stringify({ "png": true, "jpeg": true, "pdf": true, "svg": false, "maxQuality": 150 })
    },
    {
        id: 'tpl-complete-a4',
        name: 'Complet (A4)',
        description: 'Template complet pour impression',
        ownerId: 'system',
        isPublic: true,
        isPremium: false,
        category: 'predefined',
        templateType: 'complete',
        format: 'A4',
        maxPages: 1,
        config: JSON.stringify({ "pages": [{ "zones": [{ "source": "holderName", "x": 100, "y": 100, "w": 800, "h": 80, "style": "font-size:40px;font-weight:bold" }, { "source": "images[0]", "x": 100, "y": 200, "w": 800, "h": 800 }, { "source": "description", "x": 100, "y": 1020, "w": 800, "h": 400 }] }], "theme": "violet-lean" }),
        allowedAccountTypes: JSON.stringify({ "consumer": true, "influencer_basic": true, "influencer_pro": true, "producer": true }),
        exportOptions: JSON.stringify({ "png": true, "jpeg": true, "pdf": true, "svg": false, "maxQuality": 150 })
    },
    {
        id: 'tpl-premium-9x16',
        name: 'Stories (9:16)',
        description: 'Template vertical pour Instagram/TikTok Stories',
        ownerId: 'system',
        isPublic: true,
        isPremium: true,
        category: 'predefined',
        templateType: 'custom',
        format: '9:16',
        maxPages: 1,
        config: JSON.stringify({ "pages": [{ "zones": [{ "source": "holderName", "x": 40, "y": 100, "w": 540, "h": 60, "style": "font-size:28px;font-weight:bold" }, { "source": "images[0]", "x": 40, "y": 180, "w": 540, "h": 540 }] }], "theme": "violet-lean" }),
        allowedAccountTypes: JSON.stringify({ "consumer": false, "influencer_basic": true, "influencer_pro": true, "producer": true }),
        exportOptions: JSON.stringify({ "png": true, "jpeg": true, "pdf": true, "svg": true, "maxQuality": 300 })
    }
];

async function main() {
    for (const tpl of templates) {
        await prisma.template.upsert({
            where: { id: tpl.id },
            update: tpl,
            create: tpl
        });
    }

    const count = await prisma.template.count({ where: { category: 'predefined' } });
}

main()
    .catch((e) => {
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
