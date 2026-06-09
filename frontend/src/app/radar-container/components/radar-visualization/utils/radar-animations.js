/**
 * Radar Startup Animation System
 * Provides clean, smooth, visually appealing animations for radar startup
 * Ensures final positions exactly match the non-animated state
 */

import * as d3 from "d3";

/**
 * Animation configuration constants - Optimized for fluid user experience
 */
export const RADAR_ANIMATION_CONFIG = {
  // Main phases timing (overlapped for smoother flow)
  startup: {
    // Phase 1: Initial radar fade-in (quick start)
    radarFadeDelay: 0,
    radarFadeDuration: 400,
    
    // Phase 2: Grid rings draw in sequence (starts while radar fading)
    gridDelay: 200,
    gridDuration: 600,
    ringStagger: 80,
    
    // Phase 3: Sector labels appear (overlaps with grid)
    labelDelay: 500,
    labelDuration: 350,
    
    // Phase 4: Lifecycle labels (quick after sector labels)
    lifecycleDelay: 700,
    lifecycleDuration: 300,
    
    // Phase 5: Blips animate in last with dramatic entrance
    blipDelay: 1100,
    blipDuration: 700,
    blipStagger: 35,
    blipRingStagger: 80,
    
    // Total animation duration (reduced for snappier feel)
    totalDuration: 1900
  },
  
  // Interactive animation timings (hover, connections, etc.)
  interactive: {
    hoverDuration: 150, // Faster for more responsive feel
    connectionDuration: 250, // Slightly faster
    highlightDuration: 200, // Snappier highlighting
    tooltipDuration: 200, // Faster tooltip appearance
    sliceDetailDuration: 600 // Slightly faster slice transitions
  },
  
  // Easing functions for smooth, organic transitions
  easing: {
    radar: d3.easeQuadOut,
    grid: d3.easeCubicOut,
    labels: d3.easeBackOut.overshoot(1.2),
    lifecycle: d3.easeQuadOut,
    blips: d3.easeElasticOut.amplitude(1).period(0.3),
    interactive: d3.easeQuadOut
  }
};

/**
 * Main startup animation coordinator
 */
export class RadarStartupAnimator {
  constructor(svg, radar, config) {
    this.svg = svg;
    this.radar = radar;
    this.config = config;
    this.animationPromises = [];
    this.isAnimating = false;
  }

  /**
   * Execute complete startup animation sequence - optimized for fluid UX
   */
  async animateStartup() {
    if (this.isAnimating) {
      return;
    }
    
    this.isAnimating = true;
    
    try {
      // Elements are already hidden upon creation, no need to prepare them
      
      // Phase 1: Radar container fade-in (quick start)
      const radarPromise = this.animateRadarFadeIn();
      
      // Phase 2: Grid rings animation (starts while radar fading for smoother flow)
      await Promise.all([radarPromise]);
      const gridPromise = this.animateGridRings();
      
      // Phase 3: Sector labels (overlaps with grid for fluid motion)
      const labelPromise = this.animateSectorLabels();
      
      // Phase 4: Lifecycle labels (quick succession)
      const lifecyclePromise = this.animateLifecycleLabels();
      
      // Wait for core structure to complete
      await Promise.all([gridPromise, labelPromise, lifecyclePromise]);
      
      // Phase 5: Blips entrance as grand finale
      await this.triggerAndAwaitBlipAnimations();
      
      // Animation complete
      this.isAnimating = false;
      
    } catch (error) {
      console.warn('Radar startup animation interrupted:', error);
      this.isAnimating = false;
    }
  }

  /**
   * Trigger blip animations and wait for completion (final phase)
   */
  async triggerAndAwaitBlipAnimations() {
    return new Promise((resolve) => {
      // Dispatch custom event that blip system can listen for
      const blipAnimationEvent = new CustomEvent('startBlipAnimations', {
        detail: { 
          delay: RADAR_ANIMATION_CONFIG.startup.blipDelay,
          callback: resolve
        }
      });
      document.dispatchEvent(blipAnimationEvent);
      
      // Fallback timeout for safety
      setTimeout(resolve, RADAR_ANIMATION_CONFIG.startup.blipDuration + 500);
    });
  }

  /**
   * Phase 1: Smooth radar container fade-in
   */
  animateRadarFadeIn() {
    return new Promise((resolve) => {
      // Start radar completely transparent
      this.radar
        .style("opacity", 0)
        .transition()
        .delay(RADAR_ANIMATION_CONFIG.startup.radarFadeDelay)
        .duration(RADAR_ANIMATION_CONFIG.startup.radarFadeDuration)
        .ease(RADAR_ANIMATION_CONFIG.easing.radar)
        .style("opacity", 1)
        .on("end", resolve);
    });
  }

