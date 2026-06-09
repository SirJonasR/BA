/**
 * Radar legend with sector labels and hover effects
 */

import * as d3 from "d3";
import {
  QUADRANTS,
  LEGEND_OFFSET,
  generateDynamicLegendOffsets,
  translate,
  getCSSColor
} from './radar-visualization-utils.js';
import { handleSectorClick } from './radar-slice-detail.js';
import { RADAR_ANIMATION_CONFIG, AnimationUtils } from './radar-animations.js';

/**
 * Create radar legend with sector labels and interactions
 */
export function createRadarLegend(radar, rings, config, navigationFunctions, sliceManager = null, shouldAnimate = false) {
  const legend = radar.append("g").attr("class", "radar-legend");

  const sectorCount = config.quadrants?.length || 4;
  const isLegacyFourQuadrant = sectorCount === 4;

  const legendOffsets = isLegacyFourQuadrant
    ? LEGEND_OFFSET
    : generateDynamicLegendOffsets(sectorCount);

  for (let quadrant = 0; quadrant < sectorCount; quadrant++) {
    const category = config.quadrants[quadrant];
    if (!category) continue;

    const offset = legendOffsets[quadrant] || { x: 0, y: 0 };

    const sectorGroup = legend
      .append("g")
      .attr("class", `sector-label-group sector-${quadrant}`)
      .attr("transform", translate(offset.x, offset.y - 45))
      .style("cursor", "pointer");

    // Hide immediately if animating
    if (shouldAnimate) {
      sectorGroup
        .style("opacity", 0)
        .attr("transform", translate(offset.x, offset.y - 45) + " scale(0.3)");
    }

    // Main sector title
    const sectorTitle = sectorGroup
      .append("text")
      .attr("class", "sector-title")
      .attr("data-test-id", category.name)
      .attr("data-sector", quadrant)
      .attr("id", category.categoryId || category.id)
      .text("➔  " + category.name)
      .style("font-weight", "bold")
      .style("fill", getCSSColor('--app-text-primary', '#2c3e50'))
      .style("font-size", "20px");

    // Add slice detail indicator for better UX - CURRENTLY DISABLED
    // if (sliceManager) {
    //   sectorGroup
    //     .append("text")
    //     .attr("class", "slice-detail-hint")
    //     .attr("x", 0)
    //     .attr("y", 20)
    //     .text("(Detail)")
    //     .style("font-size", "14px")
    //     .style("fill", "#666")
    //     .style("opacity", 0);
    // }

    // Click handler - Navigate to feature request page for zoom functionality
    sectorGroup
      .on("click", function(event) {
        event.stopPropagation();

        // TEMPORARY: Navigate to maintenance page since zoom functionality is under development
        console.log('Radar sector clicked - redirecting to maintenance page');
        if (navigationFunctions && navigationFunctions.onMaintenanceClick) {
          navigationFunctions.onMaintenanceClick();
        } else {
          window.location.href = '/maintenance';
        }

        // ORIGINAL FUNCTIONALITY (to be re-enabled when zoom is implemented):
        /*
        if (sliceManager) {
          handleSectorClick(radar, quadrant, config, navigationFunctions, sliceManager);
        } else {
          if (navigationFunctions.onCategoryClick) {
            navigationFunctions.onCategoryClick(category.categoryId || category.id);
          } else if (navigationFunctions.onQuadrantClick) {
            navigationFunctions.onQuadrantClick(quadrant);
          }
        }
        */
      })
      .on("mouseover", function () {
        // Smooth growing animation for sector title with enhanced colors
        d3.select(this).select(".sector-title")
          .transition()
          .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
          .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
          .style("fill", getCSSColor('--brand-primary', '#e96e3a'))
          .style("font-size", "22px")
          .style("text-shadow", getCSSColor('--app-text-shadow-primary', '0 2px 4px rgba(233, 110, 58, 0.3)'));

        // CURRENTLY DISABLED - Detail hint functionality out of use
        // if (sliceManager) {
        //   d3.select(this).select(".slice-detail-hint")
        //     .transition()
        //     .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
        //     .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
        //     .style("opacity", 1)
        //     .style("fill", getCSSColor('--brand-accent', '#015365'))
        //     .style("font-weight", "600");
        // }

        hoverCategory(quadrant, rings, radar, config);
      })
      .on("mouseleave", function () {
        // Smooth shrinking animation for sector title
        d3.select(this).select(".sector-title")
          .transition()
          .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
          .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
          .style("fill", getCSSColor('--app-text-primary', '#2c3e50'))
          .style("font-size", "20px")
          .style("text-shadow", getCSSColor('--app-text-shadow-none', 'none'));

        // CURRENTLY DISABLED - Detail hint functionality out of use
        // if (sliceManager) {
        //   d3.select(this).select(".slice-detail-hint")
        //     .transition()
        //     .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
        //     .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
        //     .style("opacity", 0)
        //     .style("fill", getCSSColor('--app-text-secondary', '#7f8c8d'))
        //     .style("font-weight", "normal");
        // }

        leaveCategory();
      });
  }

  return {
    legend,
    hoverCategory: (quadrant) => hoverCategory(quadrant, rings, radar, config),
    leaveCategory: leaveCategory,
    hoverLifecycle: (i) => hoverLifecycle(i, rings, radar, config),
    leaveLifecycle: leaveLifecycle,
    updateForSliceMode: (isSliceMode, currentSlice) => updateLegendForSliceMode(legend, isSliceMode, currentSlice),
    highlightSlice: (sliceIndex) => highlightSliceInLegend(legend, sliceIndex),
    resetHighlight: () => resetLegendHighlight(legend)
  };
}

