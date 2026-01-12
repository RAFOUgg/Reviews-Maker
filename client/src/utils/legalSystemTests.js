/**
 * Script de test du système de pop-up légale
 * Exécuter dans la console du navigateur
 */

const LegalSystemTests = {
    // Test 1: Vérifier la présence des fichiers de configuration
    testConfigFiles() {
        fetch('/src/data/legalConfig.json')
            .catch(e => null)

        fetch('/src/i18n/legalWelcome.json')
            .catch(e => null)
    },

    // Test 2: Vérifier le localStorage
    testLocalStorage() {
        const consent = localStorage.getItem('terpologie_legal_consent')
        if (consent) {
            try {
                JSON.parse(consent)
            } catch (e) {
                // localStorage corrompu
            }
        }
    },

    // Test 3: Vérifier les endpoints API
    async testAPIEndpoints() {
        try {
            await fetch('/api/legal/user-preferences', {
                credentials: 'include'
            })
        } catch (e) {
            // Erreur réseau ignorée
        }

        try {
            await fetch('/api/legal/countries', {
                credentials: 'include'
            })
        } catch (e) {
            // Erreur réseau ignorée
        }
    },

    // Test 4: Simuler l'expiration
    simulateExpiration() {
        const consent = localStorage.getItem('terpologie_legal_consent')
        if (!consent) {
            return
        }

        try {
            const data = JSON.parse(consent)
            const oldDate = new Date()
            oldDate.setDate(oldDate.getDate() - 31)
            data.timestamp = oldDate.toISOString()

            localStorage.setItem('terpologie_legal_consent', JSON.stringify(data))
        } catch (e) {
            // Erreur lors de la simulation
        }
    }
},

    // Test 5: Forcer l'affichage
    forceDisplay() {
        console.group('🔍 Test 5: Forcer l\'affichage')

        localStorage.removeItem('terpologie_legal_consent')
}
}

// Auto-exécution si dans la console
if (typeof window !== 'undefined') {
    window.LegalSystemTests = LegalSystemTests
}

export default LegalSystemTests
