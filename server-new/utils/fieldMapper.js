import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()
const mappingPath = path.resolve(__dirname, './server-new/config/field-mapping.json')
let mapping = {}
try {
    mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'))
} catch (e) {
    console.warn('Field mapping not found or invalid:', e.message)
}

// Build reverse mapping
const reverseMapping = {}
for (const k of Object.keys(mapping)) {
    const [model, field] = k.split('.')
    const to = mapping[k]
    reverseMapping[`${model}.${to}`] = field
}

function mapObjectKeys(obj, modelName) {
    if (!obj || typeof obj !== 'object') return obj
    const result = Array.isArray(obj) ? [] : {}
    for (const [k, v] of Object.entries(obj)) {
        const composite = `${modelName}.${k}`
        const mapped = mapping[composite] || mapping[`${modelName}.${k}`] || k
        // recursively map nested objects shallowly
        if (v && typeof v === 'object' && !Array.isArray(v)) {
            result[mapped] = mapObjectKeys(v, modelName)
        } else {
            result[mapped] = v
        }
    }
    return result
}

export function mapToDb(modelName, payload) {
    return mapObjectKeys(payload, modelName)
}

export function mapToApi(modelName, dbObject) {
    if (!dbObject || typeof dbObject !== 'object') return dbObject
    const result = Array.isArray(dbObject) ? [] : {}
    for (const [k, v] of Object.entries(dbObject)) {
        const composite = `${modelName}.${k}`
        const mapped = reverseMapping[composite] || k
        result[mapped] = v
    }
    return result
}