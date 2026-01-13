import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, ChevronRight } from 'lucide-react';

/**
 * PresetGroupQuickPicker - Sélecteur rapide de groupe de pré-réglages
 * 
 * Petit widget pour sélectionner et appliquer rapidement un groupe
 * Sans avoir besoin d'ouvrir le gestionnaire complet
 */
const PresetGroupQuickPicker = ({
    pipelineType = 'culture',
    onApplyGroup,
    className = ''
}) => {
    const [groups, setGroups] = useState([]);
    const [selectedGroupId, setSelectedGroupId] = useState(null);
    const [expanded, setExpanded] = useState(false);

    // Charger les groupes
    useEffect(() => {
        const storedGroups = localStorage.getItem(`${pipelineType}_preset_groups`);
        if (storedGroups) {
            try {
                const parsed = JSON.parse(storedGroups);
                setGroups(parsed || []);
            } catch (e) {
                setGroups([]);
            }
        }
    }, [pipelineType]);

    const handleApply = (group) => {
        setSelectedGroupId(group.id);
        if (onApplyGroup) {
            onApplyGroup(group.fields);
        }
        // Feedback visuel
        setTimeout(() => setSelectedGroupId(null), 1500);
    };

    if (groups.length === 0) {
        return (
            <div className={`text-sm text-gray-500 italic ${className}`}>
                Aucun groupe de pré-réglages disponible
            </div>
        );
    }

    return (
        <div className={`bg-gray-800/30 rounded-lg border border-gray-700 ${className}`}>
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between p-3 hover:bg-gray-700/30 transition-colors rounded-lg"
            >
                <div className="flex items-center gap-2">
                    <span className="text-purple-400">📋</span>
                    <span className="text-sm font-medium text-gray-300">
                        Groupes de pré-réglages ({groups.length})
                    </span>
                </div>
                <ChevronRight
                    className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-90' : ''}`}
                />
            </button>

            {expanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="border-t border-gray-700 p-2 space-y-1 max-h-60 overflow-y-auto"
                >
                    {groups.map(group => (
                        <motion.button
                            key={group.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleApply(group)}
                            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${selectedGroupId === group.id
                                    ? 'bg-green-600/30 border-green-500 border'
                                    : 'bg-gray-700/30 hover:bg-gray-600/40 border border-transparent'
                                }`}
                        >
                            <span className="text-xl">{group.icon}</span>
                            <div className="flex-1 text-left">
                                <div className="text-sm font-medium text-white">
                                    {group.name}
                                </div>
                                <div className="text-xs text-gray-400">
                                    {Object.keys(group.fields || {}).length} champ(s)
                                </div>
                            </div>
                            {selectedGroupId === group.id && (
                                <Check className="w-4 h-4 text-green-400" />
                            )}
                        </motion.button>
                    ))}
                </motion.div>
            )}
        </div>
    );
};

export default PresetGroupQuickPicker;

