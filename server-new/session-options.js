import sqliteStore from 'connect-sqlite3'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function buildSessionOptions(sessionLib) {
    const Store = sqliteStore(sessionLib)

    const options = {
        store: new Store({
            dir: path.join(__dirname, '../db'),
            db: 'sessions.db',
            concurrentDb: true
        }),
        secret: (process.env.SESSION_SECRET || 'your-secret-key-change-in-production'),
        resave: false,
        saveUninitialized: false,
        cookie: {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: (typeof process.env.SESSION_SECURE !== 'undefined')
                ? process.env.SESSION_SECURE === 'true'
                : process.env.NODE_ENV === 'production',
            sameSite: (typeof process.env.SESSION_SAME_SITE !== 'undefined')
                ? process.env.SESSION_SAME_SITE
                : (process.env.NODE_ENV === 'production' ? 'none' : 'lax'),
            path: '/'
        },
        name: 'sessionId'
    }

    // Ensure session dir exists
    try {
        fs.mkdirSync(path.join(__dirname, '../db'), { recursive: true })
    } catch (err) {
        // ignore
    }

    if (process.env.SESSION_DOMAIN) {
        options.cookie.domain = process.env.SESSION_DOMAIN
    }

    return options
}
