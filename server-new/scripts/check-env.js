#!/usr/bin/env node
import 'dotenv/config'
import fs from 'fs'
import path from 'path'

const required = [
    'DISCORD_CLIENT_ID',
    'DISCORD_CLIENT_SECRET',
    'DISCORD_REDIRECT_URI',
    'SESSION_SECRET',
    'DATABASE_URL',
    'PORT',
    'FRONTEND_URL'
]

let missing = []
for (const k of required) {
    if (!process.env[k]) missing.push(k)
}

console.log('\n🧭 Checking environment for Reviews-Maker (server-new)')
if (missing.length > 0) {
    console.warn('\n⚠️ Missing environment variables:')
    missing.forEach(m => console.warn('- ' + m))
    console.log('\nPlease set them in server-new/.env or in your process manager (PM2/systemd).')
} else {
    console.log('\n✅ All required env variables are present')
}

// Check DB file existence for local SQLite (DATABASE_URL="file:../db/reviews.sqlite")
// Normalize resolution similarly to server.js so checks reflect actual runtime path
const dbUrl = process.env.DATABASE_URL || 'file:../db/reviews.sqlite'
if (dbUrl.startsWith('file:')) {
    const filePath = dbUrl.slice(5)
    // Resolve relative to the project root (server-new/..)
    const resolved = path.isAbsolute(filePath)
        ? filePath
        : path.resolve(__dirname, '..', filePath)
    try {
        const stats = fs.statSync(resolved)
        console.log(`\n✅ Database file found: ${resolved} (size: ${stats.size} bytes)`)
    } catch (err) {
        console.warn(`\n⚠️ Database file not found at ${resolved}. If you're using SQLite, run migrations and ensure the file is present and writable.`)
        // Ensure parent directory exists so the server can create the file later
        try {
            fs.mkdirSync(path.dirname(resolved), { recursive: true })
            console.log(`\nℹ️ Created missing parent directory: ${path.dirname(resolved)}`)
        } catch (mkdirErr) {
            console.warn(`\n⚠️ Unable to create parent directory ${path.dirname(resolved)}: ${mkdirErr.message}`)
        }
    }
}

console.log('\n📋 Next steps:')
console.log('- Ensure your Discord Oauth app has the redirect URI set to the value of DISCORD_REDIRECT_URI')
console.log('- Restart the server after editing env variables')
console.log('- If using a LAN-accessible address (192.168.x.x), set FRONTEND_URL to that address instead of localhost')
console.log('\n')
