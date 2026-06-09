/**
 * Radar blip rendering with interactions and force simulation
 * Data access via RadarDataService through fetchDataFunctions parameter
 */

import * as d3 from "d3";
import { generateDynamicQuadrants, createSegment, translate } from './radar-visualization-utils.js';
import { BlipAnimationManager, AnimationUtils, AnimationPerformance, RADAR_ANIMATION_CONFIG } from './radar-animations.js';

/**
 * Create radar blips with enhanced startup animations and force simulation
 */
export function createRadarBlips(radar, config, navigationFunctions, fetchDataFunctions, settings, tooltipSystem, techradius, animationType = 'none') {
  const rink = radar.append("g").attr("id", "rink");

  // Determine animation behavior based on type
  const enableStartupAnimation = animationType === 'startup';
  const enableFilterAnimation = animationType === 'filter';
  const shouldHideBlipsInitially = enableStartupAnimation;

  const sectorCount = config.quadrants?.length || 4;
  const dynamicQuadrants = sectorCount !== 4 ? generateDynamicQuadrants(sectorCount) : null;

  // Initialize blip animation manager
  const blipAnimator = new BlipAnimationManager(rink, config);

  const blips = rink
    .selectAll(".blip")
    .data(config.entries)
    .enter()
    .append("g")
    .attr("class", "blip")
    .attr("transform", d => translate(d.x || 0, d.y || 0))
    .style("cursor", "pointer");

    // If animating startup, hide blips immediately upon creation
  if (shouldHideBlipsInitially) {
    blips
      .style("opacity", 0)
      .each(function(d, i) {
        // Position elements but keep them hidden for startup animation
        const blip = d3.select(this);
        blip.attr("transform", translate(d.x || 0, d.y || 0));
      });
  } else if (enableFilterAnimation) {
    // For filter animations, start hidden and let the animation system handle the reveal
    blips.style("opacity", 0);
  }

  blips.on("mouseenter", (event, d) => {
      tooltipSystem.hideBubble();
      removeLinesAndHighlight(rink);

      setTimeout(() => {
        drawConnectedLinesAndHighlight(d, rink, config.entries, techradius);
        tooltipSystem.showBubble(d);

        // Enhanced hover effect with modern styling
        const blipElement = d3.select(event.currentTarget);

        // Main circle enhancement
        blipElement.select(".blip-main-circle")
          .transition()
          .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
          .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
          .style("stroke", "#e96e3a") // Eviden brand color
          .style("stroke-width", 4)
          .style("filter", "drop-shadow(0 4px 12px rgba(233, 110, 58, 0.4))")
          .attr("r", techradius * 1.15); // Slight size increase for impact

        // Add pulsing outer ring for enhanced visual feedback
        blipElement.append("circle")
          .attr("class", "hover-pulse-ring")
          .attr("r", techradius)
          .style("fill", "none")
          .style("stroke", "#e96e3a")
          .style("stroke-width", 2)
          .style("opacity", 0)
          .transition()
          .duration(600)
          .ease(d3.easeQuadOut)
          .attr("r", techradius * 1.8)
          .style("opacity", 0.6)
          .transition()
          .duration(400)
          .style("opacity", 0);
      }, 10);
    })
    .on("mouseleave", (event, d) => {
      tooltipSystem.hideBubble();
      removeLinesAndHighlight(rink);

      const blipElement = d3.select(event.currentTarget);

      // Reset main circle
      blipElement.select(".blip-main-circle")
        .transition()
        .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.hoverDuration))
        .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
        .style("stroke", "none")
        .style("filter", "none")
        .attr("r", techradius);

      // Remove pulse ring
      blipElement.selectAll(".hover-pulse-ring").remove();
    });

  blips.each(function(d) {
    const blip = d3.select(this);

    blip
      .on("click", (event) => {
        event.stopPropagation();

        // Use technologyId for navigation, fallback to parsed id
        const techId = d.technologyId || parseInt(d.id, 10);

        if (!isNaN(techId) && techId !== 0) {
          if (navigationFunctions.onTechnologyClick) {
            navigationFunctions.onTechnologyClick(techId);
          } else {
            console.error('navigationFunctions.onTechnologyClick is not defined');
          }
        } else {
          console.warn('Invalid or missing technology ID for navigation:', {
            technologyId: d.technologyId,
            id: d.id,
            label: d.label
          });
        }
      })
      .attr("data-test-id", d.testId);

    addStatusIndicator(blip, d, config, techradius, sectorCount);

    blip
      .append("circle")
      .attr("r", techradius)
      .attr("fill", d.technologyPictureId ? "#e0e0e0" : d.color)
      .attr("stroke", "none")
      .attr("class", "blip-main-circle")
      .style("pointer-events", "all");

    addBlipContent(blip, d, settings, fetchDataFunctions, techradius);
  });

  const simulation = d3.forceSimulation()
    .nodes(config.entries)
    .velocityDecay(0.19)
    .force(
      "collision",
      d3.forceCollide()
        .radius(techradius + 2)
        .strength(0.85),
    )
    .force(
      "containment",
      createContainmentForce(config.entries, dynamicQuadrants, config.rings || [])
    )
    .on("tick", () => ticked(blips, sectorCount, dynamicQuadrants));

  // Handle different animation types for blips (final phase)
  if (enableStartupAnimation && !AnimationUtils.shouldReduceMotion()) {
    // Listen for animation trigger from main animation system
    const blipAnimationHandler = (event) => {
      const callback = event.detail?.callback;
      blipAnimator.animateBlipsEntrance(blips, callback);
      document.removeEventListener('startBlipAnimations', blipAnimationHandler);
    };
    document.addEventListener('startBlipAnimations', blipAnimationHandler);

    // Fallback timeout in case event doesn't fire
    setTimeout(() => {
      document.removeEventListener('startBlipAnimations', blipAnimationHandler);
      blipAnimator.animateBlipsEntrance(blips);
    }, 2000); // Increased timeout to account for new timing
  } else if (enableFilterAnimation && !AnimationUtils.shouldReduceMotion()) {
    // For filter changes, use specialized filter animation for blips only
    setTimeout(() => {
      blipAnimator.filterChangeAnimation(blips);
    }, 10); // Minimal delay for DOM readiness
  } else {
    // No animation - immediate appearance
    blips.style("opacity", 1);
  }

  return {
    blips,
    rink,
    simulation,
    blipAnimator,
    drawConnectedLinesAndHighlight: (d) => drawConnectedLinesAndHighlight(d, rink, config.entries, techradius),
    removeLinesAndHighlight: () => removeLinesAndHighlight(rink),
    cleanup: () => cleanup(simulation)
  };
}

