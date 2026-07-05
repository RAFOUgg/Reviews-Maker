import React, { useRef, useMemo } from 'react';
import PipelineDragDropView from '../views/PipelineDragDropView';
import { EXTRACTION_SIDEBAR_CONTENT } from '../../../config/extractionSidebarContent';
import { EXTRACTION_PHASES } from '../../../config/pipelinePhases';
import ChainSectionEmbed from '../../production-chain/ChainSectionEmbed';
import ChainToggleButton from '../../production-chain/ChainToggleButton';
import useProductionChainStore from '../../../store/useProductionChainStore';

const ExtractionPipelineSection = ({ data = {}, onChange, reviewId, reviewLabel, reviewImage }) => {
    const linkOpen = useProductionChainStore(s => s.linkOpen);
    const timelineDataRef = useRef(data.extractionTimelineData || []);

    React.useEffect(() => {
        timelineDataRef.current = data.extractionTimelineData || [];
    }, [data.extractionTimelineData]);

    const timelineConfig = useMemo(() => ({
        type: data.extractionTimelineConfig?.type || 'phases',
        mode: data.extractionTimelineConfig?.mode || 'phases',
        startDate: data.extractionTimelineConfig?.startDate || '',
        endDate: data.extractionTimelineConfig?.endDate || '',
        duration: data.extractionTimelineConfig?.duration || null,
        totalSeconds: data.extractionTimelineConfig?.totalSeconds || null,
        totalHours: data.extractionTimelineConfig?.totalHours || null,
        totalDays: data.extractionTimelineConfig?.totalDays || null,
        totalWeeks: data.extractionTimelineConfig?.totalWeeks || null,
        totalMonths: data.extractionTimelineConfig?.totalMonths || null,
        totalYears: data.extractionTimelineConfig?.totalYears || null,
        startMonth: data.extractionTimelineConfig?.startMonth || 1,
        phases: (data.extractionTimelineConfig?.phases?.length)
            ? data.extractionTimelineConfig.phases
            : EXTRACTION_PHASES.phases,
    }), [data]);

    const sidebarArray = useMemo(() => {
        return Object.entries(EXTRACTION_SIDEBAR_CONTENT).map(([key, section]) => ({
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
        const updatedConfig = { ...(data.extractionTimelineConfig || {}), [key]: value };
        onChange({ ...data, extractionTimelineConfig: updatedConfig });
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
        onChange({ ...data, extractionTimelineData: updatedData });
    };

    const handleClearTimeline = () => {
        timelineDataRef.current = [];
        onChange({ ...data, extractionTimelineConfig: {}, extractionTimelineData: [] });
    };

    return (
        <div className="space-y-4">
            {linkOpen ? (
                <ChainSectionEmbed
                    reviewId={reviewId}
                    reviewType="concentrate"
                    reviewLabel={reviewLabel}
                    reviewImage={reviewImage}
                />
            ) : (
                <PipelineDragDropView
                    type="extraction"
                    sidebarContent={sidebarArray}
                    timelineConfig={timelineConfig}
                    timelineData={data.extractionTimelineData || []}
                    onConfigChange={handleConfigChange}
                    onDataChange={handleDataChange}
                    onClearTimeline={handleClearTimeline}
                    headerExtra={<ChainToggleButton reviewId={reviewId} reviewType="concentrate" />}
                />
            )}
        </div>
    );
};

export default ExtractionPipelineSection;
