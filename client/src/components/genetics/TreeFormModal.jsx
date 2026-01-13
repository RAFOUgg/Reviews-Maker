/**
 * TreeFormModal Component
 * 
 * Modale pour créer/éditer un arbre généalogique
 */

import React, { useState } from 'react';
import useGeneticsStore from '../../store/useGeneticsStore';

const TreeFormModal = ({ isEdit, onClose }) => {
    const store = useGeneticsStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formData = store.treeFormData || {};

    const handleChange = (field, value) => {
        store.updateTreeFormData({ [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.name || formData.name.trim().length === 0) {
                throw new Error('Le nom de l\'arbre est requis');
            }

            if (isEdit && formData.id) {
                await store.updateTree(formData.id, {
                    name: formData.name,
                    description: formData.description,
                    projectType: formData.projectType,
                    isPublic: formData.isPublic
                });
            } else {
                await store.createTree({
                    name: formData.name,
                    description: formData.description,
                    projectType: formData.projectType,
                    isPublic: formData.isPublic
                });
            }

            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const projectTypes = [
        { value: 'phenohunt', label: '🔍 PhenoHunt', description: 'Recherche de phénotypes intéressants' },
        { value: 'selection', label: '🌿 Sélection', description: 'Sélection génétique contrôlée' },
        { value: 'crossing', label: '🔄 Croisement', description: 'Croisements spécifiques' },
        { value: 'hunt', label: '🎯 Hunt', description: 'Chasse aux génétiques' }
    ];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{isEdit ? '✏️ Éditer arbre' : '🌳 Nouvel arbre généalogique'}</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="tree-form">
                    {error && <div className="form-error">{error}</div>}

                    {/* Tree Name */}
                    <div className="form-group">
                        <label>Nom de l'arbre *</label>
                        <input
                            type="text"
                            value={formData.name || ''}
                            onChange={(e) => handleChange('name', e.target.value)}
                            placeholder="ex: Gorilla Glue Hunt 2025"
                            required
                            maxLength={200}
                        />
                        <small>{(formData.name || '').length}/200</small>
                    </div>

                    {/* Project Type */}
                    <div className="form-group">
                        <label>Type de projet *</label>
                        <div className="project-type-options">
                            {projectTypes.map(type => (
                                <label key={type.value} className="radio-option">
                                    <input
                                        type="radio"
                                        name="projectType"
                                        value={type.value}
                                        checked={formData.projectType === type.value}
                                        onChange={(e) => handleChange('projectType', e.target.value)}
                                    />
                                    <div className="radio-content">
                                        <span className="radio-label">{type.label}</span>
                                        <span className="radio-description">{type.description}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label>Description (optionnel)</label>
                        <textarea
                            value={formData.description || ''}
                            onChange={(e) => handleChange('description', e.target.value)}
                            placeholder="Objectifs, notes sur ce projet..."
                            maxLength={1000}
                            rows={3}
                        />
                        <small>{(formData.description || '').length}/1000</small>
                    </div>

                    {/* Visibility */}
                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={formData.isPublic || false}
                                onChange={(e) => handleChange('isPublic', e.target.checked)}
                            />
                            <span>
                                <strong>Rendre cet arbre public</strong>
                                <p>Les utilisateurs pourront le voir dans la galerie publique et le commenter</p>
                            </span>
                        </label>
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
                            disabled={loading || !formData.name}
                        >
                            {loading ? '⏳ Enregistrement...' : isEdit ? '💾 Mettre à jour' : '🌳 Créer l\'arbre'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TreeFormModal;




