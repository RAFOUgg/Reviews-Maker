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
