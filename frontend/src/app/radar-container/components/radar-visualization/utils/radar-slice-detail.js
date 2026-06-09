/**
 * Radar Slice Detail View System
 * CURRENTLY EXPERIMENTAL - USE WITH CAUTION LOL - NOT IN USE YET
 */

import * as d3 from "d3";
import { translate, generateDynamicQuadrants} from './radar-visualization-utils.js';
import { RADAR_ANIMATION_CONFIG, AnimationUtils } from './radar-animations.js';

export class SliceDetailManager {
  constructor(svg, radar, config) {
    this.svg = svg;
    this.radar = radar;
    this.config = config;
    this.isDetailMode = false;
    this.currentSlice = null;
    this.originalViewBox = null;
    this.originalTransform = null;
    this.animationDuration = AnimationUtils.getAnimationDuration(RADAR_ANIMATION_CONFIG.interactive.sliceDetailDuration);
    
    this.allElements = {
      blips: [],
      ringSegments: [],
      sectorLabels: [],
      lifecycleLabels: [],
      gridLines: []
    };
  }

  enterSliceDetail(sliceIndex, sliceData) {
    if (this.isDetailMode) {
      this.exitSliceDetail().then(() => {
        this.enterSliceDetail(sliceIndex, sliceData);
      });
      return;
    }

    this.isDetailMode = true;
    this.currentSlice = sliceIndex;
    
    this.storeOriginalState();
    this.filterElementsForSlice(sliceIndex);
    this.calculateSliceViewport(sliceIndex);
    this.showSliceUI(sliceData);
    this.dispatchSliceEvent('slice-detail-enter', { sliceIndex, sliceData });
  }

  async exitSliceDetail() {
    if (!this.isDetailMode) {
      return;
    }
    
    this.isDetailMode = false;
    const previousSlice = this.currentSlice;
    this.currentSlice = null;
    
    this.hideSliceUI();
    this.showAllElements();
    await this.restoreOriginalViewport();
    this.dispatchSliceEvent('slice-detail-exit', { previousSlice });
  }

  storeOriginalState() {
    this.originalViewBox = this.svg.attr('viewBox') || `0 0 ${this.config.width} ${this.config.height}`;
    this.originalTransform = this.radar.attr('transform');
  }

  filterElementsForSlice(sliceIndex) {
    const sectorCount = this.config.quadrants?.length || 4;
    
    // Hide blips from other slices
    d3.selectAll('.blip')
      .style('opacity', (d) => {
        const belongsToSlice = d.quadrant === sliceIndex;
        return belongsToSlice ? 1 : 0;
      })
      .style('pointer-events', (d) => {
        const belongsToSlice = d.quadrant === sliceIndex;
        return belongsToSlice ? 'all' : 'none';
      });

    // Hide ring segments from other slices
    d3.selectAll('.ring-segment')
      .style('opacity', function() {
        const sectorAttr = d3.select(this).attr('data-sector');
        const sector = parseInt(sectorAttr);
        return sector === sliceIndex ? 1 : 0;
      })
      .style('pointer-events', function() {
        const sectorAttr = d3.select(this).attr('data-sector');
        const sector = parseInt(sectorAttr);
        return sector === sliceIndex ? 'all' : 'none';
      });

    // Hide sector dividers and labels for other slices
    d3.selectAll('.sector-divider')
      .style('opacity', 0)
      .style('pointer-events', 'none');

    d3.selectAll('.sector-label')
      .style('opacity', function() {
        const labelIndex = parseInt(d3.select(this).attr('data-sector'));
        return labelIndex === sliceIndex ? 1 : 0;
      });

    // Keep lifecycle labels visible
    d3.selectAll('.lifecycle-label')
      .style('opacity', 1)
      .style('pointer-events', 'all');
  }

  showAllElements() {
    d3.selectAll('.blip')
      .style('opacity', 1)
      .style('pointer-events', 'all');

    d3.selectAll('.ring-segment')
      .style('opacity', 1)
      .style('pointer-events', 'all');

    d3.selectAll('.sector-divider')
      .style('opacity', 1)
      .style('pointer-events', 'all');

    d3.selectAll('.sector-label')
      .style('opacity', 1)
      .style('pointer-events', 'all');

    d3.selectAll('.lifecycle-label')
      .style('opacity', 1)
      .style('pointer-events', 'all');
  }

  calculateSliceViewport(sliceIndex) {
    const sectorCount = this.config.quadrants?.length || 4;
    const quadrants = sectorCount !== 4 ? generateDynamicQuadrants(sectorCount) : null;
    
    if (sectorCount === 4 && !quadrants) {
      this.applyLegacySliceViewport(sliceIndex);
    } else {
      this.applyDynamicSliceViewport(sliceIndex, sectorCount);
    }
  }

