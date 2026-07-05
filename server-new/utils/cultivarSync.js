/**
 * Résout le lien structurel entre une FlowerReview et la bibliothèque de Cultivars.
 *
 * Historique : ce module copiait autrefois les champs (type/THC/CBD) dans les colonnes du
 * Cultivar au moment du save (additif, jamais écrasé). Cette copie a été retirée — les valeurs
 * "connues depuis une review" sont désormais calculées à la lecture par
 * server-new/utils/cultivarReferences.js à partir de FlowerReview.cultivarId (cette FK) et de
 * GenNode.cultivarId (déjà existante). Les colonnes du Cultivar ne stockent plus que la valeur
 * manuelle/déclarée par l'utilisateur.
 */
import { prisma } from '../server.js'

export function mapGeneticType(geneticType, varietyType) {
    const raw = String(geneticType || varietyType || '').toLowerCase()
    if (!raw) return null
    if (raw.includes('cbd')) return 'cbd'
    if (raw.includes('indica') && raw.includes('sativa')) return 'hybrid'
    if (raw.includes('hybrid') || raw.includes('hybride')) return 'hybrid'
    if (raw.includes('indica')) return 'indica'
    if (raw.includes('sativa')) return 'sativa'
    return null
}

export function extractCultivarNames(cultivars) {
    if (!cultivars) return []
    const raw = Array.isArray(cultivars) ? cultivars.join(',') : String(cultivars)
    return raw
        .split(',')
        .map((n) => n.trim())
        .filter(Boolean)
}

/**
 * Trouve ou crée le Cultivar correspondant au PREMIER nom de `cultivarsText` (cultivar
 * "primaire" de la review — les autres noms d'un cross restent en texte libre, non liés).
 * Ne modifie jamais un Cultivar existant : ne fait que résoudre/créer et retourner son id.
 *
 * @param {string} userId
 * @param {string|string[]|null} cultivarsText
 * @returns {Promise<string|null>} l'id du Cultivar lié, ou null si aucun nom fourni
 */
export async function resolveCultivarLink(userId, cultivarsText) {
    const [name] = extractCultivarNames(cultivarsText)
    if (!name) return null

    try {
        // Prisma sur SQLite ne supporte pas `mode: 'insensitive'` (échoue silencieusement,
        // capturé par le catch ci-dessous) — comparaison insensible à la casse faite en JS.
        const userCultivars = await prisma.cultivar.findMany({ where: { userId } })
        const existing = userCultivars.find((c) => c.name.toLowerCase() === name.toLowerCase())
        if (existing) return existing.id

        const created = await prisma.cultivar.create({ data: { userId, name } })
        return created.id
    } catch (error) {
        // Ne jamais bloquer la sauvegarde de la review pour un souci de résolution du lien.
        console.warn(`⚠️ resolveCultivarLink: échec pour "${name}":`, error.message)
        return null
    }
}

export default { resolveCultivarLink, mapGeneticType, extractCultivarNames }
