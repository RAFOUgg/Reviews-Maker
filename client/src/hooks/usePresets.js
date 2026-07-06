/**
 * Hook global pour les préréglages utilisateur (groupes/setups pipeline) et les projets.
 *
 * Remplace l'ancienne version instanciée par pipelineType (un fetch réseau par onglet
 * pipeline ouvert) — charge tout une fois, expose des sélecteurs dérivés par pipelineType.
 * Authentifié → source de vérité serveur (/api/presets, /api/projects), avec migration
 * one-shot des anciennes clés localStorage. Anonyme → cache local unifié
 * (cf. utils/presetLocalMigration.js), jamais perdu au passage vers ce nouveau hook.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    migrateLocalPresetsToServer,
    consolidateAnonymousCache,
    ANONYMOUS_CACHE_KEY
} from '../utils/presetLocalMigration';

const checkAuth = async () => {
    try {
        const res = await fetch('/api/auth/me', { credentials: 'include' });
        if (!res.ok) return null;
        const user = await res.json();
        return user?.id || null;
    } catch {
        return null;
    }
};

function saveAnonymousCache(list) {
    localStorage.setItem(ANONYMOUS_CACHE_KEY, JSON.stringify(list));
}

export function usePresets() {
    const [userId, setUserId] = useState(undefined); // undefined = pas encore vérifié
    const [presets, setPresets] = useState([]);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isAuthenticated = !!userId;

    const loadAll = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const uid = await checkAuth();
            setUserId(uid);

            if (uid) {
                await migrateLocalPresetsToServer(uid);
                const [presetsRes, projectsRes] = await Promise.all([
                    fetch('/api/presets', { credentials: 'include' }),
                    fetch('/api/projects', { credentials: 'include' })
                ]);
                setPresets(presetsRes.ok ? await presetsRes.json() : []);
                setProjects(projectsRes.ok ? await projectsRes.json() : []);
            } else {
                setPresets(consolidateAnonymousCache());
                setProjects([]);
            }
        } catch (err) {
            setError(err.message || 'Erreur de chargement');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { loadAll(); }, [loadAll]);

    const createPreset = useCallback(async (type, data) => {
        if (isAuthenticated) {
            const res = await fetch('/api/presets', {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...data, type })
            });
            if (!res.ok) throw new Error('Erreur création préréglage');
            const created = await res.json();
            setPresets(prev => [created, ...prev]);
            return created;
        }
        const now = new Date().toISOString();
        const created = {
            id: `local_${Date.now()}`,
            type,
            pipelineType: data.pipelineType || null,
            name: data.name,
            description: data.description || '',
            emoji: data.emoji || null,
            tags: data.tags || [],
            projectId: null,
            isArchived: false,
            data: data.data,
            useCount: 0,
            lastUsedAt: null,
            createdAt: now,
            updatedAt: now
        };
        setPresets(prev => {
            const next = [created, ...prev];
            saveAnonymousCache(next);
            return next;
        });
        return created;
    }, [isAuthenticated]);

    const updatePreset = useCallback(async (id, updates) => {
        if (isAuthenticated && !String(id).startsWith('local_')) {
            const res = await fetch(`/api/presets/${id}`, {
                method: 'PUT',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (!res.ok) throw new Error('Erreur mise à jour préréglage');
            const updated = await res.json();
            setPresets(prev => prev.map(p => p.id === id ? updated : p));
            return updated;
        }
        let updatedRow = null;
        setPresets(prev => {
            const next = prev.map(p => {
                if (p.id !== id) return p;
                updatedRow = { ...p, ...updates, updatedAt: new Date().toISOString() };
                return updatedRow;
            });
            saveAnonymousCache(next);
            return next;
        });
        return updatedRow;
    }, [isAuthenticated]);

    const deletePreset = useCallback(async (id) => {
        if (isAuthenticated && !String(id).startsWith('local_')) {
            const res = await fetch(`/api/presets/${id}`, { method: 'DELETE', credentials: 'include' });
            if (!res.ok) throw new Error('Erreur suppression préréglage');
            setPresets(prev => prev.filter(p => p.id !== id));
            return;
        }
        setPresets(prev => {
            const next = prev.filter(p => p.id !== id);
            saveAnonymousCache(next);
            return next;
        });
    }, [isAuthenticated]);

    /** À appeler chaque fois qu'un groupe/setup est réellement appliqué (drag&drop, assignation
     * en masse, chargement côté Chaîne de production) — incrémente useCount côté serveur. */
    const markUsed = useCallback(async (id) => {
        if (!isAuthenticated || String(id).startsWith('local_')) {
            setPresets(prev => {
                const next = prev.map(p => p.id === id
                    ? { ...p, useCount: (p.useCount || 0) + 1, lastUsedAt: new Date().toISOString() }
                    : p);
                if (!isAuthenticated) saveAnonymousCache(next);
                return next;
            });
            return;
        }
        try {
            const res = await fetch(`/api/presets/${id}/use`, { method: 'POST', credentials: 'include' });
            if (res.ok) {
                const updated = await res.json();
                setPresets(prev => prev.map(p => p.id === id ? updated : p));
            }
        } catch {
            // best-effort — ne bloque jamais l'application réelle du groupe si ce ping échoue
        }
    }, [isAuthenticated]);

    const createProject = useCallback(async (data) => {
        if (!isAuthenticated) throw new Error('Connectez-vous pour créer des projets');
        const res = await fetch('/api/projects', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error('Erreur création projet');
        const created = await res.json();
        setProjects(prev => [created, ...prev]);
        return created;
    }, [isAuthenticated]);

    const deleteProject = useCallback(async (id) => {
        if (!isAuthenticated) return;
        const res = await fetch(`/api/projects/${id}`, { method: 'DELETE', credentials: 'include' });
        if (!res.ok) throw new Error('Erreur suppression projet');
        setProjects(prev => prev.filter(p => p.id !== id));
        setPresets(prev => prev.map(p => p.projectId === id ? { ...p, projectId: null } : p));
    }, [isAuthenticated]);

    // Sélecteurs dérivés — remplacent l'ancien pattern "un hook par pipelineType".
    const getGroupsFor = useCallback((pipelineType) =>
        presets.filter(p => p.type === 'grouped' && !p.isArchived && (!pipelineType || p.pipelineType === pipelineType)),
    [presets]);

    const getSetupsFor = useCallback((pipelineType) =>
        presets.filter(p => p.type === 'setup' && !p.isArchived && (!pipelineType || p.pipelineType === pipelineType)),
    [presets]);

    const fieldPresets = useMemo(() => presets.filter(p => p.type === 'field' && !p.isArchived), [presets]);

    return {
        presets,
        projects,
        loading,
        error,
        isAuthenticated,
        createPreset,
        updatePreset,
        deletePreset,
        markUsed,
        createProject,
        deleteProject,
        getGroupsFor,
        getSetupsFor,
        fieldPresets,
        refreshPresets: loadAll
    };
}

export default usePresets;
