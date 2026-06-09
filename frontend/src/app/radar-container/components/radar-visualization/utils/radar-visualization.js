/**
 * Unified Radar Visualization with Slice Detail Support
 * Enhanced to support dynamic sector counts, slice detail views, and robust error handling
 * Combines radar.js and radar-category.js with slice detail functionality
 */

import {
  loadMarkedLibrary,
  getRadarThemeColors
} from './radar-visualization-utils.js';
import { processRadarEntries, validateEntries, removeOldDrawing } from './radar-data-processing.js';
import { initializeSVG, createRadarGrid } from './radar-svg-setup.js';
import { createRadarLegend } from './radar-legend.js';
import { createTooltipSystem } from './radar-tooltip.js';
import { createRadarBlips } from './radar-blips.js';
import SliceDetailManager from './radar-slice-detail.js';
import { RadarStartupAnimator, AnimationUtils, AnimationPerformance } from './radar-animations.js';

/**
 * Main unified radar visualization function with slice detail support
 * Handles radar visualization with dynamic sector support and startup animations
 * @param {Array} rings - Ring definitions with calculated radii
 * @param {number} techradius - Technology blip radius
 * @param {Object} config - Radar configuration with dynamic sector support
 * @param {Object} navigationFunctions - Navigation event handlers
 * @param {Object} fetchDataFunctions - Data fetching functions
 * @param {Object} settings - Display settings
 * @param {boolean} enableStartupAnimation - Whether to play startup animation
 * @returns {Object} - Visualization instance with cleanup capabilities
 */
export function unified_radar_visualization(
  rings,
  techradius,
  config,
  navigationFunctions,
  fetchDataFunctions,
  settings,
  enableStartupAnimation = true
) {
  try {
    //Phase 1: Cleanup and validation
    removeOldDrawing();
    loadMarkedLibrary();

    // Check animation preferences and filter change status
    const shouldAnimate = enableStartupAnimation && !AnimationUtils.shouldReduceMotion();
    const isFilterChange = settings.isFilterChange || false;
    const useBlipOnlyAnimation = settings.useBlipOnlyAnimation || false;

    // Validate configuration
    const validationResult = validateConfiguration(config, rings);
    if (!validationResult.isValid) {
      throw new Error(`Configuration validation failed: ${validationResult.errors.join(', ')}`);
    }

    //Phase 2: Process data using extracted functions with validation
    const sectorCount = config.quadrants?.length || 4;
    const entryValidation = validateEntries(config.entries, sectorCount, rings.length);

    if (!entryValidation.isValid) {
      // Use valid entries only
      config.entries = entryValidation.validEntries;
    }

    const { processedEntries, segmented, sectorCount: actualSectorCount, ringCount } = processRadarEntries(config, rings);

    //Phase 3: SVG setup using extracted functions
    const { svg, radar, lineGroup } = initializeSVG(config, shouldAnimate);

    //Phase 4: Initialize slice detail manager
    const sliceManager = new SliceDetailManager(svg, radar, config);

    // Phase 5: Create tooltip system before other components need it
    const tooltipSystem = createTooltipSystem(radar, config);

    //Phase 6: Create legend system with slice detail support
    const legendSystem = createRadarLegend(radar, rings, config, navigationFunctions, sliceManager, shouldAnimate);

    //Phase 7: Initialize startup animator before creating elements (only for full startup animations)
    const startupAnimator = (shouldAnimate && !isFilterChange) ? new RadarStartupAnimator(svg, radar, config) : null;

    //Phase 8: Grid and rings using extracted functions with dynamic support
    createRadarGrid(
      radar,
      rings,
      config,
      navigationFunctions,
      tooltipSystem.showLifecycleDescription,
      tooltipSystem.hideBubble,
      legendSystem.hoverLifecycle,
      legendSystem.leaveLifecycle,
      shouldAnimate && !isFilterChange // Skip grid animation for filter changes
    );

    //Phase 9: Blips and interactions using extracted functions
    const blipSystem = createRadarBlips(
      radar,
      config,
      navigationFunctions,
      fetchDataFunctions,
      settings,
      tooltipSystem,
      techradius,
      useBlipOnlyAnimation ? 'filter' : (shouldAnimate ? 'startup' : 'none')
    );

    //Phase 10: Execute startup animation if enabled (skip for filter changes)
    if (shouldAnimate && !isFilterChange) {
      AnimationPerformance.start();

      // Start animation immediately after elements are created
      requestAnimationFrame(() => {
        if (startupAnimator) {
          startupAnimator.animateStartup()
            .then(() => {
              AnimationPerformance.end('Radar startup animation');
            })
            .catch(err => {
              console.warn('Animation error:', err);
            });
        }
      });
    }
    // Note: Filter animations are handled within the blip system itself

    //Phase 11: Setup global event handlers for enhanced UX and slice detail support
    setupGlobalEventHandlers(svg, blipSystem, tooltipSystem, sliceManager);

    //Phase 12: Setup slice detail event listeners
    setupSliceDetailEventListeners(svg, sliceManager, legendSystem);

    return {
      svg,
      radar,
      tooltipSystem,
      legendSystem,
      blipSystem,
      sliceManager,
      startupAnimator,
      config: {
        ...config,
        actualSectorCount,
        ringCount
      },
      cleanup: () => cleanup(blipSystem, tooltipSystem, sliceManager, startupAnimator),
      // Export enhanced simulation control
      simulation: blipSystem.simulation,
      // Export data for external use
      processedData: {
        entries: processedEntries,
        segmented,
        validation: entryValidation
      },
      // Enhanced slice detail API
      sliceDetail: {
        enter: (sliceIndex, sliceData) => sliceManager.enterSliceDetail(sliceIndex, sliceData),
        exit: () => sliceManager.exitSliceDetail(),
        toggle: (sliceIndex, sliceData) => sliceManager.toggleSliceDetail(sliceIndex, sliceData),
        isActive: () => sliceManager.isInDetailMode(),
        getCurrentSlice: () => sliceManager.getCurrentSlice()
      },
      // Animation control API
      animation: {
        isAnimating: () => startupAnimator?.isAnimating || false,
        cancel: () => startupAnimator?.cancelAnimations(),
        restart: () => shouldAnimate && startupAnimator?.animateStartup()
      },
      // Theme color update API - updates colors without re-render
      updateColors: () => updateRadarColors(svg, radar, config, rings)
    };

  } catch (error) {
    // Cleanup on error
    removeOldDrawing();

    // Return minimal error state
    return {
      error: error.message,
      isValid: false,
      cleanup: () => removeOldDrawing(),
      sliceDetail: {
        enter: () => {},
        exit: () => {},
        toggle: () => {},
        isActive: () => false,
        getCurrentSlice: () => null
      },
      animation: {
        isAnimating: () => false,
        cancel: () => {},
        restart: () => {}
      }
    };
  }
}


