/**
 * Synchronise automatiquement la bibliothèque de Cultivars quand une FlowerReview
 * référence un ou plusieurs cultivars. Additif uniquement : ne jamais écraser un
 * champ déjà renseigné manuellement par l'utilisateur sur un Cultivar existant.
 */
import { prisma } from '../server.js'

function mapGeneticType(geneticType, varietyType) {
    const raw = String(geneticType || varietyType || '').toLowerCase()
    if (!raw) return null
    if (raw.includes('cbd')) return 'cbd'
    if (raw.includes('indica') && raw.includes('sativa')) return 'hybrid'
    if (raw.includes('hybrid') || raw.includes('hybride')) return 'hybrid'
    if (raw.includes('indica')) return 'indica'
    if (raw.includes('sativa')) return 'sativa'
    return null
}

function extractCultivarNames(cultivars) {
    if (!cultivars) return []
    const raw = Array.isArray(cultivars) ? cultivars.join(',') : String(cultivars)
    return raw
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean)
}

/**
 * @param {string} userId
 * @param {Object} data - { cultivars, geneticType, varietyType, thcPercent, cbdPercent, labReportUrl }
 */
export async function syncCultivarsFromFlowerReview(userId, data) {
    const names = extractCultivarNames(data.cultivars)
    if (names.length === 0) return

    const type = mapGeneticType(data.geneticType, data.varietyType)
    const hasCannabinoids = typeof data.thcPercent === 'number' || typeof data.cbdPercent === 'number'
    const cannabinoidSource = data.labReportUrl ? 'lab_tested' : 'breeder_claim'

    for (const name of names) {
        try {
            // Prisma sur SQLite ne supporte pas `mode: 'insensitive'` (échoue silencieusement,
            // capturé par le catch ci-dessous) — comparaison insensible à la casse faite en JS.
            const userCultivars = await prisma.cultivar.findMany({ where: { userId } })
            const existing = userCultivars.find((c) => c.name.toLowerCase() === name.toLowerCase())

            if (existing) {
                // Additif uniquement : ne compléter que les champs vides
                const updates = {}
                if (!existing.type && type) updates.type = type
                if (!existing.thcMin && !existing.thcMax && hasCannabinoids && typeof data.thcPercent === 'number') {
                    updates.thcMin = data.thcPercent
                    updates.thcMax = data.thcPercent
                    updates.thcSource = cannabinoidSource
                }
                if (!existing.cbdMin && !existing.cbdMax && hasCannabinoids && typeof data.cbdPercent === 'number') {
                    updates.cbdMin = data.cbdPercent
                    updates.cbdMax = data.cbdPercent
                    updates.cbdSource = cannabinoidSource
                }
                if (Object.keys(updates).length > 0) {
                    await prisma.cultivar.update({ where: { id: existing.id }, data: updates })
                }
            } else {
                await prisma.cultivar.create({
                    data: {
                        userId,
                        name,
                        type,
                        ...(typeof data.thcPercent === 'number' && {
                            thcMin: data.thcPercent,
                            thcMax: data.thcPercent,
                            thcSource: cannabinoidSource
                        }),
                        ...(typeof data.cbdPercent === 'number' && {
                            cbdMin: data.cbdPercent,
                            cbdMax: data.cbdPercent,
                            cbdSource: cannabinoidSource
                        })
                    }
                })
            }
        } catch (error) {
            // Ne jamais bloquer la sauvegarde de la review pour un souci de synchro cultivar
            console.warn(`⚠️ syncCultivarsFromFlowerReview: échec pour "${name}":`, error.message)
        }
    }
}

export default { syncCultivarsFromFlowerReview }
