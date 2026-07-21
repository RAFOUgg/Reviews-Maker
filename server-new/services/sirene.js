/**
 * Vérification SIRET : format (Luhn) + existence légale via l'API publique
 * recherche-entreprises.api.gouv.fr (gratuite, sans clé, gérée par l'État français)
 */

const SIRENE_SEARCH_URL = 'https://recherche-entreprises.api.gouv.fr/search'

/**
 * Codes « nature juridique » INSEE les plus courants pour nos utilisateurs (producteurs, labos,
 * artisans). La nomenclature complète compte des centaines d'entrées : on traduit celles qu'on
 * rencontre réellement et on retombe sur le code brut pour les autres, plutôt que d'embarquer
 * un référentiel entier pour un champ d'affichage.
 */
const LEGAL_FORMS = {
    '1000': 'Entrepreneur individuel',
    '5202': 'SNC',
    '5308': 'SCS',
    '5385': 'SCA',
    '5410': 'SARL',
    '5415': 'SARL',
    '5426': 'SARL',
    '5498': 'SARL',
    '5499': 'SARL',
    '5505': 'SA',
    '5510': 'SA',
    '5599': 'SA',
    '5710': 'SAS',
    '5720': 'SASU',
    '5785': 'SAS',
    '6533': 'SCEA',
    '6534': 'GAEC',
    '6540': 'SCI',
    '6588': 'Société civile',
    '9220': 'Association déclarée',
}

function legalFormLabel(code) {
    if (!code) return null
    return LEGAL_FORMS[String(code)] || null
}

/**
 * Numéro de TVA intracommunautaire français, déductible du SIREN :
 * FR + clé + SIREN, où clé = (12 + 3 × (SIREN mod 97)) mod 97.
 * Ne s'applique qu'aux entreprises françaises.
 * @param {string} siren - 9 chiffres
 * @returns {string|null}
 */
export function computeVatNumber(siren) {
    if (!siren || !/^\d{9}$/.test(siren)) return null
    const key = (12 + 3 * (Number(siren) % 97)) % 97
    return `FR${String(key).padStart(2, '0')}${siren}`
}

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
 * @returns {Promise<{ found: boolean|null, active: boolean|null, officialName: string|null, activityCode: string|null }>}
 */
export async function checkSiretExists(siret) {
    const digits = siret.replace(/\s/g, '')

    try {
        const url = `${SIRENE_SEARCH_URL}?q=${encodeURIComponent(digits)}&per_page=1`
        const response = await fetch(url, { signal: AbortSignal.timeout(8000) })

        if (!response.ok) {
            return { found: null, active: null, officialName: null, activityCode: null }
        }

        const data = await response.json()
        const result = data?.results?.[0]

        if (!result || result.siege?.siret !== digits) {
            return { found: false, active: null, officialName: null, activityCode: null }
        }

        const siege = result.siege || {}

        return {
            found: true,
            active: siege.etat_administratif === 'A',
            officialName: result.nom_complet || result.nom_raison_sociale || null,
            activityCode: siege.activite_principale || result.activite_principale || null,

            // Mentions légales pré-remplissables : évite une ressaisie fastidieuse et fautive.
            // `nature_juridique` est un code INSEE, traduit en clair par LEGAL_FORMS.
            legalFormCode: result.nature_juridique || null,
            legalForm: legalFormLabel(result.nature_juridique),
            siren: result.siren || digits.slice(0, 9),
            vatNumber: computeVatNumber(result.siren || digits.slice(0, 9)),
            addressLine: siege.adresse || null,
            postalCode: siege.code_postal || null,
            city: siege.libelle_commune || siege.commune || null,
            registeredAt: result.date_creation || null,
        }
    } catch (error) {
        // Indisponibilité réseau/API : ne bloque jamais la sauvegarde du profil
        return { found: null, active: null, officialName: null, activityCode: null }
    }
}

export default {
    isValidSiretFormat,
    checkSiretExists,
    computeVatNumber,
}
