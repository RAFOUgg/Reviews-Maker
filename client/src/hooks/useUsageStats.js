import { useState, useEffect } from 'react';
import axios from 'axios';

export function useUsageStats() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await axios.get('/api/usage/stats', {
                withCredentials: true
            });
            setStats(response.data);
            setError(null);
        } catch (err) {
            console.error('[useUsageStats] Error fetching stats:', err);
            setError(err.response?.data?.message || 'Erreur lors du chargement des statistiques');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return { stats, loading, error, refetch: fetchStats };
}

export async function incrementExportCount(format = 'png', quality = 'standard') {
    try {
        const response = await axios.post('/api/usage/exports/increment', {
            format,
            quality
        }, {
            withCredentials: true
        });
        return response.data;
    } catch (err) {
        console.error('[incrementExportCount] Error:', err);
        throw err;
    }
}

export async function getTodayExportCount() {
    try {
        const response = await axios.get('/api/usage/exports/today', {
            withCredentials: true
        });
        return response.data.count;
    } catch (err) {
        console.error('[getTodayExportCount] Error:', err);
        return 0;
    }
}
