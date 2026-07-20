/**
 * Diagnostic d'envoi d'e-mails.
 *
 *   node scripts/check-email.mjs                    → vérifie la configuration
 *   node scripts/check-email.mjs moi@exemple.fr     → envoie en plus un message de test
 */
import 'dotenv/config'
import { checkEmailTransport, sendVerificationCode } from '../services/email.js'

const status = await checkEmailTransport()

console.log('transport   :', status.transport || 'AUCUN')
console.log('expéditeur  :', status.from)
console.log('opérationnel:', status.ok ? 'oui' : 'non')
if (status.error) console.log('erreur      :', status.error)

if (!status.ok) {
    console.log('\nRenseignez dans .env :')
    console.log('  SMTP_HOST=...      (ex: smtp.gmail.com, ssl0.ovh.net, smtp.free.fr)')
    console.log('  SMTP_PORT=587      (465 si TLS direct)')
    console.log('  SMTP_USER=...      adresse complète')
    console.log('  SMTP_PASSWORD=...  mot de passe (ou mot de passe d\'application)')
    console.log('  EMAIL_FROM=...     expéditeur affiché')
    process.exit(1)
}

const target = process.argv[2]
if (target) {
    await sendVerificationCode(target, '123456', 'fr')
    console.log(`\nmessage de test envoyé à ${target} — vérifiez la boîte de réception ET les indésirables.`)
}
