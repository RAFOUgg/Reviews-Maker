/**
 * LaFoncedalle Integration
 * Handles Discord user lookup and email sending
 */
import sqlite3 from 'sqlite3';
import crypto from 'crypto';

const LAFONCEDALLE_API_URL = process.env.LAFONCEDALLE_API_URL || 'http://localhost:5000';
const LAFONCEDALLE_API_KEY = process.env.LAFONCEDALLE_API_KEY || '';
const LAFONCEDALLE_DB_FILE = process.env.LAFONCEDALLE_DB_FILE;

/**
 * Query LaFoncedalleBot database directly
 */
async function getDiscordUserFromDB(email) {
    if (!LAFONCEDALLE_DB_FILE) {
        console.log('[LaFoncedalle][DB] DB path not configured, skipping direct DB query');
        return null;
    }

    return new Promise((resolve) => {
        const db = new sqlite3.Database(LAFONCEDALLE_DB_FILE, sqlite3.OPEN_READONLY, (err) => {
            if (err) {
                console.warn('[LaFoncedalle][DB] Could not open database:', err.message);
                return resolve(null);
            }

            db.get(
                "SELECT discord_id, user_email, user_name FROM user_links WHERE LOWER(user_email) = ? AND active = 1",
                [email.toLowerCase()],
                (err, row) => {
                    db.close();

                    if (err) {
                        console.warn('[LaFoncedalle][DB] Query error:', err.message);
                        return resolve(null);
                    }

                    if (!row) {
                        console.log(`[LaFoncedalle][DB] Email ${email} not found in database`);
                        return resolve(null);
                    }

                    const username = row.user_name || `User#${row.discord_id.slice(-4)}`;

                    console.log(`[LaFoncedalle][DB] Found user: ${username} (${row.discord_id})`);

                    resolve({
                        discordId: row.discord_id,
                        username: username,
                        email: row.user_email
                    });
                }
            );
        });
    });
}

/**
 * Fetch Discord user via LaFoncedalle API
 */
