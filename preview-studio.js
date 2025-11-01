/**
 * PREVIEW STUDIO - Système avancé d'aperçu en temps réel
 * Permet de personnaliser l'affichage, choisir les sections visibles et le style graphique
 */

// Configuration de preview par défaut
const previewConfig = {
    // Style prédéfini sélectionné
    presetStyle: 'compact', // 'compact', 'airy', 'minimal'

    // Variante de couleur
    colorVariant: 'emerald', // 'emerald', 'ocean', 'sunset', 'midnight', 'forest', 'candy'

    // Sections à afficher
    sections: {
        header: true,
        cultivars: true,
        generalInfo: true,
        scores: true,
        details: true,
        textures: true,
        flavors: true,
        effects: true,
        notes: true,
        branding: true
    },

    // Contenu personnalisé
    branding: {
        signature: null,
        customText: null,
        watermarkText: 'Reviews Maker'
    }
};

// Styles prédéfinis Apple-like
const previewPresets = {
    compact: {
        name: 'Compact',
        description: 'Dense et efficace',
        icon: '▪',
        style: {
            spacing: '12px',
            borderRadius: '12px',
            fontSize: '14px',
            lineHeight: '1.4',
            padding: '16px',
            gap: '12px',
            shadow: '0 2px 8px rgba(0,0,0,0.1)',
            bubbleStyle: 'solid'
        }
    },

    airy: {
        name: 'Aéré',
        description: 'Spacieux et respire',
        icon: '○',
        style: {
            spacing: '24px',
            borderRadius: '20px',
            fontSize: '15px',
            lineHeight: '1.6',
            padding: '28px',
            gap: '20px',
            shadow: '0 8px 32px rgba(0,0,0,0.12)',
            bubbleStyle: 'outlined'
        }
    },

    minimal: {
        name: 'Épuré',
        description: 'Minimaliste et élégant',
        icon: '—',
        style: {
            spacing: '16px',
            borderRadius: '16px',
            fontSize: '14px',
            lineHeight: '1.5',
            padding: '20px',
            gap: '16px',
            shadow: '0 4px 16px rgba(0,0,0,0.08)',
            bubbleStyle: 'glass'
        }
    }
};

// Variantes de couleurs Apple-like
const colorVariants = {
    emerald: {
        name: 'Émeraude',
        icon: '●',
        primary: '#34d399',
        secondary: '#10b981',
        background: '#0f1628',
        surface: '#1a2640',
        text: '#f8fafc',
        gradient: 'linear-gradient(135deg, #34d399 0%, #10b981 100%)'
    },
    ocean: {
        name: 'Océan',
        icon: '●',
        primary: '#38bdf8',
        secondary: '#0ea5e9',
        background: '#0a1929',
        surface: '#1e3a5f',
        text: '#f0f9ff',
        gradient: 'linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)'
    },
    sunset: {
        name: 'Couchant',
        icon: '●',
        primary: '#fb923c',
        secondary: '#f97316',
        background: '#1a1210',
        surface: '#2d1f1a',
        text: '#fff7ed',
        gradient: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)'
    },
    midnight: {
        name: 'Minuit',
        icon: '●',
        primary: '#a78bfa',
        secondary: '#8b5cf6',
        background: '#1a1625',
        surface: '#2d2440',
        text: '#faf5ff',
        gradient: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
    },
    forest: {
        name: 'Forêt',
        icon: '●',
        primary: '#84cc16',
        secondary: '#65a30d',
        background: '#1a2010',
        surface: '#2d3a1f',
        text: '#f7fee7',
        gradient: 'linear-gradient(135deg, #84cc16 0%, #65a30d 100%)'
    },
    candy: {
        name: 'Bonbon',
        icon: '●',
        primary: '#f472b6',
        secondary: '#ec4899',
        background: '#2a1625',
        surface: '#3d2438',
        text: '#fdf2f8',
        gradient: 'linear-gradient(135deg, #f472b6 0%, #ec4899 100%)'
    }
};

/**
 * Classe principale du Preview Studio
 */