/**
 * Keep blips within their sectors/rings
 */
function createContainmentForce(entries, dynamicQuadrants, rings) {
  return function(alpha) {
    entries.forEach(d => {
      if (d.segment && d.segment.clipx && d.segment.clipy) {
        d.x = d.segment.clipx(d);
        d.y = d.segment.clipy(d);
      }
    });
  };
}

/**
 * Add status indicator to blip based on technology status
 */
function addStatusIndicator(blip, d, config, techradius, sectorCount = 4) {
  const outerRadius = 20;
  const innerRadius = 15;
  const arcRadius = outerRadius + 5;
  const tiltAngle = -Math.PI / 4;
  const offsetX = 0;
  const offsetY = 0;

  const calcrichtung = (d, sectorCount) => {
    if (sectorCount === 4) {
      if (d.quadrant === 0) return 5;
      if (d.quadrant === 1) return 3;
      if (d.quadrant === 2) return 1;
      if (d.quadrant === 3) return 7;
    } else {
      return (d.quadrant * 8) / sectorCount;
    }
    return 0;
  };

  const calcrichtung2 = (d, sectorCount) => {
    if (sectorCount === 4) {
      if (d.quadrant === 0) return -1;
      if (d.quadrant === 1) return 1;
      if (d.quadrant === 2) return 3;
      if (d.quadrant === 3) return 5;
    } else {
      return ((d.quadrant * 8) / sectorCount) - 2;
    }
    return 0;
  };

  if (d.status === 1) {
    blip
      .append("circle")
      .attr("r", techradius)
      .attr("fill", "white")
      .attr("stroke", config.colors?.line || "#333")
      .attr("stroke-width", 5)
      .attr("class", "status-indicator status-1");
  } else if (d.status === 2) {
    const arcGenerator = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(arcRadius)
      .startAngle(-Math.PI / 4 + calcrichtung(d, sectorCount) * tiltAngle)
      .endAngle(Math.PI / 4 + calcrichtung(d, sectorCount) * tiltAngle);

    blip
      .append("path")
      .attr("d", arcGenerator())
      .attr("fill", "none")
      .attr("stroke", config.colors?.line || "#333")
      .attr("stroke-width", 2)
      .attr("class", "status-indicator status-2")
      .attr("transform", `translate(${offsetX}, ${offsetY})`);
  } else if (d.status === 3) {
    const arcGenerator = d3
      .arc()
      .innerRadius(innerRadius)
      .outerRadius(arcRadius)
      .startAngle(-Math.PI / 4 - calcrichtung2(d, sectorCount) * tiltAngle)
      .endAngle(Math.PI / 4 - calcrichtung2(d, sectorCount) * tiltAngle);

    blip
      .append("path")
      .attr("d", arcGenerator())
      .attr("fill", "none")
      .attr("stroke", config.colors?.line || "#333")
      .attr("stroke-width", 2)
      .attr("class", "status-indicator status-3")
      .attr("transform", `translate(${offsetX}, ${offsetY})`);
  }
}

