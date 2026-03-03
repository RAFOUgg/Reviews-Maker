/**
 * Service d'envoi d'emails avec Resend
 * ESM module — utilise import au lieu de require (package.json: "type": "module")
 */

import { Resend } from 'resend';

// Lazily initialised: évite le crash au démarrage si RESEND_API_KEY est absente
let _resend = null;
function getResend() {
    if (!process.env.RESEND_API_KEY) {
        throw new Error('[email] RESEND_API_KEY non configurée. Ajoutez-la dans le fichier .env du serveur.');
    }
    if (!_resend) {
        _resend = new Resend(process.env.RESEND_API_KEY);
    }
    return _resend;
}

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@reviews-maker.app';

/**
 * Envoie un email de code de vérification (6 chiffres)
 * @param {string} email - Email destinataire
 * @param {string} code - Code 6 chiffres
 * @param {string} locale - Langue (fr, en)
 */
async function sendVerificationCode(email, code, locale = 'fr') {
    const subject = locale === 'fr'
        ? 'Votre code de vérification'
        : 'Your verification code';

    const html = locale === 'fr'
        ? `
      <h2>Code de vérification</h2>
      <p>Bonjour,</p>
      <p>Voici votre code de vérification pour Reviews-Maker :</p>
      <h1 style="font-size: 32px; letter-spacing: 8px; color: #8B5CF6;">${code}</h1>
      <p>Ce code expire dans 10 minutes.</p>
      <p>Si vous n'avez pas demandé ce code, ignorez cet email.</p>
      <p>L'équipe Reviews-Maker</p>
    `
        : `
      <h2>Verification Code</h2>
      <p>Hello,</p>
      <p>Here is your verification code for Reviews-Maker:</p>
      <h1 style="font-size: 32px; letter-spacing: 8px; color: #8B5CF6;">${code}</h1>
      <p>This code expires in 10 minutes.</p>
      <p>If you didn't request this code, please ignore this email.</p>
      <p>The Reviews-Maker Team</p>
    `;

    const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html,
    });

    if (error) {
        throw new Error(`Échec envoi email: ${error.message}`);
    }

    return data;
}

/**
 * Envoie un email de bienvenue après inscription
 * @param {string} email - Email destinataire
 * @param {string} username - Nom d'utilisateur
 * @param {string} locale - Langue (fr, en)
 */
async function sendWelcomeEmail(email, username, locale = 'fr') {
    const subject = locale === 'fr'
        ? 'Bienvenue sur Reviews-Maker !'
        : 'Welcome to Reviews-Maker!';

    const html = locale === 'fr'
        ? `
      <h2>Bienvenue ${username} ! 🌿</h2>
      <p>Merci de rejoindre la communauté Reviews-Maker.</p>
      <p>Vous pouvez maintenant :</p>
      <ul>
        <li>Créer vos premières reviews de cannabis</li>
        <li>Explorer la galerie publique</li>
        <li>Personnaliser vos exports</li>
        <li>Suivre vos statistiques</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL}/create" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Créer ma première review</a></p>
      <p>À très bientôt,<br>L'équipe Reviews-Maker</p>
    `
        : `
      <h2>Welcome ${username}! 🌿</h2>
      <p>Thank you for joining the Reviews-Maker community.</p>
      <p>You can now:</p>
      <ul>
        <li>Create your first cannabis reviews</li>
        <li>Explore the public gallery</li>
        <li>Customize your exports</li>
        <li>Track your statistics</li>
      </ul>
      <p><a href="${process.env.FRONTEND_URL}/create" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Create my first review</a></p>
      <p>See you soon,<br>The Reviews-Maker Team</p>
    `;

    const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html,
    });

    if (error) {
        throw new Error(`Échec envoi email: ${error.message}`);
    }

    return data;
}

/**
 * Envoie un email de confirmation d'abonnement
 * @param {string} email - Email destinataire
 * @param {string} plan - Plan souscrit
 * @param {string} locale - Langue (fr, en)
 */
