import passport from 'passport'
import { Strategy as DiscordStrategy } from 'passport-discord'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as AppleStrategy } from 'passport-apple'
import { Strategy as AmazonStrategy } from 'passport-amazon'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Basic environment checks
if (!process.env.DISCORD_CLIENT_ID || !process.env.DISCORD_CLIENT_SECRET) {
// =============================================================================
// Google OAuth Strategy
// =============================================================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const googleCallback = process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.FRONTEND_URL}${process.env.BASE_PATH || ''}/api/auth/google/callback`;
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: googleCallback,
        scope: ['profile', 'email']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            // Chercher utilisateur par googleId
            let user = await prisma.user.findUnique({
                where: { googleId: profile.id }
            });

            if (!user) {
                // Vérifier si un utilisateur existe avec cet email
                const existingUser = await prisma.user.findFirst({
                    where: { email: profile.emails[0].value }
                });

                if (existingUser) {
                    // Lier le compte Google à l'utilisateur existant
                    user = await prisma.user.update({
                        where: { id: existingUser.id },
                        data: {
                            googleId: profile.id,
                            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : existingUser.avatar
                        }
                    });
                } else {
                    // Créer nouvel utilisateur
                    user = await prisma.user.create({
                        data: {
                            googleId: profile.id,
                            username: profile.displayName || profile.emails[0].value.split('@')[0],
                            email: profile.emails[0].value,
                            avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : null
                        }
                    });
                }
            } else {
                // Mettre à jour infos si changées
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        username: profile.displayName || user.username,
                        email: profile.emails[0].value,
                        avatar: profile.photos && profile.photos[0] ? profile.photos[0].value : user.avatar
                    }
                });
            }

            return done(null, user);
        } catch (error) {
            return done(error, null);
        }
    }));
} else {
}

// =============================================================================
// Apple OAuth Strategy
// =============================================================================
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
    const appleCallback = process.env.APPLE_REDIRECT_URI ||
        `${process.env.FRONTEND_URL}${process.env.BASE_PATH || ''}/api/auth/apple/callback`
}