/**
 * Validate radar configuration
 * @param {Object} config - Radar configuration
 * @param {Array} rings - Ring definitions
 * @returns {Object} - Validation result
 */
function validateConfiguration(config, rings) {
  const errors = [];

  if (!config.svgId) {
    errors.push('Missing svgId in configuration');
  }

  if (!config.width || config.width <= 0) {
    errors.push('Invalid width in configuration');
  }

  if (!config.height || config.height <= 0) {
    errors.push('Invalid height in configuration');
  }

  if (!Array.isArray(rings) || rings.length === 0) {
    errors.push('Invalid or empty rings array');
  }

  if (!Array.isArray(config.entries)) {
    errors.push('Invalid entries array in configuration');
  }

  if (!config.quadrants || !Array.isArray(config.quadrants)) {
    errors.push('Invalid quadrants array in configuration');
  }

  // Validate rings have required properties
  rings.forEach((ring, index) => {
    if (typeof ring.radius !== 'number' || ring.radius <= 0) {
      errors.push(`Ring ${index} has invalid radius`);
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Setup global event handlers
 * @param {Object} svg - SVG element
 * @param {Object} blipSystem - Blip system
 * @param {Object} tooltipSystem - Tooltip system
 * @param {SliceDetailManager} sliceManager - Slice detail manager
 */
function setupGlobalEventHandlers(svg, blipSystem, tooltipSystem, sliceManager) {
  // Remove tabindex and focus capabilities from SVG to prevent unwanted focus
  svg.attr("tabindex", null)
     .style("outline", "none");

  // Hide tooltips when clicking outside - but only on the background
  svg.on("click", function(event) {
    // Only hide tooltip if clicking on the SVG background itself, not child elements
    if (event.target === svg.node()) {
      tooltipSystem.hideBubble();
      blipSystem.removeLinesAndHighlight();
    }
  });
}

/**
 * Setup slice detail event listeners
 * @param {Object} svg - SVG element
 * @param {SliceDetailManager} sliceManager - Slice detail manager
 * @param {Object} legendSystem - Legend system
 */
function setupSliceDetailEventListeners(svg, sliceManager, legendSystem) {
  // Slice detail functionality is handled within the slice detail manager
  // This function exists for future slice-specific event handling if needed
}

/** * Setup slice detail event listeners
 * @param {Object} blipSystem - Blip system
 * @param {Object} tooltipSystem - Tooltip system
 * @param {SliceDetailManager} sliceManager - Slice detail manager
 * @param {RadarStartupAnimator} startupAnimator - Startup animator
 */
function cleanup(blipSystem, tooltipSystem, sliceManager, startupAnimator) {
  try {
    // Cancel any ongoing animations first
    if (startupAnimator) {
      startupAnimator.cancelAnimations();
    }

    // Cleanup slice detail manager first
    if (sliceManager && sliceManager.destroy) {
      sliceManager.destroy();
    }

    // Cleanup blip system
    if (blipSystem && blipSystem.cleanup) {
      blipSystem.cleanup();
    }

    // Cleanup tooltip system
    if (tooltipSystem && tooltipSystem.cleanup) {
      tooltipSystem.cleanup();
    }

    // Remove all radar elements
    removeOldDrawing();
  } catch (error) {
    // Silent cleanup failure
  }
}

/**
 * Update radar colors dynamically without re-render
 * Called when theme changes to apply new colors to existing SVG elements
 * @param {Object} svg - D3 SVG selection
 * @param {Object} radar - D3 radar group selection
 * @param {Object} config - Radar configuration
 * @param {Array} rings - Ring definitions
 */
function updateRadarColors(svg, radar, config, rings) {
  if (!svg || !radar) {
    return;
  }

  try {
    // Get fresh colors from CSS custom properties
    const colors = getRadarThemeColors();

    // Update SVG background
    svg.style('background-color', colors.background);

    // Update config colors for consistency
    if (config && config.colors) {
      config.colors.background = colors.background;
      config.colors.grid = colors.grid;
      config.colors.inactive = colors.inactive;
    }

    // Update grid lines and ring segments
    radar.selectAll('.ring-segment, .circle')
      .style('stroke', colors.grid);

    radar.selectAll('.sector-divider')
      .style('stroke', colors.grid);

    // Update lifecycle labels text color (lifecycle labels ARE text elements, not containers)
    radar.selectAll('.lifecycle-label')
      .style('fill', colors.text);

    radar.selectAll('.lifecycle-label-bg')
      .style('fill', colors.surface)
      .style('stroke', colors.borderColor);

    // Update legend text colors
    radar.selectAll('.legend-entry text')
      .style('fill', colors.textPrimary);

    radar.selectAll('.legend-ring-label')
      .style('fill', colors.textPrimary);

    // Update sector titles (legend text)
    radar.selectAll('.sector-title')
      .style('fill', colors.textPrimary);

    // Update category labels (if using hardcoded colors)
    radar.selectAll('.category-label')
      .style('fill', colors.brandPrimary);

    // Legend background already uses CSS classes, but update if inline styles exist
    radar.selectAll('.radar-legend')
      .style('background-color', colors.surface);

    // Update tooltip colors
    radar.selectAll('#bubble rect')
      .style('fill', colors.surface)
      .style('stroke', colors.borderColor);

    radar.selectAll('#title-text')
      .style('fill', colors.textPrimary);

    radar.selectAll('#description-text')
      .style('fill', colors.textSecondary);

    radar.selectAll('#score-background')
      .style('fill', colors.surface);

    radar.selectAll('#score-text')
      .style('fill', colors.textPrimary);

  } catch (error) {
    console.warn('Failed to update radar colors:', error);
  }
}

// Export legacy compatibility function
export function radar_visualization(rings, techradius, config, navigationFunctions, fetchDataFunctions, toggle, toggle2) {
  return unified_radar_visualization(
    rings, 
    techradius, 
    config, 
    navigationFunctions, 
    fetchDataFunctions, 
    { toggle, toggle2, iconDisplay: !toggle2 }, // Convert legacy params
    true // Enable animations by default for legacy compatibility
  );
}

// Re-export utility functions for external use (avoid duplication)
export {
  generateDynamicQuadrants,
  generateDynamicLegendOffsets,
  polar,
  cartesian,
  bounded_interval,
  bounded_ring,
  bounded_box,
  translate,
  viewbox,
  SeededRandom,
  getSectorLabelPosition
} from './radar-visualization-utils.js';
