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