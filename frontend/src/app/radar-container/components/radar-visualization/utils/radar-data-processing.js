/**
 * Radar data processing and blip positioning
 */

import { createSegment, generateDynamicQuadrants } from './radar-visualization-utils.js';

/**
 * Process and position entries for radar visualization
 */
export function processRadarEntries(config, rings) {
  const sectorCount = Math.max(4, config.quadrants?.length || 4);
  const ringCount = Math.max(4, rings.length);
  
  const quadrants = sectorCount !== 4 ? generateDynamicQuadrants(sectorCount) : null;

  for (let i = 0; i < config.entries.length; i++) {
    let entry = config.entries[i];
    
    entry.quadrant = Math.max(0, Math.min(entry.quadrant || 0, sectorCount - 1));
    entry.ring = Math.max(0, Math.min(entry.ring || 0, ringCount - 1));
    
    entry.segment = createSegment(entry.quadrant, entry.ring, rings, quadrants);
    let point = entry.segment.random();
    entry.x = point.x;
    entry.y = point.y;
    
    if (!entry.color) {
      entry.color = entry.active !== false
        ? (config.rings[entry.ring]?.color || '#6B7280') // Simple fallback - colors set in radar-data.service.ts
        : (config.colors?.inactive || '#ddd');
    }
  }

  let segmented = new Array(sectorCount);
  for (let sectorIndex = 0; sectorIndex < sectorCount; sectorIndex++) {
    segmented[sectorIndex] = new Array(ringCount);
    for (let ringIndex = 0; ringIndex < ringCount; ringIndex++) {
      segmented[sectorIndex][ringIndex] = [];
    }
  }
  
  for (let i = 0; i < config.entries.length; i++) {
    let entry = config.entries[i];
    
    if (entry.quadrant >= 0 && entry.quadrant < sectorCount && 
        entry.ring >= 0 && entry.ring < ringCount) {
      segmented[entry.quadrant][entry.ring].push(entry);
    } else {
      const safeSector = Math.max(0, Math.min(entry.quadrant || 0, sectorCount - 1));
      const safeRing = Math.max(0, Math.min(entry.ring || 0, ringCount - 1));
      segmented[safeSector][safeRing].push(entry);
    }
  }

  // Preserve technology IDs for navigation
  let sequenceId = 1;
  
  // Legacy order for 4 sectors: [2, 3, 1, 0], natural order for others
  const sectorOrder = sectorCount === 4 ? [2, 3, 1, 0] : Array.from({length: sectorCount}, (_, i) => i);
  
  for (let sectorIndex of sectorOrder) {
    if (sectorIndex < sectorCount) {
      for (let ringIndex = 0; ringIndex < ringCount; ringIndex++) {
        let entries = segmented[sectorIndex][ringIndex];
        
        entries.sort(function (a, b) {
          return (a.technologyName || '').localeCompare(b.technologyName || '');
        });
        
        for (let i = 0; i < entries.length; i++) {
          entries[i].sequenceId = sequenceId++;
        }
      }
    }
  }

  return { processedEntries: config.entries, segmented, sectorCount, ringCount };
}

// NOTE: getDefaultRingColor function removed - colors now controlled in radar-data.service.ts

/**
 * Validate entry data for completeness
 */
export function validateEntries(entries, sectorCount, ringCount) {
  const issues = [];
  const validEntries = [];
  
  entries.forEach((entry, index) => {
    const entryIssues = [];
    
    if (!entry.technologyName) {
      entryIssues.push('Missing technologyName');
    }
    
    if (typeof entry.quadrant !== 'number' || entry.quadrant < 0 || entry.quadrant >= sectorCount) {
      entryIssues.push(`Invalid quadrant: ${entry.quadrant} (must be 0-${sectorCount-1})`);
    }
    
    if (typeof entry.ring !== 'number' || entry.ring < 0 || entry.ring >= ringCount) {
      entryIssues.push(`Invalid ring: ${entry.ring} (must be 0-${ringCount-1})`);
    }
    
    if (entryIssues.length > 0) {
      issues.push({
        index,
        entry: entry.technologyName || `Entry ${index}`,
        issues: entryIssues
      });
    } else {
      validEntries.push(entry);
    }
  });
  
  return {
    isValid: issues.length === 0,
    issues,
    validEntries,
    invalidCount: issues.length,
    validCount: validEntries.length
  };
}

/**
 * Remove existing radar drawing elements
 */
export function removeOldDrawing() {
  if (typeof d3 !== 'undefined') {
    d3.selectAll(".blip").remove();
    d3.selectAll("#bubble").remove();
    d3.selectAll(".tooltip").remove();
    
    d3.selectAll("#circle").remove();
    d3.selectAll(".ring-segment").remove();
    d3.selectAll(".sector-divider").remove();
    d3.selectAll(".sector-label").remove();
    
    d3.selectAll(".legend-item").remove();
    d3.selectAll(".lifecycle-label").remove();
    
    d3.selectAll(".connection-line").remove();
    d3.selectAll("#lineGroup").selectAll("*").remove();
    
    d3.selectAll("text").remove();
    
    // Remove main radar groups to prevent duplicates
    d3.selectAll("g.radar-group").remove();
    d3.selectAll("g[id*='radar']").remove();
    d3.selectAll("#radarGroup").remove();
  }
}
