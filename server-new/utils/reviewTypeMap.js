/**
 * Mapping entre la clé normalisée reviewType ("flower"|"hash"|"concentrate"|"edible")
 * utilisée par ChainNode et la valeur brute de Review.type en base — pas de convention
 * de casse uniforme entre les 4 types (vérifié directement contre chaque route POST).
 */
export const REVIEW_TYPE_TO_DB = {
    flower: 'Fleurs',
    hash: 'hash',
    concentrate: 'concentrate',
    edible: 'edible'
}

export const VALID_REVIEW_TYPES = Object.keys(REVIEW_TYPE_TO_DB)

export function isValidReviewType(reviewType) {
    return VALID_REVIEW_TYPES.includes(reviewType)
}
