import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp } from 'lucide-react';

/**
 * Graphique d'évolution pour la pipeline Culture
 * Affiche l'évolution des paramètres environnementaux au cours du temps
 */
export const CultureEvolutionGraph = ({ config, data, sidebarContent }) => {
    if (!data || data.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-white/40">
                <TrendingUp className="w-12 h-12 mb-3" />
                <p className="text-sm">Aucune donnée à afficher</p>
                <p className="text-xs mt-1">Ajoutez des données à la timeline pour voir l'évolution</p>
            </div>
        );
    }

    // Préparer les données pour le graphique
    const chartData = data.map((item, index) => {
        const values = { index: index + 1 };

        // Extraire les valeurs numériques depuis item.data
        Object.entries(item.data || {}).forEach(([fieldId, value]) => {
            if (typeof value === 'number') {
                // Trouver le label du champ dans sidebarContent
                const field = findFieldInSidebar(sidebarContent, fieldId);
                values[field?.label || fieldId] = value;
            }
        });

        return values;
    });

    // Obtenir les clés de données (exclure 'index')
    const dataKeys = Object.keys(chartData[0] || {}).filter(key => key !== 'index');

    return (
        <div className="w-full h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis
                        dataKey="index"
                        stroke="rgba(255,255,255,0.5)"
                        label={{ value: config.intervalType === 'jours' ? 'Jour' : 'Phase', position: 'insideBottom', offset: -5 }}
                    />
                    <YAxis stroke="rgba(255,255,255,0.5)" />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '8px'
                        }}
                    />
                    <Legend />
                    {dataKeys.map((key, idx) => (
                        <Line
                            key={key}
                            type="monotone"
                            dataKey={key}
                            stroke={getColorForIndex(idx)}
                            strokeWidth={2}
                            dot={{ r: 4 }}
                            activeDot={{ r: 6 }}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

// Fonction auxiliaire pour trouver un champ dans sidebarContent
function findFieldInSidebar(sidebarContent, fieldId) {
    if (!sidebarContent || !Array.isArray(sidebarContent)) return null;

    for (const section of sidebarContent) {
        if (section.items) {
            const found = section.items.find(item => item.id === fieldId);
            if (found) return found;
        }
    }
    return null;
}

// Palette de couleurs pour les lignes
function getColorForIndex(index) {
    const colors = [
        '#10b981', // Vert
        '#3b82f6', // Bleu
        '#f59e0b', // Orange
        '#ef4444', // Rouge
        '#8b5cf6', // Violet
        '#ec4899', // Rose
        '#06b6d4', // Cyan
        '#eab308', // Jaune
    ];
    return colors[index % colors.length];
}

export default CultureEvolutionGraph;