/**
 * Position technology blips within segments
 */
export function blipSegmentTransform(quadrant, ring, index = null, sectorCount = 4) {
  let dx = ring < 2 ? 0 : 120;
  let dy = index == null ? -16 : index * 12;
  if (ring % 2 === 1) {
    dy = dy + 36;
  }

  const safeQuadrant = Math.max(0, Math.min(quadrant, sectorCount - 1));

  const legendOffsets = sectorCount === 4
    ? LEGEND_OFFSET
    : generateDynamicLegendOffsets(sectorCount);

  const offset = legendOffsets[safeQuadrant] || { x: 0, y: 0 };

  const scaleFactor = sectorCount === 4 ? 1 : Math.max(0.8, 4 / sectorCount);

  return translate(
    offset.x * scaleFactor + dx,
    offset.y * scaleFactor + dy,
  );
}/**
 * Highlight lifecycle ring on hover
 */
function hoverLifecycle(i, rings, radar, config) {
  const grid = radar.select("g");
  const hoverColor = config.colors.categoryHover || getCSSColor('--radar-category-hover', '#0073e6');
  const colors = [hoverColor, hoverColor, hoverColor, hoverColor];

  drawRingSegment(grid, rings[i], QUADRANTS[0], colors[i]);
  drawRingSegment(grid, rings[i], QUADRANTS[1], colors[i]);
  drawRingSegment(grid, rings[i], QUADRANTS[2], colors[i]);
  drawRingSegment(grid, rings[i], QUADRANTS[3], colors[i]);
}

/**
 * Remove lifecycle hover effects
 */
function leaveLifecycle() {
  d3.selectAll("#ring").style("opacity", 0);
}

/**
 * Highlight category quadrant on hover
 */
function hoverCategory(quadrant, rings, radar, config) {
  const grid = radar.select("g");
  const outerRing = rings[3];
  const hoverColor = config.colors.categoryHover || getCSSColor('--radar-category-hover', '#0073e6');

  if (quadrant === 0) {
    grid
      .append("path")
      .attr("id", "ringCategory")
      .attr(
        "d",
        "M60 60 0" +
          (outerRing.radius * QUADRANTS[0].factor_x + 60) +
          " 60" +
          "A" +
          outerRing.radius +
          " " +
          outerRing.radius +
          " 0 0 1 " +
          "60 " +
          (outerRing.radius * QUADRANTS[0].factor_y + 60) +
          "Z",
      )
      .style("fill", "none")
      .style("stroke", hoverColor)
      .style("stroke-width", 3);
  } else if (quadrant === 1) {
    grid
      .append("path")
      .attr("id", "ringCategory")
      .attr(
        "d",
        "M0 60 0 " +
          (outerRing.radius * QUADRANTS[1].factor_y + 60) +
          "A" +
          outerRing.radius +
          " " +
          outerRing.radius +
          " 0 0 1 " +
          outerRing.radius * QUADRANTS[1].factor_x +
          " 60Z",
      )
      .style("fill", "none")
      .style("stroke", hoverColor)
      .style("stroke-width", 3);
  } else if (quadrant === 2) {
    grid
      .append("path")
      .attr("id", "ringCategory")
      .attr(
        "d",
        "M0 0 " +
          outerRing.radius * QUADRANTS[2].factor_x +
          " 0" +
          "A" +
          outerRing.radius +
          " " +
          outerRing.radius +
          " 0 0 1 " +
          "0 " +
          outerRing.radius * QUADRANTS[2].factor_y +
          "Z",
      )
      .style("fill", "none")
      .style("stroke", hoverColor)
      .style("stroke-width", 3);
  } else if (quadrant === 3) {
    grid
      .append("path")
      .attr("id", "ringCategory")
      .attr(
        "d",
        "M60 0 60 " +
          outerRing.radius * QUADRANTS[3].factor_y +
          "A" +
          outerRing.radius +
          " " +
          outerRing.radius +
          " 0 0 1 " +
          (outerRing.radius * QUADRANTS[3].factor_x + 60) +
          " 0Z",
      )
      .style("fill", "none")
      .style("stroke", hoverColor)
      .style("stroke-width", 3);
  }
}

