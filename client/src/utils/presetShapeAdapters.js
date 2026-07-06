/**
 * Adaptateurs entre le modèle serveur unifié (UserPreset, cf. hooks/usePresets.js) et les
 * formes "à plat" attendues par le code pipeline existant (GroupedPresetModal, drag&drop de
 * groupe sur une cellule, applyPipelinePreset...) — évite de réécrire tous les points de
 * lecture (`group.fields`, `group.emoji`...) disséminés dans PipelineDragDropView.jsx.
 */

/** UserPreset (type: "grouped") -> forme legacy { id, name, emoji, fields: [{key,value}] } */
export function toLegacyGroupShape(preset) {
    return {
        id: preset.id,
        name: preset.name,
        description: preset.description || '',
        emoji: preset.emoji || '🌱',
        fields: preset.data?.fields || [],
        useCount: preset.useCount || 0,
        createdAt: preset.createdAt,
        updatedAt: preset.updatedAt
    };
}

/** UserPreset (type: "setup") -> forme legacy attendue par SetupCard/applyPipelinePreset. */
export function toLegacySetupShape(preset, allGroups = []) {
    const data = preset.data || {};
    const groupedPresets = Array.isArray(data.groupAssignments)
        ? []
        : (data.groupedPresetIds || [])
            .map(id => allGroups.find(g => g.id === id))
            .filter(Boolean);
    return {
        id: preset.id,
        name: preset.name,
        description: preset.description || '',
        emoji: preset.emoji || '⚙️',
        config: data.config || {},
        groupedPresets,
        groupAssignments: data.groupAssignments || {},
        data: data.data || [],
        createdAt: preset.createdAt,
        updatedAt: preset.updatedAt
    };
}