  applyLegacySliceViewport(sliceIndex) {
    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;
    const maxRadius = Math.max(...this.config.rings.map(r => r.radius)) || 400;
    
    // Use consistent angle calculation with generateDynamicQuadrants
    const LEGACY_QUADRANTS = [
      { radial_min: 0, radial_max: 0.5 },
      { radial_min: 0.5, radial_max: 1 },
      { radial_min: -1, radial_max: -0.5 },
      { radial_min: -0.5, radial_max: 0 }
    ];
    
    const quadrant = LEGACY_QUADRANTS[sliceIndex] || LEGACY_QUADRANTS[0];
    const sliceAngle = ((quadrant.radial_min + quadrant.radial_max) / 2) * Math.PI;
    
    const focusDistance = maxRadius * 0.4;
    const focusX = focusDistance * Math.cos(sliceAngle);
    const focusY = focusDistance * Math.sin(sliceAngle);
    
    const zoomFactor = 2.2;
    const viewSize = Math.max(this.config.width, this.config.height) / zoomFactor;
    
    const viewBox = [
      centerX + focusX - viewSize / 2,
      centerY + focusY - viewSize / 2,
      viewSize,
      viewSize
    ];
    
    this.svg.transition()
      .duration(this.animationDuration)
      .attr('viewBox', viewBox.join(' '));
  }

  applyDynamicSliceViewport(sliceIndex, sectorCount) {
    const centerX = this.config.width / 2;
    const centerY = this.config.height / 2;
    const maxRadius = Math.max(...this.config.rings.map(r => r.radius)) || 400;
    
    // Use consistent angle calculation with generateDynamicQuadrants
    const angleStep = (2 * Math.PI) / sectorCount;
    const sliceAngle = sliceIndex * angleStep - Math.PI / 2;
    
    // Calculate focus point using average ring radius for better positioning
    const avgRingRadius = this.config.rings.reduce((sum, ring) => sum + ring.radius, 0) / this.config.rings.length;
    const focusDistance = avgRingRadius * 0.5;
    const focusX = focusDistance * Math.cos(sliceAngle);
    const focusY = focusDistance * Math.sin(sliceAngle);
    
    // Adjust zoom factor based on sector count
    const baseFactor = 2.0;
    const densityFactor = Math.min(0.5, sectorCount / 10);
    const zoomFactor = baseFactor + densityFactor;
    const viewSize = Math.max(this.config.width, this.config.height) / zoomFactor;
    
    const viewBox = [
      centerX + focusX - viewSize / 2,
      centerY + focusY - viewSize / 2,
      viewSize,
      viewSize
    ];

    this.svg.transition()
      .duration(this.animationDuration)
      .attr('viewBox', viewBox.join(' '));
  }

  showSliceUI(sliceData) {
    // Add slice header/title
    const sliceHeader = this.radar.select('.slice-header');
    if (sliceHeader.empty()) {
      this.radar.append('g')
        .attr('class', 'slice-header')
        .append('text')
        .attr('class', 'slice-title')
        .style('font-size', '24px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .style('text-anchor', 'middle');
    }

    this.radar.select('.slice-title')
      .text(sliceData?.name || `Slice ${this.currentSlice + 1}`)
      .attr('transform', translate(0, -50));

    // Add back button
    const backButton = this.radar.select('.slice-back-button');
    if (backButton.empty()) {
      const button = this.radar.append('g')
        .attr('class', 'slice-back-button')
        .attr('transform', translate(-200, -200))
        .style('cursor', 'pointer')
        .on('click', () => this.exitSliceDetail());

      button.append('circle')
        .attr('r', 20)
        .style('fill', '#007ACC')
        .style('stroke', '#fff')
        .style('stroke-width', 2);

      button.append('text')
        .text('←')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('fill', 'white')
        .style('font-size', '16px')
        .style('font-weight', 'bold');
    }
  }

  hideSliceUI() {
    this.radar.select('.slice-header').remove();
    this.radar.select('.slice-back-button').remove();
  }

  async restoreOriginalViewport() {
    return new Promise((resolve) => {
      const defaultViewBox = `0 0 ${this.config.width} ${this.config.height}`;
      const targetViewBox = this.originalViewBox || defaultViewBox;
      
      this.svg.transition()
        .duration(this.animationDuration)
        .attr('viewBox', targetViewBox)
        .on('end', resolve);
    });
  }

  dispatchSliceEvent(eventType, detail) {
    const event = new CustomEvent(eventType, { detail });
    this.svg.node()?.dispatchEvent(event);
  }

  isInDetailMode() {
    return this.isDetailMode;
  }

  getCurrentSlice() {
    return this.currentSlice;
  }

  toggleSliceDetail(sliceIndex, sliceData) {
    if (this.isDetailMode && this.currentSlice === sliceIndex) {
      this.exitSliceDetail();
    } else {
      this.enterSliceDetail(sliceIndex, sliceData);
    }
  }

  destroy() {
    if (this.isDetailMode) {
      this.exitSliceDetail();
    }
    
    this.svg = null;
    this.radar = null;
    this.config = null;
    this.allElements = null;
  }
}

export function handleSectorClick(radar, sectorIndex, config, navigationFunctions, sliceManager) {
  const sectorData = config.quadrants[sectorIndex];
  
  if (sliceManager && !sliceManager.isInDetailMode()) {
    sliceManager.enterSliceDetail(sectorIndex, sectorData);
  } else if (navigationFunctions.onCategoryClick) {
    navigationFunctions.onCategoryClick(sectorData?.categoryId || sectorData?.id);
  }
}

export function handleRingClick(ringIndex, config, sliceManager) {
  if (sliceManager?.isInDetailMode()) {
    const currentSlice = sliceManager.getCurrentSlice();
    const ringData = config.rings[ringIndex];
  }
}

export default SliceDetailManager;