class PreviewStudio {
    constructor() {
        this.config = this.loadConfig();
        this.isOpen = false;
        this.currentReviewData = null;
    }

    /**
     * Charge la configuration sauvegardée
     */
    loadConfig() {
        try {
            const saved = localStorage.getItem('previewStudioConfig');
            if (saved) {
                const parsed = JSON.parse(saved);
                return { ...previewConfig, ...parsed };
            }
        } catch (e) {
            console.warn('Erreur chargement config preview:', e);
        }
        return { ...previewConfig };
    }

    /**
     * Sauvegarde la configuration
     */
    saveConfig() {
        try {
            localStorage.setItem('previewStudioConfig', JSON.stringify(this.config));
        } catch (e) {
            console.warn('Erreur sauvegarde config preview:', e);
        }
    }

    /**
     * Ouvre le panneau de configuration d'aperçu
     */
    open(reviewData) {
        console.log('[Preview Studio] Opening with data:', reviewData);

        this.currentReviewData = reviewData;
        this.isOpen = true;

        const panel = document.getElementById('previewStudioPanel');
        if (!panel) {
            console.error('[Preview Studio] Panel element not found!');
            return;
        }

        console.log('[Preview Studio] Panel found, displaying...');

        // Afficher le panneau
        panel.style.display = 'flex';
        // Force reflow
        panel.offsetHeight;
        panel.classList.add('active');

        // Initialiser les contrôles
        this.initControls();

        // Gérer la fermeture par clic sur l'overlay
        panel.addEventListener('click', (e) => {
            if (e.target === panel) {
                this.close();
            }
        });

        // Gérer la fermeture par touche Échap
        this.handleEscapeKey = this.handleEscapeKey.bind(this);
        document.addEventListener('keydown', this.handleEscapeKey);

        // Générer l'aperçu initial
        this.generatePreview();

        console.log('[Preview Studio] Preview generated');

        // Focus sur le premier template
        const firstTemplate = panel.querySelector('.preview-template-btn');
        if (firstTemplate) firstTemplate.focus();
    }

    /**
     * Ferme le panneau
     */
    close() {
        this.isOpen = false;
        const panel = document.getElementById('previewStudioPanel');
        if (panel) {
            panel.classList.remove('active');
            setTimeout(() => {
                panel.style.display = 'none';
            }, 300);
        }

        // Retirer le listener d'échap
        document.removeEventListener('keydown', this.handleEscapeKey);
    }

    /**
     * Gère la touche Échap pour fermer la modale
     */
    handleEscapeKey(e) {
        if (e.key === 'Escape' && this.isOpen) {
            this.close();
        }
    }

    /**
     * Initialise tous les contrôles du panneau
     */
    initControls() {
        // Sélection de template
        document.querySelectorAll('.preview-template-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.template === this.config.template);
            btn.onclick = () => this.setTemplate(btn.dataset.template);
        });

        // Sections à afficher
        Object.keys(this.config.sections).forEach(sectionKey => {
            const checkbox = document.getElementById(`preview-section-${sectionKey}`);
            if (checkbox) {
                checkbox.checked = this.config.sections[sectionKey];
                checkbox.onchange = () => this.toggleSection(sectionKey, checkbox.checked);
            }
        });

        // Couleur principale
        const colorInput = document.getElementById('preview-accent-color');
        if (colorInput) {
            colorInput.value = this.config.style.accentColor;
            colorInput.oninput = (e) => {
                this.setAccentColor(e.target.value);
                // Mettre à jour l'affichage de la valeur hexa
                const valueDisplay = document.querySelector('.preview-color-value');
                if (valueDisplay) valueDisplay.textContent = e.target.value.toUpperCase();
            };
        }

        // Presets de couleurs
        document.querySelectorAll('.preview-color-preset').forEach(preset => {
            const color = preset.dataset.color;
            preset.classList.toggle('active', color === this.config.style.accentColor);
            preset.onclick = () => {
                this.setAccentColor(color);
                if (colorInput) colorInput.value = color;
                // Mettre à jour l'affichage de la valeur hexa
                const valueDisplay = document.querySelector('.preview-color-value');
                if (valueDisplay) valueDisplay.textContent = color.toUpperCase();
            };
        });

