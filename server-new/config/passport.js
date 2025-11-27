import passport from 'passport'
import { Strategy as DiscordStrategy } from 'passport-discord'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Basic environment checks
if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
    console.warn('[passport] Warning: DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET not set. Discord OAuth will not work without them.')
}

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: process.env.DISCORD_REDIRECT_URI,
    scope: ['identify', 'email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        // Trouver ou créer l'utilisateur
        let user = await prisma.user.findUnique({
            where: { discordId: profile.id }
        })

        if (!user) {
            // Créer nouvel utilisateur
            user = await prisma.user.create({
                data: {
                    discordId: profile.id,
                    username: profile.username,
                    discriminator: profile.discriminator,
                    avatar: profile.avatar,
                    email: profile.email
                }
            })
            console.log('✅ New user created:', user.username)
        } else {
            // Mettre à jour les infos si changées
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    username: profile.username,
                    discriminator: profile.discriminator,
                    avatar: profile.avatar,
                    email: profile.email
                }
            })
        }

        return done(null, user)
    } catch (error) {
        console.error('Error in Discord strategy:', error)
        return done(error, null)
    }
}))

// Serialization (stocke user.id dans la session)
passport.serializeUser((user, done) => {
    done(null, user.id)
})

// Deserialization (récupère l'utilisateur complet depuis l'id)
passport.deserializeUser(async (id, done) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id }
        })
        done(null, user)
    } catch (error) {
        done(error, null)
    }
})
