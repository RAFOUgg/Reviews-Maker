import React from 'react';
import PipelineGitHubGrid from '../../pipeline/PipelineGitHubGrid';

const RecipePipelineSection = ({ data = {}, onChange }) => {
    const handlePipelineChange = (pipelineData) => {
        onChange?.({ ...data, pipelineGithub: pipelineData });
    };

    return (
        <div className="space-y-6">
            <PipelineGitHubGrid
                value={data.pipelineGithub}
                onChange={handlePipelineChange}
                type="recipe"
                productType="edible"
            />
        </div>
    );
};

export default RecipePipelineSection;
