/**
 * EXPORT STUDIO - Module de génération d'images stylisées
 * Système avancé de prévisualisation et d'export personnalisable
 */

// Configuration d'export par défaut
const exportConfig = {
  // Template sélectionné
  template: 'studio', // 'minimal', 'card', 'studio', 'social', 'magazine'
  
  // Dimensions et qualité
  dimensions: {
    width: 1200,
    height: 1600,
    scale: 2, // Multiplicateur de qualité
    format: 'png' // 'png', 'jpg', 'webp'
  },
  
  // Sections à inclure
  sections: {
    header: true,
    scores: true,
    details: true,
    notes: true,
    branding: true
  },
  
  // Personnalisation visuelle
  style: {
    colorScheme: 'dark', // 'dark', 'light', 'auto', 'custom'
    accentColor: '#34d399',
    backgroundColor: '#0f1628',
    fontFamily: 'Inter',
    borderRadius: 18,
    showWatermark: true,
    showLogo: true
  },
  
  // Contenu personnalisé
  branding: {
    logo: null,
    watermark: 'Reviews Maker',
    signature: null,
    customText: null
  }
};

// Templates d'export disponibles
const exportTemplates = {
  minimal: {
    name: '⚡ Minimal',
    description: 'Design épuré avec scores essentiels',
    dimensions: { width: 800, height: 1000 },
    layout: 'single-column',
    showSections: ['header', 'scores'],
    style: {
      fontSize: 'large',
      padding: 60,
      spacing: 'compact'
    }
  },
  
  card: {
    name: '🎴 Carte',
    description: 'Format carte compacte style Instagram',
    dimensions: { width: 1080, height: 1350 },
    layout: 'card',
    showSections: ['header', 'scores', 'details'],
    style: {
      fontSize: 'medium',
      padding: 80,
      spacing: 'comfortable',
      rounded: true
    }
  },
  
  studio: {
    name: '✨ Studio',
    description: 'Qualité professionnelle avec tous les détails',
    dimensions: { width: 1200, height: 1800 },
    layout: 'two-column',
    showSections: ['header', 'scores', 'details', 'notes', 'branding'],
    style: {
      fontSize: 'medium',
      padding: 100,
      spacing: 'spacious',
      premium: true
    }
  },
  
  social: {
    name: '📱 Réseaux sociaux',
    description: 'Optimisé pour partage social (9:16)',
    dimensions: { width: 1080, height: 1920 },
    layout: 'story',
    showSections: ['header', 'scores', 'details'],
    style: {
      fontSize: 'large',
      padding: 80,
      spacing: 'comfortable',
      bold: true
    }
  },
  
  magazine: {
    name: '📰 Magazine',
    description: 'Mise en page éditoriale premium',
    dimensions: { width: 1400, height: 2000 },
    layout: 'editorial',
    showSections: ['header', 'scores', 'details', 'notes', 'branding'],
    style: {
      fontSize: 'medium',
      padding: 120,
      spacing: 'spacious',
      editorial: true
    }
  }
};

// Générateur de rendu selon le template
class ExportRenderer {
  constructor(config, data) {
    this.config = { ...exportConfig, ...config };
    this.data = data;
    this.canvas = null;
    this.ctx = null;
  }

  /**
   * Génère le HTML stylisé selon le template
   */
  generateHTML() {
    const template = exportTemplates[this.config.template] || exportTemplates.studio;
    const data = this.data;
    
    let html = `
      <div class="export-render export-${this.config.template}" 
           style="width: ${this.config.dimensions.width}px; 
                  height: ${this.config.dimensions.height}px;
                  background: ${this.config.style.backgroundColor};
                  color: ${this.config.style.colorScheme === 'dark' ? '#f8fafc' : '#0a162b'};
                  font-family: ${this.config.style.fontFamily}, sans-serif;
                  padding: ${template.style.padding}px;
                  box-sizing: border-box;
                  position: relative;
                  overflow: hidden;">
    `;

    // Header avec titre et type de produit
    if (this.config.sections.header) {
      html += this.renderHeader(template);
    }

    // Scores principaux
    if (this.config.sections.scores) {
      html += this.renderScores(template);
    }

    // Détails par section
    if (this.config.sections.details) {
      html += this.renderDetails(template);
    }

    // Notes et commentaires
    if (this.config.sections.notes) {
      html += this.renderNotes(template);
    }

    // Branding et signature
    if (this.config.sections.branding) {
      html += this.renderBranding(template);
    }

    html += '</div>';
    return html;
  }

