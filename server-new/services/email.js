/**
 * Service d'envoi d'emails — deux transports possibles.
 *
 * 1. SMTP (nodemailer) : n'importe quelle boîte existante (domaine, Gmail, FAI…). Utilisé dès que
 *    SMTP_HOST est renseigné.
 * 2. Resend : API transactionnelle, utilisée si RESEND_API_KEY est présente.
 *
 * Aucun des deux n'est configuré ⇒ on lève une erreur explicite plutôt que d'échouer en silence.
 * Tout passe par `deliver()` : les fonctions d'envoi ne connaissent pas le transport.
 *
 * ESM module — utilise import au lieu de require (package.json: "type": "module")
 */

import { Resend } from 'resend';
import nodemailer from 'nodemailer';

// Initialisations paresseuses : le serveur doit démarrer même sans configuration d'envoi.
let _resend = null;
let _smtp = null;

function getResend() {
    if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
    return _resend;
}

function getSmtp() {
    if (!_smtp) {
        const port = Number(process.env.SMTP_PORT || 587);
        _smtp = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port,
            // Le port 465 impose TLS d'emblée ; 587 et 25 démarrent en clair puis passent en
            // STARTTLS. `SMTP_SECURE` permet de forcer si le serveur sort de cette convention.
            secure: process.env.SMTP_SECURE !== undefined
                ? process.env.SMTP_SECURE === 'true'
                : port === 465,
            auth: process.env.SMTP_USER
                ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
                : undefined,
            // Dernier recours : certains serveurs (FAI, auto-hébergés) présentent un certificat
            // auto-signé ou expiré. À n'activer que si la connexion échoue pour cette raison —
            // cela retire la vérification du certificat du serveur de mail.
            ...(process.env.SMTP_TLS_REJECT_UNAUTHORIZED === 'false'
                ? { tls: { rejectUnauthorized: false } }
                : {}),
        });
    }
    return _smtp;
}

const FROM_EMAIL = process.env.EMAIL_FROM || process.env.SMTP_USER || 'noreply@reviews-maker.app';

/** Quel transport est réellement exploitable, dans l'ordre de préférence. */
function activeTransport() {
    if (process.env.SMTP_HOST) return 'smtp';
    if (process.env.RESEND_API_KEY) return 'resend';
    return null;
}

/**
 * Point d'envoi unique. Les appelants décrivent le message, pas le moyen de l'acheminer.
 * @param {{to: string, subject: string, html: string}} message
 */
async function deliver({ to, subject, html }) {
    const transport = activeTransport();

    if (!transport) {
        throw new Error(
            "[email] Aucun transport configuré : renseignez SMTP_HOST (+ SMTP_USER / SMTP_PASSWORD) " +
            "ou RESEND_API_KEY dans le .env du serveur."
        );
    }

    if (transport === 'smtp') {
        // nodemailer lève de lui-même en cas d'échec, avec le message du serveur SMTP.
        return getSmtp().sendMail({ from: FROM_EMAIL, to, subject, html });
    }

    const { data, error } = await getResend().emails.send({ from: FROM_EMAIL, to, subject, html });
    if (error) throw new Error(`Échec envoi email: ${error.message}`);
    return data;
}

/**
 * Diagnostic : vérifie que le transport configuré répond, sans envoyer de message.
 * @returns {Promise<{transport: string|null, ok: boolean, error?: string, from: string}>}
 */
async function checkEmailTransport() {
    const transport = activeTransport();
    if (!transport) return { transport: null, ok: false, error: 'aucun transport configuré', from: FROM_EMAIL };

    try {
        if (transport === 'smtp') await getSmtp().verify();
        return { transport, ok: true, from: FROM_EMAIL };
    } catch (err) {
        return { transport, ok: false, error: err.message, from: FROM_EMAIL };
    }
}

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

    return deliver({ to: email, subject, html });
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

    return deliver({ to: email, subject, html });
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

    return deliver({ to: email, subject, html });
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

    return deliver({ to: email, subject, html });
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

    return deliver({ to: email, subject, html });
}

const ROLE_LABELS_FR = { admin: 'Administrateur', editor: 'Éditeur', viewer: 'Lecteur' };
const ROLE_LABELS_EN = { admin: 'Admin', editor: 'Editor', viewer: 'Viewer' };

// Boutons Accepter / Refuser communs aux deux e-mails de la double validation.
function decisionButtons(link, locale) {
    const accept = locale === 'fr' ? 'Accepter' : 'Accept';
    const refuse = locale === 'fr' ? 'Refuser' : 'Decline';
    return `
      <p>
        <a href="${link}?decision=accept" style="background: #16A34A; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; margin-right: 8px;">${accept}</a>
        <a href="${link}?decision=refuse" style="background: #4B5563; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">${refuse}</a>
      </p>`;
}

