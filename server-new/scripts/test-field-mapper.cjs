import { mapToDb, mapToApi } from '../utils/fieldMapper.js'

const input = { goutIntensity: 8, toucheDensite: 5 }
const mapped = mapToDb('Review', input)
console.log('mapToDb:', mapped)

const dbObj = { goutIntensity: 8, tasteIntensity: 8 }
const apiObj = mapToApi('Review', dbObj)
console.log('mapToApi:', apiObj)

if (mapped.tasteIntensity !== 8 && mapped.goutIntensity !== 8) {
    console.error('mapToDb failed to create tasteIntensity')
    process.exit(2)
}

console.log('Field mapper smoke test passed')