        // Thème clair/sombre
        const schemeSelect = document.getElementById('preview-color-scheme');
        if (schemeSelect) {
            schemeSelect.value = this.config.style.colorScheme;
            schemeSelect.onchange = (e) => this.setColorScheme(e.target.value);
        }

        // Taille de police
        const fontSizeSelect = document.getElementById('preview-font-size');
        if (fontSizeSelect) {
            fontSizeSelect.value = this.config.style.fontSize;
            fontSizeSelect.onchange = (e) => this.setFontSize(e.target.value);
        }

        // Espacement
        const spacingSelect = document.getElementById('preview-spacing');
        if (spacingSelect) {
            spacingSelect.value = this.config.style.spacing;
            spacingSelect.onchange = (e) => this.setSpacing(e.target.value);
        }

        // Contrôles de zoom
        document.querySelectorAll('.preview-zoom-btn').forEach(btn => {
            btn.onclick = () => {
                const zoom = parseFloat(btn.dataset.zoom);
                this.setZoom(zoom);
                document.querySelectorAll('.preview-zoom-btn').forEach(b => {
                    b.classList.toggle('active', b.dataset.zoom === btn.dataset.zoom);
                });
            };
        });

        // Bouton Appliquer et Fermer
        const applyBtn = document.getElementById('previewApplyBtn');
        if (applyBtn) {
            applyBtn.onclick = () => {
                this.saveConfig();
                // Appliquer au panneau principal si nécessaire
                if (typeof generateReview === 'function') {
                    generateReview();
                }
                this.close();
            };
        }

        const cancelBtn = document.getElementById('previewCancelBtn');
        if (cancelBtn) {
            cancelBtn.onclick = () => {
                // Recharger la config sauvegardée
                this.config = this.loadConfig();
                this.close();
            };
        }