/**
 * Add content to blip (icon or text initials)
 */
function addBlipContent(blip, d, settings, fetchDataFunctions, techradius) {
  if (d.technologyPictureId && settings.showIcons && fetchDataFunctions.getIconDataUrl) {
    const iconDataUrl = fetchDataFunctions.getIconDataUrl(d.technologyPictureId, settings.showIconsInColor);
    if (iconDataUrl) {
      addIconToBlip(blip, d, iconDataUrl, settings.showIconsInColor, techradius);
      return;
    }
  }
  addTextInitials(blip, d);
}

/**
 * Add icon image to blip using pre-fetched data URL
 * @param {Object} blip - D3 selection for the blip
 * @param {Object} d - Data object for the technology
 * @param {string} dataUrl - Pre-fetched data URL for the icon
 * @param showIconsInColor
 * @param techradius - Radius of blips, used to calculate size and position of icon
 */
function addIconToBlip(blip, d, dataUrl, showIconsInColor, techradius) {
  const iconRadius = techradius * 0.9;
  blip
    .append("image")
    .attr("xlink:href", dataUrl)
    .attr("width", iconRadius * 2)
    .attr("height", iconRadius * 2)
    .attr("x", -iconRadius)
    .attr("y", -iconRadius)
    .attr("class", "blip-image" + (showIconsInColor ? '' : ' grayscale'))
    .style("pointer-events", "none")
    .on("error", function() {
      // If image fails to load, remove it and add text initials
      console.warn("Failed to load icon for:", d.technologyName, "; fallback to text initials");
      d3.select(this).remove();
      addTextInitials(blip, d);
    });
}

/**
 * Add text initials to blip
 */
function addTextInitials(blip, d) {
  const blipText = getInitials(d.technologyName || 'Unknown');
  const fontSize = blipText.length > 2 ? "8px" : "18px";

  blip
    .append("text")
    .text(blipText)
    .attr("x", 0)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "central")
    .style("fill", "white")
    .style("font-size", fontSize)
    .style("font-weight", "bold")
    .style("font-family", "Arial, sans-serif")
    .style("pointer-events", "none")
    .style("user-select", "none")
    .attr("class", "blip-text");
}

/**
 * Get initials from technology name
 */
function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';

  const words = name.trim().split(/\s+/);
  const initials = words
    .filter(word => word.length > 0)
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 3);

  return initials.length > 0 ? initials.join("") : name.charAt(0).toUpperCase();
}

/**
 * Position blips within segments
 */
function ticked(blips, sectorCount = 4, dynamicQuadrants = null) {
  blips.attr("transform", function(d) {
    let x, y;

    if (d.segment && d.segment.clipx && d.segment.clipy) {
      if (sectorCount === 4 && !dynamicQuadrants) {
        if (d.quadrant === 0) {
          x = d.segment.clipx(d) + 60;
          y = d.segment.clipy(d) + 60;
        } else if (d.quadrant === 1) {
          x = d.segment.clipx(d);
          y = d.segment.clipy(d) + 60;
        } else if (d.quadrant === 2) {
          x = d.segment.clipx(d);
          y = d.segment.clipy(d);
        } else if (d.quadrant === 3) {
          x = d.segment.clipx(d) + 60;
          y = d.segment.clipy(d);
        }
      } else {
        x = d.segment.clipx(d);
        y = d.segment.clipy(d);
      }
    } else {
      console.warn('Blip missing segment data, using fallback positioning:', d.label || d.id);
      x = d.x || 0;
      y = d.y || 0;
    }

    const hoveredElement = d3.select(`#hovered${d.id.toString()}`);
    if (!hoveredElement.empty()) {
      hoveredElement
        .attr("positionX", x)
        .attr("positionY", y);
    }

    return translate(x, y);
  });
}

/**
 * Draw connection lines and highlight related technologies
 */
