/**
 * Authentication Middleware
 * Handles token validation and user resolution
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const TOKENS_DIR = path.join(__dirname, '..', 'tokens');

/**
 * Resolve owner ID and roles from token
 * @param {string} token - Authentication token
 * @returns {object|null} - User info or null
 */
function resolveOwnerIdFromToken(token) {
    if (!token) return null;

    try {
        const tokenFile = path.join(TOKENS_DIR, token);

        if (!fs.existsSync(tokenFile)) {
            return null;
        }

        const content = fs.readFileSync(tokenFile, 'utf-8').trim();

        // Try parsing as JSON first
        try {
            const parsed = JSON.parse(content);
            if (parsed && (parsed.ownerId || parsed.roles)) {
                return {
                    ownerId: parsed.ownerId || null,
                    roles: Array.isArray(parsed.roles) ? parsed.roles : [],
                    discordId: parsed.discordId || null,
                    discordUsername: parsed.discordUsername || null
                };
            }
        } catch {
            // Not JSON, treat as plain ownerId
        }

        // Fallback: plain text ownerId
        return {
            ownerId: content || token,
            roles: [],
            discordId: null,
            discordUsername: null
        };
    } catch (error) {
        console.error('[Auth] Token resolution error:', error.message);
        return null;
    }
}

/**
 * Authentication middleware
 * Attaches auth info to req.auth
 */
export function authMiddleware(req, _res, next) {
    const token = req.header('X-Auth-Token') || req.query.token;
    const info = resolveOwnerIdFromToken(token);

    let ownerId = null;
    let roles = [];
    let discordId = null;
    let discordUsername = null;

    if (info && typeof info === 'object') {
        ownerId = info.ownerId || null;
        roles = Array.isArray(info.roles) ? info.roles : [];
        discordId = info.discordId || null;
        discordUsername = info.discordUsername || null;
    } else if (typeof info === 'string') {
        ownerId = info;
    }

    req.auth = {
        token: token || null,
        ownerId,
        roles,
        discordId,
        discordUsername,
        isStaff: roles.includes('staff'),
        isAuthenticated: !!ownerId
    };

    next();
}

/**
 * Require authentication middleware
 */
export function requireAuth(req, res, next) {
    if (!req.auth || !req.auth.isAuthenticated) {
        return res.status(401).json({
            error: 'unauthorized',
            message: 'Authentication required'
        });
    }
    next();
}

/**
 * Require staff role middleware
 */
export function requireStaff(req, res, next) {
    if (!req.auth || !req.auth.isStaff) {
        return res.status(403).json({
            error: 'forbidden',
            message: 'Staff privileges required'
        });
    }
    next();
}
