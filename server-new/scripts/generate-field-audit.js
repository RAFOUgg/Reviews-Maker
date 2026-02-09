const fs = require('fs')
const path = require('path')

const schemaPath = path.resolve(__dirname, '../prisma/schema.prisma')
const outCsv = path.resolve(__dirname, '../scripts/fields-audit.csv')
const outJson = path.resolve(__dirname, '../config/field-mapping.json')

const schema = fs.readFileSync(schemaPath, 'utf8')

// Simple parser to capture model blocks and fields
const modelRegex = /model\s+(\w+)\s+\{([\s\S]*?)\n\}/g
let match
const rows = []

const replacements = [
    ['touche', 'touch'],
    ['densite', 'density'],
    ['friabilite', 'friability'],
    ['elasticite', 'elasticity'],
    ['humidite', 'humidity'],
    ['gouts', 'tastes'],
    ['gout', 'taste'],
    ['dureeEffet', 'effectDuration'],
    ['montee', 'onset'],
    ['intensite', 'intensity'],
    ['fidelite', 'fidelity'],
    ['notesDominantesOdeur', 'aromaDominantNotes'],
    ['notesSecondairesOdeur', 'aromaSecondaryNotes'],
    ['purgevide', 'vacuumPurge'],
    ['engrais', 'fertilizers'],
    ['substrat', 'substrate'],
    ['couleur', 'color'],
    ['viscosite', 'viscosity'],
    ['residus', 'residues'],
    ['touche', 'touch'],
    ['manucure', 'manicure'],
    ['moisissure', 'mold'],
    ['graine', 'seed'],
    ['duree', 'duration']
]

function suggest(name) {
    let s = name
    replacements.forEach(([a, b]) => {
        s = s.replace(new RegExp(a, 'ig'), b)
    })
    // camelCase safety: if it contains underscores, convert to camelCase
    s = s.replace(/_([a-z])/g, (_, c) => c.toUpperCase())
    return s
}

const mapping = {}

while ((match = modelRegex.exec(schema))) {
    const modelName = match[1]
    const body = match[2]
    const lines = body.split('\n').map(l => l.trim()).filter(Boolean)
    for (const line of lines) {
        // field lines: name type ... (skip @@ and comments)
        if (line.startsWith('//') || line.startsWith('@@')) continue
        const m = /^([a-zA-Z0-9_]+)\s+([A-Za-z0-9\[\]?]+)/.exec(line)
        if (m) {
            const field = m[1]
            const suggested = suggest(field)
            rows.push([modelName, field, suggested])
            if (field !== suggested) {
                mapping[`${modelName}.${field}`] = suggested
            }
        }
    }
}

// write CSV
const header = 'model,field,suggestedEnglish\n'
const csv = header + rows.map(r => r.join(',')).join('\n')
fs.writeFileSync(outCsv, csv, 'utf8')

// write JSON mapping (draft)
fs.mkdirSync(path.dirname(outJson), { recursive: true })
fs.writeFileSync(outJson, JSON.stringify(mapping, null, 2), 'utf8')

console.log('Audit generated:', outCsv)
console.log('Draft mapping generated:', outJson)