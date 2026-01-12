import React from 'react';
import PipelineGitHubGrid from '../../pipeline/PipelineGitHubGrid';

const CuringPipelineSection = ({ data = {}, onChange }) => {
    const handlePipelineChange = (pipelineData) => {
        onChange?.({ ...data, pipelineGithub: pipelineData });
    };

    return (
        <div className="space-y-6">
            <PipelineGitHubGrid
                value={data.pipelineGithub}
                onChange={handlePipelineChange}
                type="curing"
                productType={data.productType || 'hash'}
            />
        </div>
    );
};

export default CuringPipelineSection;
