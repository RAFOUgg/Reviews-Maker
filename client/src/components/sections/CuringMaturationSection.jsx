/**
 * CuringMaturationSection - Section wrapper pour Pipeline Curing/Maturation
 * Architecture unifiée CDC - Rend directement CuringPipelineDragDrop
 * Compatible tous types de produits (Fleurs, Hash, Concentrés, Comestibles)
 */

import { useRef, useEffect } from 'react';
import CuringPipelineDragDrop from '../pipelines/legacy/CuringPipelineDragDrop';

const CONTAINER_TYPES = [
    { id: 'air_libre', label: 'Air libre', icon: '🌬️' },
    { id: 'verre', label: 'Verre', icon: '🫙' },
    { id: 'plastique', label: 'Plastique', icon: '🥡' },
    { id: 'metal', label: 'Métal', icon: '🥫' },
    { id: 'papier', label: 'Papier', icon: '📄' },
    { id: 'autre', label: 'Autre', icon: '📦' }
];

const PACKAGING_TYPES = [
    { id: 'cellophane', label: 'Cellophane', icon: '📦' },
    { id: 'papier_cuisson', label: 'Papier cuisson', icon: '📄' },
    { id: 'aluminium', label: 'Aluminium', icon: '✨' },
    { id: 'paper_hash', label: 'Paper hash', icon: '📜' },
    { id: 'sac_vide', label: 'Sac à vide', icon: '🗜️' },
    { id: 'sous_vide_complet', label: 'Sous vide (machine)', icon: '🔒' },
    { id: 'sous_vide_partiel', label: 'Sous vide (manuel)', icon: '✋' },
    { id: 'congelation', label: 'Congélation', icon: '❄️' },
    { id: 'autre', label: 'Autre', icon: '📦' }
];

const OPACITY_LEVELS = [
    { id: 'opaque', label: 'Opaque', icon: '⬛' },
    { id: 'semi_opaque', label: 'Semi-opaque', icon: '🔲' },
    { id: 'transparent', label: 'Transparent', icon: '⬜' },
    { id: 'ambre', label: 'Ambré', icon: '🟧' }
];


const CuringMaturationSection = ({ data = {}, onChange, productType = 'flower' }) => {
    // Ref pour maintenir la dernière version des données
    const timelineDataRef = useRef(data.curingTimeline || []);

    // Synchroniser la ref quand data change de l'extérieur
    useEffect(() => {
        timelineDataRef.current = data.curingTimeline || [];
    }, [data.curingTimeline]);

    // Handler pour changements de configuration
    const handleConfigChange = (key, value) => {
        const updatedConfig = { ...(data.curingTimelineConfig || {}), [key]: value };
        onChange({ ...data, curingTimelineConfig: updatedConfig });
    };

    // Handler pour changements de données de cellules
    const handleDataChange = (timestamp, field, value) => {
        const currentData = timelineDataRef.current;
        const existingIndex = currentData.findIndex(cell => cell.timestamp === timestamp);

        let updatedData;
        if (existingIndex >= 0) {
            updatedData = [...currentData];
            if (value === null || value === undefined) {
                // Suppression: retirer le champ mais garder timestamp/metadata
                const { [field]: removed, ...rest } = updatedData[existingIndex];
                updatedData[existingIndex] = {
                    timestamp: updatedData[existingIndex].timestamp,
                    ...(updatedData[existingIndex].date && { date: updatedData[existingIndex].date }),
                    ...(updatedData[existingIndex].label && { label: updatedData[existingIndex].label }),
                    ...(updatedData[existingIndex].phase && { phase: updatedData[existingIndex].phase }),
                    ...rest
                };

                // Si cellule vide, la supprimer complètement
                const cellKeys = Object.keys(updatedData[existingIndex]).filter(k =>
                    !['timestamp', 'label', 'date', 'phase', '_meta'].includes(k)
                );
                if (cellKeys.length === 0) {
                    updatedData.splice(existingIndex, 1);
                }
            } else {
                // Mise à jour
                updatedData[existingIndex] = { ...updatedData[existingIndex], [field]: value };
            }
        } else {
            // Nouvelle cellule
            updatedData = [...currentData, { timestamp, [field]: value }];
        }

        // Synchroniser ref et propager
        timelineDataRef.current = updatedData;
        onChange({ ...data, curingTimeline: updatedData });
    };

    return (
        <CuringPipelineDragDrop
            timelineConfig={data.curingTimelineConfig || { type: 'phase' }}
            timelineData={data.curingTimeline || []}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
        />
    );
};

export default CuringMaturationSection;




