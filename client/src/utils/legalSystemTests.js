/**
 * Script de test du système de pop-up légale
 * Exécuter dans la console du navigateur
 */

const LegalSystemTests = {
    // Test 1: Vérifier la présence des fichiers de configuration
    testConfigFiles() {
        console.group('🔍 Test 1: Fichiers de configuration')

        fetch('/src/data/legalConfig.json')
            .then(r => r.json())
            .then(data => {
                console.log('✅ legalConfig.json chargé:', Object.keys(data.countries).length, 'pays')
                console.log('   Pays disponibles:', Object.keys(data.countries).join(', '))
            })
            .catch(e => console.error('❌ Erreur:', e))

        fetch('/src/i18n/legalWelcome.json')
            .then(r => r.json())
            .then(data => {
                console.log('✅ legalWelcome.json chargé:', Object.keys(data).length, 'langues')
                console.log('   Langues disponibles:', Object.keys(data).join(', '))
            })
            .catch(e => console.error('❌ Erreur:', e))

        console.groupEnd()
    },

    // Test 2: Vérifier le localStorage
    testLocalStorage() {
        console.group('🔍 Test 2: LocalStorage')

        const consent = localStorage.getItem('terpologie_legal_consent')
        if (consent) {
            try {
                const data = JSON.parse(consent)
                console.log('✅ Consentement trouvé:')
                console.table(data)

                const date = new Date(data.timestamp)
                const now = new Date()
                const daysSince = Math.floor((now - date) / (1000 * 60 * 60 * 24))
                console.log(`   Accepté il y a ${daysSince} jours`)
                console.log(`   Expire dans ${30 - daysSince} jours`)
            } catch (e) {
                console.error('❌ Consentement corrompu:', e)
            }
        } else {
            console.log('⚠️  Aucun consentement trouvé (modal devrait s\'afficher)')
        }

        console.groupEnd()
    },

    // Test 3: Vérifier les endpoints API
    async testAPIEndpoints() {
        console.group('🔍 Test 3: Endpoints API')

        try {
            // Test preferences
            const prefsRes = await fetch('/api/legal/user-preferences', {
                credentials: 'include'
            })

            if (prefsRes.ok) {
                const data = await prefsRes.json()
                console.log('✅ GET /api/legal/user-preferences:')
                console.table(data)
            } else {
                console.log('⚠️  GET /api/legal/user-preferences:', prefsRes.status, '(normal si non connecté)')
            }
        } catch (e) {
            console.error('❌ Erreur API:', e)
        }

        // Test countries
        try {
            const countriesRes = await fetch('/api/legal/countries', {
                credentials: 'include'
            })

            if (countriesRes.ok) {
                const data = await countriesRes.json()
                console.log('✅ GET /api/legal/countries:', data.countries.length, 'pays')
            } else {
                console.log('⚠️  GET /api/legal/countries:', countriesRes.status)
            }
        } catch (e) {
            console.error('❌ Erreur API countries:', e)
        }

        console.groupEnd()
    },

    // Test 4: Simuler l'expiration
    simulateExpiration() {
        console.group('🔍 Test 4: Simulation expiration')

        const consent = localStorage.getItem('terpologie_legal_consent')
        if (!consent) {
            console.log('⚠️  Pas de consentement à expirer')
            console.groupEnd()
            return
        }

        try {
            const data = JSON.parse(consent)
            const oldDate = new Date()
            oldDate.setDate(oldDate.getDate() - 31) // 31 jours en arrière
            data.timestamp = oldDate.toISOString()

            localStorage.setItem('terpologie_legal_consent', JSON.stringify(data))
            console.log('✅ Consentement expiré artificiellement')
            console.log('   Rechargez la page pour voir la modal')
        } catch (e) {
            console.error('❌ Erreur:', e)
        }

        console.groupEnd()
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
    console.log('✅ Tests chargés. Exécutez: LegalSystemTests.runAll()')
}

export default LegalSystemTests