/**
 * Remove category hover effects
 */
function leaveCategory() {
  d3.selectAll("#ringCategory").style("opacity", 0);
}

/**
 * Draw ring segment for quadrant
 */
function drawRingSegment(grid, ring, quadrant, color) {
  let pathData;

  if (quadrant === QUADRANTS[0]) { // bottom-right
    pathData = "M60 60 0" +
      (ring.radius * quadrant.factor_x + 60) +
      " 60" +
      "A" +
      ring.radius +
      " " +
      ring.radius +
      " 0 0 1 " +
      "60 " +
      (ring.radius * quadrant.factor_y + 60) +
      "Z";
  } else if (quadrant === QUADRANTS[1]) { // bottom-left
    pathData = "M0 60 0 " +
      (ring.radius * quadrant.factor_y + 60) +
      "A" +
      ring.radius +
      " " +
      ring.radius +
      " 0 0 1 " +
      ring.radius * quadrant.factor_x +
      " 60Z";
  } else if (quadrant === QUADRANTS[2]) { // top-left
    pathData = "M0 0 " +
      ring.radius * quadrant.factor_x +
      " 0" +
      "A" +
      ring.radius +
      " " +
      ring.radius +
      " 0 0 1 " +
      "0 " +
      ring.radius * quadrant.factor_y +
      "Z";
  } else if (quadrant === QUADRANTS[3]) { // top-right
    pathData = "M60 0 60 " +
      ring.radius * quadrant.factor_y +
      "A" +
      ring.radius +
      " " +
      ring.radius +
      " 0 0 1 " +
      (ring.radius * quadrant.factor_x + 60) +
      " 0Z";
  }

  grid
    .append("path")
    .attr("id", "ring")
    .attr("d", pathData)
    .style("fill", "none")
    .style("stroke", color)
    .style("stroke-width", 2)
    .style("pointer-events", "none"); // Ensure ring highlights don't interfere with tooltips
}

/**
 * Update legend for slice detail mode
 */
function updateLegendForSliceMode(legend, isSliceMode, currentSlice = null) {
  if (isSliceMode && currentSlice !== null) {
    legend.selectAll('.sector-label-group')
      .style('opacity', function() {
        const sector = parseInt(d3.select(this).attr('data-sector') || d3.select(this).select('.sector-title').attr('data-sector'));
        return sector === currentSlice ? 1 : 0.3;
      })
      .style('pointer-events', function() {
        const sector = parseInt(d3.select(this).attr('data-sector') || d3.select(this).select('.sector-title').attr('data-sector'));
        return sector === currentSlice ? 'all' : 'none';
      });
  } else {
    legend.selectAll('.sector-label-group')
      .style('opacity', 1)
      .style('pointer-events', 'all');
  }
}

/**
 * Highlight slice in legend
 */
function highlightSliceInLegend(legend, sliceIndex) {
  legend.selectAll('.sector-label-group')
    .classed('highlighted', function() {
      const sector = parseInt(d3.select(this).attr('data-sector') || d3.select(this).select('.sector-title').attr('data-sector'));
      return sector === sliceIndex;
    });
}

/**
 * Reset legend highlighting
 */
function resetLegendHighlight(legend) {
  legend.selectAll('.sector-label-group')
    .classed('highlighted', false);
}