  /**
   * Phase 2: Animated grid ring appearance with drawing effect
   */
  animateGridRings() {
    return new Promise((resolve) => {
      const gridElements = this.radar.selectAll(".radar-grid .ring-segment, .radar-grid .circle, .radar-grid .sector-divider");
      
      if (gridElements.empty()) {
        resolve();
        return;
      }

      let completedAnimations = 0;
      const totalAnimations = gridElements.size();
      
      // Setup stroke-dasharray for drawing effect (elements are already hidden)
      gridElements.each(function() {
        const element = d3.select(this);
        const domElement = this;
        let length = 100; // Default fallback
        
        try {
          // Only apply path-specific animations to path elements
          if (domElement.tagName === 'path' && typeof domElement.getTotalLength === 'function') {
            length = domElement.getTotalLength();
            element
              .style("stroke-dasharray", `${length} ${length}`)
              .style("stroke-dashoffset", length);
          } else if (domElement.tagName === 'line') {
            // For lines, calculate length manually
            const x1 = parseFloat(element.attr("x1")) || 0;
            const y1 = parseFloat(element.attr("y1")) || 0;
            const x2 = parseFloat(element.attr("x2")) || 0;
            const y2 = parseFloat(element.attr("y2")) || 0;
            length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
            element
              .style("stroke-dasharray", `${length} ${length}`)
              .style("stroke-dashoffset", length);
          }
        } catch (error) {
          // Fallback for any elements that don't support path operations
          console.warn('Grid element animation fallback used:', error);
        }
      });

      // Animate each ring segment with staggered timing
      gridElements.each(function(d, i) {
        const element = d3.select(this);
        const ringIndex = parseInt(element.attr("class")?.match(/ring-(\d+)/)?.[1] || i);
        const staggerDelay = ringIndex * RADAR_ANIMATION_CONFIG.startup.ringStagger;
        
        element
          .transition()
          .delay(RADAR_ANIMATION_CONFIG.startup.gridDelay + staggerDelay)
          .duration(RADAR_ANIMATION_CONFIG.startup.gridDuration)
          .ease(RADAR_ANIMATION_CONFIG.easing.grid)
          .style("opacity", 1)
          .style("stroke-dashoffset", 0)
          .on("end", () => {
            // Clean up animation properties
            element
              .style("stroke-dasharray", null)
              .style("stroke-dashoffset", null);
              
            completedAnimations++;
            if (completedAnimations >= totalAnimations) {
              resolve();
            }
          });
      });
    });
  }

  /**
   * Phase 3: Sector label animation with smooth scale-up
   */
  animateSectorLabels() {
    return new Promise((resolve) => {
      const sectorLabels = this.radar.selectAll(".sector-label-group");
      
      if (sectorLabels.empty()) {
        resolve();
        return;
      }

      let completedAnimations = 0;
      const totalAnimations = sectorLabels.size();

      // Animate each sector label (already scaled down and transparent)
      sectorLabels.each(function(d, i) {
        const element = d3.select(this);
        const originalTransform = element.attr("transform").replace(" scale(0.3)", "");
        const staggerDelay = i * 100;
        
        element
          .transition()
          .delay(RADAR_ANIMATION_CONFIG.startup.labelDelay + staggerDelay)
          .duration(RADAR_ANIMATION_CONFIG.startup.labelDuration)
          .ease(RADAR_ANIMATION_CONFIG.easing.labels)
          .style("opacity", 1)
          .attr("transform", originalTransform)
          .on("end", () => {
            completedAnimations++;
            if (completedAnimations >= totalAnimations) {
              resolve();
            }
          });
      });
    });
  }

  /**
   * Phase 4: Lifecycle label animation (tighter timing)
   */
  animateLifecycleLabels() {
    return new Promise((resolve) => {
      const lifecycleLabels = this.radar.selectAll(".radar-grid text");
      
      if (lifecycleLabels.empty()) {
        resolve();
        return;
      }

      let completedAnimations = 0;
      const totalAnimations = lifecycleLabels.size();

      // Animate lifecycle labels (already transparent and offset)
      lifecycleLabels.each(function(d, i) {
        const element = d3.select(this);
        const staggerDelay = i * 60; // Reduced stagger for tighter flow
        
        element
          .transition()
          .delay(RADAR_ANIMATION_CONFIG.startup.lifecycleDelay + staggerDelay)
          .duration(RADAR_ANIMATION_CONFIG.startup.lifecycleDuration)
          .ease(RADAR_ANIMATION_CONFIG.easing.lifecycle)
          .style("opacity", 1)
          .attr("transform", "translate(0, 0)")
          .on("end", () => {
            completedAnimations++;
            if (completedAnimations >= totalAnimations) {
              resolve();
            }
          });
      });
    });
  }

