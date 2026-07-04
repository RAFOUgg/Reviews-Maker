/**
 * Vérification SIRET : format (Luhn) + existence légale via l'API publique
 * recherche-entreprises.api.gouv.fr (gratuite, sans clé, gérée par l'État français)
 */

const SIRENE_SEARCH_URL = 'https://recherche-entreprises.api.gouv.fr/api/v1/search'

/**
 * Valide le format d'un SIRET (14 chiffres + algorithme de Luhn)
 * @param {string} siret
 * @returns {boolean}
 */
export function isValidSiretFormat(siret) {
    if (!siret) return false
    const digits = siret.replace(/\s/g, '')

    if (!/^\d{14}$/.test(digits)) return false

    let sum = 0
    for (let i = 0; i < digits.length; i++) {
        let digit = parseInt(digits[i], 10)
        // Luhn : doubler un chiffre sur deux en partant de la droite
        if ((digits.length - i) % 2 === 0) {
            digit *= 2
            if (digit > 9) digit -= 9
        }
        sum += digit
    }

    return sum % 10 === 0
}

/**
 * Vérifie l'existence réelle d'une entreprise via son SIRET
 * @param {string} siret
 * @returns {Promise<{ found: boolean|null, active: boolean|null, officialName: string|null, activityLabel: string|null }>}
 */
export async function checkSiretExists(siret) {
    const digits = siret.replace(/\s/g, '')

    try {
        const url = `${SIRENE_SEARCH_URL}?q=${encodeURIComponent(digits)}&per_page=1`
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) })

        if (!response.ok) {
            return { found: null, active: null, officialName: null, activityLabel: null }
        }

        const data = await response.json()
        const result = data?.results?.[0]

        if (!result || result.siege?.siret !== digits) {
            return { found: false, active: null, officialName: null, activityLabel: null }
        }

        return {
            found: true,
            active: result.etat_administratif === 'A',
            officialName: result.nom_complet || result.nom_raison_sociale || null,
            activityLabel: result.activite_principale_libelle || result.activite_principale || null,
        }
    } catch (error) {
        // Indisponibilité réseau/API : ne bloque jamais la sauvegarde du profil
        return { found: null, active: null, officialName: null, activityLabel: null }
    }
}

export default {
    isValidSiretFormat,
    checkSiretExists,
}
