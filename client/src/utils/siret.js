/**
 * Valide le format d'un SIRET (14 chiffres + algorithme de Luhn).
 * Miroir de server-new/services/sirene.js::isValidSiretFormat pour un feedback instantané.
 */
export function isValidSiretFormat(siret) {
    if (!siret) return false
    const digits = siret.replace(/\s/g, '')

    if (!/^\d{14}$/.test(digits)) return false

    let sum = 0
    for (let i = 0; i < digits.length; i++) {
        let digit = parseInt(digits[i], 10)
        if ((digits.length - i) % 2 === 0) {
            digit *= 2
            if (digit > 9) digit -= 9
        }
        sum += digit
    }

    return sum % 10 === 0
}

export default { isValidSiretFormat }
