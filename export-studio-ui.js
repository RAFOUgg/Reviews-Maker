/**
 * EXPORT STUDIO UI - Gestionnaire d'interface
 * Gère l'ouverture, la configuration et l'export depuis l'UI
 */

// Initialisation quand le DOM est prêt
document.addEventListener('DOMContentLoaded', () => {
  initializeExportStudio();
});

function initializeExportStudio() {
  const modal = document.getElementById('exportStudioModal');
  const cancelBtn = document.getElementById('exportCancelBtn');
  const downloadBtn = document.getElementById('exportDownloadBtn');
  const templatesContainer = document.getElementById('exportTemplates');
  const previewCanvas = document.getElementById('exportPreviewCanvas');
  
  // Vérifier que les éléments existent
  if (!modal || !templatesContainer || !previewCanvas) {
    console.warn('Export Studio UI elements not found');
    return;
  }

  // État de configuration actuelle
  let currentConfig = { ...exportConfig };
  let currentRenderer = null;
  let currentZoom = 1;

  // Charger les templates
  renderTemplateOptions();

  // Event: Fermer le modal
  if (cancelBtn) {
    cancelBtn.addEventListener('click', closeExportStudio);
  }

  // Event: Fermer en cliquant à l'extérieur
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeExportStudio();
    }
  });

  // Event: ESC pour fermer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeExportStudio();
    }
  });

  // Event: Sélection de template
  templatesContainer.addEventListener('click', (e) => {
    const templateOption = e.target.closest('.export-template-option');
    if (!templateOption) return;

    const templateId = templateOption.dataset.template;
    selectTemplate(templateId);
  });

  // Event: Sections à inclure
  const sectionToggles = modal.querySelectorAll('.export-section-toggle input[type="checkbox"]');
  sectionToggles.forEach(toggle => {
    toggle.addEventListener('change', () => {
      const sectionKey = toggle.id.replace('section-', '');
      currentConfig.sections[sectionKey] = toggle.checked;
      updatePreview();
    });
  });

  // Event: Couleur principale
  const accentColorInput = document.getElementById('export-accent-color');
  if (accentColorInput) {
    accentColorInput.addEventListener('input', (e) => {
      currentConfig.style.accentColor = e.target.value;
      updatePreview();
    });
  }

  // Event: Presets de couleur
  const colorPresets = modal.querySelectorAll('.export-color-preset');
  colorPresets.forEach(preset => {
    preset.addEventListener('click', () => {
      const color = preset.dataset.color;
      if (accentColorInput) {
        accentColorInput.value = color;
        currentConfig.style.accentColor = color;
      }
      colorPresets.forEach(p => p.classList.remove('active'));
      preset.classList.add('active');
      updatePreview();
    });
  });

  // Event: Thème
  const colorSchemeSelect = document.getElementById('export-color-scheme');
  if (colorSchemeSelect) {
    colorSchemeSelect.addEventListener('change', (e) => {
      currentConfig.style.colorScheme = e.target.value;
      if (e.target.value === 'light') {
        currentConfig.style.backgroundColor = '#f8fafc';
      } else {
        currentConfig.style.backgroundColor = '#0f1628';
      }
      updatePreview();
    });
  }

  // Event: Échelle de qualité
  const scaleInput = document.getElementById('export-scale');
  const scaleValue = document.getElementById('export-scale-value');
  if (scaleInput && scaleValue) {
    scaleInput.addEventListener('input', (e) => {
      const value = parseFloat(e.target.value);
      currentConfig.dimensions.scale = value;
      scaleValue.textContent = `${value}x`;
    });
  }

  // Event: Signature personnalisée
  const signatureInput = document.getElementById('export-signature');
  if (signatureInput) {
    signatureInput.addEventListener('input', (e) => {
      currentConfig.branding.signature = e.target.value || null;
      updatePreview();
    });
  }

  // Event: Zoom controls
  const zoomButtons = modal.querySelectorAll('.export-zoom-btn');
  zoomButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const zoom = parseFloat(btn.dataset.zoom);
      currentZoom = zoom;
      zoomButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyZoom(zoom);
    });
  });

  // Event: Format d'export
  const formatButtons = modal.querySelectorAll('.export-format-btn');
  formatButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const format = btn.dataset.format;
      currentConfig.dimensions.format = format;
      formatButtons.forEach(b => b.style.borderColor = 'transparent');
      btn.style.borderColor = 'var(--primary)';
    });
  });

  // Event: Télécharger
  if (downloadBtn) {
    downloadBtn.addEventListener('click', async () => {
      await downloadExportImage();
    });
  }

  /**
   * Afficher les templates disponibles
   */
  function renderTemplateOptions() {
    templatesContainer.innerHTML = '';
    
    Object.keys(exportTemplates).forEach((templateId, index) => {
      const template = exportTemplates[templateId];
      const isActive = index === 0; // Premier template par défaut
      
      const option = document.createElement('div');
      option.className = `export-template-option${isActive ? ' active' : ''}`;
      option.dataset.template = templateId;
      
      option.innerHTML = `
        <div class="export-template-icon">${template.name.split(' ')[0]}</div>
        <div class="export-template-info">
          <div class="export-template-name">${template.name}</div>
          <div class="export-template-desc">${template.description}</div>
          <div class="export-template-meta">
            <span>${template.dimensions.width}×${template.dimensions.height}</span>
          </div>
        </div>
      `;
      
      templatesContainer.appendChild(option);
    });
  }

  /**
   * Sélectionner un template
   */
  function selectTemplate(templateId) {
    const template = exportTemplates[templateId];
    if (!template) return;

    // Mettre à jour la config
    currentConfig.template = templateId;
    currentConfig.dimensions.width = template.dimensions.width;
    currentConfig.dimensions.height = template.dimensions.height;

    // Mettre à jour l'UI
    const options = templatesContainer.querySelectorAll('.export-template-option');
    options.forEach(opt => {
      opt.classList.toggle('active', opt.dataset.template === templateId);
    });

    // Mettre à jour les stats
    const widthStat = document.getElementById('export-width');
    const heightStat = document.getElementById('export-height');
    if (widthStat) widthStat.textContent = template.dimensions.width;
    if (heightStat) heightStat.textContent = template.dimensions.height;

    updatePreview();
  }

  /**
   * Mettre à jour l'aperçu
   */
  function updatePreview() {
    if (!window.formData || !window.currentType) {
      previewCanvas.innerHTML = '<div class="export-generating"><div class="spinner"></div><div class="export-generating-text">Aucune review à prévisualiser</div></div>';
      return;
    }

    // Préparer les données pour le renderer
    const data = {
      formData: window.formData,
      currentType: window.currentType,
      totals: window.totals || {},
      cultivarInfo: getCultivarInfo(),
      productIcon: getProductIcon(window.currentType),
      structure: window.productStructures[window.currentType],
      ...calculateScores()
    };

    // Créer le renderer
    currentRenderer = new ExportRenderer(currentConfig, data);
    
    // Générer et afficher le HTML
    const html = currentRenderer.generateHTML();
    previewCanvas.innerHTML = html;
    
    // Appliquer le zoom actuel
    applyZoom(currentZoom);
  }

  /**
   * Appliquer le zoom à l'aperçu
   */
  function applyZoom(zoom) {
    const canvas = previewCanvas.firstElementChild;
    if (canvas) {
      canvas.style.transform = `scale(${zoom})`;
      canvas.style.transformOrigin = 'top center';
    }
  }

  /**
   * Télécharger l'image
   */
  async function downloadExportImage() {
    if (!currentRenderer) {
      showToast('Aucun aperçu à exporter', 'error');
      return;
    }

    const btn = downloadBtn;
    const originalHTML = btn.innerHTML;
    
    try {
      // Afficher le loader
      btn.disabled = true;
      btn.innerHTML = '<span class="loading"></span> Génération...';

      // Générer le nom de fichier
      const safeName = (window.formData.cultivars || window.formData.productType || 'review')
        .replace(/\s+/g, '-')
        .toLowerCase();
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `review_${safeName}_${timestamp}.${currentConfig.dimensions.format}`;

      // Télécharger via le renderer
      await currentRenderer.downloadImage(filename);

      showToast('✅ Image exportée avec succès!', 'success');
      
      // Fermer le modal après un court délai
      setTimeout(() => {
        closeExportStudio();
      }, 1000);

    } catch (error) {
      console.error('Erreur export:', error);
      showToast(`Erreur lors de l'export: ${error.message}`, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = originalHTML;
    }
  }

  /**
   * Ouvrir le modal
   */
  window.openExportStudio = function() {
    if (!window.formData || !window.currentType) {
      showToast('Veuillez d\'abord compléter une review', 'warning');
      return;
    }

    // Prefer centralized modal helper if available
    if (typeof window !== 'undefined' && typeof window.showModalById === 'function' && modal && modal.id) {
      try { showModalById(modal.id); } catch(e) { /* fallthrough */ }
    } else {
      // Fallback: ensure the panel is fixed to viewport to avoid transform stacking issues
      try { if (modal.parentElement !== document.body) document.body.appendChild(modal); } catch(e){}
      try { modal.style.setProperty('position','fixed','important'); } catch(e){}
      try { modal.style.setProperty('inset','0','important'); } catch(e){}
      try { modal.style.setProperty('display','flex','important'); } catch(e){}
      try { modal.style.setProperty('z-index','100700','important'); } catch(e){}
      try { modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true'); modal.setAttribute('aria-hidden','false'); } catch(e){}
      try { document.body.classList.add('modal-open'); } catch(e){}
      try { document.body.style.overflow = 'hidden'; } catch(e){}
    }
    
    // Sélectionner le template par défaut et générer l'aperçu
    selectTemplate(currentConfig.template);
  };

  /**
   * Fermer le modal
   */
  function closeExportStudio() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Fonctions utilitaires
  function getCultivarInfo() {
    try {
      const list = JSON.parse(window.formData['cultivarsList'] || '[]');
      if (Array.isArray(list) && list.length > 0) {
        return {
          title: list.map(c => c.name).filter(Boolean).join(' + ') || 
                 window.formData.cultivars || 
                 window.formData.productType || 
                 "Review en cours",
          details: list
        };
      }
    } catch {}
    
    return {
      title: window.formData.cultivars || window.formData.productType || "Review en cours",
      details: null
    };
  }

  function getProductIcon(type) {
    const icons = {
      'Hash': '🧊',
      'Fleur': '🌸',
      'Concentré': '💎',
      'Comestible': '🍬'
    };
    return icons[type] || '🌿';
  }

  function calculateScores() {
    let globalScore = 0;
    let maxGlobalScore = 0;
    let sectionsWithData = 0;

    Object.values(window.totals || {}).forEach(section => {
      if (section.sum && section.max) {
        globalScore += section.sum;
        maxGlobalScore += section.max;
        sectionsWithData++;
      }
    });

    const scoreOutOf10 = maxGlobalScore > 0 ? (globalScore / maxGlobalScore * 10) : 0;
    const percentage = maxGlobalScore > 0 ? (globalScore / maxGlobalScore * 100) : 0;

    return {
      globalScore,
      maxGlobalScore,
      sectionsWithData,
      scoreOutOf10,
      percentage
    };
  }
}

// Fonction globale pour montrer les toasts (si elle n'existe pas déjà)
if (typeof showToast === 'undefined') {
  window.showToast = function(message, type = 'info') {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Fallback simple - l'app.js devrait avoir une vraie fonction
    alert(message);
  };
}
