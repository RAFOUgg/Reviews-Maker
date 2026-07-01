import React, { useRef, useMemo } from 'react';
import PipelineDragDropView from '../views/PipelineDragDropView';
import { SEPARATION_SIDEBAR_CONTENT } from '../../../config/separationSidebarContent';
import { SEPARATION_PHASES } from '../../../config/pipelinePhases';

const SeparationPipelineSection = ({ data = {}, onChange }) => {
    const timelineDataRef = useRef(data.separationTimelineData || []);

    React.useEffect(() => {
        timelineDataRef.current = data.separationTimelineData || [];
    }, [data.separationTimelineData]);

    const timelineConfig = useMemo(() => ({
        type: data.separationTimelineConfig?.type || 'phases',
        mode: data.separationTimelineConfig?.mode || 'phases',
        startDate: data.separationTimelineConfig?.startDate || '',
        endDate: data.separationTimelineConfig?.endDate || '',
        duration: data.separationTimelineConfig?.duration || null,
        totalSeconds: data.separationTimelineConfig?.totalSeconds || null,
        totalHours: data.separationTimelineConfig?.totalHours || null,
        totalDays: data.separationTimelineConfig?.totalDays || null,
        totalWeeks: data.separationTimelineConfig?.totalWeeks || null,
        totalMonths: data.separationTimelineConfig?.totalMonths || null,
        totalYears: data.separationTimelineConfig?.totalYears || null,
        startMonth: data.separationTimelineConfig?.startMonth || 1,
        phases: (data.separationTimelineConfig?.phases?.length)
            ? data.separationTimelineConfig.phases
            : SEPARATION_PHASES.phases,
    }), [data]);

    const sidebarArray = useMemo(() => {
        return Object.entries(SEPARATION_SIDEBAR_CONTENT).map(([key, section]) => ({
            id: key,
            label: section.label || key,
            icon: section.icon || '📦',
            color: section.color || 'gray',
            collapsed: section.collapsed ?? true,
            items: (section.items || []).map(item => ({
                id: item.id,
                key: item.id,
                label: item.label,
                type: item.type,
                icon: item.icon,
                unit: item.unit,
                options: item.options,
                min: item.min,
                max: item.max,
                step: item.step,
                defaultValue: item.defaultValue,
                tooltip: item.tooltip,
                zones: item.zones
            }))
        })).filter(section => section.items.length > 0);
    }, []);

    const handleConfigChange = (key, value) => {
        const updatedConfig = { ...(data.separationTimelineConfig || {}), [key]: value };
        onChange({ ...data, separationTimelineConfig: updatedConfig });
    };

    const handleDataChange = (timestamp, field, value) => {
        const currentData = timelineDataRef.current;
        const existingIndex = currentData.findIndex(cell => cell.timestamp === timestamp);

        let updatedData;
        if (existingIndex >= 0) {
            updatedData = [...currentData];
            if (value === null || value === undefined) {
                const { [field]: removed, ...rest } = updatedData[existingIndex];
                updatedData[existingIndex] = {
                    timestamp: updatedData[existingIndex].timestamp,
                    ...(updatedData[existingIndex].date && { date: updatedData[existingIndex].date }),
                    ...(updatedData[existingIndex].label && { label: updatedData[existingIndex].label }),
                    ...(updatedData[existingIndex].phase && { phase: updatedData[existingIndex].phase }),
                    ...rest
                };
            } else {
                updatedData[existingIndex] = { ...updatedData[existingIndex], [field]: value };
            }
        } else {
            updatedData = [...currentData, { timestamp, [field]: value }];
        }

        timelineDataRef.current = updatedData;
        onChange({ ...data, separationTimelineData: updatedData });
    };

    const handleClearTimeline = () => {
        timelineDataRef.current = [];
        onChange({ ...data, separationTimelineConfig: {}, separationTimelineData: [] });
    };

    return (
        <PipelineDragDropView
            type="separation"
            sidebarContent={sidebarArray}
            timelineConfig={timelineConfig}
            timelineData={data.separationTimelineData || []}
            onConfigChange={handleConfigChange}
            onDataChange={handleDataChange}
            onClearTimeline={handleClearTimeline}
        />
    );
};

export default SeparationPipelineSection;
