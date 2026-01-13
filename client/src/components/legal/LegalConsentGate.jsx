import React from 'react'

/**
 * LegalConsentGate simplifié - La gestion RDR est maintenant dans DisclaimerRDRModal
 * Ce composant ne fait plus de contrôle bloquant, il laisse passer le contenu.
 * Le DisclaimerRDRModal s'affiche automatiquement toutes les 24h selon le CDC.
 */
const LegalConsentGate = ({ children }) => {
    // Plus de logique bloquante - on affiche directement le contenu
    // Le disclaimer RDR récurrent est géré par DisclaimerRDRModal dans App.jsx
    return children
}

export default LegalConsentGate


