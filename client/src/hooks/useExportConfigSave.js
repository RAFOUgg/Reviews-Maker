/**
 * useExportConfigSave Hook
 * 
 * Gère la sauvegarde et le chargement des configurations d'export
 * Synchronise avec le backend via l'API ExportConfiguration
 * Fallback à localStorage si API échoue
 */

import { useCallback, useRef } from 'react';
import { useAuth } from './useAuth';

const API_BASE = '/api/export/config';

export function useExportConfigSave() {
    const { user } = useAuth();
    const configCache = useRef({}); // Cache local temporaire

    /**
     * Sauvegarder une configuration d'export
     * Retry 2x en cas d'erreur réseau
     */
    const saveConfig = useCallback(async (config, options = {}) => {
        const {
            debounce = true,
            retries = 2,
            delayMs = 800
        } = options;

        // Si debounce activé, attendre avant sauvegarder
        if (debounce) {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }

            return new Promise((resolve) => {
                debounceTimer.current = setTimeout(async () => {
                    debounceTimer.current = null;
                    resolve(await saveConfig(config, { debounce: false, retries }));
                }, delayMs);
            });
        }

        if (!user?.id) {
            console.warn('[useExportConfigSave] Utilisateur pas authenticé');
            // Fallback localStorage
            try {
                localStorage.setItem(
                    `export_config_${config.name}`,
                    JSON.stringify(config)
                );
            } catch (e) {
                console.error('localStorage error:', e);
            }
            return null;
        }

        let lastError = null;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(`${API_BASE}/save`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: config.name || `Export ${new Date().toLocaleDateString()}`,
                        reviewId: config.reviewId || null,
                        templateName: config.templateName || 'modernCompact',
                        format: config.format || '1:1',
                        colors: config.colors || {},
                        typography: config.typography || {},
                        contentModules: config.contentModules || {},
                        watermark: config.watermark || null,
                        branding: config.branding || null,
                        imageSettings: config.imageSettings || null,
                        description: config.description,
                        isDefault: config.isDefault === true
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const result = await response.json();

                // Cache local
                configCache.current[result.config.id] = result.config;

                console.log('[useExportConfigSave] ✅ Config saved:', result.config.id);
                return result.config;

            } catch (error) {
                lastError = error;
                console.warn(`[useExportConfigSave] Tentative ${attempt + 1}/${retries + 1} échouée:`, error.message);

                if (attempt < retries) {
                    // Attendre avant retry (exponential backoff)
                    await new Promise(r => setTimeout(r, Math.pow(2, attempt) * 1000));
                }
            }
        }

        // Tous les retries échoués - fallback localStorage
        console.error('[useExportConfigSave] Tous les retries échoués, falling back to localStorage');
        try {
            localStorage.setItem(
                `export_config_${config.name}`,
                JSON.stringify(config)
            );
            console.log('[useExportConfigSave] Saved to localStorage');
        } catch (e) {
            console.error('localStorage error:', e);
        }

        return null;
    }, [user?.id]);

    /**
     * Charger une configuration
     */
    const loadConfig = useCallback(async (configId) => {
        // Check cache d'abord
        if (configCache.current[configId]) {
            return configCache.current[configId];
        }

        if (!user?.id) {
            console.warn('[useExportConfigSave] Utilisateur pas authenticé');
            return null;
        }

        try {
            const response = await fetch(`${API_BASE}/${configId}`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();
            configCache.current[result.config.id] = result.config;

            console.log('[useExportConfigSave] ✅ Config loaded:', configId);
            return result.config;

        } catch (error) {
            console.error('[useExportConfigSave] Failed to load config:', error);
            return null;
        }
    }, [user?.id]);

    /**
     * Supprimer une configuration
     */
    const deleteConfig = useCallback(async (configId) => {
        if (!user?.id) {
            console.warn('[useExportConfigSave] Utilisateur pas authenticé');
            return false;
        }

        try {
            const response = await fetch(`${API_BASE}/${configId}`, {
                method: 'DELETE',
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            delete configCache.current[configId];
            console.log('[useExportConfigSave] ✅ Config deleted:', configId);
            return true;

        } catch (error) {
            console.error('[useExportConfigSave] Failed to delete config:', error);
            return false;
        }
    }, [user?.id]);

    /**
     * Lister toutes les configurations de l'utilisateur
     */
    const listConfigs = useCallback(async () => {
        if (!user?.id) {
            console.warn('[useExportConfigSave] Utilisateur pas authenticé');
            return [];
        }

        try {
            const response = await fetch(`${API_BASE}s`, {
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }

            const result = await response.json();

            // Update cache
            result.configs.forEach(c => {
                configCache.current[c.id] = c;
            });

            console.log('[useExportConfigSave] ✅ Configs listed:', result.total);
            return result.configs;

        } catch (error) {
            console.error('[useExportConfigSave] Failed to list configs:', error);
            return [];
        }
    }, [user?.id]);

    return {
        saveConfig,
        loadConfig,
        deleteConfig,
        listConfigs,
        isReady: !!user?.id
    };
}

export default useExportConfigSave;