  renderHeader(template) {
    const { cultivarInfo, productIcon, currentType } = this.data;
    const accentColor = this.config.style.accentColor;
    
    return `
      <div class="export-header" style="margin-bottom: ${template.style.padding * 0.4}px;">
        <div class="export-badge" style="
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 14px 24px;
          background: linear-gradient(135deg, ${accentColor}22, ${accentColor}11);
          border: 2px solid ${accentColor}44;
          border-radius: ${this.config.style.borderRadius}px;
          margin-bottom: 24px;
        ">
          <span style="font-size: 32px;">${productIcon}</span>
          <span style="
            font-size: 18px;
            font-weight: 600;
            color: ${accentColor};
            text-transform: uppercase;
            letter-spacing: 0.05em;
          ">${currentType}</span>
        </div>
        
        <h1 style="
          font-size: ${template.style.fontSize === 'large' ? '56px' : '48px'};
          font-weight: 800;
          line-height: 1.1;
          margin: 0 0 16px 0;
          color: #f8fafc;
          text-shadow: 0 2px 20px rgba(52, 211, 153, 0.3);
        ">${cultivarInfo.title}</h1>
        
        ${cultivarInfo.details ? this.renderCultivarDetails(cultivarInfo.details) : ''}
      </div>
    `;
  }

