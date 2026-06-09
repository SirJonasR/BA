/**
 * SVG Setup and Grid Drawing for Radar Visualization
 */

import * as d3 from "d3";
import { 
  QUADRANTS, 
  generateDynamicQuadrants, 
  translate, 
  viewbox,
  getCSSColor
} from './radar-visualization-utils.js';
import { RADAR_ANIMATION_CONFIG, AnimationUtils } from './radar-animations.js';

/**
 * Initialize SVG element and main radar group
 */
export function initializeSVG(config, shouldAnimate = false) {
  const svg = d3
    .select("svg#" + config.svgId)
    .style("background-color", config.colors.background || getCSSColor('--radar-background', 'transparent'))
    .attr("width", config.width)
    .attr("height", config.height);

  // Remove existing radar groups to prevent duplicates
  svg.selectAll("g.radar-group").remove();
  
  const radar = svg.append("g")
    .attr("class", "radar-group")
    .attr("id", "radarGroup");
  
  const isCategoryMode = false; // Always use full mode
  
  radar.attr("transform", translate(config.width / 2, config.height / 2));

  // If animating, start radar completely hidden from the beginning
  if (shouldAnimate) {
    radar.style("opacity", 0);
  }

  const lineGroup = radar.append("g").attr("id", "lineGroup");

  return { svg, radar, lineGroup };
}

/**
 * Create radar grid with rings and sector labels
 */
export function createRadarGrid(radar, rings, config, navigationFunctions, showLifecycleDescription, hideBubble, hoverLifecycle, leaveLifecycle, shouldAnimate = false) {
  const grid = radar.append("g").attr("class", "radar-grid");

  createBackgroundFilter(grid);
  
  const sectors = config.quadrants || [];
  const sectorCount = sectors.length || 4;
  const dynamicQuadrants = sectorCount !== 4 ? generateDynamicQuadrants(sectorCount) : null;
  
  drawRingSegments(grid, rings, sectorCount, dynamicQuadrants, shouldAnimate);
  addLifecycleLabels(grid, rings, config, navigationFunctions, showLifecycleDescription, hideBubble, hoverLifecycle, leaveLifecycle, shouldAnimate);

  return grid;
}

/**
 * Create background filter for solid backgrounds
 */
function createBackgroundFilter(grid) {
  const defs = grid.append("defs");
  const filter = defs
    .append("filter")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", 1)
    .attr("height", 1)
    .attr("id", "solid");
  
  filter.append("feFlood").attr("flood-color", "rgb(0, 0, 0, 0.8)");
  filter.append("feComposite").attr("in", "SourceGraphic");
}

/**
 * Draw ring segments for dynamic sector counts
 */
function drawRingSegments(grid, rings, sectorCount = 4, dynamicQuadrants = null, shouldAnimate = false) {
  if (sectorCount === 4 && !dynamicQuadrants) {
    drawLegacyQuadrantSegments(grid, rings, shouldAnimate);
    return;
  }
  
  const quadrants = dynamicQuadrants || generateDynamicQuadrants(sectorCount);
  
  for (let ringIndex = 0; ringIndex < rings.length; ringIndex++) {
    const ring = rings[ringIndex];
    const prevRing = ringIndex > 0 ? rings[ringIndex - 1] : { radius: 0 };
    
    for (let sectorIndex = 0; sectorIndex < sectorCount; sectorIndex++) {
      const sector = quadrants[sectorIndex];
      
      // Convert from π units to radians
      const startAngle = sector.radial_min * Math.PI;
      const endAngle = sector.radial_max * Math.PI;
      
      const arc = d3.arc()
        .innerRadius(prevRing.radius)
        .outerRadius(ring.radius)
        .startAngle(startAngle)
        .endAngle(endAngle);
      
      const segment = grid.append("path")
        .attr("d", arc())
        .attr("class", `ring-segment ring-${ringIndex} sector-${sectorIndex}`)
        .style("fill", "none")
        .style("stroke", getCSSColor('--radar-grid', '#cccccc'))
        .style("stroke-width", 1)
        .attr("data-ring", ringIndex)
        .attr("data-sector", sectorIndex);
        
      // Hide immediately if animating
      if (shouldAnimate) {
        segment.style("opacity", 0);
      }
    }
  }
  
  // Draw sector divider lines
  for (let sectorIndex = 0; sectorIndex < sectorCount; sectorIndex++) {
    const sector = quadrants[sectorIndex];
    const angle = sector.radial_min * Math.PI;
    const outerRadius = rings[rings.length - 1].radius;
    
    const x1 = 0;
    const y1 = 0;
    const x2 = outerRadius * Math.cos(angle);
    const y2 = outerRadius * Math.sin(angle);
    
    const divider = grid.append("line")
      .attr("class", `sector-divider sector-divider-${sectorIndex}`)
      .attr("x1", x1)
      .attr("y1", y1)
      .attr("x2", x2)
      .attr("y2", y2)
      .style("stroke", getCSSColor('--radar-grid', '#cccccc'))
      .style("stroke-width", 1)
      .style("stroke-dasharray", "2,2");
      
    // Hide immediately if animating
    if (shouldAnimate) {
      divider.style("opacity", 0);
    }
  }
}

