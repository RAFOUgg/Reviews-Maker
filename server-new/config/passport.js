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
    console.warn('[passport] Warning: DISCORD_CLIENT_ID or DISCORD_CLIENT_SECRET not set. Discord OAuth will not work without them.')
}

// Calculate callback url if DISCORD_REDIRECT_URI not set. If the app is hosted under a path prefix
// use BASE_PATH to build the correct path
const computedCallback = (process.env.DISCORD_REDIRECT_URI) || (process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}${process.env.BASE_PATH || ''}/api/auth/discord/callback` : undefined)
// Debug startup info - show the callback url and client id (never log secrets in production)
console.log('[passport] Discord ClientId set:', process.env.DISCORD_CLIENT_ID ? 'YES' : 'NO')
console.log('[passport] Discord CallbackURL:', computedCallback || '(none)')

passport.use(new DiscordStrategy({
    clientID: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    callbackURL: computedCallback,
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

// =============================================================================
// Google OAuth Strategy
// =============================================================================
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const googleCallback = process.env.GOOGLE_REDIRECT_URI ||
        `${process.env.FRONTEND_URL}${process.env.BASE_PATH || ''}/api/auth/google/callback`;

    console.log('[passport] Google ClientId set:', process.env.GOOGLE_CLIENT_ID ? 'YES' : 'NO');
    console.log('[passport] Google CallbackURL:', googleCallback);

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
                    console.log('✅ Google account linked to existing user:', user.username);
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
                    console.log('✅ New user created via Google:', user.username);
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
            console.error('Error in Google strategy:', error);
            return done(error, null);
        }
    }));
} else {
    console.log('[passport] Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)');
}

// =============================================================================
// Apple OAuth Strategy
// =============================================================================
if (process.env.APPLE_CLIENT_ID && process.env.APPLE_TEAM_ID && process.env.APPLE_KEY_ID && process.env.APPLE_PRIVATE_KEY) {
    const appleCallback = process.env.APPLE_REDIRECT_URI ||
        `${process.env.FRONTEND_URL}${process.env.BASE_PATH || ''}/api/auth/apple/callback`

    console.log('[passport] Apple ClientId set:', process.env.APPLE_CLIENT_ID ? 'YES' : 'NO')
    console.log('[passport] Apple CallbackURL:', appleCallback)

    passport.use(new AppleStrategy({
        clientID: process.env.APPLE_CLIENT_ID,
        teamID: process.env.APPLE_TEAM_ID,
        keyID: process.env.APPLE_KEY_ID,
        privateKeyString: process.env.APPLE_PRIVATE_KEY,
        callbackURL: appleCallback,
        scope: ['name', 'email']
    }, async (accessToken, refreshToken, idToken, profile, done) => {
        try {
            let user = await prisma.user.findUnique({
                where: { appleId: profile.id }
            })

            const primaryEmail = profile.email || (profile.emails && profile.emails[0] && profile.emails[0].value) || null
            const displayName = profile.name ? `${profile.name.firstName || ''} ${profile.name.lastName || ''}`.trim() : null

            if (!user) {
                const existingUser = primaryEmail ? await prisma.user.findUnique({
                    where: { email: primaryEmail }
                }) : null

                if (existingUser) {
                    user = await prisma.user.update({
                        where: { id: existingUser.id },
                        data: { appleId: profile.id }
                    })
                    console.log('✅ Apple account linked to existing user:', user.username)
                } else {
                    user = await prisma.user.create({
                        data: {
                            appleId: profile.id,
                            username: displayName || (primaryEmail ? primaryEmail.split('@')[0] : `apple-${profile.id}`),
                            email: primaryEmail
                        }
                    })
                    console.log('✅ New user created via Apple:', user.username)
                }
            }

            return done(null, user)
        } catch (error) {
            console.error('Error in Apple strategy:', error)
            return done(error, null)
        }
    }))
} else {
    console.log('[passport] Apple OAuth not configured')
}

// =============================================================================
// Amazon OAuth Strategy
// =============================================================================
if (process.env.AMAZON_CLIENT_ID && process.env.AMAZON_CLIENT_SECRET) {
    const amazonCallback = process.env.AMAZON_REDIRECT_URI ||
        `${process.env.FRONTEND_URL}${process.env.BASE_PATH || ''}/api/auth/amazon/callback`

    console.log('[passport] Amazon ClientId set:', process.env.AMAZON_CLIENT_ID ? 'YES' : 'NO')
    console.log('[passport] Amazon CallbackURL:', amazonCallback)

    passport.use(new AmazonStrategy({
        clientID: process.env.AMAZON_CLIENT_ID,
        clientSecret: process.env.AMAZON_CLIENT_SECRET,
        callbackURL: amazonCallback,
        scope: ['profile']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await prisma.user.findUnique({
                where: { amazonId: profile.id }
            })

            const primaryEmail = profile.emails && profile.emails[0] ? profile.emails[0].value : null
            const displayName = profile.displayName || (primaryEmail ? primaryEmail.split('@')[0] : null)

            if (!user) {
                const existingUser = primaryEmail ? await prisma.user.findFirst({
                    where: { email: primaryEmail }
                }) : null

                if (existingUser) {
                    user = await prisma.user.update({
                        where: { id: existingUser.id },
                        data: { amazonId: profile.id }
                    })
                    console.log('✅ Amazon account linked to existing user:', user.username)
                } else {
                    user = await prisma.user.create({
                        data: {
                            amazonId: profile.id,
                            username: displayName || `amazon-${profile.id}`,
                            email: primaryEmail
                        }
                    })
                    console.log('✅ New user created via Amazon:', user.username)
                }
            }

            return done(null, user)
        } catch (error) {
            console.error('Error in Amazon strategy:', error)
            return done(error, null)
        }
    }))
} else {
    console.log('[passport] Amazon OAuth not configured')
}

// =============================================================================
// Facebook OAuth Strategy
// =============================================================================
if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    const facebookCallback = process.env.FACEBOOK_REDIRECT_URI ||
        `${process.env.FRONTEND_URL}${process.env.BASE_PATH || ''}/api/auth/facebook/callback`

    console.log('[passport] Facebook ClientId set:', process.env.FACEBOOK_CLIENT_ID ? 'YES' : 'NO')
    console.log('[passport] Facebook CallbackURL:', facebookCallback)

    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
        callbackURL: facebookCallback,
        profileFields: ['id', 'emails', 'name', 'picture.type(large)']
    }, async (accessToken, refreshToken, profile, done) => {
        try {
            let user = await prisma.user.findUnique({
                where: { facebookId: profile.id }
            })

            const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null
            const displayName = profile.displayName || (email ? email.split('@')[0] : `fb-${profile.id}`)

            if (!user) {
                const existingUser = email ? await prisma.user.findFirst({
                    where: { email }
                }) : null

                if (existingUser) {
                    user = await prisma.user.update({
                        where: { id: existingUser.id },
                        data: { facebookId: profile.id }
                    })
                    console.log('✅ Facebook account linked to existing user:', user.username)
                } else {
                    user = await prisma.user.create({
                        data: {
                            facebookId: profile.id,
                            username: displayName,
                            email
                        }
                    })
                    console.log('✅ New user created via Facebook:', user.username)
                }
            }

            return done(null, user)
        } catch (error) {
            console.error('Error in Facebook strategy:', error)
            return done(error, null)
        }
    }))
} else {
    console.log('[passport] Facebook OAuth not configured')
}
