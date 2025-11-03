import passport from 'passport'
import { Strategy as DiscordStrategy } from 'passport-discord'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function configurePassport() {
    passport.use(
        new DiscordStrategy(
            {
                clientID: process.env.DISCORD_CLIENT_ID,
                clientSecret: process.env.DISCORD_CLIENT_SECRET,
                callbackURL: process.env.DISCORD_REDIRECT_URI,
                scope: ['identify', 'email']
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    // Chercher ou créer l'utilisateur
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
                                email: profile.email,
                                roles: JSON.stringify([]) // Pas de rôles par défaut
                            }
                        })
                    } else {
                        // Mettre à jour les infos Discord (au cas où elles changent)
                        user = await prisma.user.update({
                            where: { discordId: profile.id },
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
                    return done(error, null)
                }
            }
        )
    )

    passport.serializeUser((user, done) => {
        done(null, user.id)
    })

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
}