async function getDiscordUserFromAPI(email) {
    const candidates = [
        { method: 'POST', path: '/api/discord/user-by-email', body: { email } },
        { method: 'POST', path: '/api/users/find-by-email', body: { email } },
        { method: 'GET', path: `/api/users?email=${encodeURIComponent(email)}` }
    ];

    let lastError = null;

    for (const candidate of candidates) {
        try {
            const url = LAFONCEDALLE_API_URL.replace(/\/$/, '') + candidate.path;
            const options = {
                method: candidate.method,
                headers: {
                    'Authorization': `Bearer ${LAFONCEDALLE_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            };

            if (candidate.method === 'POST') {
                options.body = JSON.stringify(candidate.body || {});
            }

            const response = await fetch(url, options);

            if (response.status === 404) {
                lastError = new Error('not_found');
                continue;
            }

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                console.warn(`[LaFoncedalle] ${candidate.method} ${candidate.path} returned ${response.status}: ${text.slice(0, 200)}`);
                lastError = new Error(`status_${response.status}`);
                continue;
            }

            const contentType = response.headers.get('content-type') || '';
            let data = null;

            if (contentType.includes('application/json')) {
                data = await response.json();
            } else {
                const text = await response.text();
                try {
                    data = JSON.parse(text);
                } catch {
                    data = null;
                }
            }

            if (!data) {
                lastError = new Error('invalid_json');
                continue;
            }

            const user = data.user || data.data || data;
            const normalized = {
                discordId: user.discordId || user.discord_id || user.id || null,
                username: user.username || user.user_name || user.displayName || null,
                email: user.email || email
            };

            if (!normalized.discordId && !normalized.username) {
                lastError = new Error('not_found');
                continue;
            }

            return normalized;
        } catch (err) {
            console.warn('[LaFoncedalle] API lookup failed:', candidate.path, err.message);
            lastError = err;
            continue;
        }
    }

    if (lastError && lastError.message === 'not_found') {
        return null;
    }

    throw lastError || new Error('all_lookups_failed');
}

/**
 * Get Discord user by email (tries DB first, then API)
 */
export async function getDiscordUserByEmail(email) {
    // Try database first
    try {
        const dbUser = await getDiscordUserFromDB(email);
        if (dbUser) return dbUser;
    } catch (err) {
        console.warn('[LaFoncedalle] Database query failed, trying API:', err.message);
    }

    // Fallback to API
    return await getDiscordUserFromAPI(email);
}

/**
 * Send verification email
 */
export async function sendVerificationEmail(email, code) {
    const safeHtml = `<!doctype html>
  <html><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
  <body style="margin:0;padding:0;background:#f4f6f8;font-family:Arial,Helvetica,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="padding:20px 0;">
    <tr><td align="center">
      <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background:#ffffff;border-radius:10px;overflow:hidden;">
        <tr><td style="padding:18px 22px 8px 22px;color:#111;">
          <h2 style="margin:0;font-size:18px;color:#0f1724;">🔒 Code de vérification Reviews Maker</h2>
          <p style="margin:8px 0 0 0;color:#4b5563;font-size:14px;">Bonjour, voici votre code de vérification. Il expire dans 10 minutes.</p>
        </td></tr>
        <tr><td align="center" style="padding:18px 22px 22px 22px;background:#0f1628;">
          <table role="presentation" cellpadding="0" cellspacing="0" style="background:#0f1628;border-radius:8px;padding:18px 24px;">
            <tr><td style="color:#fff;font-size:28px;letter-spacing:4px;text-align:center;font-weight:700;">${code}</td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:14px 22px 20px 22px;color:#555;font-size:13px;line-height:1.4;">Si vous n'avez pas demandé ce code, ignorez ce message.</td></tr>
      </table>
    </td></tr>
  </table>
  </body></html>`;

    const plainText = `Code de vérification Reviews Maker\n\nVotre code : ${code}\n\nCe code expire dans 10 minutes. Si vous n'avez pas demandé ce code, ignorez ce message.`;

    const candidates = [
        {
            method: 'POST',
            path: '/api/mail/send-verification',
            body: {
                to: email,
                code,
                subject: 'Code de vérification Reviews Maker',
                appName: 'Reviews Maker',
                expiryMinutes: 10,
                html: safeHtml,
                text: plainText
            }
        },
        {
            method: 'POST',
            path: '/api/email/send',
            body: {
                to: email,
                code,
                subject: 'Code de vérification Reviews Maker',
                html: safeHtml,
                text: plainText
            }
        }
    ];

    let lastError = null;

    for (const candidate of candidates) {
        try {
            const url = LAFONCEDALLE_API_URL.replace(/\/$/, '') + candidate.path;
            const options = {
                method: candidate.method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${LAFONCEDALLE_API_KEY}`
                },
                body: JSON.stringify(candidate.body || {})
            };

            const response = await fetch(url, options);

            if (!response.ok) {
                const text = await response.text().catch(() => '');
                console.warn(`[LaFoncedalle][mail] ${candidate.path} returned ${response.status}: ${text.slice(0, 200)}`);
                lastError = new Error(`status_${response.status}`);
                continue;
            }

            const contentType = response.headers.get('content-type') || '';
            let result = null;

            if (contentType.includes('application/json')) {
                result = await response.json();
            } else {
                const text = await response.text();
                try {
                    result = JSON.parse(text);
                } catch {
                    result = { ok: true };
                }
            }

            console.log(`[EMAIL] Verification code sent to ${email} via LaFoncedalle (${candidate.path})`);
            return result;
        } catch (err) {
            console.warn('[EMAIL] Candidate failed:', candidate.path, err.message);
            lastError = err;
            continue;
        }
    }

    console.error('[EMAIL] All mail endpoints failed:', lastError?.message || lastError);
    throw lastError || new Error('mail_failed');
}

/**
 * Generate 6-digit verification code
 */
export function generateVerificationCode() {
    return crypto.randomInt(100000, 1000000).toString();
}