        // Bouton de fermeture (X)
        const closeBtn = document.getElementById('previewStudioCloseBtn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                this.close();
            };
        }
    }

    /**
     * Change le zoom de l'aperçu
     */
    setZoom(zoom) {
        const canvas = document.getElementById('previewStudioCanvas');
        if (!canvas) return;

        // Retirer toutes les classes de zoom
        canvas.classList.remove('zoom-50', 'zoom-75', 'zoom-100', 'zoom-125', 'zoom-150');

        // Ajouter la nouvelle classe de zoom
        const zoomClass = `zoom-${Math.round(zoom * 100)}`;
        canvas.classList.add(zoomClass);
    }

    /**
     * Change le template actif
     */
    setTemplate(templateName) {
        const template = previewTemplates[templateName];
        if (!template) return;

        this.config.template = templateName;

        // Appliquer les sections par défaut du template
        Object.keys(this.config.sections).forEach(key => {
            this.config.sections[key] = template.defaultSections.includes(key);
        });

        // Appliquer le style par défaut du template
        if (template.defaultStyle) {
            this.config.style = { ...this.config.style, ...template.defaultStyle };
        }

        // Mettre à jour l'interface
        document.querySelectorAll('.preview-template-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.template === templateName);
        });

        // Mettre à jour les checkboxes de sections
        Object.keys(this.config.sections).forEach(key => {
            const checkbox = document.getElementById(`preview-section-${key}`);
            if (checkbox) checkbox.checked = this.config.sections[key];
        });

        this.generatePreview();
    }

    /**
     * Active/désactive une section
     */
    toggleSection(sectionKey, enabled) {
        this.config.sections[sectionKey] = enabled;
        this.generatePreview();
    }

    /**
     * Change la couleur d'accent
     */
    setAccentColor(color) {
        this.config.style.accentColor = color;

        // Mettre à jour les presets actifs
        document.querySelectorAll('.preview-color-preset').forEach(preset => {
            preset.classList.toggle('active', preset.dataset.color === color);
        });

        this.generatePreview();
    }

    /**
     * Change le thème clair/sombre
     */
    setColorScheme(scheme) {
        this.config.style.colorScheme = scheme;

        // Mettre à jour la couleur de fond automatiquement
        if (scheme === 'dark') {
            this.config.style.backgroundColor = '#0f1628';
        } else if (scheme === 'light') {
            this.config.style.backgroundColor = '#f8fafc';
        }

        this.generatePreview();
    }

    /**
     * Change la taille de police
     */
    setFontSize(size) {
        this.config.style.fontSize = size;
        this.generatePreview();
    }

    /**
     * Change l'espacement
     */
    setSpacing(spacing) {
        this.config.style.spacing = spacing;
        this.generatePreview();
    }

    /**
     * Génère l'aperçu selon la configuration actuelle
     */
    generatePreview() {
        console.log('[Preview Studio] Generating preview...');

        const previewArea = document.getElementById('previewStudioCanvas');
        if (!previewArea) {
            console.error('[Preview Studio] Canvas element not found!');
            return;
        }

        if (!this.currentReviewData) {
            console.warn('[Preview Studio] No review data available');
            previewArea.innerHTML = this.renderEmptyState();
            return;
        }

        console.log('[Preview Studio] Rendering preview with data:', this.currentReviewData);
        const html = this.renderPreview(this.currentReviewData);
        previewArea.innerHTML = html;
        console.log('[Preview Studio] Preview rendered successfully');
    }

    /**
     * Génère le HTML de l'aperçu
     */
    renderPreview(data) {
        // Vérifier que les données sont valides
        if (!data || !data.currentType || !data.cultivarInfo) {
            return this.renderEmptyState();
        }

        const template = previewTemplates[this.config.template];
        const isDark = this.config.style.colorScheme === 'dark';
        const bgColor = this.config.style.backgroundColor || (isDark ? '#0f1628' : '#f8fafc');
        const textColor = isDark ? '#f8fafc' : '#0a162b';
        const mutedColor = isDark ? '#94a3b8' : '#64748b';

        let html = `
      <div class="preview-render preview-${this.config.template}" 
           style="
             background: ${bgColor};
             color: ${textColor};
             font-family: ${this.config.style.fontFamily}, sans-serif;
             font-size: ${this.getFontSizeValue()}px;
             padding: ${this.getSpacingValue()}px;
             border-radius: ${this.config.style.borderRadius}px;
             position: relative;
             overflow: hidden;
             min-height: 400px;
           ">
    `;

        // Header
        if (this.config.sections.header) {
            html += this.renderHeader(data, textColor);
        }

        // Cultivars details
        if (this.config.sections.cultivars && data.cultivarInfo?.details) {
            html += this.renderCultivars(data, mutedColor);
        }

        // Informations générales
        if (this.config.sections.generalInfo) {
            html += this.renderGeneralInfo(data, mutedColor);
        }

        // Scores globaux
        if (this.config.sections.scores && data.maxGlobalScore > 0) {
            html += this.renderScores(data, textColor, mutedColor);
        }

        // Détails par section
        if (this.config.sections.details) {
            html += this.renderDetails(data, textColor, mutedColor);
        }

        // Notes et commentaires
        if (this.config.sections.notes) {
            html += this.renderNotes(data, mutedColor);
        }

        // Branding
        if (this.config.sections.branding) {
            html += this.renderBranding(mutedColor);
        }

        html += '</div>';
        return html;
    }

    /**
     * Rendu de l'en-tête
     */
    renderHeader(data, textColor) {
        const accentColor = this.config.style.accentColor;

        return `
      <div class="preview-header" style="margin-bottom: 32px;">
        <div class="preview-badge" style="
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          background: linear-gradient(135deg, ${accentColor}22, ${accentColor}11);
          border: 2px solid ${accentColor}44;
          border-radius: ${this.config.style.borderRadius}px;
          margin-bottom: 20px;
        ">
          ${this.config.style.showIcons ? `<span style="font-size: 24px;">${data.productIcon}</span>` : ''}
          <span style="
            font-size: 16px;
            font-weight: 600;
            color: ${accentColor};
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">${data.currentType}</span>
        </div>
        
        <h1 style="
          font-size: ${this.getHeaderFontSize()}px;
          font-weight: 800;
          line-height: 1.2;
          margin: 0;
          color: ${textColor};
          text-shadow: 0 2px 20px ${accentColor}33;
        ">${data.cultivarInfo.title}</h1>
      </div>
    `;
    }

    /**
     * Rendu des cultivars
     */
    renderCultivars(data, mutedColor) {
        if (!data.cultivarInfo?.details?.length) return '';

        let html = '<div style="display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 24px;">';

        data.cultivarInfo.details.forEach(cultivar => {
            if (cultivar.name) {
                html += `
          <div style="
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: ${this.config.style.borderRadius / 2}px;
            font-size: 14px;
            font-weight: 500;
          ">
            ${cultivar.percentage ? `<span style="color: ${this.config.style.accentColor}; font-weight: 700;">${cultivar.percentage}%</span> ` : ''}
            <span>${cultivar.name}</span>
          </div>
        `;
            }
        });

        html += '</div>';
        return html;
    }

    /**
     * Rendu des informations générales
     */
    renderGeneralInfo(data, mutedColor) {
        // TODO: Ajouter les infos générales selon le type de produit
        return '';
    }

    /**
     * Rendu des scores
     */
    renderScores(data, textColor, mutedColor) {
        const accentColor = this.config.style.accentColor;

        return `
      <div class="preview-scores" style="
        display: grid;
        grid-template-columns: ${this.config.template === 'minimal' ? '1fr' : '1fr 1fr'};
        gap: 24px;
        margin: ${this.getSpacingValue()}px 0;
        padding: ${this.getSpacingValue() * 0.8}px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: ${this.config.style.borderRadius}px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      ">
        <div style="text-align: center;">
          <div style="
            width: ${this.config.template === 'minimal' ? '200' : '150'}px;
            height: ${this.config.template === 'minimal' ? '200' : '150'}px;
            margin: 0 auto 16px;
            border-radius: 50%;
            background: linear-gradient(135deg, ${accentColor}33, ${accentColor}11);
            border: 3px solid ${accentColor};
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div>
              <div style="
                font-size: ${this.config.template === 'minimal' ? '72' : '56'}px;
                font-weight: 900;
                color: ${accentColor};
              ">${data.scoreOutOf10.toFixed(1)}</div>
              <div style="
                font-size: 20px;
                font-weight: 600;
                color: ${mutedColor};
              ">/10</div>
            </div>
          </div>
          <div style="font-size: 16px; color: ${mutedColor}; font-weight: 500;">Note Globale</div>
        </div>
        
        ${this.config.template !== 'minimal' ? `
        <div style="display: flex; flex-direction: column; justify-content: center; gap: 16px;">
          <div>
            <div style="font-size: 12px; color: ${mutedColor}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Score Total</div>
            <div style="font-size: 28px; font-weight: 700; color: ${textColor};">${data.globalScore.toFixed(1)} <span style="color: ${mutedColor}; font-size: 20px;">/ ${data.maxGlobalScore}</span></div>
          </div>
          <div>
            <div style="font-size: 12px; color: ${mutedColor}; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em;">Pourcentage</div>
            <div style="font-size: 28px; font-weight: 700; color: ${accentColor};">${data.percentage.toFixed(1)}%</div>
          </div>
        </div>
        ` : ''}
      </div>
    `;
    }

    /**
     * Rendu des détails par section
     */
    renderDetails(data, textColor, mutedColor) {
        if (!data.structure?.sections) return '';

        let html = '<div style="margin: 32px 0;">';

        data.structure.sections.forEach((section, index) => {
            const sectionScore = data.totals[`section-${index}`];
            const hasData = section.fields.some(f => data.formData[f.key]);

            if (!hasData && !sectionScore) return;

            html += `
        <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="
              font-size: ${this.getFontSizeValue() * 1.2}px;
              font-weight: 700;
              margin: 0;
              color: ${textColor};
            ">${section.title}</h3>
            ${sectionScore ? `<span style="
              font-size: 18px;
              font-weight: 700;
              color: ${this.config.style.accentColor};
            ">${sectionScore.sum.toFixed(1)}/${sectionScore.max}</span>` : ''}
          </div>
      `;

            // Afficher les champs avec données
            section.fields.forEach(field => {
                const value = data.formData[field.key];
                if (!value || field.type === 'file') return;

                html += `
          <div style="margin: 8px 0; font-size: 14px;">
            <span style="color: ${mutedColor}; font-weight: 500;">${field.label}:</span>
            <span style="color: ${textColor}; margin-left: 8px;">${this.formatFieldValue(value, field)}</span>
          </div>
        `;
            });

            html += '</div>';
        });

        html += '</div>';
        return html;
    }

    /**
     * Rendu des notes
     */
    renderNotes(data, mutedColor) {
        // TODO: Ajouter les notes si présentes dans formData
        return '';
    }

    /**
     * Rendu du branding
     */
    renderBranding(mutedColor) {
        if (!this.config.style.showWatermark && !this.config.branding.signature) return '';

        return `
      <div style="
        margin-top: 40px;
        padding-top: 24px;
        border-top: 1px solid rgba(255,255,255,0.08);
        text-align: center;
        font-size: 12px;
        color: ${mutedColor};
      ">
        ${this.config.branding.signature ? `<div style="margin-bottom: 8px;">${this.config.branding.signature}</div>` : ''}
        ${this.config.style.showWatermark ? `<div>${this.config.branding.watermarkText}</div>` : ''}
      </div>
    `;
    }

    /**
     * Helpers
     */
    getFontSizeValue() {
        const sizes = { small: 14, medium: 16, large: 18 };
        return sizes[this.config.style.fontSize] || 16;
    }

    getHeaderFontSize() {
        const multipliers = { small: 2.5, medium: 3, large: 3.5 };
        return this.getFontSizeValue() * (multipliers[this.config.style.fontSize] || 3);
    }

    getSpacingValue() {
        const values = { compact: 24, comfortable: 40, spacious: 60 };
        return values[this.config.style.spacing] || 40;
    }

    formatFieldValue(value, field) {
        if (typeof value === 'number') {
            return field.max ? `${value}/${field.max}` : value;
        }
        if (Array.isArray(value)) {
            return value.join(', ');
        }
        if (typeof value === 'object') {
            try {
                return JSON.stringify(value);
            } catch {
                return String(value);
            }
        }
        return String(value);
    }

    /**
     * Rendu de l'état vide (quand pas de données)
     */
    renderEmptyState() {
        const isDark = this.config.style.colorScheme === 'dark';
        const bgColor = isDark ? '#0f1628' : '#f8fafc';
        const textColor = isDark ? '#f8fafc' : '#0a162b';
        const mutedColor = isDark ? '#94a3b8' : '#64748b';

        return `
      <div style="
        background: ${bgColor};
        color: ${textColor};
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        padding: 60px;
        text-align: center;
        border-radius: ${this.config.style.borderRadius}px;
      ">
        <div style="font-size: 64px; margin-bottom: 20px; opacity: 0.5;">👁️</div>
        <h3 style="font-size: 24px; font-weight: 700; margin: 0 0 12px 0; color: ${textColor};">
          Aucune review à prévisualiser
        </h3>
        <p style="font-size: 16px; color: ${mutedColor}; margin: 0; max-width: 400px; line-height: 1.5;">
          Remplissez le formulaire de review et relancez l'aperçu pour voir le rendu personnalisé.
        </p>
      </div>
    `;
    }
}

// Instance globale
const previewStudio = new PreviewStudio();

// Rendre accessible globalement
window.previewStudio = previewStudio;
window.previewTemplates = previewTemplates;
window.colorPresets = colorPresets;
