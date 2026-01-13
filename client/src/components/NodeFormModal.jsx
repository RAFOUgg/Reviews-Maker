/**
 * NodeFormModal Component
 * 
 * Modale pour créer/éditer un nœud (cultivar)
 */

import React, { useState } from 'react';
import useGeneticsStore from '../store/useGeneticsStore';
import './FormModal.css';

const NodeFormModal = ({ isEdit, onClose }) => {
    const store = useGeneticsStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formData = store.nodeFormData || {};

    const handleChange = (field, value) => {
        store.updateNodeFormData({ [field]: value });
    };

    const handleGeneticsChange = (field, value) => {
        const genetics = formData.genetics || {};
        store.updateNodeFormData({
            genetics: { ...genetics, [field]: value }
        });
    };

    const handleColorChange = (color) => {
        store.updateNodeFormData({ color });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isEdit) {
                await store.updateNode(formData.id, formData);
            } else {
                await store.addNode(formData);
            }
            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEdit ? '✏️ Éditer cultivar' : '➕ Ajouter cultivar'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="node-form">
                    {error && <div className="form-error">{error}</div>}

                    {/* Cultivar Name */}
                    <div className="form-group">
                        <label>Nom du cultivar *</label>
                        <input
                            type="text"
                            value={formData.cultivarName || ''}
                            onChange={(e) => handleChange('cultivarName', e.target.value)}
                            placeholder="ex: Gorilla Glue #4"
                            required
                            maxLength={200}
                        />
                        <small>{(formData.cultivarName || '').length}/200</small>
                    </div>

                    {/* Color Picker */}
                    <div className="form-group">
                        <label>Couleur du nœud</label>
                        <div className="color-picker">
                            <input
                                type="color"
                                value={formData.color || '#FF6B9D'}
                                onChange={(e) => handleColorChange(e.target.value)}
                            />
                            <span className="color-preview" style={{
                                backgroundColor: formData.color || '#FF6B9D'
                            }}></span>
                        </div>
                    </div>

                    {/* Genetics Section */}
                    <fieldset className="genetics-section">
                        <legend>Informations génétiques (optionnel)</legend>

                        <div className="form-group">
                            <label>Type</label>
                            <select
                                value={formData.genetics?.type || ''}
                                onChange={(e) => handleGeneticsChange('type', e.target.value)}
                            >
                                <option value="">Sélectionner...</option>
                                <option value="Indica">Indica</option>
                                <option value="Sativa">Sativa</option>
                                <option value="Hybride">Hybride</option>
                                <option value="CBD">CBD</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Breeder</label>
                            <input
                                type="text"
                                value={formData.genetics?.breeder || ''}
                                onChange={(e) => handleGeneticsChange('breeder', e.target.value)}
                                placeholder="ex: Exotic Genetix"
                            />
                        </div>

                        <div className="form-group">
                            <label>Ratio Indica/Sativa</label>
                            <input
                                type="text"
                                value={formData.genetics?.ratio || ''}
                                onChange={(e) => handleGeneticsChange('ratio', e.target.value)}
                                placeholder="ex: 70/30"
                            />
                        </div>

                        <div className="form-group">
                            <label>Autres notes génétiques</label>
                            <textarea
                                value={formData.genetics?.notes || ''}
                                onChange={(e) => handleGeneticsChange('notes', e.target.value)}
                                placeholder="Autres informations..."
                                maxLength={200}
                            />
                        </div>
                    </fieldset>

                    {/* Notes */}
                    <div className="form-group">
                        <label>Notes personnelles</label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="Observations, caractéristiques, etc..."
                            maxLength={500}
                            rows={3}
                        />
                        <small>{(formData.notes || '').length}/500</small>
                    </div>

                    {/* Form Actions */}
                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn-secondary"
                            onClick={onClose}
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button
                            type="submit"
                            className="btn-primary"
                            disabled={loading || !formData.cultivarName}
                        >
                            {loading ? '⏳ Enregistrement...' : isEdit ? '💾 Mettre à jour' : '➕ Ajouter'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NodeFormModal;



