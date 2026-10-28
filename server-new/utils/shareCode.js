import { randomInt } from 'crypto'

// Alphabet sans caractères ambigus (0/O, 1/I/L) : le code se recopie à la main depuis une étiquette.
const ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'

/**
 * Code partageable (lot imprimé sur un sachet, lien court /l/:code). Tiré par `crypto` et non
 * `Math.random` : un code d'étiquette ne doit pas être prédictible. 8 caractères sur 31 symboles
 * ≈ 8,5·10¹¹ combinaisons — l'accès reste de toute façon soumis à canReadFor.
 */
export function generateShareCode(length = 8) {
    let code = ''
    for (let i = 0; i < length; i++) code += ALPHABET[randomInt(ALPHABET.length)]
    return code
}

export const SHARE_CODE_PATTERN = /^[ABCDEFGHJKMNPQRSTUVWXYZ23456789]{6,16}$/

const ALNUM = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/**
 * Code de vérification envoyé par email (connexion, inscription) : 6 caractères 0-9A-Z, même format
 * qu'avant, mais tiré par `crypto`. L'ancien `Math.random().toString(36)` était prédictible ET
 * pouvait rendre moins de 6 caractères.
 */
export function generateVerificationCode(length = 6) {
    let code = ''
    for (let i = 0; i < length; i++) code += ALNUM[randomInt(ALNUM.length)]
    return code
}