  renderCultivarDetails(details) {
    if (!Array.isArray(details) || details.length === 0) return '';
    
    let html = '<div class="cultivar-details" style="display: flex; gap: 16px; flex-wrap: wrap; margin-top: 20px;">';
    
    details.forEach(cultivar => {
      if (cultivar.name) {
        html += `
          <div style="
            padding: 10px 18px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 12px;
            font-size: 16px;
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

  renderScores(template) {
    const { globalScore, maxGlobalScore, scoreOutOf10, percentage } = this.data;
    const accentColor = this.config.style.accentColor;
    
    if (!maxGlobalScore || maxGlobalScore === 0) {
      return '';
    }
    
    return `
      <div class="export-scores" style="
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 24px;
        margin: ${template.style.padding * 0.6}px 0;
        padding: ${template.style.padding * 0.4}px;
        background: rgba(255, 255, 255, 0.03);
        border-radius: ${this.config.style.borderRadius}px;
        border: 1px solid rgba(255, 255, 255, 0.08);
      ">
        <!-- Score principal -->
        <div style="text-align: center; padding: 20px;">
          <div style="
            width: 180px;
            height: 180px;
            margin: 0 auto 20px;
            position: relative;
            border-radius: 50%;
            background: linear-gradient(135deg, ${accentColor}33, ${accentColor}11);
            border: 3px solid ${accentColor};
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <div>
              <div style="
                font-size: 64px;
                font-weight: 900;
                line-height: 1;
                color: ${accentColor};
              ">${scoreOutOf10.toFixed(1)}</div>
              <div style="
                font-size: 24px;
                font-weight: 600;
                color: #94a3b8;
                margin-top: 4px;
              ">/10</div>
            </div>
          </div>
          <div style="font-size: 18px; color: #94a3b8; font-weight: 500;">Note Globale</div>
        </div>
        
        <!-- Détails des scores -->
        <div style="display: flex; flex-direction: column; justify-content: center; gap: 20px;">
          <div>
            <div style="font-size: 14px; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Score Total</div>
            <div style="font-size: 32px; font-weight: 700; color: #f8fafc;">${globalScore.toFixed(1)} <span style="color: #64748b; font-size: 24px;">/ ${maxGlobalScore}</span></div>
          </div>
          
          <div>
            <div style="font-size: 14px; color: #94a3b8; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Complétude</div>
            <div style="
              height: 12px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 6px;
              overflow: hidden;
            ">
              <div style="
                height: 100%;
                width: ${percentage}%;
                background: linear-gradient(90deg, ${accentColor}, #38bdf8);
                transition: width 0.3s ease;
              "></div>
            </div>
            <div style="font-size: 18px; font-weight: 600; color: #f8fafc; margin-top: 8px;">${percentage.toFixed(0)}%</div>
          </div>
        </div>
      </div>
    `;
  }

  renderDetails(template) {
    const { structure } = this.data;
    const accentColor = this.config.style.accentColor;
    
    let html = `
      <div class="export-details" style="
        margin: ${template.style.padding * 0.6}px 0;
      ">
        <h2 style="
          font-size: 28px;
          font-weight: 700;
          margin: 0 0 24px 0;
          color: #f8fafc;
          border-bottom: 2px solid ${accentColor}44;
          padding-bottom: 12px;
        ">Détails de l'évaluation</h2>
        <div class="sections-grid" style="display: grid; gap: 20px;">
    `;
    
    structure.sections.forEach((section, index) => {
      const sectionTotal = this.data.totals[`section-${index}`];
      const hasData = section.fields.some(f => 
        f.type !== "file" && this.data.formData[f.key]
      );
      
      if (!hasData) return;
      
      const scorePercent = sectionTotal ? (sectionTotal.sum / sectionTotal.max * 100) : 0;
      const scoreText = sectionTotal ? `${sectionTotal.sum.toFixed(1)}/${sectionTotal.max}` : '';
      
      html += `
        <div class="detail-section" style="
          padding: 24px;
          background: rgba(255, 255, 255, 0.04);
          border-radius: ${this.config.style.borderRadius}px;
          border-left: 4px solid ${accentColor};
        ">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <h3 style="
              font-size: 20px;
              font-weight: 600;
              margin: 0;
              color: #f8fafc;
            ">${section.title}</h3>
            ${scoreText ? `<span style="
              font-size: 18px;
              font-weight: 700;
              color: ${accentColor};
            ">${scoreText}</span>` : ''}
          </div>
          
          ${sectionTotal ? `
          <div style="
            height: 6px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 3px;
            overflow: hidden;
            margin-bottom: 16px;
          ">
            <div style="
              height: 100%;
              width: ${scorePercent}%;
              background: ${accentColor};
            "></div>
          </div>
          ` : ''}
          
          ${this.renderSectionFields(section, template)}
        </div>
      `;
    });
    
    html += '</div></div>';
    return html;
  }

  renderSectionFields(section, template) {
    let html = '<div style="display: grid; gap: 12px;">';
    
    section.fields.forEach(field => {
      const value = this.data.formData[field.key];
      if (!value || field.type === 'file') return;
      
      let displayValue = value;
      
      // Formatting selon le type
      if (field.type === 'number' && field.unit) {
        displayValue = `${value} ${field.unit}`;
      } else if (field.type === 'select' || field.type === 'textarea') {
        displayValue = value;
      } else if (Array.isArray(value)) {
        displayValue = value.join(', ');
      }
      
      html += `
        <div style="display: flex; justify-content: space-between; align-items: baseline; padding: 8px 0; border-bottom: 1px solid rgba(255, 255, 255, 0.05);">
          <span style="font-size: 15px; color: #94a3b8; font-weight: 500;">${field.label}</span>
          <span style="font-size: 16px; color: #f8fafc; font-weight: 600; text-align: right; max-width: 60%;">${displayValue}</span>
        </div>
      `;
    });
    
    html += '</div>';
    return html;
  }

  renderNotes(template) {
    const notes = this.data.formData.notes || this.data.formData.commentaires || '';
    if (!notes) return '';
    
    return `
      <div class="export-notes" style="
        margin: ${template.style.padding * 0.6}px 0;
        padding: ${template.style.padding * 0.4}px;
        background: rgba(56, 189, 248, 0.08);
        border-left: 4px solid #38bdf8;
        border-radius: ${this.config.style.borderRadius}px;
      ">
        <h3 style="
          font-size: 18px;
          font-weight: 600;
          margin: 0 0 12px 0;
          color: #38bdf8;
        ">💭 Notes</h3>
        <p style="
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
          color: #e2e8f0;
          white-space: pre-wrap;
        ">${notes}</p>
      </div>
    `;
  }

  renderBranding(template) {
    const watermark = this.config.branding.watermark;
    const showLogo = this.config.style.showLogo;
    const date = new Date().toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    
    return `
      <div class="export-branding" style="
        margin-top: ${template.style.padding * 0.8}px;
        padding-top: ${template.style.padding * 0.4}px;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          ${showLogo ? `<span style="font-size: 24px;">🌿</span>` : ''}
          <div>
            <div style="font-size: 16px; font-weight: 600; color: ${this.config.style.accentColor};">${watermark}</div>
            <div style="font-size: 13px; color: #64748b;">${date}</div>
          </div>
        </div>
        
        ${this.config.branding.signature ? `
        <div style="
          font-size: 14px;
          color: #94a3b8;
          font-style: italic;
        ">${this.config.branding.signature}</div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Génère l'image finale
   */
  async generateImage() {
    const html = this.generateHTML();
    
    // Créer un conteneur temporaire
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.innerHTML = html;
    document.body.appendChild(container);
    
    try {
      // Attendre le chargement des polices
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }
      
      // Utiliser html2canvas pour capturer
      if (typeof html2canvas === 'undefined') {
        throw new Error('html2canvas n\'est pas chargé');
      }
      
      const canvas = await html2canvas(container.firstElementChild, {
        backgroundColor: this.config.style.backgroundColor,
        scale: this.config.dimensions.scale,
        width: this.config.dimensions.width,
        height: this.config.dimensions.height,
        useCORS: true,
        allowTaint: true,
        logging: false
      });
      
      return canvas;
    } finally {
      // Nettoyer
      document.body.removeChild(container);
    }
  }

  /**
   * Télécharge l'image
   */
  async downloadImage(filename) {
    const canvas = await this.generateImage();
    const link = document.createElement('a');
    
    // Format selon config
    let mimeType = 'image/png';
    if (this.config.dimensions.format === 'jpg') mimeType = 'image/jpeg';
    else if (this.config.dimensions.format === 'webp') mimeType = 'image/webp';
    
    link.download = filename || `review_${Date.now()}.${this.config.dimensions.format}`;
    link.href = canvas.toDataURL(mimeType, 0.95);
    link.click();
    
    return true;
  }
}

// Export des fonctions principales
window.ExportRenderer = ExportRenderer;
window.exportTemplates = exportTemplates;
window.exportConfig = exportConfig;
