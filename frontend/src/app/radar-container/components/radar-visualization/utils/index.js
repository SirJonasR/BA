/**
 * Radar visualization utils public API
 */

// Main orchestrator
export {
  unified_radar_visualization,
} from './radar-visualization.js';

// Core utilities
export { 
  QUADRANTS, 
  LEGEND_OFFSET,
  generateDynamicQuadrants,
  generateDynamicLegendOffsets,
  getSectorLabelPosition,
  polar, 
  cartesian, 
  bounded_interval, 
  bounded_ring, 
  bounded_box, 
  translate, 
  viewbox, 
  SeededRandom,
  createSegment,
  RadarGeometry,
  loadMarkedLibrary
} from './radar-visualization-utils.js';

// Data processing
export { 
  processRadarEntries, 
  validateEntries,
  removeOldDrawing 
} from './radar-data-processing.js';

// Rendering components
export { initializeSVG, createRadarGrid } from './radar-svg-setup.js';
export { createRadarLegend, blipSegmentTransform } from './radar-legend.js';
export { createTooltipSystem } from './radar-tooltip.js';
export { createRadarBlips } from './radar-blips.js';

// Slice detail functionality
export { 
  default as SliceDetailManager,
  handleSectorClick,
  handleRingClick
} from './radar-slice-detail.js';
