/**
 * Rattrapage ponctuel : lie FlowerReview.cultivarId pour les reviews déjà existantes (créées
 * avant l'introduction de ce lien), par le même matching par nom que
 * utils/cultivarSync.js#resolveCultivarLink (réimplémenté ici en standalone pour ne pas
 * importer server.js et démarrer toute l'app).
 *
 * Usage : node server-new/scripts/backfill-cultivar-links.js
 */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function extractCultivarNames(cultivars) {
    if (!cultivars) return []
    const raw = Array.isArray(cultivars) ? cultivars.join(',') : String(cultivars)
    return raw.split(',').map((n) => n.trim()).filter(Boolean)
}

async function run() {
    const reviews = await prisma.flowerReview.findMany({
        where: { cultivarId: null },
        select: { id: true, reviewId: true },
    })
    // cultivars n'est pas une colonne de FlowerReview mais de Review (cf. flower-reviews.js) —
    // récupérer la vraie valeur texte côté Review pour chaque candidat.
    const reviewIds = reviews.map((r) => r.reviewId)
    const baseReviews = await prisma.review.findMany({
        where: { id: { in: reviewIds } },
        select: { id: true, cultivars: true, authorId: true },
    })
    const baseById = new Map(baseReviews.map((r) => [r.id, r]))

    let linked = 0
    let skipped = 0

    for (const fr of reviews) {
        const base = baseById.get(fr.reviewId)
        const [name] = extractCultivarNames(base?.cultivars)
        if (!name || !base?.authorId) { skipped++; continue }

        const userCultivars = await prisma.cultivar.findMany({ where: { userId: base.authorId } })
        let cultivar = userCultivars.find((c) => c.name.toLowerCase() === name.toLowerCase())
        if (!cultivar) {
            cultivar = await prisma.cultivar.create({ data: { userId: base.authorId, name } })
        }

        await prisma.flowerReview.update({ where: { id: fr.id }, data: { cultivarId: cultivar.id } })
        linked++
        console.log(`✅ FlowerReview ${fr.id} → Cultivar "${cultivar.name}" (${cultivar.id})`)
    }

    console.log(`\nTerminé : ${linked} review(s) liée(s), ${skipped} ignorée(s) (pas de nom/auteur exploitable).`)
}

run()
    .catch((err) => { console.error('❌ Échec du backfill :', err); process.exitCode = 1 })
    .finally(() => prisma.$disconnect())
