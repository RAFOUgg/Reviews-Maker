/**
 * Index file to ensure adapters are properly bundled
 * Forces Vite to include all adapters in the build
 */

import ExtractionPipelineAdapter from './ExtractionPipelineAdapter.jsx';
import SeparationPipelineAdapter from './SeparationPipelineAdapter.jsx';
import CuringMaturationAdapter from './CuringMaturationAdapter.jsx';

export { ExtractionPipelineAdapter, SeparationPipelineAdapter, CuringMaturationAdapter };