  /**
   * Cancel all ongoing animations
   */
  cancelAnimations() {
    this.isAnimating = false;
    
    // Stop all transitions on radar elements
    this.radar.selectAll("*").interrupt();
    
    // Restore final state immediately for all elements
    this.radar.style("opacity", 1);
    
    this.radar.selectAll(".radar-grid *")
      .style("opacity", 1)
      .style("stroke-dasharray", null)
      .style("stroke-dashoffset", null);
      
    this.radar.selectAll(".sector-label-group")
      .style("opacity", 1)
      .attr("transform", function() {
        return d3.select(this).attr("transform").replace(" scale(0.3)", "");
      });
      
    this.radar.selectAll(".radar-grid text")
      .style("opacity", 1)
      .attr("transform", "translate(0, 0)");
      
    this.radar.selectAll("#rink .blip")
      .style("opacity", 1)
      .attr("transform", function() {
        return d3.select(this).attr("transform").replace(" scale(0.1) rotate(180)", "");
      });
  }
}

/**
 * Enhanced blip animation system
 */
export class BlipAnimationManager {
  constructor(rink, config) {
    this.rink = rink;
    this.config = config;
  }

  /**
   * Animate blips entrance as grand finale with sophisticated staggered effects
   */
  animateBlipsEntrance(blips, callback = null) {
    return new Promise((resolve) => {
      if (blips.empty()) {
        if (callback) callback();
        resolve();
        return;
      }

      let completedAnimations = 0;
      const totalBlips = blips.size();

      // Blips should already be in hidden state from creation
      // Animate each blip with ring-based staggering for dramatic effect
      blips.each(function(d, i) {
        const blip = d3.select(this);
        const originalTransform = blip.attr("transform").replace(" scale(0.1) rotate(180)", "");
        
        // Calculate sophisticated stagger: rings animate in sequence, blips within ring have slight offset
        const ringIndex = d.ring || 0;
        const baseDelay = 0; // No additional base delay since main system coordinates timing
        const ringDelay = ringIndex * RADAR_ANIMATION_CONFIG.startup.blipRingStagger; // Rings in sequence
        const blipOffset = (i % 8) * RADAR_ANIMATION_CONFIG.startup.blipStagger; // Blips within ring
        const totalDelay = baseDelay + ringDelay + blipOffset;
        
        blip
          .transition()
          .delay(totalDelay)
          .duration(RADAR_ANIMATION_CONFIG.startup.blipDuration)
          .ease(RADAR_ANIMATION_CONFIG.easing.blips)
          .style("opacity", 1)
          .attr("transform", originalTransform)
          .on("end", () => {
            completedAnimations++;
            if (completedAnimations >= totalBlips) {
              if (callback) callback();
              resolve();
            }
          });
      });
    });
  }

  /**
   * Quick entrance animation for when skipping startup
   */
  quickEntrance(blips, callback = null) {
    blips
      .style("opacity", 0)
      .transition()
      .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.startup.blipDuration * 0.4))
      .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
      .style("opacity", 1)
      .on("end", () => {
        if (callback) callback();
      });
  }

  /**
   * Filter change animation - quick, subtle animation for blips only
   */
  filterChangeAnimation(blips, callback = null) {
    blips
      .style("opacity", 0)
      .transition()
      .duration(AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.highlightDuration))
      .ease(RADAR_ANIMATION_CONFIG.easing.interactive)
      .style("opacity", 1)
      .on("end", () => {
        if (callback) callback();
      });
  }
}

/**
 * Animation utilities and performance helpers
 */
export const AnimationUtils = {
  /**
   * Check if reduced motion is preferred
   */
  shouldReduceMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  /**
   * Get appropriate animation duration based on user preferences
   */
  getAnimationDuration(baseDuration) {
    return this.shouldReduceMotion() ? Math.min(baseDuration * 0.3, 200) : baseDuration;
  },

  /**
   * Create a promise that resolves after a delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Cleanup animation artifacts
   */
  cleanupAnimationProperties(selection) {
    selection
      .style("stroke-dasharray", null)
      .style("stroke-dashoffset", null)
      .attr("transform", function() {
        const transform = d3.select(this).attr("transform") || "";
        return transform.replace(/ scale\([^)]+\)/g, "").replace(/ rotate\([^)]+\)/g, "");
      });
  }
};

/**
 * Performance monitoring for animations
 */
export const AnimationPerformance = {
  animationStart: 0,
  
  start() {
    this.animationStart = performance.now();
  },
  
  end(label = 'Animation') {
    const duration = performance.now() - this.animationStart;
    if (duration > 100) { // Only log if significant
      console.log(`${label} completed in ${duration.toFixed(2)}ms`);
    }
  }
};
