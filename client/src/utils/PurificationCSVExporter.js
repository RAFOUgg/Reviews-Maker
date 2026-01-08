/**
 * PurificationCSVExporter.js
 * 
 * Utilitaire d'export CSV pour données de purification
 * Format compatible Excel, LibreOffice, Google Sheets
 * 
 * Conforme CDC - Phase 4
 */

/**
 * Formater une valeur pour CSV (échapper guillemets et virgules)
 */
function formatCSVValue(value) {
    if (value === null || value === undefined) return ''

    const stringValue = String(value)

    // Échapper les guillemets et entourer de guillemets si nécessaire
    if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
    }

    return stringValue
}

/**
 * Convertir array 2D en chaîne CSV
 */
function arrayToCSV(data) {
    return data.map(row =>
        row.map(cell => formatCSVValue(cell)).join(',')
    ).join('\n')
}

/**
 * Formater le nom de méthode
 */
function formatMethodName(method) {
    const methods = {
        'winterization': 'Winterisation',
        'chromatography': 'Chromatographie sur colonne',
        'flash-chromatography': 'Flash Chromatography',
        'hplc': 'HPLC',
        'gc': 'GC',
        'tlc': 'TLC',
        'decarboxylation': 'Décarboxylation',
        'fractional-distillation': 'Distillation fractionnée',
        'short-path-distillation': 'Distillation short-path',
        'molecular-distillation': 'Distillation moléculaire',
        'filtration': 'Filtration',
        'centrifugation': 'Centrifugation',
        'vacuum-drying': 'Séchage sous vide',
        'recrystallization': 'Recristallisation',
        'sublimation': 'Sublimation',
        'liquid-liquid-extraction': 'Extraction liquide-liquide',
        'other': 'Autre méthode'
    }

    return methods[method] || method
}

/**
 * Exporter données de purification en CSV
 */