function drawConnectedLinesAndHighlight(d, rink, allEntries = [], techradius = 20) {
  rink.selectAll(".blip")
    .transition()
    .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.highlightDuration))
    .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
    .style("opacity", 0.3);

  const hoveredBlip = rink.selectAll(".blip").filter(function(b) {
    const hoveredTechId = d.technologyId || parseInt(d.id, 10);
    const blipTechId = b.technologyId || parseInt(b.id, 10);
    return blipTechId === hoveredTechId;
  });

  let hoveredX = d.x || 0;
  let hoveredY = d.y || 0;

  if (!hoveredBlip.empty()) {
    const transform = hoveredBlip.attr("transform");
    if (transform) {
      const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
      if (match) {
        hoveredX = parseFloat(match[1]);
        hoveredY = parseFloat(match[2]);
      }
    }
  }

  rink.selectAll(".blip").each(function(b) {
    const hoveredTechId = d.technologyId || parseInt(d.id, 10);
    const blipTechId = b.technologyId || parseInt(b.id, 10);

    if (blipTechId === hoveredTechId) {
      d3.select(this)
        .transition()
        .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.highlightDuration))
        .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
        .style("opacity", 1.0);
    }
  });

  if (d.connectedTechnologyIds?.length > 0) {
    let lineIndex = 0;

    rink.selectAll(".blip").each(function(b) {
      const blipTechId = b.technologyId || parseInt(b.id, 10);

      if (d.connectedTechnologyIds.includes(blipTechId)) {
        d3.select(this)
          .transition()
          .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.highlightDuration))
          .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
          .style("opacity", 1.0);

        const connectedBlip = d3.select(this);
        let connectedX = b.x || 0;
        let connectedY = b.y || 0;

        const transform = connectedBlip.attr("transform");
        if (transform) {
          const match = transform.match(/translate\(([^,]+),([^)]+)\)/);
          if (match) {
            connectedX = parseFloat(match[1]);
            connectedY = parseFloat(match[2]);
          }
        }

        // Calculate line length for subtle drawing animation
        const lineLength = Math.sqrt(
          Math.pow(connectedX - hoveredX, 2) +
          Math.pow(connectedY - hoveredY, 2)
        );

        // Minimal variation for subtle effect
        const speedVariation = 0.9 + (Math.random() * 0.2); // 0.9x to 1.1x speed
        const drawDuration = AnimationUtils.getAnimationDuration(
          RADAR_ANIMATION_CONFIG.interactive.connectionDuration * 0.7 * speedVariation // Faster, less noticeable
        );

        // Reduced stagger for more subtle cascading
        const staggerDelay = lineIndex * 15; // 15ms between each line (reduced from 30ms)

        const dx = connectedX - hoveredX;
        const dy = connectedY - hoveredY;
        const distance = Math.sqrt(dx * dx + dy * dy) || 1;
        const normalizedX = dx / distance;
        const normalizedY = dy / distance;

        const startX = hoveredX + normalizedX * techradius;
        const startY = hoveredY + normalizedY * techradius;
        const endX = connectedX - normalizedX * techradius;
        const endY = connectedY - normalizedY * techradius;

        const connectionLine = rink
          .append("line")
          .attr("class", "connection-line")
          .attr("x1", startX)
          .attr("y1", startY)
          .attr("x2", startX)
          .attr("y2", startY)
          .style("stroke", "#3a3a3aff") // Start with subtle color immediately
          .style("stroke-width", 3) // Thicker for better visibility
          .style("stroke-dasharray", "10,5") // dash pattern
          .style("opacity", 0.5); // Lower starting opacity

        // Subtle line drawing animation
        connectionLine
          .transition()
          .delay(staggerDelay)
          .duration(drawDuration)
          .ease(d3.easeQuadOut) // Gentler easing
          .style("opacity", 1) // Slightly increase opacity when drawn
          .attr("x2", endX)
          .attr("y2", endY);

        lineIndex++;
      }
    });
  }
}

/**
 * Remove connection lines and restore opacity with smooth exit animation
 */
function removeLinesAndHighlight(rink) {
  rink.selectAll(".blip")
    .interrupt()
    .transition()
    .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.highlightDuration))
    .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
    .style("opacity", 1.0);

  // Enhanced line removal with reverse drawing animation
  rink.selectAll(".connection-line").each(function() {
    const line = d3.select(this);

    // Stop any ongoing animations
    line.interrupt();

    // Calculate current line length for reverse animation
    const x1 = parseFloat(line.attr("x1")) || 0;
    const y1 = parseFloat(line.attr("y1")) || 0;
    const x2 = parseFloat(line.attr("x2")) || 0;
    const y2 = parseFloat(line.attr("y2")) || 0;

    const lineLength = Math.sqrt(
      Math.pow(x2 - x1, 2) +
      Math.pow(y2 - y1, 2)
    );

    // Subtle fade out without reverse drawing animation
    line
      .transition()
      .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.connectionDuration * 0.5)) // Quick, subtle exit
      .ease(d3.easeQuadOut) // Gentle exit
      .style("opacity", 0) // Simple fade out
      .on("end", function() {
        d3.select(this).remove();
      });
  });
}

/**
 * Cleanup for memory management
 */
function cleanup(simulation) {
  if (simulation) {
    simulation.stop();
    simulation.nodes([]);
  }

  d3.selectAll(".blip").remove();
  d3.selectAll(".connection-line").remove();
  d3.selectAll("#rink").selectAll("*").remove();
}

/**
 * Remove old drawing elements (enhanced cleanup function)
 */
export function removeOldDrawing() {
  // Using D3.js to remove old elements
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
  }
}
