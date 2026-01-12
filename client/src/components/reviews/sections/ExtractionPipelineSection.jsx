import React from 'react';
import PipelineGitHubGrid from '../../pipeline/PipelineGitHubGrid';
import { LiquidGlass } from '../../ui';

const ExtractionPipelineSection = ({ data = {}, onChange }) => {
    const handlePipelineChange = (pipelineData) => {
        onChange?.({ ...data, pipelineGithub: pipelineData });
    };

    return (
        <div className="space-y-6">
            <PipelineGitHubGrid
                value={data.pipelineGithub}
                onChange={handlePipelineChange}
                type="extraction"
                productType="concentrate"
            />
        </div>
    );
};

export default ExtractionPipelineSection;