export function exportPurificationToCSV(data, steps = []) {
    const csvData = []

    // Header
    csvData.push(['RAPPORT DE PURIFICATION'])
    csvData.push(['Généré le', new Date().toLocaleString('fr-FR')])
    csvData.push([]) // Ligne vide

    // Informations générales
    csvData.push(['=== INFORMATIONS GÉNÉRALES ==='])
    csvData.push(['Méthode de purification', formatMethodName(data.purificationMethod)])
    csvData.push(['Date de traitement', data.processingDate || ''])
    csvData.push(['Durée totale (min)', data.processingDuration || ''])
    csvData.push(['Nombre de passes', data.numberOfPasses || ''])
    csvData.push(['Taille du batch (g)', data.batchSize || ''])

    if (data.purificationObjective && data.purificationObjective.length > 0) {
        csvData.push(['Objectifs', data.purificationObjective.join(', ')])
    }

    csvData.push([]) // Ligne vide

    // Solvants (si applicable)
    if (data.primarySolvent && data.primarySolvent !== 'none') {
        csvData.push(['=== SOLVANTS ==='])
        csvData.push(['Solvant principal', data.primarySolvent])
        csvData.push(['Ratio solvant/matière (mL/g)', data.solventRatio || ''])
        csvData.push(['Pureté du solvant', data.solventPurity || ''])
        if (data.secondarySolvent && data.secondarySolvent !== 'none') {
            csvData.push(['Solvant secondaire', data.secondarySolvent])
        }
        csvData.push([])
    }

    // Paramètres spécifiques winterisation
    if (data.purificationMethod === 'winterization') {
        csvData.push(['=== WINTERISATION ==='])
        csvData.push(['Température (°C)', data.winterization_temperature || ''])
        csvData.push(['Durée de congélation (h)', data.winterization_duration || ''])
        csvData.push(['Type de filtration', data.winterization_filtration || ''])
        csvData.push([])
    }

    // Paramètres chromatographie
    if (['chromatography', 'flash-chromatography', 'hplc'].includes(data.purificationMethod)) {
        csvData.push(['=== CHROMATOGRAPHIE ==='])
        csvData.push(['Type de colonne', data.column_type || ''])
        if (data.column_dimensions) {
            csvData.push(['Dimensions colonne', data.column_dimensions])
        }
        csvData.push(['Phase mobile', data.mobile_phase || ''])
        if (data.flow_rate) {
            csvData.push(['Débit (mL/min)', data.flow_rate])
        }
        csvData.push(['Gradient utilisé', data.gradient ? 'Oui' : 'Non'])
        csvData.push([])
    }

    // Paramètres distillation
    if (['fractional-distillation', 'short-path-distillation', 'molecular-distillation'].includes(data.purificationMethod)) {
        csvData.push(['=== DISTILLATION ==='])
        csvData.push(['Type de distillation', data.distillation_type || ''])
        csvData.push(['Température (°C)', data.distillation_temperature || ''])
        if (data.distillation_pressure) {
            csvData.push(['Pression (mbar)', data.distillation_pressure])
        }
        if (data.number_fractions) {
            csvData.push(['Nombre de fractions', data.number_fractions])
        }
        csvData.push([])
    }

    // Paramètres décarboxylation
    if (data.purificationMethod === 'decarboxylation') {
        csvData.push(['=== DÉCARBOXYLATION ==='])
        csvData.push(['Température (°C)', data.decarb_temperature || ''])
        csvData.push(['Durée (min)', data.decarb_duration || ''])
        csvData.push(['Atmosphère', data.decarb_atmosphere || ''])
        csvData.push([])
    }

    // Paramètres filtration
    if (data.purificationMethod === 'filtration') {
        csvData.push(['=== FILTRATION ==='])
        csvData.push(['Type de filtre', data.filter_type || ''])
        csvData.push(['Pression de filtration', data.filtration_pressure || ''])
        csvData.push([])
    }

    // Qualité et pureté
    csvData.push(['=== QUALITÉ & PURETÉ ==='])
    csvData.push(['Pureté initiale (%)', data.purity_before || ''])
    csvData.push(['Pureté finale (%)', data.purity_after || ''])

    if (data.purity_before && data.purity_after) {
        const gain = (data.purity_after - data.purity_before).toFixed(1)
        csvData.push(['Gain de pureté (%)', gain])
    }

    if (data.contamination_removed && data.contamination_removed.length > 0) {
        csvData.push(['Contaminants éliminés', data.contamination_removed.join(', ')])
    }

    csvData.push(['Testé en laboratoire', data.lab_tested ? 'Oui' : 'Non'])
    csvData.push([])

    // Rendement
    csvData.push(['=== RENDEMENT & PERTES ==='])
    csvData.push(['Poids initial (g)', data.weight_input || ''])
    csvData.push(['Poids final (g)', data.weight_output || ''])

    if (data.weight_input && data.weight_output) {
        const yieldPercent = ((data.weight_output / data.weight_input) * 100).toFixed(2)
        const losses = (data.weight_input - data.weight_output).toFixed(2)
        csvData.push(['Rendement (%)', yieldPercent])
        csvData.push(['Pertes (g)', losses])
    }

    if (data.loss_reasons && data.loss_reasons.length > 0) {
        csvData.push(['Raisons des pertes', data.loss_reasons.join(', ')])
    }

    csvData.push([])

    // Tableau des étapes (si multi-passes)
    if (steps && steps.length > 0) {
        csvData.push(['=== DÉTAIL DES ÉTAPES ==='])
        csvData.push([
            'Étape',
            'Date',
            'Durée (min)',
            'Pureté initiale (%)',
            'Pureté finale (%)',
            'Gain (%)',
            'Poids initial (g)',
            'Poids final (g)',
            'Rendement (%)',
            'Pertes (g)'
        ])

        steps.forEach((step, index) => {
            const gain = step.purity_after && step.purity_before
                ? (step.purity_after - step.purity_before).toFixed(1)
                : ''

            const yieldPercent = step.weight_input && step.weight_output
                ? ((step.weight_output / step.weight_input) * 100).toFixed(2)
                : ''

            const losses = step.weight_input && step.weight_output
                ? (step.weight_input - step.weight_output).toFixed(2)
                : ''

            csvData.push([
                index + 1,
                step.processingDate || '',
                step.processingDuration || '',
                step.purity_before || '',
                step.purity_after || '',
                gain,
                step.weight_input || '',
                step.weight_output || '',
                yieldPercent,
                losses
            ])
        })

        csvData.push([])
    }

    // Notes
    if (data.generalNotes || data.difficulties || data.improvements) {
        csvData.push(['=== NOTES & OBSERVATIONS ==='])

        if (data.generalNotes) {
            csvData.push(['Notes générales', data.generalNotes])
        }

        if (data.difficulties) {
            csvData.push(['Difficultés rencontrées', data.difficulties])
        }

        if (data.improvements) {
            csvData.push(['Améliorations possibles', data.improvements])
        }
    }

    // Convertir en CSV
    const csvString = arrayToCSV(csvData)

    // Télécharger
    const blob = new Blob(['\ufeff' + csvString], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    const filename = `purification_${formatMethodName(data.purificationMethod).replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`

    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
}

/**
 * Wrapper pour usage simple
 */
export function downloadPurificationCSV(data, steps = []) {
    exportPurificationToCSV(data, steps)
}

/**
 * Hook React optionnel
 */
export function usePurificationCSVExport() {
    return {
        exportToCSV: exportPurificationToCSV,
        downloadCSV: downloadPurificationCSV
    }
}

export default {
    exportPurificationToCSV,
    downloadPurificationCSV,
    usePurificationCSVExport
}