async function sendSubscriptionConfirmation(email, plan, locale = 'fr') {
    const planNames = {
        influencer_basic: locale === 'fr' ? 'Influenceur Basic' : 'Influencer Basic',
        influencer_pro: locale === 'fr' ? 'Influenceur Pro' : 'Influencer Pro',
        producer: locale === 'fr' ? 'Producteur' : 'Producer',
        merchant: locale === 'fr' ? 'Dispensaire' : 'Merchant',
    };

    const subject = locale === 'fr'
        ? `Confirmation de votre abonnement ${planNames[plan]}`
        : `Your ${planNames[plan]} subscription is confirmed`;

    const html = locale === 'fr'
        ? `
      <h2>Abonnement confirmé ! 🎉</h2>
      <p>Votre abonnement <strong>${planNames[plan]}</strong> est maintenant actif.</p>
      <p>Vous avez maintenant accès à toutes les fonctionnalités premium.</p>
      <p><a href="${process.env.FRONTEND_URL}/settings/subscription" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Gérer mon abonnement</a></p>
      <p>Merci de votre confiance,<br>L'équipe Reviews-Maker</p>
    `
        : `
      <h2>Subscription Confirmed! 🎉</h2>
      <p>Your <strong>${planNames[plan]}</strong> subscription is now active.</p>
      <p>You now have access to all premium features.</p>
      <p><a href="${process.env.FRONTEND_URL}/settings/subscription" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Manage my subscription</a></p>
      <p>Thank you for your trust,<br>The Reviews-Maker Team</p>
    `;

    const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html,
    });

    if (error) {
        throw new Error(`Échec envoi email: ${error.message}`);
    }

    return data;
}

/**
 * Envoie un email de notification de modération
 * @param {string} email - Email destinataire
 * @param {string} reason - Raison du signalement
 * @param {string} status - Statut (resolved, dismissed)
 * @param {string} locale - Langue (fr, en)
 */
async function sendModerationNotification(email, reason, status, locale = 'fr') {
    const subject = locale === 'fr'
        ? 'Notification de modération'
        : 'Moderation notification';

    const statusText = status === 'resolved'
        ? (locale === 'fr' ? 'résolu' : 'resolved')
        : (locale === 'fr' ? 'rejeté' : 'dismissed');

    const html = locale === 'fr'
        ? `
      <h2>Notification de modération</h2>
      <p>Le signalement concernant votre contenu a été <strong>${statusText}</strong>.</p>
      <p><strong>Raison :</strong> ${reason}</p>
      <p>Si vous avez des questions, contactez notre équipe de support.</p>
      <p>L'équipe Reviews-Maker</p>
    `
        : `
      <h2>Moderation Notification</h2>
      <p>The report about your content has been <strong>${statusText}</strong>.</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p>If you have any questions, contact our support team.</p>
      <p>The Reviews-Maker Team</p>
    `;

    const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html,
    });

    if (error) {
        throw new Error(`Échec envoi email: ${error.message}`);
    }

    return data;
}

/**
 * Envoie un email de réinitialisation de mot de passe
 * @param {string} email - Email destinataire
 * @param {string} resetLink - Lien de réinitialisation
 * @param {string} locale - Langue (fr, en)
 */
async function sendPasswordResetEmail(email, resetLink, locale = 'fr') {
    const subject = locale === 'fr'
        ? 'Réinitialisation de votre mot de passe'
        : 'Password reset request';

    const html = locale === 'fr'
        ? `
      <h2>Réinitialisation de mot de passe</h2>
      <p>Bonjour,</p>
      <p>Vous avez demandé à réinitialiser votre mot de passe pour Reviews-Maker.</p>
      <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
      <p><a href="${resetLink}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Réinitialiser mon mot de passe</a></p>
      <p style="color: #888; font-size: 14px;">Ce lien expire dans 1 heure.</p>
      <p>Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe restera inchangé.</p>
      <p>L'équipe Reviews-Maker</p>
    `
        : `
      <h2>Password Reset</h2>
      <p>Hello,</p>
      <p>You requested to reset your password for Reviews-Maker.</p>
      <p>Click the button below to set a new password:</p>
      <p><a href="${resetLink}" style="background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">Reset my password</a></p>
      <p style="color: #888; font-size: 14px;">This link expires in 1 hour.</p>
      <p>If you didn't request this, please ignore this email. Your password will remain unchanged.</p>
      <p>The Reviews-Maker Team</p>
    `;

    const { data, error } = await getResend().emails.send({
        from: FROM_EMAIL,
        to: email,
        subject,
        html,
    });

    if (error) {
        throw new Error(`Échec envoi email: ${error.message}`);
    }

    return data;
}

export {
    sendVerificationCode,
    sendWelcomeEmail,
    sendSubscriptionConfirmation,
    sendModerationNotification,
    sendPasswordResetEmail,
};

