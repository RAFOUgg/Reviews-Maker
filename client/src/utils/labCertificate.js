/**
 * labCertificate.js
 *
 * Règle unique : un taux de cannabinoïde ne se saisit QU'avec le certificat d'analyse qui
 * l'atteste. Un chiffre de labo sans COA n'est pas une donnée, c'est une affirmation.
 *
 * Cette règle existait déjà, mais écrite en dur dans `AnalyticsSection.jsx` (`hasCertificate`) —
 * donc appliquée au formulaire complet SEULEMENT. Le mode automatique (téléphone), qui pose les
 * mêmes questions par un autre chemin, ne la connaissait pas : on pouvait y saisir un taux de THC
 * sans avoir jamais déposé de certificat (signalé le 2026-08-14). Deux chemins de saisie pour la
 * même donnée doivent obéir à la même règle — d'où cette source unique, consommée par les deux.
 */

/**
 * @param {object} analytics - le sous-objet `formData.analytics` (ou `data` d'AnalyticsSection)
 * @returns {boolean} vrai dès qu'un certificat est joint, qu'il vienne d'être déposé
 *                    (`certificateFile`, un objet File) ou qu'il soit déjà enregistré
 *                    côté serveur (`labReportUrl`, une URL).
 */
export function hasLabCertificate(analytics) {
    if (!analytics) return false
    return !!analytics.certificateFile || !!analytics.labReportUrl
}

/** Même règle, appliquée à un `formData` complet de review. */
export function formDataHasLabCertificate(formData) {
    return hasLabCertificate(formData?.analytics)
}
