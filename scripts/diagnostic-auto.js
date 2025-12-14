/**
 * Script de diagnostic automatique
 * Scanne le projet et identifie tous les problèmes
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const results = {
    missingFiles: [],
    brokenImports: [],
    unusedFiles: [],
    largFiles: [],
    duplicateCode: []
}

// 1. Vérifier tous les imports
function checkImports(filePath) {
    const content = fs.readFileSync(filePath, 'utf8')
    const importRegex = /import .* from ['"](.*)['"];?/g
    let match

    while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1]
        
        // Skip node_modules
        if (importPath.startsWith('.')) {
            const dir = path.dirname(filePath)
            const fullPath = path.resolve(dir, importPath)
            
            const possiblePaths = [
                fullPath,
                `${fullPath}.js`,
                `${fullPath}.jsx`,
                `${fullPath}/index.js`,
                `${fullPath}/index.jsx`
            ]

            const exists = possiblePaths.some(p => fs.existsSync(p))
            
            if (!exists) {
                results.brokenImports.push({
                    file: filePath,
                    import: importPath
                })
            }
        }
    }
}

// 2. Scanner tous les fichiers
function scanDirectory(dir) {
    const files = fs.readdirSync(dir)

    files.forEach(file => {
        const fullPath = path.join(dir, file)
        const stat = fs.statSync(fullPath)

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist') {
                scanDirectory(fullPath)
            }
        } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
            // Vérifier la taille
            const sizeKB = stat.size / 1024
            if (sizeKB > 100) {
                results.largeFiles.push({
                    file: fullPath,
                    size: Math.round(sizeKB)
                })
            }

            // Vérifier les imports
            checkImports(fullPath)
        }
    })
}

// Exécuter le scan
const clientSrc = path.join(__dirname, '../client/src')
console.log('🔍 Scanning project...\n')

scanDirectory(clientSrc)

// Afficher les résultats
console.log('📊 DIAGNOSTIC RESULTS\n')
console.log('='.repeat(50))

if (results.brokenImports.length > 0) {
    console.log('\n❌ BROKEN IMPORTS:', results.brokenImports.length)
    results.brokenImports.forEach(item => {
        console.log(`  ${item.file}`)
        console.log(`    → Cannot find: ${item.import}`)
    })
}

if (results.largeFiles.length > 0) {
    console.log('\n⚠️  LARGE FILES (>100KB):', results.largeFiles.length)
    results.largeFiles.forEach(item => {
        console.log(`  ${item.file} (${item.size}KB)`)
    })
}

if (results.brokenImports.length === 0 && results.largeFiles.length === 0) {
    console.log('\n✅ No critical issues found!')
}

console.log('\n' + '='.repeat(50))
