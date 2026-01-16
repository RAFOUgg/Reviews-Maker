#!/usr/bin/env node

/**
 * SCRIPT DE VALIDATION AUTOMATISÉE - SYSTÈME FLEURS
 * 
 * Ce script teste automatiquement tous les composants du système Fleurs
 * pour identifier les problèmes et les manques.
 * 
 * Usage: node audit-validation-fleurs.js
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ============================================================================
// CONFIGURATION DE VALIDATION
// ============================================================================

const VALIDATION_CHECKS = {
    frontend: {
        components: [
            'client/src/pages/review/CreateFlowerReview/sections/InfosGenerales.jsx',
            'client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx',
            'client/src/pages/review/CreateFlowerReview/sections/PipelineCulture.jsx',
            'client/src/pages/review/CreateFlowerReview/sections/VisuelTechnique.jsx',
            'client/src/pages/review/CreateFlowerReview/sections/Odeurs.jsx',
            'client/src/pages/review/CreateFlowerReview/sections/Texture.jsx',
            'client/src/pages/review/CreateFlowerReview/sections/Gouts.jsx',
            'client/src/pages/review/CreateFlowerReview/sections/Effets.jsx',
            'client/src/pages/review/CreateFlowerReview/sections/PipelineCuring.jsx'
        ],
        missingComponents: [
            'client/src/components/pipeline/GithubStylePipelineGrid.jsx',
            'client/src/components/export/ExportFormatSelector.jsx'
        ]
    },
    backend: {
        routes: [
            'server-new/routes/flower-reviews.js',
            'server-new/routes/pipelines.js',
            'server-new/routes/pipeline-github.js',
            'server-new/routes/presets.js',
            'server-new/routes/library.js',
            'server-new/routes/genetics.js'
        ]
    }
}

// ============================================================================
// VALIDATEURS COMPOSANTS
// ============================================================================

async function checkFileExists(filePath) {
    try {
        await fs.access(path.join(__dirname, filePath))
        return true
    } catch {
        return false
    }
}

async function checkFileContains(filePath, pattern) {
    try {
        const content = await fs.readFile(path.join(__dirname, filePath), 'utf-8')
        return new RegExp(pattern).test(content)
    } catch {
        return false
    }
}

// ============================================================================
// TESTS FRONTEND
// ============================================================================

async function validateFrontendComponents() {
    console.log('\n📱 VALIDATION FRONTEND\n')
    console.log('='.repeat(60))

    let passCount = 0
    let failCount = 0

    console.log('\n✅ Composants EXISTANTS:')
    console.log('-'.repeat(60))

    for (const component of VALIDATION_CHECKS.frontend.components) {
        const exists = await checkFileExists(component)
        const status = exists ? '✅ EXISTE' : '❌ MANQUANT'
        console.log(`${status}: ${component}`)

        if (exists) {
            passCount++

            // Vérifications supplémentaires
            const hasExport = await checkFileContains(component, 'export default|export \\{')
            if (!hasExport) {
                console.log(`   ⚠️  Export manquant`)
                failCount++
            }
        } else {
            failCount++
        }
    }

    console.log('\n❌ Composants MANQUANTS CRITIQUES:')
    console.log('-'.repeat(60))

    for (const component of VALIDATION_CHECKS.frontend.missingComponents) {
        const exists = await checkFileExists(component)
        const status = exists ? '✅ EXISTE' : '❌ MANQUANT'
        console.log(`${status}: ${component}`)

        if (!exists) {
            failCount++
        }
    }

    console.log('\n📊 RÉSUMÉ FRONTEND:')
    console.log(`✅ OK: ${passCount}`)
    console.log(`❌ ERREURS: ${failCount}`)

    return { pass: passCount, fail: failCount }
}

// ============================================================================
// TESTS BACKEND
// ============================================================================

async function validateBackendRoutes() {
    console.log('\n🖥️  VALIDATION BACKEND\n')
    console.log('='.repeat(60))

    let passCount = 0
    let failCount = 0

    for (const route of VALIDATION_CHECKS.backend.routes) {
        const exists = await checkFileExists(route)
        const status = exists ? '✅' : '❌'
        console.log(`${status} ${route}`)

        if (exists) {
            passCount++

            // Vérifications endpoints
            const endpoints = await checkRouteEndpoints(route)
            endpoints.forEach(ep => console.log(`   ${ep}`))
        } else {
            failCount++
        }
    }

    console.log('\n📊 RÉSUMÉ BACKEND:')
    console.log(`✅ OK: ${passCount}`)
    console.log(`❌ ERREURS: ${failCount}`)

    return { pass: passCount, fail: failCount }
}

async function checkRouteEndpoints(routePath) {
    try {
        const content = await fs.readFile(path.join(__dirname, routePath), 'utf-8')
        const endpoints = []

        // Matcher les routes
        const patterns = [
            /router\.(get|post|put|delete)\(['"](.*?)['"]/g,
            /app\.(get|post|put|delete)\(['"](.*?)['"]/g
        ]

        for (const pattern of patterns) {
            let match
            while ((match = pattern.exec(content)) !== null) {
                endpoints.push(`   - ${match[1].toUpperCase()} ${match[2]}`)
            }
        }

        return endpoints
    } catch {
        return []
    }
}

// ============================================================================
// TESTS MODÈLES PRISMA
// ============================================================================

async function validatePrismaModels() {
    console.log('\n🗄️  VALIDATION MODÈLES PRISMA\n')
    console.log('='.repeat(60))

    const schemaPath = 'server-new/prisma/schema.prisma'
    const exists = await checkFileExists(schemaPath)

    if (!exists) {
        console.log(`❌ ${schemaPath} MANQUANT`)
        return { pass: 0, fail: 1 }
    }

    console.log(`✅ ${schemaPath} EXISTS`)

    const requiredModels = [
        'FlowerReview',
        'PipelineGithub',
        'UserPreset',
        'GeneticTree',
        'SavedTemplate'
    ]

    let passCount = 1
    let failCount = 0

    for (const model of requiredModels) {
        const hasModel = await checkFileContains(schemaPath, `model ${model}`)
        const status = hasModel ? '✅' : '❌'
        console.log(`${status} Modèle: ${model}`)

        if (hasModel) {
            passCount++
        } else {
            failCount++
        }
    }

    console.log('\n📊 RÉSUMÉ MODÈLES:')
    console.log(`✅ OK: ${passCount}`)
    console.log(`❌ MANQUANTS: ${failCount}`)

    return { pass: passCount, fail: failCount }
}

// ============================================================================
// TESTS SECTIONS FLEURS
// ============================================================================

async function validateFlowerSections() {
    console.log('\n📋 VALIDATION SECTIONS FLEURS\n')
    console.log('='.repeat(60))

    const sections = [
        {
            name: 'SECTION 1: Infos Générales',
            file: 'client/src/pages/review/CreateFlowerReview/sections/InfosGenerales.jsx',
            keywords: ['nomCommercial', 'farm', 'varietyType', 'photos']
        },
        {
            name: 'SECTION 2: Génétiques',
            file: 'client/src/pages/review/CreateFlowerReview/sections/Genetiques.jsx',
            keywords: ['breeder', 'variety', 'geneticTree', 'PhenoHunt']
        },
        {
            name: 'SECTION 3: Pipeline Culture',
            file: 'client/src/pages/review/CreateFlowerReview/sections/PipelineCulture.jsx',
            keywords: ['UnifiedPipeline', 'culturePipeline', 'groups']
        },
        {
            name: 'SECTION 4: Visuel & Technique',
            file: 'client/src/pages/review/CreateFlowerReview/sections/VisuelTechnique.jsx',
            keywords: ['couleur', 'densité', 'trichomes', 'pistils']
        },
        {
            name: 'SECTION 5: Odeurs',
            file: 'client/src/pages/review/CreateFlowerReview/sections/Odeurs.jsx',
            keywords: ['notes', 'intensité', 'aromatique']
        },
        {
            name: 'SECTION 6: Texture',
            file: 'client/src/pages/review/CreateFlowerReview/sections/Texture.jsx',
            keywords: ['dureté', 'élasticité', 'collant']
        },
        {
            name: 'SECTION 7: Goûts',
            file: 'client/src/pages/review/CreateFlowerReview/sections/Gouts.jsx',
            keywords: ['intensité', 'aromatique', 'expiration']
        },
        {
            name: 'SECTION 8: Effets Ressentis',
            file: 'client/src/pages/review/CreateFlowerReview/sections/Effets.jsx',
            keywords: ['montée', 'intensité', 'profils', 'effets']
        },
        {
            name: 'SECTION 9: Pipeline Curing',
            file: 'client/src/pages/review/CreateFlowerReview/sections/PipelineCuring.jsx',
            keywords: ['curing', 'maturation', 'UnifiedPipeline']
        }
    ]

    let totalPass = 0
    let totalFail = 0

    for (const section of sections) {
        const exists = await checkFileExists(section.file)

        if (!exists) {
            console.log(`❌ ${section.name}: MANQUANT`)
            totalFail++
            continue
        }

        console.log(`✅ ${section.name}`)
        totalPass++

        // Vérifier keywords
        for (const keyword of section.keywords) {
            const hasKeyword = await checkFileContains(section.file, keyword)
            if (!hasKeyword) {
                console.log(`   ⚠️  Keyword manquant: ${keyword}`)
                totalFail++
            }
        }
    }

    console.log('\n📊 RÉSUMÉ SECTIONS:')
    console.log(`✅ OK: ${totalPass}/9`)
    console.log(`❌ PROBLÈMES: ${totalFail}`)

    return { pass: totalPass, fail: totalFail }
}

// ============================================================================
// RAPPORT FINAL
// ============================================================================

async function generateFinalReport(results) {
    console.log('\n' + '='.repeat(60))
    console.log('📊 RAPPORT FINAL DE VALIDATION')
    console.log('='.repeat(60))

    const totalPass = Object.values(results).reduce((sum, r) => sum + r.pass, 0)
    const totalFail = Object.values(results).reduce((sum, r) => sum + r.fail, 0)
    const totalTests = totalPass + totalFail
    const percentage = Math.round((totalPass / totalTests) * 100)

    console.log(`\n📈 STATISTIQUES GLOBALES:`)
    console.log(`✅ Tests réussis: ${totalPass}`)
    console.log(`❌ Tests échoués: ${totalFail}`)
    console.log(`📊 Total: ${totalTests}`)
    console.log(`📊 Couverture: ${percentage}%`)

    console.log('\n🎯 DÉTAILS PAR DOMAINE:')
    console.log(`- Frontend: ${results.frontend.pass}/${results.frontend.pass + results.frontend.fail}`)
    console.log(`- Backend: ${results.backend.pass}/${results.backend.pass + results.backend.fail}`)
    console.log(`- Prisma: ${results.prisma.pass}/${results.prisma.pass + results.prisma.fail}`)
    console.log(`- Sections: ${results.sections.pass}/9`)

    console.log('\n🚨 CRITIQUE:')
    if (results.frontend.fail > 2) {
        console.log(`- ❌ Frontend: ${results.frontend.fail} erreurs`)
    }
    if (results.backend.fail > 1) {
        console.log(`- ❌ Backend: ${results.backend.fail} erreurs`)
    }
    if (results.sections.fail > 2) {
        console.log(`- ❌ Sections: ${results.sections.fail} problèmes`)
    }

    console.log('\n💡 RECOMMANDATIONS:')
    if (percentage < 80) {
        console.log('- 🔴 Couverture < 80% - Priorité HAUTE pour finalisation')
    } else if (percentage < 95) {
        console.log('- 🟠 Couverture < 95% - Quelques tâches restantes')
    } else {
        console.log('- ✅ Système quasi-complet - Prêt pour testing')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✨ Audit terminé')
    console.log('='.repeat(60) + '\n')

    return percentage
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
    console.log('\n🔍 AUDIT VALIDATION SYSTÈME FLEURS')
    console.log('='.repeat(60))
    console.log(`Date: ${new Date().toLocaleString('fr-FR')}`)
    console.log('='.repeat(60))

    try {
        const results = {
            frontend: await validateFrontendComponents(),
            backend: await validateBackendRoutes(),
            prisma: await validatePrismaModels(),
            sections: await validateFlowerSections()
        }

        const percentage = await generateFinalReport(results)

        // Exit code
        process.exit(percentage < 80 ? 1 : 0)
    } catch (error) {
        console.error('\n❌ ERREUR AUDIT:', error.message)
        process.exit(1)
    }
}

main()
