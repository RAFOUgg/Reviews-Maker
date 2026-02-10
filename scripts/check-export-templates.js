/*
 * Script: Verify Export Templates coverage
 * - Ensures each element in PREDEFINED_TEMPLATES is supported for the product type
 * - Run with: node scripts/check-export-templates.js
 */
const { PREDEFINED_TEMPLATES } = require('../client/src/data/exportTemplates.js')
const { isElementAvailableForProduct } = require('../client/src/utils/exportElementMappings.js')

function check() {
  let ok = true
  for (const productType of Object.keys(PREDEFINED_TEMPLATES)) {
    const templates = PREDEFINED_TEMPLATES[productType]
    for (const [tplName, tplDef] of Object.entries(templates)) {
      for (const el of (tplDef.elements || [])) {
        const id = el.id
        const supported = isElementAvailableForProduct(productType.toLowerCase(), id)
        if (!supported) {
          ok = false
          console.warn(`[WARN] ${productType} / template=${tplName} -> element '${id}' is NOT covered by module mappings`)
        }
      }
    }
  }
  if (ok) console.log('✅ All template elements are covered by module mappings')
  else console.log('❌ Some template elements are missing mappings. See warnings.')
  process.exit(ok ? 0 : 2)
}

check()
