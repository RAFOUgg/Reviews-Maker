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
        console.log('✅ Consentement supprimé')
        console.log('   Rechargez la page pour voir la modal')

        console.groupEnd()
    },

        // Test 6: Vérifier la validité du consentement
        validateConsent() {
    console.group('🔍 Test 6: Validation du consentement')

    const consent = localStorage.getItem('terpologie_legal_consent')
    if (!consent) {
        console.log('❌ Aucun consentement')
        console.groupEnd()
        return
    }

    try {
        const data = JSON.parse(consent)
        const checks = {
            'Pays': data.country ? '✅' : '❌',
            'Langue': data.language ? '✅' : '❌',
            'Âge confirmé': data.ageConfirmed ? '✅' : '❌',
            'Règles acceptées': data.rulesAccepted ? '✅' : '❌',
            'Confidentialité acceptée': data.privacyAccepted ? '✅' : '❌',
            'Timestamp': data.timestamp ? '✅' : '❌'
        }

        console.table(checks)

        const allValid = Object.values(checks).every(v => v === '✅')
        if (allValid) {
            console.log('✅ Consentement valide')
        } else {
            console.log('❌ Consentement incomplet')
        }
    } catch (e) {
        console.error('❌ Erreur:', e)
    }

    console.groupEnd()
},

// Exécuter tous les tests
runAll() {
    console.clear()
    console.log('🚀 Exécution des tests du système légal\n')

    this.testConfigFiles()
    setTimeout(() => this.testLocalStorage(), 500)
    setTimeout(() => this.testAPIEndpoints(), 1000)
    setTimeout(() => this.validateConsent(), 1500)

    console.log('\n💡 Autres commandes disponibles:')
    console.log('   LegalSystemTests.simulateExpiration() - Expire le consentement')
    console.log('   LegalSystemTests.forceDisplay() - Force l\'affichage de la modal')
}
}

// Auto-exécution si dans la console
if (typeof window !== 'undefined') {
    window.LegalSystemTests = LegalSystemTests
}

export default LegalSystemTests
