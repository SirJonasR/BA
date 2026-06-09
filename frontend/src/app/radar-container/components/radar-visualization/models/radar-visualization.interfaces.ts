/**
 * Radar Visualization Interfaces - Refactored for Type Safety & Clean Architecture
 *
 * Key Improvements:
 * - Removed D3.js type leakage from public contracts
 * - Required core properties with optional enhancements only
 * - Consolidated configuration interfaces to eliminate duplication
 * - Strict event handling contracts replacing permissive index signatures
 * - Separated behavioral metadata from data contracts
 */

// ===== CORE DATA INTERFACES =====

/**
 * Core radar configuration - required properties for radar initialization
 */
export interface RadarConfig {
  /** SVG element ID for mounting the radar */
  svgId: string;
  /** Canvas width in pixels */
  width: number;
  /** Canvas height in pixels */
  height: number;
  /** Color scheme configuration */
  colors: RadarColors;
  /** Quadrant/sector definitions */
  quadrants: QuadrantConfig[];
  /** Ring/lifecycle definitions */
  rings: RingConfig[];
  /** Technology entries to visualize */
  entries: RadarEntry[];

  // Optional enhancements
  /** Display title for the radar */
  title?: string;
  /** Focused quadrant for zoom mode */
  zoomedQuadrant?: number;
}

/**
 * Unified settings interface - consolidates all configuration flags
 */
export interface RadarSettings {
  // Display modes
  /** Show technology icons vs initials */
  showIcons: boolean;
  /** Show technology names vs abbreviations */
  showFullNames: boolean;
  /** If false, icons are converted to black-and-white */
  showIconsInColor: boolean;

  // Sizing settings
  /** Radar circle radius in pixels */
  radarRadius: number;
  /** Technology blip radius in pixels */
  blipRadius: number;
  /** Maximum window height percentage (0.0 to 1.0) */
  maxWindowHeightPct: number;

  // Technical settings
  /** Enable animations and transitions */
  animationsEnabled: boolean;
  /** Enable responsive design behavior */
  responsiveMode: boolean;
  /** Enable accessibility features (ARIA, keyboard nav) */
  accessibilityMode: boolean;
  /** Enable performance optimizations for large datasets */
  performanceMode: boolean;

  // Optional debug and experimental
  /** Enable debug overlays and console output */
  debugMode?: boolean;
  /** Use dynamic sector calculations */
  dynamicSectors?: boolean;
}

/**
 * Quadrant/sector configuration - defines radar sectors
 */
export interface QuadrantConfig {
  /** Display name for the quadrant */
  name: string;
  /** Index position for ordering */
  index: number;

  // Optional positioning (calculated if not provided)
  /** Start angle in radians */
  startAngle?: number;
  /** End angle in radians */
  endAngle?: number;
  /** Center angle for label positioning */
  centerAngle?: number;

  // Optional styling
  /** Color for quadrant highlighting */
  color?: string;
}

/**
 * Ring/lifecycle configuration - defines radar rings
 */
export interface RingConfig {
  /** Display name for the ring */
  name: string;
  /** Radius from center in pixels */
  radius: number;
  /** Index position from center outward */
  index: number;

  // Optional styling and metadata
  /** Ring color for styling */
  color?: string;
  /** Text color for labels */
  textColor?: string;
  /** Detailed description for tooltips */
  description?: string;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Original lifecycle ID for tracking */
  lifecycleId?: number;
}

/**
 * Core radar entry - technology data for visualization
 */
export interface RadarEntry {
  /** Quadrant index (0-based) */
  quadrant: number;
  /** Ring index (0-based) */
  ring: number;
  /** Display label */
  label: string;
  /** Technology ID for navigation */
  id?: string;
  /** URL for detailed information */
  link?: string;
  /** Detailed description */
  description?: string;
  /** Short description (kurzbeschreibung) for tooltips */
  shortDescription?: string;
  /** Current status */
  status?: EntryStatus;
  /** Business priority level */
  priority?: EntryPriority;
  /** Technology tags for filtering */
  tags?: string[];
  /** Active state for interaction */
  active?: boolean;
  /** Accessibility label for screen readers */
  accessibilityLabel?: string;
  /** Color for blip visualization */
  color?: string;
  /** Technology name for blip rendering */
  technologyName?: string;
  /** Technology picture ID for custom icons */
  technologyPictureId?: number;
  /** Internal technology ID for lookups */
  technologyId?: number;
  /** Test ID for automation */
  testId?: string;
  /** Connected technology IDs for relationship visualization */
  connectedTechnologyIds?: number[];
}

/**
 * Behavioral metadata for radar entry - separated from core data
 */