/**
 * Legacy 4-quadrant segment drawing
 */
function drawLegacyQuadrantSegments(grid, rings, shouldAnimate = false) {
  // Quadrant 0 (bottom-right)
  for (let i = 0; i < rings.length; i++) {
    const segment = grid
      .append("path")
      .attr(
        "d",
        "M60 60 0" +
          (rings[i].radius * QUADRANTS[0].factor_x + 60) +
          " 60" +
          "A" +
          rings[i].radius +
          " " +
          rings[i].radius +
          " 0 0 1 " +
          "60 " +
          (rings[i].radius * QUADRANTS[0].factor_y + 60) +
          "Z",
      )
      .style("fill", "none")
      .style("stroke", getCSSColor('--radar-grid', '#cccccc'))
      .style("stroke-width", 1)
  .attr("class", "ring-segment circle legacy-quadrant-0");
      
    // Hide immediately if animating
    if (shouldAnimate) {
      segment.style("opacity", 0);
    }
  }

  // Quadrant 1 (bottom-left)
  for (let i = 0; i < rings.length; i++) {
    const segment = grid
      .append("path")
      .attr(
        "d",
        "M0 60 0 " +
          (rings[i].radius * QUADRANTS[1].factor_y + 60) +
          "A" +
          rings[i].radius +
          " " +
          rings[i].radius +
          " 0 0 1 " +
          rings[i].radius * QUADRANTS[1].factor_x +
          " 60Z",
      )
      .style("fill", "none")
      .style("stroke", getCSSColor('--radar-grid', '#cccccc'))
      .style("stroke-width", 1)
  .attr("class", "ring-segment circle legacy-quadrant-1");
      
    // Hide immediately if animating
    if (shouldAnimate) {
      segment.style("opacity", 0);
    }
  }

  // Quadrant 2 (top-left)
  for (let i = 0; i < rings.length; i++) {
    const segment = grid
      .append("path")
      .attr(
        "d",
        "M0 0 " +
          rings[i].radius * QUADRANTS[2].factor_x +
          " 0" +
          "A" +
          rings[i].radius +
          " " +
          rings[i].radius +
          " 0 0 1 " +
          "0 " +
          rings[i].radius * QUADRANTS[2].factor_y +
          "Z",
      )
      .style("fill", "none")
      .style("stroke", getCSSColor('--radar-grid', '#cccccc'))
      .style("stroke-width", 1)
  .attr("class", "ring-segment circle legacy-quadrant-2");
      
    // Hide immediately if animating
    if (shouldAnimate) {
      segment.style("opacity", 0);
    }
  }

  // Quadrant 3 (top-right)
  for (let i = 0; i < rings.length; i++) {
    const segment = grid
      .append("path")
      .attr(
        "d",
        "M60 0 60 " +
          rings[i].radius * QUADRANTS[3].factor_y +
          "A" +
          rings[i].radius +
          " " +
          rings[i].radius +
          " 0 0 1 " +
          (rings[i].radius * QUADRANTS[3].factor_x + 60) +
          " 0Z",
      )
      .style("fill", "none")
      .style("stroke", getCSSColor('--radar-grid', '#cccccc'))
      .style("stroke-width", 1)
  .attr("class", "ring-segment circle legacy-quadrant-3");
      
    // Hide immediately if animating
    if (shouldAnimate) {
      segment.style("opacity", 0);
    }
  }
}

