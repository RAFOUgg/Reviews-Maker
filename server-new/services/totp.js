/**
 * Service TOTP pour l'authentification à deux facteurs (2FA)
 */

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

/**
 * Génère un secret TOTP pour un utilisateur
 * @param {string} username - Nom d'utilisateur
 * @returns {Object} { secret, otpauthUrl }
 */
function generateTOTPSecret(username) {
    const secret = speakeasy.generateSecret({
        name: `Reviews-Maker (${username})`,
        issuer: 'Reviews-Maker',
        length: 32,
    });

    return {
        secret: secret.base32,
        otpauthUrl: secret.otpauth_url,
    };
}

/**
 * Génère un QR code depuis l'URL otpauth
 * @param {string} otpauthUrl - URL otpauth du secret TOTP
 * @returns {Promise<string>} Data URL du QR code
 */
async function generateQRCode(otpauthUrl) {
    try {
        const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl);
        return qrCodeDataUrl;
    } catch (error) {
        throw new Error(`Échec génération QR code: ${error.message}`);
    }
}

/**
 * Vérifie un code TOTP
 * @param {string} secret - Secret TOTP base32
 * @param {string} token - Code 6 chiffres fourni par l'utilisateur
 * @param {number} window - Fenêtre de tolérance (par défaut 1 = ±30 secondes)
 * @returns {boolean} true si le code est valide
 */
function verifyTOTPToken(secret, token, window = 1) {
    return speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token,
        window, // Tolérance de ±30s par défaut
    });
}

/**
 * Génère un code TOTP pour tests (à utiliser uniquement en dev/test)
 * @param {string} secret - Secret TOTP base32
 * @returns {string} Code TOTP actuel
 */
function generateCurrentTOTP(secret) {
    return speakeasy.totp({
        secret,
        encoding: 'base32',
    });
}

/**
 * Workflow complet setup TOTP:
 * 1. Générer secret + QR code
 * 2. Afficher QR code à l'utilisateur
 * 3. Utilisateur scanne avec app authenticator (Google Authenticator, Authy, etc.)
 * 4. Utilisateur entre le code généré pour vérifier
 * 5. Si valid, sauvegarder totpSecret + totpEnabled=true dans User
 */
async function setupTOTP(username) {
    const { secret, otpauthUrl } = generateTOTPSecret(username);
    const qrCodeDataUrl = await generateQRCode(otpauthUrl);

    return {
        secret, // À sauvegarder chiffré dans User.totpSecret
        qrCodeDataUrl, // À afficher dans un <img src="..." />
        manualEntryKey: secret, // Si l'utilisateur préfère entrer manuellement
    };
}

/**
 * Vérifie le code TOTP lors du login
 * @param {Object} user - Utilisateur Prisma avec totpSecret
 * @param {string} token - Code 6 chiffres fourni
 * @returns {boolean} true si valide
 */
function verifyUserTOTP(user, token) {
    if (!user.totpEnabled || !user.totpSecret) {
        throw new Error('TOTP non activé pour cet utilisateur');
    }

    return verifyTOTPToken(user.totpSecret, token);
}

module.exports = {
    generateTOTPSecret,
    generateQRCode,
    verifyTOTPToken,
    generateCurrentTOTP,
    setupTOTP,
    verifyUserTOTP,
};
