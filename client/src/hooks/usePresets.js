/**
 * Hook pour gérer les préréglages utilisateur
 * Synchronisation localStorage + API serveur
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '../store/orchardStore';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

/**
 * Hook usePresets
 * Gère les préréglages de champs pipeline pour l'utilisateur connecté
 * 
 * @param {string} pipelineType - 'culture', 'curing', 'separation', 'extraction'
 * @returns {Object} - { presets, loading, createPreset, updatePreset, deletePreset, refreshPresets }
 */
export const usePresets = (pipelineType = 'culture') => {
    const { user, isAuthenticated } = useAuthStore();
    const [presets, setPresets] = useState({
        field: [],      // Préréglages individuels de champs
        grouped: [],    // Préréglages groupés
        pipeline: []    // Préréglages de pipeline complète
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Charger les préréglages depuis le serveur ou localStorage
     */
    const loadPresets = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            if (isAuthenticated && user) {
                // Utilisateur connecté : charger depuis l'API
                const response = await fetch(`${API_BASE}/api/presets?pipelineType=${pipelineType}`, {
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const data = await response.json();

                    // Grouper par type
                    const grouped = {
                        field: data.filter(p => p.type === 'field'),
                        grouped: data.filter(p => p.type === 'grouped'),
                        pipeline: data.filter(p => p.type === 'pipeline')
                    };

                    setPresets(grouped);

                    // Synchroniser avec localStorage pour backup
                    localStorage.setItem(`presets_${pipelineType}_server`, JSON.stringify(grouped));
                } else {
                    console.warn('❌ Erreur chargement préréglages serveur, fallback localStorage');
                    loadFromLocalStorage();
                }
            } else {
                // Utilisateur non connecté : charger depuis localStorage uniquement
                loadFromLocalStorage();
            }
        } catch (err) {
            console.error('❌ Erreur chargement préréglages:', err);
            setError(err.message);
            loadFromLocalStorage();
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, user, pipelineType]);

    /**
     * Fallback : charger depuis localStorage
     */
    const loadFromLocalStorage = () => {
        try {
            // Format legacy
            const fieldPresets = JSON.parse(localStorage.getItem(`${pipelineType}_field_presets`) || '[]');
            const groupedPresets = JSON.parse(localStorage.getItem('pipeline-grouped-presets') || '[]');
            const pipelinePresets = JSON.parse(localStorage.getItem('pipeline-presets') || '[]');

            setPresets({
                field: fieldPresets,
                grouped: groupedPresets,
                pipeline: pipelinePresets
            });
        } catch (err) {
            console.error('❌ Erreur lecture localStorage:', err);
            setPresets({ field: [], grouped: [], pipeline: [] });
        }
    };

    /**
     * Créer un nouveau préréglage
     */
    const createPreset = useCallback(async (type, data) => {
        setError(null);

        try {
            if (isAuthenticated && user) {
                // Sauvegarder sur le serveur
                const response = await fetch(`${API_BASE}/api/presets`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        ...data,
                        type,
                        pipelineType
                    })
                });

                if (!response.ok) {
                    throw new Error('Erreur création préréglage');
                }

                const newPreset = await response.json();

                // Mettre à jour l'état local
                setPresets(prev => ({
                    ...prev,
                    [type]: [...prev[type], newPreset]
                }));

                return newPreset;
            } else {
                // Utilisateur non connecté : localStorage uniquement
                const newPreset = {
                    id: `local_${Date.now()}`,
                    ...data,
                    type,
                    pipelineType,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    useCount: 0
                };

                // Sauvegarder dans localStorage
                const storageKey = type === 'field'
                    ? `${pipelineType}_field_presets`
                    : type === 'grouped'
                        ? 'pipeline-grouped-presets'
                        : 'pipeline-presets';

                const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
                existing.push(newPreset);
                localStorage.setItem(storageKey, JSON.stringify(existing));

                setPresets(prev => ({
                    ...prev,
                    [type]: [...prev[type], newPreset]
                }));

                return newPreset;
            }
        } catch (err) {
            console.error('❌ Erreur création préréglage:', err);
            setError(err.message);
            throw err;
        }
    }, [isAuthenticated, user, pipelineType]);

    /**
     * Mettre à jour un préréglage existant
     */
    const updatePreset = useCallback(async (id, updates) => {
        setError(null);

        try {
            if (isAuthenticated && user && !String(id).startsWith('local_')) {
                // Mise à jour serveur
                const response = await fetch(`${API_BASE}/api/presets/${id}`, {
                    method: 'PUT',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(updates)
                });

                if (!response.ok) {
                    throw new Error('Erreur mise à jour préréglage');
                }

                const updated = await response.json();

                // Mettre à jour l'état local
                setPresets(prev => {
                    const type = updated.type;
                    return {
                        ...prev,
                        [type]: prev[type].map(p => p.id === id ? updated : p)
                    };
                });

                return updated;
            } else {
                // Mise à jour localStorage
                const preset = Object.values(presets).flat().find(p => p.id === id);
                if (!preset) throw new Error('Préréglage introuvable');

                const storageKey = preset.type === 'field'
                    ? `${pipelineType}_field_presets`
                    : preset.type === 'grouped'
                        ? 'pipeline-grouped-presets'
                        : 'pipeline-presets';

                const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
                const updated = existing.map(p =>
                    p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
                );
                localStorage.setItem(storageKey, JSON.stringify(updated));

                setPresets(prev => ({
                    ...prev,
                    [preset.type]: prev[preset.type].map(p =>
                        p.id === id ? { ...p, ...updates } : p
                    )
                }));

                return { ...preset, ...updates };
            }
        } catch (err) {
            console.error('❌ Erreur mise à jour préréglage:', err);
            setError(err.message);
            throw err;
        }
    }, [isAuthenticated, user, pipelineType, presets]);

    /**
     * Supprimer un préréglage
     */
    const deletePreset = useCallback(async (id) => {
        setError(null);

        try {
            if (isAuthenticated && user && !String(id).startsWith('local_')) {
                // Suppression serveur
                const response = await fetch(`${API_BASE}/api/presets/${id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });

                if (!response.ok) {
                    throw new Error('Erreur suppression préréglage');
                }
            }

            // Suppression locale (serveur + localStorage)
            const preset = Object.values(presets).flat().find(p => p.id === id);
            if (!preset) return;

            const storageKey = preset.type === 'field'
                ? `${pipelineType}_field_presets`
                : preset.type === 'grouped'
                    ? 'pipeline-grouped-presets'
                    : 'pipeline-presets';

            const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
            localStorage.setItem(storageKey, JSON.stringify(existing.filter(p => p.id !== id)));

            setPresets(prev => ({
                ...prev,
                [preset.type]: prev[preset.type].filter(p => p.id !== id)
            }));
        } catch (err) {
            console.error('❌ Erreur suppression préréglage:', err);
            setError(err.message);
            throw err;
        }
    }, [isAuthenticated, user, pipelineType, presets]);

    // Charger les préréglages au montage et quand l'auth change
    useEffect(() => {
        loadPresets();
    }, [loadPresets]);

    return {
        presets,
        loading,
        error,
        createPreset,
        updatePreset,
        deletePreset,
        refreshPresets: loadPresets
    };
};

export default usePresets;