/**
 * Add lifecycle labels and interactions to the grid
 */
function addLifecycleLabels(grid, rings, config, navigationFunctions, showLifecycleDescription, hideBubble, hoverLifecycle, leaveLifecycle, shouldAnimate = false) {
  // Extract lifecycle IDs from config
  const lifecycleIds = config.rings.map(ring => ring.lifecycleId || ring.id || -(ring.index + 1));

  // Left side lifecycle labels
  for (let i = 0; i < config.rings.length; i++) {
    let ringX;
    if (i === 0) {
      ringX = -(rings[i].radius / 2);
    } else {
      ringX = -(rings[i].radius - (rings[i].radius - rings[i - 1].radius) / 2);
    }

    const leftLabel = grid
      .append("text")
      .text(i + 1)
      .attr("data-test-id", config.rings[i].name + "2")
      .attr("id", config.rings[i].name + "2")
      .attr("x", ringX)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("class", "lifecycle-label")
      .style("fill", getCSSColor('--radar-text', '#34495e'))
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("user-select", "none")
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this)
          .transition()
          .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
          .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
          .style("fill", getCSSColor('--brand-accent', '#015365'))
          .style("font-weight", "bold")
          .style("text-shadow", getCSSColor('--app-text-shadow-accent', '0 1px 3px rgba(1, 83, 101, 0.3)'));
        hoverLifecycle(i);
        showLifecycleDescription(
          config.rings[i].name,
          config.rings[i].description,
          40,
          ringX,
        );
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
          .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
          .style("fill", getCSSColor('--radar-text', '#34495e'))
          .style("font-weight", "bold")
          .style("text-shadow", getCSSColor('--app-text-shadow-none', 'none'));
        hideBubble();
        leaveLifecycle();
      })
      .on("click", () => navigationFunctions.onLifecycleClick(lifecycleIds[i]));
      
    // Hide immediately if animating
    if (shouldAnimate) {
      leftLabel.style("opacity", 0).attr("transform", "translate(0, 10)");
    }
  }

  // Right side lifecycle labels
  for (let i = 0; i < config.rings.length; i++) {
    let ringX;
    if (i === 0) {
      ringX = rings[i].radius / 2 + 60;
    } else {
      ringX = rings[i].radius - (rings[i].radius - rings[i - 1].radius) / 2 + 60;
    }

    const rightLabel = grid
      .append("text")
      .text(i + 1)
      .attr("data-test-id", config.rings[i].name)
      .attr("id", config.rings[i].name)
      .attr("x", ringX)
      .attr("y", 40)
      .attr("text-anchor", "middle")
      .attr("class", "lifecycle-label")
      .style("fill", getCSSColor('--radar-text', '#34495e'))
      .style("font-size", "18px")
      .style("font-weight", "bold")
      .style("user-select", "none")
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this)
          .transition()
          .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
          .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
          .style("fill", getCSSColor('--brand-accent', '#015365'))
          .style("font-weight", "bold")
          .style("text-shadow", getCSSColor('--app-text-shadow-accent', '0 1px 3px rgba(1, 83, 101, 0.3)'));
        hoverLifecycle(i);
        showLifecycleDescription(
          config.rings[i].name,
          config.rings[i].description,
          40,
          ringX,
        );
      })
      .on("mouseleave", function () {
        d3.select(this)
          .transition()
          .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
          .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
          .style("fill", getCSSColor('--radar-text', '#34495e'))
          .style("font-weight", "bold")
          .style("text-shadow", getCSSColor('--app-text-shadow-none', 'none'));
        hideBubble();
        leaveLifecycle();
      })
      .on("click", () => navigationFunctions.onLifecycleClick(lifecycleIds[i]));
      
    // Hide immediately if animating
    if (shouldAnimate) {
      rightLabel.style("opacity", 0).attr("transform", "translate(0, 10)");
    }
  }
}
