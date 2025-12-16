/**
 * CulturePipelineSection - Pipeline Culture CDC
 * Version simplifiée - délègue toute la logique à CulturePipelineTimeline
 */

import React from 'react';
import LiquidCard from '../../../components/LiquidCard';
import CulturePipelineTimeline from '../../../components/forms/flower/CulturePipelineTimeline';

const CulturePipelineSection = ({ data = {}, onChange }) => {
    return (
        <LiquidCard title="🌱 Pipeline Culture CDC" bordered>
            <CulturePipelineTimeline
                data={{
                    cultureTimelineConfig: data.cultureTimelineConfig || {
                        type: 'jour',
                        start: '',
                        end: '',
                        duration: 90,
                        totalDays: 90
                    },
                    cultureTimelineData: data.cultureTimelineData || []
                }}
                onChange={(field, value) => {
                    onChange({
                        ...data,
                        [field]: value
                    });
                }}
            />
        </LiquidCard>
    );
};

export default CulturePipelineSection;
