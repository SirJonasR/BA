/**
 * Radar Mathematics Utilities & Geometry
 */

/**
 * Get CSS custom property value from document root
 * Centralized function for theme-aware color retrieval
 * @param {string} propertyName - CSS variable name (with or without --)
 * @param {string} fallback - Fallback color if property not found
 * @returns {string} Color value
 */
export function getCSSColor(propertyName, fallback = '#000000') {
  const varName = propertyName.startsWith('--') ? propertyName : `--${propertyName}`;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(varName)
    .trim();
  return value || fallback;
}

/**
 * Get all radar theme colors from CSS custom properties
 * @returns {Object} Object with background, grid, inactive, text colors
 */
export function getRadarThemeColors() {
  return {
    background: getCSSColor('--radar-background', 'transparent'),
    grid: getCSSColor('--radar-grid', '#bbbbbb'),
    gridLight: getCSSColor('--radar-grid-light', '#dddddd'),
    inactive: getCSSColor('--radar-inactive', '#dddddd'),
    text: getCSSColor('--radar-text', '#2c3e50'),
    textSecondary: getCSSColor('--radar-text-secondary', '#666666'),
    // App-level colors for UI elements
    textPrimary: getCSSColor('--app-text-primary', '#2c3e50'),
    surface: getCSSColor('--app-surface', '#ffffff'),
    borderColor: getCSSColor('--app-border-color', '#cccccc'),
    // Brand colors (theme-aware)
    brandPrimary: getCSSColor('--brand-primary', '#e96e3a'),
    brandAccent: getCSSColor('--brand-accent', '#015365'),
  };
}

/**
 * Generate dynamic quadrants based on sector count
 */
export function generateDynamicQuadrants(sectorCount = 4) {
  const quadrants = [];
  const angleStep = 2 / sectorCount;
  
  for (let i = 0; i < sectorCount; i++) {
    // Start from top (-π/2) and go clockwise
    const radial_min = (i * angleStep) - 1 - 0.5;
    const radial_max = ((i + 1) * angleStep) - 1 - 0.5;
    
    const centerAngle = (radial_min + radial_max) * Math.PI / 2;
    const factor_x = Math.cos(centerAngle);
    const factor_y = Math.sin(centerAngle);
    
    quadrants.push({
      radial_min,
      radial_max,
      factor_x: factor_x > 0 ? 1 : -1,
      factor_y: factor_y > 0 ? 1 : -1,
      angle: centerAngle,
      index: i
    });
  }
  
  return quadrants;
}

// Legacy 4-quadrant system
export const QUADRANTS = [
  { radial_min: 0, radial_max: 0.5, factor_x: 1, factor_y: 1 },
  { radial_min: 0.5, radial_max: 1, factor_x: -1, factor_y: 1 },
  { radial_min: -1, radial_max: -0.5, factor_x: -1, factor_y: -1 },
  { radial_min: -0.5, radial_max: 0, factor_x: 1, factor_y: -1 },
];

/**
 * Generate dynamic legend offsets based on sector count
 */
export function generateDynamicLegendOffsets(sectorCount = 4, radius = 400) {
  const offsets = [];
  const angleStep = (2 * Math.PI) / sectorCount;
  
  // Increase radius for more sectors to prevent crowding
  const dynamicRadius = radius + (sectorCount > 4 ? (sectorCount - 4) * 25 : 0);
  
  for (let i = 0; i < sectorCount; i++) {
    const angle = i * angleStep - Math.PI / 2;
    const x = (dynamicRadius + 100) * Math.cos(angle);
    const y = (dynamicRadius + 100) * Math.sin(angle);
    
    offsets.push({ x, y, angle });
  }
  
  return offsets;
}

// Legacy legend offsets
export const LEGEND_OFFSET = [
  { x: 400, y: 500 },
  { x: -475, y: 500 },
  { x: -475, y: -350 },
  { x: 400, y: -350 },
];

export function polar(cartesian) {
  let x = cartesian.x;
  let y = cartesian.y;
  return {
    t: Math.atan2(y, x),
    r: Math.sqrt(x * x + y * y),
  };
}

export function cartesian(polar, quadrant = null) {
  const baseCoords = {
    x: polar.r * Math.cos(polar.t),
    y: polar.r * Math.sin(polar.t),
  };
  
  if (quadrant !== null && typeof quadrant === 'object' && quadrant.factor_x !== undefined) {
    return {
      x: Math.abs(baseCoords.x) * quadrant.factor_x,
      y: Math.abs(baseCoords.y) * quadrant.factor_y
    };
  }
  
  return baseCoords;
}

export function bounded_interval(value, min, max) {
  let low = Math.min(min, max);
  let high = Math.max(min, max);
  return Math.min(Math.max(value, low), high);
}

export function bounded_ring(polar, r_min, r_max) {
  return {
    t: polar.t,
    r: bounded_interval(polar.r, r_min, r_max),
  };
}

export function bounded_box(point, min, max) {
  return {
    x: bounded_interval(point.x, min.x, max.x),
    y: bounded_interval(point.y, min.y, max.y),
  };
}

export function translate(x, y) {
  return "translate(" + x + "," + y + ")";
}

/**
 * Calculate viewbox for radar zoom functionality
 */
export function viewbox(quadrant, quadrants = null) {
  const activeQuadrants = quadrants || QUADRANTS;
  const safeQuadrant = Math.max(0, Math.min(quadrant, activeQuadrants.length - 1));
  const currentQuadrant = activeQuadrants[safeQuadrant];
  
  return [
    Math.max(0, currentQuadrant.factor_x * 400) - 420,
    Math.max(0, currentQuadrant.factor_y * 400) - 420,
    440,
    440,
  ].join(" ");
}