/**
 * E-mail à la personne invitée. Le rattachement n'aura lieu que si le titulaire confirme aussi
 * de son côté : on le dit explicitement pour éviter l'impression d'un accès immédiat.
 */
async function sendCompanyInviteEmail(email, inviteLink, companyName, role, locale = 'fr') {
    const roleLabel = (locale === 'fr' ? ROLE_LABELS_FR : ROLE_LABELS_EN)[role] || role;

    const subject = locale === 'fr'
        ? `Invitation à rejoindre ${companyName} sur Reviews-Maker`
        : `Invitation to join ${companyName} on Reviews-Maker`;

    const html = locale === 'fr'
        ? `
      <h2>Invitation d'entreprise</h2>
      <p>Bonjour,</p>
      <p><strong>${companyName}</strong> vous invite à rejoindre son espace Reviews-Maker en tant que <strong>${roleLabel}</strong>.</p>
      ${decisionButtons(inviteLink, locale)}
      <p style="color: #888; font-size: 14px;">Votre rattachement ne prendra effet qu'une fois la demande également confirmée par le titulaire du compte entreprise.</p>
      <p style="color: #888; font-size: 14px;">Si vous ne vous attendiez pas à cette invitation, vous pouvez la refuser ou ignorer cet email.</p>
      <p>L'équipe Reviews-Maker</p>
    `
        : `
      <h2>Company invitation</h2>
      <p>Hello,</p>
      <p><strong>${companyName}</strong> invites you to join its Reviews-Maker workspace as <strong>${roleLabel}</strong>.</p>
      ${decisionButtons(inviteLink, locale)}
      <p style="color: #888; font-size: 14px;">Your membership only takes effect once the company account holder has also confirmed the request.</p>
      <p style="color: #888; font-size: 14px;">If you weren't expecting this invitation, you can decline it or ignore this email.</p>
      <p>The Reviews-Maker Team</p>
    `;

    return deliver({ to: email, subject, html });
}

/**
 * E-mail de confirmation au titulaire : il valide sa propre demande. C'est le garde-fou contre
 * un ajout de membre effectué depuis une session détournée — l'accès à sa boîte est requis.
 */
async function sendCompanyInviteOwnerEmail(ownerEmail, confirmLink, companyName, inviteeEmail, role, locale = 'fr') {
    const roleLabel = (locale === 'fr' ? ROLE_LABELS_FR : ROLE_LABELS_EN)[role] || role;

    const subject = locale === 'fr'
        ? `Confirmez l'ajout de ${inviteeEmail} à ${companyName}`
        : `Confirm adding ${inviteeEmail} to ${companyName}`;

    const html = locale === 'fr'
        ? `
      <h2>Confirmation d'ajout d'un membre</h2>
      <p>Bonjour,</p>
      <p>Une demande d'ajout de <strong>${inviteeEmail}</strong> à l'entreprise <strong>${companyName}</strong>, en tant que <strong>${roleLabel}</strong>, vient d'être effectuée depuis votre compte.</p>
      ${decisionButtons(confirmLink, locale)}
      <p style="color: #888; font-size: 14px;">Le rattachement ne sera effectif que si vous confirmez ici ET que la personne accepte de son côté.</p>
      <p style="color: #d97706; font-size: 14px;"><strong>Vous n'êtes pas à l'origine de cette demande ?</strong> Refusez-la et changez votre mot de passe.</p>
      <p>L'équipe Reviews-Maker</p>
    `
        : `
      <h2>Confirm new member</h2>
      <p>Hello,</p>
      <p>A request to add <strong>${inviteeEmail}</strong> to <strong>${companyName}</strong> as <strong>${roleLabel}</strong> was just made from your account.</p>
      ${decisionButtons(confirmLink, locale)}
      <p style="color: #888; font-size: 14px;">Membership only takes effect if you confirm here AND the person accepts on their side.</p>
      <p style="color: #d97706; font-size: 14px;"><strong>Didn't request this?</strong> Decline it and change your password.</p>
      <p>The Reviews-Maker Team</p>
    `;

    return deliver({ to: ownerEmail, subject, html });
}

export {
    checkEmailTransport,
    sendVerificationCode,
    sendWelcomeEmail,
    sendCompanyInviteEmail,
    sendCompanyInviteOwnerEmail,
    sendSubscriptionConfirmation,
    sendModerationNotification,
    sendPasswordResetEmail,
};