export interface RadarEntryMetadata {
  /** Movement direction indicator (-1: out, 0: unchanged, 1: in) */
  moved?: number;
  /** Last update timestamp */
  lastUpdated?: Date | string;
  /** Calculated position coordinates */
  x?: number;
  y?: number;
  /** Unique sequence ID for rendering */
  sequenceId?: number;
}

export interface RadarColors {
  background: string;
  grid: string;
  inactive: string;
}

// ===== ENUMS =====

export enum EntryStatus {
  NEW = 'new',
  CHANGED = 'changed',
  UNCHANGED = 'unchanged',
  DEPRECATED = 'deprecated',
}

export enum EntryPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ===== COMPONENT INTERFACES =====

export interface TooltipSystem {
  showBubble: (x: number, y: number, content: string) => void;
  hideBubble: () => void;
  showLifecycleDescription: (ring: RingConfig) => void;
  setTooltip: (entry: RadarEntry, x: number, y: number) => void;
  cleanup: () => void;
}

export interface LegendSystem {
  hoverLifecycle: (ring: RingConfig) => void;
  leaveLifecycle: () => void;
  updateLegend: (rings: RingConfig[]) => void;
  cleanup: () => void;
}

/**
 * Blip system interface - abstracted from D3.js implementation
 */
export interface BlipSystem {
  removeLinesAndHighlight: () => void;
  highlightLegendItem: (ring: number) => void;
  createBlipElements: (entries: RadarEntry[]) => void;
  cleanup: () => void;
}

// ===== EVENT SYSTEM =====

/**
 * Type-safe navigation events - replaces loose function signatures
 */
export interface RadarNavigationEvents {
  onQuadrantClick?: (quadrantIndex: number) => void;
  onEntryClick?: (entry: RadarEntry) => void;
  onRingClick?: (ringIndex: number) => void;
  onCategoryClick?: (categoryId: number | string) => void;
  onTechnologyClick?: (technologyId: number) => void;
  onLifecycleClick?: (lifecycleId: number) => void;
  onMaintenanceClick?: () => void;
}

/**
 * Type-safe data fetching events - replaces loose async signatures
 */
export interface RadarDataEvents {
  fetchEntryDetails?: (entry: RadarEntry) => Promise<unknown>;
  fetchQuadrantData?: (quadrantIndex: number) => Promise<unknown>;
  fetchSimilarities?: (entryId: string) => Promise<unknown>;
  transformLogo?: (pictureId: number) => unknown;
}

// ===== SLICE DETAIL API =====

export interface SliceDetailAPI {
  enter: (sliceIndex: number, sliceData?: unknown) => void;
  exit: () => Promise<void>;
  toggle: (sliceIndex: number, sliceData?: unknown) => void;
  isActive: () => boolean;
  getCurrentSlice: () => number | null;
}

// ===== RENDERER INTERFACES (Split from monolithic interface) =====

/**
 * Core rendering interface - handles DOM manipulation
 */
export interface RadarRenderer {
  /** Root SVG container element */
  container: HTMLElement;
  /** Initialize the radar visualization */
  initialize: () => void;
  /** Update visualization with new data */
  update: (entries: RadarEntry[]) => void;
  /** Cleanup all DOM elements and event listeners */
  cleanup: () => void;
}

/**
 * Radar state management - handles data and configuration
 */
export interface RadarState {
  /** Current radar configuration */
  config: RadarConfig;
  /** Current settings */
  settings: RadarSettings;
  /** Processed radar entries */
  entries: RadarEntry[];
  /** Additional computed properties */
  computed: {
    sectorCount: number;
    ringCount: number;
  };
}

/**
 * Radar lifecycle management - handles initialization and cleanup
 */
export interface RadarLifecycle {
  /** Whether radar is initialized */
  isInitialized: boolean;
  /** Whether radar has errors */
  hasErrors: boolean;
  /** Error messages if any */
  errors: string[];
  /** Initialize the radar */
  initialize: () => Promise<void>;
  /** Destroy the radar instance */
  destroy: () => Promise<void>;
}

export interface RadarVisualizationInstance {
  renderer: RadarRenderer;
  state: RadarState;
  lifecycle: RadarLifecycle;
  tooltipSystem: TooltipSystem;
  legendSystem: LegendSystem;
  blipSystem: BlipSystem;
  sliceDetail?: SliceDetailAPI;
  cleanup: () => void;
}

// ===== UTILITY TYPES =====

export type RadarVisualizationFunction = (
  rings: RingConfig[],
  techradius: number,
  config: RadarConfig,
  navigationEvents: RadarNavigationEvents,
  dataEvents: RadarDataEvents,
  settings: RadarSettings,
) => RadarVisualizationInstance;

export type CleanupFunction = () => void;
