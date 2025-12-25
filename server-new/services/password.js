import bcrypt from 'bcryptjs'

// Hash a plain password
export async function hashPassword(password) {
    const saltRounds = 12
    return bcrypt.hash(password, saltRounds)
}

// Compare plain password to stored hash
export async function verifyPassword(password, hash) {
    if (!hash) return false
    return bcrypt.compare(password, hash)
}

export default {
    hashPassword,
    verifyPassword
}
