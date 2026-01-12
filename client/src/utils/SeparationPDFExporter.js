import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

/**
 * SeparationPDFExporter - Export PDF rapport de séparation
 * 
 * Génère un PDF complet avec:
 * - Informations générales séparation
 * - Tableaux des passes
 * - Graphiques rendement
 * - Statistiques globales
 */

/**
 * Exporter le rapport de séparation en PDF
 * @param {Object} separationData - Données complètes de séparation
 * @param {Array} separationData.passes - Array des passes
 * @param {string} separationData.separationType - Type de séparation
 * @param {number} separationData.batchSize - Taille du batch (g)
 * @param {Object} options - Options d'export
 * @returns {Promise<void>}
 */
export async function exportSeparationToPDF(separationData, options = {}) {
    const {
        filename = `separation-report-${Date.now()}.pdf`,
        includeGraphs = true,
        format = 'a4',
        orientation = 'portrait'
    } = options

    const { passes = [], separationType, batchSize, materialType, cultivars } = separationData

    // Créer le PDF
    const pdf = new jsPDF({
        orientation,
        unit: 'mm',
        format
    })

    const pageWidth = pdf.internal.pageSize.getWidth()
    const pageHeight = pdf.internal.pageSize.getHeight()
    const margin = 15

    let yPos = margin

    // Header
    pdf.setFontSize(22)
    pdf.setFont('helvetica', 'bold')
    pdf.text('🔬 Rapport de Séparation', margin, yPos)
    yPos += 10

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(100)
    pdf.text(`Généré le ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`, margin, yPos)
    yPos += 15

    // Section 1: Informations générales
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(0)
    pdf.text('📋 Informations Générales', margin, yPos)
    yPos += 7

    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')

    const generalInfo = [
        { label: 'Type de séparation', value: formatSeparationType(separationType) },
        { label: 'Type de matière', value: materialType || 'Non spécifié' },
        { label: 'Cultivar(s)', value: cultivars || 'Non spécifié' },
        { label: 'Taille du batch', value: `${batchSize || 0}g` },
        { label: 'Nombre de passes', value: passes.length },
        { label: 'Date de séparation', value: separationData.processingDate ? new Date(separationData.processingDate).toLocaleDateString('fr-FR') : 'Non spécifiée' }
    ]

    generalInfo.forEach(info => {
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${info.label}:`, margin + 5, yPos)
        pdf.setFont('helvetica', 'normal')
        pdf.text(info.value, margin + 60, yPos)
        yPos += 6
    })

    yPos += 10

    // Section 2: Tableau des passes
    if (passes.length > 0) {
        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.text('📊 Détail des Passes', margin, yPos)
        yPos += 7

        // Header du tableau
        const tableX = margin
        const colWidths = [15, 25, 25, 25, 25, 45]
        const headers = ['#', 'Durée', 'Microns', 'Poids', 'Qualité', 'Melt']

        pdf.setFillColor(60, 60, 60)
        pdf.rect(tableX, yPos - 5, pageWidth - 2 * margin, 7, 'F')

        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(255)

        let xPos = tableX + 2
        headers.forEach((header, idx) => {
            pdf.text(header, xPos, yPos)
            xPos += colWidths[idx]
        })

        yPos += 7
        pdf.setTextColor(0)
        pdf.setFont('helvetica', 'normal')

        // Lignes du tableau
        passes.forEach((pass, index) => {
            if (yPos > pageHeight - 30) {
                pdf.addPage()
                yPos = margin
            }

            // Alternating row colors
            if (index % 2 === 0) {
                pdf.setFillColor(240, 240, 240)
                pdf.rect(tableX, yPos - 5, pageWidth - 2 * margin, 7, 'F')
            }

            xPos = tableX + 2
            const rowData = [
                `${pass.passNumber}`,
                `${pass.duration || '?'} min`,
                `${pass.microns || '?'}µm`,
                `${pass.weight?.toFixed(2) || 0}g`,
                `${pass.quality?.toFixed(1) || 0}/10`,
                `${pass.melt?.toFixed(1) || 0}/10`
            ]

            rowData.forEach((data, idx) => {
                pdf.text(data, xPos, yPos)
                xPos += colWidths[idx]
            })

            yPos += 7

            // Notes si présentes
            if (pass.notes) {
                pdf.setFontSize(8)
                pdf.setTextColor(100)
                pdf.text(`Note: ${pass.notes.substring(0, 80)}${pass.notes.length > 80 ? '...' : ''}`, tableX + 2, yPos)
                yPos += 5
                pdf.setFontSize(9)
                pdf.setTextColor(0)
            }
        })

        yPos += 10
    }

    // Section 3: Statistiques globales
    if (yPos > pageHeight - 60) {
        pdf.addPage()
        yPos = margin
    }

    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.text('📈 Statistiques Globales', margin, yPos)
    yPos += 7

    const totalWeight = passes.reduce((sum, p) => sum + (p.weight || 0), 0)
    const avgQuality = passes.length > 0
        ? (passes.reduce((sum, p) => sum + (p.quality || 0), 0) / passes.length).toFixed(1)
        : 0
    const yieldPercentage = batchSize > 0 ? ((totalWeight / batchSize) * 100).toFixed(2) : 0
    const premiumCount = passes.filter(p => (p.quality || 0) >= 8).length

    const stats = [
        { label: 'Rendement total', value: `${totalWeight.toFixed(2)}g`, color: [59, 130, 246] },
        { label: 'Rendement %', value: `${yieldPercentage}%`, color: [16, 185, 129] },
        { label: 'Qualité moyenne', value: `${avgQuality}/10`, color: [251, 191, 36] },
        { label: 'Passes premium (≥8/10)', value: `${premiumCount}/${passes.length}`, color: [139, 92, 246] },
        { label: 'Perte estimée', value: `${Math.max(0, batchSize - totalWeight).toFixed(2)}g`, color: [239, 68, 68] }
    ]

    pdf.setFontSize(10)
    stats.forEach(stat => {
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...stat.color)
        pdf.text(`${stat.label}:`, margin + 5, yPos)
        pdf.setFont('helvetica', 'normal')
        pdf.text(stat.value, margin + 70, yPos)
        yPos += 7
    })

    yPos += 10

    // Section 4: Notes et observations
    if (separationData.generalNotes || separationData.difficulties || separationData.improvements) {
        if (yPos > pageHeight - 50) {
            pdf.addPage()
            yPos = margin
        }

        pdf.setFontSize(14)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(0)
        pdf.text('📝 Notes & Observations', margin, yPos)
        yPos += 7

        pdf.setFontSize(9)
        pdf.setFont('helvetica', 'normal')

        if (separationData.generalNotes) {
            pdf.setFont('helvetica', 'bold')
            pdf.text('Notes générales:', margin + 5, yPos)
            yPos += 5
            pdf.setFont('helvetica', 'normal')
            const notes = pdf.splitTextToSize(separationData.generalNotes, pageWidth - 2 * margin - 10)
            pdf.text(notes, margin + 5, yPos)
            yPos += notes.length * 5 + 5
        }

        if (separationData.difficulties) {
            pdf.setFont('helvetica', 'bold')
            pdf.text('Difficultés:', margin + 5, yPos)
            yPos += 5
            pdf.setFont('helvetica', 'normal')
            const diff = pdf.splitTextToSize(separationData.difficulties, pageWidth - 2 * margin - 10)
            pdf.text(diff, margin + 5, yPos)
            yPos += diff.length * 5 + 5
        }

        if (separationData.improvements) {
            pdf.setFont('helvetica', 'bold')
            pdf.text('Améliorations possibles:', margin + 5, yPos)
            yPos += 5
            pdf.setFont('helvetica', 'normal')
            const impr = pdf.splitTextToSize(separationData.improvements, pageWidth - 2 * margin - 10)
            pdf.text(impr, margin + 5, yPos)
        }
    }

    // Footer
    const totalPages = pdf.internal.pages.length - 1
    for (let i = 1; i <= totalPages; i++) {
        pdf.setPage(i)
        pdf.setFontSize(8)
        pdf.setTextColor(150)
        pdf.text(
            `Page ${i}/${totalPages} • Reviews-Maker • Rapport de Séparation`,
            pageWidth / 2,
            pageHeight - 10,
            { align: 'center' }
        )
    }

    // Sauvegarder
    pdf.save(filename)
}

/**
 * Formater le type de séparation
 */
function formatSeparationType(type) {
    const types = {
        'ice-water': 'Ice-Water / Bubble Hash',
        'dry-sift': 'Dry-Sift / Tamisage à sec',
        'ice-o-lator': 'Ice-O-Lator',
        'rosin-press': 'Pré-pressage (Rosin)',
        'manual': 'Manuel / Artisanal',
        'other': 'Autre méthode'
    }
    return types[type] || type
}

/**
 * Télécharger le PDF
 */
export function downloadSeparationPDF(separationData, filename = 'separation-report.pdf') {
    return exportSeparationToPDF(separationData, { filename })
}

/**
 * Hook React pour l'export PDF
 */
export function useSeparationPDFExport() {
    const [isExporting, setIsExporting] = React.useState(false)

    const exportToPDF = async (separationData, options = {}) => {
        setIsExporting(true)

        try {
            await exportSeparationToPDF(separationData, options)
            return true
        } catch (error) {
        }
    }

    return { isExporting, exportToPDF }
}

export default exportSeparationToPDF
