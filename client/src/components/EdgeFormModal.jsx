/**
 * EdgeFormModal Component
 * 
 * Modale pour créer/éditer une arête (relation parent-enfant)
 */

import React, { useState } from 'react';
import useGeneticsStore from '../store/useGeneticsStore';
import './FormModal.css';

const EdgeFormModal = ({ onClose }) => {
    const store = useGeneticsStore();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const formData = store.edgeFormData || {};

    const handleChange = (field, value) => {
        store.updateEdgeFormData({ [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!formData.parentNodeId || !formData.childNodeId) {
                throw new Error('Veuillez sélectionner un parent et un enfant');
            }

            if (formData.parentNodeId === formData.childNodeId) {
                throw new Error('Le parent et l\'enfant ne peuvent pas être le même nœud');
            }

            await store.addEdge({
                parentNodeId: formData.parentNodeId,
                childNodeId: formData.childNodeId,
                relationshipType: formData.relationshipType || 'parent',
                notes: formData.notes || null
            });

            onClose();
        } catch (err) {
            setError(err.message || 'Une erreur est survenue');
        } finally {
            setLoading(false);
        }
    };

    const relationshipTypes = [
        { value: 'parent', label: '👨‍👩‍👧 Parent' },
        { value: 'pollen_donor', label: '🌼 Donateur de pollen' },
        { value: 'sibling', label: '👯 Frère/Sœur' },
        { value: 'clone', label: '🔄 Clone' },
        { value: 'mutation', label: '⚡ Mutation' }
    ];

    const parentNode = store.nodes.find(n => n.id === formData.parentNodeId);
    const childNode = store.nodes.find(n => n.id === formData.childNodeId);

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>➕ Créer une relation</h2>
                    <button className="modal-close" onClick={onClose}>✕</button>
                </div>

                <form onSubmit={handleSubmit} className="edge-form">
                    {error && <div className="form-error">{error}</div>}

                    {/* Parent Selection */}
                    <div className="form-group">
                        <label>Cultivar parent *</label>
                        <select
                            value={formData.parentNodeId || ''}
                            onChange={(e) => handleChange('parentNodeId', e.target.value)}
                            required
                        >
                            <option value="">Sélectionner un parent...</option>
                            {store.nodes.map(node => (
                                <option key={node.id} value={node.id}>
                                    {node.cultivarName}
                                </option>
                            ))}
                        </select>
                        {parentNode && (
                            <div className="node-preview">
                                <div
                                    className="node-color"
                                    style={{ backgroundColor: parentNode.color }}
                                ></div>
                                <span>{parentNode.cultivarName}</span>
                            </div>
                        )}
                    </div>

                    {/* Relationship Type */}
                    <div className="form-group">
                        <label>Type de relation *</label>
                        <select
                            value={formData.relationshipType || 'parent'}
                            onChange={(e) => handleChange('relationshipType', e.target.value)}
                        >
                            {relationshipTypes.map(type => (
                                <option key={type.value} value={type.value}>
                                    {type.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Child Selection */}
                    <div className="form-group">
                        <label>Cultivar enfant *</label>
                        <select
                            value={formData.childNodeId || ''}
                            onChange={(e) => handleChange('childNodeId', e.target.value)}
                            required
                        >
                            <option value="">Sélectionner un enfant...</option>
                            {store.nodes.map(node => (
                                <option
                                    key={node.id}
                                    value={node.id}
                                    disabled={node.id === formData.parentNodeId}
                                >
                                    {node.cultivarName}
                                </option>
                            ))}
                        </select>
                        {childNode && (
                            <div className="node-preview">
                                <div
                                    className="node-color"
                                    style={{ backgroundColor: childNode.color }}
                                ></div>
                                <span>{childNode.cultivarName}</span>
                            </div>
                        )}
                    </div>

                    {/* Relationship Preview */}
                    {parentNode && childNode && (
                        <div className="relationship-preview">
                            <div className="preview-item">
                                <div className="item-color" style={{ backgroundColor: parentNode.color }}></div>
                                <span>{parentNode.cultivarName}</span>
                            </div>
                            <div className="arrow">
                                {relationshipTypes.find(t => t.value === formData.relationshipType)?.label || '→'}
                            </div>
                            <div className="preview-item">
                                <div className="item-color" style={{ backgroundColor: childNode.color }}></div>
                                <span>{childNode.cultivarName}</span>
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    <div className="form-group">
                        <label>Notes supplémentaires</label>
                        <textarea
                            value={formData.notes || ''}
                            onChange={(e) => handleChange('notes', e.target.value)}
                            placeholder="ex: F1, sélection spécifique, etc..."
                            maxLength={500}
                            rows={2}
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
                            disabled={loading || !formData.parentNodeId || !formData.childNodeId}
                        >
                            {loading ? '⏳ Création...' : '➕ Créer la relation'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EdgeFormModal;