/**
 * Get sector label position with optimal readability
 */
export function getSectorLabelPosition(sectorIndex, sectorCount, radius = 450) {
  const angle = (2 * Math.PI * sectorIndex) / sectorCount - Math.PI / 2;
  const x = radius * Math.cos(angle);
  const y = radius * Math.sin(angle);
  
  let rotation = (angle * 180) / Math.PI;
  
  // Prevent upside-down text
  if (rotation > 90 && rotation < 270) {
    rotation += 180;
  }
  
  // Determine text anchor based on position
  let textAnchor = 'middle';
  if (angle > Math.PI / 4 && angle < (3 * Math.PI) / 4) {
    textAnchor = 'start';
  } else if (angle > (5 * Math.PI) / 4 && angle < (7 * Math.PI) / 4) {
    textAnchor = 'end';
  }
  
  return {
    x,
    y,
    rotation,
    textAnchor,
    angle,
    readable: Math.abs(rotation) <= 90 || Math.abs(rotation - 180) <= 90
  };
}

/**
 * Enhanced collision detection for sector labels
 */
export function adjustLabelCollisions(labelPositions, minDistance = 50) {
  const adjusted = [...labelPositions];
  
  for (let i = 0; i < adjusted.length; i++) {
    for (let j = i + 1; j < adjusted.length; j++) {
      const distance = Math.sqrt(
        Math.pow(adjusted[i].x - adjusted[j].x, 2) + 
        Math.pow(adjusted[i].y - adjusted[j].y, 2)
      );
      
      if (distance < minDistance) {
        // Move labels apart by adjusting radius proportionally
        const adjustmentFactor = (minDistance / distance);
        
        adjusted[i].x *= adjustmentFactor;
        adjusted[i].y *= adjustmentFactor;
        adjusted[j].x *= adjustmentFactor;
        adjusted[j].y *= adjustmentFactor;
      }
    }
  }
  
  return adjusted;
}

/**
 * Seeded random number generator
 */
export class SeededRandom {
  constructor(seed = 42) {
    this.seed = seed;
  }

  random() {
    let x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }

  random_between(min, max) {
    return min + this.random() * (max - min);
  }

  normal_between(min, max) {
    return min + (this.random() + this.random()) * 0.5 * (max - min);
  }
}

/**
 * Create segment for positioning blips within quadrant/ring
 */
export function createSegment(quadrant, ring, rings, quadrants = null) {
  const activeQuadrants = quadrants || QUADRANTS;
  const safeQuadrant = Math.max(0, Math.min(quadrant, activeQuadrants.length - 1));
  const currentQuadrant = activeQuadrants[safeQuadrant];
  
  let polar_min = {
    t: currentQuadrant.radial_min * Math.PI,
    r: ring === 0 ? 30 : rings[ring - 1].radius,
  };
  let polar_max = {
    t: currentQuadrant.radial_max * Math.PI,
    r: rings[ring].radius,
  };
  
  // Conservative margins to prevent grid line overlap
  const margin = 20;
  let cartesian_min = {
    x: margin * currentQuadrant.factor_x,
    y: margin * currentQuadrant.factor_y,
  };
  let cartesian_max = {
    x: rings[rings.length - 1].radius * 0.95 * currentQuadrant.factor_x,
    y: rings[rings.length - 1].radius * 0.95 * currentQuadrant.factor_y,
  };

  const randomGen = new SeededRandom();

  return {
    clipx: function (d) {
      let c = bounded_box(d, cartesian_min, cartesian_max);
      let p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
      d.x = cartesian(p, quadrant).x;
      return d.x;
    },
    clipy: function (d) {
      let c = bounded_box(d, cartesian_min, cartesian_max);
      let p = bounded_ring(polar(c), polar_min.r + 15, polar_max.r - 15);
      d.y = cartesian(p, quadrant).y;
      return d.y;
    },
    random: function () {
      return cartesian({
        t: randomGen.random_between(polar_min.t, polar_max.t),
        r: randomGen.normal_between(polar_min.r, polar_max.r),
      });
    },
    quadrant: currentQuadrant,
    ring_info: {
      inner: polar_min.r,
      outer: polar_max.r,
      index: ring
    }
  };
}

/**
 * Enhanced geometry and positioning helpers
 */
export const RadarGeometry = {
  calculateSectorAngle: (sectorIndex, sectorCount) => (2 * Math.PI * sectorIndex) / sectorCount,
  
  getSectorBoundaries: (sectorIndex, sectorCount) => {
    const angleStep = (2 * Math.PI) / sectorCount;
    return {
      startAngle: sectorIndex * angleStep - Math.PI / 2,
      endAngle: (sectorIndex + 1) * angleStep - Math.PI / 2,
      centerAngle: (sectorIndex + 0.5) * angleStep - Math.PI / 2
    };
  },
  
  detectBlipCollision: (blip1, blip2, minDistance = 12) => {
    const dx = blip1.x - blip2.x;
    const dy = blip1.y - blip2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < minDistance;
  },
  
  truncateText: (text, maxLength = 20) => 
    text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text,
    
  constrainPosition: (x, y, bounds) => ({
    x: Math.max(bounds.minX, Math.min(bounds.maxX, x)),
    y: Math.max(bounds.minY, Math.min(bounds.maxY, y))
  })
};

/**
 * Load external Marked library for markdown processing
 */
let markedLibraryLoaded = false;

export function loadMarkedLibrary() {
  if (markedLibraryLoaded) {
    return;
  }
  
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/marked@2.1.3/marked.min.js";
  script.onload = () => {
    markedLibraryLoaded = true;
  };
  document.head.appendChild(script);
}
