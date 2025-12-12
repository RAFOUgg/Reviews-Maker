/**
 * Export Maker - Gestionnaire d'exports de reviews
 * Phase 3 - MVP avec templates prédéfinis, formats et personnalisation
 */

import React, { useState, useRef } from 'react';
import html2canvas from 'html2canvas';
import {
  Download, Eye, Settings, Image as ImageIcon, Type, Palette,
  Grid, Layout, Maximize2, FileImage, File, Save, X, Check,
  ChevronLeft, ChevronRight, Plus, Trash2, Copy
} from 'lucide-react';
import {
  EXPORT_FORMATS,
  TEMPLATE_TYPES,
  EXPORT_OPTIONS,
  getPredefinedTemplate,
  isTemplateAvailable,
  getMaxElements
} from '../../data/exportTemplates';

const ExportMaker = ({ reviewData, productType = 'Fleurs', accountType = 'Amateur', onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState('square');
  const [selectedTemplate, setSelectedTemplate] = useState('standard');
  const [currentPage, setCurrentPage] = useState(1);
  const [exportQuality, setExportQuality] = useState('web');
  const [exportFileFormat, setExportFileFormat] = useState('png');
  const [customElements, setCustomElements] = useState([]);
  const [isExporting, setIsExporting] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  
  const canvasRef = useRef(null);
  
  const currentFormat = EXPORT_FORMATS[selectedFormat];
  const currentTemplateType = TEMPLATE_TYPES[selectedTemplate];
  const maxPages = currentFormat?.maxPages || 1;
  const maxElements = getMaxElements(selectedFormat, selectedTemplate);
  
  // Charger template prédéfini
  const predefinedTemplate = getPredefinedTemplate(productType, selectedTemplate);
  
  /**
   * Export réel avec html2canvas
   */
  const handleExport = async () => {
    if (!canvasRef.current) {
      alert('Canvas non disponible');
      return;
    }
    
    setIsExporting(true);
    
    try {
      const format = EXPORT_FORMATS[selectedFormat];
      const quality = EXPORT_OPTIONS.quality[exportQuality];
      const scale = quality?.dpi ? quality.dpi / 72 : 1;
      
      // Capturer le canvas avec html2canvas
      const canvas = await html2canvas(canvasRef.current, {
        scale: scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: format.width,
        height: format.height,
        logging: false
      });
      
      // Générer le nom du fichier
      const timestamp = new Date().toISOString().slice(0, 10);
      const filename = `review-${productType}-${selectedTemplate}-${timestamp}`;
      
      if (exportFileFormat === 'png' || exportFileFormat === 'jpeg') {
        // Export image
        const mimeType = exportFileFormat === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = canvas.toDataURL(mimeType, exportFileFormat === 'jpeg' ? 0.9 : 1);
        
        // Télécharger
        const link = document.createElement('a');
        link.download = `${filename}.${exportFileFormat}`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } else if (exportFileFormat === 'svg') {
        // Export SVG (via canvas2svg si besoin, sinon fallback PNG)
        const dataUrl = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `${filename}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } else if (exportFileFormat === 'pdf') {
        // Export PDF via jsPDF (si disponible) sinon PNG
        try {
          const { jsPDF } = await import('jspdf');
          const pdf = new jsPDF({
            orientation: format.width > format.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [format.width, format.height]
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.9);
          pdf.addImage(imgData, 'JPEG', 0, 0, format.width, format.height);
          pdf.save(`${filename}.pdf`);
        } catch (e) {
          // Fallback PNG si jsPDF non disponible
          console.warn('jsPDF non disponible, export PNG fallback');
          const dataUrl = canvas.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `${filename}.png`;
          link.href = dataUrl;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
      
      alert('Export réussi!');
    } catch (error) {
      console.error('Erreur export:', error);
      alert('Erreur lors de l\'export: ' + error.message);
    } finally {
      setIsExporting(false);
    }
  };

  const handleAddElement = () => {
    if (customElements.length < maxElements) {
      setCustomElements([...customElements, {
        id: Date.now(),
        type: 'text',
        content: 'Nouvel élément',
        position: { x: 50, y: 50 },
        style: {}
      }]);
    }
  };

  const handleRemoveElement = (elementId) => {
    setCustomElements(customElements.filter(el => el.id !== elementId));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-7xl w-full h-[90vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-500 to-indigo-500">
          <div className="flex items-center gap-3 text-white">
            <FileImage className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Export Maker</h2>
              <p className="text-sm opacity-90">Créez votre aperçu personnalisé</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              {previewMode ? <Settings className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{previewMode ? 'Configurer' : 'Aperçu'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-xl transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex flex-1 overflow-hidden">
          
          {/* Sidebar gauche - Configuration */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-6">
              
              {/* Format */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Layout className="w-5 h-5 text-purple-500" />
                  <h3 className="font-semibold text-gray-900">Format</h3>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {Object.values(EXPORT_FORMATS).map(format => (
                    <button
                      key={format.id}
                      onClick={() => setSelectedFormat(format.id)}
                      className={`p-3 rounded-xl text-center transition-all ${
                        selectedFormat === format.id
                          ? 'bg-purple-500 text-white shadow-lg'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="text-2xl mb-1">{format.icon}</div>
                      <div className="text-xs font-medium">{format.label}</div>
                      <div className="text-xs opacity-75 mt-1">{format.ratio}</div>
                    </button>
                  ))}
                </div>
                {currentFormat && (
                  <p className="text-xs text-gray-600 mt-2 text-center">
                    {currentFormat.description} • {currentFormat.width}×{currentFormat.height}px
                  </p>
                )}
              </div>

              {/* Template */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Grid className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-semibold text-gray-900">Template</h3>
                </div>
                <div className="space-y-2">
                  {Object.values(TEMPLATE_TYPES).map(template => {
                    const available = isTemplateAvailable(template.id, accountType);
                    return (
                      <button
                        key={template.id}
                        onClick={() => available && setSelectedTemplate(template.id)}
                        disabled={!available}
                        className={`w-full p-3 rounded-xl text-left transition-all ${
                          selectedTemplate === template.id
                            ? 'bg-indigo-500 text-white shadow-lg'
                            : available
                            ? 'bg-white text-gray-700 hover:bg-gray-100'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{template.icon}</span>
                            <span className="font-medium">{template.label}</span>
                          </div>
                          {!available && (
                            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
                              Payant
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-75">{template.description}</p>
                        <div className="text-xs mt-2 opacity-75">
                          Max {getMaxElements(selectedFormat, template.id)} éléments
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Options export */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Settings className="w-5 h-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900">Export</h3>
                </div>
                
                {/* Format fichier */}
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Format fichier
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.values(EXPORT_OPTIONS.fileFormat).map(format => (
                      <button
                        key={format.id}
                        onClick={() => setExportFileFormat(format.id)}
                        className={`p-2 rounded-lg text-center transition-all ${
                          exportFileFormat === format.id
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="text-xl mb-1">{format.icon}</div>
                        <div className="text-xs font-medium">{format.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Qualité */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Qualité
                  </label>
                  <div className="space-y-2">
                    {Object.values(EXPORT_OPTIONS.quality).map(quality => (
                      <button
                        key={quality.id}
                        onClick={() => setExportQuality(quality.id)}
                        className={`w-full p-2 rounded-lg text-left transition-all ${
                          exportQuality === quality.id
                            ? 'bg-green-500 text-white'
                            : 'bg-white text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-sm">{quality.label}</div>
                        <div className="text-xs opacity-75">{quality.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pagination */}
              {maxPages > 1 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <File className="w-5 h-5 text-amber-500" />
                    <h3 className="font-semibold text-gray-900">Pages</h3>
                  </div>
                  <div className="flex items-center justify-between bg-white rounded-xl p-3">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="font-medium">
                      Page {currentPage} / {maxPages}
                    </span>
                    <button
                      onClick={() => setCurrentPage(Math.min(maxPages, currentPage + 1))}
                      disabled={currentPage === maxPages}
                      className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Éléments custom (mode Personnalisé) */}
              {selectedTemplate === 'custom' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Palette className="w-5 h-5 text-pink-500" />
                      <h3 className="font-semibold text-gray-900">Éléments</h3>
                    </div>
                    <button
                      onClick={handleAddElement}
                      disabled={customElements.length >= maxElements}
                      className="p-1 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2">
                    {customElements.map(element => (
                      <div key={element.id} className="flex items-center gap-2 bg-white p-2 rounded-lg">
                        <span className="flex-1 text-sm">{element.type}</span>
                        <button
                          onClick={() => handleRemoveElement(element.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {customElements.length === 0 && (
                      <p className="text-xs text-gray-500 text-center py-4">
                        Aucun élément. Cliquez + pour ajouter.
                      </p>
                    )}
                    <p className="text-xs text-gray-500 text-center mt-2">
                      {customElements.length} / {maxElements} éléments
                    </p>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Zone centrale - Aperçu */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center p-8 overflow-auto">
            <div
              ref={canvasRef}
              className="bg-white shadow-2xl rounded-lg overflow-hidden"
              style={{
                width: `${Math.min(800, currentFormat?.width / 2)}px`,
                aspectRatio: `${currentFormat?.width} / ${currentFormat?.height}`
              }}
            >
              {/* Aperçu du template */}
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-50 to-indigo-50">
                <div className="text-center p-8">
                  <FileImage className="w-24 h-24 text-purple-300 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">
                    {currentTemplateType?.label || 'Template'}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Format: {currentFormat?.label}
                  </p>
                  <p className="text-sm text-gray-500">
                    {predefinedTemplate?.elements.length || 0} éléments prédéfinis
                  </p>
                  <div className="mt-6 text-xs text-gray-400">
                    Aperçu en construction - Phase 3 MVP
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar droite - Actions */}
          <div className="w-64 bg-gray-50 border-l border-gray-200 p-6 space-y-4">
            <button
              onClick={() => alert('Sauvegarde aperçu (simulation)')}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium shadow-lg"
            >
              <Save className="w-5 h-5" />
              Sauvegarder aperçu
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl hover:from-purple-600 hover:to-indigo-600 transition-all font-medium shadow-lg disabled:opacity-50"
            >
              {isExporting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Export...
                </>
              ) : (
                <>
                  <Download className="w-5 h-5" />
                  Exporter
                </>
              )}
            </button>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-3 text-sm">Raccourcis</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Dupliquer</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+D</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Exporter</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+E</kbd>
                </div>
                <div className="flex justify-between">
                  <span>Sauvegarder</span>
                  <kbd className="px-2 py-1 bg-gray-200 rounded">Ctrl+S</kbd>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Informations</h4>
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Compte:</span>
                  <span className="font-medium">{accountType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Produit:</span>
                  <span className="font-medium">{productType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Format:</span>
                  <span className="font-medium">{currentFormat?.width}×{currentFormat?.height}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fichier:</span>
                  <span className="font-medium uppercase">{exportFileFormat}</span>
                </div>
                <div className="flex justify-between">
                  <span>Qualité:</span>
                  <span className="font-medium">{EXPORT_OPTIONS.quality[exportQuality]?.dpi} DPI</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default ExportMaker;
