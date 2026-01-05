/**
 * Exporteur CSV pour la pipeline Culture
 * Génère un fichier CSV avec toutes les données de culture
 */
export class CultureCSVExporter {
    /**
     * Exporte les données de la pipeline en CSV
     * @param {Object} config - Configuration de la timeline (intervalType, dates, phases)
     * @param {Array} data - Données de la timeline [{cellIndex, data: {field_id: value}}]
     * @param {Array} sidebarContent - Configuration des champs disponibles
     * @returns {string} Contenu CSV
     */
    static export(config, data, sidebarContent) {
        if (!data || data.length === 0) {
            return 'Aucune donnée à exporter';
        }

        // Construire l'en-tête CSV
        const headers = ['Cellule', 'Période'];
        const allFieldIds = new Set();

        // Collecter tous les champs utilisés
        data.forEach(item => {
            if (item.data) {
                Object.keys(item.data).forEach(fieldId => allFieldIds.add(fieldId));
            }
        });

        // Ajouter les labels des champs à l'en-tête
        allFieldIds.forEach(fieldId => {
            const field = this.findFieldInSidebar(sidebarContent, fieldId);
            headers.push(field?.label || fieldId);
        });

        // Construire les lignes de données
        const rows = [headers];

        data.forEach((item, index) => {
            const row = [
                item.cellIndex + 1,
                this.getCellLabel(config, item.cellIndex)
            ];

            // Ajouter les valeurs pour chaque champ
            allFieldIds.forEach(fieldId => {
                const value = item.data?.[fieldId];
                row.push(this.formatValue(value));
            });

            rows.push(row);
        });

        // Convertir en CSV
        return rows.map(row =>
            row.map(cell => this.escapeCSV(cell)).join(',')
        ).join('\n');
    }

    /**
     * Télécharge le CSV
     * @param {Object} config
     * @param {Array} data
     * @param {Array} sidebarContent
     * @param {string} filename
     */
    static download(config, data, sidebarContent, filename = 'culture_pipeline.csv') {
        const csvContent = this.export(config, data, sidebarContent);
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');

        if (navigator.msSaveBlob) {
            // IE 10+
            navigator.msSaveBlob(blob, filename);
        } else {
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Méthodes auxiliaires
    static findFieldInSidebar(sidebarContent, fieldId) {
        if (!sidebarContent || !Array.isArray(sidebarContent)) return null;

        for (const section of sidebarContent) {
            if (section.items) {
                const found = section.items.find(item => item.id === fieldId);
                if (found) return found;
            }
        }
        return null;
    }

    static getCellLabel(config, cellIndex) {
        if (config.intervalType === 'phases' && config.phaseConfig) {
            const phaseIndex = config.startPhase + cellIndex;
            const phase = config.phaseConfig[phaseIndex];
            return phase?.label || `Phase ${phaseIndex + 1}`;
        }

        if (config.intervalType === 'jours') {
            return `J${cellIndex + 1}`;
        }

        if (config.intervalType === 'semaines') {
            return `S${cellIndex + 1}`;
        }

        return `${cellIndex + 1}`;
    }

    static formatValue(value) {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
    }

    static escapeCSV(value) {
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
        }
        return stringValue;
    }
}

export default CultureCSVExporter;
